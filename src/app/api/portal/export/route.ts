// GET /api/portal/export — download a copy of all your My Health Space data (JSON).
import { prisma } from "@backend/db";
import { audit } from "@backend/audit";
import { rateLimit } from "@backend/rateLimit";
import { withPatient, HttpError } from "@backend/apiHelpers";

export const GET = () => withPatient(async ({ patient, ip }) => {
  if (!rateLimit(`export:${patient.id}`, 5, 60 * 60 * 1000)) throw new HttpError(429, "Please try again later.");
  const id = patient.id;
  const [profile, settings, goals, careTeam, devices, readings, labResults, protocol, appointments, questions, referrals, symptomChecks, assessments, labChecks, conversations] = await Promise.all([
    prisma.patient.findUnique({ where: { id }, select: { firstName: true, lastName: true, email: true, phone: true, dateOfBirth: true, timezone: true, createdAt: true } }),
    prisma.patientSettings.findUnique({ where: { patientId: id } }),
    prisma.goal.findMany({ where: { patientId: id }, select: { label: true } }),
    prisma.careTeamMember.findMany({ where: { patientId: id }, select: { name: true, role: true } }),
    prisma.deviceConnection.findMany({ where: { patientId: id }, select: { provider: true, status: true, connectedAt: true, lastSyncAt: true, dataTypes: true } }),
    prisma.healthReading.findMany({ where: { patientId: id }, select: { metric: true, day: true, value: true, valueText: true, source: true, recordedAt: true }, orderBy: [{ metric: "asc" }, { day: "asc" }] }),
    prisma.labResult.findMany({ where: { patientId: id } }),
    prisma.protocolItem.findMany({ where: { patientId: id }, include: { logs: { select: { day: true, doneAt: true } } } }),
    prisma.appointment.findMany({ where: { patientId: id } }),
    prisma.visitQuestion.findMany({ where: { patientId: id }, select: { text: true, createdAt: true, appointmentId: true } }),
    prisma.referralSubmission.findMany({ where: { patientId: id } }),
    prisma.symptomCheckLog.findMany({ where: { patientId: id } }),
    prisma.longevityAssessment.findMany({ where: { patientId: id } }),
    prisma.labResultCheck.findMany({ where: { patientId: id } }),
    prisma.albaConversation.findMany({ where: { patientId: id }, select: { createdAt: true, pageContext: true, messages: { select: { role: true, text: true, createdAt: true } } } }),
  ]);
  // Strip internal keys (session ids, foreign keys) from the export.
  const clean = (rows: any[]) => rows.map(({ patientId, sessionId, itemId, ...r }) => r);
  audit(id, "patient", "export", "all", ip);
  const body = JSON.stringify({ exportedAt: new Date().toISOString(), profile, settings, goals, careTeam, devices, readings, labResults: clean(labResults), protocol: clean(protocol), appointments: clean(appointments), questions, referrals: clean(referrals), symptomChecks: clean(symptomChecks), assessments: clean(assessments), labChecks: clean(labChecks), conversations }, null, 2);
  return new Response(body, { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="neyu-my-health-space-${new Date().toISOString().slice(0, 10)}.json"`, "Cache-Control": "private, no-store" } });
});
