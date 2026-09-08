// Structured content for the specialty pages that previously showed only a
// one-sentence "preview" card. Physician disciplines here must match the
// `disciplines` values in physicians.ts exactly, so the template can filter
// the real physician list rather than us hand-listing names (which would
// drift out of sync).

export interface SpecialtyContent {
  slug: string;
  label: string;
  icon: string; // lucide-react icon name
  partnerLine?: string; // shown under the eyebrow, e.g. "Partner: Nea Precision Nutrition"
  tagline: string;
  overview: string[]; // 1–2 paragraphs
  conditionsTreated: string[];
  whenToSee: string;
  referralNote?: string; // defaults to the standard referral paragraph if omitted
  physicianDisciplines?: string[]; // filters physicians.ts; omit/empty hides the Physicians tab
  physicianNote?: string; // shown above the physician list, e.g. "Care is coordinated with our cardiology team"
}

export const specialtyContent: Record<string, SpecialtyContent> = {
  "heart-failure-clinic": {
    slug: "heart-failure-clinic",
    label: "Heart Failure Clinic",
    icon: "HeartCrack",
    tagline: "Specialized, ongoing care for people living with heart failure.",
    overview: [
      "Our Heart Failure Clinic provides focused, ongoing management for patients diagnosed with heart failure — from initial evaluation through long-term monitoring. Care is led by our cardiology team, with a focus on medication optimization, symptom control, and keeping patients out of hospital.",
      "Patients are seen at regular intervals to track weight, symptoms, and medication response, with adjustments made proactively rather than only reacting to a crisis.",
    ],
    conditionsTreated: [
      "Heart failure with reduced ejection fraction (HFrEF)",
      "Heart failure with preserved ejection fraction (HFpEF)",
      "Post-heart-attack heart failure",
      "Medication optimization (ACE inhibitors, beta-blockers, diuretics, and newer heart failure therapies)",
      "Fluid and weight management",
      "Device follow-up coordination (pacemakers, ICDs) where applicable",
    ],
    whenToSee: "If you've been diagnosed with heart failure, are experiencing worsening shortness of breath, swelling in the legs or abdomen, unexplained weight gain, or fatigue that's affecting daily activities, a heart failure clinic evaluation is recommended.",
    physicianDisciplines: ["Cardiology"],
    physicianNote: "Heart Failure Clinic care is provided by our cardiology team.",
  },

  "internal-medicine": {
    slug: "internal-medicine",
    label: "Internal Medicine",
    icon: "Stethoscope",
    tagline: "Whole-person care for complex, chronic, and multi-system conditions.",
    overview: [
      "Internal medicine physicians manage the full picture of adult health — especially when multiple conditions interact, or when a diagnosis isn't yet clear. It's often the specialty that coordinates care across other specialists.",
      "Our internal medicine team handles everything from routine chronic disease management to complex diagnostic workups, working closely with cardiology, endocrinology, and other specialties under one roof.",
    ],
    conditionsTreated: [
      "Hypertension and cardiovascular risk management",
      "Diabetes and metabolic conditions",
      "Complex or undiagnosed symptoms",
      "Multi-system chronic disease management",
      "Pre-operative and perioperative medical assessment",
      "General adult internal medicine consultation",
    ],
    whenToSee: "Internal medicine is a good fit if you have multiple ongoing health conditions, symptoms that haven't been explained by a single diagnosis, or need a physician to help coordinate care across several specialists.",
    physicianDisciplines: ["Internal Medicine"],
  },

  "endocrinology": {
    slug: "endocrinology",
    label: "Endocrinology",
    icon: "Activity",
    tagline: "Diabetes, thyroid, and hormone-related conditions.",
    overview: [
      "Our endocrinology service manages hormone and metabolic conditions — from complex diabetes to thyroid and adrenal disorders — with a particular interest in young-onset type 2 diabetes and PCOS.",
      "Care draws on internationally trained expertise in endocrinology and metabolism, including prior leadership roles in endocrinology and neuroendocrinology in the UK health system.",
    ],
    conditionsTreated: [
      "Type 1 and type 2 diabetes",
      "Thyroid disorders (hypothyroidism, hyperthyroidism, nodules)",
      "PCOS (polycystic ovary syndrome)",
      "Adrenal and pituitary disorders",
      "Osteoporosis",
      "Obesity and metabolic syndrome",
    ],
    whenToSee: "If you have diabetes that's difficult to manage, an abnormal thyroid test, symptoms of a hormone imbalance, or a family physician has recommended specialist input on a metabolic condition, an endocrinology consultation is appropriate.",
    physicianDisciplines: ["Endocrinology"],
  },

  "geriatric-medicine": {
    slug: "geriatric-medicine",
    label: "Geriatric Medicine",
    icon: "Users",
    tagline: "Healthy aging, mobility, memory, and medication support for older adults.",
    overview: [
      "Geriatric medicine focuses on the health needs specific to older adults — where several conditions, medications, and life changes often intersect. The goal is to support independence, safety, and quality of life, not just treat individual diagnoses in isolation.",
      "We're currently building out a dedicated geriatric medicine program at ANRA Health. In the meantime, our internal medicine physicians provide care for many of the concerns below, with referral out to specialist geriatric services where needed.",
    ],
    conditionsTreated: [
      "Frailty and falls risk assessment",
      "Memory and cognitive concerns",
      "Medication review (polypharmacy)",
      "Mobility and functional decline",
      "Caregiver support and coordination",
      "Healthy aging and preventive care",
    ],
    whenToSee: "Consider a geriatric-focused consultation if you or a family member are managing multiple medications, have had a fall, are experiencing memory changes, or need help coordinating care across several conditions.",
    physicianDisciplines: ["Internal Medicine"],
    physicianNote: "Our dedicated geriatric medicine program is in development. In the meantime, these concerns are supported by our internal medicine physicians.",
  },

  "pediatric-rheumatology": {
    slug: "pediatric-rheumatology",
    label: "Pediatric Rheumatology",
    icon: "Baby",
    tagline: "Autoimmune and inflammatory joint conditions in children and youth.",
    overview: [
      "Pediatric rheumatology diagnoses and manages autoimmune and inflammatory conditions affecting children's joints, muscles, and connective tissue. Early, specialized care matters — many of these conditions respond best when treatment starts before lasting joint damage occurs.",
      "Our pediatric rheumatology care combines pediatric and rheumatology training, allowing conditions to be managed by a physician trained in both the disease process and the specific needs of younger patients.",
    ],
    conditionsTreated: [
      "Juvenile idiopathic arthritis",
      "Juvenile lupus and other connective tissue disease",
      "Autoimmune and inflammatory joint conditions",
      "Unexplained joint pain or swelling in children",
      "Growth or mobility concerns linked to inflammation",
    ],
    whenToSee: "If your child has persistent joint pain, swelling, stiffness (especially in the morning), or an autoimmune condition affecting their joints or connective tissue, a pediatric rheumatology consultation is recommended.",
    physicianDisciplines: ["Rheumatology", "Pediatrics"],
  },

  "nutrition": {
    slug: "nutrition",
    label: "Nutrition",
    icon: "Salad",
    partnerLine: "Partner: Nea Precision Nutrition",
    tagline: "Personalized nutrition coaching, built around your health goals.",
    overview: [
      "Good nutrition is one of the most effective, and most personal, levers in preventive health. In partnership with Nea Precision Nutrition, we offer nutrition coaching that's tailored to your specific goals, conditions, and lifestyle — not a generic meal plan.",
      "Many of our treatment programs, including select skin health packages, already fold in nutrition protocols prepared by Registered Dietitians. Standalone nutrition coaching is also available.",
    ],
    conditionsTreated: [
      "Weight management",
      "Diabetes-friendly and blood-sugar-conscious eating",
      "Heart-healthy nutrition",
      "General healthy eating and energy",
      "Nutrition support alongside dermatology and longevity programs",
    ],
    whenToSee: "If you'd like a nutrition plan built around your specific goals and any existing conditions, our Nutrition Starter Plan tool is a good place to begin — it takes a few minutes and gives you a draft plan instantly.",
    referralNote: "No physician referral is required for nutrition coaching — you can self-refer directly.",
  },

  "precision-medicine": {
    slug: "precision-medicine",
    label: "Precision Medicine",
    icon: "Sparkles",
    tagline: "Genomics, biomarkers, and AI — working together to personalize your care.",
    overview: [
      "Precision medicine means moving away from one-size-fits-all care toward treatment shaped by your own biology — your genetics, your biomarkers, and your lifestyle data, brought together with AI-assisted analysis to guide decisions.",
      "At ANRA Health, this shows up in two connected ways: genomic and biomarker testing through our partner lab BioAro Labs, and physicians who interpret those results as part of your broader care plan — not just a report you're left to make sense of alone.",
    ],
    conditionsTreated: [
      "Hereditary disease risk assessment",
      "Pharmacogenomics (how your genetics affect medication response)",
      "Biological aging and healthspan markers",
      "Microbiome analysis",
      "Vascular and inflammation biomarkers",
    ],
    whenToSee: "Precision medicine is worth exploring if you're curious about your genetic health risks, want to personalize medication choices, have a family history you'd like to understand better, or want a more data-driven view of your overall health.",
    referralNote: "Genomic and biomarker testing can be booked directly through BioAro Labs. Talk to our team first if you'd like guidance on which tests make sense for you.",
  },
};