"use client";

// NEYU Longevity Lab — five research-backed, interactive explainers that turn
// 2022–2026 aging science into plain language, with Neyu, 3D models, charts,
// an AI intake, a page-turning Research Library and BioAro test CTAs.
import React, { useEffect, useRef, useState } from "react";
import AlbaOrb from "@/components/AlbaOrb";
import AskPanel from "@/components/specialty/AskPanel";
import Assessment from "./assess";
import ResearchBook from "./book";
import { Helix3D } from "./three";
import { Responsiveness, StressMap, PaceVsAge, PgxSafety, GeneticsPathways } from "./features";
import { LAB_STATS, PATHWAYS, PAPERS, CONSULT_HREF, type FeatureId } from "@/data/longevityScience";
import { T, wrap, card, btnInk, eyebrow, h2, aiText, CountUp } from "@/components/nea/ui";

type Tab = "overview" | FeatureId | "library" | "alba";
const TABS: { v: Tab; label: string; icon: string }[] = [
  { v: "overview", label: "Overview", icon: "ph-squares-four" },
  { v: "respond", label: "What works", icon: "ph-arrows-down-up" },
  { v: "stress", label: "Cell stress", icon: "ph-atom" },
  { v: "pace", label: "Pace of aging", icon: "ph-gauge" },
  { v: "pgx", label: "Medicine safety", icon: "ph-pill" },
  { v: "genes", label: "Longevity genes", icon: "ph-dna" },
  { v: "library", label: "Research library", icon: "ph-book-open-text" },
  { v: "alba", label: "Ask Neyu", icon: "ph-sparkle" },
];
const FEATURES: { v: FeatureId; n: number; title: string; blurb: string; icon: string; color: string; tests: string }[] = [
  { v: "respond", n: 1, title: "Intervention Responsiveness Explorer", blurb: "Which diets, habits and treatments actually shifted aging clocks in 51 human studies.", icon: "ph-arrows-down-up", color: "#2E7D5B", tests: "Inflammation Aging panels" },
  { v: "stress", n: 2, title: "GDF-15 + Telomere Stress Map", blurb: "A 3D chromosome shows how a cellular stress signal and telomere length move together.", icon: "ph-atom", color: "#C2477E", tests: "GDF-15 · Telomere Length" },
  { v: "pace", n: 3, title: "Pace of Aging vs Biological Age", blurb: "Odometer vs speedometer: see how the speed of aging changes where you’re headed.", icon: "ph-gauge", color: "#2A78D6", tests: "Inflammation · GDF-15 · Telomeres" },
  { v: "pgx", n: 4, title: "Pharmacogenomics Safety Check", blurb: "Pick your medicines and watch which of your genes shape how they work.", icon: "ph-pill", color: "#1D5FA8", tests: "Pharmacogenomics" },
  { v: "genes", n: 5, title: "Longevity Genetics Pathways", blurb: "Explore the pathways centenarians’ genomes have in common on a 3D helix.", icon: "ph-dna", color: "#1D5FA8", tests: "WGS 30X · 100X" },
];
const ASK = ["What is biological age vs pace of aging?", "Why test GDF-15 and telomeres together?", "Which habits have the best evidence for slowing aging?", "What does pharmacogenomic testing show?", "30X vs 100X genome sequencing?"];

function Hero({ onAsk, onGo }: { onAsk: (q: string) => void; onGo: (t: Tab) => void }) {
  const [q, setQ] = useState("");
  const [node, setNode] = useState<string | null>(null);
  const p = PATHWAYS.find((x) => x.id === node);
  return (
    <section style={{ position: "relative", overflow: "hidden", borderRadius: 30, color: "#F7F5F1", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", alignItems: "center", background: "radial-gradient(120% 90% at 85% 5%, #1D5FA855 0%, transparent 55%), radial-gradient(90% 80% at 5% 100%, #2E7D5B55 0%, transparent 60%), linear-gradient(150deg,#121418 0%,#1B1D25 55%,#161320 100%)" }}>
      <anra-particles tone="dark" density="9000" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.7 }} />
      <div style={{ position: "relative", zIndex: 2, padding: "clamp(22px,5vw,56px)", display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 18, minWidth: 0, boxSizing: "border-box", width: "100%" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ padding: "6px 12px", borderRadius: 999, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)" }}>NEYU Longevity Lab</span>
          <span style={{ padding: "6px 12px", borderRadius: 999, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", display: "inline-flex", gap: 6, alignItems: "center" }}><AlbaOrb size={14} motion={false} />AI-guided · research-backed</span>
        </div>
        <h1 style={{ margin: 0, fontSize: "clamp(36px,5.4vw,66px)", lineHeight: 1.02, letterSpacing: "-.045em", fontWeight: 500 }}>
          The science of aging,<br /><anra-morph words="made visual|made personal|made measurable" gradient="linear-gradient(90deg,#FFFFFF,#8CD7B5 50%,#A9D8F0)" />
        </h1>
        <p style={{ margin: 0, fontSize: "clamp(15.5px,1.5vw,18.5px)", lineHeight: 1.55, color: "rgba(247,245,241,.82)", maxWidth: 580 }}>Five interactive explainers built from peer-reviewed studies (2022–2026) — with 3D models, live charts and Neyu to answer your questions. Then measure your own biology with BioAro Labs and review it with an NEYU physician.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (q.trim().length > 1) onAsk(q.trim()); }} style={{ position: "relative", maxWidth: 560, borderRadius: 999 }}>
          <anra-electro radius="30" style={{ position: "absolute", inset: -6, pointerEvents: "none" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, padding: "6px 6px 6px 14px", borderRadius: 999, background: "rgba(255,255,255,.96)" }}>
            <AlbaOrb size={24} />
            <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Ask Neyu about longevity science" placeholder="Ask Neyu — “What slows biological aging?”" style={{ flex: 1, minWidth: 0, height: 44, border: 0, outline: "none", background: "transparent", fontSize: 16, color: T.ink }} />
            <button type="submit" style={{ ...btnInk, height: 44, borderRadius: 999, padding: "0 16px" }}>Ask<i className="ph ph-arrow-right" /></button>
          </div>
        </form>
      </div>
      <div style={{ position: "relative", zIndex: 2, minWidth: 0 }}>
        <Helix3D nodes={PATHWAYS.map(({ id, name, color }) => ({ id, name, color }))} active={node} onPick={setNode} height={420} />
        <div aria-live="polite" style={{ position: "absolute", left: 16, right: 16, bottom: 14, padding: "10px 14px", borderRadius: 14, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.14)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", fontSize: 13.5, lineHeight: 1.45, color: "rgba(247,245,241,.9)" }}>
          {p ? <><b style={{ fontWeight: 600, color: p.color === "#1D5FA8" ? "#B8ADF0" : p.color }}>{p.name}.</b> {p.text} <button onClick={() => onGo("genes")} style={{ border: 0, background: "none", color: "#8CD7B5", cursor: "pointer", padding: 0, fontSize: 13.5 }}>Explore →</button></> : "Tap a glowing node on the helix to meet a longevity pathway · drag to rotate"}
        </div>
      </div>
    </section>
  );
}

export default function LongevityLab() {
  const [tab, setTabState] = useState<Tab>("overview");
  const [seed, setSeed] = useState("");
  const bar = useRef<HTMLDivElement>(null);
  const valid = (t: string): t is Tab => TABS.some((x) => x.v === t);
  const setTab = (t: Tab, scroll = true) => {
    setTabState(t);
    const u = new URL(window.location.href); u.hash = t === "overview" ? "" : t;
    window.history.replaceState(null, "", u.pathname + u.search + (t === "overview" ? "" : "#" + t));
    if (scroll && bar.current) { const y = bar.current.getBoundingClientRect().top + window.scrollY - 90; if (window.scrollY > y) window.scrollTo({ top: y, behavior: "smooth" }); }
  };
  useEffect(() => {
    const read = () => { const h = window.location.hash.slice(1); if (valid(h)) setTabState(h); };
    read(); window.addEventListener("hashchange", read); return () => window.removeEventListener("hashchange", read);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Links like "#pace" inside the intake result switch tabs instead of jumping.
  useEffect(() => {
    const click = (e: MouseEvent) => { const a = (e.target as HTMLElement).closest?.("a[href^='#']") as HTMLAnchorElement | null; if (!a) return; const h = a.getAttribute("href")!.slice(1); if (valid(h)) { e.preventDefault(); setTab(h); } };
    document.addEventListener("click", click); return () => document.removeEventListener("click", click);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ask = (q: string) => { setSeed(q); setTab("alba"); };

  return (
    <div style={{ color: T.ink, paddingBottom: 90 }}>
      <style>{`.sx-tabs::-webkit-scrollbar{display:none}.sx-bar{top:10px;transition:top .28s ease}@media (max-width:859px){.sx-bar{top:62px}html[data-chrome="hidden"] .sx-bar{top:10px}}`}</style>
      <div style={{ ...wrap, paddingTop: "clamp(18px,4vw,40px)" }}><Hero onAsk={ask} onGo={(t) => setTab(t)} /></div>

      <div ref={bar} aria-hidden style={{ height: 0 }} />
      <div className="sx-bar" style={{ position: "sticky", zIndex: 40, marginTop: 20, display: "flex", justifyContent: "center", padding: "0 12px" }}>
        <nav aria-label="Longevity Lab sections" className="sx-tabs" style={{ display: "flex", gap: 4, padding: 5, borderRadius: 999, maxWidth: "100%", overflowX: "auto", scrollbarWidth: "none", background: "rgba(255,255,255,.8)", backdropFilter: "blur(18px) saturate(1.5)", WebkitBackdropFilter: "blur(18px) saturate(1.5)", border: `1px solid ${T.line}`, boxShadow: "0 14px 34px -22px rgba(20,24,27,.45)" }}>
          {TABS.map((t) => { const on = tab === t.v, ai = t.v === "alba"; return <button key={t.v} onClick={() => setTab(t.v)} aria-current={on ? "page" : undefined} style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 16px", borderRadius: 999, border: 0, cursor: "pointer", fontSize: 14, whiteSpace: "nowrap", transition: "all .25s", background: on ? (ai ? "linear-gradient(120deg,#1D5FA8,#2A84E4 50%,#2E7D5B)" : T.ink) : "transparent", color: on ? "#fff" : ai ? T.violet : T.ink2 }}><i className={(on ? "ph-fill " : "ph ") + t.icon} />{t.label}</button>; })}
        </nav>
      </div>

      <main key={tab} style={{ ...wrap, marginTop: "clamp(22px,3vw,32px)", animation: "fadeUp .35s ease", display: "grid", gap: "clamp(20px,3vw,32px)" }}>
        {tab === "overview" && <>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,150px),1fr))", gap: 12 }}>
            {LAB_STATS.map((s) => (
              <div key={s.l} style={{ ...card, padding: "18px 20px", display: "grid", gap: 6 }}>
                <b style={{ fontWeight: 500, fontSize: "clamp(32px,3.4vw,42px)", letterSpacing: "-.035em" }}><span style={aiText}>{s.p}{s.d ? s.v.toFixed(s.d) : <CountUp to={s.v} />}{s.s}</span></b>
                <span style={{ fontSize: 14, color: T.ink2, lineHeight: 1.4 }}>{s.l}</span>
                <span style={{ fontSize: 12, color: T.faint }}>{PAPERS.find((p) => p.id === s.src)?.journal} {PAPERS.find((p) => p.id === s.src)?.year}</span>
              </div>
            ))}
          </section>

          <section style={{ display: "grid", gap: 14 }}>
            <div><div style={{ ...eyebrow, color: T.violet }}>Five explainers</div><h2 style={{ ...h2, fontSize: "clamp(26px,3.4vw,40px)" }}>Pick a question. <span style={aiText}>See the science.</span></h2></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))", gap: 14 }}>
              {FEATURES.map((f) => (
                <button key={f.v} className="sx-card" onClick={() => setTab(f.v)} style={{ ...card, textAlign: "left", padding: 20, display: "grid", gap: 10, cursor: "pointer", position: "relative", overflow: "hidden", color: T.ink }}>
                  <div aria-hidden style={{ position: "absolute", right: -40, top: -40, width: 150, height: 150, borderRadius: "50%", background: `radial-gradient(circle, ${f.color}26, transparent 70%)` }} />
                  <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ width: 46, height: 46, borderRadius: 14, display: "grid", placeItems: "center", background: f.color, color: "#fff", fontSize: 22 }}><i className={"ph " + f.icon} /></span><span style={{ fontSize: 12, color: T.faint }}>0{f.n}</span></span>
                  <b style={{ fontWeight: 500, fontSize: 18 }}>{f.title}</b>
                  <span style={{ fontSize: 14.5, color: T.ink2, lineHeight: 1.5 }}>{f.blurb}</span>
                  <span style={{ fontSize: 12.5, color: f.color, display: "flex", justifyContent: "space-between" }}><span>{f.tests}</span><span>Open →</span></span>
                </button>
              ))}
              <button className="sx-card" onClick={() => setTab("library")} style={{ ...card, textAlign: "left", padding: 20, display: "grid", gap: 10, cursor: "pointer", color: "#2B2F33", background: "linear-gradient(160deg,#FFFDF9,#F4EDE0)" }}>
                <span style={{ width: 46, height: 46, borderRadius: 14, display: "grid", placeItems: "center", background: "#8A6A3A", color: "#fff", fontSize: 22 }}><i className="ph ph-book-open-text" /></span>
                <b style={{ fontWeight: 500, fontSize: 18, fontFamily: "Georgia, serif" }}>The Research Library</b>
                <span style={{ fontSize: 14.5, lineHeight: 1.5 }}>{PAPERS.length} papers as a page-turning book — what each study found, what it means, and what it doesn’t.</span>
                <span style={{ fontSize: 12.5, color: "#8A6A3A" }}>Open the book →</span>
              </button>
            </div>
          </section>

          <section style={{ display: "grid", gap: 14 }}>
            <div><div style={{ ...eyebrow, color: T.violet }}>Your Longevity Lab intake</div><h2 style={{ ...h2, fontSize: "clamp(26px,3.4vw,40px)" }}>Tell Neyu about you. <span style={aiText}>Get your path.</span></h2><p style={{ margin: "8px 0 0", fontSize: 16, color: T.ink2, maxWidth: 720 }}>About 2 minutes. Age, sex, habits, medicines, family history and goals — Neyu ranks which explainers and tests fit you best. Nothing is stored unless you book.</p></div>
            <Assessment kind="lab" accent="#2E7D5B" />
          </section>

          <section style={{ borderRadius: 26, padding: "clamp(20px,4vw,40px)", background: "linear-gradient(135deg,#14181B,#241D33)", color: "#F7F5F1", display: "flex", gap: 20, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
            <div style={{ maxWidth: 640 }}><div style={{ ...eyebrow, color: "#8CD7B5" }}>From science to your care</div><p style={{ margin: "8px 0 0", fontSize: "clamp(18px,2vw,22px)", lineHeight: 1.45 }}>Measure it with BioAro Labs. Understand it with an NEYU physician. Re-check what changes.</p></div>
            <a href={CONSULT_HREF} style={{ ...btnInk, background: "#F7F5F1", color: T.ink }}>Book a longevity consultation<i className="ph ph-arrow-right" /></a>
          </section>
          <p style={{ margin: 0, fontSize: 12.5, color: T.muted, lineHeight: 1.6 }}>Educational content only — not a diagnosis or medical advice. Research findings describe groups of people, not individuals. Medical emergency? Call 911.</p>
        </>}

        {tab === "respond" && <Responsiveness onAsk={ask} />}
        {tab === "stress" && <StressMap onAsk={ask} />}
        {tab === "pace" && <PaceVsAge onAsk={ask} />}
        {tab === "pgx" && <PgxSafety onAsk={ask} />}
        {tab === "genes" && <GeneticsPathways onAsk={ask} />}

        {tab === "library" && (
          <section style={{ display: "grid", gap: 16 }}>
            <div><div style={{ ...eyebrow, color: "#8A6A3A" }}>Research Library</div><h2 style={{ ...h2, fontSize: "clamp(26px,3.4vw,40px)" }}>The studies, <span style={aiText}>in plain language.</span></h2><p style={{ margin: "8px 0 0", fontSize: 16, color: T.ink2, maxWidth: 720 }}>Each chapter is one peer-reviewed paper: what was studied, what was found, what it means for you — and what it doesn’t.</p></div>
            <ResearchBook onFeature={(f) => valid(f) && setTab(f as Tab)} />
          </section>
        )}

        {tab === "alba" && (
          <section style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <AlbaOrb size={48} glow />
              <div><div style={{ ...eyebrow, color: T.violet }}>Neyu · Longevity Lab</div><h2 style={{ ...h2, margin: "4px 0 0", fontSize: "clamp(26px,3.4vw,40px)" }}>Ask anything. <span style={aiText}>Get clarity.</span></h2></div>
            </div>
            <AskPanel page="/longevity-lab" label="longevity science" suggestions={ASK} seed={seed} clearSeed={() => setSeed("")} accent="#2E7D5B" />
          </section>
        )}
      </main>
    </div>
  );
}
