import { NextRequest, NextResponse } from "next/server";
import { brand } from "@/data/content";
import { BIOARO_TESTS } from "@/data/bioaroTests";

// Real BioAro Labs tests, pulled directly from bioarolabs.com's live catalog.
const TEST_CATALOG = BIOARO_TESTS.map((t) => ({ name: t.name, category: t.categoryLabel, desc: t.desc }));

const SYSTEM_PROMPT = `You are a friendly recommendation assistant for ${brand.name}'s Precision Medicine & Genomics section, helping match patients to the most relevant testing offered through our lab partner, BioAro Labs.

Available tests (choose ONLY from this exact list, using the exact "name" field):
${TEST_CATALOG.map((t) => `- ${t.name} (${t.category}): ${t.desc}`).join("\n")}

You are given a patient's stated goals, health concerns, family history, age range, and whether they've had genetic testing before. Recommend the 1 to 3 tests from the list above that best match what they described.

STRICT RULES:
1. NEVER diagnose. NEVER claim a test will find a specific condition — only explain what the test generally looks at and why it might be relevant to what they shared.
2. Only recommend tests from the exact list provided, using the exact name field. Never invent a test name.
3. You must respond with ONLY valid JSON, no markdown, no extra text, matching exactly this shape:
{
  "intro": "one or two warm, plain-language sentences introducing the recommendations",
  "recommendations": [
    { "testName": "exact name from the list", "reason": "one to two sentences on why this fits what they shared, in plain language" }
  ]
}
4. Recommend 1 to 3 tests, ranked by relevance — the best match first.
5. Keep tone curious and empowering, never alarming or pushy.
6. Never recommend a "Prescription Required" test unless the person's description strongly suggests a specific medical need for it — prefer general wellness tests otherwise.
7. If they've had genetic testing before, favor tests that add new information rather than likely duplicating what they may already have (e.g. a different category than a typical prior test) unless their stated goal specifically points back to genome/exome sequencing.
8. Age range can inform relevance (e.g. biological aging and healthspan panels are commonly more relevant to older age ranges) but should never be the sole reason for a recommendation.`;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { goals = [], concerns = [], familyHistory = [], notes = "", ageRange = "", priorTesting = "" } = body || {};
  if (!Array.isArray(goals) || goals.length === 0) {
    return NextResponse.json({ error: "Missing goals" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  try {
    const inputText = `Goals: ${goals.join(", ")}
Health concerns: ${Array.isArray(concerns) && concerns.length ? concerns.join(", ") : "None specified"}
Family history: ${Array.isArray(familyHistory) && familyHistory.length ? familyHistory.join(", ") : "None specified"}
Age range: ${ageRange || "Not specified"}
Prior genetic testing: ${priorTesting || "Not specified"}
Additional notes: ${notes || "None provided"}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: inputText }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 400, responseMimeType: "application/json" },
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

    const validNames = TEST_CATALOG.map((t) => t.name);
    const recommendations = Array.isArray(parsed.recommendations)
      ? parsed.recommendations
          .filter((r: any) => r && validNames.includes(r.testName))
          .slice(0, 3)
          .map((r: any) => ({
            testName: r.testName,
            reason: typeof r.reason === "string" ? r.reason.trim() : "",
            category: TEST_CATALOG.find((t) => t.name === r.testName)?.category || "",
          }))
      : [];

    return NextResponse.json({
      intro: typeof parsed.intro === "string" && parsed.intro.trim()
        ? parsed.intro.trim()
        : "Based on what you shared, here are the tests most likely to be relevant for you.",
      recommendations: recommendations.length > 0 ? recommendations : [
        { testName: TEST_CATALOG[0].name, reason: TEST_CATALOG[0].desc, category: TEST_CATALOG[0].category },
      ],
    });
  } catch (err) {
    console.error("Genomics quiz handler error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}