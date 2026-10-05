// Personal Health Space intelligence: "What changed?", "What's missing?",
// the Health Map and the Doctor Assessment data. Rules-based on purpose —
// fast, free, predictable, and never a diagnosis. Neyu (AI) only words it.

import { prisma } from "./db";
import { getConsent, readingSourceFilter, parseJSON } from "./patientData";
import { avg, dayKey, addDays, fmtU, type MetricKey } from "@/lib/portal/metrics";
import { PROVIDER_NAMES } from "@/lib/portal/devices";

type P = { id: string; firstName: string; lastName?: string; timezone: string; dateOfBirth?: Date | null };

export type ChangeStatus = "new" | "improved" | "worsened" | "stable" | "changed" | "insufficient";
export interface ChangeItem { status: ChangeStatus; area: string; title: string; text: string; go?: string; source?: string }
export interface GapItem { area: string; text: string; action?: { label: string; go: string } }
export interface MapArea { id: string; label: string; icon: string; state: "known" | "partial" | "missing"; fact: string; change?: ChangeStatus; go: string }

const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0);
const LAB_SOURCE = (s: string) => s || "Laboratory";

// What each metric means when it moves (higher is better / lower is better / neutral).
const METRICS: { k: MetricKey; area: string; dir: 1 | -1 | 0; min: number; label: string; go: string }[] = [
  { k: "steps", area: "Activity", dir: 1, min: 10, label: "average daily steps", go: "trend:steps" },
  { k: "active", area: "Activity", dir: 1, min: 12, label: "active minutes", go: "trend:active" },
  { k: "sleep", area: "Sleep", dir: 1, min: 5, label: "sleep duration", go: "trend:sleep" },
  { k: "rhr", area: "Heart", dir: -1, min: 4, label: "resting heart rate", go: "trend:rhr" },
  { k: "hrv", area: "Heart", dir: 1, min: 8, label: "heart rate variability", go: "trend:hrv" },
  { k: "weight", area: "Body", dir: 0, min: 2, label: "weight", go: "myhealth" },
];

async function loadAll(p: P, days = 60) {
  const today = dayKey(new Date(), p.timezone), from = addDays(today, -Math.max(days, 60));
  const c = await getConsent(p.id);
  const [readings, bps, labs, docs, meals, appts, prof, devices, logs, goals] = await Promise.all([
    prisma.healthReading.findMany({ where: { patientId: p.id, day: { gte: from }, ...readingSourceFilter(c) }, select: { metric: true, day: true, value: true, valueText: true, source: true }, orderBy: { day: "asc" } }),
    prisma.bpReading.findMany({ where: { patientId: p.id, day: { gte: from } }, select: { sys: true, dia: true, day: true, takenAt: true }, orderBy: { takenAt: "desc" } }),
    c.labs ? prisma.labResult.findMany({ where: { patientId: p.id, status: "final" }, orderBy: { collectedAt: "desc" }, take: 200, select: { id: true, code: true, name: true, category: true, value: true, valueText: true, unit: true, refLow: true, refHigh: true, refText: true, collectedAt: true, source: true } }) : Promise.resolve([]),
    prisma.healthDocument.findMany({ where: { patientId: p.id, status: "saved" }, orderBy: [{ docDate: "desc" }, { createdAt: "desc" }], select: { id: true, title: true, kind: true, provider: true, docDate: true, source: true, createdAt: true, summary: true, mime: true } }),
    prisma.foodLog.findMany({ where: { patientId: p.id, day: { gte: addDays(today, -Math.max(days, 28)) } }, select: { day: true, meal: true, text: true, tags: true, at: true }, orderBy: { at: "desc" } }),
    c.records ? prisma.appointment.findMany({ where: { patientId: p.id }, orderBy: { startsAt: "desc" }, take: 30, select: { id: true, title: true, clinician: true, startsAt: true, status: true } }) : Promise.resolve([]),
    prisma.healthProfile.findUnique({ where: { patientId: p.id }, select: { data: true } }),
    prisma.deviceConnection.findMany({ where: { patientId: p.id, status: "connected" }, select: { provider: true } }).catch(() => [] as { provider: string }[]),
    prisma.lifestyleLog.findMany({ where: { patientId: p.id, day: { gte: addDays(today, -30) } }, select: { kind: true, value: true, day: true } }),
    prisma.goal.findMany({ where: { patientId: p.id }, orderBy: { sortOrder: "asc" }, select: { label: true } }),
  ]);
  const profile = parseJSON<Record<string, any>>(prof?.data, {});
  return { today, c, readings, bps, labs, docs, meals, appts, profile, devices, logs, goals };
}
type All = Awaited<ReturnType<typeof loadAll>>;

const series = (a: All, k: MetricKey, fromDay: string, toDay: string) => a.readings.filter((r) => r.metric === k && r.day > fromDay && r.day <= toDay).map((r) => r.value);
const labFlag = (l: { value: number | null; refLow: number | null; refHigh: number | null }) =>
  l.value == null ? "" : l.refHigh != null && l.value > l.refHigh ? "above range" : l.refLow != null && l.value < l.refLow ? "below range" : l.refLow != null || l.refHigh != null ? "in range" : "";
const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String).filter(Boolean) : typeof v === "string" && v.trim() ? [v.trim()] : []);

function changes(a: All): ChangeItem[] {
  const out: ChangeItem[] = [];
  const t = a.today, m30 = addDays(t, -30), m60 = addDays(t, -60);
  for (const m of METRICS) {
    const cur = series(a, m.k, m30, t), prev = series(a, m.k, m60, m30);
    if (!cur.length && !prev.length) continue;
    if (cur.length < 5 || prev.length < 5) {
      if (cur.length) out.push({ status: "insufficient", area: m.area, title: cap(m.label), text: `We have ${cur.length} day${cur.length === 1 ? "" : "s"} of ${m.label} so far — not enough history to show a trend yet.`, go: m.go });
      continue;
    }
    const ca = avg(cur), pa = avg(prev), d = pct(ca, pa);
    const big = m.k === "rhr" ? Math.abs(ca - pa) >= 3 : Math.abs(d) >= m.min;
    const better = m.dir === 0 ? null : (ca - pa) * m.dir > 0;
    const status: ChangeStatus = !big ? "stable" : m.dir === 0 ? "changed" : better ? "improved" : "worsened";
    const dirWord = ca > pa ? "increased" : "decreased";
    const amount = m.k === "rhr" ? `${Math.abs(Math.round(ca - pa))} bpm` : m.k === "weight" ? `${Math.abs(ca - pa).toFixed(1)} kg` : `${Math.abs(Math.round(d))}%`;
    out.push({ status, area: m.area, title: cap(m.label), text: big ? `Your ${m.label} ${dirWord} ${amount} compared with the previous 30 days (now ${fmtU(m.k, ca)}).` : `Your ${m.label} has stayed steady over the last 30 days (about ${fmtU(m.k, ca)}).`, go: m.go, source: srcOf(a, m.k) });
  }
  // Home blood pressure
  const bpC = a.bps.filter((b) => b.day > m30), bpP = a.bps.filter((b) => b.day <= m30 && b.day > m60);
  if (bpC.length >= 3 && bpP.length >= 3) {
    const sc = avg(bpC.map((b) => b.sys)), sp = avg(bpP.map((b) => b.sys)), dc = avg(bpC.map((b) => b.dia));
    const diff = Math.round(sc - sp);
    out.push({ status: Math.abs(diff) < 4 ? "stable" : diff < 0 ? "improved" : "worsened", area: "Blood pressure", title: "Blood pressure", text: Math.abs(diff) < 4 ? `Your home blood pressure average is steady at ${Math.round(sc)}/${Math.round(dc)}.` : `Your home blood pressure average ${diff < 0 ? "improved" : "rose"} by ${Math.abs(diff)} points over the last 30 days (now ${Math.round(sc)}/${Math.round(dc)}).`, go: "myhealth:heart", source: "Home readings" });
  } else if (bpC.length) out.push({ status: "insufficient", area: "Blood pressure", title: "Blood pressure", text: `${bpC.length} home reading${bpC.length === 1 ? "" : "s"} this month — a few more weeks will show a trend.`, go: "myhealth:heart" });
  // Labs: newest result per test in the last 90 days, compared with the one before.
  const seen = new Set<string>(), since = Date.now() - 90 * 864e5;
  for (const l of a.labs) {
    if (seen.has(l.code) || !l.collectedAt || l.collectedAt.getTime() < since || out.filter((o) => o.area === "Labs").length >= 4) { seen.add(l.code); continue; }
    seen.add(l.code);
    const prev = a.labs.find((x) => x.code === l.code && x.id !== l.id && x.collectedAt && x.collectedAt < l.collectedAt!);
    const val = `${l.valueText ?? l.value ?? ""}${l.unit ? " " + l.unit : ""}`;
    if (!prev || l.value == null || prev.value == null) { out.push({ status: "new", area: "Labs", title: l.name, text: `New ${l.name} result: ${val}${labFlag(l) ? ` (${labFlag(l)})` : ""}. ${prev ? "" : "This is your first recorded result for this test, so there isn't a trend yet."}`.trim(), go: "result:" + l.id, source: LAB_SOURCE(l.source) }); continue; }
    const wasIn = labFlag(prev) === "in range", isIn = labFlag(l) === "in range";
    const st: ChangeStatus = wasIn === isIn ? (Math.abs(pct(l.value, prev.value)) < 5 ? "stable" : "changed") : isIn ? "improved" : "worsened";
    out.push({ status: st, area: "Labs", title: l.name, text: `${l.name} is ${val} (${labFlag(l) || "no range"}), compared with ${prev.value}${l.unit ? " " + l.unit : ""} before.`, go: "result:" + l.id, source: LAB_SOURCE(l.source) });
  }
  // New reports
  a.docs.filter((d) => d.createdAt.getTime() > Date.now() - 30 * 864e5).slice(0, 3).forEach((d) =>
    out.push({ status: "new", area: "Records", title: d.title, text: `New report added: ${d.title}${d.provider ? ` from ${d.provider}` : ""}.`, go: "doc:" + d.id, source: d.provider || "Uploaded document" }));
  // Food
  const wk = a.meals.filter((f) => f.day > addDays(t, -7)), pw = a.meals.filter((f) => f.day <= addDays(t, -7) && f.day > addDays(t, -14));
  if (wk.length >= 4) {
    const veg = (xs: typeof wk) => xs.filter((f) => /vegetable|fruit|fibre/.test(f.tags)).length / Math.max(1, xs.length);
    const v = veg(wk), pv = pw.length >= 4 ? veg(pw) : null;
    out.push({ status: pv == null ? "stable" : v - pv > 0.1 ? "improved" : pv - v > 0.1 ? "worsened" : "stable", area: "Nutrition", title: "Food", text: `You logged ${wk.length} meals this week; ${Math.round(v * 100)}% included fruit, vegetables or fibre${pv != null ? ` (last week ${Math.round(pv * 100)}%)` : ""}.`, go: "food", source: "Your food log" });
  }
  const order: Record<ChangeStatus, number> = { new: 0, worsened: 1, improved: 2, changed: 3, stable: 4, insufficient: 5 };
  return out.sort((x, y) => order[x.status] - order[y.status]);
}
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const srcOf = (a: All, k: string) => { const s = [...new Set(a.readings.filter((r) => r.metric === k).map((r) => PROVIDER_NAMES[r.source] || r.source))]; return s.join(", ") || undefined; };

function gaps(a: All): GapItem[] {
  const g: GapItem[] = [];
  const yearAgo = Date.now() - 365 * 864e5;
  const recentLab = a.labs.some((l) => l.collectedAt && l.collectedAt.getTime() > yearAgo) || a.docs.some((d) => d.kind === "lab" && (d.docDate || d.createdAt).getTime() > yearAgo);
  if (!recentLab) g.push({ area: "Labs", text: "Your Health Space doesn't contain a blood test from the last 12 months.", action: { label: "Add a report", go: "add" } });
  if (!a.devices.length && !a.readings.some((r) => r.source !== "manual")) g.push({ area: "Activity & sleep", text: "No wearable or Apple Health is connected, so activity and sleep trends aren't available.", action: { label: "Connect a device", go: "devices" } });
  if (!a.bps.length) g.push({ area: "Blood pressure", text: "No home blood pressure readings have been added yet.", action: { label: "Add a reading", go: "myhealth:heart" } });
  if (!list(a.profile.medications).length) g.push({ area: "Medications", text: "Your medication list is empty. If you take any, adding them helps your doctor summary.", action: { label: "Update profile", go: "myhealth:profile" } });
  if (!list(a.profile.familyHistory).length) g.push({ area: "Family history", text: "Your record doesn't include any family health history yet.", action: { label: "Update profile", go: "myhealth:profile" } });
  if (!a.docs.some((d) => d.kind === "ecg" || d.kind === "cardiology") && !a.readings.some((r) => r.metric === "ecg")) g.push({ area: "Heart", text: "No ECG or heart report has been added to your record.", action: { label: "Add a report", go: "add" } });
  if (!a.meals.some((m) => m.day > addDays(a.today, -14))) g.push({ area: "Nutrition", text: "No meals logged in the last two weeks, so Neyu can't see eating patterns yet.", action: { label: "Log a meal", go: "food" } });
  if (!a.profile.weightKg && !a.readings.some((r) => r.metric === "weight")) g.push({ area: "Body", text: "Your record doesn't include a recent weight.", action: { label: "Update profile", go: "myhealth:profile" } });
  return g;
}

function map(a: All, ch: ChangeItem[]): MapArea[] {
  const has = (k: string, days: number) => a.readings.some((r) => r.metric === k && r.day > addDays(a.today, -days));
  const chOf = (area: string) => ch.find((c) => c.area === area && c.status !== "insufficient")?.status;
  const last = (k: MetricKey) => { const r = [...a.readings].reverse().find((x) => x.metric === k); return r ? fmtU(k, r.value) : ""; };
  const labsRecent = a.labs.filter((l) => l.collectedAt && l.collectedAt.getTime() > Date.now() - 365 * 864e5);
  const metab = a.labs.filter((l) => /metabolic/i.test(l.category) || /hba1c|glucose|insulin|triglycer/i.test(l.code + l.name));
  const meds = list(a.profile.medications), fam = list(a.profile.familyHistory);
  const imaging = a.docs.filter((d) => d.kind === "imaging");
  const heartDocs = a.docs.filter((d) => d.kind === "ecg" || d.kind === "cardiology");
  const bp30 = a.bps.filter((b) => b.day > addDays(a.today, -30));
  const area = (id: string, label: string, icon: string, state: MapArea["state"], fact: string, go: string, change?: ChangeStatus): MapArea => ({ id, label, icon, state, fact, go, change });
  return [
    area("heart", "Heart", "heartPulse", has("rhr", 30) || heartDocs.length ? "known" : has("rhr", 365) ? "partial" : "missing", has("rhr", 60) ? `Resting HR ${last("rhr")}${heartDocs.length ? ` · ${heartDocs.length} heart report${heartDocs.length > 1 ? "s" : ""}` : ""}` : heartDocs.length ? `${heartDocs.length} heart report${heartDocs.length > 1 ? "s" : ""}` : "No heart data yet", "myhealth:heart", chOf("Heart")),
    area("bp", "Blood pressure", "gauge", bp30.length >= 3 ? "known" : a.bps.length ? "partial" : "missing", a.bps.length ? `Latest ${a.bps[0].sys}/${a.bps[0].dia}` : "No readings yet", "myhealth:heart", chOf("Blood pressure")),
    area("metabolic", "Metabolic", "drop", metab.length ? (metab.some((l) => l.collectedAt && l.collectedAt.getTime() > Date.now() - 365 * 864e5) ? "known" : "partial") : "missing", metab.length ? `${metab[0].name} ${metab[0].valueText ?? metab[0].value ?? ""} ${metab[0].unit ?? ""}`.trim() : "No glucose or HbA1c results", "records:labs"),
    area("labs", "Labs", "flask", labsRecent.length ? "known" : a.labs.length ? "partial" : "missing", a.labs.length ? `${new Set(a.labs.map((l) => l.code)).size} tests on record` : "No lab results yet", "records:labs", chOf("Labs")),
    area("activity", "Activity", "run", has("steps", 14) ? "known" : has("steps", 365) ? "partial" : "missing", has("steps", 30) ? `${last("steps")} latest day` : "No activity data", "trend:steps", chOf("Activity")),
    area("sleep", "Sleep", "moon", has("sleep", 14) ? "known" : has("sleep", 365) ? "partial" : "missing", has("sleep", 30) ? `${last("sleep")} last night` : "No sleep data", "trend:sleep", chOf("Sleep")),
    area("nutrition", "Nutrition", "apple", a.meals.some((m) => m.day > addDays(a.today, -7)) ? "known" : a.meals.length || a.profile.diet ? "partial" : "missing", a.meals.length ? `${a.meals.filter((m) => m.day > addDays(a.today, -7)).length} meals this week` : a.profile.diet ? String(a.profile.diet) : "No meals logged", "food", chOf("Nutrition")),
    area("body", "Body", "scale", has("weight", 90) || a.profile.weightKg ? "known" : "missing", has("weight", 365) ? `Weight ${last("weight")}` : a.profile.weightKg ? `Weight ${a.profile.weightKg} kg` : "No weight on record", "myhealth:profile", chOf("Body")),
    area("meds", "Medications", "pill", meds.length ? "known" : "missing", meds.length ? `${meds.length} on your list` : "None listed", "myhealth:profile"),
    area("family", "Family history", "users", fam.length ? "known" : "missing", fam.length ? `${fam.length} noted` : "Not added", "myhealth:profile"),
    area("imaging", "Imaging", "scan", imaging.length ? "known" : "missing", imaging.length ? `${imaging.length} report${imaging.length > 1 ? "s" : ""}` : "No imaging reports", "records"),
    area("lifestyle", "Lifestyle", "leaf", a.logs.length >= 5 ? "known" : a.logs.length || a.profile.exerciseDays != null ? "partial" : "missing", a.logs.length ? `${a.logs.length} check-ins this month` : "No check-ins yet", "myhealth:lifestyle"),
  ];
}

export async function getSpace(p: P) {
  const a = await loadAll(p);
  const ch = changes(a);
  const areas = map(a, ch);
  const sources = new Set<string>();
  a.readings.forEach((r) => sources.add(PROVIDER_NAMES[r.source] || r.source));
  a.labs.forEach((l) => sources.add(LAB_SOURCE(l.source)));
  a.docs.forEach((d) => sources.add(d.provider || "Uploaded documents"));
  if (a.meals.length) sources.add("Your food log");
  if (a.bps.length) sources.add("Home blood pressure");
  return {
    changes: ch, gaps: gaps(a), areas,
    known: areas.filter((x) => x.state === "known").length,
    counts: { docs: a.docs.length, labs: a.labs.length, meals: a.meals.length, sources: sources.size },
    sources: [...sources].filter((s) => s && s !== "manual"),
  };
}

// ── Doctor Assessment ──────────────────────────────────────────────────────
export const ASSESS_SECTIONS = ["overview", "activity", "labs", "history", "medications", "nutrition", "trends", "goals", "questions", "sources"] as const;

export async function getAssessment(p: P, days: number) {
  const a = await loadAll(p, days);
  const from = addDays(a.today, -days), fromMs = Date.now() - days * 864e5;
  const avgOf = (k: MetricKey) => { const v = a.readings.filter((r) => r.metric === k && r.day > from).map((r) => r.value); return v.length ? { avg: fmtU(k, avg(v)), days: v.length } : null; };
  const weights = a.readings.filter((r) => r.metric === "weight" && r.day > from);
  const bps = a.bps.filter((b) => b.day > from);
  const labs = (() => { const seen = new Set<string>(); return a.labs.filter((l) => { if (seen.has(l.code) || !l.collectedAt || l.collectedAt.getTime() < fromMs) return false; seen.add(l.code); return true; }); })();
  const wk = a.meals.filter((m) => m.day > from);
  const tagCount = (re: RegExp) => wk.filter((m) => re.test(m.tags)).length;
  const prof = a.profile;
  const age = p.dateOfBirth ? Math.floor((Date.now() - p.dateOfBirth.getTime()) / (365.25 * 864e5)) : null;
  const questions = await prisma.visitQuestion.findMany({ where: { patientId: p.id }, orderBy: { createdAt: "desc" }, take: 8, select: { text: true } }).catch(() => [] as { text: string }[]);
  const space = changes(a);
  return {
    generatedAt: new Date().toISOString(), days, from,
    patient: { name: `${p.firstName} ${p.lastName || ""}`.trim(), age, sex: prof.sex || null, dob: p.dateOfBirth ? p.dateOfBirth.toISOString().slice(0, 10) : null, heightCm: prof.heightCm || null, occupation: prof.occupation || null },
    activity: [
      ["Steps (daily average)", avgOf("steps")], ["Active minutes (daily)", avgOf("active")], ["Active energy (daily)", avgOf("activeEnergy")], ["Sleep (nightly average)", avgOf("sleep")],
      ["Resting heart rate", avgOf("rhr")], ["Heart rate variability", avgOf("hrv")], ["Blood oxygen", avgOf("spo2")],
      ["Home blood pressure", bps.length ? { avg: `${Math.round(avg(bps.map((b) => b.sys)))}/${Math.round(avg(bps.map((b) => b.dia)))} mmHg`, days: bps.length } : null],
      ["Weight", weights.length ? { avg: `${fmtU("weight", weights[0].value)} → ${fmtU("weight", weights[weights.length - 1].value)}`, days: weights.length } : prof.weightKg ? { avg: `${prof.weightKg} kg (self-reported)`, days: 0 } : null],
    ].filter((x) => x[1]).map(([label, v]: any) => ({ label, value: v.avg, n: v.days })),
    labs: labs.map((l) => ({ name: l.name, value: `${l.valueText ?? l.value ?? ""}`, unit: l.unit || "", ref: l.refText || (l.refLow != null || l.refHigh != null ? `${l.refLow ?? ""}–${l.refHigh ?? ""}` : ""), flag: labFlag(l), date: l.collectedAt!.toISOString().slice(0, 10), source: LAB_SOURCE(l.source) })),
    history: [
      ...a.appts.filter((x) => x.startsAt.getTime() > fromMs && x.startsAt.getTime() < Date.now()).map((x) => ({ date: x.startsAt.toISOString().slice(0, 10), text: `${x.title} with ${x.clinician}` })),
      ...a.docs.filter((d) => (d.docDate || d.createdAt).getTime() > fromMs).map((d) => ({ date: (d.docDate || d.createdAt).toISOString().slice(0, 10), text: `${d.title}${d.provider ? ` — ${d.provider}` : ""}` })),
    ].sort((x, y) => y.date.localeCompare(x.date)),
    conditions: list(prof.conditions), medications: list(prof.medications), allergies: list(prof.allergies), surgeries: list(prof.surgeries), familyHistory: list(prof.familyHistory),
    nutrition: wk.length ? { meals: wk.length, veg: tagCount(/vegetable|fruit/), protein: tagCount(/protein/), fibre: tagCount(/fibre|whole-grain/), processed: tagCount(/processed|sugary|fried/), diet: prof.diet || null } : prof.diet ? { meals: 0, veg: 0, protein: 0, fibre: 0, processed: 0, diet: prof.diet } : null,
    lifestyle: { exerciseDays: prof.exerciseDays ?? null, smoking: prof.smoking || null, alcohol: a.logs.filter((l) => l.kind === "alcohol").reduce((s, l) => s + l.value, 0), sleepQuality: prof.sleepQuality ?? null },
    changes: space.filter((c) => c.status !== "insufficient").slice(0, 8),
    goals: a.goals.map((g) => g.label),
    questions: questions.map((q) => q.text),
    documents: a.docs.map((d) => ({ id: d.id, title: d.title, kind: d.kind, provider: d.provider, date: (d.docDate || d.createdAt).toISOString().slice(0, 10), inRange: (d.docDate || d.createdAt).getTime() > fromMs, mime: d.mime })),
    sources: [...new Set([...a.readings.map((r) => PROVIDER_NAMES[r.source] || r.source), ...labs.map((l) => LAB_SOURCE(l.source)), ...a.docs.map((d) => d.provider || "Uploaded documents"), ...(wk.length ? ["Patient food log"] : []), ...(bps.length ? ["Home blood pressure monitor"] : []), ...(Object.keys(prof).length ? ["Patient-entered health profile"] : [])])].filter(Boolean),
  };
}
export type Assessment = Awaited<ReturnType<typeof getAssessment>>;

// ── Usage (what the patient looks at) — for Neyu's context ─────────────────
export async function usageSummary(patientId: string): Promise<string> {
  const ev = await prisma.activityEvent.findMany({ where: { patientId, at: { gte: new Date(Date.now() - 14 * 864e5) } }, orderBy: { at: "desc" }, take: 400, select: { kind: true, target: true, ms: true, at: true } });
  if (!ev.length) return "";
  const time = new Map<string, number>();
  ev.filter((e) => e.kind === "view").forEach((e) => time.set(e.target, (time.get(e.target) || 0) + e.ms));
  const top = [...time.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t, ms]) => `${t} ${Math.max(1, Math.round(ms / 60000))} min`);
  const clicks = ev.filter((e) => e.kind === "click").slice(0, 10).map((e) => e.target);
  return `How the patient used My Health Space (last 14 days): most time on ${top.join(", ")}${clicks.length ? `. Recent actions: ${[...new Set(clicks)].join("; ")}` : ""}.`;
}
