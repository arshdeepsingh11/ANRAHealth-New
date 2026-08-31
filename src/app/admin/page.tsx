import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminToken } from "@backend/adminAuth";
import { prisma } from "@backend/db";
import LogoutButton from "@/components/admin/LogoutButton";

function formatDate(d: Date) {
  return new Date(d).toLocaleString("en-CA", {
    timeZone: "America/Edmonton",
    dateStyle: "short",
    timeStyle: "short",
  });
}

function SectionCard({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-graphite-900">{title}</h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gold-50 text-gold-700">{count} total</span>
      </div>
      {children}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!verifyAdminToken(token)) {
    redirect("/admin/login");
  }

  const [
    pageVisitCount,
    referralCount,
    symptomCheckCount,
    conversationCount,
    longevityCount,
    labCheckCount,
    recentReferrals,
    recentSymptomChecks,
    recentConversations,
    recentLongevity,
    recentLabChecks,
    recentVisits,
  ] = await Promise.all([
    prisma.pageVisit.count(),
    prisma.referralSubmission.count(),
    prisma.symptomCheckLog.count(),
    prisma.albaConversation.count(),
    prisma.longevityAssessment.count(),
    prisma.labResultCheck.count(),
    prisma.referralSubmission.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.symptomCheckLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.albaConversation.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { messages: true } }),
    prisma.longevityAssessment.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.labResultCheck.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.pageVisit.findMany({ orderBy: { createdAt: "desc" }, take: 15 }),
  ]);

  return (
    <div style={{ background: "linear-gradient(160deg, #313425 0%, #23261a 45%, #14160f 100%)", minHeight: "100vh" }}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-1">ANRA Health — Internal</p>
            <h1 className="text-3xl font-display font-bold text-graphite-900">Admin Dashboard</h1>
          </div>
          <LogoutButton />
        </div>

        {/* Overview counts */}
        <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            ["Page Visits", pageVisitCount],
            ["Referrals", referralCount],
            ["Symptom Checks", symptomCheckCount],
            ["ALBA Chats", conversationCount],
            ["Longevity", longevityCount],
            ["Lab Checks", labCheckCount],
          ].map(([label, count]) => (
            <div key={label as string} className="glass rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-graphite-900">{count as number}</p>
              <p className="text-xs text-graphite-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <SectionCard title="Recent Referral Submissions" count={referralCount}>
            <div className="space-y-3">
              {recentReferrals.length === 0 && <p className="text-sm text-graphite-400">No referrals yet.</p>}
              {recentReferrals.map((r) => (
                <div key={r.id} className="rounded-xl p-3.5 bg-pearl-50 text-sm">
                  <div className="flex justify-between items-start gap-3 mb-1">
                    <span className="font-semibold text-graphite-900">{r.patientName || "(no name)"}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gold-100 text-gold-700 shrink-0">{r.type}</span>
                  </div>
                  <p className="text-xs text-graphite-500">{r.urgency || "—"} · {formatDate(r.createdAt)}</p>
                  {r.clinicalNotes && <p className="text-xs text-graphite-600 mt-1.5">{r.clinicalNotes}</p>}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Recent Symptom Checks" count={symptomCheckCount}>
            <div className="space-y-3">
              {recentSymptomChecks.length === 0 && <p className="text-sm text-graphite-400">No symptom checks yet.</p>}
              {recentSymptomChecks.map((s) => (
                <div key={s.id} className="rounded-xl p-3.5 bg-pearl-50 text-sm">
                  <div className="flex justify-between items-start gap-3 mb-1">
                    <span className="font-semibold text-graphite-900">{s.specialty} — {s.recommendedDiscipline}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${s.emergency ? "bg-red-100 text-red-700" : "bg-gold-100 text-gold-700"}`}>{s.urgency}</span>
                  </div>
                  <p className="text-xs text-graphite-500 mb-1">{formatDate(s.createdAt)}</p>
                  <p className="text-xs text-graphite-600">{s.description}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Recent ALBA Conversations" count={conversationCount}>
            <div className="space-y-3">
              {recentConversations.length === 0 && <p className="text-sm text-graphite-400">No conversations yet.</p>}
              {recentConversations.map((c) => (
                <div key={c.id} className="rounded-xl p-3.5 bg-pearl-50 text-sm">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <span className="font-semibold text-graphite-900">{c.pageContext || "Unknown page"}</span>
                    <span className="text-xs text-graphite-500 shrink-0">{c.messages.length} messages</span>
                  </div>
                  <p className="text-xs text-graphite-500 mb-2">{formatDate(c.createdAt)}</p>
                  <div className="space-y-1">
                    {c.messages.slice(0, 4).map((m) => (
                      <p key={m.id} className="text-xs text-graphite-600">
                        <span className="font-semibold">{m.role === "user" ? "Patient: " : "ALBA: "}</span>
                        {m.text.length > 100 ? m.text.slice(0, 100) + "…" : m.text}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Recent Longevity Assessments" count={longevityCount}>
            <div className="space-y-3">
              {recentLongevity.length === 0 && <p className="text-sm text-graphite-400">No assessments yet.</p>}
              {recentLongevity.map((l) => (
                <div key={l.id} className="rounded-xl p-3.5 bg-pearl-50 text-sm">
                  <p className="text-xs text-graphite-500 mb-1">{formatDate(l.createdAt)}</p>
                  <p className="text-xs text-graphite-600">{l.summary}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Recent Lab Result Checks" count={labCheckCount}>
            <div className="space-y-3">
              {recentLabChecks.length === 0 && <p className="text-sm text-graphite-400">No lab checks yet.</p>}
              {recentLabChecks.map((l) => (
                <div key={l.id} className="rounded-xl p-3.5 bg-pearl-50 text-sm">
                  <div className="flex justify-between items-start gap-3 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gold-100 text-gold-700 shrink-0">{l.inputType}</span>
                    <span className="text-xs text-graphite-500">{formatDate(l.createdAt)}</span>
                  </div>
                  <p className="text-xs text-graphite-600 mt-1">{l.overallSummary}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Recent Page Visits" count={pageVisitCount}>
            <div className="space-y-1.5">
              {recentVisits.length === 0 && <p className="text-sm text-graphite-400">No visits yet.</p>}
              {recentVisits.map((v) => (
                <div key={v.id} className="flex justify-between text-xs text-graphite-600 py-1 border-b border-pearl-200 last:border-0">
                  <span className="font-mono">{v.path}</span>
                  <span className="text-graphite-400">{formatDate(v.createdAt)}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}