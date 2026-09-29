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

const EMERGENCY_TEXT = "This could need urgent care. If you have chest pain, severe shortness of breath, fainting or other emergency symptoms, call 911 or go to the nearest emergency department now.";
const EXTRA_EMERGENCY = /chest pain|can'?t breathe|cannot breathe|trouble breathing|faint|stroke|suicid|severe/i;
const FALLBACK = "I can help with your trends, sleep, results or preparing for your visit. For anything about symptoms or treatment, your care team is the right place to start.";

type Consent = { wearables: boolean; labs: boolean; records: boolean };
async function buildContext(patient: { id: string; firstName: string; timezone: string }, c: Consent) {
  const today = dayKey(new Date(), patient.timezone), from = addDays(today, -30);
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
    lines.push(`${def.name}: latest ${fmtU(m, last.value)} on ${last.day}; 30-day average ${fmtU(m, avg(rows.map((r) => r.value)))}; ${rows.length} days of data`);
  });
  const seen = new Set<string>();
  labs.forEach((l) => { if (seen.has(l.code)) return; seen.add(l.code); sources.add("BioAro Labs"); lines.push(`Lab ${l.name}: ${l.valueText ?? l.value} ${l.unit ?? ""} (reference ${l.refText ?? "n/a"}, collected ${l.collectedAt?.toISOString().slice(0, 10)})`); });
  if (appt) lines.push(`Next appointment: ${appt.title} with ${appt.clinician} on ${appt.startsAt.toISOString().slice(0, 16).replace("T", " ")} UTC`);
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
      generationConfig: { temperature: 0.3, maxOutputTokens: 300 },
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
Keep to 2–3 short sentences, plain language, no markdown. Only use the data below; if something isn't in it, say you don't have that data yet.
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
