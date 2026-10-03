// Neyu version content — "Your Health, Connected."
// Brand architecture (from the CEO brief): one proposition, three pillars
// (Understand · Connect · Flourish), four care pillars (Care · Diagnostics ·
// Prevention · Longevity), one companion (Neyu), and the philosophy
// Listen · Connect · Flourish. Clinical services and test prices are the
// real ones from content.ts / bioaroCatalog.ts.
import { LAB_TESTS } from "@/data/bioaroCatalog";

export const PROPOSITION = {
  title: "Your Health, Connected.",
  lead: "NEYU brings your health information, biology, care and intelligent guidance together in one experience — so you can understand more and act earlier.",
  line: "NEYU connects the pieces of your health so you can understand what matters and what to do next.",
};

export const PHILOSOPHY = [
  { k: "Listen", icon: "pulse", text: "Your body is always communicating.", more: "Symptoms, results, sleep, steps and blood pressure are signals. NEYU listens to all of them, not just the loudest one." },
  { k: "Connect", icon: "network", text: "Your health exists as a network, not isolated numbers.", more: "A cholesterol value means more next to your blood pressure, your genes and your family history. NEYU connects them." },
  { k: "Flourish", icon: "leaf", text: "Not merely treating illness — creating the conditions for a healthier life.", more: "From reactive care to proactive health: prevention, healthspan and long-term wellbeing." },
];

export const PILLARS3 = [
  { k: "Understand", text: "Your data. Your biology. Your health.", icon: "eye" },
  { k: "Connect", text: "Your doctors. Your diagnostics. Your care.", icon: "link" },
  { k: "Flourish", text: "Your prevention. Your healthspan. Your future.", icon: "leaf" },
];

export type PillarKey = "care" | "diagnostics" | "prevention" | "longevity";
export const PILLARS: { k: PillarKey; title: string; tag: string; text: string; icon: string; href: string; chart: string; param?: number; neyu: string }[] = [
  { k: "care", title: "Care", tag: "Doctors, specialists & consultations", text: "From everyday health to complex medical needs, the right care, expertise and information come together around you — in clinic or virtually.", icon: "stethoscope", href: "/care", chart: "ecg", neyu: "Neyu reads your question, finds the right specialist and prepares your visit summary." },
  { k: "diagnostics", title: "Diagnostics", tag: "Laboratory, imaging & monitoring", text: "Diagnostics that connect the dots — lab testing, imaging and continuous monitoring brought together into one clearer picture.", icon: "flask", href: "/diagnostics", chart: "echo", neyu: "Neyu explains each result in plain language and shows what it means next to the others." },
  { k: "prevention", title: "Prevention", tag: "Risk assessment & early action", text: "Find risk early. Assessments, private health packages and executive health, personalized by your biology.", icon: "shieldCheck", href: "/prevention", chart: "bp", neyu: "Neyu scores your risk against Canadian guidelines and suggests the tests that fit." },
  { k: "longevity", title: "Longevity", tag: "Healthspan & long-term wellbeing", text: "Move from healthcare to healthspan. Understand where you are today and improve your health over time.", icon: "hourglass", href: "/longevity", chart: "trend", neyu: "Neyu tracks your trends and turns new research into what you can act on." },
];

export const LAYERS5 = [
  { k: "Understand", text: "Your health information, history, biomarkers and signals.", icon: "layers" },
  { k: "Discover", text: "Patterns, risks and opportunities.", icon: "compass" },
  { k: "Connect", text: "Doctors, specialists, diagnostics and personalized services.", icon: "network" },
  { k: "Act", text: "Personalized recommendations and health programs.", icon: "target" },
  { k: "Improve", text: "Track your progress over time.", icon: "trend" },
];

// "One health record. A clearer picture."
export const RECORD = [
  { k: "records", title: "Medical Records", sub: "Your clinical history", icon: "folder", sample: ["Visits & referrals", "Diagnoses & medications", "Care team notes"], chart: "timeline", neyu: "Your last cardiology visit recommended a repeat lipid panel in 3 months — that's due in 2 weeks." },
  { k: "diagnostics", title: "Diagnostics", sub: "Labs, imaging and monitoring", icon: "pulse", sample: ["Blood work & biomarkers", "Echo, stress echo, ultrasound", "Holter & ambulatory BP"], chart: "echo", neyu: "Your echo shows normal pumping function; LDL is the value to watch, and it's trending down." },
  { k: "biology", title: "Biology", sub: "Genomics and biomarkers", icon: "dna", sample: ["Whole-genome & pharmacogenomics", "Inflammation & aging markers", "Hormones & nutrients"], chart: "dna", neyu: "A CYP2C19 result changes how some heart medicines work for you — worth sharing with every prescriber." },
  { k: "lifestyle", title: "Lifestyle", sub: "Sleep, activity, nutrition and other signals", icon: "steps", sample: ["Wearables & Apple Health", "Sleep and activity", "Nutrition and habits"], chart: "sleepbp", neyu: "On weeks you sleep under 6 hours, your morning blood pressure runs about 6 points higher." },
  { k: "environment", title: "Environment", sub: "The world around you", icon: "cloud", sample: ["Air quality (AQHI)", "Weather & UV", "Season and altitude"], chart: "aqhi", neyu: "Air quality is poor in Calgary today — a lighter indoor workout is the better choice." },
];

// Health operating system (internal concept, shown as "How NEYU works").
export const OS = [
  { k: "Identity", text: "One secure account and consent you control.", icon: "fingerprint" },
  { k: "Health Record", text: "History, results, biology, lifestyle and environment in one place.", icon: "folder" },
  { k: "Intelligence", text: "Neyu reads it all, explains it and spots what deserves attention.", icon: "spark" },
  { k: "Care", text: "Doctors, specialists, virtual visits and diagnostics, connected.", icon: "stethoscope" },
  { k: "Prevention", text: "Risk found early, with programs and packages to act on it.", icon: "shieldCheck" },
  { k: "Longevity", text: "Healthspan tracked over years, not one appointment.", icon: "hourglass" },
];

export const JOURNEY = [
  { k: "Track", text: "Readings, results and wearables flow in automatically.", icon: "chart" },
  { k: "Understand", text: "Neyu explains what changed and why it matters.", icon: "spark" },
  { k: "Improve", text: "Small actions, re-checked over time with your care team.", icon: "trend" },
];

// ── New services ─────────────────────────────────────────────
export const SERVICES = [
  { k: "virtual-care", title: "Virtual Care", text: "See a NEYU physician by secure video from home. Neyu prepares your visit before you join.", icon: "video", href: "/virtual-care", pillar: "care" as PillarKey, meta: "Video visits" },
  { k: "hypertension-clinic", title: "Virtual Hypertension Clinic", text: "A remote blood-pressure program: home readings, AI coaching and physician review.", icon: "gauge", href: "/hypertension-clinic", pillar: "care" as PillarKey, meta: "Remote BP program" },
  { k: "packages", title: "Private Health Packages", text: "Curated packages — from heart checks to executive health — combining imaging, labs and a physician review.", icon: "package", href: "/packages", pillar: "prevention" as PillarKey, meta: "Curated checks" },
  { k: "executive", title: "Executive Health", text: "A comprehensive, efficient assessment for busy professionals, with a connected follow-up plan.", icon: "briefcase", href: "/packages#executive", pillar: "prevention" as PillarKey, meta: "In one morning" },
  { k: "membership", title: "NEYU Membership", text: "Ongoing, connected care by subscription: your record, Neyu, priority access and annual assessments.", icon: "membership", href: "/membership", pillar: "longevity" as PillarKey, meta: "Ongoing care" },
  { k: "at-home", title: "At-home Blood Collection", text: "A trained collector comes to you. Results flow straight into your NEYU record.", icon: "homeDrop", href: "/at-home", pillar: "diagnostics" as PillarKey, meta: "We come to you" },
];

const price = (slug: string) => LAB_TESTS.find((t) => t.id === "labs-" + slug)?.price || 0;
const lab = (slug: string) => { const t = LAB_TESTS.find((x) => x.id === "labs-" + slug); return t ? { slug, name: t.name, price: t.price } : null; };

export type Pkg = { id: string; title: string; tag: string; for: string; icon: string; clinic: string[]; labs: { slug: string; name: string; price: number }[]; neyu: string; chart: string };
export const PACKAGES: Pkg[] = [
  { id: "heart", title: "Heart Health Check", tag: "Know your heart", for: "Family history of heart disease, high blood pressure or cholesterol, or simply peace of mind.", icon: "heartPulse", chart: "ecg",
    clinic: ["Cardiology consultation", "Electrocardiogram (ECG)", "Echocardiography"], labs: [lab("high-sensitive-crp-hs-crp"), lab("pai-1-total")].filter(Boolean) as Pkg["labs"], neyu: "Neyu builds your heart summary and flags what to recheck." },
  { id: "executive", title: "Executive Health", tag: "Comprehensive, in one morning", for: "Busy professionals who want a complete, efficient picture and a clear plan.", icon: "briefcase", chart: "hr",
    clinic: ["Internal medicine assessment", "Exercise stress echocardiogram", "Carotid ultrasound", "24-hour ambulatory BP"], labs: [lab("core-inflammation-aging"), lab("gdf-15"), lab("cystatin-c"), lab("vitamin-d2-d3")].filter(Boolean) as Pkg["labs"], neyu: "Neyu turns every result into one connected report and a 12-month plan." },
  { id: "longevity", title: "Longevity Baseline", tag: "Measure your aging biology", for: "Anyone starting a longevity plan who wants a baseline to re-test against.", icon: "hourglass", chart: "trend",
    clinic: ["Longevity consultation", "Body and blood-pressure assessment"], labs: [lab("advanced-inflammation-aging"), lab("gdf-15"), lab("telomere-length-testing")].filter(Boolean) as Pkg["labs"], neyu: "Neyu tracks your markers over time against your baseline." },
  { id: "precision", title: "Precision Genomics", tag: "Your DNA, read once, used for life", for: "Family history, medicine safety, or a lifelong genetic reference.", icon: "dna", chart: "dna",
    clinic: ["Genetic results review with a physician"], labs: [lab("whole-genome-sequencing-30x"), lab("pharmacogenomics-test")].filter(Boolean) as Pkg["labs"], neyu: "Neyu explains your genes in plain language and checks your medicines against them." },
  { id: "metabolic", title: "Metabolic & Hormone", tag: "Energy, weight and hormones", for: "Fatigue, weight change, prediabetes or hormone questions.", icon: "bolt", chart: "glucose",
    clinic: ["Endocrinology or internal medicine consult"], labs: [lab("hormone-health"), lab("essential-vitamin-health"), lab("cortisol")].filter(Boolean) as Pkg["labs"], neyu: "Neyu links your hormone and nutrient results to your symptoms and habits." },
];
export const pkgLabTotal = (p: Pkg) => p.labs.reduce((s, l) => s + l.price, 0);

export const MEMBERSHIP = [
  { id: "essential", title: "Essential", tag: "Your connected record", icon: "tierOne", features: ["NEYU health record", "Neyu AI companion, unlimited", "Wearable & Apple Health sync", "Annual health review"], highlight: false },
  { id: "plus", title: "Plus", tag: "Proactive care", icon: "tierTwo", features: ["Everything in Essential", "Virtual care visits", "Virtual Hypertension Clinic", "At-home blood collection", "Annual preventive lab panel"], highlight: true },
  { id: "executive", title: "Executive", tag: "Everything, prioritised", icon: "tierThree", features: ["Everything in Plus", "Annual Executive Health assessment", "Imaging & stress testing as indicated", "Priority booking & same-week virtual visits", "Longevity Baseline with yearly re-test"], highlight: false },
];
export const MEMBERSHIP_COMPARE = ["NEYU health record", "Neyu AI companion", "Wearable sync", "Annual health review", "Virtual care visits", "Virtual Hypertension Clinic", "At-home blood collection", "Annual preventive labs", "Executive Health assessment", "Priority booking", "Longevity Baseline"];
export const memberHas = (tier: string, f: string) => {
  const idx = MEMBERSHIP_COMPARE.indexOf(f);
  return tier === "executive" ? true : tier === "plus" ? idx <= 7 : idx <= 3;
};

export const AT_HOME_TESTS = ["core-inflammation-aging", "hormone-health", "essential-vitamin-health", "gdf-15", "telomere-length-testing", "vitamin-d2-d3", "high-sensitive-crp-hs-crp", "cortisol"];
export { price as labPrice };
