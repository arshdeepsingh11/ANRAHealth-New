// Health metric definitions shared by the server (ingest validation, Today
// insights) and the client (charts, formatting). Copy is from the approved
// My Health Space prototype.

export type MetricKey = "rhr" | "hrv" | "spo2" | "sleep" | "sleepVar" | "steps" | "active" | "bedtime" | "timeInBed" | "workouts" | "activeEnergy" | "bp" | "ecg";

export interface MetricDef {
  name: string;
  short: string;
  unit: string;
  cat: "Heart" | "Recovery" | "Activity";
  what: string;
  why: string;
  min: number; // ingest validation bounds
  max: number;
  chart: boolean; // shown as a Trends card
}

export const METRIC_DEFS: Record<MetricKey, MetricDef> = {
  rhr: { name: "Resting heart rate", short: "resting heart rate", unit: "bpm", cat: "Heart", min: 25, max: 200, chart: true,
    what: "Your heart rate while fully at rest, usually measured overnight or in quiet moments by your watch.",
    why: "Over weeks, resting heart rate reflects fitness, recovery, sleep and stress. Sustained changes are worth noticing and discussing with your care team." },
  hrv: { name: "Heart rate variability", short: "HRV", unit: "ms", cat: "Heart", min: 1, max: 400, chart: true,
    what: "The small variation in time between heartbeats. Higher values generally mean your nervous system is in a more relaxed, recovered state.",
    why: "HRV is very personal, so your own trend matters more than comparing with others. It can respond to sleep, training, alcohol and illness." },
  spo2: { name: "Blood oxygen", short: "blood oxygen", unit: "%", cat: "Heart", min: 50, max: 100, chart: true,
    what: "An estimate of how much oxygen your blood is carrying, measured through the skin by your watch.",
    why: "Readings usually sit in a narrow range. Wrist readings are less precise than clinical tests, so persistent low values should be checked by a clinician." },
  sleep: { name: "Sleep duration", short: "sleep", unit: "", cat: "Recovery", min: 0, max: 24, chart: true,
    what: "Total time asleep each night, estimated from movement and heart rate.",
    why: "Consistent sleep supports recovery, mood and metabolic health. A few short nights are common; a longer run is worth attention." },
  sleepVar: { name: "Sleep consistency", short: "sleep consistency", unit: "min", cat: "Recovery", min: 0, max: 600, chart: true,
    what: "How much your bedtime varies from night to night. Lower numbers mean a more regular schedule.",
    why: "A regular sleep schedule is linked with better sleep quality and daytime energy." },
  steps: { name: "Steps", short: "steps", unit: "steps", cat: "Activity", min: 0, max: 150000, chart: true,
    what: "Daily steps counted by your watch.",
    why: "Everyday movement adds up. Your own baseline is a better guide than a fixed target." },
  active: { name: "Active minutes", short: "active minutes", unit: "min", cat: "Activity", min: 0, max: 1440, chart: true,
    what: "Minutes spent at a brisk or harder effort each day.",
    why: "Regular moderate activity supports heart and metabolic health." },
  // Supporting metrics (rows / derived values, not cards)
  bedtime: { name: "Bedtime", short: "bedtime", unit: "min", cat: "Recovery", min: 0, max: 1440, chart: false, what: "", why: "" },
  timeInBed: { name: "Time in bed", short: "time in bed", unit: "h", cat: "Recovery", min: 0, max: 24, chart: false, what: "", why: "" },
  workouts: { name: "Workouts", short: "workouts", unit: "", cat: "Activity", min: 0, max: 50, chart: false, what: "", why: "" },
  activeEnergy: { name: "Active energy", short: "active energy", unit: "kcal", cat: "Activity", min: 0, max: 20000, chart: false, what: "", why: "" },
  bp: { name: "Blood pressure", short: "blood pressure", unit: "mmHg", cat: "Heart", min: 40, max: 300, chart: false, what: "", why: "" },
  ecg: { name: "ECG", short: "ECG", unit: "", cat: "Heart", min: 0, max: 1, chart: false, what: "", why: "" },
};

export const METRIC_KEYS = Object.keys(METRIC_DEFS) as MetricKey[];
export const isMetricKey = (k: string): k is MetricKey => k in METRIC_DEFS;

// Trend categories (design): cards per category.
export const TREND_CATS: Record<"heart" | "recovery" | "activity", MetricKey[]> = {
  heart: ["rhr", "hrv", "spo2"],
  recovery: ["sleep", "sleepVar", "hrv", "rhr"],
  activity: ["steps", "active"],
};

// Display formatting (design `fmt` / `fmtU`).
export function fmt(k: string, v: number | null | undefined): string {
  if (v == null || isNaN(v)) return "—";
  if (k === "sleep" || k === "timeInBed") {
    const h = Math.floor(v), m = Math.round((v - h) * 60);
    return m === 60 ? `${h + 1}h 0m` : `${h}h ${m}m`;
  }
  if (k === "steps") return Math.round(v).toLocaleString("en-US");
  if (k === "sleepVar") return "±" + Math.round(v);
  if (Math.abs(v) < 10 && v % 1 !== 0) return v.toFixed(1);
  return String(Math.round(v));
}

export function fmtU(k: string, v: number | null | undefined): string {
  const s = fmt(k, v);
  if (k === "spo2") return s + "%";
  const u = (METRIC_DEFS as Record<string, MetricDef>)[k]?.unit;
  return u && k !== "sleep" ? `${s} ${u}` : s;
}

export const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);

// ── Day keys (YYYY-MM-DD in the patient's timezone) ─────────────────────
export function dayKey(d: Date, timeZone: string): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  const [y1, m1, d1] = a.split("-").map(Number), [y2, m2, d2] = b.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fmtDay = (day: string) => { const [, m, d] = day.split("-").map(Number); return `${MON[m - 1]} ${d}`; };
export const MONTHS = MON;
