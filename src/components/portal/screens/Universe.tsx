"use client";

// Health Universe screens: Heart (home BP), Lifestyle, Family & sharing,
// Care view (a person I care for), Rewards & challenges, Monthly story.

import React, { useState } from "react";
import type { HeartDTO, LifestyleDTO, FamilyDTO, CareSummaryDTO, ShareLinkDTO, RewardsDTO, ChallengeDTO, StoryDTO, SettingsDTO } from "@/lib/portal/types";
import { MOOD_LABELS, STRESS_LABELS } from "@/lib/portal/universe";
import { usePortal } from "../context";
import { EP, api, prime, invalidate, load, useResource } from "../api";
import { C, H1, screenAnim, Loading, EmptyCard, btnPrimary, btnSecondary, btnOutline, btnLink, longDateTz } from "../ui";

const card: React.CSSProperties = { padding: "20px 22px", borderRadius: 20, background: C.card, border: `1px solid ${C.line}` };
const h2: React.CSSProperties = { margin: "0 0 4px", fontSize: 18, fontWeight: 500 };
const sub: React.CSSProperties = { margin: 0, fontSize: 14, lineHeight: 1.5, color: C.muted };
const grid = (min = 320): React.CSSProperties => ({ display: "grid", gridTemplateColumns: `repeat(auto-fit,minmax(min(100%,${min}px),1fr))`, gap: 20, alignItems: "start" });
const TONE: Record<string, { bg: string; ink: string }> = {
  none: { bg: "#EFECE8", ink: C.ink3 }, normal: { bg: C.tealWash, ink: C.tealDark }, elevated: { bg: "#FFF4E0", ink: "#8A5A12" },
  high: { bg: C.peach, ink: C.peachInk }, urgent: { bg: "#F9DED6", ink: "#8B2F1C" },
};
export const Emergency = () => (
  <p style={{ margin: "32px 0 0", fontSize: 13, lineHeight: 1.5, color: C.muted, display: "flex", gap: 8 }}><i className="ph ph-first-aid" style={{ fontSize: 16, color: C.peachInk, marginTop: 1 }} /><span>Wellness information, not a diagnosis. If you think you may be having a medical emergency, call 911.</span></p>
);

// ── Heart ───────────────────────────────────────────────────────────────
function BpChart({ daily }: { daily: HeartDTO["daily"] }) {
  const pts = daily.slice(-30);
  if (pts.length < 2) return <p style={sub}>Your chart appears after two days of readings.</p>;
  const lo = Math.min(60, ...pts.map((p) => p.dia)) - 5, hi = Math.max(150, ...pts.map((p) => p.sys)) + 5;
  const W = 100, H = 60, x = (i: number) => (i / (pts.length - 1)) * W, y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
  const line = (k: "sys" | "dia") => pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(2)} ${y(p[k]).toFixed(2)}`).join(" ");
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Daily average blood pressure, last 30 days" style={{ width: "100%", height: 170, overflow: "visible" }}>
        <line x1="0" x2={W} y1={y(135)} y2={y(135)} stroke={C.peachInk} strokeOpacity=".35" strokeDasharray="1.5 1.5" strokeWidth=".4" vectorEffect="non-scaling-stroke" />
        <line x1="0" x2={W} y1={y(85)} y2={y(85)} stroke={C.peachInk} strokeOpacity=".35" strokeDasharray="1.5 1.5" strokeWidth=".4" vectorEffect="non-scaling-stroke" />
        <path d={line("sys")} fill="none" stroke={C.teal} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        <path d={line("dia")} fill="none" stroke={C.lavMid} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      </svg>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12.5, color: C.muted, marginTop: 8 }}>
        <span style={{ display: "flex", gap: 6, alignItems: "center" }}><span style={{ width: 14, height: 3, borderRadius: 2, background: C.teal }} />Top (systolic)</span>
        <span style={{ display: "flex", gap: 6, alignItems: "center" }}><span style={{ width: 14, height: 3, borderRadius: 2, background: C.lavMid }} />Bottom (diastolic)</span>
        <span style={{ display: "flex", gap: 6, alignItems: "center" }}><span style={{ width: 14, borderTop: `2px dashed ${C.peachInk}`, opacity: 0.5 }} />Home target 135/85</span>
      </div>
    </div>
  );
}

export function Heart() {
  const { go, openSheet, toast, tz } = usePortal();
  const { data: h, error, reload } = useResource<HeartDTO>(EP.heart);
  const [showHow, setShowHow] = useState(false);
  if (!h) return <Loading error={error} retry={reload} />;
  const tone = TONE[h.status.level];
  const del = async (id: string) => {
    try { prime(EP.heart, await api<HeartDTO>(`${EP.heart}?id=${id}`, { method: "DELETE" })); invalidate(EP.brief, EP.today); toast("Reading removed"); } catch (e: any) { toast(e.message); }
  };
  return (
    <div style={{ ...screenAnim, maxWidth: 980 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
        <div><H1 sub="Home blood pressure and your heart signals, in one place." mb={0}>Heart</H1></div>
        <button onClick={() => openSheet({ t: "bp" })} className="h-primary" style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: 8 }}><i className="ph ph-plus" />Add a reading</button>
      </div>
      <div style={grid(340)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          <section style={{ ...card, background: tone.bg, border: "none" }} aria-live="polite">
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, color: tone.ink, marginBottom: 8 }}><i className={h.status.level === "urgent" ? "ph ph-warning" : "ph ph-drop"} style={{ fontSize: 17 }} />Home blood pressure</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 500, letterSpacing: "-.01em" }}>{h.status.title}</h2>
            <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.55, color: C.ink2 }}>{h.status.text}</p>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
              {[["7-day average", h.avg7], ["30-day average", h.avg30]].map(([l, a]: any) => (
                <div key={l} style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontSize: 13, color: C.muted }}>{l}</span><span style={{ fontSize: 26, letterSpacing: "-.02em" }}>{a ? `${a.sys}/${a.dia}` : "—"}</span><span style={{ fontSize: 12.5, color: C.muted }}>{a ? `${a.n} reading${a.n > 1 ? "s" : ""} · mmHg` : "No readings"}</span></div>
              ))}
            </div>
          </section>
          {h.readiness && (
            <section style={{ ...card, background: C.lav, border: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.lavInk, fontWeight: 500, marginBottom: 8 }}><i className="ph ph-calendar-check" style={{ fontSize: 16 }} />Visit readiness</div>
              <p style={{ margin: "0 0 12px", fontSize: 15, lineHeight: 1.55 }}>{h.readiness.text}</p>
              <div style={{ height: 8, borderRadius: 4, background: "rgba(95,74,138,.15)", overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(100, (h.readiness.have / h.readiness.want) * 100)}%`, background: C.lavMid, transition: "width 400ms" }} /></div>
            </section>
          )}
          <section style={card}>
            <h2 style={h2}>Last 30 days</h2>
            <p style={{ ...sub, marginBottom: 14 }}>Daily averages of your home readings.</p>
            <BpChart daily={h.daily} />
          </section>
          <section style={card}>
            <button onClick={() => setShowHow((x) => !x)} aria-expanded={showHow} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0, border: "none", background: "none", cursor: "pointer", fontSize: 16, fontWeight: 500, color: C.ink, textAlign: "left" }}>How to measure at home<i className={showHow ? "ph ph-caret-up" : "ph ph-caret-down"} /></button>
            {showHow && (
              <ol style={{ margin: "12px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 7, fontSize: 14, lineHeight: 1.55, color: C.ink2 }}>
                <li>Use a validated upper-arm cuff that fits your arm.</li>
                <li>No coffee, smoking or exercise for 30 minutes. Empty your bladder.</li>
                <li>Sit with your back supported, feet flat, arm resting at heart level. Rest 5 minutes, don't talk.</li>
                <li>Take 2 readings 1 minute apart, morning (before medications and food) and evening.</li>
                <li>Before a visit, do this for 7 days. Your care team uses the average.</li>
              </ol>
            )}
          </section>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          {h.withings !== "on" && (
            <section style={{ ...card, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: C.tealWash, display: "flex", alignItems: "center", justifyContent: "center", color: C.teal, flex: "none" }}><i className="ph ph-heartbeat" style={{ fontSize: 21 }} /></span>
              <div style={{ flex: 1 }}>
                <h2 style={{ ...h2, fontSize: 16 }}>Any home BP monitor works</h2>
                <p style={{ ...sub, marginBottom: 10 }}>Type your readings in, import them from Apple Health, or connect a Withings monitor once and readings arrive automatically.</p>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <button onClick={() => openSheet({ t: "connect", id: "withings" })} style={btnLink}>Connect Withings<i className="ph ph-arrow-right" /></button>
                  <button onClick={() => openSheet({ t: "import" })} style={btnLink}>Import a file</button>
                </div>
              </div>
            </section>
          )}
          {(h.rhr || h.hrv) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {h.rhr && <button onClick={() => go("trend", { k: "rhr" })} className="h-lift" style={{ ...card, textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 3 }}><span style={{ fontSize: 13, color: C.muted }}>Resting heart rate</span><span style={{ fontSize: 24 }}>{h.rhr.value}</span><span style={{ fontSize: 12.5, color: C.tealMid }}>{h.rhr.note}</span></button>}
              {h.hrv && <button onClick={() => go("trend", { k: "hrv" })} className="h-lift" style={{ ...card, textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 3 }}><span style={{ fontSize: 13, color: C.muted }}>HRV</span><span style={{ fontSize: 24 }}>{h.hrv.value}</span><span style={{ fontSize: 12.5, color: C.tealMid }}>{h.hrv.note}</span></button>}
            </div>
          )}
          <section style={card}>
            <h2 style={h2}>Your readings</h2>
            {h.readings.length ? (
              <ul style={{ listStyle: "none", margin: "8px 0 0", padding: 0 }}>
                {h.readings.slice(0, 25).map((r) => (
                  <li key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 54, borderTop: `1px solid ${C.line}` }}>
                    <span style={{ fontSize: 18, fontVariantNumeric: "tabular-nums", minWidth: 78 }}>{r.sys}/{r.dia}</span>
                    <span style={{ flex: 1, display: "flex", flexDirection: "column", fontSize: 13, color: C.muted }}>
                      <span>{longDateTz(r.takenAt, tz, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                      <span>{[r.pulse ? `Pulse ${r.pulse}` : null, r.source === "manual" ? "Entered by you" : r.source === "withings" ? "Withings" : r.source === "import" ? "Imported" : r.source === "apple" || r.source === "iphone" ? "Apple Health" : r.source, r.note].filter(Boolean).join(" · ")}</span>
                    </span>
                    {(r.source === "manual" || r.source === "import") && <button onClick={() => del(r.id)} aria-label={`Remove reading ${r.sys}/${r.dia}`} style={{ width: 36, height: 36, border: "none", borderRadius: 18, background: "none", color: C.faint, cursor: "pointer" }}><i className="ph ph-trash" /></button>}
                  </li>
                ))}
              </ul>
            ) : <p style={{ ...sub, marginTop: 6 }}>No readings yet. Tap “Add a reading” after you measure.</p>}
          </section>
        </div>
      </div>
      <Emergency />
    </div>
  );
}

// ── Lifestyle ───────────────────────────────────────────────────────────
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function Counter({ icon, label, value, target, onAdd, onSub, hint }: { icon: string; label: string; value: number; target?: number; onAdd: () => void; onSub: () => void; hint?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 64, borderTop: `1px solid ${C.line}` }}>
      <i className={icon} style={{ fontSize: 22, color: C.teal }} />
      <span style={{ flex: 1, display: "flex", flexDirection: "column" }}><span style={{ fontSize: 15 }}>{label}</span><span style={{ fontSize: 13, color: hint ? C.peachInk : C.muted }}>{hint || (target ? `${value} of ${target}` : value ? `${value} today` : "None today")}</span></span>
      <button onClick={onSub} disabled={!value} aria-label={`Remove one ${label.toLowerCase()}`} style={{ width: 40, height: 40, borderRadius: 20, border: `1px solid ${C.line12}`, background: "none", cursor: value ? "pointer" : "default", opacity: value ? 1 : 0.4, fontSize: 18 }}>−</button>
      <span style={{ minWidth: 22, textAlign: "center", fontSize: 18, fontVariantNumeric: "tabular-nums" }}>{value}</span>
      <button onClick={onAdd} aria-label={`Add one ${label.toLowerCase()}`} className="h-primary" style={{ width: 40, height: 40, borderRadius: 20, border: "none", background: C.teal, color: C.card, cursor: "pointer", fontSize: 18 }}>+</button>
    </div>
  );
}
function Scale({ label, value, labels, icons, onPick }: { label: string; value: number | null; labels: string[]; icons?: string[]; onPick: (v: number) => void }) {
  return (
    <div style={{ padding: "12px 0", borderTop: `1px solid ${C.line}` }}>
      <div style={{ fontSize: 15, marginBottom: 10 }}>{label}{value ? <span style={{ color: C.muted, fontSize: 13 }}> · {labels[value]}</span> : null}</div>
      <div role="radiogroup" aria-label={label} style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
        {[1, 2, 3, 4, 5].map((v) => (
          <button key={v} role="radio" aria-checked={value === v} onClick={() => onPick(v)} style={{ height: 52, borderRadius: 12, border: `1px solid ${value === v ? "transparent" : C.line12}`, background: value === v ? C.tealChip : "transparent", color: value === v ? C.tealDark : C.ink2, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, fontSize: 11.5 }}>
            {icons ? <i className={icons[v - 1]} style={{ fontSize: 20 }} /> : <span style={{ fontSize: 16 }}>{v}</span>}{labels[v]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Lifestyle() {
  const { toast, tz } = usePortal();
  const { data: l, error, reload } = useResource<LifestyleDTO>(EP.lifestyle);
  const [meal, setMeal] = useState("");
  const [busy, setBusy] = useState(false);
  if (!l) return <Loading error={error} retry={reload} />;
  const send = async (body: Record<string, unknown>, msg?: string) => {
    try { prime(EP.lifestyle, await api<LifestyleDTO>(EP.lifestyle, { body })); invalidate(EP.brief, EP.rewards); if (msg) toast(msg); } catch (e: any) { toast(e.message); }
  };
  const addMeal = async (e: React.FormEvent) => { e.preventDefault(); if (busy || meal.trim().length < 2) return; setBusy(true); await send({ kind: "meal", note: meal.trim() }, "Meal logged"); setMeal(""); setBusy(false); };
  const delMeal = async (id: string) => { try { prime(EP.lifestyle, await api<LifestyleDTO>(`${EP.lifestyle}?id=${id}`, { method: "DELETE" })); } catch (e: any) { toast(e.message); } };
  const t = l.today, maxW = Math.max(8, ...l.week.map((d) => d.water));
  return (
    <div style={{ ...screenAnim, maxWidth: 980 }}>
      <H1 sub="Quick check-ins that help ANRA connect your habits to how you sleep and feel.">Lifestyle</H1>
      <div style={grid(340)}>
        <section style={card}>
          <h2 style={h2}>Today</h2>
          <p style={{ ...sub, marginBottom: 8 }}>Tap to log. It takes seconds.</p>
          <Counter icon="ph ph-drop" label="Water (glasses)" value={t.water} target={8} onAdd={() => send({ kind: "water", value: 1 })} onSub={() => send({ kind: "water", value: -1 })} />
          <Counter icon="ph ph-coffee" label="Caffeine (cups)" value={t.caffeine} onAdd={() => send({ kind: "caffeine", value: 1 })} onSub={() => send({ kind: "caffeine", value: -1 })} hint={l.lateCaffeine ? "After 2 PM — may affect tonight's sleep" : undefined} />
          <Counter icon="ph ph-wine" label="Alcohol (drinks)" value={t.alcohol} onAdd={() => send({ kind: "alcohol", value: 1 })} onSub={() => send({ kind: "alcohol", value: -1 })} />
          <Scale label="Mood" value={t.mood} labels={MOOD_LABELS} icons={["ph ph-smiley-sad", "ph ph-smiley-meh", "ph ph-smiley-blank", "ph ph-smiley", "ph ph-smiley-wink"]} onPick={(v) => send({ kind: "mood", value: v }, "Mood saved")} />
          <Scale label="Stress" value={t.stress} labels={STRESS_LABELS} onPick={(v) => send({ kind: "stress", value: v }, "Stress saved")} />
        </section>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          {l.sleepCoach ? (
            <section style={{ ...card, background: C.lav, border: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.lavInk, fontWeight: 500, marginBottom: 8 }}><i className="ph ph-moon-stars" style={{ fontSize: 16 }} />Sleep coaching</div>
              <h2 style={{ ...h2, fontSize: 20, marginBottom: 10 }}>{l.sleepCoach.title}</h2>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 12 }}>
                {l.sleepCoach.avgSleep && <div><div style={{ fontSize: 12.5, color: C.muted }}>2-week average</div><div style={{ fontSize: 20 }}>{l.sleepCoach.avgSleep}</div></div>}
                {l.sleepCoach.consistency && <div><div style={{ fontSize: 12.5, color: C.muted }}>Bedtime varies</div><div style={{ fontSize: 20 }}>{l.sleepCoach.consistency}</div></div>}
                {l.sleepCoach.bedtimeTarget && <div><div style={{ fontSize: 12.5, color: C.muted }}>Try bed by</div><div style={{ fontSize: 20 }}>{l.sleepCoach.bedtimeTarget}</div></div>}
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6, fontSize: 14.5, lineHeight: 1.5 }}>{l.sleepCoach.tips.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
          ) : (
            <section style={{ ...card, background: C.lav, border: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.lavInk, fontWeight: 500, marginBottom: 8 }}><i className="ph ph-moon-stars" style={{ fontSize: 16 }} />Sleep coaching</div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>Connect a device that tracks sleep (iPhone Sleep Schedule, Apple Watch, Oura or WHOOP) and your personal sleep coaching starts after 3 nights.</p>
            </section>
          )}
          {l.patterns.length > 0 && (
            <section style={card}>
              <h2 style={h2}>Patterns in your data</h2>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6, fontSize: 14.5, lineHeight: 1.5, color: C.ink2 }}>{l.patterns.map((x) => <li key={x}>{x}</li>)}</ul>
              <p style={{ ...sub, fontSize: 12.5, marginTop: 10 }}>Patterns, not proof — other things affect sleep too.</p>
            </section>
          )}
          <section style={card}>
            <h2 style={h2}>Meals</h2>
            <form onSubmit={addMeal} style={{ display: "flex", gap: 8, margin: "10px 0" }}>
              <label htmlFor="meal" className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>What did you eat?</label>
              <input id="meal" value={meal} onChange={(e) => setMeal(e.target.value)} maxLength={300} placeholder="e.g. Oatmeal with berries" style={{ flex: 1, minWidth: 0, height: 44, padding: "0 12px", borderRadius: 12, border: `1px solid ${C.line12}`, background: C.page, fontSize: 15 }} />
              <button type="submit" disabled={busy || meal.trim().length < 2} className="h-primary" style={{ ...btnPrimary, opacity: meal.trim().length < 2 ? 0.5 : 1 }}>Log</button>
            </form>
            {t.meals.length ? t.meals.map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, borderTop: `1px solid ${C.line}` }}>
                <span style={{ fontSize: 13, color: C.muted, minWidth: 64 }}>{longDateTz(m.at, tz, { hour: "numeric", minute: "2-digit" })}</span><span style={{ flex: 1, fontSize: 14.5 }}>{m.text}</span>
                <button onClick={() => delMeal(m.id)} aria-label={`Remove ${m.text}`} style={{ width: 32, height: 32, border: "none", background: "none", color: C.faint, cursor: "pointer" }}><i className="ph ph-x" /></button>
              </div>
            )) : <p style={sub}>No meals logged today.</p>}
            <a href="/longevity" style={{ ...btnLink, marginTop: 8, textDecoration: "none" }}><i className="ph ph-bowl-food" />Get a personal nutrition plan with Nea Precision Nutrition</a>
          </section>
          <section style={card}>
            <h2 style={h2}>Your week</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, alignItems: "end", height: 90, marginTop: 14 }}>
              {l.week.map((d) => (
                <div key={d.day} title={`${d.water} glasses`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                  <div style={{ width: "60%", maxWidth: 22, height: `${Math.max(4, (d.water / maxW) * 70)}px`, borderRadius: 6, background: d.water >= 8 ? C.teal : C.tealLight, opacity: d.water ? 1 : 0.25 }} />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginTop: 6 }}>
              {l.week.map((d) => { const wd = WD[new Date(d.day + "T12:00:00Z").getUTCDay()]; return <div key={d.day} style={{ textAlign: "center", fontSize: 11.5, color: C.muted }}>{wd}<div style={{ fontSize: 11 }}>{d.mood ? MOOD_LABELS[d.mood] : "·"}</div></div>; })}
            </div>
            <p style={{ ...sub, fontSize: 12.5, marginTop: 8 }}>Bars: glasses of water. Below: mood.</p>
          </section>
        </div>
      </div>
      <Emergency />
    </div>
  );
}

// ── Family & sharing ────────────────────────────────────────────────────
const SCOPE_LABEL: Record<string, string> = { trends: "Trends", bp: "Blood pressure", labs: "Lab results", lifestyle: "Check-ins" };
export function Family() {
  const { go, openSheet, toast, tz } = usePortal();
  const fam = useResource<FamilyDTO>(EP.family), sh = useResource<ShareLinkDTO[]>(EP.share);
  if (!fam.data || !sh.data) return <Loading error={fam.error || sh.error} retry={() => { fam.reload(); sh.reload(); }} />;
  const f = fam.data, links = sh.data;
  const famAct = async (url: string, method: string, body?: unknown, msg?: string) => { try { prime(EP.family, await api<FamilyDTO>(url, { method, body })); if (msg) toast(msg); } catch (e: any) { toast(e.message); } };
  const revokeLink = async (id: string) => { try { prime(EP.share, await api<ShareLinkDTO[]>(`${EP.share}?id=${id}`, { method: "DELETE" })); toast("Link turned off"); } catch (e: any) { toast(e.message); } };
  const active = links.filter((l) => !l.revoked);
  return (
    <div style={{ ...screenAnim, maxWidth: 980 }}>
      <H1 sub="Let family help care for you, and share your data with a doctor — always your choice, always revocable.">Family &amp; sharing</H1>
      {f.invites.map((i) => (
        <section key={i.id} style={{ ...card, background: C.tealWash, border: "none", marginBottom: 16, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <i className="ph ph-envelope-open" style={{ fontSize: 24, color: C.teal }} />
          <span style={{ flex: 1, minWidth: 200, fontSize: 15 }}><b style={{ fontWeight: 500 }}>{i.from}</b> invited you to see their health summary.</span>
          <button onClick={() => famAct(EP.family, "PATCH", { id: i.id }, "Invite accepted")} className="h-primary" style={btnPrimary}>Accept</button>
          <button onClick={() => famAct(`${EP.family}?id=${i.id}`, "DELETE", undefined, "Invite declined")} style={btnOutline}>Decline</button>
        </section>
      ))}
      <div style={grid(340)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          <section style={card}>
            <h2 style={h2}>Family care</h2>
            <p style={{ ...sub, marginBottom: 12 }}>A family member sees a simple summary: daily signals, home blood pressure, protocol and next visit. They can't change anything. Great for looking after parents — each person keeps their own account.</p>
            {f.caregivers.length ? f.caregivers.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 58, borderTop: `1px solid ${C.line}` }}>
                <i className="ph ph-user-circle" style={{ fontSize: 26, color: C.tealLight }} />
                <span style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}><span style={{ fontSize: 15, overflow: "hidden", textOverflow: "ellipsis" }}>{c.name || c.email}</span><span style={{ fontSize: 13, color: C.muted }}>{c.relation} · {c.status === "active" ? `Can view since ${c.since}` : "Invite sent — waiting"}</span></span>
                <button onClick={() => famAct(`${EP.family}?id=${c.id}`, "DELETE", undefined, c.status === "active" ? "Access removed" : "Invite cancelled")} style={{ ...btnOutline, height: 36, fontSize: 13.5 }}>{c.status === "active" ? "Remove" : "Cancel"}</button>
              </div>
            )) : <p style={{ ...sub, padding: "10px 0" }}>No one has access to your data.</p>}
            <button onClick={() => openSheet({ t: "invite" })} className="h-secondary" style={{ ...btnSecondary, marginTop: 12 }}>Invite a family member</button>
          </section>
          {f.caringFor.length > 0 && (
            <section style={card}>
              <h2 style={h2}>People you care for</h2>
              {f.caringFor.map((c) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 58, borderTop: `1px solid ${C.line}` }}>
                  <i className="ph ph-heart" style={{ fontSize: 24, color: C.teal }} />
                  <button onClick={() => go("careview", { id: c.id })} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", border: "none", background: "none", padding: 0, cursor: "pointer", textAlign: "left" }}><span style={{ fontSize: 15, color: C.ink }}>{c.name}</span><span style={{ fontSize: 13, color: C.muted }}>{c.relation} · since {c.since}</span></button>
                  <button onClick={() => go("careview", { id: c.id })} style={btnLink}>View<i className="ph ph-arrow-right" /></button>
                </div>
              ))}
            </section>
          )}
        </div>
        <section style={card}>
          <h2 style={h2}>Share with my doctor</h2>
          <p style={{ ...sub, marginBottom: 12 }}>Create a private link for any clinician — you choose what they see and for how long. Every view is counted.</p>
          {active.length ? active.map((l) => (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 62, borderTop: `1px solid ${C.line}` }}>
              <i className="ph ph-link" style={{ fontSize: 22, color: C.teal }} />
              <span style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}><span style={{ fontSize: 15 }}>{l.label}</span><span style={{ fontSize: 13, color: C.muted }}>{l.scope.map((s) => SCOPE_LABEL[s] || s).join(", ")} · until {longDateTz(l.expiresAt, tz, { month: "short", day: "numeric" })} · {l.views} view{l.views === 1 ? "" : "s"}</span></span>
              <button onClick={() => revokeLink(l.id)} style={{ ...btnOutline, height: 36, fontSize: 13.5 }}>Turn off</button>
            </div>
          )) : <p style={{ ...sub, padding: "10px 0" }}>No active links.</p>}
          <button onClick={() => openSheet({ t: "share" })} className="h-secondary" style={{ ...btnSecondary, marginTop: 12 }}>Create a link</button>
          {links.length > active.length && <p style={{ ...sub, fontSize: 12.5, marginTop: 12 }}>{links.length - active.length} expired or turned-off link{links.length - active.length > 1 ? "s" : ""} no longer work.</p>}
        </section>
      </div>
    </div>
  );
}

export function CareView({ id }: { id: string }) {
  const { data: s, error, reload } = useResource<CareSummaryDTO>(`${EP.family}/${id}`);
  if (!s) return <Loading error={error} retry={reload} />;
  return (
    <div style={{ ...screenAnim, maxWidth: 820 }}>
      <H1 sub={`${s.relation} · read-only summary · last data ${s.updated}`}>{s.name}</H1>
      {s.alerts.map((a) => <div key={a} role="status" style={{ ...card, background: C.peach, border: "none", marginBottom: 12, display: "flex", gap: 10, fontSize: 15 }}><i className="ph ph-warning" style={{ color: C.peachInk, fontSize: 18 }} />{a}</div>)}
      <div style={grid(300)}>
        <section style={card}>
          <h2 style={h2}>Daily signals</h2>
          {s.signals.length ? s.signals.map((g) => <div key={g.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 0", borderTop: `1px solid ${C.line}` }}><span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: 14, color: C.muted }}>{g.label}</span><span style={{ fontSize: 12.5, color: C.faint }}>{g.note}</span></span><span style={{ fontSize: 20 }}>{g.value}</span></div>) : <p style={sub}>No wearable data shared.</p>}
        </section>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <section style={card}>
            <h2 style={h2}>Home blood pressure</h2>
            <p style={{ margin: "8px 0 4px", fontSize: 26 }}>{s.bp.avg7 || "—"}</p>
            <p style={sub}>{s.bp.status}{s.bp.last ? ` · last ${s.bp.last}` : ""}</p>
          </section>
          <section style={card}>
            <h2 style={h2}>Today</h2>
            <p style={sub}>{s.protocol.total ? `Protocol: ${s.protocol.done} of ${s.protocol.total} steps done` : "No protocol set"}</p>
            <p style={{ ...sub, marginTop: 6 }}>{s.nextAppointment ? `Next visit: ${s.nextAppointment}` : "No upcoming visit"}</p>
          </section>
        </div>
      </div>
      <Emergency />
    </div>
  );
}

// ── Rewards & challenges ────────────────────────────────────────────────
export function Rewards() {
  const { openSheet, toast } = usePortal();
  const rw = useResource<RewardsDTO>(EP.rewards), ch = useResource<ChallengeDTO[]>(EP.challenges);
  const [code, setCode] = useState<string | null>(null);
  if (!rw.data || !ch.data) return <Loading error={rw.error || ch.error} retry={() => { rw.reload(); ch.reload(); }} />;
  const r = rw.data;
  const redeem = async (points: number) => {
    try { const x = await api<{ code: string; rewards: RewardsDTO }>(EP.rewards, { body: { points } }); prime(EP.rewards, x.rewards); setCode(x.code); invalidate(EP.brief); toast("Discount code created"); } catch (e: any) { toast(e.message); }
  };
  const leave = async (id: string) => { try { prime(EP.challenges, (await api<{ challenges: ChallengeDTO[] }>(EP.challenges, { body: { action: "leave", id } })).challenges); toast("You left the challenge"); } catch (e: any) { toast(e.message); } };
  const copy = (t: string) => { navigator.clipboard?.writeText(t).then(() => toast("Copied"), () => {}); };
  return (
    <div style={{ ...screenAnim, maxWidth: 980 }}>
      <H1 sub="Healthy streaks earn points. Points become discounts on BioAro lab tests.">Rewards</H1>
      <div style={grid(320)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          <section style={{ ...card, background: "linear-gradient(160deg,#E8F2F4 0%,#FFFDFB 70%)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div><div style={{ fontSize: 13, color: C.muted }}>Your points</div><div style={{ fontSize: 44, letterSpacing: "-.03em", lineHeight: 1.1 }}>{r.balance.toLocaleString("en-US")}</div><div style={{ fontSize: 13, color: C.muted }}>{r.earnedTotal.toLocaleString("en-US")} earned in total</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 13, color: C.muted }}>Check-in streak</div><div style={{ fontSize: 32, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}><i className="ph-fill ph-fire" style={{ color: "#D9822B", fontSize: 26 }} />{r.streak}</div><div style={{ fontSize: 13, color: C.muted }}>day{r.streak === 1 ? "" : "s"}</div></div>
            </div>
            {code && (
              <div role="status" style={{ marginTop: 16, padding: 14, borderRadius: 14, background: C.card, border: `1px dashed ${C.tealLight}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ flex: 1, fontSize: 14 }}>Your BioAro code: <b style={{ fontSize: 17, letterSpacing: ".06em", fontWeight: 600 }}>{code}</b><br /><span style={{ color: C.muted, fontSize: 13 }}>Give it when you book your BioAro test.</span></span>
                <button onClick={() => copy(code)} style={btnOutline}>Copy</button>
              </div>
            )}
          </section>
          <section style={card}>
            <h2 style={h2}>Redeem</h2>
            {r.tiers.map((t) => {
              const ok = r.balance >= t.points;
              return (
                <div key={t.points} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 60, borderTop: `1px solid ${C.line}` }}>
                  <span style={{ flex: 1, display: "flex", flexDirection: "column" }}><span style={{ fontSize: 15 }}>{t.label}</span><span style={{ fontSize: 13, color: C.muted }}>{t.points.toLocaleString("en-US")} points{!ok ? ` · ${(t.points - r.balance).toLocaleString("en-US")} to go` : ""}</span></span>
                  <button onClick={() => redeem(t.points)} disabled={!ok} className={ok ? "h-primary" : undefined} style={{ ...btnPrimary, height: 38, opacity: ok ? 1 : 0.4, cursor: ok ? "pointer" : "default" }}>Redeem</button>
                </div>
              );
            })}
            {r.codes.length > 0 && <div style={{ marginTop: 12 }}>{r.codes.map((c) => <div key={c.code} style={{ fontSize: 13, color: C.muted, padding: "4px 0" }}><b style={{ color: C.ink, fontWeight: 500, letterSpacing: ".04em" }}>{c.code}</b> · {c.label} · {c.created}</div>)}</div>}
          </section>
          <section style={card}>
            <h2 style={h2}>How to earn</h2>
            {r.rules.map((x) => <div key={x.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: `1px solid ${C.line}`, fontSize: 14.5 }}><span>{x.label}</span><span style={{ color: C.tealDark, fontWeight: 500, whiteSpace: "nowrap" }}>+{x.points}</span></div>)}
            {r.recent.length > 0 && <><h3 style={{ margin: "16px 0 6px", fontSize: 14, fontWeight: 500 }}>Recent</h3>{r.recent.map((x, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0", fontSize: 13.5, color: C.muted }}><span>{x.label} · {x.day}</span><span style={{ color: x.points > 0 ? C.tealDark : C.peachInk }}>{x.points > 0 ? "+" : ""}{x.points}</span></div>)}</>}
          </section>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          <section style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <h2 style={{ ...h2, margin: 0 }}>Challenges</h2>
              <div style={{ display: "flex", gap: 8 }}><button onClick={() => openSheet({ t: "challenge", mode: "join" })} style={{ ...btnOutline, height: 36, fontSize: 14 }}>Join</button><button onClick={() => openSheet({ t: "challenge", mode: "create" })} className="h-primary" style={{ ...btnPrimary, height: 36, fontSize: 14 }}>Create</button></div>
            </div>
            <p style={{ ...sub, marginBottom: 8 }}>Move together with friends, family or your team. Members see names and totals only.</p>
            {ch.data.length === 0 && <p style={{ ...sub, padding: "10px 0" }}>You're not in a challenge yet. Create one and share the code.</p>}
            {ch.data.map((c) => (
              <div key={c.id} style={{ padding: "14px 0", borderTop: `1px solid ${C.line}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}><span style={{ fontSize: 16, fontWeight: 500 }}>{c.name}</span><span style={{ fontSize: 13, color: C.muted }}>{c.org ? `${c.org} · ` : ""}{c.metricLabel} · goal {c.metric === "protocol" ? "all steps" : c.goal.toLocaleString("en-US")} a day · {c.status === "active" ? `${c.daysLeft} day${c.daysLeft === 1 ? "" : "s"} left` : c.status === "upcoming" ? `starts ${c.startDay}` : "ended"}</span></span>
                  <button onClick={() => copy(c.code)} title="Copy join code" style={{ flex: "none", height: 30, padding: "0 10px", borderRadius: 15, border: "none", background: C.tealChip, color: C.tealDark, fontSize: 13, letterSpacing: ".06em", cursor: "pointer" }}>{c.code}</button>
                </div>
                <ol style={{ listStyle: "none", margin: "10px 0 0", padding: 0 }}>
                  {c.board.slice(0, 8).map((b, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", borderRadius: 10, background: b.me ? C.tealWash : "transparent", fontSize: 14 }}>
                      <span style={{ width: 20, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{i + 1}</span><span style={{ flex: 1 }}>{b.name}</span>
                      <span style={{ color: C.muted, fontSize: 13 }}>{b.daysHit} day{b.daysHit === 1 ? "" : "s"} hit</span><span style={{ minWidth: 64, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{c.metric === "protocol" ? "" : b.total.toLocaleString("en-US")}</span>
                    </li>
                  ))}
                </ol>
                {!c.mine && <button onClick={() => leave(c.id)} style={{ ...btnLink, height: 32, color: C.muted, fontWeight: 400 }}>Leave</button>}
              </div>
            ))}
          </section>
          <section style={{ ...card, background: C.lav, border: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.lavInk, fontWeight: 500, marginBottom: 8 }}><i className="ph ph-buildings" style={{ fontSize: 16 }} />For companies</div>
            <p style={{ margin: "0 0 10px", fontSize: 15, lineHeight: 1.55 }}>Run a team wellness challenge with ANRA — private leaderboards, heart-health education and BioAro testing for your people.</p>
            <a href="/contact" style={{ ...btnLink, color: C.lavInk, textDecoration: "none" }}>Talk to us<i className="ph ph-arrow-right" /></a>
          </section>
        </div>
      </div>
    </div>
  );
}

// ── Monthly story ───────────────────────────────────────────────────────
export function Story() {
  const [month, setMonth] = useState<string | null>(null);
  const url = month ? `${EP.story}?month=${month}` : EP.story;
  const { data: s, error, reload } = useResource<StoryDTO>(url);
  if (!s) return <Loading error={error} retry={reload} />;
  const lbl = (m: string) => { const [y, mo] = m.split("-").map(Number); return new Date(Date.UTC(y, mo - 1, 15)).toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }); };
  return (
    <div style={{ ...screenAnim, maxWidth: 820 }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 18, paddingBottom: 4 }}>
        {s.months.map((m) => <button key={m} onClick={() => setMonth(m)} aria-pressed={m === s.month} style={{ flex: "none", height: 34, padding: "0 12px", borderRadius: 17, border: `1px solid ${m === s.month ? "transparent" : C.line12}`, background: m === s.month ? C.tealChip : "transparent", color: m === s.month ? C.tealDark : C.ink2, fontSize: 13.5, cursor: "pointer" }}>{lbl(m)}</button>)}
      </div>
      <section style={{ padding: "30px 28px", borderRadius: 24, background: "linear-gradient(165deg,#F0ECF7 0%,#FFFDFB 65%)", border: "1px solid rgba(29,35,39,.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.lavInk, fontWeight: 500, marginBottom: 10 }}><i className="ph ph-book-open-text" style={{ fontSize: 16 }} />{s.label}{s.byAlba && <span style={{ marginLeft: 6, padding: "2px 8px", borderRadius: 10, background: "rgba(140,111,184,.15)", fontSize: 11.5 }}>Written by ALBA</span>}</div>
        <h1 style={{ margin: "0 0 14px", fontSize: 30, lineHeight: 1.15, fontWeight: 500, letterSpacing: "-.02em" }}>{s.title}</h1>
        {s.paragraphs.map((p, i) => <p key={i} style={{ margin: "0 0 12px", fontSize: 16.5, lineHeight: 1.65, color: C.ink2, textWrap: "pretty" } as React.CSSProperties}>{p}</p>)}
      </section>
      {s.stats.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 12, marginTop: 18 }}>
          {s.stats.map((x) => <div key={x.label} style={{ ...card, padding: "16px 18px" }}><div style={{ fontSize: 13, color: C.muted }}>{x.label}</div><div style={{ fontSize: 22, margin: "2px 0" }}>{x.value}</div>{x.note && <div style={{ fontSize: 12.5, color: C.tealMid }}>{x.note}</div>}</div>)}
        </div>
      )}
      <Emergency />
    </div>
  );
}

export const reloadUniverse = () => { invalidate(EP.brief, EP.heart, EP.lifestyle, EP.rewards); load(EP.brief, true).catch(() => {}); };
export type { SettingsDTO };
