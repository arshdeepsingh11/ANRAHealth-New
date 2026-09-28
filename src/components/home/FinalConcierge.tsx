"use client";

import React from "react";
import AlbaOrb from "@/components/AlbaOrb";
import { useAlba } from "@/components/AlbaContext";
import { isEmergency } from "@/data/homeContent";

// Home 07: closing concierge — "Your health, understood." Enter hands the
// text to ALBA (or opens the safety screen for emergency keywords).
export default function FinalConcierge() {
  const { openAlba, triggerEmergency } = useAlba();

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    if (e.key !== "Enter" || !el.value.trim()) return;
    const t = el.value;
    el.value = "";
    if (isEmergency(t)) return triggerEmergency();
    openAlba(t);
  };

  return (
    <section data-screen-label="Home 07 Final concierge" style={{ position: "relative", overflow: "hidden" }}>
      <anra-meteors color="140,111,184" count="9" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
      <div style={{ position: "relative", maxWidth: 900, margin: "0 auto", padding: "clamp(72px,10vw,140px) clamp(20px,4vw,40px)", textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: "clamp(38px,6vw,72px)", lineHeight: 1.02, letterSpacing: "-.045em", fontWeight: 500 }}>
          Your health, <anra-morph words="understood.|connected.|explained.|prepared." />
        </h2>
        <p style={{ margin: "16px 0 0", fontSize: 18, color: "#3A4147" }}>Tell us what’s going on. ALBA will help you find the right next step.</p>
        <div style={{ margin: "26px auto 0", maxWidth: 640, display: "flex", alignItems: "center", gap: 12, background: "#FDFCFA", border: "1px solid #E4DCF1", borderRadius: 999, padding: "8px 10px 8px 14px", boxShadow: "0 24px 50px -30px rgba(140,111,184,.6)" }}>
          <AlbaOrb size={26} />
          <input onKeyDown={onKey} aria-label="Ask ALBA" placeholder="Tell us what’s going on…" style={{ flex: 1, minWidth: 0, border: 0, outline: "none", background: "transparent", fontSize: 17, padding: "10px 0" }} />
          <span style={{ fontSize: 12, color: "#5A626A", letterSpacing: ".08em", paddingRight: 8 }}>ENTER</span>
        </div>
      </div>
    </section>
  );
}