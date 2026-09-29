// File import, parsed in the browser so large files never leave the device:
//  • Apple Health "export.xml" (Health app → profile → Export All Health Data,
//    then unzip). Streamed line by line; only daily summaries are uploaded.
//  • CSV with a date column + any of: steps, restingHeartRate, hrv, sleepHours,
//    weight (kg or lb), glucose, systolic/diastolic or bp ("120/80"), pulse.

export interface ImportReading { metric: string; value: number | string; date: string }
export interface ImportBp { sys: number; dia: number; pulse?: number | null; takenAt: string }
export interface ImportResult { readings: ImportReading[]; bp: ImportBp[]; days: number; from: string | null; to: string | null; kinds: string[] }

type Agg = "sum" | "avg" | "last";
const HK: Record<string, { metric: string; agg: Agg; conv?: (v: number, unit: string) => number }> = {
  HKQuantityTypeIdentifierStepCount: { metric: "steps", agg: "sum" },
  HKQuantityTypeIdentifierDistanceWalkingRunning: { metric: "distance", agg: "sum", conv: (v, u) => (u === "mi" ? v * 1.609344 : u === "m" ? v / 1000 : v) },
  HKQuantityTypeIdentifierAppleExerciseTime: { metric: "active", agg: "sum" },
  HKQuantityTypeIdentifierActiveEnergyBurned: { metric: "activeEnergy", agg: "sum", conv: (v, u) => (u === "kJ" ? v / 4.184 : v) },
  HKQuantityTypeIdentifierRestingHeartRate: { metric: "rhr", agg: "avg" },
  HKQuantityTypeIdentifierHeartRateVariabilitySDNN: { metric: "hrv", agg: "avg" },
  HKQuantityTypeIdentifierOxygenSaturation: { metric: "spo2", agg: "avg", conv: (v) => (v <= 1 ? v * 100 : v) },
  HKQuantityTypeIdentifierBodyMass: { metric: "weight", agg: "last", conv: (v, u) => (u === "lb" ? v * 0.45359237 : u === "g" ? v / 1000 : v) },
  HKQuantityTypeIdentifierBloodGlucose: { metric: "glucose", agg: "avg", conv: (v, u) => (/mg/i.test(u) ? v / 18.016 : v) },
};
const ASLEEP = /HKCategoryValueSleepAnalysis(Asleep|AsleepCore|AsleepDeep|AsleepREM|AsleepUnspecified)$/;

const attr = (line: string, name: string) => { const m = line.match(new RegExp(`\\b${name}="([^"]*)"`)); return m ? m[1] : null; };
// "2026-09-28 07:45:00 -0600" → Date
const hkDate = (s: string | null) => { if (!s) return null; const m = s.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{2})(\d{2})$/); const d = new Date(m ? `${m[1]}T${m[2]}${m[3]}:${m[4]}` : s); return isNaN(d.getTime()) ? null : d; };

/** Streaming Apple Health export parser. Feed text chunks, then call finish(). */
export function appleHealthParser(sinceDay: string) {
  // metric → day → source → {sum, n, last, lastAt}
  const acc = new Map<string, Map<string, Map<string, { sum: number; n: number; last: number; lastAt: number }>>>();
  const sleep = new Map<string, Map<string, number>>(); // day(end) → source → hours
  const bpS = new Map<string, number>(), bpD = new Map<string, number>(); // startDate → value
  let rest = "";
  const add = (metric: string, day: string, src: string, v: number, at: number) => {
    if (!acc.has(metric)) acc.set(metric, new Map());
    const byDay = acc.get(metric)!;
    if (!byDay.has(day)) byDay.set(day, new Map());
    const e = byDay.get(day)!.get(src) || { sum: 0, n: 0, last: 0, lastAt: 0 };
    e.sum += v; e.n++; if (at >= e.lastAt) { e.last = v; e.lastAt = at; }
    byDay.get(day)!.set(src, e);
  };
  const line = (l: string) => {
    if (!l.includes("<Record ")) return;
    const type = attr(l, "type");
    if (!type) return;
    const start = attr(l, "startDate"), day = start ? start.slice(0, 10) : null;
    if (!day || day < sinceDay) return;
    const src = attr(l, "sourceName") || "?";
    if (type === "HKCategoryTypeIdentifierSleepAnalysis") {
      const v = attr(l, "value") || "";
      if (!ASLEEP.test(v)) return;
      const a = hkDate(start), b = hkDate(attr(l, "endDate"));
      if (!a || !b) return;
      const endDay = (attr(l, "endDate") || "").slice(0, 10);
      if (!sleep.has(endDay)) sleep.set(endDay, new Map());
      const m = sleep.get(endDay)!;
      m.set(src, (m.get(src) || 0) + (b.getTime() - a.getTime()) / 3.6e6);
      return;
    }
    if (type === "HKQuantityTypeIdentifierBloodPressureSystolic" || type === "HKQuantityTypeIdentifierBloodPressureDiastolic") {
      const v = Number(attr(l, "value"));
      if (isFinite(v) && start) (type.endsWith("Systolic") ? bpS : bpD).set(start, v);
      return;
    }
    const def = HK[type];
    if (!def) return;
    let v = Number(attr(l, "value"));
    if (!isFinite(v)) return;
    if (def.conv) v = def.conv(v, attr(l, "unit") || "");
    add(def.metric, day, src, v, hkDate(start)?.getTime() || 0);
  };
  return {
    push(chunk: string) {
      const text = rest + chunk;
      const parts = text.split("\n");
      rest = parts.pop() || "";
      parts.forEach(line);
    },
    finish(): ImportResult {
      if (rest) line(rest);
      const readings: ImportReading[] = [];
      acc.forEach((byDay, metric) => {
        const agg = Object.values(HK).find((h) => h.metric === metric)!.agg;
        byDay.forEach((bySrc, day) => {
          // Sums: take the largest single source (phone and watch both count steps).
          const vals = [...bySrc.values()];
          const v = agg === "sum" ? Math.max(...vals.map((e) => e.sum)) : agg === "avg" ? vals.reduce((a, e) => a + e.sum, 0) / vals.reduce((a, e) => a + e.n, 0) : vals.sort((a, b) => b.lastAt - a.lastAt)[0].last;
          readings.push({ metric, value: Math.round(v * 100) / 100, date: day });
        });
      });
      sleep.forEach((bySrc, day) => { const h = Math.max(...bySrc.values()); if (h > 0.5 && h < 20) readings.push({ metric: "sleep", value: Math.round(h * 100) / 100, date: day }); });
      const bp: ImportBp[] = [];
      bpS.forEach((s, at) => { const d = bpD.get(at); const t = hkDate(at); if (d && t) bp.push({ sys: Math.round(s), dia: Math.round(d), takenAt: t.toISOString() }); });
      return summarize(readings, bp);
    },
  };
}

function summarize(readings: ImportReading[], bp: ImportBp[]): ImportResult {
  const days = [...new Set([...readings.map((r) => r.date), ...bp.map((b) => b.takenAt.slice(0, 10))])].sort();
  return { readings, bp, days: days.length, from: days[0] || null, to: days[days.length - 1] || null, kinds: [...new Set([...readings.map((r) => r.metric), ...(bp.length ? ["bp"] : [])])] };
}

// ── CSV ─────────────────────────────────────────────────────────────────
const COLS: Record<string, string> = {
  steps: "steps", stepcount: "steps", restingheartrate: "rhr", rhr: "rhr", restinghr: "rhr", hrv: "hrv", heartratevariability: "hrv",
  sleep: "sleep", sleephours: "sleep", sleepduration: "sleep", sleepminutes: "sleepminutes", weight: "weight", weightkg: "weight", weightlb: "weightlb", weightlbs: "weightlb",
  glucose: "glucose", bloodglucose: "glucose", glucosemgdl: "glucosemg", activeminutes: "active", exerciseminutes: "active", distance: "distance", distancekm: "distance", spo2: "spo2", bloodoxygen: "spo2",
  bp: "bp", bloodpressure: "bp", systolic: "sys", sys: "sys", diastolic: "dia", dia: "dia", pulse: "pulse", heartrate: "pulse", time: "time",
};

function splitCsv(line: string, sep: string): string[] {
  const out: string[] = []; let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
    else if (c === sep && !q) { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

const toDay = (s: string) => {
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/); // MM/DD/YYYY (North America)
  if (m) return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

export function parseCsv(text: string): ImportResult {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error("The file needs a header row and at least one row of data.");
  const sep = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ";" : lines[0].includes("\t") ? "\t" : ",";
  // "Weight (lb)" → "weightlb" (unit kept); fall back to the name without the unit.
  const raw = splitCsv(lines[0], sep).map((h) => h.toLowerCase());
  const full = raw.map((h) => h.replace(/[^a-z0-9]/g, "")), bare = raw.map((h) => h.replace(/\(.*?\)|[^a-z0-9]/g, ""));
  const dateIdx = bare.findIndex((h) => ["date", "day", "datetime", "timestamp"].includes(h));
  if (dateIdx < 0) throw new Error("Add a column called “date” (for example 2026-09-28).");
  const map = full.map((h, i) => COLS[h] || COLS[bare[i]] || null);
  if (!map.some(Boolean)) throw new Error("No known columns. Use names like steps, weight, sleepHours, restingHeartRate, systolic, diastolic.");
  const readings: ImportReading[] = [], bp: ImportBp[] = [];
  for (const l of lines.slice(1, 20001)) {
    const cells = splitCsv(l, sep), raw = cells[dateIdx] || "", day = toDay(raw);
    if (!day) continue;
    let sys: number | null = null, dia: number | null = null, pulse: number | null = null, time = "";
    map.forEach((m, i) => {
      if (!m || i === dateIdx) return;
      const v = (cells[i] || "").trim();
      if (!v) return;
      const n = Number(v.replace(/,/g, "."));
      if (m === "bp") { const x = v.match(/(\d{2,3})\s*\/\s*(\d{2,3})/); if (x) { sys = Number(x[1]); dia = Number(x[2]); } return; }
      if (m === "sys") { sys = n; return; }
      if (m === "dia") { dia = n; return; }
      if (m === "pulse") { pulse = n; return; }
      if (m === "time") { time = v; return; }
      if (!isFinite(n)) return;
      if (m === "weightlb") return readings.push({ metric: "weight", value: `${n} lb`, date: day });
      if (m === "glucosemg") return readings.push({ metric: "glucose", value: `${n} mg/dL`, date: day });
      if (m === "sleepminutes") return readings.push({ metric: "sleep", value: n / 60, date: day });
      readings.push({ metric: m, value: n, date: day });
    });
    if (sys && dia) {
      const t = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(raw) ? new Date(raw.replace(" ", "T")) : new Date(`${day}T${/^\d{1,2}:\d{2}/.test(time) ? time.padStart(5, "0") : "08:00"}:00`);
      if (!isNaN(t.getTime())) bp.push({ sys, dia, pulse, takenAt: t.toISOString() });
    }
  }
  if (!readings.length && !bp.length) throw new Error("We couldn't read any values from this file.");
  return summarize(readings, bp);
}
