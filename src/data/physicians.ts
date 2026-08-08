// Physician data extracted from Doctors.docx
// Note: per instruction, Dr. Jelani uses the Meadow Miles (Blackfoot) address,
// and Dr. Parekh uses the North East (3151 27 St) address, overriding their
// original listed addresses.

export interface Physician {
  slug: string;
  name: string;
  title: string;
  photo: string | null;
  location: string;
  address: string;
  phone: string;
  languages: string[];
  disciplines: string[];
  qualifications: string[];
  bio: string;
}

export const physicians: Physician[] = [
  {
    slug: "anmol-kapoor",
    name: "Dr. Anmol Singh Kapoor",
    title: "Founder — Cardiology & Internal Medicine",
    photo: "kapoor",
    location: "North East",
    address: "#201 3151 27th St. NE, Calgary, AB T1Y 0B4",
    phone: "403-235-4109",
    languages: ["English", "Urdu", "Hindi", "Punjabi", "Russian"],
    disciplines: ["Cardiology", "Internal Medicine"],
    qualifications: [
      "MD, Doctor of Medicine (Russia, 2000)",
      "LMCC — Licentiate of the Medical Council of Canada",
      "Royal College of Physicians and Surgeons of Canada — Sub-Specialty Certification, Cardiology",
      "FRCPC — Fellow, Royal College of Physicians Canada, Internal Medicine",
    ],
    bio: "Founder of the practice and a leading voice in Alberta cardiology, Dr. Kapoor established the region's first onsite Exercise Stress Echocardiogram program.",
  },
  {
    slug: "ravi-varshney",
    name: "Dr. Ravi Varshney",
    title: "Cardiology & Internal Medicine",
    photo: null,
    location: "North East",
    address: "3151 27 Street NE, Calgary, AB T1Y 0B4",
    phone: "403-235-4109",
    languages: ["English", "Hindi", "Urdu", "Punjabi"],
    disciplines: ["Cardiology", "Internal Medicine"],
    qualifications: [
      "MD, Doctor of Medicine (University of British Columbia, 2010)",
      "LMCC — Licentiate of the Medical Council of Canada",
      "FRCPC — Fellow, Royal College of Physicians Canada, Internal Medicine",
      "FRCPC — Fellow, Royal College of Physicians Canada, Cardiology",
    ],
    bio: "Dr. Varshney provides comprehensive cardiology and internal medicine consultations, with a focus on coordinated, whole-patient care.",
  },
  {
    slug: "ali-debek",
    name: "Dr. Ali Debek",
    title: "Internist / Cardiologist",
    photo: null,
    location: "North East",
    address: "3151 27 Street NE, Calgary, AB T1Y 0B4",
    phone: "403-235-4147",
    languages: ["English", "Arabic"],
    disciplines: ["Internal Medicine", "Cardiology"],
    qualifications: ["MD, Lithuanian University of Health Sciences Faculty of Medicine"],
    bio: "Dr. Debek diagnoses and treats cardiovascular problems and illnesses, with extensive experience performing patient examinations and developing ongoing therapy and disease management programs. Top areas of care: heart failure, chest pain/angina, hypertension, coronary artery disease, arrhythmias, and stress testing.",
  },
  {
    slug: "lovpreet-mangat",
    name: "Dr. Lovpreet Singh Mangat",
    title: "Internal Medicine",
    photo: null,
    location: "North East",
    address: "3151 27 Street NE, Calgary, AB T1Y 0B4",
    phone: "403-235-4109",
    languages: ["English", "Hindi", "Punjabi"],
    disciplines: ["Internal Medicine"],
    qualifications: [
      "MD, Doctor of Medicine (Hungary, 2006)",
      "LMCC — Licentiate of the Medical Council of Canada",
      "FRCPC — Fellow, Royal College of Physicians Canada, Internal Medicine",
      "ABIM — American Board of Internal Medicine, Internal Medicine",
    ],
    bio: "Dr. Mangat provides internal medicine consultation and coordinated management of complex and chronic conditions.",
  },
  {
    slug: "anwar-jelani",
    name: "Dr. Anwar Dastagir Jelani",
    title: "Internal Medicine & Cardiology",
    photo: null,
    location: "Meadow Miles",
    address: "250 – 8500 Blackfoot Trail SE, Calgary, AB T2J 7E1",
    phone: "403.879.7911",
    languages: ["English", "Arabic", "Punjabi", "Urdu", "Hindi"],
    disciplines: ["Internal Medicine", "Cardiology"],
    qualifications: ["MBBS (Saudi Arabia, 1995)", "Certificate (Saudi Arabia) — Internal Medicine"],
    bio: "Dr. Jelani provides internal medicine and cardiology consultations at our Meadow Miles location.",
  },
  {
    slug: "muhammed-dhalla",
    name: "Dr. Muhammed Dhalla",
    title: "Pediatrics & Rheumatology",
    photo: null,
    location: "Meadow Miles",
    address: "250 – 8500 Blackfoot Trail SE, Calgary, AB T2J 7E1",
    phone: "403-879-7911",
    languages: ["English"],
    disciplines: ["Pediatrics", "Rheumatology"],
    qualifications: [
      "MD, Doctor of Medicine (University of Alberta, 2012)",
      "LMCC — Licentiate of the Medical Council of Canada",
      "FRCPC — Fellow, Royal College of Physicians Canada, Pediatrics",
      "Royal College of Physicians and Surgeons of Canada — Sub-Specialty Certification, Rheumatology",
    ],
    bio: "Dr. Dhalla provides pediatric and rheumatology consultations at our Meadow Miles location.",
  },
  {
    slug: "faisal-hasan",
    name: "Dr. Faisal Hasan",
    title: "Endocrinology & Metabolism",
    photo: null,
    location: "North East",
    address: "3151 27 Street NE, Calgary, AB T1Y 0B4",
    phone: "403-475-4475",
    languages: ["English", "Urdu", "Hindi", "Kannada"],
    disciplines: ["Endocrinology", "Internal Medicine"],
    qualifications: ["Trained in Internal Medicine, Endocrinology & Metabolism (United Kingdom)"],
    bio: "Dr. Hasan completed his training in the UK, later serving as Lead for Endocrinology at Royal United Hospital Bath and Lead for Neuroendocrinology in Bristol. He has extensive experience managing complex diabetes, adrenal and pituitary disorders, and PCOS, with a special interest in young-onset type 2 diabetes. He has published in the European Journal of Endocrinology and serves as an editor and peer reviewer for several endocrine and medical journals.",
  },
  {
    slug: "prafull-parekh",
    name: "Dr. Prafull K. Parekh",
    title: "Internal Medicine",
    photo: null,
    location: "North East",
    address: "3151 27 Street NE, Calgary, AB T1Y 0B4",
    phone: "403-475-4475",
    languages: ["English", "Gujarati"],
    disciplines: ["Internal Medicine"],
    qualifications: [
      "MB ChB (Zimbabwe, 1976)",
      "LMCC — Licentiate of the Medical Council of Canada",
      "FRCPC — Fellow, Royal College of Physicians Canada, Internal Medicine",
    ],
    bio: "Dr. Parekh provides internal medicine consultations with decades of clinical experience.",
  },
];
