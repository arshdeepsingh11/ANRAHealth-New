"use client";

import React, { useEffect } from "react";
import { VENDOR_NAME, money, type CatalogItem } from "@/data/bioaroCatalog";
import { useRegion } from "@/components/RegionContext";

// Detail sheet for a BioAro test/product (centred dialog on desktop,
// bottom sheet on mobile).
export default function CatalogDetailSheet({ item, mobile, onClose, onGet }: { item: CatalogItem | null; mobile: boolean; onClose: () => void; onGet: (i: CatalogItem) => void }) {
  const { region } = useRegion();

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  if (!item) return null;
  const available = item.regions.includes(region);
  const note = item.vendor === "drugs" ? "Supportive wellness option. Fulfilled by BioAro Drugs." : "Ordering, collection and payment are handled by BioAro Labs.";

  return (
    <div className="anra-chrome">
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 85, background: "rgba(20,24,27,.32)" }} />
      <div role="dialog" aria-label={item.name} style={{ position: "fixed", zIndex: 86, inset: mobile ? "auto 0 0 0" : "50% auto auto 50%", transform: mobile ? "none" : "translate(-50%,-50%)", width: mobile ? "100%" : 560, maxHeight: "90vh", overflow: "auto", background: "#FBFAF7", borderRadius: mobile ? "20px 20px 0 0" : 20, padding: "clamp(24px,4vw,36px)", boxShadow: "0 40px 80px -30px rgba(20,24,27,.45)", animation: "fadeUp .25s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#5A626A" }}>{item.cat} · {VENDOR_NAME[item.vendor]}</span>
          <button onClick={onClose} aria-label="Close" style={{ width: 40, height: 40, border: 0, background: "#EFECE6", borderRadius: 10, display: "grid", placeItems: "center", flex: "none" }}><i className="ph ph-x" /></button>
        </div>
        <h2 style={{ margin: "4px 0 0", fontSize: "clamp(28px,4vw,36px)", lineHeight: 1.08, letterSpacing: "-.03em", fontWeight: 500 }}>{item.name}</h2>
        <p style={{ margin: "12px 0 0", fontSize: 17, color: "#3A4147" }}>{item.why}</p>
        <dl style={{ margin: "24px 0 0", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, borderTop: "1px solid #E3DED5", paddingTop: 16 }}>
          {item.facts.map(([k, v]) => (
            <div key={k}><dt style={{ fontSize: 12, color: "#5A626A" }}>{k}</dt><dd style={{ margin: "4px 0 0" }}>{v}</dd></div>
          ))}
        </dl>
        <div style={{ marginTop: 16, fontSize: 14, color: "#5A626A" }}>{item.vendor === "labs" ? "Best suited for: " + item.bestFor : "Relevant to: " + item.areas.join(", ")}</div>
        <p style={{ margin: "20px 0 0", fontSize: 15, color: "#3A4147", padding: "14px 16px", borderRadius: 12, background: "#EFECE6" }}>Results are most useful alongside your history and other tests. An ANRA clinician can review them with you.</p>
        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 30, letterSpacing: "-.025em", fontWeight: 500 }}>{money(item.price)}</span>
          {available ? (
            <button onClick={() => onGet(item)} className="hv-ink" style={{ height: 52, padding: "0 22px", border: "1px solid #14181B", borderRadius: 12, background: "#14181B", color: "#F7F5F1", fontSize: 14, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 500, display: "flex", gap: 10, alignItems: "center" }}>
              {item.vendor === "labs" ? "Get this test" : "Get this product"}<i className="ph ph-arrow-up-right" />
            </button>
          ) : (
            <span style={{ fontSize: 14, color: "#7A4B12", display: "flex", gap: 6, alignItems: "center" }}><i className="ph ph-globe-hemisphere-west" />Not available in your region</span>
          )}
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: "#5A626A" }}>{note}</div>
      </div>
    </div>
  );
}