"use client";

// Shared building blocks for the admin console — tokens, chips, buttons,
// cards and list states, taken 1:1 from the approved Claude Design prototype.

import React from "react";

export const T = {
  page: "#F6F4F1", side: "#F3F0EC", card: "#FFFDFB", stone: "#EEEAE5", hover: "#FBF9F6", fresh: "#F4F9FA",
  ink: "#1D2327", ink2: "#5B6369", faint: "#737A80",
  teal: "#3F6F7C", tealDk: "#2F5A66", tealLt: "#6EA8B6", wash: "#E8F2F4", chip: "#E1EDF0",
  lav: "#2A84E4", lavInk: "#5F4A8A", lavWash: "#F0ECF7",
  peach: "#FBEEE8", peachInk: "#8B4B37",
  line: "rgba(29,35,39,.06)", line2: "rgba(29,35,39,.08)", line3: "rgba(29,35,39,.14)",
  shadow: "0 30px 60px -30px rgba(20,24,27,.35)",
};

export type Tone = "teal" | "urgent" | "ai" | "neutral";
const TONES: Record<Tone, { bg: string; fg: string }> = {
  teal: { bg: T.chip, fg: T.tealDk }, urgent: { bg: T.peach, fg: T.peachInk }, ai: { bg: T.lavWash, fg: T.lavInk }, neutral: { bg: T.stone, fg: T.ink2 },
};
export const tone = (t: Tone) => TONES[t] || TONES.neutral;

export interface ChipData { text: string; bg: string; fg: string; icon: string }
export const chip = (text: string, t: Tone, icon = "ph-circle"): ChipData => ({ text, ...tone(t), icon: "ph " + icon });

export function Chip({ c, h = 24, style }: { c: ChipData; h?: number; style?: React.CSSProperties }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: h === 22 ? 4 : 5, height: h, padding: h === 22 ? "0 8px" : h === 26 ? "0 10px" : "0 9px", borderRadius: 999, background: c.bg, color: c.fg, fontSize: h === 22 ? 12 : 12.5, fontWeight: 500, whiteSpace: "nowrap", ...style }}>
      <i className={c.icon} />{c.text}
    </span>
  );
}

/** Dashed marker for test / demo records, so staff never mistake them for real patients. */
export function TestTag({ show = true }: { show?: boolean }) {
  if (!show) return null;
  return <span title="Test record — not a real patient" style={{ display: "inline-flex", alignItems: "center", height: 20, padding: "0 7px", borderRadius: 999, border: "1px dashed rgba(139,75,55,.45)", color: T.peachInk, fontSize: 10.5, fontWeight: 600, letterSpacing: ".06em", whiteSpace: "nowrap", flex: "none" }}>TEST</span>;
}

export const Orb = ({ size = 40, anim = false, style }: { size?: number; anim?: boolean; style?: React.CSSProperties }) => (
  <span aria-hidden style={{ width: size, height: size, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%,#D9CCF0,#2A84E4 60%,#5F4A8A)", flex: "none", display: "inline-block", animation: anim ? "anraOrb 4s ease-in-out infinite" : undefined, ...style }} />
);

// ── Style presets ─────────────────────────────────────────────────────────
export const S = {
  h1: { margin: 0, fontSize: 30, fontWeight: 500, letterSpacing: "-0.025em" } as React.CSSProperties,
  h2: { margin: 0, fontSize: 17, fontWeight: 500 } as React.CSSProperties,
  card: { background: T.card, border: `1px solid ${T.line}`, borderRadius: 20 } as React.CSSProperties,
  btn2: { height: 40, padding: "0 14px", borderRadius: 12, border: `1px solid ${T.line3}`, background: T.card, color: T.ink, fontSize: 14, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" } as React.CSSProperties,
  btnP: { height: 40, padding: "0 16px", borderRadius: 12, border: "none", background: T.teal, color: T.card, fontSize: 14, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" } as React.CSSProperties,
  btnD: { height: 32, padding: "0 10px", borderRadius: 10, border: "1px solid rgba(139,75,55,.25)", background: T.card, color: T.peachInk, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" } as React.CSSProperties,
  btnS: { height: 32, padding: "0 10px", borderRadius: 10, border: `1px solid ${T.line3}`, background: T.card, color: T.ink, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" } as React.CSSProperties,
  input: { height: 44, borderRadius: 12, border: `1px solid ${T.line3}`, background: T.card, padding: "0 14px", fontSize: 15, color: T.ink, outline: "none" } as React.CSSProperties,
  td: { padding: "12px 8px", borderTop: `1px solid ${T.line}` } as React.CSSProperties,
  th: { padding: "12px 8px", fontWeight: 500 } as React.CSSProperties,
  shimmer: { background: "linear-gradient(90deg,#EEEAE5 0,#F6F4F1 50%,#EEEAE5 100%)", backgroundSize: "800px 100%", animation: "anraShimmer 1.2s linear infinite" } as React.CSSProperties,
};

export function SearchBox({ value, onChange, placeholder, label, style }: { value: string; onChange: (v: string) => void; placeholder: string; label: string; style?: React.CSSProperties }) {
  return (
    <label style={{ height: 40, display: "flex", alignItems: "center", gap: 8, padding: "0 12px", borderRadius: 12, border: `1px solid ${T.line3}`, background: T.card, ...style }}>
      <i className="ph ph-magnifying-glass" style={{ color: T.faint }} />
      <input aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14.5, color: T.ink, minWidth: 0 }} />
    </label>
  );
}

// ── List states ───────────────────────────────────────────────────────────
export function Empty({ icon, title, sub, action }: { icon?: string; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ ...S.card, padding: "56px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" }}>
      {icon && <i className={"ph " + icon} style={{ fontSize: 32, color: icon === "ph-check-circle" ? T.tealLt : T.faint }} />}
      <h2 style={{ margin: icon ? "6px 0 0" : 0, fontSize: 18, fontWeight: 500 }}>{title}</h2>
      {sub && <p style={{ margin: 0, color: T.ink2 }}>{sub}</p>}
      {action}
    </div>
  );
}

export function Failed({ what, onRetry, sub = "Your data has not been changed." }: { what: string; onRetry: () => void; sub?: string }) {
  return (
    <div role="alert" style={{ ...S.card, padding: "56px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
      <i className="ph ph-cloud-warning" style={{ fontSize: 32, color: T.faint }} />
      <h2 style={{ margin: "6px 0 0", fontSize: 18, fontWeight: 500 }}>We couldn't load {what}.</h2>
      <p style={{ margin: 0, color: T.ink2 }}>{sub}</p>
      <button onClick={onRetry} className="h-sand" style={{ ...S.btn2, marginTop: 10, padding: "0 16px" }}>Try again</button>
    </div>
  );
}

export function RowsSkeleton({ rows = 5, avatar = 38, round = false }: { rows?: number; avatar?: number; round?: boolean }) {
  return (
    <div aria-busy="true" style={{ ...S.card, padding: "8px 20px" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", padding: "16px 0", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ width: avatar, height: avatar, borderRadius: round ? "50%" : 12, ...S.shimmer }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ width: "40%", height: 14, borderRadius: 6, ...S.shimmer }} />
            <div style={{ width: "65%", height: 12, borderRadius: 6, ...S.shimmer }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export const BlockSkeleton = ({ h = 360 }: { h?: number }) => <div aria-busy="true" style={{ height: h, borderRadius: 20, ...S.shimmer }} />;

export function RecordSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading record" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", ...S.shimmer }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ width: 240, height: 26, borderRadius: 8, ...S.shimmer }} />
          <div style={{ width: 360, maxWidth: "60vw", height: 14, borderRadius: 6, ...S.shimmer }} />
        </div>
      </div>
      <div style={{ height: 40, borderRadius: 10, ...S.shimmer }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ height: 180, borderRadius: 20, ...S.shimmer }} />)}
      </div>
    </div>
  );
}

/** Underlined tab bar used by Patient 360 and the visitor record. */
export function TabBar({ tabs, active, onPick, label, sticky }: { tabs: [string, string][]; active: string; onPick: (k: string) => void; label: string; sticky?: boolean }) {
  return (
    <div role="tablist" aria-label={label} className="no-scrollbar" style={{ display: "flex", gap: 4, overflowX: "auto", borderBottom: `1px solid ${T.line2}`, ...(sticky ? { position: "sticky", top: 64, background: T.page, zIndex: 10, margin: "0 -4px", padding: "0 4px" } : {}) }}>
      {tabs.map(([k, l]) => (
        <button key={k} role="tab" aria-selected={active === k} onClick={() => onPick(k)} style={{ flex: "none", height: 44, padding: "0 12px", border: "none", background: "transparent", color: active === k ? T.ink : T.ink2, fontSize: 14, fontWeight: 500, cursor: "pointer", boxShadow: `inset 0 -2px 0 ${active === k ? T.teal : "transparent"}`, transition: "color 200ms,box-shadow 250ms" }}>{l}</button>
      ))}
    </div>
  );
}

/** Pill filter tabs (dark when active). */
export function PillTabs({ items, active, onPick, count }: { items: [string, string][]; active: string; onPick: (k: string) => void; count?: (k: string) => number }) {
  return (
    <>
      {items.map(([k, l]) => {
        const on = active === k;
        return (
          <button key={k} role="tab" aria-selected={on} onClick={() => onPick(k)} className="h-fade" style={{ flex: "none", height: 34, padding: "0 12px", borderRadius: 999, border: "none", background: on ? T.ink : "transparent", color: on ? T.card : T.ink2, fontSize: 13.5, fontWeight: 500, cursor: "pointer", display: "inline-flex", gap: 6, alignItems: "center", transition: "all 200ms", whiteSpace: "nowrap" }}>
            {l}{count && <span style={{ fontSize: 12.5, color: on ? T.chip : T.faint }}>{count(k)}</span>}
          </button>
        );
      })}
    </>
  );
}

export const CaretRow = () => <i className="ph ph-caret-right" style={{ color: T.faint }} />;
