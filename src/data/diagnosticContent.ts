// Content for the 5 diagnostic category pages. The individual test prep
// details here are the same real content already used on the Resources
// page's Test Preparation tab — grouped here by category instead of a flat
// list, so each diagnostic node on the health graph has its own home.

export interface DiagnosticTest {
  name: string;
  icon: string; // lucide-react icon name
  duration: string;
  prep: string[];
}

export interface DiagnosticContent {
  slug: string;
  label: string;
  icon: string;
  tagline: string;
  overview: string;
  tests: DiagnosticTest[];
  referralNote?: string;
}

const STANDARD_TEST_REFERRAL_NOTE =
  "Most diagnostic tests require a referral or order from your physician. If you're already a patient, ask your physician about booking. New patients should start with a consultation.";

export const diagnosticContent: Record<string, DiagnosticContent> = {
  "cardiac-imaging": {
    slug: "cardiac-imaging",
    label: "Cardiac Imaging",
    icon: "Heart",
    tagline: "Echocardiography and related imaging of the heart's structure and function.",
    overview: "Cardiac imaging gives your physician a direct look at how your heart is structured and how well it's functioning — muscle thickness, valve behavior, and pumping efficiency — without any invasive procedure.",
    tests: [
      {
        name: "Echocardiogram",
        icon: "Waves",
        duration: "30–45 minutes",
        prep: ["No special preparation needed", "Wear comfortable, two-piece clothing", "Continue taking your regular medications"],
      },
    ],
  },

  "stress-testing": {
    slug: "stress-testing",
    label: "Stress Testing",
    icon: "Activity",
    tagline: "Stress Echocardiogram, Treadmill Stress Test, and Nuclear Stress Testing.",
    overview: "Stress testing shows how your heart performs under physical exertion, revealing issues that may not appear when you're at rest — useful for diagnosing coronary artery disease and assessing exercise tolerance.",
    tests: [
      {
        name: "Stress Echocardiogram",
        icon: "Activity",
        duration: "45–60 minutes",
        prep: ["Wear comfortable clothing and running shoes", "No food or caffeine for 4 hours prior", "Avoid creams or lotions on your chest that day"],
      },
      {
        name: "Nuclear Stress Test",
        icon: "Scan",
        duration: "2–4 hours (includes wait time between imaging)",
        prep: ["No caffeine for 24 hours prior", "Fast for 4 hours before the test", "Wear comfortable clothing and shoes"],
      },
    ],
  },

  "vascular": {
    slug: "vascular",
    label: "Vascular",
    icon: "Radio",
    tagline: "Carotid Ultrasound and Ankle-Brachial Index (ABI) testing.",
    overview: "Vascular testing checks blood flow and vessel health outside the heart itself — in the neck arteries and the legs — helping catch circulation problems and stroke risk factors early.",
    tests: [
      {
        name: "Carotid Ultrasound",
        icon: "Radio",
        duration: "20–30 minutes",
        prep: ["No special preparation needed", "Avoid turtlenecks or high collars that day"],
      },
      {
        name: "ABI (Ankle-Brachial Index)",
        icon: "Footprints",
        duration: "15–20 minutes",
        prep: ["Wear loose-fitting pants that can be rolled up", "Avoid smoking for 30 minutes before the test"],
      },
    ],
  },

  "monitoring": {
    slug: "monitoring",
    label: "Monitoring",
    icon: "Gauge",
    tagline: "Holter Monitoring (24/48/72hr) and 24-hour Ambulatory Blood Pressure Monitoring.",
    overview: "Extended monitoring captures what a single in-office reading can miss — how your heart rhythm or blood pressure behaves over a full day or more of normal activity, sleep, and stress.",
    tests: [
      {
        name: "Holter Monitoring",
        icon: "HeartPulse",
        duration: "24–72 hours (worn continuously)",
        prep: ["Shower before your appointment — no bathing with the device on", "Keep a diary of symptoms and activity", "Avoid strong magnets and metal detectors while wearing it"],
      },
      {
        name: "24-Hour Ambulatory BP Monitoring",
        icon: "Gauge",
        duration: "24 hours (worn continuously)",
        prep: ["Wear a loose-sleeved shirt", "Keep your arm still and relaxed during each reading", "Continue normal daily activities"],
      },
    ],
  },

  "pulmonary": {
    slug: "pulmonary",
    label: "Pulmonary",
    icon: "Wind",
    tagline: "Pulmonary Function Testing — in partnership with Advanced Respiratory Care Network.",
    overview: "Pulmonary function testing measures how well your lungs move air in and out, and how efficiently oxygen transfers into your bloodstream — key for diagnosing and tracking conditions like asthma and COPD.",
    tests: [
      {
        name: "Pulmonary Function Testing",
        icon: "Wind",
        duration: "30–45 minutes",
        prep: ["Avoid heavy meals for 4–6 hours prior", "No smoking for 24 hours before the test", "Avoid bronchodilator inhalers as instructed by your physician"],
      },
    ],
  },
};

export { STANDARD_TEST_REFERRAL_NOTE };