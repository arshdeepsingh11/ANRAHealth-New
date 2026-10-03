"use client";

import React, { useState } from "react";
import type { TodayDTO, BriefDTO } from "@/lib/portal/types";
import type { MetricKey } from "@/lib/portal/metrics";
import { usePortal } from "../context";
import { EP, load, useResource } from "../api";
import { C, screenAnim, Shimmer, Loading, btnPrimary } from "../ui";
import { BaselineCard } from "./Baseline";
import { NIcon } from "@/components/neyu/icons";

const AREA_ORDER = ["Heart", "Sleep", "Recovery", "Activity", "Labs", "Nutrition", "Protocol", "Risk"];

function HealthMap({ areas, center, big }: { areas: TodayDTO["areas"]; center: string; big: boolean }) {
  const on = (l: string) => !!areas.find((a) => a.label === l)?.on;
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: big ? 280 : 260, aspectRatio: "1", margin: big ? "0 auto" : undefined, justifySelf: big ? undefined : "center" }}>
      {AREA_ORDER.map((l, i) => (
        <div key={"l" + l} style={{ position: "absolute", left: "50%", top: "50%", width: "36%", height: 0, borderTop: `1px ${on(l) ? "solid" : "dashed"} ${on(l) ? "rgba(63,111,124,.35)" : "rgba(29,35,39,.14)"}`, transformOrigin: "0 0", transform: `rotate(${-90 + i * 45}deg)` }} />
      ))}
      {big ? (
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 48, height: 48, margin: "-24px 0 0 -24px", borderRadius: 24, background: C.tealWash, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: C.tealDark, overflow: "hidden", textAlign: "center" }}>{center}</div>
      ) : (
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 44, height: 44, margin: "-22px 0 0 -22px", borderRadius: 22, background: C.card, border: "1px solid rgba(63,111,124,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: C.teal }}>You</div>
      )}
      {AREA_ORDER.map((l, i) => {
        const a = ((-90 + i * 45) * Math.PI) / 180, o = on(l), s = big ? 12 : 10;
        return (
          <div key={l} style={{ position: "absolute", left: 50 + Math.cos(a) * 38 + "%", top: 50 + Math.sin(a) * 38 + "%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ width: s, height: s, borderRadius: s / 2, background: o ? C.tealLight : C.page, border: `1.5px solid ${o ? C.teal : "#B9B4AC"}` }} />
            <span style={{ fontSize: big ? 12 : 11, color: big ? (o ? C.ink : C.faint) : C.muted }}>{l}</span>
          </div>
        );
      })}
    </div>
  );
}

const AQ_TONE = (risk: string | null) => (risk === "Low" ? { bg: "rgba(110,168,182,.18)", ink: C.tealDark } : risk === "Moderate" ? { bg: "#FFF1D6", ink: "#8A5A12" } : risk ? { bg: C.peach, ink: C.peachInk } : { bg: "#EFECE8", ink: C.muted });
const WX_ICON = (c: string | null) => { const x = (c || "").toLowerCase(); return /thunder/.test(x) ? "ph ph-cloud-lightning" : /snow|flurr/.test(x) ? "ph ph-cloud-snow" : /rain|shower|drizzle/.test(x) ? "ph ph-cloud-rain" : /fog|haze|smoke/.test(x) ? "ph ph-cloud-fog" : /cloud|overcast/.test(x) ? "ph ph-cloud-sun" : "ph ph-sun"; };

/** NEYU Today — location-aware daily brief. */
function BriefCard() {
  const { go, openSheet } = usePortal();
  const { data: b, error, reload } = useResource<BriefDTO>(EP.brief);
  if (!b) return error ? null : <div aria-busy="true" style={{ marginBottom: 24 }}><Shimmer w="100%" h={180} r={24} /></div>;
  const w = b.weather, aq = AQ_TONE(w?.aqhiRisk ?? null);
  const open = (target?: string) => { if (!target) return; if (target.startsWith("trend:")) go("trend", { k: target.slice(6) as MetricKey }); else go(target as any); };
  const move = b.moveAdvice;
  return (
    <section aria-label="NEYU Today" style={{ marginBottom: 28, padding: "24px 24px 20px", borderRadius: 24, background: "linear-gradient(160deg,#E4EFF1 0%,#F3EEF8 55%,#FFFDFB 100%)", border: "1px solid rgba(29,35,39,.05)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, letterSpacing: ".08em", color: C.tealDark }}><NIcon name="ph-sun-horizon" size={17} tone="currentColor" />NEYU TODAY</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {b.streak > 0 && <button onClick={() => go("rewards")} style={{ display: "flex", alignItems: "center", gap: 5, height: 30, padding: "0 11px", borderRadius: 15, border: "none", background: "rgba(255,253,251,.8)", fontSize: 13, color: C.ink2, cursor: "pointer" }}><NIcon name="ph-fire" size="1em" tone={"#D9822B"} />{b.streak}-day streak</button>}
          <button onClick={() => go("rewards")} style={{ display: "flex", alignItems: "center", gap: 5, height: 30, padding: "0 11px", borderRadius: 15, border: "none", background: "rgba(255,253,251,.8)", fontSize: 13, color: C.ink2, cursor: "pointer" }}><NIcon name="ph-trophy" size="1em" tone={C.teal} />{b.points.toLocaleString("en-US")} pts</button>
        </div>
      </div>
      {w && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          <button onClick={() => openSheet({ t: "location" })} style={{ display: "flex", alignItems: "center", gap: 7, height: 34, padding: "0 12px", borderRadius: 17, border: "none", background: C.card, fontSize: 14, color: C.ink, cursor: "pointer" }}><NIcon name={String(WX_ICON(w.condition)).replace(/^ph(-fill|-bold)? /, "")} size={18} tone={"#D9822B"} />{w.tempC != null ? `${Math.round(w.tempC)}°C` : ""} {w.condition || ""}<span style={{ color: C.muted }}>· {w.place.split(",")[0]}</span></button>
          {w.aqhi != null && <span title="Air Quality Health Index (Environment Canada)" style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: 17, background: aq.bg, color: aq.ink, fontSize: 14 }}><NIcon name="ph-wind" size="1em" tone="currentColor" />AQHI {w.aqhi} · {w.aqhiRisk}</span>}
          {w.high != null && <span style={{ display: "flex", alignItems: "center", height: 34, padding: "0 12px", borderRadius: 17, background: C.card, fontSize: 14, color: C.ink2 }}>H {Math.round(w.high)}° · L {w.low != null ? Math.round(w.low) : "—"}°</span>}
          {w.uv != null && w.uv >= 3 && <span style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: 17, background: C.card, fontSize: 14, color: C.ink2 }}><NIcon name="ph-sun" size="1em" tone="currentColor" />UV {w.uv}</span>}
        </div>
      )}
      {w?.alerts.map((a) => <div key={a} role="alert" style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", borderRadius: 12, background: C.peach, color: C.peachInk, fontSize: 14, marginBottom: 12 }}><NIcon name="ph-warning" size={17} tone="currentColor" style={{marginTop: 1}} />{a}</div>)}
      <h2 style={{ margin: "0 0 8px", fontSize: 24, lineHeight: 1.25, fontWeight: 500, letterSpacing: "-.015em" }}>{b.headline}</h2>
      <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.6, color: C.ink2, textWrap: "pretty" } as React.CSSProperties}>{b.message}</p>
      {b.byAlba && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: 12, color: C.lavInk }}><NIcon name="ph-sparkle" size="1em" tone="currentColor" />Written by Neyu from your data</span>}
      {move && move.verdict && (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 14, padding: "12px 14px", borderRadius: 14, background: move.verdict === "outside" ? "rgba(110,168,182,.16)" : move.verdict === "easy" ? "#FFF4E0" : C.peach }}>
          <NIcon name={move.verdict === "outside" ? "ph-person-simple-run" : move.verdict === "easy" ? "ph-person-simple-walk" : "ph-house-line"} size={20} tone={move.verdict === "outside" ? C.tealDark : move.verdict === "easy" ? "#8A5A12" : C.peachInk} style={{marginTop: 1}} />
          <span style={{ fontSize: 14.5, lineHeight: 1.5 }}><b style={{ fontWeight: 500 }}>{move.verdict === "outside" ? "Good day to move outside" : move.verdict === "easy" ? "Move, but take it easy" : "Keep it indoors today"}</b><br />{move.text}</span>
        </div>
      )}
      {b.needsLocation && (
        <button onClick={() => openSheet({ t: "location" })} className="h-lift" style={{ marginTop: 14, width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, border: `1px dashed ${C.tealLight}`, background: "rgba(255,253,251,.7)", cursor: "pointer", textAlign: "left" }}>
          <NIcon name="ph-map-pin" size={22} tone={C.teal} /><span style={{ flex: 1, fontSize: 14.5 }}><b style={{ fontWeight: 500 }}>Add your city</b><br /><span style={{ color: C.muted }}>Get local weather, air quality and the best time to move.</span></span><NIcon name="ph-caret-right" size="1em" tone={C.faint} />
        </button>
      )}
      {b.items.length > 0 && (
        <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 8 }}>
          {b.items.map((it, i) => (
            <li key={i}><button onClick={() => open(it.go)} disabled={!it.go} className="h-lift" style={{ width: "100%", height: "100%", display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: 14, border: "none", background: it.tone === "peach" ? "rgba(251,238,232,.9)" : it.tone === "lavender" ? "rgba(240,236,247,.9)" : "rgba(255,253,251,.85)", cursor: it.go ? "pointer" : "default", textAlign: "left" }}>
              <NIcon name={it.icon} size={19} tone={it.tone === "peach" ? C.peachInk : it.tone === "lavender" ? C.lavMid : C.teal} style={{marginTop: 1, flex: "none"}} />
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontSize: 13, color: C.muted }}>{it.title}</span><span style={{ fontSize: 14.5, lineHeight: 1.45, color: C.ink }}>{it.text}</span></span>
            </button></li>
          ))}
        </ul>
      )}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 14, alignItems: "center" }}>
        <button onClick={() => go("story")} style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: 0, border: "none", background: "none", fontSize: 14, fontWeight: 500, color: C.lavInk, cursor: "pointer" }}><NIcon name="ph-book-open-text" size="1em" tone="currentColor" />Your monthly story</button>
        <button onClick={() => openSheet({ t: "alba", ask: "Why was my sleep different this week?" })} style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: 0, border: "none", background: "none", fontSize: 14, fontWeight: 500, color: C.lavInk, cursor: "pointer" }}><NIcon name="ph-sparkle" size="1em" tone="currentColor" />Ask Neyu about my week</button>
        {w && <span style={{ marginLeft: "auto", fontSize: 11.5, color: C.faint }}>Weather: Environment and Climate Change Canada</span>}
        {!w && !b.needsLocation && <button onClick={reload} style={{ marginLeft: "auto", fontSize: 12.5, color: C.faint, border: "none", background: "none", cursor: "pointer" }}>Weather unavailable right now · retry</button>}
      </div>
    </section>
  );
}

export default function Today() {
  const { go, openSheet, toast, profile } = usePortal();
  const { data: t, error, reload, reloading } = useResource<TodayDTO>(EP.today);
  const [insightOpen, setInsightOpen] = useState(false);
  const [syncError, setSyncError] = useState(false);
  if (!t) return <Loading error={error} retry={reload} />;

  const refresh = async () => {
    if (reloading) return;
    try { await Promise.all([reload(), load(EP.brief, true)]); setSyncError(false); toast("Updated just now"); } catch { setSyncError(true); }
  };
  const startAssessment = () => { window.location.href = "/longevity"; };
  const nextStepCard = t.nextStep && (
    <section style={{ padding: "20px 22px", borderRadius: 20, background: C.card, border: `1px solid ${C.line}` }}>
      <span style={{ fontSize: 13, color: C.muted }}>Your next step</span>
      <p style={{ margin: "6px 0 14px", fontSize: 17, lineHeight: 1.45 }}>{t.nextStep.text}</p>
      {t.nextStep.kind === "appointment"
        ? <button onClick={() => openSheet({ t: "prepare" })} className="h-primary" style={btnPrimary}>Prepare for your visit</button>
        : <button onClick={startAssessment} className="h-primary" style={btnPrimary}>Start health assessment</button>}
    </section>
  );
  const dayList = (
    <section aria-label="Your day">
      <h3 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 500 }}>Your day</h3>
      {t.dayItems.length ? (
        <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {t.dayItems.map((d, i) => (
            <li key={i} style={{ display: "grid", gridTemplateColumns: "68px 16px minmax(0,1fr)", gap: "0 12px", minHeight: 60 }}>
              <span style={{ fontSize: 13, color: C.muted, paddingTop: 2, fontVariantNumeric: "tabular-nums" }}>{d.time}</span>
              <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><span style={{ width: 9, height: 9, borderRadius: 5, marginTop: 5, background: d.done ? C.tealLight : C.page, border: `1.5px solid ${C.tealLight}`, flex: "none" }} /><span style={{ flex: 1, width: 1, background: "rgba(110,168,182,.3)", marginTop: 4 }} /></span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2, paddingBottom: 16 }}><span style={{ fontSize: 15, color: d.done ? C.ink : C.muted }}>{d.title}</span><span style={{ fontSize: 14, color: C.muted }}>{d.value}</span></span>
            </li>
          ))}
        </ol>
      ) : <p style={{ margin: 0, fontSize: 14, color: C.muted }}>Today's readings and routine will appear here as they arrive.</p>}
    </section>
  );
  const onCount = t.areas.filter((a) => a.on).length;

  return (
    <div style={screenAnim}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 14, color: C.muted }}>{t.dateLabel}</span>
          <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.1, fontWeight: 500, letterSpacing: "-.025em" }}>{t.greeting}</h1>
          <span style={{ fontSize: 15, color: C.muted }}>Your health snapshot</span>
        </div>
        {t.hasWearable && (
          <button onClick={refresh} aria-live="polite" className="h-tealborder" style={{ whiteSpace: "nowrap", flex: "none", display: "flex", alignItems: "center", gap: 8, height: 36, padding: "0 14px", border: "1px solid rgba(29,35,39,.08)", borderRadius: 18, background: C.card, fontSize: 13, color: C.muted, cursor: "pointer" }}>
            <NIcon name="ph-arrows-clockwise" size={15} tone={C.teal} />{reloading ? "Updating your health data…" : t.syncLabel}
          </button>
        )}
      </div>

      <BriefCard />
      <BaselineCard />

      {syncError && (
        <div role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 18px", marginBottom: 20, borderRadius: 16, background: C.peach, animation: "mhs-fadeUp 300ms ease" }}>
          <NIcon name="ph-cloud-slash" size={22} tone={C.peachInk} style={{marginTop: 1}} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}><span style={{ fontSize: 15, fontWeight: 500 }}>We couldn't update your wearable data.</span><span style={{ fontSize: 14, color: C.muted }}>Your previous data is still available.</span></div>
          <button onClick={refresh} style={{ height: 36, padding: "0 14px", border: "1px solid rgba(139,75,55,.25)", borderRadius: 10, background: C.card, fontSize: 14, fontWeight: 500, color: C.peachInk, cursor: "pointer" }}>Try again</button>
        </div>
      )}

      {!t.hasWearable && (
        <>
          <section style={{ padding: "32px 28px", borderRadius: 24, background: "linear-gradient(165deg,#EAF3F4 0%,#FFFDFB 70%)", border: "1px solid rgba(29,35,39,.05)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 28, alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <h2 style={{ margin: 0, fontSize: 28, lineHeight: 1.15, fontWeight: 500, letterSpacing: "-.02em" }}>Let's build your health picture.</h2>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: C.muted, textWrap: "pretty" } as React.CSSProperties}>Connect a device or complete your first assessment. My Health Space gets more useful as your data comes together.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
                <button onClick={() => go("devices")} className="h-primary" style={{ height: 46, padding: "0 20px", border: "none", borderRadius: 12, background: C.teal, color: C.card, fontSize: 15, fontWeight: 500, cursor: "pointer" }}>Connect a device</button>
                <button onClick={startAssessment} className="h-secondary" style={{ height: 46, padding: "0 20px", border: "none", borderRadius: 12, background: C.tealChip, color: C.tealDark, fontSize: 15, fontWeight: 500, cursor: "pointer" }}>Start health assessment</button>
              </div>
            </div>
            <HealthMap areas={t.areas} center="You" big={false} />
          </section>
          {(t.nextStep?.kind === "appointment" || t.dayItems.length > 0) && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: 28, alignItems: "start", marginTop: 28 }}>
              {t.nextStep?.kind === "appointment" && nextStepCard}
              {t.dayItems.length > 0 && dayList}
            </div>
          )}
        </>
      )}

      {t.hasWearable && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: 28, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
            <section aria-label="Today's picture" style={{ padding: 24, borderRadius: 24, background: "linear-gradient(165deg,#E8F2F4 0%,#FFFDFB 62%)", border: "1px solid rgba(29,35,39,.05)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 14, color: C.muted }}>Today's picture</span>
                {t.picture && (
                  <span style={{ display: "flex", alignItems: "center", gap: 7, height: 28, padding: "0 12px", borderRadius: 14, background: t.picture.status === "Steady" ? "rgba(110,168,182,.16)" : "rgba(139,75,55,.10)", fontSize: 13, fontWeight: 500, color: t.picture.status === "Steady" ? C.tealDark : C.peachInk }}>
                    <span style={{ width: 7, height: 7, borderRadius: 4, background: t.picture.status === "Steady" ? C.teal : C.peachInk }} />{t.picture.status}
                  </span>
                )}
              </div>
              {t.picture ? (
                <>
                  <h2 style={{ margin: "0 0 10px", fontSize: 26, lineHeight: 1.2, fontWeight: 500, letterSpacing: "-.02em" }}>{t.picture.headline}</h2>
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: C.ink2, textWrap: "pretty" } as React.CSSProperties}>{t.picture.text}</p>
                </>
              ) : <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: C.ink2 }}>Your picture fills in after a few days of wearable data.</p>}
              <div style={{ height: 1, background: C.line2, margin: "22px 0 6px" }} />
              {reloading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "4px 16px" }}>
                  {[1, 2, 3, 4].map((k) => <div key={k} style={{ padding: "14px 0", display: "flex", flexDirection: "column", gap: 8 }}><Shimmer w={56} h={12} r={6} /><Shimmer w={92} h={26} /><div style={{ width: 120, height: 11, borderRadius: 6, background: "#EFECE8" }} /></div>)}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "4px 16px", animation: "mhs-fadeIn 400ms ease" }}>
                  {t.signals.map((g) => (
                    <button key={g.k} onClick={() => go("trend", { k: g.k })} aria-label={`${g.label} ${g.value} ${g.unit}, ${g.note}. Open trend.`} className="h-signal" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3, padding: "12px 8px 12px 0", border: "none", background: "none", cursor: "pointer", textAlign: "left", borderRadius: 12 }}>
                      <span style={{ fontSize: 13, color: C.muted }}>{g.label}</span>
                      <span style={{ display: "flex", alignItems: "baseline", gap: 5 }}><span style={{ fontSize: 28, fontWeight: 400, letterSpacing: "-.02em" }}>{g.value}</span><span style={{ fontSize: 14, color: C.muted }}>{g.unit}</span></span>
                      <span style={{ fontSize: 13, color: C.tealMid }}>{g.note}</span>
                    </button>
                  ))}
                </div>
              )}
              <p style={{ margin: "14px 0 0", fontSize: 12, lineHeight: 1.5, color: C.faint, display: "flex", gap: 6, alignItems: "flex-start" }}><NIcon name="ph-info" size={14} tone="currentColor" style={{marginTop: 1}} />A simple reading of your wearable data, not a diagnosis.</p>
            </section>

            {t.insights.map((ins, i) => ins.tone === "lavender" ? (
              <section key={i} style={{ padding: "20px 22px", borderRadius: 20, background: C.lav }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.lavInk, fontWeight: 500, marginBottom: 8 }}><NIcon name="ph-sparkle" size={16} tone="currentColor" />{ins.eyebrow}</div>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, textWrap: "pretty" } as React.CSSProperties}>{ins.text}</p>
                {insightOpen && ins.detail && (
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10, animation: "mhs-fadeUp 260ms ease" }}>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: C.ink2 }}>{ins.detail}</p>
                    {ins.source && <span style={{ fontSize: 12, color: C.lavInk }}>{ins.source}</span>}
                  </div>
                )}
                <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                  <button onClick={() => go("trend", { k: ins.metric })} style={{ display: "flex", alignItems: "center", gap: 6, height: 36, padding: 0, border: "none", background: "none", fontSize: 14, fontWeight: 500, color: C.lavInk, cursor: "pointer" }}>{ins.cta}<NIcon name="ph-arrow-right" size="1em" tone="currentColor" /></button>
                  {ins.detail && <button onClick={() => setInsightOpen((o) => !o)} aria-expanded={insightOpen} style={{ height: 36, padding: 0, border: "none", background: "none", fontSize: 14, color: C.lavInk, cursor: "pointer" }}>{insightOpen ? "Show less" : "Why this matters"}</button>}
                </div>
              </section>
            ) : (
              <section key={i} style={{ padding: "20px 22px", borderRadius: 20, background: C.peach }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.peachInk, fontWeight: 500, marginBottom: 8 }}><NIcon name="ph-moon" size={16} tone="currentColor" />{ins.eyebrow}</div>
                <p style={{ margin: "0 0 14px", fontSize: 16, lineHeight: 1.55, textWrap: "pretty" } as React.CSSProperties}>{ins.text}</p>
                {ins.stats && (
                  <div style={{ display: "flex", gap: 28, marginBottom: 10 }}>
                    {ins.stats.map((s) => <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontSize: 13, color: C.muted }}>{s.label}</span><span style={{ fontSize: 20 }}>{s.value}</span></div>)}
                  </div>
                )}
                <button onClick={() => go("trend", { k: ins.metric })} style={{ display: "flex", alignItems: "center", gap: 6, height: 36, padding: 0, border: "none", background: "none", fontSize: 14, fontWeight: 500, color: C.peachInk, cursor: "pointer" }}>{ins.cta}<NIcon name="ph-arrow-right" size="1em" tone="currentColor" /></button>
              </section>
            ))}

            {nextStepCard}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 28, minWidth: 0 }}>
            {dayList}

            <section style={{ padding: 22, borderRadius: 20, background: C.card, border: `1px solid ${C.line}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 6 }}><h3 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Your health picture</h3><span style={{ fontSize: 13, color: C.muted }}>{onCount} of 8 areas</span></div>
              <p style={{ margin: "0 0 8px", fontSize: 14, color: C.muted, lineHeight: 1.5 }}>Health is a picture, not a score. Each area fills in as data arrives.</p>
              <HealthMap areas={t.areas} center={profile.firstName.slice(0, 7)} big />
            </section>

            <button onClick={() => openSheet({ t: "alba", ask: "Help me understand my recent health trends." })} className="h-albacard" style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", border: "1px solid rgba(42,132,228,.2)", borderRadius: 18, background: C.card, cursor: "pointer", textAlign: "left" }}>
              <span style={{ width: 36, height: 36, borderRadius: 18, background: C.lav, display: "flex", alignItems: "center", justifyContent: "center", color: C.lavMid, flex: "none" }}><NIcon name="ph-sparkle" size={18} tone="currentColor" /></span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}><span style={{ fontSize: 14, fontWeight: 500 }}>Ask Neyu</span><span style={{ fontSize: 14, color: C.muted }}>“Help me understand my recent health trends.”</span></span>
              <NIcon name="ph-caret-right" size="1em" tone={C.faint} />
            </button>

            <section>
              <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 500 }}>Data sources</h3>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: C.muted }}>Your health picture is built from:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {t.sources.map((s) => <span key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px", borderRadius: 16, background: "#EFECE8", fontSize: 13, color: C.ink3 }}><NIcon name={s.icon} size={15} tone={C.teal} />{s.label}</span>)}
              </div>
            </section>
          </div>
        </div>
      )}

      <p style={{ margin: "36px 0 0", fontSize: 13, lineHeight: 1.5, color: C.muted, display: "flex", gap: 8, alignItems: "flex-start" }}><NIcon name="ph-first-aid" size={16} tone={C.peachInk} style={{marginTop: 1}} /><span>If you think you may be having a medical emergency, call 911 or go to the nearest emergency department.</span></p>
    </div>
  );
}
