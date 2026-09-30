// NEYU Health logo, drawn entirely as vector (no image, no web font), from
// measurements of the NEYU brand artwork: four quarter-ring bands (each centred
// on its outer corner, flat ends on a cross-shaped gap) above a wide geometric
// NEYU wordmark and a tracked HEALTH line. Crisp at any size, identical in every
// browser, recolours for dark backgrounds, and reads as "NEYU Health" to screen readers.
import React, { useId } from "react";

export const NEYU = { name: "NEYU Health", short: "NEYU", ink: "#0E1B2C" } as const;

// ── Mark (viewBox -51..51): one piece, mirrored into each quadrant ──
const PIECE = "M-13.5 -50H-5.5V-28.32A49.5 49.5 0 0 1 -28.32 -5.5H-50V-13.5A36.5 36.5 0 0 0 -13.5 -50Z";
const PIECES = [
  { t: "scale(1 1)", c: ["#86E0A0", "#3CC79E"] },
  { t: "scale(-1 1)", c: ["#4FD3B6", "#28B8BE"] },
  { t: "scale(1 -1)", c: ["#2A84E4", "#2FA3E0"] },
  { t: "scale(-1 -1)", c: ["#36C8BA", "#62DCC4"] },
] as const;

function MarkPaths({ id, mono }: { id: string; mono?: string }) {
  return (
    <>
      {!mono && <defs>{PIECES.map((p, i) => <linearGradient key={i} id={`${id}g${i}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={p.c[0]} /><stop offset="1" stopColor={p.c[1]} /></linearGradient>)}</defs>}
      {PIECES.map((p, i) => <path key={i} d={PIECE} transform={p.t} fill={mono || `url(#${id}g${i})`} />)}
    </>
  );
}

/** The NEYU mark on its own. `mono` renders it in one colour (e.g. white). */
export function NeyuMark({ size = 32, mono, title }: { size?: number | string; mono?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="-51 -51 102 102" width={size} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false" style={{ display: "block", flex: "none" }}>
      <MarkPaths id={id} mono={mono} />
    </svg>
  );
}

// ── Wordmark: letters drawn as strokes on a 100-unit cap height, clipped to the cap band ──
const NEYU_W = 814, HEALTH_W = 1098;
const NEYU_PATHS = "<path transform=\"translate(0 0)\" d=\"M10.5 100V0L137.5 100V0\"/><path transform=\"translate(240 0)\" d=\"M112 10.5H10.5V89.5H112M10.5 50H104\"/><path transform=\"translate(444 0)\" d=\"M0 -6L70.0 54L140 -6M70.0 54V100\"/><path transform=\"translate(676 0)\" d=\"M10.5 0V31.0A58.5 58.5 0 0 0 127.5 31.0V0\"/>";
const HEALTH_PATHS = "<path transform=\"translate(0 0)\" d=\"M7.5 0V100M100.5 0V100M7.5 50H100.5\"/><path transform=\"translate(204 0)\" d=\"M92 7.5H7.5V92.5H92M7.5 50H84\"/><path transform=\"translate(392 0)\" d=\"M-3 106L59.0 -6L121 106M23.6 66H94.4\"/><path transform=\"translate(606 0)\" d=\"M7.5 0V92.5H88\"/><path transform=\"translate(790 0)\" d=\"M0 7.5H104M52.0 7.5V100\"/><path transform=\"translate(990 0)\" d=\"M7.5 0V100M100.5 0V100M7.5 50H100.5\"/>";
function Word({ id, paths, stroke, weight, x, y, scale }: { id: string; paths: string; stroke: string; weight: number; x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke={stroke} strokeWidth={weight} strokeMiterlimit={10}>
      <g clipPath={`url(#${id}cap)`} dangerouslySetInnerHTML={{ __html: paths }} />
    </g>
  );
}

/**
 * Full logo.
 * - layout "stacked": mark above NEYU / HEALTH (brand lockup) — `height` is the total height
 * - layout "inline": mark beside NEYU / HEALTH (navigation) — `height` is the mark height
 * - tone "light" for dark backgrounds; `mono` makes the mark one colour too
 */
export default function NeyuLogo({ height = 40, layout = "inline", tone = "dark", mono, fluid }: { height?: number; layout?: "inline" | "stacked"; tone?: "dark" | "light"; mono?: boolean; /** CSS height (e.g. "clamp(120px,14vw,172px)") — overrides `height` so the logo scales with the screen */ fluid?: string }) {
  const id = useId().replace(/:/g, "");
  const ink = tone === "light" ? "#FFFFFF" : NEYU.ink;
  const sub = tone === "light" ? "rgba(255,255,255,.82)" : "#14263A";
  const markMono = mono ? ink : undefined;
  const clip = <clipPath id={`${id}cap`}><rect x="-50" y="0" width="5000" height="100" /></clipPath>;
  if (layout === "stacked") {
    // Units: NEYU cap = 100. Mark 350 tall, 140 gap, NEYU 100, 72 gap, HEALTH 45.
    const MS = 350, HW = HEALTH_W * 0.45, W = Math.max(NEYU_W, HW, MS), H = MS + 140 + 100 + 72 + 45;
    return (
      <svg viewBox={`-4 -4 ${W + 8} ${H + 8}`} height={fluid ? undefined : height} width={fluid ? undefined : (height * (W + 8)) / (H + 8)} role="img" aria-label={NEYU.name} focusable="false" style={{ display: "block", margin: "0 auto", overflow: "visible", ...(fluid ? { height: fluid, width: "auto", aspectRatio: `${W + 8} / ${H + 8}` } : null) }}>
        <defs>{clip}</defs>
        <svg x={(W - MS) / 2} y={0} width={MS} height={MS} viewBox="-51 -51 102 102"><MarkPaths id={id} mono={markMono} /></svg>
        <Word id={id} paths={NEYU_PATHS} stroke={ink} weight={21} x={(W - NEYU_W) / 2} y={MS + 140} scale={1} />
        <Word id={id} paths={HEALTH_PATHS} stroke={sub} weight={15} x={(W - HW) / 2} y={MS + 140 + 100 + 72} scale={0.45} />
      </svg>
    );
  }
  // Inline: mark 350 tall; text block (NEYU cap 110, gap 64, HEALTH cap 50) centred beside it.
  const MS = 350, TX = MS + 120, NS = 1.1, HS = 0.5, TOP = (MS - (110 + 64 + 50)) / 2;
  const W = TX + Math.max(NEYU_W * NS, HEALTH_W * HS);
  return (
    <svg viewBox={`-4 -4 ${W + 8} ${MS + 8}`} height={height} width={(height * (W + 8)) / (MS + 8)} role="img" aria-label={NEYU.name} focusable="false" style={{ display: "block", overflow: "visible", flex: "none" }}>
      <defs>{clip}</defs>
      <svg x={0} y={0} width={MS} height={MS} viewBox="-51 -51 102 102"><MarkPaths id={id} mono={markMono} /></svg>
      <Word id={id} paths={NEYU_PATHS} stroke={ink} weight={21} x={TX} y={TOP} scale={NS} />
      <Word id={id} paths={HEALTH_PATHS} stroke={sub} weight={16} x={TX} y={TOP + 110 + 64} scale={HS} />
    </svg>
  );
}
