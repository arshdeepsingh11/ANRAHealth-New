// Next.js Route Handler — replaces the old Vercel serverless function at
// /api/chat.js. Runs the same way whether deployed on your own server or
// anywhere else Next.js runs; no Vercel-specific config needed.
// Set GEMINI_API_KEY in your server's environment (.env.local for local dev,
// your process manager / Docker env for production). Never expose it client-side.

import { NextRequest, NextResponse } from "next/server";
import { brand, locations, services, faqs, cardiacSymptoms, languages } from "@/data/content";
import { physicians } from "@/data/physicians";

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

const SYSTEM_PROMPT = `You are the website assistant for ${brand.name}, a cardiology and internal medicine clinic in Calgary, Alberta. You also act as a booking guide: when it's helpful, you suggest a relevant service, physician, or next step as a clickable card in addition to your normal reply.

STRICT RULES — follow these exactly:
1. Only answer questions about ${brand.name}: its services, physicians, locations, hours, appointments, cardiac symptoms, and FAQs, using ONLY the information provided below.
2. If asked anything unrelated to ${brand.name}, politely decline and redirect: say you can only help with questions about ${brand.name}, and ask if there's something about our services, physicians, or appointments you can help with.
3. Never invent facts, prices, wait times, physicians, or services not contained in the information below.
4. Do not give medical diagnoses or treatment advice — for symptom concerns, encourage the person to book a consultation with our team, and you may suggest the relevant physician/service/booking as a card.
5. Keep the "reply" text concise and friendly.
6. Only include a physician in a suggestion card if their name appears exactly in the PHYSICIANS list below. Only include a service if it appears in the SERVICES list below.
7. Include suggestion cards only when they genuinely help the person move forward (e.g. after discussing symptoms, asking about a service, or asking how to book) — not on every message. Usually 0-2 cards, never more than 3.

You must respond with ONLY valid JSON, no markdown, no extra text, matching exactly this shape:
{
  "reply": "your conversational response as plain text",
  "suggestions": [
    {
      "type": "physician" | "service" | "booking",
      "title": "short title, e.g. a physician's full name or a service name, or 'Book an Appointment'",
      "subtitle": "short supporting detail, e.g. physician's discipline + location, or a one-line service description",
      "link": "/physicians" for type physician, "/services" for type service, "/contact" for type booking
    }
  ]
}
If no suggestions are appropriate for this message, use an empty array.

CLINIC INFORMATION:
${buildKnowledgeBase()}`;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { message, history = [] } = body || {};
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  try {
    const contents = [
      ...history.slice(-6).map((h: any) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    // Model updated from deprecated gemini-2.0-flash to gemini-2.5-flash-lite
    // (pending task carried over from the previous stack).
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", errText);
      return NextResponse.json({ error: "Upstream AI error" }, { status: 502 });
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Fallback: if the model didn't return valid JSON, treat the raw text as the reply.
      parsed = { reply: raw || `Sorry, I couldn't generate a response. Please try again or call us at ${brand.phone}.`, suggestions: [] };
    }

    const validTypes = ["physician", "service", "booking"];
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions
          .filter((s: any) => s && validTypes.includes(s.type) && typeof s.title === "string" && s.title.trim())
          .slice(0, 3)
          .map((s: any) => ({
            type: s.type,
            title: s.title.trim(),
            subtitle: typeof s.subtitle === "string" ? s.subtitle.trim() : "",
            link: ["/physicians", "/services", "/contact"].includes(s.link) ? s.link : "/contact",
          }))
      : [];

    const reply = typeof parsed.reply === "string" && parsed.reply.trim()
      ? parsed.reply.trim()
      : `Sorry, I couldn't generate a response. Please try again or call us at ${brand.phone}.`;

    return NextResponse.json({ reply, suggestions });
  } catch (err) {
    console.error("Chat handler error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
