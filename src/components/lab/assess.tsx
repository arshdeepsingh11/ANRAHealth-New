"use client";

// Futuristic multi-step assessments with instant, guideline-based scoring and
// an ALBA write-up. Used by /longevity, /genomics and /longevity-lab.
// Scores describe habits against published guidelines — not a risk score.
import React, { useMemo, useState } from "react";
import AlbaOrb from "@/components/AlbaOrb";
import { LAB_TESTS, money } from "@/data/bioaroCatalog";
import { CONSULT_HREF } from "@/data/longevityScience";
import { T, card, btnInk, btnGhost, chip, aiText, Thinking, TypeOut, useInView } from "@/components/nea/ui";

// ── Question model ───────────────────────────────────────────────────────
type Q =
  | { k: string; t: "num"; label: string; unit?: string; min: number; max: number; ph?: string; optional?: boolean; hint?: string }
  | { k: string; t: "one"; label: string; opts: string[]; optional?: boolean; hint?: string }
  | { k: string; t: "many"; label: string; opts: string[]; none?: string; optional?: boolean; hint?: string }
  | { k: string; t: "scale"; label: string; lo: string; hi: string; optional?: boolean; hint?: string }
  | { k: string; t: "text"; label: string; ph?: string; optional?: boolean; hint?: string };
type Step = { title: string; sub: string; icon: string; qs: Q[] };
export type Answers = Record<string, string | number | string[] | undefined>;
type Domain = { k: string; l: string; v: number; note: string };
export interface Computed { summary: string; domains: Domain[]; focus: { title: string; note: string }[]; tests: string[]; flags?: string[]; extra?: { l: string; v: number; href?: string }[] }

// ── Shared building blocks ───────────────────────────────────────────────
const num = (a: Answers, k: string) => { const v = Number(a[k]); return isFinite(v) && a[k] !== "" && a[k] !== undefined ? v : null; };
const has = (a: Answers, k: string, v: string) => Array.isArray(a[k]) && (a[k] as string[]).includes(v);
const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
const TONE = (v: number) => (v >= 75 ? "#2E7D5B" : v >= 50 ? "#C98500" : "#D0612E");

const BASICS: Step = { title: "About you", sub: "Age and body size change what guidelines recommend.", icon: "ph-user", qs: [
  { k: "age", t: "num", label: "Age", unit: "years", min: 18, max: 110, ph: "45" },
  { k: "sex", t: "one", label: "Sex at birth", opts: ["Female", "Male", "Intersex / prefer not to say"] },
  { k: "height", t: "num", label: "Height", unit: "cm", min: 120, max: 230, ph: "170", optional: true },
  { k: "weight", t: "num", label: "Weight", unit: "kg", min: 30, max: 300, ph: "72", optional: true },
  { k: "waist", t: "num", label: "Waist (at belly button)", unit: "cm", min: 50, max: 200, ph: "88", optional: true, hint: "Waist size says more about metabolic health than weight alone." },
] };
const FAMILY: Q = { k: "family", t: "many", label: "Family history (parents, brothers, sisters)", opts: ["Heart attack or stroke before 55 (men) / 65 (women)", "Heart disease at any age", "Type 2 diabetes", "Cancer", "Dementia / Alzheimer's", "A parent who lived to 90+", "A known genetic condition"], none: "None / not sure" };
const MEDS: Q = { k: "meds", t: "many", label: "Medicines you take now", opts: ["Blood thinner (clopidogrel, warfarin)", "Statin", "Antidepressant or anxiety medicine", "Pain medicine (codeine, tramadol, NSAIDs)", "Stomach acid medicine (PPI)", "Blood pressure medicine", "Diabetes medicine", "Thyroid medicine"], none: "None" };

const LONGEVITY_STEPS: Step[] = [
  BASICS,
  { title: "Movement", sub: "Canada’s guidelines: 150 minutes of moderate-to-vigorous activity a week, plus strength twice a week.", icon: "ph-person-simple-run", qs: [
    { k: "activeMin", t: "num", label: "Minutes a week of brisk activity (you breathe harder)", unit: "min/week", min: 0, max: 2000, ph: "120" },
    { k: "strengthDays", t: "num", label: "Days a week of strength training", unit: "days", min: 0, max: 7, ph: "1" },
    { k: "sitting", t: "num", label: "Hours sitting on a typical day", unit: "h/day", min: 0, max: 20, ph: "8", optional: true },
  ] },
  { title: "Sleep & stress", sub: "Adults do best with 7–9 hours (7–8 over 65).", icon: "ph-moon-stars", qs: [
    { k: "sleepH", t: "num", label: "Hours of sleep on a typical night", unit: "h", min: 2, max: 14, ph: "7" },
    { k: "sleepQ", t: "scale", label: "How rested do you usually feel?", lo: "Exhausted", hi: "Fully rested" },
    { k: "snore", t: "one", label: "Loud snoring or stopping breathing in sleep?", opts: ["No", "Sometimes", "Often / told so", "Don't know"] },
    { k: "stress", t: "scale", label: "Your usual stress level", lo: "Calm", hi: "Very high" },
    { k: "social", t: "scale", label: "How connected do you feel to people around you?", lo: "Isolated", hi: "Very connected" },
  ] },
  { title: "Food & substances", sub: "Canada’s Food Guide and Canada’s Guidance on Alcohol and Health (2023).", icon: "ph-bowl-food", qs: [
    { k: "veg", t: "num", label: "Servings of vegetables and fruit per day", unit: "servings", min: 0, max: 20, ph: "3" },
    { k: "diet", t: "one", label: "Closest to how you eat", opts: ["Mediterranean-style (plants, olive oil, fish, legumes)", "Mixed / balanced", "Often fast food or processed", "Vegetarian or vegan", "Low-carb / keto"] },
    { k: "drinks", t: "num", label: "Alcoholic drinks per week", unit: "drinks", min: 0, max: 100, ph: "2" },
    { k: "smoke", t: "one", label: "Smoking or vaping", opts: ["Never", "Quit over 10 years ago", "Quit in the last 10 years", "Vape only", "Smoke now"] },
  ] },
  { title: "Health background", sub: "Helps ALBA point to the right tests and conversations.", icon: "ph-heartbeat", qs: [
    FAMILY,
    { k: "conditions", t: "many", label: "Conditions you’ve been told you have", opts: ["High blood pressure", "High cholesterol", "Prediabetes or diabetes", "Heart disease", "Arthritis / autoimmune / IBD", "Thyroid condition", "Depression or anxiety", "Sleep apnea"], none: "None" },
    MEDS,
    { k: "sbp", t: "num", label: "A recent blood pressure — top number", unit: "mmHg", min: 70, max: 250, ph: "124", optional: true },
    { k: "a1c", t: "num", label: "Recent HbA1c, if known", unit: "%", min: 3, max: 18, ph: "5.6", optional: true },
    { k: "symptoms", t: "many", label: "Anything you’ve noticed lately", opts: ["Low energy", "Breathless on stairs", "Slower walking or weaker grip", "Brain fog", "Unplanned weight loss", "Joint pain"], none: "None" },
    { k: "goal", t: "text", label: "What would you most like to improve?", ph: "e.g. energy for my kids, stay sharp, run a 10K at 60", optional: true },
  ] },
];

function computeLongevity(a: Answers): Computed {
  const age = num(a, "age") ?? 45, h = num(a, "height"), w = num(a, "weight"), waist = num(a, "waist");
  const bmi = h && w ? w / Math.pow(h / 100, 2) : null;
  const act = clamp(((num(a, "activeMin") ?? 0) / 150) * 80 + Math.min(2, num(a, "strengthDays") ?? 0) * 10 - Math.max(0, (num(a, "sitting") ?? 0) - 8) * 3);
  const sh = num(a, "sleepH") ?? 7, band: [number, number] = age >= 65 ? [7, 8] : [7, 9];
  const sleep = clamp((sh >= band[0] && sh <= band[1] ? 70 : 70 - Math.min(Math.abs(sh - (sh < band[0] ? band[0] : band[1])) * 18, 60)) + ((num(a, "sleepQ") ?? 3) - 3) * 12 - (a.snore === "Often / told so" ? 15 : 0));
  const dietMap: Record<string, number> = { "Mediterranean-style (plants, olive oil, fish, legumes)": 30, "Mixed / balanced": 18, "Vegetarian or vegan": 22, "Low-carb / keto": 12, "Often fast food or processed": 0 };
  const food = clamp(Math.min(num(a, "veg") ?? 0, 7) / 7 * 70 + (dietMap[a.diet as string] ?? 12));
  const d = num(a, "drinks") ?? 0;
  const smokeMap: Record<string, number> = { Never: 100, "Quit over 10 years ago": 85, "Quit in the last 10 years": 65, "Vape only": 45, "Smoke now": 5 };
  const subs = clamp(((smokeMap[a.smoke as string] ?? 80) * 0.6) + (d <= 2 ? 40 : d <= 6 ? 26 : d <= 14 ? 12 : 0));
  const mind = clamp((6 - (num(a, "stress") ?? 3)) * 12 + (num(a, "social") ?? 3) * 8);
  let meta = 100;
  if (bmi) meta -= bmi >= 30 ? 30 : bmi >= 25 ? 12 : bmi < 18.5 ? 10 : 0;
  if (waist) meta -= waist >= (a.sex === "Male" ? 102 : 88) ? 20 : 0;
  const sbp = num(a, "sbp"); if (sbp) meta -= sbp >= 135 ? 20 : 0;
  const a1c = num(a, "a1c"); if (a1c) meta -= a1c >= 6.5 ? 25 : a1c >= 6.0 ? 12 : 0;
  ["High blood pressure", "High cholesterol", "Prediabetes or diabetes", "Heart disease"].forEach((c) => { if (has(a, "conditions", c)) meta -= 8; });
  meta = clamp(meta);
  const domains: Domain[] = [
    { k: "act", l: "Movement", v: act, note: `${num(a, "activeMin") ?? 0} of 150 guideline minutes a week; ${num(a, "strengthDays") ?? 0} of 2 strength days.` },
    { k: "sleep", l: "Sleep", v: sleep, note: `${sh} h a night against a ${band[0]}–${band[1]} h target${a.snore === "Often / told so" ? "; frequent loud snoring is worth mentioning to your doctor" : ""}.` },
    { k: "food", l: "Nutrition", v: food, note: `${num(a, "veg") ?? 0} servings of vegetables and fruit a day; the guide suggests half your plate.` },
    { k: "subs", l: "Alcohol & smoking", v: subs, note: `${d} drinks a week (2 or fewer is low risk in Canada’s 2023 guidance); smoking: ${a.smoke || "not answered"}.` },
    { k: "mind", l: "Stress & connection", v: mind, note: "Chronic stress and isolation are both linked to faster biological aging." },
    { k: "meta", l: "Metabolic health", v: meta, note: `${bmi ? `BMI ${bmi.toFixed(1)}` : "BMI not entered"}${waist ? `, waist ${waist} cm` : ""}${sbp ? `, BP ${sbp}` : ""}${a1c ? `, HbA1c ${a1c}%` : ""}.` },
  ];
  const sorted = [...domains].sort((x, y) => x.v - y.v);
  const tests = new Map<string, number>();
  const add = (id: string, n: number) => tests.set(id, (tests.get(id) || 0) + n);
  if (subs < 70 || meta < 70 || food < 55 || has(a, "conditions", "Arthritis / autoimmune / IBD")) add("core-inflammation-aging", 3);
  if (meta < 55 || has(a, "family", "Heart attack or stroke before 55 (men) / 65 (women)")) add("advanced-inflammation-aging", 3);
  if (age >= 50 || has(a, "symptoms", "Slower walking or weaker grip") || has(a, "symptoms", "Unplanned weight loss") || act < 50) add("gdf-15", 3);
  if (age >= 40 || mind < 55 || subs < 60 || sleep < 55) add("telomere-length-testing", 2);
  if (Array.isArray(a.meds) && (a.meds as string[]).filter((m) => m !== "None").length >= 2) add("pharmacogenomics-test", 3);
  if ((num(a, "stress") ?? 3) >= 4 || has(a, "symptoms", "Low energy")) add("cortisol", 1);
  if (food < 50) add("essential-vitamin-health", 1);
  if (has(a, "family", "Dementia / Alzheimer's") && age >= 50) add("brain-health", 2);
  const flags: string[] = [];
  if (has(a, "symptoms", "Unplanned weight loss")) flags.push("Unplanned weight loss should be checked by a doctor soon.");
  if (has(a, "symptoms", "Breathless on stairs")) flags.push("New breathlessness on exertion is worth a medical visit.");
  if (sbp && sbp >= 180) flags.push("A blood pressure of 180 or higher needs prompt medical attention.");
  const overall = Math.round(domains.reduce((s, x) => s + x.v, 0) / domains.length);
  return {
    summary: `Your habits line up with guidelines at about ${overall}/100 overall. Strongest: ${sorted[sorted.length - 1].l.toLowerCase()}. Most room to grow: ${sorted[0].l.toLowerCase()} and ${sorted[1].l.toLowerCase()}.`,
    domains, flags,
    focus: sorted.slice(0, 3).map((x) => ({ title: x.l, note: x.note })),
    tests: [...tests.entries()].sort((x, y) => y[1] - x[1]).map(([id]) => id).slice(0, 4),
  };
}

const GENOMICS_STEPS: Step[] = [
  BASICS,
  { title: "What you want to learn", sub: "Pick everything that fits.", icon: "ph-dna", qs: [
    { k: "goals", t: "many", label: "Your goals", opts: ["Inherited disease risk", "How I respond to medicines", "How fast I'm aging", "Gut, skin, oral or vaginal microbiome", "Hormones & energy", "Brain health", "Everything in my genome, once"] },
    { k: "planning", t: "one", label: "Planning a pregnancy in the next few years?", opts: ["No", "Yes", "Prefer not to say"], optional: true },
    { k: "ancestry", t: "text", label: "Ancestry (optional — some variants differ by population)", ph: "e.g. South Asian, Ashkenazi Jewish, Filipino", optional: true },
  ] },
  { title: "Family & medicines", sub: "The strongest signals for which test helps most.", icon: "ph-users-three", qs: [
    FAMILY,
    { k: "familyAge", t: "one", label: "Did any of that happen at a young age (under 50)?", opts: ["Yes", "No", "Not sure"], optional: true },
    MEDS,
    { k: "reaction", t: "one", label: "Ever had a strong side effect or a medicine that ‘didn’t work’?", opts: ["No", "Yes", "Not sure"] },
    { k: "prior", t: "one", label: "Genetic testing before?", opts: ["Never", "Ancestry kit (23andMe, Ancestry)", "Clinical genetic test", "Not sure"] },
  ] },
  { title: "Symptoms & notes", sub: "Optional, but helps ALBA explain the ‘why’.", icon: "ph-note-pencil", qs: [
    { k: "symptoms", t: "many", label: "Anything ongoing", opts: ["Digestive issues", "Skin concerns", "Low energy", "Memory changes", "Menstrual or menopause symptoms", "Gum problems"], none: "None" },
    { k: "notes", t: "text", label: "Anything else ALBA should know?", ph: "e.g. my father had colon cancer at 48", optional: true },
  ] },
];

function computeGenomics(a: Answers): Computed {
  const age = num(a, "age") ?? 45, g = (x: string) => has(a, "goals", x);
  const fam = Array.isArray(a.family) ? (a.family as string[]).filter((x) => !x.startsWith("None")).length : 0;
  const meds = Array.isArray(a.meds) ? (a.meds as string[]).filter((m) => m !== "None").length : 0;
  const S: Record<string, number> = {};
  const add = (id: string, n: number) => (S[id] = (S[id] || 0) + n);
  if (g("Everything in my genome, once")) { add("whole-genome-sequencing-30x", 5); add("genome-testing", 3); }
  if (g("Inherited disease risk")) { add("whole-genome-sequencing-30x", 3); add("disease-based-dna-test", 3); add("whole-exome-sequencing-100x", 2); }
  if (fam >= 2) add("whole-genome-sequencing-30x", 2);
  if (a.familyAge === "Yes" || has(a, "family", "A known genetic condition")) { add("disease-based-dna-test", 3); add("whole-exome-sequencing-100x", 2); }
  if (g("How I respond to medicines")) add("pharmacogenomics-test", 5);
  if (meds >= 1) add("pharmacogenomics-test", 2 + meds);
  if (a.reaction === "Yes") add("pharmacogenomics-test", 3);
  if (g("How fast I'm aging")) { add("telomere-length-testing", 4); add("gdf-15", 3); add("core-inflammation-aging", 2); }
  if (age >= 50) add("gdf-15", 1);
  if (g("Gut, skin, oral or vaginal microbiome") || has(a, "symptoms", "Digestive issues")) add("the-biogut-test", 3);
  if (has(a, "symptoms", "Skin concerns")) add("the-bioskin-test", 3);
  if (has(a, "symptoms", "Gum problems")) add("the-biodental-test", 3);
  if (has(a, "symptoms", "Menstrual or menopause symptoms")) { add("the-biofemme-test", 2); add("hormone-health", 2); }
  if (g("Hormones & energy") || has(a, "symptoms", "Low energy")) add("hormone-health", 3);
  if (g("Brain health") || has(a, "symptoms", "Memory changes") || has(a, "family", "Dementia / Alzheimer's")) add("brain-health", age >= 50 ? 4 : 2);
  if (a.prior === "Clinical genetic test") { S["disease-based-dna-test"] = (S["disease-based-dna-test"] || 0) - 2; }
  const ranked = Object.entries(S).filter(([id]) => LAB_TESTS.some((t) => t.id === "labs-" + id)).sort((x, y) => y[1] - x[1]);
  const top = ranked[0]?.[1] || 1;
  const axis = (n: number) => clamp((n / 8) * 100);
  const domains: Domain[] = [
    { k: "inherit", l: "Inherited risk", v: axis((g("Inherited disease risk") ? 4 : 0) + fam * 1.5 + (a.familyAge === "Yes" ? 2 : 0)), note: `${fam} family-history item${fam === 1 ? "" : "s"} selected.` },
    { k: "meds", l: "Medicines", v: axis((g("How I respond to medicines") ? 4 : 0) + meds * 1.5 + (a.reaction === "Yes" ? 2 : 0)), note: `${meds} current medicine type${meds === 1 ? "" : "s"}.` },
    { k: "aging", l: "Aging biology", v: axis((g("How fast I'm aging") ? 5 : 0) + (age >= 50 ? 2 : 0)), note: "Telomeres, GDF-15 and inflammation reflect aging biology." },
    { k: "micro", l: "Microbiome", v: axis((g("Gut, skin, oral or vaginal microbiome") ? 5 : 0) + ["Digestive issues", "Skin concerns", "Gum problems"].filter((x) => has(a, "symptoms", x)).length * 2), note: "Gut, skin, oral and vaginal microbiome tests." },
    { k: "horm", l: "Hormones", v: axis((g("Hormones & energy") ? 5 : 0) + (has(a, "symptoms", "Low energy") ? 2 : 0) + (has(a, "symptoms", "Menstrual or menopause symptoms") ? 2 : 0)), note: "Energy, cycle and menopause questions." },
    { k: "brain", l: "Brain", v: axis((g("Brain health") ? 5 : 0) + (has(a, "family", "Dementia / Alzheimer's") ? 3 : 0)), note: "Amyloid- and tau-related blood markers." },
  ];
  return {
    summary: ranked.length ? `Your answers point most strongly to ${LAB_TESTS.find((t) => t.id === "labs-" + ranked[0][0])!.name}${ranked[1] ? `, then ${LAB_TESTS.find((t) => t.id === "labs-" + ranked[1][0])!.name}` : ""}.` : "Pick a goal and ALBA will suggest where to start.",
    domains, focus: domains.filter((d) => d.v > 0).sort((x, y) => y.v - x.v).slice(0, 3).map((d) => ({ title: d.l, note: d.note })),
    tests: ranked.map(([id]) => id).slice(0, 4),
    extra: ranked.slice(0, 5).map(([id, n]) => ({ l: LAB_TESTS.find((t) => t.id === "labs-" + id)!.name, v: Math.round((n / top) * 100) })),
  };
}

const LAB_STEPS: Step[] = [
  BASICS,
  { title: "Your habits", sub: "The interventions with the most published evidence.", icon: "ph-leaf", qs: [
    { k: "diet", t: "one", label: "Closest to how you eat", opts: ["Mediterranean-style (plants, olive oil, fish, legumes)", "Mixed / balanced", "Often fast food or processed", "Vegetarian or vegan", "Low-carb / keto"] },
    { k: "smoke", t: "one", label: "Smoking or vaping", opts: ["Never", "Quit over 10 years ago", "Quit in the last 10 years", "Vape only", "Smoke now"] },
    { k: "activeMin", t: "num", label: "Minutes a week of brisk activity", unit: "min/week", min: 0, max: 2000, ph: "120" },
    { k: "frail", t: "many", label: "In the last month…", opts: ["I felt tired most of the time", "Climbing 10 stairs was hard", "Walking a few blocks was hard", "I lost weight without trying"], none: "None of these", hint: "Items from the validated FRAIL scale." },
  ] },
  { title: "Health & family", sub: "Points you to the right feature and test.", icon: "ph-heartbeat", qs: [
    MEDS,
    { k: "conditions", t: "many", label: "Conditions", opts: ["Arthritis / autoimmune / IBD", "Prediabetes or diabetes", "Heart disease", "High blood pressure", "Cancer (now or past)"], none: "None" },
    FAMILY,
    { k: "curious", t: "many", label: "What are you most curious about?", opts: ["What actually slows aging", "My cellular stress", "How fast I'm aging", "Medicine safety", "My longevity genes"] },
  ] },
];

function computeLab(a: Answers): Computed {
  const age = num(a, "age") ?? 45, meds = Array.isArray(a.meds) ? (a.meds as string[]).filter((m) => m !== "None").length : 0;
  const frail = Array.isArray(a.frail) ? (a.frail as string[]).filter((x) => !x.startsWith("None")).length : 0;
  const c = (x: string) => has(a, "curious", x);
  const f = {
    respond: 30 + (c("What actually slows aging") ? 40 : 0) + (a.diet !== "Mediterranean-style (plants, olive oil, fish, legumes)" ? 10 : 0) + (a.smoke === "Smoke now" ? 20 : 0) + ((num(a, "activeMin") ?? 0) < 150 ? 10 : 0),
    stress: 20 + (c("My cellular stress") ? 40 : 0) + frail * 12 + (age >= 60 ? 15 : age >= 45 ? 8 : 0),
    pace: 25 + (c("How fast I'm aging") ? 40 : 0) + (a.smoke === "Smoke now" ? 10 : 0) + (has(a, "conditions", "Prediabetes or diabetes") ? 10 : 0),
    pgx: 15 + (c("Medicine safety") ? 40 : 0) + meds * 12 + (age >= 65 ? 15 : 0),
    genes: 20 + (c("My longevity genes") ? 40 : 0) + (has(a, "family", "A parent who lived to 90+") ? 15 : 0) + (has(a, "family", "Heart attack or stroke before 55 (men) / 65 (women)") ? 15 : 0) + (has(a, "family", "A known genetic condition") ? 15 : 0),
  };
  const names: Record<string, [string, string]> = { respond: ["Intervention Responsiveness", "respond"], stress: ["Cellular Stress Map", "stress"], pace: ["Pace vs Biological Age", "pace"], pgx: ["Medication Safety Check", "pgx"], genes: ["Longevity Genetics", "genes"] };
  const ranked = (Object.entries(f) as [keyof typeof f, number][]).map(([k, v]) => [k, clamp(v)] as const).sort((x, y) => y[1] - x[1]);
  const testsBy: Record<string, string[]> = { respond: ["core-inflammation-aging"], stress: ["gdf-15", "telomere-length-testing"], pace: ["advanced-inflammation-aging"], pgx: ["pharmacogenomics-test"], genes: ["whole-genome-sequencing-30x"] };
  const tests = Array.from(new Set(ranked.slice(0, 3).flatMap(([k]) => testsBy[k])));
  return {
    summary: `Start with the ${names[ranked[0][0]][0]}${ranked[1] ? ` and the ${names[ranked[1][0]][0]}` : ""}.${frail >= 3 ? " Several FRAIL-scale answers were ‘yes’ — worth discussing with a physician." : ""}`,
    domains: ranked.map(([k, v]) => ({ k, l: names[k][0], v, note: "" })),
    focus: ranked.slice(0, 3).map(([k]) => ({ title: names[k][0], note: k === "pgx" ? `${meds} medicine type${meds === 1 ? "" : "s"} selected.` : k === "stress" ? `${frail} of 4 FRAIL items.` : "Matches what you told us." })),
    tests, extra: ranked.map(([k, v]) => ({ l: names[k][0], v, href: `#${names[k][1]}` })),
    flags: frail >= 3 ? ["Three or more FRAIL items can signal frailty — please mention it to your doctor."] : [],
  };
}

const KINDS = { longevity: { steps: LONGEVITY_STEPS, compute: computeLongevity, title: "Healthy Aging Check", sub: "A deeper look at the habits linked to how well you age" },
  genomics: { steps: GENOMICS_STEPS, compute: computeGenomics, title: "Find My Test", sub: "Match your goals, family and medicines to the right test" },
  lab: { steps: LAB_STEPS, compute: computeLab, title: "Where should I start?", sub: "A 2-minute intake that ranks the five Longevity Lab features for you" } };

// ── Charts ───────────────────────────────────────────────────────────────
function Radar({ domains, color }: { domains: Domain[]; color: string }) {
  const n = domains.length, size = 300, c = size / 2, R = size / 2 - 64;
  const [ref, seen] = useInView<HTMLDivElement>();
  const pt = (i: number, v: number) => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; return [c + Math.cos(a) * R * v, c + Math.sin(a) * R * v]; };
  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", maxWidth: 320, display: "block", margin: "0 auto", overflow: "visible" }} role="img" aria-label="Your profile">
        {[0.25, 0.5, 0.75, 1].map((k) => <polygon key={k} points={domains.map((_, i) => pt(i, k).join(",")).join(" ")} fill="none" stroke={T.line} />)}
        {domains.map((d, i) => { const [x, y] = pt(i, 1); const [lx, ly] = pt(i, 1.2); return <g key={d.k}><line x1={c} y1={c} x2={x} y2={y} stroke={T.line2} /><text x={lx} y={ly} fontSize="11" fill={T.muted} textAnchor={Math.abs(lx - c) < 6 ? "middle" : lx > c ? "start" : "end"} dominantBaseline="middle">{d.l}</text></g>; })}
        <polygon points={domains.map((d, i) => pt(i, seen ? d.v / 100 : 0).join(",")).join(" ")} fill={color + "33"} stroke={color} strokeWidth="2" strokeLinejoin="round" style={{ transition: "all 1s cubic-bezier(.2,.8,.2,1)" }} />
        {domains.map((d, i) => { const [x, y] = pt(i, seen ? d.v / 100 : 0); return <circle key={d.k} cx={x} cy={y} r="4" fill="#fff" stroke={color} strokeWidth="2" style={{ transition: "all 1s cubic-bezier(.2,.8,.2,1)" }} />; })}
      </svg>
    </div>
  );
}
function Bars({ rows }: { rows: { l: string; v: number; note?: string; href?: string }[] }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 10 }}>
      {rows.map((r) => {
        const inner = <><span style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}><span>{r.l}</span><b style={{ fontWeight: 600, color: TONE(r.v), fontVariantNumeric: "tabular-nums" }}>{r.v}</b></span>
          <span style={{ height: 8, borderRadius: 4, background: T.line2 }}><span style={{ display: "block", height: "100%", borderRadius: 4, width: seen ? r.v + "%" : 0, background: `linear-gradient(90deg, ${TONE(r.v)}, ${TONE(r.v)}AA)`, transition: "width 1s cubic-bezier(.2,.8,.2,1)" }} /></span>
          {r.note && <span style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.4 }}>{r.note}</span>}</>;
        return r.href ? <a key={r.l} href={r.href} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 4, textDecoration: "none", color: T.ink }}>{inner}</a> : <div key={r.l} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 4 }}>{inner}</div>;
      })}
    </div>
  );
}

export function TestCard({ id, why, accent = "#4A3AA7" }: { id: string; why?: string; accent?: string }) {
  const t = LAB_TESTS.find((x) => x.id === "labs-" + id);
  if (!t) return null;
  return (
    <a href={t.url("CA")} target="_blank" rel="noopener" className="sx-card" style={{ ...card, padding: 16, display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 8, textDecoration: "none", color: T.ink, transition: "transform .25s, box-shadow .25s" }}>
      <span style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}><span style={{ fontSize: 11.5, letterSpacing: ".12em", textTransform: "uppercase", color: accent }}>BioAro Labs · {t.cat}</span><b style={{ fontWeight: 500, fontSize: 18 }}>{money(t.price)}</b></span>
      <b style={{ fontWeight: 500, fontSize: 16.5, lineHeight: 1.25 }}>{t.name}</b>
      <span style={{ fontSize: 14, color: T.ink2, lineHeight: 1.5 }}>{why || t.why}</span>
      <span style={{ fontSize: 12.5, color: T.muted }}>{t.meta}</span>
      <span style={{ fontSize: 12.5, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600, color: accent }}>Order with BioAro ↗</span>
    </a>
  );
}

// ── The wizard ───────────────────────────────────────────────────────────
export default function Assessment({ kind, accent = "#4A3AA7" }: { kind: keyof typeof KINDS; accent?: string }) {
  const K = KINDS[kind];
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({});
  const [err, setErr] = useState<string | null>(null);
  const [res, setRes] = useState<{ c: Computed; ai?: any; loading: boolean } | null>(null);
  const cur = K.steps[step];
  const set = (k: string, v: Answers[string]) => { setA((x) => ({ ...x, [k]: v })); setErr(null); };
  const missing = (s: Step) => s.qs.filter((q) => !q.optional && (a[q.k] === undefined || a[q.k] === "" || (Array.isArray(a[q.k]) && !(a[q.k] as string[]).length)));
  const invalid = (s: Step) => s.qs.filter((q) => q.t === "num" && a[q.k] !== undefined && a[q.k] !== "" && (Number(a[q.k]) < q.min || Number(a[q.k]) > q.max));
  const next = async () => {
    const m = missing(cur), bad = invalid(cur);
    if (bad.length) return setErr(`Check “${bad[0].label}” — it should be between ${(bad[0] as any).min} and ${(bad[0] as any).max}.`);
    if (m.length) return setErr(`Please answer “${m[0].label}”.`);
    if (step < K.steps.length - 1) { setStep(step + 1); window.scrollTo({ top: (document.getElementById("assess-" + kind)?.getBoundingClientRect().top || 0) + window.scrollY - 90, behavior: "smooth" }); return; }
    const c = K.compute(a);
    setRes({ c, loading: true });
    try {
      const r = await fetch("/api/assess", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, answers: a, computed: c }) });
      const j = await r.json();
      setRes({ c, ai: r.ok ? j : null, loading: false });
    } catch { setRes({ c, loading: false }); }
  };
  const restart = () => { setA({}); setStep(0); setRes(null); setErr(null); };
  const pct = Math.round(((res ? K.steps.length : step) / K.steps.length) * 100);

  return (
    <section id={"assess-" + kind} style={{ position: "relative", borderRadius: 28, padding: "clamp(18px,3vw,32px)", background: "linear-gradient(160deg,#FFFFFF 0%,#F7F3FC 55%,#EEF5F6 100%)", border: `1px solid ${T.line}`, boxShadow: "0 30px 70px -45px rgba(20,24,27,.5)", display: "grid", gap: 20, overflow: "hidden" }}>
      <div aria-hidden style={{ position: "absolute", right: -80, top: -80, width: 260, height: 260, borderRadius: "50%", background: `radial-gradient(circle, ${accent}22, transparent 70%)` }} />
      <header style={{ position: "relative", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <AlbaOrb size={42} glow />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: T.violet }}>ALBA assessment</div>
          <h2 style={{ margin: "4px 0 0", fontSize: "clamp(24px,3vw,34px)", fontWeight: 500, letterSpacing: "-.03em" }}>{K.title} <span style={aiText}>· AI-guided</span></h2>
          <p style={{ margin: "4px 0 0", fontSize: 14.5, color: T.muted }}>{K.sub}</p>
        </div>
      </header>
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", gap: 6 }}>{K.steps.map((s, i) => <button key={s.title} onClick={() => !res && i < step && setStep(i)} aria-label={`Step ${i + 1}: ${s.title}`} style={{ flex: 1, height: 6, borderRadius: 3, border: 0, padding: 0, cursor: i < step && !res ? "pointer" : "default", background: res || i < step ? accent : i === step ? `linear-gradient(90deg, ${accent}, ${accent}33)` : T.line2, transition: "background .4s" }} />)}</div>
        <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 12.5, color: T.muted }}><span>{res ? "Your results" : `Step ${step + 1} of ${K.steps.length} · ${cur.title}`}</span><span>{pct}%</span></div>
      </div>

      {!res ? (
        <div key={step} style={{ position: "relative", display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 18, animation: "fadeUp .35s ease" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: accent + "18", color: accent }}><i className={"ph " + cur.icon} style={{ fontSize: 22 }} /></span>
            <div><b style={{ fontWeight: 500, fontSize: 19 }}>{cur.title}</b><div style={{ fontSize: 13.5, color: T.muted }}>{cur.sub}</div></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 16 }}>
            {cur.qs.map((q) => (
              <div key={q.k} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 8, alignContent: "start", gridColumn: q.t === "many" || q.t === "text" ? "1 / -1" : undefined }}>
                <label htmlFor={"q-" + q.k} style={{ fontSize: 14.5, color: T.ink }}>{q.label}{q.optional && <span style={{ color: T.faint }}> · optional</span>}</label>
                {q.t === "num" && <div style={{ position: "relative" }}><input id={"q-" + q.k} inputMode="decimal" value={(a[q.k] as string) ?? ""} placeholder={q.ph} onChange={(e) => set(q.k, e.target.value.replace(/[^\d.]/g, "").slice(0, 6))} style={{ width: "100%", height: 50, padding: "0 70px 0 14px", borderRadius: 14, border: `1px solid ${T.line}`, background: "#fff", fontSize: 17 }} />{q.unit && <span style={{ position: "absolute", right: 14, top: 15, fontSize: 13, color: T.faint }}>{q.unit}</span>}</div>}
                {q.t === "one" && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{q.opts.map((o) => <button key={o} onClick={() => set(q.k, o)} aria-pressed={a[q.k] === o} style={{ ...chip(a[q.k] === o), minHeight: 40, fontSize: 14, whiteSpace: "normal", textAlign: "left", padding: "8px 14px", ...(a[q.k] === o ? { background: accent, borderColor: accent } : {}) }}>{o}</button>)}</div>}
                {q.t === "many" && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{[...q.opts, ...(q.none ? [q.none] : [])].map((o) => { const cur2 = (a[q.k] as string[]) || []; const on = cur2.includes(o); return <button key={o} onClick={() => set(q.k, o === q.none ? [o] : on ? cur2.filter((x) => x !== o) : [...cur2.filter((x) => x !== q.none), o])} aria-pressed={on} style={{ ...chip(on), minHeight: 40, fontSize: 14, whiteSpace: "normal", textAlign: "left", padding: "8px 14px", ...(on ? { background: accent, borderColor: accent } : {}) }}>{on && <i className="ph ph-check" />}{o}</button>; })}</div>}
                {q.t === "scale" && <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 6 }}><div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>{[1, 2, 3, 4, 5].map((v) => <button key={v} onClick={() => set(q.k, v)} aria-pressed={a[q.k] === v} style={{ height: 44, borderRadius: 12, border: `1px solid ${a[q.k] === v ? accent : T.line}`, background: a[q.k] === v ? accent : "#fff", color: a[q.k] === v ? "#fff" : T.ink, fontSize: 16, cursor: "pointer", transition: "all .2s" }}>{v}</button>)}</div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.faint }}><span>{q.lo}</span><span>{q.hi}</span></div></div>}
                {q.t === "text" && <input id={"q-" + q.k} value={(a[q.k] as string) ?? ""} placeholder={q.ph} maxLength={300} onChange={(e) => set(q.k, e.target.value)} style={{ width: "100%", height: 50, padding: "0 14px", borderRadius: 14, border: `1px solid ${T.line}`, background: "#fff", fontSize: 16 }} />}
                {q.hint && <span style={{ fontSize: 12.5, color: T.faint }}>{q.hint}</span>}
              </div>
            ))}
          </div>
          {err && <p role="alert" style={{ margin: 0, color: "#8B2F1C", fontSize: 14 }}>{err}</p>}
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", flexWrap: "wrap" }}>
            <button onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0} style={{ ...btnGhost, opacity: step === 0 ? 0.35 : 1 }}><i className="ph ph-arrow-left" />Back</button>
            <button onClick={next} style={{ ...btnInk, background: `linear-gradient(120deg, ${accent}, #6A5096)` }}>{step < K.steps.length - 1 ? <>Continue<i className="ph ph-arrow-right" /></> : <>Analyse with ALBA<i className="ph ph-sparkle" /></>}</button>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: T.faint }}>Your answers stay in this browser and are only sent to ALBA to write your summary. Education, not a diagnosis.</p>
        </div>
      ) : (
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 18, animation: "fadeUp .4s ease" }}>
          {res.ai?.emergency && <p role="alert" style={{ margin: 0, padding: "14px 16px", borderRadius: 14, background: "#FBE7E1", color: "#8B2F1C" }}>{res.ai.emergency}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: 16, alignItems: "center" }}>
            <div style={{ ...card, padding: 16 }}><Radar domains={res.c.domains} color={accent} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 12 }}>
              <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: T.muted }}>{kind === "lab" ? "Your starting points" : kind === "genomics" ? "Your interest profile" : "Your habits vs guidelines"}</div>
              <Bars rows={(kind === "lab" ? res.c.extra! : res.c.domains.map((d) => ({ l: d.l, v: d.v, note: d.note })))} />
            </div>
          </div>
          {kind === "genomics" && res.c.extra?.length ? <div style={{ ...card, padding: 16 }}><div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: T.muted, marginBottom: 10 }}>Test fit</div><Bars rows={res.c.extra} /></div> : null}
          {!!res.c.flags?.length && res.c.flags.map((f) => <p key={f} role="alert" style={{ margin: 0, padding: "12px 14px", borderRadius: 14, background: "#FBF1E4", color: "#7A4B12", fontSize: 14.5, display: "flex", gap: 8 }}><i className="ph ph-warning" style={{ marginTop: 3 }} />{f}</p>)}
          <div style={{ ...card, padding: "18px 18px", display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 12, background: "linear-gradient(180deg,#fff,#FBF9FD)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}><AlbaOrb size={28} motion={res.loading} /><b style={{ fontWeight: 500 }}>ALBA’s read</b>{res.ai?.byAlba && <span style={{ fontSize: 12, color: T.violet }}>· written by AI</span>}</div>
            {res.loading ? <Thinking label="ALBA is reading your answers" /> : (
              <>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: T.ink2 }}><TypeOut text={res.ai?.summary || res.c.summary} /></p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 10 }}>
                  {(res.ai?.focus?.length ? res.ai.focus : res.c.focus).map((f: { title: string; note: string }, i: number) => <div key={f.title + i} style={{ padding: "12px 14px", borderRadius: 14, background: T.paper, border: `1px solid ${T.line2}`, animation: `fadeUp .4s ${i * 0.08}s both` }}><b style={{ fontWeight: 500, fontSize: 15 }}>{f.title}</b><div style={{ fontSize: 13.5, color: T.muted, marginTop: 4, lineHeight: 1.45 }}>{f.note}</div></div>)}
                </div>
              </>
            )}
          </div>
          {!res.loading && (
            <>
              <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: T.muted }}>Tests that fit what you shared</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,250px),1fr))", gap: 12 }}>
                {((res.ai?.tests?.length ? res.ai.tests : res.c.tests.map((id) => ({ id })))).slice(0, 4).map((t: { id: string; why?: string }) => <TestCard key={t.id} id={t.id} why={t.why} accent={accent} />)}
              </div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderRadius: 18, background: `linear-gradient(120deg, ${accent}14, #6A509614)` }}>
                <span style={{ fontSize: 15.5, maxWidth: 560 }}>{res.ai?.next || "Book an NEYU consultation — a physician reviews your answers and any results with you."}</span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><a href={CONSULT_HREF} style={btnInk}>Book a consultation<i className="ph ph-arrow-right" /></a><button onClick={restart} style={btnGhost}><i className="ph ph-arrow-counter-clockwise" />Retake</button></div>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: T.faint }}>ALBA educates; it does not diagnose. Testing is fulfilled by BioAro Labs; results are interpreted clinically at NEYU.</p>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export const useLabIntake = () => useMemo(() => computeLab, []);
