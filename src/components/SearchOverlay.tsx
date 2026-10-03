"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SEARCH_INDEX, SEARCH_SUGGESTED, PAGE_HREF, type NavLink } from "@/data/homeContent";
import { LAB_TESTS, WELLNESS } from "@/data/bioaroCatalog";
import { NEA_TREATMENTS } from "@/data/nea";
import { useRegion } from "@/components/RegionContext";
import { useAnraNav } from "@/lib/useAnraNav";

// Site search (care, tools, BioAro tests and products). Opened from the
// desktop rail or the mobile tab bar.
export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const go = useAnraNav();
  const { region } = useRegion();

  useEffect(() => { if (!open) setQ(""); }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const index = useMemo(() => [
    ...SEARCH_INDEX,
    ...LAB_TESTS.map((t) => ({ label: t.name, kind: "Test · " + t.cat, link: { label: t.name, href: PAGE_HREF.catalog } as NavLink })),
    ...WELLNESS.map((t) => ({ label: t.name, kind: "Wellness · " + t.cat, link: { label: t.name, href: t.url(region) } as NavLink })),
    ...NEA_TREATMENTS.map((t) => ({ label: t.name, kind: "Nea · " + t.cat, link: { label: t.name, href: "/specialties/skin-health#" + t.id } as NavLink })),
  ], [region]);

  const s = q.trim().toLowerCase();
  const seen = new Set<string>();
  const results = (s
    ? index.filter((i) => i.label.toLowerCase().includes(s) || i.kind.toLowerCase().includes(s))
    : index.filter((i) => SEARCH_SUGGESTED.includes(i.label))
  ).filter((i) => (seen.has(i.label) ? false : (seen.add(i.label), true))).slice(0, 12);

  if (!open) return null;

  return (
    <div className="anra-chrome">
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(20,24,27,.28)" }} />
      <div role="dialog" aria-label="Search" style={{ position: "fixed", zIndex: 81, top: "clamp(0px,8vh,96px)", left: "50%", transform: "translateX(-50%)", width: "min(680px,100%)", background: "#FBFAF7", borderRadius: 20, boxShadow: "0 40px 80px -30px rgba(20,24,27,.45)", overflow: "hidden", animation: "fadeUp .25s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px 14px 20px", borderBottom: "1px solid #E3DED5" }}>
          <i className="ph ph-magnifying-glass" style={{ fontSize: 20, color: "#5A626A" }} />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search care, tests, tools…" aria-label="Search" style={{ flex: 1, minWidth: 0, border: 0, outline: "none", background: "transparent", fontSize: 19, padding: "8px 0" }} />
          <button onClick={onClose} aria-label="Close search" style={{ width: 40, height: 40, border: 0, background: "#EFECE6", borderRadius: 10, display: "grid", placeItems: "center" }}><i className="ph ph-x" /></button>
        </div>
        <div style={{ padding: "10px 12px 16px", maxHeight: "60vh", overflow: "auto" }}>
          <div style={{ padding: "8px 8px 6px", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#5A626A" }}>{s ? "Results" : "Suggested"}</div>
          {results.map((r) => (
            <button key={r.label + r.kind} onClick={() => { onClose(); go(r.link); }} className="hv-sand" style={{ width: "100%", textAlign: "left", border: 0, background: "none", padding: "12px 10px", borderRadius: 10, display: "flex", justifyContent: "space-between", gap: 12, minHeight: 48, alignItems: "center" }}>
              <span style={{ fontSize: 16 }}>{r.label}</span><span style={{ fontSize: 13, color: "#5A626A" }}>{r.kind}</span>
            </button>
          ))}
          {results.length === 0 && <div style={{ padding: "32px 10px", textAlign: "center", color: "#5A626A" }}>Nothing matches that yet. Try a specialty, a test, or ask Neyu.</div>}
        </div>
      </div>
    </div>
  );
}
