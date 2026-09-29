"use client";

import React, { useMemo, useState } from "react";
import type { RetestDTO } from "@/lib/portal/types";
import type { ResultsDTO, ResultDTO, AppointmentsDTO } from "@/lib/portal/types";
import { usePortal } from "../context";
import { EP, useResource } from "../api";
import { C, screenAnim, Chips, EmptyCard, Loading, longDateTz } from "../ui";
import Chart from "../Chart";

const RCATS = ["All", "Heart Health", "Metabolic Health", "Inflammation", "Nutrition", "Hormones", "Genomics", "Other"];
let savedCat = "All";

const valueStr = (r: ResultDTO) => r.valueText ?? (r.value == null ? "—" : Math.abs(r.value) < 10 && r.value % 1 !== 0 ? r.value.toFixed(1) : String(+r.value.toFixed(1)));
const rangeText = (r: ResultDTO) => r.refText || (r.refLow != null && r.refHigh != null ? `${r.refLow}–${r.refHigh} ${r.unit ?? ""}` : r.refHigh != null ? `Below ${r.refHigh} ${r.unit ?? ""}` : r.refLow != null ? `Above ${r.refLow} ${r.unit ?? ""}` : "Not provided");
const status = (r: ResultDTO) =>
  r.inRange === true ? { text: "Within your reference range", long: "Your result is within the laboratory reference range.", icon: "ph ph-check-circle", color: C.tealDark }
  : r.inRange === false ? { text: "Outside the reference range", long: "Your result is outside the laboratory reference range. Your care team will review it with you.", icon: "ph ph-info", color: C.peachInk }
  : { text: "Result available", long: "Your result is available.", icon: "ph ph-check-circle", color: C.tealDark };

export function Results() {
  const { go, toast, tz } = usePortal();
  const { data, error, reload } = useResource<ResultsDTO>(EP.results);
  const [cat, setCatS] = useState(savedCat);
  const setCat = (c: string) => { savedCat = c; setCatS(c); };
  if (!data) return <Loading error={error} retry={reload} />;
  const isNew = data.results.length === 0;
  const list = data.results.filter((r) => cat === "All" || r.category === cat);

  return (
    <div style={screenAnim}>
      <h1 style={{ margin: "0 0 6px", fontSize: 32, lineHeight: 1.1, fontWeight: 500, letterSpacing: "-.025em" }}>My Results</h1>
      <p style={{ margin: "0 0 22px", fontSize: 15, color: C.muted }}>Your laboratory results, organized over time.</p>
      <RetestBanner />
      {isNew ? (
        <EmptyCard icon="ph ph-flask" title="Your results will appear here" text="When ANRA receives your next laboratory result, we'll organize it here and help explain what it means." />
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            <Chips items={RCATS.map((c) => ({ id: c, label: c }))} value={cat} onChange={setCat} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Most recent results</h2>
            {data.latestLabel && <span style={{ fontSize: 14, color: C.muted }}>{data.latestLabel}</span>}
          </div>
          {list.length === 0 && <p style={{ margin: 0, padding: "28px 0", fontSize: 15, color: C.muted }}>No {cat} results yet. When a related test comes back, it will be organized here.</p>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))", gap: 16 }}>
            {list.map((r) => {
              const s = status(r);
              const pend = r.pending;
              return (
                <button key={r.id} className="h-card"
                  onClick={() => pend ? toast(`We'll let you know when your ${r.name.toLowerCase()} is ready.`) : go("result", { id: r.code })}
                  style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, padding: 20, border: `1px solid ${C.line}`, borderRadius: 20, background: C.card, cursor: "pointer", textAlign: "left", transition: "box-shadow 200ms,transform 200ms" }}>
                  <span style={{ fontSize: 13, color: C.muted }}>{r.category}</span>
                  <span style={{ fontSize: 16, fontWeight: 500 }}>{r.name}</span>
                  <span style={{ display: "flex", alignItems: "baseline", gap: 5, margin: "6px 0 4px" }}><span style={{ fontSize: 34, fontWeight: 300, letterSpacing: "-.02em" }}>{pend ? "In progress" : valueStr(r)}</span>{!pend && <span style={{ fontSize: 14, color: C.muted }}>{r.unit}</span>}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, color: pend ? C.tealDark : s.color }}>
                    <i className={pend ? "ph ph-hourglass-medium" : s.icon} style={{ fontSize: 15 }} />
                    {pend ? (r.expectedAt ? `Expected ${longDateTz(r.expectedAt, tz, { month: "long", day: "numeric" })}` : "In progress") : s.text}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 14, fontWeight: 500, color: C.teal }}>{pend ? "What to expect" : "Understand this result"}<i className="ph ph-arrow-right" /></span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function ResultDetail({ id }: { id: string }) {
  const { tz, addQuestion, toast } = usePortal();
  const { data, error, reload } = useResource<ResultsDTO>(EP.results);
  const appts = useResource<AppointmentsDTO>(EP.appointments).data;
  const r = data?.results.find((x) => x.code === id || x.id === id);

  const view = useMemo(() => {
    if (!r) return null;
    const vals = [r.value, r.refLow, r.refHigh, ...r.history.map((h) => h.value)].filter((v): v is number => v != null);
    const lo0 = Math.min(...vals), hi0 = Math.max(...vals), span = hi0 - lo0 || Math.abs(hi0) || 1;
    const lo = Math.max(0, lo0 - span * 0.25), hi = hi0 + span * 0.35;
    const pct = (v: number) => Math.max(0, Math.min(100, ((v - lo) / (hi - lo)) * 100));
    const rl = pct(r.refLow ?? lo), rh = pct(r.refHigh ?? hi);
    const mon = (iso: string) => longDateTz(iso, tz, { month: "short", year: "numeric" });
    const pts = r.history.map((h) => ({ v: h.value, label: mon(h.date) }));
    return { rl, rw: rh - rl, marker: r.value != null ? pct(r.value) : null, pts,
      trendText: pts.length > 1 ? "Previous values: " + pts.slice(0, -1).map((p) => `${p.label} ${+p.v.toFixed(1)}`).join(" · ") : "This is your first result for this test. Future results will build your trend." };
  }, [r, tz]);

  if (!data) return <Loading error={error} retry={reload} />;
  if (!r || !view) return <p style={{ fontSize: 15, color: C.muted }}>This result isn't available.</p>;
  const s = status(r);
  const next = appts?.upcoming[0];
  const f = (v: number) => `${+v.toFixed(2)} ${r.unit ?? ""}`.trim();
  const addToVisit = async () => { try { await addQuestion(`Can we talk about my ${r.name} result?`); toast("Added to your visit questions"); } catch (e: any) { toast(e.message); } };

  return (
    <div style={{ ...screenAnim, maxWidth: 760 }}>
      <span style={{ fontSize: 14, color: C.muted }}>{r.category} · Source: {r.source}</span>
      <h1 style={{ margin: "4px 0 2px", fontSize: 30, fontWeight: 500, letterSpacing: "-.02em" }}>{r.name}</h1>
      {r.fullName && <span style={{ fontSize: 14, color: C.muted }}>{r.fullName}</span>}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "20px 0 6px" }}><span style={{ fontSize: 56, fontWeight: 300, letterSpacing: "-.035em", lineHeight: 1 }}>{valueStr(r)}</span><span style={{ fontSize: 17, color: C.muted }}>{r.unit}</span></div>
      <p style={{ margin: "0 0 22px", fontSize: 16, color: s.color, display: "flex", alignItems: "center", gap: 8 }}><i className={s.icon} />{s.long}</p>

      <div style={{ padding: 20, borderRadius: 20, background: C.card, border: `1px solid ${C.line}`, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted, marginBottom: 12 }}><span>Reference range</span><span>{rangeText(r)}</span></div>
        <div style={{ position: "relative", height: 8, borderRadius: 4, background: "#EFECE8" }}>
          {(r.refLow != null || r.refHigh != null) && <div style={{ position: "absolute", top: 0, bottom: 0, left: view.rl + "%", width: view.rw + "%", borderRadius: 4, background: "rgba(110,168,182,.45)" }} />}
          {view.marker != null && <div style={{ position: "absolute", top: "50%", left: view.marker + "%", width: 16, height: 16, margin: "-8px 0 0 -8px", borderRadius: 8, background: C.teal, border: `3px solid ${C.card}`, boxShadow: "0 1px 4px rgba(29,35,39,.2)", animation: "mhs-fadeIn 600ms ease" }} />}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12, color: C.faint, marginTop: 10 }}><span>{r.collectedAt ? "Collected " + longDateTz(r.collectedAt, tz, { month: "short", day: "numeric", year: "numeric" }) : ""}</span><span style={{ textAlign: "right" }}>Reference ranges come from the reporting laboratory</span></div>
      </div>

      {view.pts.length > 0 && (
        <div style={{ padding: "52px 20px 16px", borderRadius: 20, background: C.card, border: `1px solid ${C.line}`, marginBottom: 28 }}>
          <h3 style={{ margin: "-36px 0 18px", fontSize: 16, fontWeight: 500 }}>Your trend</h3>
          <Chart points={view.pts} f={f} name={r.name + " over time"} variant="result" endLabel={view.pts[view.pts.length - 1].label} />
          <p style={{ margin: "14px 0 0", fontSize: 14, color: C.ink2 }}>{view.trendText}</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {r.about && <div><h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 500 }}>What is this?</h3><p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: C.ink2 }}>{r.about}</p></div>}
        {r.guidance && <div><h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 500 }}>What should I know?</h3><p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: C.ink2 }}>{r.guidance}</p></div>}
        {!r.pending && <LabInsight code={r.code} />}
        <div style={{ padding: "18px 20px", borderRadius: 18, background: C.tealWash, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, lineHeight: 1.5, flex: 1, minWidth: 220 }}>Discuss this result with your ANRA care team at your {next ? longDateTz(next.startsAt, tz, { month: "long", day: "numeric" }) + " " : "next "}visit.</span>
          <button onClick={addToVisit} style={{ height: 42, padding: "0 16px", border: "none", borderRadius: 12, background: C.teal, color: C.card, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Add to visit questions</button>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Educational information from ANRA. It doesn't diagnose or replace advice from your clinician.</p>
      </div>
    </div>
  );
}

// ── Retest reminders + a lab result alongside wearable data ─────────────
type Insight = { retest: { due: string; overdue: boolean; months: number } | null; metrics: string[]; rows: { date: string; value: string; cells: string[] }[] };
function RetestBanner() {
  const { data } = useResource<{ retests: RetestDTO[] }>(EP.retests);
  const list = data?.retests || [];
  if (!list.length) return null;
  return (
    <section style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 18px", borderRadius: 18, background: C.lav, marginBottom: 22 }}>
      <i className="ph ph-calendar-plus" style={{ fontSize: 22, color: C.lavMid, marginTop: 1 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 500 }}>{list.length === 1 ? "A retest is due" : `${list.length} retests are due`}</span>
        {list.slice(0, 4).map((r) => <span key={r.code} style={{ fontSize: 14, color: C.ink2 }}>{r.name} — {r.overdue ? "overdue since" : "due"} {r.due} (last {r.last})</span>)}
        <span style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Book with BioAro — new results appear here automatically. Redeem reward points for a discount.</span>
      </div>
    </section>
  );
}
function LabInsight({ code }: { code: string }) {
  const { data } = useResource<Insight>(`${EP.retests}?code=${encodeURIComponent(code)}`);
  if (!data || (!data.retest && !data.rows.length)) return null;
  const hasWear = data.rows.some((r) => r.cells.some((c) => c !== "—"));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {data.retest && <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 14px", borderRadius: 14, background: data.retest.overdue ? C.peach : "#EFECE8", fontSize: 14.5 }}><i className="ph ph-calendar-check" style={{ fontSize: 18, color: data.retest.overdue ? C.peachInk : C.teal }} />Suggested retest: {data.retest.overdue ? "overdue since " : ""}{data.retest.due} (about every {data.retest.months} months)</div>}
      {hasWear && (
        <div>
          <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 500 }}>Alongside your wearable data</h3>
          <p style={{ margin: "0 0 10px", fontSize: 13.5, color: C.muted }}>Your average in the 30 days before each test.</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 420 }}>
              <thead><tr>{["Test date", "Result", ...data.metrics].map((h) => <th key={h} style={{ textAlign: "left", padding: "8px 8px 8px 0", fontSize: 12.5, fontWeight: 500, color: C.muted, borderBottom: `1px solid ${C.line2}` }}>{h}</th>)}</tr></thead>
              <tbody>{data.rows.map((r) => <tr key={r.date}><td style={{ padding: "9px 8px 9px 0", borderBottom: `1px solid ${C.line}` }}>{r.date}</td><td style={{ padding: "9px 8px 9px 0", borderBottom: `1px solid ${C.line}`, fontWeight: 500 }}>{r.value}</td>{r.cells.map((c, i) => <td key={i} style={{ padding: "9px 8px 9px 0", borderBottom: `1px solid ${C.line}`, color: C.ink2 }}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
