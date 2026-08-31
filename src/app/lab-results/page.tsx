"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, Camera, ArrowRight, FlaskConical } from "lucide-react";

interface LabResultItem {
  testName: string;
  value: string;
  flag: "in-range" | "outside-range" | "unclear";
  explanation: string;
}

interface LabExplainResult {
  overallSummary: string;
  results: LabResultItem[];
  disclaimer: string;
}

const FLAG_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  "in-range": { label: "In Range", color: "#4A6E3A", bg: "#E4EDDD" },
  "outside-range": { label: "Outside Range", color: "#9E801F", bg: "#F0E1B2" },
  unclear: { label: "Unclear", color: "#6E6650", bg: "#EFEBDC" },
};

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

export default function LabResultsPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedFileName, setScannedFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LabExplainResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runTextExplain = async () => {
    if (text.trim().length < 5) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/lab-explainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Something went wrong explaining those results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleScanFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("That photo is a bit large — try a smaller image or better lighting.");
      return;
    }
    setScanning(true);
    setError(null);
    setScannedFileName(file.name);
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const res = await fetch("/api/lab-explainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Couldn't read that photo. Try a clearer, well-lit shot of the report.");
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const reset = () => {
    setText(""); setResult(null); setError(null); setScannedFileName(null);
  };

  return (
    <div style={{ background: "linear-gradient(160deg, #313425 0%, #23261a 45%, #14160f 100%)", minHeight: "100vh" }}>
      <Link href="/" className="fixed top-5 left-5 z-40 inline-flex items-center gap-2 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2.5 hover:-translate-x-0.5 transition-transform">
        <ArrowLeft size={15} /> Back to Main Page
      </Link>

      <div className="text-center pt-24 pb-8 px-6">
        <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600 font-display italic">ANRA Health — Patient Resources</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-graphite-900 flex items-center justify-center gap-3">
          <FlaskConical className="text-gold-500" size={34} />
          Lab Result Explainer
        </h1>
        <p className="text-sm text-graphite-500 mt-3 max-w-xl mx-auto leading-relaxed">
          Paste your lab values or scan a photo of your report, and we'll explain what each test generally measures — in plain language.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-24">
        {!result && (
          <div className="glass rounded-3xl p-6 md:p-8 space-y-5">
            <div>
              <p className="text-xs font-semibold text-graphite-500 mb-2 uppercase tracking-wide">Paste your lab values</p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                placeholder={`e.g.\nTotal Cholesterol: 5.8 mmol/L\nLDL: 3.4 mmol/L\nHDL: 1.1 mmol/L\nTSH: 2.1 mIU/L`}
                className="w-full px-4 py-3 rounded-xl border border-pearl-300 bg-[#e8e4d5] text-black text-sm outline-none focus:ring-2 focus:ring-gold-500 resize-none font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={runTextExplain}
                disabled={text.trim().length < 5 || loading}
                className="gold-gloss px-6 py-3 rounded-full text-sm font-semibold disabled:opacity-40 flex items-center gap-2"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {loading ? "Explaining…" : "Explain My Results"}
              </button>

              <span className="text-xs text-graphite-400">or</span>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={scanning}
                className="border border-pearl-300 text-graphite-600 px-5 py-3 rounded-full text-sm font-semibold disabled:opacity-40 flex items-center gap-2"
              >
                {scanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} className="text-gold-600" />}
                {scanning ? "Reading photo…" : "Scan a lab report photo"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleScanFile}
                className="hidden"
              />
            </div>
            {scannedFileName && !scanning && !error && (
              <p className="text-xs text-graphite-400">Scanned: {scannedFileName}</p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}

        {result && (
          <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-gold-600" />
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">Your Results, Explained</p>
            </div>
            <p className="text-base leading-relaxed text-graphite-800">{result.overallSummary}</p>

            {result.results.length > 0 && (
              <div className="space-y-3">
                {result.results.map((r, i) => {
                  const style = FLAG_STYLE[r.flag] || FLAG_STYLE.unclear;
                  return (
                    <div key={i} className="rounded-2xl p-4 bg-pearl-50">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <p className="text-sm font-bold text-graphite-900">{r.testName}{r.value && <span className="font-normal text-graphite-600"> — {r.value}</span>}</p>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ color: style.color, background: style.bg }}>
                          {style.label}
                        </span>
                      </div>
                      <p className="text-sm text-graphite-600 leading-relaxed">{r.explanation}</p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="border-t border-pearl-200 pt-5">
              <p className="text-xs text-graphite-400 mb-4">{result.disclaimer}</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/referral-centre" className="gold-gloss inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
                  Book a Consultation <ArrowRight size={14} />
                </Link>
                <button onClick={reset} className="px-5 py-2.5 rounded-full text-sm font-semibold border border-pearl-300 text-graphite-600">
                  Check Another Result
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}