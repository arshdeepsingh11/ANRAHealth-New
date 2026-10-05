// GET /api/portal/space — Health Map, "What changed?" and "What's missing?".
import { getSpace } from "@backend/space";
import { withPatient } from "@backend/apiHelpers";

export const GET = () => withPatient(async ({ patient }) => getSpace(patient));
