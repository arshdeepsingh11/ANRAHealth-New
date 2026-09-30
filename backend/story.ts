// Monthly health story: a short, friendly recap of one month built from the
// patient's data (rules), optionally retold by ALBA. Cached per month;
// the current month refreshes at most every 12 hours.

import { prisma } from "@backend/db";
import { avg, fmt, dayKey } from "@/lib/portal/metrics";
import { MONTHS } from "@/lib/portal/metrics";
import type { StoryDTO } from "@/lib/portal/types";
import { getConsent, readingSourceFilter, parseJSON } from "@backend/patientData";
import { gemini, unsafeAiText } from "@backend/ai";

type P = { id: string; firstName: string; timezone: string };
const hm = (h: number) => { const t = Math.round(h * 60); return `${Math.floor(t / 60)}h ${t % 60}m`; };
const prevMonth = (m: string) => { const [y, mo] = m.split("-").map(Number); return mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, "0")}`; };
const label = (m: string) => { const [y, mo] = m.split("-").map(Number); return `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][mo - 1]} ${y}`; };

export async function storyMonths(p: P): Promise<string[]> {
  const today = dayKey(new Date(), p.timezone), cur = today.slice(0, 7);
  const out: string[] = [];
  let m = cur;
  for (let i = 0; i < 12; i++) { out.push(m); m = prevMonth(m); }
  const first = await prisma.healthReading.findFirst({ where: { patientId: p.id }, orderBy: { day: "asc" }, select: { day: true } });
  const firstLog = await prisma.lifestyleLog.findFirst({ where: { patientId: p.id }, orderBy: { day: "asc" }, select: { day: true } });
  const start = [first?.day, firstLog?.day].filter(Boolean).sort()[0]?.slice(0, 7) || cur;
  return out.filter((x) => x >= start);
}

async function monthStats(p: P, month: string) {
  const c = await getConsent(p.id), from = `${month}-01`, to = `${month}-31`;
  const [rows, bps, logs, proto, pts] = await Promise.all([
    prisma.healthReading.findMany({ where: { patientId: p.id, day: { gte: from, lte: to }, metric: { in: ["sleep", "steps", "rhr", "hrv", "active", "weight"] }, ...readingSourceFilter(c) }, select: { metric: true, day: true, value: true } }),
    prisma.bpReading.findMany({ where: { patientId: p.id, day: { gte: from, lte: to } }, select: { sys: true, dia: true } }),
    prisma.lifestyleLog.findMany({ where: { patientId: p.id, day: { gte: from, lte: to } }, select: { kind: true, day: true, value: true } }),
    prisma.protocolLog.groupBy({ by: ["day"], where: { patientId: p.id, day: { gte: from, lte: to } }, _count: true }),
    prisma.rewardEvent.aggregate({ where: { patientId: p.id, day: { gte: from, lte: to + "~" }, points: { gt: 0 } }, _sum: { points: true } }),
  ]);
  const by = (m: string) => { const d = new Map<string, number>(); rows.filter((r) => r.metric === m).forEach((r) => d.set(r.day, Math.max(d.get(r.day) ?? -Infinity, r.value))); return d; };
  const steps = by("steps"), sleep = by("sleep"), rhr = by("rhr"), hrv = by("hrv"), active = by("active"), weight = by("weight");
  const best = [...steps.entries()].sort((a, b) => b[1] - a[1])[0];
  const w = [...weight.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
  return {
    sleep: avg([...sleep.values()]), sleepNights: sleep.size, steps: avg([...steps.values()]), best, rhr: avg([...rhr.values()]), hrv: avg([...hrv.values()]), active: avg([...active.values()]),
    weightChange: w.length >= 2 ? w[w.length - 1][1] - w[0][1] : NaN,
    bp: bps.length ? { sys: Math.round(avg(bps.map((b) => b.sys))), dia: Math.round(avg(bps.map((b) => b.dia))), n: bps.length } : null,
    checkinDays: new Set(logs.map((l) => l.day)).size, water: avg([...new Set(logs.filter((l) => l.kind === "water").map((l) => l.day))].map((d) => logs.filter((l) => l.kind === "water" && l.day === d).reduce((a, l) => a + l.value, 0))),
    protocolDays: proto.length, points: pts._sum.points || 0,
  };
}

export async function getStory(p: P, monthIn?: string): Promise<StoryDTO> {
  const months = await storyMonths(p);
  const month = monthIn && months.includes(monthIn) ? monthIn : months[0];
  const cur = dayKey(new Date(), p.timezone).slice(0, 7);
  const [s, prev] = await Promise.all([monthStats(p, month), monthStats(p, prevMonth(month))]);

  const stats: StoryDTO["stats"] = [];
  const delta = (a: number, b: number, unit: string, fmtK: string) => (isNaN(b) ? undefined : Math.abs(a - b) < (fmtK === "sleep" ? 0.1 : 1) ? "Same as last month" : `${a > b ? "↑" : "↓"} ${fmtK === "sleep" ? `${Math.round(Math.abs(a - b) * 60)} min` : fmt(fmtK, Math.abs(a - b)) + unit} vs last month`);
  if (!isNaN(s.sleep)) stats.push({ label: "Average sleep", value: hm(s.sleep), note: delta(s.sleep, prev.sleep, "", "sleep") });
  if (!isNaN(s.steps)) stats.push({ label: "Average steps", value: fmt("steps", s.steps), note: delta(s.steps, prev.steps, "", "steps") });
  if (!isNaN(s.rhr)) stats.push({ label: "Resting heart rate", value: `${Math.round(s.rhr)} bpm`, note: delta(s.rhr, prev.rhr, " bpm", "rhr") });
  if (!isNaN(s.hrv)) stats.push({ label: "HRV", value: `${Math.round(s.hrv)} ms`, note: delta(s.hrv, prev.hrv, " ms", "hrv") });
  if (s.bp) stats.push({ label: "Home blood pressure", value: `${s.bp.sys}/${s.bp.dia}`, note: `${s.bp.n} readings` });
  if (s.checkinDays) stats.push({ label: "Check-in days", value: String(s.checkinDays) });
  if (s.protocolDays) stats.push({ label: "Protocol days", value: String(s.protocolDays) });
  if (s.points) stats.push({ label: "Points earned", value: String(s.points) });

  // Rules story
  const paras: string[] = [];
  let title = "Your month in health";
  if (!stats.length) {
    title = "Your story starts here";
    paras.push(`There isn't enough data for ${label(month)} yet. Connect a device, log a few check-ins or add a blood pressure reading, and next month's story will write itself.`);
  } else {
    if (!isNaN(s.steps) && !isNaN(prev.steps) && s.steps > prev.steps * 1.1) title = "A more active month";
    else if (!isNaN(s.sleep) && !isNaN(prev.sleep) && s.sleep > prev.sleep + 0.2) title = "A month of better sleep";
    else if (!isNaN(s.hrv) && !isNaN(prev.hrv) && s.hrv > prev.hrv * 1.05) title = "Recovering well";
    else if (s.checkinDays >= 20) title = "A month of steady habits";
    const a: string[] = [];
    if (!isNaN(s.sleep)) a.push(`you slept an average of ${hm(s.sleep)} a night${isNaN(prev.sleep) ? "" : s.sleep >= prev.sleep ? `, up from ${hm(prev.sleep)}` : `, down from ${hm(prev.sleep)}`}`);
    if (!isNaN(s.steps)) a.push(`walked about ${fmt("steps", s.steps)} steps a day${s.best ? ` (your best day: ${fmt("steps", s.best[1])} on ${MONTHS[Number(s.best[0].slice(5, 7)) - 1]} ${Number(s.best[0].slice(8))})` : ""}`);
    if (a.length) paras.push(`In ${label(month).split(" ")[0]}, ${a.join(", and ")}.`);
    const h: string[] = [];
    if (!isNaN(s.rhr)) h.push(`resting heart rate averaged ${Math.round(s.rhr)} bpm${!isNaN(prev.rhr) && Math.abs(s.rhr - prev.rhr) >= 1 ? ` (${s.rhr < prev.rhr ? "lower" : "higher"} than last month)` : ""}`);
    if (s.bp) h.push(`your home blood pressure averaged ${s.bp.sys}/${s.bp.dia} across ${s.bp.n} readings`);
    if (h.length) paras.push(`For your heart, ${h.join(", and ")}.`);
    const hab: string[] = [];
    if (s.checkinDays) hab.push(`checked in on ${s.checkinDays} day${s.checkinDays > 1 ? "s" : ""}`);
    if (s.protocolDays) hab.push(`followed your protocol on ${s.protocolDays} day${s.protocolDays > 1 ? "s" : ""}`);
    if (s.points) hab.push(`earned ${s.points} reward points`);
    if (hab.length) paras.push(`You ${hab.length > 1 ? hab.slice(0, -1).join(", ") + " and " + hab[hab.length - 1] : hab[0]}. Small, repeated steps like these are what change health over time.`);
    paras.push("Next month: pick one thing to build on — an earlier bedtime, a daily walk, or morning and evening blood pressure readings before your next visit.");
  }
  let out = { title, paragraphs: paras, byAlba: false };

  const cached = await prisma.generatedNote.findUnique({ where: { patientId_kind_period: { patientId: p.id, kind: "story", period: month } } });
  const fresh = cached && (month !== cur || Date.now() - cached.createdAt.getTime() < 12 * 3600_000);
  if (fresh) out = parseJSON(cached!.body, out);
  else if (stats.length && process.env.GEMINI_API_KEY) {
    const sys = `You are ALBA in NEYU Health's My Health Space. Retell a patient's month as a short, warm story: 3 short paragraphs (max 110 words total), second person, specific numbers from the facts, one encouraging suggestion at the end. Never diagnose, never mention medications, no markdown, no emojis. First line: a 3–6 word title, then a blank line, then the paragraphs.`;
    const ai = await gemini(sys, `Patient first name: ${p.firstName}. Month: ${label(month)}.\nFacts:\n${stats.map((x) => `- ${x.label}: ${x.value}${x.note ? ` (${x.note})` : ""}`).join("\n")}`, { maxTokens: 260, temperature: 0.6 });
    if (ai && !unsafeAiText(ai)) {
      const [t, ...rest] = ai.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
      if (t && rest.length) out = { title: t.replace(/[."]+$/g, "").slice(0, 60), paragraphs: rest.slice(0, 4), byAlba: true };
    }
    await prisma.generatedNote.upsert({ where: { patientId_kind_period: { patientId: p.id, kind: "story", period: month } }, create: { patientId: p.id, kind: "story", period: month, body: JSON.stringify(out) }, update: { body: JSON.stringify(out), createdAt: new Date() } }).catch(() => {});
  }
  return { month, label: label(month) + (month === cur ? " (so far)" : ""), ...out, stats, months };
}
