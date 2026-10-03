"use client";

// Health profile — "your complete health picture". Five sections, each with
// values filled automatically from devices/check-ins and simple questions.
// Apple-style: white grouped cards, rich gradient accents, autosave.

import React, { useEffect, useState } from "react";
import { PROFILE_SECTIONS, type ProfileField, type ProfileSection, type HealthProfileDTO } from "@/lib/portal/profileSchema";
import { LAB_TESTS, money } from "@/data/bioaroCatalog";
import { NEA } from "@/data/nea";
import { usePortal } from "../context";
import { EP, api, prime, useResource } from "../api";
import { C, screenAnim, Loading } from "../ui";
import { NIcon } from "@/components/neyu/icons";

const W = "#FFFFFF";
const grad = (s: ProfileSection) => `linear-gradient(135deg, ${s.gradient[0]}, ${s.gradient[1]})`;
const shadow = "0 1px 2px rgba(20,24,27,.04), 0 16px 36px -28px rgba(20,24,27,.35)";

export function Ring({ pct, size = 64, stroke = 7, color = C.teal, track = "#EDEAE5", label }: { pct: number; size?: number; stroke?: number; color?: string; track?: string; label?: React.ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, id = React.useId();
  return (
    <span style={{ position: "relative", width: size, height: size, flex: "none", display: "inline-grid", placeItems: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={color.split("|")[0]} /><stop offset="1" stopColor={color.split("|")[1] || color.split("|")[0]} /></linearGradient></defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${Math.max(0.001, pct / 100) * c} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dasharray .8s cubic-bezier(.2,.8,.2,1)" }} />
      </svg>
      <span style={{ position: "relative", fontSize: size * 0.24, fontWeight: 600, letterSpacing: "-.02em", color: C.ink }}>{label ?? `${pct}%`}</span>
    </span>
  );
}

function Squircle({ s, size = 44 }: { s: ProfileSection; size?: number }) {
  return <span style={{ width: size, height: size, borderRadius: size * 0.3, background: grad(s), display: "grid", placeItems: "center", color: W, flex: "none", boxShadow: `0 8px 18px -10px ${s.gradient[0]}` }}><NIcon name={s.icon} size="1em" tone="currentColor" style={{fontSize: size * 0.48}} /></span>;
}

/** Today card: overall completion + one tile per section. */
export function BaselineCard() {
  const { go } = usePortal();
  const { data: p } = useResource<HealthProfileDTO>(EP.profile);
  if (!p) return null;
  const done = p.overall >= 100;
  return (
    <section aria-label="Your complete health picture" style={{ marginBottom: 28, padding: "22px 22px 20px", borderRadius: 26, background: W, boxShadow: shadow, border: "1px solid rgba(29,35,39,.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <Ring pct={p.overall} size={70} stroke={8} color="#2F6F80|#A88BDB" />
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 12.5, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Your complete health picture</div>
          <h2 style={{ margin: "4px 0 2px", fontSize: 22, fontWeight: 500, letterSpacing: "-.02em" }}>{done ? "Your baseline is complete." : p.overall < 25 ? "Let’s get to know you properly." : "Keep building your baseline."}</h2>
          <p style={{ margin: 0, fontSize: 14.5, color: C.muted }}>The more NEYU knows, the more personal your brief, Neyu and care become. Every question is optional.</p>
        </div>
        <button onClick={() => go("baseline", { id: (PROFILE_SECTIONS.find((s) => { const x = p.sections.find((y) => y.id === s.id)!; return x.filled < x.total; }) || PROFILE_SECTIONS[0]).id })} className="h-primary" style={{ height: 44, padding: "0 18px", border: "none", borderRadius: 14, background: C.ink, color: W, fontSize: 14.5, fontWeight: 500, cursor: "pointer" }}>{done ? "Review" : "Continue"}</button>
      </div>
      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
        {PROFILE_SECTIONS.map((s) => {
          const x = p.sections.find((y) => y.id === s.id)!, pct = Math.round((x.filled / x.total) * 100);
          return (
            <button key={s.id} onClick={() => go("baseline", { id: s.id })} className="h-lift" style={{ display: "flex", flexDirection: "column", gap: 10, padding: 14, borderRadius: 18, border: "1px solid rgba(29,35,39,.06)", background: "#FBFAF8", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Squircle s={s} size={38} /><span style={{ fontSize: 12.5, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{x.filled}/{x.total}</span></div>
              <span style={{ fontSize: 15, fontWeight: 500, color: C.ink }}>{s.title}</span>
              <span style={{ height: 5, borderRadius: 3, background: "#ECE9E4", overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${pct}%`, background: grad(s), borderRadius: 3, transition: "width .8s" }} /></span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ── Field controls ──────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = { height: 40, padding: "0 12px", borderRadius: 11, border: "1px solid rgba(29,35,39,.12)", background: "#F7F6F3", fontSize: 15.5, color: C.ink, minWidth: 0 };
function ListField({ f, value, save }: { f: ProfileField; value: string[]; save: (v: string[]) => void }) {
  const [add, setAdd] = useState("");
  const push = () => { const t = add.trim(); if (!t) return; save([...value, t]); setAdd(""); };
  return (
    <div style={{ display: "grid", gap: 8, width: "100%" }}>
      {value.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{value.map((x, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 6px 6px 12px", borderRadius: 999, background: "#F1EEF6", fontSize: 14 }}>{x}<button onClick={() => save(value.filter((_, j) => j !== i))} aria-label={`Remove ${x}`} style={{ width: 24, height: 24, borderRadius: 12, border: "none", background: "rgba(29,35,39,.08)", cursor: "pointer", display: "grid", placeItems: "center" }}><NIcon name="ph-x" size={12} tone="currentColor" /></button></span>
      ))}</div>}
      <form onSubmit={(e) => { e.preventDefault(); push(); }} style={{ display: "flex", gap: 8 }}>
        <input value={add} onChange={(e) => setAdd(e.target.value)} placeholder={f.placeholder || "Add"} aria-label={`Add ${f.label}`} maxLength={120} style={{ ...inputStyle, flex: 1 }} />
        <button type="submit" disabled={!add.trim()} style={{ height: 40, padding: "0 14px", borderRadius: 11, border: "none", background: add.trim() ? C.ink : "#D9D5CF", color: W, cursor: add.trim() ? "pointer" : "default", fontSize: 14 }}>Add</button>
      </form>
    </div>
  );
}
function Field({ f, value, save }: { f: ProfileField; value: unknown; save: (v: unknown) => void }) {
  const [text, setText] = useState(value == null ? "" : String(value));
  useEffect(() => { setText(value == null ? "" : String(value)); }, [value]);
  if (f.type === "list") return <ListField f={f} value={Array.isArray(value) ? (value as string[]) : []} save={save} />;
  if (f.type === "scale") return (
    <div role="radiogroup" aria-label={f.label} style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => { const on = value === n; return <button key={n} role="radio" aria-checked={on} onClick={() => save(on ? null : n)} style={{ width: 40, height: 40, borderRadius: 12, border: on ? "none" : "1px solid rgba(29,35,39,.12)", background: on ? C.ink : W, color: on ? W : C.ink, fontSize: 15, cursor: "pointer" }}>{n}</button>; })}
    </div>
  );
  if (f.type === "select") return (
    <select value={value == null ? "" : String(value)} onChange={(e) => save(e.target.value || null)} aria-label={f.label} style={{ ...inputStyle, paddingRight: 30, maxWidth: 260 }}>
      <option value="">Not set</option>{f.options!.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
  const isNum = f.type === "number";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, maxWidth: "100%" }}>
      <input value={text} onChange={(e) => setText(isNum ? e.target.value.replace(/[^0-9.]/g, "") : e.target.value)} onBlur={() => { const v = text.trim(); if (v !== (value == null ? "" : String(value))) save(v === "" ? null : isNum ? Number(v) : v); }}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} inputMode={isNum ? "decimal" : "text"} placeholder={f.placeholder || (isNum ? "—" : "Add")} aria-label={f.label} maxLength={f.max_len ?? 12}
        style={{ ...inputStyle, width: isNum ? 96 : "min(320px, 100%)", textAlign: isNum ? "right" : "left" }} />
      {f.unit && <span style={{ fontSize: 14, color: C.muted, minWidth: 24 }}>{f.unit}</span>}
    </span>
  );
}

// ── Screen ──────────────────────────────────────────────────────────────
export default function Baseline({ id }: { id?: string }) {
  const { toast, go } = usePortal();
  const { data: p, error, reload } = useResource<HealthProfileDTO>(EP.profile);
  const [sec, setSec] = useState<string>(id && PROFILE_SECTIONS.some((s) => s.id === id) ? id : "baseline");
  const [saving, setSaving] = useState(false);
  if (!p) return <Loading error={error} retry={reload} />;
  const s = PROFILE_SECTIONS.find((x) => x.id === sec)!, st = p.sections.find((x) => x.id === sec)!;
  const pct = Math.round((st.filled / st.total) * 100);
  const save = async (key: string, v: unknown) => {
    setSaving(true);
    try { prime(EP.profile, await api<HealthProfileDTO>(EP.profile, { method: "PATCH", body: { values: { [key]: v } } })); toast("Saved"); }
    catch (e: any) { toast(e.message); } finally { setSaving(false); }
  };
  const pick = (x: string) => { setSec(x); window.history.replaceState(window.history.state, "", `/my-health?s=baseline&id=${x}`); };
  const tests = s.tests.map((slug) => LAB_TESTS.find((t) => t.id === "labs-" + slug)).filter(Boolean) as typeof LAB_TESTS;

  return (
    <div style={{ ...screenAnim, maxWidth: 980 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", marginBottom: 22 }}>
        <Ring pct={p.overall} size={84} stroke={9} color="#2F6F80|#A88BDB" />
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.1, fontWeight: 500, letterSpacing: "-.025em" }}>Your health profile</h1>
          <p style={{ margin: "6px 0 0", fontSize: 15, color: C.muted }}>Everything that makes your health yours — filled in once, updated automatically where we can.</p>
        </div>
      </div>

      <div role="tablist" aria-label="Profile sections" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "2px 2px 6px", marginBottom: 18 }}>
        {PROFILE_SECTIONS.map((x) => {
          const on = x.id === sec, xs = p.sections.find((y) => y.id === x.id)!;
          return (
            <button key={x.id} role="tab" aria-selected={on} onClick={() => pick(x.id)} style={{ flex: "none", display: "flex", alignItems: "center", gap: 8, height: 44, padding: "0 14px 0 8px", borderRadius: 14, border: on ? "none" : "1px solid rgba(29,35,39,.08)", background: on ? grad(x) : W, color: on ? W : C.ink, fontSize: 14.5, fontWeight: 500, cursor: "pointer", boxShadow: on ? `0 10px 20px -12px ${x.gradient[0]}` : "none", transition: "all .25s" }}>
              <span style={{ width: 28, height: 28, borderRadius: 9, background: on ? "rgba(255,255,255,.22)" : grad(x), display: "grid", placeItems: "center", color: W }}><NIcon name={x.icon} size={15} tone="currentColor" /></span>
              {x.short}<span style={{ fontSize: 12, opacity: .75, fontVariantNumeric: "tabular-nums" }}>{xs.filled}/{xs.total}</span>
            </button>
          );
        })}
      </div>

      {/* Section hero */}
      <section key={s.id} style={{ borderRadius: 26, padding: "24px 24px 22px", background: grad(s), color: W, position: "relative", overflow: "hidden", animation: "mhs-fadeUp 360ms cubic-bezier(.2,.7,.2,1)" }}>
        <div aria-hidden style={{ position: "absolute", right: -40, top: -60, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.28), transparent 70%)" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ width: 54, height: 54, borderRadius: 17, background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center" }}><NIcon name={s.icon} size={28} tone="currentColor" /></span>
          <div style={{ flex: 1, minWidth: 200 }}><h2 style={{ margin: 0, fontSize: 26, fontWeight: 500, letterSpacing: "-.02em" }}>{s.title}</h2><p style={{ margin: "4px 0 0", fontSize: 15, opacity: .9 }}>{s.blurb}</p></div>
          <Ring pct={pct} size={60} stroke={7} color="#FFFFFF|#FFFFFF" track="rgba(255,255,255,.28)" label={<span style={{ color: W }}>{pct}%</span>} />
        </div>
      </section>

      {/* Auto values */}
      {s.auto.length > 0 && (
        <section style={{ marginTop: 18 }}>
          <h3 style={{ margin: "0 0 10px 4px", fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Filled in automatically</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
            {s.auto.map((k) => { const a = p.auto[k]; return a ? (
              <div key={k} style={{ padding: "14px 16px", borderRadius: 18, background: W, boxShadow: shadow }}>
                <div style={{ fontSize: 12.5, color: C.muted }}>{a.label}</div>
                <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-.02em", margin: "3px 0 2px" }}>{a.value}</div>
                {a.note && <div style={{ fontSize: 12, color: s.gradient[0] }}>{a.note}</div>}
              </div>
            ) : (
              <button key={k} onClick={() => go(k === "city" || k === "weather" || k === "aqhi" || k === "uv" ? "today" : k === "mood" || k === "stress" || k === "water" || k === "caffeine" || k === "alcohol" ? "lifestyle" : k === "bp" ? "heart" : k === "labs" ? "results" : k === "age" ? "profile" : "devices")}
                style={{ padding: "14px 16px", borderRadius: 18, border: "1.5px dashed rgba(29,35,39,.14)", background: "transparent", textAlign: "left", cursor: "pointer" }}>
                <div style={{ fontSize: 12.5, color: C.muted }}>{AUTO_LABEL[k] || k}</div>
                <div style={{ fontSize: 14, color: C.teal, marginTop: 6, display: "flex", gap: 6, alignItems: "center" }}><NIcon name="ph-plus-circle" size="1em" tone="currentColor" />{AUTO_HOW[k] || "Connect a device"}</div>
              </button>
            ); })}
          </div>
        </section>
      )}

      {/* Questions — grouped list */}
      <section style={{ marginTop: 18 }}>
        <h3 style={{ margin: "0 0 10px 4px", fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted, fontWeight: 500, display: "flex", justifyContent: "space-between" }}>Your answers<span style={{ textTransform: "none", letterSpacing: 0, fontSize: 12.5 }}>{saving ? "Saving…" : "Saves automatically"}</span></h3>
        <div style={{ borderRadius: 22, background: W, boxShadow: shadow, overflow: "hidden" }}>
          {s.fields.map((f, i) => (
            <div key={f.key} style={{ display: "flex", flexWrap: "wrap", alignItems: f.type === "list" ? "flex-start" : "center", justifyContent: "space-between", gap: "10px 16px", padding: "14px 18px", borderTop: i ? "1px solid rgba(29,35,39,.06)" : "none" }}>
              <div style={{ flex: f.type === "list" ? "1 1 100%" : "1 1 200px", minWidth: 0 }}>
                <div style={{ fontSize: 15.5 }}>{f.label}</div>
                {f.hint && <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{f.hint}</div>}
              </div>
              <div style={{ flex: f.type === "list" ? "1 1 100%" : "0 1 auto", display: "flex", justifyContent: f.type === "list" ? "stretch" : "flex-end", minWidth: 0 }}>
                <Field f={f} value={p.data[f.key]} save={(v) => save(f.key, v)} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tests that complete this section */}
      {(tests.length > 0 || s.id === "baseline") && (
        <section style={{ marginTop: 18 }}>
          <h3 style={{ margin: "0 0 10px 4px", fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Complete it with a test</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 10 }}>
            {s.id === "baseline" && (
              <a href={NEA.consult} target="_blank" rel="noopener" style={{ display: "flex", flexDirection: "column", gap: 6, padding: 16, borderRadius: 18, background: W, boxShadow: shadow, color: C.ink, textDecoration: "none" }}>
                <span style={{ fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: NEA.color }}>Nea Precision Skin</span>
                <b style={{ fontWeight: 500, fontSize: 16 }}>DEXA body composition</b>
                <span style={{ fontSize: 13.5, color: C.muted }}>Measures body fat, muscle and bone density in one scan.</span>
                <span style={{ marginTop: 4, fontSize: 13.5, color: NEA.color, fontWeight: 500 }}>Book a free consult ↗</span>
              </a>
            )}
            {tests.map((t) => (
              <a key={t.id} href={t.url("CA")} target="_blank" rel="noopener" style={{ display: "flex", flexDirection: "column", gap: 6, padding: 16, borderRadius: 18, background: W, boxShadow: shadow, color: C.ink, textDecoration: "none" }}>
                <span style={{ fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "#4E8E9D" }}>BioAro Labs · {t.cat}</span>
                <b style={{ fontWeight: 500, fontSize: 16 }}>{t.name}</b>
                <span style={{ fontSize: 13.5, color: C.muted }}>{t.why}</span>
                <span style={{ marginTop: 4, display: "flex", justifyContent: "space-between", fontSize: 14 }}><b style={{ fontWeight: 500 }}>{money(t.price)}</b><span style={{ color: C.teal, fontWeight: 500 }}>View test ↗</span></span>
              </a>
            ))}
          </div>
        </section>
      )}

      <p style={{ margin: "22px 0 0", fontSize: 13, lineHeight: 1.5, color: C.muted, display: "flex", gap: 8 }}><NIcon name="ph-lock-simple" size={16} tone="currentColor" style={{marginTop: 1}} /><span>Only you and your NEYU care team can see this. Every question is optional, and you can clear any answer at any time. We never ask for income, political views or browsing history.</span></p>
    </div>
  );
}

const AUTO_LABEL: Record<string, string> = { age: "Age", weight: "Weight", bmi: "BMI", rhr: "Resting heart rate", hrv: "HRV", bp: "Home blood pressure", spo2: "Blood oxygen", glucose: "Glucose", labs: "Lab results", steps: "Steps", active: "Active minutes", sleep: "Sleep", water: "Water", caffeine: "Caffeine", alcohol: "Alcohol", city: "City", weather: "Weather", aqhi: "Air quality", uv: "UV index", mood: "Mood", stress: "Stress" };
const AUTO_HOW: Record<string, string> = { age: "Add date of birth", bmi: "Add height + weight", bp: "Add a reading", labs: "See Results", water: "Check in", caffeine: "Check in", alcohol: "Check in", mood: "Check in", stress: "Check in", city: "Add your city", weather: "Add your city", aqhi: "Add your city", uv: "Add your city", glucose: "Enter or connect" };
