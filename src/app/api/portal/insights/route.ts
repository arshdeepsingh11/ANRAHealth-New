// GET /api/portal/insights — "Neyu noticed": a few evidence-backed insights.
import { activeInsights } from "@backend/insights";
import { withPatient } from "@backend/apiHelpers";

export const GET = () => withPatient(async ({ patient }) => ({ insights: await activeInsights(patient) }));
