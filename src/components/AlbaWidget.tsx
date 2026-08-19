"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, X, Loader2 } from "lucide-react";
import { useAlba } from "@/components/AlbaContext";
import AlbaMark from "@/components/AlbaMark";

const WALKTHROUGH_KEY = "anra_alba_walkthrough_seen";
const INTRO_TEXT = "Hey, I am Alba — click on me and I'll come with you.";
const ALBA_ENTRIES = ["Record Q&A", "Care Coordination", "Symptom Triage", "Daily Check-ins"];

interface ChatMessage { role: "user" | "assistant"; text: string; }

function AlbaPanel({ onClose, panelRef }: { onClose: () => void; panelRef: React.RefObject<HTMLDivElement> }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Hi, I'm ALBA — ANRA Health's AI companion. Ask me about our services, physicians, locations, or how to book." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: next.map((m) => ({ role: m.role, text: m.text })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "failed");
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch (err: any) {
      setMessages((m) => [...m, { role: "assistant", text: `Connection error: ${err.message}. Check GEMINI_API_KEY in .env.local and restart the server.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={panelRef} className="fixed bottom-28 right-6 z-[95] w-[92vw] sm:w-[400px] glass rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight: "70vh" }}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-pearl-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-pearl-50"><AlbaMark size={20} /></div>
          <div>
            <p className="font-semibold text-graphite-900">ALBA</p>
            <p className="text-xs text-graphite-500">Your AI Health Companion</p>
          </div>
        </div>
        <button onClick={onClose} className="text-graphite-400 hover:text-graphite-700"><X size={18} /></button>
      </div>
      <div className="flex flex-wrap gap-2 px-5 py-3 border-b border-pearl-200 shrink-0">
        {ALBA_ENTRIES.map((e) => (
          <button key={e} onClick={() => setInput(e)} className="glass rounded-full px-3 py-1.5 text-xs font-semibold text-gold-700">{e}</button>
        ))}
      </div>
      <div className="px-5 py-4 flex-1 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end mb-3" : "flex mb-3"}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-pearl-100 text-graphite-800" : "bg-white text-graphite-800 shadow-sm"}`}>{m.text}</div>
          </div>
        ))}
        {loading && <div className="flex items-center gap-2 text-graphite-500 text-sm"><Loader2 size={14} className="animate-spin" /> Thinking…</div>}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-2 px-5 py-3 border-t border-pearl-200 shrink-0">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} disabled={loading}
          className="flex-1 rounded-full bg-white border border-pearl-300 px-4 py-2.5 text-sm outline-none focus:border-gold-500 disabled:opacity-60" placeholder="Ask ALBA anything…" />
        <button onClick={send} disabled={loading} className="w-9 h-9 rounded-full gold-gloss flex items-center justify-center shrink-0 disabled:opacity-60"><Send size={14} /></button>
      </div>
    </div>
  );
}

export default function AlbaWidget() {
  const { isOpen, openAlba, closeAlba } = useAlba();
  const [showIntro, setShowIntro] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionStorage.getItem(WALKTHROUGH_KEY)) setShowIntro(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: MouseEvent) => { if (panelRef.current && !panelRef.current.contains(e.target as Node)) closeAlba(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [isOpen, closeAlba]);

  const handleOpen = () => {
    sessionStorage.setItem(WALKTHROUGH_KEY, "1");
    setShowIntro(false);
    openAlba();
  };

  return (
    <>
      {showIntro && !isOpen && (
        <button onClick={handleOpen} className="fixed bottom-32 right-6 z-[85] max-w-[240px] glass rounded-2xl px-4 py-3 text-left transition-transform hover:-translate-y-0.5">
          <p className="text-sm font-medium text-graphite-800 leading-relaxed">{INTRO_TEXT}</p>
        </button>
      )}
      {!isOpen && (
        <button onClick={handleOpen} className="fixed bottom-6 right-6 z-[80] w-16 h-16 rounded-full flex items-center justify-center shadow-glow transition-transform hover:scale-105 bg-pearl-50 border border-gold-500/30" aria-label="Open ALBA">
          <AlbaMark size={30} />
        </button>
      )}
      {isOpen && <AlbaPanel onClose={closeAlba} panelRef={panelRef} />}
    </>
  );
}