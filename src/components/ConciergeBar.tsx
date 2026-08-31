"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";

interface ConciergeResult {
  reply: string;
  destination: { href: string; label: string };
}

export default function ConciergeBar() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConciergeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ask = async () => {
    if (message.trim().length < 3 || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again, or explore the map below.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mb-10 px-4">
      <div className="glass rounded-full flex items-center gap-2 p-2 pl-5">
        <Sparkles size={16} className="text-gold-500 shrink-0" />
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Tell us what's going on, or what you're curious about…"
          className="flex-1 bg-transparent text-sm outline-none text-graphite-900 placeholder:text-graphite-500 min-w-0"
        />
        <button
          onClick={ask}
          disabled={message.trim().length < 3 || loading}
          className="gold-gloss rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-40 shrink-0 flex items-center gap-1.5"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : null}
          {loading ? "…" : "Ask"}
        </button>
      </div>

      {error && <p className="text-xs text-red-400 text-center mt-3">{error}</p>}

      {result && (
        <div className="glass rounded-2xl p-4 mt-3">
          <p className="text-sm text-graphite-800 leading-relaxed mb-3">{result.reply}</p>
          <button
            onClick={() => router.push(result.destination.href)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700"
          >
            Go to {result.destination.label} <ArrowRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}