"use client";

import React, { useEffect, useRef, useState } from "react";
import AlbaOrb from "@/components/AlbaOrb";
import { useAlba } from "@/components/AlbaContext";
import { ALBA_SUGGESTIONS } from "@/data/homeContent";

// Home 04: inline ALBA console. Shares the same conversation as the floating
// ALBA panel (last four messages shown here).
export default function AlbaConsole({ mobile }: { mobile: boolean }) {
  const { messages, loading, send } = useAlba();
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const recent = messages.slice(-4);

  useEffect(() => { const el = listRef.current; if (el) el.scrollTop = el.scrollHeight; }, [messages, loading]);

  const submit = () => { const t = input.trim(); if (!t) return; setInput(""); send(t); };

  return (
    <section data-screen-label="Home 04 ALBA console" style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(56px,8vw,112px) clamp(16px,4vw,40px)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: "clamp(28px,5vw,64px)", alignItems: "center" }}>
        <div style={{ display: "grid", justifyItems: "start" }}>
          <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "#6A5096", fontWeight: 600 }}>ALBA</div>
          <h2 style={{ margin: "14px 0 0", fontSize: "clamp(34px,4.6vw,56px)", lineHeight: 1, letterSpacing: "-.04em", fontWeight: 500 }}>Your health companion,<br />right here.</h2>
          <p style={{ margin: "18px 0 0", fontSize: 18, color: "#3A4147", maxWidth: 440 }}>Ask anything. ALBA explains, points you to the right tool, and helps you prepare. It knows when to step aside for a clinician.</p>
          <div style={{ marginTop: 28, padding: 24 }}><AlbaOrb size={mobile ? 120 : 180} glow /></div>
        </div>
        <div style={{ background: "rgba(253,252,250,.94)", border: "1px solid #E4DCF1", borderRadius: 26, padding: 18, boxShadow: "0 40px 80px -50px rgba(106,80,150,.7)", display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "4px 4px 10px", borderBottom: "1px solid #EFEAF6" }}>
            <AlbaOrb size={26} />
            <div><div style={{ fontWeight: 600, letterSpacing: ".1em" }}>ALBA</div><div style={{ fontSize: 13, color: "#5A626A" }}>Live · answers in seconds</div></div>
          </div>
          <div ref={listRef} aria-live="polite" style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 220, maxHeight: 360, overflow: "auto", padding: 4 }}>
            {messages.length === 0 && (
              <>
                <div style={{ fontSize: 16, color: "#2A2F33" }}>Tell me what’s on your mind and I’ll help you find the right place to start.</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {ALBA_SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} className="hv-bdViolet" style={{ textAlign: "left", border: "1px solid #E4DCF1", background: "#FDFCFA", borderRadius: 12, padding: "11px 14px", fontSize: 15, minHeight: 44 }}>{s}</button>)}
                </div>
              </>
            )}
            {recent.map((m, i) => {
              if (m.kind === "safety") return <div key={i} role="alert" style={{ padding: 14, borderRadius: 14, background: "#9B2317", color: "#FFF7F5", fontSize: 15 }}><strong style={{ fontWeight: 600 }}>Please seek urgent medical care.</strong> Call <a href="tel:911" style={{ color: "#FFF7F5", fontWeight: 700 }}>911</a> or go to the nearest emergency department.</div>;
              if (m.kind === "error") return <div key={i} style={{ fontSize: 14, color: "#3A4147", padding: "10px 12px", borderRadius: 12, background: "#F6F2FB" }}>{m.text}</div>;
              if (m.role === "user") return <div key={i} style={{ alignSelf: "flex-end", maxWidth: "84%", background: "#14181B", color: "#F7F5F1", padding: "10px 14px", borderRadius: "16px 16px 4px 16px", fontSize: 15 }}>{m.text}</div>;
              return <div key={i} style={{ maxWidth: "94%", fontSize: 15, lineHeight: 1.55, color: "#2A2F33", whiteSpace: "pre-wrap", paddingLeft: 12, borderLeft: "2px solid #C9B8E6", animation: "fadeUp .3s ease" }}>{m.text}</div>;
            })}
            {loading && <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#5A626A", fontSize: 14 }}><AlbaOrb size={22} />ALBA is reviewing what you’ve shared…</div>}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#FDFCFA", border: "1px solid #D9CCEE", borderRadius: 14, padding: "6px 6px 6px 14px" }}>
            <input aria-label="Message ALBA" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder="Ask ALBA…" style={{ flex: 1, minWidth: 0, border: 0, outline: "none", background: "transparent", fontSize: 16, padding: "10px 0" }} />
            <button onClick={submit} aria-label="Send" className="hv-purple" style={{ width: 44, height: 44, border: 0, borderRadius: 10, background: "#8C6FB8", color: "#FDFCFA", display: "grid", placeItems: "center", fontSize: 18 }}><i className="ph ph-arrow-up" /></button>
          </div>
          <div style={{ fontSize: 12, color: "#5A626A" }}>ALBA explains; it doesn’t diagnose. In an emergency call 911.</div>
        </div>
      </div>
    </section>
  );
}