"use client";

import React, { useState } from "react";
import { RAIL, type NavLink } from "@/data/homeContent";
import { REGIONS, useRegion } from "@/components/RegionContext";
import AlbaOrb from "@/components/AlbaOrb";
import { useAnraNav } from "@/lib/useAnraNav";
import { useAlba } from "@/components/AlbaContext";

// Four-point sparkle burst shown on the open AI Health item.
function Sparkles() {
  const star = (x: number, y: number, sz: number, d: number) => (
    <svg key={x + "_" + y} viewBox="0 0 10 10" style={{ position: "absolute", left: x, top: y, width: sz, height: sz, animation: `sparkle 1.3s ${d}s ease-in-out infinite`, pointerEvents: "none" }}>
      <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#8C6FB8" />
    </svg>
  );
  return <span aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{star(-5, -3, 10, 0)}{star(36, 2, 7, 0.35)}{star(32, 34, 9, 0.7)}{star(-4, 31, 6, 0.2)}</span>;
}

// Desktop primary navigation — a floating vertical rail on the right edge,
// with a fly-out panel for each section.
export default function NavRail({ onSearch }: { onSearch: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const go = useAnraNav();
  const { region, setRegion } = useRegion();
  const { registerAlbaNode } = useAlba();
  const ri = RAIL.findIndex((r) => r.k === open);
  const cur = ri >= 0 ? RAIL[ri] : null;

  const pick = (l: NavLink) => { setOpen(null); go(l); };

  return (
    <nav aria-label="Primary" className="anra-chrome" onMouseLeave={() => setOpen(null)} style={{ position: "fixed", top: "50%", right: 18, transform: "translateY(-50%)", zIndex: 60 }}>
      <div style={{ position: "relative", display: "grid", gap: 4, padding: 6, borderRadius: 999, background: "rgba(253,252,250,.86)", backdropFilter: "blur(16px) saturate(1.3)", WebkitBackdropFilter: "blur(16px) saturate(1.3)", border: "1px solid rgba(227,222,213,.95)", boxShadow: "0 24px 50px -28px rgba(20,24,27,.4)" }}>
        {RAIL.map((r, i) => {
          const isOpen = open === r.k;
          return (
            <React.Fragment key={r.k}>
              {i === 5 && <span aria-hidden="true" style={{ height: 1, margin: "4px 8px", background: "#E3DED5" }} />}
              <button
                // The ALBA intro spotlight (AlbaIntroVeil) targets this orb — always on screen.
                ref={r.ai ? (el) => { if (el && el.offsetParent !== null) registerAlbaNode(el); } : undefined}
                onMouseEnter={() => setOpen(r.k)}
                onFocus={() => setOpen(r.k)}
                onClick={() => setOpen(isOpen ? null : r.k)}
                aria-expanded={isOpen}
                aria-label={r.label}
                className="hv-sand"
                style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", border: 0, background: isOpen ? (r.ai ? "#EFEAF6" : "#EFECE6") : "transparent", color: r.ai ? "#4E3A73" : "#14181B", display: "grid", placeItems: "center", transition: "background .25s" }}
              >
                {r.ai ? <AlbaOrb size={22} /> : <i className={"ph " + r.icon} style={{ fontSize: 19, color: "#3F6F7C" }} />}
                {isOpen && r.ai && <Sparkles />}
              </button>
            </React.Fragment>
          );
        })}
        <span aria-hidden="true" style={{ height: 1, margin: "4px 8px", background: "#E3DED5" }} />
        <button onClick={onSearch} aria-label="Search" className="hv-sand" style={{ width: 44, height: 44, borderRadius: "50%", border: 0, background: "transparent", display: "grid", placeItems: "center", fontSize: 18 }}><i className="ph ph-magnifying-glass" /></button>
      </div>

      {cur && (
        <div style={{ position: "absolute", right: "100%", top: Math.max(0, ri) * 48 + (ri >= 5 ? 13 : 0), paddingRight: 12, animation: "fadeUp .22s ease" }}>
          <div style={{ width: 320, background: "rgba(251,250,247,.97)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid #E3DED5", borderRadius: 18, boxShadow: "0 30px 60px -28px rgba(20,24,27,.35)", padding: "16px 16px 10px" }}>
            <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-.01em" }}>{cur.title}</div>
            <p style={{ margin: "4px 0 8px", fontSize: 14, color: "#5A626A" }}>{cur.blurb}</p>
            <div style={{ display: "grid", maxHeight: "56vh", overflowY: "auto", overflowX: "hidden" }}>
              {cur.links.map((l) => (
                <button key={l.label} onClick={() => pick(l)} className="hv-railLink" style={{ textAlign: "left", border: 0, borderTop: "1px solid #EFECE6", background: "none", padding: "10px 6px", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", fontSize: 15, minHeight: 44, borderRadius: 8 }}>
                  <span>{l.label}</span><span style={{ fontSize: 12, color: "#5A626A", textAlign: "right", whiteSpace: "nowrap" }}>{l.sub || ""}</span>
                </button>
              ))}
            </div>
            {cur.k === "more" && (
              <div style={{ marginTop: 8, paddingTop: 10, borderTop: "1px solid #EFECE6", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "#5A626A" }}>Region</span>
                <div role="group" aria-label="Region" style={{ display: "flex", padding: 3, border: "1px solid #E3DED5", borderRadius: 999, background: "#FDFCFA" }}>
                  {REGIONS.map((rg) => (
                    <button key={rg.code} onClick={() => setRegion(rg.code)} aria-pressed={region === rg.code} style={{ border: 0, background: region === rg.code ? "#14181B" : "transparent", color: region === rg.code ? "#F7F5F1" : "#3A4147", fontSize: 12, fontWeight: 500, letterSpacing: ".06em", padding: "0 10px", height: 30, borderRadius: 999 }}>{rg.code}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}