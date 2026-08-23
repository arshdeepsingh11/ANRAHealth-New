"use client";

import React, { useEffect, useState } from "react";
import { useAlba } from "@/components/AlbaContext";
import { BottomUpLetters } from "@/components/smoothui/bottom-up-letters";

const INTRO_KEY = "anra_alba_intro_seen";
const LINE = "Hey, I am Alba. Click on me and I will guide you through our whole journey.";

export default function AlbaIntroVeil({ onComplete }: { onComplete: () => void }) {
  const { albaNodeRect } = useAlba();
  const [visible, setVisible] = useState(false);
  const [showText, setShowText] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(INTRO_KEY)) {
      onComplete();
      return;
    }
    setVisible(true);
    const t1 = setTimeout(() => setShowText(true), 500);
    const t2 = setTimeout(() => finish(), 500 + LINE.length * 26 + 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const finish = () => {
    sessionStorage.setItem(INTRO_KEY, "1");
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 500);
  };

  if (!visible) return null;

  const cx = albaNodeRect ? albaNodeRect.left + albaNodeRect.width / 2 : window.innerWidth / 2;
  const cy = albaNodeRect ? albaNodeRect.top + albaNodeRect.height / 2 : window.innerHeight / 2;
  const haloR = albaNodeRect ? Math.max(albaNodeRect.width, albaNodeRect.height) / 2 + 14 : 90;

  return (
    <div
      onClick={finish}
      className="fixed inset-0 z-[110] cursor-pointer"
      style={{ opacity: fading ? 0 : 1, transition: "opacity 0.5s ease" }}
    >
      {/* Blurred/dimmed backdrop with a clear spotlight cut around the ALBA node */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{
          background: "rgba(30,28,24,0.35)",
          maskImage: `radial-gradient(circle ${haloR}px at ${cx}px ${cy}px, transparent 0%, transparent 60%, black 100%)`,
          WebkitMaskImage: `radial-gradient(circle ${haloR}px at ${cx}px ${cy}px, transparent 0%, transparent 60%, black 100%)`,
        }}
      />

      {/* Gold halo ring around the node */}
      <div
        className="absolute rounded-full pointer-events-none animate-pulse-glow"
        style={{
          left: cx - haloR, top: cy - haloR, width: haloR * 2, height: haloR * 2,
          boxShadow: "0 0 40px 10px rgba(201,162,39,0.45)",
          border: "1px solid rgba(201,162,39,0.6)",
        }}
      />

      {/* Calligraphy line beside the node */}
      {showText && (
        <div
          className="absolute max-w-[280px]"
          style={{
            left: Math.min(cx + haloR + 20, window.innerWidth - 300),
            top: cy - 30,
          }}
        >
          <p
            className="font-display italic text-lg leading-snug"
            style={{ color: "#F0E1B2", textShadow: "0 0 12px rgba(201,162,39,0.7), 0 0 2px rgba(255,255,255,0.4)" }}
          >
            <BottomUpLetters text={LINE} staggerDelay={0.026} />
          </p>
        </div>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); finish(); }}
        className="absolute bottom-6 right-6 text-xs font-semibold text-white/70 hover:text-white bg-white/10 backdrop-blur px-4 py-2 rounded-full"
      >
        Skip intro
      </button>
    </div>
  );
}