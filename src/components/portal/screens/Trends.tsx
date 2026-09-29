"use client";

import React, { useMemo, useState } from "react";
import type { TrendsDTO, Series } from "@/lib/portal/types";
import { METRIC_DEFS, TREND_CATS, fmt, fmtU, avg, addDays, fmtDay, type MetricKey } from "@/lib/portal/metrics";
import { usePortal } from "../context";
import { EP, useResource } from "../api";
import { C, screenAnim, PeriodPicker, EmptyCard, Loading, btnPrimary } from "../ui";
import Chart, { type ChartPoint } from "../Chart";

// Period + category persist while moving between Trends and a metric.
let savedPeriod = 30, savedCat: keyof typeof TREND_CATS = "heart";
const PL: Record<number, string> = { 7: "7 days", 30: "30 days", 90: "90 days", 365: "1 year" };

function points(s: Series, k: MetricKey, period: number, today: string): ChartPoint[] {
  if (period <= 90) {
    const from = addDays(today, -period);
    return s.filter(([d]) => d > from && d <= today).map(([d, v]) => {
      const w = s.filter(([x]) => x >= addDays(d, -6) && x <= d).map(([, y]) => y);
      return { v, label: fmtDay(d), ctx: "7-day average: " + fmtU(k, avg(w)) };
    });
  }
  const out: ChartPoint[] = [];
  for (let w = 0; w < 52; w++) {
    const start = addDays(today, -363 + w * 7), end = addDays(start, 6);
    const vals = s.filter(([d]) => d >= start && d <= end).map(([, v]) => v);
    if (vals.length) out.push({ v: avg(vals), label: "Week of " + fmtDay(start), ctx: "Weekly average" });
  }
  return out;
}

function stats(s: Series, k: MetricKey, period: number, today: string) {
  const inRange = (a: number, b: number) => s.filter(([d]) => d > addDays(today, -a) && d <= addDays(today, -b)).map(([, v]) => v);
  const cur = avg(inRange(period, 0)), prev = avg(inRange(2 * period, period));
  const span = period === 365 ? "year" : period + " days", short = METRIC_DEFS[k].short;
  const pct = (cur - prev) / prev;
  const text = isNaN(cur) ? `No ${short} readings in the last ${span}.`
    : isNaN(pct) || !isFinite(pct) ? `This is your ${short} over the last ${span}. Keep syncing to compare with the period before.`
    : Math.abs(pct) < 0.03 ? `Your ${short} has stayed fairly steady over the last ${span}.`
    : `Your ${short} has gradually ${pct > 0 ? "increased" : "decreased"} over the last ${span}.`;
  return { avg: fmtU(k, cur), prev: fmtU(k, prev), text };
}

const unitFor = (k: MetricKey, lastDay: string | undefined, today: string) =>
  k === "sleep" ? (lastDay && lastDay >= addDays(today, -1) ? "last night" : "") : k === "spo2" ? "%" : METRIC_DEFS[k].unit;

function NoPoints({ h }: { h: number }) {
  return <div style={{ height: h, borderRadius: 12, background: "#F7F5F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: C.faint }}>No readings in this period</div>;
}

export function Trends() {
  const { go } = usePortal();
  const { data, error, reload } = useResource<TrendsDTO>(EP.trends);
  const [period, setPeriodS] = useState(savedPeriod);
  const [cat, setCatS] = useState(savedCat);
  const setPeriod = (v: number) => { savedPeriod = v; setPeriodS(v); };
  const setCat = (v: typeof cat) => { savedCat = v; setCatS(v); };
  const empty = !!data && Object.keys(data.series).length === 0;

  const cards = useMemo(() => {
    if (!data) return [];
    return TREND_CATS[cat].filter((k) => data.series[k]?.length).map((k) => {
      const s = data.series[k]!, m = METRIC_DEFS[k];
      return { k, m, s, latest: fmt(k, s[s.length - 1][1]), unit: unitFor(k, s[s.length - 1][0], data.today), pts: points(s, k, period, data.today), st: stats(s, k, period, data.today) };
    });
  }, [data, cat, period]);

  return (
    <div style={screenAnim}>
      <h1 style={{ margin: "0 0 6px", fontSize: 32, lineHeight: 1.1, fontWeight: 500, letterSpacing: "-.025em" }}>Your Trends</h1>
      <p style={{ margin: "0 0 22px", fontSize: 15, color: C.muted }}>See how your health signals are changing over time.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div role="tablist" aria-label="Category" style={{ display: "flex", gap: 4 }}>
          {([["heart", "Heart"], ["recovery", "Recovery"], ["activity", "Activity"]] as const).map(([id, label]) => {
            const a = cat === id;
            return <button key={id} role="tab" aria-selected={a} onClick={() => setCat(id)} style={{ height: 40, padding: "0 16px", border: "none", borderRadius: 20, background: a ? C.ink : "transparent", color: a ? C.page : C.ink2, fontSize: 15, fontWeight: 500, cursor: "pointer", transition: "background 180ms" }}>{label}</button>;
          })}
        </div>
        <PeriodPicker value={period} onChange={setPeriod} />
      </div>

      {!data ? <Loading error={error} retry={reload} /> : empty ? (
        <EmptyCard icon="ph ph-wave-sine" title="No trend data yet" text="Connect a compatible wearable to start seeing your heart, sleep, recovery and activity trends here."
          action={<button onClick={() => go("devices")} className="h-primary" style={{ ...btnPrimary, marginTop: 6 }}>Connect a device</button>} />
      ) : (
        <>
          {cards.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 20 }}>
              {cards.map((t) => (
                <article key={t.k} style={{ padding: "22px 22px 18px", borderRadius: 22, background: C.card, border: `1px solid ${C.line}`, display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}><span style={{ fontSize: 40, fontWeight: 300, letterSpacing: "-.03em" }}>{t.latest}</span><span style={{ fontSize: 15, color: C.muted }}>{t.unit}</span></div>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{t.m.name}</span>
                  <span style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>{PL[period]} trend</span>
                  {t.pts.length ? <Chart points={t.pts} f={(v) => fmtU(t.k, v)} name={t.m.name} variant="card" /> : <NoPoints h={140} />}
                  <div style={{ display: "flex", gap: 32, margin: "16px 0 12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontSize: 13, color: C.muted }}>Your average</span><span style={{ fontSize: 18 }}>{t.st.avg}</span></div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontSize: 13, color: C.muted }}>Previous period</span><span style={{ fontSize: 18 }}>{t.st.prev}</span></div>
                  </div>
                  <p style={{ margin: "0 0 6px", fontSize: 15, lineHeight: 1.5, color: C.ink3, textWrap: "pretty" } as React.CSSProperties}>{t.st.text}</p>
                  <button onClick={() => go("trend", { k: t.k })} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, height: 40, padding: 0, border: "none", background: "none", fontSize: 14, fontWeight: 500, color: C.teal, cursor: "pointer" }}>Explore {t.m.short}<i className="ph ph-arrow-right" /></button>
                </article>
              ))}
            </div>
          ) : <p style={{ margin: 0, padding: "12px 0", fontSize: 15, color: C.muted }}>No {cat} signals from your connected sources yet.</p>}
          {data.rows[cat].length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", marginTop: 20, borderRadius: 20, background: C.card, border: `1px solid ${C.line}` }}>
              {data.rows[cat].map((r, i) => (
                <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderTop: i ? `1px solid ${C.line}` : "none" }}>
                  <i className={r.icon} style={{ fontSize: 20, color: C.teal }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontSize: 15 }}>{r.name}</span><span style={{ fontSize: 13, color: C.muted }}>{r.sub}</span></div>
                  <span style={{ fontSize: 15, color: C.ink3 }}>{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function TrendDetail({ k }: { k: MetricKey }) {
  const { openSheet, addQuestion, toast } = usePortal();
  const { data, error, reload } = useResource<TrendsDTO>(EP.trends);
  const [period, setPeriodS] = useState(savedPeriod);
  const setPeriod = (v: number) => { savedPeriod = v; setPeriodS(v); };
  const m = METRIC_DEFS[k];
  const shortName = m.short === "HRV" ? "HRV" : m.name;
  const d = useMemo(() => {
    const s = data?.series[k];
    if (!data || !s?.length) return null;
    const pts = points(s, k, period, data.today), vals = pts.map((p) => p.v), last = s[s.length - 1];
    return { pts, st: stats(s, k, period, data.today), latest: fmt(k, last[1]), when: last[0] === data.today ? "Today" : fmtDay(last[0]), range: vals.length ? fmt(k, Math.min(...vals)) + "–" + fmtU(k, Math.max(...vals)) : "—" };
  }, [data, k, period]);

  if (!data) return <Loading error={error} retry={reload} />;
  const addToVisit = async () => {
    try { await addQuestion(`What does my ${shortName} trend mean for me?`); toast("Added to your visit questions"); } catch (e: any) { toast(e.message); }
  };

  return (
    <div style={{ ...screenAnim, maxWidth: 860 }}>
      <span style={{ fontSize: 14, color: C.muted }}>{m.cat}</span>
      <h1 style={{ margin: "4px 0 16px", fontSize: 30, lineHeight: 1.15, fontWeight: 500, letterSpacing: "-.02em" }}>{m.name}</h1>
      {!d ? <p style={{ fontSize: 15, color: C.muted }}>No {m.short} readings yet. They'll appear here once your device syncs.</p> : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 18 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}><span style={{ fontSize: 56, fontWeight: 300, letterSpacing: "-.035em", lineHeight: 1 }}>{d.latest}</span><span style={{ fontSize: 17, color: C.muted }}>{k === "spo2" ? "%" : m.unit}</span></span>
              <span style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>{d.when} · {data.sources[k] || "Wearable"}</span>
            </div>
            <PeriodPicker value={period} onChange={setPeriod} />
          </div>
          <div style={{ padding: "56px 22px 16px", borderRadius: 22, background: C.card, border: `1px solid ${C.line}` }}>
            {d.pts.length ? <Chart points={d.pts} f={(v) => fmtU(k, v)} name={m.name} variant="detail" avgText={d.st.avg} tipPrefix={shortName} /> : <NoPoints h={220} />}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 16, margin: "22px 0" }}>
            {[["Your average", d.st.avg], ["Previous period", d.st.prev], ["Range", d.range]].map(([l, v]) => <div key={l} style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontSize: 13, color: C.muted }}>{l}</span><span style={{ fontSize: 20 }}>{v}</span></div>)}
          </div>
          <p style={{ margin: "0 0 28px", fontSize: 17, lineHeight: 1.55, textWrap: "pretty" } as React.CSSProperties}>{d.st.text}</p>
        </>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 24 }}>
        <div><h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 500 }}>What is it?</h3><p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: C.ink2 }}>{m.what}</p></div>
        <div><h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 500 }}>Why might I care?</h3><p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: C.ink2 }}>{m.why}</p></div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "28px 0 16px" }}>
        <button onClick={() => openSheet({ t: "alba", ask: `Help me understand my ${m.short} trend.` })} className="h-albabtn" style={{ display: "flex", alignItems: "center", gap: 8, height: 44, padding: "0 18px", border: "none", borderRadius: 12, background: C.lav, color: C.lavDeep, fontSize: 15, fontWeight: 500, cursor: "pointer" }}><i className="ph ph-sparkle" />Ask ALBA about this</button>
        <button onClick={addToVisit} className="h-outline" style={{ height: 44, padding: "0 18px", border: "1px solid rgba(63,111,124,.3)", borderRadius: 12, background: "none", color: C.teal, fontSize: 15, fontWeight: 500, cursor: "pointer" }}>Add to visit questions</button>
      </div>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: C.muted }}>Wearable readings can be affected by fit, movement and device accuracy. They help show patterns but can't diagnose a condition.</p>
    </div>
  );
}
