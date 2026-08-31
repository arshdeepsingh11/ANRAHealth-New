import { NextRequest, NextResponse } from "next/server";
import { brand } from "@/data/content";
import { getOrCreateSessionId } from "@backend/session";
import { logLongevityAssessment } from "@backend/logging";

const SYSTEM_PROMPT = `You are a non-diagnostic health risk summary assistant for ${brand.name}, a preventive and longevity-focused clinic in Calgary, Alberta.

You are given a short lifestyle and health-background questionnaire a patient filled out. Your job is to give a supportive, plain-language summary of a few areas worth paying attention to — never a diagnosis, never a score presented as clinical fact.

STRICT RULES:
1. NEVER diagnose a condition. NEVER say "you have X" or "you are at high risk of X" as a fact. Always frame things as "worth discussing with a doctor" or "an area to keep an eye on."
2. You must respond with ONLY valid JSON, no markdown, no extra text, matching exactly this shape:
{
  "summary": "two to three supportive, plain-language sentences summarizing the overall picture",
  "focusAreas": [
    { "title": "short area name, e.g. 'Activity Level'", "note": "one supportive sentence explaining why this is worth a look, in plain language" }
  ],
  "suggestedNextStep": "one sentence suggesting a next step, e.g. booking a baseline check-up"
}
3. Include 2 to 4 focus areas — pick the most relevant ones based on what was actually answered, not a fixed list every time.
4. If the answers suggest a genuinely urgent concern is described (this is rare for a lifestyle quiz, but check), do not alarm the person — simply include a focus area gently suggesting they discuss it with a doctor soon.
5. Keep the tone warm, calm, and encouraging — never clinical-sounding, never alarming, never preachy.
6. Never mention medications, dosages, or specific treatments. Never give a numeric "risk score" or percentage — this is not a validated clinical calculator.`;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { answers } = body || {};
  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "Missing answers" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  try {
    const answersText = Object.entries(answers)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
      .join("\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: answersText }] }],
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

    const focusAreas = Array.isArray(parsed.focusAreas)
      ? parsed.focusAreas
          .filter((f: any) => f && typeof f.title === "string" && typeof f.note === "string")
          .slice(0, 4)
          .map((f: any) => ({ title: f.title.trim(), note: f.note.trim() }))
      : [];

    const result = {
      summary: typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : "Thanks for sharing a bit about your health and lifestyle. A baseline check-up is always a good way to get a clearer picture.",
      focusAreas,
      suggestedNextStep: typeof parsed.suggestedNextStep === "string" && parsed.suggestedNextStep.trim()
        ? parsed.suggestedNextStep.trim()
        : "Consider booking a check-up to discuss these with a doctor.",
    };

    // Log this assessment to the database — failures here never block the response.
    try {
      const sessionId = await getOrCreateSessionId();
      await logLongevityAssessment({
        answers,
        summary: result.summary,
        focusAreas: result.focusAreas,
        suggestedNextStep: result.suggestedNextStep,
        sessionId,
      });
    } catch (logErr) {
      console.error("Failed to log longevity assessment:", logErr);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Longevity risk handler error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}