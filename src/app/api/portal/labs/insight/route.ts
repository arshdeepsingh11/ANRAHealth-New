// GET /api/portal/labs/insight?code= — a lab test alongside wearable data
// (monthly averages around each result) + when it's due to be retested.
import { prisma } from "@backend/db";
import { avg, fmt } from "@/lib/portal/metrics";
import { getConsent, readingSourceFilter } from "@backend/patientData";
import { retestFor, getRetests } from "@backend/labs";
import { withPatient, HttpError } from "@backend/apiHelpers";

const PAIR: [RegExp, string[]][] = [
  [/ldl|hdl|chol|trig|lipid|apob/i, ["steps", "active", "weight"]],
  [/hba1c|a1c|glucose/i, ["steps", "sleep", "weight"]],
  [/crp/i, ["sleep", "hrv", "rhr"]],
  [/vit(amin)?-?d/i, ["steps", "active"]],
];
const NAMES: Record<string, string> = { steps: "Steps / day", active: "Active min / day", weight: "Weight (kg)", sleep: "Sleep / night", hrv: "HRV (ms)", rhr: "Resting HR (bpm)" };

export const GET = (req: Request) => withPatient(async ({ patient }) => {
  const code = (new URL(req.url).searchParams.get("code") || "").slice(0, 60);
  if (!code) return { retests: await getRetests(patient, 30) };
  const c = await getConsent(patient.id);
  if (!c.labs) throw new HttpError(403, "Lab sharing is off in Privacy & Data.");
  const labs = await prisma.labResult.findMany({ where: { patientId: patient.id, code, status: "final", collectedAt: { not: null } }, orderBy: { collectedAt: "asc" }, select: { name: true, value: true, valueText: true, unit: true, refLow: true, refHigh: true, collectedAt: true } });
  if (!labs.length) return { retest: null, metrics: [], rows: [] };
  const last = labs[labs.length - 1];
  const metrics = (PAIR.find(([re]) => re.test(code + " " + last.name))?.[1] || ["steps", "sleep", "rhr"]);
  const rows = [];
  for (const l of labs.slice(-6)) {
    const at = l.collectedAt!, from = new Date(at.getTime() - 30 * 86400000).toISOString().slice(0, 10), to = at.toISOString().slice(0, 10);
    const rs = await prisma.healthReading.findMany({ where: { patientId: patient.id, metric: { in: metrics }, day: { gte: from, lte: to }, ...readingSourceFilter(c) }, select: { metric: true, value: true } });
    rows.push({ date: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: patient.timezone }).format(at), value: `${l.valueText ?? l.value ?? "—"} ${l.unit || ""}`.trim(),
      cells: metrics.map((m) => { const v = rs.filter((r) => r.metric === m).map((r) => r.value); return v.length ? fmt(m, avg(v)) : "—"; }) });
  }
  return { retest: retestFor(code, last.name, last.value, last.refLow, last.refHigh, last.collectedAt, patient.timezone), metrics: metrics.map((m) => NAMES[m] || m), rows: rows.reverse() };
});
