import { NextRequest, NextResponse } from "next/server";
import { brand } from "@/data/content";

const SYSTEM_PROMPT = `You are a plain-language medical term explainer for ${brand.name}, a clinic in Calgary, Alberta.

You are given a diagnosis name, medical term, doctor's note, or a full health report/document — either as text, or as a photo/PDF. Your job is to find the actual diagnoses, conditions, or medical terms mentioned, and explain THOSE in plain language.

CRITICAL RULE — DO NOT describe the document itself. Never say things like "this document is a summary of..." or "this report contains...". The person already knows what kind of document it is — they want to know what the actual medical terms inside it MEAN. Go straight to explaining the real diagnoses/conditions/terms you find.

STRICT RULES:
1. NEVER confirm, deny, or comment on whether a diagnosis correctly applies to this specific patient — you have no way to know that. You are only explaining what each term generally means.
2. NEVER suggest medications, dosages, or specific treatment plans.
3. If the input is a longer document or report, identify the 1-4 most significant diagnoses, conditions, or medical terms actually present, and explain each one individually. Ignore administrative details (names, dates, clinic info) — focus only on medical content.
4. You must respond with ONLY valid JSON, no markdown, no extra text, matching exactly this shape:
{
  "plainExplanation": "one or two sentences giving an overall plain-language summary of the main finding(s)",
  "keyFindings": [
    { "term": "the specific diagnosis/condition/term found", "explanation": "two to three plain-language sentences on what this term generally means" }
  ],
  "commonQuestions": ["a common question patients ask about this, phrased as a question", "another common question"]
}
5. If truly nothing identifiable as a medical term/diagnosis is found, say so honestly in "plainExplanation" and leave "keyFindings" and "commonQuestions" empty.
6. Keep tone calm, warm, and reassuring — never alarming, never definitive about the patient's personal situation.
7. Always write as general information about each term, never as if you are personally reviewing or confirming this patient's case.`;

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
      parts.push({ text: "Find the actual diagnoses, conditions, or medical terms in this document/photo and explain each one in plain language. Do not describe the document itself." });
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
          generationConfig: { temperature: 0.3, maxOutputTokens: 800, responseMimeType: "application/json" },
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

    const keyFindings = Array.isArray(parsed.keyFindings)
      ? parsed.keyFindings
          .filter((f: any) => f && typeof f.term === "string" && typeof f.explanation === "string")
          .slice(0, 4)
          .map((f: any) => ({ term: f.term.trim(), explanation: f.explanation.trim() }))
      : [];

    return NextResponse.json({
      plainExplanation: typeof parsed.plainExplanation === "string" && parsed.plainExplanation.trim()
        ? parsed.plainExplanation.trim()
        : "We couldn't identify a clear medical term to explain. Try pasting just the diagnosis name, or a clearer photo.",
      keyFindings,
      commonQuestions: Array.isArray(parsed.commonQuestions) ? parsed.commonQuestions.slice(0, 5) : [],
    });
  } catch (err) {
    console.error("Explain diagnosis handler error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}