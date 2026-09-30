// NEYU Health brand mark and wordmark, drawn as vector (SVG + live text) so
// the logo is crisp at every size, recolours for dark backgrounds, and is read
// correctly by screen readers. The four gradient crescents form the NEYU
// "sparkle"; the wordmark uses the site font with wide tracking.
import React, { useId } from "react";

export const NEYU = { name: "NEYU Health", short: "NEYU", ink: "#0E1B2C" } as const;

// Crescent geometry (viewBox -56..56): tips on the axes, outer edge on a circle
// centred at the square's corner, inner edge on a tighter circle.
const PIECES = [
  { d: "M0 -46A46 46 0 0 1 -46 0A33.29 33.29 0 0 0 0 -46Z", t: "-5.5 -5.5", c: ["#8FE3A6", "#3FC9A5"] },
  { d: "M0 -46A46 46 0 0 0 46 0A33.29 33.29 0 0 1 0 -46Z", t: "5.5 -5.5", c: ["#5EDAB2", "#2DBFBF"] },
  { d: "M0 46A46 46 0 0 0 -46 0A33.29 33.29 0 0 1 0 46Z", t: "-5.5 5.5", c: ["#2A86E6", "#35AEE2"] },
  { d: "M0 46A46 46 0 0 1 46 0A33.29 33.29 0 0 0 0 46Z", t: "5.5 5.5", c: ["#3ACBBD", "#6CDEC3"] },
] as const;

/** The NEYU sparkle mark on its own. `mono` renders it in one colour (e.g. white). */
export function NeyuMark({ size = 32, mono, title }: { size?: number | string; mono?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="-56 -56 112 112" width={size} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false" style={{ display: "block", flex: "none" }}>
      {!mono && <defs>{PIECES.map((p, i) => <linearGradient key={i} id={`${id}g${i}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={p.c[0]} /><stop offset="1" stopColor={p.c[1]} /></linearGradient>)}</defs>}
      {PIECES.map((p, i) => <path key={i} d={p.d} transform={`translate(${p.t})`} fill={mono || `url(#${id}g${i})`} />)}
    </svg>
  );
}

/**
 * Full logo.
 * - layout "stacked": mark above NEYU / HEALTH (brand lockup)
 * - layout "inline": mark beside NEYU / HEALTH (navigation)
 * - tone "light" for dark backgrounds (white wordmark)
 */
export default function NeyuLogo({ height = 40, layout = "inline", tone = "dark", mono }: { height?: number; layout?: "inline" | "stacked"; tone?: "dark" | "light"; mono?: boolean }) {
  const ink = tone === "light" ? "#FFFFFF" : NEYU.ink;
  const sub = tone === "light" ? "rgba(255,255,255,.78)" : "#33465A";
  const markColour = mono ? ink : undefined;
  if (layout === "stacked") {
    const word = height * 0.36;
    return (
      <span role="img" aria-label={NEYU.name} style={{ display: "inline-grid", justifyItems: "center", gap: height * 0.1, lineHeight: 1 }}>
        <NeyuMark size={height * 0.5} mono={markColour} />
        <span aria-hidden style={{ fontSize: word, fontWeight: 500, letterSpacing: ".34em", marginRight: "-.34em", color: ink }}>NEYU</span>
        <span aria-hidden style={{ fontSize: word * 0.36, fontWeight: 500, letterSpacing: ".42em", marginRight: "-.42em", color: sub }}>HEALTH</span>
      </span>
    );
  }
  const word = height * 0.5;
  return (
    <span role="img" aria-label={NEYU.name} style={{ display: "inline-flex", alignItems: "center", gap: height * 0.26, lineHeight: 1, height }}>
      <NeyuMark size={height * 0.86} mono={markColour} />
      <span aria-hidden style={{ display: "grid", gap: height * 0.09 }}>
        <span style={{ fontSize: word, fontWeight: 500, letterSpacing: ".3em", marginRight: "-.3em", color: ink }}>NEYU</span>
        <span style={{ fontSize: Math.max(7.5, word * 0.4), fontWeight: 600, letterSpacing: ".48em", marginRight: "-.48em", color: sub }}>HEALTH</span>
      </span>
    </span>
  );
}
