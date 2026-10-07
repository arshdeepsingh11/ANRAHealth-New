// GET /api/portal/health-story — the longitudinal story (month by month) + this month at a glance.
import { getHealthStory } from "@backend/space";
import { withPatient } from "@backend/apiHelpers";

export const GET = () => withPatient(async ({ patient }) => getHealthStory(patient, 12));
