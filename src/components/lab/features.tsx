"use client";

// The five Longevity Lab features. Every number comes from src/data/longevityScience.ts
// (checked against the papers). Illustrative visuals are labelled as such.
import React, { useMemo, useState } from "react";
import { PAPERS, INTERVENTIONS, EFFECT_BY_TYPE, EFFECT_BY_CLOCK, PACE_OUTCOMES, PGX_DRUGS, PATHWAYS, FEATURE_TESTS, CONSULT_HREF, type FeatureId } from "@/data/longevityScience";
import { T, card, btnInk, btnGhost, chip, eyebrow, h2, aiText, CountUp, useInView } from "@/components/nea/ui";
import { TestCard } from "./assess";
import { Helix3D, Chromosome3D } from "./three";
import { NIcon } from "@/components/neyu/icons";

type Ask = (q: string) => void;
const cite = (id: string) => PAPERS.find((p) => p.id === id)!;

function Head({ n, kicker, title, accent, lead }: { n: number; kicker: string; title: React.ReactNode; accent: string; lead: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 10, maxWidth: 820 }}>
      <div style={{ ...eyebrow, color: accent, display: "flex", gap: 10, alignItems: "center" }}><span style={{ width: 26, height: 26, borderRadius: 8, display: "grid", placeItems: "center", background: accent, color: "#fff", fontSize: 12.5, letterSpacing: 0 }}>{n}</span>{kicker}</div>
      <h2 style={{ ...h2, margin: 0 }}>{title}</h2>
      <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: T.ink2 }}>{lead}</p>
    </div>
  );
}
function Kpis({ items, accent }: { items: { v: number; d?: number; pre?: string; suf?: string; l: string }[]; accent: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,170px),1fr))", gap: 12 }}>
      {items.map((k) => (
        <div key={k.l} style={{ ...card, padding: "16px 18px", display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 4, position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", right: -30, top: -30, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle, ${accent}22, transparent 70%)` }} />
          <b style={{ fontWeight: 500, fontSize: "clamp(28px,3vw,36px)", letterSpacing: "-.03em" }}>{k.pre}{k.d ? (k.v).toFixed(k.d) : <CountUp to={k.v} />}{k.suf}</b>
          <span style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.35 }}>{k.l}</span>
        </div>
      ))}
    </div>
  );
}
function HBars({ rows, max, color, fmt }: { rows: { l: string; v: number; p?: string }[]; max: number; color: string; fmt: (v: number) => string }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 12 }}>
      {rows.map((r) => (
        <div key={r.l} style={{ display: "grid", gridTemplateColumns: "minmax(100px,34%) 1fr 90px", gap: 10, alignItems: "center", fontSize: 14 }}>
          <span>{r.l}</span>
          <span style={{ height: 12, borderRadius: 6, background: T.line2 }}><span style={{ display: "block", height: "100%", borderRadius: 6, width: seen ? `${(r.v / max) * 100}%` : 0, background: `linear-gradient(90deg, ${color}, ${color}99)`, transition: "width 1s cubic-bezier(.2,.8,.2,1)" }} /></span>
          <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(r.v)}{r.p && <span style={{ display: "block", fontSize: 11, color: T.faint }}>{r.p}</span>}</span>
        </div>
      ))}
    </div>
  );
}
function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return <div style={{ ...card, padding: "clamp(18px,2.4vw,24px)", display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 14, alignContent: "start", minWidth: 0 }}><div><h3 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>{title}</h3>{sub && <p style={{ margin: "4px 0 0", fontSize: 13.5, color: T.muted }}>{sub}</p>}</div>{children}</div>;
}
function Cta({ f, accent, line, onAsk, ask }: { f: FeatureId; accent: string; line: string; onAsk: Ask; ask: string }) {
  return (
    <section style={{ borderRadius: 24, padding: "clamp(18px,3vw,28px)", background: `linear-gradient(135deg, ${accent}12, #1D5FA812)`, border: `1px solid ${accent}2A`, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "end" }}>
        <div style={{ maxWidth: 620 }}><div style={{ ...eyebrow, color: accent }}>Your next step</div><p style={{ margin: "6px 0 0", fontSize: 17, lineHeight: 1.55 }}>{line}</p></div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><a href={CONSULT_HREF} style={btnInk}>Book an NEYU consultation<NIcon name="ph-arrow-right" size={18} tone={"currentColor"} /></a><button onClick={() => onAsk(ask)} style={{ ...btnGhost, border: 0, color: T.violet }}><NIcon name="ph-sparkle" size={18} tone={"currentColor"} />Ask Neyu</button></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,240px),1fr))", gap: 12 }}>{FEATURE_TESTS[f].map((id) => <TestCard key={id} id={id} accent={accent} />)}</div>
      <p style={{ margin: 0, fontSize: 12.5, color: T.muted }}>Neyu educates; it does not diagnose. Testing is fulfilled by BioAro Labs. Results are interpreted clinically at NEYU, together with your history.</p>
    </section>
  );
}
function Sources({ ids }: { ids: string[] }) {
  return <p style={{ margin: 0, fontSize: 12.5, color: T.faint, lineHeight: 1.6 }}>Sources: {ids.map((id, i) => { const p = cite(id); return <span key={id}>{i ? " · " : ""}<a href={p.url} target="_blank" rel="noopener" style={{ color: T.muted }}>{p.authors.split(",")[0]} et al., {p.journal} {p.year}</a></span>; })}</p>;
}

// ── 1. Intervention Responsiveness Explorer ──────────────────────────────
export function Responsiveness({ onAsk }: { onAsk: Ask }) {
  const A = "#2E7D5B";
  const [type, setType] = useState("All");
  const [mine, setMine] = useState<string[]>([]);
  const types = ["All", "Lifestyle", "Medication", "Procedure", "Supplement"];
  const list = INTERVENTIONS.filter((x) => type === "All" || x.type === type);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 20 }}>
      <Head n={1} kicker="Intervention Responsiveness Explorer" accent={A} title={<>What actually moves <span style={aiText}>your aging clocks?</span></>} lead="In 2026, researchers pooled 51 human intervention studies to see which changes truly shift biological-aging measures. Some did — reliably. Here is what the evidence shows, and how NEYU and BioAro help you measure your starting point." />
      <Kpis accent={A} items={[{ v: 51, l: "intervention studies pooled" }, { v: 3128, l: "blood samples analysed" }, { v: 16, l: "epigenetic clocks compared" }, { v: 19, l: "interventions that significantly lowered epigenetic age" }]} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 16 }}>
        <Panel title="Average effect by type" sub="Mean reduction in epigenetic age measures (larger = more change)"><HBars rows={EFFECT_BY_TYPE} max={0.1} color={A} fmt={(v) => "−" + v.toFixed(3)} /><p style={{ margin: 0, fontSize: 13, color: T.muted }}>Medications changed clocks more on average; diet changes were the most consistent.</p></Panel>
        <Panel title="Which clocks respond" sub="Pooled mean change across all interventions"><HBars rows={EFFECT_BY_CLOCK} max={0.1} color="#2A78D6" fmt={(v) => "−" + v.toFixed(3)} /><p style={{ margin: 0, fontSize: 13, color: T.muted }}>Newer ‘generation 2+’ clocks moved consistently; first-generation clocks (Horvath, Hannum) only sporadically.</p></Panel>
      </div>
      <Panel title="Interventions with the strongest reported signals" sub="Tap the ones that apply to you — Neyu will explain what they mean for you">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{types.map((t) => <button key={t} onClick={() => setType(t)} aria-pressed={type === t} style={{ ...chip(type === t), minHeight: 34, fontSize: 13 }}>{t}</button>)}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,250px),1fr))", gap: 10 }}>
          {list.map((x) => { const on = mine.includes(x.name); return (
            <button key={x.name} onClick={() => setMine(on ? mine.filter((m) => m !== x.name) : [...mine, x.name])} aria-pressed={on} style={{ textAlign: "left", padding: 14, borderRadius: 16, border: `1px solid ${on ? A : T.line}`, background: on ? A + "10" : "#fff", display: "grid", gap: 6, cursor: "pointer", transition: "all .2s" }}>
              <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><NIcon name={x.icon} size={22} tone={A} /><span style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: T.muted }}>{x.type}</span></span>
              <b style={{ fontWeight: 500, fontSize: 15.5 }}>{x.name}</b><span style={{ fontSize: 13.5, color: T.ink2, lineHeight: 1.45 }}>{x.note}</span>
              <span style={{ fontSize: 12, color: on ? A : T.faint }}>{on ? "✓ Applies to me" : "Tap if this applies to you"}</span>
            </button>
          ); })}
        </div>
        {mine.length > 0 && <button onClick={() => onAsk(`I'm doing or considering: ${mine.join(", ")}. What does the 2026 Nature Medicine research say about these and biological aging, and how could I measure my starting point?`)} style={{ ...btnInk, justifySelf: "start", background: `linear-gradient(120deg, ${A}, #1D5FA8)` }}><NIcon name="ph-sparkle" size={18} tone={"currentColor"} />Neyu: what does this mean for me?</button>}
        <p style={{ margin: 0, fontSize: 12.5, color: T.muted }}>Medications and procedures are clinical decisions for your physician — never a reason to start anything on your own.</p>
      </Panel>
      <Panel title="How NEYU and BioAro fit in" sub="Honest framing">
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: T.ink2 }}>The clocks in this study (DunedinPACE, GrimAge and others) are research-grade DNA-methylation tests. BioAro’s inflammation panels, GDF-15 and telomere tests measure <b style={{ fontWeight: 600 }}>related aging biology</b> — chronic inflammation, cellular stress and chromosome caps — giving you and your NEYU physician a baseline before a change, and something to re-check after.</p>
      </Panel>
      <Cta f="respond" accent={A} onAsk={onAsk} ask="Which interventions have the best evidence for slowing biological aging, and what should I measure first?" line="Measure your inflammation and cellular-stress baseline, then plan changes with a physician who can re-check what moves." />
      <Sources ids={["sehgal2026"]} />
    </div>
  );
}

// ── 2. GDF-15 + Telomere Cellular Stress Map ─────────────────────────────
const FRAIL = [["F", "Fatigue", "Have you felt tired most or all of the time in the past month?"], ["R", "Resistance", "Is it hard to climb 10 stairs without resting?"], ["A", "Ambulation", "Is it hard to walk a couple of blocks?"], ["I", "Illnesses", "Do you have 5 or more ongoing illnesses?"], ["L", "Loss of weight", "Lost more than 5% of your weight in a year without trying?"]];
export function StressMap({ onAsk }: { onAsk: Ask }) {
  const A = "#C2477E";
  const [stress, setStress] = useState(0.35);
  const [f, setF] = useState<boolean[]>(FRAIL.map(() => false));
  const score = f.filter(Boolean).length;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 20 }}>
      <Head n={2} kicker="GDF-15 + Telomere Cellular Stress Map" accent={A} title={<>Two windows on <span style={aiText}>cellular aging</span> — better together.</>} lead="GDF-15 is a stress signal cells release when they are under strain. Telomeres are the protective caps on your chromosomes that shorten over time. In 802 adults, higher GDF-15 went with shorter telomeres — so measuring both gives a fuller picture than either alone." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 16, alignItems: "stretch" }}>
        <div style={{ ...card, padding: 0, overflow: "hidden", background: "radial-gradient(120% 90% at 50% 40%, #FFFFFF, #F6EEF6 70%, #EEF3F7)" }}>
          <Chromosome3D telomere={1 - stress * 0.85} stress={stress} />
          <div style={{ padding: "0 18px 18px", display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 8 }}>
            <label htmlFor="stress" style={{ fontSize: 14, display: "flex", justifyContent: "space-between" }}><span>Cellular stress</span><span style={{ color: T.muted }}>{stress < 0.33 ? "Low" : stress < 0.66 ? "Moderate" : "High"}</span></label>
            <input id="stress" type="range" min={0} max={1} step={0.01} value={stress} onChange={(e) => setStress(Number(e.target.value))} style={{ accentColor: A }} />
            <div style={{ display: "flex", gap: 14, fontSize: 12.5, color: T.muted, flexWrap: "wrap" }}><span style={{ display: "flex", gap: 6, alignItems: "center" }}><span style={{ width: 10, height: 10, borderRadius: 5, background: "#1BAF7A" }} />Telomere caps</span><span style={{ display: "flex", gap: 6, alignItems: "center" }}><span style={{ width: 10, height: 10, borderRadius: 5, background: "#D6606E" }} />GDF-15 signals</span><span>Illustrative model · drag to rotate</span></div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 12 }}>
          <Kpis accent={A} items={[{ v: 802, l: "adults studied (mean age 55)" }, { v: 35, l: "studies in the 2026 GDF-15 frailty review" }]} />
          <Panel title="What the research found">
            <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 8, fontSize: 15, lineHeight: 1.55, color: T.ink2, listStyle: "disc" }}>
              <li>Higher GDF-15 was linked to shorter telomeres after adjusting for age, sex, weight, blood pressure, lipids and HbA1c (β −0.120, p = 0.003) — a straight-line relationship.</li>
              <li>The link was stronger in women, people with overweight and people with abnormal glucose tolerance.</li>
              <li>Across 35 studies, higher GDF-15 consistently tracked with weaker physical performance and more frailty, and predicted future decline.</li>
            </ul>
            <p style={{ margin: 0, fontSize: 13, color: T.muted }}>Associations, not proof of cause — which is exactly why a physician interprets results in context.</p>
          </Panel>
        </div>
      </div>
      <Panel title="FRAIL quick check" sub="The validated 5-question FRAIL scale — the kind of function GDF-15 research tracks">
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 8 }}>{FRAIL.map(([k, t, q], i) => <label key={k} style={{ display: "grid", gridTemplateColumns: "36px 1fr auto", gap: 12, alignItems: "center", padding: "10px 12px", borderRadius: 14, border: `1px solid ${f[i] ? A : T.line}`, background: f[i] ? A + "0D" : "#fff", cursor: "pointer" }}><b style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", background: A + "18", color: A }}>{k}</b><span style={{ fontSize: 14.5 }}><b style={{ fontWeight: 500 }}>{t}.</b> {q}</span><input type="checkbox" checked={f[i]} onChange={() => { const n = [...f]; n[i] = !n[i]; setF(n); }} style={{ width: 20, height: 20, accentColor: A }} /></label>)}</div>
        <div style={{ padding: "12px 14px", borderRadius: 14, background: score >= 3 ? "#FBEDEE" : score ? "#FBF4E4" : "#EAF4EE", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 15 }}><b style={{ fontWeight: 600 }}>{score}/5 · {score >= 3 ? "Frail range" : score ? "Pre-frail range" : "Robust"}</b> — {score >= 3 ? "please discuss with a physician." : score ? "a good moment to check your reserve." : "keep building strength and activity."}</span>
          <button onClick={() => onAsk(`My FRAIL score is ${score} out of 5. What does that mean, and how do GDF-15 and telomere tests relate to it?`)} style={{ ...btnGhost, height: 38, fontSize: 12, border: 0, color: T.violet }}><NIcon name="ph-sparkle" size={18} tone={"currentColor"} />Explain with Neyu</button>
        </div>
      </Panel>
      <Cta f="stress" accent={A} onAsk={onAsk} ask="Why measure GDF-15 and telomere length together?" line="Test GDF-15 and telomere length together for a two-sided view of cellular stress and aging — then review both with an NEYU physician." />
      <Sources ids={["yu2025", "lee2026"]} />
    </div>
  );
}

// ── 3. Pace of Aging vs Biological Age Comparator ────────────────────────
export function PaceVsAge({ onAsk }: { onAsk: Ask }) {
  const A = "#2A78D6";
  const [age, setAge] = useState(45);
  const [pace, setPace] = useState(1.0);
  const yrs = 20, W = 100, H = 50;
  const pts = useMemo(() => Array.from({ length: yrs + 1 }, (_, i) => ({ t: i, chrono: age + i, bio: age + i * pace })), [age, pace]);
  const lo = age, hi = age + yrs * 1.6;
  const x = (i: number) => (i / yrs) * W, y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
  const line = (k: "chrono" | "bio") => pts.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(2)} ${y(p[k]).toFixed(2)}`).join(" ");
  const gauge = (v: number) => { const a = Math.PI * (1 - (v - 0.4) / (2.44 - 0.4)); return [60 + Math.cos(a) * 44, 60 - Math.sin(a) * 44]; };
  const [gx, gy] = gauge(pace);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 20 }}>
      <Head n={3} kicker="Pace of Aging vs Biological Age" accent={A} title={<>Your odometer vs <span style={aiText}>your speedometer.</span></>} lead="Biological age is like an odometer — how much wear has built up. Pace of aging is the speedometer — how fast you are aging right now. The Dunedin Study followed 1,037 people for two decades and found people born the same year aged at very different speeds." />
      <Kpis accent={A} items={[{ v: 1037, l: "Dunedin Study members, ages 26 → 45" }, { v: 19, l: "biomarkers across 7 organ systems" }, { v: 0.4, d: 2, l: "slowest pace: biological years per year" }, { v: 2.44, d: 2, l: "fastest pace: biological years per year" }]} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 16 }}>
        <Panel title="Try it: same age, different pace" sub="Illustrative projection — not a measurement">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 6, fontSize: 14 }}>Your age: <b style={{ fontWeight: 600 }}>{age}</b><input type="range" min={25} max={80} value={age} onChange={(e) => setAge(Number(e.target.value))} style={{ accentColor: A }} /></label>
            <label style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 6, fontSize: 14 }}>Pace: <b style={{ fontWeight: 600 }}>{pace.toFixed(2)}×</b><input type="range" min={0.4} max={2.44} step={0.01} value={pace} onChange={(e) => setPace(Number(e.target.value))} style={{ accentColor: A }} /></label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 14, alignItems: "center" }}>
            <svg viewBox="0 0 120 70" role="img" aria-label={`Pace ${pace.toFixed(2)} years per year`}>
              <path d="M16 60 A44 44 0 0 1 104 60" fill="none" stroke={T.line2} strokeWidth="10" strokeLinecap="round" />
              <path d="M16 60 A44 44 0 0 1 104 60" fill="none" stroke="url(#pg)" strokeWidth="10" strokeLinecap="round" />
              <defs><linearGradient id="pg"><stop offset="0" stopColor="#1BAF7A" /><stop offset=".3" stopColor="#1BAF7A" /><stop offset=".55" stopColor="#E0A100" /><stop offset="1" stopColor="#D0612E" /></linearGradient></defs>
              <line x1="60" y1="60" x2={gx} y2={gy} stroke={T.ink} strokeWidth="3" strokeLinecap="round" style={{ transition: "all .3s" }} /><circle cx="60" cy="60" r="5" fill={T.ink} />
            </svg>
            <div style={{ fontSize: 14.5, lineHeight: 1.5 }}>In {yrs} years you’d be <b style={{ fontWeight: 600 }}>{age + yrs}</b> on the calendar — and about <b style={{ fontWeight: 600, color: pace > 1.05 ? "#D0612E" : pace < 0.95 ? "#1BAF7A" : T.ink }}>{Math.round(age + yrs * pace)}</b> biologically at a {pace.toFixed(2)}× pace.</div>
          </div>
          <div style={{ position: "relative", height: 170 }}>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
              <path d={`${line("bio")} L${W} ${H} L0 ${H} Z`} fill={A + "18"} />
              <path d={line("chrono")} fill="none" stroke={T.faint} strokeWidth="1.5" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
              <path d={line("bio")} fill="none" stroke={A} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            </svg>
            <span style={{ position: "absolute", left: 6, top: 4, fontSize: 12, color: T.muted }}>— Biological · - - Calendar</span>
            <span style={{ position: "absolute", right: 6, bottom: 4, fontSize: 12, color: T.faint }}>+{yrs} years</span>
          </div>
        </Panel>
        <Panel title="Why pace matters" sub="Framingham Offspring (2,471 people, 14 years): risk per 1 SD faster DunedinPACE">
          <HBars rows={PACE_OUTCOMES.map((o) => ({ l: o.l, v: o.hr - 1 }))} max={0.8} color="#D0612E" fmt={(v) => `${(v + 1).toFixed(2)}×`} />
          <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 6, fontSize: 14.5, color: T.ink2, listStyle: "disc" }}>
            <li>Highly repeatable: test–retest ICC 0.96–0.97.</li>
            <li>Childhood poverty and victimization were already linked to faster pace by age 18.</li>
            <li>In the 2026 analysis, DunedinPACE fell in 16 of the interventions studied — pace can change.</li>
          </ul>
        </Panel>
      </div>
      <Panel title="How we connect this to you">
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: T.ink2 }}>Pace-of-aging clocks are research tests. What NEYU and BioAro offer today are measurable drivers linked to aging biology — inflammation panels, GDF-15 and telomere length — which your physician reads alongside blood pressure, glucose, lipids and how you feel, to judge where your pace might be headed and what to change first.</p>
      </Panel>
      <Cta f="pace" accent={A} onAsk={onAsk} ask="What is the difference between biological age and pace of aging, and what can change my pace?" line="Build your aging baseline — inflammation, GDF-15 and telomeres — and review it with an NEYU physician." />
      <Sources ids={["belsky2022", "sehgal2026"]} />
    </div>
  );
}

// ── 4. Pharmacogenomics Longevity Safety Check ───────────────────────────
export function PgxSafety({ onAsk }: { onAsk: Ask }) {
  const A = "#1D5FA8";
  const [picked, setPicked] = useState<string[]>([]);
  const [others, setOthers] = useState(0);
  const genes = useMemo(() => { const m = new Map<string, string[]>(); PGX_DRUGS.filter((d) => picked.includes(d.drug)).forEach((d) => d.genes.forEach((g) => m.set(g, [...(m.get(g) || []), d.drug]))); return m; }, [picked]);
  const ALL = ["CYP2C19", "CYP2D6", "CYP2C9", "VKORC1", "SLCO1B1"];
  const total = picked.length + others;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 20 }}>
      <Head n={4} kicker="Pharmacogenomics Longevity Safety Check" accent={A} title={<>Medicines that fit <span style={aiText}>your genes.</span></>} lead="Your genes shape how you process many common medicines. Most people carry at least one variant with published prescribing guidance — and as we age and take more medicines, knowing this becomes a safety tool, not just a curiosity." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 16 }}>
        <Panel title="Which of these do you take?" sub="Well-established drug–gene pairs with CPIC prescribing guidelines">
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 8 }}>
            {PGX_DRUGS.map((d) => { const on = picked.includes(d.drug); return (
              <label key={d.drug} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", padding: "10px 12px", borderRadius: 14, border: `1px solid ${on ? A : T.line}`, background: on ? A + "0D" : "#fff", cursor: "pointer" }}>
                <span><b style={{ fontWeight: 500, fontSize: 14.5 }}>{d.drug}</b><span style={{ display: "block", fontSize: 12.5, color: T.muted }}>{d.cls} · {d.genes.join(" + ")}</span></span>
                <input type="checkbox" checked={on} onChange={() => setPicked(on ? picked.filter((x) => x !== d.drug) : [...picked, d.drug])} style={{ width: 20, height: 20, accentColor: A }} />
              </label>
            ); })}
          </div>
          <label style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 6, fontSize: 14 }}>Other regular medicines: <b style={{ fontWeight: 600 }}>{others}</b><input type="range" min={0} max={12} value={others} onChange={(e) => setOthers(Number(e.target.value))} style={{ accentColor: A }} /></label>
        </Panel>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 16, alignContent: "start" }}>
          <Panel title="Your gene map" sub="Genes involved in what you selected">
            <svg viewBox="0 0 240 240" style={{ width: "100%", maxWidth: 280, justifySelf: "center" }} role="img" aria-label="Genes linked to your medicines">
              {ALL.map((g, i) => { const a = -Math.PI / 2 + (i / ALL.length) * Math.PI * 2, x = 120 + Math.cos(a) * 82, y = 120 + Math.sin(a) * 82, on = genes.has(g); return (
                <g key={g}><line x1="120" y1="120" x2={x} y2={y} stroke={on ? A : T.line} strokeWidth={on ? 3 : 1.5} style={{ transition: "all .4s" }} />
                  <circle cx={x} cy={y} r={on ? 30 : 24} fill={on ? A : "#fff"} stroke={on ? A : T.line} strokeWidth="2" style={{ transition: "all .4s" }} />
                  <text x={x} y={y + 4} textAnchor="middle" fontSize="10.5" fontWeight="600" fill={on ? "#fff" : T.muted}>{g}</text>
                  {on && <text x={x} y={y + 44} textAnchor="middle" fontSize="9.5" fill={A}>{genes.get(g)!.length} drug{genes.get(g)!.length > 1 ? "s" : ""}</text>}</g>
              ); })}
              <circle cx="120" cy="120" r="30" fill={genes.size ? "#E8F5FA" : T.paper} stroke={T.line} /><text x="120" y="117" textAnchor="middle" fontSize="22" fontWeight="500" fill={T.ink}>{genes.size}</text><text x="120" y="133" textAnchor="middle" fontSize="9" fill={T.muted}>genes</text>
            </svg>
          </Panel>
          <Panel title="Polypharmacy meter" sub="5 or more regular medicines is a common definition of polypharmacy">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 3 }}>{Array.from({ length: 12 }, (_, i) => <span key={i} style={{ height: 22, borderRadius: 5, background: i < total ? (i >= 4 ? "#D0612E" : A) : T.line2, transition: "background .3s" }} />)}</div>
            <span style={{ fontSize: 14.5 }}><b style={{ fontWeight: 600 }}>{total}</b> regular medicine{total === 1 ? "" : "s"}{total >= 5 ? " — polypharmacy range, where drug–gene and drug–drug effects add up." : "."}</span>
            {(picked.length > 0 || total >= 5) && <button onClick={() => onAsk(`I take ${picked.join(", ") || "several medicines"}${others ? ` plus ${others} others` : ""}. How could pharmacogenomic testing help keep my medicines safe? (I won't change anything without my doctor.)`)} style={{ ...btnGhost, height: 38, fontSize: 12, border: 0, color: T.violet, justifySelf: "start" }}><NIcon name="ph-sparkle" size={18} tone={"currentColor"} />Neyu: what could PGx show?</button>}
          </Panel>
        </div>
      </div>
      <p role="note" style={{ margin: 0, padding: "12px 14px", borderRadius: 14, background: "#FBF1E4", color: "#7A4B12", fontSize: 14.5, display: "flex", gap: 8 }}><NIcon name="ph-warning" size={18} tone={"currentColor"} style={{ marginTop: 3 }} />Never stop, start or change a medicine because of a gene result or this tool. Your prescriber decides, with your full history.</p>
      <Cta f="pgx" accent={A} onAsk={onAsk} ask="What is pharmacogenomic testing and why does it matter more as we age?" line="Get your drug–gene profile once, and have an NEYU physician translate it into a plan your prescribers can use for years." />
      <Sources ids={["bousman2025"]} />
    </div>
  );
}

// ── 5. Longevity Genetics Pathway Visualizer ─────────────────────────────
export function GeneticsPathways({ onAsk }: { onAsk: Ask }) {
  const A = "#1D5FA8";
  const [sel, setSel] = useState<string | null>(PATHWAYS[0].id);
  const p = PATHWAYS.find((x) => x.id === sel);
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 20 }}>
      <Head n={5} kicker="Longevity Genetics Pathway Visualizer" accent={A} title={<>What centenarians’ <span style={aiText}>genomes have in common.</span></>} lead="Sequencing the exomes of 338 centenarians, 917 of their children and 595 controls showed that people who live past 100 carry fewer rare, damaging gene variants — concentrated in a handful of biological pathways. Tap a glowing node to explore." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 16, alignItems: "stretch" }}>
        <div style={{ ...card, padding: 0, overflow: "hidden", background: "radial-gradient(110% 90% at 50% 40%, #1F1A2E, #121418 70%)" }}>
          <Helix3D nodes={PATHWAYS.map(({ id, name, color }) => ({ id, name, color }))} active={sel} onPick={setSel} height={400} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "0 14px 14px" }}>{PATHWAYS.map((x) => <button key={x.id} onClick={() => setSel(x.id)} aria-pressed={sel === x.id} style={{ minHeight: 32, padding: "0 12px", borderRadius: 999, border: `1px solid ${sel === x.id ? x.color : "rgba(255,255,255,.2)"}`, background: sel === x.id ? x.color : "rgba(255,255,255,.06)", color: "#fff", fontSize: 12.5, cursor: "pointer", display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 8, height: 8, borderRadius: 4, background: x.color, border: "1px solid #fff" }} />{x.name}</button>)}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 12, alignContent: "start" }}>
          {p && <div key={p.id} style={{ ...card, padding: 20, display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 8, borderColor: p.color + "66", animation: "fadeUp .3s" }}><span style={{ ...eyebrow, color: p.color }}>Pathway</span><b style={{ fontWeight: 500, fontSize: 21 }}>{p.name}</b><p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: T.ink2 }}>{p.text}</p><span style={{ fontSize: 12.5, color: T.faint }}>Source: {p.src}</span><button onClick={() => onAsk(`Explain the ${p.name} pathway and longevity in simple terms. What could whole genome sequencing tell me about it?`)} style={{ ...btnGhost, height: 36, fontSize: 12, border: 0, color: T.violet, padding: 0, justifySelf: "start" }}><NIcon name="ph-sparkle" size={18} tone={"currentColor"} />Ask Neyu</button></div>}
          <Panel title="Damaging-variant burden" sub="Rare loss-of-function variants, relative to controls">
            <div ref={ref} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 10 }}>
              {[["Controls", 100, 100], ["Centenarians", 78, 89]].map(([l, a, b]) => (
                <div key={l as string} style={{ display: "grid", gridTemplateColumns: "100px 1fr 72px", gap: 10, alignItems: "center", fontSize: 14 }}>
                  <span>{l}</span>
                  <span style={{ position: "relative", height: 14, borderRadius: 7, background: T.line2 }}>
                    <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 7, width: seen ? `${a}%` : 0, background: l === "Controls" ? T.faint : A, transition: "width 1s" }} />
                    {a !== b && <span style={{ position: "absolute", left: `${a}%`, width: seen ? `${(b as number) - (a as number)}%` : 0, top: 0, bottom: 0, background: A + "55", transition: "width 1s .2s" }} />}
                  </span>
                  <span style={{ textAlign: "right" }}>{a === b ? "100" : `${a}–${b}`}</span>
                </div>
              ))}
              <span style={{ fontSize: 12.5, color: T.muted }}>Centenarians carried 11–22% fewer; their offspring showed a similar pattern.</span>
            </div>
          </Panel>
          <Kpis accent={A} items={[{ v: 35, l: "longevity-linked genes found" }, { v: 14, l: "replicated in UK Biobank" }]} />
        </div>
      </div>
      <Panel title="What sequencing can — and can’t — tell you">
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: T.ink2 }}>Whole genome sequencing reads essentially all of your DNA once, including these pathways and genes with clear medical actions (inherited disease risk, medication response). It <b style={{ fontWeight: 600 }}>cannot predict how long you will live</b> — this study was in one ancestry group and used predicted variant effects. Its value is a lifelong reference your NEYU physician can revisit as science advances. 30X is the clinical standard depth; 100X reads each position more times for extra confidence.</p>
      </Panel>
      <Cta f="genes" accent={A} onAsk={onAsk} ask="What does whole genome sequencing show, and what's the difference between 30X and 100X?" line="Sequence your genome once and review it with an NEYU physician — a reference for decades of care." />
      <Sources ids={["ying2024"]} />
    </div>
  );
}
