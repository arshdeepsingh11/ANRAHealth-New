// PATCH /api/portal/insights/{id} — { action: "seen" | "dismiss" }
import { prisma } from "@backend/db";
import { withPatientMutation, readJson, HttpError } from "@backend/apiHelpers";

export const PATCH = (req: Request, { params }: { params: Promise<{ id: string }> }) => withPatientMutation(async ({ patient }) => {
  const b = await readJson(req);
  const data = b.action === "dismiss" ? { dismissedAt: new Date() } : { seenAt: new Date() };
  const r = await prisma.healthInsight.updateMany({ where: { id: (await params).id.slice(0, 40), patientId: patient.id }, data });
  if (!r.count) throw new HttpError(404, "Not found.");
  return { ok: true };
});
