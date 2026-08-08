// Next.js Route Handler — replaces /api/symptom-check.js.
// Companion to /api/chat. Handles free-text symptom descriptions and returns
// a structured, non-diagnostic triage suggestion. Set GEMINI_API_KEY in your
// server environment (same key /api/chat uses).

import { NextRequest, NextResponse } from "next/server";
import { brand } from "@/data/content";

const VALID_DISCIPLINES = [
  "Cardiology",
  "Internal Medicine",
  "Endocrinology",
  "Rheumatology",
  "Pediatrics",
];

const SYSTEM_PROMPT = `You are a non-diagnostic triage assistant for ${brand.name}, a cardiology and internal medicine clinic in Calgary, Alberta.

STRICT RULES:
1. You NEVER diagnose. You only suggest which type of specialist a patient's described symptoms are most relevant to, and how soon they should book.
2. You must respond with ONLY valid JSON, no markdown, no extra text, matching exactly this shape:
{
  "emergency": boolean,
  "urgency": "routine" | "soon" | "urgent" | "emergency",
  "recommendedDiscipline": one of ${JSON.stringify(VALID_DISCIPLINES)},
  "summary": "one or two short sentences, plain language, no diagnosis, no medication advice"
}
3. If the description includes any signs that could indicate a medical emergency (e.g. crushing or severe chest pain, difficulty breathing, fainting or loss of consciousness, sudden severe weakness or numbness, slurred speech, severe uncontrolled bleeding), set "emergency": true and "urgency": "emergency". Your summary in that case must tell the person to call 911 or go to the nearest emergency room immediately, and nothing else.
4. Never invent symptoms the person didn't describe. If the description is vague or unrelated to health, set "recommendedDiscipline" to "Internal Medicine", "urgency" to "routine", and say a general consultation would help clarify next steps.
5. Keep the summary supportive and calm, never alarming beyond what's warranted.`;

// Server-side keyword backstop — mirrors the client-side check. Belt-and-suspenders:
// if either the client OR this catches a red flag, the response is forced to emergency.
const EMERGENCY_PATTERNS = [
  /crushing.{0,15}(chest|pain)/i,
  /can'?t breathe/i,
  /difficulty breathing/i,
  /shortness of breath.{0,20}(severe|sudden|can'?t)/i,
  /fainted|passed out|loss of consciousness/i,
  /slurred speech/i,
  /one[- ]?sided weakness|sudden weakness|sudden numbness/i,
  /severe bleeding/i,
  /chest pain.{0,20}(radiating|arm|jaw)/i,
];

function detectEmergencyKeywords(text: string) {
  return EMERGENCY_PATTERNS.some((re) => re.test(text));
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { description } = body || {};
  if (!description || typeof description !== "string" || description.trim().length < 3) {
    return NextResponse.json({ error: "Missing description" }, { status: 400 });
  }

  // Server-side safety backstop, independent of the model's own judgment.
  const keywordEmergency = detectEmergencyKeywords(description);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  try {
    // Model updated from deprecated gemini-2.0-flash to gemini-2.5-flash-lite.
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: description }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 300,
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
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }

    const result = {
      emergency: Boolean(parsed.emergency) || keywordEmergency,
      urgency: keywordEmergency ? "emergency" : (["routine", "soon", "urgent", "emergency"].includes(parsed.urgency) ? parsed.urgency : "routine"),
      recommendedDiscipline: VALID_DISCIPLINES.includes(parsed.recommendedDiscipline)
        ? parsed.recommendedDiscipline
        : "Internal Medicine",
      summary: keywordEmergency
        ? "This may describe a medical emergency. Please call 911 or go to the nearest emergency room immediately."
        : (typeof parsed.summary === "string" && parsed.summary.trim()
            ? parsed.summary.trim()
            : "Based on what you shared, we'd recommend booking a consultation so our team can take a closer look."),
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("Symptom check handler error:", err);
    // Fail safe: if the AI call breaks but keywords indicate emergency, still return that.
    if (keywordEmergency) {
      return NextResponse.json({
        emergency: true,
        urgency: "emergency",
        recommendedDiscipline: "Cardiology",
        summary: "This may describe a medical emergency. Please call 911 or go to the nearest emergency room immediately.",
      });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
