"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, Dna, ExternalLink, ArrowRight, X, ChevronRight, Microscope, Users, ShieldCheck } from "lucide-react";
import { BIOARO_TESTS, bioaroBookingUrl, type BioAroTest } from "@/data/bioaroTests";

const TABS = ["Overview", "Available Tests", "Find My Test", "Contact"] as const;
type Tab = (typeof TABS)[number];

const CATEGORY_ORDER = [
  "Biological Aging & Healthspan",
  "Genome Sequencing",
  "Microbiome",
  "Vitamin & Nutritional Status",
  "Vascular & Organ Stress",
];

const GOAL_OPTS = [
  "Understand my genetic health risks",
  "Optimize gut health",
  "Check hormone & inflammation levels",
  "Personalize my medications",
  "Explore my ancestry",
  "General curiosity about my genetics",
];

const CONCERN_OPTS = [
  "Digestive issues",
  "Low energy / fatigue",
  "Skin concerns",
  "Medication side effects in the past",
  "Reproductive health",
  "None of these",
];

const FAMILY_HISTORY_OPTS = ["Heart disease", "Cancer", "Diabetes", "Autoimmune conditions", "None of these"];
const AGE_RANGE_OPTS = ["Under 30", "30–45", "46–60", "60+"];
const PRIOR_TESTING_OPTS = ["Never had genetic testing", "Had DNA ancestry testing (e.g. 23andMe)", "Had clinical genetic testing before", "Not sure"];

function toggleMulti(arr: string[], val: string) {
  if (val.startsWith("None")) return [val];
  const withoutNone = arr.filter((v) => !v.startsWith("None"));
  return withoutNone.includes(val) ? withoutNone.filter((v) => v !== val) : [...withoutNone, val];
}

interface Recommendation { testName: string; reason: string; category: string; }
interface QuizResult { intro: string; recommendations: Recommendation[]; }

function ChipGroup({
  options, selected, onSelect,
}: { options: string[]; selected: string[]; onSelect: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onSelect(o)}
          className={`px-4 py-2 rounded-full text-sm font-semibold ${selected.includes(o) ? "gold-gloss" : "border border-pearl-300 text-graphite-600"}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function TestModal({ test, onClose }: { test: BioAroTest; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(58,70,63,0.55)" }} onClick={onClose}>
      <div className="glass rounded-3xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-semibold text-gold-600 mb-1">{test.categoryLabel}</p>
            <h3 className="text-xl font-bold text-graphite-900">{test.name}</h3>
          </div>
          <button onClick={onClose} className="text-graphite-400 hover:text-graphite-700"><X size={20} /></button>
        </div>
        <p className="text-sm text-graphite-600 leading-relaxed mb-2">{test.desc}</p>
        <p className="text-sm font-bold text-gold-700 mb-6">From {test.price}</p>
        <a href={bioaroBookingUrl(test)} target="_blank" rel="noopener noreferrer" className="gold-gloss inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
          Book with BioAro Labs <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}

export default function GenomicsPage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [openTest, setOpenTest] = useState<BioAroTest | null>(null);

  // Quiz state
  const [goals, setGoals] = useState<string[]>([]);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [priorTesting, setPriorTesting] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);

  const canSubmit = goals.length > 0;

  const runQuiz = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/genomics-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals, concerns, familyHistory, ageRange: ageRange || undefined, priorTesting: priorTesting || undefined, notes: notes || undefined }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Something went wrong generating your recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const restartQuiz = () => {
    setGoals([]); setConcerns([]); setFamilyHistory([]); setAgeRange(""); setPriorTesting(""); setNotes("");
    setResult(null); setError(null);
  };

  const recommendedTests = result
    ? result.recommendations
        .map((r) => BIOARO_TESTS.find((t) => t.name === r.testName))
        .filter((t): t is BioAroTest => Boolean(t))
    : [];

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="px-5 pt-5 md:hidden">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2.5">
          <ArrowLeft size={15} /> Back to Main Page
        </Link>
      </div>
      <Link href="/" className="hidden md:inline-flex fixed top-5 left-5 z-40 items-center gap-2 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2.5 hover:-translate-x-0.5 transition-transform">
        <ArrowLeft size={15} /> Back to Main Page
      </Link>

      <div className="text-center pt-6 md:pt-24 pb-6 px-6">
        <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600 font-display italic">ANRA Health — Precision Medicine</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-graphite-900 flex items-center justify-center gap-3">
          <Dna className="text-gold-500" size={36} />
          Genomics
        </h1>
      </div>

      <div className="flex md:justify-center gap-2 px-6 pb-10 overflow-x-auto md:overflow-visible md:flex-wrap no-scrollbar">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${tab === t ? "gold-gloss shadow-glow" : "glass text-graphite-600 hover:-translate-y-0.5"}`}>{t}</button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-24">

        {tab === "Overview" && (
          <div className="space-y-8">
            <div className="glass rounded-3xl p-8 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-4">In Partnership With BioAro Labs</p>
              <p className="text-base leading-relaxed text-graphite-700 mb-4">
                BioAro Labs is a Calgary-based precision health company offering genomic, microbiome, and biomarker testing — from full genome sequencing to gut, hormone, and vascular panels. Results are clinically guided and delivered through secure, encrypted reports.
              </p>
              <p className="text-base leading-relaxed text-graphite-700">
                ANRA Health connects patients to this testing as part of a broader precision medicine approach — combining your genetics, biomarkers, and lifestyle with our physicians' expertise to build a health plan that's actually built around you.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { icon: Microscope, t: "30+ Lab-Grade Tests", d: "From full genome sequencing to targeted microbiome and vascular panels." },
                { icon: Users, t: "Clinically Guided Reports", d: "Context you can actually act on, not just raw numbers." },
                { icon: ShieldCheck, t: "Secure Health Data", d: "Encrypted end-to-end — your genetic information stays yours." },
              ].map((p) => (
                <div key={p.t} className="glass rounded-2xl p-7 text-center card-hover">
                  <p.icon size={26} className="text-gold-500 mx-auto mb-3" strokeWidth={1.5} />
                  <h3 className="text-base font-display font-bold text-graphite-900 mb-2">{p.t}</h3>
                  <p className="text-sm text-graphite-600 leading-relaxed">{p.d}</p>
                </div>
              ))}
            </div>

            <div className="glass rounded-3xl p-8 text-center">
              <p className="text-sm text-graphite-700 mb-5">Not sure which test fits what you're curious about?</p>
              <button onClick={() => setTab("Find My Test")} className="gold-gloss inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold">
                <Sparkles size={14} /> Find My Test
              </button>
            </div>
          </div>
        )}

        {tab === "Available Tests" && (
          <div className="space-y-10">
            {CATEGORY_ORDER.map((category) => (
              <div key={category}>
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-4">{category}</p>
                <div className="grid sm:grid-cols-2 gap-5">
                  {BIOARO_TESTS.filter((t) => t.categoryLabel === category).map((t) => (
                    <button key={t.name} onClick={() => setOpenTest(t)} className="glass rounded-2xl p-6 card-hover text-left">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-base font-semibold text-graphite-900">{t.name}</h3>
                        <span className="text-xs font-bold text-gold-700 shrink-0">{t.price}</span>
                      </div>
                      <p className="text-sm text-graphite-600 leading-relaxed line-clamp-2">{t.desc}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 mt-4">Read more <ChevronRight size={13} /></span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-xs text-graphite-500 text-center pt-2">More tests are available directly through BioAro Labs — this list will keep growing.</p>
          </div>
        )}

        {tab === "Find My Test" && (
          <div className="max-w-2xl mx-auto">
            {!result && (
              <div className="glass rounded-3xl p-6 md:p-8 space-y-7">
                <p className="text-sm text-graphite-500">A few quick questions to find which BioAro Labs test fits what you're curious about.</p>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">What are you hoping to learn? (select all that apply)</p>
                  <ChipGroup options={GOAL_OPTS} selected={goals} onSelect={(v) => setGoals(toggleMulti(goals, v))} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Any current concerns? (select all that apply)</p>
                  <ChipGroup options={CONCERN_OPTS} selected={concerns} onSelect={(v) => setConcerns(toggleMulti(concerns, v))} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Family history (select all that apply)</p>
                  <ChipGroup options={FAMILY_HISTORY_OPTS} selected={familyHistory} onSelect={(v) => setFamilyHistory(toggleMulti(familyHistory, v))} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Age range</p>
                  <ChipGroup options={AGE_RANGE_OPTS} selected={ageRange ? [ageRange] : []} onSelect={(v) => setAgeRange(v)} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Have you had genetic testing before?</p>
                  <ChipGroup options={PRIOR_TESTING_OPTS} selected={priorTesting ? [priorTesting] : []} onSelect={(v) => setPriorTesting(v)} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Anything else you'd like to mention? (optional)</p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="e.g. I've never had genetic testing before and I'm not sure where to start."
                    className="w-full px-4 py-3 rounded-xl border border-pearl-300 bg-white text-graphite-900 text-sm outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                  />
                </div>

                <button
                  onClick={runQuiz}
                  disabled={!canSubmit || loading}
                  className="gold-gloss px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 disabled:opacity-40"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {loading ? "Finding your matches…" : "Find My Tests"}
                </button>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            )}

            {result && (
              <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-gold-600" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">Recommended For You</p>
                </div>
                <p className="text-base leading-relaxed text-graphite-800">{result.intro}</p>

                <div className="space-y-3">
                  {result.recommendations.map((r, i) => {
                    const test = BIOARO_TESTS.find((t) => t.name === r.testName);
                    return (
                      <div key={r.testName} className="rounded-2xl p-5 bg-pearl-50">
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full gold-gloss flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                            <p className="text-sm font-bold text-graphite-900">{r.testName}</p>
                          </div>
                          {test && <span className="text-xs font-bold text-gold-700 shrink-0">{test.price}</span>}
                        </div>
                        <p className="text-sm text-graphite-600 leading-relaxed mb-3">{r.reason}</p>
                        {test && (
                          <a href={bioaroBookingUrl(test)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700">
                            Book with BioAro Labs <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-pearl-200 pt-5 space-y-3">
                  <p className="text-xs text-graphite-500">
                    These tests are provided through our lab partner, BioAro Labs. Book directly with them, or talk to our team first if you'd like guidance.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/referral-centre" className="gold-gloss inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
                      Talk to Our Team <ArrowRight size={14} />
                    </Link>
                    <button onClick={restartQuiz} className="px-5 py-2.5 rounded-full text-sm font-semibold border border-pearl-300 text-graphite-600">
                      Start Over
                    </button>
                  </div>
                </div>

                <p className="text-xs text-graphite-400 pt-2">This is general guidance to help you explore your options, not a medical recommendation.</p>
              </div>
            )}
          </div>
        )}

        {tab === "Contact" && (
          <div className="glass rounded-2xl p-7 max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-2">BioAro Labs</p>
            <h3 className="text-xl font-bold text-graphite-900 mb-4">Genomic, Microbiome & Biomarker Testing</h3>
            <p className="text-sm text-graphite-600 leading-relaxed mb-5">
              BioAro Labs operates testing across Canada, with sample collection kits available throughout North America. For booking, pricing, and detailed test information, visit their site directly.
            </p>
            <a href="https://bioarolabs.com" target="_blank" rel="noopener noreferrer" className="gold-gloss inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
              Visit BioAro Labs <ExternalLink size={14} />
            </a>
          </div>
        )}

      </div>

      {openTest && <TestModal test={openTest} onClose={() => setOpenTest(null)} />}
    </div>
  );
}