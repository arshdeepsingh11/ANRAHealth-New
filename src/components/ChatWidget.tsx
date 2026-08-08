"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, Heart, Loader2, Stethoscope, CalendarCheck, ChevronRight } from "lucide-react";

interface Suggestion {
  type: "physician" | "service" | "booking";
  title: string;
  subtitle?: string;
  link: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  suggestions: Suggestion[];
}

const SUGGESTION_ICONS: Record<string, any> = {
  physician: Stethoscope,
  service: Heart,
  booking: CalendarCheck,
};

function SuggestionCard({ suggestion, onNavigate }: { suggestion: Suggestion; onNavigate: () => void }) {
  const Icon = SUGGESTION_ICONS[suggestion.type] || ChevronRight;
  return (
    <Link
      href={suggestion.link}
      onClick={onNavigate}
      className="flex items-center gap-3 bg-white border border-line rounded-xl px-3 py-2.5 hover:border-blue hover:bg-bluesoft transition-colors"
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-bluesoft shrink-0">
        <Icon size={14} color="#3B7EA1" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink truncate">{suggestion.title}</p>
        {suggestion.subtitle && <p className="text-xs text-inksoft truncate">{suggestion.subtitle}</p>}
      </div>
      <ChevronRight size={14} className="text-inksoft shrink-0" />
    </Link>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hi, I'm the ANRA Health assistant. Ask me about our services, physicians, locations, or how to book an appointment.",
      suggestions: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", text, suggestions: [] }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: newMessages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.reply, suggestions: Array.isArray(data.suggestions) ? data.suggestions : [] },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Sorry, something went wrong. Please try again, or call us at 403-475-4475.",
          suggestions: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 md:bottom-6 md:right-6 z-50 flex items-center gap-2 rounded-full pl-4 pr-5 py-3.5 shadow-lg bg-blue text-white transition-transform hover:scale-105"
      >
        {open ? <X size={18} /> : <MessageCircle size={18} />}
        <span className="text-sm font-medium hidden sm:inline">{open ? "Close" : "Ask ANRA"}</span>
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-5 md:right-6 z-50 w-[92vw] sm:w-[360px] rounded-2xl shadow-2xl flex flex-col overflow-hidden bg-white"
          style={{ height: 480, boxShadow: "0 20px 50px rgba(59,126,161,0.25)" }}
        >
          <div className="px-4 py-3 flex items-center gap-2 bg-bluesoft">
            <Heart size={15} color="#D65A5A" />
            <span className="text-sm font-semibold text-ink">ANRA Health Assistant</span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex flex-col gap-2"}>
                <div
                  className={`text-sm leading-relaxed px-3 py-2 rounded-xl max-w-[85%] ${
                    m.role === "user" ? "text-white bg-blue" : "mr-auto bg-bgalt text-ink"
                  }`}
                >
                  {m.text}
                </div>
                {m.role === "assistant" && m.suggestions && m.suggestions.length > 0 && (
                  <div className="flex flex-col gap-1.5 max-w-[92%]">
                    {m.suggestions.map((s, si) => (
                      <SuggestionCard key={si} suggestion={s} onNavigate={() => setOpen(false)} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="mr-auto bg-bgalt text-inksoft text-sm px-3 py-2 rounded-xl flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="flex items-center gap-2 p-3 border-t border-line">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about services, hours…"
              disabled={loading}
              className="flex-1 text-sm px-3 py-2 rounded-lg outline-none border border-line text-ink disabled:opacity-60"
            />
            <button onClick={send} disabled={loading} className="p-2 rounded-lg bg-blue text-white disabled:opacity-60" aria-label="Send">
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
