// Content for the redesigned homepage + universal chrome (nav rail, mobile
// menu, search). Ported from the Claude Design "ANRA Health" artifact
// (anra-data.js + component logic), with every destination mapped to a real
// route in this app.
import { detectEmergencyKeywords, detectCrisisKeywords } from "@/lib/emergencyDetection";

// ── Destinations ──────────────────────────────────────────────────────────
// Design "pages" → real routes. Tools that live inside another page point
// there until they get a dedicated page.
export const PAGE_HREF = {
  home: "/",
  hub: "/#hub",
  locations: "/#locations",
  symptoms: "/cardiac-symptoms",
  risk: "/longevity",
  labs: "/lab-results",
  diagnosis: "/explain-diagnosis",
  nutrition: "/longevity",
  visitprep: "/referral-centre",
  matcher: "/physicians",
  genomics: "/genomics",
  catalog: "/genomics",
  packages: "/genomics",
  referral: "/referral-centre",
  resources: "/resources",
  contact: "/contact",
} as const;
export type PageKey = keyof typeof PAGE_HREF;

// A navigable action used across the rail, hub panel and concierge.
export interface NavLink {
  label: string;
  sub?: string;
  desc?: string;
  href?: string;            // real route or tel:/mailto:
  alba?: boolean;           // opens ALBA
  hub?: { layer: HubKey; sub?: number | null }; // opens a health-map layer on "/"
  mapFocus?: "ne" | "mm" | "all";
}

// ── Emergency safety net (client side) ────────────────────────────────────
// Design list + the site's shared server patterns. Never weaken — only add.
const EMERG = ["chest pain", "chest pressure", "crushing", "tightness in my chest", "chest tightness", "can't breathe", "can’t breathe", "cannot breathe", "struggling to breathe", "trouble breathing", "difficulty breathing", "fainted", "fainting", "passed out", "unconscious", "stroke", "face drooping", "drooping face", "slurred", "numbness on one side", "weakness on one side", "one side of my body", "seizure", "suicid", "kill myself", "end my life", "overdose", "severe bleeding", "coughing blood", "coughing up blood", "vomiting blood", "blue lips", "anaphyla", "throat swelling", "throat is closing", "worst headache", "heart attack"];
export const isEmergency = (t: string) => {
  const s = (t || "").toLowerCase();
  return EMERG.some((k) => s.includes(k)) || detectEmergencyKeywords(t || "") || detectCrisisKeywords(t || "");
};

// ── Hero concierge ────────────────────────────────────────────────────────
export const PLACEHOLDERS = [
  "I've been getting short of breath.",
  "I want to understand my heart risk.",
  "I have lab results I don't understand.",
  "I want to prepare for my appointment.",
  "I'm interested in genomics.",
];

export const QUICK_CHIPS: NavLink[] = [
  { label: "Check symptoms", href: PAGE_HREF.symptoms },
  { label: "Understand results", href: PAGE_HREF.labs },
  { label: "Assess my risk", href: PAGE_HREF.risk },
  { label: "Explore genomics", href: PAGE_HREF.genomics },
  { label: "Prepare for my visit", href: PAGE_HREF.visitprep },
];

export interface ConciergeRoute {
  id: string;
  keys?: string[];
  concern: string;
  summary: string;
  safety?: string;
  steps: NavLink[];
}

export const ROUTES: ConciergeRoute[] = [
  { id: "cardiac", keys: ["chest", "heart", "palpit", "racing", "blood pressure", "cholesterol", "cardio", "statin", "flutter", "swelling", "ankle"], concern: "Heart & circulation", summary: "This may relate to your heart or circulation. Cardiology is where we would usually start.", safety: "If discomfort is severe, sudden, spreading to your arm or jaw, or comes with sweating or breathlessness, call 911 now.",
    steps: [{ label: "Check your symptoms", desc: "A guided check with clear next steps.", href: PAGE_HREF.symptoms }, { label: "Understand your heart risk", desc: "Seven questions, one at a time.", href: PAGE_HREF.risk }, { label: "Cardiology pathway", desc: "What a cardiology referral involves.", href: "/specialties/cardiology" }] },
  { id: "breath", keys: ["breath", "cough", "wheez", "lung", "asthma", "copd", "winded"], concern: "Breathing & lungs", summary: "This may relate to your lungs or your heart. Both can cause breathlessness, so the first step is a careful assessment.", safety: "If you are struggling to breathe at rest or your lips look blue, call 911 now.",
    steps: [{ label: "Check your symptoms", desc: "Describe what you notice and when.", href: PAGE_HREF.symptoms }, { label: "Respiratory Medicine", desc: "Assessment of breathlessness and cough.", href: "/specialties/respiratory-medicine" }, { label: "Pulmonary diagnostics", desc: "Spirometry and lung function testing.", href: "/diagnostics/pulmonary" }] },
  { id: "labs", keys: ["lab", "result", "blood test", "bloodwork", "ldl", "a1c", "hba1c", "cholesterol level", "report", "tsh"], concern: "Understanding results", summary: "You have information you want to make sense of. We can explain each value in plain language.",
    steps: [{ label: "Lab Result Explainer", desc: "Paste, photograph or upload your results.", href: PAGE_HREF.labs }, { label: "Explain My Diagnosis", desc: "For a report or clinical note.", href: PAGE_HREF.diagnosis }, { label: "Prepare for your visit", desc: "Turn questions into a clear summary.", href: PAGE_HREF.visitprep }] },
  { id: "diag", keys: ["diagnos", "told i have", "diagnosed", "condition called"], concern: "Understanding a diagnosis", summary: "A diagnosis is easier to act on once you understand it.",
    steps: [{ label: "Explain My Diagnosis", desc: "What it means and what to ask.", href: PAGE_HREF.diagnosis }, { label: "Prepare for your visit", desc: "Organize questions for your clinician.", href: PAGE_HREF.visitprep }, { label: "Find the right physician", desc: "Match to a clinical pathway.", href: PAGE_HREF.matcher }] },
  { id: "prep", keys: ["appointment", "visit", "prepare", "see a doctor", "specialist", "physician"], concern: "Preparing for care", summary: "A little preparation makes a visit more useful for you and your clinician.",
    steps: [{ label: "Visit Prep", desc: "Symptoms, questions and history in one summary.", href: PAGE_HREF.visitprep }, { label: "Physician Matcher", desc: "Find the right specialty and location.", href: PAGE_HREF.matcher }, { label: "Referral Centre", desc: "Start or track a referral.", href: PAGE_HREF.referral }] },
  { id: "gen", keys: ["gene", "genom", "dna", "genetic", "family history", "hereditary", "inherit"], concern: "Genomics & family history", summary: "Genomics can add context, especially where there is a family history.",
    steps: [{ label: "Explore Genomics", desc: "What testing can and cannot tell you.", href: PAGE_HREF.genomics }, { label: "Packages", desc: "Curated pathways, including family history.", href: PAGE_HREF.packages }, { label: "Assess your risk", desc: "Start with the questions that matter.", href: PAGE_HREF.risk }] },
  { id: "nut", keys: ["diet", "food", "nutrition", "weight", "eat", "meal", "sugar"], concern: "Nutrition", summary: "Small, consistent changes tend to matter most.",
    steps: [{ label: "Nutrition Starter Plan", desc: "Four questions, one practical plan.", href: PAGE_HREF.nutrition }, { label: "Assess your risk", desc: "See how nutrition fits your wider picture.", href: PAGE_HREF.risk }, { label: "Nutrition care", desc: "Evidence-based dietary guidance.", href: "/specialties/nutrition" }] },
  { id: "ref", keys: ["referral", "refer", "fax"], concern: "Referral", summary: "Referrals can be scanned, uploaded or entered in a few minutes.",
    steps: [{ label: "Start your referral", desc: "Scan or upload; we detect the fields.", href: PAGE_HREF.referral }, { label: "Find the right physician", desc: "Confirm the specialty first.", href: PAGE_HREF.matcher }, { label: "Prepare for your visit", desc: "Be ready once it is booked.", href: PAGE_HREF.visitprep }] },
];

export const GENERAL: ConciergeRoute = { id: "general", concern: "Getting started", summary: "We can help you understand what's going on and find the right next step.",
  steps: [{ label: "Check your symptoms", desc: "A guided check with clear next steps.", href: PAGE_HREF.symptoms }, { label: "Find the right physician", desc: "Match to a clinical pathway.", href: PAGE_HREF.matcher }, { label: "Assess your health risks", desc: "One question at a time.", href: PAGE_HREF.risk }] };

export const routeFor = (t: string): ConciergeRoute => {
  const s = t.toLowerCase();
  return ROUTES.find((r) => r.keys!.some((k) => s.includes(k))) || GENERAL;
};

// /api/concierge returns one destination href — map it back to a route card.
export const routeForHref = (href: string | undefined, text: string): ConciergeRoute => {
  const local = routeFor(text);
  if (!href) return local;
  const byHref: Record<string, string> = {
    "/specialties/cardiology": "cardiac", "/specialties/respiratory-medicine": "breath", "/lab-results": "labs",
    "/genomics": "gen", "/referral-centre": "ref", "/longevity": local.id === "nut" ? "nut" : "cardiac",
  };
  const id = byHref[href];
  return (id && ROUTES.find((r) => r.id === id)) || local;
};

// ── Specialties & diagnostics ─────────────────────────────────────────────
export interface Spec { name: string; href: string; addresses: string; tests: string[]; tools: NavLink[] }

export const SPECS: Spec[] = [
  { name: "Cardiology", href: "/specialties/cardiology", addresses: "Chest discomfort, palpitations, blood pressure, cholesterol and structural heart conditions.", tests: ["Echocardiogram", "Exercise stress echo", "Holter monitoring", "Ambulatory blood pressure"], tools: [{ label: "Symptom Checker", href: PAGE_HREF.symptoms }, { label: "Health Risk Assessment", href: PAGE_HREF.risk }] },
  { name: "Heart Failure Clinic", href: "/specialties/heart-failure-clinic", addresses: "Ongoing care for heart failure: medication optimization, symptom monitoring and education.", tests: ["Echocardiogram", "BNP bloodwork", "Six-minute walk"], tools: [{ label: "Visit Prep", href: PAGE_HREF.visitprep }, { label: "Explain My Diagnosis", href: PAGE_HREF.diagnosis }] },
  { name: "Internal Medicine", href: "/specialties/internal-medicine", addresses: "Multiple or complex conditions, unexplained symptoms and coordination across specialties.", tests: ["Comprehensive bloodwork", "ECG", "Imaging as indicated"], tools: [{ label: "Lab Result Explainer", href: PAGE_HREF.labs }, { label: "Visit Prep", href: PAGE_HREF.visitprep }] },
  { name: "Endocrinology", href: "/specialties/endocrinology", addresses: "Diabetes, thyroid, adrenal and other hormone conditions.", tests: ["HbA1c", "Thyroid panel", "Hormone profile"], tools: [{ label: "Lab Result Explainer", href: PAGE_HREF.labs }, { label: "Nutrition Starter Plan", href: PAGE_HREF.nutrition }] },
  { name: "Geriatric Medicine", href: "/specialties/geriatric-medicine", addresses: "Health in later life: memory, mobility, falls and medication review.", tests: ["Cognitive screening", "Gait and balance", "Bloodwork"], tools: [{ label: "Visit Prep", href: PAGE_HREF.visitprep }, { label: "Physician Matcher", href: PAGE_HREF.matcher }] },
  { name: "Pediatric Rheumatology", href: "/specialties/pediatric-rheumatology", addresses: "Joint, muscle and inflammatory conditions in children and adolescents.", tests: ["Inflammatory markers", "Joint imaging"], tools: [{ label: "Physician Matcher", href: PAGE_HREF.matcher }, { label: "Referral Centre", href: PAGE_HREF.referral }] },
  { name: "Respiratory Medicine", href: "/specialties/respiratory-medicine", addresses: "Breathlessness, chronic cough, asthma, COPD and sleep-related breathing.", tests: ["Spirometry", "Full pulmonary function", "Six-minute walk"], tools: [{ label: "Symptom Checker", href: PAGE_HREF.symptoms }, { label: "Visit Prep", href: PAGE_HREF.visitprep }] },
  { name: "Nutrition", href: "/specialties/nutrition", addresses: "Evidence-based dietary guidance for heart, metabolic and general health.", tests: ["Nutrient status", "Lipid profile", "HbA1c"], tools: [{ label: "Nutrition Starter Plan", href: PAGE_HREF.nutrition }, { label: "Health Risk Assessment", href: PAGE_HREF.risk }] },
  { name: "Skin Health", href: "/specialties/skin-health", addresses: "Assessment of skin conditions, including those linked to wider health.", tests: ["Clinical examination", "Bloodwork as indicated"], tools: [{ label: "Visit Prep", href: PAGE_HREF.visitprep }, { label: "Physician Matcher", href: PAGE_HREF.matcher }] },
];

export interface Diag { name: string; href: string; signal: string; desc: string; tests: string[] }

export const DIAGS: Diag[] = [
  { name: "Cardiac Imaging", href: "/diagnostics/cardiac-imaging", signal: "Structure", desc: "Echocardiography shows the heart's chambers, valves and pumping function in real time.", tests: ["Transthoracic echocardiogram", "Strain imaging", "Valve assessment"] },
  { name: "Stress Testing", href: "/diagnostics/stress-testing", signal: "Function", desc: "How the heart responds to exertion. ANRA runs Alberta's first onsite exercise stress echocardiogram program.", tests: ["Exercise stress echocardiogram", "Treadmill ECG"] },
  { name: "Vascular", href: "/diagnostics/vascular", signal: "Circulation", desc: "How well blood moves through the arteries that supply the brain and limbs.", tests: ["Carotid ultrasound", "Ankle-brachial index"] },
  { name: "Monitoring", href: "/diagnostics/monitoring", signal: "Rhythm", desc: "Recordings over days capture rhythms and pressures a single visit can miss.", tests: ["24–48 hour Holter", "Extended event monitor", "Ambulatory blood pressure"] },
  { name: "Pulmonary", href: "/diagnostics/pulmonary", signal: "Breathing", desc: "Measures how much air the lungs move, how fast, and how well oxygen transfers.", tests: ["Spirometry", "Full pulmonary function", "Six-minute walk test"] },
];

// ── Health map (hub) ──────────────────────────────────────────────────────
export type HubKey = "spec" | "diag" | "prec" | "long" | "ai";

export const HUB: { k: HubKey; label: string; sub?: string; icon: string; a: number }[] = [
  { k: "spec", label: "Medical Specialties", icon: "ph-stethoscope", a: -90 },
  { k: "diag", label: "Diagnostics & Testing", icon: "ph-clipboard-text", a: -18 },
  { k: "prec", label: "Precision Medicine & Genomics", icon: "ph-dna", a: 54 },
  { k: "long", label: "Longevity", icon: "ph-heartbeat", a: 126 },
  { k: "ai", label: "AI Health Companion", sub: "ALBA", icon: "ph-brain", a: 198 },
];

export const HUB_INFO: Record<HubKey, { title: string; desc: string; chart: string; icon: string }> = {
  spec: { title: "Medical Specialties", desc: "Nine specialties that share one record, so nothing is seen in isolation.", chart: "ecg", icon: "ph-stethoscope" },
  diag: { title: "Diagnostics & Testing", desc: "Imaging, stress testing, vascular, monitoring and pulmonary testing, onsite.", chart: "flow", icon: "ph-clipboard-text" },
  prec: { title: "Precision Medicine & Genomics", desc: "Information that is more personal to you than population averages.", chart: "dna", icon: "ph-dna" },
  long: { title: "Longevity", desc: "Proactive care designed to extend your healthspan.", chart: "trend", icon: "ph-heartbeat" },
  ai: { title: "AI Health Companion", desc: "ALBA and the tools around it. They explain, organize and guide. None of them diagnose.", chart: "signal", icon: "ph-brain" },
};

export interface HubSub { name: string; desc: string; chart: string; param?: number; items: string[]; actions: NavLink[] }

const RISK_SUB: HubSub = { name: "Health Risk Assessment", desc: "Seven questions about common cardiovascular risk factors, one at a time. A calm summary at the end.", chart: "ldl", param: 41, items: ["About two minutes", "Private to this device"], actions: [{ label: "Begin assessment", href: PAGE_HREF.risk }] };

export function hubSubs(k: HubKey): HubSub[] {
  if (k === "spec") {
    const ch = ["ecg", "ecg", "signal", "glucose", "activity", "signal", "resp", "glucose", "signal"];
    return SPECS.map((x, i) => ({ name: x.name, desc: x.addresses, chart: ch[i], param: i === 4 ? 160 : 50, items: x.tests,
      actions: [{ label: "Open " + x.name, href: x.href }, { label: "Start a referral", href: PAGE_HREF.referral }, { label: "Find the right physician", href: PAGE_HREF.matcher } as NavLink].concat(x.tools) }));
  }
  if (k === "diag") {
    const ch = ["echo", "hr", "flow", "ecg", "resp"];
    return DIAGS.map((d, i) => ({ name: d.name, desc: d.desc, chart: ch[i], items: d.tests,
      actions: [{ label: "Open " + d.name, href: d.href }, { label: "Start a referral", href: PAGE_HREF.referral }, { label: "Prepare for testing", href: PAGE_HREF.visitprep }] }));
  }
  if (k === "prec") return [
    { name: "Genomics", desc: "Inherited variants linked to some heart, lipid and cancer conditions, and how you may respond to medications.", chart: "dna", items: ["Whole Genome Sequencing", "Pharmacogenomics", "Disease-Based DNA"], actions: [{ label: "Explore genomics", href: PAGE_HREF.genomics }, { label: "Test catalog", href: PAGE_HREF.catalog }] },
    { name: "Precision Medicine", desc: "Treatment choices informed by your biomarkers, genetics and history, not population averages alone.", chart: "signal", items: ["Biomarker review", "Medication response", "Shared plan"], actions: [{ label: "Find the right physician", href: PAGE_HREF.matcher }] },
    { name: "Biomarkers", desc: "Advanced blood markers such as hs-CRP, PAI-1 and GDF-15 add context a standard panel can miss.", chart: "bars", items: ["hs-CRP", "PAI-1", "GDF-15", "Cystatin C"], actions: [{ label: "Explain my results", href: PAGE_HREF.labs }, { label: "See packages", href: PAGE_HREF.packages }] },
    { name: "Packages", desc: "Curated diagnostic pathways designed around specific health questions.", chart: "bars", items: ["Heart Risk Starter", "Family History Panel", "Statin Readiness"], actions: [{ label: "See packages", href: PAGE_HREF.packages }] },
    RISK_SUB,
  ];
  if (k === "long") return [
    RISK_SUB,
    { name: "Nutrition Plan", desc: "A practical starting plan built around how you already eat.", chart: "glucose", items: ["Four questions", "Priorities, habits, questions"], actions: [{ label: "Build my plan", href: PAGE_HREF.nutrition }] },
    { name: "Longevity Score", desc: "A trend reviewed with your clinician: how your risk factors change over time. A direction, not a verdict.", chart: "trend", items: ["Reviewed in clinic", "Updated each visit"], actions: [{ label: "Start a referral", href: PAGE_HREF.referral }] },
    { name: "Preventive Health", desc: "Activity, blood pressure and cholesterol checks, planned ahead rather than after the fact.", chart: "activity", param: 120, items: ["Activity", "Blood pressure", "Lipids"], actions: [{ label: "Assess my risk", href: PAGE_HREF.risk }] },
  ];
  return [
    { name: "Ask ALBA", desc: "Your health companion. Explains, organizes and guides, and knows when to step aside for a clinician.", chart: "signal", items: ["Knows the page you’re on", "Never diagnoses"], actions: [{ label: "Ask ALBA", alba: true }] },
    { name: "Symptom Checker", desc: "Describe what you feel. Emergency signs are flagged immediately.", chart: "ecg", items: ["Safety-first", "Level-of-care guidance"], actions: [{ label: "Check symptoms", href: PAGE_HREF.symptoms }] },
    { name: "Lab Result Explainer", desc: "Type, photograph or upload results. Each value explained in plain language.", chart: "ldl", param: 41, items: ["Text", "Photo", "PDF"], actions: [{ label: "Explain my results", href: PAGE_HREF.labs }] },
    { name: "Explain My Diagnosis", desc: "What a diagnosis, report or clinical note means, and what to ask.", chart: "signal", items: ["Plain language", "Questions to ask"], actions: [{ label: "Explain a diagnosis", href: PAGE_HREF.diagnosis }] },
    { name: "Visit Prep", desc: "Symptoms, questions and history turned into a one-page summary.", chart: "trend", items: ["Printable", "Private"], actions: [{ label: "Prepare my visit", href: PAGE_HREF.visitprep }] },
    { name: "Physician Matcher", desc: "Find the right specialty, location and referral route.", chart: "signal", items: ["Five questions"], actions: [{ label: "Find my pathway", href: PAGE_HREF.matcher }] },
  ];
}

// ── Navigation rail / mobile menu ─────────────────────────────────────────
export interface RailItem { k: string; label: string; icon?: string; ai?: boolean; title: string; blurb: string; links: NavLink[] }

export const RAIL: RailItem[] = [
  { k: "care", label: "Care", icon: "ph-stethoscope", title: "Medical Specialties", blurb: "Nine specialties, one connected record.", links: SPECS.map((x) => ({ label: x.name, href: x.href })) },
  { k: "diag", label: "Diagnostics", icon: "ph-clipboard-text", title: "Diagnostics & Testing", blurb: "Structure, function, circulation, rhythm and breathing, onsite.", links: DIAGS.map((d) => ({ label: d.name, sub: d.signal, href: d.href })) },
  { k: "prec", label: "Precision Health", icon: "ph-dna", title: "Precision Medicine & Genomics", blurb: "Information more personal to you than population averages.", links: [{ label: "Genomics", sub: "Explainer", href: PAGE_HREF.genomics }, { label: "Test catalog", sub: "BioAro Labs", href: PAGE_HREF.catalog }, { label: "Packages", sub: "Pathways", href: PAGE_HREF.packages }, { label: "Biomarkers", sub: "Health map", hub: { layer: "prec", sub: 2 } }] },
  { k: "long", label: "Longevity", icon: "ph-heartbeat", title: "Longevity", blurb: "Proactive care to extend your healthspan.", links: [{ label: "Health Risk Assessment", href: PAGE_HREF.risk }, { label: "Nutrition Starter Plan", href: PAGE_HREF.nutrition }, { label: "Longevity Score", sub: "Health map", hub: { layer: "long", sub: 2 } }] },
  { k: "ai", label: "AI Health", ai: true, title: "AI Health · ALBA", blurb: "Tools that explain, organize and guide. None replace a clinician.", links: [{ label: "Ask ALBA", sub: "Companion", alba: true }, { label: "Symptom Checker", sub: "Safety-first", href: PAGE_HREF.symptoms }, { label: "Lab Result Explainer", sub: "Text · photo · PDF", href: PAGE_HREF.labs }, { label: "Explain My Diagnosis", sub: "Plain language", href: PAGE_HREF.diagnosis }, { label: "Visit Prep", sub: "One-page summary", href: PAGE_HREF.visitprep }, { label: "Physician Matcher", sub: "Find a pathway", href: PAGE_HREF.matcher }] },
  { k: "ref", label: "Referral Centre", icon: "ph-file-text", title: "Referral Centre", blurb: "Scan, upload or enter a referral in minutes.", links: [{ label: "Start a referral", sub: "Scan or upload", href: PAGE_HREF.referral }, { label: "Find the right physician", href: PAGE_HREF.matcher }] },
  { k: "more", label: "More", icon: "ph-dots-three", title: "Clinics & resources", blurb: "Locations, contact and patient resources.", links: [{ label: "North East Clinic", sub: "Map", href: PAGE_HREF.locations, mapFocus: "ne" }, { label: "Meadow Miles Clinic", sub: "Map", href: PAGE_HREF.locations, mapFocus: "mm" }, { label: "403-475-4475", sub: "Call", href: "tel:403-475-4475" }, { label: "admin@anrahealth.com", sub: "Email", href: "mailto:admin@anrahealth.com" }, { label: "Patient Resources", sub: "Visit prep", href: PAGE_HREF.resources }, { label: "Contact", sub: "Get in touch", href: PAGE_HREF.contact }] },
];

// ── Locations ─────────────────────────────────────────────────────────────
export const CLINICS = [
  { k: "ne" as const, name: "North East Clinic", addr: "201 – 3151 27 St NE, Calgary, AB T1Y 0B4", q: "201+3151+27+St+NE+Calgary+AB" },
  { k: "mm" as const, name: "Meadow Miles Clinic", addr: "250 – 8500 Blackfoot Trail SE, Calgary, AB T2J 7E1", q: "250+8500+Blackfoot+Trail+SE+Calgary+AB" },
];
export const CLINIC_PHONE = "403-475-4475";
export const CLINIC_EMAIL = "admin@anrahealth.com";

// ── Live signals / precision ──────────────────────────────────────────────
export const SIGNAL_TABS: [string, string][] = [["ecg", "Heart rhythm"], ["bp", "Blood pressure"], ["ldl", "Cholesterol"], ["activity", "Activity"]];

export const signalNote = (tab: string, ldl: number, act: number) => {
  if (tab === "ldl") return ldl > 3.5
    ? `At ${ldl.toFixed(1)} mmol/L, LDL is above the usual target of 3.5. On its own that isn’t a diagnosis; it’s read alongside your other risk factors.`
    : `At ${ldl.toFixed(1)} mmol/L, LDL is within the usual target. Targets can be lower for people with other risk factors.`;
  if (tab === "activity") return act >= 150 ? `${act} minutes a week meets the common guideline of 150.` : `${act} minutes a week. The common guideline is 150, and any increase counts.`;
  if (tab === "bp") return "Home readings vary through the day. A two-week average tells your clinician more than any single number.";
  return "A regular rhythm at around 68 beats per minute. Holter monitoring records days of this, catching patterns a single ECG can miss.";
};

export const PREC_LAYERS: [string, string][] = [["Population guidelines", "Everyone"], ["Risk factors", "People like you"], ["Biomarkers", "Your blood"], ["Genomics", "Your DNA"], ["Insight", "You"]];
export const PREC_CAPTIONS = ["Guidelines are written for everyone.", "Risk factors narrow it to people who share yours.", "Biomarkers add what your blood shows.", "Genomics adds what your DNA shows.", "Together, the picture becomes about you."];

// Homepage ALBA console suggestions (design order).
export const ALBA_SUGGESTIONS = ["What does a cardiologist assess?", "What is an exercise stress echo?", "How do I get a referral?"];

// ALBA panel suggestions, by the page the visitor is on.
export function albaSuggestionsFor(pathname: string): string[] {
  if (pathname === "/") return ["What does a cardiologist assess?", "How do I get a referral?", "What is an exercise stress echo?"];
  if (pathname.startsWith("/genomics")) return ["Which genetic test fits a family history of heart disease?", "What does pharmacogenomics mean?", "Is genomic testing covered?"];
  if (pathname.startsWith("/lab-results")) return ["What does a high LDL mean?", "Why would hs-CRP be repeated?", "What is ApoB?"];
  if (pathname.startsWith("/referral-centre")) return ["What should a referral include?", "How long does intake take?"];
  return ["How do I get a referral?", "What does ANRA offer?", "Help me prepare for a visit"];
}

// ── Search index ──────────────────────────────────────────────────────────
// Default "Suggested" results when the search box is empty (design order).
export const SEARCH_SUGGESTED = ["Symptom Checker", "Lab Result Explainer", "Genomics", "Packages", "Referral Centre", "Health Risk Assessment"];

export const SEARCH_INDEX: { label: string; kind: string; link: NavLink }[] = [
  ...SPECS.map((s) => ({ label: s.name, kind: "Specialty", link: { label: s.name, href: s.href } })),
  ...DIAGS.map((d) => ({ label: d.name, kind: "Diagnostics", link: { label: d.name, href: d.href } })),
  { label: "Ask ALBA", kind: "Companion", link: { label: "Ask ALBA", alba: true } },
  { label: "Symptom Checker", kind: "Tool", link: { label: "Symptom Checker", href: PAGE_HREF.symptoms } },
  { label: "Health Risk Assessment", kind: "Tool", link: { label: "Health Risk Assessment", href: PAGE_HREF.risk } },
  { label: "Lab Result Explainer", kind: "Tool", link: { label: "Lab Result Explainer", href: PAGE_HREF.labs } },
  { label: "Explain My Diagnosis", kind: "Tool", link: { label: "Explain My Diagnosis", href: PAGE_HREF.diagnosis } },
  { label: "Nutrition Starter Plan", kind: "Tool", link: { label: "Nutrition Starter Plan", href: PAGE_HREF.nutrition } },
  { label: "Visit Prep", kind: "Tool", link: { label: "Visit Prep", href: PAGE_HREF.visitprep } },
  { label: "Physician Matcher", kind: "Tool", link: { label: "Physician Matcher", href: PAGE_HREF.matcher } },
  { label: "Genomics", kind: "Precision Health", link: { label: "Genomics", href: PAGE_HREF.genomics } },
  { label: "Packages", kind: "Precision Health", link: { label: "Packages", href: PAGE_HREF.packages } },
  { label: "Referral Centre", kind: "Patients", link: { label: "Referral Centre", href: PAGE_HREF.referral } },
  { label: "Patient Resources", kind: "Patients", link: { label: "Patient Resources", href: PAGE_HREF.resources } },
  { label: "Contact", kind: "Clinic", link: { label: "Contact", href: PAGE_HREF.contact } },
  { label: "Locations", kind: "Clinic", link: { label: "Locations", href: PAGE_HREF.locations } },
];