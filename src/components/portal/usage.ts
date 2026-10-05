"use client";

// Neyu learns from how the patient uses My Health Space: which screens they
// open and for how long, and which buttons they press (labels only — never
// anything typed). Batched, sent quietly, and only while "Neyu learns from
// my use" is on in Privacy & data.

import { useEffect, useRef } from "react";

type Ev = { kind: "view" | "click"; target: string; ms: number };
const queue: Ev[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;

function flush() {
  clearTimeout(timer); timer = undefined;
  if (!queue.length) return;
  const events = queue.splice(0, 60);
  fetch("/api/portal/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ events }), credentials: "same-origin", keepalive: true }).catch(() => {});
}
const push = (e: Ev) => { queue.push(e); if (queue.length >= 40) flush(); else if (!timer) timer = setTimeout(flush, 20_000); };

export function useUsageTracker(screen: string, label: string, enabled: boolean) {
  const since = useRef(Date.now());
  const visible = useRef(0); // ms visible on this screen
  // Screen dwell time (only while the tab is visible).
  useEffect(() => {
    if (!enabled) return;
    since.current = Date.now(); visible.current = 0;
    const onVis = () => {
      if (document.hidden) { visible.current += Date.now() - since.current; flush(); }
      else since.current = Date.now();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      const ms = visible.current + (document.hidden ? 0 : Date.now() - since.current);
      if (ms > 1500) push({ kind: "view", target: label, ms });
    };
  }, [screen, label, enabled]);
  // Clicks on buttons and links inside My Health Space.
  useEffect(() => {
    if (!enabled) return;
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest?.("button, a, [role=tab]") as HTMLElement | null;
      if (!el || !el.closest(".mhs") || el.closest("input, textarea")) return;
      const t = (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60);
      if (t) push({ kind: "click", target: `${label} › ${t}`, ms: 0 });
    };
    const onHide = () => flush();
    document.addEventListener("click", onClick, true);
    window.addEventListener("pagehide", onHide);
    return () => { document.removeEventListener("click", onClick, true); window.removeEventListener("pagehide", onHide); };
  }, [label, enabled]);
}
