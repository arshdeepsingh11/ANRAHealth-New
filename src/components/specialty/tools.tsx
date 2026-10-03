"use client";

// Interactive, educational screening tools for the specialty pages. Each one
// gives an instant visual result and can hand it to Neyu to explain.
// Thresholds are published, widely used guideline values — labelled as
// education, never a diagnosis.
import React, { useMemo, useState } from "react";
import { T, card, btnGhost, chip, useInView, Icon } from "@/components/nea/ui";
import { NIcon } from "@/components/neyu/icons";

type Ask = (q: string) => void;
const inp: React.CSSProperties = { height: 46, padding: "0 12px", borderRadius: 12, border: `1px solid ${T.line}`, background: "#fff", fontSize: 16, width: "100%", color: T.ink };
const lab: React.CSSProperties = { display: "grid", gap: 6, fontSize: 13.5, color: T.ink2 };
const BAND = { good: "#1F9E7A", mid: "#C98A1E", high: "#D06A34", top: "#B8433A", info: "#2273D6" };

export function ToolFrame({ title, sub, icon, accent, children, source }: { title: string; sub: string; icon: string; accent: string; children: React.ReactNode; source?: string }) {
  return (
    <section style={{ ...card, padding: "clamp(18px,2.6vw,26px)", display: "grid", gap: 16, minWidth: 0 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Icon name={icon} box={42} size={21} />
        <div><h3 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>{title}</h3><p style={{ margin: "2px 0 0", fontSize: 13.5, color: T.muted }}>{sub}</p></div>
      </div>
      {children}
      <p style={{ margin: 0, fontSize: 12, color: T.faint, display: "flex", gap: 6 }}><NIcon name="ph-info" size={18} tone={"currentColor"} style={{ marginTop: 2 }} />Education, not a diagnosis.{source ? ` Based on ${source}.` : ""}</p>
    </section>
  );
}

function Result({ tone, title, text, onAsk, q }: { tone: keyof typeof BAND; title: string; text: string; onAsk?: Ask; q?: string }) {
  return (
    <div aria-live="polite" style={{ padding: "14px 16px", borderRadius: 14, background: BAND[tone] + "14", border: `1px solid ${BAND[tone]}33`, display: "grid", gap: 6, animation: "fadeUp .3s" }}>
      <b style={{ fontWeight: 600, color: BAND[tone], fontSize: 15.5 }}>{title}</b>
      <span style={{ fontSize: 14.5, color: T.ink2, lineHeight: 1.5 }}>{text}</span>
      {onAsk && q && <button onClick={() => onAsk(q)} style={{ ...btnGhost, height: 38, fontSize: 12, justifySelf: "start", border: 0, padding: 0, color: T.violet }}><NIcon name="ph-sparkle" size={18} tone={"currentColor"} />Explain this with Neyu</button>}
    </div>
  );
}

/** Horizontal scale with coloured bands and an animated marker. */
export function Scale({ min, max, bands, value, unit, fmt = (v) => String(v) }: { min: number; max: number; bands: { to: number; label: string; tone: keyof typeof BAND }[]; value?: number | null; unit?: string; fmt?: (v: number) => string }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  const x = (v: number) => `${((Math.min(Math.max(v, min), max) - min) / (max - min)) * 100}%`;
  let from = min;
  return (
    <div ref={ref} style={{ paddingTop: 30 }}>
      <div style={{ position: "relative", height: 14, borderRadius: 7, overflow: "visible", display: "flex", gap: 2 }}>
        {bands.map((b) => { const w = ((Math.min(b.to, max) - from) / (max - min)) * 100; from = Math.min(b.to, max); return <span key={b.label} title={b.label} style={{ width: w + "%", background: BAND[b.tone], opacity: 0.85, borderRadius: 4 }} />; })}
        {value != null && isFinite(value) && (
          <span style={{ position: "absolute", left: seen ? x(value) : "0%", top: -30, transform: "translateX(-50%)", transition: "left .8s cubic-bezier(.2,.8,.2,1)", display: "grid", justifyItems: "center", pointerEvents: "none" }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, background: T.ink, color: "#fff", padding: "2px 8px", borderRadius: 7, whiteSpace: "nowrap" }}>{fmt(value)}{unit ? " " + unit : ""}</span>
            <span style={{ width: 2, height: 22, background: T.ink }} />
          </span>
        )}
      </div>
      <div style={{ position: "relative", height: 34, marginTop: 6 }}>
        {(() => { let f = min; return bands.map((b) => { const mid = (f + Math.min(b.to, max)) / 2; f = Math.min(b.to, max); return <span key={b.label} style={{ position: "absolute", left: x(mid), transform: "translateX(-50%)", fontSize: 11.5, color: T.muted, textAlign: "center", lineHeight: 1.2, width: `${Math.max(12, 100 / bands.length)}%` }}>{b.label}</span>; }); })()}
      </div>
    </div>
  );
}

// ── Blood pressure (Hypertension Canada, home readings) ─────────────────
export function BpTool({ accent, onAsk }: { accent: string; onAsk: Ask }) {
  const [s, setS] = useState(""), [d, setD] = useState("");
  const sys = Number(s), dia = Number(d), ok = sys >= 70 && sys <= 260 && dia >= 40 && dia <= 160;
  const r = !ok ? null : sys >= 180 || dia >= 110 ? { tone: "top" as const, t: "Very high", x: "A home reading at or above 180/110 needs prompt medical attention. With chest pain, shortness of breath, weakness or confusion, call 911." }
    : sys >= 135 || dia >= 85 ? { tone: "high" as const, t: "Above the home target", x: "Hypertension Canada uses 135/85 as the threshold for home readings. Take readings twice daily for a week and share the average with your doctor." }
    : { tone: "good" as const, t: "Within the home target", x: "Below 135/85 at home. Keep checking regularly — the average over many days matters more than one reading." };
  return (
    <ToolFrame title="Blood pressure check" sub="Enter a home reading" icon="ph-gauge" accent={accent} source="Hypertension Canada home-reading thresholds">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <label style={lab}>Systolic (top)<input style={inp} inputMode="numeric" value={s} onChange={(e) => setS(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="128" /></label>
        <label style={lab}>Diastolic (bottom)<input style={inp} inputMode="numeric" value={d} onChange={(e) => setD(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="82" /></label>
      </div>
      <Scale min={90} max={200} unit="mmHg" value={ok ? sys : null} fmt={(v) => `${v}/${dia}`} bands={[{ to: 135, label: "Target", tone: "good" }, { to: 180, label: "Above target", tone: "high" }, { to: 200, label: "Very high", tone: "top" }]} />
      {r && <Result tone={r.tone} title={r.t} text={r.x} onAsk={onAsk} q={`My home blood pressure reading is ${sys}/${dia}. What does that mean and what should I do?`} />}
    </ToolFrame>
  );
}

// ── Heart-rate training zones (220 − age estimate) ─────────────────────
export function HrZones({ accent, onAsk }: { accent: string; onAsk: Ask }) {
  const [age, setAge] = useState("45");
  const a = Math.min(95, Math.max(15, Number(age) || 45)), max = 220 - a;
  const zones = [["Very light", 0.5, 0.6, "#7FA9E0"], ["Light", 0.6, 0.7, "#1BAF7A"], ["Moderate", 0.7, 0.8, "#E0A100"], ["Hard", 0.8, 0.9, "#D0612E"], ["Maximum", 0.9, 1, "#B42F3A"]] as const;
  return (
    <ToolFrame title="Heart-rate zones" sub="Estimated from your age" icon="ph-heartbeat" accent={accent} source="the common 220 − age estimate (individual maximums vary)">
      <label style={{ ...lab, maxWidth: 160 }}>Your age<input style={inp} inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 2))} /></label>
      <div style={{ display: "grid", gap: 8 }}>
        {zones.map(([n, lo, hi, c]) => (
          <div key={n} style={{ display: "grid", gridTemplateColumns: "90px 1fr 92px", gap: 10, alignItems: "center", fontSize: 14 }}>
            <span>{n}</span>
            <span style={{ height: 12, borderRadius: 6, background: T.line2, position: "relative" }}><span style={{ position: "absolute", left: `${(lo - 0.45) / 0.55 * 100}%`, width: `${(hi - lo) / 0.55 * 100}%`, top: 0, bottom: 0, borderRadius: 6, background: c, transition: "all .5s" }} /></span>
            <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{Math.round(max * lo)}–{Math.round(max * hi)} bpm</span>
          </div>
        ))}
      </div>
      <Result tone="info" title={`Estimated maximum: ${max} bpm`} text="Most heart-health benefit comes from moderate effort (about 70–80%) — you can talk, but not sing. If you have a heart condition, ask your cardiologist which zone is safe for you." onAsk={onAsk} q={`I'm ${a}. What heart-rate zone should I exercise in for heart health?`} />
    </ToolFrame>
  );
}

// ── NYHA functional class ───────────────────────────────────────────────
const NYHA = [
  ["I", "No limitation. Ordinary activity doesn’t cause undue tiredness, palpitations or breathlessness."],
  ["II", "Slight limitation. Comfortable at rest; ordinary activity causes symptoms."],
  ["III", "Marked limitation. Comfortable at rest; less than ordinary activity causes symptoms."],
  ["IV", "Symptoms at rest; any physical activity increases discomfort."],
];
export function NyhaTool({ accent, onAsk }: { accent: string; onAsk: Ask }) {
  const [c, setC] = useState<number | null>(null);
  return (
    <ToolFrame title="How much does it limit your day?" sub="The NYHA classes heart teams use" icon="ph-stairs" accent={accent} source="the New York Heart Association functional classification">
      <div style={{ display: "grid", gap: 8 }}>
        {NYHA.map(([k, d], i) => (
          <button key={k} onClick={() => setC(i)} aria-pressed={c === i} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: 12, alignItems: "center", textAlign: "left", padding: "10px 12px", borderRadius: 14, cursor: "pointer", border: `1px solid ${c === i ? accent : T.line}`, background: c === i ? accent + "12" : "#fff", transition: "all .2s" }}>
            <span style={{ height: 36, borderRadius: 10, display: "grid", placeItems: "center", fontWeight: 600, color: "#fff", background: [BAND.good, BAND.mid, BAND.high, BAND.top][i], opacity: c === null || c === i ? 1 : 0.4 }}>{k}</span>
            <span style={{ fontSize: 14, color: T.ink2, lineHeight: 1.45 }}>{d}</span>
          </button>
        ))}
      </div>
      {c !== null && <Result tone={(["good", "mid", "high", "top"] as const)[c]} title={`This sounds like class ${NYHA[c][0]}`} text="Share this with your heart-failure team — a change in class over time matters as much as the class itself. New or quickly worsening breathlessness needs prompt care." onAsk={onAsk} q={`My symptoms sound like NYHA class ${NYHA[c][0]}. What does that mean for heart failure care?`} />}
    </ToolFrame>
  );
}

// ── Daily weight check (heart failure) ─────────────────────────────────
export function WeightTool({ accent, onAsk }: { accent: string; onAsk: Ask }) {
  const [w, setW] = useState<string[]>(["", "", "", "", "", "", ""]);
  const vals = w.map((x) => Number(x)).map((v) => (v >= 25 && v <= 350 ? v : NaN));
  const pts = vals.map((v, i) => ({ v, i })).filter((p) => !isNaN(p.v));
  const lo = Math.min(...pts.map((p) => p.v), Infinity), hi = Math.max(...pts.map((p) => p.v), -Infinity);
  let jump = 0;
  pts.forEach((p) => pts.forEach((q) => { if (q.i > p.i && q.i - p.i <= 3) jump = Math.max(jump, q.v - p.v); }));
  const W = 100, H = 40, y = (v: number) => (hi - lo < 0.5 ? H / 2 : H - 4 - ((v - lo) / (hi - lo)) * (H - 8));
  return (
    <ToolFrame title="Daily weight tracker" sub="Weigh each morning, same scale, after the washroom" icon="ph-scales" accent={accent} source="common heart-failure self-care guidance">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
        {w.map((x, i) => <label key={i} style={{ ...lab, fontSize: 11.5, textAlign: "center" }}>Day {i + 1}<input style={{ ...inp, padding: "0 4px", textAlign: "center", fontSize: 14 }} inputMode="decimal" value={x} placeholder="kg" onChange={(e) => { const n = [...w]; n[i] = e.target.value.replace(/[^\d.]/g, "").slice(0, 5); setW(n); }} /></label>)}
      </div>
      <div style={{ position: "relative", height: 110, borderRadius: 12, background: T.paper, border: `1px solid ${T.line2}` }}>
        {pts.length >= 2 ? (
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 8, width: "calc(100% - 16px)", height: "calc(100% - 16px)" }} aria-label="Weight trend">
            <polyline points={pts.map((p) => `${(p.i / 6) * W},${y(p.v)}`).join(" ")} fill="none" stroke={accent} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          </svg>
        ) : <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 13.5, color: T.muted }}>Enter at least two days to see your trend</span>}
        {pts.map((p) => <span key={p.i} style={{ position: "absolute", left: `calc(8px + ${(p.i / 6) * 100}% - ${(p.i / 6) * 16}px)`, top: `calc(8px + ${(y(p.v) / H) * 100}% - ${(y(p.v) / H) * 16}px)`, width: 9, height: 9, margin: "-4.5px 0 0 -4.5px", borderRadius: 5, background: accent, border: "2px solid #fff" }} />)}
      </div>
      {pts.length >= 2 && (jump >= 2
        ? <Result tone="high" title={`Up ${jump.toFixed(1)} kg within 3 days`} text="A quick gain like this can mean fluid is building up — a common warning sign heart-failure clinics ask you to report. Call your care team today, or follow the number in your own plan." onAsk={onAsk} q={`My weight went up ${jump.toFixed(1)} kg in 3 days and I have heart failure. Why does that matter?`} />
        : <Result tone="good" title="No quick gain in these days" text="Keep weighing daily. A gain of about 2 kg over 2–3 days is a common threshold to report — your team may give you a different number." />)}
    </ToolFrame>
  );
}

// ── BMI + waist (WHO categories, Health Canada waist cut-offs) ─────────
export function BmiTool({ accent, onAsk }: { accent: string; onAsk: Ask }) {
  const [h, setH] = useState(""), [kg, setKg] = useState(""), [waist, setWaist] = useState(""), [sex, setSex] = useState<"f" | "m">("f");
  const bmi = Number(h) >= 100 && Number(kg) >= 25 ? Number(kg) / Math.pow(Number(h) / 100, 2) : null;
  const band = bmi == null ? null : bmi < 18.5 ? ["info", "Below the healthy range"] : bmi < 25 ? ["good", "Healthy range"] : bmi < 30 ? ["mid", "Overweight range"] : ["high", "Obesity range"];
  const wr = Number(waist) > 40 ? (Number(waist) >= (sex === "f" ? 88 : 102) ? "higher" : "lower") : null;
  return (
    <ToolFrame title="Body mass index" sub="Height, weight and (optional) waist" icon="ph-person" accent={accent} source="WHO BMI categories and Health Canada waist cut-offs">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 10 }}>
        <label style={lab}>Height (cm)<input style={inp} inputMode="numeric" value={h} onChange={(e) => setH(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="170" /></label>
        <label style={lab}>Weight (kg)<input style={inp} inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value.replace(/[^\d.]/g, "").slice(0, 5))} placeholder="72" /></label>
        <label style={lab}>Waist (cm)<input style={inp} inputMode="numeric" value={waist} onChange={(e) => setWaist(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="optional" /></label>
      </div>
      <div style={{ display: "flex", gap: 6 }}>{(["f", "m"] as const).map((x) => <button key={x} onClick={() => setSex(x)} aria-pressed={sex === x} style={{ ...chip(sex === x), minHeight: 34, fontSize: 13 }}>{x === "f" ? "Female" : "Male"}</button>)}</div>
      <Scale min={15} max={40} value={bmi} fmt={(v) => v.toFixed(1)} bands={[{ to: 18.5, label: "Under", tone: "info" }, { to: 25, label: "Healthy", tone: "good" }, { to: 30, label: "Over", tone: "mid" }, { to: 40, label: "Obesity", tone: "high" }]} />
      {bmi != null && band && <Result tone={band[0] as keyof typeof BAND} title={`BMI ${bmi.toFixed(1)} · ${band[1]}`} text={`BMI is a screening number, not a verdict — it doesn’t see muscle, age or ethnicity (many people of Asian descent have higher risk at lower BMI).${wr ? ` Your waist suggests ${wr} health risk (${sex === "f" ? "88" : "102"} cm is the cut-off).` : ""}`} onAsk={onAsk} q={`My BMI is ${bmi.toFixed(1)}${waist ? ` and my waist is ${waist} cm` : ""}. What does that mean for my health?`} />}
    </ToolFrame>
  );
}

// ── HbA1c / fasting glucose (Diabetes Canada) ──────────────────────────
export function A1cTool({ accent, onAsk }: { accent: string; onAsk: Ask }) {
  const [a, setA] = useState(""), [g, setG] = useState("");
  const a1c = Number(a) >= 3 && Number(a) <= 20 ? Number(a) : null, fpg = Number(g) >= 2 && Number(g) <= 35 ? Number(g) : null;
  const band = (v: number, cut: [number, number]) => (v < cut[0] ? 0 : v < cut[1] ? 1 : 2);
  const worst = Math.max(a1c != null ? band(a1c, [6.0, 6.5]) : -1, fpg != null ? band(fpg, [6.1, 7.0]) : -1);
  const R = [["good", "In the normal range", "Keep up regular checks as your doctor advises."], ["mid", "In the prediabetes range", "Prediabetes often responds to activity, weight and food changes. Ask your doctor about follow-up testing."], ["high", "In the diabetes range", "One result isn’t a diagnosis — diabetes is confirmed with repeat testing. Please book with your doctor."]] as const;
  return (
    <ToolFrame title="Blood sugar check" sub="Enter your HbA1c and/or fasting glucose" icon="ph-drop-half" accent={accent} source="Diabetes Canada diagnostic thresholds">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <label style={lab}>HbA1c (%)<input style={inp} inputMode="decimal" value={a} onChange={(e) => setA(e.target.value.replace(/[^\d.]/g, "").slice(0, 4))} placeholder="5.8" /></label>
        <label style={lab}>Fasting glucose (mmol/L)<input style={inp} inputMode="decimal" value={g} onChange={(e) => setG(e.target.value.replace(/[^\d.]/g, "").slice(0, 4))} placeholder="5.4" /></label>
      </div>
      <div><div style={{ fontSize: 13, color: T.muted }}>HbA1c</div><Scale min={4} max={9} value={a1c} unit="%" fmt={(v) => v.toFixed(1)} bands={[{ to: 6.0, label: "Normal", tone: "good" }, { to: 6.5, label: "Prediabetes", tone: "mid" }, { to: 9, label: "Diabetes range", tone: "high" }]} /></div>
      <div><div style={{ fontSize: 13, color: T.muted }}>Fasting glucose</div><Scale min={3.5} max={10} value={fpg} unit="mmol/L" fmt={(v) => v.toFixed(1)} bands={[{ to: 6.1, label: "Normal", tone: "good" }, { to: 7.0, label: "Prediabetes", tone: "mid" }, { to: 10, label: "Diabetes range", tone: "high" }]} /></div>
      {worst >= 0 && <Result tone={R[worst][0]} title={R[worst][1]} text={R[worst][2]} onAsk={onAsk} q={`My ${a1c != null ? `HbA1c is ${a1c}%` : ""}${a1c != null && fpg != null ? " and " : ""}${fpg != null ? `fasting glucose is ${fpg} mmol/L` : ""}. What does that mean?`} />}
    </ToolFrame>
  );
}

// ── Falls risk (CDC STEADI key questions + Timed Up and Go) ────────────
export function FallsTool({ accent, onAsk }: { accent: string; onAsk: Ask }) {
  const Q = ["Have you fallen in the past year?", "Do you feel unsteady when standing or walking?", "Do you worry about falling?"];
  const [ans, setAns] = useState<(boolean | null)[]>([null, null, null]);
  const [tug, setTug] = useState("");
  const done = ans.every((x) => x !== null), yes = ans.filter(Boolean).length, slow = Number(tug) >= 12;
  return (
    <ToolFrame title="Falls risk — 3 key questions" sub="For yourself or someone you care for" icon="ph-person-simple-walk" accent={accent} source="the CDC STEADI screening questions">
      {Q.map((q, i) => (
        <div key={q} style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 14.5 }}>{q}</span>
          <span style={{ display: "flex", gap: 6 }}>{[true, false].map((v) => <button key={String(v)} onClick={() => { const n = [...ans]; n[i] = v; setAns(n); }} aria-pressed={ans[i] === v} style={{ ...chip(ans[i] === v), minHeight: 34, fontSize: 13 }}>{v ? "Yes" : "No"}</button>)}</span>
        </div>
      ))}
      <label style={{ ...lab, maxWidth: 280 }}>Optional: seconds to stand up, walk 3 m, turn and sit (Timed Up and Go)<input style={inp} inputMode="decimal" value={tug} onChange={(e) => setTug(e.target.value.replace(/[^\d.]/g, "").slice(0, 4))} placeholder="10" /></label>
      {done && (yes > 0 || slow
        ? <Result tone="high" title="Worth a falls assessment" text={`${yes ? `${yes} “yes” answer${yes > 1 ? "s" : ""}` : ""}${yes && slow ? " and " : ""}${slow ? "a Timed Up and Go of 12 seconds or more" : ""}. A geriatric assessment looks at balance, strength, vision, medications and home safety.`} onAsk={onAsk} q="I'm at risk of falling. What does a falls assessment check and how can falls be prevented?" />
        : <Result tone="good" title="Lower risk on these questions" text="Keep active with strength and balance exercise, and re-check yearly or after any fall." />)}
    </ToolFrame>
  );
}

// ── JIA warning signs (checklist, no scoring) ──────────────────────────
export function JiaTool({ accent, onAsk }: { accent: string; onAsk: Ask }) {
  const S = ["Joint swelling that has lasted 6 weeks or more", "Stiffness or limping, worst in the morning", "Avoiding using an arm or leg", "Fevers that come and go with a pale pink rash", "Red, painful or light-sensitive eyes"];
  const [on, setOn] = useState<boolean[]>(S.map(() => false));
  const n = on.filter(Boolean).length;
  return (
    <ToolFrame title="Signs worth checking in a child" sub="Tick what you’ve noticed" icon="ph-baby" accent={accent} source="common juvenile idiopathic arthritis warning signs">
      <div style={{ display: "grid", gap: 8 }}>
        {S.map((s, i) => <label key={s} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", borderRadius: 12, border: `1px solid ${on[i] ? accent : T.line}`, background: on[i] ? accent + "10" : "#fff", cursor: "pointer", fontSize: 14.5 }}><input type="checkbox" checked={on[i]} onChange={() => { const x = [...on]; x[i] = !x[i]; setOn(x); }} style={{ width: 18, height: 18, accentColor: accent }} />{s}</label>)}
      </div>
      {n > 0 && <Result tone="mid" title={`${n} sign${n > 1 ? "s" : ""} noticed`} text="These are reasons to see your child’s doctor, who can refer to pediatric rheumatology. Eye symptoms should be checked soon — some childhood arthritis affects the eyes without pain." onAsk={onAsk} q="My child has joint swelling and morning stiffness. What could that mean and what happens at a pediatric rheumatology visit?" />}
    </ToolFrame>
  );
}

// ── Canada's Food Guide plate ──────────────────────────────────────────
export function PlateTool({ accent, onAsk }: { accent: string; onAsk: Ask }) {
  const [p, setP] = useState({ veg: 30, protein: 30, grain: 30, other: 10 });
  const total = p.veg + p.protein + p.grain + p.other || 1;
  const parts = [["veg", "Vegetables & fruits", "#2E7D5B", 50], ["protein", "Protein foods", "#D0612E", 25], ["grain", "Whole grains", "#C98500", 25], ["other", "Other / processed", "#8A9197", 0]] as const;
  const ring = (vals: number[], r: number) => { let a = -Math.PI / 2; return vals.map((v, i) => { const a1 = a + (v / 100) * Math.PI * 2; const d = `M${60 + r * Math.cos(a)} ${60 + r * Math.sin(a)} A${r} ${r} 0 ${a1 - a > Math.PI ? 1 : 0} 1 ${60 + r * Math.cos(a1)} ${60 + r * Math.sin(a1)}`; a = a1; return <path key={i} d={d} fill="none" stroke={parts[i][2]} strokeWidth="14" />; }); };
  const yours = parts.map(([k]) => (p[k] / total) * 100);
  const vegGap = 50 - yours[0];
  return (
    <ToolFrame title="Build your plate" sub="Compare your usual meal with Canada’s Food Guide" icon="ph-bowl-food" accent={accent} source="Canada’s Food Guide plate">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,160px) 1fr", gap: 16, alignItems: "center" }}>
        <svg viewBox="0 0 120 120" role="img" aria-label="Your plate (outer) vs the guide (inner)">{ring(yours, 50)}{ring(parts.map((x) => x[3]), 30)}<text x="60" y="58" textAnchor="middle" fontSize="8" fill={T.muted}>outer: you</text><text x="60" y="68" textAnchor="middle" fontSize="8" fill={T.muted}>inner: guide</text></svg>
        <div style={{ display: "grid", gap: 10 }}>
          {parts.map(([k, l, c]) => <label key={k} style={{ display: "grid", gap: 4, fontSize: 13.5 }}><span style={{ display: "flex", justifyContent: "space-between" }}><span style={{ display: "flex", gap: 6, alignItems: "center" }}><span style={{ width: 10, height: 10, borderRadius: 3, background: c }} />{l}</span><span style={{ color: T.muted }}>{Math.round((p[k] / total) * 100)}%</span></span><input type="range" min={0} max={100} value={p[k]} onChange={(e) => setP({ ...p, [k]: Number(e.target.value) })} style={{ accentColor: c }} /></label>)}
        </div>
      </div>
      <Result tone={Math.abs(vegGap) < 10 ? "good" : "mid"} title={Math.abs(vegGap) < 10 ? "Close to the guide" : vegGap > 0 ? `About ${Math.round(vegGap)}% short on vegetables & fruits` : "Plenty of vegetables & fruits"} text="The guide suggests half the plate vegetables and fruits, a quarter protein foods, a quarter whole grains — and water as your drink. Adult fibre targets are about 25 g a day for women and 38 g for men." onAsk={onAsk} q="How can I make my meals closer to Canada's Food Guide and get more fibre?" />
    </ToolFrame>
  );
}

// ── STOP-BANG (sleep apnea screening) ──────────────────────────────────
export function StopBangTool({ accent, onAsk }: { accent: string; onAsk: Ask }) {
  const Q = [["S", "Do you snore loudly?"], ["T", "Do you often feel tired or sleepy during the day?"], ["O", "Has anyone seen you stop breathing or choke in sleep?"], ["P", "Do you have or are you treated for high blood pressure?"], ["B", "Is your BMI over 35?"], ["A", "Are you over 50?"], ["N", "Is your neck larger than 40 cm around?"], ["G", "Are you male?"]];
  const [a, setA] = useState<boolean[]>(Q.map(() => false));
  const score = a.filter(Boolean).length, tone = score <= 2 ? "good" : score <= 4 ? "mid" : "high";
  const r = 44, c = 2 * Math.PI * r;
  return (
    <ToolFrame title="STOP-BANG sleep apnea screen" sub="8 yes/no questions" icon="ph-moon-stars" accent={accent} source="the validated STOP-BANG questionnaire">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 120px", gap: 16, alignItems: "center" }}>
        <div style={{ display: "grid", gap: 6 }}>
          {Q.map(([k, q], i) => <label key={k} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, padding: "6px 0", borderBottom: `1px solid ${T.line2}`, cursor: "pointer" }}><b style={{ width: 20, color: accent }}>{k}</b><span style={{ flex: 1 }}>{q}</span><input type="checkbox" checked={a[i]} onChange={() => { const n = [...a]; n[i] = !n[i]; setA(n); }} style={{ width: 20, height: 20, accentColor: accent }} /></label>)}
        </div>
        <svg viewBox="0 0 110 110" role="img" aria-label={`Score ${score} of 8`}><circle cx="55" cy="55" r={r} fill="none" stroke={T.line2} strokeWidth="10" /><circle cx="55" cy="55" r={r} fill="none" stroke={BAND[tone]} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(score / 8) * c} ${c}`} transform="rotate(-90 55 55)" style={{ transition: "stroke-dasharray .5s" }} /><text x="55" y="58" textAnchor="middle" fontSize="24" fontWeight="500" fill={T.ink}>{score}/8</text><text x="55" y="74" textAnchor="middle" fontSize="9" fill={T.muted}>{tone === "good" ? "low" : tone === "mid" ? "intermediate" : "high"}</text></svg>
      </div>
      <Result tone={tone} title={score <= 2 ? "Low risk of moderate–severe sleep apnea" : score <= 4 ? "Intermediate risk" : "High risk"} text={score <= 2 ? "If snoring or sleepiness still bother you, mention it to your doctor." : "A sleep study is the way to know. Ask your family doctor for a referral for a home sleep test or in-lab study."} onAsk={onAsk} q={`My STOP-BANG score is ${score} out of 8. What does that mean and what is a home sleep study?`} />
    </ToolFrame>
  );
}

// ── AHI severity scale ─────────────────────────────────────────────────
export function AhiTool({ accent, onAsk }: { accent: string; onAsk: Ask }) {
  const [v, setV] = useState("");
  const n = Number(v) >= 0 && v !== "" && Number(v) <= 150 ? Number(v) : null;
  const b = n == null ? null : n < 5 ? ["good", "Normal"] : n < 15 ? ["mid", "Mild sleep apnea range"] : n < 30 ? ["high", "Moderate sleep apnea range"] : ["top", "Severe sleep apnea range"];
  return (
    <ToolFrame title="Understand your sleep study" sub="Enter the AHI (events per hour) from your report" icon="ph-bed" accent={accent} source="standard AHI severity ranges">
      <label style={{ ...lab, maxWidth: 200 }}>AHI (events/hour)<input style={inp} inputMode="decimal" value={v} onChange={(e) => setV(e.target.value.replace(/[^\d.]/g, "").slice(0, 5))} placeholder="12" /></label>
      <Scale min={0} max={45} value={n} fmt={(x) => String(x)} bands={[{ to: 5, label: "Normal", tone: "good" }, { to: 15, label: "Mild", tone: "mid" }, { to: 30, label: "Moderate", tone: "high" }, { to: 45, label: "Severe", tone: "top" }]} />
      {b && <Result tone={b[0] as keyof typeof BAND} title={b[1]} text="Your sleep physician interprets the whole report — oxygen levels and symptoms matter too. CPAP/BiPAP and ongoing support are available through the ARC Network." onAsk={onAsk} q={`My sleep study AHI is ${n}. What does that mean and what are the treatment options?`} />}
    </ToolFrame>
  );
}

export function useToolList() { return useMemo(() => ({ bp: BpTool, hrzones: HrZones, nyha: NyhaTool, weight: WeightTool, bmi: BmiTool, a1c: A1cTool, falls: FallsTool, jia: JiaTool, plate: PlateTool, stopbang: StopBangTool, ahi: AhiTool }), []); }
