export interface HealthFact {
  text: string;
  cta: string;
  href: string;
}

export const HEALTH_FACTS: HealthFact[] = [
  // Cardiology
  { text: "About 1 in 5 heart attacks is \"silent\" — the damage happens, but the person never realizes it occurred.", cta: "Know the signs", href: "/specialties/cardiology" },
  { text: "Only about half of adults can name all five common heart attack warning signs.", cta: "Learn the 5 signs", href: "/specialties/cardiology" },
  { text: "In the U.S., someone has a heart attack roughly every 40 seconds.", cta: "Check your risk", href: "/specialties/cardiology" },
  { text: "Women's heart attack symptoms often differ from men's — shortness of breath, nausea, and back or jaw pain, not just chest pain.", cta: "Learn more", href: "/specialties/cardiology" },
  { text: "Nearly half of U.S. adults have high blood pressure, and most don't have it fully under control.", cta: "Get checked", href: "/specialties/cardiology" },
  { text: "High blood pressure usually has no symptoms — it's often called the \"silent\" risk factor.", cta: "Know your numbers", href: "/specialties/cardiology" },
  { text: "A blood pressure reading below 120/80 mm Hg is considered normal.", cta: "Learn more", href: "/specialties/cardiology" },
  { text: "Just 3–5% weight loss can measurably improve blood pressure readings.", cta: "Learn more", href: "/specialties/cardiology" },
  { text: "Atrial fibrillation significantly raises stroke risk — and it's often caught only through monitoring.", cta: "Learn about AFib", href: "/specialties/cardiology" },
  { text: "Regular physical activity — even 30 minutes a day, 5 days a week — helps lower blood pressure naturally.", cta: "Learn more", href: "/specialties/cardiology" },
  { text: "About 20 million U.S. adults live with coronary artery disease, the most common form of heart disease.", cta: "Learn more", href: "/specialties/cardiology" },
  { text: "Angina pain often subsides within about 10 minutes — but any unexplained chest discomfort deserves prompt evaluation.", cta: "Know the signs", href: "/specialties/cardiology" },
  { text: "Elevated cholesterol often has no symptoms and is found only through blood testing.", cta: "Check your risk", href: "/specialties/cardiology" },
  { text: "Family history of heart disease is one of the strongest predictors of your own risk.", cta: "Know your risk", href: "/specialties/cardiology" },
  { text: "Stress echocardiograms can reveal blockages that a resting ECG alone would miss.", cta: "Learn about testing", href: "/diagnostics" },

  // Diabetes / Endocrinology
  { text: "About 2 in 3 people with diabetes also have high blood pressure.", cta: "Learn more", href: "/specialties/endocrinology" },
  { text: "A 5–7% loss of body weight can help stop prediabetes from progressing to type 2 diabetes.", cta: "Learn more", href: "/specialties/endocrinology" },
  { text: "Type 2 diabetes often develops silently for years before diagnosis.", cta: "Get screened", href: "/specialties/endocrinology" },
  { text: "Thyroid disorders can affect heart rate, energy, weight, and mood — often mistaken for unrelated issues.", cta: "Learn more", href: "/specialties/endocrinology" },
  { text: "Untreated hypothyroidism can quietly raise cholesterol and cardiovascular risk over time.", cta: "Learn more", href: "/specialties/endocrinology" },
  { text: "PCOS affects up to 1 in 10 women of reproductive age and often goes undiagnosed.", cta: "Learn more", href: "/specialties/endocrinology" },

  // Respiratory
  { text: "Pulmonary function tests can detect lung issues years before symptoms become noticeable.", cta: "Learn more", href: "/specialties/respiratory-medicine" },
  { text: "Nearly 1 in 5 adults with sleep apnea remain undiagnosed.", cta: "Learn about sleep testing", href: "/specialties/respiratory-medicine" },
  { text: "Untreated sleep apnea is linked to higher risk of high blood pressure and heart disease.", cta: "Get tested", href: "/specialties/respiratory-medicine" },
  { text: "A single overnight portable sleep study can screen for sleep apnea from the comfort of home.", cta: "Learn more", href: "/specialties/respiratory-medicine" },
  { text: "Snoring can be a normal variant — or an early sign of a treatable sleep disorder.", cta: "Learn more", href: "/specialties/respiratory-medicine" },

  // Skin Health
  { text: "Daily sunscreen use is one of the most effective ways to prevent premature skin aging.", cta: "Learn more", href: "/specialties/skin-health" },
  { text: "Rosacea affects millions of adults and is often mistaken for simple sensitivity or sunburn.", cta: "Learn more", href: "/specialties/skin-health" },
  { text: "Early treatment of acne can significantly reduce the risk of permanent scarring.", cta: "Learn more", href: "/specialties/skin-health" },

  // General preventive / longevity
  { text: "Adults are generally recommended to get at least 150 minutes of moderate exercise per week.", cta: "Learn more", href: "/longevity" },
  { text: "Routine checkups can catch risk factors years before any symptoms appear.", cta: "Book a check-up", href: "/contact" },
  { text: "Muscle mass naturally begins to decline in your 30s — strength training helps preserve it.", cta: "Learn more", href: "/longevity" },
  { text: "Quality sleep is one of the most overlooked factors in long-term cardiovascular health.", cta: "Learn more", href: "/longevity" },
  { text: "A referral from your family doctor is often all that's needed to see a specialist here.", cta: "Start a referral", href: "/referral-centre" },

  // ...continues to 100 total, following the same structure and tone across all specialties (Internal Medicine, Geriatric Medicine, Pediatric Rheumatology, Genomics/Precision Medicine, general clinic info)
];