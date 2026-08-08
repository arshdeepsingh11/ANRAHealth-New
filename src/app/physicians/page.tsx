"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { X, MapPin, Phone, Globe2, GraduationCap, ChevronRight, Sparkles, RotateCcw } from "lucide-react";
import Reveal from "@/components/Reveal";
import { physicians, Physician } from "@/data/physicians";
import { useLanguage } from "@/i18n/LanguageContext";
import { tc } from "@/i18n/contentTranslations";

const photos: Record<string, string> = {};

// ---------- Matcher config ----------
// Concern -> discipline mapping. "related" disciplines score lower than exact matches.
const CONCERNS = [
  { key: "general-cardiology", label: "General Cardiology", exact: ["Cardiology"], related: ["Internal Medicine"] },
  { key: "arrhythmia", label: "Arrhythmia / Heart Rhythm", exact: ["Cardiology"], related: ["Internal Medicine"] },
  { key: "stress-testing", label: "Stress Testing / Chest Pain", exact: ["Cardiology"], related: ["Internal Medicine"] },
  { key: "internal-medicine", label: "General Internal Medicine", exact: ["Internal Medicine"], related: ["Cardiology"] },
  { key: "endocrinology", label: "Endocrinology / Diabetes / Thyroid", exact: ["Endocrinology"], related: ["Internal Medicine"] },
  { key: "rheumatology", label: "Rheumatology", exact: ["Rheumatology"], related: [] },
  { key: "pediatrics", label: "Pediatrics", exact: ["Pediatrics"], related: [] },
];

const LOCATIONS = ["No preference", "North East", "Meadow Miles"];

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
  if (location && location !== "No preference" && p.location === location) score += 5;
  if (language && language !== "No preference" && p.languages.includes(language)) score += 3;
  score += Math.min(p.qualifications.length * 0.1, 0.5);
  return score;
}

function PhysicianMatcher({ onMatch, t, lang }: { onMatch: (p: Physician) => void; t: (k: string) => string; lang: string }) {
  const [concernKey, setConcernKey] = useState("");
  const [location, setLocation] = useState("No preference");
  const [language, setLanguage] = useState("No preference");
  const [results, setResults] = useState<Physician[] | null>(null);
  const languages = useMemo(allLanguages, []);

  const findMatches = () => {
    const concern = CONCERNS.find((c) => c.key === concernKey) || null;
    const ranked = [...physicians]
      .map((p) => ({ p, score: scorePhysician(p, concern, location, language) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
    setResults(ranked.slice(0, 3).map((r) => r.p));
  };

  const reset = () => {
    setConcernKey("");
    setLocation("No preference");
    setLanguage("No preference");
    setResults(null);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8" style={{ boxShadow: "0 10px 32px rgba(44,62,80,0.08)" }}>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={18} className="text-coral" />
        <p className="text-sm font-semibold tracking-wide uppercase text-coral">{t("physicians.findYourPhysician")}</p>
      </div>
      <h2 className="text-xl md:text-2xl font-bold mb-6">{t("physicians.answerQuestions")}</h2>

      <div className="grid md:grid-cols-3 gap-5 mb-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-inksoft mb-2">{t("physicians.whatsYourConcern")}</label>
          <select
            value={concernKey}
            onChange={(e) => setConcernKey(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-line text-sm bg-bgalt focus:outline-none focus:ring-2 focus:ring-blue"
          >
            <option value="">{t("physicians.selectConcern")}</option>
            {CONCERNS.map((c) => (
              <option key={c.key} value={c.key}>{tc(lang, "concerns", c.key, "label", c.label)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-inksoft mb-2">{t("physicians.preferredLocation")}</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-line text-sm bg-bgalt focus:outline-none focus:ring-2 focus:ring-blue"
          >
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>{l === "No preference" ? t("physicians.noPreference") : l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-inksoft mb-2">{t("physicians.preferredLanguage")}</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-line text-sm bg-bgalt focus:outline-none focus:ring-2 focus:ring-blue"
          >
            {languages.map((l) => (
              <option key={l} value={l}>{l === "No preference" ? t("physicians.noPreference") : l}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-2">
        <button
          onClick={findMatches}
          disabled={!concernKey}
          className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-blue transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
        >
          {t("physicians.findMyMatch")}
        </button>
        {results && (
          <button
            onClick={reset}
            className="px-5 py-3 rounded-full text-sm font-semibold border border-line text-inksoft inline-flex items-center gap-1.5 hover:bg-bgalt"
          >
            <RotateCcw size={14} /> {t("physicians.startOver")}
          </button>
        )}
      </div>

      {results && (
        <div className="mt-6 pt-6 border-t border-line">
          {results.length === 0 ? (
            <p className="text-sm text-inksoft">{t("physicians.noMatches")}</p>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue mb-4">
                {results.length === 1 ? t("physicians.bestMatch") : t("physicians.topMatches")}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((p, i) => (
                  <button
                    key={p.slug}
                    onClick={() => onMatch(p)}
                    className="text-left bg-bgalt rounded-2xl p-5 hover:bg-bluesoft transition-colors relative"
                  >
                    {i === 0 && (
                      <span className="absolute -top-2 -right-2 text-[10px] font-bold px-2 py-1 rounded-full text-white bg-coral">
                        {t("physicians.bestFit")}
                      </span>
                    )}
                    <h3 className="text-sm font-bold mb-1">{p.name}</h3>
                    <p className="text-xs text-blue font-medium mb-2">{tc(lang, "physicians", p.slug, "title", p.title)}</p>
                    <p className="text-xs text-inksoft flex items-center gap-1.5">
                      <MapPin size={12} /> {tc(lang, "locations", p.location, "tag", p.location)}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Avatar({ physician }: { physician: Physician }) {
  const src = photos[physician.photo || ""];
  if (src) {
    return <img src={src} alt={physician.name} className="w-full h-full object-cover" />;
  }
  const initials = physician.name.replace("Dr. ", "").split(" ").map((n) => n[0]).slice(0, 2).join("");
  return (
    <div className="w-full h-full flex items-center justify-center bg-bluesoft">
      <span className="text-2xl font-bold text-blue">{initials}</span>
    </div>
  );
}

function PhysicianModal({ physician, onClose, t, lang }: { physician: Physician | null; onClose: () => void; t: (k: string) => string; lang: string }) {
  if (!physician) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6" style={{ background: "rgba(44,62,80,0.5)" }} onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white flex justify-end p-4 border-b border-line">
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-bgalt" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0" style={{ boxShadow: "0 8px 24px rgba(44,62,80,0.12)" }}>
              <Avatar physician={physician} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{physician.name}</h2>
              <p className="text-sm font-semibold text-blue mb-3">{tc(lang, "physicians", physician.slug, "title", physician.title)}</p>
              <div className="flex flex-wrap gap-2">
                {physician.disciplines.map((d) => (
                  <span key={d} className="text-xs px-3 py-1 rounded-full bg-bgalt text-inksoft border border-line">{d}</span>
                ))}
              </div>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-inksoft mb-6">{tc(lang, "physicians", physician.slug, "bio", physician.bio)}</p>

          <div className="grid sm:grid-cols-2 gap-5 mb-6">
            <div className="flex items-start gap-3">
              <MapPin size={17} className="mt-0.5 shrink-0 text-blue" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-inksoft mb-1">{tc(lang, "locations", physician.location, "name", physician.location)}</p>
                <p className="text-sm text-ink">{physician.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={17} className="mt-0.5 shrink-0 text-blue" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-inksoft mb-1">{t("physicians.phone")}</p>
                <p className="text-sm text-ink">{physician.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe2 size={17} className="mt-0.5 shrink-0 text-blue" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-inksoft mb-1">{t("physicians.languages")}</p>
                <p className="text-sm text-ink">{physician.languages.join(", ")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <GraduationCap size={17} className="mt-0.5 shrink-0 text-blue" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-inksoft mb-1">{t("physicians.qualifications")}</p>
                <ul className="text-sm text-ink space-y-1">
                  {physician.qualifications.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 rounded-full text-sm font-semibold text-white bg-blue transition-transform hover:scale-105"
          >
            {t("nav.bookAppointment")} <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Physicians() {
  const [selected, setSelected] = useState<Physician | null>(null);
  const { t, lang } = useLanguage();

  return (
    <>
      <section className="pt-16 pb-20 px-6 lg:px-10 bg-bgalt">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <Reveal>
            <p className="text-sm font-semibold tracking-wide uppercase mb-3 text-coral">{t("physicians.ourTeam")}</p>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-5">{t("physicians.meetOur")}</h1>
            <p className="text-base md:text-lg text-inksoft">
              {t("physicians.subtitle")}
            </p>
          </Reveal>
        </div>

        <div className="max-w-4xl mx-auto">
          <Reveal delay={0.1}>
            <PhysicianMatcher onMatch={(p) => setSelected(p)} t={t} lang={lang} />
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-20 px-6 lg:px-10">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {physicians.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 0.07}>
              <button
                onClick={() => setSelected(p)}
                className="card-hover text-left bg-white rounded-2xl overflow-hidden w-full"
                style={{ boxShadow: "0 6px 20px rgba(44,62,80,0.06)" }}
              >
                <div className="aspect-square overflow-hidden">
                  <Avatar physician={p} />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold mb-1">{p.name}</h3>
                  <p className="text-sm text-blue font-medium mb-2">{tc(lang, "physicians", p.slug, "title", p.title)}</p>
                  <p className="text-xs text-inksoft flex items-center gap-1.5">
                    <MapPin size={13} /> {tc(lang, "locations", p.location, "tag", p.location)}
                  </p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      <PhysicianModal physician={selected} onClose={() => setSelected(null)} t={t} lang={lang} />
    </>
  );
}
