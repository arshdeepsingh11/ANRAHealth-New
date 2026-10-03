"use client";

import React from "react";
import type { ProtocolDTO } from "@/lib/portal/types";
import { usePortal } from "../context";
import { EP, api, prime, peek, invalidate, useResource } from "../api";
import { C, screenAnim, EmptyCard, Loading } from "../ui";
import { NIcon } from "@/components/neyu/icons";

/** Check / uncheck a step for today — optimistic, rolled back on failure. */
export async function toggleProtocol(itemId: string, done: boolean, onError: (m: string) => void) {
  const prev = peek<ProtocolDTO>(EP.protocol);
  if (prev) prime(EP.protocol, { ...prev, items: prev.items.map((i) => (i.id === itemId ? { ...i, doneToday: done } : i)) });
  try {
    prime(EP.protocol, await api<ProtocolDTO>(EP.protocol, { body: { itemId, done } }));
    invalidate(EP.today);
  } catch (e: any) {
    if (prev) prime(EP.protocol, prev);
    onError(e.message);
  }
}

export default function Protocol() {
  const { openSheet, toast } = usePortal();
  const { data, error, reload } = useResource<ProtocolDTO>(EP.protocol);
  if (!data) return <Loading error={error} retry={reload} />;
  const total = data.items.length, done = data.items.filter((i) => i.doneToday).length;

  return (
    <div style={{ ...screenAnim, maxWidth: 720 }}>
      <h1 style={{ margin: "0 0 6px", fontSize: 32, lineHeight: 1.1, fontWeight: 500, letterSpacing: "-.025em" }}>My Protocol</h1>
      <p style={{ margin: "0 0 24px", fontSize: 15, color: C.muted }}>Your personalized routine.</p>
      {!total ? (
        <EmptyCard icon="ph ph-list-checks" title="Your routine will live here" text="When your care team shares a protocol, each step will appear here as a simple daily checklist." maxWidth="none" />
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 20, padding: 22, borderRadius: 22, background: C.card, border: `1px solid ${C.line}`, marginBottom: 28 }}>
            <div style={{ position: "relative", width: 64, height: 64, flex: "none" }}>
              <svg viewBox="0 0 64 64" style={{ width: 64, height: 64, transform: "rotate(-90deg)" }}>
                <circle cx="32" cy="32" r="27" fill="none" stroke="#EAE7E2" strokeWidth="5" />
                <circle cx="32" cy="32" r="27" fill="none" stroke={C.tealLight} strokeWidth="5" strokeLinecap="round" strokeDasharray="169.6" strokeDashoffset={(169.6 * (1 - done / total)).toFixed(1)} style={{ transition: "stroke-dashoffset 600ms cubic-bezier(.2,.7,.2,1)" }} />
              </svg>
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 500 }}>{done}/{total}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 18, fontWeight: 500 }} aria-live="polite">{done} of {total} complete</span>
              <span style={{ fontSize: 14, color: C.muted }}>{data.streak > 0 ? `You've stayed consistent for ${data.streak} day${data.streak === 1 ? "" : "s"}.` : "Complete every step today to start your streak."}</span>
            </div>
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 500 }}>Today</h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {data.items.map((p) => {
              const d = p.doneToday;
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
                  <button role="checkbox" aria-checked={d} aria-label={`Mark ${p.title} complete`} onClick={() => toggleProtocol(p.id, !d, toast)} style={{ width: 48, height: 48, flex: "none", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ width: 26, height: 26, borderRadius: 13, border: `1.5px solid ${d ? C.teal : "#B9B4AC"}`, background: d ? C.teal : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 260ms cubic-bezier(.2,.7,.2,1)", transform: `scale(${d ? 1 : 0.94})` }}>
                      <NIcon name="ph-check" size={14} tone={C.card} style={{opacity: d ? 1 : 0, transition: "opacity 200ms"}} />
                    </span>
                  </button>
                  <button onClick={() => openSheet({ t: "protocol", id: p.id })} className="h-proto" style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, minHeight: 56, padding: "0 4px", border: "none", background: "none", cursor: "pointer", textAlign: "left", borderRadius: 12, minWidth: 0 }}>
                    <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                      <span style={{ fontSize: 13, color: C.muted }}>{p.slot}</span>
                      <span style={{ fontSize: 16, color: d ? C.muted : C.ink, transition: "color 260ms" }}>{p.title}</span>
                      <span style={{ fontSize: 14, color: C.muted }}>{p.dose}</span>
                    </span>
                    <span style={{ fontSize: 12, color: C.muted }}>{p.source}</span>
                    <NIcon name="ph-caret-right" size="1em" tone={C.faint} />
                  </button>
                </div>
              );
            })}
          </div>
          <p style={{ margin: "20px 0 0", fontSize: 13, lineHeight: 1.5, color: C.muted }}>Please don't start, stop or change a medication or supplement without talking to your care team.</p>
        </>
      )}
    </div>
  );
}
