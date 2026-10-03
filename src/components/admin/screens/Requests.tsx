"use client";

// Service requests from the new NEYU service pages: virtual care, the Virtual
// Hypertension Clinic, packages / executive health, membership and at-home
// collection. Staff follow up and move each request through its status.
import React, { useState } from "react";
import { useAdmin, useView } from "../context";
import { T, S, Empty, Failed, BlockSkeleton } from "../ui";

type Req = { id: string; when: string; service: string; choice: string; name: string; email: string; phone: string; postal: string; message: string; page: string; status: string };
const LABEL: Record<string, string> = { "virtual-care": "Virtual care", "hypertension-clinic": "Hypertension clinic", package: "Package", membership: "Membership", "at-home": "At-home collection", contact: "Contact message", careers: "Careers interest" };
const STATUSES = ["new", "contacted", "booked", "closed"];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Requests() {
  const a = useAdmin();
  const { data, error, loading, reload } = useView<{ rows: Req[] }>("requests");
  const [svc, setSvc] = useState("All"), [st, setSt] = useState("All"), [open, setOpen] = useState<string | null>(null);
  const all = data?.rows || [];
  const list = all.filter((r) => (svc === "All" || r.service === svc) && (st === "All" || r.status === st));
  const counts = STATUSES.map((s) => [s, all.filter((r) => r.status === s).length] as const);
  const move = (r: Req, status: string) => a.act({ action: "request.status", id: r.id, status }, { success: `${r.name}: ${cap(status)}`, sub: "Recorded in the audit log.", after: () => reload() });
  const sel = (value: string, set: (v: string) => void, label: string, opts: [string, string][]) => (
    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: T.ink2 }}>{label}
      <select value={value} onChange={(e) => set(e.target.value)} style={{ height: 36, borderRadius: 10, border: `1px solid ${T.line3}`, background: T.card, padding: "0 10px", fontSize: 14, color: T.ink }}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
    </label>
  );
  return (
    <section data-screen-label="Service requests" style={{ display: "flex", flexDirection: "column", gap: 18, animation: "anraFade 260ms ease-out" }}>
      <h1 style={S.h1}>Service requests</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
        {counts.map(([s, n]) => <button key={s} onClick={() => setSt(st === s ? "All" : s)} aria-pressed={st === s} style={{ ...S.card, padding: 14, textAlign: "left", cursor: "pointer", borderColor: st === s ? T.teal : T.line }}><div style={{ fontSize: 26, fontWeight: 500 }}>{n}</div><div style={{ fontSize: 13, color: T.ink2 }}>{cap(s)}</div></button>)}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {sel(svc, setSvc, "Service", [["All", "All"], ...Object.entries(LABEL)])}
        {sel(st, setSt, "Status", [["All", "All"], ...STATUSES.map((s) => [s, cap(s)] as [string, string])])}
      </div>
      {loading && <BlockSkeleton />}
      {error && !data && <Failed what="service requests" onRetry={reload} />}
      {data && list.length === 0 && <Empty icon="ph-calendar-plus" title={all.length ? "No requests match" : "No service requests yet"} sub={all.length ? "Try different filters." : "Requests from Virtual Care, the Hypertension Clinic, Packages, Membership, At-home collection, Contact and Careers appear here."} />}
      {list.length > 0 && (
        <div style={{ ...S.card, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 760 }}>
            <thead><tr style={{ color: T.ink2, textAlign: "left" }}><th style={S.th}>Received</th><th style={S.th}>Service</th><th style={S.th}>Request</th><th style={S.th}>Name</th><th style={S.th}>Contact</th><th style={S.th}>Status</th></tr></thead>
            <tbody>
              {list.map((r) => (
                <React.Fragment key={r.id}>
                  <tr onClick={() => setOpen(open === r.id ? null : r.id)} style={{ cursor: "pointer", background: open === r.id ? T.hover : "transparent" }}>
                    <td style={S.td}>{new Date(r.when).toLocaleString("en-CA", { timeZone: "America/Edmonton", dateStyle: "medium", timeStyle: "short" })}</td>
                    <td style={S.td}>{LABEL[r.service] || r.service}</td>
                    <td style={S.td}>{r.choice || "—"}</td>
                    <td style={S.td}>{r.name}</td>
                    <td style={S.td}><a href={`mailto:${r.email}`} onClick={(e) => e.stopPropagation()} style={{ color: T.teal }}>{r.email}</a>{r.phone && <div style={{ color: T.ink2 }}>{r.phone}</div>}</td>
                    <td style={S.td} onClick={(e) => e.stopPropagation()}>
                      <select aria-label={`Status for ${r.name}`} value={r.status} onChange={(e) => move(r, e.target.value)} style={{ height: 32, borderRadius: 9, border: `1px solid ${T.line3}`, background: r.status === "new" ? T.wash : T.card, padding: "0 8px", fontSize: 13 }}>{STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}</select>
                    </td>
                  </tr>
                  {open === r.id && <tr><td colSpan={6} style={{ ...S.td, background: T.hover, color: T.ink2 }}>{r.message ? <p style={{ margin: "0 0 6px", color: T.ink }}>“{r.message}”</p> : <p style={{ margin: "0 0 6px" }}>No message.</p>}{r.postal && <span>Postal code: {r.postal} · </span>}From page: {r.page || "—"}</td></tr>}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
