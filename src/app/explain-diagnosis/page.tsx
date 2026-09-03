"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, BookOpenCheck, ArrowRight, AlertTriangle, HelpCircle, Paperclip, Camera } from "lucide-react";

interface KeyFinding {
  term: string;
  explanation: string;
}

interface ExplainResult {
  plainExplanation: string;
  keyFindings: KeyFinding[];
  commonQuestions: string[];
}

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] || "";
      resolve({ base64, mimeType: file.type || "image/jpeg" });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ExplainDiagnosisPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExplainResult | null>(null);

  const attachInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const runExplainText = async () => {
    if (text.trim().length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/explain-diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const runExplainImage = async (file: File, mode: "attach" | "scan") => {
    if (file.size > 10 * 1024 * 1024) {
      setError("That file is a bit large — try a smaller file to reduce size.");
      return;
    }
    mode === "attach" ? setAttaching(true) : setScanning(true);
    setError(null);
    setFileName(file.name);
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const res = await fetch("/api/explain-diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Couldn't read that file. Try a clearer photo or PDF, or paste the text instead.");
    } finally {
      setAttaching(false);
      setScanning(false);
      if (attachInputRef.current) attachInputRef.current.value = "";
      if (scanInputRef.current) scanInputRef.current.value = "";
    }
  };

  const reset = () => {
    setText(""); setResult(null); setError(null); setFileName(null);
  };

  return (
    <div style={{ background: "linear-gradient(160deg, #313425 0%, #23261a 45%, #14160f 100%)", minHeight: "100vh" }}>
      <Link href="/" className="fixed top-5 left-5 z-40 inline-flex items-center gap-2 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2.5 hover:-translate-x-0.5 transition-transform">
        <ArrowLeft size={15} /> Back to Main Page
      </Link>

      <div className="text-center pt-24 pb-6 px-6">
        <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600 font-display italic">ANRA Health — Patient Resources</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-graphite-900 flex items-center justify-center gap-3">
          <BookOpenCheck className="text-gold-500" size={36} />
          Explain My Diagnosis
        </h1>
        <p className="text-sm text-graphite-500 mt-3 max-w-xl mx-auto leading-relaxed">
          Type, attach a photo or PDF, or scan a diagnosis name or confusing doctor's note, and we'll explain what it generally means in plain language.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-24">

        {/* Prominent, unmissable AI disclaimer — shown before any input */}
        <div className="flex items-start gap-2.5 rounded-2xl p-4 mb-6" style={{ background: "rgba(180,40,40,0.10)", border: "1px solid rgba(180,40,40,0.35)" }}>
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-graphite-700 leading-relaxed">
            <span className="font-bold text-red-600">This is an AI-generated explanation based on general medical information — it may be wrong or incomplete.</span> Please talk to your family doctor for guidance specific to your situation.
          </p>
        </div>

        {!result && (
          <div className="glass rounded-3xl p-6 md:p-8 space-y-5">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="e.g. 'Paroxysmal atrial fibrillation' or a line from your doctor's notes you'd like explained."
              className="w-full px-4 py-3 rounded-xl border border-pearl-300 bg-[#e8e4d5] text-black text-sm outline-none focus:ring-2 focus:ring-gold-500 resize-none"
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={runExplainText}
                disabled={text.trim().length < 2 || loading}
                className="gold-gloss px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 disabled:opacity-40"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {loading ? "Explaining…" : "Explain This"}
              </button>

              <span className="text-xs text-graphite-400">or</span>

              <button
                onClick={() => attachInputRef.current?.click()}
                disabled={attaching || scanning}
                className="border border-pearl-300 text-graphite-600 px-5 py-3 rounded-full text-sm font-semibold disabled:opacity-40 flex items-center gap-2"
              >
                {attaching ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} className="text-gold-600" />}
                {attaching ? "Reading…" : "Add Attachment"}
              </button>
              <input
                ref={attachInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => e.target.files?.[0] && runExplainImage(e.target.files[0], "attach")}
                className="hidden"
              />

              <button
                onClick={() => scanInputRef.current?.click()}
                disabled={attaching || scanning}
                className="border border-pearl-300 text-graphite-600 px-5 py-3 rounded-full text-sm font-semibold disabled:opacity-40 flex items-center gap-2"
              >
                {scanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} className="text-gold-600" />}
                {scanning ? "Reading…" : "Scan a Photo"}
              </button>
              <input
                ref={scanInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => e.target.files?.[0] && runExplainImage(e.target.files[0], "scan")}
                className="hidden"
              />
            </div>

            {fileName && !attaching && !scanning && !error && (
              <p className="text-xs text-graphite-400">Read: {fileName}</p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}

        {result && (
          <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-gold-600" />
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">In Plain Language</p>
            </div>
            <p className="text-base leading-relaxed text-graphite-800">{result.plainExplanation}</p>

            {result.keyFindings.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">What We Found & What It Means</p>
                {result.keyFindings.map((f) => (
                  <div key={f.term} className="rounded-2xl p-4 bg-pearl-50">
                    <p className="text-sm font-bold text-graphite-900 mb-1.5">{f.term}</p>
                    <p className="text-sm text-graphite-600 leading-relaxed">{f.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {result.commonQuestions.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-3 flex items-center gap-1.5">
                  <HelpCircle size={13} /> Questions People Often Ask Their Doctor
                </p>
                <ul className="space-y-1.5">
                  {result.commonQuestions.map((q) => (
                    <li key={q} className="text-sm text-graphite-700 italic">"{q}"</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Same prominent disclaimer, repeated after the result */}
            <div className="flex items-start gap-2.5 rounded-2xl p-4" style={{ background: "rgba(180,40,40,0.10)", border: "1px solid rgba(180,40,40,0.35)" }}>
              <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-graphite-700 leading-relaxed">
                <span className="font-bold text-red-600">This explanation may be wrong or incomplete.</span> Please visit your family doctor for guidance specific to you.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/referral-centre" className="gold-gloss inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
                Book a Consultation <ArrowRight size={14} />
              </Link>
              <button onClick={reset} className="px-5 py-2.5 rounded-full text-sm font-semibold border border-pearl-300 text-graphite-600">
                Explain Something Else
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}