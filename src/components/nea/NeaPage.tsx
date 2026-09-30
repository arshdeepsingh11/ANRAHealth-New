"use client";

// Nea Precision Skin — ANRA's aesthetics & skin-health partner.
// All content from neaprecisionskin.com. Every "Book" goes straight to Nea's
// own booking (Jane); packages go to Nea's consultation form.

import React, { useEffect, useMemo, useState } from "react";
import { NEA, NEA_TREATMENTS, NEA_PACKAGES, NEA_DOWNTIME, NEA_OUTCOMES, NEA_SESSION_MIN, NEA_CATS, neaTreatmentUrl, type NeaTreatment, type NeaCat } from "@/data/nea";
import { LAB_TESTS, money } from "@/data/bioaroCatalog";

const T = { ink: "#14181B", ink2: "#3A4147", muted: "#5A626A", line: "#E3DED5", line2: "#EFECE6", paper: "#FBFAF7", card: "#FFFFFF", nea: NEA.color, deep: "#8A4F43", soft: NEA.colorSoft, teal: "#3F6F7C" };
const wrap: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" };
const eyebrow: React.CSSProperties = { fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: T.muted };
const h2: React.CSSProperties = { margin: "12px 0 0", fontSize: "clamp(30px,4vw,48px)", lineHeight: 1.04, letterSpacing: "-.035em", fontWeight: 500 };
const card: React.CSSProperties = { background: T.card, border: `1px solid ${T.line}`, borderRadius: 22, boxShadow: "0 1px 2px rgba(20,24,27,.04), 0 18px 40px -30px rgba(20,24,27,.35)" };
const btnInk: React.CSSProperties = { height: 50, padding: "0 20px", borderRadius: 14, background: T.ink, color: "#F7F5F1", border: 0, fontSize: 14, letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", cursor: "pointer" };
const btnGhost: React.CSSProperties = { ...btnInk, background: "transparent", color: T.ink, border: `1px solid ${T.ink}` };
const chip = (on: boolean): React.CSSProperties => ({ whiteSpace: "nowrap", minHeight: 40, padding: "0 15px", borderRadius: 999, border: `1px solid ${on ? T.ink : "#D6D0C5"}`, background: on ? T.ink : "transparent", color: on ? "#F7F5F1" : T.ink, fontSize: 14, cursor: "pointer" });

function Book({ label = "Book at Nea", ghost, small, href = NEA.book }: { label?: string; ghost?: boolean; small?: boolean; href?: string }) {
  return <a href={href} target="_blank" rel="noopener" style={{ ...(ghost ? btnGhost : btnInk), ...(small ? { height: 42, padding: "0 16px", fontSize: 12.5 } : {}) }}>{label}<i className="ph ph-arrow-up-right" /></a>;
}

// ── Charts (SVG, data published by Nea) ─────────────────────────────────
function RangeBars({ rows, unit, max, color, fromZero }: { rows: { name: string; min: number; max: number }[]; unit: string; max: number; color: string; fromZero?: boolean }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {rows.map((r) => {
        const w = (v: number) => `${(v / max) * 100}%`;
        return (
          <div key={r.name} style={{ display: "grid", gridTemplateColumns: "minmax(120px,40%) 1fr auto", gap: 12, alignItems: "center", fontSize: 14 }}>
            <span style={{ color: T.ink2 }}>{r.name}</span>
            <span style={{ position: "relative", height: 10, borderRadius: 5, background: T.line2 }}>
              {r.max === 0 ? <span style={{ position: "absolute", left: 0, top: -2, width: 14, height: 14, borderRadius: 7, background: "#4F9D7E", boxShadow: "0 0 0 4px rgba(79,157,126,.18)" }} />
                : fromZero ? <><span style={{ position: "absolute", left: 0, width: w(r.max), top: 0, bottom: 0, borderRadius: 5, background: color, opacity: r.min < r.max ? .45 : 1 }} />{r.min < r.max && <span style={{ position: "absolute", left: 0, width: w(r.min), top: 0, bottom: 0, borderRadius: 5, background: color }} />}</>
                : <span style={{ position: "absolute", left: w(r.min), width: `calc(${w(r.max - r.min)} + 10px)`, top: 0, bottom: 0, borderRadius: 5, background: color, transition: "all .6s" }} />}
            </span>
            <span style={{ fontVariantNumeric: "tabular-nums", color: T.ink, minWidth: 64, textAlign: "right" }}>{r.max === 0 ? "None" : r.min === r.max ? `${r.max} ${unit}` : `${r.min}–${r.max} ${unit}`}</span>
          </div>
        );
      })}
    </div>
  );
}
function Rings() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 16 }}>
      {NEA_OUTCOMES.map((o, i) => {
        const r = 44, c = 2 * Math.PI * r, col = ["#B9786A", "#3F6F7C", "#6EA8B6", "#8C6FB8"][i % 4];
        return (
          <figure key={o.label} style={{ margin: 0, display: "grid", justifyItems: "center", gap: 8, textAlign: "center" }}>
            <svg viewBox="0 0 110 110" width="110" height="110" role="img" aria-label={`${o.label}: ${o.value}%`}>
              <circle cx="55" cy="55" r={r} fill="none" stroke={T.line2} strokeWidth="10" />
              <circle cx="55" cy="55" r={r} fill="none" stroke={col} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(o.value / 100) * c} ${c}`} transform="rotate(-90 55 55)" />
              <text x="55" y="60" textAnchor="middle" fontSize="22" fontWeight="500" fill={T.ink}>{o.label.includes("muscle") ? "+" : ""}{o.value}%</text>
            </svg>
            <figcaption style={{ fontSize: 13.5, lineHeight: 1.35 }}><b style={{ fontWeight: 500 }}>{o.label}</b><br /><span style={{ color: T.muted }}>{o.note}</span></figcaption>
          </figure>
        );
      })}
    </div>
  );
}
function NeuroTimeline() {
  const pts = [{ x: 4, t: "Treatment", s: "10–20 min" }, { x: 22, t: "Visible", s: "24 hours" }, { x: 36, t: "Full effect", s: "3 days" }, { x: 96, t: "Wears off", s: "3–6 months" }];
  return (
    <div>
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{ width: "100%", height: 90 }} aria-hidden>
        <defs><linearGradient id="neaFade" x1="0" x2="1"><stop offset="0" stopColor={T.nea} stopOpacity=".15" /><stop offset=".35" stopColor={T.nea} stopOpacity=".55" /><stop offset=".7" stopColor={T.nea} stopOpacity=".45" /><stop offset="1" stopColor={T.nea} stopOpacity=".05" /></linearGradient></defs>
        <path d="M4 28 C 14 28, 18 8, 36 6 L 70 6 C 84 6, 90 22, 96 28 Z" fill="url(#neaFade)" />
        <path d="M4 28 C 14 28, 18 8, 36 6 L 70 6 C 84 6, 90 22, 96 28" fill="none" stroke={T.nea} strokeWidth=".6" vectorEffect="non-scaling-stroke" />
      </svg>
      <div style={{ position: "relative", height: 44 }}>
        {pts.map((p) => <div key={p.t} style={{ position: "absolute", left: `${p.x}%`, transform: "translateX(-50%)", textAlign: "center", fontSize: 12.5, whiteSpace: "nowrap" }}><b style={{ fontWeight: 500 }}>{p.t}</b><br /><span style={{ color: T.muted }}>{p.s}</span></div>)}
      </div>
    </div>
  );
}

// ── Treatment detail sheet ──────────────────────────────────────────────
function Detail({ t, onClose }: { t: NeaTreatment; onClose: () => void }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <div className="anra-chrome">
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 85, background: "rgba(20,24,27,.34)", animation: "fadeUp .2s" }} />
      <div role="dialog" aria-label={t.name} style={{ position: "fixed", zIndex: 86, left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(600px,calc(100% - 24px))", maxHeight: "88vh", overflow: "auto", background: T.paper, borderRadius: 24, padding: "clamp(22px,4vw,34px)", boxShadow: "0 40px 90px -30px rgba(20,24,27,.5)", animation: "fadeUp .25s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <span style={{ ...eyebrow, color: T.deep }}>{t.cat} · Nea Precision Skin</span>
          <button onClick={onClose} aria-label="Close" style={{ width: 40, height: 40, border: 0, background: T.line2, borderRadius: 12, display: "grid", placeItems: "center", cursor: "pointer" }}><i className="ph ph-x" /></button>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 8 }}>
          <span style={{ width: 52, height: 52, borderRadius: 16, background: T.soft, display: "grid", placeItems: "center", color: T.deep, flex: "none" }}><i className={"ph " + t.icon} style={{ fontSize: 26 }} /></span>
          <h2 style={{ margin: 0, fontSize: "clamp(26px,4vw,34px)", lineHeight: 1.08, letterSpacing: "-.03em", fontWeight: 500 }}>{t.name}</h2>
        </div>
        <p style={{ margin: "14px 0 0", fontSize: 17, color: T.ink2 }}>{t.summary}</p>
        {t.facts.length > 0 && (
          <dl style={{ margin: "20px 0 0", display: "grid", gridTemplateColumns: `repeat(${Math.min(3, t.facts.length)},1fr)`, gap: 12, padding: "16px 0", borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
            {t.facts.map(([k, v]) => <div key={k}><dt style={{ fontSize: 12, color: T.muted }}>{k}</dt><dd style={{ margin: "4px 0 0", fontSize: 15.5 }}>{v}</dd></div>)}
          </dl>
        )}
        <ul style={{ margin: "18px 0 0", paddingLeft: 20, display: "grid", gap: 8, fontSize: 15.5, lineHeight: 1.55, color: T.ink2, listStyle: "disc" }}>{t.details.map((d) => <li key={d}>{d}</li>)}</ul>
        {t.tech && <p style={{ margin: "14px 0 0", fontSize: 14, color: T.muted, display: "flex", gap: 8, alignItems: "center" }}><i className="ph ph-cpu" />{t.tech}</p>}
        <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Book />
          <a href={neaTreatmentUrl(t.id)} target="_blank" rel="noopener" style={{ ...btnGhost, height: 50 }}>On Nea’s site<i className="ph ph-arrow-up-right" /></a>
        </div>
        <p style={{ margin: "14px 0 0", fontSize: 13, color: T.muted }}>Starts with a free 15-minute consultation. Pricing is set with Nea. Information from neaprecisionskin.com — not medical advice.</p>
      </div>
    </div>
  );
}

// ── AI Skin Match ───────────────────────────────────────────────────────
const QUICK = ["Acne and scarring", "Fine lines and sagging", "Thinning hair", "Snoring", "Dark spots / melasma", "Toning my body"];
function SkinMatch({ open }: { open: (t: NeaTreatment) => void }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ intro?: string; picks: { id: string; why: string }[]; byAlba?: boolean; emergency?: string; error?: string } | null>(null);
  const ask = async (text: string) => {
    const t = text.trim();
    if (t.length < 3 || busy) return;
    setQ(t); setBusy(true);
    try {
      const r = await fetch("/api/nea/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ concern: t }) });
      const j = await r.json();
      setRes(r.ok ? j : { picks: [], error: j.error || "Something went wrong." });
    } catch { setRes({ picks: [], error: "We couldn't reach ALBA. Please try again." }); } finally { setBusy(false); }
  };
  return (
    <section id="match" style={{ ...card, padding: "clamp(22px,4vw,40px)", background: "linear-gradient(160deg,#FFFFFF 0%,#FBF4F1 60%,#F4EEF8 100%)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#6A5096", fontSize: 13, fontWeight: 500, letterSpacing: ".04em" }}><i className="ph ph-sparkle" style={{ fontSize: 18 }} />ALBA SKIN MATCH</div>
      <h2 style={{ ...h2, fontSize: "clamp(26px,3.4vw,40px)" }}>Tell us what’s bothering you.<br /><span style={{ color: T.muted }}>We’ll point you to the right Nea treatment.</span></h2>
      <form onSubmit={(e) => { e.preventDefault(); ask(q); }} style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <label htmlFor="nea-q" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Your concern</label>
        <input id="nea-q" value={q} onChange={(e) => setQ(e.target.value)} maxLength={400} placeholder="e.g. My cheeks are losing volume and I have fine lines" style={{ flex: "1 1 320px", minWidth: 0, height: 54, padding: "0 18px", borderRadius: 16, border: `1px solid ${T.line}`, background: "#fff", fontSize: 16, color: T.ink }} />
        <button type="submit" disabled={busy || q.trim().length < 3} style={{ ...btnInk, height: 54, opacity: busy || q.trim().length < 3 ? 0.55 : 1 }}>{busy ? "Thinking…" : "Find my match"}<i className="ph ph-magic-wand" /></button>
      </form>
      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>{QUICK.map((x) => <button key={x} onClick={() => ask(x)} style={{ ...chip(false), minHeight: 36, fontSize: 13.5, background: "rgba(255,255,255,.7)" }}>{x}</button>)}</div>
      {res && (
        <div aria-live="polite" style={{ marginTop: 22, animation: "fadeUp .3s ease" }}>
          {res.emergency && <p role="alert" style={{ margin: 0, padding: "14px 16px", borderRadius: 14, background: "#FBE7E1", color: "#8B2F1C", fontSize: 15 }}>{res.emergency}</p>}
          {res.error && <p role="alert" style={{ margin: 0, color: "#8B2F1C" }}>{res.error}</p>}
          {res.intro && <p style={{ margin: "0 0 14px", fontSize: 16, color: T.ink2 }}>{res.intro}{res.byAlba && <span style={{ marginLeft: 8, fontSize: 12, color: "#6A5096" }}>· Written by ALBA</span>}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 12 }}>
            {res.picks.map((p) => { const t = NEA_TREATMENTS.find((x) => x.id === p.id)!; return (
              <div key={p.id} style={{ ...card, padding: 18, display: "grid", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}><span style={{ width: 38, height: 38, borderRadius: 12, background: T.soft, color: T.deep, display: "grid", placeItems: "center" }}><i className={"ph " + t.icon} style={{ fontSize: 19 }} /></span><b style={{ fontWeight: 500, fontSize: 16.5 }}>{t.name}</b></div>
                <p style={{ margin: 0, fontSize: 14.5, color: T.ink2 }}>{p.why}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Book small /><button onClick={() => open(t)} style={{ ...btnGhost, height: 42, padding: "0 14px", fontSize: 12.5 }}>Details</button></div>
              </div>
            ); })}
          </div>
          {res.picks.length === 0 && !res.emergency && !res.error && <Book label="Book a free consultation" href={NEA.consult} />}
          <p style={{ margin: "12px 0 0", fontSize: 12.5, color: T.muted }}>A starting point, not a diagnosis. Nea’s team confirms what’s right for you at your free consultation.</p>
        </div>
      )}
    </section>
  );
}

// ── Page ────────────────────────────────────────────────────────────────
export default function NeaPage() {
  const [cat, setCat] = useState<NeaCat | "All">("All");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<NeaTreatment | null>(null);
  const [group, setGroup] = useState<"Beauty" | "Wellness">("Beauty");

  // Deep links: /specialties/skin-health#fillers opens that treatment.
  useEffect(() => {
    const fromHash = () => { const id = decodeURIComponent(window.location.hash.slice(1)); const t = NEA_TREATMENTS.find((x) => x.id === id); if (t) setOpen(t); };
    fromHash(); window.addEventListener("hashchange", fromHash); return () => window.removeEventListener("hashchange", fromHash);
  }, []);
  const close = () => { setOpen(null); if (window.location.hash) history.replaceState(null, "", window.location.pathname); };

  const list = useMemo(() => NEA_TREATMENTS.filter((t) => (cat === "All" || t.cat === cat) && (!search.trim() || (t.name + " " + t.summary + " " + t.concerns.join(" ")).toLowerCase().includes(search.trim().toLowerCase()))), [cat, search]);
  const microTests = ["the-bioskin-test", "the-biogut-test", "the-biofemme-test"].map((s) => LAB_TESTS.find((t) => t.id === "labs-" + s)).filter(Boolean) as typeof LAB_TESTS;
  const packs = NEA_PACKAGES.filter((p) => p.group === group);

  return (
    <div style={{ color: T.ink, paddingBottom: 80 }}>
      {/* Hero */}
      <section style={{ ...wrap, paddingTop: "clamp(40px,7vw,96px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "clamp(28px,5vw,64px)", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ padding: "6px 12px", borderRadius: 999, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", background: T.ink, color: "#F7F5F1" }}>ANRA partner</span>
              <span style={{ padding: "6px 12px", borderRadius: 999, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", border: `1px solid ${T.nea}`, color: T.deep }}>Calgary NE</span>
            </div>
            <h1 style={{ margin: "18px 0 0", fontSize: "clamp(42px,6.4vw,84px)", lineHeight: .98, letterSpacing: "-.045em", fontWeight: 500 }}>Nea Precision<br /><span style={{ background: `linear-gradient(90deg, ${T.deep}, ${T.nea} 55%, #C9A27E)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Skin.</span></h1>
            <p style={{ margin: "20px 0 0", fontSize: "clamp(17px,1.6vw,20px)", lineHeight: 1.5, color: T.ink2, maxWidth: 540 }}>Where beautiful skin meets the power of your microbiome. A physician-managed clinic for medical aesthetics, Fotona laser and whole-body wellness — right next to ANRA in Calgary’s NE.</p>
            <div style={{ marginTop: 26, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Book />
              <Book label="Free 15-min consult" ghost href={NEA.consult} />
              <a href={NEA.tel} style={{ ...btnGhost, border: "none", color: T.deep }}><i className="ph ph-phone" />{NEA.phone}</a>
            </div>
          </div>
          <div style={{ ...card, padding: "clamp(22px,3vw,32px)", background: "linear-gradient(155deg,#FFFFFF 0%,#FBF3EF 55%,#F3ECE3 100%)", position: "relative", overflow: "hidden" }}>
            <div aria-hidden style={{ position: "absolute", right: -60, top: -60, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(185,120,106,.25), transparent 70%)" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, position: "relative" }}>
              {[[String(NEA_TREATMENTS.length), "treatments"], [String(NEA_PACKAGES.length), "beauty & wellness packages"], ["Fotona", "one of the first centres with every application"], ["RD-led", "nutrition built into care"]].map(([a, b]) => (
                <div key={b}><div style={{ fontSize: "clamp(30px,3.6vw,44px)", letterSpacing: "-.03em", fontWeight: 500 }}>{a}</div><div style={{ fontSize: 14, color: T.muted, lineHeight: 1.35 }}>{b}</div></div>
              ))}
            </div>
            <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${T.line}`, fontSize: 14, color: T.ink2, display: "grid", gap: 6 }}>
              <span style={{ display: "flex", gap: 8 }}><i className="ph ph-map-pin" style={{ color: T.nea }} />{NEA.address}</span>
              <span style={{ display: "flex", gap: 8 }}><i className="ph ph-clock" style={{ color: T.nea }} />{NEA.hours}</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI match */}
      <div style={{ ...wrap, marginTop: "clamp(40px,6vw,72px)" }}><SkinMatch open={setOpen} /></div>

      {/* Treatments */}
      <section id="treatments" style={{ ...wrap, marginTop: "clamp(48px,7vw,96px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "end" }}>
          <div><div style={eyebrow}>All treatments</div><h2 style={h2}>Every treatment, explained.</h2></div>
          <label style={{ position: "relative", flex: "0 1 320px" }}>
            <i className="ph ph-magnifying-glass" style={{ position: "absolute", left: 14, top: 15, color: T.muted }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search treatments" aria-label="Search treatments" style={{ width: "100%", height: 46, padding: "0 14px 0 40px", borderRadius: 14, border: `1px solid ${T.line}`, background: "#fff", fontSize: 15 }} />
          </label>
        </div>
        <div style={{ marginTop: 18, display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {(["All", ...NEA_CATS] as const).map((c) => <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} style={chip(cat === c)}>{c}{c !== "All" && <span style={{ opacity: .6, marginLeft: 6 }}>{NEA_TREATMENTS.filter((t) => t.cat === c).length}</span>}</button>)}
        </div>
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,270px),1fr))", gap: 14 }}>
          {list.map((t) => (
            <article key={t.id} id={t.id} className="nea-card" style={{ ...card, padding: 20, display: "grid", gridTemplateRows: "auto auto 1fr auto", gap: 10, cursor: "pointer" }} onClick={() => setOpen(t)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ width: 44, height: 44, borderRadius: 14, background: T.soft, color: T.deep, display: "grid", placeItems: "center" }}><i className={"ph " + t.icon} style={{ fontSize: 22 }} /></span>
                <span style={{ fontSize: 11.5, letterSpacing: ".1em", textTransform: "uppercase", color: T.muted }}>{t.cat}</span>
              </div>
              <h3 style={{ margin: 0, fontSize: 19, lineHeight: 1.2, letterSpacing: "-.015em", fontWeight: 500 }}>{t.name}</h3>
              <p style={{ margin: 0, fontSize: 14.5, color: T.ink2, lineHeight: 1.5 }}>{t.summary}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, paddingTop: 12, borderTop: `1px solid ${T.line2}` }}>
                <span style={{ fontSize: 12.5, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.facts[0] ? `${t.facts[0][0]}: ${t.facts[0][1]}` : ""}</span>
                <a href={NEA.book} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()} style={{ fontSize: 12.5, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600, color: T.deep, textDecoration: "none", whiteSpace: "nowrap" }}>Book →</a>
              </div>
            </article>
          ))}
          {!list.length && <p style={{ color: T.muted }}>No treatments match “{search}”. Try the Skin Match above.</p>}
        </div>
      </section>

      {/* Numbers */}
      <section style={{ ...wrap, marginTop: "clamp(48px,7vw,96px)" }}>
        <div style={eyebrow}>By the numbers</div>
        <h2 style={h2}>What to expect, in data.</h2>
        <p style={{ margin: "10px 0 0", color: T.muted, fontSize: 15 }}>Only figures Nea publishes. Your own results depend on your skin and plan.</p>
        <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,460px),1fr))", gap: 16 }}>
          <div style={{ ...card, padding: 24 }}><h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 500 }}>Downtime</h3><p style={{ margin: "0 0 18px", fontSize: 13.5, color: T.muted }}>Days before you’re back to normal</p><RangeBars rows={NEA_DOWNTIME} unit="days" max={6} color={`linear-gradient(90deg, ${T.nea}, #D4A08F)`} /></div>
          <div style={{ ...card, padding: 24 }}><h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 500 }}>Time in the chair</h3><p style={{ margin: "0 0 18px", fontSize: 13.5, color: T.muted }}>Minutes per session</p><RangeBars fromZero rows={NEA_SESSION_MIN} unit="min" max={50} color={`linear-gradient(90deg, ${T.teal}, #6EA8B6)`} /></div>
          <div style={{ ...card, padding: 24 }}><h3 style={{ margin: "0 0 18px", fontSize: 18, fontWeight: 500 }}>Published outcomes</h3><Rings /></div>
          <div style={{ ...card, padding: 24 }}><h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 500 }}>Anti-wrinkle neuromodulators</h3><p style={{ margin: "0 0 10px", fontSize: 13.5, color: T.muted }}>How results build and fade</p><NeuroTimeline /></div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" style={{ ...wrap, marginTop: "clamp(48px,7vw,96px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "end" }}>
          <div><div style={eyebrow}>Longevity packages</div><h2 style={h2}>Programs that work inside-out.</h2></div>
          <div style={{ display: "flex", gap: 8 }}>{(["Beauty", "Wellness"] as const).map((g) => <button key={g} onClick={() => setGroup(g)} aria-pressed={group === g} style={chip(group === g)}>{g} · {NEA_PACKAGES.filter((p) => p.group === g).length}</button>)}</div>
        </div>
        <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,330px),1fr))", gap: 14 }}>
          {packs.map((p) => {
            const total = p.tiers.reduce((a, t) => a + t.items.length, 0);
            return (
              <article key={p.id} style={{ ...card, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ width: 44, height: 44, borderRadius: 14, background: group === "Beauty" ? T.soft : "#E8F2F4", color: group === "Beauty" ? T.deep : T.teal, display: "grid", placeItems: "center" }}><i className={"ph " + p.icon} style={{ fontSize: 22 }} /></span>
                  <div><h3 style={{ margin: 0, fontSize: 20, fontWeight: 500, letterSpacing: "-.015em" }}>{p.name}</h3><span style={{ fontSize: 13, color: T.muted }}>{p.tiers.length > 1 ? `${p.tiers.length} options` : `${total} components`}</span></div>
                </div>
                {p.tiers.map((tier, i) => (
                  <div key={i} style={{ padding: tier.name ? "12px 14px" : 0, borderRadius: 14, background: tier.name ? T.paper : "transparent", border: tier.name ? `1px solid ${T.line2}` : "none" }}>
                    {tier.name && <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{tier.name}</div>}
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
                      {tier.items.map((it) => <li key={it} style={{ display: "flex", gap: 8, fontSize: 14, color: T.ink2, lineHeight: 1.4 }}><i className="ph ph-check" style={{ color: group === "Beauty" ? T.nea : T.teal, marginTop: 3 }} />{it}</li>)}
                    </ul>
                  </div>
                ))}
                <div style={{ marginTop: "auto", display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 6 }}>
                  <Book small label="Book consult" href={NEA.consult} />
                  <Book small ghost label="Book online" />
                </div>
              </article>
            );
          })}
        </div>
        <p style={{ margin: "16px 0 0", fontSize: 13.5, color: T.muted }}>Package pricing is shared at consultation. <a href={NEA.booklet} target="_blank" rel="noopener" style={{ color: T.deep }}>Download Nea’s package booklet (PDF)</a> · <a href={NEA.packagesPage} target="_blank" rel="noopener" style={{ color: T.deep }}>Packages on Nea’s site</a></p>
      </section>

      {/* Inside-out: microbiome tests */}
      <section style={{ ...wrap, marginTop: "clamp(48px,7vw,96px)" }}>
        <div style={{ ...card, padding: "clamp(22px,4vw,40px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: 24, alignItems: "center", background: "linear-gradient(160deg,#FFFFFF,#EEF5F6)" }}>
          <div>
            <div style={eyebrow}>The inside-out approach</div>
            <h2 style={{ ...h2, fontSize: "clamp(26px,3.2vw,38px)" }}>Your skin starts with your microbiome.</h2>
            <p style={{ margin: "12px 0 0", color: T.ink2, fontSize: 16 }}>Many Nea plans include microbiome testing with a dietitian consultation. These tests are run by BioAro Labs.</p>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {microTests.map((t) => (
              <a key={t.id} href={t.url("CA")} target="_blank" rel="noopener" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, background: "#fff", border: `1px solid ${T.line}`, color: T.ink, textDecoration: "none" }}>
                <span style={{ display: "flex", gap: 10, alignItems: "center" }}><span style={{ width: 8, height: 8, borderRadius: 4, background: "#6EA8B6" }} /><span><b style={{ fontWeight: 500 }}>{t.name}</b><br /><span style={{ fontSize: 13, color: T.muted }}>{t.why}</span></span></span>
                <span style={{ whiteSpace: "nowrap", fontWeight: 500 }}>{money(t.price)} <i className="ph ph-arrow-up-right" /></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Visit */}
      <section id="visit" style={{ ...wrap, marginTop: "clamp(48px,7vw,96px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: 16 }}>
          <div style={{ ...card, padding: "clamp(22px,3vw,32px)" }}>
            <div style={eyebrow}>Visit Nea</div>
            <h2 style={{ ...h2, fontSize: "clamp(26px,3vw,36px)" }}>{NEA.legal}</h2>
            <div style={{ marginTop: 18, display: "grid", gap: 10, fontSize: 15.5, color: T.ink2 }}>
              <span style={{ display: "flex", gap: 10 }}><i className="ph ph-map-pin" style={{ color: T.nea, marginTop: 3 }} />{NEA.address}</span>
              <a href={NEA.tel} style={{ display: "flex", gap: 10, color: T.ink2, textDecoration: "none" }}><i className="ph ph-phone" style={{ color: T.nea, marginTop: 3 }} />{NEA.phone}</a>
              <a href={"mailto:" + NEA.email} style={{ display: "flex", gap: 10, color: T.ink2, textDecoration: "none" }}><i className="ph ph-envelope-simple" style={{ color: T.nea, marginTop: 3 }} />{NEA.email}</a>
              <span style={{ display: "flex", gap: 10 }}><i className="ph ph-clock" style={{ color: T.nea, marginTop: 3 }} />{NEA.hours}</span>
              <span style={{ display: "flex", gap: 10 }}><i className="ph ph-user-circle" style={{ color: T.nea, marginTop: 3 }} />{NEA.founder}</span>
            </div>
            <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}><Book /><a href={NEA.site} target="_blank" rel="noopener" style={btnGhost}>neaprecisionskin.com<i className="ph ph-arrow-up-right" /></a></div>
          </div>
          <iframe title="Nea Precision Skin map" loading="lazy" src="https://www.google.com/maps?q=3151%2027%20St%20NE%2C%20Calgary%2C%20AB&output=embed" style={{ width: "100%", minHeight: 320, border: 0, borderRadius: 22 }} />
        </div>
        <p style={{ margin: "24px 0 0", fontSize: 13, color: T.muted, display: "flex", gap: 8 }}><i className="ph ph-info" />Treatments are provided and booked by Nea Precision Skin, a separate clinic partnered with ANRA Health. Information from neaprecisionskin.com; not medical advice. In an emergency call 911.</p>
      </section>

      {open && <Detail t={open} onClose={close} />}
    </div>
  );
}
