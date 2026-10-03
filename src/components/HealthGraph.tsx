"use client";

import React, { useState } from "react";
import * as Icons from "lucide-react";
import { graphNodes, GraphChild } from "@/data/graphNodes";
import { useAlba } from "@/components/AlbaContext";
import GlowConnector from "@/components/GlowConnector";
import TypingLabel from "@/components/TypingLabel";

type View =
  | { type: "home" }
  | { type: "category"; nodeId: string }
  | { type: "preview"; title: string; description: string };

// Short blurbs for the mobile list view (design reference showed a one-line
// caption under each item). Desktop circle view doesn't use these.
const NODE_BLURB: Record<string, string> = {
  specialties: "Every specialty, one connected record.",
  diagnostics: "Imaging, monitoring and lab testing under one roof.",
  precision: "Care shaped by your genetic profile.",
  longevity: "Proactive care to extend your healthspan.",
  alba: "Your AI health companion — available anytime.",
};

// First "count" chip label per category, in the scrollable chip row.
const CHIP_COUNT_LABEL: Record<string, string> = {
  specialties: "Specialties",
  diagnostics: "Diagnostics",
};

// Longevity and Neyu don't have a multi-item children list (tapping the card
// redirects/opens chat directly), so they get their own static quick-action
// chips instead, to stay visually consistent with the other category cards.
const LONGEVITY_CHIPS = ["Health Risk Assessment", "Nutrition Plan", "Longevity Score"];
const ALBA_CHIPS = ["Symptom Check", "Ask Neyu", "Book a Visit"];

function polar(angleDeg: number, radiusPct: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.round((50 + radiusPct * Math.cos(rad)) * 1000) / 1000,
    y: Math.round((50 + radiusPct * Math.sin(rad)) * 1000) / 1000,
  };
}

function Breadcrumb({ onHome }: { onHome: () => void }) {
  return (
    <button onClick={onHome} className="fixed top-4 left-4 md:top-6 md:left-6 z-40 flex items-center gap-2 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2">
      <span className="w-2 h-2 rounded-full bg-gold-500" />
      Your Health, One Record
    </button>
  );
}

// Mobile-only header: back + breadcrumb text, sits in normal document flow
// (NOT fixed/sticky) so it scrolls away with the page.
function MobileHeader({ onHome, section }: { onHome: () => void; section: string }) {
  return (
    <div className="md:hidden flex items-center gap-3 px-4 pt-4 pb-2">
      <button onClick={onHome} className="flex items-center gap-1 text-sm font-semibold text-gold-700 glass rounded-full px-3 py-1.5 shrink-0">
        <Icons.ChevronLeft size={15} />
        Back
      </button>
      <p className="text-[11px] font-semibold tracking-wide uppercase text-graphite-500 truncate">
        You / {section}
      </p>
    </div>
  );
}

function BackTab({ onClick }: { onClick: () => void }) {
  return (
    <div className="hidden md:flex justify-center mb-6">
      <button onClick={onClick} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-glass">
        ← Back to full map
      </button>
    </div>
  );
}

function NodeIcon({ name, size = 26 }: { name: string; size?: number }) {
  const Icon = (Icons as any)[name] || Icons.Circle;
  return <Icon size={size} className="text-gold-600" strokeWidth={1.75} />;
}

export default function HealthGraph() {
  const [view, setView] = useState<View>({ type: "home" });
  const { openAlba, registerAlbaNode } = useAlba();
  const goHome = () => setView({ type: "home" });

  const openNode = (nodeId: string) => {
    const node = graphNodes.find((n) => n.id === nodeId)!;
    if (nodeId === "alba") return openAlba();
    if (nodeId === "longevity") { window.location.href = "/longevity"; return; }
    if (node.standalone && node.children) {
      const c = node.children[0];
      return setView({ type: "preview", title: c.label, description: c.description });
    }
    setView({ type: "category", nodeId });
  };

  // Cardiology has a fully built page — navigate there instead of showing a preview card.
     const openChild = (child: GraphChild) => {
    if (child.label === "Cardiology") { window.location.href = "/specialties/cardiology"; return; }
    if (child.label === "Skin Health") { window.location.href = "/specialties/skin-health"; return; }
    if (child.label === "Respiratory Medicine") { window.location.href = "/specialties/respiratory-medicine"; return; }
    if (child.label === "Genomics") { window.location.href = "/genomics"; return; }
    if (child.label === "Heart Failure Clinic") { window.location.href = "/specialties/heart-failure-clinic"; return; }
    if (child.label === "Internal Medicine") { window.location.href = "/specialties/internal-medicine"; return; }
    if (child.label === "Endocrinology") { window.location.href = "/specialties/endocrinology"; return; }
    if (child.label === "Geriatric Medicine") { window.location.href = "/specialties/geriatric-medicine"; return; }
    if (child.label === "Pediatric Rheumatology") { window.location.href = "/specialties/pediatric-rheumatology"; return; }
    if (child.label === "Nutrition") { window.location.href = "/specialties/nutrition"; return; }
    if (child.label === "Precision Medicine") { window.location.href = "/specialties/precision-medicine"; return; }
    if (child.label === "Cardiac Imaging") { window.location.href = "/diagnostics/cardiac-imaging"; return; }
    if (child.label === "Stress Testing") { window.location.href = "/diagnostics/stress-testing"; return; }
    if (child.label === "Vascular") { window.location.href = "/diagnostics/vascular"; return; }
    if (child.label === "Monitoring") { window.location.href = "/diagnostics/monitoring"; return; }
    if (child.label === "Pulmonary") { window.location.href = "/diagnostics/pulmonary"; return; }
    setView({ type: "preview", title: child.label, description: child.description });
  };

  return (
    <section className="relative w-full">
      {view.type !== "home" && (
        <div className="hidden md:block">
          <Breadcrumb onHome={goHome} />
        </div>
      )}

      {view.type !== "home" && (
        <MobileHeader
          onHome={goHome}
          section={
            view.type === "category"
              ? (graphNodes.find((n) => n.id === (view as any).nodeId)?.label || "").toUpperCase()
              : (view as any).title.toUpperCase()
          }
        />
      )}

      {view.type !== "home" && (
        <div className="text-center mb-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-graphite-900">
            {view.type === "category" && graphNodes.find((n) => n.id === (view as any).nodeId)?.label}
            {view.type === "preview" && (view as any).title}
          </h1>
        </div>
      )}

      {view.type !== "home" && <BackTab onClick={goHome} />}

      {/* ── HOME view ─────────────────────────────────────────────── */}
      {view.type === "home" && (
        <>
        <div className="hidden md:block relative mx-auto aspect-square w-full max-w-[660px]">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="rounded-full border border-gold-500/20" style={{ width: "92%", height: "92%" }} />
            <div className="absolute rounded-full border border-gold-500/20" style={{ width: "75%", height: "75%" }} />
            <div
              className="absolute rounded-full"
              style={{
                width: "44%", height: "44%",
                background: "radial-gradient(circle, rgba(110,168,182,0.30) 0%, rgba(42,132,228,0.14) 45%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />
          </div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {graphNodes.map((n, i) => {
              const p = polar(n.angle, 38);
              return (
                <GlowConnector
                  key={n.id}
                  x1={50} y1={50} x2={p.x} y2={p.y}
                  curve={4}
                  color="#5E93B8"
                  strokeWidth={0.6}
                  baseOpacity={0.28}
                  dashLength={1.2}
                  gapLength={44}
                  duration={3.4}
                  delay={i * 0.35}
                />
              );
            })}
            {graphNodes.map((n) => {
              const p = polar(n.angle, 26);
              return <circle key={`dot-${n.id}`} cx={p.x} cy={p.y} r={0.9} fill="#5E93B8" />;
            })}
          </svg>

          <div
            className="absolute rounded-full flex flex-col items-center justify-center text-center"
            style={{
              left: "50%", top: "50%", transform: "translate(-50%,-50%)",
              width: "32%", height: "32%",
              background: "radial-gradient(circle at 36% 28%, #ffffff 0%, #EDE4F7 52%, #C8A8E9 100%)",
              boxShadow: "0 0 0 1px rgba(110,168,182,0.35), 0 0 60px rgba(42,132,228,0.30), 0 20px 50px rgba(101,113,102,0.18)",
            }}
          >
            <span className="w-7 h-px bg-gold-500 mb-2.5" />
            <span className="text-lg md:text-xl font-display font-semibold text-graphite-900 leading-snug px-3">
              Your Health,<br />One Record
            </span>
          </div>

          {graphNodes.map((n) => {
            const p = polar(n.angle, 38);
            return (
              <button
                key={n.id}
                ref={(el) => { if (n.id === "alba" && el && el.offsetParent !== null) registerAlbaNode(el); }}
                onClick={() => openNode(n.id)}
                className="absolute rounded-full glass card-hover flex flex-col items-center justify-center text-center px-3 gap-1.5"
                style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)", width: "22%", height: "22%" }}
              >
                <NodeIcon name={n.icon} />
                <span className="text-sm md:text-base font-bold text-graphite-900 leading-tight">{n.label}</span>
                {n.sub && <span className="text-xs font-semibold tracking-wide text-gold-600">{n.sub}</span>}
              </button>
            );
          })}
        </div>

        {/* Mobile — claymorphism cards, centered, no side line, scrollable chips on every card */}
        <div className="md:hidden px-5 pb-8">
          <div className="text-center mb-2">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-gold-600">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
              <TypingLabel text="Your Health, One Record" />
            </p>
          </div>
          <p className="text-center text-sm text-graphite-600 mb-6 px-4">
            Everything about your health, connected in one record.
          </p>
          <div className="space-y-4">
            {graphNodes.map((n) => (
              <div key={n.id} className="clay w-full px-5 py-4">
                <button
                  ref={(el) => { if (n.id === "alba" && el && el.offsetParent !== null) registerAlbaNode(el as any); }}
                  onClick={() => openNode(n.id)}
                  className="w-full flex items-center justify-between gap-3 text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center shrink-0">
                      <NodeIcon name={n.icon} size={21} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-graphite-900 text-[15px] leading-tight truncate">{n.label}</p>
                      <p className="text-xs text-graphite-500 mt-0.5 leading-snug line-clamp-2">{NODE_BLURB[n.id]}</p>
                    </div>
                  </div>
                  <Icons.ChevronRight size={18} className="text-graphite-400 shrink-0" />
                </button>

                {n.children && n.children.length > 1 && (
                  <div className="mt-3 pt-3 border-t border-pearl-200 -mx-1 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 px-1 w-max">
                      <button
                        onClick={() => setView({ type: "category", nodeId: n.id })}
                        className="shrink-0 gold-gloss px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
                      >
                        {n.children.length} {CHIP_COUNT_LABEL[n.id] || "Options"}
                      </button>
                      {n.children.map((c) => (
                        <button
                          key={c.label}
                          onClick={() => openChild(c)}
                          className="shrink-0 bg-pearl-100 text-graphite-700 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {n.id === "longevity" && (
                  <div className="mt-3 pt-3 border-t border-pearl-200 -mx-1 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 px-1 w-max">
                      {LONGEVITY_CHIPS.map((label) => (
                        <button
                          key={label}
                          onClick={() => { window.location.href = "/longevity"; }}
                          className="shrink-0 bg-pearl-100 text-graphite-700 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {n.id === "alba" && (
                  <div className="mt-3 pt-3 border-t border-pearl-200 -mx-1 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 px-1 w-max">
                      {ALBA_CHIPS.map((label) => (
                        <button
                          key={label}
                          onClick={() => openAlba()}
                          className="shrink-0 bg-pearl-100 text-graphite-700 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        </>
      )}

      {/* ── CATEGORY view ─────────────────────────────────────────── */}
      {view.type === "category" && (() => {
        const node = graphNodes.find((n) => n.id === view.nodeId)!;
        const children = node.children || [];
        return (
          <>
          <div className="hidden md:block relative mx-auto aspect-square w-full max-w-[660px]">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="rounded-full border border-gold-500/15" style={{ width: "92%", height: "92%" }} />
            </div>
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {children.map((c, i) => {
                const angle = (360 / children.length) * i - 90;
                const p = polar(angle, 38);
                return (
                  <GlowConnector
                    key={c.label}
                    x1={50} y1={50} x2={p.x} y2={p.y}
                    curve={4}
                    color="#5E93B8"
                    strokeWidth={0.55}
                    baseOpacity={0.24}
                    dashLength={1.1}
                    gapLength={40}
                    duration={3.2}
                    delay={i * 0.3}
                  />
                );
              })}
              {children.map((c, i) => {
                const angle = (360 / children.length) * i - 90;
                const p = polar(angle, 26);
                return <circle key={`dot-${c.label}`} cx={p.x} cy={p.y} r={0.8} fill="#5E93B8" />;
              })}
            </svg>
            <div
              className="absolute rounded-full flex flex-col items-center justify-center text-center"
              style={{
                left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "29%", height: "29%",
                background: "radial-gradient(circle at 36% 28%, #ffffff 0%, #EDE4F7 52%, #C8A8E9 100%)",
                boxShadow: "0 0 0 1px rgba(110,168,182,0.30), 0 0 50px rgba(42,132,228,0.20), 0 20px 50px rgba(101,113,102,0.16)",
              }}
            >
              <NodeIcon name={node.icon} size={24} />
              <span className="text-base font-display font-semibold text-graphite-900 leading-snug px-2 mt-2">{node.label}</span>
            </div>
            {children.map((c, i) => {
              const angle = (360 / children.length) * i - 90;
              const p = polar(angle, 38);
              return (
                <button
                  key={c.label}
                  onClick={() => openChild(c)}
                  className="absolute rounded-full glass card-hover flex items-center justify-center text-center px-2"
                  style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)", width: "21%", height: "21%" }}
                >
                  <span className="text-sm font-bold text-graphite-900 leading-tight">{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile — claymorphism cards, centered, no side line */}
          <div className="md:hidden px-5 pb-8 space-y-4">
            {children.map((c) => (
              <button
                key={c.label}
                onClick={() => openChild(c)}
                className="clay w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <p className="font-bold text-graphite-900 text-[15px] leading-tight">{c.label}</p>
                <Icons.ChevronRight size={18} className="text-graphite-400 shrink-0" />
              </button>
            ))}
          </div>
          </>
        );
      })()}

      {/* ── PREVIEW view ──────────────────────────────────────────── */}
      {view.type === "preview" && (
        <div className="max-w-xl mx-auto text-center px-4 md:px-0">
          <div className="glass rounded-3xl p-6 md:p-12">
            <p className="text-xs font-semibold tracking-wide uppercase text-gold-600 mb-3 font-display italic">Preview</p>
            <p className="text-base md:text-lg leading-relaxed text-graphite-700">{(view as any).description}</p>
            <p className="text-xs text-graphite-400 mt-6">Full page for this section is next in line to build.</p>
          </div>
        </div>
      )}
    </section>
  );
}