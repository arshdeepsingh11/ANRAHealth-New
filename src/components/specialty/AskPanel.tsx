"use client";

// Inline Neyu for a specialty page — streams answers from /api/chat with the
// page as context. Emergencies are caught on the client and the server.
import React, { useEffect, useRef, useState } from "react";
import AlbaOrb from "@/components/AlbaOrb";
import { isEmergency } from "@/data/homeContent";
import { T, card, btnInk, chip, Thinking } from "@/components/nea/ui";
import { NIcon } from "@/components/neyu/icons";

type Msg = { role: "user" | "alba"; text: string; alert?: boolean };
const EMERGENCY = "This may be a medical emergency. Call 911 or go to the nearest emergency department now.";

export default function AskPanel({ page, label, suggestions, seed, clearSeed, accent }: { page: string; label: string; suggestions: string[]; seed?: string; clearSeed?: () => void; accent: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const conv = useRef<string | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (text.length < 2 || busy) return;
    const history = msgs.filter((m) => !m.alert).map((m) => ({ role: m.role === "alba" ? "model" : "user", text: m.text }));
    setQ("");
    if (isEmergency(text)) { setMsgs((m) => [...m, { role: "user", text }, { role: "alba", text: EMERGENCY, alert: true }]); return; }
    setMsgs((m) => [...m, { role: "user", text }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, history, pageContext: page, conversationId: conv.current }) });
      const id = res.headers.get("X-Conversation-Id"); if (id) conv.current = id;
      if ((res.headers.get("Content-Type") || "").includes("application/json")) {
        const j = await res.json();
        setMsgs((m) => [...m, { role: "alba", text: j.reply || j.error || "Sorry — please try again.", alert: !!j.emergency }]);
        return;
      }
      if (!res.body) throw new Error("no body");
      const reader = res.body.getReader(), dec = new TextDecoder();
      let full = "", started = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += dec.decode(value, { stream: true });
        const shown = full.replace(/\*\*|__|^#+\s/gm, "");
        if (!started) { started = true; setBusy(false); setMsgs((m) => [...m, { role: "alba", text: shown }]); }
        else setMsgs((m) => { const c = [...m]; c[c.length - 1] = { role: "alba", text: shown }; return c; });
      }
      if (!started) setMsgs((m) => [...m, { role: "alba", text: "Sorry — I couldn’t answer that. Please try again." }]);
    } catch {
      setMsgs((m) => [...m, { role: "alba", text: "I couldn’t connect just now. Please try again, or call 403-475-4475." }]);
    } finally { setBusy(false); }
  };

  useEffect(() => { if (seed) { send(seed); clearSeed?.(); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [seed]);
  useEffect(() => { const b = box.current; if (b) b.scrollTop = b.scrollHeight; }, [msgs, busy]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div ref={box} style={{ ...card, padding: 16, minHeight: 260, maxHeight: 460, overflowY: "auto", display: "grid", alignContent: "start", gap: 12, background: "linear-gradient(180deg,#fff,#FBF9FD)" }}>
        {msgs.length === 0 && (
          <div style={{ display: "grid", justifyItems: "center", gap: 10, textAlign: "center", padding: "22px 8px" }}>
            <AlbaOrb size={46} glow />
            <p style={{ margin: 0, fontSize: 16.5 }}>Ask Neyu anything about {label.toLowerCase()} — conditions, tests, results or what to expect.</p>
            <p style={{ margin: 0, fontSize: 13, color: T.muted }}>Medical education from NEYU’s AI. It never diagnoses.</p>
          </div>
        )}
        {msgs.map((m, i) => m.role === "user" ? (
          <div key={i} style={{ justifySelf: "end", maxWidth: "85%", padding: "10px 14px", borderRadius: "16px 16px 4px 16px", background: T.ink, color: "#F7F5F1", fontSize: 15, lineHeight: 1.5 }}>{m.text}</div>
        ) : m.alert ? (
          <p key={i} role="alert" style={{ margin: 0, padding: "12px 14px", borderRadius: 14, background: "#FBE7E1", color: "#8B2F1C", fontSize: 15, display: "flex", gap: 10 }}><NIcon name="ph-warning-circle" size={20} tone={"currentColor"} style={{ flex: "none" }} />{m.text}</p>
        ) : (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 10, maxWidth: "94%" }}>
            <AlbaOrb size={26} motion={i === msgs.length - 1 && busy} />
            <div style={{ padding: "10px 14px", borderRadius: "4px 16px 16px 16px", background: "#fff", border: "1px solid #E9E1F3", fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap", color: T.ink2 }}>{m.text}</div>
          </div>
        ))}
        {busy && <div style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 10 }}><AlbaOrb size={26} /><Thinking label="Neyu is thinking" /></div>}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{suggestions.map((s) => <button key={s} onClick={() => send(s)} style={{ ...chip(false), minHeight: 34, fontSize: 13 }}>{s}</button>)}</div>
      <form onSubmit={(e) => { e.preventDefault(); send(q); }} style={{ position: "relative", borderRadius: 18 }}>
        <anra-electro radius="18" style={{ position: "absolute", inset: -5, pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "flex", gap: 8, padding: 6, borderRadius: 18, background: "#fff", border: "1px solid #D6EEF6" }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} maxLength={1000} aria-label={`Ask Neyu about ${label}`} placeholder={`Ask about ${label.toLowerCase()}…`} style={{ flex: 1, minWidth: 0, height: 46, padding: "0 12px", border: 0, outline: "none", fontSize: 16, background: "transparent" }} />
          <button type="submit" disabled={busy || q.trim().length < 2} aria-label="Send" style={{ ...btnInk, width: 46, height: 46, padding: 0, borderRadius: 12, background: `linear-gradient(135deg, ${accent}, #1D5FA8)`, opacity: busy || q.trim().length < 2 ? 0.5 : 1 }}><NIcon name="ph-paper-plane-tilt" size={18} tone={"currentColor"} /></button>
        </div>
      </form>
      <p style={{ margin: 0, fontSize: 12, color: T.faint }}>Not medical advice. In an emergency call 911.</p>
    </div>
  );
}
