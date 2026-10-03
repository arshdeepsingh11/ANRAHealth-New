"use client";

// Neyu homepage, part 1: Hero · Health is connected · One health record · Understand.
import React, { useEffect, useState } from "react";
import NeyuLogo from "@/components/brand/NeyuLogo";
import AlbaOrb from "@/components/AlbaOrb";
import { useAlba } from "@/components/AlbaContext";
import { signalNote } from "@/data/homeContent";
import { PROPOSITION, RECORD } from "@/data/neyu";
import { N, Section, AiBadge, AskNeyu, NodeNet, FlowLines, StatN, LiveChart, NeyuReads, btn, cardN, gradText, wrapN, eyebrowN, IconTile, type NetNode } from "./kit";

// ── 01 Hero ──────────────────────────────────────────────────
const CHAIN: NetNode[] = [
  { id: "person", label: "You", x: 80, y: 300, icon: "ph-user", r: 36 },
  { id: "biology", label: "Biology", x: 250, y: 170, icon: "ph-dna" },
  { id: "data", label: "Data", x: 330, y: 450, icon: "ph-chart-line-up" },
  { id: "neyu", label: "Neyu", x: 500, y: 300, r: 64 },
  { id: "care", label: "Care", x: 670, y: 450, icon: "ph-stethoscope" },
  { id: "intel", label: "Insight", x: 750, y: 170, icon: "ph-brain" },
  { id: "life", label: "Life", x: 920, y: 300, icon: "ph-plant", r: 36 },
];
const CHAIN_E: [string, string][] = [["person", "biology"], ["person", "data"], ["biology", "neyu"], ["data", "neyu"], ["neyu", "intel"], ["neyu", "care"], ["intel", "life"], ["care", "life"], ["biology", "intel"], ["data", "care"]];
const CHAIN_TXT: Record<string, string> = {
  person: "It starts with you — your story, your goals, your questions.",
  biology: "Genomics, biomarkers and microbiome: what makes you unique.",
  data: "Results, imaging, wearables and history, flowing into one record.",
  neyu: "Neyu sits at the centre: it reads everything and connects the pieces.",
  intel: "Patterns and risks surface early, explained in plain language.",
  care: "The right doctor, test or program — connected to everything else.",
  life: "The goal isn't a number. It's a longer, healthier life.",
};

export function Hero() {
  const { openAlba } = useAlba();
  const [node, setNode] = useState<string>("neyu");
  useEffect(() => { const ids = CHAIN.map((c) => c.id); let i = ids.indexOf("neyu"); const t = setInterval(() => { if (document.hidden) return; i = (i + 1) % ids.length; setNode(ids[i]); }, 3200); return () => clearInterval(t); }, []);
  return (
    <section data-screen-label="Neyu 01 Hero" style={{ position: "relative", overflow: "hidden", padding: "clamp(36px,6vw,80px) 0 clamp(40px,6vw,72px)", background: "radial-gradient(1000px 520px at 85% -10%, rgba(42,132,228,.12), transparent 60%), radial-gradient(900px 520px at 5% 10%, rgba(60,199,158,.12), transparent 60%)" }}>
      <FlowLines opacity={0.7} />
      <div style={{ ...wrapN, position: "relative", display: "grid", gridTemplateColumns: "minmax(0,1fr)", justifyItems: "center", textAlign: "center", gap: 18 }}>
        <NeyuLogo layout="stacked" fluid="clamp(110px,11vw,150px)" />
        <span style={{ ...eyebrowN, color: N.muted, letterSpacing: ".34em" }}>Listen · Connect · Flourish</span>
        <h1 style={{ margin: 0, fontSize: "clamp(46px,8vw,104px)", lineHeight: 0.98, letterSpacing: "-.05em", fontWeight: 500, color: N.ink }}>Your Health, <span style={gradText}>Connected.</span></h1>
        <p style={{ margin: 0, fontSize: "clamp(17px,1.7vw,21px)", lineHeight: 1.55, color: N.ink2, maxWidth: 720 }}>{PROPOSITION.lead}</p>
        <AskNeyu big page="/" placeholder="Ask Neyu — what would you like to understand about your health?" suggestions={["Why does my blood pressure matter for my kidneys?", "Explain my LDL of 3.9", "What is an executive health assessment?", "Can I see a doctor virtually?"]} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => openAlba()} style={btn("ink")}><AlbaOrb size={20} motion={false} />Ask Neyu</button>
          <a href="#connected" style={btn("ghost")}>Explore NEYU<i className="ph ph-arrow-down" /></a>
        </div>
      </div>
      <div style={{ ...wrapN, position: "relative", marginTop: "clamp(24px,4vw,48px)" }}>
        <div style={{ ...cardN, padding: "clamp(12px,2vw,24px)", background: "rgba(255,255,255,.75)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "grid", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center", padding: "0 6px" }}>
            <span style={{ fontSize: 13, color: N.muted }}>Person → Biology → Data → <b style={{ fontWeight: 600, color: N.ink }}>Neyu</b> → Insight → Care → Life</span>
            <AiBadge label="Live · tap a node" />
          </div>
          <NodeNet ariaLabel="How NEYU connects your health" nodes={CHAIN} edges={CHAIN_E} center="neyu" active={node} onPick={setNode} height="clamp(240px,34vw,400px)" />
          <p aria-live="polite" style={{ margin: 0, textAlign: "center", fontSize: 16, color: N.ink, minHeight: "1.6em", padding: "0 8px 6px" }}><b style={{ fontWeight: 600 }}>{CHAIN.find((c) => c.id === node)?.label}.</b> {CHAIN_TXT[node]}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,150px),1fr))", gap: 12, marginTop: 20 }}>
          <StatN value={5} label="layers of your health in one record" />
          <StatN value={8} label="physicians on the NEYU team" />
          <StatN value={40} suffix="+" label="advanced lab tests through BioAro Labs" />
          <StatN value={24} suffix="/7" label="Neyu, your AI health companion" />
        </div>
      </div>
    </section>
  );
}

// ── 02 Health is connected ───────────────────────────────────
const BODY: NetNode[] = [
  { id: "you", label: "You", x: 500, y: 300, r: 58 },
  { id: "heart", label: "Heart", x: 500, y: 70, icon: "ph-heart" },
  { id: "kidney", label: "Kidneys", x: 735, y: 140, icon: "ph-drop" },
  { id: "metab", label: "Metabolism", x: 850, y: 330, icon: "ph-lightning" },
  { id: "hormone", label: "Hormones", x: 720, y: 520, icon: "ph-flask" },
  { id: "genes", label: "Genes", x: 500, y: 550, icon: "ph-dna" },
  { id: "sleep", label: "Sleep", x: 280, y: 520, icon: "ph-moon" },
  { id: "lungs", label: "Lungs", x: 150, y: 330, icon: "ph-wind" },
  { id: "brain", label: "Brain", x: 265, y: 140, icon: "ph-brain" },
];
const LINKS: { a: string; b: string; t: string }[] = [
  { a: "heart", b: "kidney", t: "High blood pressure strains the heart and the kidneys together, and kidney function changes how many heart medicines are dosed." },
  { a: "heart", b: "metab", t: "Diabetes and insulin resistance raise cardiovascular risk substantially — glucose and cholesterol are best read side by side." },
  { a: "heart", b: "sleep", t: "Untreated sleep apnea raises blood pressure and is linked to atrial fibrillation; better sleep often helps the heart." },
  { a: "heart", b: "lungs", t: "Breathlessness can start in the heart or the lungs. Testing both avoids missing the real cause." },
  { a: "heart", b: "brain", t: "What protects the heart protects the brain: controlling blood pressure lowers the risk of stroke." },
  { a: "heart", b: "genes", t: "Family history and inherited cholesterol conditions change the targets that are right for you." },
  { a: "metab", b: "hormone", t: "Thyroid and other hormones shape weight, energy, cholesterol and even heart rhythm." },
  { a: "kidney", b: "metab", t: "Diabetes is a leading cause of kidney disease; protecting one protects the other." },
  { a: "sleep", b: "metab", t: "Short sleep affects appetite hormones and blood sugar control." },
  { a: "genes", b: "hormone", t: "Genes influence how you make and respond to hormones — and how you process many medicines." },
  { a: "lungs", b: "sleep", t: "Breathing problems at night, like sleep apnea, link the lungs to sleep quality and daytime energy." },
  { a: "brain", b: "sleep", t: "Sleep is when the brain clears waste and consolidates memory." },
];
export function Connected() {
  const [pick, setPick] = useState<string | null>("heart");
  const links = LINKS.filter((l) => pick && (l.a === pick || l.b === pick));
  const label = (k: string) => BODY.find((b) => b.id === k)?.label || k;
  const neyu = pick && pick !== "you" && links.length ? `${label(pick)} connects to ${links.map((l) => label(l.a === pick ? l.b : l.a)).join(", ")}. ${links[0].t}` : "Tap any part of the body: Neyu shows how it connects to the rest — because no organ works alone.";
  return (
    <Section id="connected" label="Neyu 02 Connected" eyebrow="Connected care" title={<>Health is connected.<br /><span style={gradText}>Your care should be too.</span></>} lead="Your body doesn't operate in specialties. Neither should your health experience. NEYU connects the information, people and technology involved in your health.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 24, alignItems: "center" }}>
        <div style={{ ...cardN, padding: 12, background: "radial-gradient(500px 300px at 50% 50%, #F1FAF7, #FFFFFF)" }}>
          <NodeNet ariaLabel="How parts of the body connect" nodes={BODY} edges={[...BODY.filter((b) => b.id !== "you").map((b) => ["you", b.id] as [string, string]), ...LINKS.map((l) => [l.a, l.b] as [string, string])]} center="you" active={pick} onPick={(k) => setPick(k === pick ? null : k)} height="clamp(300px,40vw,460px)" />
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          <NeyuReads text={neyu} ask={pick && pick !== "you" ? `How does my ${label(pick).toLowerCase()} affect the rest of my health?` : undefined} />
          <div style={{ display: "grid", gap: 8 }}>
            {links.slice(0, 4).map((l) => (
              <div key={l.a + l.b} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", borderRadius: 16, background: "#fff", border: `1px solid ${N.line}`, animation: "fadeUp .3s ease" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: N.deep, whiteSpace: "nowrap", paddingTop: 2 }}>{label(l.a)} ↔ {label(l.b)}</span>
                <span style={{ fontSize: 14.5, lineHeight: 1.5, color: N.ink2 }}>{l.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

// ── 03 One health record ─────────────────────────────────────
export function OneRecord() {
  const [k, setK] = useState(RECORD[1].k);
  const cur = RECORD.find((r) => r.k === k)!;
  const pos = [[500, 80], [820, 230], [700, 520], [300, 520], [180, 230]];
  const nodes: NetNode[] = [{ id: "rec", label: "Your record", x: 500, y: 300, r: 70 }, ...RECORD.map((r, i) => ({ id: r.k, label: r.title, sub: r.sub, x: pos[i][0], y: pos[i][1], icon: r.icon }))];
  return (
    <Section id="record" tone="white" label="Neyu 03 Record" eyebrow="Your Health. One Record." title={<>One health record.<br /><span style={gradText}>A clearer picture.</span></>} lead="Clinical history, diagnostics, biology, lifestyle and environment — finally in one place, and finally read together.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 24, alignItems: "stretch" }}>
        <div style={{ ...cardN, padding: 12 }}>
          <NodeNet ariaLabel="Five layers of your health record" nodes={nodes} edges={RECORD.map((r) => ["rec", r.k] as [string, string]).concat([["records", "diagnostics"], ["diagnostics", "biology"], ["biology", "lifestyle"], ["lifestyle", "environment"], ["environment", "records"]])} center="rec" active={k} onPick={(x) => x !== "rec" && setK(x)} height="clamp(300px,40vw,470px)" />
        </div>
        <div key={k} style={{ ...cardN, padding: "clamp(18px,3vw,28px)", display: "grid", gap: 14, alignContent: "start", animation: "fadeUp .3s ease" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}><IconTile icon={cur.icon} /><div><b style={{ fontWeight: 500, fontSize: 22 }}>{cur.title}</b><div style={{ fontSize: 14, color: N.muted }}>{cur.sub}</div></div></div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{cur.sample.map((s) => <span key={s} style={{ padding: "6px 12px", borderRadius: 999, background: N.line2, fontSize: 13.5, color: N.ink2 }}>{s}</span>)}</div>
          <LiveChart mode={cur.chart} height={170} label={`${cur.title} — illustrative signal`} />
          <NeyuReads title="Neyu connects it · example" text={cur.neyu} ask={`What would NEYU show me about my ${cur.title.toLowerCase()}?`} />
          <a href="/my-health" style={{ ...btn("ink"), justifySelf: "start" }}>Open My Health Space<i className="ph ph-arrow-right" /></a>
        </div>
      </div>
    </Section>
  );
}

// ── 04 Understand what your health is telling you ────────────
const UTABS = [
  { k: "ask", t: "Ask questions", icon: "ph-chat-circle-dots" },
  { k: "patterns", t: "Explore patterns", icon: "ph-chart-line-up" },
  { k: "results", t: "Understand your results", icon: "ph-flask" },
  { k: "discuss", t: "Know what to discuss", icon: "ph-clipboard-text" },
] as const;
const SAMPLE_RESULTS = [
  { n: "LDL cholesterol", v: "3.9 mmol/L", flag: "Above usual target", t: "LDL above 3.5 is read together with blood pressure, family history and diabetes risk — for some people the target is lower." },
  { n: "HbA1c", v: "6.1 %", flag: "Prediabetes range", t: "6.0–6.4 % is the prediabetes range in Canadian guidelines — a strong moment for nutrition and activity changes." },
  { n: "hs-CRP", v: "2.4 mg/L", flag: "Average risk", t: "1–3 mg/L is average cardiovascular risk. It's often repeated, because a recent cold can raise it." },
];
export function Understand() {
  const { openAlba } = useAlba();
  const [tab, setTab] = useState<(typeof UTABS)[number]["k"]>("patterns");
  const [ptab, setPtab] = useState("bp");
  const [ldl, setLdl] = useState(3.9);
  const [act, setAct] = useState(90);
  const [res, setRes] = useState(0);
  const param = ptab === "ldl" ? Math.round(ldl * 10) : ptab === "activity" ? act : 50;
  return (
    <Section id="understand" label="Neyu 04 Understand" eyebrow="Neyu intelligence" title={<>Understand what your health<br /><span style={gradText}>is telling you.</span></>} lead="NEYU turns complex health information into understandable insights. Ask questions. Explore patterns. Understand your results. Know what to discuss with your care team.">
      <div role="tablist" aria-label="Ways Neyu helps" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {UTABS.map((t) => { const on = tab === t.k; return <button key={t.k} role="tab" aria-selected={on} onClick={() => setTab(t.k)} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 46, padding: "0 18px", borderRadius: 999, border: `1px solid ${on ? "transparent" : N.line}`, background: on ? N.ink : "#fff", color: on ? "#fff" : N.ink2, fontSize: 15, cursor: "pointer" }}><i className={(on ? "ph-fill " : "ph ") + t.icon} />{t.t}</button>; })}
      </div>
      <div key={tab} style={{ animation: "fadeUp .3s ease" }}>
        {tab === "ask" && <div style={{ ...cardN, padding: "clamp(18px,3vw,32px)", display: "grid", gap: 16, justifyItems: "start" }}><AiBadge /><AskNeyu page="/" suggestions={["What does a high hs-CRP mean?", "Is 135/85 high for a home reading?", "What should I ask my cardiologist?"]} /></div>}
        {tab === "patterns" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: 20, alignItems: "center" }}>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{[["bp", "Blood pressure"], ["ldl", "Cholesterol"], ["activity", "Activity"], ["ecg", "Heart rhythm"]].map(([k, l]) => <button key={k} aria-pressed={ptab === k} onClick={() => setPtab(k)} style={{ height: 40, padding: "0 14px", borderRadius: 999, border: `1px solid ${ptab === k ? N.blue : N.line}`, background: ptab === k ? "rgba(42,132,228,.08)" : "#fff", color: ptab === k ? N.deep : N.ink2, cursor: "pointer", fontSize: 14 }}>{l}</button>)}</div>
              {ptab === "ldl" && <label style={{ display: "grid", gap: 6 }}><span style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>LDL cholesterol<b style={{ fontWeight: 600 }}>{ldl.toFixed(1)} mmol/L</b></span><input type="range" min={1.5} max={6.2} step={0.1} value={ldl} onChange={(e) => setLdl(+e.target.value)} style={{ accentColor: N.blue }} /></label>}
              {ptab === "activity" && <label style={{ display: "grid", gap: 6 }}><span style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>Active minutes / week<b style={{ fontWeight: 600 }}>{act}</b></span><input type="range" min={0} max={320} step={10} value={act} onChange={(e) => setAct(+e.target.value)} style={{ accentColor: N.blue }} /></label>}
              <NeyuReads key={ptab + ldl + act} text={signalNote(ptab, ldl, act)} ask={"Explain this in plain language: " + signalNote(ptab, ldl, act)} />
            </div>
            <div style={{ ...cardN, padding: 14 }}><LiveChart mode={ptab} param={param} height="clamp(220px,26vw,300px)" /></div>
          </div>
        )}
        {tab === "results" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: 20 }}>
            <div style={{ display: "grid", gap: 10 }}>
              {SAMPLE_RESULTS.map((r, i) => (
                <button key={r.n} onClick={() => setRes(i)} aria-pressed={res === i} style={{ textAlign: "left", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", padding: "16px 18px", borderRadius: 18, border: `1px solid ${res === i ? N.blue : N.line}`, background: res === i ? "linear-gradient(160deg,#fff,#EEF7FC)" : "#fff", cursor: "pointer" }}>
                  <span><b style={{ fontWeight: 500, fontSize: 16 }}>{r.n}</b><span style={{ display: "block", fontSize: 13, color: N.muted }}>{r.flag}</span></span>
                  <span style={{ fontSize: 18, fontVariantNumeric: "tabular-nums" }}>{r.v}</span>
                </button>
              ))}
              <span style={{ fontSize: 12.5, color: N.faint }}>Sample values for demonstration.</span>
            </div>
            <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
              <NeyuReads key={res} text={SAMPLE_RESULTS[res].t} ask={`My ${SAMPLE_RESULTS[res].n} is ${SAMPLE_RESULTS[res].v}. What does that mean?`} />
              <a href="/lab-results" style={{ ...btn("grad"), justifySelf: "start" }}>Explain my own results<i className="ph ph-arrow-right" /></a>
            </div>
          </div>
        )}
        {tab === "discuss" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: 20 }}>
            <div style={{ ...cardN, padding: 22, display: "grid", gap: 10 }}>
              <AiBadge label="Neyu visit prep · example" />
              <b style={{ fontWeight: 500, fontSize: 19 }}>Questions for your cardiology visit</b>
              {["My LDL is 3.9 — is my target lower because of my family history?", "Should my home blood pressure readings change my medication?", "Would a stress echo or carotid ultrasound add anything for me?", "When should I repeat my blood work?"].map((q, i) => <div key={q} style={{ display: "flex", gap: 10, fontSize: 15, lineHeight: 1.5 }}><span style={{ color: N.teal, fontWeight: 600 }}>{i + 1}</span>{q}</div>)}
            </div>
            <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
              <NeyuReads text="Bring your home blood-pressure log, a list of your medicines, and these questions. A two-week home average tells your clinician more than any single reading." />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href="/referral-centre" style={btn("grad")}>Prepare my visit<i className="ph ph-arrow-right" /></a>
                <button onClick={() => openAlba("Help me prepare questions for my next doctor's visit.")} style={btn("ghost")}>Ask Neyu</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
