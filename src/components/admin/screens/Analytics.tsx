"use client";

import React from "react";
import type { AnalyticsDTO, Bar } from "@/lib/admin/types";
import { useAdmin, useView } from "../context";
import { T, S, Orb, Failed, BlockSkeleton } from "../ui";

function Bars({ rows, labelW = 170, color = T.teal, track = T.side, valW = 60, empty }: { rows: Bar[]; labelW?: number; color?: string; track?: string; valW?: number; empty: string }) {
  if (!rows.length) return <p style={{ margin: 0, fontSize: 13.5, color: T.faint }}>{empty}</p>;
  return (
    <>
      {rows.map((b) => (
        <div key={b.label} style={{ display: "grid", gridTemplateColumns: `${labelW}px minmax(0,1fr) ${valW}px`, gap: 10, alignItems: "center", marginBottom: 10, fontSize: 13.5 }}>
          <span style={{ color: T.ink2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={b.label}>{b.label}</span>
          <span style={{ height: 8, borderRadius: 999, background: track, overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: b.w, background: color, borderRadius: 999, transition: "width 350ms" }} /></span>
          <span style={{ textAlign: "right" }}>{b.v}</span>
        </div>
      ))}
    </>
  );
}

export default function Analytics() {
  const a = useAdmin();
  const { data, error, loading, reload } = useView<AnalyticsDTO>("analytics", a.rangeParams);
  const card = { ...S.card, padding: "22px 24px" };
  return (
    <section data-screen-label="16 Analytics" style={{ display: "flex", flexDirection: "column", gap: 24, animation: "anraFade 260ms ease-out" }}>
      <div><h1 style={S.h1}>Analytics</h1><p style={{ margin: "4px 0 0", color: T.ink2 }}>How ANRA's digital health experience is performing{data ? " · " + data.rangeLabel : ""}</p></div>
      {loading && <><BlockSkeleton h={90} /><BlockSkeleton h={300} /></>}
      {error && !data && <Failed what="analytics" onRetry={reload} />}
      {data && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, padding: "18px 0" }}>
            {data.metrics.map((m) => <div key={m.label} style={{ flex: "1 1 150px", padding: "4px 20px 4px 0" }}><div style={{ fontSize: 13, color: T.faint }}>{m.label}</div><div style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em" }}>{m.n}</div><div style={{ fontSize: 12.5, color: T.tealDk }}>{m.d}</div></div>)}
          </div>
          <div style={card}>
            <h2 style={{ ...S.h2, margin: "0 0 16px" }}>Funnel</h2>
            <div role="img" aria-label="Funnel from visitors to booked visits" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.funnel.map((f) => (
                <div key={f.label} style={{ display: "grid", gridTemplateColumns: "minmax(120px,170px) minmax(0,1fr) 150px", gap: 14, alignItems: "center" }}>
                  <span style={{ fontSize: 14, color: T.ink2 }}>{f.label}</span>
                  <span style={{ height: 28, borderRadius: 8, background: T.side, overflow: "hidden" }}><span style={{ display: "flex", alignItems: "center", paddingLeft: 10, height: "100%", width: f.w, background: T.teal, color: T.card, fontSize: 13, fontWeight: 500, borderRadius: 8, transition: "width 350ms cubic-bezier(.2,.8,.2,1)", whiteSpace: "nowrap" }}>{f.n}</span></span>
                  <span style={{ fontSize: 13, color: T.faint }}>{f.pct}{f.conv ? " · " + f.conv : ""}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 20 }}>
            <div style={card}>
              <h2 style={{ ...S.h2, margin: "0 0 16px" }}>Referrals by {a.range === "7D" ? "day" : "week"}</h2>
              <div role="img" aria-label="Referrals received over time" style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 160 }}>
                {data.weekly.map((w, i) => (
                  <div key={i} title={w.tip} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                    <span style={{ fontSize: 11.5, color: T.faint }}>{w.v}</span>
                    <span style={{ width: "100%", maxWidth: 28, height: w.h, background: T.tealLt, borderRadius: "6px 6px 3px 3px", transition: "height 350ms cubic-bezier(.2,.8,.2,1)" }} />
                    <span style={{ fontSize: 11.5, color: T.faint }}>{w.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...card, display: "flex", flexDirection: "column", gap: 18 }}>
              <div><h2 style={{ ...S.h2, margin: "0 0 12px" }}>By specialty</h2><Bars rows={data.bySpec} labelW={150} valW={50} empty="No referrals in this range." /></div>
              <div><h2 style={{ ...S.h2, margin: "0 0 12px" }}>By urgency</h2><Bars rows={data.byUrg} labelW={150} valW={50} color={T.tealLt} empty="No referrals in this range." /></div>
            </div>
            <div style={card}><h2 style={{ ...S.h2, margin: "0 0 12px" }}>Top pages</h2><Bars rows={data.topPages} empty="No page views in this range." /></div>
            <div style={card}>
              <h2 style={{ ...S.h2, margin: "0 0 12px", display: "flex", gap: 8, alignItems: "center" }}><Orb size={14} />AI tool usage</h2>
              <Bars rows={data.aiUse} color={T.lav} track={T.lavWash} empty="No AI activity in this range." />
            </div>
            <div style={{ gridColumn: "1/-1", ...card }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
                <h2 style={{ ...S.h2, flex: 1, display: "flex", gap: 8, alignItems: "center" }}><i className="ph ph-arrow-square-out" style={{ color: T.teal }} />Outbound to partner sites</h2>
                <span style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em" }}>{data.outTotalL}</span><span style={{ fontSize: 13, color: T.faint }}>{data.outPctL}</span>
              </div>
              <p style={{ margin: "0 0 16px", fontSize: 13.5, color: T.faint }}>People who left anrahealth.com or My Health Space through a link to another site. Counted as clicks; no health data is shared with the destination.</p>
              {data.outbound.length === 0 && <p style={{ margin: 0, fontSize: 13.5, color: T.faint }}>No outbound clicks in this range yet.</p>}
              <div role="img" aria-label="Outbound clicks by destination" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.outbound.map((o) => (
                  <div key={o.label} style={{ display: "grid", gridTemplateColumns: "minmax(160px,220px) minmax(0,1fr) 110px", gap: 14, alignItems: "center", fontSize: 13.5 }}>
                    <span><span style={{ display: "block", fontSize: 14.5, fontWeight: 500, color: T.ink }}>{o.label}</span><span style={{ display: "block", fontSize: 12.5, color: T.faint }}>{o.domain} · {o.why}</span></span>
                    <span style={{ height: 8, borderRadius: 999, background: T.side, overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: o.w, background: T.teal, borderRadius: 999, transition: "width 350ms cubic-bezier(.2,.8,.2,1)" }} /></span>
                    <span style={{ textAlign: "right" }}><span style={{ fontWeight: 500 }}>{o.v}</span> <span style={{ color: T.faint }}>· {o.pct}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
