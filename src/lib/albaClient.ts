"use client";

import { cleanAlbaText } from "@/components/AlbaContext";

// One-off ALBA answer (used by the health map's "Ask ALBA about …").
// Goes through the same /api/chat route (so it is logged and protected by
// the server-side emergency net) but is kept out of the main conversation.
export async function askAlbaOnce(message: string, pageContext = "/"): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history: [{ role: "user", text: message }], pageContext }),
  });
  if (!res.ok) throw new Error("ALBA request failed");
  const type = res.headers.get("Content-Type") || "";
  if (type.includes("application/json")) {
    const data = await res.json();
    return cleanAlbaText(data.reply || "").trim();
  }
  return cleanAlbaText(await res.text()).trim();
}

// Design "typewriter": reveals text 3 characters per frame (~16ms).
export function typeOut(text: string, onStep: (shown: number) => void): () => void {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    onStep(text.length);
    return () => {};
  }
  let n = 0;
  const id = setInterval(() => {
    n = Math.min(text.length, n + 3);
    onStep(n);
    if (n >= text.length) clearInterval(id);
  }, 16);
  return () => clearInterval(id);
}