"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, HeartPulse, ArrowRight, Salad, CheckCircle2, ExternalLink } from "lucide-react";
import { BIOARO_TESTS, bioaroBookingUrl } from "@/data/bioaroTests";
import Assessment from "@/components/lab/assess";

const TABS = ["Health Risk Assessment", "Nutrition Starter Plan"] as const;
type Tab = (typeof TABS)[number];

// ── Health Risk Assessment options ──────────────────────────────────
const ACTIVITY_OPTS = ["Sedentary (little exercise)", "Light (1–2x/week)", "Moderate (3–4x/week)", "Active (5+x/week)"];

// ── Nutrition Starter Plan options ──────────────────────────────────
const GOAL_OPTS = ["Weight management", "More energy", "Heart health", "Diabetes-friendly eating", "General healthy eating"];
const RESTRICTION_OPTS = ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "No restrictions"];
const NUTRITION_CONDITIONS_OPTS = ["Diabetes", "High cholesterol", "High blood pressure", "None of these"];
const NUTRITION_ACTIVITY_OPTS = ACTIVITY_OPTS;
const EATING_PATTERN_OPTS = ["1–2 meals a day", "3 meals a day", "3 meals + snacks", "Frequent small meals", "Irregular / varies a lot"];
const WATER_INTAKE_OPTS = ["Less than 4 cups", "4–6 cups", "7–9 cups", "10+ cups"];

function toggleMulti(arr: string[], val: string, noneLabel: string) {
  if (val.startsWith(noneLabel) || val === "No restrictions" || val.startsWith("None")) return [val];
  const withoutNone = arr.filter((v) => !v.startsWith("None") && v !== "No restrictions");
  return withoutNone.includes(val) ? withoutNone.filter((v) => v !== val) : [...withoutNone, val];
}

interface FocusArea { title: string; note: string; }
interface SuggestedTest { testName: string; reason: string; }

interface NutritionResult {
  overview: string;
  sampleDay: { breakfast: string; lunch: string; dinner: string; snacks: string };
  generalTips: string[];
  disclaimer: string;
  suggestedTests?: SuggestedTest[];
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

  // ── Nutrition Starter Plan state ──────────────────────────────────
  const [goal, setGoal] = useState("");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [nutritionConditions, setNutritionConditions] = useState<string[]>([]);
  const [nutritionActivity, setNutritionActivity] = useState("");
  const [eatingPattern, setEatingPattern] = useState("");
  const [waterIntake, setWaterIntake] = useState("");
  const [nutritionNotes, setNutritionNotes] = useState("");

  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionError, setNutritionError] = useState<string | null>(null);
  const [nutritionResult, setNutritionResult] = useState<NutritionResult | null>(null);

  const canSubmitNutrition = goal && restrictions.length > 0 && nutritionConditions.length > 0 && nutritionActivity && eatingPattern && waterIntake;

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
          eatingPattern,
          waterIntake,
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
    setGoal(""); setRestrictions([]); setNutritionConditions([]); setNutritionActivity(""); setEatingPattern(""); setWaterIntake(""); setNutritionNotes("");
    setNutritionResult(null); setNutritionError(null);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="text-center pt-16 md:pt-24 pb-6 px-6">
        <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600 font-display italic">NEYU Health — Longevity</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-graphite-900 flex items-center justify-center gap-3">
          <HeartPulse className="text-gold-500" size={36} />
          Longevity
        </h1>
        <p className="text-sm text-graphite-500 mt-3 max-w-xl mx-auto leading-relaxed">
          Tools to help you stay ahead of your health — not diagnoses, just a friendly starting point for a conversation with your care team.
        </p>
      </div>

      <div className="flex md:justify-center gap-2 px-6 pb-10 overflow-x-auto md:overflow-visible md:flex-wrap no-scrollbar">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${tab === t ? "gold-gloss shadow-glow" : "glass text-graphite-600 hover:-translate-y-0.5"}`}>{t}</button>
        ))}
      </div>

      <div className={`${tab === "Health Risk Assessment" ? "max-w-5xl" : "max-w-2xl"} mx-auto px-6 pb-24`}>

        {tab === "Health Risk Assessment" && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-2">AI-guided · Canadian guidelines · about 3 minutes</p>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-graphite-900">Your healthy-aging check</h2>
              <p className="text-sm text-graphite-600 mt-2">Age, sex, height and weight, movement, sleep, food, alcohol, smoking, stress, connection and any numbers you know. Scored against Canadian guidelines, explained by ALBA. Nothing is stored.</p>
            </div>
            <Assessment kind="longevity" accent="#2E7D5B" />
            <Link href="/longevity-lab" className="glass rounded-3xl p-6 md:p-8 flex flex-wrap items-center justify-between gap-4 card-hover">
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-gold-600 mb-1">New · NEYU Longevity Lab</span>
                <span className="block text-base font-semibold text-graphite-900">See what the latest research says about slowing biological aging — with 3D models, live charts and ALBA.</span>
              </span>
              <span className="gold-gloss inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">Open the Lab <ArrowRight size={14} /></span>
            </Link>
          </div>
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
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Typical eating pattern</p>
                  <ChipGroup options={EATING_PATTERN_OPTS} selected={eatingPattern} onSelect={setEatingPattern} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Typical daily water intake</p>
                  <ChipGroup options={WATER_INTAKE_OPTS} selected={waterIntake} onSelect={setWaterIntake} />
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

                {nutritionResult.suggestedTests && nutritionResult.suggestedTests.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-3">Tests That Might Be Worth Exploring</p>
                    <div className="space-y-3">
                      {nutritionResult.suggestedTests.map((t) => {
                        const test = BIOARO_TESTS.find((bt) => bt.name === t.testName);
                        return (
                          <div key={t.testName} className="rounded-2xl p-4 bg-pearl-50">
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <p className="text-sm font-bold text-graphite-900">{t.testName}</p>
                              {test && <span className="text-xs font-bold text-gold-700 shrink-0">{test.price}</span>}
                            </div>
                            <p className="text-sm text-graphite-600 leading-relaxed mb-2">{t.reason}</p>
                            {test && (
                              <a href={bioaroBookingUrl(test)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700">
                                Book with BioAro Labs <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-graphite-400 mt-3">Provided through our lab partner, BioAro Labs — optional, and not required to move forward.</p>
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