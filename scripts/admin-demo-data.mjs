// Test data for the admin console — 3 test patients + 2 anonymous visitors.
// Every record's ID starts with "test_" (visitors: "v_TEST") and every name
// ends with "(Test)", so staff can always tell them apart from real people.
// Test data is excluded from Analytics.
//
//   node scripts/admin-demo-data.mjs add      → create (or re-create) the test data
//   node scripts/admin-demo-data.mjs remove   → delete all of it
//
// Uses DATABASE_URL from .env, like the app.

import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt as scryptCb } from "crypto";
import { promisify } from "util";

const prisma = new PrismaClient();
const scrypt = promisify(scryptCb);
const N = 1 << 15, R = 8, P = 1;
const hash = async (pw) => { const salt = randomBytes(16); const key = await scrypt(pw.normalize("NFKC"), salt, 64, { N, r: R, p: P, maxmem: 128 * N * R * 2 }); return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`; };
const ago = (d = 0, h = 0, m = 0) => new Date(Date.now() - ((d * 24 + h) * 60 + m) * 60000);
const ahead = (d, hour = 9, min = 30) => { const x = new Date(Date.now() + d * 86400000); x.setUTCHours(hour + 6, min, 0, 0); return x; }; // hour in Calgary (MDT = UTC-6)
const day = (dt) => dt.toLocaleDateString("en-CA", { timeZone: "America/Edmonton" });

async function remove() {
  const pids = { startsWith: "test_" };
  const sids = { startsWith: "test_session" };
  await prisma.albaMessage.deleteMany({ where: { conversationId: { startsWith: "test_" } } });
  await prisma.albaConversation.deleteMany({ where: { OR: [{ id: pids }, { sessionId: sids }] } });
  await prisma.symptomCheckLog.deleteMany({ where: { OR: [{ id: pids }, { sessionId: sids }] } });
  await prisma.longevityAssessment.deleteMany({ where: { OR: [{ id: pids }, { sessionId: sids }] } });
  await prisma.labResultCheck.deleteMany({ where: { OR: [{ id: pids }, { sessionId: sids }] } });
  await prisma.referralSubmission.deleteMany({ where: { OR: [{ id: pids }, { sessionId: sids }] } });
  await prisma.pageVisit.deleteMany({ where: { sessionId: sids } });
  await prisma.outboundClick.deleteMany({ where: { sessionId: sids } });
  await prisma.visitor.deleteMany({ where: { id: { startsWith: "v_TEST" } } });
  await prisma.patient.deleteMany({ where: { id: pids } }); // cascades labs, protocol, appointments, devices, readings…
  // The audit log is append-only in the app; test events are removed here only because they describe test records.
  await prisma.adminAuditEvent.deleteMany({ where: { OR: [{ subjectId: pids }, { subjectId: { startsWith: "v_TEST" } }] } });
  console.log("✓ Test data removed.");
}

async function add() {
  await remove();
  const password = "Test-" + randomBytes(6).toString("base64url");
  const pw = await hash(password);

  // ── Patients ──
  const maya = await prisma.patient.create({ data: {
    id: "test_pt_maya", email: "maya.test@anrahealth.test", firstName: "Maya", lastName: "Chen (Test)", passwordHash: pw, phone: "(403) 555-0142",
    dateOfBirth: new Date("1974-03-11T12:00:00Z"), termsAcceptedAt: ago(60), emailVerifiedAt: ago(60), lastLoginAt: ago(0, 0, 4), createdAt: ago(60),
    settings: { create: { city: "Calgary", province: "AB", lat: 51.0447, lon: -114.0719 } },
    goals: { create: [{ label: "LDL below 2.6 mmol/L", sortOrder: 0 }, { label: "8,000 steps a day", sortOrder: 1 }, { label: "7+ hours of sleep", sortOrder: 2 }] },
    careTeam: { create: [
      { name: "Dr. Anmol Singh Kapoor", role: "Most responsible physician", physicianSlug: "anmol-kapoor", location: "North East", createdAt: ago(59) },
      { name: "Dr. Anwar Dastagir Jelani", role: "Consulting physician", physicianSlug: "anwar-jelani", location: "Meadow Miles", createdAt: ago(40) },
    ] },
  } });
  const daniel = await prisma.patient.create({ data: {
    id: "test_pt_daniel", email: "daniel.test@anrahealth.test", firstName: "Daniel", lastName: "Okafor (Test)", passwordHash: pw, phone: "(403) 555-0187",
    dateOfBirth: new Date("1962-07-02T12:00:00Z"), termsAcceptedAt: ago(120), emailVerifiedAt: ago(120), lastLoginAt: ago(0, 1), createdAt: ago(120),
    settings: { create: { shareLabs: false } },
    careTeam: { create: [{ name: "Dr. Ravi Varshney", role: "Most responsible physician", physicianSlug: "ravi-varshney", location: "North East" }] },
  } });
  await prisma.patient.create({ data: {
    id: "test_pt_priya", email: "priya.test@anrahealth.test", firstName: "Priya", lastName: "Raman (Test)", passwordHash: pw,
    termsAcceptedAt: ago(3), createdAt: ago(3), settings: { create: {} },
  } });

  // ── Maya: labs, protocol, appointments, device, readings, sessions ──
  await prisma.labResult.createMany({ data: [
    { id: "test_lab_1", patientId: maya.id, code: "ldl", name: "LDL cholesterol", category: "Heart Health", value: 3.4, unit: "mmol/L", refHigh: 3.5, collectedAt: ago(1), panel: "Lipid panel", staffNote: "Within range; above her 2.6 mmol/L goal.", createdAt: ago(1, 2) },
    { id: "test_lab_2", patientId: maya.id, code: "hba1c", name: "HbA1c", category: "Metabolic Health", value: 6.1, unit: "%", refLow: 4.0, refHigh: 5.9, collectedAt: ago(1), panel: "Metabolic panel", createdAt: ago(1, 2) },
    { id: "test_lab_0", patientId: maya.id, code: "ldl", name: "LDL cholesterol", category: "Heart Health", value: 3.9, unit: "mmol/L", refHigh: 3.5, collectedAt: ago(200), panel: "Lipid panel", createdAt: ago(200) },
    { id: "test_lab_4", patientId: maya.id, code: "vitd", name: "Vitamin D (25-OH)", category: "Nutrition", value: 62, unit: "nmol/L", refLow: 75, refHigh: 250, collectedAt: ago(380), panel: "Vitamins", createdAt: ago(380) },
    { id: "test_lab_3", patientId: maya.id, code: "hs-troponin-t", name: "hs-Troponin T", category: "Heart Health", status: "pending", unit: "ng/L", refHigh: 14, collectedAt: ago(0, 1), panel: "Cardiac markers", staffNote: "Ordered after emergency-flagged symptom check.", createdAt: ago(0, 1) },
  ] });
  const prot = [
    ["test_prot_1", "Omega-3 (EPA/DHA)", "Morning", "1 g", "BioAro Drugs", "With breakfast", 40],
    ["test_prot_2", "Walk after lunch", "Midday", "10 min", "Dr. Anmol Singh Kapoor", "Easy pace; stop if chest discomfort", 40],
    ["test_prot_3", "Atorvastatin", "Evening", "20 mg", "Dr. Anmol Singh Kapoor", "Take with water, same time nightly", 50],
  ];
  for (const [id, title, slot, dose, source, guidance, start] of prot) await prisma.protocolItem.create({ data: { id, patientId: maya.id, title, slot, dose, source, guidance, startedAt: ago(start) } });
  const logs = [];
  for (let i = 1; i <= 30; i++) for (const [id, , , , , , ] of prot) if ((i * id.length) % 7 !== 0) logs.push({ itemId: id, patientId: maya.id, day: day(ago(i)), doneAt: ago(i) });
  await prisma.protocolLog.createMany({ data: logs });
  const appt = await prisma.appointment.create({ data: { id: "test_appt_1", patientId: maya.id, title: "Follow-up", clinician: "Dr. Anmol Singh Kapoor", location: "North East", startsAt: ahead(7), prepSavedAt: ago(0, 2), createdAt: ago(10) } });
  await prisma.appointment.create({ data: { id: "test_appt_0", patientId: maya.id, title: "Annual review", clinician: "Dr. Anwar Dastagir Jelani", location: "Meadow Miles", startsAt: ago(17), status: "completed", createdAt: ago(30) } });
  await prisma.visitQuestion.createMany({ data: [
    { patientId: maya.id, appointmentId: appt.id, text: "Should I keep taking omega-3 with the statin?" },
    { patientId: maya.id, appointmentId: appt.id, text: "Was the chest tightness this morning related to my blood pressure?" },
  ] });
  await prisma.deviceConnection.create({ data: { id: "test_dev_1", patientId: maya.id, provider: "apple", status: "connected", dataTypes: JSON.stringify(["rhr", "hrv", "spo2", "sleep", "steps", "ecg"]), connectedAt: ago(45), lastSyncAt: ago(0, 0, 20) } });
  const readings = [];
  for (let i = 0; i < 14; i++) {
    const at = ago(i, 8);
    readings.push({ patientId: maya.id, metric: "rhr", day: day(at), value: 66 + (i % 4), source: "apple", recordedAt: at });
    readings.push({ patientId: maya.id, metric: "hrv", day: day(at), value: 38 + (i % 5), source: "apple", recordedAt: at });
    readings.push({ patientId: maya.id, metric: "sleep", day: day(at), value: 6.4 + (i % 3) * 0.3, source: "apple", recordedAt: at });
    readings.push({ patientId: maya.id, metric: "steps", day: day(at), value: 6200 + i * 150, source: "apple", recordedAt: at });
  }
  readings.push({ patientId: maya.id, metric: "bp", day: day(ago(17)), value: 138, valueText: "138/86", source: "clinic", recordedAt: ago(17) });
  await prisma.healthReading.createMany({ data: readings });
  // Health Universe: home BP (morning + evening), check-ins, points, a challenge, family care.
  const bps = [];
  for (let i = 0; i < 10; i++) for (const [h, ds, dd] of [[7, 0, 0], [20, -3, -2]]) {
    const at = ago(i, 0); at.setUTCHours(h + 6, 10, 0, 0);
    if (at > new Date()) continue;
    bps.push({ id: `test_bp_${i}_${h}`, patientId: maya.id, sys: 134 + ((i * 3) % 7) + ds, dia: 85 + (i % 3) + dd, pulse: 68 + (i % 4), takenAt: at, day: day(at), source: "manual" });
  }
  await prisma.bpReading.createMany({ data: bps });
  const bpDays = [...new Set(bps.map((b) => b.day))];
  await prisma.healthReading.createMany({ data: bpDays.map((d) => { const x = bps.filter((b) => b.day === d); const sy = Math.round(x.reduce((a, b) => a + b.sys, 0) / x.length), di = Math.round(x.reduce((a, b) => a + b.dia, 0) / x.length); return { patientId: maya.id, metric: "bp", day: d, value: sy, valueText: `${sy}/${di}`, source: "manual", recordedAt: x[0].takenAt }; }) });
  const life = [];
  for (let i = 1; i <= 9; i++) {
    const d = day(ago(i)), at = (h) => { const x = ago(i); x.setUTCHours(h + 6, 0, 0, 0); return x; };
    for (let w = 0; w < 5 + (i % 4); w++) life.push({ id: `test_lf_w${i}_${w}`, patientId: maya.id, kind: "water", value: 1, day: d, at: at(8 + w) });
    life.push({ id: `test_lf_c${i}`, patientId: maya.id, kind: "caffeine", value: 1, day: d, at: at(i % 3 === 0 ? 15 : 8) });
    if (i % 3 === 1) life.push({ id: `test_lf_a${i}`, patientId: maya.id, kind: "alcohol", value: 2, day: d, at: at(19) });
    life.push({ id: `test_lf_m${i}`, patientId: maya.id, kind: "mood", value: 3 + (i % 3 === 0 ? 1 : 0), day: d, at: at(9) });
    life.push({ id: `test_lf_s${i}`, patientId: maya.id, kind: "stress", value: 2 + (i % 2), day: d, at: at(9) });
  }
  life.push({ id: "test_lf_meal1", patientId: maya.id, kind: "meal", value: 1, note: "Oatmeal with blueberries (Test)", day: day(ago(1)), at: ago(1, 14) });
  await prisma.lifestyleLog.createMany({ data: life });
  await prisma.rewardEvent.createMany({ data: Array.from({ length: 9 }, (_, i) => ({ id: `test_rw_${i}`, patientId: maya.id, kind: "checkin", day: day(ago(i + 1)), points: 10 })).concat([{ id: "test_rw_s", patientId: maya.id, kind: "streak7", day: day(ago(3)), points: 50 }, { id: "test_rw_p", patientId: maya.id, kind: "protocol", day: day(ago(2)), points: 15 }]) });

  await prisma.patientSession.create({ data: { tokenHash: "test_" + randomBytes(16).toString("hex"), patientId: maya.id, ip: "142.59.10.18", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1", lastSeenAt: ago(0, 0, 4), expiresAt: new Date(Date.now() + 20 * 86400000) } });

  // ── Daniel: reschedule request + a device that stopped syncing ──
  await prisma.appointment.create({ data: { id: "test_appt_2", patientId: daniel.id, title: "Follow-up", clinician: "Dr. Ravi Varshney", location: "North East", startsAt: ahead(3, 13, 15), rescheduleRequestedAt: ago(0, 3), createdAt: ago(20) } });
  await prisma.deviceConnection.create({ data: { id: "test_dev_2", patientId: daniel.id, provider: "garmin", status: "connected", dataTypes: JSON.stringify(["rhr", "steps", "sleep"]), connectedAt: ago(90), lastSyncAt: ago(4) } });

  // Daniel looks after Maya (family care), and both are in a steps challenge.
  await prisma.careLink.create({ data: { id: "test_care_1", ownerId: maya.id, caregiverId: daniel.id, email: daniel.email, relation: "Spouse / partner", status: "active", acceptedAt: ago(20), createdAt: ago(21) } });
  await prisma.challenge.create({ data: { id: "test_chal_1", code: "TESTQ7", name: "October step-up (Test)", metric: "steps", goal: 7000, startDay: day(ago(10)), endDay: day(ahead(10)), org: "ANRA staff (Test)", createdById: maya.id, members: { create: [{ patientId: maya.id }, { patientId: daniel.id }] } } });
  await prisma.healthReading.createMany({ data: Array.from({ length: 8 }, (_, i) => ({ patientId: daniel.id, metric: "steps", day: day(ago(i + 1)), value: 5400 + i * 420, source: "garmin", recordedAt: ago(i + 1) })) });

  // ── Visitors ──
  // v_TEST01: browsed anonymously, then signed up as Maya (history merged).
  await prisma.visitor.create({ data: { id: "v_TEST01", sessionId: "test_session_1", firstSeenAt: ago(62), lastSeenAt: ago(0, 0, 4), pageCount: 6, landingPath: "/cardiology", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1", patientId: maya.id, convertedAt: ago(60) } });
  // v_TEST02: still anonymous — used the symptom checker and sent a referral.
  await prisma.visitor.create({ data: { id: "v_TEST02", sessionId: "test_session_2", firstSeenAt: ago(0, 2, 10), lastSeenAt: ago(0, 1, 50), pageCount: 4, landingPath: "/", userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36" } });
  const pv = [["test_session_1", "/cardiology", 62], ["test_session_1", "/longevity-assessment", 62], ["test_session_1", "/my-health/sign-up", 60], ["test_session_1", "/my-health", 1], ["test_session_1", "/my-health", 0], ["test_session_1", "/lab-results", 1]];
  await prisma.pageVisit.createMany({ data: pv.map(([sessionId, path, d], i) => ({ sessionId, path, createdAt: ago(d, 0, 30 - i) })) });
  await prisma.pageVisit.createMany({ data: ["/", "/symptom-checker", "/referral-centre", "/contact"].map((path, i) => ({ sessionId: "test_session_2", path, createdAt: ago(0, 2, 10 - i * 5) })) });
  await prisma.outboundClick.createMany({ data: [{ sessionId: "test_session_1", host: "bioarolabs.com", url: "https://bioarolabs.com/shop", fromPath: "/lab-results", createdAt: ago(1) }] });

  // ── AI activity ──
  await prisma.longevityAssessment.create({ data: { id: "test_la_1", sessionId: "test_session_1", patientId: maya.id, createdAt: ago(61),
    answers: JSON.stringify({ smoking: "Never", weeklyActivity: "About 90 minutes", sleep: "6–7 hours", familyHistory: "Father: heart attack at 58" }),
    summary: "Moderate cardiovascular risk driven by family history and below-target activity.", focusAreas: JSON.stringify(["Cardiovascular risk", "Activity", "Sleep"]), suggestedNextStep: "Book a preventive cardiology consult" } });
  await prisma.symptomCheckLog.create({ data: { id: "test_sc_1", sessionId: "test_session_1", patientId: maya.id, createdAt: ago(0, 1, 30), specialty: "Cardiology", emergency: true, urgency: "Emergency", recommendedDiscipline: "Cardiology",
    description: "(Test) Chest tightness spreading to left arm for about 20 minutes, with shortness of breath. Started while climbing stairs.", summary: "These symptoms can be serious. If this is an emergency, call 911." } });
  await prisma.symptomCheckLog.create({ data: { id: "test_sc_2", sessionId: "test_session_2", createdAt: ago(0, 1, 55), specialty: "Internal Medicine", emergency: true, urgency: "Emergency", recommendedDiscipline: "Internal Medicine",
    description: "(Test) Sudden severe headache with blurred vision. Home blood pressure reading 182/118.", summary: "These symptoms can be serious. If this is an emergency, call 911." } });
  await prisma.albaConversation.create({ data: { id: "test_al_1", sessionId: "test_session_1", patientId: maya.id, pageContext: "My Health Space · Labs", createdAt: ago(1, 1), messages: { create: [
    { id: "test_msg_1", role: "user", text: "My LDL came back at 3.4. Is that bad?", createdAt: ago(1, 1) },
    { id: "test_msg_2", role: "assistant", text: "An LDL of 3.4 mmol/L is inside the lab’s reference range, but your care team set a goal below 2.6. That’s a good question to bring to your next visit. I can’t change your treatment.", createdAt: ago(1, 1) },
  ] } } });

  // ── Referrals ──
  await prisma.referralSubmission.create({ data: { id: "test_ref_1", type: "manual", sessionId: "test_session_x", patientId: maya.id, patientName: "Maya Chen (Test)", patientPhone: "(403) 555-0142", referringPhysician: "Dr. Test Referrer", referringPhone: "403-555-0100", referringAddress: "Test Family Clinic, Calgary", urgency: "Urgent", specialties: JSON.stringify(["Cardiology"]), physicianSlugs: JSON.stringify(["anmol-kapoor"]), exams: JSON.stringify(["ECG", "Echocardiogram"]), clinicalNotes: "(Test) Exertional chest tightness for 3 weeks. Father had MI at 58.", status: "reviewed", reviewedBy: "admin", reviewedAt: ago(50), createdAt: ago(52) } });
  await prisma.referralSubmission.create({ data: { id: "test_ref_2", type: "automatic", sessionId: "test_session_2", patientName: "Robert Haines (Test)", patientPhone: "(403) 555-0199", referringPhysician: "Dr. Test Referrer", referringPhone: "403-555-0100", urgency: "ASAP", specialties: JSON.stringify(["Cardiology"]), exams: JSON.stringify(["ECG", "Holter monitor"]), clinicalNotes: "(Test) New-onset atrial fibrillation, rate controlled. Please assess anticoagulation.", sourceText: "TEST REFERRAL — Re: Robert Haines. New-onset AF, rate controlled on metoprolol. Please assess for anticoagulation. ECG and Holter requested.", createdAt: ago(0, 1, 45) } });

  console.log("✓ Test data added: 3 test patients (Maya, Daniel, Priya) and 2 visitors (v_TEST01, v_TEST02).");
  console.log("  Test patients can sign in to My Health Space with:");
  console.log("    maya.test@anrahealth.test / daniel.test@anrahealth.test / priya.test@anrahealth.test");
  console.log("    Password: " + password + "   (shown once — run 'add' again for a new one)");
}

const cmd = process.argv[2];
(cmd === "remove" ? remove() : cmd === "add" ? add() : Promise.reject(new Error("Use: node scripts/admin-demo-data.mjs add | remove")))
  .catch((e) => { console.error("✗", e.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
