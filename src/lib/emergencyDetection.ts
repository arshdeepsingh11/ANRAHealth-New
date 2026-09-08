// Shared emergency-keyword safety net.
// This is the single source of truth for medical-emergency detection across
// the site — used by both the Symptom Checker (/api/symptom-check) and
// ALBA's general chat (/api/chat). This list is non-negotiable: it is never
// removed or weakened, only ever expanded with more coverage over time.
//
// If a match is found, the caller MUST short-circuit and return a fixed
// "call 911 / go to the nearest ER" message — never let the AI model's own
// judgment override a detected emergency pattern.

export const EMERGENCY_PATTERNS = [
  // Cardiac
  /crushing.{0,15}(chest|pain)/i,
  /chest pain.{0,20}(radiating|arm|jaw)/i,

  // Respiratory
  /can'?t breathe/i,
  /difficulty breathing/i,
  /shortness of breath.{0,20}(severe|sudden|can'?t)/i,
  /throat.{0,15}(closing|swelling shut)/i,

  // Neurological / stroke
  /fainted|passed out|loss of consciousness/i,
  /slurred speech/i,
  /one[- ]?sided weakness|sudden weakness|sudden numbness/i,
  /face.{0,15}(drooping|numb|one side)/i,
  /sudden.{0,15}(confusion|vision loss|severe headache)/i,
  /seizure|convulsion|convulsing/i,

  // Bleeding / trauma
  /severe bleeding/i,
  /bleeding.{0,15}(won'?t stop|uncontrolled)/i,

  // Anaphylaxis / severe allergic reaction
  /anaphylaxis|anaphylactic/i,
  /severe allergic reaction/i,
  /swelling.{0,15}(face|throat|lips).{0,20}(rapid|sudden|difficulty breathing)/i,

  // Mental health crisis — self-harm / suicidal ideation
  /suicidal|suicide|kill myself|end my life|want to die/i,
  /hurt myself|harm myself|self[- ]?harm/i,
  /plan to (kill|hurt|harm)/i,
] as const;

export function detectEmergencyKeywords(text: string): boolean {
  if (!text) return false;
  return EMERGENCY_PATTERNS.some((re) => re.test(text));
}

export const EMERGENCY_MESSAGE =
  "This may describe a medical emergency. Please call 911 or go to the nearest emergency room immediately.";

// Separate, gentler framing for the mental-health-crisis subset of patterns —
// used when a caller wants to route the person toward crisis support
// resources rather than only "call 911 / go to the ER," which reads oddly
// for someone in emotional distress rather than physical danger.
const CRISIS_PATTERNS = [
  /suicidal|suicide|kill myself|end my life|want to die/i,
  /hurt myself|harm myself|self[- ]?harm/i,
  /plan to (kill|hurt|harm)/i,
];

export function detectCrisisKeywords(text: string): boolean {
  if (!text) return false;
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

export const CRISIS_MESSAGE =
  "It sounds like you're going through something really difficult right now. Please reach out for immediate support: call or text 988 (Suicide Crisis Helpline, available 24/7 across Canada), or call 911 if you or someone else is in immediate danger. You deserve support, and there are people ready to help right now.";