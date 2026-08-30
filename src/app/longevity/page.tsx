"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, HeartPulse, ArrowRight } from "lucide-react";

const AGE_OPTS = ["Under 30", "30–45", "46–60", "60+"];
const SMOKING_OPTS = ["Never smoked", "Former smoker", "Current smoker"];
const ACTIVITY_OPTS = ["Sedentary (little exercise)", "Light (1–2x/week)", "Moderate (3–4x/week)", "Active (5+x/week)"];
const SLEEP_QUALITY_OPTS = ["Good", "Fair", "Poor"];
const DIET_OPTS = ["Poor", "Fair", "Good", "Excellent"];
const ALCOHOL_OPTS = ["None", "Occasional (1–2/week)", "Moderate (3–7/week)", "Frequent (8+/week)"];
const STRESS_OPTS = ["Low", "Moderate", "High", "Very high"];
const FAMILY_HISTORY_OPTS = ["Heart disease", "Diabetes", "Cancer", "None of these"];
const CONDITIONS_OPTS = ["High blood pressure", "High cholesterol", "Diabetes", "None of these"];

function toggleMulti(arr: string[], val: string) {
  if (val.startsWith("None")) return [val];
  const withoutNone = arr.filter((v) => !v.startsWith("None"));
  return withoutNone.includes(val) ? withoutNone.filter((v) => v !== val) : [...withoutNone, val];
}

interface FocusArea { title: string; note: string; }
interface RiskResult { summary: string; focusAreas: FocusArea[]; suggestedNextStep: string; }

export default function LongevityPage() {
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

  const ChipGroup = ({
    options, selected, onSelect, multi,
  }: { options: string[]; selected: string | string[]; onSelect: (v: string) => void; multi?: boolean }) => (
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

  return (
    <div style={{ background: "linear-gradient(160deg, #313425 0%, #23261a 45%, #14160f 100%)", minHeight: "100vh" }}>
      <Link href="/" className="fixed top-5 left-5 z-40 inline-flex items-center gap-2 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2.5 hover:-translate-x-0.5 transition-transform">
        <ArrowLeft size={15} /> Back to Main Page
      </Link>

      <div className="text-center pt-24 pb-8 px-6">
        <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600 font-display italic">ANRA Health — Longevity</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-graphite-900 flex items-center justify-center gap-3">
          <HeartPulse className="text-gold-500" size={36} />
          Health Risk Assessment
        </h1>
        <p className="text-sm text-graphite-500 mt-3 max-w-xl mx-auto leading-relaxed">
          A quick questionnaire — not a diagnosis, just a friendly starting point for a conversation with a doctor about staying ahead of your health.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-24">
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
                className="w-32 px-4 py-2.5 rounded-xl border border-pearl-300 bg-[#e8e4d5] text-black text-sm outline-none focus:ring-2 focus:ring-gold-500"
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
              <ChipGroup options={FAMILY_HISTORY_OPTS} selected={familyHistory} onSelect={(v) => setFamilyHistory(toggleMulti(familyHistory, v))} multi />
            </div>

            <div>
              <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Known conditions (select all that apply)</p>
              <ChipGroup options={CONDITIONS_OPTS} selected={conditions} onSelect={(v) => setConditions(toggleMulti(conditions, v))} multi />
            </div>

            <div>
              <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Anything else you'd like to mention? (optional)</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="e.g. I've been feeling more tired than usual lately."
                className="w-full px-4 py-3 rounded-xl border border-pearl-300 bg-[#e8e4d5] text-black text-sm outline-none focus:ring-2 focus:ring-gold-500 resize-none"
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
      </div>
    </div>
  );
}