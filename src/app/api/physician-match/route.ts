import { NextRequest, NextResponse } from "next/server";

const CONCERN_LABELS = [
  "General Cardiology",
  "Arrhythmia / Heart Rhythm",
  "Stress Testing / Chest Pain",
  "General Internal Medicine",
  "Endocrinology / Diabetes / Thyroid",
  "Rheumatology",
  "Pediatrics",
];

const SYSTEM_PROMPT = `You classify a patient's free-text description of their health concern into exactly one category from this fixed list, for ANRA Health's physician matcher:
${JSON.stringify(CONCERN_LABELS)}

Return ONLY valid JSON, no markdown, matching exactly:
{
  "concernLabel": "one of the exact labels above, or empty string if genuinely unclear or unrelated to health",
  "location": "North East" | "Meadow Miles" | "",
  "language": "string (a language name if explicitly mentioned, otherwise empty string)"
}

Rules:
- Only set "location" or "language" if the person explicitly mentioned a preference — never guess.
- Chest pain, palpitations, dizziness, shortness of breath on exertion → usually "Stress Testing / Chest Pain" or "Arrhythmia / Heart Rhythm" depending on which fits better.
- General fatigue, multiple vague symptoms, or anything not clearly cardiac → "General Internal Medicine".
- Diabetes, thyroid, weight, hormone-related → "Endocrinology / Diabetes / Thyroid".
- Joint pain, swelling, autoimmune-sounding symptoms → "Rheumatology".
- Anything about a child or teenager → "Pediatrics".
- If the text is empty, nonsensical, or entirely unrelated to a health concern, return an empty "concernLabel".`;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { description } = body || {};
  if (!description || typeof description !== "string" || description.trim().length < 5) {
    return NextResponse.json({ error: "Missing description" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: description }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 150, responseMimeType: "application/json" },
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
    const parsed = JSON.parse(raw);

    return NextResponse.json({
      concernLabel: CONCERN_LABELS.includes(parsed.concernLabel) ? parsed.concernLabel : "",
      location: ["North East", "Meadow Miles"].includes(parsed.location) ? parsed.location : "",
      language: typeof parsed.language === "string" ? parsed.language : "",
    });
  } catch (err) {
    console.error("Physician match handler error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}