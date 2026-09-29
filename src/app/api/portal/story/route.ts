// GET /api/portal/story?month=YYYY-MM — monthly health story (ALBA when available).
import { getStory } from "@backend/story";
import { audit } from "@backend/audit";
import { withPatient } from "@backend/apiHelpers";

export const GET = (req: Request) => withPatient(async ({ patient, ip }) => {
  const m = new URL(req.url).searchParams.get("month") || undefined;
  audit(patient.id, "patient", "read", "story", ip);
  return getStory(patient, m && /^\d{4}-\d{2}$/.test(m) ? m : undefined);
});
