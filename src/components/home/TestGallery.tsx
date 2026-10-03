"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAlba } from "@/components/AlbaContext";
import { useRegion } from "@/components/RegionContext";
import { GALLERY_LABS, GALLERY_DRUGS, GALLERY_NEA, VENDOR_NAME, VENDOR_COLOR, money, type CatalogItem, type Vendor } from "@/data/bioaroCatalog";
import CatalogDetailSheet from "@/components/home/CatalogDetailSheet";
import LeaveModal from "@/components/home/LeaveModal";
import { GALLERY_EVENT } from "@/components/home/Ecosystem";
import { NIcon } from "@/components/neyu/icons";

// Home 05b: "Explore advanced testing." — 3D carousel of real BioAro Labs
// tests / BioAro Drugs products. Auto-advances; pauses on hover or when the
// visitor steps through it. Active card opens the detail sheet.
export default function TestGallery({ mobile }: { mobile: boolean }) {
  const { isOpen } = useAlba();
  const { region } = useRegion();
  const [vendor, setVendor] = useState<Vendor>("labs");
  const [idx, setIdx] = useState(2);
  const [paused, setPaused] = useState(false);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const [detail, setDetail] = useState<CatalogItem | null>(null);
  const [leave, setLeave] = useState<CatalogItem | null>(null);

  const list = vendor === "labs" ? GALLERY_LABS : vendor === "drugs" ? GALLERY_DRUGS : GALLERY_NEA;
  const gi = Math.min(idx, list.length - 1);

  useEffect(() => {
    const t = setInterval(() => {
      if (paused || isOpen || detail || leave || document.hidden) return;
      setIdx((i) => (i + 1) % list.length);
    }, 3600);
    return () => clearInterval(t);
  }, [paused, isOpen, detail, leave, list.length]);

  useEffect(() => {
    const on = (e: Event) => { const v = (e as CustomEvent).detail as Vendor; setVendor(v); setIdx(1); };
    document.addEventListener(GALLERY_EVENT, on);
    return () => document.removeEventListener(GALLERY_EVENT, on);
  }, []);

  const tabs: [Vendor, string][] = [["labs", "BioAro Labs · Tests"], ["drugs", "BioAro Drugs · Wellness"], ["nea", "Nea · Skin & Aesthetics"]];
  const someUnavailable = list.some((t) => !t.regions.includes(region));

  return (
    <section id="gallery" data-screen-label="Home 05b Test gallery" style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(40px,6vw,88px) clamp(16px,4vw,40px)", overflow: "hidden" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, alignItems: "end" }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "#5A626A" }}>From our partner companies</div>
          <h2 style={{ margin: "14px 0 0", fontSize: "clamp(34px,4.6vw,56px)", lineHeight: 1, letterSpacing: "-.04em", fontWeight: 500 }}>{vendor === "nea" ? "Explore skin & aesthetics." : "Explore advanced testing."}</h2>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {tabs.map(([k, l]) => {
            const on = vendor === k;
            return <button key={k} onClick={() => { setVendor(k); setIdx(1); }} style={{ whiteSpace: "nowrap", minHeight: 42, padding: "0 16px", borderRadius: 999, border: "1px solid " + (on ? "#14181B" : "#D6D0C5"), background: on ? "#14181B" : "transparent", color: on ? "#F7F5F1" : "#14181B", fontSize: 14 }}>{l}</button>;
          })}
        </div>
      </div>
      {vendor === "drugs" && someUnavailable && (
        <p style={{ margin: "14px 0 0", fontSize: 14, color: "#5A626A", display: "flex", gap: 8, alignItems: "center" }}><NIcon name="ph-globe-hemisphere-west" size="1em" tone="currentColor" />Some BioAro Drugs products aren’t sold in your region. They’re shown for information.</p>
      )}

      <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
        // Phones: swipe left/right to move through the cards.
        onTouchStart={(e) => { swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; setPaused(true); }}
        onTouchEnd={(e) => {
          const s0 = swipe.current; swipe.current = null; if (!s0) return;
          const dx = e.changedTouches[0].clientX - s0.x, dy = e.changedTouches[0].clientY - s0.y;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { e.preventDefault(); setIdx(dx < 0 ? Math.min(list.length - 1, gi + 1) : Math.max(0, gi - 1)); }
        }}
        style={{ position: "relative", height: 420, marginTop: 28, perspective: 1300, touchAction: "pan-y" }}>
        {list.map((t, i) => {
          const o = i - gi, ao = Math.abs(o);
          const active = o === 0;
          const available = t.regions.includes(region);
          return (
            <article
              key={t.id}
              onClick={() => (active ? setDetail(t) : setIdx(i))}
              style={{ position: "absolute", left: "50%", top: 10, width: mobile ? 260 : 320, height: 380, transform: `translateX(-50%) translateX(${o * (mobile ? 64 : 72)}%) translateZ(${-ao * 120}px) rotateY(${o * -24}deg) scale(${1 - Math.min(ao, 3) * 0.07})`, opacity: ao > 2 ? 0 : 1 - ao * 0.3, zIndex: 50 - ao, pointerEvents: ao > 2 ? "none" : "auto", transition: "transform .7s cubic-bezier(.2,.8,.2,1),opacity .7s", cursor: "pointer" }}
            >
              {active && <anra-electro radius="22" style={{ position: "absolute", inset: -6, pointerEvents: "none", zIndex: 2 }} />}
              <div style={{ position: "relative", height: "100%", borderRadius: 22, background: "#FDFCFA", border: "1px solid #E3DED5", boxShadow: "0 30px 60px -34px rgba(20,24,27,.45)", padding: 24, display: "grid", gridTemplateRows: "auto auto 1fr auto", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "#5A626A" }}>
                  <span style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: VENDOR_COLOR[t.vendor] }} />{VENDOR_NAME[t.vendor]}</span>
                  <span style={{ textAlign: "right" }}>{t.cat}</span>
                </div>
                <h3 style={{ margin: 0, fontSize: 24, lineHeight: 1.15, letterSpacing: "-.02em", fontWeight: 500 }}>{t.name}</h3>
                <p style={{ margin: 0, fontSize: 15, color: "#3A4147", overflow: "hidden" }}>{t.why}</p>
                <div style={{ display: "grid", gap: 12, paddingTop: 14, borderTop: "1px solid #EFECE6" }}>
                  <div style={{ fontSize: 13, color: "#5A626A" }}>{t.meta}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: t.price ? 26 : 20, letterSpacing: "-.02em", fontWeight: 500 }}>{money(t.price)}</span>
                    <span style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600, color: t.vendor === "nea" ? "#8A4F43" : "#2F5561" }}>{t.vendor === "nea" ? "Book →" : "Explore →"}</span>
                  </div>
                  {!available && <div style={{ fontSize: 13, color: "#7A4B12", display: "flex", gap: 6, alignItems: "center" }}><NIcon name="ph-globe-hemisphere-west" size="1em" tone="currentColor" />Not available in your region</div>}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div style={{ marginTop: 8, display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
        <button onClick={() => { setIdx(Math.max(0, gi - 1)); setPaused(true); }} aria-label="Previous" className="hv-bdTeal" style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid #D6D0C5", background: "#FDFCFA", display: "grid", placeItems: "center" }}><NIcon name="ph-arrow-left" size="1em" tone="currentColor" /></button>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {list.map((_, i) => <button key={i} onClick={() => setIdx(i)} aria-label={"Show item " + (i + 1)} style={{ width: i === gi ? 22 : 7, height: 7, borderRadius: 4, border: 0, padding: 0, background: i === gi ? "#3F6F7C" : "#D6D0C5", transition: "width .4s,background .4s" }} />)}
        </div>
        <button onClick={() => { setIdx(Math.min(list.length - 1, gi + 1)); setPaused(true); }} aria-label="Next" className="hv-bdTeal" style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid #D6D0C5", background: "#FDFCFA", display: "grid", placeItems: "center" }}><NIcon name="ph-arrow-right" size="1em" tone="currentColor" /></button>
      </div>
      <p style={{ margin: "16px 0 0", textAlign: "center", fontSize: 13, color: "#5A626A" }}>{vendor === "nea" ? <>Treatments are provided and booked by Nea Precision Skin, Calgary NE. <a href="/specialties/skin-health" style={{ color: "#8A4F43" }}>See all Nea treatments</a></> : "NEYU doesn’t sell tests. Ordering and payment are handled by BioAro."}</p>

      <CatalogDetailSheet item={detail} mobile={mobile} onClose={() => setDetail(null)} onGet={(i) => { setDetail(null); setLeave(i); }} />
      <LeaveModal item={leave} onClose={() => setLeave(null)} />
    </section>
  );
}
