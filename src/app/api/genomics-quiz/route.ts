import { NextRequest, NextResponse } from "next/server";
import { brand } from "@/data/content";

// Real BioAro Labs tests, pulled directly from bioarolabs.com's live catalog.
const TEST_CATALOG = [
  { name: "Telomere Length Testing", category: "Biological Aging & Healthspan", desc: "Measures telomere length as a marker associated with cellular aging and biological age." },
  { name: "Hormone Health", category: "Biological Aging & Healthspan", desc: "A core hormone panel evaluating key hormones related to balance, energy, and reproductive health." },
  { name: "Ultra Hormone Health", category: "Biological Aging & Healthspan", desc: "A comprehensive hormone panel assessing hormone balance, adrenal function, and key reproductive hormones." },
  { name: "Essential Vitamin Health", category: "Biological Aging & Healthspan", desc: "A combined assessment of vitamins D, E, A, and K for a broader view of fat-soluble vitamin status." },
  { name: "Brain Health", category: "Biological Aging & Healthspan", desc: "Combines amyloid- and tau-related biomarkers to provide insight into Alzheimer's-related brain changes." },
  { name: "Core Inflammation Aging", category: "Biological Aging & Healthspan", desc: "A focused panel assessing low-grade inflammation and immune regulation." },
  { name: "Advanced Inflammation Aging", category: "Biological Aging & Healthspan", desc: "A deeper panel assessing inflammatory signaling, cellular stress, metabolic strain, and vascular-related patterns." },
  { name: "Ultra Inflammation Aging", category: "Biological Aging & Healthspan", desc: "A broad panel assessing inflammation, cellular stress, vascular strain, tissue remodeling, kidney filtration, and immune health." },
  { name: "Whole Genome Sequencing 100x", category: "Genome Sequencing", desc: "Deep 100x sequencing across the complete genome for a highly detailed view of inherited genetic variation." },
  { name: "Whole Genome Sequencing 30x", category: "Genome Sequencing", desc: "Complete genome sequencing at 30x depth for broad insight into inherited genetic variation." },
  { name: "Whole Exome Sequencing 100x", category: "Genome Sequencing", desc: "Best suited for rare disease and inherited-variant assessment." },
  { name: "Disease-Based DNA Test", category: "Genome Sequencing", desc: "Targeted genetic analysis focused on variants associated with a specific disease, syndrome, or symptom. Prescription required." },
  { name: "Pharmacogenomics Test", category: "Genome Sequencing", desc: "Genetic analysis focused on variations that can influence medication response, metabolism, and dosing. Prescription required." },
  { name: "Comprehensive Cell-free DNA Analysis", category: "Genome Sequencing", desc: "Analysis of circulating tumor DNA and inherited variants to support cancer-related treatment decisions and monitoring. Prescription required." },
  { name: "The BioGut Test", category: "Microbiome", desc: "A stool-based microbiome test providing insight into digestive microbiome balance." },
  { name: "The BioSkin Test", category: "Microbiome", desc: "A skin microbiome test providing insight into microbial balance related to persistent skin concerns." },
  { name: "The BioDental Test", category: "Microbiome", desc: "An oral microbiome test providing insight into microbial balance related to gum and oral health." },
  { name: "The BioFemme Test", category: "Microbiome", desc: "A vaginal microbiome test assessing bacterial and fungal balance, including yeast-related changes." },
  { name: "Resveratrol", category: "Vitamin & Nutritional Status", desc: "Circulating free resveratrol primarily reflects recent dietary or supplement exposure." },
  { name: "Vitamin D, 25-Hydroxy (D2+D3)", category: "Vitamin & Nutritional Status", desc: "The primary circulating marker used to evaluate vitamin D status." },
  { name: "Vitamin E (Alpha & Gamma Tocopherol)", category: "Vitamin & Nutritional Status", desc: "Alpha- and gamma-tocopherol levels provide insight into vitamin E and antioxidant status." },
  { name: "Vitamin K1 (Phylloquinone)", category: "Vitamin & Nutritional Status", desc: "Vitamin K1 status provides insight into a nutrient important for normal clotting and bone-related protein activity." },
  { name: "Vitamin A (Retinol)", category: "Vitamin & Nutritional Status", desc: "Retinol provides insight into circulating vitamin A status." },
  { name: "PAI-1 Total (Plasminogen Activator Inhibitor-1)", category: "Vascular & Organ Stress", desc: "Provides insight into fibrinolytic balance and metabolic-vascular health." },
  { name: "Cystatin C", category: "Vascular & Organ Stress", desc: "A sensitive indicator of kidney filtration that supports kidney health assessment." },
  { name: "β2-Microglobulin (B2M)", category: "Vascular & Organ Stress", desc: "Provides insight into immune activity, cellular turnover, and kidney health." },
  { name: "TIMP-1 (Tissue Inhibitor of Metalloproteinases-1)", category: "Vascular & Organ Stress", desc: "Provides insight into tissue remodeling and extracellular matrix health." },
  { name: "GDF-15 (Growth Differentiation Factor 15)", category: "Vascular & Organ Stress", desc: "Provides insight into cellular stress associated with mitochondrial, metabolic, and inflammatory strain." },
  { name: "hs-CRP (High-Sensitivity C-Reactive Protein)", category: "Vascular & Organ Stress", desc: "A widely used marker of low-grade systemic inflammation linked to cardiovascular and metabolic health." },
];

const SYSTEM_PROMPT = `You are a friendly recommendation assistant for ${brand.name}'s Precision Medicine & Genomics section, helping match patients to the most relevant testing offered through our lab partner, BioAro Labs.

Available tests (choose ONLY from this exact list, using the exact "name" field):
${TEST_CATALOG.map((t) => `- ${t.name} (${t.category}): ${t.desc}`).join("\n")}

You are given a patient's stated goals, health concerns, and family history. Recommend the 1 to 3 tests from the list above that best match what they described.

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
6. Never recommend a "Prescription Required" test unless the person's description strongly suggests a specific medical need for it — prefer general wellness tests otherwise.`;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { goals = [], concerns = [], familyHistory = [], notes = "" } = body || {};
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