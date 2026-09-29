// GET /api/portal/family/{linkId} — read-only summary of a person I care for.
import { getCareSummary } from "@backend/social";
import { withPatient } from "@backend/apiHelpers";

export const GET = (_req: Request, { params }: { params: Promise<{ id: string }> }) =>
  withPatient(async ({ patient }) => getCareSummary(patient, (await params).id.slice(0, 40)));
