// Real BioAro Labs catalog, pulled directly from bioarolabs.com's live shop.
// Single source of truth — used by the Genomics quiz, and now also by the
// Health Risk Assessment and Nutrition Starter Plan so those can surface
// relevant BioAro Labs tests too, not just Genomics.

export interface BioAroTest {
  name: string;
  desc: string;
  price: string;
  categorySlug: string;
  categoryLabel: string;
}

export const BIOARO_TESTS: BioAroTest[] = [
  { name: "Telomere Length Testing", desc: "Measures telomere length as a marker associated with cellular aging and biological age.", price: "$299.00", categorySlug: "biological-aging-healthspan-panels", categoryLabel: "Biological Aging & Healthspan" },
  { name: "Hormone Health", desc: "A core hormone panel evaluating key hormones related to balance, energy, and reproductive health.", price: "$499.00", categorySlug: "biological-aging-healthspan-panels", categoryLabel: "Biological Aging & Healthspan" },
  { name: "Ultra Hormone Health", desc: "A comprehensive hormone panel assessing hormone balance, adrenal function, and key reproductive hormones.", price: "$499.00", categorySlug: "biological-aging-healthspan-panels", categoryLabel: "Biological Aging & Healthspan" },
  { name: "Essential Vitamin Health", desc: "A combined assessment of vitamins D, E, A, and K for a broader view of fat-soluble vitamin status.", price: "$349.99", categorySlug: "biological-aging-healthspan-panels", categoryLabel: "Biological Aging & Healthspan" },
  { name: "Brain Health", desc: "Combines amyloid- and tau-related biomarkers to provide insight into Alzheimer's-related brain changes.", price: "$749.99", categorySlug: "biological-aging-healthspan-panels", categoryLabel: "Biological Aging & Healthspan" },
  { name: "Core Inflammation Aging", desc: "A focused panel assessing low-grade inflammation and immune regulation.", price: "$489.99", categorySlug: "biological-aging-healthspan-panels", categoryLabel: "Biological Aging & Healthspan" },
  { name: "Advanced Inflammation Aging", desc: "A deeper panel assessing inflammatory signaling, cellular stress, metabolic strain, and vascular-related patterns.", price: "$699.00", categorySlug: "biological-aging-healthspan-panels", categoryLabel: "Biological Aging & Healthspan" },
  { name: "Ultra Inflammation Aging", desc: "A broad panel assessing inflammation, cellular stress, vascular strain, tissue remodeling, kidney filtration, and immune health.", price: "$899.00", categorySlug: "biological-aging-healthspan-panels", categoryLabel: "Biological Aging & Healthspan" },

  { name: "Whole Genome Sequencing 100x", desc: "Deep 100x sequencing across the complete genome for a highly detailed view of inherited genetic variation.", price: "$1,499.00", categorySlug: "genome-sequencing", categoryLabel: "Genome Sequencing" },
  { name: "Whole Genome Sequencing 30x", desc: "Complete genome sequencing at 30x depth for broad insight into inherited genetic variation.", price: "$699.00", categorySlug: "genome-sequencing", categoryLabel: "Genome Sequencing" },
  { name: "Whole Exome Sequencing 100x", desc: "Best suited for rare disease and inherited-variant assessment.", price: "$499.00", categorySlug: "genome-sequencing", categoryLabel: "Genome Sequencing" },
  { name: "Disease-Based DNA Test", desc: "Targeted genetic analysis focused on variants associated with a specific disease, syndrome, or symptom. Prescription required.", price: "$499.00", categorySlug: "genome-sequencing", categoryLabel: "Genome Sequencing" },
  { name: "Pharmacogenomics Test", desc: "Genetic analysis focused on variations that can influence medication response, metabolism, and dosing. Prescription required.", price: "$499.00", categorySlug: "genome-sequencing", categoryLabel: "Genome Sequencing" },
  { name: "Comprehensive Cell-free DNA Analysis", desc: "Analysis of circulating tumor DNA and inherited variants to support cancer-related treatment decisions and monitoring. Prescription required.", price: "$1,700.00", categorySlug: "genome-sequencing", categoryLabel: "Genome Sequencing" },

  { name: "The BioGut Test", desc: "A stool-based microbiome test providing insight into digestive microbiome balance.", price: "$279.00", categorySlug: "microbiome", categoryLabel: "Microbiome" },
  { name: "The BioSkin Test", desc: "A skin microbiome test providing insight into microbial balance related to persistent skin concerns.", price: "$279.00", categorySlug: "microbiome", categoryLabel: "Microbiome" },
  { name: "The BioDental Test", desc: "An oral microbiome test providing insight into microbial balance related to gum and oral health.", price: "$279.00", categorySlug: "microbiome", categoryLabel: "Microbiome" },
  { name: "The BioFemme Test", desc: "A vaginal microbiome test assessing bacterial and fungal balance, including yeast-related changes.", price: "$279.00", categorySlug: "microbiome", categoryLabel: "Microbiome" },

  { name: "Resveratrol", desc: "Circulating free resveratrol primarily reflects recent dietary or supplement exposure.", price: "$120.00", categorySlug: "vitamin-nutritional-status", categoryLabel: "Vitamin & Nutritional Status" },
  { name: "Vitamin D, 25-Hydroxy (D2+D3)", desc: "The primary circulating marker used to evaluate vitamin D status.", price: "$115.00", categorySlug: "vitamin-nutritional-status", categoryLabel: "Vitamin & Nutritional Status" },
  { name: "Vitamin E (Alpha & Gamma Tocopherol)", desc: "Alpha- and gamma-tocopherol levels provide insight into vitamin E and antioxidant status.", price: "$115.00", categorySlug: "vitamin-nutritional-status", categoryLabel: "Vitamin & Nutritional Status" },
  { name: "Vitamin K1 (Phylloquinone)", desc: "Vitamin K1 status provides insight into a nutrient important for normal clotting and bone-related protein activity.", price: "$115.00", categorySlug: "vitamin-nutritional-status", categoryLabel: "Vitamin & Nutritional Status" },
  { name: "Vitamin A (Retinol)", desc: "Retinol provides insight into circulating vitamin A status.", price: "$115.00", categorySlug: "vitamin-nutritional-status", categoryLabel: "Vitamin & Nutritional Status" },

  { name: "PAI-1 Total (Plasminogen Activator Inhibitor-1)", desc: "Provides insight into fibrinolytic balance and metabolic-vascular health.", price: "$105.00", categorySlug: "vascular-organ-stress", categoryLabel: "Vascular & Organ Stress" },
  { name: "Cystatin C", desc: "A sensitive indicator of kidney filtration that supports kidney health assessment.", price: "$99.00", categorySlug: "vascular-organ-stress", categoryLabel: "Vascular & Organ Stress" },
  { name: "β2-Microglobulin (B2M)", desc: "Provides insight into immune activity, cellular turnover, and kidney health.", price: "$89.00", categorySlug: "vascular-organ-stress", categoryLabel: "Vascular & Organ Stress" },
  { name: "TIMP-1 (Tissue Inhibitor of Metalloproteinases-1)", desc: "Provides insight into tissue remodeling and extracellular matrix health.", price: "$105.00", categorySlug: "vascular-organ-stress", categoryLabel: "Vascular & Organ Stress" },
  { name: "GDF-15 (Growth Differentiation Factor 15)", desc: "Provides insight into cellular stress associated with mitochondrial, metabolic, and inflammatory strain.", price: "$130.00", categorySlug: "vascular-organ-stress", categoryLabel: "Vascular & Organ Stress" },
  { name: "hs-CRP (High-Sensitivity C-Reactive Protein)", desc: "A widely used marker of low-grade systemic inflammation linked to cardiovascular and metabolic health.", price: "$60.00", categorySlug: "vascular-organ-stress", categoryLabel: "Vascular & Organ Stress" },
];

export function bioaroBookingUrl(test: BioAroTest) {
  return `https://bioarolabs.com/shop?category=${test.categorySlug}`;
}