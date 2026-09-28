"use client";

import React, { useState } from "react";
import AlbaOrb from "@/components/AlbaOrb";
import AnraEl from "@/components/AnraEl";
import { useAlba } from "@/components/AlbaContext";
import { SIGNAL_TABS, signalNote } from "@/data/homeContent";

const eyebrow: React.CSSProperties = { fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "#6A5096", fontWeight: 600 };
const h2: React.CSSProperties = { margin: "14px 0 0", fontSize: "clamp(34px,4.6vw,56px)", lineHeight: 1, letterSpacing: "-.04em", fontWeight: 500 };

// Home 02: "See the signal. Understand it." — tabs + sliders + live chart.
export default function LiveSignals() {
  const { openAlba } = useAlba();
  const [tab, setTab] = useState("ecg");
  const [ldl, setLdl] = useState(4.1);
  const [act, setAct] = useState(90);
  const note = signalNote(tab, ldl, act);
  const param = tab === "ldl" ? Math.round(ldl * 10) : tab === "activity" ? act : 50;

  return (
    <section data-screen-label="Home 02 Live signals" style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(56px,8vw,112px) clamp(16px,4vw,40px)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: "clamp(24px,4vw,56px)", alignItems: "center" }}>
        <div>
          <div style={eyebrow}>Health intelligence · live</div>
          <h2 style={h2}>See the signal.<br />Understand it.</h2>
          <p style={{ margin: "18px 0 0", fontSize: 18, color: "#3A4147", maxWidth: 440 }}>Move the sliders and watch how ALBA reads a value in context. Every number means more next to the others.</p>
          <div role="tablist" aria-label="Signals" style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SIGNAL_TABS.map(([k, l]) => {
              const on = tab === k;
              return <button key={k} role="tab" aria-selected={on} onClick={() => setTab(k)} style={{ whiteSpace: "nowrap", minHeight: 42, padding: "0 16px", borderRadius: 999, border: "1px solid " + (on ? "#14181B" : "#D6D0C5"), background: on ? "#14181B" : "transparent", color: on ? "#F7F5F1" : "#14181B", fontSize: 14 }}>{l}</button>;
            })}
          </div>
          {tab === "ldl" && (
            <label style={{ marginTop: 22, display: "grid", gap: 8, maxWidth: 420 }}>
              <span style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 500 }}>LDL cholesterol<span style={{ fontVariantNumeric: "tabular-nums" }}>{ldl.toFixed(1)} mmol/L</span></span>
              <input type="range" min={1.5} max={6.2} step={0.1} value={ldl} onChange={(e) => setLdl(parseFloat(e.target.value))} style={{ accentColor: "#3F6F7C", width: "100%" }} />
            </label>
          )}
          {tab === "activity" && (
            <label style={{ marginTop: 22, display: "grid", gap: 8, maxWidth: 420 }}>
              <span style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 500 }}>Active minutes per week<span style={{ fontVariantNumeric: "tabular-nums" }}>{act}</span></span>
              <input type="range" min={0} max={320} step={10} value={act} onChange={(e) => setAct(parseInt(e.target.value, 10))} style={{ accentColor: "#3F6F7C", width: "100%" }} />
            </label>
          )}
        </div>
        <div style={{ background: "rgba(253,252,250,.92)", border: "1px solid #E3DED5", borderRadius: 24, padding: 18, boxShadow: "0 40px 80px -50px rgba(63,111,124,.55)" }}>
          <div style={{ height: "clamp(220px,28vw,300px)", position: "relative", borderRadius: 16, background: "#FFFFFF", overflow: "hidden" }}>
            <AnraEl tag="anra-chart" attrs={{ mode: tab, param }} style={{ position: "absolute", inset: "12px 14px" }} />
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "flex-start", padding: "4px 4px 2px" }}>
            <AlbaOrb size={26} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#6A5096", fontWeight: 600 }}>ALBA reads</div>
              <p style={{ margin: "4px 0 0", fontSize: 15.5, color: "#2A2F33" }}>{note}</p>
              <button onClick={() => openAlba("Explain this in plain language: " + note)} style={{ marginTop: 6, border: 0, background: "none", padding: "4px 0", color: "#6A5096", fontWeight: 600, fontSize: 14 }}>Ask a follow-up →</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}