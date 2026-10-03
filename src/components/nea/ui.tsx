"use client";

// Shared tokens + small components for the Nea pages.
import React, { useEffect, useRef, useState } from "react";
import { NEA } from "@/data/nea";

export const T = {
  ink: "#14181B", ink2: "#3A4147", muted: "#5A626A", faint: "#8A9197", line: "#E3DED5", line2: "#EFECE6",
  paper: "#FBFAF7", card: "#FFFFFF", nea: NEA.color, deep: "#8A4F43", soft: NEA.colorSoft, teal: "#3F6F7C",
  violet: "#1D5FA8", ai: "#2A84E4", good: "#2E7D5B",
};
// Categorical order (validated: CVD + normal-vision separation pass on #fcfcfb).
export const SERIES = ["#B4583F", "#2A78D6", "#1BAF7A", "#E0A100", "#C2477E", "#1D5FA8", "#008300", "#E87BA4"];

export const wrap: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" };
export const eyebrow: React.CSSProperties = { fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: T.muted };
export const h2: React.CSSProperties = { margin: "10px 0 0", fontSize: "clamp(28px,3.8vw,46px)", lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 500 };
export const card: React.CSSProperties = { background: T.card, border: `1px solid ${T.line}`, borderRadius: 22, boxShadow: "0 1px 2px rgba(20,24,27,.04), 0 18px 40px -30px rgba(20,24,27,.35)" };
export const glass: React.CSSProperties = { background: "rgba(255,255,255,.72)", backdropFilter: "blur(18px) saturate(1.4)", WebkitBackdropFilter: "blur(18px) saturate(1.4)", border: "1px solid rgba(255,255,255,.8)", boxShadow: "0 20px 50px -30px rgba(20,24,27,.35)" };
export const btnInk: React.CSSProperties = { height: 48, padding: "0 20px", borderRadius: 14, background: T.ink, color: "#F7F5F1", border: 0, fontSize: 13.5, letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 500, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, textDecoration: "none", cursor: "pointer", whiteSpace: "nowrap" };
export const btnGhost: React.CSSProperties = { ...btnInk, background: "transparent", color: T.ink, border: `1px solid ${T.ink}` };
export const chip = (on: boolean): React.CSSProperties => ({ whiteSpace: "nowrap", minHeight: 40, padding: "0 15px", borderRadius: 999, border: `1px solid ${on ? T.ink : "#D6D0C5"}`, background: on ? T.ink : "rgba(255,255,255,.6)", color: on ? "#F7F5F1" : T.ink, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 });
export const aiText: React.CSSProperties = { background: "linear-gradient(90deg,#2A84E4,#3CC79E,#6EA8B6,#2A84E4)", backgroundSize: "300% 100%", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", animation: "aiText 6s linear infinite" };

export function Book({ label = "Book at Nea", ghost, small, href = NEA.book }: { label?: string; ghost?: boolean; small?: boolean; href?: string }) {
  return <a href={href} target="_blank" rel="noopener" style={{ ...(ghost ? btnGhost : btnInk), ...(small ? { height: 40, padding: "0 14px", fontSize: 12 } : {}) }}>{label}<i className="ph ph-arrow-up-right" /></a>;
}

export function Icon({ name, size = 22, bg = T.soft, color = T.deep, box = 44 }: { name: string; size?: number; bg?: string; color?: string; box?: number }) {
  return <span style={{ width: box, height: box, borderRadius: box * 0.32, background: bg, color, display: "grid", placeItems: "center", flex: "none" }}><i className={"ph " + name} style={{ fontSize: size }} /></span>;
}

/** Fires once when the element scrolls into view. */
export function useInView<E extends Element>(amount = 0.25) {
  const ref = useRef<E>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: amount });
    io.observe(el);
    return () => io.disconnect();
  }, [amount, seen]);
  return [ref, seen] as const;
}

/** Number that counts up when it enters the view. */
export function CountUp({ to, suffix = "", prefix = "", ms = 1100 }: { to: number; suffix?: string; prefix?: string; ms?: number }) {
  const [ref, seen] = useInView<HTMLSpanElement>();
  const [v, setV] = useState(to);
  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    let raf = 0; const t0 = performance.now();
    const step = (t: number) => { const k = Math.min(1, (t - t0) / ms); setV(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, ms]);
  return <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>{prefix}{v}{suffix}</span>;
}

export function Stat({ value, label, icon, tone = T.deep, children }: { value: React.ReactNode; label: string; icon: string; tone?: string; children?: React.ReactNode }) {
  return (
    <div style={{ ...card, padding: "18px 18px 16px", display: "grid", gap: 6, position: "relative", overflow: "hidden" }}>
      <div aria-hidden style={{ position: "absolute", right: -30, top: -30, width: 110, height: 110, borderRadius: "50%", background: `radial-gradient(circle, ${tone}22, transparent 70%)` }} />
      <i className={"ph " + icon} style={{ fontSize: 20, color: tone }} />
      <div style={{ fontSize: "clamp(28px,3.2vw,38px)", letterSpacing: "-.03em", fontWeight: 500, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.35 }}>{label}</div>
      {children}
    </div>
  );
}

/** Segmented control (Apple style). */
export function Segmented<V extends string>({ value, options, onChange, label }: { value: V; options: { v: NoInfer<V>; label: string; icon?: string }[]; onChange: (v: NoInfer<V>) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} style={{ display: "inline-flex", gap: 4, padding: 4, borderRadius: 14, background: T.line2, maxWidth: "100%", overflowX: "auto" }}>
      {options.map((o) => (
        <button key={o.v} role="tab" aria-selected={value === o.v} onClick={() => onChange(o.v)} style={{ border: 0, cursor: "pointer", minHeight: 36, padding: "0 14px", borderRadius: 10, fontSize: 13.5, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6, background: value === o.v ? "#fff" : "transparent", color: value === o.v ? T.ink : T.muted, boxShadow: value === o.v ? "0 1px 3px rgba(20,24,27,.12)" : "none", transition: "all .2s" }}>
          {o.icon && <i className={"ph " + o.icon} />}{o.label}
        </button>
      ))}
    </div>
  );
}

/** Chart card with an optional "table" view for accessibility. */
export function ChartCard({ title, sub, table, children, right }: { title: string; sub?: string; table?: { head: string[]; rows: (string | number)[][] }; children: React.ReactNode; right?: React.ReactNode }) {
  const [asTable, setAsTable] = useState(false);
  return (
    <div style={{ ...card, padding: "clamp(18px,2.4vw,24px)", minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start", marginBottom: 16 }}>
        <div><h3 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>{title}</h3>{sub && <p style={{ margin: "4px 0 0", fontSize: 13.5, color: T.muted }}>{sub}</p>}</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flex: "none" }}>
          {right}
          {table && <button onClick={() => setAsTable((x) => !x)} aria-pressed={asTable} title={asTable ? "Show chart" : "Show as table"} style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${T.line}`, background: asTable ? T.ink : "#fff", color: asTable ? "#fff" : T.muted, cursor: "pointer", display: "grid", placeItems: "center" }}><i className={"ph " + (asTable ? "ph-chart-bar" : "ph-table")} /></button>}
        </div>
      </div>
      {asTable && table ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr>{table.head.map((h) => <th key={h} style={{ textAlign: "left", padding: "8px 6px", borderBottom: `1px solid ${T.line}`, color: T.muted, fontWeight: 500 }}>{h}</th>)}</tr></thead>
            <tbody>{table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={{ padding: "8px 6px", borderBottom: `1px solid ${T.line2}` }}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ) : children}
    </div>
  );
}

/** Floating tooltip that follows the pointer inside a relative container. */
export function useTip() {
  const [tip, setTip] = useState<{ x: number; y: number; html: React.ReactNode } | null>(null);
  const show = (e: React.MouseEvent | React.FocusEvent, html: React.ReactNode) => {
    const host = (e.currentTarget as HTMLElement).closest("[data-tiphost]") as HTMLElement | null;
    if (!host) return;
    const hr = host.getBoundingClientRect();
    let x: number, y: number;
    if ("clientX" in e && e.clientX) { x = e.clientX - hr.left; y = e.clientY - hr.top; }
    else { const r = (e.currentTarget as Element).getBoundingClientRect(); x = r.left + r.width / 2 - hr.left; y = r.top - hr.top; }
    setTip({ x: Math.min(Math.max(x, 70), hr.width - 70), y, html });
  };
  const node = tip ? (
    <div role="tooltip" style={{ position: "absolute", left: tip.x, top: tip.y - 12, transform: "translate(-50%,-100%)", pointerEvents: "none", zIndex: 5, background: T.ink, color: "#F7F5F1", padding: "8px 11px", borderRadius: 10, fontSize: 12.5, lineHeight: 1.4, whiteSpace: "nowrap", boxShadow: "0 10px 24px -10px rgba(0,0,0,.5)" }}>{tip.html}</div>
  ) : null;
  return { show, hide: () => setTip(null), node };
}

/** Neyu "thinking" shimmer lines while a request runs. */
export function Thinking({ label = "Neyu is analysing" }: { label?: string }) {
  return (
    <div aria-live="polite" style={{ display: "grid", gap: 10, padding: "6px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: T.violet }}>
        <span style={{ display: "inline-flex", gap: 4 }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 6, height: 6, borderRadius: 3, background: T.ai, animation: `pulseSoft 1s ${i * 0.18}s infinite` }} />)}</span>
        {label}…
      </div>
      {[92, 76, 58].map((w, i) => <span key={i} style={{ height: 10, width: w + "%", borderRadius: 5, background: "linear-gradient(90deg,#EFE9F7,#F7EFEB,#EFE9F7)", backgroundSize: "200% 100%", animation: "shimmerText 1.4s linear infinite" }} />)}
    </div>
  );
}

/** Reveals text word by word (a typed-out AI answer). */
export function TypeOut({ text, speed = 18 }: { text: string; speed?: number }) {
  const words = text.split(/(\s+)/);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setN(words.length); return; }
    setN(0);
    const id = setInterval(() => setN((x) => { if (x >= words.length) { clearInterval(id); return x; } return x + 1; }), speed);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return <span>{words.slice(0, n).join("")}{n < words.length && <span style={{ display: "inline-block", width: 2, height: "1em", background: T.ai, marginLeft: 2, verticalAlign: "-2px", animation: "caret 1s steps(1) infinite" }} />}</span>;
}
