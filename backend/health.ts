// Health Universe — writes and small read models shared by routes, the
// daily sync and the brief: readings, home blood pressure, lifestyle
// check-ins and the reward points ledger.

import { prisma } from "@backend/db";
import { avg, dayKey, addDays, daysBetween, type MetricKey } from "@/lib/portal/metrics";
import { REWARD_POINTS } from "@/lib/portal/universe";
import type { ParsedReading } from "@backend/wearables";

type P = { id: string; timezone: string };

/** Upsert daily readings for one source (idempotent: same day overwrites). */
export async function storeReadings(patientId: string, source: string, readings: ParsedReading[]) {
  for (let i = 0; i < readings.length; i += 200) {
    await prisma.$transaction(readings.slice(i, i + 200).map((r) => prisma.healthReading.upsert({
      where: { patientId_metric_day_source: { patientId, metric: r.metric, day: r.day, source } },
      create: { patientId, metric: r.metric, day: r.day, source, value: r.value, valueText: r.valueText, recordedAt: r.recordedAt },
      update: { value: r.value, valueText: r.valueText, recordedAt: r.recordedAt },
    })));
  }
  return readings.length;
}

// ── Home blood pressure ─────────────────────────────────────────────────
export interface BpIn { sys: number; dia: number; pulse?: number | null; takenAt: Date; note?: string | null }

export function validBp(b: { sys: unknown; dia: unknown; pulse?: unknown }): string | null {
  const sys = Number(b.sys), dia = Number(b.dia), pulse = b.pulse == null || b.pulse === "" ? null : Number(b.pulse);
  if (!Number.isInteger(sys) || sys < 60 || sys > 260) return "Top number (systolic) should be between 60 and 260.";
  if (!Number.isInteger(dia) || dia < 30 || dia > 180) return "Bottom number (diastolic) should be between 30 and 180.";
  if (dia >= sys) return "The top number is usually higher than the bottom number — please check.";
  if (pulse != null && (!Number.isInteger(pulse) || pulse < 25 || pulse > 220)) return "Pulse should be between 25 and 220.";
  return null;
}

/** Store BP readings, then refresh the daily-average "bp" reading for the touched days. */
export async function storeBp(p: P, source: string, list: BpIn[]) {
  const days = new Set<string>();
  for (const b of list) {
    const day = dayKey(b.takenAt, p.timezone);
    days.add(day);
    await prisma.bpReading.upsert({
      where: { patientId_takenAt_source: { patientId: p.id, takenAt: b.takenAt, source } },
      create: { patientId: p.id, sys: b.sys, dia: b.dia, pulse: b.pulse ?? null, takenAt: b.takenAt, day, source, note: b.note ?? null },
      update: { sys: b.sys, dia: b.dia, pulse: b.pulse ?? null, note: b.note ?? null },
    });
  }
  await refreshBpDays(p.id, source, [...days]);
  return list.length;
}

export async function refreshBpDays(patientId: string, source: string, days: string[]) {
  for (const day of days) {
    const rows = await prisma.bpReading.findMany({ where: { patientId, day, source }, select: { sys: true, dia: true, takenAt: true } });
    if (!rows.length) { await prisma.healthReading.deleteMany({ where: { patientId, metric: "bp", day, source } }); continue; }
    const sys = Math.round(avg(rows.map((r) => r.sys))), dia = Math.round(avg(rows.map((r) => r.dia)));
    const at = rows.reduce((a, r) => (r.takenAt > a ? r.takenAt : a), rows[0].takenAt);
    await prisma.healthReading.upsert({
      where: { patientId_metric_day_source: { patientId, metric: "bp", day, source } },
      create: { patientId, metric: "bp", day, source, value: sys, valueText: `${sys}/${dia}`, recordedAt: at },
      update: { value: sys, valueText: `${sys}/${dia}`, recordedAt: at },
    });
  }
}

// ── Lifestyle ───────────────────────────────────────────────────────────
export const LIFESTYLE_KINDS = ["water", "caffeine", "alcohol", "mood", "stress", "meal"] as const;
export type LifestyleKind = (typeof LIFESTYLE_KINDS)[number];

// ── Rewards ─────────────────────────────────────────────────────────────
/** Award points once per kind per day. Returns points added (0 if already awarded). */
export async function award(patientId: string, kind: string, day: string, note?: string): Promise<number> {
  const points = REWARD_POINTS[kind];
  if (!points) return 0;
  try {
    await prisma.rewardEvent.create({ data: { patientId, kind, day, points, note } });
    return points;
  } catch { return 0; } // unique (patientId, kind, day) — already awarded
}

export async function balance(patientId: string) {
  const r = await prisma.rewardEvent.aggregate({ where: { patientId }, _sum: { points: true } });
  return r._sum.points || 0;
}

/** Days in a row (ending today or yesterday) with at least one lifestyle check-in. */
export async function checkinStreak(p: P): Promise<number> {
  const today = dayKey(new Date(), p.timezone);
  const rows = await prisma.lifestyleLog.findMany({ where: { patientId: p.id, day: { gte: addDays(today, -120) } }, select: { day: true }, distinct: ["day"], orderBy: { day: "desc" } });
  const days = new Set(rows.map((r) => r.day));
  let d = days.has(today) ? today : addDays(today, -1), n = 0;
  while (days.has(d)) { n++; d = addDays(d, -1); }
  return n;
}

/**
 * Look at today's data and award anything earned. Cheap and idempotent —
 * called after check-ins, BP entries, protocol changes and when the brief loads.
 */
export async function evaluateRewards(p: P): Promise<number> {
  const today = dayKey(new Date(), p.timezone);
  let added = 0;
  const [logs, items, done, bp, steps] = await Promise.all([
    prisma.lifestyleLog.count({ where: { patientId: p.id, day: today } }),
    prisma.protocolItem.count({ where: { patientId: p.id, active: true, pausedAt: null } }),
    prisma.protocolLog.count({ where: { patientId: p.id, day: today } }),
    prisma.bpReading.findMany({ where: { patientId: p.id, day: today }, select: { takenAt: true } }),
    prisma.healthReading.findMany({ where: { patientId: p.id, metric: "steps", day: { gte: addDays(today, -30) } }, select: { day: true, value: true } }),
  ]);
  if (logs > 0) added += await award(p.id, "checkin", today);
  if (items > 0 && done >= items) added += await award(p.id, "protocol", today);
  const hours = bp.map((b) => Number(new Intl.DateTimeFormat("en-GB", { timeZone: p.timezone, hour: "2-digit", hour12: false }).format(b.takenAt)) % 24);
  if (hours.some((h) => h < 12) && hours.some((h) => h >= 17)) added += await award(p.id, "bp", today);
  const todaySteps = Math.max(0, ...steps.filter((s) => s.day === today).map((s) => s.value));
  const usual = avg(steps.filter((s) => s.day !== today).map((s) => s.value));
  if (todaySteps > 0 && !isNaN(usual) && todaySteps > usual * 1.1) added += await award(p.id, "steps", today);
  const streak = await checkinStreak(p);
  if (streak > 0 && streak % 7 === 0) added += await award(p.id, "streak7", today);
  return added;
}

/** Latest value of a metric (any allowed source), within `days`. */
export async function latestMetric(patientId: string, metric: MetricKey, today: string, days = 2) {
  const r = await prisma.healthReading.findFirst({ where: { patientId, metric, day: { gte: addDays(today, -days) } }, orderBy: [{ day: "desc" }], select: { day: true, value: true, valueText: true } });
  return r && daysBetween(r.day, today) <= days ? r : null;
}
