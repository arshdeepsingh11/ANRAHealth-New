// Live BioAro catalogs, captured from bioarolabs.com/shop (44 tests) and
// bioarodrugs.com/us/shop (29 products), Sep 2026. Every item deep-links to
// its exact product page on the partner site — ANRA never sells or checks out.
//
// To update: edit the rows below. Prices are USD/CAD as listed by BioAro.

import { NEA, NEA_TREATMENTS } from "./nea";

export type Region = "CA" | "US" | "UK";
export type Vendor = "labs" | "drugs" | "nea";

export interface CatalogItem {
  id: string;
  vendor: Vendor;
  name: string;
  cat: string;        // shown on cards (badge / category)
  price: number;
  why: string;        // one-line purpose
  bestFor: string;    // "Best suited for" line
  facts: [string, string][]; // 3 label/value pairs for the detail sheet
  areas: string[];    // "Relevant to"
  meta: string;       // small line on gallery cards
  regions: Region[];
  url: (region: Region) => string;
}

export const VENDOR_NAME: Record<Vendor, string> = { labs: "BioAro Labs", drugs: "BioAro Drugs", nea: "Nea Precision Skin" };
export const VENDOR_COLOR: Record<Vendor, string> = { labs: "#6EA8B6", drugs: "#8C6FB8", nea: "#B9786A" };

/** Price label. 0 = price set at consultation (Nea treatments). */
export const money = (p: number) => (p === 0 ? "Free consult" : "$" + (p % 1 ? p.toFixed(2) : p.toLocaleString("en-CA")));

// ── BioAro Labs ───────────────────────────────────────────────────────────
// [slug, name, badge, focus areas, price, purpose, best suited for]
type LabRow = [string, string, string, string[], number, string, string];

const LAB_ROWS: LabRow[] = [
  ["genome-testing", "Whole Genome Sequencing 100X", "BioGenome", ["High-Depth Sequencing", "Genome-Wide Analysis"], 1499, "Deep 100× analysis of the complete genome.", "Comprehensive genetic and inherited-risk assessment."],
  ["whole-genome-sequencing-30x", "Whole Genome Sequencing 30X", "BioGenome", ["Genome-Wide Analysis", "Genetic Insights"], 699, "30× analysis of the complete genome.", "Broad genetic and inherited-risk insights."],
  ["whole-exome-sequencing-100x", "Whole Exome Sequencing 100X", "BioGenome", ["Inherited Conditions", "Protein-Coding DNA"], 499, "100× analysis of protein-coding DNA regions.", "Rare disease and inherited-variant assessment."],
  ["disease-based-dna-test", "Disease-Based DNA Test", "BioGenome", ["Inherited Conditions", "Targeted Genetics"], 499, "Targeted analysis for a specific health condition. Prescription required.", "Condition-specific genetic evaluation."],
  ["pharmacogenomics-test", "Pharmacogenomics Test", "BioGenome", ["Medication Response", "Drug-Gene Insights"], 499, "Genetic insight into medication response. Prescription required.", "Medication selection and dose optimization."],
  ["comprehensive-cell-free-dna-analysis", "Comprehensive Cell-free DNA Analysis", "BioGenome", ["Circulating DNA", "Molecular Profiling"], 1700, "Genetic analysis supporting cancer care and monitoring. Prescription required.", "Tumor profiling, treatment selection, or therapy monitoring."],
  ["tnf-alpha", "TNF-α (Tumor Necrosis Factor Alpha)", "BioAging", ["Immune Activation", "TNF Signaling"], 140, "Insight into immune and inflammatory activity.", "Inflammation and immune-response assessment."],
  ["gdf-15", "GDF-15 (Growth Differentiation Factor 15)", "BioAging", ["Cellular Stress", "Cardiometabolic Health"], 130, "Insight into cellular and metabolic stress.", "Cellular stress and metabolic health assessment."],
  ["il-6", "IL-6 (Interleukin-6)", "BioAging", ["Immune Activation", "Systemic Inflammation"], 140, "Insight into active inflammatory signaling.", "Assessing active inflammation and immune activity."],
  ["il-10", "IL-10 (Interleukin-10)", "BioAging", ["Immune Regulation", "Inflammatory Balance"], 105, "Insight into immune regulation and balance.", "Understanding inflammatory regulation and immune balance."],
  ["the-biogut-test", "BioGut", "BioGut", ["Digestive Health", "Gut Wellness"], 279, "Insight into gut microbiome balance.", "Digestive symptoms and gut microbiome assessment."],
  ["the-bioskin-test", "BioSkin", "BioSkin", ["Skin Health", "Microbial Balance"], 279, "Insight into skin microbiome balance.", "Persistent skin concerns, irritation, or skincare response."],
  ["the-biodental-test", "BioDental", "BioDental", ["Oral Health", "Gum Health"], 279, "Insight into oral microbiome balance.", "Gum concerns, bad breath, cavities, or recurring oral issues."],
  ["the-biofemme-test", "BioFemme", "BioFemme", ["Vaginal Health", "Women's Microbiome"], 279, "Insight into vaginal microbiome balance.", "Recurring yeast infections, BV, irritation, odor, or discharge."],
  ["telomere-length-testing", "Telomere Length Testing", "BioAging", ["Cellular Aging", "Longevity Science"], 299, "Measures a marker associated with cellular aging.", "Longevity and biological aging insights."],
  ["progesterone", "Progesterone", "BioHormone", ["Ovulation & Fertility", "Menstrual Health"], 150, "Measures progesterone levels related to reproductive health.", "Cycle, fertility, and hormone evaluation."],
  ["testosterone", "Total Testosterone", "BioHormone", ["Androgen Health"], 110, "Measures circulating testosterone levels.", "Understanding testosterone status and hormone balance."],
  ["cortisol", "Cortisol", "BioHormone", ["Stress Response", "Adrenal Health"], 129, "Measures cortisol related to stress response and hormone balance.", "Understanding cortisol balance and stress-related changes."],
  ["resveratrol", "Resveratrol", "BioNutrition", ["Healthy Aging", "Antioxidant Health"], 120, "Reflects recent resveratrol exposure.", "Dietary or supplementation monitoring."],
  ["vitamin-d2-d3", "Vitamin D, 25-Hydroxy (D2 + D3)", "BioNutrition", ["Bone Health", "Immune Health"], 115, "Key marker of vitamin D status.", "Low vitamin D, limited sun exposure, or supplementation monitoring."],
  ["vitamin-e-α-γ", "Vitamin E (Alpha & Gamma Tocopherol)", "BioNutrition", ["Antioxidant Status", "Nutrient Balance"], 115, "Insight into vitamin E and antioxidant status.", "Vitamin E status and supplementation monitoring."],
  ["high-sensitive-crp-hs-crp", "hs-CRP (High-Sensitivity C-Reactive Protein)", "BioAging", ["Heart Health", "Systemic Inflammation"], 60, "Insight into low-grade systemic inflammation.", "Inflammation and cardiovascular risk assessment."],
  ["interleukin-6-il-6", "sTNFR1 (Soluble TNF Receptors 1)", "BioAging", ["TNF Signaling", "Inflammatory Activity"], 105, "Insight into TNF-related inflammatory activity.", "Chronic inflammation and TNF-pathway assessment."],
  ["mcp-1-ccl2", "MCP-1 (CCL2)", "BioAging", ["Immune Signaling", "Metabolic Health"], 105, "Insight into immune-cell recruitment and inflammation.", "Inflammatory and immune activity assessment."],
  ["pai-1-total", "PAI-1 Total (Plasminogen Activator Inhibitor-1)", "BioVascular", ["Blood Clot Regulation", "Metabolic Health"], 105, "Insight into fibrinolytic and vascular balance.", "Metabolic and vascular health assessment."],
  ["cystatin-c", "Cystatin C", "BioVascular", ["Kidney Function"], 99, "Sensitive indicator of kidney filtration.", "Kidney function assessment."],
  ["β2-microglobulin-b2m", "β2-Microglobulin (B2M)", "BioVascular", ["Immune Activity", "Kidney Function"], 89, "Insight into immune and kidney health.", "Immune activity and kidney health assessment."],
  ["timp-1", "TIMP-1 (Tissue Inhibitor of Metalloproteinases-1)", "BioVascular", ["Tissue Remodeling", "Organ Stress"], 105, "Insight into tissue remodeling.", "Tissue remodeling and fibrosis assessment."],
  ["p-tau-217", "p-Tau217 (Phosphorylated Tau 217)", "BioBrain", ["Alzheimer's-Related Biomarker"], 430, "Insight into Alzheimer’s-related brain changes.", "Adults with cognitive symptoms undergoing medical evaluation."],
  ["beta-amyloid-40-42", "Beta-Amyloid 40/42 Ratio", "BioBrain", ["Alzheimer's-Related Biomarker"], 450, "Insight into amyloid-related brain changes.", "Memory concerns or medically guided cognitive evaluation."],
  ["shbg-sex-hormone-binding-globulin", "SHBG (Sex Hormone-Binding Globulin)", "BioHormone", ["Sex Hormone Availability", "Hormone Balance"], 79, "Measures a protein involved in hormone balance.", "Understanding hormone levels and interpretation."],
  ["dhea-s", "DHEA-S (Dehydroepiandrosterone Sulfate)", "BioHormone", ["Adrenal Health", "Androgen Balance"], 180, "Measures a hormone marker linked to adrenal activity.", "Understanding hormone changes over time."],
  ["androstenedione", "Androstenedione", "BioHormone", ["Androgen Balance", "Adrenal & Sex Hormones"], 105, "Measures a hormone precursor related to sex hormones.", "Assessing reproductive and hormone balance."],
  ["vitamin-k1", "Vitamin K1 (Phylloquinone)", "BioNutrition", ["Bone & Clotting Health", "Nutrient Status"], 115, "Insight into vitamin K1 status.", "Vitamin K status and supplementation monitoring."],
  ["vitamin-a-retinol", "Vitamin A (Retinol)", "BioNutrition", ["Antioxidant Nutrition"], 115, "Insight into vitamin A status.", "Vitamin A status and supplementation monitoring."],
  ["estradiol-e2", "Estradiol (E2)", "BioHormone", ["Estrogen Balance", "Fertility & Menopause"], 85, "Measures estrogen levels related to hormone health.", "Estrogen balance and reproductive health assessment."],
  ["dht-dihydrotestosterone", "DHT (Dihydrotestosterone)", "BioHormone", ["Androgen Health", "Testosterone Metabolism"], 95, "Measures a testosterone-related hormone.", "Assessing testosterone-related hormone changes."],
  ["hormone-health", "Hormone Health", "BioHormone", ["Adrenal & Sex Hormones", "Hormone Balance"], 499, "Core assessment of hormone balance and reproductive health.", "People looking to understand their hormone status and balance."],
  ["ultra-hormone-health", "Ultra Hormone Health", "BioHormone", ["Androgen & Estrogen Balance", "Adrenal & Reproductive Health"], 499, "Comprehensive assessment of hormone balance and adrenal function.", "People seeking a broader understanding of their hormone health."],
  ["essential-vitamin-health", "Essential Vitamin Health", "BioNutrition", ["Fat-Soluble Vitamins", "Nutrient Status"], 349.99, "A broader view of essential fat-soluble vitamin status.", "Vitamin status and supplementation monitoring."],
  ["brain-health", "Brain Health", "BioBrain", ["Alzheimer's-Related Biomarkers", "Memory & Cognition"], 749.99, "Amyloid and tau biomarker assessment for brain health.", "Memory or cognitive health evaluation."],
  ["core-inflammation-aging", "Core Inflammation Aging", "BioAging", ["Immune Signaling", "Cardiometabolic Health"], 489.99, "Focused assessment of inflammation and immune balance.", "Monitoring low-grade inflammation."],
  ["advanced-inflammation-aging", "Advanced Inflammation Aging", "BioAging", ["Immune & Cardiometabolic Health", "Cellular Stress"], 699.99, "Assessment of inflammation, cellular stress, and metabolic health.", "Inflammation and metabolic health insights."],
  ["ultra-inflammation-aging", "Ultra Inflammation Aging", "BioAging", ["Immune & Organ Health", "Kidney & Vascular Health"], 899, "Broad assessment of inflammation, cellular stress, and organ health.", "Overall inflammation and biological health insights."],
];

// Turnaround as published by BioAro Labs (default "2–3 weeks").
const LAB_TAT: Record<string, string> = {
  "genome-testing": "4–6 weeks", "whole-genome-sequencing-30x": "4–6 weeks", "whole-exome-sequencing-100x": "4–6 weeks",
  "pharmacogenomics-test": "4–6 weeks", "disease-based-dna-test": "4–6 weeks", "comprehensive-cell-free-dna-analysis": "2–3 weeks",
  "the-biogut-test": "2 weeks", "the-bioskin-test": "4 weeks", "the-biodental-test": "4 weeks", "the-biofemme-test": "4 weeks",
};

export const LAB_TESTS: CatalogItem[] = LAB_ROWS.map(([slug, name, badge, focus, price, why, bestFor]) => {
  const tat = LAB_TAT[slug] || "2–3 weeks";
  return {
    id: "labs-" + slug, vendor: "labs", name, cat: badge, price, why, bestFor,
    facts: [["Category", badge], ["Turnaround", tat], ["Focus", focus[0]]],
    areas: focus, meta: `${badge} · Results in ${tat}`,
    regions: ["CA", "US"],
    url: () => `https://bioarolabs.com/product/${encodeURI(slug)}`,
  };
});

// ── BioAro Drugs ──────────────────────────────────────────────────────────
// [slug, name, badge, category, serving, price, description, sold outside US]
type DrugRow = [string, string, string, string, string, number, string, boolean];

const DRUG_ROWS: DrugRow[] = [
  ["longevity-plus", "LONgevity+", "NAD + Booster", "Longevity", "Per 2 capsules", 150, "Cellular energy formula featuring NMN, Resveratrol, CoQ10, Curcumin, Vitamin D3, and Vitamin B12.", true],
  ["cellomega-plus", "CellOmega+", "Essential Omega Wellness", "Longevity", "Per 2 capsules", 99, "Targeted nutritional support for the heart, brain, and cellular function with omega-3s, antioxidants, and essential nutrients.", true],
  ["creagen-brain-boost", "Creagen Brain Boost", "Creatine + Magnesium + B12", "Focus", "Per 1 sachet", 50, "Performance support formula featuring Creatine Monohydrate, Magnesium Glycinate, and Vitamin B12.", true],
  ["creagen-femme-energy", "Creagen Femme Energy", "Women & Health; Energy Support", "Energy", "Per 1 sachet", 50, "Women-focused creatine support formula featuring Creatine Monohydrate, Ferrous Bisglycinate, and Vitamin B12.", true],
  ["creagen-raw-power", "Creagen Raw Power", "6g Creatine Monohydrate", "Performance", "Per 1 sachet", 50, "Creatine monohydrate formula designed to support strength, power, and athletic performance.", true],
  ["creagen-pro-power", "Creagen Pro Power", "Performance Blend", "Performance", "Per 1 sachet", 50, "Advanced performance formula featuring Creatine Monohydrate, Beta-Alanine, and essential electrolytes.", true],
  ["glutara", "Glutara", "Advanced Liposomal Delivery", "Daily Foundations", "Per 1 sachet", 50, "High-absorption antioxidant formula featuring Liposomal Glutathione, Vitamin C, Hyaluronic Acid, B vitamins, and Piperine.", true],
  ["sleepo", "SleepO", "Sleep Support", "Sleep & Calm", "1 Spray", 25, "Helps reset the body's sleep-wake cycle, promoting deeper, more restorative rest.", false],
  ["sleepo-kids", "SleepO Kids", "Kids Wellness", "Sleep & Calm", "1 Spray", 21, "A melatonin oral spray with age-appropriate dosing for children aged 3 and older.", false],
  ["energized-aminos", "AminoBoost", "Performance / Amino Energy", "Energy", "9g (1 Scoop)", 26.99, "A B-vitamin enriched amino acid formula designed to support natural energy metabolism, reduce fatigue, and promote recovery.", false],
  ["ultra-test", "AndroCore", "Men's Wellness", "Hormonal Health", "3 Capsules", 16.99, "A men's wellness formula featuring Tribulus, Longjack, Zinc, and Magnesium to support healthy testosterone levels within the normal range, male vitality, strength, and exercise performance.", false],
  ["biocollagen", "BioCollagen", "Daily Wellness / Collagen", "Longevity", "10g (Two Scoops)", 22.99, "Hydrolyzed bovine collagen peptides providing Type I and III collagen to support healthy skin, joints, tendons, and connective tissues.", false],
  ["digestive-enzyme", "BioDigest", "Digestive Wellness", "Daily Foundations", "1 Veggie Capsule", 17.99, "A broad-spectrum formula containing enzymes and probiotics to support efficient digestion of proteins, carbohydrates, and dairy products while promoting digestive comfort.", false],
  ["bioignite", "BioIgnite", "Performance / Pre-Workout", "Energy", "10g (1 Scoop)", 24.99, "A pre-workout formula containing electrolytes, B vitamins, amino acids, and performance ingredients to support energy, endurance, hydration, and focus.", false],
  ["bioprotein-pro", "BioProtein Pro", "Performance / Protein", "Performance", "29g (1 Scoop)", 36.99, "A premium whey protein isolate formulated to support muscle recovery, growth, and maintenance, with BCAAs and digestive enzymes for protein absorption.", false],
  ["vitamin-k2-d3", "BoneVital", "Bone & Mineral Wellness", "Daily Foundations", "1 Veggie Capsule", 13.99, "Combines Vitamins D3 and K2 with calcium and BioPerine to support calcium absorption, bone strength, cardiovascular health, and skeletal function.", false],
  ["joint-flex", "FlexMotion", "Mobility / Joint Support", "Recovery", "3 Capsules", 12.99, "Combines Glucosamine, Chondroitin, MSM, Boswellia, Turmeric, and other ingredients to help maintain joint comfort, cartilage integrity, flexibility, and mobility.", false],
  ["natural-pct", "Hormone Reset", "Men's Wellness / Post-Cycle Support", "Hormonal Health", "2 Capsules", 14.99, "A post-cycle support formula containing botanical blends to help maintain hormonal balance, support liver function, and promote overall recovery.", false],
  ["hydrareload", "HydraReload", "Performance / Hydration & Recovery", "Recovery", "One Scoop (27.3g)", 25.99, "A post-workout recovery formula designed to replenish energy stores, restore electrolytes, and support muscle recovery.", false],
  ["magbalance", "MagBalance", "Daily Wellness / Minerals", "Sleep & Calm", "3 Capsules", 18.99, "Magnesium glycinate, a highly bioavailable form of magnesium, formulated to support normal muscle and nerve function, relaxation, sleep quality, and recovery.", false],
  ["mens-vitalprime", "Men's VitalPrime", "Daily Wellness / Men", "Hormonal Health", "2 Capsules", 20.99, "A complete men's multivitamin delivering vitamins, minerals, antioxidants, and botanical blends to support energy, immunity, cardiovascular health, and overall wellness.", false],
  ["mindsync", "MindSync", "Cognitive Wellness", "Focus", "2 Capsules", 24.99, "A cognitive support formula combining vitamins, minerals, amino acids, and nootropic ingredients to support mental clarity, focus, memory, and sustained concentration.", false],
  ["musclerecover", "MuscleRecover", "Performance / Amino Recovery", "Recovery", "1 Scoop (7.7g)", 33.99, "BCAAs in a 2:1:1 ratio with L-Glutamine and Vitamin B6 to support muscle recovery and protein synthesis.", false],
  ["nitric-roots", "Nitric Roots", "Performance / Nitric Oxide Support", "Performance", "2 Veggie Capsules", 16.99, "Organic beetroot powder naturally rich in dietary nitrates that support nitric oxide production, healthy blood flow, and cardiovascular performance.", false],
  ["nitricflow", "NitricFlow", "Performance / Pre-Workout", "Performance", "One Scoop (12.5g)", 22.99, "A stimulant-enhanced pre-workout formulated to support blood flow, endurance, strength, focus, and hydration during training.", false],
  ["plantcore", "PlantCore", "Performance / Plant Protein", "Performance", "1 scoop (33.1g)", 39.99, "A plant-based protein blend formulated to support muscle maintenance and recovery using organic pea and rice proteins.", false],
  ["adrenal-support-plus", "StressAdapt", "Daily Wellness / Stress Support", "Sleep & Calm", "2 Capsules", 25.99, "An adaptogenic formula featuring Cordyceps, Rhodiola, and Eleuthero to support the body's response to stress, promote energy, and support recovery.", false],
  ["vitalgreens", "VitalGreens", "Daily Wellness / Greens", "Daily Foundations", "1 Scoop (11.4g)", 29.99, "A nutrient-dense superfood blend combining organic greens, antioxidant-rich fruits, and probiotics to support daily nutrition, digestive health, and immune function.", false],
  ["womens-vitalprime", "Women's VitalPrime", "Daily Wellness / Women", "Hormonal Health", "2 Capsules", 19.99, "A comprehensive women's multivitamin providing vitamins, minerals, antioxidants, and botanical blends to support energy, immunity, bone health, and overall wellness.", false],
];

const DRUG_PATH: Record<Region, string> = { CA: "ca", US: "us", UK: "uk" };

export const WELLNESS: CatalogItem[] = DRUG_ROWS.map(([slug, name, badge, cat, serving, price, desc, intl]) => {
  const regions: Region[] = intl ? ["CA", "US", "UK"] : ["US"];
  return {
    id: "drugs-" + slug, vendor: "drugs", name, cat, price, why: desc, bestFor: badge,
    facts: [["Category", cat], ["Serving", serving], ["Type", badge]],
    areas: [cat], meta: `${cat} · ${serving}`,
    regions,
    url: (r: Region) => `https://bioarodrugs.com/${DRUG_PATH[regions.includes(r) ? r : "US"]}/products/${slug}`,
  };
});

// Featured in the homepage gallery (10 each, cardiometabolic-first order).
const FEATURED_LABS = [
  "high-sensitive-crp-hs-crp", "core-inflammation-aging", "advanced-inflammation-aging", "pai-1-total", "gdf-15",
  "pharmacogenomics-test", "whole-genome-sequencing-30x", "telomere-length-testing", "vitamin-d2-d3", "brain-health",
];
const FEATURED_DRUGS = [
  "cellomega-plus", "longevity-plus", "vitamin-k2-d3", "nitric-roots", "magbalance",
  "creagen-brain-boost", "glutara", "mens-vitalprime", "womens-vitalprime", "adrenal-support-plus",
];

export const GALLERY_LABS = FEATURED_LABS.map((s) => LAB_TESTS.find((t) => t.id === "labs-" + s)!).filter(Boolean);
export const GALLERY_DRUGS = FEATURED_DRUGS.map((s) => WELLNESS.find((t) => t.id === "drugs-" + s)!).filter(Boolean);

// ── Nea Precision Skin (treatments; priced at consultation) ───────────────
export const NEA_ITEMS: CatalogItem[] = NEA_TREATMENTS.map((t) => ({
  id: "nea-" + t.id, vendor: "nea", name: t.name, cat: t.cat, price: 0, why: t.summary, bestFor: t.summary,
  facts: (t.facts.length >= 3 ? t.facts.slice(0, 3) : [...t.facts, ["Booking", "Free 15-min consult"] as [string, string], ["Clinic", "Calgary NE"] as [string, string]].slice(0, 3)),
  areas: t.concerns.slice(0, 3), meta: `${t.cat}${t.tech ? " · " + t.tech : ""}`,
  regions: ["CA", "US", "UK"],
  url: () => NEA.book,
}));
const FEATURED_NEA = ["facial", "cosmetic", "fillers", "hair", "muscle", "lines", "perfect", "facials", "snoring", "laser"];
export const GALLERY_NEA = FEATURED_NEA.map((s) => NEA_ITEMS.find((t) => t.id === "nea-" + s)!).filter(Boolean);

export const ALL_CATALOG: CatalogItem[] = [...LAB_TESTS, ...WELLNESS, ...NEA_ITEMS];
export const findCatalogItem = (id: string) => ALL_CATALOG.find((t) => t.id === id);
