import { NextRequest, NextResponse } from "next/server";
import { brand } from "@/data/content";

const SYSTEM_PROMPT = `You are a plain-language medical term explainer for ${brand.name}, a clinic in Calgary, Alberta.

You are given a diagnosis name, medical term, or a snippet of doctor's notes that a patient found confusing — either typed as text, or shown in a photo of a document. Your job is to explain what it generally means in plain, everyday language — purely educational, based on general medical knowledge.

STRICT RULES:
1. NEVER confirm, deny, or comment on whether this diagnosis applies correctly to the specific patient — you have no way to know that. You are only explaining what the term/diagnosis generally means.
2. NEVER suggest medications, dosages, or specific treatment plans.
3. You must respond with ONLY valid JSON, no markdown, no extra text, matching exactly this shape:
{
  "plainExplanation": "two to three plain-language sentences explaining what this generally means",
  "commonAspects": ["short bullet on what this typically involves day-to-day", "short bullet"],
  "commonQuestions": ["a common question patients ask about this, phrased as a question", "another common question"]
}
4. If the input is unclear, unreadable, not a real medical term, or too vague to explain, say so honestly in "plainExplanation" and leave the other arrays empty.
5. Keep tone calm, warm, and reassuring — never alarming, never definitive about the patient's personal situation.
6. Always write as if this is general information about the term, never as if you are reviewing this specific patient's case.`;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { text, imageBase64, mimeType } = body || {};
  const hasText = typeof text === "string" && text.trim().length >= 2;
  const hasImage = typeof imageBase64 === "string" && imageBase64.trim().length > 0;

  if (!hasText && !hasImage) {
    return NextResponse.json({ error: "Missing text or imageBase64" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  try {
    const parts: any[] = [];
    if (hasImage) {
      parts.push({ inline_data: { mime_type: mimeType || "image/jpeg", data: imageBase64 } });
      parts.push({ text: "Explain the diagnosis or medical term shown in this photo." });
    } else {
      parts.push({ text });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 500, responseMimeType: "application/json" },
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
      plainExplanation: typeof parsed.plainExplanation === "string" && parsed.plainExplanation.trim()
        ? parsed.plainExplanation.trim()
        : "We couldn't generate a clear explanation for that. Try rephrasing, or ask your doctor directly.",
      commonAspects: Array.isArray(parsed.commonAspects) ? parsed.commonAspects.slice(0, 6) : [],
      commonQuestions: Array.isArray(parsed.commonQuestions) ? parsed.commonQuestions.slice(0, 5) : [],
    });
  } catch (err) {
    console.error("Explain diagnosis handler error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}