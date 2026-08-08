"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, ChevronDown, AlertTriangle, Sparkles, PhoneCall } from "lucide-react";
import Reveal from "@/components/Reveal";
import { cardiacSymptoms, faqs } from "@/data/content";
import { useLanguage } from "@/i18n/LanguageContext";
import { tc } from "@/i18n/contentTranslations";

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line py-5">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between text-left gap-4">
        <span className="font-semibold text-base">{q}</span>
        <ChevronDown size={18} className="shrink-0 transition-transform" style={{ transform: open ? "rotate(180deg)" : "none", color: "#3B7EA1" }} />
      </button>
      {open && <p className="text-sm leading-relaxed text-inksoft mt-3">{a}</p>}
    </div>
  );
}

// Client-side emergency keyword check — instant, no API delay. This is a first-line
// safety net; the server independently checks again before returning any result.
const EMERGENCY_PATTERNS = [
  /crushing.{0,15}(chest|pain)/i,
  /can'?t breathe/i,
  /difficulty breathing/i,
  /shortness of breath.{0,20}(severe|sudden|can'?t)/i,
  /fainted|passed out|loss of consciousness/i,
  /slurred speech/i,
  /one[- ]?sided weakness|sudden weakness|sudden numbness/i,
  /severe bleeding/i,
  /chest pain.{0,20}(radiating|arm|jaw)/i,
];

function hasEmergencyKeywords(text: string) {
  return EMERGENCY_PATTERNS.some((re) => re.test(text));
}

const URGENCY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  routine: { label: "Routine", color: "#3B7EA1", bg: "#EAF3F7" },
  soon: { label: "Book Soon", color: "#B8860B", bg: "#FBF3E0" },
  urgent: { label: "Urgent", color: "#D65A5A", bg: "#FBEDED" },
  emergency: { label: "Emergency", color: "#FFFFFF", bg: "#D65A5A" },
};

function SymptomChecker({ t }: { t: (k: string) => string }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [instantEmergency, setInstantEmergency] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDescription(val);
    setInstantEmergency(hasEmergencyKeywords(val));
  };

  const handleSubmit = async () => {
    if (description.trim().length < 3) return;
    setError(null);

    // Instant client-side emergency short-circuit — don't wait on the API for this.
    if (hasEmergencyKeywords(description)) {
      setResult({
        emergency: true,
        urgency: "emergency",
        recommendedDiscipline: "Cardiology",
        summary: "This may describe a medical emergency. Please call 911 or go to the nearest emergency room immediately.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/symptom-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(t("symptoms.somethingWrong"));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDescription("");
    setResult(null);
    setInstantEmergency(false);
    setError(null);
  };

  const urgencyStyle = result ? URGENCY_LABELS[result.urgency] || URGENCY_LABELS.routine : null;

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8" style={{ boxShadow: "0 10px 32px rgba(44,62,80,0.08)" }}>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={18} className="text-coral" />
        <p className="text-sm font-semibold tracking-wide uppercase text-coral">{t("symptoms.aiChecker")}</p>
      </div>
      <h2 className="text-xl md:text-2xl font-bold mb-2">{t("symptoms.describeFeeling")}</h2>
      <p className="text-sm text-inksoft mb-6">
        {t("symptoms.disclaimer")}
      </p>

      <textarea
        value={description}
        onChange={handleChange}
        placeholder="e.g. I've had a tight feeling in my chest when climbing stairs for the past week..."
        rows={4}
        className="w-full px-4 py-3 rounded-xl border border-line text-sm bg-bgalt focus:outline-none focus:ring-2 focus:ring-blue resize-none mb-3"
      />

      {instantEmergency && !result && (
        <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-coralsoft border border-coral/30">
          <AlertTriangle size={16} className="text-coral shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-coral">
            {t("symptoms.emergencyWarning")}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSubmit}
          disabled={description.trim().length < 3 || loading}
          className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-blue transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
        >
          {loading ? t("symptoms.checking") : t("symptoms.checkMySymptoms")}
        </button>
        {result && (
          <button
            onClick={reset}
            className="px-5 py-3 rounded-full text-sm font-semibold border border-line text-inksoft hover:bg-bgalt"
          >
            {t("symptoms.checkSomethingElse")}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-coral mt-4">{error}</p>}

      {result && (
        <div className="mt-6 pt-6 border-t border-line">
          {result.emergency ? (
            <div className="rounded-2xl p-6 flex items-start gap-4" style={{ background: "#D65A5A" }}>
              <PhoneCall size={28} className="text-white shrink-0 mt-0.5" />
              <div>
                <p className="text-lg font-bold text-white mb-1">{t("symptoms.call911")}</p>
                {/* Emergency summary text comes from the emergency short-circuit / API — stays as returned */}
                <p className="text-sm text-white/90">{result.summary}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-6 bg-bgalt">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ color: urgencyStyle!.color, background: urgencyStyle!.bg }}
                >
                  {urgencyStyle!.label}
                </span>
                <span className="text-xs font-semibold text-inksoft">
                  {t("symptoms.suggested")}: {result.recommendedDiscipline}
                </span>
              </div>
              {/* AI-generated summary — comes from the API response, stays as returned */}
              <p className="text-sm leading-relaxed text-ink mb-4">{result.summary}</p>
              <p className="text-xs text-inksoft mb-4">
                {t("symptoms.notDiagnosis")}
              </p>
              <Link
                href="/physicians"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue"
              >
                {t("symptoms.findMatchingPhysician")} →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CardiacSymptoms() {
  const { t, lang } = useLanguage();

  return (
    <>
      {/* Emergency banner — moving marquee, always visible, first thing on the page */}
      <div className="bg-coral py-3 overflow-hidden relative">
        <div className="flex whitespace-nowrap emergency-marquee">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="text-sm md:text-base font-bold text-white flex items-center gap-2 mx-8 shrink-0">
              <AlertTriangle size={18} className="shrink-0" />
              {t("symptoms.emergencyBanner")}
            </span>
          ))}
        </div>
        <style>{`
          @keyframes emergency-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .emergency-marquee {
            animation: emergency-scroll 22s linear infinite;
            width: max-content;
          }
        `}</style>
      </div>

      <section className="pt-16 pb-20 px-6 lg:px-10 bg-bgalt">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <p className="text-sm font-semibold tracking-wide uppercase mb-3 text-coral">{t("symptoms.knowSigns")}</p>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-5">{t("symptoms.heading")}</h1>
            <p className="text-base md:text-lg text-inksoft">
              {t("symptoms.subtitle")}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-20 px-6 lg:px-10">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-5">
          {cardiacSymptoms.map((s, i) => (
            <Reveal key={s.name} delay={(i % 2) * 0.08}>
              <div className="card-hover bg-white rounded-2xl p-6 flex gap-4" style={{ boxShadow: "0 6px 20px rgba(44,62,80,0.06)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-coralsoft shrink-0">
                  <AlertCircle size={18} color="#D65A5A" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">{tc(lang, "symptoms", s.name, "name", s.name)}</h3>
                  <p className="text-sm leading-relaxed text-inksoft">{tc(lang, "symptoms", s.name, "desc", s.desc)}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* AI Symptom Checker — placed after the static symptom list, before FAQs */}
      <section className="py-16 md:py-20 px-6 lg:px-10 bg-bgalt">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <SymptomChecker t={t} />
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-20 px-6 lg:px-10">
        <div className="max-w-3xl mx-auto">
          <Reveal><h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{t("symptoms.faqHeading")}</h2></Reveal>
          <Reveal delay={0.1} className="bg-white rounded-2xl px-6 md:px-8" style={{ boxShadow: "0 6px 20px rgba(44,62,80,0.06)" }}>
            {faqs.map((f, i) => (
              <FaqItem
                key={f.q}
                q={tc(lang, "faqs", i, "q", f.q)}
                a={tc(lang, "faqs", i, "a", f.a)}
                defaultOpen={i === 0}
              />
            ))}
          </Reveal>
        </div>
      </section>

      <section className="py-14 px-6 lg:px-10">
        <Reveal className="max-w-4xl mx-auto text-center rounded-3xl py-14 px-6" style={{ background: "linear-gradient(135deg, #EAF3F7, #FBEDED)" }}>
          <h2 className="text-xl md:text-3xl font-bold mb-4">{t("symptoms.experiencing")}</h2>
          <p className="mb-7 text-inksoft">{t("symptoms.dontWait")}</p>
          <Link href="/contact" className="inline-block px-7 py-3 rounded-full text-sm font-semibold text-white bg-blue transition-transform hover:scale-105">
            {t("nav.bookAppointment")}
          </Link>
        </Reveal>
      </section>
    </>
  );
}
