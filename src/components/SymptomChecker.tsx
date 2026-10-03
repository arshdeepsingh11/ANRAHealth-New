"use client";

import React, { useState } from "react";
import Link from "next/link";
import AlbaOrb from "@/components/AlbaOrb";
import { NIcon } from "@/components/neyu/icons";

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
  routine: { label: "Routine", color: "#1B7F63", bg: "#E4F5EF" },
  soon: { label: "Book soon", color: "#8A5A12", bg: "#FBF0DC" },
  urgent: { label: "Urgent", color: "#A93A2C", bg: "#FBE9E4" },
  emergency: { label: "Emergency", color: "#FFFFFF", bg: "#B8433A" },
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

  const ink = "#0E1B2C", ink2 = "#33465A", muted = "#5E6B78", line = "#E2E6E8";
  const pill = (primary: boolean): React.CSSProperties => ({ height: 48, padding: "0 22px", borderRadius: 999, border: primary ? 0 : `1px solid ${line}`, background: primary ? "linear-gradient(120deg,#2FBF94 0%,#1FA7B4 45%,#2273D6 100%)" : "#fff", color: primary ? "#fff" : ink2, fontSize: 14, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 });
  return (
    <div style={{ background: "#fff", border: `1px solid ${line}`, borderRadius: 26, padding: "clamp(18px,3vw,30px)", display: "grid", gap: 14, boxShadow: "0 30px 60px -44px rgba(14,27,44,.35)", color: ink }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <AlbaOrb size={26} />
        <span style={{ fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", color: "#1FA7B4", fontWeight: 600 }}>Neyu · AI symptom check</span>
      </div>
      <h2 style={{ margin: 0, fontSize: "clamp(22px,2.6vw,28px)", fontWeight: 500, letterSpacing: "-.02em" }}>Tell Neyu how you’re feeling</h2>
      <p style={{ margin: 0, fontSize: 14.5, color: muted, lineHeight: 1.55 }}>General guidance only — not a medical diagnosis. If you’re experiencing a medical emergency, call 911 immediately.</p>

      <textarea value={description} onChange={handleChange} placeholder={config.placeholder} rows={4} aria-label="Describe your symptoms"
        style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", borderRadius: 18, border: `1px solid ${line}`, background: "#FAFBFB", fontSize: 16, lineHeight: 1.5, color: ink, resize: "vertical", fontFamily: "inherit", outline: "none" }} />

      {instantEmergency && !result && (
        <div role="alert" style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: 14, background: "#FBE9E4", border: "1px solid #F0B9AC" }}>
          <NIcon name="alert" size={18} tone="#A93A2C" style={{ marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: "#A93A2C" }}>This may describe an emergency. If so, call 911 now.</p>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button onClick={handleSubmit} disabled={description.trim().length < 3 || loading} style={{ ...pill(true), opacity: description.trim().length < 3 || loading ? 0.45 : 1 }}>
          <NIcon name="spark" size={16} tone="light" />{loading ? "Neyu is reading…" : "Check my symptoms"}
        </button>
        {result && <button onClick={reset} style={pill(false)}>Check something else</button>}
      </div>

      {error && <p role="alert" style={{ margin: 0, fontSize: 14.5, color: "#A93A2C" }}>{error}</p>}

      {result && (
        <div aria-live="polite" style={{ animation: "fadeUp .3s ease" }}>
          {result.emergency ? (
            <div style={{ borderRadius: 20, padding: 20, display: "flex", gap: 14, alignItems: "flex-start", background: "#B8433A", color: "#fff" }}>
              <NIcon name="phone" size={28} tone="light" />
              <div><p style={{ margin: "0 0 4px", fontSize: 19, fontWeight: 600 }}>Call 911</p><p style={{ margin: 0, fontSize: 15, opacity: 0.92 }}>{result.summary}</p></div>
            </div>
          ) : (
            <div style={{ borderRadius: 20, padding: 20, background: "linear-gradient(160deg,#FFFFFF,#F1F9F7)", border: "1px solid rgba(47,191,148,.28)", display: "grid", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, padding: "4px 12px", borderRadius: 999, color: urgencyStyle!.color, background: urgencyStyle!.bg }}>{urgencyStyle!.label}</span>
                <span style={{ fontSize: 13.5, color: muted }}>Suggested: {result.recommendedDiscipline}</span>
              </div>
              <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: ink }}>{result.summary}</p>
              <p style={{ margin: 0, fontSize: 12.5, color: "#8A96A3" }}>This is general guidance, not a diagnosis.</p>
              <Link href={config.linkHref} style={{ fontSize: 14, fontWeight: 600, color: "#1D5FA8", textDecoration: "none" }}>{config.linkLabel} →</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
