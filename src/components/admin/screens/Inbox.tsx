"use client";

import React, { useState } from "react";
import type { QueueItem } from "@/lib/admin/types";
import { useAdmin, useView, type AdminCtx } from "../context";
import { T, S, chip, Chip, TestTag, Empty, Failed, RowsSkeleton } from "../ui";

export const Q_TABS: [string, string][] = [["all", "All"], ["urgent", "Urgent"], ["referrals", "Referrals"], ["appointments", "Appointments"], ["labs", "Labs"], ["prep", "Visit Prep"], ["accounts", "Accounts"], ["devices", "Devices"]];
const TYPE_ICON: Record<string, string> = { urgent: "ph-warning-circle", referrals: "ph-arrow-square-in", appointments: "ph-calendar-x", labs: "ph-flask", prep: "ph-list-checks", accounts: "ph-envelope-simple", devices: "ph-watch" };
const TAB_OF: Record<string, string> = { labs: "labs", appointments: "appointments", prep: "appointments", accounts: "devices", devices: "devices" };

export const inTab = (q: QueueItem, t: string) => t === "all" ? true : t === "urgent" ? q.priority === "Emergency" || q.priority === "High" : q.type === t;

/** Open the record behind a queue item. */
export function openQueueItem(a: AdminCtx, q: QueueItem) {
  if (q.aiId) return a.openAI(q.aiId);
  if (q.refId) return a.openRef(q.refId);
  if (q.whoId && q.whoKind === "patient") a.go({ s: "patient", id: q.whoId, tab: TAB_OF[q.type] || "overview" });
}

/** The row's action button. */
export function runQueueItem(a: AdminCtx, q: QueueItem) {
  if (q.aiId || q.refId || q.type === "labs") return openQueueItem(a, q);
  const copy: Record<string, [string, string]> = {
    appointments: ["Reschedule request resolved", "Front desk will confirm the new time with the patient."],
    prep: ["Visit prep marked reviewed", "Questions stay attached to the appointment."],
    devices: ["Sync reminder sent", ""],
    accounts: ["Verification email resent", ""],
  };
  const [title, sub] = copy[q.type] || ["Done", ""];
  a.act({ action: "queue.complete", id: q.id }, { success: title, sub: (r) => r?.message || sub, undoable: true });
}

export default function Inbox({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  const a = useAdmin();
  const { data, error, loading, reload } = useView<{ queue: QueueItem[] }>("inbox");
  const queue = data?.queue || [];
  const items = queue.filter((q) => inTab(q, tab));
  return (
    <section data-screen-label="03 Inbox" style={{ display: "flex", flexDirection: "column", gap: 20, animation: "anraFade 260ms ease-out" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h1 style={S.h1}>Inbox</h1>
        <span style={{ color: T.faint }}>{queue.length} open item{queue.length === 1 ? "" : "s"} · sorted by priority</span>
      </div>
      <div role="tablist" aria-label="Queues" className="no-scrollbar" style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 2 }}>
        {Q_TABS.map(([k, l]) => {
          const on = tab === k;
          return (
            <button key={k} role="tab" aria-selected={on} onClick={() => setTab(k)} className="h-fade" style={{ flex: "none", height: 36, padding: "0 14px", borderRadius: 999, border: "none", background: on ? T.ink : "transparent", color: on ? T.card : T.ink2, fontSize: 14, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, transition: "all 200ms" }}>
              {l}<span style={{ fontSize: 12.5, color: on ? T.chip : T.faint }}>{queue.filter((q) => inTab(q, k)).length}</span>
            </button>
          );
        })}
      </div>
      {loading && <RowsSkeleton />}
      {error && !data && <Failed what="the inbox" onRetry={reload} />}
      {data && items.length === 0 && <Empty icon="ph-check-circle" title="Nothing in this queue" sub="You're all caught up." />}
      {items.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((q) => <QueueRow key={q.id} q={q} />)}
        </ul>
      )}
    </section>
  );
}

function QueueRow({ q }: { q: QueueItem }) {
  const a = useAdmin();
  const [busy, setBusy] = useState(false);
  const em = q.priority === "Emergency";
  const pri = em ? chip("Emergency", "urgent", "ph-warning-circle") : q.priority === "High" ? chip("High", "teal", "ph-arrow-up") : chip(q.priority, "neutral", q.priority === "Low" ? "ph-arrow-down" : "ph-minus");
  const open = () => openQueueItem(a, q);
  return (
    <li>
      <div role="button" tabIndex={0} onClick={open} onKeyDown={(e) => e.key === "Enter" && open()} className="h-lift" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", padding: "14px 16px", borderRadius: 18, background: em ? T.peach : T.card, border: `1px solid ${T.line}`, cursor: "pointer", transition: "box-shadow 200ms,transform 200ms" }}>
        <span style={{ width: 40, height: 40, flex: "none", borderRadius: 12, background: em ? T.card : T.side, color: em ? T.peachInk : T.teal, display: "grid", placeItems: "center", fontSize: 19 }}><i className={"ph " + TYPE_ICON[q.type]} /></span>
        <div style={{ flex: "1 1 260px", minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><span style={{ fontSize: 15, fontWeight: 500 }}>{q.who}</span><TestTag show={q.test} /><span style={{ fontSize: 13.5, color: T.ink2 }}>{q.label}</span></div>
          <div style={{ fontSize: 13.5, color: T.ink2, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.detail}</div>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center", fontSize: 13, color: T.ink2, flexWrap: "wrap" }}>
          <span style={{ minWidth: 110 }}><span style={{ display: "block", color: T.faint, fontSize: 12 }}>Status</span>{q.status}</span>
          <span style={{ minWidth: 100 }}><span style={{ display: "block", color: T.faint, fontSize: 12 }}>Assigned</span>{q.owner}</span>
          <span style={{ minWidth: 80 }}><span style={{ display: "block", color: T.faint, fontSize: 12 }}>Received</span>{q.time}</span>
          <Chip c={pri} />
        </div>
        {a.canEdit && (
          <button disabled={busy} onClick={async (e) => { e.stopPropagation(); setBusy(true); try { await runQueueItem(a, q); } finally { setBusy(false); } }} className="h-sand" style={{ height: 36, padding: "0 14px", borderRadius: 12, border: `1px solid ${T.line3}`, background: T.card, color: T.ink, fontSize: 13.5, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", opacity: busy ? 0.6 : 1 }}>{q.action}</button>
        )}
      </div>
    </li>
  );
}
