"use client";

import React, { useState } from "react";
import type { AiRow } from "@/lib/admin/types";
import { useAdmin, useView } from "../context";
import { T, S, chip, Chip, TestTag, Orb, Empty, Failed, BlockSkeleton } from "../ui";

const ICON: Record<string, string> = { symptom: "ph-stethoscope", alba: "ph-chat-circle-dots", assessment: "ph-clipboard-text", lab: "ph-flask" };
const KIND_L: Record<string, string> = { symptom: "Symptom check", alba: "Neyu conversation", assessment: "Assessment", lab: "Lab explainer" };

export function decAI(a: AiRow) {
  const em = a.emergency && a.status === "New";
  return {
    icon: "ph " + ICON[a.kind], kindL: a.kind === "assessment" ? a.title : KIND_L[a.kind],
    st: em ? chip("Emergency · New", "urgent", "ph-warning-circle") : a.status === "New" ? chip("New", "neutral", "ph-circle") : chip(a.status, "teal", "ph-check"),
    rowBg: em ? T.peach : T.card,
  };
}

export default function AiActivity() {
  const a = useAdmin();
  const { data, error, loading, reload } = useView<{ rows: AiRow[] }>("ai");
  const [kind, setKind] = useState("all");
  const [emOnly, setEmOnly] = useState(false);
  const all = data?.rows || [];
  const list = all.filter((x) => (kind === "all" || x.kind === kind) && (!emOnly || x.emergency))
    .sort((x, y) => Number(y.emergency && y.status === "New") - Number(x.emergency && x.status === "New") || x.mins - y.mins);
  const kinds: [string, string][] = [["all", "All"], ["alba", "Neyu"], ["symptom", "Symptom Checks"], ["assessment", "Assessments"], ["lab", "Lab Explainers"]];

  return (
    <section data-screen-label="11 AI Activity" style={{ display: "flex", flexDirection: "column", gap: 18, animation: "anraFade 260ms ease-out" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <Orb size={40} anim />
        <div><h1 style={S.h1}>AI Activity</h1><p style={{ margin: 0, color: T.ink2 }}>Neyu conversations, symptom checks, assessments and lab explainers. Opening an item is logged.</p></div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        {kinds.map(([k, l]) => {
          const on = kind === k;
          return <button key={k} onClick={() => setKind(k)} style={{ height: 34, padding: "0 12px", borderRadius: 999, border: "none", background: on ? T.ink : "transparent", color: on ? T.card : T.ink2, fontSize: 13.5, fontWeight: 500, cursor: "pointer", display: "inline-flex", gap: 6, alignItems: "center", transition: "all 200ms", whiteSpace: "nowrap" }}>{l}<span style={{ opacity: 0.7, fontSize: 12.5 }}>{all.filter((x) => k === "all" || x.kind === k).length}</span></button>;
        })}
        <span style={{ width: 1, height: 22, background: "rgba(29,35,39,.1)", margin: "0 4px" }} />
        <button onClick={() => setEmOnly(!emOnly)} aria-pressed={emOnly} style={{ height: 34, padding: "0 12px", borderRadius: 999, border: "1px solid rgba(139,75,55,.25)", background: emOnly ? T.peach : "transparent", color: emOnly ? T.peachInk : T.ink2, fontSize: 13.5, fontWeight: 500, cursor: "pointer", display: "inline-flex", gap: 6, alignItems: "center", whiteSpace: "nowrap" }}><i className="ph ph-warning-circle" />Emergency only</button>
      </div>
      {loading && <BlockSkeleton />}
      {error && !data && <Failed what="AI activity" onRetry={reload} />}
      {data && list.length === 0 && <Empty title="No AI activity" sub={all.length ? "Nothing matches these filters." : "Neyu conversations, symptom checks, assessments and lab explainers appear here."} />}
      {list.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((x) => { const d = decAI(x); return (
            <button key={x.key} onClick={() => a.openAI(x.key)} className="h-lift" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", padding: "14px 18px", borderRadius: 18, background: d.rowBg, border: `1px solid ${T.line}`, textAlign: "left", cursor: "pointer", width: "100%" }}>
              <span style={{ width: 38, height: 38, borderRadius: 12, background: T.lavWash, color: T.lavInk, display: "grid", placeItems: "center", fontSize: 18, flex: "none" }}><i className={d.icon} /></span>
              <span style={{ flex: "1 1 280px", minWidth: 0 }}>
                <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: T.ink }}>{x.who}</span><TestTag show={x.test} />
                  <span style={{ fontSize: 13.5, color: T.ink2 }}>{d.kindL}</span>
                  {x.pre && <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 8px", borderRadius: 999, border: "1px dashed rgba(29,35,39,.25)", color: T.ink2, fontSize: 12 }}>Before sign-up</span>}
                </span>
                <span style={{ display: "block", fontSize: 13.5, color: T.ink2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.line}</span>
              </span>
              <span style={{ fontSize: 13, color: T.ink2, minWidth: 130 }}><span style={{ display: "block", fontSize: 12, color: T.faint }}>{x.id}</span>{x.date}, {x.time}</span>
              <Chip c={d.st} />
            </button>
          ); })}
        </div>
      )}
    </section>
  );
}
