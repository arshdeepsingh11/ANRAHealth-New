import { NextRequest, NextResponse } from "next/server";
import { brand } from "@/data/content";

const SYSTEM_PROMPT = `You draft a starter nutrition outline for patients of ${brand.name}, a clinic in Calgary, Alberta, in partnership with Nea Precision Nutrition.

You are given a patient's goal, dietary restrictions, relevant health conditions, activity level, and optional notes. Draft a friendly, general starter plan — this is explicitly a DRAFT for a registered dietitian to review and personalize, never a finished prescription or medical nutrition therapy.

STRICT RULES:
1. NEVER diagnose. NEVER give specific calorie targets, macro numbers, or supplement dosing — those require individualized assessment by a dietitian.
2. Always respect stated dietary restrictions exactly (e.g. never suggest dairy if "Dairy-free" was selected).
3. You must respond with ONLY valid JSON, no markdown, no extra text, matching exactly this shape:
{
  "overview": "two to three warm, plain-language sentences framing the general approach for this goal",
  "sampleDay": {
    "breakfast": "one simple example idea, one sentence",
    "lunch": "one simple example idea, one sentence",
    "dinner": "one simple example idea, one sentence",
    "snacks": "one simple example idea, one sentence"
  },
  "generalTips": ["short practical tip", "short practical tip", "short practical tip"],
  "disclaimer": "a short reminder that this is a draft starting point only, and a registered dietitian will personalize it"
}
4. Keep every meal idea genuinely simple and general — not a rigid meal plan, just illustrative examples.
5. If a stated health condition is diet-relevant (e.g. diabetes, high cholesterol, high blood pressure), let the general tips reflect that sensibly (e.g. lower sodium for high blood pressure) without giving clinical nutrition therapy instructions.
6. Tone should be encouraging and non-judgmental, never restrictive-sounding or diet-culture language.`;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { goal, restrictions = [], conditions = [], activity, notes } = body || {};
  if (!goal) {
    return NextResponse.json({ error: "Missing goal" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  try {
    const inputText = `Primary goal: ${goal}
Dietary restrictions: ${Array.isArray(restrictions) && restrictions.length ? restrictions.join(", ") : "None specified"}
Relevant health conditions: ${Array.isArray(conditions) && conditions.length ? conditions.join(", ") : "None specified"}
Activity level: ${activity || "Not specified"}
Additional notes: ${notes || "None provided"}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: inputText }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 500, responseMimeType: "application/json" },
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

    return NextResponse.json({
      overview: typeof parsed.overview === "string" && parsed.overview.trim()
        ? parsed.overview.trim()
        : "Here's a general starting point based on what you shared — our dietitian team will personalize this further.",
      sampleDay: {
        breakfast: parsed.sampleDay?.breakfast || "",
        lunch: parsed.sampleDay?.lunch || "",
        dinner: parsed.sampleDay?.dinner || "",
        snacks: parsed.sampleDay?.snacks || "",
      },
      generalTips: Array.isArray(parsed.generalTips) ? parsed.generalTips.slice(0, 6) : [],
      disclaimer: typeof parsed.disclaimer === "string" && parsed.disclaimer.trim()
        ? parsed.disclaimer.trim()
        : "This is a general starting draft only. A registered dietitian at Nea Precision Nutrition will review and personalize your plan.",
    });
  } catch (err) {
    console.error("Nutrition plan handler error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}