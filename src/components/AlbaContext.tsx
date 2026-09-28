"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { isEmergency } from "@/data/homeContent";

// ALBA's shared state. One conversation is shared by every ALBA surface —
// the floating panel (AlbaWidget) and the homepage ALBA console — so a chat
// started on one continues on the other.
//
// Keeps everything the original widget did: streaming replies from
// /api/chat, server-side conversation logging (conversationId), voice
// replies (speech synthesis), suggested routes, and the emergency safety net
// (client keyword check + the server's own `emergency: true` response).

export type AlbaRole = "user" | "assistant";
export interface AlbaMessage { role: AlbaRole; text: string; kind?: "safety" | "error" }

const ROUTES: { match: RegExp; href: string; label: string }[] = [
  { match: /cardiology/i, href: "/specialties/cardiology", label: "Open Cardiology" },
  { match: /referral/i, href: "/referral-centre", label: "Open Referral Centre" },
  { match: /contact|book an appointment/i, href: "/contact", label: "Open Contact" },
];

export const ALBA_UNAVAILABLE = "ALBA is unavailable right now. Nothing you wrote has been lost. The tools on this page still work without ALBA.";

// Design: strip markdown so replies read as calm plain text.
export const cleanAlbaText = (t: string) => (t || "").replace(/\*\*|__|#+\s/g, "").replace(/^\s*[-*]\s/gm, "• ");

interface AlbaContextType {
  isOpen: boolean;
  openAlba: (text?: string) => void;
  closeAlba: () => void;
  albaNodeRect: DOMRect | null;
  registerAlbaNode: (el: HTMLElement | null) => void;

  messages: AlbaMessage[];
  loading: boolean;
  send: (text: string) => Promise<void>;
  clear: () => void;
  suggestedRoute: { href: string; label: string } | null;

  speakReplies: boolean;
  setSpeakReplies: (on: boolean) => void;
  speakNow: (text: string) => void;

  emergency: boolean;
  triggerEmergency: () => void;
  closeEmergency: () => void;
}

const AlbaContext = createContext<AlbaContextType | null>(null);

export function AlbaProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [albaNodeRect, setAlbaNodeRect] = useState<DOMRect | null>(null);
  const lastRectRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const [messages, setMessages] = useState<AlbaMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestedRoute, setSuggestedRoute] = useState<{ href: string; label: string } | null>(null);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [emergency, setEmergency] = useState(false);
  // Groups the whole chat into one logged conversation on the server.
  const conversationIdRef = useRef<string | null>(null);
  const messagesRef = useRef<AlbaMessage[]>([]);
  messagesRef.current = messages;
  const loadingRef = useRef(false);
  const speakRef = useRef(speakReplies);
  speakRef.current = speakReplies;

  const registerAlbaNode = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const last = lastRectRef.current;
    // Only update state when the position actually moved — otherwise the
    // inline ref callback fires every render and this loops forever.
    if (!last || last.x !== rect.x || last.y !== rect.y || last.w !== rect.width || last.h !== rect.height) {
      lastRectRef.current = { x: rect.x, y: rect.y, w: rect.width, h: rect.height };
      setAlbaNodeRect(rect);
    }
  }, []);

  const speakNow = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Chrome silently does nothing if speak() runs before voices load —
    // wait for the one-time voiceschanged event in that case.
    if (window.speechSynthesis.getVoices().length === 0) {
      const onVoicesReady = () => {
        window.speechSynthesis.removeEventListener("voiceschanged", onVoicesReady);
        window.speechSynthesis.speak(utterance);
      };
      window.speechSynthesis.addEventListener("voiceschanged", onVoicesReady);
    } else {
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const speak = useCallback((text: string) => { if (speakRef.current) speakNow(text); }, [speakNow]);

  const send = useCallback(async (raw: string) => {
    const text = (raw || "").trim();
    if (!text || loadingRef.current) return;
    const history: AlbaMessage[] = [...messagesRef.current, { role: "user", text }];
    setSuggestedRoute(null);

    // Emergency safety net — deterministic, before any AI. Non-negotiable.
    const clientEmergency = isEmergency(text);
    if (clientEmergency) {
      setMessages([...history, { role: "assistant", text: "", kind: "safety" }]);
      setEmergency(true);
    } else {
      setMessages(history);
      setLoading(true);
      loadingRef.current = true;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: history.filter((m) => !m.kind).map((m) => ({ role: m.role, text: m.text })),
          pageContext: pathname || "/",
          conversationId: conversationIdRef.current,
        }),
      });

      const incomingId = res.headers.get("X-Conversation-Id");
      if (incomingId) conversationIdRef.current = incomingId;
      // Client already showed the emergency screen; the request above still
      // runs so the server logs it, but its reply is not displayed.
      if (clientEmergency) return;

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || "failed");
      }

      const contentType = res.headers.get("Content-Type") || "";
      // Emergency/crisis replies arrive as one JSON object (no AI call).
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data.conversationId) conversationIdRef.current = data.conversationId;
        if (data.emergency) {
          setMessages((m) => [...m, { role: "assistant", text: data.reply || "", kind: "safety" }]);
          setEmergency(true);
        } else {
          setMessages((m) => [...m, { role: "assistant", text: cleanAlbaText(data.reply) }]);
          speak(data.reply);
        }
        return;
      }

      // Everything else streams in as plain text.
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
        const shown = cleanAlbaText(fullText);
        if (!started) {
          started = true;
          setLoading(false);
          setMessages((m) => [...m, { role: "assistant", text: shown }]);
        } else {
          setMessages((m) => { const copy = [...m]; copy[copy.length - 1] = { role: "assistant", text: shown }; return copy; });
        }
      }
      speak(fullText);
      const match = ROUTES.find((r) => r.match.test(`${text} ${fullText}`));
      if (match) setSuggestedRoute(match);
    } catch (err: any) {
      console.error("ALBA error:", err?.message);
      if (!clientEmergency) setMessages((m) => [...m, { role: "assistant", text: ALBA_UNAVAILABLE, kind: "error" }]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [pathname, speak]);

  const openAlba = useCallback((text?: string) => {
    setIsOpen(true);
    if (typeof text === "string" && text.trim()) send(text);
  }, [send]);

  const clear = useCallback(() => {
    setMessages([]);
    setSuggestedRoute(null);
    conversationIdRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  return (
    <AlbaContext.Provider
      value={{
        isOpen,
        openAlba,
        closeAlba: () => setIsOpen(false),
        albaNodeRect,
        registerAlbaNode,
        messages,
        loading,
        send,
        clear,
        suggestedRoute,
        speakReplies,
        setSpeakReplies,
        speakNow,
        emergency,
        triggerEmergency: () => setEmergency(true),
        closeEmergency: () => setEmergency(false),
      }}
    >
      {children}
    </AlbaContext.Provider>
  );
}

export function useAlba() {
  const ctx = useContext(AlbaContext);
  if (!ctx) throw new Error("useAlba must be used within AlbaProvider");
  return ctx;
}