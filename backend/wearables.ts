// Wearable ingest — turns a device payload into validated daily readings.
//
// Accepts two shapes (both JSON):
//  1) Structured:  { "readings": [ { "metric": "rhr", "value": 72, "date": "2026-09-28" }, … ] }
//  2) Shortcuts-friendly flat object (Apple Health "Find Health Samples" →
//     "Get Contents of URL"): { "date": "2026-09-28", "restingHeartRate": 72,
//     "heartRateVariability": 48, "sleepHours": 7.7, "steps": 6842, … }
// Values may arrive as strings with units ("72 count/min") — the number is
// extracted. Anything outside METRIC_DEFS bounds is rejected, not clamped.

import { METRIC_DEFS, isMetricKey, dayKey, type MetricKey } from "@/lib/portal/metrics";

export interface ParsedReading { metric: MetricKey; day: string; value: number; valueText: string | null; recordedAt: Date }
export interface ParseResult { readings: ParsedReading[]; rejected: { field: string; reason: string }[] }

const ALIASES: Record<string, MetricKey> = {
  rhr: "rhr", restingheartrate: "rhr", resting_heart_rate: "rhr",
  hrv: "hrv", heartratevariability: "hrv", heart_rate_variability: "hrv",
  spo2: "spo2", oxygensaturation: "spo2", bloodoxygen: "spo2",
  sleep: "sleep", sleephours: "sleep", sleepduration: "sleep", sleepminutes: "sleep",
  sleepvar: "sleepVar", sleepconsistency: "sleepVar",
  bedtime: "bedtime", sleepstart: "bedtime",
  timeinbed: "timeInBed", timeinbedhours: "timeInBed", timeinbedminutes: "timeInBed",
  steps: "steps", stepcount: "steps",
  active: "active", activeminutes: "active", exerciseminutes: "active", exercisetime: "active",
  workouts: "workouts", workoutcount: "workouts",
  activeenergy: "activeEnergy", activecalories: "activeEnergy", activeenergyburned: "activeEnergy",
  bp: "bp", bloodpressure: "bp",
  ecg: "ecg", ecgclassification: "ecg",
  weight: "weight", bodymass: "weight", weightkg: "weight", weightlb: "weight", weightlbs: "weight",
  glucose: "glucose", bloodglucose: "glucose", bloodsugar: "glucose",
  distance: "distance", walkingdistance: "distance", distancewalkingrunning: "distance", distancekm: "distance",
};

const num = (v: unknown): number | null => {
  if (typeof v === "number" && isFinite(v)) return v;
  if (typeof v === "string") { const m = v.replace(/,/g, "").match(/-?\d+(\.\d+)?/); return m ? Number(m[0]) : null; }
  return null;
};

function toDay(v: unknown, tz: string): string | null {
  if (typeof v !== "string" || !v.trim()) return null;
  const s = v.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : dayKey(d, tz);
}

/** "23:15", "11:15 PM" or an ISO timestamp → minutes after midnight (local). */
function toMinutes(v: unknown, tz: string): number | null {
  if (typeof v === "number") return v >= 0 && v < 1440 ? v : null;
  if (typeof v !== "string") return null;
  const t = v.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (t) {
    let h = Number(t[1]);
    const ap = t[3]?.toLowerCase();
    if (ap) h = (h % 12) + (ap === "pm" ? 12 : 0);
    if (h > 23 || Number(t[2]) > 59) return null;
    return h * 60 + Number(t[2]);
  }
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  const [hh, mm] = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(d).split(":").map(Number);
  return hh * 60 + mm;
}

function normalise(metric: MetricKey, field: string, raw: unknown, tz: string): { value: number; valueText: string | null } | string {
  const f = field.toLowerCase();
  if (metric === "bp") {
    const m = String(raw).match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
    if (!m) return "expected systolic/diastolic, e.g. 118/76";
    const sys = Number(m[1]), dia = Number(m[2]);
    if (sys < 60 || sys > 260 || dia < 30 || dia > 180) return "out of range";
    return { value: sys, valueText: `${sys}/${dia}` };
  }
  if (metric === "ecg") {
    const text = String(raw).trim().slice(0, 60);
    if (!text) return "empty";
    return { value: 1, valueText: text.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()) };
  }
  if (metric === "bedtime") {
    const m = toMinutes(raw, tz);
    return m == null ? "expected a time like 23:15" : { value: m, valueText: null };
  }
  let v = num(raw);
  if (v == null) return "not a number";
  if ((metric === "sleep" || metric === "timeInBed") && (f.includes("minute") || v > 24)) v = v / 60;
  if (metric === "spo2" && v <= 1) v = v * 100;
  if (metric === "weight" && (/lb|pound/.test(f) || /lb/i.test(String(raw)))) v = v * 0.45359237;
  if (metric === "glucose" && (v > 35 || /mg/i.test(String(raw)) || f.includes("mg"))) v = v / 18.016;
  if (metric === "distance" && (f.includes("meter") || f.endsWith("m") && !f.endsWith("km") || v > 300)) v = v / 1000;
  const def = METRIC_DEFS[metric];
  if (v < def.min || v > def.max) return `out of range (${def.min}–${def.max})`;
  return { value: Math.round(v * 100) / 100, valueText: null };
}

// Totals across a day are summed when Shortcuts sends a list of samples
// (e.g. several step samples); for everything else the latest value wins.
const SUM = new Set<MetricKey>(["steps", "active", "activeEnergy", "distance", "workouts", "sleep", "timeInBed"]);

/** Shortcuts sends a Health Samples variable as an array, or as text with one
 *  sample per line. Collapse it to one value (sum or latest), keeping the unit. */
export function collapse(metric: MetricKey, raw: unknown): unknown | undefined {
  const isList = Array.isArray(raw) || (typeof raw === "string" && /\r?\n/.test(raw.trim()));
  if (!isList) return raw;
  const items = (Array.isArray(raw) ? raw : (raw as string).split(/\r?\n/)).filter((x) => x !== null && x !== undefined && String(x).trim() !== "");
  if (!items.length) return undefined; // no samples yet today — not an error
  if (!SUM.has(metric)) return items[items.length - 1];
  const nums = items.map(num).filter((n): n is number => n != null);
  if (!nums.length) return items[0];
  const unit = String(items[0]).replace(/^[\s\d.,-]+/, "").trim();
  return `${Math.round(nums.reduce((a, b) => a + b, 0) * 100) / 100}${unit ? " " + unit : ""}`;
}

export function parseIngest(body: any, tz: string, now = new Date()): ParseResult {
  const readings: ParsedReading[] = [], rejected: ParseResult["rejected"] = [];
  const fallbackDay = toDay(body?.date ?? body?.day, tz) || dayKey(now, tz);
  const recordedAt = (() => { const d = body?.recordedAt ? new Date(body.recordedAt) : now; return isNaN(d.getTime()) || d > new Date(now.getTime() + 5 * 60000) ? now : d; })();

  const push = (field: string, metricRaw: string, raw: unknown, dayRaw: unknown, atRaw: unknown) => {
    const key = metricRaw.replace(/[^a-z0-9_]/gi, "").toLowerCase();
    const metric = isMetricKey(metricRaw) ? (metricRaw as MetricKey) : ALIASES[key];
    if (!metric) return rejected.push({ field, reason: "unknown metric" });
    if (raw === null || raw === undefined || raw === "") return; // Shortcuts sends blanks for missing samples
    const one = collapse(metric, raw);
    if (one === undefined || one === "") return;
    const n = normalise(metric, field, one, tz);
    if (typeof n === "string") return rejected.push({ field, reason: n });
    const day = toDay(dayRaw, tz) || fallbackDay;
    const at = atRaw ? new Date(String(atRaw)) : recordedAt;
    readings.push({ metric, day, ...n, recordedAt: isNaN(at.getTime()) ? recordedAt : at });
  };

  if (Array.isArray(body?.readings)) {
    body.readings.slice(0, 5000).forEach((r: any, i: number) => {
      if (!r || typeof r !== "object" || typeof r.metric !== "string") return rejected.push({ field: `readings[${i}]`, reason: "missing metric" });
      push(`readings[${i}]`, r.metric, r.value ?? r.valueText, r.date ?? r.day, r.recordedAt);
    });
  } else if (body && typeof body === "object") {
    for (const [k, v] of Object.entries(body)) {
      if (["date", "day", "recordedAt", "device", "source"].includes(k)) continue;
      push(k, k, v, null, null);
    }
  }

  // Last write wins within one payload.
  const dedup = new Map<string, ParsedReading>();
  readings.forEach((r) => dedup.set(`${r.metric}|${r.day}`, r));
  return { readings: [...dedup.values()], rejected };
}
