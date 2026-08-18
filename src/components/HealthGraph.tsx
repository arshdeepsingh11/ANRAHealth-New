"use client";

import React, { useState } from "react";
import * as Icons from "lucide-react";
import { Send } from "lucide-react";
import { graphNodes, GraphChild } from "@/data/graphNodes";

type View =
  | { type: "home" }
  | { type: "category"; nodeId: string }
  | { type: "preview"; title: string; description: string }
  | { type: "alba" };

function polar(angleDeg: number, radiusPct: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: 50 + radiusPct * Math.cos(rad), y: 50 + radiusPct * Math.sin(rad) };
}

const ALBA_ENTRIES = ["Record Q&A", "Care Coordination", "Symptom Triage", "Daily Check-ins"];

function Breadcrumb({ onHome }: { onHome: () => void }) {
  return (
    <button onClick={onHome} className="fixed top-4 left-4 md:top-6 md:left-6 z-40 flex items-center gap-2 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2">
      <span className="w-2 h-2 rounded-full bg-gold-500" />
      Your Health, One Record
    </button>
  );
}

function BackTab({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-center mb-6">
      <button onClick={onClick} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-glass">
        ← Back to full map
      </button>
    </div>
  );
}

function AlbaPanel() {
  return (
    <div className="max-w-xl mx-auto glass rounded-3xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-pearl-200">
        <div className="w-11 h-11 rounded-full gold-gloss flex items-center justify-center font-display italic text-lg">A</div>
        <div>
          <p className="font-semibold text-graphite-900">ALBA</p>
          <p className="text-xs text-graphite-500">Your AI Health Companion</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 px-6 py-4 border-b border-pearl-200">
        {ALBA_ENTRIES.map((e) => (
          <button key={e} className="glass card-hover rounded-full px-3 py-1.5 text-xs font-semibold text-gold-700">{e}</button>
        ))}
      </div>
      <div className="px-6 py-6 min-h-[100px]">
        <div className="ml-auto max-w-[85%] bg-pearl-100 rounded-2xl px-4 py-3 text-sm text-graphite-800 mb-3">What was my last cholesterol reading?</div>
        <div className="max-w-[90%] bg-white rounded-2xl px-4 py-3 text-sm text-graphite-800 shadow-sm">Your most recent lipid panel (June 3) showed LDL 118 mg/dL and HDL 52 mg/dL. Would you like me to compare this with your prior visit?</div>
      </div>
      <div className="flex items-center gap-2 px-6 py-4 border-t border-pearl-200">
        <div className="flex-1 rounded-full bg-white border border-pearl-300 px-4 py-2.5 text-sm text-graphite-400">Ask ALBA anything about your health record…</div>
        <button className="w-9 h-9 rounded-full gold-gloss flex items-center justify-center shrink-0"><Send size={14} /></button>
      </div>
      <p className="text-center text-xs text-graphite-400 pb-4">Preview only — full conversational AI coming in the next phase.</p>
    </div>
  );
}

function NodeIcon({ name, size = 22 }: { name: string; size?: number }) {
  const Icon = (Icons as any)[name] || Icons.Circle;
  return <Icon size={size} className="text-gold-600" strokeWidth={1.75} />;
}

export default function HealthGraph() {
  const [view, setView] = useState<View>({ type: "home" });
  const goHome = () => setView({ type: "home" });

  const openNode = (nodeId: string) => {
    const node = graphNodes.find((n) => n.id === nodeId)!;
    if (nodeId === "alba") return setView({ type: "alba" });
    if (node.standalone && node.children) {
      const c = node.children[0];
      return setView({ type: "preview", title: c.label, description: c.description });
    }
    setView({ type: "category", nodeId });
  };

  const openChild = (child: GraphChild) => setView({ type: "preview", title: child.label, description: child.description });

  return (
    <section className="relative w-full">
      {view.type !== "home" && <Breadcrumb onHome={goHome} />}

      {view.type !== "home" && (
        <div className="text-center mb-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-graphite-900">
            {view.type === "category" && graphNodes.find((n) => n.id === (view as any).nodeId)?.label}
            {view.type === "preview" && (view as any).title}
            {view.type === "alba" && "ALBA"}
          </h1>
        </div>
      )}

      {view.type !== "home" && <BackTab onClick={goHome} />}

      {/* ── HOME view ─────────────────────────────────────────────── */}
      {view.type === "home" && (
        <div className="relative mx-auto aspect-square w-full max-w-[600px]">
          {/* Soft concentric depth rings behind everything */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="rounded-full border border-gold-500/10" style={{ width: "92%", height: "92%" }} />
            <div className="absolute rounded-full border border-gold-500/10" style={{ width: "75%", height: "75%" }} />
          </div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {graphNodes.map((n) => {
              const p = polar(n.angle, 37);
              return <line key={n.id} x1={50} y1={50} x2={p.x} y2={p.y} stroke="#C9A227" strokeOpacity={0.4} strokeWidth={0.4} />;
            })}
            {/* Small gold connector dots at each node junction */}
            {graphNodes.map((n) => {
              const p = polar(n.angle, 27);
              return <circle key={`dot-${n.id}`} cx={p.x} cy={p.y} r={0.9} fill="#C9A227" />;
            })}
          </svg>

          <div
            className="absolute rounded-full flex flex-col items-center justify-center text-center"
            style={{
              left: "50%", top: "50%", transform: "translate(-50%,-50%)",
              width: "30%", height: "30%",
              background: "radial-gradient(circle at 40% 35%, #FDFBF6 0%, #F7F5F0 60%, #EFEDE9 100%)",
              boxShadow: "0 0 0 1px rgba(201,162,39,0.25), 0 20px 50px rgba(30,28,24,0.10)",
            }}
          >
            <span className="w-7 h-px bg-gold-500 mb-2.5" />
            <span className="text-lg md:text-xl font-display font-semibold text-graphite-900 leading-snug px-3">
              Your Health,<br />One Record
            </span>
          </div>

          {graphNodes.map((n) => {
            const p = polar(n.angle, 37);
            return (
              <button
                key={n.id}
                onClick={() => openNode(n.id)}
                className="absolute rounded-full glass card-hover flex flex-col items-center justify-center text-center px-3 gap-1.5"
                style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)", width: "20%", height: "20%" }}
              >
                <NodeIcon name={n.icon} />
                <span className="text-sm md:text-base font-bold text-graphite-900 leading-tight">{n.label}</span>
                {n.sub && <span className="text-xs font-semibold tracking-wide text-gold-600">{n.sub}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* ── CATEGORY view ─────────────────────────────────────────── */}
      {view.type === "category" && (() => {
        const node = graphNodes.find((n) => n.id === view.nodeId)!;
        const children = node.children || [];
        return (
          <div className="relative mx-auto aspect-square w-full max-w-[600px]">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="rounded-full border border-gold-500/10" style={{ width: "92%", height: "92%" }} />
            </div>
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {children.map((c, i) => {
                const angle = (360 / children.length) * i - 90;
                const p = polar(angle, 37);
                return <line key={c.label} x1={50} y1={50} x2={p.x} y2={p.y} stroke="#C9A227" strokeOpacity={0.35} strokeWidth={0.35} />;
              })}
              {children.map((c, i) => {
                const angle = (360 / children.length) * i - 90;
                const p = polar(angle, 27);
                return <circle key={`dot-${c.label}`} cx={p.x} cy={p.y} r={0.8} fill="#C9A227" />;
              })}
            </svg>
            <div
              className="absolute rounded-full flex flex-col items-center justify-center text-center"
              style={{
                left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "27%", height: "27%",
                background: "radial-gradient(circle at 40% 35%, #FDFBF6 0%, #F7F5F0 60%, #EFEDE9 100%)",
                boxShadow: "0 0 0 1px rgba(201,162,39,0.25), 0 20px 50px rgba(30,28,24,0.10)",
              }}
            >
              <NodeIcon name={node.icon} size={20} />
              <span className="text-base font-display font-semibold text-graphite-900 leading-snug px-2 mt-2">{node.label}</span>
            </div>
            {children.map((c, i) => {
              const angle = (360 / children.length) * i - 90;
              const p = polar(angle, 37);
              return (
                <button
                  key={c.label}
                  onClick={() => openChild(c)}
                  className="absolute rounded-full glass card-hover flex items-center justify-center text-center px-2"
                  style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)", width: "19%", height: "19%" }}
                >
                  <span className="text-sm font-bold text-graphite-900 leading-tight">{c.label}</span>
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* ── PREVIEW view ──────────────────────────────────────────── */}
      {view.type === "preview" && (
        <div className="max-w-xl mx-auto text-center">
          <div className="glass rounded-3xl p-8 md:p-12">
            <p className="text-xs font-semibold tracking-wide uppercase text-gold-600 mb-3 font-display italic">Preview</p>
            <p className="text-base md:text-lg leading-relaxed text-graphite-700">{(view as any).description}</p>
            <p className="text-xs text-graphite-400 mt-6">Full page for this section is next in line to build.</p>
          </div>
        </div>
      )}

      {/* ── ALBA view ─────────────────────────────────────────────── */}
      {view.type === "alba" && <AlbaPanel />}
    </section>
  );
}