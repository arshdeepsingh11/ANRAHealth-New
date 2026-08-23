"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import AlbaMark from "@/components/AlbaMark";
import { HEALTH_FACTS } from "@/data/healthFacts";

const INTERVAL_MS = 30000;
const VISIBLE_MS = 9000;

function pickNextIndex(current: number) {
  if (HEALTH_FACTS.length <= 1) return 0;
  let next = Math.floor(Math.random() * HEALTH_FACTS.length);
  while (next === current) next = Math.floor(Math.random() * HEALTH_FACTS.length);
  return next;
}

export default function AlbaFactPopup() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissedForSession, setDismissedForSession] = useState(false);
  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => {
    if (dismissedForSession) return;
    const showTimer = setInterval(() => {
      setIndex((i) => pickNextIndex(i));
      setVisible(true);
    }, INTERVAL_MS);
    return () => clearInterval(showTimer);
  }, [dismissedForSession]);

  useEffect(() => {
    if (!visible) return;
    const hideTimer = setTimeout(() => setVisible(false), VISIBLE_MS);
    return () => clearTimeout(hideTimer);
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
    setDismissedForSession(true);
  };

  if (!visible || dismissedForSession) return null;

  const fact = HEALTH_FACTS[index];

  return (
    <div
      className="fixed left-5 top-24 z-[70] max-w-[260px] glass rounded-xl p-4 shadow-xl"
      style={{ animation: "albaFactIn 0.35s ease-out" }}
    >
      <button onClick={dismiss} className="absolute top-2.5 right-2.5 text-graphite-400 hover:text-graphite-700">
        <X size={12} />
      </button>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-pearl-50 shrink-0">
          <AlbaMark size={12} />
        </div>
        <p className="text-[10px] font-semibold text-gold-600 uppercase tracking-wide">Did you know?</p>
      </div>
      <p className="text-xs text-graphite-700 leading-relaxed mb-3">{fact.text}</p>
      <Link href={fact.href} className="gold-gloss rounded-full px-3 py-1.5 text-[10px] font-semibold inline-block" onClick={dismiss}>
        {fact.cta} →
      </Link>

      <style jsx global>{`
        @keyframes albaFactIn {
          0% { opacity: 0; transform: translateX(-14px); }
          100% { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}