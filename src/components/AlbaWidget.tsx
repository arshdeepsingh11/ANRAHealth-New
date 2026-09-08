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

// Tailors ALBA's opening line based on the page the person is currently on,
// so the greeting feels relevant instead of generic everywhere.
function greetingForPath(pathname: string): string {
  if (pathname.startsWith("/specialties/cardiology")) {
    return "Hi, I'm ALBA. I see you're looking at Cardiology — ask me about heart symptoms, our cardiologists, or how to book a consult.";
  }
  if (pathname.startsWith("/specialties/respiratory-medicine")) {
    return "Hi, I'm ALBA. I see you're looking at Respiratory Medicine — ask me about sleep studies, CPAP, or breathing concerns.";
  }
  if (pathname.startsWith("/specialties/skin-health")) {
    return "Hi, I'm ALBA. I see you're looking at Skin Health — ask me about treatments, concerns, or how to book with Nea Precision Skin.";
  }
  if (pathname.startsWith("/referral-centre")) {
    return "Hi, I'm ALBA. Need help with a referral? Ask me about the auto-fill options, urgency levels, or what to bring.";
  }
  if (pathname.startsWith("/longevity")) {
    return "Hi, I'm ALBA. Curious about longevity and preventive health? Ask me anything, or try the Health Risk Assessment above.";
  }
  if (pathname.startsWith("/lab-results")) {
    return "Hi, I'm ALBA. Just looked at a lab result explanation? I can help clarify anything or point you toward booking a consult.";
  }
  if (pathname.startsWith("/resources")) {
    return "Hi, I'm ALBA. Looking for test prep, condition info, or forms? Ask me and I'll point you in the right direction.";
  }
  return "Hi, I'm ALBA — ANRA Health's AI companion. Ask me about our services, physicians, locations, or how to book.";
}

function AlbaPanel({ onClose, panelRef }: { onClose: () => void; panelRef: React.RefObject<HTMLDivElement> }) {
  const router = useRouter();
  const pathname = usePathname();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: greetingForPath(pathname || "/") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestedRoute, setSuggestedRoute] = useState<{ href: string; label: string } | null>(null);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speakReplies, setSpeakReplies] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  // Tracks the current logged conversation on the server. Set on the first
  // reply and reused for every subsequent message in this widget session,
  // so the whole chat is grouped together in the database.
  const conversationIdRef = useRef<string | null>(null);

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

  const speakNow = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Chrome (and some other browsers) silently do nothing if speak() is
    // called before voices have finished loading — no error, just no
    // audio. If that's the case, wait for the one-time voiceschanged
    // event and then speak.
    if (window.speechSynthesis.getVoices().length === 0) {
      const onVoicesReady = () => {
        window.speechSynthesis.removeEventListener("voiceschanged", onVoicesReady);
        window.speechSynthesis.speak(utterance);
      };
      window.speechSynthesis.addEventListener("voiceschanged", onVoicesReady);
    } else {
      window.speechSynthesis.speak(utterance);
    }
  };

  const speak = (text: string) => {
    if (!speakReplies) return;
    speakNow(text);
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
        body: JSON.stringify({
          message: text,
          history: next.map((m) => ({ role: m.role, text: m.text })),
          pageContext: pathname || "/",
          conversationId: conversationIdRef.current,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || "failed");
      }

      const incomingConversationId = res.headers.get("X-Conversation-Id");
      if (incomingConversationId) conversationIdRef.current = incomingConversationId;

      const contentType = res.headers.get("Content-Type") || "";

      // Emergency/crisis responses come back as a single JSON object, not
      // streamed — they're a fixed message returned instantly, no AI call.
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data.conversationId) conversationIdRef.current = data.conversationId;
        setLoading(false);
        setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
        speak(data.reply);
        return;
      }

      // Everything else streams in as plain text — update the message
      // bubble live as each chunk arrives instead of waiting for it all.
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let started = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        fullText += chunk;
        if (!started) {
          started = true;
          setLoading(false);
          setMessages((m) => [...m, { role: "assistant", text: fullText }]);
        } else {
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = { role: "assistant", text: fullText };
            return copy;
          });
        }
      }

      speak(fullText);
      const combined = `${text} ${fullText}`;
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
      className="fixed inset-x-0 bottom-0 md:inset-x-auto md:bottom-6 md:right-6 z-[95] glass overflow-hidden shadow-2xl flex flex-col w-full md:w-[380px] h-[68dvh] md:h-[520px] rounded-t-3xl md:rounded-2xl"
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
          <button
            onClick={() => {
              const next = !speakReplies;
              setSpeakReplies(next);
              if (next) {
                speakNow("Voice replies on");
              } else if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${speakReplies ? "bg-white/90 text-gold-700" : "bg-white/20 text-white"}`}
            aria-label={speakReplies ? "Mute ALBA voice replies" : "Unmute ALBA voice replies"}
            title={speakReplies ? "Voice replies on — tap to mute" : "Voice replies off — tap to unmute"}
          >
            {speakReplies ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button onClick={onClose} className="text-graphite-800/70 hover:text-graphite-900 p-1"><X size={18} /></button>
        </div>
      </div>

      <div className="flex gap-1.5 px-4 py-2.5 border-b border-pearl-200 shrink-0 bg-pearl-50/60 overflow-x-auto md:flex-wrap no-scrollbar">
        {ALBA_ENTRIES.map((e) => (
          <button key={e} onClick={() => send(e)} className="shrink-0 glass rounded-full px-2.5 py-1 text-[11px] font-semibold text-gold-700">{e}</button>
        ))}
      </div>

      <div className="px-4 py-3 flex-1 overflow-y-auto min-h-0">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end mb-2.5" : "flex mb-2.5"}>
            <div className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug ${m.role === "user" ? "bg-pearl-100 text-black" : "bg-white text-black shadow-sm"}`}>{m.text}</div>
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

      <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-t border-pearl-200 shrink-0" style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}>
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
          className="flex-1 rounded-full bg-white border border-pearl-300 px-3.5 py-2 text-[13px] text-black outline-none focus:border-gold-500 disabled:opacity-60"
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
          className="fixed right-4 bottom-24 md:right-6 md:bottom-6 z-[80] w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-glow bg-pearl-50 border border-gold-500/30"
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