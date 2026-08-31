import { NextRequest, NextResponse } from "next/server";
import { brand } from "@/data/content";
import { getOrCreateSessionId } from "@backend/session";
import { logLabResultCheck } from "@backend/logging";

const SYSTEM_PROMPT = `You are a non-diagnostic lab result explainer for ${brand.name}, a clinic in Calgary, Alberta.

You are given either typed/pasted lab values, or a photo of a printed lab report. Your job is to explain, in plain language, what each identifiable test measures and whether the value looks like it falls inside or outside a typical general reference range — purely for educational purposes.

STRICT RULES:
1. NEVER diagnose a condition. NEVER say a result "means" the person has a specific disease. Only describe what the test generally measures and whether the number looks in-range or out-of-range compared to a typical general reference range.
2. Reference ranges vary by lab, sex, age, and method — always caveat that the official range on the actual lab report is the one that matters, not a generic one.
3. You must respond with ONLY valid JSON, no markdown, no extra text, matching exactly this shape:
{
  "overallSummary": "two to three calm, plain-language sentences summarizing what was found overall",
  "results": [
    {
      "testName": "name of the test as identified, e.g. 'LDL Cholesterol'",
      "value": "the value as given, with units if available, or empty string if unclear",
      "flag": "in-range" | "outside-range" | "unclear",
      "explanation": "one to two plain-language sentences on what this test measures and, if outside range, why that might be worth discussing"
    }
  ],
  "disclaimer": "a short reminder that this is educational only and the ordering doctor's interpretation is what matters"
}
4. If the input is unreadable, empty, or not actually lab results, return an empty "results" array and explain that in "overallSummary".
5. Never suggest medications, dosages, or specific treatments. Never state a diagnosis, prognosis, or urgency level. Always end with encouragement to discuss results with their doctor.
6. Keep language calm and supportive — no alarming phrasing, even for values that appear notably outside range.`;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { description, imageBase64, mimeType } = body || {};
  const hasText = typeof description === "string" && description.trim().length > 0;
  const hasImage = typeof imageBase64 === "string" && imageBase64.trim().length > 0;

  if (!hasText && !hasImage) {
    return NextResponse.json({ error: "Missing description or imageBase64" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  try {
    const parts: any[] = [];
    if (hasImage) {
      parts.push({ inline_data: { mime_type: mimeType || "image/jpeg", data: imageBase64 } });
      parts.push({ text: "Explain the lab results shown in this photo." });
    } else {
      parts.push({ text: description });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts }],
          generationConfig: { temperature: 0.25, maxOutputTokens: 900, responseMimeType: "application/json" },
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

    const results = Array.isArray(parsed.results)
      ? parsed.results
          .filter((r: any) => r && typeof r.testName === "string")
          .slice(0, 20)
          .map((r: any) => ({
            testName: r.testName.trim(),
            value: typeof r.value === "string" ? r.value.trim() : "",
            flag: ["in-range", "outside-range", "unclear"].includes(r.flag) ? r.flag : "unclear",
            explanation: typeof r.explanation === "string" ? r.explanation.trim() : "",
          }))
      : [];

    const result = {
      overallSummary: typeof parsed.overallSummary === "string" && parsed.overallSummary.trim()
        ? parsed.overallSummary.trim()
        : "We couldn't identify clear lab results from what was provided. Try pasting the values as text, or a clearer photo.",
      results,
      disclaimer: typeof parsed.disclaimer === "string" && parsed.disclaimer.trim()
        ? parsed.disclaimer.trim()
        : "This is general educational information, not a diagnosis. Please discuss your results with your doctor for interpretation specific to you.",
    };

    // Log this check to the database — failures here never block the response.
    try {
      const sessionId = await getOrCreateSessionId();
      await logLabResultCheck({
        inputType: hasImage ? "image" : "text",
        overallSummary: result.overallSummary,
        results: result.results,
        sessionId,
      });
    } catch (logErr) {
      console.error("Failed to log lab result check:", logErr);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Lab explainer handler error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}