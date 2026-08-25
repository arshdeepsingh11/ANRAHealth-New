export interface HealthFact {
  text: string;
  cta: string;
  href: string;
}

export const HEALTH_FACTS: HealthFact[] = [
  // ─────────────────────────────────────────────────────────
  // Cardiology — /specialties/cardiology
  // ─────────────────────────────────────────────────────────
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
  { text: "Stress echocardiograms can reveal blockages that a resting ECG alone would miss.", cta: "Book a consult", href: "/referral-centre" },
  { text: "A Holter monitor can catch irregular heartbeats that come and go — the kind a single office visit would never detect.", cta: "Ask about monitoring", href: "/specialties/cardiology" },
  { text: "Palpitations are common and often harmless, but persistent or worsening episodes should always be checked.", cta: "Book a consult", href: "/specialties/cardiology" },
  { text: "Shortness of breath with everyday activity — climbing stairs, carrying groceries — is never something to just \"get used to.\"", cta: "Talk to a cardiologist", href: "/specialties/cardiology" },
  { text: "Swelling in the ankles or legs can be an early sign of heart strain, especially when paired with fatigue.", cta: "Learn more", href: "/specialties/cardiology" },
  { text: "A carotid ultrasound can spot narrowing in neck arteries years before a stroke ever happens.", cta: "Ask about testing", href: "/specialties/cardiology" },
  { text: "Heart Failure Clinic patients who get regular monitoring and medication optimization have significantly better outcomes.", cta: "Learn about our Heart Failure Clinic", href: "/specialties/cardiology" },
  { text: "Recovering from a cardiac event is safer and faster with a structured follow-up plan, not guesswork.", cta: "Book a follow-up", href: "/referral-centre" },

  // ─────────────────────────────────────────────────────────
  // Endocrinology — no live page yet, route to referral
  // ─────────────────────────────────────────────────────────
  { text: "About 2 in 3 people with diabetes also have high blood pressure.", cta: "Book a consult", href: "/referral-centre" },
  { text: "A 5–7% loss of body weight can help stop prediabetes from progressing to type 2 diabetes.", cta: "Book a consult", href: "/referral-centre" },
  { text: "Type 2 diabetes often develops silently for years before diagnosis.", cta: "Get screened", href: "/referral-centre" },
  { text: "Thyroid disorders can affect heart rate, energy, weight, and mood — often mistaken for unrelated issues.", cta: "Book a consult", href: "/referral-centre" },
  { text: "Untreated hypothyroidism can quietly raise cholesterol and cardiovascular risk over time.", cta: "Book a consult", href: "/referral-centre" },
  { text: "PCOS affects up to 1 in 10 women of reproductive age and often goes undiagnosed.", cta: "Book a consult", href: "/referral-centre" },
  { text: "Osteoporosis has no symptoms until a fracture happens — bone density testing catches it early.", cta: "Ask about screening", href: "/referral-centre" },
  { text: "Unexplained fatigue, weight change, or mood shifts can sometimes trace back to a hormonal imbalance, not stress.", cta: "Book a consult", href: "/referral-centre" },
  { text: "Adrenal and pituitary disorders are rare but treatable — persistent, unexplained symptoms are worth investigating.", cta: "Book a consult", href: "/referral-centre" },

  // ─────────────────────────────────────────────────────────
  // Respiratory Medicine — /specialties/respiratory-medicine
  // ─────────────────────────────────────────────────────────
  { text: "Pulmonary function tests can detect lung issues years before symptoms become noticeable.", cta: "Learn more", href: "/specialties/respiratory-medicine" },
  { text: "Nearly 1 in 5 adults with sleep apnea remain undiagnosed.", cta: "Learn about sleep testing", href: "/specialties/respiratory-medicine" },
  { text: "Untreated sleep apnea is linked to higher risk of high blood pressure and heart disease.", cta: "Get tested", href: "/specialties/respiratory-medicine" },
  { text: "A single overnight portable sleep study can screen for sleep apnea from the comfort of home.", cta: "Learn more", href: "/specialties/respiratory-medicine" },
  { text: "Snoring can be a normal variant — or an early sign of a treatable sleep disorder.", cta: "Learn more", href: "/specialties/respiratory-medicine" },
  { text: "Waking up tired despite a full night's sleep is one of the most overlooked signs of sleep apnea.", cta: "Book a sleep consult", href: "/specialties/respiratory-medicine" },
  { text: "Asthma symptoms can change over time — a plan that worked five years ago may no longer fit.", cta: "Book a check-up", href: "/specialties/respiratory-medicine" },
  { text: "COPD is often mistaken for normal aging, delaying diagnosis by years.", cta: "Get screened", href: "/specialties/respiratory-medicine" },
  { text: "CPAP therapy, properly fitted, can dramatically improve energy, focus, and long-term heart health.", cta: "Learn more", href: "/specialties/respiratory-medicine" },
  { text: "A persistent cough lasting more than a few weeks deserves evaluation, not just cough drops.", cta: "Book a consult", href: "/specialties/respiratory-medicine" },

  // ─────────────────────────────────────────────────────────
  // Skin Health — /specialties/skin-health
  // ─────────────────────────────────────────────────────────
  { text: "Daily sunscreen use is one of the most effective ways to prevent premature skin aging.", cta: "Learn more", href: "/specialties/skin-health" },
  { text: "Rosacea affects millions of adults and is often mistaken for simple sensitivity or sunburn.", cta: "Learn more", href: "/specialties/skin-health" },
  { text: "Early treatment of acne can significantly reduce the risk of permanent scarring.", cta: "Learn more", href: "/specialties/skin-health" },
  { text: "A changing mole — in size, shape, or color — is always worth a professional look.", cta: "Book a skin check", href: "/specialties/skin-health" },
  { text: "Eczema flare-ups are often triggered by specific, identifiable factors — not random bad luck.", cta: "Learn more", href: "/specialties/skin-health" },
  { text: "Regular skin checks can catch changes early, when treatment is simplest and most effective.", cta: "Book a skin check", href: "/specialties/skin-health" },
  { text: "Adult acne is increasingly common and often responds well to a tailored treatment plan.", cta: "Book a consult", href: "/specialties/skin-health" },

  // ─────────────────────────────────────────────────────────
  // Internal Medicine — no live page yet, route to referral
  // ─────────────────────────────────────────────────────────
  { text: "Internal medicine specialists are trained to connect symptoms across multiple organ systems that other visits might miss.", cta: "Book a consult", href: "/referral-centre" },
  { text: "Managing several chronic conditions at once often works best under one coordinated care plan, not separate silos.", cta: "Book a consult", href: "/referral-centre" },
  { text: "A comprehensive annual exam can catch early warning signs across your whole-body health, not just one system.", cta: "Book a check-up", href: "/referral-centre" },
  { text: "Medication interactions become more likely the more prescriptions you're on — a periodic review can catch conflicts early.", cta: "Book a medication review", href: "/referral-centre" },
  { text: "Unexplained, persistent symptoms — fatigue, weight change, pain — are worth a thorough workup rather than guessing.", cta: "Book a consult", href: "/referral-centre" },
  { text: "Preventive screening schedules differ by age, sex, and family history — a one-size approach misses risk.", cta: "Book a consult", href: "/referral-centre" },

  // ─────────────────────────────────────────────────────────
  // Geriatric Medicine — no live page yet, route to referral
  // ─────────────────────────────────────────────────────────
  { text: "Falls are the leading cause of injury in adults over 65 — and most are preventable with the right assessment.", cta: "Book a consult", href: "/referral-centre" },
  { text: "Muscle mass and balance can be trained at any age — frailty isn't an inevitable part of aging.", cta: "Learn more", href: "/referral-centre" },
  { text: "Memory changes deserve a real evaluation — some causes are reversible and easily missed without proper testing.", cta: "Book a consult", href: "/referral-centre" },
  { text: "Polypharmacy — taking many medications at once — is one of the most common and correctable risks for older adults.", cta: "Book a medication review", href: "/referral-centre" },
  { text: "Caregivers benefit from support too — geriatric care includes guidance for the whole family, not just the patient.", cta: "Learn more", href: "/referral-centre" },
  { text: "Mobility issues often have a treatable root cause — from medication side effects to correctable joint or balance problems.", cta: "Book a consult", href: "/referral-centre" },
  { text: "A comprehensive geriatric assessment looks at physical, cognitive, and social health together for a fuller picture.", cta: "Book a consult", href: "/referral-centre" },

  // ─────────────────────────────────────────────────────────
  // Pediatric Rheumatology — no live page yet, route to referral
  // ─────────────────────────────────────────────────────────
  { text: "Juvenile arthritis affects roughly 1 in 1,000 children — early diagnosis can prevent long-term joint damage.", cta: "Book a consult", href: "/referral-centre" },
  { text: "Persistent joint pain or swelling in a child is never something to simply wait out.", cta: "Book a consult", href: "/referral-centre" },
  { text: "Autoimmune conditions in children often present differently than in adults, requiring specialized evaluation.", cta: "Learn more", href: "/referral-centre" },
  { text: "Morning stiffness that eases through the day can be an early clue to inflammatory joint disease in kids.", cta: "Book a consult", href: "/referral-centre" },
  { text: "Early treatment of pediatric inflammatory conditions can preserve normal growth and joint function long-term.", cta: "Book a consult", href: "/referral-centre" },

  // ─────────────────────────────────────────────────────────
  // Nutrition — no live page yet, route to referral
  // ─────────────────────────────────────────────────────────
  { text: "Personalized nutrition plans consistently outperform generic diets for long-term, sustainable results.", cta: "Book a nutrition consult", href: "/referral-centre" },
  { text: "Small, sustained dietary changes tend to outlast dramatic short-term diets for lasting weight management.", cta: "Learn more", href: "/referral-centre" },
  { text: "Nutrition coaching paired with medical oversight is especially effective for managing diabetes and heart disease together.", cta: "Book a consult", href: "/referral-centre" },
  { text: "Protein intake needs often rise with age to help preserve muscle mass and strength.", cta: "Book a nutrition consult", href: "/referral-centre" },
  { text: "Food sensitivities and inflammation are closely linked — an individualized plan can identify your specific triggers.", cta: "Book a consult", href: "/referral-centre" },
  { text: "Gut health influences far more than digestion — it's tied to immunity, mood, and metabolic health.", cta: "Learn more", href: "/referral-centre" },

  // ─────────────────────────────────────────────────────────
  // Precision Medicine & Genomics — no live page yet, route to referral
  // ─────────────────────────────────────────────────────────
  { text: "Pharmacogenomic testing can reveal how your body processes specific medications — helping avoid trial-and-error prescribing.", cta: "Learn more", href: "/referral-centre" },
  { text: "Hereditary cardiac panels can flag inherited heart conditions in family members years before symptoms appear.", cta: "Learn more", href: "/referral-centre" },
  { text: "Genomic testing can identify personal risk factors that population-wide screening guidelines simply can't capture.", cta: "Book a consult", href: "/referral-centre" },
  { text: "Precision medicine combines genetics, lifestyle, and biomarkers to build a health plan tailored to you specifically.", cta: "Learn more", href: "/referral-centre" },
  { text: "Whole exome sequencing can uncover the genetic basis of a condition that's gone undiagnosed for years.", cta: "Book a consult", href: "/referral-centre" },
  { text: "Knowing your genetic risk profile can guide earlier, more targeted screening for conditions that run in your family.", cta: "Learn more", href: "/referral-centre" },

  // ─────────────────────────────────────────────────────────
  // Diagnostics & Testing — no dedicated page yet, route to referral
  // ─────────────────────────────────────────────────────────
  { text: "An echocardiogram gives a detailed, real-time look at how well your heart is actually pumping.", cta: "Book a consult", href: "/referral-centre" },
  { text: "An Ankle-Brachial Index (ABI) test is a simple, painless way to check for blocked leg arteries.", cta: "Ask about testing", href: "/referral-centre" },
  { text: "24-hour ambulatory blood pressure monitoring often reveals patterns a single office reading would miss entirely.", cta: "Learn more", href: "/referral-centre" },
  { text: "A treadmill stress test can uncover heart issues that only show up under physical exertion.", cta: "Book a consult", href: "/referral-centre" },
  { text: "Nuclear stress testing offers a detailed look at blood flow to the heart muscle itself.", cta: "Learn more", href: "/referral-centre" },
  { text: "Combining imaging, bloodwork, and monitoring gives a far more complete picture than any single test alone.", cta: "Book a consult", href: "/referral-centre" },

  // ─────────────────────────────────────────────────────────
  // Longevity — no dedicated page yet, route to referral
  // ─────────────────────────────────────────────────────────
  { text: "Biological age can differ significantly from your actual age — and it's measurable with the right testing.", cta: "Learn more", href: "/referral-centre" },
  { text: "VO2 Max is one of the strongest predictors of long-term health and longevity — and it's trainable at any age.", cta: "Learn more", href: "/referral-centre" },
  { text: "Metabolic health markers can reveal risk years before a chronic disease diagnosis would ever appear.", cta: "Book a consult", href: "/referral-centre" },
  { text: "Grip strength is a surprisingly strong predictor of overall longevity and functional health.", cta: "Learn more", href: "/referral-centre" },
  { text: "Consistent strength training is one of the most effective tools for extending healthy, independent years.", cta: "Learn more", href: "/referral-centre" },
  { text: "An AI-driven health score can track subtle trends across your data long before symptoms show up.", cta: "Learn more", href: "/referral-centre" },

  // ─────────────────────────────────────────────────────────
  // General preventive / clinic-wide
  // ─────────────────────────────────────────────────────────
  { text: "Adults are generally recommended to get at least 150 minutes of moderate exercise per week.", cta: "Book a check-up", href: "/referral-centre" },
  { text: "Routine checkups can catch risk factors years before any symptoms appear.", cta: "Book a check-up", href: "/contact" },
  { text: "Muscle mass naturally begins to decline in your 30s — strength training helps preserve it.", cta: "Learn more", href: "/referral-centre" },
  { text: "Quality sleep is one of the most overlooked factors in long-term cardiovascular health.", cta: "Learn more", href: "/referral-centre" },
  { text: "A referral from your family doctor is often all that's needed to see a specialist here.", cta: "Start a referral", href: "/referral-centre" },
  { text: "Seeing multiple specialists under one roof means your care team can actually talk to each other.", cta: "Meet our physicians", href: "/physicians" },
  { text: "Chronic stress measurably affects blood pressure, blood sugar, and sleep — and it's manageable with the right plan.", cta: "Book a consult", href: "/referral-centre" },
  { text: "An annual physical is one of the highest-value visits you can make — most major risks are caught here first.", cta: "Book a check-up", href: "/contact" },
  { text: "Knowing your family's medical history is one of the most powerful, and most overlooked, screening tools available.", cta: "Book a consult", href: "/referral-centre" },
  { text: "Two convenient locations across Calgary make it easier to keep every appointment, not just the first one.", cta: "View our locations", href: "/contact" },
  { text: "Test preparation instructions vary by procedure — checking ahead avoids delays or needing to reschedule.", cta: "View test prep", href: "/resources" },
  { text: "New patients can browse condition guides and forms before their first visit to save time in-clinic.", cta: "View patient resources", href: "/resources" },
];