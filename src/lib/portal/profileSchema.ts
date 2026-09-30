// Health profile ("your complete health baseline") — five sections the patient
// fills in once and keeps current. Shared by the API (validation) and UI.
// Deliberately NOT collected (not health data, privacy risk under Alberta's
// HIA): income, political views, search/purchase history, voice/face analysis.

export type FieldType = "number" | "select" | "text" | "list" | "scale";
export interface ProfileField {
  key: string; label: string; type: FieldType; unit?: string; min?: number; max?: number;
  options?: string[]; hint?: string; placeholder?: string; max_len?: number;
}
export interface ProfileSection {
  id: "baseline" | "clinical" | "lifestyle" | "environment" | "mind";
  title: string; short: string; blurb: string; icon: string;
  gradient: [string, string]; // rich accent (Apple-style)
  fields: ProfileField[];
  auto: string[];     // auto-filled signals shown in the section
  tests: string[];    // BioAro Labs slugs that complete this section
}

export const PROFILE_SECTIONS: ProfileSection[] = [
  { id: "baseline", title: "Who you are", short: "Baseline", icon: "ph-identification-card", gradient: ["#2F6F80", "#6EB5C4"],
    blurb: "Your body and background, so nothing about you is assumed.",
    auto: ["age", "weight", "bmi"], tests: [],
    fields: [
      { key: "sex", label: "Biological sex", type: "select", options: ["Female", "Male", "Intersex", "Prefer not to say"] },
      { key: "heightCm", label: "Height", type: "number", unit: "cm", min: 100, max: 250 },
      { key: "weightKg", label: "Weight", type: "number", unit: "kg", min: 25, max: 350, hint: "Filled from your scale or Apple Health when connected." },
      { key: "bodyFat", label: "Body fat", type: "number", unit: "%", min: 3, max: 70, hint: "From a smart scale or DEXA scan." },
      { key: "boneDensity", label: "Bone density (DEXA)", type: "select", options: ["Normal", "Low (osteopenia)", "Osteoporosis", "Not tested"] },
      { key: "postal", label: "Postal code area", type: "text", max_len: 3, placeholder: "T2E", hint: "First 3 characters only." },
      { key: "language", label: "Preferred language", type: "text", max_len: 40, placeholder: "English, Punjabi…" },
      { key: "background", label: "Ancestry / cultural background", type: "text", max_len: 80, hint: "Optional. Some heart and genetic risks differ by ancestry." },
      { key: "occupation", label: "Occupation", type: "text", max_len: 80 },
      { key: "education", label: "Education", type: "select", options: ["High school", "College / trade", "Bachelor's", "Graduate degree", "Prefer not to say"] },
      { key: "hobbies", label: "Hobbies & interests", type: "text", max_len: 160, placeholder: "Hiking, cricket, cooking…" },
      { key: "values", label: "What matters most in your health", type: "text", max_len: 200, placeholder: "Energy for my kids, staying off medication…" },
    ] },
  { id: "clinical", title: "Inside your body", short: "Clinical", icon: "ph-heartbeat", gradient: ["#A5485A", "#E08A84"],
    blurb: "Vitals, lab biology and your medical history in one view for your care team.",
    auto: ["rhr", "hrv", "bp", "spo2", "glucose", "labs"], tests: ["whole-genome-sequencing-30x", "advanced-inflammation-aging", "hormone-health", "essential-vitamin-health", "the-biogut-test"],
    fields: [
      { key: "conditions", label: "Diagnosed conditions", type: "list", placeholder: "e.g. High blood pressure" },
      { key: "medications", label: "Current medications", type: "list", placeholder: "e.g. Atorvastatin 20 mg nightly" },
      { key: "allergies", label: "Allergies", type: "list", placeholder: "e.g. Penicillin — rash" },
      { key: "surgeries", label: "Past surgeries", type: "list", placeholder: "e.g. Appendectomy, 2015" },
      { key: "familyHistory", label: "Family history", type: "list", placeholder: "e.g. Father — heart attack at 58" },
      { key: "bodyTemp", label: "Usual body temperature", type: "number", unit: "°C", min: 34, max: 42 },
      { key: "genome", label: "Genetic (DNA) test", type: "select", options: ["Done", "Not yet"] },
      { key: "microbiome", label: "Microbiome test", type: "select", options: ["Done", "Not yet"] },
    ] },
  { id: "lifestyle", title: "How you live", short: "Lifestyle", icon: "ph-person-simple-run", gradient: ["#2E7D5B", "#7CC49A"],
    blurb: "Movement, sleep and food — the daily habits behind your numbers.",
    auto: ["steps", "active", "sleep", "water", "caffeine", "alcohol"], tests: ["the-biogut-test", "vitamin-d2-d3"],
    fields: [
      { key: "exerciseDays", label: "Exercise days per week", type: "number", unit: "days", min: 0, max: 7 },
      { key: "exerciseTypes", label: "Types of exercise", type: "text", max_len: 120, placeholder: "Walking, weights, yoga…" },
      { key: "sedentaryHours", label: "Sitting time per day", type: "number", unit: "h", min: 0, max: 24 },
      { key: "sleepQuality", label: "Sleep quality", type: "scale", hint: "1 = poor · 5 = excellent" },
      { key: "diet", label: "Eating pattern", type: "select", options: ["Omnivore", "Vegetarian", "Vegan", "Pescatarian", "Low-carb / keto", "Halal", "Kosher", "Other"] },
      { key: "mealsPerDay", label: "Meals per day", type: "number", min: 1, max: 8 },
      { key: "screenTime", label: "Screen time per day", type: "number", unit: "h", min: 0, max: 24, hint: "From iPhone Settings → Screen Time." },
      { key: "smoking", label: "Smoking / vaping", type: "select", options: ["Never", "Former", "Occasionally", "Daily"] },
    ] },
  { id: "environment", title: "Where you live", short: "Environment", icon: "ph-globe-hemisphere-west", gradient: ["#2D5F9A", "#7FA9E0"],
    blurb: "Air, weather and surroundings shape your health every day.",
    auto: ["city", "weather", "aqhi", "uv"], tests: [],
    fields: [
      { key: "setting", label: "Where you live", type: "select", options: ["City", "Suburb", "Small town", "Rural"] },
      { key: "noise", label: "Noise around you", type: "select", options: ["Low", "Moderate", "High"] },
      { key: "seasonalAllergies", label: "Seasonal allergies", type: "select", options: ["Yes", "No"] },
      { key: "workShift", label: "Work hours", type: "select", options: ["Day", "Evening", "Night", "Rotating", "Not working"] },
      { key: "outdoorHours", label: "Time outdoors per day", type: "number", unit: "h", min: 0, max: 24 },
    ] },
  { id: "mind", title: "Mind & mood", short: "Mind", icon: "ph-brain", gradient: ["#5B3F99", "#A88BDB"],
    blurb: "Stress and mood change your heart, sleep and recovery.",
    auto: ["mood", "stress"], tests: ["cortisol", "brain-health"],
    fields: [
      { key: "stressUsual", label: "Usual stress level", type: "scale", hint: "1 = calm · 5 = very high" },
      { key: "cognitiveFatigue", label: "Mental fatigue", type: "scale", hint: "1 = sharp · 5 = foggy most days" },
      { key: "support", label: "Support from people around you", type: "select", options: ["Strong", "Some", "Limited"] },
      { key: "mindfulness", label: "Relaxation practice", type: "select", options: ["Daily", "Sometimes", "Never"] },
    ] },
];

export const ALL_FIELDS = PROFILE_SECTIONS.flatMap((s) => s.fields.map((f) => ({ ...f, section: s.id })));
export type ProfileData = Record<string, string | number | string[]>;

/** Validate one value; returns the cleaned value, null to clear, or an error string. */
export function cleanValue(f: ProfileField, v: unknown): string | number | string[] | null | { error: string } {
  if (v === null || v === "" || (Array.isArray(v) && v.length === 0)) return null;
  if (f.type === "number" || f.type === "scale") {
    const n = Number(v), min = f.type === "scale" ? 1 : f.min ?? -Infinity, max = f.type === "scale" ? 5 : f.max ?? Infinity;
    if (!isFinite(n) || n < min || n > max) return { error: `${f.label} should be between ${min} and ${max}.` };
    return Math.round(n * 10) / 10;
  }
  if (f.type === "select") { const s = String(v); return f.options?.includes(s) ? s : { error: `Choose an option for ${f.label}.` }; }
  if (f.type === "list") {
    if (!Array.isArray(v)) return { error: `${f.label} must be a list.` };
    return v.map((x) => String(x).trim().slice(0, 120)).filter(Boolean).slice(0, 30);
  }
  const s = String(v).trim().slice(0, f.max_len ?? 200);
  return f.key === "postal" ? s.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3) : s;
}

export interface ProfileAuto { [k: string]: { label: string; value: string; note?: string } }
export interface HealthProfileDTO {
  data: ProfileData;
  auto: ProfileAuto;
  sections: { id: string; filled: number; total: number }[];
  overall: number; // 0–100
  updatedAt: string | null;
}
