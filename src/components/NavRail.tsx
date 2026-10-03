"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { RAIL, type NavLink } from "@/data/homeContent";
import { REGIONS, useRegion } from "@/components/RegionContext";
import AlbaOrb from "@/components/AlbaOrb";
import { useAnraNav } from "@/lib/useAnraNav";
import { useAlba } from "@/components/AlbaContext";

// Four-point sparkle burst shown on the hovered / open item.
function Sparkles({ violet }: { violet?: boolean }) {
  const c = violet ? "#2A84E4" : "#6EA8B6";
  const star = (x: number, y: number, sz: number, d: number) => (
    <svg key={x + "_" + y} viewBox="0 0 10 10" style={{ position: "absolute", left: x, top: y, width: sz, height: sz, animation: `sparkle 1.3s ${d}s ease-in-out infinite`, pointerEvents: "none" }}>
      <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill={c} />
    </svg>
  );
  return <span aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{star(-3, -2, 9, 0)}{star(48, 4, 7, 0.35)}{star(44, 40, 8, 0.7)}{star(-2, 36, 6, 0.2)}</span>;
}

// Short labels under each icon + the section each page belongs to.
const SHORT: Record<string, string> = { care: "Care", diag: "Tests", prev: "Prevent", long: "Longevity", ai: "Neyu", more: "More" };
const SECTION_OF = (path: string): string | null => {
  if (["/care", "/specialties", "/physicians", "/virtual-care", "/hypertension-clinic", "/referral-centre"].some((p) => path.startsWith(p))) return "care";
  if (["/diagnostics", "/genomics", "/at-home", "/lab-results"].some((p) => path.startsWith(p))) return "diag";
  if (["/prevention", "/packages", "/cardiac-symptoms"].some((p) => path.startsWith(p))) return "prev";
  if (["/longevity", "/membership"].some((p) => path.startsWith(p))) return "long";
  if (["/neyu", "/explain-diagnosis"].some((p) => path.startsWith(p))) return "ai";
  if (["/explore", "/resources", "/contact", "/about"].some((p) => path.startsWith(p))) return "more";
  return null;
};

// Desktop primary navigation — a floating vertical rail on the right edge
// (icon + label), with a fly-out panel for each section that always stays
// on screen. The border carries a slow sparkle shimmer.
export default function NavRail({ onSearch }: { onSearch: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [flyTop, setFlyTop] = useState(0);
  const go = useAnraNav();
  const pathname = usePathname() || "/";
  const active = SECTION_OF(pathname);
  const { region, setRegion } = useRegion();
  const { registerAlbaNode } = useAlba();
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const flyRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const cur = RAIL.find((r) => r.k === open) || null;

  // Align the fly-out with its item, then nudge it up if it would run off-screen.
  useLayoutEffect(() => {
    if (!open) return;
    const item = itemRefs.current[open], nav = navRef.current, fly = flyRef.current;
    if (!item || !nav || !fly) return;
    const navTop = nav.getBoundingClientRect().top;
    let top = item.getBoundingClientRect().top - navTop - 8;
    const bottom = navTop + top + fly.offsetHeight, limit = window.innerHeight - 16;
    if (bottom > limit) top -= bottom - limit;
    if (navTop + top < 16) top = 16 - navTop;
    setFlyTop(top);
  }, [open]);

  const pick = (l: NavLink) => { setOpen(null); go(l); };

  return (
    <nav ref={navRef} aria-label="Primary" className="anra-chrome" onMouseLeave={() => { setOpen(null); setHover(null); }}
      style={{ position: "fixed", top: "calc(50% - 24px)", right: 18, transform: "translateY(-50%)", zIndex: 60 }}>
      <div className="anra-rail" style={{ position: "relative", display: "grid", gap: 2, padding: 6, borderRadius: 30, boxShadow: "0 24px 50px -28px rgba(20,24,27,.4)" }}>
        {RAIL.map((r, i) => {
          const isOpen = open === r.k, isActive = active === r.k, lit = isOpen || hover === r.k;
          return (
            <React.Fragment key={r.k}>
              {i === 5 && <span aria-hidden="true" style={{ height: 1, margin: "3px 10px", background: "#E3DED5" }} />}
              <button
                // The Neyu intro spotlight (AlbaIntroVeil) targets this orb — always on screen.
                ref={(el) => { itemRefs.current[r.k] = el; if (r.ai && el && el.offsetParent !== null) registerAlbaNode(el); }}
                onMouseEnter={() => { setOpen(r.k); setHover(r.k); }}
                onFocus={() => setOpen(r.k)}
                onClick={() => setOpen(isOpen ? null : r.k)}
                aria-expanded={isOpen}
                aria-label={r.label}
                aria-current={isActive ? "page" : undefined}
                style={{
                  position: "relative", width: 58, height: 54, borderRadius: 18, border: 0, cursor: "pointer",
                  background: isActive ? "rgba(63,111,124,.11)" : lit ? (r.ai ? "#E6F3F8" : "#EFECE6") : "transparent",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                  transition: "background .2s, transform .2s", transform: lit ? "translateX(-2px)" : "none",
                }}
              >
                {isActive && <span aria-hidden="true" style={{ position: "absolute", left: -3, top: 16, bottom: 16, width: 3, borderRadius: 2, background: "#3F6F7C" }} />}
                {r.ai ? <AlbaOrb size={22} /> : <i className={(isActive || lit ? "ph-fill " : "ph ") + r.icon} style={{ fontSize: 20, color: isActive ? "#2F5A66" : lit ? "#3F6F7C" : "#3A4147", transition: "color .2s" }} />}
                <span style={{ fontSize: 10, lineHeight: 1, fontWeight: isActive ? 600 : 500, letterSpacing: ".01em", color: r.ai ? "#163F6E" : isActive ? "#2F5A66" : "#5A626A" }}>{SHORT[r.k] || r.label}</span>
                {lit && <Sparkles violet={r.ai} />}
              </button>
            </React.Fragment>
          );
        })}
        <span aria-hidden="true" style={{ height: 1, margin: "3px 10px", background: "#E3DED5" }} />
        <button onClick={onSearch} aria-label="Search" onMouseEnter={() => { setOpen(null); setHover("search"); }} className="hv-sand"
          style={{ position: "relative", width: 58, height: 50, borderRadius: 18, border: 0, background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
          <i className="ph ph-magnifying-glass" style={{ fontSize: 19, color: "#3A4147" }} />
          <span style={{ fontSize: 10, lineHeight: 1, fontWeight: 500, color: "#5A626A" }}>Search</span>
          {hover === "search" && <Sparkles />}
        </button>
      </div>

      {cur && (
        <div ref={flyRef} style={{ position: "absolute", right: "100%", top: flyTop, paddingRight: 12, animation: "fadeUp .22s ease" }}>
          <div style={{ width: 320, background: "rgba(251,250,247,.97)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid #E3DED5", borderRadius: 18, boxShadow: "0 30px 60px -28px rgba(20,24,27,.35)", padding: "16px 16px 10px" }}>
            <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-.01em" }}>{cur.title}</div>
            <p style={{ margin: "4px 0 8px", fontSize: 14, color: "#5A626A" }}>{cur.blurb}</p>
            <div style={{ display: "grid", maxHeight: "min(56vh, 520px)", overflowY: "auto", overflowX: "hidden" }}>
              {cur.links.map((l) => (
                <button key={l.label} onClick={() => pick(l)} className="hv-railLink" style={{ textAlign: "left", border: 0, borderTop: "1px solid #EFECE6", background: "none", padding: "10px 6px", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", fontSize: 15, minHeight: 44, borderRadius: 8, cursor: "pointer" }}>
                  <span>{l.label}</span><span style={{ fontSize: 12, color: "#5A626A", textAlign: "right", whiteSpace: "nowrap" }}>{l.sub || ""}</span>
                </button>
              ))}
            </div>
            {cur.k === "more" && (
              <div style={{ marginTop: 8, paddingTop: 10, borderTop: "1px solid #EFECE6", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "#5A626A" }}>Region</span>
                <div role="group" aria-label="Region" style={{ display: "flex", padding: 3, border: "1px solid #E3DED5", borderRadius: 999, background: "#FDFCFA" }}>
                  {REGIONS.map((rg) => (
                    <button key={rg.code} onClick={() => setRegion(rg.code)} aria-pressed={region === rg.code} style={{ border: 0, background: region === rg.code ? "#14181B" : "transparent", color: region === rg.code ? "#F7F5F1" : "#3A4147", fontSize: 12, fontWeight: 500, letterSpacing: ".06em", padding: "0 10px", height: 30, borderRadius: 999, cursor: "pointer" }}>{rg.code}</button>
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
