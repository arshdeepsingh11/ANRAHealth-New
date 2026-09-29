// Read models for the Health Universe screens: Heart (home BP), Lifestyle
// (check-ins + sleep coaching), Rewards.

import { prisma } from "@backend/db";
import { avg, fmt, dayKey, addDays, daysBetween } from "@/lib/portal/metrics";
import { bpLevel, bpUrgent, BP_TEXT, REWARD_RULES, REWARD_TIERS, type BpLevel } from "@/lib/portal/universe";
import type { HeartDTO, LifestyleDTO, LifestyleDayDTO, RewardsDTO } from "@/lib/portal/types";
import { getConsent, readingSourceFilter } from "@backend/patientData";
import { oauthConfigured } from "@backend/oauth";
import { balance, checkinStreak } from "@backend/health";

type P = { id: string; firstName: string; timezone: string };
const hm = (h: number) => { const t = Math.round(h * 60); return `${Math.floor(t / 60)}h ${t % 60}m`; };
const clock = (min: number) => { const m = ((Math.round(min) % 1440) + 1440) % 1440, h = Math.floor(m / 60); return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };

// ── Heart ───────────────────────────────────────────────────────────────
export async function getHeart(p: P): Promise<HeartDTO> {
  const tz = p.timezone, today = dayKey(new Date(), tz), c = await getConsent(p.id);
  const [rows, hr, appt, withings] = await Promise.all([
    prisma.bpReading.findMany({ where: { patientId: p.id, day: { gte: addDays(today, -90) }, ...(c.wearables ? {} : { source: { in: ["manual", "import"] } }) }, orderBy: { takenAt: "desc" }, select: { id: true, sys: true, dia: true, pulse: true, takenAt: true, source: true, note: true, day: true } }),
    prisma.healthReading.findMany({ where: { patientId: p.id, metric: { in: ["rhr", "hrv"] }, day: { gte: addDays(today, -30) }, ...readingSourceFilter(c) }, select: { metric: true, day: true, value: true } }),
    c.records ? prisma.appointment.findFirst({ where: { patientId: p.id, status: "scheduled", startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, select: { startsAt: true, clinician: true } }) : Promise.resolve(null),
    prisma.deviceConnection.findFirst({ where: { patientId: p.id, provider: "withings", status: "connected" }, select: { id: true } }),
  ]);
  const within = (n: number) => rows.filter((r) => daysBetween(r.day, today) < n);
  const agg = (xs: typeof rows) => (xs.length ? { sys: Math.round(avg(xs.map((x) => x.sys))), dia: Math.round(avg(xs.map((x) => x.dia))), n: xs.length } : null);
  const avg7 = agg(within(7)), avg30 = agg(within(30));
  const recentUrgent = rows.find((r) => bpUrgent(r.sys, r.dia) && daysBetween(r.day, today) <= 1);
  const base = avg7 || avg30;
  const level: BpLevel = recentUrgent ? "urgent" : base ? bpLevel(base.sys, base.dia) : "none";

  const byDay = new Map<string, { s: number[]; d: number[] }>();
  rows.forEach((r) => { const e = byDay.get(r.day) || { s: [], d: [] }; e.s.push(r.sys); e.d.push(r.dia); byDay.set(r.day, e); });
  const daily = [...byDay.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([day, e]) => ({ day, sys: Math.round(avg(e.s)), dia: Math.round(avg(e.d)) }));

  // Visit readiness: Hypertension Canada suggests 7 days × (2 morning + 2 evening).
  let readiness: HeartDTO["readiness"] = null;
  if (appt) {
    const d = daysBetween(today, dayKey(appt.startsAt, tz));
    if (d <= 14) {
      const have = within(7).length, want = 28;
      readiness = { have, want, text: have >= want ? `Great — a full week of readings is ready for ${appt.clinician}.` : `Your visit is ${d <= 0 ? "today" : d === 1 ? "tomorrow" : `in ${d} days`}. Aim for 2 readings each morning and evening for the 7 days before it (${have} of ${want} so far).` };
    }
  }
  const series = (m: string) => hr.filter((x) => x.metric === m).sort((a, b) => (a.day < b.day ? -1 : 1));
  const rs = series("rhr"), hs = series("hrv");
  const rhr = rs.length ? (() => { const last = rs[rs.length - 1], a = avg(rs.map((x) => x.value)); return { value: `${Math.round(last.value)} bpm`, note: `30-day average ${Math.round(a)} bpm` }; })() : null;
  const hrv = hs.length ? (() => { const last = hs[hs.length - 1], a = avg(hs.map((x) => x.value)); return { value: `${Math.round(last.value)} ms`, note: `30-day average ${Math.round(a)} ms` }; })() : null;

  return {
    readings: rows.map((r) => ({ id: r.id, sys: r.sys, dia: r.dia, pulse: r.pulse, takenAt: r.takenAt.toISOString(), source: r.source, note: r.note })),
    avg7, avg30, status: { level, ...BP_TEXT[level] }, daily, readiness, rhr, hrv,
    withings: withings ? "on" : oauthConfigured("withings") ? "off" : "unavailable",
  };
}

// ── Lifestyle ───────────────────────────────────────────────────────────
export async function getLifestyle(p: P): Promise<LifestyleDTO> {
  const tz = p.timezone, today = dayKey(new Date(), tz), from = addDays(today, -6), c = await getConsent(p.id);
  const [logs, sleepRows, alcohol60] = await Promise.all([
    prisma.lifestyleLog.findMany({ where: { patientId: p.id, day: { gte: from } }, orderBy: { at: "asc" }, select: { id: true, kind: true, value: true, note: true, day: true, at: true } }),
    prisma.healthReading.findMany({ where: { patientId: p.id, metric: { in: ["sleep", "bedtime"] }, day: { gte: addDays(today, -60) }, ...readingSourceFilter(c) }, select: { metric: true, day: true, value: true } }),
    prisma.lifestyleLog.findMany({ where: { patientId: p.id, kind: { in: ["alcohol", "caffeine"] }, day: { gte: addDays(today, -60) } }, select: { kind: true, day: true, value: true, at: true } }),
  ]);
  const dayOf = (day: string): LifestyleDayDTO => {
    const L = logs.filter((l) => l.day === day), sum = (k: string) => L.filter((l) => l.kind === k).reduce((a, l) => a + l.value, 0);
    const last = (k: string) => { const x = L.filter((l) => l.kind === k); return x.length ? x[x.length - 1].value : null; };
    return { day, water: sum("water"), caffeine: sum("caffeine"), alcohol: sum("alcohol"), mood: last("mood"), stress: last("stress"), meals: L.filter((l) => l.kind === "meal").map((l) => ({ id: l.id, text: l.note || "", at: l.at.toISOString() })) };
  };
  const week = Array.from({ length: 7 }, (_, i) => dayOf(addDays(from, i)));
  const hour = (d: Date) => Number(new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hour12: false }).format(d)) % 24;
  const lateCaffeine = logs.some((l) => l.day === today && l.kind === "caffeine" && hour(l.at) >= 14);

  // Sleep coaching
  const sleep = new Map<string, number>(), bed = new Map<string, number>();
  sleepRows.forEach((r) => (r.metric === "sleep" ? sleep : bed).set(r.day, Math.max((r.metric === "sleep" ? sleep : bed).get(r.day) ?? -1, r.value)));
  let sleepCoach: LifestyleDTO["sleepCoach"] = null;
  const last14 = [...sleep.entries()].filter(([d]) => daysBetween(d, today) < 14).map(([, v]) => v);
  const beds = [...bed.entries()].filter(([d]) => daysBetween(d, today) < 14).map(([, v]) => (v - 1080 + 1440) % 1440); // minutes after 6 PM
  if (last14.length >= 3 || beds.length >= 3) {
    const a = avg(last14), bAvg = beds.length ? avg(beds) : NaN;
    const sd = beds.length >= 3 ? Math.sqrt(avg(beds.map((x) => (x - bAvg) ** 2))) : NaN;
    const tips: string[] = [];
    if (!isNaN(a) && a < 7) tips.push(`You're averaging ${hm(a)}. Most adults do best with 7–9 hours — try going to bed 20 minutes earlier this week.`);
    if (!isNaN(sd) && sd > 45) tips.push(`Your bedtime moves around by about ${Math.round(sd)} minutes. A steadier bedtime (even on weekends) usually improves sleep quality.`);
    if (lateCaffeine || alcohol60.some((l) => l.kind === "caffeine" && hour(l.at) >= 14)) tips.push("Keep caffeine before 2 PM — it can stay in your body for 6 hours or more.");
    tips.push("Dim screens and lights 30–60 minutes before bed; a cool, dark room helps.");
    const target = !isNaN(bAvg) ? clock(1080 + bAvg - (a < 7 ? 20 : 0)) : null;
    sleepCoach = { title: !isNaN(a) && a >= 7 && (isNaN(sd) || sd <= 45) ? "Your sleep is on track" : "A small change for better sleep", tips: tips.slice(0, 3), bedtimeTarget: target, avgSleep: isNaN(a) ? null : hm(a), consistency: isNaN(sd) ? null : `±${Math.round(sd)} min` };
  }

  // Patterns (need enough nights)
  const patterns: string[] = [];
  const alcoholDays = new Set(alcohol60.filter((l) => l.kind === "alcohol" && l.value > 0).map((l) => l.day));
  const next = [...sleep.entries()].map(([d, v]) => ({ drank: alcoholDays.has(addDays(d, -1)), v }));
  const wd = next.filter((x) => x.drank).map((x) => x.v), wo = next.filter((x) => !x.drank).map((x) => x.v);
  if (wd.length >= 3 && wo.length >= 5) {
    const diff = Math.round((avg(wo) - avg(wd)) * 60);
    if (Math.abs(diff) >= 15) patterns.push(diff > 0 ? `On nights after drinking alcohol you slept about ${diff} minutes less.` : `Nights after alcohol weren't shorter for you (about ${-diff} min more) — but alcohol still tends to lower sleep quality.`);
  }
  const lateDays = new Set(alcohol60.filter((l) => l.kind === "caffeine" && hour(l.at) >= 14).map((l) => l.day));
  const lc = [...sleep.entries()].map(([d, v]) => ({ late: lateDays.has(addDays(d, -1)), v }));
  const wl = lc.filter((x) => x.late).map((x) => x.v), nl = lc.filter((x) => !x.late).map((x) => x.v);
  if (wl.length >= 3 && nl.length >= 5) {
    const diff = Math.round((avg(nl) - avg(wl)) * 60);
    if (diff >= 15) patterns.push(`After afternoon caffeine you slept about ${diff} minutes less.`);
  }
  return { today: dayOf(today), week, lateCaffeine, sleepCoach, patterns };
}

// ── Rewards ─────────────────────────────────────────────────────────────
const LABEL: Record<string, string> = Object.fromEntries(REWARD_RULES.map((r) => [r.kind, r.label]));
export async function getRewards(p: P): Promise<RewardsDTO> {
  const [bal, earned, recent, codes, streak] = await Promise.all([
    balance(p.id),
    prisma.rewardEvent.aggregate({ where: { patientId: p.id, points: { gt: 0 } }, _sum: { points: true } }),
    prisma.rewardEvent.findMany({ where: { patientId: p.id }, orderBy: [{ day: "desc" }, { createdAt: "desc" }], take: 12, select: { kind: true, points: true, day: true, note: true } }),
    prisma.rewardEvent.findMany({ where: { patientId: p.id, kind: "redeem" }, orderBy: { createdAt: "desc" }, select: { code: true, note: true, createdAt: true } }),
    checkinStreak(p),
  ]);
  return {
    balance: bal, earnedTotal: earned._sum.points || 0, streak,
    recent: recent.map((r) => ({ label: r.kind === "redeem" ? r.note || "Redeemed" : LABEL[r.kind] || r.kind, points: r.points, day: r.day.slice(0, 10) })),
    rules: REWARD_RULES.map((r) => ({ label: r.label, points: r.points })),
    tiers: REWARD_TIERS,
    codes: codes.map((c) => ({ code: c.code || "", label: c.note || "", created: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: p.timezone }).format(c.createdAt) })),
  };
}
export { fmt };
