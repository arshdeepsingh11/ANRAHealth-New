"use client";

// Neyu Health Intelligence UI — Health Story (longitudinal, month by month,
// with "this month at a glance"), proactive "Neyu noticed" insights and the
// weekly check-in. Calm, evidence-first: every insight can show its evidence.

import React, { useState } from "react";
import { usePortal } from "../context";
import { api, invalidate, load, useResource } from "../api";
import { C, screenAnim, Loading, btnPrimary, btnLink, cardBox } from "../ui";
import { NIcon } from "@/components/neyu/icons";
import { StatusChip, SourceTag, SecHead, AiTag } from "../space-ui";
import { Why, useOpen, type Evidence } from "./Space";

const EP_STORY = "/api/portal/health-story", EP_INS = "/api/portal/insights", EP_CHECK = "/api/portal/checkin";

type Note = { key: string; status: string; area: string; title: string; text: string; go?: string; source?: string; confidence: string; basis: string; evidence: Evidence[] };
type Ev = { id: string; type: string; date: string; title: string; summary?: string; source?: string; go?: string; icon: string };
type StoryDTO = {
  months: { month: string; label: string; events: Ev[]; notes: Note[] }[];
  glance: { month: string; changed: Note[]; wentWell: Note[]; newInfo: Ev[]; noticing: Note[]; data: string; next: { text: string; label: string; go: string } };
  totalEvents: number;
};

function GlanceRow({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "34px minmax(0,1fr)", gap: 12, padding: "14px 0", borderTop: `1px solid ${C.line}` }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, background: C.tealWash, display: "flex", alignItems: "center", justifyContent: "center" }}><NIcon name={icon} size={17} tone={C.teal} /></span>
      <div style={{ minWidth: 0 }}><h3 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 500, color: C.muted, letterSpacing: ".02em" }}>{title}</h3>{children}</div>
    </div>
  );
}
const NoteText = ({ n }: { n: Note }) => (<div style={{ marginBottom: 6 }}><p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{n.text}</p><Why basis={n.basis} confidence={n.confidence} evidence={n.evidence} /></div>);

export function HealthStory() {
  const open = useOpen();
  const { openSheet } = usePortal();
  const { data: s, error, reload } = useResource<StoryDTO>(EP_STORY);
  if (!s) return <Loading error={error} retry={reload} />;
  const g = s.glance;
  return (
    <div style={screenAnim}>
      <span style={{ fontSize: 13, letterSpacing: ".12em", color: C.teal, fontWeight: 500 }}>YOUR HEALTH STORY</span>
      <h1 style={{ margin: "8px 0 6px", fontSize: 32, lineHeight: 1.1, fontWeight: 500, letterSpacing: "-.025em" }}>Your health, as one story.</h1>
      <p style={{ margin: "0 0 26px", fontSize: 16, lineHeight: 1.55, color: C.ink2, maxWidth: 640 }}>Every result, report, reading and check-in, in order — and what Neyu noticed along the way. Neyu describes what the data shows; it doesn't decide what caused it.</p>

      <section aria-label={`${g.month} at a glance`} style={{ ...cardBox, padding: "20px 22px 8px", marginBottom: 34, maxWidth: 820 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}><h2 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>{g.month} at a glance</h2><AiTag label="Neyu · from your data" /></div>
        <GlanceRow icon="trend" title="What changed">{g.changed.length ? g.changed.map((n) => <NoteText key={n.key} n={n} />) : <p style={{ margin: 0, fontSize: 15, color: C.muted }}>No meaningful changes compared with last month.</p>}</GlanceRow>
        {g.wentWell.length > 0 && <GlanceRow icon="arrowUp" title="What went well">{g.wentWell.map((n) => <NoteText key={n.key} n={n} />)}</GlanceRow>}
        <GlanceRow icon="sparkle" title="New information">{g.newInfo.length ? g.newInfo.map((e) => <button key={e.id} onClick={() => open(e.go)} style={{ display: "block", padding: "2px 0", border: "none", background: "none", fontSize: 15, color: C.ink, cursor: "pointer", textAlign: "left" }}>{e.title} <span style={{ color: C.faint, fontSize: 13 }}>· {e.date}</span></button>) : <p style={{ margin: 0, fontSize: 15, color: C.muted }}>Nothing new was added this month.</p>}</GlanceRow>
        {g.noticing.length > 0 && <GlanceRow icon="eye" title="Worth noticing">{g.noticing.map((n) => <NoteText key={n.key} n={n} />)}</GlanceRow>}
        <GlanceRow icon="layers" title="Your data"><p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{g.data}</p></GlanceRow>
        <GlanceRow icon="arrow" title="Next step"><p style={{ margin: "0 0 4px", fontSize: 15 }}>{g.next.text}</p><button onClick={() => open(g.next.go)} style={{ ...btnLink, height: 32 }}>{g.next.label}<NIcon name="arrow" size={14} tone="currentColor" /></button></GlanceRow>
      </section>

      <SecHead title="Timeline" sub={`${s.totalEvents} events from your Health Space, newest first`} right={<button onClick={() => openSheet({ t: "alba", ask: "How has my health changed this year?" })} style={{ ...btnLink, color: C.lavInk }}><NIcon name="sparkle" size={14} tone="currentColor" />Ask Neyu about my story</button>} />
      {!s.months.length && <p style={{ fontSize: 15, color: C.muted }}>Your story begins when information arrives — add a report, connect a device or log a meal.</p>}
      <ol style={{ listStyle: "none", margin: 0, padding: 0, maxWidth: 820 }}>
        {s.months.map((m, mi) => (
          <li key={m.month} style={{ display: "grid", gridTemplateColumns: "clamp(72px,14vw,120px) 18px minmax(0,1fr)", gap: "0 14px", animation: `mhs-fadeUp 420ms ease ${Math.min(mi, 6) * 60}ms both` }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: C.ink2, paddingTop: 2 }}>{m.label.split(" ")[0]}<span style={{ display: "block", fontSize: 12, color: C.faint, fontWeight: 400 }}>{m.label.split(" ")[1]}</span></span>
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><span style={{ width: 11, height: 11, borderRadius: 6, marginTop: 5, background: mi === 0 ? C.teal : C.card, border: `2px solid ${C.tealLight}`, flex: "none" }} /><span style={{ flex: 1, width: 1.5, background: "rgba(110,168,182,.35)", marginTop: 4 }} /></span>
            <div style={{ paddingBottom: 26, minWidth: 0 }}>
              {m.notes.map((n) => (
                <div key={n.key} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", marginBottom: 8, borderRadius: 14, background: C.lav }}>
                  <StatusChip s={n.status} small />
                  <div style={{ minWidth: 0 }}><p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5 }}>{n.text}</p><Why basis={n.basis} confidence={n.confidence} evidence={n.evidence} tone={C.lavInk} /></div>
                </div>
              ))}
              {m.events.map((e) => (
                <button key={e.id} onClick={() => open(e.go)} disabled={!e.go} style={{ width: "100%", display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 4px", border: "none", borderBottom: `1px solid ${C.line}`, background: "none", cursor: e.go ? "pointer" : "default", textAlign: "left" }}>
                  <NIcon name={e.icon} size={17} tone={C.teal} style={{ marginTop: 2, flex: "none" }} />
                  <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 15 }}>{e.title} <span style={{ fontSize: 12.5, color: C.faint }}>· {new Date(e.date + "T12:00:00Z").toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "UTC" })}</span></span>
                    {e.summary && <span style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.45 }}>{e.summary}</span>}
                    {e.source && <SourceTag>{e.source}</SourceTag>}
                  </span>
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Proactive "Neyu noticed" ───────────────────────────────────────────────
type Insight = { id: string; status: string; area: string; title: string; text: string; confidence: string; go: string | null; evidence: Evidence[]; seen: boolean };

export function NeyuNoticed() {
  const open = useOpen();
  const { data, reload } = useResource<{ insights: Insight[] }>(EP_INS);
  const [hidden, setHidden] = useState<string[]>([]);
  const list = (data?.insights || []).filter((i) => !hidden.includes(i.id));
  if (!list.length) return null;
  const dismiss = async (id: string) => { setHidden((h) => [...h, id]); await api(`${EP_INS}/${id}`, { method: "PATCH", body: { action: "dismiss" } }).catch(() => {}); reload(); };
  return (
    <section aria-label="Neyu noticed" style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><NIcon name="sparkle" size={16} tone={C.lavMid} /><h2 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>Neyu noticed</h2></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 10 }}>
        {list.map((i, k) => (
          <article key={i.id} style={{ position: "relative", padding: "16px 16px 10px", borderRadius: 18, background: C.card, border: `1px solid ${C.line}`, animation: `mhs-fadeUp 400ms ease ${k * 80}ms both` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><StatusChip s={i.status} small /><span style={{ fontSize: 12.5, color: C.muted }}>{i.area}</span>
              <button aria-label="Dismiss" onClick={() => dismiss(i.id)} style={{ marginLeft: "auto", width: 30, height: 30, border: "none", background: "none", cursor: "pointer", color: C.faint }}><NIcon name="x" size={14} tone="currentColor" /></button></div>
            <p style={{ margin: "0 0 4px", fontSize: 15, lineHeight: 1.5 }}>{i.text}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <Why evidence={i.evidence} confidence={i.confidence} />
              {i.go && <button onClick={() => open(i.go!)} style={{ ...btnLink, height: 28, fontSize: 13 }}>Open<NIcon name="arrow" size={13} tone="currentColor" /></button>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ── Weekly check-in (optional, skippable) ──────────────────────────────────
const FACES: [number, string, string][] = [[5, "faceWink", "Great"], [4, "faceSmile", "Good"], [3, "faceMeh", "Okay"], [2, "faceSad", "Not great"], [1, "faceSad", "Poor"]];
const MORE: [string, string, [string, string]][] = [["energy", "Energy", ["Low", "High"]], ["sleep", "Sleep", ["Poor", "Great"]], ["stress", "Stress", ["Calm", "Very stressed"]], ["activity", "Activity", ["Little", "A lot"]], ["pain", "Pain", ["None", "A lot"]]];

export function WeeklyCheckIn() {
  const { toast } = usePortal();
  const { data } = useResource<{ due: boolean }>(EP_CHECK);
  const [feeling, setFeeling] = useState<number | null>(null);
  const [vals, setVals] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false), [busy, setBusy] = useState(false);
  if (!data?.due || done) return null;
  const send = async (skip = false) => {
    setBusy(true);
    try { await api(EP_CHECK, { body: skip ? { skip: true } : { feeling, ...vals } }); setDone(true); invalidate(EP_CHECK, EP_STORY); load(EP_CHECK, true).catch(() => {}); if (!skip) toast("Thanks — Neyu will learn from this"); }
    catch (e: any) { toast(e.message); } finally { setBusy(false); }
  };
  return (
    <section aria-label="Weekly check-in" style={{ marginBottom: 28, padding: "18px 20px", borderRadius: 20, background: "linear-gradient(160deg,#F3EEF8,#FFFDFB 70%)", border: `1px solid ${C.line}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>How have you been feeling this week?</h2>
        <button onClick={() => send(true)} disabled={busy} style={{ ...btnLink, height: 30, color: C.muted, fontWeight: 400 }}>Skip</button>
      </div>
      <div role="radiogroup" aria-label="How you've been feeling" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FACES.map(([v, ic, l]) => (
          <button key={v} role="radio" aria-checked={feeling === v} onClick={() => setFeeling(v)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, width: 74, padding: "10px 4px", borderRadius: 14, border: `1px solid ${feeling === v ? "transparent" : C.line12}`, background: feeling === v ? C.ink : C.card, color: feeling === v ? "#fff" : C.ink2, cursor: "pointer", transition: "all .2s" }}>
            <NIcon name={ic} size={24} tone="currentColor" /><span style={{ fontSize: 12.5 }}>{l}</span>
          </button>
        ))}
      </div>
      {feeling != null && (
        <div style={{ marginTop: 16, animation: "mhs-fadeUp 280ms ease" }}>
          <p style={{ margin: "0 0 10px", fontSize: 13.5, color: C.muted }}>Optional — tap any that apply</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,250px),1fr))", gap: "10px 22px" }}>
            {MORE.map(([k, l, [lo, hi]]) => (
              <div key={k}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 5 }}><span>{l}</span><span style={{ color: C.faint, fontSize: 12 }}>{lo} – {hi}</span></div>
                <div role="radiogroup" aria-label={l} style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((n) => <button key={n} role="radio" aria-checked={vals[k] === n} aria-label={`${l} ${n}`} onClick={() => setVals({ ...vals, [k]: n })} style={{ flex: 1, height: 30, borderRadius: 8, border: "none", background: vals[k] && n <= vals[k] ? C.tealLight : "#ECE9E4", cursor: "pointer" }} />)}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => send()} disabled={busy} className="h-primary" style={{ ...btnPrimary, marginTop: 16 }}>{busy ? "Saving…" : "Save check-in"}</button>
        </div>
      )}
    </section>
  );
}
