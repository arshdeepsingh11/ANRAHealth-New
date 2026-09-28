"use client";

import React, { useEffect, useState } from "react";
import { useAnraNav, MAPFOCUS_EVENT } from "@/lib/useAnraNav";
import AnraEl from "@/components/AnraEl";
import { CLINICS, CLINIC_PHONE, PAGE_HREF } from "@/data/homeContent";

type Focus = "all" | "ne" | "mm";

// Home 06: "Two clinics. One Calgary network." — interactive 3D city map
// (<anra-city>) with the two clinic cards and the referral card.
export default function Locations() {
  const go = useAnraNav();
  const [focus, setFocus] = useState<Focus>("all");

  useEffect(() => {
    // Beacons on the map dispatch "anra-focus"; the nav dispatches MAPFOCUS_EVENT.
    const on = (e: Event) => { const d = (e as CustomEvent).detail; if (d === "ne" || d === "mm" || d === "all") setFocus(d); };
    document.addEventListener("anra-focus", on);
    document.addEventListener(MAPFOCUS_EVENT, on);
    const q = new URLSearchParams(window.location.search).get("focus");
    if (q === "ne" || q === "mm") setFocus(q);
    return () => { document.removeEventListener("anra-focus", on); document.removeEventListener(MAPFOCUS_EVENT, on); };
  }, []);

  return (
    <section id="locations" data-screen-label="Home 06 Locations" style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(40px,6vw,88px) clamp(16px,4vw,40px)" }}>
      <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "#5A626A" }}>Locations</div>
      <h2 style={{ margin: "14px 0 0", fontSize: "clamp(34px,4.6vw,56px)", lineHeight: 1, letterSpacing: "-.04em", fontWeight: 500 }}>Two clinics. One Calgary network.</h2>
      <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "stretch" }}>
        <div style={{ flex: "2 1 520px", minWidth: 0, height: "clamp(340px,40vw,500px)", position: "relative", borderRadius: 24, background: "#0C1215", overflow: "hidden", boxShadow: "0 40px 80px -40px rgba(12,18,21,.7)" }}>
          <AnraEl tag="anra-city" attrs={{ focus }} style={{ position: "absolute", inset: 0 }} />
          <div style={{ position: "absolute", right: 14, bottom: 14, display: "flex", gap: 8 }}>
            {focus === "all" && <span style={{ whiteSpace: "nowrap", padding: "8px 12px", borderRadius: 999, background: "rgba(12,18,21,.7)", color: "#A9C9D1", fontSize: 12, border: "1px solid rgba(110,168,182,.35)" }}>Drag to rotate · tap a beacon</span>}
            <button onClick={() => setFocus("all")} style={{ whiteSpace: "nowrap", height: 34, padding: "0 14px", borderRadius: 999, background: "rgba(12,18,21,.7)", color: "#F7F5F1", border: "1px solid rgba(110,168,182,.5)", fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>Whole city</button>
          </div>
        </div>
        <div style={{ flex: "1 1 300px", display: "grid", gap: 12, alignContent: "start" }}>
          {CLINICS.map((c) => {
            const on = focus === c.k;
            return (
              <div key={c.k} onMouseEnter={() => setFocus(c.k)} onClick={() => setFocus(c.k)} style={{ cursor: "pointer", padding: 20, borderRadius: 18, border: "1px solid " + (on ? "#3F6F7C" : "#E3DED5"), background: on ? "#FFFFFF" : "rgba(253,252,250,.7)", transition: "border-color .3s,background .3s" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: on ? "#3F6F7C" : "#BFD6DC" }} /><span style={{ fontSize: 18, fontWeight: 500 }}>{c.name}</span></div>
                <p style={{ margin: "6px 0 12px 20px", color: "#3A4147", fontSize: 15 }}>{c.addr}</p>
                <div style={{ marginLeft: 20, display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <a href={"https://www.google.com/maps/search/?api=1&query=" + c.q} target="_blank" rel="noopener" style={{ fontWeight: 500 }}>Directions ↗</a>
                  <a href={"tel:" + CLINIC_PHONE} style={{ fontWeight: 500 }}>{CLINIC_PHONE}</a>
                </div>
              </div>
            );
          })}
          <div style={{ position: "relative", overflow: "hidden", padding: "18px 20px", borderRadius: 18, background: "#14181B", color: "#F7F5F1" }}>
            <anra-meteors style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
            <div style={{ position: "relative", fontSize: 18, fontWeight: 500 }}>Start your referral.</div>
            <p style={{ position: "relative", margin: "4px 0 12px", color: "#C9CDD0", fontSize: 15 }}>Scan it with your phone. We detect the fields.</p>
            <button onClick={() => go({ label: "Referral", href: PAGE_HREF.referral })} style={{ position: "relative", height: 44, padding: "0 16px", border: 0, borderRadius: 10, background: "#F7F5F1", color: "#2F5561", fontWeight: 600, letterSpacing: ".06em", fontSize: 13, textTransform: "uppercase" }}>Start a referral</button>
          </div>
        </div>
      </div>
    </section>
  );
}