import { NextRequest, NextResponse } from "next/server";
import { brand } from "@/data/content";

const SYSTEM_PROMPT = `You write short, friendly "what to expect at your appointment" guides for patients of ${brand.name}, a clinic in Calgary, Alberta.

You are given the specialty/specialties requested, any diagnostic exams selected, the urgency level, and optional clinical notes from a referral. Write a brief, practical guide to help the patient feel prepared — logistics and general expectations only, never medical advice or diagnosis.

STRICT RULES:
1. This is purely informational/logistical — never interpret symptoms, never suggest a diagnosis, never comment on the clinical notes' medical meaning.
2. You must respond with ONLY valid JSON, no markdown, no extra text, matching exactly this shape:
{
  "whatToBring": ["short item", "short item"],
  "whatToExpect": "two to three plain-language sentences describing generally what happens during a visit for the requested specialty/exams",
  "prepTips": ["short practical tip", "short practical tip"],
  "estimatedDuration": "a general estimate, e.g. '30–60 minutes', or empty string if it varies too much to estimate"
}
3. "whatToBring" should always include Alberta Health Card and photo ID at minimum, plus anything specific to the exams selected (e.g. comfortable clothing for a stress test).
4. "prepTips" should reflect the specific exams selected where relevant (e.g. avoiding caffeine before a stress test) — general and safe, not medical instructions requiring a doctor's individualized guidance.
5. Keep tone warm and reassuring, never clinical or alarming.
6. If no specific exams were selected, keep "whatToExpect" and "prepTips" general to a first specialist consultation.`;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { specialties = [], exams = [], urgency = "", clinicalNotes = "" } = body || {};

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  try {
    const inputText = `Specialties requested: ${Array.isArray(specialties) && specialties.length ? specialties.join(", ") : "General consultation"}
Diagnostic exams selected: ${Array.isArray(exams) && exams.length ? exams.join(", ") : "None specified"}
Urgency: ${urgency || "Not specified"}
Clinical notes (for context only, do not interpret): ${clinicalNotes || "None provided"}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: inputText }] }],
          generationConfig: { temperature: 0.35, maxOutputTokens: 500, responseMimeType: "application/json" },
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
      whatToBring: Array.isArray(parsed.whatToBring) && parsed.whatToBring.length
        ? parsed.whatToBring.slice(0, 6)
        : ["Alberta Health Card", "Photo ID", "List of current medications"],
      whatToExpect: typeof parsed.whatToExpect === "string" && parsed.whatToExpect.trim()
        ? parsed.whatToExpect.trim()
        : "You'll check in at reception, a member of our team will take your vitals, and then you'll meet with the physician to discuss your care.",
      prepTips: Array.isArray(parsed.prepTips) ? parsed.prepTips.slice(0, 6) : [],
      estimatedDuration: typeof parsed.estimatedDuration === "string" ? parsed.estimatedDuration.trim() : "",
    });
  } catch (err) {
    console.error("Visit prep handler error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}