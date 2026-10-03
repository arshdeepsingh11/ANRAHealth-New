"use client";

// Neyu Studio — four AI tools for Nea: Skin Match (free text → AI picks),
// Skin Profile (live concern scoring + radar), Timeline Planner (book-by
// dates from Nea's published timings), and Ask Neyu (chat grounded in Nea's
// published information).
import React, { useEffect, useMemo, useRef, useState } from "react";
import AlbaOrb from "@/components/AlbaOrb";
import { NEA, NEA_TREATMENTS, NEA_AXES, NEA_META, NEA_REL, scoreNeaProfile, type NeaAxis, type NeaTreatment } from "@/data/nea";
import { T, card, btnInk, btnGhost, chip, aiText, Book, Icon, Thinking, TypeOut, Segmented, useTip } from "./ui";
import { Radar } from "./charts";

export type Tool = "match" | "profile" | "planner" | "ask";
export type Profile = Partial<Record<NeaAxis, number>>;
const byId = (id: string) => NEA_TREATMENTS.find((t) => t.id === id)!;

async function post<J>(url: string, body: unknown): Promise<J & { error?: string }> {
  try {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    return r.ok ? j : { ...j, error: j.error || "Something went wrong — please try again." };
  } catch { return { error: "We couldn’t reach Neyu. Check your connection and try again." } as J & { error: string }; }
}

function Alert({ children }: { children: React.ReactNode }) {
  return <p role="alert" style={{ margin: 0, padding: "14px 16px", borderRadius: 14, background: "#FBE7E1", color: "#8B2F1C", fontSize: 15, display: "flex", gap: 10 }}><i className="ph-fill ph-warning-circle" style={{ fontSize: 20, flex: "none" }} />{children}</p>;
}

// ── 1. Skin Match ────────────────────────────────────────────────────────
const QUICK = ["Acne and scarring", "Fine lines and sagging", "Thinning hair", "Snoring", "Dark spots / melasma", "Toning my body", "Redness on my cheeks"];
function SkinMatch({ open, toAsk }: { open: (t: NeaTreatment) => void; toAsk: (q: string) => void }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ intro?: string; picks: { id: string; why: string }[]; byAlba?: boolean; emergency?: string; error?: string } | null>(null);
  const ask = async (text: string) => {
    const t = text.trim();
    if (t.length < 3 || busy) return;
    setQ(t); setBusy(true); setRes(null);
    const j = await post<{ intro?: string; picks: { id: string; why: string }[]; byAlba?: boolean; emergency?: string }>("/api/nea/match", { concern: t });
    setRes({ ...j, picks: j.picks || [] }); setBusy(false);
  };
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <form onSubmit={(e) => { e.preventDefault(); ask(q); }} style={{ position: "relative", borderRadius: 20 }}>
        <anra-electro radius="20" style={{ position: "absolute", inset: -6, pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", background: "#fff", border: "1px solid #D6EEF6", borderRadius: 20, padding: 8 }}>
          <i className="ph ph-sparkle" style={{ fontSize: 20, color: T.ai, marginLeft: 10 }} />
          <label htmlFor="nea-q" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Describe your skin concern</label>
          <input id="nea-q" value={q} onChange={(e) => setQ(e.target.value)} maxLength={400} placeholder="Describe it in your own words — e.g. my cheeks look hollow and I have fine lines" style={{ flex: "1 1 260px", minWidth: 0, height: 48, border: 0, outline: "none", background: "transparent", fontSize: 16, color: T.ink }} />
          <button type="submit" disabled={busy || q.trim().length < 3} style={{ ...btnInk, height: 48, opacity: busy || q.trim().length < 3 ? 0.5 : 1 }}>{busy ? "Analysing" : "Match me"}<i className="ph ph-magic-wand" /></button>
        </div>
      </form>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{QUICK.map((x) => <button key={x} onClick={() => ask(x)} style={{ ...chip(false), minHeight: 34, fontSize: 13 }}>{x}</button>)}</div>
      {busy && (
        <div style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 18, alignItems: "center" }}>
          <div style={{ position: "relative", width: 88, height: 104, borderRadius: 44, border: `1.5px solid ${T.ai}`, overflow: "hidden", background: "radial-gradient(circle at 50% 40%, #F4EEF8, #fff)" }}>
            <i className="ph ph-smiley-blank" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 54, color: "#A9D8F0" }} />
            <span style={{ position: "absolute", left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${T.ai},transparent)`, boxShadow: `0 0 12px ${T.ai}`, animation: "scanLine 1.6s ease-in-out infinite" }} />
          </div>
          <Thinking label="Neyu is reading your concern and checking 24 Nea treatments" />
        </div>
      )}
      {res && (
        <div aria-live="polite" style={{ display: "grid", gap: 14, animation: "fadeUp .3s ease" }}>
          {res.emergency && <Alert>{res.emergency}</Alert>}
          {res.error && <Alert>{res.error}</Alert>}
          {res.intro && <p style={{ margin: 0, fontSize: 16, color: T.ink2 }}><TypeOut text={res.intro} />{res.byAlba && <span style={{ marginLeft: 8, fontSize: 12, color: T.violet }}>· Written by Neyu</span>}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,250px),1fr))", gap: 12 }}>
            {res.picks.map((p, i) => { const t = byId(p.id); return (
              <div key={p.id} style={{ ...card, padding: 18, display: "grid", gap: 10, animation: `fadeUp .4s ${i * 0.1}s both`, borderColor: i === 0 ? "#D9C8EE" : T.line, background: i === 0 ? "linear-gradient(160deg,#fff,#F7F2FB)" : "#fff" }}>
                <span style={{ fontSize: 11.5, letterSpacing: ".12em", textTransform: "uppercase", color: i === 0 ? T.violet : T.muted }}>{i === 0 ? "Best starting point" : "Also consider"}</span>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Icon name={t.icon} box={38} size={19} /><b style={{ fontWeight: 500, fontSize: 16.5 }}>{t.name}</b></div>
                <p style={{ margin: 0, fontSize: 14.5, color: T.ink2 }}>{p.why}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Book small /><button onClick={() => open(t)} style={{ ...btnGhost, height: 40, padding: "0 14px", fontSize: 12 }}>Details</button><button onClick={() => toAsk(`Tell me more about ${t.name} — how does it work and what should I expect?`)} style={{ ...btnGhost, height: 40, padding: "0 12px", fontSize: 12, border: 0, color: T.violet }}><i className="ph ph-chat-circle-dots" />Ask</button></div>
              </div>
            ); })}
          </div>
          {res.picks.length === 0 && !res.emergency && !res.error && <div><Book label="Book a free consultation" href={NEA.consult} /></div>}
        </div>
      )}
    </div>
  );
}

// ── 2. Skin Profile ──────────────────────────────────────────────────────
const LEVELS = ["None", "Mild", "Moderate", "Top priority"];
function SkinProfile({ profile, setProfile, maxDown, setMaxDown, open, toAsk, toPlan }: { profile: Profile; setProfile: (p: Profile) => void; maxDown: string; setMaxDown: (v: string) => void; open: (t: NeaTreatment) => void; toAsk: (q: string) => void; toPlan: (ids: string[]) => void }) {
  const any = Object.values(profile).some((v) => (v ?? 0) > 0);
  const ranked = useMemo(() => scoreNeaProfile(profile, maxDown === "any" ? undefined : Number(maxDown)), [profile, maxDown]);
  const top = ranked.filter((r) => !r.excluded).slice(0, 6);
  const hidden = ranked.filter((r) => r.excluded);
  const [sel, setSel] = useState<string | null>(null);
  const focus = sel ? byId(sel) : top[0]?.t;
  const tip = useTip();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,330px),1fr))", gap: 18, alignItems: "start" }}>
      <div style={{ display: "grid", gap: 14 }}>
        <p style={{ margin: 0, fontSize: 14.5, color: T.ink2 }}>Set how much each concern matters to you. Matches update live.</p>
        {NEA_AXES.map((a) => {
          const v = profile[a.id] ?? 0;
          return (
            <div key={a.id} style={{ display: "grid", gridTemplateColumns: "130px 1fr 92px", gap: 10, alignItems: "center" }}>
              <label htmlFor={"ax-" + a.id} style={{ fontSize: 14 }}>{a.label}</label>
              <input id={"ax-" + a.id} type="range" min={0} max={3} step={1} value={v} onChange={(e) => setProfile({ ...profile, [a.id]: Number(e.target.value) })} style={{ width: "100%", accentColor: T.deep }} aria-valuetext={LEVELS[v]} />
              <span style={{ fontSize: 12.5, color: v ? T.deep : T.faint, textAlign: "right" }}>{LEVELS[v]}</span>
            </div>
          );
        })}
        <div style={{ display: "grid", gap: 8, paddingTop: 6 }}>
          <span style={{ fontSize: 14 }}>Downtime you can take</span>
          <Segmented label="Downtime" value={maxDown} onChange={setMaxDown} options={[{ v: "0", label: "None" }, { v: "3", label: "Up to 3 days" }, { v: "any", label: "Any" }]} />
        </div>
        {any && <button onClick={() => { setProfile({}); setSel(null); }} style={{ ...btnGhost, height: 38, fontSize: 12, justifySelf: "start", border: 0, color: T.muted, padding: 0 }}><i className="ph ph-arrow-counter-clockwise" />Reset</button>}
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ ...card, padding: 16, background: "linear-gradient(160deg,#fff,#FBF5F2)" }}>
          <Radar a={profile} b={focus ? NEA_REL[focus.id] : undefined} labelA="Your priorities" labelB={focus?.name} />
        </div>
        {!any ? (
          <p style={{ margin: 0, fontSize: 14.5, color: T.muted, textAlign: "center" }}>Move a slider to see your matches.</p>
        ) : (
          <div data-tiphost style={{ position: "relative", display: "grid", gap: 8 }}>
            {top.map((r, i) => (
              <button key={r.t.id} onClick={() => setSel(r.t.id)} onMouseMove={(e) => tip.show(e, <>{r.t.name}: <b>{r.score}% fit</b> with your priorities</>)} onMouseLeave={tip.hide}
                style={{ display: "grid", gridTemplateColumns: "28px 1fr 46px", gap: 10, alignItems: "center", padding: "9px 10px", borderRadius: 12, border: `1px solid ${focus?.id === r.t.id ? "#D9C8EE" : T.line2}`, background: focus?.id === r.t.id ? "#F7F2FB" : "#fff", cursor: "pointer", textAlign: "left", animation: `fadeUp .3s ${i * 0.04}s both` }}>
                <i className={"ph " + r.t.icon} style={{ fontSize: 19, color: T.deep }} />
                <span style={{ display: "grid", gap: 5 }}><span style={{ fontSize: 14.5 }}>{r.t.name}</span><span style={{ height: 5, borderRadius: 3, background: T.line2 }}><span style={{ display: "block", height: "100%", width: r.score + "%", borderRadius: 3, background: "linear-gradient(90deg,#B4583F,#C2477E)", transition: "width .5s" }} /></span></span>
                <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 14, textAlign: "right" }}>{r.score}%</span>
              </button>
            ))}
            {tip.node}
            {hidden.length > 0 && <p style={{ margin: 0, fontSize: 12.5, color: T.muted }}>{hidden.length} hidden for downtime: {hidden.map((h) => h.t.name).join(", ")}.</p>}
            {focus && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                <Book small />
                <button onClick={() => open(focus)} style={{ ...btnGhost, height: 40, padding: "0 14px", fontSize: 12 }}>Details</button>
                <button onClick={() => toPlan(top.slice(0, 3).map((x) => x.t.id))} style={{ ...btnGhost, height: 40, padding: "0 14px", fontSize: 12 }}><i className="ph ph-calendar-plus" />Plan these</button>
                <button onClick={() => toAsk(`My priorities are ${NEA_AXES.filter((a) => (profile[a.id] ?? 0) > 0).map((a) => `${a.label} (${LEVELS[profile[a.id] ?? 0]})`).join(", ")}. Why might ${focus.name} fit, and what else should I ask Nea?`)} style={{ ...btnGhost, height: 40, padding: "0 12px", fontSize: 12, border: 0, color: T.violet }}><i className="ph ph-sparkle" />Ask Neyu why</button>
              </div>
            )}
            <p style={{ margin: 0, fontSize: 12, color: T.faint }}>Fit is how closely each treatment’s published focus matches your priorities — a guide for your consultation, not a diagnosis.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 3. Timeline Planner ──────────────────────────────────────────────────
const DAY = 86_400_000;
const fmtDate = (d: Date) => d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
export function planFor(id: string) {
  const m = NEA_META[id] || {};
  const course = m.courseWeeks ? m.courseWeeks * 7 : 0;
  const down = m.downtime ? m.downtime[1] : 0;
  const onset = m.onsetDays ?? 0;
  const known = !!(m.courseWeeks || m.downtime || m.onsetDays != null);
  return { course, down, onset, known, buffer: 7, total: course + down + onset + 7 };
}
function Planner({ picked, setPicked, open }: { picked: string[]; setPicked: (ids: string[]) => void; open: (t: NeaTreatment) => void }) {
  const [date, setDate] = useState("");
  useEffect(() => { if (!date) setDate(new Date(Date.now() + 56 * DAY).toISOString().slice(0, 10)); }, [date]);
  const event = date ? new Date(date + "T12:00:00") : null;
  const today = new Date(new Date().toDateString());
  const rows = picked.map((id) => ({ t: byId(id), p: planFor(id) }));
  const span = Math.max(21, ...rows.map((r) => r.p.total + 7));
  const x = (daysBefore: number) => `${(1 - daysBefore / span) * 100}%`;
  const tip = useTip();
  const toggle = (id: string) => setPicked(picked.includes(id) ? picked.filter((p) => p !== id) : picked.length >= 5 ? picked : [...picked, id]);
  const segs = [{ k: "course", c: "#2A78D6", l: "Treatment course" }, { k: "down", c: "#B4583F", l: "Downtime" }, { k: "onset", c: "#1BAF7A", l: "Results build" }, { k: "buffer", c: "#C9C3B8", l: "Safety buffer" }] as const;
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "end" }}>
        <label style={{ display: "grid", gap: 6, fontSize: 14 }}>Your event date
          <input type="date" value={date} min={today.toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} style={{ height: 46, padding: "0 12px", borderRadius: 12, border: `1px solid ${T.line}`, fontSize: 15, background: "#fff" }} />
        </label>
        <p style={{ margin: 0, fontSize: 13.5, color: T.muted, maxWidth: 440 }}>A wedding, a trip, a photo shoot — Neyu works backwards from Nea’s published timings to tell you when to book.</p>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {NEA_TREATMENTS.filter((t) => NEA_META[t.id]).map((t) => <button key={t.id} onClick={() => toggle(t.id)} aria-pressed={picked.includes(t.id)} style={{ ...chip(picked.includes(t.id)), minHeight: 34, fontSize: 13 }}>{picked.includes(t.id) ? <i className="ph ph-check" /> : <i className="ph ph-plus" />}{t.name}</button>)}
      </div>
      {rows.length === 0 ? <p style={{ margin: 0, color: T.muted }}>Pick up to 5 treatments to build your timeline.</p> : event && (
        <div data-tiphost style={{ ...card, padding: "18px 18px 12px", position: "relative" }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12.5, color: T.muted, marginBottom: 14 }}>
            {segs.map((s) => <span key={s.k} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: s.c }} />{s.l}</span>)}
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {rows.map(({ t, p }) => {
              const start = new Date(event.getTime() - p.total * DAY);
              const late = start < today;
              let cursor = p.total;
              return (
                <div key={t.id} className="nea-gantt">
                  <button onClick={() => open(t)} style={{ border: 0, background: "none", padding: 0, textAlign: "left", cursor: "pointer", display: "grid", gap: 2 }}>
                    <span style={{ fontSize: 14, color: T.ink }}>{t.name}</span>
                    <span style={{ fontSize: 12, color: late ? "#8B2F1C" : T.good }}>{late ? "Tight — book now" : `Book by ${fmtDate(start)}`}</span>
                  </button>
                  <div style={{ position: "relative", height: 22, borderRadius: 6, background: T.line2 }}>
                    {segs.map((s) => {
                      const len = p[s.k]; if (!len) return null;
                      const from = cursor; cursor -= len;
                      return <span key={s.k} onMouseMove={(e) => tip.show(e, <><b>{t.name}</b><br />{s.l}: {len} days</>)} onMouseLeave={tip.hide} style={{ position: "absolute", left: x(from), right: `calc(100% - ${x(cursor)})`, top: 3, bottom: 3, borderRadius: 4, background: s.c, border: "1px solid #fff" }} />;
                    })}
                    {!p.known && <span style={{ position: "absolute", left: 8, top: 3, fontSize: 11.5, color: T.muted }}>Timing set at consult</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="nea-gantt" style={{ marginTop: 8 }}>
            <span className="nea-gantt-sp" />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: T.faint }}><span>{fmtDate(new Date(event.getTime() - span * DAY))}</span><span>{Math.round(span / 2)} days before</span><span style={{ color: T.ink, fontWeight: 600 }}>Event · {fmtDate(event)}</span></div>
          </div>
          {tip.node}
        </div>
      )}
      {rows.length > 0 && event && (() => {
        const first = new Date(event.getTime() - Math.max(...rows.map((r) => r.p.total)) * DAY);
        const consult = new Date(first.getTime() - 7 * DAY);
        const days = Math.round((consult.getTime() - today.getTime()) / DAY);
        return (
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 16, background: days < 0 ? "#FBE7E1" : "#EAF4EE" }}>
            <span style={{ fontSize: 15 }}><i className="ph ph-calendar-check" style={{ marginRight: 8 }} />{days < 0 ? "Your date is close — book the free consult today so Nea can adjust the plan." : <>Book your free consult by <b style={{ fontWeight: 600 }}>{fmtDate(consult)}</b> — {days} days from now.</>}</span>
            <Book small label="Book consult" href={NEA.consult} />
          </div>
        );
      })()}
      <p style={{ margin: 0, fontSize: 12, color: T.faint }}>Estimate from Nea’s published timings (downtime, course length, time to full effect) plus a 7-day buffer. Nea confirms your actual schedule.</p>
    </div>
  );
}

// ── 4. Ask Neyu ──────────────────────────────────────────────────────────
type Msg = { role: "user" | "alba"; text: string; cites?: string[]; emergency?: boolean; byAlba?: boolean };
const SUGGEST = ["Is there downtime with Fotona 4D?", "What helps with acne scars?", "How long do neuromodulators last?", "What’s in the Get Your Glow package?", "Do you treat snoring?", "How much does it cost?"];
function AskAlba({ seed, clearSeed, open }: { seed: string; clearSeed: () => void; open: (t: NeaTreatment) => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const send = async (text: string) => {
    const t = text.trim(); if (t.length < 2 || busy) return;
    const hist = msgs.filter((m) => !m.emergency).map((m) => ({ role: m.role, text: m.text }));
    setMsgs((m) => [...m, { role: "user", text: t }]); setQ(""); setBusy(true);
    const j = await post<{ answer?: string; cites?: string[]; emergency?: string; byAlba?: boolean }>("/api/nea/ask", { question: t, history: hist });
    setMsgs((m) => [...m, j.emergency ? { role: "alba", text: j.emergency, emergency: true } : { role: "alba", text: j.error || j.answer || "", cites: j.cites, byAlba: j.byAlba }]);
    setBusy(false);
  };
  useEffect(() => { if (seed) { send(seed); clearSeed(); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [seed]);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [msgs, busy]);
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ ...card, padding: 16, minHeight: 280, maxHeight: 460, overflowY: "auto", display: "grid", alignContent: "start", gap: 12, background: "linear-gradient(180deg,#fff,#FBF9FD)" }}>
        {msgs.length === 0 && (
          <div style={{ display: "grid", justifyItems: "center", gap: 10, textAlign: "center", padding: "26px 10px" }}>
            <AlbaOrb size={44} glow />
            <p style={{ margin: 0, fontSize: 16 }}>Ask anything about Nea’s treatments, packages or visits.</p>
            <p style={{ margin: 0, fontSize: 13, color: T.muted }}>Answers use only Nea’s published information.</p>
          </div>
        )}
        {msgs.map((m, i) => m.role === "user" ? (
          <div key={i} style={{ justifySelf: "end", maxWidth: "82%", padding: "10px 14px", borderRadius: "16px 16px 4px 16px", background: T.ink, color: "#F7F5F1", fontSize: 15 }}>{m.text}</div>
        ) : m.emergency ? <Alert key={i}>{m.text}</Alert> : (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 10, maxWidth: "92%" }}>
            <AlbaOrb size={26} motion={i === msgs.length - 1} />
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ padding: "10px 14px", borderRadius: "4px 16px 16px 16px", background: "#fff", border: "1px solid #E9E1F3", fontSize: 15, lineHeight: 1.55, whiteSpace: "pre-wrap", color: T.ink2 }}>{i === msgs.length - 1 ? <TypeOut text={m.text} speed={14} /> : m.text}</div>
              {!!m.cites?.length && <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{m.cites.map((id) => { const t = byId(id); return <button key={id} onClick={() => open(t)} style={{ ...chip(false), minHeight: 30, fontSize: 12.5, borderColor: "#E0D3EF", color: T.violet }}><i className={"ph " + t.icon} />{t.name}</button>; })}<Book small label="Book" /></div>}
              <span style={{ fontSize: 11.5, color: T.faint }}>{m.byAlba ? "Neyu · from Nea’s published info" : "From Nea’s published info"}</span>
            </div>
          </div>
        ))}
        {busy && <div style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 10 }}><AlbaOrb size={26} /><Thinking label="Neyu is checking Nea’s information" /></div>}
        <div ref={end} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{SUGGEST.map((s) => <button key={s} onClick={() => send(s)} style={{ ...chip(false), minHeight: 34, fontSize: 13 }}>{s}</button>)}</div>
      <form onSubmit={(e) => { e.preventDefault(); send(q); }} style={{ display: "flex", gap: 8 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} maxLength={500} aria-label="Ask Neyu about Nea" placeholder="Ask Neyu…" style={{ flex: 1, minWidth: 0, height: 50, padding: "0 16px", borderRadius: 16, border: "1px solid #D6EEF6", fontSize: 16, background: "#fff" }} />
        <button type="submit" disabled={busy || q.trim().length < 2} aria-label="Send" style={{ ...btnInk, width: 50, padding: 0, height: 50, opacity: busy || q.trim().length < 2 ? 0.5 : 1 }}><i className="ph ph-paper-plane-tilt" style={{ fontSize: 18 }} /></button>
      </form>
      <p style={{ margin: 0, fontSize: 12, color: T.faint }}>Not medical advice. In an emergency call 911.</p>
    </div>
  );
}

// ── Studio shell ─────────────────────────────────────────────────────────
const TOOLS: { v: Tool; label: string; icon: string; sub: string }[] = [
  { v: "match", label: "Skin Match", icon: "ph-magic-wand", sub: "Describe it — Neyu picks" },
  { v: "profile", label: "Skin Profile", icon: "ph-chart-polar", sub: "Live fit scores + radar" },
  { v: "planner", label: "Timeline Planner", icon: "ph-calendar-dots", sub: "Book-by dates for an event" },
  { v: "ask", label: "Ask Neyu", icon: "ph-chat-circle-dots", sub: "Questions, answered" },
];
export default function Studio({ tool, setTool, seed, setSeed, open, profile, setProfile, picked, setPicked }: { tool: Tool; setTool: (t: Tool) => void; seed: string; setSeed: (s: string) => void; open: (t: NeaTreatment) => void; profile: Profile; setProfile: (p: Profile) => void; picked: string[]; setPicked: (ids: string[]) => void }) {
  const [maxDown, setMaxDown] = useState("any");
  const toAsk = (q: string) => { setSeed(q); setTool("ask"); };
  const toPlan = (ids: string[]) => { const withMeta = ids.filter((id) => NEA_META[id]); setPicked(withMeta.length ? withMeta : picked); setTool("planner"); };
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <AlbaOrb size={52} glow />
        <div>
          <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: T.violet }}>Neyu Studio · for Nea</div>
          <h2 style={{ margin: "4px 0 0", fontSize: "clamp(28px,3.6vw,44px)", lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 500 }}>Your skin, <span style={aiText}>understood by AI.</span></h2>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 10 }}>
        {TOOLS.map((o) => {
          const on = tool === o.v;
          return (
            <button key={o.v} onClick={() => setTool(o.v)} aria-pressed={on} style={{ position: "relative", textAlign: "left", cursor: "pointer", padding: "14px 16px", borderRadius: 18, border: `1px solid ${on ? "#CDB9EA" : T.line}`, background: on ? "linear-gradient(150deg,#FFFFFF,#F4EEFB 70%,#FBEFEA)" : "#fff", boxShadow: on ? "0 18px 40px -26px rgba(42,132,228,.8)" : "none", display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "center", transition: "all .25s" }}>
              {on && <anra-electro radius="18" style={{ position: "absolute", inset: -5, pointerEvents: "none" }} />}
              <Icon name={o.icon} bg={on ? T.ink : "#F4EEFB"} color={on ? "#fff" : T.violet} box={40} size={20} />
              <span><b style={{ display: "block", fontWeight: 500, fontSize: 15 }}>{o.label}</b><span style={{ fontSize: 12.5, color: T.muted }}>{o.sub}</span></span>
            </button>
          );
        })}
      </div>
      <div key={tool} style={{ ...card, padding: "clamp(18px,3vw,30px)", animation: "fadeUp .3s ease" }}>
        {tool === "match" && <SkinMatch open={open} toAsk={toAsk} />}
        {tool === "profile" && <SkinProfile profile={profile} setProfile={setProfile} maxDown={maxDown} setMaxDown={setMaxDown} open={open} toAsk={toAsk} toPlan={toPlan} />}
        {tool === "planner" && <Planner picked={picked} setPicked={setPicked} open={open} />}
        {tool === "ask" && <AskAlba seed={seed} clearSeed={() => setSeed("")} open={open} />}
      </div>
    </div>
  );
}
