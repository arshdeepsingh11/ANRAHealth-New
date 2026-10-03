// Small Gemini helper shared by Neyu features (portal chat, daily brief,
// monthly story). Returns null when the key is missing or the call fails, so
// callers always have a rules-based fallback.

export async function gemini(system: string, message: string, opts: { history?: { role: string; text: string }[]; maxTokens?: number; temperature?: number } = {}): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"}:generateContent?key=${key}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [...(opts.history || []).slice(-6).map((h) => ({ role: h.role === "user" ? "user" : "model", parts: [{ text: h.text }] })), { role: "user", parts: [{ text: message }] }],
        generationConfig: { temperature: opts.temperature ?? 0.4, maxOutputTokens: opts.maxTokens ?? 300 },
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error("Gemini " + res.status);
    const data = await res.json();
    const text = (data?.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || "").join("").replace(/\*\*|__|#+\s/g, "").trim();
    return text || null;
  } catch (e: any) {
    console.error("Gemini error:", e?.message);
    return null;
  }
}

/** Plain-language safety check on AI text before showing it: no diagnosis or medication advice. */
export const unsafeAiText = (t: string) => /\b(diagnos|you have (a|an) |prescri|increase your dose|stop taking|start taking|mg\b)/i.test(t);
