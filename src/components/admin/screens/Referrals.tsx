"use client";

import React, { useState } from "react";
import type { RefDTO } from "@/lib/admin/types";
import { useAdmin, useView } from "../context";
import { T, S, Chip, TestTag, Empty, Failed, BlockSkeleton } from "../ui";
import { refUrg, refSt } from "./Patient360";

const STAGES = ["Received", "Reviewed", "Scheduled", "Closed"] as const;

/** Ask to move a referral to a new stage (Scheduled asks for a date first). */
export function moveReferral(a: ReturnType<typeof useAdmin>, r: RefDTO, to: string) {
  if (r.status === to) return;
  if (to === "Scheduled") return a.openForm("schedule", r.pid || "", { refId: r.id, code: r.code, patient: r.patient });
  a.confirm({
    title: `Move ${r.code} to ${to}?`,
    body: to === "Closed" ? "Closing ends the referral workflow. The referral stays in the record and can be reopened."
      : to === "Received" ? `This reopens the referral for ${r.patient} and clears the reviewer. The change is recorded in the audit log.`
      : `This changes the referral’s workflow status for ${r.patient}. The change is recorded in the audit log.`,
    label: "Move to " + to,
    run: () => a.act({ action: "referral.status", id: r.id, status: to.toLowerCase() }, { success: `Referral ${r.code} moved to ${to}`, sub: "Status history and audit log updated.", undoable: true }),
  });
}

export default function Referrals() {
  const a = useAdmin();
  const { data, error, loading, reload } = useView<{ rows: RefDTO[] }>("referrals");
  const [view, setView] = useState<"list" | "board">("list");
  const [f, setF] = useState({ urgency: "All", status: "All", specialty: "All" });
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const all = data?.rows || [];
  const uniq = (xs: string[]) => ["All", ...[...new Set(xs)].sort()];
  const specs = uniq(all.flatMap((r) => r.specialty.split(", ")));
  const list = all.filter((r) => (f.urgency === "All" || r.urgency === f.urgency) && (f.status === "All" || r.status === f.status) && (f.specialty === "All" || r.specialty.split(", ").includes(f.specialty)));
  const sel = (k: keyof typeof f, label: string, opts: string[]) => (
    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: T.ink2 }}>{label}
      <select value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} style={{ height: 36, borderRadius: 10, border: `1px solid ${T.line3}`, background: T.card, padding: "0 10px", fontSize: 14, color: T.ink }}>{opts.map((o) => <option key={o} value={o}>{o}</option>)}</select>
    </label>
  );
  const td = { padding: "12px 8px", borderTop: `1px solid ${T.line}` };

  return (
    <section data-screen-label="08 Referrals" style={{ display: "flex", flexDirection: "column", gap: 18, animation: "anraFade 260ms ease-out" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ ...S.h1, flex: 1 }}>Referrals</h1>
        <div role="group" aria-label="View" style={{ display: "flex", gap: 2, padding: 3, borderRadius: 12, background: T.stone }}>
          {([["list", "List", "ph-list"], ["board", "Board", "ph-kanban"]] as const).map(([k, l, ic]) => (
            <button key={k} onClick={() => setView(k)} aria-pressed={view === k} style={{ height: 32, padding: "0 12px", border: "none", borderRadius: 9, background: view === k ? T.card : "transparent", color: view === k ? T.ink : T.ink2, boxShadow: view === k ? "0 1px 3px rgba(29,35,39,.12)" : "none", fontSize: 13.5, fontWeight: 500, cursor: "pointer", display: "inline-flex", gap: 6, alignItems: "center", transition: "all 220ms", whiteSpace: "nowrap" }}><i className={"ph " + ic} />{l}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {sel("urgency", "Urgency", uniq(all.map((r) => r.urgency)))}{sel("status", "Status", ["All", ...STAGES])}{sel("specialty", "Specialty", specs)}
      </div>
      {loading && <BlockSkeleton />}
      {error && !data && <Failed what="referrals" onRetry={reload} />}
      {data && list.length === 0 && <Empty icon="ph-check-circle" title={all.length ? "No referrals match" : "No referrals yet"} sub={all.length ? "Try different filters." : "Referrals sent through the Referral Centre appear here."} />}
      {list.length > 0 && view === "list" && (
        <div style={{ ...S.card, overflowX: "auto", animation: "anraFade 200ms" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 1120 }}>
            <thead><tr style={{ textAlign: "left", color: T.ink2, fontSize: 13 }}>
              <th style={{ ...S.th, padding: "12px 8px 12px 20px" }}>Patient</th><th style={S.th}>Type</th><th style={S.th}>Urgency</th><th style={S.th}>Specialty</th><th style={S.th}>Requested</th><th style={S.th}>Referring physician</th><th style={S.th}>Status</th><th style={S.th}>Received</th><th style={S.th}>Scheduled</th><th style={{ ...S.th, padding: "12px 20px 12px 8px" }}>Reviewed by</th>
            </tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} onClick={() => a.openRef(r.id)} className="h-row" style={{ cursor: "pointer" }}>
                  <td style={{ ...td, padding: "12px 8px 12px 20px" }}><span style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 500 }}>{r.patient}<TestTag show={r.test} /></span><span style={{ display: "block", fontSize: 12, color: T.faint }}>{r.code}</span></td>
                  <td style={{ ...td, color: T.ink2 }}>{r.type}</td>
                  <td style={td}><Chip c={refUrg(r.urgency)} /></td>
                  <td style={td}>{r.specialty}</td>
                  <td style={{ ...td, color: T.ink2 }}>{r.requested}</td>
                  <td style={{ ...td, color: T.ink2, maxWidth: 220 }}>{r.referring}</td>
                  <td style={td}><Chip c={refSt(r.status)} /></td>
                  <td style={{ ...td, color: T.ink2, whiteSpace: "nowrap" }}>{r.received}</td>
                  <td style={{ ...td, color: T.ink2, whiteSpace: "nowrap" }}>{r.scheduled}</td>
                  <td style={{ ...td, padding: "12px 20px 12px 8px", color: T.ink2 }}>{r.reviewer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {list.length > 0 && view === "board" && (
        <>
          <p style={{ margin: "-6px 0 0", fontSize: 13.5, color: T.faint }}>{a.canEdit ? "Drag a card to change its stage. Every move asks for confirmation and is logged." : "Read-only on phone."}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(240px,1fr))", gap: 14, overflowX: "auto", paddingBottom: 6, animation: "anraFade 200ms" }}>
            {STAGES.map((st) => {
              const items = list.filter((r) => r.status === st);
              const hot = over === st;
              return (
                <div key={st}
                  onDragOver={(e) => { if (!a.canEdit) return; e.preventDefault(); if (over !== st) setOver(st); }}
                  onDragLeave={() => setOver(null)}
                  onDrop={(e) => { e.preventDefault(); setOver(null); const id = drag || e.dataTransfer.getData("text/plain"); const r = all.find((x) => x.id === id); setDrag(null); if (r) moveReferral(a, r, st); }}
                  style={{ background: hot ? T.wash : T.side, border: `1.5px dashed ${hot ? T.tealLt : "transparent"}`, borderRadius: 20, padding: 12, display: "flex", flexDirection: "column", gap: 8, minHeight: 360, transition: "background 200ms,border-color 200ms" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 6px 6px" }}><span style={{ fontSize: 14, fontWeight: 600 }}>{st}</span><span style={{ fontSize: 13, color: T.faint }}>{items.length}</span></div>
                  {items.length === 0 && <div style={{ padding: 18, textAlign: "center", fontSize: 13.5, color: T.faint }}>No referrals in this stage.</div>}
                  {items.map((r) => (
                    <div key={r.id} draggable={a.canEdit} onDragStart={(e) => { try { e.dataTransfer.setData("text/plain", r.id); } catch { /* */ } setDrag(r.id); }} onDragEnd={() => { setDrag(null); setOver(null); }}
                      onClick={() => a.openRef(r.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && a.openRef(r.id)} className="h-lift2"
                      style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 16, padding: "12px 14px", cursor: a.canEdit ? "grab" : "pointer", opacity: drag === r.id ? 0.45 : 1, display: "flex", flexDirection: "column", gap: 6, transition: "box-shadow 200ms" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ fontSize: 14.5, fontWeight: 500, display: "flex", gap: 6, alignItems: "center" }}>{r.patient}<TestTag show={r.test} /></span><span style={{ fontSize: 12, color: T.faint, whiteSpace: "nowrap", flex: "none" }}>{r.code}</span></div>
                      <div style={{ fontSize: 13, color: T.ink2 }}>{r.type} · {r.specialty}</div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}><Chip c={refUrg(r.urgency)} h={22} /><span style={{ fontSize: 12.5, color: T.faint }}>{r.received}</span></div>
                      <div style={{ fontSize: 12.5, color: T.faint }}>Reviewer: {r.reviewer}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
