// POST /api/portal/alba — { message, conversationId? }
// ALBA inside My Health Space: answers about the patient's OWN data, only
// when "ALBA access" is on in Privacy & Data. Emergency keywords are caught
// before any AI call (non-negotiable safety net). Every exchange is logged
// to AlbaConversation with the patient id, so it appears in History.
import { prisma } from "@backend/db";
import { startAlbaConversation, logAlbaMessage } from "@backend/logging";
import { getOrCreateSessionId } from "@backend/session";
import { getSettings, getProtocol, readingSourceFilter } from "@backend/patientData";
import { rateLimit } from "@backend/rateLimit";
import { audit } from "@backend/audit";
import { detectEmergencyKeywords, detectCrisisKeywords, CRISIS_MESSAGE } from "@/lib/emergencyDetection";
import { METRIC_DEFS, avg, dayKey, addDays, fmtU, type MetricKey } from "@/lib/portal/metrics";
import { PROVIDER_NAMES } from "@/lib/portal/devices";
import { withPatientMutation, readJson, str, HttpError } from "@backend/apiHelpers";
import { placeFor } from "@backend/brief";
import { getWeather } from "@backend/weather";
import { getRetests } from "@backend/labs";

const EMERGENCY_TEXT = "This could need urgent care. If you have chest pain, severe shortness of breath, fainting or other emergency symptoms, call 911 or go to the nearest emergency department now.";
const EXTRA_EMERGENCY = /chest pain|can'?t breathe|cannot breathe|trouble breathing|faint|stroke|suicid|severe/i;
const FALLBACK = "I can help with your trends, sleep, results or preparing for your visit. For anything about symptoms or treatment, your care team is the right place to start.";

type Consent = { wearables: boolean; labs: boolean; records: boolean };
async function buildContext(patient: { id: string; firstName: string; timezone: string }, c: Consent) {
  const today = dayKey(new Date(), patient.timezone), from = addDays(today, -60);
  const [readings, labs, appt, protocol] = await Promise.all([
    prisma.healthReading.findMany({ where: { patientId: patient.id, day: { gte: from }, ...readingSourceFilter(c) }, select: { metric: true, day: true, value: true, valueText: true, source: true }, orderBy: { day: "asc" } }),
    !c.labs ? Promise.resolve([]) : prisma.labResult.findMany({ where: { patientId: patient.id, status: "final" }, orderBy: { collectedAt: "desc" }, take: 12, select: { name: true, value: true, valueText: true, unit: true, refText: true, collectedAt: true, code: true } }),
    !c.records ? Promise.resolve(null) : prisma.appointment.findFirst({ where: { patientId: patient.id, status: "scheduled", startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, select: { title: true, clinician: true, startsAt: true } }),
    getProtocol(patient),
  ]);
  const lines: string[] = [], sources = new Set<string>();
  const byMetric = new Map<string, typeof readings>();
  readings.forEach((r) => { if (!byMetric.has(r.metric)) byMetric.set(r.metric, []); byMetric.get(r.metric)!.push(r); sources.add(PROVIDER_NAMES[r.source] || r.source); });
  byMetric.forEach((rows, m) => {
    const def = (METRIC_DEFS as Record<string, { name: string }>)[m];
    if (!def) return;
    const last = rows[rows.length - 1];
    if (last.valueText) { lines.push(`${def.name}: ${last.valueText} (${last.day})`); return; }
    if (m === "bedtime") return;
    const r30 = rows.filter((r) => r.day >= addDays(today, -30));
    lines.push(`${def.name}: latest ${fmtU(m, last.value)} on ${last.day}; 30-day average ${fmtU(m, avg((r30.length ? r30 : rows).map((r) => r.value)))}; ${r30.length} days of data in the last 30`);
  });
  const seen = new Set<string>();
  labs.forEach((l) => { if (seen.has(l.code)) return; seen.add(l.code); sources.add("BioAro Labs"); lines.push(`Lab ${l.name}: ${l.valueText ?? l.value} ${l.unit ?? ""} (reference ${l.refText ?? "n/a"}, collected ${l.collectedAt?.toISOString().slice(0, 10)})`); });
  if (appt) lines.push(`Next appointment: ${appt.title} with ${appt.clinician} on ${appt.startsAt.toISOString().slice(0, 16).replace("T", " ")} UTC`);

  // Health Universe: night-by-night sleep with possible factors, home BP, check-ins, weather, retests.
  const from14 = addDays(today, -14);
  const [bps, logs, place, retests] = await Promise.all([
    prisma.bpReading.findMany({ where: { patientId: patient.id, day: { gte: addDays(today, -30) } }, orderBy: { takenAt: "desc" }, select: { sys: true, dia: true, day: true } }),
    prisma.lifestyleLog.findMany({ where: { patientId: patient.id, day: { gte: from14 } }, select: { kind: true, value: true, day: true, at: true, note: true } }),
    placeFor(patient.id),
    c.labs ? getRetests(patient, 30) : Promise.resolve([]),
  ]);
  const hourOf = (d: Date) => Number(new Intl.DateTimeFormat("en-GB", { timeZone: patient.timezone, hour: "2-digit", hour12: false }).format(d)) % 24;
  const nights = (byMetric.get("sleep") || []).filter((r) => r.day >= from14);
  if (nights.length) {
    const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    lines.push("Sleep night by night (last 14 days; factors are from the day before, patient-logged):");
    nights.forEach((n) => {
      const prev = addDays(n.day, -1), L = logs.filter((l) => l.day === prev);
      const f: string[] = [];
      const alc = L.filter((l) => l.kind === "alcohol").reduce((a, l) => a + l.value, 0);
      if (alc) f.push(`${alc} alcoholic drink${alc > 1 ? "s" : ""}`);
      const late = L.filter((l) => l.kind === "caffeine" && hourOf(l.at) >= 14).length;
      if (late) f.push(`caffeine after 2 PM`);
      const st = L.filter((l) => l.kind === "stress").map((l) => l.value);
      if (st.length && Math.max(...st) >= 4) f.push("high stress");
      const bed = (byMetric.get("bedtime") || []).find((b) => b.day === n.day);
      if (bed) { const m = Math.round(bed.value), h = Math.floor(m / 60) % 24; f.push(`bedtime ${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`); }
      const d = new Date(n.day + "T12:00:00Z");
      lines.push(`- ${WD[d.getUTCDay()]} ${n.day}: ${fmtU("sleep", n.value)}${f.length ? ` (${f.join(", ")})` : ""}`);
    });
    const wk = (a: number, b: number) => avg(nights.filter((n) => n.day > addDays(today, -a) && n.day <= addDays(today, -b)).map((n) => n.value));
    const tw = wk(7, 0), lw = wk(14, 7);
    if (!isNaN(tw) && !isNaN(lw)) lines.push(`Sleep average this week ${fmtU("sleep", tw)} vs previous week ${fmtU("sleep", lw)}`);
  }
  if (bps.length) {
    const b7 = bps.filter((b) => b.day > addDays(today, -7));
    const a = (x: typeof bps) => `${Math.round(avg(x.map((y) => y.sys)))}/${Math.round(avg(x.map((y) => y.dia)))}`;
    lines.push(`Home blood pressure: 30-day average ${a(bps)} (${bps.length} readings)${b7.length ? `; 7-day average ${a(b7)}` : ""}; latest ${bps[0].sys}/${bps[0].dia} on ${bps[0].day}. Home target is below 135/85.`);
  }
  const wkLogs = logs.filter((l) => l.day > addDays(today, -7));
  if (wkLogs.length) {
    const sum = (k: string) => wkLogs.filter((l) => l.kind === k).reduce((a, l) => a + l.value, 0);
    const mood = wkLogs.filter((l) => l.kind === "mood").map((l) => l.value), stress = wkLogs.filter((l) => l.kind === "stress").map((l) => l.value);
    lines.push(`Check-ins last 7 days: ${sum("water")} glasses of water, ${sum("caffeine")} caffeinated drinks, ${sum("alcohol")} alcoholic drinks${mood.length ? `, average mood ${avg(mood).toFixed(1)}/5` : ""}${stress.length ? `, average stress ${avg(stress).toFixed(1)}/5` : ""}; meals logged: ${wkLogs.filter((l) => l.kind === "meal").map((l) => l.note).slice(-5).join("; ") || "none"}`);
  }
  if (place) { const w = await getWeather(place); if (w) lines.push(`Today in ${w.place}: ${w.tempC ?? "?"}°C ${w.condition || ""}, AQHI ${w.aqhi ?? "?"} (${w.aqhiRisk || "unknown"})${w.alerts[0] ? `, alert: ${w.alerts[0]}` : ""}`); }
  if (retests.length) lines.push(`Lab retests due: ${retests.map((r) => `${r.name} (last ${r.last}, due ${r.due})`).join("; ")}`);
  if (protocol.items.length) lines.push(`Daily protocol: ${protocol.items.map((i) => `${i.title} (${i.dose})${i.doneToday ? " — done today" : ""}`).join("; ")}`);
  return { text: lines.join("\n"), sources: [...sources], hasSleep: byMetric.has("sleep"), hasTrends: byMetric.size > 0, hasAppt: !!appt };
}

async function gemini(system: string, message: string, history: { role: string; text: string }[]) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY missing");
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${key}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [...history.slice(-6).map((h) => ({ role: h.role === "user" ? "user" : "model", parts: [{ text: h.text }] })), { role: "user", parts: [{ text: message }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 400 },
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error("Gemini " + res.status);
  const data = await res.json();
  const text = (data?.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || "").join("").replace(/\*\*|__|#+\s/g, "").trim();
  if (!text) throw new Error("empty");
  return text;
}

export const POST = (req: Request) => withPatientMutation(async ({ patient, ip }) => {
  if (!rateLimit(`alba:${patient.id}`, 20, 60_000)) throw new HttpError(429, "You're sending messages quickly. Please wait a moment.");
  const b = await readJson(req);
  const message = str(b.message, 1000);
  if (!message) throw new HttpError(400, "Please type a question.");

  // Conversation (logged with patientId via backend/logging).
  let conversationId = str(b.conversationId, 40);
  if (conversationId) {
    const own = await prisma.albaConversation.findFirst({ where: { id: conversationId, patientId: patient.id }, select: { id: true } });
    if (!own) conversationId = "";
  }
  if (!conversationId) conversationId = await startAlbaConversation({ sessionId: await getOrCreateSessionId(), pageContext: "/my-health" });
  await logAlbaMessage({ conversationId, role: "user", text: message });
  const history = (await prisma.albaMessage.findMany({ where: { conversationId }, orderBy: { createdAt: "asc" }, select: { role: true, text: true } })).slice(0, -1);

  const reply = async (text: string, extra: { src?: string; action?: string } = {}) => {
    await logAlbaMessage({ conversationId, role: "assistant", text });
    return { conversationId, text, ...extra };
  };

  // Safety net first — deterministic, before any AI.
  if (detectCrisisKeywords(message)) return reply(CRISIS_MESSAGE, { action: "emergency" });
  if (detectEmergencyKeywords(message) || EXTRA_EMERGENCY.test(message)) return reply(EMERGENCY_TEXT, { action: "emergency" });

  const settings = await getSettings(patient.id);
  const ctx = settings.albaAccess ? await buildContext(patient, { wearables: settings.shareWearables, labs: settings.shareLabs, records: settings.shareRecords }) : null;
  audit(patient.id, "patient", "read", "alba-context", ip);

  const system = `You are ALBA, a calm health data companion inside ANRA Health's My Health Space (a Calgary cardiology and internal medicine clinic).
Rules: Never diagnose. Never recommend starting, stopping or changing medications or supplements. Suggest the care team when appropriate.
Keep to 2–4 short sentences, plain language, no markdown. Only use the data below; if something isn't in it, say you don't have that data yet.
When asked "why" (for example why sleep was worse), compare the nights and point to the most likely factors in the data (alcohol, late caffeine, stress, late or irregular bedtimes, exercise), say it's a pattern not a certainty, and suggest one small thing to try.
The patient's first name is ${patient.firstName}.
${ctx ? (ctx.text ? `PATIENT DATA (from sources the patient allowed):\n${ctx.text}` : "PATIENT DATA: none yet (no wearable, results or appointments).") : "The patient has turned OFF ALBA access to their data. Do not reference personal data; answer generally and mention they can turn it on in Privacy & Data."}`;

  let text: string;
  try { text = await gemini(system, message, history); } catch (e: any) { console.error("Portal ALBA error:", e?.message); text = FALLBACK; }

  let action: string | undefined;
  if (ctx?.hasSleep && /sleep/i.test(message)) action = "sleep";
  else if (ctx?.hasAppt && /kapoor|ask|visit|appointment|doctor/i.test(message)) action = "prepare";
  else if (ctx?.hasTrends && /trend|health|how am i/i.test(message)) action = "trends";
  const src = ctx && ctx.sources.length && text !== FALLBACK ? `Based on ${ctx.sources.join(", ")} · last 30 days` : undefined;
  return reply(text, { src, action });
});
