"use client";

import React, { useState } from "react";
import * as Icons from "lucide-react";
import { graphNodes, GraphChild } from "@/data/graphNodes";
import { useAlba } from "@/components/AlbaContext";

type View =
  | { type: "home" }
  | { type: "category"; nodeId: string }
  | { type: "preview"; title: string; description: string };

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

function BackTab({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-center mb-6">
      <button onClick={onClick} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-glass">
        ← Back to full map
      </button>
    </div>
  );
}

function NodeIcon({ name, size = 22 }: { name: string; size?: number }) {
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
    setView({ type: "preview", title: child.label, description: child.description });
  };

  return (
    <section className="relative w-full">
      {view.type !== "home" && <Breadcrumb onHome={goHome} />}

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
        <div className="relative mx-auto aspect-square w-full max-w-[600px]">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="rounded-full border border-gold-500/10" style={{ width: "92%", height: "92%" }} />
            <div className="absolute rounded-full border border-gold-500/10" style={{ width: "75%", height: "75%" }} />
          </div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {graphNodes.map((n) => {
              const p = polar(n.angle, 37);
              return <line key={n.id} x1={50} y1={50} x2={p.x} y2={p.y} stroke="#C9A227" strokeOpacity={0.4} strokeWidth={0.4} />;
            })}
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
                ref={(el) => { if (n.id === "alba") registerAlbaNode(el); }}
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
    </section>
  );
}