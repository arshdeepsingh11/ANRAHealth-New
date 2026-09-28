"use client";

import React, { useEffect } from "react";
import { VENDOR_NAME, money, type CatalogItem } from "@/data/bioaroCatalog";
import { useRegion } from "@/components/RegionContext";

// "You're leaving ANRA" — confirms the hand-off to the partner store, then
// opens the exact product page in a new tab. ANRA never processes purchases.
export default function LeaveModal({ item, onClose }: { item: CatalogItem | null; onClose: () => void }) {
  const { region } = useRegion();

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  if (!item) return null;
  const vName = VENDOR_NAME[item.vendor];
  const handles = item.vendor === "labs" ? "checkout, payment, collection and delivery of results" : "checkout, payment and delivery";

  return (
    <div className="anra-chrome">
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(20,24,27,.4)" }} />
      <div role="dialog" aria-label="Leaving ANRA" style={{ position: "fixed", zIndex: 91, left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(480px,calc(100% - 32px))", background: "#FBFAF7", borderRadius: 20, padding: 28, boxShadow: "0 40px 80px -30px rgba(20,24,27,.5)" }}>
        <i className="ph ph-arrow-square-out" style={{ fontSize: 28, color: "#3F6F7C" }} />
        <h2 style={{ margin: "10px 0 0", fontSize: 26, letterSpacing: "-.02em", fontWeight: 500 }}>You’re leaving ANRA</h2>
        <p style={{ margin: "10px 0 0", color: "#3A4147" }}>{item.name} ({money(item.price)}) is ordered through {vName}. They handle {handles}. ANRA doesn’t process purchases.</p>
        <div style={{ marginTop: 24, display: "grid", gap: 8 }}>
          <a href={item.url(region)} target="_blank" rel="noopener" onClick={onClose} style={{ height: 52, borderRadius: 12, background: "#14181B", color: "#F7F5F1", textDecoration: "none", display: "flex", gap: 10, alignItems: "center", justifyContent: "center", fontSize: 14, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 500 }}>Continue to {vName}<i className="ph ph-arrow-up-right" /></a>
          <button onClick={onClose} style={{ height: 48, border: 0, background: "none", color: "#3F6F7C", fontWeight: 500 }}>Stay on ANRA</button>
        </div>
      </div>
    </div>
  );
}