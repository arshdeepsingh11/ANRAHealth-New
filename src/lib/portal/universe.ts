// Health Universe rules shared by server and client: home blood pressure
// bands, lab retest intervals, reward points and challenge metrics.
// Wellness framing only — these describe readings, they never diagnose.

// ── Home blood pressure ─────────────────────────────────────────────────
// Hypertension Canada: a home average of 135/85 or more is above the home
// target; a single reading of 180/110 or more needs prompt attention.
export type BpLevel = "none" | "normal" | "elevated" | "high" | "urgent";

export function bpLevel(sys: number, dia: number): Exclude<BpLevel, "none" | "urgent"> {
  if (sys >= 135 || dia >= 85) return "high";
  if (sys >= 130 || dia >= 80) return "elevated";
  return "normal";
}
export const bpUrgent = (sys: number, dia: number) => sys >= 180 || dia >= 110;

export const BP_TEXT: Record<BpLevel, { title: string; text: string }> = {
  none: { title: "No home readings yet", text: "Measure seated after 5 minutes of rest, arm supported at heart level. Two readings in the morning and two in the evening give the clearest picture." },
  normal: { title: "Within the home target", text: "Your recent home average is below 135/85. Keep measuring a few times a week so trends stay clear." },
  elevated: { title: "At the upper end of normal", text: "Your recent home average is close to 135/85. Keep measuring morning and evening, and bring your log to your next visit." },
  high: { title: "Above the home target", text: "Your recent home average is 135/85 or more. This is worth sharing with your care team — it isn't a diagnosis, and one week of readings helps them most." },
  urgent: { title: "A very high reading", text: "One reading was 180/110 or more. Sit quietly for 5 minutes and measure again. If it stays this high, contact your care team today. If you have chest pain, shortness of breath, weakness, confusion or a severe headache, call 911." },
};

// ── Lab retest intervals (months) ───────────────────────────────────────
const RETEST: [RegExp, number][] = [
  [/hba1c|a1c|glucose/i, 6],
  [/hs-?crp|crp/i, 6],
  [/ldl|hdl|chol|trig|lipid|apob|lp\(?a/i, 12],
  [/vit(amin)?-?d|25-?oh/i, 12],
  [/ferritin|iron|b12|folate/i, 12],
  [/tsh|t4|thyroid/i, 12],
  [/creat|egfr|kidney|alt|ast|liver/i, 12],
  [/troponin|bnp/i, 0], // clinical only — never "retest due"
];
export function retestMonths(code: string, name: string, outOfRange: boolean): number | null {
  const key = code + " " + name;
  const hit = RETEST.find(([re]) => re.test(key));
  const m = hit ? hit[1] : 12;
  if (m === 0) return null;
  return outOfRange ? Math.min(m, 6) : m;
}

// ── Rewards ─────────────────────────────────────────────────────────────
export const REWARD_RULES: { kind: string; label: string; points: number }[] = [
  { kind: "checkin", label: "Daily check-in (mood, water or a meal)", points: 10 },
  { kind: "protocol", label: "Every protocol step done for the day", points: 15 },
  { kind: "steps", label: "Moved more than your usual day", points: 10 },
  { kind: "bp", label: "Home blood pressure, morning and evening", points: 15 },
  { kind: "food", label: "Logged a meal in Food", points: 5 },
  { kind: "record", label: "Added a health report to your record", points: 20 },
  { kind: "streak7", label: "7-day check-in streak (bonus)", points: 50 },
];
export const REWARD_POINTS: Record<string, number> = Object.fromEntries(REWARD_RULES.map((r) => [r.kind, r.points]));
export const REWARD_TIERS = [
  { points: 500, label: "5% off your next BioAro test", percent: 5 },
  { points: 1000, label: "10% off your next BioAro test", percent: 10 },
  { points: 2000, label: "15% off your next BioAro test", percent: 15 },
];

// ── Challenges ──────────────────────────────────────────────────────────
export const CHALLENGE_METRICS: Record<string, { label: string; unit: string; defaultGoal: number; min: number; max: number }> = {
  steps: { label: "Steps", unit: "steps a day", defaultGoal: 8000, min: 1000, max: 40000 },
  active: { label: "Active minutes", unit: "minutes a day", defaultGoal: 30, min: 5, max: 300 },
  water: { label: "Water", unit: "glasses a day", defaultGoal: 8, min: 1, max: 20 },
  protocol: { label: "Protocol days", unit: "all steps done", defaultGoal: 1, min: 1, max: 1 },
};

export const MOOD_LABELS = ["", "Low", "Meh", "Okay", "Good", "Great"];
export const STRESS_LABELS = ["", "Calm", "Mild", "Some", "High", "Very high"];
