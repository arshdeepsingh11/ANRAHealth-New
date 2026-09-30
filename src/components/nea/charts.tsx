"use client";

// Interactive charts for Nea. Every figure is one Nea publishes, or a count of
// Nea's own treatment/package lists. All charts have hover/focus tooltips.
import React, { useMemo, useState } from "react";
import { NEA_AXES, NEA_REL, NEA_TREATMENTS, NEA_CATS, NEA_PACKAGES, NEA_MIX, mixOf, itemQty, type NeaAxis, type NeaCat, type NeaTreatment } from "@/data/nea";
import { T, SERIES, useTip, useInView } from "./ui";

// ── Range bars (downtime / session length) ───────────────────────────────
export function RangeBars({ rows, unit, max, color, fromZero }: { rows: { name: string; min: number; max: number }[]; unit: string; max: number; color: string; fromZero?: boolean }) {
  const tip = useTip();
  const [ref, seen] = useInView<HTMLDivElement>();
  const fmt = (r: { min: number; max: number }) => (r.max === 0 ? "None" : r.min === r.max ? `${r.max} ${unit}` : `${r.min}–${r.max} ${unit}`);
  const w = (v: number) => `${seen ? (v / max) * 100 : 0}%`;
  return (
    <div ref={ref} data-tiphost style={{ position: "relative", display: "grid", gap: 12 }}>
      {rows.map((r) => (
        <div key={r.name} tabIndex={0} onMouseMove={(e) => tip.show(e, <><b>{r.name}</b><br />{fmt(r)}</>)} onFocus={(e) => tip.show(e, <><b>{r.name}</b><br />{fmt(r)}</>)} onMouseLeave={tip.hide} onBlur={tip.hide}
          style={{ display: "grid", gridTemplateColumns: "minmax(110px,38%) 1fr auto", gap: 12, alignItems: "center", fontSize: 14, outline: "none", cursor: "default" }}>
          <span style={{ color: T.ink2 }}>{r.name}</span>
          <span style={{ position: "relative", height: 10, borderRadius: 5, background: T.line2 }}>
            {r.max === 0 ? <span style={{ position: "absolute", left: 0, top: -2, width: 14, height: 14, borderRadius: 7, background: "#2E7D5B", boxShadow: "0 0 0 4px rgba(46,125,91,.16)" }} />
              : fromZero ? <>
                <span style={{ position: "absolute", left: 0, width: w(r.max), top: 0, bottom: 0, borderRadius: 5, background: color, opacity: r.min < r.max ? 0.45 : 1, transition: "width .9s cubic-bezier(.2,.8,.2,1)" }} />
                {r.min < r.max && <span style={{ position: "absolute", left: 0, width: w(r.min), top: 0, bottom: 0, borderRadius: 5, background: color, transition: "width .9s cubic-bezier(.2,.8,.2,1)" }} />}
              </>
              : <span style={{ position: "absolute", left: `${(r.min / max) * 100}%`, width: seen ? `calc(${((r.max - r.min) / max) * 100}% + 10px)` : 0, top: 0, bottom: 0, borderRadius: 5, background: color, transition: "width .9s cubic-bezier(.2,.8,.2,1)" }} />}
          </span>
          <span style={{ fontVariantNumeric: "tabular-nums", color: T.ink, minWidth: 64, textAlign: "right" }}>{fmt(r)}</span>
        </div>
      ))}
      {tip.node}
    </div>
  );
}

// ── Outcome rings ────────────────────────────────────────────────────────
export function Rings({ items }: { items: { label: string; value: number; note: string }[] }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 16 }}>
      {items.map((o, i) => {
        const r = 44, c = 2 * Math.PI * r, col = SERIES[i % SERIES.length], plus = /muscle/i.test(o.label);
        return (
          <figure key={o.label} style={{ margin: 0, display: "grid", justifyItems: "center", gap: 8, textAlign: "center" }}>
            <svg viewBox="0 0 110 110" width="110" height="110" role="img" aria-label={`${o.label}: ${plus ? "+" : ""}${o.value}%`}>
              <circle cx="55" cy="55" r={r} fill="none" stroke={T.line2} strokeWidth="9" />
              <circle cx="55" cy="55" r={r} fill="none" stroke={col} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${seen ? (o.value / 100) * c : 0} ${c}`} transform="rotate(-90 55 55)" style={{ transition: `stroke-dasharray 1.2s ${i * 0.12}s cubic-bezier(.2,.8,.2,1)` }} />
              <text x="55" y="61" textAnchor="middle" fontSize="21" fontWeight="500" fill={T.ink}>{plus ? "+" : ""}{o.value}%</text>
            </svg>
            <figcaption style={{ fontSize: 13.5, lineHeight: 1.35 }}><b style={{ fontWeight: 500 }}>{o.label}</b><br /><span style={{ color: T.muted }}>{o.note}</span></figcaption>
          </figure>
        );
      })}
    </div>
  );
}

// ── Neuromodulator timeline with a day slider ────────────────────────────
// Published: visible in 24 h, full effect in 3 days, lasts 3–6 months.
const NEURO_END = 180;
function neuroLevel(day: number) {
  if (day <= 0) return 0;
  if (day <= 3) return Math.min(1, 0.35 * day + (day >= 1 ? 0.1 : 0));
  if (day <= 90) return 1;
  return Math.max(0, 1 - (day - 90) / 90);
}
export function NeuroSlider() {
  const [day, setDay] = useState(3);
  const W = 100, H = 36, x = (d: number) => (d / NEURO_END) * W, y = (v: number) => H - 3 - v * (H - 8);
  const path = useMemo(() => { let s = ""; for (let d = 0; d <= NEURO_END; d += 1) s += `${d ? "L" : "M"}${x(d).toFixed(2)} ${y(neuroLevel(d)).toFixed(2)} `; return s; }, []);
  const phase = day === 0 ? "Treatment day (10–20 min)" : day < 1 ? "" : day < 3 ? "Visible — building" : day <= 90 ? "Full effect" : "Gradually wearing off (3–6 months)";
  return (
    <div>
      <div style={{ position: "relative", height: 120 }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
          <defs><linearGradient id="neuroF" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={T.nea} stopOpacity=".35" /><stop offset="1" stopColor={T.nea} stopOpacity="0" /></linearGradient></defs>
          <rect x={x(90)} y="0" width={x(180) - x(90)} height={H} fill="rgba(20,24,27,.03)" />
          <path d={`${path} L${W} ${H} L0 ${H} Z`} fill="url(#neuroF)" />
          <path d={path} fill="none" stroke={T.nea} strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <line x1={x(day)} x2={x(day)} y1="0" y2={H} stroke={T.ink} strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="3 3" />
        </svg>
        <span style={{ position: "absolute", left: `${(day / NEURO_END) * 100}%`, top: `${(y(neuroLevel(day)) / H) * 100}%`, width: 14, height: 14, margin: "-7px 0 0 -7px", borderRadius: 7, background: T.ink, border: "3px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,.25)", pointerEvents: "none", transition: "top .15s" }} />
        <span style={{ position: "absolute", right: 6, top: 4, fontSize: 11.5, color: T.faint }}>Effect</span>
      </div>
      <input type="range" min={0} max={NEURO_END} value={day} onChange={(e) => setDay(Number(e.target.value))} aria-label="Days after treatment" style={{ width: "100%", accentColor: T.deep, marginTop: 8 }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.faint }}><span>Day 0</span><span>1 mo</span><span>3 mo</span><span>6 mo</span></div>
      <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", padding: "10px 12px", borderRadius: 12, background: T.paper, border: `1px solid ${T.line2}` }}>
        <span style={{ fontSize: 14 }}><b style={{ fontWeight: 500 }}>Day {day}</b> · {phase || "Visible within 24 hours"}</span>
        <span style={{ fontSize: 12, color: T.muted }}>Shape is illustrative</span>
      </div>
    </div>
  );
}

// ── Category donut (click to filter) ─────────────────────────────────────
export function CategoryDonut({ onPick, active }: { onPick?: (c: NeaCat) => void; active?: NeaCat | "All" }) {
  const tip = useTip();
  const [hover, setHover] = useState<number | null>(null);
  const data = NEA_CATS.map((c, i) => ({ c, n: NEA_TREATMENTS.filter((t) => t.cat === c).length, col: SERIES[i] }));
  const total = data.reduce((a, d) => a + d.n, 0);
  const R = 70, r = 46, gap = 0.025;
  let a0 = -Math.PI / 2;
  const arcs = data.map((d) => { const a1 = a0 + (d.n / total) * Math.PI * 2; const s = { ...d, a0: a0 + gap / 2, a1: a1 - gap / 2 }; a0 = a1; return s; });
  const arc = (s: number, e: number, ro: number, ri: number) => {
    const p = (a: number, rr: number) => `${(90 + rr * Math.cos(a)).toFixed(2)} ${(90 + rr * Math.sin(a)).toFixed(2)}`;
    const big = e - s > Math.PI ? 1 : 0;
    return `M${p(s, ro)} A${ro} ${ro} 0 ${big} 1 ${p(e, ro)} L${p(e, ri)} A${ri} ${ri} 0 ${big} 0 ${p(s, ri)} Z`;
  };
  const focus = hover != null ? data[hover] : null;
  return (
    <div data-tiphost style={{ position: "relative", display: "grid", gridTemplateColumns: "minmax(160px,200px) 1fr", gap: 18, alignItems: "center" }}>
      <svg viewBox="0 0 180 180" style={{ width: "100%", maxWidth: 200 }} role="img" aria-label="Nea treatments by category">
        {arcs.map((s, i) => (
          <path key={s.c} d={arc(s.a0, s.a1, hover === i || active === s.c ? R + 5 : R, r)} fill={s.col} stroke="#fff" strokeWidth="2" opacity={hover != null && hover !== i ? 0.35 : 1}
            style={{ cursor: onPick ? "pointer" : "default", transition: "all .2s" }} tabIndex={0} role="button" aria-label={`${s.c}: ${s.n}`}
            onMouseEnter={() => setHover(i)} onMouseMove={(e) => tip.show(e, <><b>{s.c}</b> · {s.n} treatments</>)} onMouseLeave={() => { setHover(null); tip.hide(); }}
            onFocus={() => setHover(i)} onBlur={() => setHover(null)} onClick={() => onPick?.(s.c)} onKeyDown={(e) => e.key === "Enter" && onPick?.(s.c)} />
        ))}
        <text x="90" y="88" textAnchor="middle" fontSize="30" fontWeight="500" fill={T.ink}>{focus ? focus.n : total}</text>
        <text x="90" y="106" textAnchor="middle" fontSize="10.5" fill={T.muted}>{focus ? focus.c : "treatments"}</text>
      </svg>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 4 }}>
        {data.map((d, i) => (
          <li key={d.c}>
            <button onClick={() => onPick?.(d.c)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", borderRadius: 10, border: 0, background: hover === i || active === d.c ? T.line2 : "transparent", cursor: onPick ? "pointer" : "default", fontSize: 14, color: T.ink, textAlign: "left" }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: d.col, flex: "none" }} />
              <span style={{ flex: 1 }}>{d.c}</span>
              <span style={{ color: T.muted, fontVariantNumeric: "tabular-nums" }}>{d.n}</span>
            </button>
          </li>
        ))}
      </ul>
      {tip.node}
    </div>
  );
}

// ── Concern map: treatments × concerns ───────────────────────────────────
export function ConcernMap({ onOpen }: { onOpen?: (t: NeaTreatment) => void }) {
  const tip = useTip();
  const [hx, setHx] = useState<number | null>(null);
  const [hy, setHy] = useState<number | null>(null);
  const rows = NEA_TREATMENTS.filter((t) => Object.keys(NEA_REL[t.id] || {}).length);
  const shade = ["#F4F1EC", "#E7C3B8", "#B4583F"];
  return (
    <div data-tiphost style={{ position: "relative", overflowX: "auto" }}>
      <table style={{ borderCollapse: "separate", borderSpacing: 3, fontSize: 12.5, minWidth: 620 }}>
        <thead>
          <tr>
            <th />
            {NEA_AXES.map((a, i) => <th key={a.id} scope="col" style={{ fontWeight: hx === i ? 600 : 400, color: hx === i ? T.ink : T.muted, padding: "0 2px 6px", verticalAlign: "bottom", width: 62, lineHeight: 1.2 }}>{a.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((t, y) => (
            <tr key={t.id}>
              <th scope="row" style={{ textAlign: "left", fontWeight: hy === y ? 600 : 400, color: hy === y ? T.ink : T.ink2, whiteSpace: "nowrap", paddingRight: 10 }}>
                <button onClick={() => onOpen?.(t)} style={{ border: 0, background: "none", padding: 0, font: "inherit", color: "inherit", cursor: "pointer", textAlign: "left" }}>{t.name}</button>
              </th>
              {NEA_AXES.map((a, x) => {
                const v = (NEA_REL[t.id]?.[a.id as NeaAxis] ?? 0) as 0 | 1 | 2;
                const txt = v === 2 ? "Primary focus" : v === 1 ? "Also helps" : "Not a focus";
                return (
                  <td key={a.id} tabIndex={v ? 0 : -1} onMouseEnter={() => { setHx(x); setHy(y); }} onMouseMove={(e) => tip.show(e, <><b>{t.name}</b><br />{a.label}: {txt}</>)} onMouseLeave={() => { setHx(null); setHy(null); tip.hide(); }}
                    onFocus={(e) => { setHx(x); setHy(y); tip.show(e, <><b>{t.name}</b><br />{a.label}: {txt}</>); }} onBlur={tip.hide} onClick={() => v && onOpen?.(t)} aria-label={`${t.name} — ${a.label}: ${txt}`}
                    style={{ height: 24, borderRadius: 6, background: shade[v], outline: hx === x || hy === y ? `1px solid ${T.line}` : "none", cursor: v ? "pointer" : "default", transition: "transform .15s", transform: hx === x && hy === y ? "scale(1.12)" : "none" }} />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 12.5, color: T.muted }}>
        {["Not a focus", "Also helps", "Primary focus"].map((l, i) => <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: shade[i], border: i ? 0 : `1px solid ${T.line}` }} />{l}</span>)}
      </div>
      {tip.node}
    </div>
  );
}

// ── Radar: your profile vs a treatment ───────────────────────────────────
export function Radar({ a, b, size = 340, labelA = "You", labelB }: { a: Partial<Record<NeaAxis, number>>; b?: Partial<Record<NeaAxis, number>>; size?: number; labelA?: string; labelB?: string }) {
  const n = NEA_AXES.length, c = size / 2, R = size / 2 - 78;
  const pt = (i: number, v: number) => { const ang = -Math.PI / 2 + (i / n) * Math.PI * 2; return [c + Math.cos(ang) * R * v, c + Math.sin(ang) * R * v]; };
  const poly = (vals: Partial<Record<NeaAxis, number>>, max: number) => NEA_AXES.map((ax, i) => pt(i, Math.min(1, (vals[ax.id] ?? 0) / max)).map((q) => q.toFixed(1)).join(",")).join(" ");
  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", maxWidth: size, display: "block", margin: "0 auto", overflow: "visible" }} role="img" aria-label="Concern profile radar">
        {[0.25, 0.5, 0.75, 1].map((k) => <polygon key={k} points={NEA_AXES.map((_, i) => pt(i, k).join(",")).join(" ")} fill="none" stroke={T.line} strokeWidth="1" />)}
        {NEA_AXES.map((ax, i) => { const [x, y] = pt(i, 1); const [lx, ly] = pt(i, 1.14); return <g key={ax.id}><line x1={c} y1={c} x2={x} y2={y} stroke={T.line2} /><text x={lx} y={ly} fontSize="11" fill={T.muted} textAnchor={Math.abs(lx - c) < 6 ? "middle" : lx > c ? "start" : "end"} dominantBaseline="middle">{ax.label}</text></g>; })}
        {b && <polygon points={poly(b, 2)} fill="rgba(42,120,214,.14)" stroke="#2A78D6" strokeWidth="2" strokeLinejoin="round" style={{ transition: "all .5s" }} />}
        <polygon points={poly(a, 3)} fill="rgba(180,88,63,.2)" stroke="#B4583F" strokeWidth="2" strokeLinejoin="round" style={{ transition: "all .5s" }} />
      </svg>
      <figcaption style={{ display: "flex", gap: 14, justifyContent: "center", fontSize: 12.5, color: T.muted }}>
        <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 12, height: 3, background: "#B4583F", borderRadius: 2 }} />{labelA}</span>
        {b && labelB && <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 12, height: 3, background: "#2A78D6", borderRadius: 2 }} />{labelB}</span>}
      </figcaption>
    </figure>
  );
}

// ── Package composition (stacked, by item count) ─────────────────────────
export function PackageMix({ group, onPick }: { group?: "Beauty" | "Wellness"; onPick?: (id: string) => void }) {
  const tip = useTip();
  const [ref, seen] = useInView<HTMLDivElement>();
  const packs = NEA_PACKAGES.filter((p) => !group || p.group === group).map((p) => {
    const tier = p.tiers[p.tiers.length - 1]; // the fullest option
    const mix: Record<string, number> = {};
    tier.items.forEach((it) => { const k = mixOf(it); mix[k] = (mix[k] || 0) + itemQty(it); });
    return { p, mix, total: Object.values(mix).reduce((a, b) => a + b, 0), tier: tier.name };
  });
  const max = Math.max(...packs.map((x) => x.total));
  return (
    <div ref={ref} data-tiphost style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14, fontSize: 12.5, color: T.muted }}>
        {NEA_MIX.map((m, i) => <span key={m} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: SERIES[i] }} />{m}</span>)}
      </div>
      <div style={{ display: "grid", gap: 9 }}>
        {packs.map(({ p, mix, total, tier }) => (
          <button key={p.id} onClick={() => onPick?.(p.id)} style={{ display: "grid", gridTemplateColumns: "minmax(110px,30%) 1fr 34px", gap: 10, alignItems: "center", border: 0, background: "none", padding: 0, cursor: onPick ? "pointer" : "default", textAlign: "left", font: "inherit", color: T.ink2, fontSize: 14 }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
            <span style={{ display: "flex", gap: 2, height: 14 }}>
              {NEA_MIX.map((m, i) => mix[m] ? (
                <span key={m} onMouseMove={(e) => tip.show(e, <><b>{p.name}{tier ? ` · ${tier}` : ""}</b><br />{m}: {mix[m]}</>)} onMouseLeave={tip.hide}
                  style={{ width: seen ? `${(mix[m] / max) * 100}%` : 0, background: SERIES[i], borderRadius: 4, transition: "width .9s cubic-bezier(.2,.8,.2,1)" }} />
              ) : null)}
            </span>
            <span style={{ fontVariantNumeric: "tabular-nums", color: T.ink, textAlign: "right" }}>{total}</span>
          </button>
        ))}
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 12, color: T.faint }}>Number of sessions, tests and consults in each package (fullest option).</p>
      {tip.node}
    </div>
  );
}

// ── Fotona wavelength spectrum ───────────────────────────────────────────
export function Spectrum() {
  const tip = useTip();
  const min = 300, max = 3200, x = (nm: number) => ((nm - min) / (max - min)) * 100;
  const marks = [{ nm: 1064, n: "Nd:YAG", d: "1064 nm · reaches deeper — tightening, rosacea, hair, nails, warts" }, { nm: 2940, n: "Er:YAG", d: "2940 nm · absorbed by water at the surface — resurfacing, pores, scars" }];
  return (
    <div data-tiphost style={{ position: "relative", paddingTop: 34 }}>
      <div style={{ position: "relative", height: 22, borderRadius: 11, overflow: "hidden", background: `linear-gradient(90deg, transparent ${x(380)}%, #7B3FE4 ${x(420)}%, #2A78D6 ${x(480)}%, #1BAF7A ${x(530)}%, #E0A100 ${x(590)}%, #E34948 ${x(680)}%, #6A1F1F ${x(760)}%, #3A2622 ${x(900)}%, #1C1716 100%)` }}>
        <span style={{ position: "absolute", left: `${x(380)}%`, width: `${x(760) - x(380)}%`, top: 0, bottom: 0, border: "1px dashed rgba(255,255,255,.7)", borderRadius: 11 }} />
      </div>
      {marks.map((m) => (
        <button key={m.n} onMouseMove={(e) => tip.show(e, m.d)} onMouseLeave={tip.hide} onFocus={(e) => tip.show(e, m.d)} onBlur={tip.hide} aria-label={m.d}
          style={{ position: "absolute", left: `${x(m.nm)}%`, top: 0, transform: "translateX(-50%)", border: 0, background: "none", cursor: "help", display: "grid", justifyItems: "center", gap: 2, padding: 0 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: T.ink }}>{m.n}</span>
          <span style={{ width: 2, height: 40, background: T.ink, position: "relative" }}><span style={{ position: "absolute", left: -5, bottom: -3, width: 12, height: 12, borderRadius: 6, background: "#fff", border: `2px solid ${T.ink}`, animation: "segLive 1.8s infinite" }} /></span>
        </button>
      ))}
      <div style={{ position: "relative", height: 16, fontSize: 11.5, color: T.faint, marginTop: 20 }}>
        <span style={{ position: "absolute", left: 0 }}>← Visible light</span>
        <span style={{ position: "absolute", left: `${x(1900)}%`, transform: "translateX(-50%)", whiteSpace: "nowrap" }}>infrared →</span>
        <span style={{ position: "absolute", right: 0 }}>3200 nm</span>
      </div>
      {tip.node}
    </div>
  );
}

// ── Opening hours week strip ─────────────────────────────────────────────
export function HoursWeek({ today }: { today: number }) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const x = (h: number) => ((h - 6) / 14) * 100;
  return (
    <div style={{ display: "grid", gap: 7 }}>
      {days.map((d, i) => (
        <div key={d} style={{ display: "grid", gridTemplateColumns: "38px 1fr 92px", gap: 10, alignItems: "center", fontSize: 13.5 }}>
          <span style={{ fontWeight: today === i ? 600 : 400, color: today === i ? T.ink : T.muted }}>{d}</span>
          <span style={{ position: "relative", height: 10, borderRadius: 5, background: T.line2 }}>
            {i > 0 && <span style={{ position: "absolute", left: `${x(9)}%`, width: `${x(17) - x(9)}%`, top: 0, bottom: 0, borderRadius: 5, background: today === i ? T.nea : "#D9B3A8" }} />}
          </span>
          <span style={{ color: i ? T.ink2 : T.faint, textAlign: "right" }}>{i ? "9 AM – 5 PM" : "Closed"}</span>
        </div>
      ))}
    </div>
  );
}
