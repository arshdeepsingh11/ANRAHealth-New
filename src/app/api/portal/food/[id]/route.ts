// DELETE /api/portal/food/{id}
import { prisma } from "@backend/db";
import { withPatientMutation, HttpError } from "@backend/apiHelpers";

export const DELETE = (_r: Request, { params }: { params: Promise<{ id: string }> }) => withPatientMutation(async ({ patient }) => {
  const r = await prisma.foodLog.deleteMany({ where: { id: (await params).id.slice(0, 40), patientId: patient.id } });
  if (!r.count) throw new HttpError(404, "Meal not found.");
  return { ok: true };
});
