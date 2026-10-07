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
        generationConfig: { temperature: opts.temperature ?? 0.4, maxOutputTokens: Math.max(1024, opts.maxTokens ?? 300) },
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

export type AiPart = { text: string } | { inline_data: { mime_type: string; data: string } };

/** Lenient JSON: strips code fences, takes the outermost {...}, closes a truncated object. */
export function parseLooseJSON<T = any>(raw: string): T | null {
  let t = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try { return JSON.parse(t) as T; } catch {}
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)) as T; } catch {} }
  if (a >= 0) { // truncated answer: drop the unfinished tail, then close open strings / arrays / objects
    const close = (src: string) => {
      let out = src, stack: string[] = [], inStr = false, esc = false;
      for (const ch of out) { if (esc) { esc = false; continue; } if (ch === "\\") { esc = true; continue; } if (ch === '"') inStr = !inStr; else if (!inStr) { if (ch === "{" || ch === "[") stack.push(ch); else if (ch === "}" || ch === "]") stack.pop(); } }
      if (inStr) out += '"';
      out = out.replace(/[,:]\s*$/, "");
      while (stack.length) out += stack.pop() === "{" ? "}" : "]";
      return out;
    };
    let src = t.slice(a);
    for (let i = 0; i < 40 && src.length > 1; i++) {
      try { return JSON.parse(close(src)) as T; } catch {}
      const cut = src.lastIndexOf(",");
      if (cut <= 0) break;
      src = src.slice(0, cut);
    }
  }
  return null;
}

/** Gemini with files (PDF / images) and a JSON answer. Retries once; null on failure — callers fall back.
 *  Failures are logged with the reason so they can be diagnosed from the server log. */
export async function geminiJSON<T = any>(system: string, parts: AiPart[], opts: { maxTokens?: number; timeoutMs?: number; temperature?: number; label?: string } = {}): Promise<T | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) { console.error(`Gemini ${opts.label || "json"}: GEMINI_API_KEY is not set`); return null; }
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts }],
          generationConfig: { temperature: opts.temperature ?? 0.2, maxOutputTokens: opts.maxTokens ?? 8192, responseMimeType: "application/json" },
        }),
        signal: AbortSignal.timeout(opts.timeoutMs ?? 90_000),
      });
      if (!res.ok) {
        const body = (await res.text().catch(() => "")).slice(0, 300);
        console.error(`Gemini ${opts.label || "json"} attempt ${attempt}: HTTP ${res.status} ${body}`);
        if (res.status === 400 || res.status === 403 || res.status === 404) return null; // won't fix itself
        continue;
      }
      const data = await res.json();
      const cand = data?.candidates?.[0];
      const text = (cand?.content?.parts || []).map((p: any) => p.text || "").join("");
      const parsed = text ? parseLooseJSON<T>(text) : null;
      if (parsed) return parsed;
      console.error(`Gemini ${opts.label || "json"} attempt ${attempt}: unreadable answer (finish=${cand?.finishReason || data?.promptFeedback?.blockReason || "?"}, ${text.length} chars)`);
    } catch (e: any) {
      console.error(`Gemini ${opts.label || "json"} attempt ${attempt}:`, e?.name === "TimeoutError" ? "timed out" : e?.message);
    }
  }
  return null;
}
