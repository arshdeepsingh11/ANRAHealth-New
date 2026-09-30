"use client";

import React from "react";
import { useAnraNav } from "@/lib/useAnraNav";
import { PAGE_HREF } from "@/data/homeContent";
import NeyuLogo from "@/components/brand/NeyuLogo";

export const GALLERY_EVENT = "anra-gallery";

// Home 05: "One ecosystem." — orbiting rings with NEYU at the centre and
// the partner companies around it.
export default function Ecosystem({ mobile }: { mobile: boolean }) {
  const go = useAnraNav();
  const S = mobile ? 300 : 460, r1 = S * 0.24, r2 = S * 0.4;

  const showGallery = (vendor: "labs" | "drugs" | "nea") => {
    document.dispatchEvent(new CustomEvent(GALLERY_EVENT, { detail: vendor }));
    const el = document.getElementById("gallery");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: "smooth" });
  };

  const ring = (r: number, dur: number, rev: boolean, list: React.ReactNode[]) => (
    <div style={{ position: "absolute", left: "50%", top: "50%", width: r * 2, height: r * 2, marginLeft: -r, marginTop: -r, borderRadius: "50%", border: "1px dashed rgba(110,168,182,.45)", animation: `${rev ? "spinRev" : "spin"} ${dur}s linear infinite` }}>
      {list.map((el, i) => {
        const a = (i * 360) / list.length;
        return (
          <div key={i} style={{ position: "absolute", left: "50%", top: "50%", transform: `rotate(${a}deg) translateX(${r}px) rotate(${-a}deg)` }}>
            <div style={{ transformOrigin: "0 0", animation: `${rev ? "spin" : "spinRev"} ${dur}s linear infinite` }}>
              <div style={{ transform: "translate(-50%,-50%)" }}>{el}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
  const ic = (n: string, c: string) => (
    <span style={{ width: mobile ? 38 : 46, height: mobile ? 38 : 46, borderRadius: "50%", background: "#FDFCFA", border: "1px solid #E3DED5", display: "grid", placeItems: "center", boxShadow: "0 12px 24px -16px rgba(20,24,27,.4)" }}><i className={"ph " + n} style={{ fontSize: mobile ? 17 : 20, color: c }} /></span>
  );
  const pill = (label: string, c: string, sub: string, fn: () => void) => (
    <button onClick={fn} style={{ whiteSpace: "nowrap", padding: mobile ? "9px 14px" : "12px 18px", borderRadius: 999, background: "#FDFCFA", border: "1px solid #E3DED5", boxShadow: "0 18px 34px -18px rgba(20,24,27,.35)", display: "flex", gap: 10, alignItems: "center", fontWeight: 500, fontSize: mobile ? 13 : 15, color: "#14181B", cursor: "pointer" }}>
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: c, boxShadow: "0 0 0 4px " + c + "33" }} />{label}<span style={{ fontSize: 12, color: "#5A626A", fontWeight: 400 }}>{sub}</span>
    </button>
  );

  const tag = (label: string, style: React.CSSProperties) => <span style={{ whiteSpace: "nowrap", padding: "6px 12px", borderRadius: 999, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", ...style }}>{label}</span>;

  return (
    <section data-screen-label="Home 05 Ecosystem" style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(40px,6vw,88px) clamp(16px,4vw,40px)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: "clamp(28px,5vw,64px)", alignItems: "center" }}>
        <div style={{ minWidth: 0, padding: "20px 0", display: "grid", justifyItems: "center", gap: 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {tag("NEYU Health", { background: "#14181B", color: "#F7F5F1" })}
            {tag("BioAro Labs", { border: "1px solid #6EA8B6", color: "#2F5561" })}
            {tag("BioAro Drugs", { border: "1px solid #8C6FB8", color: "#6A5096" })}
            {tag("Nea", { border: "1px solid #B9786A", color: "#8A4F43" })}
          </div>
          <div style={{ position: "relative", width: S, height: S, maxWidth: "100%", margin: "0 auto" }}>
            <div style={{ position: "absolute", inset: "18%", borderRadius: "50%", background: "radial-gradient(circle, rgba(140,111,184,.14), transparent 70%)" }} />
            {ring(r1, 46, false, [ic("ph-stethoscope", "#3F6F7C"), ic("ph-dna", "#8C6FB8"), ic("ph-heartbeat", "#3F6F7C"), ic("ph-flask", "#6EA8B6"), ic("ph-flower-lotus", "#B9786A"), ic("ph-brain", "#8C6FB8"), ic("ph-map-pin", "#3F6F7C")])}
            {ring(r2, 70, true, [
              pill("BioAro Labs", "#6EA8B6", "Testing", () => showGallery("labs")),
              pill("BioAro Drugs", "#8C6FB8", "Wellness", () => showGallery("drugs")),
              pill("NEYU Clinics", "#F3A993", "Calgary", () => go({ label: "Locations", href: PAGE_HREF.locations })),
              pill("Nea", "#B9786A", "Skin", () => showGallery("nea")),
            ])}
            <div style={{ position: "absolute", left: "50%", top: "50%", width: mobile ? 96 : 124, height: mobile ? 96 : 124, transform: "translate(-50%,-50%)", borderRadius: "50%", background: "#FFFFFF", border: "1px solid #E3DED5", display: "grid", placeItems: "center", animation: "coreBreath 5s ease-in-out infinite" }}>
              <NeyuLogo height={mobile ? 54 : 72} layout="stacked" />
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "#5A626A" }}>Our family of companies</div>
          <h2 style={{ margin: "14px 0 0", fontSize: "clamp(34px,4.6vw,56px)", lineHeight: 1, letterSpacing: "-.04em", fontWeight: 500 }}>One ecosystem.<br />Clinical guidance at the centre.</h2>
          <p style={{ margin: "18px 0 0", fontSize: 18, color: "#3A4147", maxWidth: 460 }}>NEYU is where care is understood and decided. Testing, wellness and skin care are fulfilled by our partner companies.</p>
          <div style={{ marginTop: 24, borderTop: "1px solid #14181B" }}>
            <div style={{ display: "grid", gridTemplateColumns: "14px 1fr", gap: 14, padding: "16px 0", borderBottom: "1px solid #E3DED5" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#6EA8B6", marginTop: 7 }} />
              <div><div style={{ fontWeight: 500, fontSize: 18 }}>BioAro Labs</div><div style={{ color: "#5A626A", fontSize: 15 }}>Genomics, microbiome and biomarker testing. Canada and US.</div></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "14px 1fr", gap: 14, padding: "16px 0", borderBottom: "1px solid #E3DED5" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#8C6FB8", marginTop: 7 }} />
              <div><div style={{ fontWeight: 500, fontSize: 18 }}>BioAro Drugs</div><div style={{ color: "#5A626A", fontSize: 15 }}>Supportive wellness options. US, Canada and UK.</div></div>
            </div>
            <a href="/specialties/skin-health" style={{ display: "grid", gridTemplateColumns: "14px 1fr auto", gap: 14, padding: "16px 0", borderBottom: "1px solid #E3DED5", color: "inherit", textDecoration: "none", alignItems: "start" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#B9786A", marginTop: 7 }} />
              <div><div style={{ fontWeight: 500, fontSize: 18 }}>Nea Precision Skin</div><div style={{ color: "#5A626A", fontSize: 15 }}>Medical aesthetics, Fotona laser and skin health. Calgary.</div></div>
              <i className="ph ph-arrow-up-right" style={{ color: "#8A4F43", marginTop: 6 }} />
            </a>
          </div>
          <button onClick={() => go({ label: "Explore testing", href: PAGE_HREF.catalog })} className="hv-deep" style={{ marginTop: 22, height: 48, padding: "0 20px", border: 0, borderRadius: 12, background: "#3F6F7C", color: "#FDFCFA", fontSize: 14, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 500 }}>Explore testing</button>
        </div>
      </div>
    </section>
  );
}
