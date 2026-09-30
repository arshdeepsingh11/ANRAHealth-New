// Respiratory Medicine — delivered with our partner, Advanced Respiratory Care
// Network (ARC Network, Alberta). Shared by the page and by ALBA.

export const ARC = {
  name: "Advanced Respiratory Care Network",
  short: "ARC Network",
  phone: "1-866-521-2726",
  tel: "tel:+18665212726",
  site: "https://arcnetwork.ca",
  area: "Serving Northern, Central and Southern Alberta.",
  video: "EGvIyhiNohk", // YouTube id, used with permission
  about: "The Advanced Respiratory Care Network specializes in Obstructive Sleep Apnea, Sleep Consultation and Diagnostics, Home Oxygen Services, Respiratory Consultation and Diagnostics, and Cardiology — with experienced pulmonologists and registered respiratory therapists.",
  promise: "Patients are never rushed — they're carefully guided through education and motivation for effective, lasting outcomes, whether that's respiratory diagnostics, home oxygen support, or sleep apnea treatment.",
};

export type RespItem = { name: string; desc: string; icon: string; group: "Respiratory diagnostics" | "Oxygen services" | "Sleep apnea & diagnostics" };

export const RESP_ITEMS: RespItem[] = [
  { group: "Respiratory diagnostics", icon: "ph-wind", name: "Pulmonary Function Testing", desc: "PFTs are crucial diagnostic tools used to assess lung function and detect respiratory issues, including asthma, COPD, and other pulmonary concerns." },
  { group: "Respiratory diagnostics", icon: "ph-flower-tulip", name: "Allergy Testing", desc: "Respiratory and sleep diagnostics including allergy testing to identify triggers affecting your respiratory health." },
  { group: "Respiratory diagnostics", icon: "ph-stethoscope", name: "Pulmonology Consultation", desc: "Experienced pulmonologists and registered respiratory therapists providing timely, quality medical care for concerns from asthma or COPD to sleep apnea." },
  { group: "Oxygen services", icon: "ph-drop", name: "Home Oxygen Equipment", desc: "Advanced Respiratory Care Network is an approved Home Oxygen Provider covered by Alberta Aids for Daily Living (AADL)." },
  { group: "Oxygen services", icon: "ph-shield-check", name: "Oxygen Safety Guidance", desc: "Full guidance and support for safely living with and using home oxygen equipment." },
  { group: "Sleep apnea & diagnostics", icon: "ph-moon-stars", name: "Portable Sleep Study", desc: "A qualified technician sets up a take-home monitor with 3–5 sensors measuring heart rate, oxygen levels, nasal airway pressure, and snoring — one night, in your own bed." },
  { group: "Sleep apnea & diagnostics", icon: "ph-bed", name: "In-Lab Sleep Study (Polysomnography)", desc: "A comprehensive overnight sleep study conducted in a sleep center for a complete diagnostic picture." },
  { group: "Sleep apnea & diagnostics", icon: "ph-mask-happy", name: "CPAP & BiPAP Equipment", desc: "A wide range of CPAP/BiPAP machines, masks, and accessories, chosen to fit each patient's lifestyle, budget, and insurance." },
  { group: "Sleep apnea & diagnostics", icon: "ph-headset", name: "Ongoing CPAP Support", desc: "Immediate, ongoing access to resolve any technical or clinical issues with CPAP machines or sleep therapy." },
];

export const RESP_STEPS = [
  { t: "Referral", d: "Your family doctor refers you for a portable sleep test or an in-lab sleep study (polysomnography)." },
  { t: "Testing", d: "A qualified technician sets up the monitor and shows you how to use it overnight at home. You wear 3–5 sensors collecting heart rate, oxygen levels, nasal airway pressure and snoring data — one night only." },
  { t: "Results & next steps", d: "If the study confirms sleep apnea, the team guides you through education and CPAP/BiPAP options. If it's negative but sleepiness continues, your family doctor may refer you to a sleep physician." },
];
