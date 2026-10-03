"use client";

import React, { useState } from "react";
import { RAIL, PAGE_HREF, type NavLink } from "@/data/homeContent";
import { REGIONS, useRegion } from "@/components/RegionContext";
import { useAlba } from "@/components/AlbaContext";
import AlbaOrb from "@/components/AlbaOrb";
import { useAnraNav } from "@/lib/useAnraNav";
import NeyuLogo from "@/components/brand/NeyuLogo";

const tab: React.CSSProperties = { height: 56, border: 0, background: "none", display: "grid", placeItems: "center", gap: 2, fontSize: 11, color: "#3A4147" };

// Mobile primary navigation — floating bottom tab bar + slide-up menu sheet.
export default function MobileNav({ onSearch }: { onSearch: () => void }) {
  const [menu, setMenu] = useState(false);
  const [sec, setSec] = useState<string | null>(null);
  const { openAlba, registerAlbaNode } = useAlba();
  const go = useAnraNav();
  const { region, setRegion } = useRegion();

  const pick = (l: NavLink) => { setMenu(false); go(l); };

  return (
    <div className="anra-chrome">
      <nav aria-label="Primary" style={{ position: "fixed", left: 10, right: 10, bottom: "calc(10px + env(safe-area-inset-bottom))", zIndex: 60, height: 64, borderRadius: 22, background: "rgba(251,250,247,.9)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid #E3DED5", boxShadow: "0 20px 40px -20px rgba(20,24,27,.4)", display: "grid", gridTemplateColumns: "repeat(5,1fr)", alignItems: "center" }}>
        <button onClick={() => setMenu((m) => !m)} aria-label="Menu" aria-expanded={menu} style={tab}><i className={menu ? "ph ph-x" : "ph ph-list"} style={{ fontSize: 22, color: "#14181B" }} />Menu</button>
        <button onClick={() => { setMenu(false); onSearch(); }} aria-label="Search" style={tab}><i className="ph ph-magnifying-glass" style={{ fontSize: 22, color: "#14181B" }} />Search</button>
        <button ref={(el) => { if (el && el.offsetParent !== null) registerAlbaNode(el); }} onClick={() => { setMenu(false); openAlba(); }} aria-label="Ask Neyu" style={{ ...tab, color: "#163F6E", fontWeight: 600 }}><AlbaOrb size={26} />Neyu</button>
        <button onClick={() => pick({ label: "Referral", href: PAGE_HREF.referral })} aria-label="Referral" style={tab}><i className="ph ph-file-text" style={{ fontSize: 22, color: "#14181B" }} />Referral</button>
        <button onClick={() => pick({ label: "Clinics", href: PAGE_HREF.locations })} aria-label="Locations" style={tab}><i className="ph ph-map-pin" style={{ fontSize: 22, color: "#14181B" }} />Clinics</button>
      </nav>

      {menu && (
        <>
          <div onClick={() => setMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 57, background: "rgba(20,24,27,.25)" }} />
          <div role="dialog" aria-label="Menu" style={{ position: "fixed", left: 0, right: 0, bottom: 0, maxHeight: "82vh", zIndex: 58, background: "#FBFAF7", borderRadius: "24px 24px 0 0", overflow: "auto", padding: "10px 20px 100px", animation: "fadeUp .25s ease", boxShadow: "0 -20px 40px -20px rgba(20,24,27,.3)" }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#D6D0C5", margin: "4px auto 12px" }} />
            <div style={{ margin: "4px 0 10px" }}><NeyuLogo height={34} /></div>
            {RAIL.map((r) => {
              const open = sec === r.k;
              return (
                <div key={r.k} style={{ borderBottom: "1px solid #E3DED5" }}>
                  <button onClick={() => setSec(open ? null : r.k)} aria-expanded={open} style={{ width: "100%", background: "none", border: 0, padding: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 19, letterSpacing: "-.01em", minHeight: 54 }}>
                    {r.label}<i className={open ? "ph ph-minus" : "ph ph-plus"} style={{ fontSize: 18, color: "#5A626A" }} />
                  </button>
                  {open && (
                    <div style={{ padding: "0 0 12px", display: "grid" }}>
                      {r.links.map((l) => <button key={l.label} onClick={() => pick(l)} style={{ textAlign: "left", background: "none", border: 0, padding: "12px 0", fontSize: 16, color: "#3A4147", minHeight: 44 }}>{l.label}</button>)}
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ marginTop: 20, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#5A626A", marginBottom: 10 }}>Your region</div>
            <div role="group" aria-label="Region" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", padding: 4, border: "1px solid #E3DED5", borderRadius: 12, background: "#FDFCFA" }}>
              {REGIONS.map((r) => (
                <button key={r.code} onClick={() => setRegion(r.code)} aria-pressed={region === r.code} style={{ border: 0, background: region === r.code ? "#14181B" : "transparent", color: region === r.code ? "#F7F5F1" : "#3A4147", fontWeight: 500, padding: 12, borderRadius: 9 }}>{r.full}</button>
              ))}
            </div>
            <p style={{ margin: "20px 0 0", fontSize: 14, color: "#5A626A" }}>In an emergency, call <a href="tel:911" style={{ color: "#9B2317", fontWeight: 600 }}>911</a>.</p>
          </div>
        </>
      )}
    </div>
  );
}
