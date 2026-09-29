// Password rules for My Health Space — one source of truth for the server
// (backend/patientAuth.ts) and the strength meter in the browser.

const COMMON = [
  "password", "passw0rd", "123456", "1234567890", "qwerty", "letmein", "welcome", "iloveyou",
  "admin", "abc123", "monkey", "dragon", "football", "baseball", "sunshine", "princess",
  "anrahealth", "anra", "health", "myhealth", "calgary", "alberta", "canada",
];

export interface PasswordChecks {
  length: boolean;        // required: 10+ characters
  lettersNumber: boolean; // required: letters and a number
  notCommon: boolean;     // required: not a common password / not your email name
  mixedCase: boolean;     // recommended
  symbol: boolean;        // recommended
  long: boolean;          // recommended: 14+
}

export function passwordChecks(pw: string, email = ""): PasswordChecks {
  const low = pw.toLowerCase();
  const local = email.split("@")[0]?.toLowerCase() || "";
  const commonHit = COMMON.some((c) => low.includes(c)) || /(.)\1{3,}/.test(pw) || /(0123|1234|2345|3456|4567|5678|6789|abcd|qwer)/i.test(pw);
  return {
    length: pw.length >= 10,
    lettersNumber: /[A-Za-z]/.test(pw) && /[0-9]/.test(pw),
    notCommon: pw.length > 0 && !commonHit && !(local.length >= 4 && low.includes(local)),
    mixedCase: /[a-z]/.test(pw) && /[A-Z]/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
    long: pw.length >= 14,
  };
}

/** 0–4: Too weak · Weak · Fair · Good · Strong */
export function passwordScore(pw: string, email = ""): number {
  if (!pw) return 0;
  const c = passwordChecks(pw, email);
  if (!c.length || !c.lettersNumber || !c.notCommon) return pw.length >= 6 ? 1 : 0;
  return 2 + Math.min(2, [c.mixedCase, c.symbol, c.long].filter(Boolean).length);
}
export const SCORE_LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"];

/** First unmet requirement as a sentence, or null if the password is acceptable. */
export function passwordProblem(pw: string, email = ""): string | null {
  if (typeof pw !== "string" || pw.length < 10) return "Use at least 10 characters.";
  if (pw.length > 200) return "Password is too long.";
  const c = passwordChecks(pw, email);
  if (!c.lettersNumber) return "Use letters and at least one number.";
  if (!c.notCommon) return "That password is too easy to guess. Avoid common words, sequences and your email name.";
  return null;
}
