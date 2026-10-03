"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { HEALTH_FACTS } from "@/data/healthFacts";
import HealthFactModal from "@/components/HealthFactModal";

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
  const [modalOpen, setModalOpen] = useState(false);
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
    if (!visible || modalOpen) return;
    const hideTimer = setTimeout(() => setVisible(false), VISIBLE_MS);
    return () => clearTimeout(hideTimer);
  }, [visible, modalOpen]);

  const dismiss = () => {
    setVisible(false);
    setDismissedForSession(true);
  };

  const fact = HEALTH_FACTS[index];

  const openDetail = () => {
    if (fact.detail) {
      setModalOpen(true);
    }
  };

  if ((!visible && !modalOpen) || (dismissedForSession && !modalOpen)) return null;

  return (
    <>
      {visible && !dismissedForSession && (
        <aside
          aria-label="Did you know?"
          className="neyu-fact"
          style={{ position: "fixed", left: 16, bottom: 24, zIndex: 70, width: 196, borderRadius: 22, overflow: "hidden", background: "rgba(255,255,255,.96)", border: "1px solid rgba(14,27,44,.08)", boxShadow: "0 30px 60px -30px rgba(14,27,44,.45)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", animation: "neyuFactIn .45s cubic-bezier(.2,.8,.2,1)", cursor: fact.detail ? "pointer" : "default" }}
          onClick={openDetail}
        >
          <button onClick={(e) => { e.stopPropagation(); dismiss(); }} aria-label="Hide health facts" style={{ position: "absolute", top: 8, right: 8, zIndex: 2, width: 26, height: 26, borderRadius: 13, border: 0, background: "rgba(255,255,255,.85)", color: "#5A6B7B", cursor: "pointer", display: "grid", placeItems: "center" }}><X size={13} /></button>
          <div style={{ height: 118, background: "linear-gradient(160deg,#E9F7F2,#E6F0FB)", display: "grid", placeItems: "end center" }}><Nurse /></div>
          <div style={{ padding: "12px 14px 14px", display: "grid", gap: 8 }}>
            <span style={{ fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: "#1FA7B4", fontWeight: 700 }}>Nurse tip · Did you know?</span>
            <p key={index} style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "#14263A", minHeight: "6em" }}><Typed text={fact.text} /></p>
            {fact.detail ? (
              <span style={{ justifySelf: "start", padding: "7px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "#fff", background: "linear-gradient(135deg,#2FBF94,#2273D6)" }}>{fact.cta} →</span>
            ) : (
              <Link href={fact.href} onClick={(e) => { e.stopPropagation(); dismiss(); }} style={{ justifySelf: "start", padding: "7px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "#fff", background: "linear-gradient(135deg,#2FBF94,#2273D6)", textDecoration: "none" }}>{fact.cta} →</Link>
            )}
          </div>
          <style jsx global>{`
            @keyframes neyuFactIn { 0% { opacity: 0; transform: translateX(-24px) scale(.96); } 100% { opacity: 1; transform: none; } }
            @keyframes nurseWave { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-14deg); } }
            @keyframes nurseBlink { 0%,92%,100% { transform: scaleY(1); } 95% { transform: scaleY(.1); } }
            @media (max-width: 859px) { .neyu-fact { bottom: 96px !important; width: 172px !important; } }
          `}</style>
        </aside>
      )}

      {modalOpen && (
        <HealthFactModal
          fact={fact}
          onClose={() => {
            setModalOpen(false);
            setVisible(false);
          }}
        />
      )}
    </>
  );
}
/** Types the fact in, character by character. */
function Typed({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => { setN(0); const t = setInterval(() => setN((x) => (x >= text.length ? (clearInterval(t), x) : x + 2)), 22); return () => clearInterval(t); }, [text]);
  return <>{text.slice(0, n)}{n < text.length && <span style={{ opacity: 0.4 }}>▍</span>}</>;
}

/** A friendly cartoon NEYU nurse (vector, waves hello). */
function Nurse() {
  return (
    <svg viewBox="0 0 160 118" width="160" height="118" aria-hidden="true">
      {/* body / scrubs */}
      <path d="M38 118c2-26 18-40 42-40s40 14 42 40z" fill="#2FB5A8" />
      <path d="M68 80l12 14 12-14" fill="#E8F6F3" />
      <path d="M80 94v24" stroke="#1E968B" strokeWidth="2" />
      {/* stethoscope */}
      <path d="M62 84c-4 10-2 20 8 22M98 84c4 10 2 20-8 22" fill="none" stroke="#14324A" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="80" cy="108" r="4" fill="#14324A" />
      {/* waving arm */}
      <g style={{ transformOrigin: "122px 96px", animation: "nurseWave 1.6s ease-in-out infinite" }}>
        <path d="M118 98c8-6 12-18 12-30" stroke="#2FB5A8" strokeWidth="10" strokeLinecap="round" fill="none" />
        <circle cx="130" cy="64" r="7" fill="#F2C7A5" />
      </g>
      {/* neck + head */}
      <rect x="73" y="66" width="14" height="14" rx="5" fill="#E9B590" />
      <circle cx="80" cy="50" r="22" fill="#F2C7A5" />
      {/* hair */}
      <path d="M58 50c0-16 10-26 22-26s22 10 22 26c-4-8-12-12-22-12s-18 4-22 12z" fill="#3A2A22" />
      <circle cx="80" cy="25" r="8" fill="#3A2A22" />
      {/* cap */}
      <path d="M64 30c4-7 28-7 32 0l-3 7H67z" fill="#FFFFFF" stroke="#D5E6EA" />
      <path d="M80 29v6M77 32h6" stroke="#2273D6" strokeWidth="2" strokeLinecap="round" />
      {/* face */}
      <g style={{ transformOrigin: "80px 50px", animation: "nurseBlink 4s infinite" }}>
        <circle cx="72" cy="50" r="2.4" fill="#14263A" /><circle cx="88" cy="50" r="2.4" fill="#14263A" />
      </g>
      <path d="M73 58c4 4 10 4 14 0" stroke="#B5564A" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="67" cy="56" r="3" fill="#F29C8F" opacity=".45" /><circle cx="93" cy="56" r="3" fill="#F29C8F" opacity=".45" />
    </svg>
  );
}
