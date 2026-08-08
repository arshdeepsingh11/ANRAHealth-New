// ============================================================
// TYPE DEFINITIONS (added for TypeScript conversion — data below unchanged)
// ============================================================
export interface Service {
  slug: string;
  icon: string;
  name: string;
  short: string;
  long: string;
}
export interface Location {
  tag: string;
  name: string;
  address: string;
  phone: string;
  fax: string;
}
export interface Symptom {
  name: string;
  desc: string;
}
export interface Faq {
  q: string;
  a: string;
}
export interface Career {
  title: string;
  type: string;
}
export interface WhyChooseItem {
  icon: string;
  title: string;
  desc: string;
}
export interface CharmClinic {
  fullName: string;
  intro: string;
  howItWorks: string;
  selfCare: string;
  research: string;
}

// ============================================================
// ANRA HEALTH — CENTRAL CONTENT FILE
// Edit text here and it updates across the whole site.
// Sourced from advancedcardiology.ca (extracted for the ANRA Health rebrand).
// ============================================================

export const brand = {
  name: "ANRA Health",
  tagline: "Advanced Cardiac Care",
  founder: "Dr. Anmol S. Kapoor",
  phone: "403-475-4475",
  email: "admin@anrahealth.com",
  hours: "7:30 AM – 5:00 PM, Monday to Friday",
};

export const locations: Location[] = [
  {
    tag: "North East",
    name: "North East Clinic",
    address: "201 – 3151 27 St NE, Calgary, AB T1Y 0B4",
    phone: "403-475-4475",
    fax: "403.235.4147",
  },
  {
    tag: "Meadow Miles",
    name: "Meadow Miles Clinic",
    address: "250 – 8500 Blackfoot Trail SE, Calgary, AB T2J 7E1",
    phone: "403.879.7911",
    fax: "403.879.7899",
  },
];

export const languages = [
  "English", "Punjabi", "Hindi", "Urdu", "Polish",
  "Swahili", "Tagalog", "Ukrainian", "Gujarati", "Russian",
];

export const services: Service[] = [
  {
    slug: "cardiology-consultation",
    icon: "Heart",
    name: "Cardiology Consultation",
    short: "Comprehensive heart health evaluations led by our cardiology team.",
    long: "Cardiovascular consultation is the first step to successful cardiac care and the most important aspect of medical treatment. It's an opportunity for patients to discuss their cardiac problems and current complaints, understand the risks and complications, and receive a complete risk assessment with suggestions to help modify risk factors.",
  },
  {
    slug: "exercise-stress-echo",
    icon: "Activity",
    name: "Exercise Stress Echocardiogram",
    short: "Alberta's first onsite Exercise Stress Echo program.",
    long: "The Exercise Stress Echo test involves exercising on a treadmill while you are closely monitored. It helps determine how well your heart tolerates activity and evaluates heart function. This modality is more specific than a thallium stress test, without the radiation exposure. Please wear comfortable clothing and running shoes, and do not apply any creams, lotions, or oils on your chest on the day of the exam.",
  },
  {
    slug: "internal-medicine",
    icon: "Stethoscope",
    name: "Internal Medicine",
    short: "Whole-person care for complex and chronic conditions.",
    long: "Our internal medicine team provides coordinated care for complex, chronic, and multi-system conditions, working alongside cardiology and endocrinology to ensure every part of your health picture is considered.",
  },
  {
    slug: "endocrinology",
    icon: "FlaskConical",
    name: "Endocrinology",
    short: "Diabetes, thyroid, and hormonal health.",
    long: "Complex Diabetes, Young Type 2 Diabetes, Hypothyroidism, Hyperthyroidism, Hyperparathyroidism, PCOS, Amenorrhoea, Hirsutism, Adrenal Disease, and Pituitary Disorders are managed by our endocrinology specialists.",
  },
  {
    slug: "ecg",
    icon: "Activity",
    name: "Electrocardiogram (ECG)",
    short: "Records the electrical activity of your heart.",
    long: "An ECG records the electrical activity of the heart. The heart produces tiny electrical impulses which spread through the heart muscle to make it contract; these impulses can be detected by the ECG machine. You may have an ECG to help find the cause of symptoms such as palpitations or chest pain.",
  },
  {
    slug: "holter-monitoring",
    icon: "Radio",
    name: "Holter Monitoring",
    short: "24-hour+ heart rhythm monitoring.",
    long: "Holter monitoring is used to diagnose heart rhythm disturbances, specifically to find the cause of palpitations or dizziness. You wear a small recording device connected to electrodes on your chest to get a reading of your heart rate and rhythm over 24 hours or longer, which is then analyzed to determine the cause of any arrhythmia.",
  },
  {
    slug: "echocardiography",
    icon: "Activity",
    name: "Echocardiography",
    short: "Ultrasound imaging of the heart's structure and function.",
    long: "Echocardiography is used to diagnose certain cardiovascular diseases. It is one of the most widely used diagnostic tests for heart disease — an echocardiogram can record the electrical activity of your heart on graph paper.",
  },
  {
    slug: "carotid-ultrasound",
    icon: "Radio",
    name: "Carotid Ultrasound",
    short: "Imaging of the carotid arteries for stroke risk assessment.",
    long: "Carotid ultrasound imaging assesses blood flow through the carotid arteries in the neck, helping identify plaque buildup and stroke risk factors.",
  },
  {
    slug: "myocardial-perfusion-imaging",
    icon: "Activity",
    name: "Myocardial Perfusion Imaging",
    short: "Detailed imaging of blood flow to the heart muscle.",
    long: "Myocardial Perfusion Imaging evaluates blood flow to the heart muscle, helping identify areas affected by reduced circulation.",
  },
  {
    slug: "ambulatory-bp-monitoring",
    icon: "Stethoscope",
    name: "24-Hour Ambulatory BP Monitoring",
    short: "Blood pressure measured as you move through your normal day.",
    long: "Ambulatory Blood Pressure Monitoring is when your blood pressure is measured as you move around, living your normal daily life. It is a normal and routine part of cardiac risk assessment.",
  },
];

export const cardiacSymptoms: Symptom[] = [
  { name: "Chest Pain", desc: "A common symptom that can indicate a range of cardiac conditions and always warrants evaluation." },
  { name: "Shortness of Breath", desc: "Difficulty breathing during activity or at rest can be a sign of underlying heart or lung conditions." },
  { name: "Palpitations", desc: "The sensation of a rapid, fluttering, or 'thumping' heartbeat." },
  { name: "Dizziness / Lightheadedness", desc: "Can be related to heart rhythm disturbances or blood pressure changes." },
  { name: "Fatigue", desc: "Unexplained or persistent tiredness can sometimes point to cardiac causes." },
  { name: "Swelling (Edema)", desc: "Fluid retention in the legs or ankles can be a sign of heart function issues." },
];

export const faqs: Faq[] = [
  {
    q: "What should I bring to my first appointment?",
    a: "It will be helpful if you bring your Alberta Health Card, Photo ID, and a list of your current medications (or the medication bottles themselves, including over-the-counter and herbal supplements). If you have had procedures done outside Alberta, please bring those records too.",
  },
  {
    q: "What happens during my first visit?",
    a: "Your vital signs will be taken — blood pressure, heart rate, height, and weight. We also ask about language barriers so we can communicate appropriately. The physician will complete an interview and physical exam. All information given to us is confidential.",
  },
  {
    q: "What are your clinic hours?",
    a: "Our regular clinic hours are 7:30 AM – 5 PM, Monday through Friday. Some diagnostic procedures may be available on evenings and weekends. Our physicians work by appointment, and while we try to adhere closely to schedule, occasional appointments may run longer than planned.",
  },
  {
    q: "How do I prepare for a Holter monitor test?",
    a: "You'll need to be caffeine-free for 24 hours prior to the exam — this includes coffee, pop, tea, chocolate, and decaffeinated beverages. Please don't eat or drink starting from midnight before the exam. Some medications (beta blockers, calcium channel blockers) may need to be stopped 48 hours prior — confirm with your doctor or pharmacist if unsure.",
  },
];

export const careers: Career[] = [
  { title: "Cardiologist", type: "Physician" },
  { title: "Internal Medicine Physician", type: "Physician" },
  { title: "Endocrinologist", type: "Physician" },
  { title: "Sonographer", type: "Allied Health" },
  { title: "Heart Failure Nurse / LPN", type: "Allied Health" },
];

export const whyChoose: WhyChooseItem[] = [
  { icon: "Award", title: "A Regional First", desc: "First clinic in Alberta to offer onsite Exercise Stress Echocardiograms." },
  { icon: "Globe2", title: "Multilingual Care", desc: "Our team speaks English, Punjabi, Hindi, Urdu, Polish, Ukrainian, and more." },
  { icon: "FlaskConical", title: "Complete Diagnostics", desc: "Consultation and testing in one visit — no separate imaging center." },
  { icon: "Stethoscope", title: "Coordinated Team", desc: "Cardiology, internal medicine, and endocrinology on one shared record." },
];

export const aboutStory = `ANRA Health continues the work of Advanced Cardiology Consultants and Diagnostics — a one-of-a-kind clinic in Western Canada offering complete cardiopulmonary investigations under one roof, founded under the guidance of Dr. Anmol S. Kapoor.

We were the first clinic in Alberta to offer onsite Exercise Stress Echocardiograms — more specific than a thallium stress test, without the radiation exposure. Our multilingual team communicates in English, Punjabi, Hindi, Urdu, Polish, Swahili, Tagalog, Ukrainian, Gujarati, and Russian.`;

export const charmClinic: CharmClinic = {
  fullName: "Community Heart Failure Assessment, Rehabilitation and Management",
  intro: "The CHARM Clinic is Alberta's only community-based, outpatient clinic run on a charitable basis with support and donations from the DIL Walk Foundation and ANRA Health. The clinic is physician-directed, but patient care is managed by a nurse. The CHARM Clinic team consists of Heart Failure and Heart Transplant specialists, Cardiologists, Internal Medicine physicians, a Heart Function Nurse, a Respiratory Therapist, and Echocardiogram and Stress Test Technicians.",
  howItWorks: "The CHARM Clinic's goal is to help keep patients in the community and out of the hospital. Your family physician can refer directly to the CHARM Clinic when heart failure is suspected. You'll be seen by a cardiologist — once diagnosis is confirmed, you're given a second appointment with the Heart Failure Nurse for self-management assistance, patient education, and medication help. You'll also be followed by the Heart Failure Specialist to optimize medications and avoid hospitalizations. Patients without a heart failure diagnosis, or whose heart function improves, receive continued care in the general cardiology clinic.",
  selfCare: "At CHARM Clinic, patients are taught self-care through a 1:1 session with a nurse, who covers daily weights, fluid/sodium restrictions, and warning signs that heart failure is getting worse. Patients also receive handouts and mutually agreed-upon goals to focus on until their next visit.",
  research: "The CHARM Clinic also engages in research trials, including an ongoing trial for Atrial Fibrillation patients (BRAIN-AF, a blinded randomised trial of anticoagulation to prevent ischemic stroke and neurocognitive impairment in AF) and the GOAL study (Guidelines Oriented Approach to Lipid lowering in Canada). We are currently recruiting patients for both trials.",
};

export const clinicalTrials = [
  "XATOA", "ACS III", "Brain AF", "Bristol-Myers Squibb Protocol: IM011047",
  "Aware AF", "Bristol-Myers Squibb Protocol: IM011075", "RAMP", "AbbVie, Inc. Protocol: M16-045",
  "PARTHENON", "AbbVie, Inc. Protocol: M16-046", "GOAL", "AbbVie, Inc. Protocol: M16-766",
  "AbbVie, Inc. Protocol: M16-047", "Incyte Protocol: INCB 18424-306", "AbbVie, Inc. Protocol: M16-813",
  "Pfizer, Inc. Protocol: B7451037", "Asana BioSciences, LLC. Protocol: ASN002AD-201-EXT",
  "Eli Lilly and Company Protocol: L1F-MC-RHCD", "UCB Biopharma SPRL Protocol: PS0007",
];

export const dilWalk = {
  intro: "DIL Walk is a community heart-health initiative supporting cardiac awareness, research, and the CHARM Clinic through fundraising and public education events across Calgary.",
};