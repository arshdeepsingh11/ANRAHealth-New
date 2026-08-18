export interface GraphChild {
  label: string;
  description: string;
}

export interface GraphNode {
  id: string;
  label: string;
  sub?: string;
  icon: string; // lucide-react icon name
  angle: number;
  standalone?: boolean;
  children?: GraphChild[];
}

export const graphNodes: GraphNode[] = [
  {
    id: "specialties",
    label: "Medical Specialties",
    icon: "Stethoscope",
    angle: -80,
    children: [
      { label: "Cardiology", description: "Chest pain, arrhythmias, coronary artery disease, hypertension, lipid disorders, valve disease, preventive cardiology, women's heart health." },
      { label: "Heart Failure Clinic", description: "Evaluation, medication optimization, remote monitoring, device management, lifestyle and nutrition support." },
      { label: "Internal Medicine", description: "Whole-person care for complex, chronic, and multi-system conditions." },
      { label: "Endocrinology", description: "Diabetes, thyroid, obesity, osteoporosis, adrenal and pituitary disorders." },
      { label: "Geriatric Medicine", description: "Healthy aging, frailty, falls, memory, medication review, mobility, caregiver support." },
      { label: "Pediatric Rheumatology", description: "Juvenile arthritis, autoimmune disease, connective tissue and inflammatory disorders." },
      { label: "Respiratory Medicine", description: "Asthma, COPD, sleep disorders, pulmonary fibrosis — in partnership with Advanced Respiratory Care Network." },
      { label: "Nutrition", description: "Personalized nutrition coaching — in partnership with Nea Precision Nutrition." },
      { label: "Skin Health", description: "Medical and preventive skin health — in partnership with Nea Precision Skin." },
    ],
  },
  {
    id: "diagnostics",
    label: "Diagnostics & Testing",
    icon: "ClipboardList",
    angle: -20,
    children: [
      { label: "Cardiac Imaging", description: "Echocardiography and related imaging of the heart's structure and function." },
      { label: "Stress Testing", description: "Stress Echocardiogram, Treadmill Stress Test, Exercise and Dipyridamole Nuclear Stress Tests." },
      { label: "Vascular", description: "Carotid Ultrasound and Ankle-Brachial Index (ABI) testing." },
      { label: "Monitoring", description: "Holter Monitoring (24/48/72hr) and 24-hour Ambulatory Blood Pressure Monitoring." },
      { label: "Pulmonary", description: "Pulmonary Function Testing — in partnership with Advanced Respiratory Care Network." },
    ],
  },
  {
    id: "precision",
    label: "Precision Medicine & Genomics",
    icon: "Dna",
    angle: 55,
    children: [
      { label: "Precision Medicine", description: "Genomics, microbiome, wearables, lifestyle, and AI working together — from prediction to personalized treatment." },
      { label: "Genomics", description: "Whole genome/exome sequencing, pharmacogenomics, hereditary cardiac panels — with partner lab BioAro Labs." },
    ],
  },
  {
    id: "longevity",
    label: "Longevity",
    icon: "HeartPulse",
    angle: 125,
    standalone: true,
    children: [
      { label: "Longevity", description: "Biological age, metabolic health, VO2 Max, AI Health Score, and personalized longevity programs." },
    ],
  },
  {
    id: "alba",
    label: "AI Health Companion",
    sub: "ALBA",
    icon: "BrainCircuit",
    angle: -165,
    standalone: true,
  },
];

export interface PersistentAction {
  label: string;
  href: string;
  icon: string;
}

export const persistentActions: PersistentAction[] = [
  { label: "Referral Centre", href: "/referral-centre", icon: "FileText" },
  { label: "Contact", href: "/contact", icon: "Phone" },
  { label: "Locations", href: "/locations", icon: "MapPin" },
  { label: "Patient Resources", href: "/resources", icon: "BookOpen" },
];