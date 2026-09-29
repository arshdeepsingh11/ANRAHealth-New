"use client";

import React, { useMemo, useState } from "react";
import type { PatientRow } from "@/lib/admin/types";
import { useAdmin, useView, downloadFile } from "../context";
import { T, S, chip, Chip, TestTag, Empty, Failed, SearchBox, RowsSkeleton } from "../ui";

type SortKey = "name" | "age" | "last" | "devices" | "appt";
const PS = 8;

export default function Patients() {
  const a = useAdmin();
  const { data, error, loading, reload } = useView<{ rows: PatientRow[] }>("patients");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [saved, setSaved] = useState<string | null>(null);
  const [sort, setSort] = useState<{ k: SortKey; dir: 1 | -1 }>({ k: "name", dir: 1 });
  const [page, setPage] = useState(0);
  const [hover, setHover] = useState<string | null>(null);

  const list = useMemo(() => {
    const pq = q.trim().toLowerCase();
    let l = (data?.rows || []).filter((p) => !pq || [p.name, p.email, p.phone, p.id].some((x) => x.toLowerCase().includes(pq)));
    if (filter === "verified") l = l.filter((p) => p.verified);
    if (filter === "unverified") l = l.filter((p) => !p.verified);
    if (filter === "consent") l = l.filter((p) => !(p.consent.wearables && p.consent.labs && p.consent.clinical && p.consent.alba));
    if (saved === "appt") l = l.filter((p) => p.nextApptAt);
    if (saved === "devices") l = l.filter((p) => p.staleDevice);
    const key: Record<SortKey, (p: PatientRow) => string | number> = { name: (p) => p.name.toLowerCase(), age: (p) => p.age ?? -1, last: (p) => p.lastMins, devices: (p) => p.devices, appt: (p) => p.nextApptAt ?? 9e15 };
    return [...l].sort((x, y) => { const m = key[sort.k](x), n = key[sort.k](y); return (m > n ? 1 : m < n ? -1 : 0) * sort.dir; });
  }, [data, q, filter, saved, sort]);

  const pages = Math.max(1, Math.ceil(list.length / PS)), pg = Math.min(page, pages - 1);
  const rows = list.slice(pg * PS, pg * PS + PS);
  const head = (k: SortKey, l: string, pad = "12px 8px") => {
    const on = sort.k === k;
    return (
      <th scope="col" aria-sort={on ? (sort.dir > 0 ? "ascending" : "descending") : "none"} style={{ position: "sticky", top: 0, background: T.card, padding: pad, borderBottom: `1px solid ${T.line2}`, fontWeight: 500 }}>
        <button onClick={() => setSort((s) => ({ k, dir: s.k === k ? (-s.dir as 1 | -1) : 1 }))} style={{ whiteSpace: "nowrap", border: "none", background: "none", padding: 0, fontSize: 13, fontWeight: 500, color: on ? T.ink : T.ink2, cursor: "pointer", display: "inline-flex", gap: 4, alignItems: "center" }}>{l}<i className={on ? (sort.dir > 0 ? "ph ph-caret-up" : "ph ph-caret-down") : "ph ph-caret-up-down"} /></button>
      </th>
    );
  };
  const th = (l: string) => <th scope="col" style={{ position: "sticky", top: 0, background: T.card, padding: "12px 8px", borderBottom: `1px solid ${T.line2}`, fontSize: 13, fontWeight: 500, color: T.ink2 }}>{l}</th>;
  const exportCsv = () => a.act({ action: "export.patients" }, { success: "Patient list exported", sub: `${data?.rows.length || 0} rows · health data excluded · logged to audit`, after: (r) => r.file && downloadFile(r.file) });
  const clear = () => { setQ(""); setFilter("all"); setSaved(null); setSort({ k: "name", dir: 1 }); setPage(0); };

  return (
    <section data-screen-label="04 Patients" style={{ display: "flex", flexDirection: "column", gap: 18, animation: "anraFade 260ms ease-out" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: T.faint }}>People</div><h1 style={S.h1}>Patients</h1></div>
        <button onClick={exportCsv} className="h-sand" style={S.btn2}><i className="ph ph-download-simple" />Export CSV</button>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <SearchBox value={q} onChange={(v) => { setQ(v); setPage(0); }} placeholder="Name, email, phone or patient ID" label="Search patients" style={{ flex: "1 1 280px", maxWidth: 380 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {([["all", "All"], ["verified", "Verified"], ["unverified", "Unverified"], ["consent", "Consent limited"]] as const).map(([k, l]) => {
            const on = filter === k;
            return <button key={k} onClick={() => { setFilter(k); setPage(0); }} style={{ height: 34, padding: "0 12px", borderRadius: 999, border: `1px solid ${on ? T.chip : "rgba(29,35,39,.12)"}`, background: on ? T.chip : T.card, color: on ? T.tealDk : T.ink2, fontSize: 13.5, fontWeight: 500, cursor: "pointer", transition: "all 180ms", whiteSpace: "nowrap" }}>{l}</button>;
          })}
        </div>
        <span style={{ width: 1, height: 22, background: "rgba(29,35,39,.1)" }} />
        <span style={{ fontSize: 13, color: T.faint }}>Saved</span>
        {([["appt", "Upcoming visits", "ph-calendar"], ["devices", "Devices not syncing", "ph-watch"]] as const).map(([k, l, ic]) => {
          const on = saved === k;
          return <button key={k} onClick={() => { setSaved(on ? null : k); setPage(0); }} className="h-stone" style={{ height: 34, padding: "0 10px", borderRadius: 10, border: "none", background: on ? T.chip : "transparent", color: on ? T.tealDk : T.ink2, fontSize: 13.5, fontWeight: 500, cursor: "pointer", display: "inline-flex", gap: 6, alignItems: "center", whiteSpace: "nowrap" }}><i className={(on ? "ph-fill " : "ph ") + ic} />{l}</button>;
        })}
      </div>

      {loading && <RowsSkeleton rows={6} avatar={32} round />}
      {error && !data && <Failed what="patients" onRetry={reload} />}
      {data && list.length === 0 && (
        data.rows.length === 0
          ? <Empty icon="ph-users" title="No patients yet" sub="People who create a My Health Space account appear here." />
          : <Empty icon="ph-users" title="No patients match" sub="Try a different name, email or patient ID." action={<button onClick={clear} className="h-sand" style={{ ...S.btn2, marginTop: 10, padding: "0 16px" }}>Clear filters</button>} />
      )}
      {data && list.length > 0 && (
        <div style={S.card}>
          <div style={{ overflowX: "auto", borderRadius: "20px 20px 0 0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 980 }}>
              <thead><tr style={{ textAlign: "left" }}>
                {head("name", "Name", "12px 8px 12px 20px")}{th("Email")}{th("Verification")}{head("age", "Age")}{head("last", "Last active")}{head("devices", "Devices")}{th("Consent")}{head("appt", "Next appointment", "12px 20px 12px 8px")}
              </tr></thead>
              <tbody>
                {rows.map((p) => {
                  const cc = [p.consent.wearables, p.consent.labs, p.consent.clinical, p.consent.alba].filter(Boolean).length;
                  const hov = hover === p.id && a.canEdit;
                  const open = () => a.go({ s: "patient", id: p.id });
                  const td = { padding: "12px 8px", borderBottom: `1px solid ${T.line}` };
                  return (
                    <tr key={p.id} onClick={open} onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)} style={{ cursor: "pointer", background: hover === p.id ? T.hover : "transparent", transition: "background 150ms" }}>
                      <td style={{ ...td, padding: "12px 8px 12px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ width: 34, height: 34, flex: "none", borderRadius: "50%", background: T.chip, color: T.tealDk, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 600 }}>{p.initials}</span>
                          <span><span style={{ display: "block", fontWeight: 500, fontSize: 14.5, whiteSpace: "nowrap" }}>{p.name}</span><span style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: T.faint, whiteSpace: "nowrap" }}>{p.id}{p.acct !== "Active" ? " · " + p.acct : ""}<TestTag show={p.test} /></span></span>
                        </div>
                      </td>
                      <td style={{ ...td, color: T.ink2 }}>{p.email}</td>
                      <td style={td}><Chip c={p.verified ? chip("Verified", "teal", "ph-seal-check") : chip("Unverified", "neutral", "ph-clock")} /></td>
                      <td style={td}>{p.age ?? "—"}</td>
                      <td style={{ ...td, color: T.ink2, whiteSpace: "nowrap" }}>{p.lastActive}</td>
                      <td style={{ ...td, color: T.ink2, whiteSpace: "nowrap" }}>{p.devices ? p.devices + " connected" : "None"}</td>
                      <td style={td}><Chip c={cc === 4 ? chip("All shared", "teal", "ph-check-circle") : chip(cc + " of 4 shared", "neutral", "ph-minus-circle")} /></td>
                      <td style={{ padding: "8px 20px 8px 8px", borderBottom: `1px solid ${T.line}`, minWidth: 230 }}>
                        {hov ? (
                          <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", animation: "anraFade 150ms" }}>
                            <button onClick={(e) => { e.stopPropagation(); open(); }} className="h-primary" style={{ height: 32, padding: "0 10px", borderRadius: 10, border: "none", background: T.teal, color: T.card, fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>Open 360</button>
                            <button onClick={(e) => { e.stopPropagation(); a.openForm("appt", p.id, { patient: p.name }); }} className="h-sand" style={{ height: 32, padding: "0 10px", borderRadius: 10, border: `1px solid ${T.line3}`, background: T.card, fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>Book visit</button>
                            <button onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(p.id).catch(() => {}); a.toast("Patient ID copied", p.id); }} aria-label="Copy patient ID" title="Copy patient ID" className="h-sand" style={{ width: 32, height: 32, borderRadius: 10, border: `1px solid ${T.line3}`, background: T.card, cursor: "pointer", display: "grid", placeItems: "center" }}><i className="ph ph-copy" /></button>
                          </div>
                        ) : <span style={{ color: T.ink2 }}>{p.nextAppt}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", fontSize: 13.5, color: T.ink2 }}>
            <span style={{ flex: 1 }}>{list.length} patient{list.length === 1 ? "" : "s"}</span><span>Page {pg + 1} of {pages}</span>
            <button onClick={() => pg > 0 && setPage(pg - 1)} aria-label="Previous page" style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${T.line3}`, background: T.card, cursor: "pointer", opacity: pg > 0 ? 1 : 0.4, display: "grid", placeItems: "center" }}><i className="ph ph-caret-left" /></button>
            <button onClick={() => pg < pages - 1 && setPage(pg + 1)} aria-label="Next page" style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${T.line3}`, background: T.card, cursor: "pointer", opacity: pg < pages - 1 ? 1 : 0.4, display: "grid", placeItems: "center" }}><i className="ph ph-caret-right" /></button>
          </div>
        </div>
      )}
    </section>
  );
}
