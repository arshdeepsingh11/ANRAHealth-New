// PUT /api/portal/goals — { goals: string[] } (replaces the list, max 8)
import { prisma } from "@backend/db";
import { audit } from "@backend/audit";
import { withPatientMutation, readJson, HttpError } from "@backend/apiHelpers";

export const PUT = (req: Request) => withPatientMutation(async ({ patient, ip }) => {
  const b = await readJson(req);
  if (!Array.isArray(b.goals)) throw new HttpError(400, "goals must be a list.");
  const goals = [...new Set(b.goals.map((g: unknown) => (typeof g === "string" ? g.trim().slice(0, 60) : "")).filter(Boolean))].slice(0, 8) as string[];
  await prisma.$transaction([
    prisma.goal.deleteMany({ where: { patientId: patient.id } }),
    prisma.goal.createMany({ data: goals.map((label, i) => ({ patientId: patient.id, label, sortOrder: i })) }),
  ]);
  audit(patient.id, "patient", "update", "goals", ip);
  return { goals };
});
