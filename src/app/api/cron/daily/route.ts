// GET /api/cron/daily — the daily job. Call every hour (it only acts once
// per patient per day) with header  Authorization: Bearer $CRON_SECRET
//   • pulls new data from Withings / Oura / WHOOP
//   • emails the ANRA Today brief (patients who turned it on), after 6 AM local
//   • visit nudges 2 days before an appointment (notifAppt)
//   • lab retest reminders (once per test per due date)
import { NextResponse } from "next/server";
import { prisma } from "@backend/db";
import { syncAll, baseUrl } from "@backend/oauth";
import { getBrief } from "@backend/brief";
import { getRetests } from "@backend/labs";
import { sendMail, simpleEmail, emailConfigured } from "@backend/email";
import { dayKey, daysBetween } from "@/lib/portal/metrics";

// Send an email at most once per (patient, kind, period). If sending fails,
// the marker is removed so the next run tries again.
const once = async (patientId: string, kind: string, period: string, send: () => Promise<unknown>) => {
  try { await prisma.generatedNote.create({ data: { patientId, kind, period, body: "{}", emailedAt: new Date() } }); } catch { return false; }
  try { await send(); return true; }
  catch (e) { await prisma.generatedNote.deleteMany({ where: { patientId, kind, period } }); throw e; }
};

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const base = baseUrl(req), out = { synced: 0, briefs: 0, nudges: 0, retests: 0, errors: 0 };
  out.synced = (await syncAll(6)).connections;
  if (!emailConfigured() && process.env.NODE_ENV === "production") return NextResponse.json({ ...out, email: "not configured — emails skipped" });

  const patients = await prisma.patient.findMany({ where: { accountStatus: "active", emailVerifiedAt: { not: null } }, select: { id: true, email: true, firstName: true, timezone: true, settings: { select: { briefEmail: true, notifDaily: true, notifAppt: true, notifWorth: true } } } });
  for (const p of patients) {
    try {
      const now = new Date(), today = dayKey(now, p.timezone);
      const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: p.timezone, hour: "2-digit", hour12: false }).format(now)) % 24;
      if (hour < 6) continue;
      const s = p.settings;
      if (s?.briefEmail && s.notifDaily && (await once(p.id, "brief-email", today, async () => {
        const b = await getBrief(p);
        const lines = [b.message, ...(b.moveAdvice ? [b.moveAdvice.text] : []), ...b.items.slice(0, 4).map((i) => `${i.title}: ${i.text}`)];
        await sendMail({ to: p.email, ...simpleEmail(`${b.headline} Here's your ANRA Today`, lines, { label: "Open My Health Space", url: `${base}/my-health` }, "ANRA Health · Wellness information, not a diagnosis. Emergency? Call 911. Turn off in My Health Space → Profile → Daily brief.") });
      }))) out.briefs++;
      if (s?.notifAppt !== false) {
        const appt = await prisma.appointment.findFirst({ where: { patientId: p.id, status: "scheduled", startsAt: { gte: now } }, orderBy: { startsAt: "asc" }, select: { id: true, clinician: true, startsAt: true } });
        if (appt && daysBetween(today, dayKey(appt.startsAt, p.timezone)) === 2 && (await once(p.id, "visit-nudge", appt.id, () =>
          sendMail({ to: p.email, ...simpleEmail(`Your visit with ${appt.clinician} is in 2 days`, ["Add the questions you want to ask, and take your blood pressure morning and evening until your visit — it helps your care team most.", "You can share your trends and results with your clinician in one tap from Appointments → Prepare."], { label: "Prepare for your visit", url: `${base}/my-health?s=appointments` }) })))) out.nudges++;
      }
      if (s?.notifWorth !== false) {
        for (const r of await getRetests(p, 14)) {
          if (await once(p.id, "retest", `${r.code}:${r.due}`, () =>
            sendMail({ to: p.email, ...simpleEmail(`Your ${r.name} retest is ${r.overdue ? "overdue" : "coming up"}`, [`Your last ${r.name} was on ${r.last}. We suggest re-testing about every ${r.months} months so you can see how your numbers are trending.`, "Book with BioAro and your new result will appear in My Health Space automatically."], { label: "See your results", url: `${base}/my-health?s=results` }) }))) out.retests++;
        }
      }
    } catch (e: any) { out.errors++; console.error("cron patient failed:", e?.message); }
  }
  return NextResponse.json(out);
}
