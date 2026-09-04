"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, HeartPulse, ArrowRight, Salad, CheckCircle2 } from "lucide-react";

const TABS = ["Health Risk Assessment", "Nutrition Starter Plan"] as const;
type Tab = (typeof TABS)[number];

// ── Health Risk Assessment options ──────────────────────────────────
const AGE_OPTS = ["Under 30", "30–45", "46–60", "60+"];
const SMOKING_OPTS = ["Never smoked", "Former smoker", "Current smoker"];
const ACTIVITY_OPTS = ["Sedentary (little exercise)", "Light (1–2x/week)", "Moderate (3–4x/week)", "Active (5+x/week)"];
const SLEEP_QUALITY_OPTS = ["Good", "Fair", "Poor"];
const DIET_OPTS = ["Poor", "Fair", "Good", "Excellent"];
const ALCOHOL_OPTS = ["None", "Occasional (1–2/week)", "Moderate (3–7/week)", "Frequent (8+/week)"];
const STRESS_OPTS = ["Low", "Moderate", "High", "Very high"];
const FAMILY_HISTORY_OPTS = ["Heart disease", "Diabetes", "Cancer", "None of these"];
const CONDITIONS_OPTS = ["High blood pressure", "High cholesterol", "Diabetes", "None of these"];

// ── Nutrition Starter Plan options ──────────────────────────────────
const GOAL_OPTS = ["Weight management", "More energy", "Heart health", "Diabetes-friendly eating", "General healthy eating"];
const RESTRICTION_OPTS = ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "No restrictions"];
const NUTRITION_CONDITIONS_OPTS = ["Diabetes", "High cholesterol", "High blood pressure", "None of these"];
const NUTRITION_ACTIVITY_OPTS = ACTIVITY_OPTS;

function toggleMulti(arr: string[], val: string, noneLabel: string) {
  if (val.startsWith(noneLabel) || val === "No restrictions" || val.startsWith("None")) return [val];
  const withoutNone = arr.filter((v) => !v.startsWith("None") && v !== "No restrictions");
  return withoutNone.includes(val) ? withoutNone.filter((v) => v !== val) : [...withoutNone, val];
}

interface FocusArea { title: string; note: string; }
interface RiskResult { summary: string; focusAreas: FocusArea[]; suggestedNextStep: string; }

interface NutritionResult {
  overview: string;
  sampleDay: { breakfast: string; lunch: string; dinner: string; snacks: string };
  generalTips: string[];
  disclaimer: string;
}

function ChipGroup({
  options, selected, onSelect, multi,
}: { options: string[]; selected: string | string[]; onSelect: (v: string) => void; multi?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = multi ? (selected as string[]).includes(o) : selected === o;
        return (
          <button
            key={o}
            onClick={() => onSelect(o)}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${active ? "gold-gloss" : "border border-pearl-300 text-graphite-600"}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export default function LongevityPage() {
  const [tab, setTab] = useState<Tab>("Health Risk Assessment");

  // ── Health Risk Assessment state ──────────────────────────────────
  const [age, setAge] = useState("");
  const [smoking, setSmoking] = useState("");
  const [activity, setActivity] = useState("");
  const [sleepQuality, setSleepQuality] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [diet, setDiet] = useState("");
  const [alcohol, setAlcohol] = useState("");
  const [stress, setStress] = useState("");
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RiskResult | null>(null);

  const canSubmit =
    age && smoking && activity && sleepQuality && sleepHours.trim() !== "" &&
    diet && alcohol && stress &&
    familyHistory.length > 0 && conditions.length > 0;

  const runAssessment = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/longevity-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: {
            age, smoking, activity,
            sleepQuality, sleepHoursPerNight: sleepHours,
            dietQuality: diet, alcoholConsumption: alcohol, stressLevel: stress,
            familyHistory, conditions,
            additionalNotes: notes || "none",
          },
        }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Something went wrong generating your summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setAge(""); setSmoking(""); setActivity("");
    setSleepQuality(""); setSleepHours("");
    setDiet(""); setAlcohol(""); setStress("");
    setFamilyHistory([]); setConditions([]); setNotes("");
    setResult(null); setError(null);
  };

  // ── Nutrition Starter Plan state ──────────────────────────────────
  const [goal, setGoal] = useState("");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [nutritionConditions, setNutritionConditions] = useState<string[]>([]);
  const [nutritionActivity, setNutritionActivity] = useState("");
  const [nutritionNotes, setNutritionNotes] = useState("");

  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionError, setNutritionError] = useState<string | null>(null);
  const [nutritionResult, setNutritionResult] = useState<NutritionResult | null>(null);

  const canSubmitNutrition = goal && restrictions.length > 0 && nutritionConditions.length > 0 && nutritionActivity;

  const runNutritionPlan = async () => {
    if (!canSubmitNutrition) return;
    setNutritionLoading(true);
    setNutritionError(null);
    try {
      const res = await fetch("/api/nutrition-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          restrictions,
          conditions: nutritionConditions,
          activity: nutritionActivity,
          notes: nutritionNotes || undefined,
        }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setNutritionResult(data);
    } catch {
      setNutritionError("Something went wrong generating your plan. Please try again.");
    } finally {
      setNutritionLoading(false);
    }
  };

  const restartNutrition = () => {
    setGoal(""); setRestrictions([]); setNutritionConditions([]); setNutritionActivity(""); setNutritionNotes("");
    setNutritionResult(null); setNutritionError(null);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Link href="/" className="fixed top-5 left-5 z-40 inline-flex items-center gap-2 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2.5 hover:-translate-x-0.5 transition-transform">
        <ArrowLeft size={15} /> Back to Main Page
      </Link>

      <div className="text-center pt-24 pb-6 px-6">
        <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600 font-display italic">ANRA Health — Longevity</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-graphite-900 flex items-center justify-center gap-3">
          <HeartPulse className="text-gold-500" size={36} />
          Longevity
        </h1>
        <p className="text-sm text-graphite-500 mt-3 max-w-xl mx-auto leading-relaxed">
          Tools to help you stay ahead of your health — not diagnoses, just a friendly starting point for a conversation with your care team.
        </p>
      </div>

      <div className="flex justify-center flex-wrap gap-2 px-6 pb-10">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${tab === t ? "gold-gloss shadow-glow" : "glass text-graphite-600 hover:-translate-y-0.5"}`}>{t}</button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-24">

        {tab === "Health Risk Assessment" && (
          <>
            {!result && (
              <div className="glass rounded-3xl p-6 md:p-8 space-y-7">
                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Age range</p>
                  <ChipGroup options={AGE_OPTS} selected={age} onSelect={setAge} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Smoking status</p>
                  <ChipGroup options={SMOKING_OPTS} selected={smoking} onSelect={setSmoking} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Activity level</p>
                  <ChipGroup options={ACTIVITY_OPTS} selected={activity} onSelect={setActivity} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Sleep quality</p>
                  <ChipGroup options={SLEEP_QUALITY_OPTS} selected={sleepQuality} onSelect={setSleepQuality} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Average hours of sleep per night</p>
                  <input
                    type="number"
                    min={0}
                    max={14}
                    step={0.5}
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    placeholder="e.g. 7"
                    className="w-32 px-4 py-2.5 rounded-xl border border-pearl-300 bg-white text-graphite-900 text-sm outline-none focus:ring-2 focus:ring-gold-500"
                  />
                  <span className="text-xs text-graphite-500 ml-2">hours</span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Diet quality</p>
                  <ChipGroup options={DIET_OPTS} selected={diet} onSelect={setDiet} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Alcohol consumption</p>
                  <ChipGroup options={ALCOHOL_OPTS} selected={alcohol} onSelect={setAlcohol} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Stress level</p>
                  <ChipGroup options={STRESS_OPTS} selected={stress} onSelect={setStress} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Family history (select all that apply)</p>
                  <ChipGroup options={FAMILY_HISTORY_OPTS} selected={familyHistory} onSelect={(v) => setFamilyHistory(toggleMulti(familyHistory, v, "None"))} multi />
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Known conditions (select all that apply)</p>
                  <ChipGroup options={CONDITIONS_OPTS} selected={conditions} onSelect={(v) => setConditions(toggleMulti(conditions, v, "None"))} multi />
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Anything else you'd like to mention? (optional)</p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="e.g. I've been feeling more tired than usual lately."
                    className="w-full px-4 py-3 rounded-xl border border-pearl-300 bg-white text-graphite-900 text-sm outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                  />
                </div>

                <button
                  onClick={runAssessment}
                  disabled={!canSubmit || loading}
                  className="gold-gloss px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 disabled:opacity-40"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {loading ? "Generating your summary…" : "Get My Summary"}
                </button>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            )}

            {result && (
              <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-gold-600" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">Your Summary</p>
                </div>
                <p className="text-base leading-relaxed text-graphite-800">{result.summary}</p>

                {result.focusAreas.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-3">Areas Worth a Look</p>
                    <div className="space-y-3">
                      {result.focusAreas.map((f) => (
                        <div key={f.title} className="rounded-2xl p-4 bg-pearl-50">
                          <p className="text-sm font-bold text-graphite-900 mb-1">{f.title}</p>
                          <p className="text-sm text-graphite-600 leading-relaxed">{f.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-pearl-200 pt-5">
                  <p className="text-sm text-graphite-700 mb-4">{result.suggestedNextStep}</p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/referral-centre" className="gold-gloss inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
                      Book a Consultation <ArrowRight size={14} />
                    </Link>
                    <button onClick={restart} className="px-5 py-2.5 rounded-full text-sm font-semibold border border-pearl-300 text-graphite-600">
                      Start Over
                    </button>
                  </div>
                </div>

                <p className="text-xs text-graphite-400 pt-2">This is general guidance, not a medical diagnosis or a validated clinical risk score.</p>
              </div>
            )}
          </>
        )}

        {tab === "Nutrition Starter Plan" && (
          <>
            {!nutritionResult && (
              <div className="glass rounded-3xl p-6 md:p-8 space-y-7">
                <div className="flex items-center gap-2 mb-1">
                  <Salad size={16} className="text-gold-600" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">In partnership with Nea Precision Nutrition</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Primary goal</p>
                  <ChipGroup options={GOAL_OPTS} selected={goal} onSelect={setGoal} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Dietary restrictions (select all that apply)</p>
                  <ChipGroup options={RESTRICTION_OPTS} selected={restrictions} onSelect={(v) => setRestrictions(toggleMulti(restrictions, v, "No restrictions"))} multi />
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Relevant health conditions (select all that apply)</p>
                  <ChipGroup options={NUTRITION_CONDITIONS_OPTS} selected={nutritionConditions} onSelect={(v) => setNutritionConditions(toggleMulti(nutritionConditions, v, "None"))} multi />
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Activity level</p>
                  <ChipGroup options={NUTRITION_ACTIVITY_OPTS} selected={nutritionActivity} onSelect={setNutritionActivity} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Anything else you'd like to mention? (optional)</p>
                  <textarea
                    value={nutritionNotes}
                    onChange={(e) => setNutritionNotes(e.target.value)}
                    rows={3}
                    placeholder="e.g. I usually skip breakfast and eat most of my food later in the day."
                    className="w-full px-4 py-3 rounded-xl border border-pearl-300 bg-white text-graphite-900 text-sm outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                  />
                </div>

                <button
                  onClick={runNutritionPlan}
                  disabled={!canSubmitNutrition || nutritionLoading}
                  className="gold-gloss px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 disabled:opacity-40"
                >
                  {nutritionLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {nutritionLoading ? "Generating your draft plan…" : "Get My Starter Plan"}
                </button>
                {nutritionError && <p className="text-sm text-red-600">{nutritionError}</p>}
              </div>
            )}

            {nutritionResult && (
              <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-2">
                  <Salad size={16} className="text-gold-600" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">Your Starter Plan Draft</p>
                </div>
                <p className="text-base leading-relaxed text-graphite-800">{nutritionResult.overview}</p>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-3">A Sample Day</p>
                  <div className="space-y-2.5">
                    {[
                      ["Breakfast", nutritionResult.sampleDay.breakfast],
                      ["Lunch", nutritionResult.sampleDay.lunch],
                      ["Dinner", nutritionResult.sampleDay.dinner],
                      ["Snacks", nutritionResult.sampleDay.snacks],
                    ].map(([label, text]) => text && (
                      <div key={label} className="rounded-2xl p-4 bg-pearl-50">
                        <p className="text-xs font-bold uppercase tracking-wide text-gold-700 mb-1">{label}</p>
                        <p className="text-sm text-graphite-700 leading-relaxed">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {nutritionResult.generalTips.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-2">General Tips</p>
                    <ul className="space-y-1.5">
                      {nutritionResult.generalTips.map((tip) => (
                        <li key={tip} className="flex items-start gap-2 text-sm text-graphite-700">
                          <CheckCircle2 size={14} className="text-gold-500 mt-0.5 shrink-0" /> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-pearl-200 pt-5">
                  <p className="text-sm font-bold text-graphite-900 leading-relaxed mb-4">{nutritionResult.disclaimer}</p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/referral-centre" className="gold-gloss inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
                      Book a Consultation <ArrowRight size={14} />
                    </Link>
                    <button onClick={restartNutrition} className="px-5 py-2.5 rounded-full text-sm font-semibold border border-pearl-300 text-graphite-600">
                      Start Over
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}