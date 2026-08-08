export interface Language {
  code: string;
  label: string;
  native: string;
  rtl?: boolean;
}

export const LANGUAGES: Language[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "ar", label: "Arabic", native: "العربية", rtl: true },
  { code: "fr", label: "French", native: "Français" },
  { code: "sw", label: "Swahili", native: "Kiswahili" },
  { code: "ur", label: "Urdu", native: "اردو", rtl: true },
  { code: "uk", label: "Ukrainian", native: "Українська" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
];
