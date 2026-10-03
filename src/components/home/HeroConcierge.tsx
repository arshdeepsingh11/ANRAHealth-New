"use client";

import React, { useEffect, useRef, useState } from "react";
import AlbaOrb from "@/components/AlbaOrb";
import { useAlba } from "@/components/AlbaContext";
import { useAnraNav } from "@/lib/useAnraNav";
import { typeOut } from "@/lib/albaClient";
import { PLACEHOLDERS, QUICK_CHIPS, isEmergency, routeFor, routeForHref, type ConciergeRoute } from "@/data/homeContent";
import NeyuLogo from "@/components/brand/NeyuLogo";

interface Answer { concern: string; text: string; route: ConciergeRoute }

// Home 01 (top): logo, morphing headline, Neyu concierge bar + answer card.
// Uses the existing /api/concierge route; its single destination is mapped
// to the design's three-step answer card.

// Icon + tint for each quick-start action (hero).
const CHIP_STYLE: Record<string, { icon: string; bg: string; fg: string }> = {
  "Check symptoms": { icon: "ph-heartbeat", bg: "#FBEEE8", fg: "#8B4B37" },
  "Understand results": { icon: "ph-flask", bg: "#E8F2F4", fg: "#2F5A66" },
  "Assess my risk": { icon: "ph-gauge", bg: "#F0ECF7", fg: "#5F4A8A" },
  "Explore genomics": { icon: "ph-dna", bg: "#E8F2F4", fg: "#2F5A66" },
  "Prepare for my visit": { icon: "ph-calendar-check", bg: "#EFECE6", fg: "#3A4147" },
  default: { icon: "ph-arrow-up-right", bg: "#EFECE6", fg: "#3A4147" },
};

export default function HeroConcierge() {
  const { openAlba, triggerEmergency } = useAlba();
  const go = useAnraNav();
  const [cq, setCq] = useState("");
  const [loading, setLoading] = useState(false);
  const [ans, setAns] = useState<Answer | null>(null);
  const [shown, setShown] = useState(0);
  const stopType = useRef<() => void>(() => {});
  const inputRef = useRef<HTMLInputElement>(null);
  const layerRef = useRef<HTMLSpanElement>(null);
  // Keep the typewriter layer aligned with the input when long text scrolls.
  const syncScroll = () => requestAnimationFrame(() => {
    if (inputRef.current && layerRef.current) layerRef.current.style.transform = `translateX(${-inputRef.current.scrollLeft}px)`;
  });

  useEffect(() => () => stopType.current(), []);

  const ask = async () => {
    const t = cq.trim();
    if (!t || loading) return;
    if (isEmergency(t)) { triggerEmergency(); return; }
    setLoading(true); setAns(null); setShown(0);
    let a: Answer;
    try {
      const res = await fetch("/api/concierge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: t }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "failed");
      if (data.emergency) { setLoading(false); triggerEmergency(); return; }
      const route = routeForHref(data.destination?.href, t);
      a = { concern: route.concern, text: data.reply || route.summary, route };
    } catch {
      const route = routeFor(t);
      a = { concern: route.concern, text: route.summary, route };
    }
    setLoading(false);
    setAns(a);
    stopType.current();
    stopType.current = typeOut(a.text, setShown);
  };

  const clear = () => { stopType.current(); setAns(null); setCq(""); syncScroll(); };
  const toAlba = () => { const t = cq; setAns(null); setCq(""); openAlba(t); };

  return (
    <div style={{ position: "relative", maxWidth: 1240, margin: "0 auto", padding: "clamp(40px,6vw,72px) clamp(16px,4vw,40px) 24px", textAlign: "center" }}>
      <style>{`@keyframes anraTypeIn{from{opacity:0;transform:translateY(6px);filter:blur(4px)}to{opacity:1;transform:none;filter:blur(0)}}@media (prefers-reduced-motion: reduce){#concierge ~ div span{animation:none!important}}`}</style>
      <NeyuLogo layout="stacked" fluid="clamp(128px,13vw,172px)" />
      <h1 style={{ margin: "14px 0 0", fontSize: "clamp(38px,6.2vw,80px)", lineHeight: 1.04, letterSpacing: "-.04em", fontWeight: 600, color: "#14181B" }}>
        Healthcare designed around<br />
        <anra-morph words="you.|your heart.|your biology.|your family.|your future." />
      </h1>
      <p style={{ margin: "16px auto 0", fontSize: "clamp(17px,1.8vw,20px)", color: "#3A4147", maxWidth: 560 }}>One place to understand your health, explore your options, and prepare for what’s next.</p>

      <div style={{ margin: "28px auto 0", maxWidth: 720, textAlign: "left" }}>
        <div style={{ position: "relative", borderRadius: 999, boxShadow: "0 24px 50px -28px rgba(42,132,228,.6)" }}>
          <anra-electro radius="34" style={{ position: "absolute", inset: -6, pointerEvents: "none", zIndex: 1 }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, background: "#FDFCFA", borderRadius: 999, padding: "6px 6px 6px 18px", border: "1px solid #D6EEF6" }}>
            <i className="ph ph-sparkle" style={{ fontSize: 20, color: "#2A84E4" }} />
            <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
              <input
                ref={inputRef}
                id="concierge"
                value={cq}
                onChange={(e) => { setCq(e.target.value); syncScroll(); }}
                onKeyDown={(e) => { if (e.key === "Enter") ask(); }}
                onKeyUp={syncScroll}
                onScroll={syncScroll}
                onSelect={syncScroll}
                aria-label="Tell us what’s going on, or what you’re curious about"
                autoComplete="off"
                // Real input stays for typing/caret/selection; its text is drawn
                // by the typewriter layer below, so the glyphs are transparent.
                style={{ position: "relative", zIndex: 1, width: "100%", border: 0, outline: "none", background: "transparent", fontSize: "clamp(15px,1.8vw,18px)", padding: "12px 0", color: cq ? "transparent" : "inherit", caretColor: "#2A84E4", fontKerning: "none" }}
              />
              {/* Typewriter layer — each typed character animates in. */}
              {cq && (
                <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", display: "flex", alignItems: "center" }}>
                  <span ref={layerRef} style={{ whiteSpace: "pre", fontSize: "clamp(15px,1.8vw,18px)", color: "#14181B", willChange: "transform", fontKerning: "none" }}>
                    {Array.from(cq).map((ch, i) => (
                      <span key={i} style={{ display: "inline-block", whiteSpace: "pre", animation: "anraTypeIn .26s cubic-bezier(.2,.8,.2,1) both" }}>{ch}</span>
                    ))}
                  </span>
                </div>
              )}
              {!cq && (
                <anra-typeph words={PLACEHOLDERS.join("|")} style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", fontSize: "clamp(15px,1.8vw,18px)", color: "#8A9197", whiteSpace: "nowrap", overflow: "hidden", maxWidth: "100%", pointerEvents: "none" }} />
              )}
            </div>
            <button onClick={ask} className="hv-purple" style={{ height: 46, padding: "0 20px", border: 0, borderRadius: 999, background: "#2A84E4", color: "#FDFCFA", fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600, flex: "none", display: "flex", alignItems: "center", gap: 8 }}>Ask</button>
          </div>
        </div>

        {/* Quick-start actions — styled as real buttons (icon, arrow, lift on hover). */}
        <div style={{ marginTop: 18, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#5A626A", textAlign: "center" }}>Or jump straight to</div>
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {QUICK_CHIPS.map((q) => {
            const t = CHIP_STYLE[q.label] || CHIP_STYLE.default;
            return (
              <button key={q.label} onClick={() => go(q)} className="anra-action">
                <span className="ic" style={{ background: t.bg, color: t.fg }}><i className={"ph-fill " + t.icon} /></span>
                {q.label}
                <i className="ph ph-arrow-right ar" />
              </button>
            );
          })}
        </div>

        {loading && (
          <div aria-live="polite" style={{ marginTop: 16, padding: "20px 22px", borderRadius: 20, background: "rgba(253,252,250,.92)", border: "1px solid #D6EEF6", display: "flex", gap: 12, alignItems: "center", fontSize: 16, color: "#3A4147" }}>
            <AlbaOrb size={26} />Neyu is reviewing what you’ve shared…
          </div>
        )}

        {ans && (
          <div role="region" aria-live="polite" aria-label="Neyu’s suggestion" style={{ marginTop: 16, padding: "clamp(18px,3vw,26px)", borderRadius: 22, background: "rgba(253,252,250,.95)", border: "1px solid #D6EEF6", boxShadow: "0 30px 60px -36px rgba(29,95,168,.55)", animation: "fadeUp .35s ease" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <AlbaOrb size={26} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#1D5FA8", fontWeight: 600 }}>Neyu · this may relate to</div>
                <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-.01em" }}>{ans.concern}</div>
              </div>
              <button onClick={clear} aria-label="Clear" style={{ width: 38, height: 38, border: 0, background: "#EFECE6", borderRadius: 10, display: "grid", placeItems: "center" }}><i className="ph ph-x" /></button>
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 16, color: "#2A2F33", minHeight: "1.5em" }}>
              {ans.text.slice(0, shown)}
              {shown < ans.text.length && <span style={{ display: "inline-block", width: 2, height: "1em", background: "#2A84E4", marginLeft: 2, verticalAlign: -2, animation: "caret 1s steps(1) infinite" }} />}
            </p>
            {ans.route.safety && (
              <div style={{ marginTop: 12, display: "flex", gap: 10, padding: "12px 14px", borderRadius: 12, background: "#FDF1EE", border: "1px solid #F0C9C0", color: "#6E1A10", fontSize: 14 }}><i className="ph ph-warning-circle" style={{ fontSize: 18 }} />{ans.route.safety}</div>
            )}
            <div style={{ marginTop: 12, display: "grid" }}>
              {ans.route.steps.map((st, i) => (
                <button key={st.label} onClick={() => go(st)} className="hv-tealText" style={{ textAlign: "left", background: "none", border: 0, borderTop: "1px solid #EFECE6", padding: "12px 0", display: "grid", gridTemplateColumns: "34px 1fr auto", gap: 10, alignItems: "center", minHeight: 56 }}>
                  <span style={{ fontSize: 12, color: "#2A84E4" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span><span style={{ display: "block", fontWeight: 500 }}>{st.label}</span><span style={{ display: "block", fontSize: 14, color: "#5A626A" }}>{st.desc}</span></span>
                  <i className="ph ph-arrow-right" />
                </button>
              ))}
            </div>
            <button onClick={toAlba} style={{ marginTop: 4, border: 0, background: "none", padding: "8px 0", color: "#1D5FA8", fontWeight: 600 }}>Continue the conversation with Neyu →</button>
          </div>
        )}

        <p style={{ margin: "12px 0 0", textAlign: "center", fontSize: 13, color: "#5A626A" }}>In an emergency, call <a href="tel:911" style={{ color: "#9B2317", fontWeight: 600 }}>911</a>. Neyu explains and guides; it doesn’t diagnose.</p>
      </div>
    </div>
  );
}
