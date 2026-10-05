"use client";

// Personal Health Space primitives (Magic-UI style, calm): Number Ticker,
// Circular Progress, Animated List, Shine Border, Morphing Text, 3D Flip
// text, status chips, provenance + AI labels. Every motion respects
// prefers-reduced-motion.

import React, { useEffect, useRef, useState } from "react";
import { NIcon } from "@/components/neyu/icons";
import { C } from "./ui";

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Number Ticker — counts up to a value when it scrolls into view. */
export function Ticker({ value, decimals = 0, duration = 900, style }: { value: number; decimals?: number; duration?: number; style?: React.CSSProperties }) {
  const [v, setV] = useState(reduced() ? value : 0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (reduced()) { setV(value); return; }
    let raf = 0, start = 0, from = 0;
    const run = () => { const step = (t: number) => { if (!start) start = t; const p = Math.min(1, (t - start) / duration); setV(from + (value - from) * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { run(); io.disconnect(); } }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, duration]);
  return <span ref={ref} style={{ fontVariantNumeric: "tabular-nums", ...style }}>{v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>;
}

/** Animated Circular Progress Bar. */
export function Ring({ value, max = 100, size = 120, stroke = 9, label, sub, color = "url(#mhsRingGrad)" }: { value: number; max?: number; size?: number; stroke?: number; label?: React.ReactNode; sub?: React.ReactNode; color?: string }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, p = Math.max(0, Math.min(1, value / max));
  const [on, setOn] = useState(reduced());
  useEffect(() => { const t = setTimeout(() => setOn(true), 60); return () => clearTimeout(t); }, []);
  return (
    <div role="img" aria-label={`${Math.round(p * 100)} percent`} style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs><linearGradient id="mhsRingGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1B8FD0" /><stop offset=".55" stopColor="#1FA9B0" /><stop offset="1" stopColor="#6DD88C" /></linearGradient></defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(29,35,39,.07)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={on ? c * (1 - p) : c} style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.2,.7,.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <span style={{ fontSize: size * 0.24, fontWeight: 500, letterSpacing: "-.02em", lineHeight: 1 }}>{label}</span>
        {sub && <span style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>{sub}</span>}
      </div>
    </div>
  );
}

/** Animated List — children appear one after another. */
export function AnimatedList({ children, gap = 10, delay = 90, as = "ul" }: { children: React.ReactNode; gap?: number; delay?: number; as?: "ul" | "ol" }) {
  const Tag = as;
  return (
    <Tag style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap }}>
      {React.Children.toArray(children).map((ch, i) => <li key={i} style={{ animation: reduced() ? undefined : `mhs-fadeUp 420ms cubic-bezier(.2,.7,.2,1) ${i * delay}ms both` }}>{ch}</li>)}
    </Tag>
  );
}

/** Shine Border — an animated light travelling around a card's edge. */
export function Shine({ children, radius = 24, style, width = 1.5 }: { children: React.ReactNode; radius?: number; style?: React.CSSProperties; width?: number }) {
  return (
    <div className="mhs-shine" style={{ position: "relative", borderRadius: radius, padding: width, ...style }}>
      <div style={{ position: "relative", borderRadius: radius - width, background: C.card, height: "100%" }}>{children}</div>
    </div>
  );
}

/** Morphing Text — words dissolve into one another. */
export function Morph({ words, interval = 2600, style }: { words: string[]; interval?: number; style?: React.CSSProperties }) {
  const [i, setI] = useState(0);
  useEffect(() => { if (reduced() || words.length < 2) return; const t = setInterval(() => setI((x) => (x + 1) % words.length), interval); return () => clearInterval(t); }, [words.length, interval]);
  return (
    <span aria-live="off" style={{ position: "relative", display: "inline-grid", ...style }}>
      {words.map((w, k) => <span key={w} aria-hidden={k !== i} style={{ gridArea: "1/1", transition: "opacity .7s ease, filter .7s ease, transform .7s ease", opacity: k === i ? 1 : 0, filter: k === i ? "blur(0)" : "blur(8px)", transform: k === i ? "none" : "translateY(4px)", whiteSpace: "nowrap" }}>{w}</span>)}
    </span>
  );
}

/** Text 3D Flip — letters flip in 3D, staggered, on hover. */
export function Flip3D({ text, style }: { text: string; style?: React.CSSProperties }) {
  return (
    <span className="mhs-flip" aria-label={text} style={{ display: "inline-flex", perspective: 400, ...style }}>
      {text.split("").map((ch, i) => <span key={i} aria-hidden="true" style={{ display: "inline-block", transitionDelay: `${i * 22}ms`, whiteSpace: "pre" }}>{ch}</span>)}
    </span>
  );
}

// ── Meaning: status, source, AI ─────────────────────────────────────────
export const STATUS: Record<string, { label: string; icon: string; bg: string; ink: string }> = {
  new: { label: "New", icon: "sparkle", bg: "#E6F1FB", ink: "#1E5F94" },
  improved: { label: "Improved", icon: "arrowUp", bg: "rgba(110,168,182,.18)", ink: C.tealDark },
  worsened: { label: "Needs a look", icon: "alert", bg: C.peach, ink: C.peachInk },
  stable: { label: "Stable", icon: "minus", bg: "#EFECE8", ink: C.ink3 },
  changed: { label: "Changed", icon: "trend", bg: C.lav, ink: C.lavInk },
  insufficient: { label: "Not enough data", icon: "hourglass", bg: "#F3F1EE", ink: C.muted },
  known: { label: "Known", icon: "check", bg: "rgba(110,168,182,.18)", ink: C.tealDark },
  partial: { label: "Partial", icon: "circle", bg: "#FFF4E0", ink: "#8A5A12" },
  missing: { label: "Missing", icon: "plus", bg: "#F3F1EE", ink: C.muted },
};
export function StatusChip({ s, small }: { s: string; small?: boolean }) {
  const t = STATUS[s] || STATUS.stable;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: small ? 22 : 26, padding: small ? "0 8px" : "0 10px", borderRadius: 13, background: t.bg, color: t.ink, fontSize: small ? 11.5 : 12.5, fontWeight: 500, whiteSpace: "nowrap", flex: "none" }}><NIcon name={t.icon} size={small ? 12 : 13} tone="currentColor" stroke={2} />{t.label}</span>;
}
export function SourceTag({ children }: { children: React.ReactNode }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: C.faint }}><NIcon name="link" size={12} tone="currentColor" />Source: {children}</span>;
}
export function AiTag({ label = "AI-generated · Neyu" }: { label?: string }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 9px", borderRadius: 12, background: C.lav, color: C.lavInk, fontSize: 11.5, fontWeight: 500, letterSpacing: ".02em", flex: "none" }}><NIcon name="sparkle" size={12} tone="currentColor" />{label}</span>;
}
export function OriginalTag() {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 9px", borderRadius: 12, background: "#E9F1EC", color: "#2E6B4A", fontSize: 11.5, fontWeight: 500, flex: "none" }}><NIcon name="shieldCheck" size={12} tone="currentColor" />Original document</span>;
}

/** Section title row used across the Health Space. */
export function SecHead({ title, sub, right }: { title: React.ReactNode; sub?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap", margin: "0 0 14px" }}>
      <div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 500, letterSpacing: "-.01em" }}>{title}</h2>{sub && <p style={{ margin: "4px 0 0", fontSize: 14, color: C.muted, lineHeight: 1.5 }}>{sub}</p>}</div>
      {right}
    </div>
  );
}

/** Calm processing log (Terminal-inspired, but quiet). Steps tick off as they finish. */
export function ProcessSteps({ steps, at }: { steps: string[]; at: number }) {
  return (
    <ol aria-live="polite" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
      {steps.map((s, i) => (
        <li key={s} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: i <= at ? C.ink : C.faint, transition: "color .3s" }}>
          <span style={{ width: 22, height: 22, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: i < at ? C.teal : i === at ? C.tealWash : "#EFECE8", color: "#fff", flex: "none", transition: "background .3s" }}>
            {i < at ? <NIcon name="check" size={13} tone="#fff" stroke={2.2} /> : i === at ? <span style={{ width: 8, height: 8, borderRadius: 4, background: C.teal, animation: "mhs-pulse 1s ease infinite" }} /> : null}
          </span>{s}
        </li>
      ))}
    </ol>
  );
}

export const kindLabel: Record<string, string> = { lab: "Lab report", imaging: "Imaging", ecg: "ECG", cardiology: "Cardiology", specialist: "Specialist", discharge: "Discharge summary", prescription: "Prescription", visit: "Visit note", other: "Other" };
export const kindIcon: Record<string, string> = { lab: "flask", imaging: "scan", ecg: "pulse", cardiology: "heartPulse", specialist: "stethoscope", discharge: "clinic", prescription: "pill", visit: "doctor", other: "doc" };
