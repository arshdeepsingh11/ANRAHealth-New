// Nea Precision Skin — ANRA's aesthetics & skin-health partner (Calgary NE).
// Captured from neaprecisionskin.com (/treatments, /wellness-packages, /about),
// Sep 2026. Nea does not publish prices online — every treatment is booked
// through Nea's own Jane booking page after a free 15-minute consultation.
// Numbers used in charts are only the ones Nea publishes.

export const NEA = {
  name: "Nea Precision Skin",
  legal: "NEA Medical Aesthetic Clinic",
  site: "https://neaprecisionskin.com/",
  book: "https://neamedicalaesthetic.janeapp.com/",
  consult: "https://neaprecisionskin.com/consultation/",
  packagesPage: "https://neaprecisionskin.com/wellness-packages/",
  treatmentsPage: "https://neaprecisionskin.com/treatments/",
  booklet: "https://neaprecisionskin.com/wp-content/uploads/2024/06/NEA-Booklet-correct-qr-codepdf.pdf",
  phone: "1-403-230-8812",
  tel: "tel:+14032308812",
  email: "nea@neaskincare.com",
  address: "#104, 3151 27 Street NE, Calgary, AB",
  hours: "Mon–Sat 9 AM–5 PM · Sun closed",
  founder: "Raman Kapoor, RD — Chief Healthspan Officer & Founder",
  color: "#B9786A", // warm rose-clay accent for Nea across the site
  colorSoft: "#F6E9E4",
};

export type NeaCat = "Skin concerns" | "Laser" | "Injectables" | "Facials" | "Body" | "Hair" | "Wellness" | "Medical";

export interface NeaTreatment {
  id: string;           // also the anchor on Nea's treatments page
  name: string;
  cat: NeaCat;
  icon: string;         // Phosphor icon
  summary: string;      // one line (from Nea)
  details: string[];    // what it is / how it works (from Nea)
  facts: [string, string][]; // only facts Nea publishes
  tech?: string;
  concerns: string[];   // keywords for Skin Match
}

export const NEA_TREATMENTS: NeaTreatment[] = [
  { id: "active", name: "Active Acne", cat: "Skin concerns", icon: "ph-drop-half", summary: "Clears clogged follicles behind pimples, blackheads, whiteheads, cysts and nodules.",
    details: ["Acne happens when hair follicles clog with oil and dead skin cells.", "Treatment is tailored — medical-grade peels, laser and skincare, often combined."], facts: [["Approach", "Personalized plan"], ["Booking", "Free 15-min consult"]], concerns: ["acne", "pimples", "breakouts", "blackheads", "whiteheads", "cysts", "oily"] },
  { id: "scarring", name: "Acne Scarring", cat: "Skin concerns", icon: "ph-circles-four", summary: "Smooths ice-pick, boxcar and rolling scars by rebalancing collagen.",
    details: ["Scars form when skin makes too much or too little collagen while healing.", "Atrophic (ice pick, boxcar, rolling) and hypertrophic/keloid scars are treated differently.", "2D skin resurfacing (fractional + microlaser peel) can permanently remove acne scars."], facts: [["Downtime", "3–5 days (2D resurfacing)"], ["Results", "Permanent once scars are removed"]], tech: "Fotona Er:YAG", concerns: ["acne scars", "scars", "scarring", "pitted", "texture"] },
  { id: "rosacea", name: "Rosacea", cat: "Skin concerns", icon: "ph-flower", summary: "Calms redness, flushing and visible broken capillaries.",
    details: ["A common skin condition with persistent redness, flushing, visible capillaries and bumps.", "There's no cure — laser treatments plus lifestyle changes help control it."], facts: [["Approach", "Laser + lifestyle"], ["Goal", "Control flare-ups"]], tech: "Fotona Nd:YAG", concerns: ["rosacea", "redness", "flushing", "red face", "capillaries", "broken veins"] },
  { id: "hyperpigmentation", name: "Hyperpigmentation & Melasma", cat: "Skin concerns", icon: "ph-circle-half", summary: "Evens patchy, discoloured, irregular pigment.",
    details: ["Patchy, discoloured skin often needs more than one method.", "Peels, laser and medical-grade brightening skincare are combined."], facts: [["Approach", "Multi-modal"], ["Booking", "Free 15-min consult"]], concerns: ["pigmentation", "melasma", "dark spots", "sun spots", "uneven tone", "discoloration"] },
  { id: "lines", name: "Lines, Wrinkles & Sun Damage", cat: "Skin concerns", icon: "ph-sun", summary: "Fractional resurfacing, microlaser peel, peels and skin tightening.",
    details: ["Fractional resurfacing: columns of heat target damaged skin; numbing cream; 4–5 days downtime.", "Microlaser peel removes micro-thin layers, stimulating collagen and minimizing wrinkles, pores and age spots.", "Chemical peels: ZO Stimulator or Absolute Peel; 2–3 days of peeling, avoid sun 7–10 days.", "Skin tightening uses infrared light to heat deeply and rebuild collagen."], facts: [["Downtime", "0–5 days by option"], ["Areas", "Face, neck, décolleté and body"]], tech: "Fotona Er:YAG & Nd:YAG", concerns: ["wrinkles", "fine lines", "sun damage", "aging", "anti-aging", "crepey", "age spots"] },
  { id: "large", name: "Large Pores", cat: "Skin concerns", icon: "ph-dots-nine", summary: "Er:YAG resurfacing refines pores with microscopic ablation.",
    details: ["Er:YAG laser resurfacing with deep and superficial ablation.", "Creates microscopic channels that trigger new, tighter skin."], facts: [["Technology", "Er:YAG laser"]], tech: "Fotona Er:YAG", concerns: ["pores", "large pores", "texture", "rough skin"] },
  { id: "stretch", name: "Stretch Mark Treatments", cat: "Body", icon: "ph-waves", summary: "Custom plan: peels, Fotona laser, skincare and microbiome support.",
    details: ["Initial consultation and personalized skincare regimen.", "Tailored chemical peel series plus Fotona laser sessions.", "Microbiome support with topical or dietary probiotics, and follow-up monitoring."], facts: [["Plan", "Multi-step, personalized"]], tech: "Fotona laser", concerns: ["stretch marks", "striae", "pregnancy marks"] },
  { id: "fotona", name: "Fotona Laser Treatment", cat: "Laser", icon: "ph-lightning", summary: "Two wavelengths (Er:YAG 2940 nm · Nd:YAG 1064 nm) for predictable, safe results.",
    details: ["Nea was one of the first centres to offer Fotona and all its applications.", "Gently heats the skin for immediate collagen tightening and new collagen over the following weeks."], facts: [["Wavelengths", "Er:YAG + Nd:YAG"], ["Result", "Tightening + new collagen"]], tech: "Fotona", concerns: ["laser", "tightening", "collagen", "rejuvenation", "firm"] },
  { id: "facial", name: "Fotona 4D Facial Laser", cat: "Laser", icon: "ph-sparkle", summary: "Four laser modes in one visit, including intra-oral tightening.",
    details: ["Fotona 4D uses 4 unique laser modes for common skin concerns.", "Intra-oral tightening heats the cheeks from inside the mouth — pain-free, non-ablative, no downtime.", "Results are like dermal fillers but longer lasting."], facts: [["Downtime", "None (intra-oral)"], ["Modes", "4"]], tech: "Fotona 4D", concerns: ["sagging", "jowls", "volume", "lift", "tightening", "cheeks"] },
  { id: "cosmetic", name: "Neuromodulators (Anti-wrinkle)", cat: "Injectables", icon: "ph-syringe", summary: "Softens expression lines by relaxing specific muscles.",
    details: ["Temporarily relaxes specific muscles by blocking nerve impulses.", "30-year safety record.", "Visible in 24 hours, full effect in 3 days."], facts: [["Treatment time", "10–20 min"], ["Full effect", "3 days"], ["Lasts", "3–6 months"]], concerns: ["forehead lines", "frown lines", "crow's feet", "wrinkles", "botox", "expression lines"] },
  { id: "fillers", name: "Dermal Fillers", cat: "Injectables", icon: "ph-drop", summary: "Restores lost volume for a fresh, natural look.",
    details: ["Non-surgical volume restoration — hyaluronic acid is the most popular option.", "Immediate, natural results with minimal downtime, and reversible."], facts: [["Results", "Immediate"], ["Downtime", "Minimal"], ["Reversible", "Yes (HA)"]], concerns: ["volume loss", "lips", "hollow", "cheeks", "fillers", "under eye"] },
  { id: "migraine", name: "Migraine Treatment", cat: "Medical", icon: "ph-brain", summary: "Preventive injectable prescription for chronic migraine.",
    details: ["An injectable prescription medication used to prevent chronic migraines.", "Assessed and prescribed under physician management."], facts: [["Type", "Preventive, prescription"]], concerns: ["migraine", "headaches", "chronic headache"] },
  { id: "hair", name: "Hair Restoration (PRP + Laser)", cat: "Hair", icon: "ph-person", summary: "PRP with 6 growth factors plus Fotona Smooth-mode laser.",
    details: ["PRP uses your platelet-rich plasma — 6 growth factors — to stimulate follicles and blood flow.", "Laser hair restoration (Fotona Smooth Er:YAG) takes 15–20 minutes with minimal discomfort.", "Nea recommends combining PRP and laser, 2 weeks apart."], facts: [["Laser session", "15–20 min"], ["Growth factors", "6 (PRP)"], ["Combine", "2 weeks apart"]], tech: "Fotona Smooth Er:YAG + PRP", concerns: ["hair loss", "thinning hair", "alopecia", "balding", "prp"] },
  { id: "laser", name: "Laser Hair Removal", cat: "Hair", icon: "ph-scissors", summary: "FRAC3 technology — safe for all skin types.",
    details: ["High-performance laser with FRAC3 selective, homogeneous photothermolysis.", "Significant reduction in unwanted hair; regrowth is typically thinner and lighter."], facts: [["Skin types", "All"], ["Technology", "FRAC3"]], tech: "Fotona FRAC3", concerns: ["unwanted hair", "hair removal", "shaving", "ingrown hairs", "laser hair"] },
  { id: "facials", name: "Medical Facials", cat: "Facials", icon: "ph-flower-lotus", summary: "NEA Facial, Oxygen, La Défense, Dermaplaning and peels.",
    details: ["NEA Facial: cleansing, exfoliation, extraction, hydration and antioxidant protection — customizable.", "Infused Oxygenation Facial: medical-grade oxygen with vitamins, minerals, peptides and amino acids.", "La Défense anti-aging facial: Swiss alpine protection against pollution and stress.", "Dermaplaning removes dead skin and peach fuzz — no downtime."], facts: [["Downtime", "None (most)"], ["Lines", "Luzern · ZO · Vivier · AlumierMD · Glo"]], concerns: ["dull skin", "glow", "dry skin", "dehydrated", "facial", "hydration", "event"] },
  { id: "perfect", name: "Perfect Derma Peel", cat: "Facials", icon: "ph-drop-half-bottom", summary: "The only medical-grade peel with Glutathione — for all skin types.",
    details: ["Medical-grade chemical peel featuring Glutathione.", "Ranked a top-3 anti-aging product by ABC News.", "Suitable for all skin types and ethnicities."], facts: [["Skin types", "All"], ["Key ingredient", "Glutathione"]], concerns: ["pigmentation", "dull skin", "acne", "aging", "peel", "tone"] },
  { id: "body", name: "Body Contouring (TightSculpting)", cat: "Body", icon: "ph-person-simple", summary: "Dual-wavelength laser reduces fat while tightening skin.",
    details: ["Non-invasive dual-wavelength laser (Piano + Er:YAG Smooth modes).", "Treats face, neck, décolleté, breast, underarm and stomach.", "No downtime; visible results right away."], facts: [["Downtime", "None"], ["Results", "Immediate, builds over time"]], tech: "Fotona TightSculpting", concerns: ["fat", "belly", "loose skin", "body", "contouring", "tummy"] },
  { id: "muscle", name: "Muscle Sculpting (truSculpt flex)", cat: "Body", icon: "ph-barbell", summary: "Clinically shown +30% average muscle mass.",
    details: ["Multi-Directional Stimulation builds and tones muscle.", "Treats up to 8 areas in one session.", "Clinical studies: average 30% increase in muscle mass."], facts: [["Session", "45 min"], ["Areas", "Up to 8"], ["Muscle mass", "+30% avg"]], tech: "truSculpt flex", concerns: ["muscle", "tone", "abs", "glutes", "strength", "sculpt", "rehab"] },
  { id: "weight", name: "Weight Loss Program", cat: "Wellness", icon: "ph-scales", summary: "Dietitian-built nutrition protocols with the right foods and products.",
    details: ["Nutrition protocols prepared by Registered Dietitians.", "Combines the right products with the right foods for vital nutrients."], facts: [["Led by", "Registered Dietitians"]], concerns: ["weight", "weight loss", "diet", "nutrition", "metabolism"] },
  { id: "snoring", name: "Snoring & Sleep Apnea (NightLase)", cat: "Wellness", icon: "ph-moon-stars", summary: "Non-invasive laser that tightens tissue — no sleep device.",
    details: ["Laser treatment of the oral mucosa — comfortable, no device to wear.", "Full course: 3 sessions over 6 weeks.", "Results last up to a year and can be repeated."], facts: [["Course", "3 sessions / 6 weeks"], ["Lasts", "Up to 1 year"]], tech: "Fotona NightLase", concerns: ["snoring", "sleep apnea", "sleep", "tired"] },
  { id: "feminine", name: "Feminine Health (IntimaLase · IncontiLase)", cat: "Medical", icon: "ph-gender-female", summary: "Laser for vaginal laxity and stress urinary incontinence.",
    details: ["IntimaLase: non-invasive laser tightening, 1–3 sessions of about 15 minutes; satisfaction up to 95%.", "IncontiLase: 94% reported significant improvement in stress urinary incontinence after 120 days; 68% were completely free of it."], facts: [["Session", "~15 min"], ["Satisfaction", "Up to 95%"], ["SUI improved", "94%"]], tech: "Fotona IntimaLase / IncontiLase", concerns: ["incontinence", "bladder leaks", "vaginal", "postpartum", "menopause", "feminine"] },
  { id: "fungal", name: "Fungal Nail (ClearSteps)", cat: "Medical", icon: "ph-footprints", summary: "Nd:YAG laser heats the infected nail and tissue.",
    details: ["Nail is filed, then laser pulses are applied in a circular pattern and around the edge.", "One session treats 10 nails in about 45 minutes.", "Best results with 3–4 treatments; a fully clear nail can take up to a year to grow out."], facts: [["Session", "~45 min / 10 nails"], ["Series", "3–4 treatments"]], tech: "Fotona Nd:YAG", concerns: ["nail fungus", "toenail", "fungal nail", "onychomycosis"] },
  { id: "wart", name: "Wart Removal", cat: "Medical", icon: "ph-target", summary: "Precise laser ablation — no anaesthesia, no special aftercare.",
    details: ["Nd:YAG and Er lasers precisely ablate warts and coagulate their blood supply.", "No anaesthesia or extra tissue removal; no special post-procedure care."], facts: [["Anaesthesia", "Not needed"], ["Aftercare", "None special"]], tech: "Fotona Nd:YAG + Er:YAG", concerns: ["warts", "verruca", "plantar wart"] },
  { id: "medical", name: "Medical-Grade Skincare", cat: "Facials", icon: "ph-flask", summary: "Luzern and ZO Skin Health collections, available at Nea.",
    details: ["Cleansers, moisturizers and treatment kits available exclusively through the clinic.", "Targets exfoliation, anti-aging, brightening, acne, rosacea, protection and hydration."], facts: [["Brands", "Luzern · ZO Skin Health"]], concerns: ["skincare", "routine", "products", "sunscreen", "serum"] },
];

export interface NeaPackage { id: string; name: string; group: "Beauty" | "Wellness"; icon: string; tiers: { name?: string; items: string[] }[] }

export const NEA_PACKAGES: NeaPackage[] = [
  { id: "anti-aging", name: "Anti-Aging", group: "Beauty", icon: "ph-hourglass-medium", tiers: [{ items: ["Comprehensive medical assessment", "Regular follow-ups", "2 nutrition consultations with a Registered Dietitian", "1 gut microbiome with nutrition consultation", "1 skin microbiome with skin consultation", "DEXA body composition", "4 Flex treatments", "6 facials", "2 PRP sessions with microneedling", "3 laser skin tightening or intra-oral sessions", "2 sessions with a kinesiologist"] }] },
  { id: "hair", name: "Hair", group: "Beauty", icon: "ph-person", tiers: [{ name: "Hair Thinning & Alopecia", items: ["6 PRP treatments", "6 laser hair restoration treatments", "Pharmaceutical compound"] }, { name: "Hair Restoration", items: ["4 mini facials", "4 laser hair restoration treatments", "4 scalp massages", "Pharmaceutical compound"] }] },
  { id: "scarring", name: "Scarring", group: "Beauty", icon: "ph-circles-four", tiers: [{ name: "On the Surface", items: ["1 Perfect Peel"] }, { name: "Let's Go Deeper", items: ["1 Perfect Peel", "2 oxygen facials"] }] },
  { id: "facial", name: "Facial", group: "Beauty", icon: "ph-flower-lotus", tiers: [{ items: ["8 oxygen facials", "3 laser skin tightening"] }] },
  { id: "rejuvenation", name: "Skin Rejuvenation", group: "Beauty", icon: "ph-sparkle", tiers: [{ items: ["3 oxygen facials", "3 microneedling sessions", "3 skin tightening facials", "Vivier signature kit"] }] },
  { id: "glow", name: "Get Your Glow", group: "Beauty", icon: "ph-sun-horizon", tiers: [{ items: ["3 Alumier peels", "3 infused oxygen facials", "Gut microbiome with nutrition consultation"] }] },
  { id: "laser-hair", name: "Laser Hair Reduction", group: "Beauty", icon: "ph-scissors", tiers: [{ items: ["8 laser hair removal sessions", "3 dermaplaning facials", "Gut microbiome with nutrition consultation"] }] },
  { id: "nutrition", name: "Nutrition Wellness", group: "Wellness", icon: "ph-carrot", tiers: [{ name: "Risk Assessment", items: ["DEXA body composition with assessment", "1 month daily nutrition feedback"] }, { name: "Customized Meal Plan", items: ["Personalized meal plan", "1 month daily nutrition feedback"] }, { name: "Precision Nutrition · Microbiome", items: ["Gut microbiome with assessment", "1 month daily nutrition feedback"] }] },
  { id: "sports", name: "Sports", group: "Wellness", icon: "ph-person-simple-run", tiers: [{ items: ["12 Flex treatments (monthly)", "4 facials (every 3 months)", "Sports genomics DNA test", "2 DEXA body compositions"] }] },
  { id: "arthritis", name: "Arthritis", group: "Wellness", icon: "ph-hand", tiers: [{ items: ["12 Flex treatments", "12 mini facials", "6 laser pain management sessions", "DEXA body composition"] }] },
  { id: "feminine", name: "Feminine Health", group: "Wellness", icon: "ph-gender-female", tiers: [{ items: ["4 Flex treatments", "3 laser incontinence treatments", "Vaginal microbiome with nutrition consultation", "Disease-based DNA test"] }] },
  { id: "heart", name: "Heart Health", group: "Wellness", icon: "ph-heartbeat", tiers: [{ items: ["12 Flex treatments", "4 facials", "2 DEXA body compositions", "Cardiac genomics DNA test"] }] },
  { id: "sleep", name: "Sleep Apnea", group: "Wellness", icon: "ph-moon-stars", tiers: [{ items: ["6 Flex treatments", "Sleep apnea study", "3 laser sleep apnea treatments", "3 chin tightening", "Cardiac DNA genomic test"] }] },
];

// Chart data — only numbers Nea publishes.
export const NEA_DOWNTIME: { name: string; min: number; max: number }[] = [
  { name: "Dermaplaning", min: 0, max: 0 },
  { name: "Intra-oral tightening", min: 0, max: 0 },
  { name: "TightSculpting", min: 0, max: 0 },
  { name: "Chemical peel (peeling)", min: 2, max: 3 },
  { name: "2D resurfacing", min: 3, max: 5 },
  { name: "Fractional resurfacing", min: 4, max: 5 },
];
export const NEA_OUTCOMES: { label: string; value: number; note: string }[] = [
  { label: "IntimaLase satisfaction", value: 95, note: "Up to 95% patient satisfaction" },
  { label: "IncontiLase — improved SUI", value: 94, note: "Significant improvement after 120 days" },
  { label: "IncontiLase — fully free of SUI", value: 68, note: "Completely free after 120 days" },
  { label: "truSculpt flex — muscle mass", value: 30, note: "Average increase in clinical studies" },
];
export const NEA_SESSION_MIN: { name: string; min: number; max: number }[] = [
  { name: "Neuromodulators", min: 10, max: 20 },
  { name: "IntimaLase", min: 15, max: 15 },
  { name: "Laser hair restoration", min: 15, max: 20 },
  { name: "truSculpt flex", min: 45, max: 45 },
  { name: "ClearSteps (10 nails)", min: 45, max: 45 },
];

export const NEA_CATS: NeaCat[] = ["Skin concerns", "Laser", "Injectables", "Facials", "Body", "Hair", "Wellness", "Medical"];
export const neaTreatmentUrl = (id: string) => `${NEA.treatmentsPage}#${id}`;

/** Keyword match used by Skin Match when AI is unavailable. */
export function matchNeaTreatments(text: string, max = 3): NeaTreatment[] {
  const q = text.toLowerCase();
  const scored = NEA_TREATMENTS.map((t) => ({ t, s: t.concerns.reduce((a, c) => a + (q.includes(c) ? c.length : 0), 0) + (q.includes(t.name.toLowerCase()) ? 20 : 0) }));
  return scored.filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, max).map((x) => x.t);
}
