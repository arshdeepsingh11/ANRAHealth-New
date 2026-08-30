"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Sparkles, PhoneCall } from "lucide-react";

// Client-side emergency keyword check — instant, no API delay. First-line
// safety net; server independently checks again before returning any result.
// NON-NEGOTIABLE — carried over unchanged from the original symptom checker,
// and applies identically regardless of which specialty page this renders on.
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
  routine: { label: "Routine", color: "#9E801F", bg: "#EFEBDC" },
  soon: { label: "Book Soon", color: "#8D7A4B", bg: "#F0E1B2" },
  urgent: { label: "Urgent", color: "#D65A5A", bg: "#FBEDED" },
  emergency: { label: "Emergency", color: "#FFFFFF", bg: "#D65A5A" },
};

type Specialty = "cardiology" | "respiratory";

const SPECIALTY_CONFIG: Record<Specialty, { placeholder: string; linkHref: string; linkLabel: string; emergencyDiscipline: string }> = {
  cardiology: {
    placeholder: "e.g. I've had a tight feeling in my chest when climbing stairs for the past week...",
    linkHref: "/specialties/cardiology",
    linkLabel: "Find a matching physician",
    emergencyDiscipline: "Cardiology",
  },
  respiratory: {
    placeholder: "e.g. I've been waking up gasping for air, or snoring loudly and feeling exhausted during the day...",
    linkHref: "/specialties/respiratory-medicine",
    linkLabel: "Learn about our respiratory & sleep services",
    emergencyDiscipline: "Respiratory Medicine",
  },
};

interface SymptomCheckerProps {
  specialty?: Specialty;
}

export default function SymptomChecker({ specialty = "cardiology" }: SymptomCheckerProps) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [instantEmergency, setInstantEmergency] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = SPECIALTY_CONFIG[specialty];

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDescription(val);
    setInstantEmergency(hasEmergencyKeywords(val));
  };

  const handleSubmit = async () => {
    if (description.trim().length < 3) return;
    setError(null);

    if (hasEmergencyKeywords(description)) {
      setResult({
        emergency: true,
        urgency: "emergency",
        recommendedDiscipline: config.emergencyDiscipline,
        summary: "This may describe a medical emergency. Please call 911 or go to the nearest emergency room immediately.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/symptom-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, specialty }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again or call us directly.");
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
    <div className="glass rounded-3xl p-6 md:p-8">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={18} className="text-gold-600" />
        <p className="text-sm font-semibold tracking-wide uppercase text-gold-600">AI Symptom Checker</p>
      </div>
      <h2 className="text-xl md:text-2xl font-bold mb-2 text-graphite-900">Tell us how you're feeling</h2>
      <p className="text-sm text-graphite-500 mb-6">
        This tool provides general guidance only and is not a medical diagnosis. If you're experiencing a medical emergency, call 911 immediately.
      </p>

      <textarea
        value={description}
        onChange={handleChange}
        placeholder={config.placeholder}
        rows={4}
        className="w-full px-4 py-3 rounded-xl border border-pearl-300 text-sm bg-[#e8e4d5] focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none mb-3 text-black"
      />

      {instantEmergency && !result && (
        <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-red-50 border border-red-300">
          <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-red-600">
            This may describe an emergency. If so, call 911 now.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSubmit}
          disabled={description.trim().length < 3 || loading}
          className="gold-gloss px-6 py-3 rounded-full text-sm font-semibold transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
        >
          {loading ? "Checking…" : "Check My Symptoms"}
        </button>
        {result && (
          <button onClick={reset} className="px-5 py-3 rounded-full text-sm font-semibold border border-pearl-300 text-graphite-600 hover:bg-pearl-50">
            Check Something Else
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      {result && (
        <div className="mt-6 pt-6 border-t border-pearl-200">
          {result.emergency ? (
            <div className="rounded-2xl p-6 flex items-start gap-4 bg-red-600">
              <PhoneCall size={28} className="text-white shrink-0 mt-0.5" />
              <div>
                <p className="text-lg font-bold text-white mb-1">Call 911</p>
                <p className="text-sm text-white/90">{result.summary}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-6 bg-pearl-50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: urgencyStyle!.color, background: urgencyStyle!.bg }}>
                  {urgencyStyle!.label}
                </span>
                <span className="text-xs font-semibold text-graphite-500">Suggested: {result.recommendedDiscipline}</span>
              </div>
              <p className="text-sm leading-relaxed text-graphite-800 mb-4">{result.summary}</p>
              <p className="text-xs text-graphite-400 mb-4">This is general guidance, not a diagnosis.</p>
              <Link href={config.linkHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700">
                {config.linkLabel} →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}