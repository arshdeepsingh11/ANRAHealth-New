// Next.js Route Handler — /api/chat, powers the ALBA widget.
// Context-aware (pageContext) and now logs every conversation + message
// to the database. A conversationId is created on the first message and
// reused for the rest of that chat session.
// Set GEMINI_API_KEY in your server's environment (.env.local for local dev,
// your process manager / Docker env for production). Never expose it client-side.

import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSessionId } from "@backend/session";
import { startAlbaConversation, logAlbaMessage } from "@backend/logging";
import { detectEmergencyKeywords, detectCrisisKeywords, EMERGENCY_MESSAGE, CRISIS_MESSAGE } from "@/lib/emergencyDetection";
import { knowledgeFor, localAnswer, ALBA_RULES } from "@backend/albaKnowledge";

function pageContextLabel(pathname: string | undefined): string {
  if (!pathname) return "the ANRA Health website";
  if (pathname === "/") return "the ANRA Health homepage";
  if (pathname.startsWith("/specialties/cardiology")) return "the Cardiology specialty page";
  if (pathname.startsWith("/specialties/respiratory-medicine")) return "the Respiratory Medicine specialty page (partner: Advanced Respiratory Care Network — sleep, oxygen, respiratory diagnostics)";
  if (pathname.startsWith("/specialties/skin-health")) return "the Skin Health specialty page (partner: Nea Precision Skin)";
  const spec = pathname.match(/^\/specialties\/([a-z-]+)/);
  if (spec) return `the ${spec[1].replace(/-/g, " ")} specialty page`;
  if (pathname.startsWith("/specialties")) return "the Medical Specialties overview page";
  if (pathname.startsWith("/my-health")) return "My Health Space, the patient portal";
  if (pathname.startsWith("/genomics")) return "the Genomics page (BioAro Labs testing)";
  if (pathname.startsWith("/referral-centre")) return "the Referral Centre page";
  if (pathname.startsWith("/longevity-lab")) return "the ANRA Longevity Lab (research explainers: intervention responsiveness, GDF-15 + telomeres, pace of aging, pharmacogenomics, longevity genetics)";
  if (pathname.startsWith("/longevity")) return "the Longevity & Health Risk Assessment page";
  if (pathname.startsWith("/lab-results")) return "the Lab Result Explainer page";
  if (pathname.startsWith("/resources")) return "the Patient Resources page";
  if (pathname.startsWith("/contact")) return "the Contact page";
  return "the ANRA Health website";
}

const MODEL = () => process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

/** A plain-text streamed reply (same format the widget already reads). */
function textResponse(text: string, conversationId?: string) {
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Conversation-Id": conversationId || "", "X-Alba-Source": "local" } });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { message, history = [], pageContext, conversationId: incomingConversationId } = body || {};
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }
  const text = message.slice(0, 2000);
  const page = typeof pageContext === "string" ? pageContext : "/";

  // Logging runs alongside the AI call — it never delays or blocks ALBA.
  const logP: Promise<string | undefined> = (async () => {
    try {
      const sessionId = await getOrCreateSessionId();
      const id = incomingConversationId || (await startAlbaConversation({ sessionId, pageContext }));
      await logAlbaMessage({ conversationId: id, role: "user", text });
      return id;
    } catch (logErr) {
      console.error("Failed to log ALBA user message:", logErr);
      return incomingConversationId;
    }
  })();
  const conversationIdSoon = () => Promise.race([logP, new Promise<string | undefined>((r) => setTimeout(() => r(incomingConversationId), 400))]);
  const logReply = (reply: string) => logP.then((id) => id && logAlbaMessage({ conversationId: id, role: "assistant", text: reply })).catch((e) => console.error("Failed to log ALBA reply:", e));

  // Emergency/crisis safety net — checked BEFORE the AI, never overridden by it.
  if (detectCrisisKeywords(text) || detectEmergencyKeywords(text)) {
    const reply = detectCrisisKeywords(text) ? CRISIS_MESSAGE : EMERGENCY_MESSAGE;
    logReply(reply);
    return NextResponse.json({ reply, conversationId: await conversationIdSoon(), emergency: true });
  }

  const { text: knowledge } = knowledgeFor(text + " " + history.slice(-2).map((h: any) => h?.text || "").join(" "), page);
  const fallback = () => {
    const a = localAnswer(text, page);
    logReply(a.text);
    return a.text;
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return textResponse(fallback(), await conversationIdSoon());

  try {
    const contents = [
      ...history.slice(-6).map((h: any) => ({ role: h.role === "user" ? "user" : "model", parts: [{ text: String(h.text || "").slice(0, 1500) }] })),
      { role: "user", parts: [{ text }] },
    ];
    const ctrl = new AbortController();
    const firstByte = setTimeout(() => ctrl.abort(), 10_000); // no answer in 10 s → local answer
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL()}:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          system_instruction: { parts: [{ text: `${ALBA_RULES}\n\nThe person is on ${pageContextLabel(page)}.\n\n${knowledge}` }] },
          contents,
          generationConfig: { temperature: 0.3, maxOutputTokens: 420 },
        }),
      }
    ).finally(() => clearTimeout(firstByte));

    if (!geminiResponse.ok || !geminiResponse.body) {
      console.error("Gemini API error:", geminiResponse.status, await geminiResponse.text().catch(() => ""));
      return textResponse(fallback(), await conversationIdSoon());
    }

    // Proxy Gemini's SSE stream to the client as plain text.
    const conversationId = await conversationIdSoon();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = geminiResponse.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "", fullReply = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              try {
                const parts = JSON.parse(trimmed.slice(5).trim())?.candidates?.[0]?.content?.parts || [];
                const piece = parts.map((p: any) => (p.thought ? "" : p.text || "")).join("");
                if (piece) { fullReply += piece; controller.enqueue(encoder.encode(piece)); }
              } catch { /* partial SSE fragment */ }
            }
          }
        } catch (streamErr) {
          console.error("Gemini stream read error:", streamErr);
        }
        if (!fullReply.trim()) {
          const f = localAnswer(text, page).text;
          controller.enqueue(encoder.encode(f));
          fullReply = f;
        }
        logReply(fullReply);
        controller.close();
      },
    });
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Conversation-Id": conversationId || "", "X-Alba-Source": "ai" } });
  } catch (err) {
    console.error("Chat handler error:", err);
    return textResponse(fallback(), await conversationIdSoon());
  }
}
