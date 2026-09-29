"use client";

// Smooth line chart with drag-to-explore tooltip (design `chart()` +
// `smooth()`): Catmull-Rom curve in a 0–100 viewBox, dashed average line,
// soft area fill. Scrub state is local so only this chart re-renders.

import React, { useMemo, useState } from "react";
import { avg } from "@/lib/portal/metrics";
import { C } from "./ui";

export type ChartPoint = { v: number; label: string; ctx?: string };

function smooth(P: number[][]) {
  if (!P.length) return "";
  let d = "M" + P[0][0].toFixed(2) + " " + P[0][1].toFixed(2);
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += " C" + c1[0].toFixed(2) + " " + c1[1].toFixed(2) + " " + c2[0].toFixed(2) + " " + c2[1].toFixed(2) + " " + p2[0].toFixed(2) + " " + p2[1].toFixed(2);
  }
  return d;
}

export default function Chart({ points, f, name, variant, endLabel = "Today", avgText, tipPrefix }: {
  points: ChartPoint[]; f: (v: number) => string; name: string; variant: "card" | "detail" | "result"; endLabel?: string; avgText?: string; tipPrefix?: string;
}) {
  const [idx, setIdx] = useState<number | null>(null);
  const g = useMemo(() => {
    const vals = points.map((p) => p.v);
    let lo = Math.min(...vals), hi = Math.max(...vals);
    const pad = (hi - lo) * 0.18 || 1; lo -= pad; hi += pad;
    const n = points.length, X = (i: number) => (n > 1 ? (i / (n - 1)) * 100 : 50), Y = (v: number) => 8 + (1 - (v - lo) / (hi - lo)) * 84;
    const P = points.map((p, i) => [X(i), Y(p.v)]);
    const path = n > 1 ? smooth(P) : `M${P[0][0] - 0.5} ${P[0][1]} L${P[0][0] + 0.5} ${P[0][1]}`;
    const a = avg(vals);
    return { n, X, Y, P, path, area: path + " L100 100 L0 100 Z", avgY: Y(a), a, aria: `${name}: from ${f(vals[0])} to ${f(vals[n - 1])}, average ${f(a)}.` };
  }, [points, f, name]);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * (g.n - 1));
    if (i !== idx) setIdx(i);
  };
  const on = idx != null && idx < g.n;
  const p = on ? points[idx!] : null;
  const x = on ? g.X(idx!) : 0, y = p ? g.Y(p.v) : 0, tipX = Math.max(14, Math.min(86, x));
  const detail = variant === "detail", result = variant === "result";
  const H = detail ? 220 : result ? 130 : 140, dot = detail ? 14 : 12;

  return (
    <>
      <div onPointerMove={move} onPointerDown={move} onPointerLeave={() => setIdx(null)} role="img" aria-label={g.aria}
        style={{ position: "relative", height: H, touchAction: "pan-y", cursor: "crosshair", animation: variant === "card" ? "mhs-fadeIn 500ms ease" : undefined }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
          {!result && [8, 50].map((yy) => <line key={yy} x1="0" x2="100" y1={yy} y2={yy} stroke={C.line} vectorEffect="non-scaling-stroke" />)}
          <line x1="0" x2="100" y1="92" y2="92" stroke={C.line} vectorEffect="non-scaling-stroke" />
          {!result && <line x1="0" x2="100" y1={g.avgY.toFixed(2)} y2={g.avgY.toFixed(2)} stroke={C.tealLight} strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />}
          {!result && <path d={g.area} fill={detail ? "rgba(110,168,182,.12)" : "rgba(110,168,182,.10)"} />}
          <path d={g.path} fill="none" stroke={C.teal} strokeWidth={variant === "card" ? 1.75 : 2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke"
            {...(result ? { strokeDasharray: 400, style: { animation: "mhs-drawIn 900ms ease both" } } : {})} />
        </svg>
        {detail && avgText && <span style={{ position: "absolute", right: 0, top: g.avgY + "%", transform: "translateY(-120%)", fontSize: 12, color: C.tealMid, background: C.card, padding: "0 4px" }}>avg {avgText}</span>}
        {result && g.P.map((q, i) => <div key={i} style={{ position: "absolute", left: q[0] + "%", top: q[1] + "%", width: 9, height: 9, margin: "-4.5px 0 0 -4.5px", borderRadius: 5, background: C.card, border: `2px solid ${C.teal}`, pointerEvents: "none" }} />)}
        {on && p && (
          <>
            {!result && <div style={{ position: "absolute", top: 0, bottom: 0, left: x + "%", width: 1, background: "rgba(63,111,124,.3)", pointerEvents: "none" }} />}
            {!result && <div style={{ position: "absolute", left: x + "%", top: y + "%", width: dot, height: dot, margin: `-${dot / 2}px 0 0 -${dot / 2}px`, borderRadius: dot / 2, background: C.card, border: `2px solid ${C.teal}`, pointerEvents: "none", transition: "top 90ms ease" }} />}
            <div style={{ position: "absolute", bottom: `calc(100% + ${detail ? 6 : result ? 10 : 8}px)`, left: tipX + "%", transform: "translateX(-50%)", padding: result ? "9px 12px" : "10px 12px", borderRadius: 12, background: C.ink, color: C.page, whiteSpace: "nowrap", pointerEvents: "none", display: "flex", flexDirection: "column", gap: 2, boxShadow: variant === "card" ? "0 8px 24px rgba(29,35,39,.18)" : undefined, zIndex: 2 }}>
              <span style={{ fontSize: 12, opacity: 0.75 }}>{p.label}{tipPrefix ? ` · ${tipPrefix}` : ""}</span>
              <span style={{ fontSize: result ? 16 : 17, fontWeight: 500 }}>{f(p.v)}</span>
              {p.ctx && <span style={{ fontSize: 12, opacity: 0.75 }}>{p.ctx}</span>}
            </div>
          </>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.faint, marginTop: detail ? 8 : result ? 10 : 6 }}>
        <span>{points[0]?.label.replace("Week of ", "")}</span>
        {detail && <span>Drag across the chart to explore</span>}
        <span>{endLabel}</span>
      </div>
    </>
  );
}
