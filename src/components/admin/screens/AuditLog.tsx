"use client";

import React, { useState } from "react";
import type { AuditDTO } from "@/lib/admin/types";
import { useAdmin, useView, downloadFile } from "../context";
import { T, S, chip, Chip, Empty, Failed, BlockSkeleton, SearchBox } from "../ui";
import { auditChip } from "./Patient360";

export default function AuditLog() {
  const a = useAdmin();
  const { data, error, loading, reload } = useView<{ rows: AuditDTO[] }>("audit");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("All");
  const aq = q.trim().toLowerCase();
  const rows = (data?.rows || []).filter((e) => (kind === "All" || e.kind === kind) && (!aq || [e.who, e.subject, e.action, e.resource, e.ip].some((x) => (x || "").toLowerCase().includes(aq))));
  const td = { padding: "11px 8px", borderTop: `1px solid ${T.line}` };
  return (
    <section data-screen-label="17 Audit Log" style={{ display: "flex", flexDirection: "column", gap: 18, animation: "anraFade 260ms ease-out" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}><h1 style={S.h1}>Audit Log</h1><p style={{ margin: "4px 0 0", color: T.ink2 }}>Every access to or change of protected information, as required under Alberta's Health Information Act. Entries can't be edited or deleted.</p></div>
        <button onClick={() => a.act({ action: "export.audit" }, { success: "Audit log exported", sub: "CSV · logged to audit", after: (r) => r.file && downloadFile(r.file) })} className="h-sand" style={S.btn2}><i className="ph ph-download-simple" />Export CSV</button>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <SearchBox value={q} onChange={setQ} placeholder="Staff, patient, action, resource or IP" label="Filter audit log" style={{ flex: "1 1 280px", maxWidth: 420 }} />
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {["All", "View", "Reveal", "Change", "Export", "Account"].map((k) => <button key={k} onClick={() => setKind(k)} style={{ height: 34, padding: "0 12px", borderRadius: 999, border: "none", background: kind === k ? T.ink : "transparent", color: kind === k ? T.card : T.ink2, fontSize: 13.5, fontWeight: 500, cursor: "pointer", transition: "all 200ms", whiteSpace: "nowrap" }}>{k}</button>)}
        </div>
        <span style={{ fontSize: 13, color: T.faint }}>{rows.length} events</span>
      </div>
      {loading && <BlockSkeleton />}
      {error && !data && <Failed what="the audit log" onRetry={reload} sub="No audit entries were lost. Recording continues in the background." />}
      {data && rows.length === 0 && <Empty title="No matching events" sub="Try a different staff member, patient or action type." />}
      {rows.length > 0 && (
        <div style={{ ...S.card, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 1040 }}>
            <thead><tr style={{ textAlign: "left", color: T.ink2, fontSize: 13 }}>
              <th style={{ ...S.th, padding: "12px 8px 12px 20px" }}>Timestamp</th><th style={S.th}>Who</th><th style={S.th}>Role</th><th style={S.th}>Type</th><th style={S.th}>Action</th><th style={S.th}>Resource</th><th style={S.th}>Patient / visitor</th><th style={S.th}>IP</th><th style={{ ...S.th, padding: "12px 20px 12px 8px" }}>Result</th>
            </tr></thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} onClick={() => a.openAudit(e.id)} className="h-row" style={{ cursor: "pointer" }}>
                  <td style={{ ...td, padding: "11px 8px 11px 20px", color: T.ink2, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{e.ts}</td>
                  <td style={{ ...td, fontWeight: 500 }}>{e.who}</td>
                  <td style={{ ...td, color: T.ink2 }}>{e.role}</td>
                  <td style={td}><Chip c={auditChip(e.kind)} /></td>
                  <td style={td}>{e.action}</td>
                  <td style={{ ...td, color: T.ink2 }}>{e.resource}</td>
                  <td style={td}>{e.subject}</td>
                  <td style={{ ...td, color: T.ink2, fontVariantNumeric: "tabular-nums" }}>{e.ip}</td>
                  <td style={{ ...td, padding: "11px 20px 11px 8px" }}><Chip c={e.result === "Success" ? chip("Success", "teal", "ph-check") : chip(e.result, "urgent", "ph-x")} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
