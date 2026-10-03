// NEYU Longevity Lab — the research behind the five science features.
// Every number here was checked against the paper (Sep 2026). Where a paper
// could not be read in full, only its title/design is used, never numbers.

export interface Paper {
  id: string; short: string; title: string; authors: string; journal: string; year: number; url: string;
  design: string; findings: string[]; means: string; notMeans: string; feature: FeatureId[];
}
export type FeatureId = "respond" | "stress" | "pace" | "pgx" | "genes";

export const PAPERS: Paper[] = [
  {
    id: "sehgal2026", short: "Nature Medicine 2026",
    title: "Responsiveness of epigenetic aging biomarkers to longevity interventions in humans",
    authors: "Sehgal R, Borrus D, … Higgins-Chen A", journal: "Nature Medicine", year: 2026, url: "https://www.nature.com/articles/s41591-026-04562-9",
    design: "TranslAGE: a harmonized database of 51 longitudinal intervention studies (3,128 blood samples), testing 16 epigenetic clocks plus 94 other DNA-methylation biomarkers.",
    findings: [
      "19 interventions significantly lowered epigenetic age across the 16 clocks (13 after multiple-testing correction).",
      "DunedinPACE went down in 16 interventions and up in only 1; PCGrimAge showed the strongest statistical signal.",
      "Newer (generation 2+) clocks — DunedinPACE, PCGrimAge, GrimAgeV2, SystemsAge, PCPhenoAge — responded consistently; first-generation clocks (Horvath, Hannum) only sporadically.",
      "Drug interventions had larger average effects (mean −0.093) than lifestyle interventions (mean −0.039); diet interventions were the most consistent.",
      "Strong responders included anti-TNF therapy, metformin, two Mediterranean-style diets, smoking cessation and hyperbaric oxygen; supplements were weaker on average.",
      "People with disease often showed larger changes; DunedinPACE responded similarly in healthy and disease groups.",
    ],
    means: "Some biological-aging measures can move within months of a change — and the better-built clocks move most reliably.",
    notMeans: "It does not prove these changes add years of healthy life yet: long-term outcome validation and a ‘clinically important’ change are still undefined.",
    feature: ["respond", "pace"],
  },
  {
    id: "belsky2022", short: "eLife 2022 · DunedinPACE",
    title: "DunedinPACE, a DNA methylation biomarker of the pace of aging",
    authors: "Belsky DW, Caspi A, Corcoran DL, … Moffitt TE", journal: "eLife", year: 2022, url: "https://elifesciences.org/articles/73420",
    design: "Built from 1,037 Dunedin Study members followed from age 26 to 45 with 19 biomarkers across 7 organ systems; validated in Understanding Society, the VA Normative Aging Study, Framingham Offspring and the E-Risk twin study.",
    findings: [
      "Pace of aging varied widely: from 0.40 to 2.44 biological years per calendar year among people born the same year.",
      "Very reliable on repeat testing (test–retest ICC 0.96–0.97 on the same array).",
      "Faster DunedinPACE predicted death (Framingham HR 1.65 per SD), heart disease (HR 1.39), stroke/TIA (HR 1.37) and disability over 14 years.",
      "Young people exposed to childhood poverty or victimization already showed faster pace by age 18.",
    ],
    means: "How fast you are aging now is a different — and often more actionable — question than how old your body looks.",
    notMeans: "Development cohorts were mostly of white European descent; the authors call for validation in more diverse groups and for proof it changes with intervention.",
    feature: ["pace"],
  },
  {
    id: "yu2025", short: "J Nutr Health Aging 2025",
    title: "Serum Growth Differentiation Factor 15 is Negatively Associated with Leukocyte Telomere Length",
    authors: "Yu J, Liu Y, Zhang H, Ping F, Li W, Xu L, Li Y", journal: "The Journal of Nutrition, Health & Aging", year: 2025, url: "https://pubmed.ncbi.nlm.nih.gov/39904253",
    design: "802 adults (mean age 55) from a community cohort in Beijing; GDF-15 measured in serum and telomere length in white blood cells by qPCR.",
    findings: [
      "Higher GDF-15 went with shorter telomeres after adjusting for age, sex, BMI, waist, blood pressure, lipids, uric acid and HbA1c (β −0.120, p = 0.003).",
      "The relationship was linear, and stronger in women, people with overweight and people with abnormal glucose tolerance.",
    ],
    means: "Two different windows on cellular aging — a stress signal and chromosome caps — tend to move together.",
    notMeans: "It is cross-sectional: it shows an association, not that GDF-15 shortens telomeres or vice versa.",
    feature: ["stress"],
  },
  {
    id: "lee2026", short: "Ageing Research Reviews 2026",
    title: "Growth differentiation factor-15 as a clinical biomarker of frailty, sarcopenia and functional decline: A systematic literature review",
    authors: "Lee ARYB, Vidhya SN, … Merchant RA", journal: "Ageing Research Reviews", year: 2026, url: "https://pubmed.ncbi.nlm.nih.gov/41785972",
    design: "Systematic review of 35 studies, mostly in adults 65+ in the community, hospital and chronic-disease settings.",
    findings: [
      "Higher GDF-15 was consistently linked to weaker physical performance and more severe frailty, and predicted future functional decline in longitudinal studies.",
      "Links with slower walking speed were reported across populations; links with sarcopenia and grip strength were less consistent.",
      "Physical activity alone changed GDF-15 only minimally in the few intervention studies.",
    ],
    means: "GDF-15 is emerging as a practical blood marker of physiological reserve — useful alongside how you actually function.",
    notMeans: "Assays and definitions varied, causal pathways are unclear, and more interventional studies are needed before routine use.",
    feature: ["stress"],
  },
  {
    id: "ying2024", short: "Nature Communications 2024",
    title: "Depletion of loss-of-function germline mutations in centenarians reveals longevity genes",
    authors: "Ying K, Castro JP, … Barzilai N, Gladyshev VN", journal: "Nature Communications", year: 2024, url: "https://www.nature.com/articles/s41467-024-52967-2",
    design: "Whole-exome sequencing of 338 centenarians, 917 of their offspring and 595 controls (Ashkenazi Jewish Longevity Genes Project and LonGenity), with validation in UK Biobank.",
    findings: [
      "Centenarians carried 11–22% fewer rare loss-of-function variants than controls; their offspring showed a similar pattern.",
      "35 genes stood out (14 replicated in UK Biobank), including RGP1, PCNX2 and ANO9.",
      "Enriched pathways: G-protein-coupled receptor signalling, hyaluronan metabolism, post-translational protein modification and mitochondrial translation.",
    ],
    means: "Exceptional longevity may partly reflect a ‘quieter’ genome — fewer damaging variants — rather than one magic gene.",
    notMeans: "One ancestry group, predicted (not measured) variant effects and parental-lifespan validation: it can’t predict any individual’s lifespan.",
    feature: ["genes"],
  },
  {
    id: "bousman2025", short: "Clin Pharmacol Ther 2025",
    title: "Prevalence of Actionable Pharmacogenetic Genotype Frequencies, Cautionary Medication Use, and Polypharmacy in Community-Dwelling Older Adults",
    authors: "Bousman CA, et al.", journal: "Clinical Pharmacology & Therapeutics", year: 2025, url: "https://doi.org/10.1002/cpt.3702",
    design: "Genotyping of community-dwelling older adults (ASPREE study) for pharmacogenes with prescribing guidelines, linked to their medication use and polypharmacy.",
    findings: [
      "Actionable pharmacogenetic genotypes — gene variants with published prescribing guidance — were common among these older adults.",
      "The study also measured how often participants were taking ‘cautionary’ medications whose guidance depends on those genes, and how often this overlapped with polypharmacy.",
    ],
    means: "For people on — or likely to start — several medications, knowing your drug-gene profile early is a safety tool.",
    notMeans: "A result is never a reason to stop or change a medicine on your own; your prescriber interprets it with your full history. (Exact percentages: see the paper.)",
    feature: ["pgx"],
  },
];

export const LAB_STATS = [
  { v: 51, s: "", l: "intervention studies pooled in the 2026 Nature Medicine analysis", src: "sehgal2026" },
  { v: 2.44, s: "", l: "fastest pace of aging seen in the Dunedin cohort — biological years per calendar year", src: "belsky2022", d: 2 },
  { v: 802, s: "", l: "adults in whom higher GDF-15 tracked with shorter telomeres", src: "yu2025" },
  { v: 22, s: "%", l: "fewer rare loss-of-function variants in centenarians (11–22%)", src: "ying2024", p: "up to " },
];

// ── Feature 1: interventions reported as significantly lowering clocks ──
export const INTERVENTIONS = [
  { name: "Mediterranean-style diet", type: "Lifestyle", icon: "ph-bowl-food", note: "Two Mediterranean-style diets were among the strongest responders; diet interventions were the most consistent category." },
  { name: "Stopping smoking", type: "Lifestyle", icon: "ph-cigarette-slash", note: "Smoking cessation was among the interventions with strong effects on newer clocks." },
  { name: "Metformin", type: "Medication", icon: "ph-pill", note: "Listed among strong responders in trial data. A prescription decision for your doctor — not a longevity supplement." },
  { name: "Anti-TNF therapy", type: "Medication", icon: "ph-syringe", note: "Strong effects in people with arthritis or inflammatory bowel disease — consistent with inflammation driving aging biology." },
  { name: "Hyperbaric oxygen", type: "Procedure", icon: "ph-wind", note: "Reported among strong responders; a specialised medical procedure." },
  { name: "Supplements (average)", type: "Supplement", icon: "ph-flask", note: "On average, supplements showed weaker effects than diet, lifestyle or medications." },
];
export const EFFECT_BY_TYPE = [{ l: "Medications", v: 0.093 }, { l: "Lifestyle", v: 0.039 }];
export const EFFECT_BY_CLOCK = [
  { l: "DunedinPACE", v: 0.0891, p: "P = 0.0012" }, { l: "PCPhenoAge", v: 0.0888, p: "P = 0.003" },
  { l: "PCGrimAge", v: 0.0784, p: "P = 0.0003" }, { l: "SystemsAge", v: 0.0586, p: "P = 0.0043" },
];

// ── Feature 3: DunedinPACE outcomes (Framingham Offspring, 14 y) ─────────
export const PACE_OUTCOMES = [
  { l: "Death", hr: 1.65 }, { l: "Disability (Nagi ADL)", hr: 1.4 }, { l: "Heart disease", hr: 1.39 }, { l: "Stroke / TIA", hr: 1.37 },
];

// ── Feature 4: well-established drug–gene pairs (CPIC guidelines) ────────
export const PGX_DRUGS: { drug: string; cls: string; genes: string[] }[] = [
  { drug: "Clopidogrel", cls: "Blood thinner (antiplatelet)", genes: ["CYP2C19"] },
  { drug: "Warfarin", cls: "Blood thinner", genes: ["CYP2C9", "VKORC1"] },
  { drug: "Simvastatin / other statins", cls: "Cholesterol", genes: ["SLCO1B1"] },
  { drug: "Citalopram / escitalopram / sertraline", cls: "Antidepressant (SSRI)", genes: ["CYP2C19"] },
  { drug: "Amitriptyline / nortriptyline", cls: "Antidepressant / nerve pain", genes: ["CYP2D6", "CYP2C19"] },
  { drug: "Codeine / tramadol", cls: "Pain relief (opioid)", genes: ["CYP2D6"] },
  { drug: "Omeprazole / pantoprazole", cls: "Stomach acid (PPI)", genes: ["CYP2C19"] },
  { drug: "Ibuprofen / celecoxib / meloxicam", cls: "Anti-inflammatory (NSAID)", genes: ["CYP2C9"] },
  { drug: "Ondansetron", cls: "Anti-nausea", genes: ["CYP2D6"] },
  { drug: "Tamoxifen", cls: "Breast cancer therapy", genes: ["CYP2D6"] },
];

// ── Feature 5: longevity pathways ────────────────────────────────────────
export const PATHWAYS = [
  { id: "gpcr", name: "Cell signalling (GPCRs)", color: "#2A78D6", src: "Ying 2024", text: "Class A G-protein-coupled receptors — the cell’s antennae for hormones and signals — were enriched among longevity-linked genes in centenarians." },
  { id: "matrix", name: "Tissue matrix (hyaluronan)", color: "#1BAF7A", src: "Ying 2024", text: "Hyaluronan metabolism keeps tissues hydrated and resilient; this pathway was enriched in the centenarian study." },
  { id: "protein", name: "Protein maintenance", color: "#E0A100", src: "Ying 2024", text: "Post-translational protein modification — how cells tune and repair proteins — was another enriched pathway." },
  { id: "mito", name: "Mitochondrial translation", color: "#C2477E", src: "Ying 2024", text: "Genes that build the proteins of mitochondria, the cell’s power plants, featured among longevity-linked pathways." },
  { id: "burden", name: "Low damaging-variant burden", color: "#1D5FA8", src: "Ying 2024", text: "Beyond single pathways, centenarians carried 11–22% fewer rare loss-of-function variants overall — a ‘quieter’ genome." },
];

// ── Tests to recommend (BioAro Labs slugs) ───────────────────────────────
export const FEATURE_TESTS: Record<FeatureId, string[]> = {
  respond: ["core-inflammation-aging", "advanced-inflammation-aging", "gdf-15", "telomere-length-testing"],
  stress: ["gdf-15", "telomere-length-testing"],
  pace: ["advanced-inflammation-aging", "gdf-15", "telomere-length-testing"],
  pgx: ["pharmacogenomics-test"],
  genes: ["whole-genome-sequencing-30x", "genome-testing"],
};
export const CONSULT_HREF = "/contact?topic=longevity";
