"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, X } from "lucide-react";
import { useAlba } from "@/components/AlbaContext";
import AlbaMark from "@/components/AlbaMark";
import { BottomUpLetters } from "@/components/smoothui/bottom-up-letters";

const WALKTHROUGH_KEY = "anra_alba_walkthrough_seen";
const INTRO_TEXT = "Hey, I'm ALBA. Click on me and I'll walk you through everything.";
const ALBA_ENTRIES = ["Record Q&A", "Care Coordination", "Symptom Triage", "Daily Check-ins"];

function IntroBubble({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      onClick={onDismiss}
      className="fixed bottom-28 right-5 md:bottom-32 md:right-6 z-[85] max-w-[280px] glass rounded-2xl px-5 py-4 cursor-pointer transition-transform hover:-translate-y-0.5"
    >
      <p className="text-base font-medium text-graphite-800 leading-relaxed min-h-[3em]">
        <BottomUpLetters text={INTRO_TEXT} className="text-base font-medium text-graphite-800" />
      </p>
    </div>
  );
}

function AlbaPanel({ onClose, panelRef }: { onClose: () => void; panelRef: React.RefObject<HTMLDivElement> }) {
  return (
    <div ref={panelRef} className="fixed bottom-28 right-4 md:right-6 z-[95] w-[92vw] sm:w-[420px] glass rounded-3xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-pearl-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full flex items-center justify-center bg-pearl-50">
            <AlbaMark size={22} />
          </div>
          <div>
            <p className="font-semibold text-graphite-900">ALBA</p>
            <p className="text-xs text-graphite-500">Your AI Health Companion</p>
          </div>
        </div>
        <button onClick={onClose} className="text-graphite-400 hover:text-graphite-700"><X size={18} /></button>
      </div>
      <div className="flex flex-wrap gap-2 px-6 py-4 border-b border-pearl-200">
        {ALBA_ENTRIES.map((e) => (
          <button key={e} className="glass card-hover rounded-full px-3 py-1.5 text-xs font-semibold text-gold-700">{e}</button>
        ))}
      </div>
      <div className="px-6 py-6 min-h-[100px] max-h-[280px] overflow-y-auto">
        <div className="ml-auto max-w-[85%] bg-pearl-100 rounded-2xl px-4 py-3 text-sm text-graphite-800 mb-3">
          What was my last cholesterol reading?
        </div>
        <div className="max-w-[90%] bg-white rounded-2xl px-4 py-3 text-sm text-graphite-800 shadow-sm">
          Your most recent lipid panel (June 3) showed LDL 118 mg/dL and HDL 52 mg/dL. Would you like me to compare this with your prior visit?
        </div>
      </div>
      <div className="flex items-center gap-2 px-6 py-4 border-t border-pearl-200">
        <input
          className="flex-1 rounded-full bg-white border border-pearl-300 px-4 py-2.5 text-sm text-graphite-700 outline-none focus:border-gold-500"
          placeholder="Ask ALBA anything about your health record…"
        />
        <button className="w-9 h-9 rounded-full gold-gloss flex items-center justify-center shrink-0"><Send size={14} /></button>
      </div>
      <p className="text-center text-xs text-graphite-400 pb-4">Preview only — full conversational AI coming in the next phase.</p>
    </div>
  );
}

export default function AlbaWidget() {
  const { isOpen, openAlba, closeAlba } = useAlba();
  const [showIntro, setShowIntro] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const seen = sessionStorage.getItem(WALKTHROUGH_KEY);
    if (!seen) setShowIntro(true);
  }, []);

  // Real fix: close ALBA on any click outside the panel — works no
  // matter what caused it (route change, graph view change, or just
  // clicking elsewhere on the page).
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closeAlba();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeAlba]);

  const handleBubbleClick = () => {
    sessionStorage.setItem(WALKTHROUGH_KEY, "1");
    setShowIntro(false);
    openAlba();
  };

  const handleTabClick = () => {
    sessionStorage.setItem(WALKTHROUGH_KEY, "1");
    setShowIntro(false);
    openAlba();
  };

  return (
    <>
      {showIntro && !isOpen && <IntroBubble onDismiss={handleBubbleClick} />}

      {!isOpen && (
        <button
          ref={tabRef}
          onClick={handleTabClick}
          className="fixed bottom-6 right-5 md:bottom-8 md:right-8 z-[80] w-20 h-20 rounded-full flex items-center justify-center shadow-glow transition-transform hover:scale-105 bg-pearl-50 border border-gold-500/30"
          aria-label="Open ALBA"
        >
          <AlbaMark size={38} />
        </button>
      )}

      {isOpen && <AlbaPanel onClose={closeAlba} panelRef={panelRef} />}
    </>
  );
}