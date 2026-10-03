// NEYU Health logo, drawn entirely as vector (no image), from measurements of the
// NEYU brand artwork: a light geometric N E U in navy, with the "Y" drawn as a
// sprouting seedling — a blue leaf, a green leaf and a teal stem — above a
// tracked HEALTH line and the tagline "Your health. Reimagined."
// Crisp at any size, identical in every browser, recolours for dark backgrounds,
// and reads as "NEYU Health" to screen readers.
import React, { useId } from "react";

export const NEYU = { name: "NEYU Health", short: "NEYU", ink: "#0E1B2C", tagline: "Your health. Reimagined." } as const;

// ── The seedling "Y" (drawn in a 600×510 box; the artwork's Y is 1/3 of that) ──
const SPROUT = "M60 95C162 86 252 132 274 228C279 250 282 272 284 292C296 220 340 150 420 105C455 85 495 72 529 64C512 128 458 182 397 218C352 245 320 268 303 300C299 360 277 415 241 454L203 463C232 420 252 360 262 305C260 290 249 276 230 260C168 216 102 166 60 95Z";
const SPROUT_STOPS = [["0", "#1B8FD0"], [".46", "#1FA9B0"], ["1", "#6DD88C"]] as const;

function SproutDefs({ id }: { id: string }) {
  return <linearGradient id={`${id}s`} gradientUnits="userSpaceOnUse" x1="60" y1="120" x2="527" y2="70">{SPROUT_STOPS.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}</linearGradient>;
}

/** The NEYU seedling mark on its own. `mono` renders it in one colour (e.g. white). */
export function NeyuMark({ size = 32, mono, title }: { size?: number | string; mono?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="40 40 510 440" width={size} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false" style={{ display: "block", flex: "none" }}>
      {!mono && <defs><SproutDefs id={id} /></defs>}
      <path d={SPROUT} fill={mono || `url(#${id}s)`} />
    </svg>
  );
}

// ── Wordmark, in artwork pixels (cap height 106, stroke 13.5), clipped to the cap band ──
// N 150–293 · E 325–423 · Y 439–594 (seedling) · U 599–710
const LETTERS = "M156.75 290V170L286.25 290V170M423 183.75H331.75V276.25H423M331.75 229.5H417M605.75 170V228A48.25 48.25 0 0 0 702.25 228V170";
// HEALTH: cap 32 at y 320–352, stroke 4.3
const HEALTH = "M255.15 316V356M279.85 316V356M255.15 336H279.85M350 322.15H328.15V349.85H350M328.15 336H347M386.5 357L404.5 316L422.5 357M393.2 341.5H415.8M463.15 316V349.85H483M514 322.15H541M527.5 322.15V356M582.15 316V356M607.85 316V356M582.15 336H607.85";

function Wordmark({ id, ink, sub, mono, health = true }: { id: string; ink: string; sub: string; mono?: string; health?: boolean }) {
  return (
    <>
      <defs>
        <SproutDefs id={id} />
        <clipPath id={`${id}c`}><rect x="100" y="177" width="700" height="106" /></clipPath>
        <clipPath id={`${id}h`}><rect x="200" y="320" width="500" height="32" /></clipPath>
      </defs>
      <path d={LETTERS} clipPath={`url(#${id}c)`} fill="none" stroke={ink} strokeWidth={13.5} strokeMiterlimit={10} />
      <g transform="translate(420 140) scale(.3333)"><path d={SPROUT} fill={mono || `url(#${id}s)`} /></g>
      {health && <path d={HEALTH} clipPath={`url(#${id}h)`} fill="none" stroke={sub} strokeWidth={4.3} strokeMiterlimit={10} />}
    </>
  );
}

/**
 * Full logo.
 * - layout "stacked": NEYU / HEALTH / tagline, centred (brand lockup) — `height` is the total height
 * - layout "inline": NEYU over HEALTH (navigation, footer) — `height` is the total height
 * - tone "light" for dark backgrounds; `mono` makes the seedling one colour too
 * - `tagline` (stacked only) shows "Your health. Reimagined." under the lockup
 */
export default function NeyuLogo({ height = 40, layout = "inline", tone = "dark", mono, fluid, tagline = true }: { height?: number; layout?: "inline" | "stacked"; tone?: "dark" | "light"; mono?: boolean; /** CSS height (e.g. "clamp(120px,14vw,172px)") — overrides `height` so the logo scales with the screen */ fluid?: string; tagline?: boolean }) {
  const id = useId().replace(/:/g, "");
  const ink = tone === "light" ? "#FFFFFF" : NEYU.ink;
  const sub = tone === "light" ? "rgba(255,255,255,.86)" : "#1C2D40";
  const tag = tone === "light" ? "rgba(255,255,255,.7)" : "#4B6178";
  const seed = mono ? ink : undefined;
  const stacked = layout === "stacked";
  const showTag = stacked && tagline;
  // Artwork box: wordmark x 150–710, y 162–293; HEALTH to 352; tagline baseline 426.
  const vb = showTag ? { x: 120, y: 150, w: 620, h: 290 } : { x: 140, y: 154, w: 580, h: 206 };
  const sizing: React.CSSProperties = fluid ? { height: fluid, width: "auto", aspectRatio: `${vb.w} / ${vb.h}` } : {};
  return (
    <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} height={fluid ? undefined : height} width={fluid ? undefined : (height * vb.w) / vb.h} role="img" aria-label={showTag ? `${NEYU.name} — ${NEYU.tagline}` : NEYU.name} focusable="false" style={{ display: "block", overflow: "visible", flex: "none", margin: stacked ? "0 auto" : undefined, ...sizing }}>
      <Wordmark id={id} ink={ink} sub={sub} mono={seed} />
      {showTag && <text x="430" y="426" textAnchor="middle" fill={tag} fontSize="20.5" letterSpacing="6.2" style={{ fontFamily: "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif", fontWeight: 400 }}>YOUR HEALTH. REIMAGINED.</text>}
    </svg>
  );
}
