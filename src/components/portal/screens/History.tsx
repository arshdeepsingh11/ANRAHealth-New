"use client";

import React, { useMemo, useState } from "react";
import type { HistoryItemDTO } from "@/lib/portal/types";
import { usePortal } from "../context";
import { EP, useResource } from "../api";
import { C, screenAnim, Chips, Loading, shortDate, longDateTz } from "../ui";

const HF = [["all", "All"], ["visits", "Visits"], ["results", "Results"], ["ai", "AI conversations"], ["symptom", "Symptom checks"], ["assessments", "Assessments"], ["referrals", "Referrals"], ["protocols", "Protocols"]] as const;
type F = (typeof HF)[number][0];
/** Set by "Past AI Conversations" in More so History opens pre-filtered. */
export let historyFilter: F = "all";
export const setHistoryFilter = (f: F) => { historyFilter = f; };

export default function History() {
  const { go, openSheet, tz } = usePortal();
  const { data, error, reload } = useResource<HistoryItemDTO[]>(EP.history);
  const [f, setF] = useState<F>(historyFilter);
  const change = (v: F) => { historyFilter = v; setF(v); };

  const groups = useMemo(() => {
    const out: { month: string; items: HistoryItemDTO[] }[] = [];
    (data || []).filter((h) => f === "all" || h.kind.split(" ").includes(f)).forEach((h) => {
      const m = longDateTz(h.at, tz, { month: "long", year: "numeric" });
      let g = out.find((x) => x.month === m);
      if (!g) { g = { month: m, items: [] }; out.push(g); }
      g.items.push(h);
    });
    return out;
  }, [data, f, tz]);

  const open = (h: HistoryItemDTO) => {
    if (["symptom", "alba", "assessment", "labcheck"].includes(h.ref.type)) openSheet({ t: "conversation", type: h.ref.type, id: h.ref.id });
    else if (h.go) go(h.go);
  };

  return (
    <div style={{ ...screenAnim, maxWidth: 760 }}>
      <h1 style={{ margin: "0 0 6px", fontSize: 32, lineHeight: 1.1, fontWeight: 500, letterSpacing: "-.025em" }}>Your History</h1>
      <p style={{ margin: "0 0 20px", fontSize: 15, color: C.muted }}>A timeline of your health journey with ANRA.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
        <Chips items={HF.map(([id, label]) => ({ id, label }))} value={f} onChange={change} />
      </div>
      {!data ? <Loading error={error} retry={reload} /> : groups.length === 0 ? (
        <p style={{ margin: 0, fontSize: 15, color: C.muted }}>Nothing here yet. As you use ANRA, these moments will appear on your timeline.</p>
      ) : groups.map((g) => (
        <section key={g.month} style={{ marginBottom: 28 }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 500, color: C.muted }}>{g.month}</h2>
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {g.items.map((h) => (
              <li key={h.id} style={{ display: "grid", gridTemplateColumns: "56px 16px minmax(0,1fr)", gap: "0 12px", animation: "mhs-fadeUp 300ms ease" }}>
                <span style={{ fontSize: 14, color: C.muted, paddingTop: 14, fontVariantNumeric: "tabular-nums" }}>{shortDate(h.at, tz)}</span>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><span style={{ width: 1, height: 18, background: "rgba(110,168,182,.3)" }} /><span style={{ width: 9, height: 9, borderRadius: 5, background: h.ai ? C.lavMid : C.tealLight, flex: "none" }} /><span style={{ flex: 1, width: 1, background: "rgba(110,168,182,.3)" }} /></span>
                <div style={{ padding: "10px 0 12px", minWidth: 0 }}>
                  <button onClick={() => open(h)} className="h-hist" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3, padding: "10px 14px", border: h.ai ? "1px solid rgba(140,111,184,.18)" : "1px solid transparent", borderRadius: 16, background: h.ai ? "#F7F4FB" : "transparent", cursor: "pointer", textAlign: "left" }}>
                    <span style={{ fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 6 }}><i className={h.icon} style={{ fontSize: 14, color: h.ai ? C.lavMid : C.teal }} />{h.type}</span>
                    <span style={{ fontSize: 16, overflowWrap: "anywhere" }}>{h.title}</span>
                    <span style={{ fontSize: 14, color: C.muted, overflowWrap: "anywhere" }}>{h.sub}</span>
                    {h.ai && <span style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 13, color: C.muted }}><span>Status: Completed</span><span style={{ color: C.lavInk, fontWeight: 500 }}>{h.ref.type === "alba" ? "View conversation →" : "View summary →"}</span></span>}
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
