// Health profile read model: stored answers + values filled automatically
// from devices, check-ins, labs and the patient's city, plus completion.

import { prisma } from "@backend/db";
import { avg, fmt, dayKey, addDays } from "@/lib/portal/metrics";
import { PROFILE_SECTIONS, type ProfileData, type ProfileAuto, type HealthProfileDTO } from "@/lib/portal/profileSchema";
import { getConsent, readingSourceFilter, parseJSON } from "@backend/patientData";
import { placeFor } from "@backend/brief";
import { getWeather } from "@backend/weather";

type P = { id: string; timezone: string };
const hm = (h: number) => { const t = Math.round(h * 60); return `${Math.floor(t / 60)}h ${t % 60}m`; };

export async function getHealthProfile(p: P, withWeather = true): Promise<HealthProfileDTO> {
  const today = dayKey(new Date(), p.timezone), from = addDays(today, -30), c = await getConsent(p.id);
  const [row, pt, readings, bps, logs, labs, place] = await Promise.all([
    prisma.healthProfile.findUnique({ where: { patientId: p.id } }),
    prisma.patient.findUnique({ where: { id: p.id }, select: { dateOfBirth: true } }),
    prisma.healthReading.findMany({ where: { patientId: p.id, day: { gte: from }, metric: { in: ["rhr", "hrv", "spo2", "glucose", "steps", "active", "sleep", "weight"] }, ...readingSourceFilter(c) }, select: { metric: true, day: true, value: true } }),
    prisma.bpReading.findMany({ where: { patientId: p.id, day: { gte: from } }, select: { sys: true, dia: true } }),
    prisma.lifestyleLog.findMany({ where: { patientId: p.id, day: { gte: addDays(today, -13) } }, select: { kind: true, value: true, day: true } }),
    c.labs ? prisma.labResult.count({ where: { patientId: p.id, status: "final" } }) : Promise.resolve(0),
    withWeather ? placeFor(p.id) : Promise.resolve(null),
  ]);
  const data = parseJSON<ProfileData>(row?.data, {});
  const auto: ProfileAuto = {};
  const series = (m: string) => readings.filter((r) => r.metric === m).sort((a, b) => (a.day < b.day ? -1 : 1));
  const last = (m: string) => { const s = series(m); return s.length ? s[s.length - 1].value : null; };
  const mean = (m: string) => { const s = series(m); return s.length ? avg(s.map((x) => x.value)) : null; };

  if (pt?.dateOfBirth) { const a = Math.floor((Date.now() - pt.dateOfBirth.getTime()) / (365.25 * 86400000)); auto.age = { label: "Age", value: `${a}`, note: "From your profile" }; }
  const w = last("weight") ?? (typeof data.weightKg === "number" ? data.weightKg : null);
  if (w != null) auto.weight = { label: "Weight", value: `${Math.round(w * 10) / 10} kg`, note: last("weight") != null ? "From your device" : "Entered by you" };
  if (w != null && typeof data.heightCm === "number") { const bmi = w / (data.heightCm / 100) ** 2; auto.bmi = { label: "BMI", value: bmi.toFixed(1), note: bmi < 18.5 ? "Below the healthy range" : bmi < 25 ? "Healthy range" : bmi < 30 ? "Above the healthy range" : "Well above the healthy range" }; }
  const rhr = mean("rhr"); if (rhr != null) auto.rhr = { label: "Resting heart rate", value: `${Math.round(rhr)} bpm`, note: "30-day average" };
  const hrv = mean("hrv"); if (hrv != null) auto.hrv = { label: "HRV", value: `${Math.round(hrv)} ms`, note: "30-day average" };
  if (bps.length) auto.bp = { label: "Home blood pressure", value: `${Math.round(avg(bps.map((b) => b.sys)))}/${Math.round(avg(bps.map((b) => b.dia)))}`, note: `${bps.length} readings, 30 days` };
  const spo2 = mean("spo2"); if (spo2 != null) auto.spo2 = { label: "Blood oxygen", value: `${Math.round(spo2)}%`, note: "30-day average" };
  const glu = mean("glucose"); if (glu != null) auto.glucose = { label: "Glucose", value: `${glu.toFixed(1)} mmol/L`, note: "30-day average" };
  if (labs) auto.labs = { label: "Lab results", value: `${labs}`, note: "In Results" };
  const steps = mean("steps"); if (steps != null) auto.steps = { label: "Steps", value: fmt("steps", steps), note: "Daily average" };
  const active = mean("active"); if (active != null) auto.active = { label: "Active minutes", value: `${Math.round(active)} min`, note: "Daily average" };
  const sleep = mean("sleep"); if (sleep != null) auto.sleep = { label: "Sleep", value: hm(sleep), note: "Nightly average" };
  const days = new Set(logs.map((l) => l.day)).size || 1;
  const sum = (k: string) => logs.filter((l) => l.kind === k).reduce((a, l) => a + l.value, 0);
  if (logs.some((l) => l.kind === "water")) auto.water = { label: "Water", value: `${(sum("water") / days).toFixed(1)} glasses`, note: "Per day, 2 weeks" };
  if (logs.some((l) => l.kind === "caffeine")) auto.caffeine = { label: "Caffeine", value: `${(sum("caffeine") / days).toFixed(1)} cups`, note: "Per day, 2 weeks" };
  if (logs.some((l) => l.kind === "alcohol")) auto.alcohol = { label: "Alcohol", value: `${sum("alcohol")} drinks`, note: "Last 2 weeks" };
  const mood = logs.filter((l) => l.kind === "mood").map((l) => l.value), stress = logs.filter((l) => l.kind === "stress").map((l) => l.value);
  if (mood.length) auto.mood = { label: "Mood", value: `${avg(mood).toFixed(1)} / 5`, note: `${mood.length} check-ins` };
  if (stress.length) auto.stress = { label: "Stress", value: `${avg(stress).toFixed(1)} / 5`, note: `${stress.length} check-ins` };
  if (place) {
    auto.city = { label: "City", value: `${place.city}${place.prov ? ", " + place.prov : ""}` };
    const wx = await getWeather(place).catch(() => null);
    if (wx) {
      if (wx.tempC != null) auto.weather = { label: "Weather now", value: `${Math.round(wx.tempC)}°C${wx.condition ? " · " + wx.condition : ""}` };
      if (wx.aqhi != null) auto.aqhi = { label: "Air quality (AQHI)", value: `${wx.aqhi} · ${wx.aqhiRisk}` };
      if (wx.uv != null) auto.uv = { label: "UV index", value: `${wx.uv}` };
    }
  }

  const sections = PROFILE_SECTIONS.map((s) => {
    const filled = s.fields.filter((f) => { const v = data[f.key]; return v != null && v !== "" && !(Array.isArray(v) && !v.length); }).length + s.auto.filter((k) => auto[k]).length;
    return { id: s.id, filled, total: s.fields.length + s.auto.length };
  });
  const tot = sections.reduce((a, s) => a + s.total, 0), fil = sections.reduce((a, s) => a + s.filled, 0);
  return { data, auto, sections, overall: Math.round((fil / tot) * 100), updatedAt: row?.updatedAt?.toISOString() ?? null };
}

/** Short text summary for ALBA and care-team views. */
export async function profileSummary(patientId: string): Promise<string> {
  const row = await prisma.healthProfile.findUnique({ where: { patientId } });
  const d = parseJSON<ProfileData>(row?.data, {});
  const L = (k: string, label: string) => { const v = d[k]; return v == null || v === "" || (Array.isArray(v) && !v.length) ? null : `${label}: ${Array.isArray(v) ? v.join("; ") : v}`; };
  return [L("sex", "Sex"), L("heightCm", "Height cm"), L("bodyFat", "Body fat %"), L("conditions", "Conditions"), L("medications", "Medications (patient-reported)"), L("allergies", "Allergies"),
    L("familyHistory", "Family history"), L("diet", "Eating pattern"), L("exerciseDays", "Exercise days/week"), L("smoking", "Smoking"), L("stressUsual", "Usual stress 1-5"), L("workShift", "Work hours")].filter(Boolean).join("\n");
}
