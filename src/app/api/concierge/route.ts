import { NextRequest, NextResponse } from "next/server";
import { brand } from "@/data/content";
import { detectEmergencyKeywords, detectCrisisKeywords, EMERGENCY_MESSAGE, CRISIS_MESSAGE } from "@/lib/emergencyDetection";

// Every real destination the concierge is allowed to route to — all tools
// that already exist on the site. Never invent a destination outside this list.
const DESTINATIONS = [
  { key: "cardiology", href: "/specialties/cardiology", label: "Cardiology — Symptom Checker & Physicians", desc: "Chest pain, palpitations, blood pressure, heart-related concerns, or finding a cardiologist." },
  { key: "respiratory", href: "/specialties/respiratory-medicine", label: "Respiratory Medicine", desc: "Breathing difficulty, sleep apnea, snoring, cough, asthma/COPD concerns." },
  { key: "skin", href: "/specialties/skin-health", label: "Skin Health", desc: "Skin concerns, acne, rosacea, cosmetic treatments." },
  { key: "longevity", href: "/longevity", label: "Longevity — Health Risk Assessment", desc: "General health/lifestyle risk check, wanting to understand overall health and aging." },
  { key: "nutrition", href: "/longevity", label: "Nutrition Starter Plan", desc: "Diet, nutrition goals, weight management, eating habits." },
  { key: "lab-results", href: "/lab-results", label: "Lab Result Explainer", desc: "Understanding lab test results or blood work values." },
  { key: "genomics", href: "/genomics", label: "Genomics — BioAro Labs Testing", desc: "Genetic testing, DNA, microbiome testing, ancestry, hereditary risk." },
  { key: "referral", href: "/referral-centre", label: "Referral Centre", desc: "Starting or submitting a referral, already have a referral from a doctor." },
  { key: "resources", href: "/resources", label: "Patient Resources", desc: "Test preparation info, new patient information, general forms." },
  { key: "contact", href: "/contact", label: "Contact", desc: "General contact, locations, booking an appointment directly, or anything not clearly matching the above." },
];

const SYSTEM_PROMPT = `You are a friendly front-door concierge for ${brand.name}'s website. A visitor describes what's going on or what they're curious about, in their own words. Your job is to point them to the single most relevant existing page/tool on the site.

Available destinations (choose ONLY one of these exact "key" values):
${DESTINATIONS.map((d) => `- ${d.key}: ${d.label} — for: ${d.desc}`).join("\n")}

STRICT RULES:
1. NEVER diagnose or give medical advice. You are purely a router/guide.
2. You must respond with ONLY valid JSON, no markdown, no extra text, matching exactly this shape:
{
  "reply": "one or two short, warm sentences telling them where to go and briefly why",
  "destinationKey": "one of the exact key values above"
}
3. If genuinely nothing matches well, use "contact" as a safe default.
4. Keep the reply conversational and brief — this is a quick router, not a long conversation.
5. Mentioning a test or service by name (e.g. "stress test", "echo", "Holter monitor") is a normal routing request, NOT an emergency — route it normally to the relevant page.`;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { message } = body || {};
  if (!message || typeof message !== "string" || message.trim().length < 3) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  // Emergency/crisis safety net — deterministic, checked BEFORE calling the
  // AI at all. This is the same shared check used by ALBA chat and the
  // Symptom Checker, so a real emergency always gets the same reliable
  // response here too, instead of being left to the AI's own judgment.
  if (detectCrisisKeywords(message)) {
    return NextResponse.json({ reply: CRISIS_MESSAGE, destination: { href: "/contact", label: "Contact" }, emergency: true });
  }
  if (detectEmergencyKeywords(message)) {
    return NextResponse.json({ reply: EMERGENCY_MESSAGE, destination: { href: "/contact", label: "Contact" }, emergency: true });
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
          contents: [{ role: "user", parts: [{ text: message }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 200, responseMimeType: "application/json" },
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

    const destination = DESTINATIONS.find((d) => d.key === parsed.destinationKey) || DESTINATIONS.find((d) => d.key === "contact")!;

    return NextResponse.json({
      reply: typeof parsed.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : `Here's where I'd point you:`,
      destination: { href: destination.href, label: destination.label },
    });
  } catch (err) {
    console.error("Concierge handler error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}