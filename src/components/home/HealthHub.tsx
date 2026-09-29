"use client";

import React, { useEffect, useRef, useState } from "react";
import AlbaOrb from "@/components/AlbaOrb";
import AnraEl from "@/components/AnraEl";
import { useAnraNav, HUB_EVENT } from "@/lib/useAnraNav";
import { askAlbaOnce, typeOut } from "@/lib/albaClient";
import { HUB, HUB_INFO, hubSubs, type HubKey, type NavLink } from "@/data/homeContent";

interface Panel { kicker: string; title: string; desc: string; chart: string; param: number; items: string[]; actions: (NavLink & { layer?: HubKey })[] }

// Home 01 (bottom): "Your Health, One Record" — interactive health map.
// Top ring of 5 domains; selecting one opens its second layer, with a side
// panel (illustrative chart, items, actions and "Ask ALBA about …").
export default function HealthHub({ mobile }: { mobile: boolean }) {
  const go = useAnraNav();
  const [layer, setLayer] = useState<HubKey | null>(null);
  const [sub, setSub] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [last, setLast] = useState(0);
  const [ai, setAi] = useState<{ title: string; text: string } | null>(null);
  const [aiShown, setAiShown] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const stopType = useRef<() => void>(() => {});

  const openLayer = (l: HubKey | null, s: number | null = null) => { setLayer(l); setSub(s); setHover(null); setAi(null); };

  // Deep links: rail/search events on "/" and ?layer=&sub= from other pages.
  useEffect(() => {
    const onHub = (e: Event) => { const d = (e as CustomEvent).detail || {}; openLayer(d.layer ?? null, d.sub ?? null); };
    document.addEventListener(HUB_EVENT, onHub);
    const p = new URLSearchParams(window.location.search);
    const l = p.get("layer") as HubKey | null;
    if (l && HUB_INFO[l]) openLayer(l, p.get("sub") != null ? Number(p.get("sub")) : null);
    return () => { document.removeEventListener(HUB_EVENT, onHub); stopType.current(); };
  }, []);

  const subs = layer ? hubSubs(layer) : null;
  const items: { label: string; k?: HubKey; icon?: string; sub?: string; count?: number; a?: number }[] =
    layer ? subs!.map((x) => ({ label: x.name })) : HUB.map((x) => ({ ...x, count: hubSubs(x.k).length }));
  const n = items.length;
  const R = layer ? (mobile ? 40 : 39) : 37;
  const D = layer ? (n > 6 ? (mobile ? 19 : 16.5) : 19.5) : (mobile ? 24 : 21);
  const C = layer ? 24 : 28;
  const pos = items.map((it, i) => {
    const a = ((layer ? -90 + (i * 360) / n : it.a!) * Math.PI) / 180;
    return { x: 50 + Math.cos(a) * R, y: 50 + Math.sin(a) * R, ca: Math.cos(a), sa: Math.sin(a) };
  });
  const sel = (i: number) => (layer ? sub === i : hover === i);
  const act = layer ? (sub == null ? -1 : sub) : hover == null ? -1 : hover;

  // Side panel content.
  let panel: Panel;
  if (layer && sub != null && subs![sub]) {
    const x = subs![sub];
    panel = { kicker: HUB_INFO[layer].title, title: x.name, desc: x.desc, chart: x.chart, param: x.param || 50, items: x.items || [], actions: x.actions };
  } else if (layer) {
    const inf = HUB_INFO[layer];
    panel = { kicker: "Layer 2 · " + subs!.length + " nodes", title: inf.title, desc: inf.desc + " Select a node to explore it.", chart: inf.chart, param: 50, items: subs!.map((x) => x.name), actions: [] };
  } else {
    const top = HUB[hover != null ? hover : last], inf = HUB_INFO[top.k];
    panel = { kicker: "Your health, one record", title: inf.title, desc: inf.desc, chart: inf.chart, param: 50, items: [], actions: [{ label: "Open " + inf.title, layer: top.k }] };
  }

  const runAction = (a: Panel["actions"][number]) => { if (a.layer) return openLayer(a.layer); go(a); };

  const hubAsk = async () => {
    if (aiLoading) return;
    const title = panel.title;
    setAiLoading(true); setAi(null); setAiShown(0);
    let text: string;
    try {
      text = await askAlbaOnce(`In three short sentences, explain what "${title}" at ANRA Health involves and when people usually consider it. Plain text.`, "Home health map: " + title);
      if (!text) throw new Error("empty");
    } catch {
      text = "ALBA is unavailable right now. The details above still apply, and you can continue with the options below.";
    }
    setAiLoading(false);
    setAi({ title, text });
    stopType.current();
    stopType.current = typeOut(text, setAiShown);
  };
  const aiText = ai && ai.title === panel.title ? ai.text.slice(0, aiShown) : "";

  return (
    <div id="hub" style={{ position: "relative", maxWidth: 1240, margin: "0 auto", padding: "16px clamp(16px,4vw,40px) clamp(56px,8vw,96px)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", minHeight: layer ? 42 : 0 }}>
        {layer && (
          <>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{HUB_INFO[layer].title}</span>
            <button onClick={() => openLayer(null)} className="hv-bdTeal" style={{ marginLeft: 6, height: 36, padding: "0 14px", borderRadius: 999, border: "1px solid #D6D0C5", background: "#FDFCFA", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><i className="ph ph-arrow-left" />Back to full map</button>
          </>
        )}
      </div>

      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: "clamp(20px,3vw,40px)", alignItems: "center" }}>
        <div style={{ flex: "2 1 520px", minWidth: 0 }}>
          <div style={{ position: "relative", width: "100%", maxWidth: mobile ? "100%" : 720, aspectRatio: "1", containerType: "inline-size", margin: "0 auto" } as React.CSSProperties}>
            <AnraEl tag="anra-converge" attrs={{ nodes: pos.map((p) => p.x.toFixed(1) + "," + p.y.toFixed(1)).join(";"), active: act }} style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "block" }} />
            <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }} aria-hidden="true">
              <defs><radialGradient id="hubGlow"><stop offset="0%" stopColor="rgba(140,111,184,.18)" /><stop offset="100%" stopColor="rgba(140,111,184,0)" /></radialGradient></defs>
              <circle cx={50} cy={50} r={46} fill="url(#hubGlow)" />
              <g style={{ transformOrigin: "50px 50px", animation: "spin 120s linear infinite" }}><circle cx={50} cy={50} r={R + 8} fill="none" stroke="rgba(110,168,182,.5)" strokeWidth={0.3} strokeDasharray="0.5 1.8" /></g>
              <circle cx={50} cy={50} r={R} fill="none" stroke="rgba(140,111,184,.22)" strokeWidth={0.3} />
              <g style={{ transformOrigin: "50px 50px", animation: "spinRev 80s linear infinite" }}><circle cx={50} cy={50} r={R - 11} fill="none" stroke="rgba(110,168,182,.25)" strokeWidth={0.25} strokeDasharray="4 3" /></g>
              {pos.map((p, i) => {
                const on = sel(i);
                const ex = 50 + p.ca * (R - D / 2 - 1.2), ey = 50 + p.sa * (R - D / 2 - 1.2), sx = 50 + (p.ca * C) / 2, sy = 50 + (p.sa * C) / 2;
                return (
                  <g key={(layer || "t") + "l" + i}>
                    <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={on ? "#3F6F7C" : "rgba(63,111,124,.3)"} strokeWidth={on ? 0.55 : 0.28} />
                    <circle cx={ex} cy={ey} r={on ? 1.3 : 0.95} fill={on ? "#8C6FB8" : "#4F86A0"} />
                    <circle cx={sx} cy={sy} r={0.8} fill={on ? "#8C6FB8" : "#6EA8B6"} style={{ ["--tx" as any]: ex - sx + "px", ["--ty" as any]: ey - sy + "px", animation: `hubPulse ${2.4 + (i % 3) * 0.5}s ${i * 0.37}s ease-in-out infinite` }} />
                  </g>
                );
              })}
            </svg>

            {/* Centre core */}
            <div key={"c" + (layer || "")} style={{ position: "absolute", left: "50%", top: "50%", width: C + "%", aspectRatio: "1", transform: "translate(-50%,-50%)" }}>
              <span style={{ position: "absolute", inset: "-7%", borderRadius: "50%", background: "conic-gradient(from 0deg, rgba(110,168,182,0) 0 60%, rgba(110,168,182,.7) 78%, rgba(140,111,184,.9) 88%, rgba(140,111,184,0) 100%)", WebkitMask: "radial-gradient(circle, transparent 64%, #000 65%, #000 70%, transparent 71%)", mask: "radial-gradient(circle, transparent 64%, #000 65%, #000 70%, transparent 71%)", animation: "spin 5s linear infinite" }} />
              <button
                onClick={() => (layer ? (setSub(null), setAi(null)) : openLayer("spec"))}
                aria-label={layer ? HUB_INFO[layer].title + " overview" : "Your Health, One Record"}
                style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(255,255,255,.95)", background: "radial-gradient(circle at 50% 30%, #FFFFFF 0%, #F5EFFA 42%, #E2D3F1 100%)", animation: "coreBreath 5s ease-in-out infinite", display: "grid", placeItems: "center", alignContent: "center", gap: "1cqw", textAlign: "center", color: "#14181B", padding: "2cqw", cursor: "pointer" }}
              >
                {layer ? <i className={"ph " + HUB_INFO[layer].icon} style={{ fontSize: "clamp(18px,3.6cqw,30px)", color: "#3F6F7C" }} /> : <span style={{ width: "5cqw", height: 2, background: "#6EA8B6", display: "block", margin: "0 auto", borderRadius: 2 }} />}
                <span style={{ fontSize: layer ? "clamp(12px,2.4cqw,19px)" : "clamp(14px,2.9cqw,24px)", fontWeight: 500, letterSpacing: "-.01em", lineHeight: 1.2, whiteSpace: "pre-line" }}>{layer ? HUB_INFO[layer].title : "Your Health,\nOne Record"}</span>
                <span style={{ fontSize: "clamp(8px,1.3cqw,11px)", letterSpacing: ".16em", textTransform: "uppercase", color: "#6A5096", fontWeight: 600 }}>{layer ? "Layer 2" : "Tap a node"}</span>
              </button>
            </div>

            {/* Nodes */}
            {items.map((it, i) => {
              const p = pos[i], on = sel(i);
              return (
                <div key={(layer || "top") + i} style={{ position: "absolute", ["--x" as any]: p.x + "%", ["--y" as any]: p.y + "%", left: p.x + "%", top: p.y + "%", width: D + "%", aspectRatio: "1", marginLeft: -D / 2 + "%", marginTop: -D / 2 + "%", animation: `hubIn .8s ${i * 0.06}s cubic-bezier(.2,.8,.2,1) both` }}>
                  <div style={{ width: "100%", height: "100%", animation: `hubFloat ${6 + (i % 3)}s ${-i * 1.3}s ease-in-out infinite` }}>
                    <button
                      onMouseEnter={() => { if (!layer) { setHover(i); setLast(i); } }}
                      onMouseLeave={() => { if (!layer) setHover(null); }}
                      onFocus={() => { if (!layer) { setHover(i); setLast(i); } }}
                      onClick={() => (layer ? (setSub(i), setAi(null)) : openLayer(it.k!))}
                      aria-pressed={on}
                      style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", border: "1px solid " + (on ? "#6EA8B6" : "rgba(255,255,255,.95)"), background: on ? "#FFFFFF" : "rgba(253,252,250,.9)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                        boxShadow: on ? "0 0 0 6px rgba(110,168,182,.16),0 0 40px rgba(140,111,184,.35),0 24px 44px -22px rgba(63,111,124,.55)" : "0 18px 36px -24px rgba(20,24,27,.4)", transform: on ? "scale(1.1)" : "scale(1)", transition: "transform .4s cubic-bezier(.2,.8,.2,1),box-shadow .4s,border-color .4s",
                        display: "grid", placeItems: "center", alignContent: "center", gap: ".5cqw", padding: "1.2cqw", textAlign: "center", color: "#14181B",
                        fontSize: layer ? (mobile ? "clamp(9px,2.3cqw,15px)" : "clamp(10px,1.75cqw,15px)") : "clamp(10px,2.05cqw,16px)", fontWeight: 500, lineHeight: 1.22, cursor: "pointer" }}
                    >
                      {on && <span style={{ position: "absolute", inset: "-9%", borderRadius: "50%", border: "1.5px dashed rgba(110,168,182,.9)", animation: "spin 14s linear infinite", pointerEvents: "none" }} />}
                      {it.count ? <span style={{ position: "absolute", top: "4%", right: "8%", minWidth: "4.4cqw", height: "4.4cqw", padding: "0 1cqw", borderRadius: 999, background: "#14181B", color: "#F7F5F1", fontSize: "clamp(9px,1.5cqw,12px)", display: "grid", placeItems: "center" }}>{it.count}</span> : null}
                      {it.k === "ai" ? <AlbaOrb size={mobile ? 18 : 26} /> : it.icon ? <i className={"ph " + it.icon} style={{ fontSize: "clamp(15px,3cqw,24px)", color: "#3F6F7C" }} /> : null}
                      <span>{it.label}</span>
                      {it.sub ? <span style={{ fontSize: "clamp(8px,1.4cqw,11px)", letterSpacing: ".14em", color: "#6A5096", fontWeight: 600 }}>{it.sub}</span> : null}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside id="hub-panel" aria-live="polite" style={{ flex: "1 1 320px", alignSelf: "center", background: "rgba(253,252,250,.9)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid #E3DED5", borderRadius: 24, padding: 22, boxShadow: "0 30px 60px -40px rgba(20,24,27,.35)", minWidth: 0 }}>
          <div style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#5A626A" }}>{panel.kicker}</div>
          <h2 style={{ margin: "6px 0 0", fontSize: 26, lineHeight: 1.1, letterSpacing: "-.02em", fontWeight: 500 }}>{panel.title}</h2>
          <p style={{ margin: "8px 0 0", fontSize: 15, color: "#3A4147" }}>{panel.desc}</p>
          <div style={{ marginTop: 14, height: 150, borderRadius: 14, background: "#FFFFFF", border: "1px solid #EFECE6", overflow: "hidden", position: "relative" }}>
            <AnraEl tag="anra-chart" attrs={{ mode: panel.chart, param: panel.param }} style={{ position: "absolute", inset: "8px 10px" }} />
          </div>
          {panel.items.length > 0 && (
            <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {panel.items.map((it) => <span key={it} style={{ fontSize: 13, padding: "5px 10px", borderRadius: 8, background: "#EFECE6" }}>{it}</span>)}
            </div>
          )}
          <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: "linear-gradient(180deg,#F5F1FA,#FBFAF7)", border: "1px solid #E4DCF1" }}>
            {aiText && (
              <p style={{ margin: "0 0 10px", fontSize: 14.5, color: "#2A2F33" }}>
                {aiText}
                {ai && aiShown < ai.text.length && <span style={{ display: "inline-block", width: 2, height: "1em", background: "#8C6FB8", marginLeft: 2, verticalAlign: -2, animation: "caret 1s steps(1) infinite" }} />}
              </p>
            )}
            {aiLoading && <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, color: "#5A626A", marginBottom: 10 }}><AlbaOrb size={22} />ALBA is thinking…</div>}
            <button onClick={hubAsk} style={{ border: 0, background: "none", padding: "2px 0", display: "flex", gap: 8, alignItems: "center", color: "#6A5096", fontWeight: 600, fontSize: 14, textAlign: "left" }}><AlbaOrb size={22} /><span>Ask ALBA about {panel.title}</span></button>
          </div>
          {panel.actions.length > 0 && (
            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {panel.actions.map((a) => (
                <button key={a.label} onClick={() => runAction(a)} className="hv-fillTeal" style={{ minHeight: 44, padding: "0 16px", borderRadius: 12, border: "1px solid #3F6F7C", background: "transparent", color: "#2F5561", fontSize: 14, fontWeight: 500 }}>{a.label} →</button>
              ))}
            </div>
          )}
        </aside>
      </div>
      <p style={{ margin: "12px 0 0", textAlign: "center", fontSize: 13, color: "#5A626A" }}>Select a node to open its second layer. Charts are illustrative, not your data.</p>
    </div>
  );
}
