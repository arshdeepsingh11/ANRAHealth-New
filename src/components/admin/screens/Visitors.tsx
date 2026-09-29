"use client";

import React, { useState } from "react";
import type { VisitorRow, VisitorDTO } from "@/lib/admin/types";
import { useAdmin, useView } from "../context";
import { T, S, chip, Chip, TestTag, Empty, Failed, BlockSkeleton, SearchBox, TabBar, RecordSkeleton, CaretRow } from "../ui";
import { decAI } from "./AiActivity";
import { refSt, auditChip } from "./Patient360";

const vChip = (s: VisitorRow["status"]) => s === "Converted" ? chip("Converted", "teal", "ph-user-check") : s === "Active" ? chip("Active now", "teal", "ph-circle") : chip("Idle", "neutral", "ph-moon");

export default function Visitors() {
  const a = useAdmin();
  const { data, error, loading, reload } = useView<{ rows: VisitorRow[] }>("visitors");
  const [q, setQ] = useState("");
  const vq = q.trim().toLowerCase();
  const rows = (data?.rows || []).filter((v) => !vq || v.id.toLowerCase().includes(vq) || (v.referral || "").toLowerCase().includes(vq));
  const td = { padding: "12px 8px", borderTop: `1px solid ${T.line}` };
  return (
    <section data-screen-label="06 Visitors" style={{ display: "flex", flexDirection: "column", gap: 18, animation: "anraFade 260ms ease-out" }}>
      <div><div style={{ fontSize: 13, color: T.faint }}>People</div><h1 style={S.h1}>Visitors</h1><p style={{ margin: "4px 0 0", color: T.ink2 }}>Anonymous people identified only by visitor ID. History merges into the patient record on sign-up.</p></div>
      <SearchBox value={q} onChange={setQ} placeholder="Visitor ID or referral ID" label="Search visitors" style={{ maxWidth: 380 }} />
      {loading && <BlockSkeleton h={320} />}
      {error && !data && <Failed what="visitors" onRetry={reload} />}
      {data && rows.length === 0 && <Empty title="No visitors found" sub={data.rows.length ? "Check the visitor ID. IDs look like v_7Q2K9X." : "Anonymous visitors appear here after their first page view."} />}
      {rows.length > 0 && (
        <div style={{ ...S.card, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 900 }}>
            <thead><tr style={{ textAlign: "left", color: T.ink2, fontSize: 13 }}>
              <th style={{ ...S.th, padding: "12px 8px 12px 20px" }}>Visitor ID</th><th style={S.th}>First seen</th><th style={S.th}>Last seen</th><th style={S.th}>Pages</th><th style={S.th}>AI tools</th><th style={S.th}>Referral</th><th style={S.th}>Status</th><th style={{ ...S.th, padding: "12px 20px 12px 8px" }}>Converted to patient</th>
            </tr></thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id} onClick={() => a.go({ s: "visitor", id: v.id })} className="h-row" style={{ cursor: "pointer" }}>
                  <td style={{ ...td, padding: "12px 8px 12px 20px" }}><span style={{ display: "inline-flex", gap: 8, alignItems: "center", fontWeight: 500 }}><i className="ph ph-user-circle-dashed" style={{ fontSize: 20, color: T.faint }} />{v.id}<TestTag show={v.test} /></span></td>
                  <td style={{ ...td, color: T.ink2 }}>{v.first}</td><td style={{ ...td, color: T.ink2 }}>{v.last}</td><td style={td}>{v.pages}</td>
                  <td style={{ ...td, color: T.ink2 }}>{v.tools.join(", ") || "—"}</td><td style={{ ...td, color: T.ink2 }}>{v.referral || "—"}</td>
                  <td style={td}><Chip c={vChip(v.status)} /></td>
                  <td style={{ ...td, padding: "12px 20px 12px 8px" }}>{v.pid && <button onClick={(e) => { e.stopPropagation(); a.go({ s: "patient", id: v.pid!, tab: "timeline" }); }} className="h-line" style={{ border: "none", background: "none", padding: 0, color: T.tealDk, fontSize: 14, cursor: "pointer", display: "inline-flex", gap: 5, alignItems: "center" }}>{v.pname}<i className="ph ph-arrow-up-right" /></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const V_TABS: [string, string][] = [["overview", "Overview"], ["timeline", "Timeline"], ["pages", "Pages"], ["ai", "AI Activity"], ["referrals", "Referrals"], ["conversion", "Conversion"], ["audit", "Audit"]];
const emptyCard = (title: string, sub?: string) => <div style={{ padding: 40, borderRadius: 20, background: T.card, border: `1px solid ${T.line}`, textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 500 }}>{title}</div>{sub && <div style={{ color: T.ink2, fontSize: 14 }}>{sub}</div>}</div>;

export function VisitorRecord({ id, tab }: { id: string; tab: string }) {
  const a = useAdmin();
  const { data: v, error, loading, reload } = useView<VisitorDTO>("visitor", { id }, { logFirst: true });
  if (loading) return <RecordSkeleton />;
  if (error && !v) return <Failed what="this visitor" onRetry={reload} />;
  if (!v) return null;
  const st = v.pid ? chip("Converted to patient", "teal", "ph-user-check") : chip("Anonymous · " + v.status, "neutral", "ph-user-circle-dashed");
  const openPt = () => v.pid && a.go({ s: "patient", id: v.pid, tab: "timeline" });
  const stat = (label: string, value: React.ReactNode, big = false) => <div style={{ ...S.card, borderRadius: 18, padding: "16px 18px" }}><div style={{ fontSize: 13, color: T.faint }}>{label}</div><div style={big ? { fontSize: 24, fontWeight: 500 } : { fontSize: 15.5, fontWeight: 500, marginTop: 4 }}>{value}</div></div>;
  return (
    <section data-screen-label="07 Visitor Record" style={{ display: "flex", flexDirection: "column", gap: 22, animation: "anraFade 260ms ease-out" }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <span style={{ width: 64, height: 64, flex: "none", borderRadius: "50%", background: T.stone, color: T.ink2, display: "grid", placeItems: "center", fontSize: 28 }}><i className="ph ph-user-circle-dashed" /></span>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}><h1 style={S.h1}>{v.id}</h1><Chip c={st} /><TestTag show={v.test} /></div>
          <div style={{ display: "flex", gap: "6px 18px", flexWrap: "wrap", fontSize: 14, color: T.ink2 }}><span>First seen {v.first}</span><span>Last seen {v.last}</span><span>{v.device}</span></div>
        </div>
        {v.pid && <button onClick={openPt} className="h-primary" style={S.btnP}><i className="ph ph-user-check" />Open {v.pname}'s Patient 360</button>}
      </div>
      <TabBar tabs={V_TABS} active={tab} onPick={a.setTab} label="Visitor record sections" />
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, animation: "anraFade 220ms" }}>
          {stat("Pages visited", v.pages, true)}{stat("AI tools used", v.tools.join(", ") || "None")}{stat("Referral", v.referral || "None")}{stat("Conversion", st.text)}
        </div>
      )}
      {tab === "timeline" && (
        <ol style={{ listStyle: "none", margin: 0, padding: "8px 22px", ...S.card }}>
          {v.tlv.map((t, i) => <li key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: `1px solid ${T.line}` }}><span style={{ width: 130, flex: "none", fontSize: 13, color: T.faint }}>{t.t}</span><i className={t.icon} style={{ fontSize: 18, color: T.teal }} /><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 15, fontWeight: 500 }}>{t.title}</span><span style={{ display: "block", fontSize: 13.5, color: T.ink2 }}>{t.detail}</span></span></li>)}
        </ol>
      )}
      {tab === "pages" && (v.pagesL.length === 0 ? emptyCard("No page views recorded") : (
        <div style={{ ...S.card, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr style={{ textAlign: "left", color: T.ink2, fontSize: 13 }}><th style={{ padding: "12px 20px", fontWeight: 500 }}>Page</th><th style={S.th}>When</th><th style={{ ...S.th, padding: "12px 20px 12px 8px" }}>Time on page</th></tr></thead>
            <tbody>{v.pagesL.map((p, i) => <tr key={i}><td style={{ padding: "10px 20px", borderTop: `1px solid ${T.line}`, fontWeight: 500 }}>{p.url}</td><td style={{ padding: "10px 8px", borderTop: `1px solid ${T.line}`, color: T.ink2 }}>{p.when}</td><td style={{ padding: "10px 20px 10px 8px", borderTop: `1px solid ${T.line}`, color: T.ink2 }}>{p.dur}</td></tr>)}</tbody>
          </table>
        </div>
      ))}
      {tab === "ai" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {v.ais.length === 0 && emptyCard("No AI activity", "This visitor hasn't used ALBA or any AI tools.")}
          {v.ais.map((x) => { const d = decAI(x); return (
            <button key={x.key} onClick={() => a.openAI(x.key)} className="h-lift" style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 18px", borderRadius: 18, background: T.card, border: `1px solid ${T.line}`, textAlign: "left", cursor: "pointer", width: "100%" }}>
              <span style={{ width: 36, height: 36, borderRadius: 11, background: T.lavWash, color: T.lavInk, display: "grid", placeItems: "center", fontSize: 18, flex: "none" }}><i className={d.icon} /></span>
              <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 15, fontWeight: 500, color: T.ink }}>{d.kindL} · {x.date}, {x.time}</span><span style={{ display: "block", fontSize: 13.5, color: T.ink2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.line}</span></span>
              <Chip c={d.st} />
            </button>
          ); })}
        </div>
      )}
      {tab === "referrals" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {v.refs.length === 0 && emptyCard("No referral submissions")}
          {v.refs.map((r) => <button key={r.id} onClick={() => a.openRef(r.id)} className="h-lift" style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 18px", borderRadius: 18, background: T.card, border: `1px solid ${T.line}`, textAlign: "left", cursor: "pointer", width: "100%" }}><span style={{ flex: 1 }}><span style={{ display: "block", fontSize: 15, fontWeight: 500, color: T.ink }}>{r.code} · {r.patient} · {r.specialty}</span><span style={{ display: "block", fontSize: 13.5, color: T.ink2 }}>Received {r.received}</span></span><Chip c={refSt(r.status)} /></button>)}
        </div>
      )}
      {tab === "conversion" && (
        <div style={{ ...S.card, padding: 22 }}>
          {v.pid ? (
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <i className="ph-fill ph-user-check" style={{ fontSize: 26, color: T.teal }} />
              <div style={{ flex: 1, minWidth: 220 }}><div style={{ fontSize: 16, fontWeight: 500 }}>Converted to patient</div><div style={{ fontSize: 14, color: T.ink2 }}>Signed up on {v.convertedOn}. All visitor activity was merged into {v.pname}'s record and labelled "Before sign-up". Nothing was deleted.</div></div>
              <button onClick={openPt} className="h-sand" style={S.btn2}>Open patient record</button>
            </div>
          ) : <><div style={{ fontSize: 16, fontWeight: 500 }}>Not converted</div><div style={{ fontSize: 14, color: T.ink2 }}>If this visitor signs up in My Health Space, their history merges into the new patient record automatically.</div></>}
        </div>
      )}
      {tab === "audit" && (v.audit.length === 0 ? emptyCard("No staff access recorded", "Views of this visitor's record and AI activity appear here and in the Audit Log.") : (
        <div style={{ ...S.card, overflow: "hidden" }}>
          {v.audit.map((e) => <button key={e.id} onClick={() => a.openAudit(e.id)} className="h-row" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", width: "100%", padding: "14px 20px", border: "none", borderBottom: `1px solid ${T.line}`, background: "transparent", textAlign: "left", cursor: "pointer" }}><Chip c={auditChip(e.kind)} style={{ minWidth: 84 }} /><span style={{ flex: "1 1 240px", minWidth: 0 }}><span style={{ display: "block", fontSize: 14.5, fontWeight: 500, color: T.ink }}>{e.action} · {e.resource}</span><span style={{ display: "block", fontSize: 13, color: T.faint }}>{e.who} · {e.ip}</span></span><span style={{ fontSize: 13, color: T.ink2 }}>{e.ts}</span><CaretRow /></button>)}
        </div>
      ))}
    </section>
  );
}
