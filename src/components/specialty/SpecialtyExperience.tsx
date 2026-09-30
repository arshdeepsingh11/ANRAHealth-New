"use client";

// Shared, tabbed specialty page (Cardiology, Heart Failure, Internal Medicine,
// Endocrinology, Geriatric, Pediatric Rheumatology, Nutrition, Precision
// Medicine, Respiratory). Same design language as the Nea page: futuristic
// hero (video kept where the page had one), live stats, ALBA, interactive
// tools with charts, real physicians and real BioAro test prices.
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AlbaOrb from "@/components/AlbaOrb";
import SymptomChecker from "@/components/SymptomChecker";
import PhysicianIdCard from "@/components/PhysicianIdCard";
import { STUDIO, type StudioConfig, type CareItem } from "@/data/specialtyStudio";
import { physicians, type Physician } from "@/data/physicians";
import { locations, brand } from "@/data/content";
import { LAB_TESTS, money } from "@/data/bioaroCatalog";
import { T, wrap, card, btnInk, btnGhost, chip, eyebrow, h2, aiText, Icon, CountUp, Stat, ChartCard, useTip, useInView } from "@/components/nea/ui";
import AskPanel from "./AskPanel";
import { useToolList, ToolFrame } from "./tools";

type Tab = "overview" | "alba" | "care" | "tools" | "physicians" | "visit";

function Hero({ c, onAsk }: { c: StudioConfig; onAsk: (q: string) => void }) {
  const [q, setQ] = useState("");
  const [muted, setMuted] = useState(true);
  const yt = useRef<HTMLIFrameElement>(null);
  const toggle = () => { yt.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: muted ? "unMute" : "mute", args: [] }), "*"); setMuted(!muted); };
  const [a, b] = c.accent;
  return (
    <section style={{ position: "relative", overflow: "hidden", borderRadius: 30, minHeight: "clamp(440px,62vh,600px)", color: "#F7F5F1", display: "grid", gridTemplateColumns: "minmax(0,1fr)", alignItems: "end", background: `radial-gradient(120% 90% at 85% 5%, ${b}55 0%, transparent 55%), radial-gradient(90% 80% at 5% 100%, ${a}66 0%, transparent 60%), linear-gradient(150deg,#15171B 0%,#1D1F26 55%,#171520 100%)` }}>
      {c.video?.kind === "mp4" && <video src={c.video.src} autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      {c.video?.kind === "youtube" && <iframe ref={yt} title={`${c.label} — ANRA Health`} src={`https://www.youtube.com/embed/${c.video.id}?autoplay=1&mute=1&loop=1&playlist=${c.video.id}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`} allow="autoplay; encrypted-media" style={{ position: "absolute", top: "50%", left: "50%", width: "max(100%, 177.78vh)", height: "max(100%, 56.25vw)", transform: "translate(-50%,-50%)", border: 0, pointerEvents: "none" }} />}
      {!c.video && <><anra-particles tone="dark" density="7000" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.85 }} /><anra-meteors count="6" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} /></>}
      <div style={{ position: "absolute", inset: 0, background: c.video ? "linear-gradient(0deg, rgba(12,14,18,.92) 0%, rgba(12,14,18,.55) 55%, rgba(12,14,18,.2) 100%)" : "linear-gradient(0deg, rgba(12,14,18,.5), transparent 60%)" }} />
      {c.video?.kind === "youtube" && <button onClick={toggle} aria-label={muted ? "Unmute video" : "Mute video"} style={{ position: "absolute", top: 16, right: 16, zIndex: 3, width: 42, height: 42, borderRadius: 21, border: "1px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.12)", color: "#fff", backdropFilter: "blur(10px)", cursor: "pointer" }}><i className={"ph " + (muted ? "ph-speaker-slash" : "ph-speaker-high")} /></button>}
      <div style={{ position: "relative", zIndex: 2, padding: "clamp(20px,5vw,56px)", display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 18, maxWidth: 820, minWidth: 0, boxSizing: "border-box", width: "100%" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ padding: "6px 12px", borderRadius: 999, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)" }}>{c.partner ? `Partner · ${c.partner.name}` : "ANRA Health specialty"}</span>
          <span style={{ padding: "6px 12px", borderRadius: 999, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", display: "inline-flex", gap: 6, alignItems: "center" }}><AlbaOrb size={14} motion={false} />AI-assisted</span>
        </div>
        <h1 style={{ margin: 0, fontSize: "clamp(36px,5.6vw,68px)", lineHeight: 1.02, letterSpacing: "-.045em", fontWeight: 500 }}>
          {c.label}, for<br /><anra-morph words={c.morph.join("|")} gradient={`linear-gradient(90deg,#FFFFFF,${b} 50%,#C9B8E6)`} />
        </h1>
        <p style={{ margin: 0, fontSize: "clamp(15.5px,1.5vw,18.5px)", lineHeight: 1.55, color: "rgba(247,245,241,.82)", maxWidth: 620 }}>{c.tagline}</p>
        <form onSubmit={(e) => { e.preventDefault(); if (q.trim().length > 1) onAsk(q.trim()); }} style={{ position: "relative", maxWidth: 580, borderRadius: 999 }}>
          <anra-electro radius="30" style={{ position: "absolute", inset: -6, pointerEvents: "none" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, padding: "6px 6px 6px 14px", borderRadius: 999, background: "rgba(255,255,255,.96)" }}>
            <AlbaOrb size={24} />
            <input value={q} onChange={(e) => setQ(e.target.value)} aria-label={`Ask ALBA about ${c.label}`} placeholder={`Ask ALBA — “${c.ask[0]}”`} style={{ flex: 1, minWidth: 0, height: 44, border: 0, outline: "none", background: "transparent", fontSize: 16, color: T.ink }} />
            <button type="submit" style={{ ...btnInk, height: 44, borderRadius: 999, padding: "0 16px" }}>Ask<i className="ph ph-arrow-right" /></button>
          </div>
        </form>
      </div>
    </section>
  );
}

function CareSheet({ item, onClose, onAsk, accent }: { item: CareItem; onClose: () => void; onAsk: (q: string) => void; accent: string }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <div className="anra-chrome">
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 85, background: "rgba(20,24,27,.38)", backdropFilter: "blur(4px)" }} />
      <div role="dialog" aria-modal="true" aria-label={item.name} style={{ position: "fixed", zIndex: 86, left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(560px,calc(100% - 24px))", maxHeight: "86vh", overflow: "auto", background: T.paper, borderRadius: 24, padding: "clamp(20px,4vw,30px)", boxShadow: "0 40px 90px -30px rgba(20,24,27,.5)", animation: "fadeUp .25s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <Icon name={item.icon} bg={accent + "1A"} color={accent} box={50} size={24} />
          <button onClick={onClose} aria-label="Close" style={{ width: 40, height: 40, border: 0, borderRadius: 12, background: T.line2, cursor: "pointer" }}><i className="ph ph-x" /></button>
        </div>
        <h2 style={{ margin: "14px 0 0", fontSize: 26, lineHeight: 1.12, letterSpacing: "-.02em", fontWeight: 500 }}>{item.name}</h2>
        <p style={{ margin: "12px 0 0", fontSize: 16, lineHeight: 1.6, color: T.ink2 }}>{item.desc}</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
          <button onClick={() => { onClose(); onAsk(`Tell me about ${item.name} — what is it, what should I expect, and how do I prepare?`); }} style={{ ...btnInk, background: `linear-gradient(135deg, ${accent}, #6A5096)` }}><i className="ph ph-sparkle" />Ask ALBA</button>
          <a href="/referral-centre" style={btnGhost}>Start a referral<i className="ph ph-arrow-right" /></a>
        </div>
      </div>
    </div>
  );
}

function TestsChart({ slugs, accent }: { slugs: string[]; accent: string }) {
  const tip = useTip();
  const [ref, seen] = useInView<HTMLDivElement>();
  const tests = slugs.map((s) => LAB_TESTS.find((t) => t.id === "labs-" + s)).filter(Boolean) as typeof LAB_TESTS;
  const max = Math.max(...tests.map((t) => t.price), 1);
  if (!tests.length) return null;
  return (
    <div ref={ref} data-tiphost style={{ position: "relative", display: "grid", gap: 10 }}>
      {tests.map((t) => (
        <a key={t.id} href={t.url("CA")} target="_blank" rel="noopener" onMouseMove={(e) => tip.show(e, <><b>{t.name}</b><br />{t.why}</>)} onMouseLeave={tip.hide}
          style={{ display: "grid", gridTemplateColumns: "minmax(120px,42%) 1fr 76px", gap: 10, alignItems: "center", textDecoration: "none", color: T.ink2, fontSize: 14 }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
          <span style={{ height: 10, borderRadius: 5, background: T.line2 }}><span style={{ display: "block", height: "100%", borderRadius: 5, width: seen ? `${(t.price / max) * 100}%` : 0, background: `linear-gradient(90deg, ${accent}, #6EA8B6)`, transition: "width .9s cubic-bezier(.2,.8,.2,1)" }} /></span>
          <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: T.ink }}>{money(t.price)}</span>
        </a>
      ))}
      <p style={{ margin: "4px 0 0", fontSize: 12, color: T.faint }}>BioAro Labs prices as listed on bioarolabs.com. Ordered and paid with BioAro — tap a test to open it.</p>
      {tip.node}
    </div>
  );
}

function LangChart({ list, accent }: { list: Physician[]; accent: string }) {
  const counts = useMemo(() => { const m = new Map<string, number>(); list.forEach((p) => p.languages.forEach((l) => m.set(l, (m.get(l) || 0) + 1))); return [...m.entries()].sort((a, b) => b[1] - a[1]); }, [list]);
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} style={{ display: "grid", gap: 8 }}>
      {counts.map(([l, n]) => (
        <div key={l} style={{ display: "grid", gridTemplateColumns: "90px 1fr 26px", gap: 10, alignItems: "center", fontSize: 14 }}>
          <span>{l}</span>
          <span style={{ height: 10, borderRadius: 5, background: T.line2 }}><span style={{ display: "block", height: "100%", borderRadius: 5, width: seen ? `${(n / list.length) * 100}%` : 0, background: accent, transition: "width .8s" }} /></span>
          <span style={{ textAlign: "right", color: T.muted }}>{n}</span>
        </div>
      ))}
    </div>
  );
}

function PhysicianSheet({ p, onClose, accent }: { p: Physician; onClose: () => void; accent: string }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const initials = p.name.replace(/^Dr\.?\s*/, "").split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("");
  return (
    <div className="anra-chrome">
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 85, background: "rgba(20,24,27,.38)", backdropFilter: "blur(4px)" }} />
      <div role="dialog" aria-modal="true" aria-label={p.name} style={{ position: "fixed", zIndex: 86, left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(580px,calc(100% - 24px))", maxHeight: "86vh", overflow: "auto", background: T.paper, borderRadius: 24, padding: "clamp(20px,4vw,30px)", boxShadow: "0 40px 90px -30px rgba(20,24,27,.5)", animation: "fadeUp .25s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <span style={{ width: 58, height: 58, borderRadius: 29, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${accent}, #6A5096)`, color: "#fff", fontSize: 20, fontWeight: 500 }}>{initials}</span>
            <div><h2 style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>{p.name}</h2><p style={{ margin: "2px 0 0", fontSize: 14, color: accent }}>{p.title}</p></div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 40, height: 40, border: 0, borderRadius: 12, background: T.line2, cursor: "pointer", flex: "none" }}><i className="ph ph-x" /></button>
        </div>
        {p.bio && <p style={{ margin: "16px 0 0", fontSize: 15.5, lineHeight: 1.6, color: T.ink2 }}>{p.bio}</p>}
        <div style={{ marginTop: 16, display: "grid", gap: 6, fontSize: 14.5, color: T.ink2 }}>
          <span style={{ display: "flex", gap: 8 }}><i className="ph ph-map-pin" style={{ color: accent, marginTop: 3 }} />{p.location} · {p.address}</span>
          <a href={"tel:" + p.phone.replace(/[^\d+]/g, "")} style={{ display: "flex", gap: 8, color: T.ink2, textDecoration: "none" }}><i className="ph ph-phone" style={{ color: accent, marginTop: 3 }} />{p.phone}</a>
          <span style={{ display: "flex", gap: 8 }}><i className="ph ph-translate" style={{ color: accent, marginTop: 3 }} />{p.languages.join(", ")}</span>
        </div>
        {p.qualifications.length > 0 && <><div style={{ ...eyebrow, marginTop: 18 }}>Qualifications</div><ul style={{ margin: "8px 0 0", paddingLeft: 18, display: "grid", gap: 4, fontSize: 14, color: T.ink2, listStyle: "disc" }}>{p.qualifications.map((q) => <li key={q}>{q}</li>)}</ul></>}
        <a href="/referral-centre" style={{ ...btnInk, marginTop: 20 }}>Start a referral<i className="ph ph-arrow-right" /></a>
      </div>
    </div>
  );
}

export default function SpecialtyExperience({ slug }: { slug: string }) {
  const c = STUDIO[slug];
  const [a] = c.accent;
  const docs = useMemo(() => (c.disciplines.length ? physicians.filter((p) => c.disciplines.some((d) => p.disciplines.includes(d))) : []), [c]);
  const team = useMemo(() => physicians.filter((p) => !docs.includes(p)), [docs]);
  const TABS: { v: Tab; label: string; icon: string }[] = [
    { v: "overview", label: "Overview", icon: "ph-house-simple" },
    { v: "alba", label: "Ask ALBA", icon: "ph-sparkle" },
    { v: "care", label: c.partner ? "Services" : "Care & tests", icon: "ph-first-aid-kit" },
    { v: "tools", label: "Tools & insights", icon: "ph-chart-line-up" },
    { v: "physicians" as Tab, label: "Physicians", icon: "ph-user-circle" },
    { v: "visit", label: "Visit", icon: "ph-map-pin" },
  ];
  const [tab, setTabState] = useState<Tab>("overview");
  const [seed, setSeed] = useState("");
  const [care, setCare] = useState<CareItem | null>(null);
  const [doc, setDoc] = useState<Physician | null>(null);
  const [lang, setLang] = useState("All");
  const [loc, setLoc] = useState("All");
  const barRef = useRef<HTMLDivElement>(null);
  const tools = useToolList();
  const page = `/specialties/${slug}`;

  const setTab = useCallback((t: Tab) => {
    setTabState(t);
    const u = new URL(window.location.href);
    if (t === "overview") u.searchParams.delete("tab"); else u.searchParams.set("tab", t);
    history.replaceState(null, "", u.pathname + u.search);
    const bar = barRef.current;
    if (bar) { const stick = window.innerWidth <= 859 ? 62 : 10; const top = bar.getBoundingClientRect().top + window.scrollY - stick; if (window.scrollY > top + 1) window.scrollTo({ top, behavior: "smooth" }); }
  }, []);
  useEffect(() => { const t = new URLSearchParams(window.location.search).get("tab") as Tab | null; if (t && TABS.some((x) => x.v === t)) setTabState(t); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  const ask = useCallback((q: string) => { setSeed(q); setTab("alba"); }, [setTab]);

  const langs = ["All", ...Array.from(new Set(physicians.flatMap((p) => p.languages))).sort()];
  const pick = (l: Physician[]) => l.filter((p) => (lang === "All" || p.languages.includes(lang)) && (loc === "All" || p.location === loc));
  const shownDocs = pick(docs), shownTeam = pick(team);
  const testCount = c.tests.filter((s) => LAB_TESTS.some((t) => t.id === "labs-" + s)).length;
  const langCount = new Set(physicians.flatMap((p) => p.languages)).size;
  const groups = Array.from(new Set(c.care.map((x) => x.group || "")));

  return (
    <div style={{ color: T.ink, paddingBottom: 90 }}>
      <style>{`.sx-tabs::-webkit-scrollbar{display:none}.sx-bar{top:10px;transition:top .28s ease}@media (max-width:859px){.sx-bar{top:62px}html[data-chrome="hidden"] .sx-bar{top:10px}}.sx-card:hover{transform:translateY(-3px);box-shadow:0 26px 50px -30px rgba(20,24,27,.45)!important}.sx-card{transition:transform .25s ease, box-shadow .25s ease}`}</style>
      <header style={{ ...wrap, paddingTop: "clamp(34px,6vw,72px)", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 12.5, letterSpacing: ".16em", textTransform: "uppercase", color: a }}>ANRA Health · {c.partner ? "Partner specialty" : "Medical specialties"}</p>
        <h1 style={{ margin: "10px 0 0", fontSize: "clamp(34px,5vw,58px)", lineHeight: 1.02, letterSpacing: "-.04em", fontWeight: 500, display: "inline-flex", gap: 14, alignItems: "center" }}><i className={"ph " + c.icon} style={{ color: a, fontSize: ".8em" }} />{c.label}</h1>
      </header>

      <div ref={barRef} aria-hidden style={{ height: 0 }} />
      <div className="sx-bar" style={{ position: "sticky", zIndex: 40, marginTop: 20, display: "flex", justifyContent: "center", padding: "0 12px" }}>
        <nav aria-label={`${c.label} sections`} className="sx-tabs" style={{ display: "flex", gap: 4, padding: 5, borderRadius: 999, maxWidth: "100%", overflowX: "auto", scrollbarWidth: "none", background: "rgba(255,255,255,.8)", backdropFilter: "blur(18px) saturate(1.5)", WebkitBackdropFilter: "blur(18px) saturate(1.5)", border: `1px solid ${T.line}`, boxShadow: "0 14px 34px -22px rgba(20,24,27,.45)" }}>
          {TABS.map((t) => {
            const on = tab === t.v, ai = t.v === "alba";
            return <button key={t.v} onClick={() => setTab(t.v)} aria-current={on ? "page" : undefined} style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 16px", borderRadius: 999, border: 0, cursor: "pointer", fontSize: 14, whiteSpace: "nowrap", transition: "all .25s", background: on ? (ai ? "linear-gradient(120deg,#6A5096,#8C6FB8 50%," + a + ")" : T.ink) : "transparent", color: on ? "#fff" : ai ? T.violet : T.ink2 }}><i className={(on ? "ph-fill " : "ph ") + t.icon} />{t.label}</button>;
          })}
        </nav>
      </div>

      <main key={tab} style={{ ...wrap, marginTop: "clamp(22px,3vw,32px)", animation: "fadeUp .35s ease", display: "grid", gap: "clamp(18px,2.6vw,28px)" }}>
        {tab === "overview" && <>
          <Hero c={c} onAsk={ask} />
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,165px),1fr))", gap: 12 }}>
            <Stat icon="ph-user-circle" tone={a} value={<CountUp to={docs.length || physicians.length} />} label={docs.length ? `${c.label} physician${docs.length > 1 ? "s" : ""} · ${physicians.length} on the ANRA team` : "ANRA physicians"} />
            {c.partner ? <Stat icon="ph-map-trifold" tone="#2A78D6" value="AB" label={c.partner.note.replace(/\.$/, "")} /> : <Stat icon="ph-map-pin" tone="#2A78D6" value={<CountUp to={locations.length} />} label="Calgary clinics" />}
            {langCount > 0 && <Stat icon="ph-translate" tone={T.ai} value={<CountUp to={langCount} />} label="languages spoken by our team" />}
            <Stat icon="ph-first-aid-kit" tone={T.good} value={<CountUp to={c.care.length} />} label={c.partner ? "services" : "areas of care"} />
            {testCount > 0 && <Stat icon="ph-flask" tone="#B26A12" value={<CountUp to={testCount} />} label="related BioAro Labs tests" />}
            <Stat icon="ph-sparkle" tone={T.violet} value={<CountUp to={c.tools.length} />} label="AI & screening tools" />
          </section>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 16 }}>
            <div style={{ ...card, padding: "clamp(20px,3vw,28px)", display: "grid", gap: 12, alignContent: "start" }}>
              <div style={eyebrow}>About</div>
              {c.overview.map((p) => <p key={p.slice(0, 20)} style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: T.ink2 }}>{p}</p>)}
              {c.whenToSee && <div style={{ padding: "14px 16px", borderRadius: 14, background: a + "10", border: `1px solid ${a}2A`, fontSize: 15, lineHeight: 1.55 }}><b style={{ fontWeight: 600, color: a }}>When to see us · </b>{c.whenToSee}</div>}
            </div>
            <div style={{ ...card, padding: "clamp(20px,3vw,28px)", display: "grid", gap: 14, alignContent: "start" }}>
              <div style={eyebrow}>{slug === "cardiology" ? "Symptoms we assess" : "What we look after"}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{c.conditions.map((x) => <button key={x} onClick={() => ask(`What is ${x.split(" (")[0].toLowerCase()} and when should I see a specialist?`)} style={{ ...chip(false), minHeight: 36, fontSize: 13.5, textAlign: "left", whiteSpace: "normal", padding: "6px 14px" }}>{x.split(" (")[0]}<i className="ph ph-sparkle" style={{ color: T.ai }} /></button>)}</div>
              <p style={{ margin: 0, fontSize: 12.5, color: T.faint }}>Tap any topic and ALBA explains it.</p>
            </div>
          </section>
          <section style={{ ...card, padding: "clamp(20px,3vw,28px)" }}>
            <div style={eyebrow}>Your path</div>
            <h2 style={{ ...h2, fontSize: "clamp(24px,3vw,34px)" }}>From referral to a plan <span style={aiText}>made for you.</span></h2>
            <ol style={{ margin: "18px 0 0", padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,190px),1fr))", gap: 10 }}>
              {(c.partner ? [["ph-paper-plane-tilt", "Referral", "Your family doctor refers you."], ["ph-stethoscope", "Assessment", "Consultation with the specialist team."], ["ph-wave-sine", "Testing", "Diagnostics, at home or in the lab."], ["ph-arrows-clockwise", "Ongoing care", "Equipment, education and support."]]
                : [["ph-paper-plane-tilt", "Referral", "From your family doctor or walk-in."], ["ph-stethoscope", "Consultation", "A specialist reviews your full history."], ["ph-flask", "Testing", "On-site diagnostics and, when useful, BioAro tests."], ["ph-sparkle", "Your plan", "Clear next steps, tracked in My Health Space."]]).map(([ic, t, d], i) => (
                <li key={t} style={{ padding: "14px 16px", borderRadius: 16, background: T.paper, border: `1px solid ${T.line2}`, display: "grid", gap: 6, animation: `fadeUp .4s ${i * 0.08}s both` }}>
                  <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Icon name={ic} bg={a + "18"} color={a} box={36} size={18} /><span style={{ fontSize: 12, color: T.faint }}>0{i + 1}</span></span>
                  <b style={{ fontWeight: 500, fontSize: 15.5 }}>{t}</b><span style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.45 }}>{d}</span>
                </li>
              ))}
            </ol>
          </section>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 12 }}>
            {[["ph-sparkle", "Ask ALBA", `Questions about ${c.label.toLowerCase()}, answered.`, "alba"], ["ph-chart-line-up", "Screening tools", "Instant, visual self-checks.", "tools"], ["ph-first-aid-kit", c.partner ? "Services" : "Care & tests", "What we offer, with real prices.", "care"]].map(([ic, t, d, go]) => (
              <button key={t} onClick={() => setTab(go as Tab)} className="sx-card" style={{ ...card, padding: 18, textAlign: "left", cursor: "pointer", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center" }}>
                <Icon name={ic} bg={a + "18"} color={a} /><span><b style={{ display: "block", fontWeight: 500, fontSize: 16 }}>{t}</b><span style={{ fontSize: 13.5, color: T.muted }}>{d}</span></span><i className="ph ph-arrow-right" style={{ color: T.muted }} />
              </button>
            ))}
          </section>
        </>}

        {tab === "alba" && (
          <section style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <AlbaOrb size={48} glow />
              <div><div style={{ ...eyebrow, color: T.violet }}>ALBA · {c.label}</div><h2 style={{ ...h2, margin: "4px 0 0", fontSize: "clamp(26px,3.4vw,40px)" }}>Ask anything. <span style={aiText}>Get clarity.</span></h2></div>
            </div>
            <AskPanel page={page} label={c.label} suggestions={c.ask} seed={seed} clearSeed={() => setSeed("")} accent={a} />
          </section>
        )}

        {tab === "care" && <>
          {groups.map((g) => (
            <section key={g || "care"} style={{ display: "grid", gap: 12 }}>
              {g && <div style={eyebrow}>{g}</div>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,270px),1fr))", gap: 12 }}>
                {c.care.filter((x) => (x.group || "") === g).map((x, i) => (
                  <button key={x.name} onClick={() => setCare(x)} className="sx-card" style={{ ...card, padding: 18, textAlign: "left", cursor: "pointer", display: "grid", gap: 10, alignContent: "start", animation: `fadeUp .35s ${Math.min(i, 10) * 0.03}s both` }}>
                    <Icon name={x.icon} bg={a + "18"} color={a} />
                    <b style={{ fontWeight: 500, fontSize: 17, lineHeight: 1.25 }}>{x.name}</b>
                    <span style={{ fontSize: 14, color: T.muted, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{x.desc}</span>
                    <span style={{ fontSize: 12.5, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600, color: a }}>Learn more →</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
          {testCount > 0 && <ChartCard title="Related BioAro Labs tests" sub="Advanced tests that can add to your picture — discuss results with your physician"><TestsChart slugs={c.tests} accent={a} /></ChartCard>}
        </>}

        {tab === "tools" && <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,440px),1fr))", gap: 16, alignItems: "start" }}>
            {c.tools.map((k) => {
              if (k === "symptoms-cardio" || k === "symptoms-resp") return <ToolFrame key={k} title="AI symptom check" sub="Describe what you notice — ALBA suggests an urgency level" icon="ph-sparkle" accent={a}><SymptomChecker specialty={k === "symptoms-cardio" ? "cardiology" : "respiratory"} /></ToolFrame>;
              if (k === "tests") return <ChartCard key={k} title="Genomic test explorer" sub="Compare BioAro genomic tests by price"><TestsChart slugs={c.tests} accent={a} /></ChartCard>;
              const Tool = (tools as Record<string, React.ComponentType<{ accent: string; onAsk: (q: string) => void }>>)[k];
              return Tool ? <Tool key={k} accent={a} onAsk={ask} /> : null;
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,440px),1fr))", gap: 16 }}>
            {testCount > 0 && !c.tools.includes("tests") && <ChartCard title="Related tests, by price" sub="BioAro Labs"><TestsChart slugs={c.tests} accent={a} /></ChartCard>}
            <ChartCard title="Languages spoken" sub="Across our ANRA physicians" table={{ head: ["Physician", "Languages"], rows: physicians.map((p) => [p.name, p.languages.join(", ")]) }}><LangChart list={physicians} accent={a} /></ChartCard>
          </div>
        </>}

        {tab === "physicians" && <>
          {c.physicianNote && <p style={{ margin: 0, fontSize: 15, color: T.ink2 }}>{c.physicianNote}</p>}
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>{langs.map((l) => <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} style={{ ...chip(lang === l), minHeight: 36, fontSize: 13.5 }}>{l === "All" ? "Any language" : l}</button>)}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{["All", ...locations.map((l) => l.tag)].map((l) => <button key={l} onClick={() => setLoc(l)} aria-pressed={loc === l} style={{ ...chip(loc === l), minHeight: 36, fontSize: 13.5 }}><i className="ph ph-map-pin" />{l === "All" ? "Any location" : l}</button>)}</div>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: T.muted }}>Drag a card to swing it, or tap to open the physician’s profile.</p>
          {[[shownDocs, c.partner ? "" : `${c.label} physicians`], [shownTeam, docs.length ? "Also on our ANRA team" : "Our ANRA physicians"]].map(([list, title]) => (list as Physician[]).length > 0 && (
            <section key={title as string} style={{ display: "grid", gap: 8 }}>
              {title && <div style={{ ...eyebrow, color: a }}>{title as string} · {(list as Physician[]).length}</div>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))", columnGap: 24, rowGap: 48 }}>
                {(list as Physician[]).map((p, i) => <PhysicianIdCard key={p.slug} p={p} index={i} onOpen={() => setDoc(p)} />)}
              </div>
            </section>
          ))}
          {!shownDocs.length && !shownTeam.length && <p style={{ color: T.muted }}>No physician matches both filters — try “Any”.</p>}
        </>}

        {tab === "visit" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: 16 }}>
            {c.partner ? (
              <div style={{ ...card, padding: "clamp(20px,3vw,28px)", display: "grid", gap: 12 }}>
                <div style={eyebrow}>Partner</div>
                <h2 style={{ ...h2, margin: 0, fontSize: "clamp(24px,3vw,32px)" }}>{c.partner.name}</h2>
                <a href={c.partner.tel} style={{ display: "flex", gap: 10, color: T.ink2, textDecoration: "none", fontSize: 16 }}><i className="ph ph-phone" style={{ color: a }} />{c.partner.phone}</a>
                <a href={c.partner.site} target="_blank" rel="noopener" style={{ display: "flex", gap: 10, color: T.ink2, textDecoration: "none", fontSize: 16 }}><i className="ph ph-globe" style={{ color: a }} />{c.partner.site.replace(/^https?:\/\//, "")}</a>
                <p style={{ margin: 0, fontSize: 14, color: T.muted }}>{c.partner.note}</p>
                <a href={c.partner.tel} style={{ ...btnInk, justifySelf: "start" }}>Call {c.partner.name.split(" ").slice(0, 2).join(" ")}<i className="ph ph-phone" /></a>
              </div>
            ) : locations.map((l) => (
              <div key={l.tag} style={{ ...card, padding: "clamp(20px,3vw,28px)", display: "grid", gap: 10 }}>
                <div style={eyebrow}>{l.tag}</div>
                <h2 style={{ ...h2, margin: 0, fontSize: "clamp(22px,2.6vw,28px)" }}>{l.name}</h2>
                <a href={"https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(l.address)} target="_blank" rel="noopener" style={{ display: "flex", gap: 10, color: T.ink2, textDecoration: "none" }}><i className="ph ph-map-pin" style={{ color: a, marginTop: 3 }} />{l.address}</a>
                <a href={"tel:" + l.phone.replace(/[^\d]/g, "")} style={{ display: "flex", gap: 10, color: T.ink2, textDecoration: "none" }}><i className="ph ph-phone" style={{ color: a, marginTop: 3 }} />{l.phone}</a>
                <span style={{ display: "flex", gap: 10, color: T.muted, fontSize: 14 }}><i className="ph ph-printer" style={{ marginTop: 3 }} />Fax {l.fax}</span>
              </div>
            ))}
            <div style={{ ...card, padding: "clamp(20px,3vw,28px)", display: "grid", gap: 12, background: `linear-gradient(150deg,#fff,${a}12)` }}>
              <div style={eyebrow}>Getting started</div>
              <h2 style={{ ...h2, margin: 0, fontSize: "clamp(22px,2.6vw,28px)" }}>Most visits start with a referral.</h2>
              <p style={{ margin: 0, fontSize: 15, color: T.ink2, lineHeight: 1.55 }}>Your family doctor or a walk-in physician can refer you. Our Referral Centre makes it simple to send one.</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><a href="/referral-centre" style={btnInk}>Referral Centre<i className="ph ph-arrow-right" /></a><a href={"tel:" + brand.phone.replace(/[^\d]/g, "")} style={btnGhost}><i className="ph ph-phone" />{brand.phone}</a></div>
              <p style={{ margin: 0, fontSize: 12.5, color: T.faint }}>Emergency? Call 911.</p>
            </div>
          </div>
        )}
      </main>

      {care && <CareSheet item={care} onClose={() => setCare(null)} onAsk={ask} accent={a} />}
      {doc && <PhysicianSheet p={doc} onClose={() => setDoc(null)} accent={a} />}
    </div>
  );
}
