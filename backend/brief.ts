// NEYU Today — the daily brief. Location-aware (ECCC weather + AQHI),
// built from the patient's own data by clear rules, then (when a Gemini key
// is set) rewritten by Neyu into a short, warm message. Cached per day in
// GeneratedNote; rules are recomputed on every load, the AI text only when
// the facts change (at most every 3 hours).

import { createHash } from "crypto";
import { prisma } from "@backend/db";
import { avg, fmt, dayKey, addDays, daysBetween } from "@/lib/portal/metrics";
import { findPlace, type Place } from "@/lib/portal/places";
import { bpLevel, bpUrgent } from "@/lib/portal/universe";
import { PROVIDER_NAMES } from "@/lib/portal/devices";
import type { BriefDTO, BriefItemDTO, WeatherDTO } from "@/lib/portal/types";
import { getWeather } from "@backend/weather";
import { getConsent, readingSourceFilter, parseJSON } from "@backend/patientData";
import { getRetests } from "@backend/labs";
import { evaluateRewards, balance, checkinStreak } from "@backend/health";
import { gemini, unsafeAiText } from "@backend/ai";

type P = { id: string; firstName: string; timezone: string };

export async function placeFor(patientId: string): Promise<Place | null> {
  const s = await prisma.patientSettings.findUnique({ where: { patientId }, select: { city: true, province: true, lat: true, lon: true } });
  if (!s?.city) return null;
  const known = findPlace(s.city, s.province);
  if (known) return known;
  return s.lat != null && s.lon != null ? { city: s.city, prov: s.province || "", lat: s.lat, lon: s.lon } : null;
}

const hm = (h: number) => { const t = Math.round(h * 60); return `${Math.floor(t / 60)}h ${t % 60}m`; };

export function moveAdvice(w: WeatherDTO | null, lowRecovery: boolean): BriefDTO["moveAdvice"] {
  if (!w) return lowRecovery ? { verdict: "easy", text: "Your body could use an easier day — a relaxed walk rather than a hard workout." } : null;
  const t = w.tempC, feels = w.feelsLikeC ?? t, cond = (w.condition || "").toLowerCase(), aq = Math.max(w.aqhi ?? 0, w.aqhiMax ?? 0);
  const where = w.place.split(",")[0];
  if (w.alerts.length) return { verdict: "indoors", text: `There's an active weather alert for ${where} (${w.alerts[0].toLowerCase()}). Keep exercise indoors today.` };
  if (aq >= 7) return { verdict: "indoors", text: `Air quality is high risk in ${where} (AQHI ${aq}). Move indoors today and keep windows closed if it's smoky.` };
  if (feels != null && feels <= -25) return { verdict: "indoors", text: `It feels like ${Math.round(feels)}°C — frostbite can happen in minutes. Choose an indoor workout today.` };
  if (/thunder|freezing rain|blizzard|heavy snow/.test(cond)) return { verdict: "indoors", text: `${w.condition} in ${where}. A good day for an indoor workout.` };
  const bits: string[] = [];
  let verdict: "outside" | "easy" = "outside";
  if (aq >= 4) { verdict = "easy"; bits.push(`Air quality is moderate (AQHI ${aq}) — easy outdoor activity is fine; take hard efforts indoors`); }
  if (t != null && t >= 29) { verdict = "easy"; bits.push(`It's hot (${Math.round(t)}°C) — move early or in the evening and drink more water`); }
  if (feels != null && feels <= -15) { verdict = "easy"; bits.push(`It feels like ${Math.round(feels)}°C — cover exposed skin and keep it short`); }
  if (/rain|snow|shower|drizzle/.test(cond)) { verdict = "easy"; bits.push(`${w.condition} — dress for it or move indoors`); }
  if (lowRecovery) { verdict = "easy"; bits.push("your recovery is a little low, so keep the pace easy"); }
  if (verdict === "outside") {
    const sky = w.condition ? w.condition.toLowerCase() : "clear";
    const air = w.aqhi != null ? `, air quality is low risk (AQHI ${w.aqhi})` : "";
    const temp = t != null ? `${Math.round(t)}°C` : "";
    let s = `${where} is ${[temp, sky].filter(Boolean).join(" and ")}${air} — a great day for a run or walk outside.`;
    if ((w.uv ?? 0) >= 6) s += ` UV is high (${w.uv}), so wear sunscreen.`;
    return { verdict, text: s };
  }
  const s = bits.join("; ");
  return { verdict, text: s.charAt(0).toUpperCase() + s.slice(1) + "." };
}

export async function getBrief(p: P, opts: { ai?: boolean } = {}): Promise<BriefDTO> {
  const tz = p.timezone, now = new Date(), today = dayKey(now, tz), c = await getConsent(p.id);
  await evaluateRewards(p).catch(() => 0);
  const place = await placeFor(p.id);
  const [weather, readings, bps, logsToday, logsYest, protoItems, protoDone, appt, retests, conns, points, streak, settings] = await Promise.all([
    place ? getWeather(place) : Promise.resolve(null),
    prisma.healthReading.findMany({ where: { patientId: p.id, day: { gte: addDays(today, -30) }, metric: { in: ["sleep", "hrv", "rhr", "steps"] }, ...readingSourceFilter(c) }, select: { metric: true, day: true, value: true } }),
    prisma.bpReading.findMany({ where: { patientId: p.id, day: { gte: addDays(today, -7) } }, select: { sys: true, dia: true, takenAt: true }, orderBy: { takenAt: "desc" } }),
    prisma.lifestyleLog.findMany({ where: { patientId: p.id, day: today }, select: { kind: true, value: true, at: true } }),
    prisma.lifestyleLog.findMany({ where: { patientId: p.id, day: addDays(today, -1), kind: "alcohol" }, select: { value: true } }),
    c.records ? prisma.protocolItem.count({ where: { patientId: p.id, active: true, pausedAt: null } }) : Promise.resolve(0),
    prisma.protocolLog.count({ where: { patientId: p.id, day: today } }),
    c.records ? prisma.appointment.findFirst({ where: { patientId: p.id, status: "scheduled", startsAt: { gte: now } }, orderBy: { startsAt: "asc" }, select: { clinician: true, startsAt: true, title: true } }) : Promise.resolve(null),
    c.labs ? getRetests(p, 30) : Promise.resolve([]),
    prisma.deviceConnection.findMany({ where: { patientId: p.id, status: "connected" }, select: { provider: true, lastSyncAt: true, lastError: true } }),
    balance(p.id), checkinStreak(p),
    prisma.patientSettings.findUnique({ where: { patientId: p.id }, select: { city: true } }),
  ]);

  const series = (m: string) => { const by = new Map<string, number>(); readings.filter((r) => r.metric === m).forEach((r) => by.set(r.day, Math.max(by.get(r.day) ?? -Infinity, r.value))); return by; };
  const sleep = series("sleep"), hrv = series("hrv"), rhr = series("rhr"), steps = series("steps");
  const between = (m: Map<string, number>, a: number, b: number) => [...m.entries()].filter(([d]) => daysBetween(d, today) >= a && daysBetween(d, today) <= b).map(([, v]) => v);
  const items: BriefItemDTO[] = [];
  const facts: string[] = [];

  // Sleep
  const lastSleep = sleep.get(today) ?? null, sleep14 = avg(between(sleep, 1, 14));
  if (lastSleep != null) {
    const d = isNaN(sleep14) ? 0 : Math.round((lastSleep - sleep14) * 60);
    const cmp = isNaN(sleep14) ? "" : Math.abs(d) < 10 ? " — right on your usual" : d > 0 ? ` — ${d} min more than your 2-week average` : ` — ${-d} min less than your 2-week average`;
    items.push({ icon: "ph ph-moon", title: "Sleep", text: `You slept ${hm(lastSleep)}${cmp}.`, tone: d < -45 ? "peach" : "teal", go: "trend:sleep" });
    facts.push(`slept ${hm(lastSleep)}${cmp}`);
  }
  // Recovery
  const hrv7 = avg(between(hrv, 0, 6)), hrv30 = avg(between(hrv, 0, 29));
  const lowRecovery = (!isNaN(hrv7) && !isNaN(hrv30) && hrv7 < hrv30 * 0.9) || (lastSleep != null && lastSleep < 6);
  if (!isNaN(hrv7) && !isNaN(hrv30) && hrv.size >= 5) {
    const pct = Math.round(((hrv7 - hrv30) / hrv30) * 100);
    items.push({ icon: "ph ph-heartbeat", title: "Recovery", text: Math.abs(pct) < 5 ? "Your HRV is steady this week." : pct > 0 ? `Your HRV is up ${pct}% this week — you're recovering well.` : `Your HRV is down ${-pct}% this week — an easier day may help.`, tone: pct < -10 ? "peach" : "teal", go: "trend:hrv" });
    facts.push(`HRV ${pct >= 0 ? "up" : "down"} ${Math.abs(pct)}% vs month`);
  }
  const rhrNow = rhr.get(today) ?? rhr.get(addDays(today, -1)), rhr30 = avg(between(rhr, 1, 30));
  if (rhrNow != null && !isNaN(rhr30) && rhrNow - rhr30 >= 5) {
    items.push({ icon: "ph ph-heart", title: "Resting heart rate", text: `Resting heart rate is ${Math.round(rhrNow)} bpm, ${Math.round(rhrNow - rhr30)} above your usual. Late meals, alcohol, stress or a coming cold can all do this.`, tone: "peach", go: "trend:rhr" });
    facts.push(`resting HR ${Math.round(rhrNow - rhr30)} bpm above usual`);
  }
  // Activity (yesterday vs usual)
  const ySteps = steps.get(addDays(today, -1)), usualSteps = avg(between(steps, 2, 30));
  if (ySteps != null && !isNaN(usualSteps) && ySteps > usualSteps * 1.15) facts.push(`yesterday ${fmt("steps", ySteps)} steps, above usual`);

  // Home blood pressure
  if (bps.length) {
    const s7 = Math.round(avg(bps.map((b) => b.sys))), d7 = Math.round(avg(bps.map((b) => b.dia)));
    const urgent = bps.find((b) => bpUrgent(b.sys, b.dia) && now.getTime() - b.takenAt.getTime() < 2 * 86400000);
    const lvl = bpLevel(s7, d7);
    items.push(urgent
      ? { icon: "ph ph-warning", title: "Blood pressure", text: `A very high reading (${urgent.sys}/${urgent.dia}). Re-measure after 5 minutes of rest; if it stays this high, contact your care team today. Chest pain, weakness or confusion: call 911.`, tone: "peach", go: "heart" }
      : { icon: "ph ph-drop", title: "Blood pressure", text: `Your 7-day home average is ${s7}/${d7} (${bps.length} reading${bps.length > 1 ? "s" : ""}) — ${lvl === "normal" ? "within the home target" : lvl === "elevated" ? "at the upper end of normal" : "at or above the home target of 135/85; worth sharing with your care team"}.`, tone: lvl === "high" ? "peach" : "teal", go: "heart" });
    facts.push(`home BP 7-day average ${s7}/${d7}`);
  }

  // Lifestyle
  const count = (k: string) => logsToday.filter((l) => l.kind === k).reduce((a, l) => a + l.value, 0);
  const water = count("water"), lateCaffeine = logsToday.some((l) => l.kind === "caffeine" && Number(new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hour12: false }).format(l.at)) % 24 >= 14);
  const alcoholY = logsYest.reduce((a, l) => a + l.value, 0);
  if (lateCaffeine) items.push({ icon: "ph ph-coffee", title: "Caffeine", text: "Caffeine after 2 PM can shorten tonight's sleep. Switch to water or herbal tea for the rest of the day.", tone: "lavender", go: "lifestyle" });
  if (alcoholY >= 2) items.push({ icon: "ph ph-wine", title: "Recovery tip", text: `${alcoholY} drinks yesterday — alcohol often lowers HRV and deep sleep for a night. Extra water today helps.`, tone: "lavender", go: "lifestyle" });
  if (!logsToday.length) items.push({ icon: "ph ph-smiley", title: "Check in", text: "How are you feeling today? A 10-second mood, stress and water check-in keeps your streak going.", tone: "neutral", go: "lifestyle" });
  else if (water < 6) items.push({ icon: "ph ph-drop-half", title: "Water", text: `${water} of 8 glasses so far today.`, tone: "neutral", go: "lifestyle" });

  // Protocol
  if (protoItems > protoDone) items.push({ icon: "ph ph-check-circle", title: "Protocol", text: `${protoItems - protoDone} protocol step${protoItems - protoDone > 1 ? "s" : ""} left today.`, tone: "neutral", go: "protocol" });

  // Appointment nudge (within 3 days)
  if (appt) {
    const d = daysBetween(today, dayKey(appt.startsAt, tz));
    if (d <= 3) {
      const when = d <= 0 ? "today" : d === 1 ? "tomorrow" : `in ${d} days`;
      items.unshift({ icon: "ph ph-calendar-check", title: "Visit coming up", text: `Your visit with ${appt.clinician} is ${when}. Add your questions${bps.length || d > 0 ? " and take your blood pressure morning and evening until then" : ""}.`, tone: "lavender", go: "appointments" });
      facts.push(`visit with ${appt.clinician} ${when}`);
    }
  }
  // Retests
  if (retests.length) {
    const r = retests[0];
    items.push({ icon: "ph ph-flask", title: "Retest", text: `${r.name} ${r.overdue ? "retest is overdue" : "retest is due"} (last tested ${r.last}).${retests.length > 1 ? ` ${retests.length - 1} more test${retests.length > 2 ? "s" : ""} due soon.` : ""}`, tone: "neutral", go: "results" });
  }
  // Devices that stopped syncing
  conns.filter((x) => x.lastError || (x.lastSyncAt && now.getTime() - x.lastSyncAt.getTime() > 3 * 86400000)).slice(0, 1).forEach((x) =>
    items.push({ icon: "ph ph-plugs", title: "Device", text: x.lastError || `${PROVIDER_NAMES[x.provider] || x.provider} hasn't synced for ${Math.round((now.getTime() - x.lastSyncAt!.getTime()) / 86400000)} days.`, tone: "peach", go: "devices" }));

  const advice = moveAdvice(weather, lowRecovery);
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hour12: false }).format(now)) % 24;
  const headline = `Good ${hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"}, ${p.firstName}.`;
  if (weather) facts.unshift(`${weather.place}: ${weather.tempC != null ? Math.round(weather.tempC) + "°C " : ""}${weather.condition || ""}${weather.aqhi != null ? `, AQHI ${weather.aqhi} (${weather.aqhiRisk})` : ""}${weather.alerts[0] ? `, alert: ${weather.alerts[0]}` : ""}`);
  if (streak > 1) facts.push(`${streak}-day check-in streak`);

  // Rules message (the move advice has its own box, so this summarises the person's data)
  const ruleParts: string[] = [];
  if (lastSleep != null) ruleParts.push(`You slept ${hm(lastSleep)}${lowRecovery ? " and your body could use an easier day" : !isNaN(hrv7) ? " and your recovery is steady" : ""}.`);
  if (bps.length && bpLevel(avg(bps.map((b) => b.sys)), avg(bps.map((b) => b.dia))) === "high") ruleParts.push("Your home blood pressure is running at or above target — keep measuring morning and evening.");
  if (streak > 1) ruleParts.push(`You're on a ${streak}-day check-in streak — keep it going.`);
  if (!ruleParts.length) ruleParts.push(items.length ? "Here's what matters for your health today." : "Connect a device or log a check-in and your brief fills in from tomorrow.");
  let message = ruleParts.join(" "), byAlba = false;

  // Neyu wording (cached per day; refreshed when facts change, max every 3 h)
  const factKey = createHash("sha1").update(facts.join("|") + (advice?.text || "")).digest("hex").slice(0, 16);
  const cached = await prisma.generatedNote.findUnique({ where: { patientId_kind_period: { patientId: p.id, kind: "brief", period: today } } });
  const body = parseJSON<{ message?: string; factKey?: string; byAlba?: boolean }>(cached?.body, {});
  const fresh = cached && (body.factKey === factKey || now.getTime() - cached.createdAt.getTime() < 3 * 3600_000);
  if (fresh && body.message && body.byAlba) { message = body.message; byAlba = true; }
  else if (opts.ai !== false && facts.length && process.env.GEMINI_API_KEY) {
    const sys = `You are Neyu, the warm health companion in NEYU Health's My Health Space (Calgary). Write the patient's morning brief: 2 short sentences, max 45 words, plain language, encouraging, specific to the facts. Mention the weather/air and one thing from their data. Never diagnose, never mention medications, no markdown, no emojis. Patient first name: ${p.firstName}.`;
    const ai = await gemini(sys, `Facts for today:\n- ${facts.join("\n- ")}\nMovement advice: ${advice?.text || "none"}`, { maxTokens: 120 });
    if (ai && !unsafeAiText(ai) && ai.length < 400) { message = ai; byAlba = true; }
    const data = JSON.stringify({ message, factKey, byAlba });
    await prisma.generatedNote.upsert({ where: { patientId_kind_period: { patientId: p.id, kind: "brief", period: today } }, create: { patientId: p.id, kind: "brief", period: today, body: data }, update: { body: data, createdAt: now } }).catch(() => {});
  }

  return { day: today, headline, message, byAlba, weather, needsLocation: !settings?.city, moveAdvice: advice, items: items.slice(0, 7), points, streak };
}
