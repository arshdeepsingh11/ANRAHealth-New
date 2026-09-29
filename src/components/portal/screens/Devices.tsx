"use client";

import React, { useState } from "react";
import type { DeviceDTO, TodayDTO } from "@/lib/portal/types";
import { usePortal } from "../context";
import { EP, api, prime, useResource } from "../api";
import { C, screenAnim, Loading } from "../ui";

export const relTime = (iso: string | null) => {
  if (!iso) return "never";
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} days ago`;
};

export default function Devices() {
  const { go, openSheet, toast } = usePortal();
  const { data, error, reload } = useResource<DeviceDTO[]>(EP.devices);
  const today = useResource<TodayDTO>(EP.today).data;
  const [busy, setBusy] = useState<string | null>(null);
  if (!data) return <Loading error={error} retry={reload} />;

  const connect = async (d: DeviceDTO) => {
    setBusy(d.id);
    try {
      const r = await api<{ token: string; devices: DeviceDTO[] }>(EP.devices, { body: { provider: d.id } });
      prime(EP.devices, r.devices);
      openSheet({ t: "manage", id: d.id, token: r.token });
    } catch (e: any) { toast(e.message); } finally { setBusy(null); }
  };

  return (
    <div style={{ ...screenAnim, maxWidth: 860 }}>
      <h1 style={{ margin: "0 0 6px", fontSize: 32, lineHeight: 1.1, fontWeight: 500, letterSpacing: "-.025em" }}>Connect your health data</h1>
      <p style={{ margin: "0 0 24px", fontSize: 15, color: C.muted }}>Bring your everyday health signals into one place.</p>
      {!today?.hasWearable && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", padding: 28, borderRadius: 24, background: "linear-gradient(165deg,#EAF3F4 0%,#FFFDFB 70%)", marginBottom: 24 }}>
          <div style={{ position: "relative", width: 96, height: 96, flex: "none" }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(110,168,182,.35)" }} />
            <span style={{ position: "absolute", inset: 16, borderRadius: "50%", border: "1px solid rgba(110,168,182,.55)" }} />
            <span style={{ position: "absolute", inset: 34, borderRadius: "50%", background: C.tealLight, animation: "mhs-pulse 2.4s ease-in-out infinite" }} />
          </div>
          <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>Your health data can live here.</h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: C.muted }}>Connect a wearable to see your daily heart, sleep, recovery and activity signals in My Health Space.</p>
            <button onClick={() => go("today")} style={{ alignSelf: "flex-start", height: 40, padding: 0, border: "none", background: "none", fontSize: 14, color: C.teal, cursor: "pointer" }}>I'll do this later</button>
          </div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,340px),1fr))", gap: 16 }}>
        {data.map((d) => {
          const on = d.status === "on", pending = d.status === "pending", connecting = busy === d.id;
          const statusText = on ? `Connected · Last synced ${relTime(d.lastSyncAt)}` : pending ? "Waiting for your first sync…" : d.available ? "Not connected" : "Coming soon";
          return (
            <article key={d.id} style={{ padding: 20, borderRadius: 20, background: C.card, border: `1px solid ${on ? "rgba(110,168,182,.45)" : C.line}`, display: "flex", flexDirection: "column", gap: 14, transition: "border-color 300ms" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: "#F0EEEA", display: "flex", alignItems: "center", justifyContent: "center", color: C.ink3, flex: "none" }}><i className={d.icon} style={{ fontSize: 21 }} /></span>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                  <span style={{ fontSize: 16, fontWeight: 500 }}>{d.name}</span>
                  <span style={{ fontSize: 13, color: on ? C.tealDark : C.muted, display: "flex", alignItems: "center", gap: 5 }}><i className={on ? "ph ph-check-circle" : pending ? "ph ph-hourglass-medium" : "ph ph-plugs"} style={{ fontSize: 14 }} />{statusText}</span>
                </div>
              </div>
              {pending && <div style={{ height: 3, borderRadius: 2, background: "#EAE7E2", overflow: "hidden" }}><div style={{ height: "100%", width: "40%", background: C.tealLight, animation: "mhs-pulse 1.4s ease-in-out infinite" }} /></div>}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, color: C.muted }}>{on ? "Data available" : "Can share"}</span>
                <span style={{ fontSize: 14, lineHeight: 1.5, color: C.ink3 }}>{(on ? d.signals.filter((s) => d.dataTypes.includes(s)) : d.signals).join(" · ")}</span>
              </div>
              {(on || pending) && <button onClick={() => openSheet({ t: "manage", id: d.id })} className="h-ghost" style={{ alignSelf: "flex-start", height: 40, padding: "0 16px", border: `1px solid ${C.line12}`, borderRadius: 10, background: "none", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>{pending ? "Finish setup" : "Manage"}</button>}
              {!on && !pending && d.available && !connecting && <button onClick={() => connect(d)} className="h-primary" style={{ alignSelf: "flex-start", height: 40, padding: "0 18px", border: "none", borderRadius: 10, background: C.teal, color: C.card, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Connect</button>}
              {connecting && <span style={{ alignSelf: "flex-start", height: 40, display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: C.teal }}><span style={{ width: 8, height: 8, borderRadius: 4, background: C.tealLight, animation: "mhs-pulse 1s ease-in-out infinite" }} />Connecting…</span>}
              {!d.available && <span style={{ alignSelf: "flex-start", height: 32, display: "flex", alignItems: "center", padding: "0 12px", borderRadius: 16, background: "#EFECE8", fontSize: 13, color: C.muted }}>We're working on this connection</span>}
            </article>
          );
        })}
      </div>
      <p style={{ margin: "24px 0 0", fontSize: 14, lineHeight: 1.5, color: C.muted, display: "flex", gap: 8 }}><i className="ph ph-lock-simple" style={{ fontSize: 16, marginTop: 2 }} /><span>You choose what each source shares, and you can disconnect at any time. <a href="#" onClick={(e) => { e.preventDefault(); go("privacy"); }}>Manage data access</a></span></p>
    </div>
  );
}
