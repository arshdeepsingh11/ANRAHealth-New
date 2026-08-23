"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Send, X, Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useAlba } from "@/components/AlbaContext";
import AlbaMark from "@/components/AlbaMark";
import AlbaIntroVeil from "@/components/AlbaIntroVeil";

const ALBA_ENTRIES = ["Record Q&A", "Care Coordination", "Symptom Triage", "Daily Check-ins"];
const VIDEO_SEEN_KEY = "anra_video_seen";

interface ChatMessage { role: "user" | "assistant"; text: string; }

const ROUTES: { match: RegExp; href: string; label: string }[] = [
  { match: /cardiology/i, href: "/specialties/cardiology", label: "Open Cardiology" },
  { match: /referral/i, href: "/referral-centre", label: "Open Referral Centre" },
  { match: /contact|book an appointment/i, href: "/contact", label: "Open Contact" },
];

function AlbaPanel({ onClose, panelRef }: { onClose: () => void; panelRef: React.RefObject<HTMLDivElement> }) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Hi, I'm ALBA — ANRA Health's AI companion. Ask me about our services, physicians, locations, or how to book." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestedRoute, setSuggestedRoute] = useState<{ href: string; label: string } | null>(null);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speakReplies, setSpeakReplies] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setSpeechSupported(false); return; }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (e: any) => { setInput(e.results[0][0].transcript); setListening(false); };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, []);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (listening) { recognitionRef.current.stop(); setListening(false); }
    else { recognitionRef.current.start(); setListening(true); }
  };

  const speak = (text: string) => {
    if (!speakReplies || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
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
      speak(data.reply);
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
    <div
      ref={panelRef}
      className="fixed bottom-6 right-6 z-[95] glass rounded-2xl overflow-hidden shadow-2xl flex flex-col w-[380px] h-[520px]"
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-pearl-200 shrink-0 gold-gloss">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/90"><AlbaMark size={18} /></div>
          <div>
            <p className="font-semibold text-graphite-900 text-sm leading-tight">ALBA</p>
            <p className="text-[11px] text-graphite-800/70 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block" /> Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setSpeakReplies((s) => !s)} className="text-graphite-800/70 hover:text-graphite-900 p-1" aria-label="Toggle voice replies">
            {speakReplies ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button onClick={onClose} className="text-graphite-800/70 hover:text-graphite-900 p-1"><X size={18} /></button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 px-4 py-2.5 border-b border-pearl-200 shrink-0 bg-pearl-50/60">
        {ALBA_ENTRIES.map((e) => (
          <button key={e} onClick={() => send(e)} className="glass rounded-full px-2.5 py-1 text-[11px] font-semibold text-gold-700">{e}</button>
        ))}
      </div>

      <div className="px-4 py-3 flex-1 overflow-y-auto min-h-0">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end mb-2.5" : "flex mb-2.5"}>
            <div className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug ${m.role === "user" ? "bg-pearl-100 text-graphite-800" : "bg-white text-graphite-800 shadow-sm"}`}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-graphite-500 text-xs">
            <Loader2 size={13} className="animate-spin" /> ALBA is thinking…
          </div>
        )}
        {suggestedRoute && !loading && (
          <button onClick={() => router.push(suggestedRoute.href)} className="gold-gloss rounded-full px-3.5 py-1.5 text-[11px] font-semibold mt-1">
            {suggestedRoute.label} →
          </button>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-t border-pearl-200 shrink-0">
        <button
          onClick={toggleListening}
          disabled={!speechSupported}
          title={speechSupported ? "Speak to ALBA" : "Voice input not supported in this browser"}
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${listening ? "bg-red-500 text-white" : "bg-pearl-100 text-gold-700"} disabled:opacity-30`}
        >
          {listening ? <MicOff size={14} /> : <Mic size={14} />}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={loading}
          className="flex-1 rounded-full bg-white border border-pearl-300 px-3.5 py-2 text-[13px] outline-none focus:border-gold-500 disabled:opacity-60"
          placeholder={listening ? "Listening…" : "Ask ALBA anything…"}
        />
        <button onClick={() => send()} disabled={loading} className="w-8 h-8 rounded-full gold-gloss flex items-center justify-center shrink-0 disabled:opacity-60"><Send size={13} /></button>
      </div>
    </div>
  );
}

export default function AlbaWidget() {
  const { isOpen, openAlba, closeAlba } = useAlba();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  const [videoDone, setVideoDone] = useState(pathname !== "/");
  const [introDone, setIntroDone] = useState(pathname !== "/");
  const [popIn, setPopIn] = useState(pathname !== "/");

  useEffect(() => {
    if (pathname !== "/") { setVideoDone(true); setIntroDone(true); setPopIn(true); return; }
    if (sessionStorage.getItem(VIDEO_SEEN_KEY)) { setVideoDone(true); return; }
    const check = setInterval(() => {
      if (sessionStorage.getItem(VIDEO_SEEN_KEY)) { setVideoDone(true); clearInterval(check); }
    }, 200);
    return () => clearInterval(check);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: MouseEvent) => { if (panelRef.current && !panelRef.current.contains(e.target as Node)) closeAlba(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [isOpen, closeAlba]);

  const handleIntroComplete = () => {
    setIntroDone(true);
    setTimeout(() => setPopIn(true), 80);
  };

  return (
    <>
      {videoDone && !introDone && <AlbaIntroVeil onComplete={handleIntroComplete} />}

      {popIn && !isOpen && (
        <button
          onClick={openAlba}
          className="fixed bottom-6 right-6 z-[80] w-16 h-16 rounded-full flex items-center justify-center shadow-glow bg-pearl-50 border border-gold-500/30"
          style={{ animation: "albaPopIn 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}
          aria-label="Open ALBA"
        >
          <AlbaMark size={30} />
        </button>
      )}

      {popIn && isOpen && <AlbaPanel onClose={closeAlba} panelRef={panelRef} />}

      <style jsx global>{`
        @keyframes albaPopIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </>
  );
}