"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Send, X, Loader2, GripVertical } from "lucide-react";
import { useAlba } from "@/components/AlbaContext";
import AlbaMark from "@/components/AlbaMark";
import AlbaIntroVeil from "@/components/AlbaIntroVeil";

const ALBA_ENTRIES = ["Record Q&A", "Care Coordination", "Symptom Triage", "Daily Check-ins"];
const VIDEO_SEEN_KEY = "anra_video_seen";

interface ChatMessage { role: "user" | "assistant"; text: string; }

// Lightweight client-side router: if the AI's reply — or the user's own
// message — clearly names a known destination, offer real navigation.
// This sits on top of the real Gemini answer; it doesn't replace it.
const ROUTES: { match: RegExp; href: string; label: string }[] = [
  { match: /cardiology/i, href: "/specialties/cardiology", label: "Open Cardiology" },
  { match: /referral/i, href: "/referral-centre", label: "Open Referral Centre" },
  { match: /contact|book an appointment/i, href: "/contact", label: "Open Contact" },
];

function useDraggable(initial: { x: number; y: number }) {
  const [pos, setPos] = useState(initial);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    const h = typeof window !== "undefined" ? window.innerHeight : 800;
    const x = Math.min(Math.max(e.clientX - offset.current.x, 8), w - 80);
    const y = Math.min(Math.max(e.clientY - offset.current.y, 8), h - 80);
    setPos({ x, y });
  };
  const onPointerUp = () => { dragging.current = false; };

  return { pos, setPos, onPointerDown, onPointerMove, onPointerUp };
}

function AlbaPanel({ onClose, panelRef }: { onClose: () => void; panelRef: React.RefObject<HTMLDivElement> }) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Hi, I'm ALBA — ANRA Health's AI companion. Ask me about our services, physicians, locations, or how to book." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestedRoute, setSuggestedRoute] = useState<{ href: string; label: string } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setSuggestedRoute(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: next.map((m) => ({ role: m.role, text: m.text })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "failed");
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);

      const combined = `${text} ${data.reply}`;
      const match = ROUTES.find((r) => r.match.test(combined));
      if (match) setSuggestedRoute(match);
    } catch (err: any) {
      setMessages((m) => [...m, { role: "assistant", text: `Connection error: ${err.message}. Check GEMINI_API_KEY in .env.local and restart the server.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={panelRef} className="w-[92vw] sm:w-[400px] glass rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight: "70vh" }}>
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
        {loading && (
          <div className="flex items-center gap-2 text-graphite-500 text-sm">
            <Loader2 size={14} className="animate-spin" /> ALBA is thinking…
          </div>
        )}
        {suggestedRoute && !loading && (
          <button
            onClick={() => router.push(suggestedRoute.href)}
            className="gold-gloss rounded-full px-4 py-2 text-xs font-semibold mt-1"
          >
            {suggestedRoute.label} →
          </button>
        )}
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
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // On the homepage, the veil must wait until the intro video has actually
  // finished — otherwise it renders on top of the still-playing video.
  // Everywhere else there's no video to wait for, so skip straight through.
  const [videoDone, setVideoDone] = useState(pathname !== "/");
  const [introDone, setIntroDone] = useState(pathname !== "/");
  const [popIn, setPopIn] = useState(pathname !== "/");

  useEffect(() => {
    if (pathname !== "/") {
      setVideoDone(true);
      setIntroDone(true);
      setPopIn(true);
      return;
    }
    if (sessionStorage.getItem(VIDEO_SEEN_KEY)) {
      setVideoDone(true);
      return;
    }
    const check = setInterval(() => {
      if (sessionStorage.getItem(VIDEO_SEEN_KEY)) {
        setVideoDone(true);
        clearInterval(check);
      }
    }, 200);
    return () => clearInterval(check);
  }, [pathname]);

  const { pos, onPointerDown, onPointerMove, onPointerUp } = useDraggable({
    x: typeof window !== "undefined" ? window.innerWidth - 96 : 1000,
    y: typeof window !== "undefined" ? window.innerHeight - 120 : 700,
  });

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: MouseEvent) => { if (panelRef.current && !panelRef.current.contains(e.target as Node)) closeAlba(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [isOpen, closeAlba]);

  const handleIntroComplete = () => {
    setIntroDone(true);
    // The dock was never visible before this point — pop it in now.
    setTimeout(() => setPopIn(true), 80);
  };

  return (
    <>
      {videoDone && !introDone && <AlbaIntroVeil onComplete={handleIntroComplete} />}

      {popIn && !isOpen && (
        <button
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClick={openAlba}
          className="fixed z-[80] w-16 h-16 rounded-full flex items-center justify-center shadow-glow bg-pearl-50 border border-gold-500/30 group"
          style={{
            left: pos.x, top: pos.y, touchAction: "none",
            animation: "albaPopIn 0.5s cubic-bezier(0.34,1.56,0.64,1)",
          }}
          aria-label="Open ALBA"
        >
          <AlbaMark size={30} />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical size={10} className="text-graphite-400" />
          </span>
        </button>
      )}

      {popIn && isOpen && (
        <div className="fixed z-[95]" style={{ left: Math.min(pos.x, (typeof window !== "undefined" ? window.innerWidth : 1200) - 420), top: Math.max(pos.y - 420, 8) }}>
          <AlbaPanel onClose={closeAlba} panelRef={panelRef} />
        </div>
      )}

      <style jsx global>{`
        @keyframes albaPopIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}