"use client";

import React, { useEffect, useState } from "react";
import { useAlba } from "@/components/AlbaContext";
import AnraEl from "@/components/AnraEl";
import { useAnraNav } from "@/lib/useAnraNav";
import { PAGE_HREF, PREC_CAPTIONS, PREC_LAYERS } from "@/data/homeContent";

// Home 03: dark "Precision health" band — five layers narrowing from
// population guidelines to you, with the animated funnel. Auto-plays until
// the visitor picks a layer.
export default function PrecisionFunnel() {
  const { isOpen } = useAlba();
  const go = useAnraNav();
  const [stage, setStage] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (manual) return;
    const t = setInterval(() => { if (!isOpen && !document.hidden) setStage((s) => (s + 1) % 5); }, 3600);
    return () => clearInterval(t);
  }, [manual, isOpen]);

  return (
    <section data-screen-label="Home 03 Precision" style={{ padding: "0 clamp(12px,2vw,20px)" }}>
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 32, background: "#14181B", color: "#EDEAE4" }}>
        <anra-particles tone="dark" density="14000" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.7 }} />
        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "clamp(56px,8vw,112px) clamp(20px,4vw,40px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: "clamp(32px,5vw,72px)", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "#A9D8F0" }}>Precision health</div>
            <h2 style={{ margin: "14px 0 0", fontSize: "clamp(34px,4.6vw,56px)", lineHeight: 1, letterSpacing: "-.04em", fontWeight: 500, color: "#F7F5F1" }}>
              From population averages to <anra-morph words="your blood.|your DNA.|your history.|you." gradient="linear-gradient(90deg,#A9D8F0,#A9C9D1 60%,#F3C3B2)" />
            </h2>
            <div role="tablist" aria-label="Layers of information" style={{ marginTop: 28, display: "grid", gap: 8 }}>
              {PREC_LAYERS.map(([label, sub], i) => {
                const on = i === stage;
                return (
                  <button key={label} role="tab" aria-selected={on} onClick={() => { setStage(i); setManual(true); }} className="hv-bdSky"
                    style={{ width: 100 - i * 11 + "%", textAlign: "left", padding: "14px 18px", borderRadius: 12, border: "1px solid " + (on ? "#F3C3B2" : i < stage ? "#3F6F7C" : "#2A3035"), background: on ? "rgba(243,195,178,.16)" : i < stage ? "rgba(110,168,182,.1)" : "transparent", color: "#EDEAE4", display: "flex", justifyContent: "space-between", gap: 12, fontSize: 16, transition: "background .5s,border-color .5s" }}>
                    <span>{label}</span><span style={{ color: on ? "#F3C3B2" : "#8D959B", fontSize: 14, whiteSpace: "nowrap" }}>{sub}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 10 }}>
              <button onClick={() => go({ label: "Genomics", href: PAGE_HREF.genomics })} className="hv-mist" style={{ whiteSpace: "nowrap", height: 48, padding: "0 20px", border: 0, borderRadius: 12, background: "#F7F5F1", color: "#14181B", fontSize: 14, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 500 }}>Explore genomics</button>
              <button onClick={() => go({ label: "Packages", href: PAGE_HREF.packages })} className="hv-bdSky" style={{ whiteSpace: "nowrap", height: 48, padding: "0 18px", border: "1px solid #3A4147", borderRadius: 12, background: "transparent", color: "#EDEAE4", fontSize: 14, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 500 }}>See packages</button>
            </div>
          </div>
          <div>
            <div style={{ height: "clamp(300px,36vw,440px)", position: "relative", borderRadius: 24, border: "1px solid #2A3035", background: "radial-gradient(circle at 50% 50%, rgba(110,168,182,.08), transparent 70%)", overflow: "hidden" }}>
              <AnraEl tag="anra-funnel" attrs={{ stage }} style={{ position: "absolute", inset: 0 }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 120, opacity: 0.55, pointerEvents: "none" }}>
                <AnraEl tag="anra-chart" attrs={{ mode: "dna" }} style={{ position: "absolute", inset: 0 }} />
              </div>
            </div>
            <p aria-live="polite" style={{ margin: "14px 0 0", fontSize: 17, color: "#F7F5F1", minHeight: "1.6em" }}>{PREC_CAPTIONS[stage]}</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8D959B" }}>Illustration. Select a layer, or let it play.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
