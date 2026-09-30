// ALBA's knowledge: everything NEYU and its partners publish, indexed for
// fast keyword retrieval. Each question only sends the most relevant pieces
// to the model (small prompt = fast first word), and the same index answers
// on its own when the AI is unavailable.

import { brand, locations, services, faqs, cardiacSymptoms, languages } from "@/data/content";
import { physicians } from "@/data/physicians";
import { specialtyContent } from "@/data/specialtyContent";
import { LAB_TESTS, WELLNESS, money } from "@/data/bioaroCatalog";
import { NEA, NEA_TREATMENTS, NEA_PACKAGES, NEA_FAQ } from "@/data/nea";
import { ARC, RESP_ITEMS, RESP_STEPS } from "@/data/respiratory";
import { PAPERS, PGX_DRUGS, PATHWAYS } from "@/data/longevityScience";

export interface Doc { id: string; title: string; text: string; href?: string; kind: string; words: Set<string> }

const STOP = new Set("a an the and or of to in on for with is are was be it i my me you your we our can do does what how when why who which this that at as by from about have has had not no yes should could would will there their them they its into than then so if any some more most very also just like get".split(" "));
// Plain words people use → the words our content uses.
const SYN: Record<string, string[]> = {
  cardiologist: ["cardiology", "cardiac", "heart"], cardiologists: ["cardiology", "cardiac"], endocrinologist: ["endocrinology"], geriatrician: ["geriatric"], rheumatologist: ["rheumatology"], dermatologist: ["skin", "nea"], pulmonologist: ["respiratory", "pulmonary"], respirologist: ["respiratory"], dietitian: ["nutrition"], internist: ["internal", "medicine"],
  heart: ["cardiac", "cardiology", "cardiovascular"], chest: ["cardiac", "angina"], palpitations: ["arrhythmia", "rhythm", "holter"],
  bp: ["blood", "pressure", "hypertension"], hypertension: ["pressure"], cholesterol: ["lipid", "ldl", "apob"], lipids: ["cholesterol"],
  sugar: ["glucose", "diabetes", "a1c"], diabetes: ["glucose", "endocrinology", "a1c", "insulin"], thyroid: ["endocrinology", "hormone", "tsh"],
  breathing: ["respiratory", "lung", "pulmonary", "breath"], breath: ["respiratory", "lung", "pulmonary"], lungs: ["respiratory", "pulmonary"],
  asthma: ["respiratory", "pulmonary", "lung"], copd: ["respiratory", "pulmonary", "lung"], snoring: ["sleep", "apnea", "nightlase"], sleep: ["apnea", "cpap", "melatonin", "sleepo"],
  dna: ["genomic", "genetic", "genome"], genes: ["genomic", "genetic"], genetic: ["genomic", "genome"], gut: ["microbiome", "digestive", "biogut"],
  skin: ["nea", "dermal", "laser", "acne"], wrinkles: ["lines", "neuromodulators"], botox: ["neuromodulators"], hair: ["prp", "alopecia"],
  weight: ["nutrition", "dietitian", "bmi", "obesity"], diet: ["nutrition", "dietitian"], food: ["nutrition"], vitamins: ["vitamin", "nutrient"],
  supplement: ["bioaro", "drugs", "wellness"], supplements: ["bioaro", "drugs", "wellness"], test: ["testing"], tests: ["testing"], blood: ["lab"],
  hormones: ["hormone", "endocrinology"], testosterone: ["hormone", "men"], menopause: ["hormone", "women", "feminine"], fertility: ["hormone", "women"],
  kids: ["pediatric", "child"], child: ["pediatric"], joints: ["joint", "arthritis", "rheumatology"], elderly: ["geriatric", "older"], memory: ["cognitive", "brain", "geriatric"],
  inflammation: ["crp", "inflammatory"], aging: ["longevity", "anti-aging", "biological"], longevity: ["aging", "healthspan"],
  appointment: ["book", "booking", "referral"], referral: ["refer", "referral"], price: ["cost", "$"], cost: ["price"], doctor: ["physician"], doctors: ["physician", "physicians"],
};

// "vitamin d" / "vitamin b12": keep the letter by joining it to "vitamin".
const tokens = (s: string) => s.toLowerCase().replace(/vitamin\s+([a-z]\d*)\b/g, "vitamin-$1").replace(/[^a-z0-9$+\- ]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));
const stem = (w: string) => w.replace(/(ies)$/, "y").replace(/(es|s)$/, "");
const wordSet = (s: string) => new Set(tokens(s).flatMap((w) => [w, stem(w)]));

function mk(id: string, kind: string, title: string, text: string, href?: string): Doc {
  return { id, kind, title, text: text.replace(/\s+/g, " ").trim(), href, words: wordSet(title + " " + title + " " + text) };
}

const CORE = `${brand.name} (formerly ANRA Health) — cardiology and internal medicine clinic in Calgary, Alberta, founded by Dr. Anmol Singh Kapoor. Hours: ${brand.hours}. Phone ${brand.phone}. Email ${brand.email}.
Locations: ${locations.map((l) => `${l.name}, ${l.address} (phone ${l.phone})`).join("; ")}.
Languages spoken: ${languages.join(", ")}.
Specialties: Cardiology, Heart Failure Clinic, Internal Medicine, Endocrinology, Geriatric Medicine, Pediatric Rheumatology, Precision Medicine; partners: Respiratory Medicine (Advanced Respiratory Care Network), Nutrition (Nea Precision Nutrition), Skin Health (Nea Precision Skin).
Partner companies: BioAro Labs (advanced lab, genomic and microbiome tests — ordered and paid on bioarolabs.com), BioAro Drugs (wellness supplements — bioarodrugs.com), Nea Precision Skin (medical aesthetics, Calgary NE). NEYU does not sell tests or products itself.
Most specialist visits need a referral from a family doctor or walk-in physician (Referral Centre on the site). My Health Space is the patient portal (trends, results, wearables, health profile).`;

let INDEX: Doc[] | null = null;
export function index(): Doc[] {
  if (INDEX) return INDEX;
  const d: Doc[] = [];
  d.push(mk("about", "About NEYU Health", "NEYU Health", `${brand.name} (formerly ANRA Health — same clinic, physicians and locations) is a cardiology and internal medicine clinic in Calgary, Alberta, founded by Dr. Anmol Singh Kapoor. Locations: ${locations.map((l) => `${l.name}, ${l.address}`).join("; ")}. Phone ${brand.phone}. Email ${brand.email}. Hours: ${brand.hours}.`, "/about"));
  locations.forEach((l, i) => d.push(mk("loc-" + i, "NEYU location", `${l.name} (clinic location)`, `${l.name}: ${l.address}. Phone ${l.phone}. Fax ${l.fax}.`, "/contact")));
  d.push(mk("referral", "NEYU page", "Referral Centre — how to get a referral", "Most NEYU specialist visits need a referral from your family practice or a walk-in clinic. They can send it to NEYU, or use the Referral Centre on the site, which can auto-fill a referral from a photo and create a referral letter PDF.", "/referral-centre"));
  RESP_ITEMS.forEach((it, i) => d.push(mk("resp-" + i, "Respiratory service (Advanced Respiratory Care Network)", it.name, `${it.desc} Offered through our partner Advanced Respiratory Care Network (${ARC.phone}).`, "/specialties/respiratory-medicine")));
  services.forEach((s) => d.push(mk("svc-" + s.slug, "NEYU service", s.name, `${s.short} ${s.long}`, "/specialties/cardiology")));
  Object.values(specialtyContent).forEach((s) => d.push(mk("spec-" + s.slug, "NEYU specialty", s.label, `${s.tagline} ${s.overview.join(" ")} Conditions: ${s.conditionsTreated.join(", ")}. When to see: ${s.whenToSee}`, "/specialties/" + s.slug)));
  d.push(mk("spec-cardiology", "NEYU specialty", "Cardiology", "Cardiology at NEYU: consultations, exercise stress echocardiography (Alberta's first onsite program), ECG, Holter monitoring, echocardiography, carotid ultrasound, myocardial perfusion imaging, ambulatory blood pressure monitoring. Chest pain, palpitations, high blood pressure, heart failure, arrhythmia.", "/specialties/cardiology"));
  d.push(mk("resp", "Partner specialty", "Respiratory Medicine (Advanced Respiratory Care Network)", `${ARC.about} ${ARC.promise} Services: ${RESP_ITEMS.map((i) => `${i.name} — ${i.desc}`).join(" ")} Steps: ${RESP_STEPS.map((s) => `${s.t}: ${s.d}`).join(" ")} Contact ${ARC.phone}, ${ARC.site}. ${ARC.area}`, "/specialties/respiratory-medicine"));
  cardiacSymptoms.forEach((s, i) => d.push(mk("sym-" + i, "Cardiac symptom", s.name, s.desc, "/cardiac-symptoms")));
  faqs.forEach((f, i) => d.push(mk("faq-" + i, "NEYU FAQ", f.q, f.a)));
  physicians.forEach((p) => d.push(mk("doc-" + p.slug, "NEYU physician", p.name, `${p.title}. Disciplines: ${p.disciplines.join(", ")}. Location: ${p.location}. Languages: ${p.languages.join(", ")}.`, "/physicians")));
  LAB_TESTS.forEach((t) => d.push(mk(t.id, "BioAro Labs test", t.name, `${t.cat} — ${money(t.price)}. ${t.why} Best for: ${t.bestFor}. Focus: ${t.areas.join(", ")}. ${t.meta}. Order at bioarolabs.com.`, t.url("CA"))));
  WELLNESS.forEach((t) => d.push(mk(t.id, "BioAro Drugs product", t.name, `${t.bestFor} (${t.cat}) — ${money(t.price)}. ${t.why} Sold in: ${t.regions.join(", ")}. A supplement, not a treatment.`, t.url("CA"))));
  NEA_TREATMENTS.forEach((t) => d.push(mk("nea-" + t.id, "Nea Precision Skin treatment", t.name, `${t.summary} ${t.details.join(" ")} ${t.facts.map(([k, v]) => `${k}: ${v}`).join("; ")}. Booked with Nea (free 15-minute consultation, prices not published).`, "/specialties/skin-health#" + t.id)));
  NEA_PACKAGES.forEach((p) => d.push(mk("neapk-" + p.id, "Nea package", p.name + " package", `${p.group} package at Nea: ${p.tiers.map((t) => (t.name ? t.name + ": " : "") + t.items.join(", ")).join(" | ")}.`, "/specialties/skin-health?tab=packages")));
  NEA_FAQ.forEach((f, i) => d.push(mk("neafaq-" + i, "Nea FAQ", f.q, f.a, "/specialties/skin-health?tab=visit")));
  d.push(mk("nea", "Partner clinic", "Nea Precision Skin", `${NEA.legal}, ${NEA.address}. ${NEA.hours}. Phone ${NEA.phone}. ${NEA.founder}. Medical aesthetics, Fotona laser, injectables, facials, body, hair and wellness.`, "/specialties/skin-health"));
  PAPERS.forEach((p) => d.push(mk("paper-" + p.id, "Longevity research (NEYU Longevity Lab)", p.title, `${p.authors}, ${p.journal} ${p.year}. ${p.design} Findings: ${p.findings.join(" ")} What it means: ${p.means} What it doesn't mean: ${p.notMeans} Paper: ${p.url}`, "/longevity-lab#" + p.feature[0])));
  d.push(mk("lab-pgx", "NEYU Longevity Lab", "Pharmacogenomics drug–gene pairs", `Well-established CPIC drug–gene pairs: ${PGX_DRUGS.map((x) => `${x.drug} (${x.cls}) — ${x.genes.join(" + ")}`).join("; ")}. Never stop or change a medicine because of a gene result; the prescriber decides. BioAro Pharmacogenomics test.`, "/longevity-lab#pgx"));
  d.push(mk("lab-genes", "NEYU Longevity Lab", "Longevity genetics pathways", `${PATHWAYS.map((x) => `${x.name}: ${x.text}`).join(" ")} Whole genome sequencing 30X is clinical-standard depth; 100X reads each position more times.`, "/longevity-lab#genes"));
  d.push(mk("lab", "NEYU page", "NEYU Longevity Lab", "Interactive research explainers at /longevity-lab: 1 Intervention Responsiveness Explorer, 2 GDF-15 + Telomere Cellular Stress Map, 3 Pace of Aging vs Biological Age, 4 Pharmacogenomics Longevity Safety Check, 5 Longevity Genetics Pathway Visualizer, plus a Research Library book and an AI intake. Each section recommends matching BioAro Labs tests. Book an NEYU longevity consultation to interpret results.", "/longevity-lab"));
  INDEX = d;
  return d;
}

/** Most relevant docs for a question (and the page the person is on). */
export function retrieve(question: string, page = "", k = 8): Doc[] {
  return scored(question, page, k).map((x) => x.d);
}
const GENERIC = new Set(["lab", "labs", "test", "testing", "tests", "clinic", "health", "care", "page", "service", "services", "centre", "medicine"]);
function scored(question: string, page: string, k: number): { d: Doc; s: number }[] {
  const q = tokens(question);
  const expanded = new Set<string>();
  q.forEach((w) => { expanded.add(w); expanded.add(stem(w)); (SYN[w] || SYN[stem(w)] || []).forEach((s) => { expanded.add(s); expanded.add(stem(s)); }); });
  const docs = index();
  const df = new Map<string, number>();
  expanded.forEach((w) => df.set(w, docs.filter((d) => d.words.has(w)).length));
  const lq = question.toLowerCase();
  const avgLen = docs.reduce((n, d) => n + d.words.size, 0) / docs.length;
  return docs
    .map((d) => {
      let s = 0;
      expanded.forEach((w) => { if (d.words.has(w)) s += Math.log(1 + docs.length / (1 + (df.get(w) || 0))); });
      s /= 0.6 + 0.4 * (d.words.size / avgLen); // long pages shouldn't win on sheer length
      if (lq.includes(d.title.toLowerCase())) s += 8;
      tokens(d.title).forEach((w) => { if (!GENERIC.has(w) && (expanded.has(w) || expanded.has(stem(w)))) s += 2.5; }); // title matches beat long pages
      if (page && d.href && page.startsWith(d.href.split(/[?#]/)[0]) && d.href !== "/") s += 1.5;
      return { d, s };
    })
    .filter((x) => x.s > 1.2)
    .sort((a, b) => b.s - a.s)
    .slice(0, k);
}

export function knowledgeFor(question: string, page = "") {
  const docs = retrieve(question, page);
  return { docs, text: `${CORE}\n\nRELEVANT REFERENCE:\n${docs.map((d) => `[${d.kind}] ${d.title}: ${d.text}`).join("\n").slice(0, 7000)}` };
}

export const ALBA_RULES = `You are ALBA, the AI health companion of NEYU Health in Calgary, Alberta.
You are medically educated. Explain conditions, symptoms, tests, lab values, risk factors, prevention, lifestyle and treatment options in clear, accurate, plain language, based on mainstream evidence (Canadian guidelines where relevant). You also know NEYU's specialties, physicians and locations, and our partners' catalogs: BioAro Labs tests, BioAro Drugs wellness products, Nea Precision Skin treatments and the Advanced Respiratory Care Network.
Rules:
1. Never diagnose the person or tell them what they have. Never prescribe, dose, or tell anyone to start, stop or change a medication. Supplements are not treatments.
2. If symptoms could be serious (chest pain, trouble breathing, fainting, stroke signs, severe bleeding or allergic reaction), tell them to call 911 now.
3. When relevant, point to the right NEYU specialty, test or partner service by its exact name; give prices or facts ONLY as written in the reference. Never invent physicians, prices, wait times or services.
4. Plain text only, no markdown or lists symbols. Keep it under 120 words unless they ask for more detail. End with one helpful next step when it fits.
5. For personal medical decisions, suggest discussing with their doctor or booking with NEYU.`;

/** Answer without the AI model, from the index alone. */
export function localAnswer(question: string, page = ""): { text: string; href?: string } {
  const hits = scored(question, page, 3);
  const docs = hits.filter((h) => h.s >= hits[0]?.s * 0.6).map((h) => h.d);
  if (!docs.length) return { text: `I can help with NEYU's specialties, tests, partners and general health questions. My AI is briefly unavailable, so for anything specific please call ${brand.phone} or use the Referral Centre.` };
  const top = docs[0];
  const also = docs.slice(1).map((d) => d.title).join(" and ");
  const t0 = top.text.startsWith(top.title) ? top.text.slice(top.title.length).replace(/^[\s:—-]+/, "") : top.text;
  const body = t0.length > 420 ? t0.slice(0, 420).replace(/\s\S*$/, "") + "…" : t0;
  return { text: `${top.title}: ${body}${also ? `\n\nRelated: ${also}.` : ""}`, href: top.href };
}
