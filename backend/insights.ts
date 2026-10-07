// Proactive Neyu: turns meaningful, evidence-backed changes into a few calm
// "Neyu noticed" insights. De-duplicated per (patient, key), max a handful,
// respects the patient's "Neyu insights" setting. Runs in the daily job and
// lazily (at most every 12 h) when the patient opens My Health Space.
import { prisma } from "./db";
import { getSpace, type ChangeItem } from "./space";
import { dayKey } from "@/lib/portal/metrics";

type P = { id: string; firstName: string; timezone: string };
const MAX_ACTIVE = 4;

export async function refreshInsights(p: P, force = false): Promise<number> {
  const s = await prisma.patientSettings.findUnique({ where: { patientId: p.id }, select: { aiInsights: true } });
  if (s && !s.aiInsights) return 0;
  const today = dayKey(new Date(), p.timezone), stamp = `insights:${today.slice(0, 10)}`;
  if (!force) {
    const last = await prisma.generatedNote.findUnique({ where: { patientId_kind_period: { patientId: p.id, kind: "insights-run", period: today } } });
    if (last && Date.now() - last.createdAt.getTime() < 12 * 3600e3) return 0;
  }
  const space = await getSpace(p);
  // Meaningful only: new information, or a real change backed by enough data.
  const pick = (c: ChangeItem) => c.status === "new" || (["improved", "worsened", "changed"].includes(c.status) && c.confidence !== "insufficient");
  const cands: { key: string; status: string; area: string; title: string; text: string; evidence: string; confidence: string; go: string | null }[] =
    space.changes.filter(pick).slice(0, 6).map((c) => ({ key: c.key, status: c.status, area: c.area, title: c.title, text: c.text, evidence: JSON.stringify([{ label: c.basis, source: c.source }, ...c.evidence]), confidence: c.confidence, go: c.go || null }));
  const gap = space.gaps.find((g) => g.kind === "limited_data" || g.kind === "outdated_data");
  if (gap) cands.push({ key: `gap:${gap.area}:${today.slice(0, 7)}`, status: "unknown", area: gap.area, title: "Information gap", text: gap.text, evidence: JSON.stringify([{ label: "From what's currently in your Health Space" }]), confidence: "strong", go: gap.action?.go || null });
  let made = 0;
  const recent = new Set((await prisma.healthInsight.findMany({ where: { patientId: p.id, createdAt: { gte: new Date(Date.now() - 45 * 864e5) } }, select: { text: true } })).map((x) => x.text));
  for (const c of cands) {
    if (recent.has(c.text)) continue; // same message (e.g. a duplicate report) — don't repeat it
    recent.add(c.text);
    try { await prisma.healthInsight.create({ data: { patientId: p.id, ...c } }); made++; } catch { /* already shown once */ }
  }
  await prisma.generatedNote.upsert({ where: { patientId_kind_period: { patientId: p.id, kind: "insights-run", period: today } }, create: { patientId: p.id, kind: "insights-run", period: today, body: JSON.stringify({ made, stamp }) }, update: { body: JSON.stringify({ made, stamp }), createdAt: new Date() } }).catch(() => {});
  return made;
}

export async function activeInsights(p: P) {
  await refreshInsights(p).catch((e) => console.error("insights refresh:", e?.message));
  const rows = await prisma.healthInsight.findMany({ where: { patientId: p.id, dismissedAt: null, createdAt: { gte: new Date(Date.now() - 21 * 864e5) } }, orderBy: { createdAt: "desc" }, take: 20 });
  const rank: Record<string, number> = { new: 0, worsened: 1, changed: 2, improved: 3, unknown: 4 };
  return rows.sort((a, b) => (rank[a.status] ?? 5) - (rank[b.status] ?? 5)).slice(0, MAX_ACTIVE).map((r) => ({ id: r.id, status: r.status, area: r.area, title: r.title, text: r.text, confidence: r.confidence, go: r.go, evidence: JSON.parse(r.evidence || "[]"), seen: !!r.seenAt, at: r.createdAt.toISOString() }));
}
