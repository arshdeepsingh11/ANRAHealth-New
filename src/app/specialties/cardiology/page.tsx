"use client";

import React, { useState, useMemo } from "react";
import * as Icons from "lucide-react";
import Link from "next/link";
import {
  ArrowLeft, AlertCircle, AlertTriangle, ChevronDown, ChevronRight, Phone, MapPin, Clock,
  Globe2, GraduationCap, Sparkles, RotateCcw, X, Loader2,
} from "lucide-react";
import SymptomChecker from "@/components/SymptomChecker";
import { physicians, Physician } from "@/data/physicians";
import { cardiacSymptoms, faqs, aboutStory, locations, brand, services, whyChoose, languages } from "@/data/content";

const TABS = ["Overview", "Services", "Physicians", "Cardiac Symptoms", "About", "Contact"] as const;
type Tab = (typeof TABS)[number];

const CONCERNS = [
  { key: "general-cardiology", label: "General Cardiology", exact: ["Cardiology"], related: ["Internal Medicine"] },
  { key: "arrhythmia", label: "Arrhythmia / Heart Rhythm", exact: ["Cardiology"], related: ["Internal Medicine"] },
  { key: "stress-testing", label: "Stress Testing / Chest Pain", exact: ["Cardiology"], related: ["Internal Medicine"] },
  { key: "internal-medicine", label: "General Internal Medicine", exact: ["Internal Medicine"], related: ["Cardiology"] },
  { key: "endocrinology", label: "Endocrinology / Diabetes / Thyroid", exact: ["Endocrinology"], related: ["Internal Medicine"] },
  { key: "rheumatology", label: "Rheumatology", exact: ["Rheumatology"], related: [] },
  { key: "pediatrics", label: "Pediatrics", exact: ["Pediatrics"], related: [] },
];

const LOCATION_OPTS = ["No preference", "North East", "Meadow Miles"];

function allLanguages() {
  const set = new Set<string>();
  physicians.forEach((p) => p.languages.forEach((l) => set.add(l)));
  return ["No preference", ...Array.from(set).sort()];
}

function scorePhysician(p: Physician, concern: any, location: string, language: string) {
  let score = 0;
  if (concern) {
    if (concern.exact.some((d: string) => p.disciplines.includes(d))) score += 10;
    else if (concern.related.some((d: string) => p.disciplines.includes(d))) score += 4;
  }
  if (location !== "No preference" && p.location === location) score += 5;
  if (language !== "No preference" && p.languages.includes(language)) score += 3;
  score += Math.min(p.qualifications.length * 0.1, 0.5);
  return score;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-pearl-200 py-5">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between text-left gap-4">
        <span className="font-semibold text-base text-graphite-900">{q}</span>
        <ChevronDown size={18} className="shrink-0 text-gold-600 transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && <p className="text-sm leading-relaxed text-graphite-600 mt-3">{a}</p>}
    </div>
  );
}

function PhysicianCard({ p, onOpen }: { p: Physician; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="glass rounded-2xl p-7 card-hover text-left w-full">
      <h3 className="text-lg font-bold text-graphite-900 mb-1">{p.name}</h3>
      <p className="text-xs font-semibold text-gold-600 mb-4">{p.title}</p>
      <p className="text-sm text-graphite-600 mb-5 leading-relaxed">{p.bio}</p>
      <div className="space-y-1.5 text-xs text-graphite-500 border-t border-pearl-200 pt-4">
        <p className="flex items-center gap-2"><MapPin size={13} className="text-gold-600" /> {p.location}</p>
        <p className="flex items-center gap-2"><Globe2 size={13} className="text-gold-600" /> {p.languages.join(", ")}</p>
      </div>
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 mt-4">View profile <ChevronRight size={13} /></span>
    </button>
  );
}

function PhysicianModal({ p, onClose }: { p: Physician; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(30,28,24,0.55)" }} onClick={onClose}>
      <div className="glass rounded-3xl w-full max-w-lg p-8 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-graphite-900">{p.name}</h3>
            <p className="text-xs font-semibold text-gold-600 mt-1">{p.title}</p>
          </div>
          <button onClick={onClose} className="text-graphite-400 hover:text-graphite-700"><X size={20} /></button>
        </div>
        <p className="text-sm text-graphite-600 leading-relaxed mb-6">{p.bio}</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-2 flex items-center gap-1.5"><GraduationCap size={13} /> Qualifications</p>
        <ul className="mb-6 space-y-1.5">
          {p.qualifications.map((q) => (
            <li key={q} className="text-xs text-graphite-600 flex gap-2"><span className="text-gold-500">•</span> {q}</li>
          ))}
        </ul>
        <div className="space-y-2 text-sm text-graphite-600 border-t border-pearl-200 pt-5">
          <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-gold-600" /> {p.address}</p>
          <p className="flex items-center gap-2"><Phone size={14} className="text-gold-600" /> {p.phone}</p>
          <p className="flex items-center gap-2"><Globe2 size={14} className="text-gold-600" /> {p.languages.join(", ")}</p>
        </div>
      </div>
    </div>
  );
}

export default function CardiologyPage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [selected, setSelected] = useState<Physician | null>(null);
  const [openService, setOpenService] = useState<any>(null);

  const [results, setResults] = useState<Physician[] | null>(null);
  const langOpts = useMemo(allLanguages, []);

  // Free-text matcher state
  const [freeTextConcern, setFreeTextConcern] = useState("");
  const [matchingFreeText, setMatchingFreeText] = useState(false);
  const [freeTextError, setFreeTextError] = useState<string | null>(null);
  const [lastMatchedLabel, setLastMatchedLabel] = useState<string | null>(null);

  const cardiacServices = services.filter((s) =>
    ["cardiology-consultation", "exercise-stress-echo", "ecg", "holter-monitoring", "echocardiography", "carotid-ultrasound", "myocardial-perfusion-imaging", "ambulatory-bp-monitoring"].includes(s.slug)
  );

  const computeMatches = (concern: any, locationVal: string, languageVal: string) => {
    const ranked = [...physicians]
      .map((p) => ({ p, score: scorePhysician(p, concern, locationVal, languageVal) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
    setResults(ranked.slice(0, 3).map((r) => r.p));
  };

  const runFreeTextMatch = async () => {
    if (freeTextConcern.trim().length < 5) return;
    setMatchingFreeText(true);
    setFreeTextError(null);
    setLastMatchedLabel(null);
    try {
      const res = await fetch("/api/physician-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: freeTextConcern }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      if (!data.concernLabel) {
        setFreeTextError("Couldn't quite match that to a category — try rephrasing with a bit more detail.");
        return;
      }
      const matchedConcern = CONCERNS.find((c) => c.label === data.concernLabel) || null;
      const matchedLocation = data.location && LOCATION_OPTS.includes(data.location) ? data.location : "No preference";
      const matchedLanguage = data.language && langOpts.includes(data.language) ? data.language : "No preference";

      setLastMatchedLabel(data.concernLabel);
      computeMatches(matchedConcern, matchedLocation, matchedLanguage);
    } catch {
      setFreeTextError("Something went wrong matching that — please try again.");
    } finally {
      setMatchingFreeText(false);
    }
  };

  const resetMatcher = () => {
    setFreeTextConcern(""); setLastMatchedLabel(null); setFreeTextError(null); setResults(null);
  };

  return (
    <div style={{ background: "linear-gradient(160deg, #313425 0%, #23261a 45%, #14160f 100%)", minHeight: "100vh" }}>
      <Link href="/" className="fixed top-5 left-5 z-40 inline-flex items-center gap-2 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2.5 hover:-translate-x-0.5 transition-transform">
        <ArrowLeft size={15} /> Back to Main Page
      </Link>

      <div className="text-center pt-24 pb-6 px-6">
        <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600 font-display italic">ANRA Health — Medical Specialties</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-graphite-900">Cardiology</h1>
      </div>

      <div className="flex justify-center flex-wrap gap-2 px-6 pb-10">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${tab === t ? "gold-gloss shadow-glow" : "glass text-graphite-600 hover:-translate-y-0.5"}`}>{t}</button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-24">
        {tab === "Overview" && (
          <div className="space-y-8">
            {/* Video hero with Dr. Kapoor's tagline */}
            <div className="relative rounded-3xl overflow-hidden" style={{ height: "460px" }}>
              <video
                src="/videos/cardiology-hero.mp4"
                autoPlay muted loop playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(30,28,24,0.88) 0%, rgba(30,28,24,0.5) 50%, rgba(30,28,24,0.25) 100%)" }} />
              <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12">
                <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-gold-300">Precision Medicine • AI-Assisted Care • Prevention • Longevity</p>
                <h2 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight mb-4 max-w-2xl">Healthcare Designed Around You</h2>
                <p className="text-sm md:text-base text-white/85 max-w-xl leading-relaxed mb-6">
                  AnraHealth combines specialist physicians, advanced diagnostics, genomics, artificial intelligence and preventive medicine to deliver personalized healthcare for every stage of life.
                </p>
                <div className="grid grid-cols-3 gap-6 max-w-md">
                  <div><p className="text-2xl md:text-3xl font-bold text-white">2</p><p className="text-xs text-white/70 mt-1">Calgary Locations</p></div>
                  <div><p className="text-2xl md:text-3xl font-bold text-white">10+</p><p className="text-xs text-white/70 mt-1">Languages Spoken</p></div>
                  <div><p className="text-2xl md:text-3xl font-bold text-white">1</p><p className="text-xs text-white/70 mt-1">Regional First</p></div>
                </div>
              </div>
            </div>

            {/* Three pillars */}
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { t: "Precision", d: "Individualized treatment using genomics, imaging and AI." },
                { t: "Prevention", d: "Early detection before disease develops." },
                { t: "Longevity", d: "Helping patients live longer and healthier." },
              ].map((p) => (
                <div key={p.t} className="glass rounded-2xl p-7 text-center card-hover">
                  <h3 className="text-lg font-display font-bold text-graphite-900 mb-2">{p.t}</h3>
                  <p className="text-sm text-graphite-600 leading-relaxed">{p.d}</p>
                </div>
              ))}
            </div>

            {/* Why ANRA Health */}
            <div className="glass rounded-3xl p-8 md:p-10">
              <h2 className="text-xl font-bold mb-8 text-center text-graphite-900">Why AnraHealth</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {whyChoose.map((w) => {
                  const Icon = (Icons as any)[w.icon] || Icons.Award;
                  return (
                    <div key={w.title} className="text-center">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center bg-gold-50">
                        <Icon size={20} className="text-gold-600" />
                      </div>
                      <h3 className="text-sm font-semibold mb-2 text-graphite-900">{w.title}</h3>
                      <p className="text-sm leading-relaxed text-graphite-600">{w.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Conditions + referral */}
            <div className="glass rounded-3xl p-8 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-4">Conditions Treated</p>
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {["Chest pain", "Arrhythmias", "Coronary artery disease", "Hypertension", "Lipid disorders", "Valve disease", "Preventive cardiology", "Women's heart health"].map((c) => (
                  <div key={c} className="flex items-center gap-2 text-sm text-graphite-700"><span className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" /> {c}</div>
                ))}
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-3">When should you see a cardiologist?</p>
              <p className="text-base leading-relaxed text-graphite-700 mb-6">
                If you experience chest discomfort, shortness of breath, palpitations, dizziness, or have risk factors such as high blood pressure, high cholesterol, diabetes, or a family history of heart disease, a cardiology consultation is recommended.
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-3">Referral Requirements</p>
              <p className="text-base leading-relaxed text-graphite-700">
                A referral from your family physician is typically required. Please bring your Alberta Health Card, photo ID, and a current medication list to your first appointment.
              </p>
            </div>

            {/* Languages */}
            <div className="glass rounded-3xl p-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-4">Multilingual Care</p>
              <div className="flex flex-wrap justify-center gap-2.5">
                {languages.map((l) => (
                  <span key={l} className="px-4 py-1.5 rounded-full text-sm bg-pearl-100 text-graphite-600 border border-pearl-300">{l}</span>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div className="glass rounded-3xl p-8 md:p-10">
              <h2 className="text-xl font-bold mb-6 text-graphite-900">Frequently Asked Questions</h2>
              {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>
        )}

        {tab === "Services" && (
          <div className="grid sm:grid-cols-2 gap-5">
            {cardiacServices.map((s) => {
              const Icon = (Icons as any)[s.icon] || Icons.Activity;
              return (
                <button key={s.slug} onClick={() => setOpenService(s)} className="glass rounded-2xl p-7 card-hover text-left">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 bg-gold-50">
                    <Icon size={18} className="text-gold-600" />
                  </div>
                  <h3 className="text-base font-semibold mb-2 text-graphite-900">{s.name}</h3>
                  <p className="text-sm leading-relaxed text-graphite-600">{s.short}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 mt-4">Read more <ChevronRight size={13} /></span>
                </button>
              );
            })}
          </div>
        )}

        {tab === "Physicians" && (
          <div className="space-y-8">
            {/* Free-text matcher — describe your concern in your own words */}
            <div className="glass rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={18} className="text-gold-600" />
                <p className="text-sm font-semibold tracking-wide uppercase text-gold-600">Find Your Physician</p>
              </div>
              <h2 className="text-xl font-bold mb-5 text-graphite-900">Tell us what's going on, in your own words</h2>
              <textarea
                value={freeTextConcern}
                onChange={(e) => setFreeTextConcern(e.target.value)}
                rows={3}
                placeholder="e.g. I get dizzy after meals and my heart races sometimes."
                className="w-full px-4 py-3 rounded-xl border border-pearl-300 bg-[#e8e4d5] text-black text-sm outline-none focus:ring-2 focus:ring-gold-500 resize-none mb-4"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={runFreeTextMatch}
                  disabled={freeTextConcern.trim().length < 5 || matchingFreeText}
                  className="gold-gloss px-6 py-2.5 rounded-full text-sm font-semibold disabled:opacity-40 flex items-center gap-2"
                >
                  {matchingFreeText ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {matchingFreeText ? "Matching…" : "Find my physician"}
                </button>
                {results && (
                  <button onClick={resetMatcher} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold border border-pearl-300 text-graphite-600">
                    <RotateCcw size={14} /> Reset
                  </button>
                )}
              </div>
              {freeTextError && <p className="text-sm text-red-600 mt-3">{freeTextError}</p>}
              {lastMatchedLabel && !freeTextError && (
                <p className="text-xs text-graphite-500 mt-3">Matched to: <span className="font-semibold text-gold-700">{lastMatchedLabel}</span></p>
              )}

              {results && (
                <div className="mt-6 pt-6 border-t border-pearl-200">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-4">Best matches</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {results.map((p) => <PhysicianCard key={p.slug} p={p} onOpen={() => setSelected(p)} />)}
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-4">Our Physicians</p>
              <div className="grid sm:grid-cols-2 gap-5">
                {physicians.map((p) => <PhysicianCard key={p.slug} p={p} onOpen={() => setSelected(p)} />)}
              </div>
            </div>
          </div>
        )}

        {tab === "Cardiac Symptoms" && (
          <div className="space-y-8">
            <div className="rounded-2xl bg-red-600 py-3 overflow-hidden relative">
              <div className="flex whitespace-nowrap emergency-marquee">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="text-sm md:text-base font-bold text-white flex items-center gap-2 mx-8 shrink-0">
                    <AlertTriangle size={18} className="shrink-0" />
                    Chest pain, difficulty breathing, or a medical emergency? Call 911 immediately.
                  </span>
                ))}
              </div>
              <style>{`
                @keyframes emergency-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .emergency-marquee { animation: emergency-scroll 22s linear infinite; width: max-content; }
              `}</style>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {cardiacSymptoms.map((s) => (
                <div key={s.name} className="glass rounded-2xl p-6 flex gap-4 card-hover">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 shrink-0">
                    <AlertCircle size={18} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1 text-graphite-900">{s.name}</h3>
                    <p className="text-sm leading-relaxed text-graphite-600">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <SymptomChecker />
          </div>
        )}

        {tab === "About" && (
          <div className="glass rounded-3xl p-8 md:p-10">
            {aboutStory.split("\n\n").map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-graphite-700 mb-4">{p}</p>
            ))}
            <p className="text-sm text-gold-700 font-semibold mt-6">Founded under the guidance of {brand.founder}</p>
          </div>
        )}

        {tab === "Contact" && (
          <div className="grid sm:grid-cols-2 gap-5">
            {locations.map((l) => (
              <div key={l.tag} className="glass rounded-2xl p-7">
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-2">{l.tag}</p>
                <h3 className="text-xl font-bold text-graphite-900 mb-4">{l.name}</h3>
                <div className="space-y-2.5 text-sm text-graphite-600 mb-5">
                  <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-gold-600" /> {l.address}</p>
                  <p className="flex items-center gap-2"><Phone size={14} className="text-gold-600" /> {l.phone}</p>
                  <p className="flex items-center gap-2"><Clock size={14} className="text-gold-600" /> {brand.hours}</p>
                </div>
                <iframe title={l.name} className="w-full h-44 rounded-xl border-0" loading="lazy" src={`https://www.google.com/maps?q=${encodeURIComponent(l.address)}&output=embed`} />
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <PhysicianModal p={selected} onClose={() => setSelected(null)} />}

      {openService && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(30,28,24,0.55)" }} onClick={() => setOpenService(null)}>
          <div className="glass rounded-3xl w-full max-w-lg p-8 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-graphite-900">{openService.name}</h3>
              <button onClick={() => setOpenService(null)} className="text-graphite-400 hover:text-graphite-700"><X size={20} /></button>
            </div>
            <p className="text-sm text-graphite-600 leading-relaxed">{openService.long}</p>
          </div>
        </div>
      )}
    </div>
  );
}