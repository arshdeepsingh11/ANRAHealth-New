import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You extract structured referral data from a short free-text description written by a referring physician or staff member for ANRA Health.

Return ONLY valid JSON, no markdown, matching exactly:
{
  "patientName": "string or empty",
  "urgency": "ASAP" | "Urgent" | "Semi-Urgent" | "Phone Consult",
  "specialties": ["Cardiology" | "Internal Medicine" | "Endocrinology" | "Geriatric Medicine"],
  "exams": ["exact exam names mentioned, only from standard cardiac diagnostic tests"],
  "clinicalNotes": "a concise 1-2 sentence clinical summary"
}
If a field cannot be determined, use an empty string, empty array, or "Semi-Urgent" as a safe default for urgency. Never invent a patient name that wasn't mentioned.`;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { description } = body || {};
  if (!description || typeof description !== "string") {
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
          generationConfig: { temperature: 0.2, maxOutputTokens: 300, responseMimeType: "application/json" },
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
      patientName: typeof parsed.patientName === "string" ? parsed.patientName : "",
      urgency: ["ASAP", "Urgent", "Semi-Urgent", "Phone Consult"].includes(parsed.urgency) ? parsed.urgency : "Semi-Urgent",
      specialties: Array.isArray(parsed.specialties) ? parsed.specialties : [],
      exams: Array.isArray(parsed.exams) ? parsed.exams : [],
      clinicalNotes: typeof parsed.clinicalNotes === "string" ? parsed.clinicalNotes : "",
    });
  } catch (err) {
    console.error("Referral autofill handler error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}