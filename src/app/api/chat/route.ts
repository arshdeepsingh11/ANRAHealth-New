// Next.js Route Handler — /api/chat, powers the ALBA widget.
// Context-aware (pageContext) and now logs every conversation + message
// to the database. A conversationId is created on the first message and
// reused for the rest of that chat session.
// Set GEMINI_API_KEY in your server's environment (.env.local for local dev,
// your process manager / Docker env for production). Never expose it client-side.

import { NextRequest, NextResponse } from "next/server";
import { brand, locations, services, faqs, cardiacSymptoms, languages } from "@/data/content";
import { physicians } from "@/data/physicians";
import { getOrCreateSessionId } from "@backend/session";
import { startAlbaConversation, logAlbaMessage } from "@backend/logging";
import { detectEmergencyKeywords, detectCrisisKeywords, EMERGENCY_MESSAGE, CRISIS_MESSAGE } from "@/lib/emergencyDetection";

function buildKnowledgeBase() {
  const servicesText = services.map((s) => `- ${s.name}: ${s.long}`).join("\n");
  const locationsText = locations
    .map((l) => `- ${l.name} (${l.tag}): ${l.address}, Phone: ${l.phone}`)
    .join("\n");
  const physiciansText = physicians
    .map((p) => `- ${p.name}, ${p.title}, disciplines: ${p.disciplines.join(", ")}, at ${p.location} clinic. Languages: ${p.languages.join(", ")}.`)
    .join("\n");
  const faqsText = faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");
  const symptomsText = cardiacSymptoms.map((s) => `- ${s.name}: ${s.desc}`).join("\n");

  return `
CLINIC: ${brand.name}
HOURS: ${brand.hours}
PHONE: ${brand.phone}
EMAIL: ${brand.email}
LANGUAGES SPOKEN: ${languages.join(", ")}

LOCATIONS:
${locationsText}

SERVICES:
${servicesText}

PHYSICIANS:
${physiciansText}

CARDIAC SYMPTOMS INFO:
${symptomsText}

FAQS:
${faqsText}
`.trim();
}

function pageContextLabel(pathname: string | undefined): string {
  if (!pathname) return "the ANRA Health website";
  if (pathname === "/") return "the ANRA Health homepage";
  if (pathname.startsWith("/specialties/cardiology")) return "the Cardiology specialty page";
  if (pathname.startsWith("/specialties/respiratory-medicine")) return "the Respiratory Medicine specialty page (partner: Advanced Respiratory Care Network — sleep, oxygen, respiratory diagnostics)";
  if (pathname.startsWith("/specialties/skin-health")) return "the Skin Health specialty page (partner: Nea Precision Skin)";
  if (pathname.startsWith("/specialties")) return "the Medical Specialties overview page";
  if (pathname.startsWith("/referral-centre")) return "the Referral Centre page";
  if (pathname.startsWith("/longevity")) return "the Longevity & Health Risk Assessment page";
  if (pathname.startsWith("/lab-results")) return "the Lab Result Explainer page";
  if (pathname.startsWith("/resources")) return "the Patient Resources page";
  if (pathname.startsWith("/contact")) return "the Contact page";
  return "the ANRA Health website";
}

function buildSystemPrompt(pathname: string | undefined) {
  const context = pageContextLabel(pathname);

  return `You are the website assistant for ${brand.name}, a cardiology and internal medicine clinic in Calgary, Alberta.

CURRENT PAGE CONTEXT: The person is currently viewing ${context}. When natural, lean your answers toward what's most relevant to this section of the site — but still answer any question they actually ask, even if it's about a different part of the clinic.

STRICT RULES — follow these exactly:
1. Only answer questions about ${brand.name}: its services, physicians, locations, hours, appointments, cardiac symptoms, and FAQs, using ONLY the information provided below.
2. If asked anything unrelated to ${brand.name}, politely decline and redirect: say you can only help with questions about ${brand.name}, and ask if there's something about our services, physicians, or appointments you can help with.
3. Never invent facts, prices, wait times, physicians, or services not contained in the information below.
4. Do not give medical diagnoses or treatment advice — for symptom concerns, encourage the person to book a consultation with our team.
5. Respond in plain conversational text only — no markdown, no JSON, no special formatting. Keep replies concise and friendly.

CLINIC INFORMATION:
${buildKnowledgeBase()}`;
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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  // Set up (or reuse) the conversation record. Never let a logging failure
  // block the actual chat — ALBA must keep working even if the DB is down.
  let conversationId: string | undefined = incomingConversationId;
  try {
    const sessionId = await getOrCreateSessionId();
    if (!conversationId) {
      conversationId = await startAlbaConversation({ sessionId, pageContext });
    }
    await logAlbaMessage({ conversationId, role: "user", text: message });
  } catch (logErr) {
    console.error("Failed to log ALBA user message:", logErr);
  }

  // Emergency/crisis safety net — checked BEFORE calling the AI model at all.
  // Never let the model's own judgment override a detected emergency or
  // crisis pattern. This mirrors the same check used by the Symptom Checker.
  // Crisis (self-harm/suicidal ideation) is checked first since it needs a
  // gentler, support-resource-focused message rather than "call 911 / go to the ER."
  if (detectCrisisKeywords(message)) {
    try {
      if (conversationId) await logAlbaMessage({ conversationId, role: "assistant", text: CRISIS_MESSAGE });
    } catch (logErr) {
      console.error("Failed to log ALBA crisis response:", logErr);
    }
    return NextResponse.json({ reply: CRISIS_MESSAGE, conversationId, emergency: true });
  }
  if (detectEmergencyKeywords(message)) {
    try {
      if (conversationId) await logAlbaMessage({ conversationId, role: "assistant", text: EMERGENCY_MESSAGE });
    } catch (logErr) {
      console.error("Failed to log ALBA emergency response:", logErr);
    }
    return NextResponse.json({ reply: EMERGENCY_MESSAGE, conversationId, emergency: true });
  }

  try {
    const contents = [
      ...history.slice(-6).map((h: any) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: buildSystemPrompt(pageContext) }] },
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!geminiResponse.ok || !geminiResponse.body) {
      const errText = await geminiResponse.text().catch(() => "");
      console.error("Gemini API error:", errText);
      return NextResponse.json({ error: "Upstream AI error" }, { status: 502 });
    }

    // Proxy Gemini's SSE stream through to the client as plain text: parse
    // each "data: {...}" line, pull out the text delta, and enqueue just
    // that text. We also accumulate the full reply so it can be logged once
    // the stream finishes, and fall back to a friendly message if nothing
    // came through at all.
    const finalConversationId = conversationId;
    const stream = new ReadableStream({
      async start(controller) {
        const reader = geminiResponse.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";
        let fullReply = "";

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
              const jsonStr = trimmed.slice(5).trim();
              if (!jsonStr) continue;
              try {
                const chunk = JSON.parse(jsonStr);
                const text = chunk?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (typeof text === "string" && text) {
                  fullReply += text;
                  controller.enqueue(encoder.encode(text));
                }
              } catch {
                // Ignore malformed/partial SSE fragments — next chunk will complete it.
              }
            }
          }
        } catch (streamErr) {
          console.error("Gemini stream read error:", streamErr);
        }

        if (!fullReply.trim()) {
          const fallback = `Sorry, I couldn't generate a response. Please try again or call us at ${brand.phone}.`;
          controller.enqueue(encoder.encode(fallback));
          fullReply = fallback;
        }

        try {
          if (finalConversationId) {
            await logAlbaMessage({ conversationId: finalConversationId, role: "assistant", text: fullReply });
          }
        } catch (logErr) {
          console.error("Failed to log ALBA assistant message:", logErr);
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Conversation-Id": conversationId || "",
      },
    });
  } catch (err) {
    console.error("Chat handler error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}