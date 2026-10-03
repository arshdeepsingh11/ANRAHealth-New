"use client";

import React from "react";
import type { AppointmentsDTO, ReferralDTO } from "@/lib/portal/types";
import { dayKey, daysBetween } from "@/lib/portal/metrics";
import { usePortal } from "../context";
import { EP, api, prime, useResource } from "../api";
import { C, screenAnim, EmptyCard, Loading, longDateTz, shortDate, btnLink } from "../ui";
import { NIcon } from "@/components/neyu/icons";

export const daysAwayLabel = (iso: string, tz: string) => {
  const d = daysBetween(dayKey(new Date(), tz), dayKey(new Date(iso), tz));
  return d <= 0 ? "Today" : d === 1 ? "Tomorrow" : `${d} days away`;
};

export function Appointments() {
  const { openSheet, toast, tz } = usePortal();
  const { data, error, reload } = useResource<AppointmentsDTO>(EP.appointments);
  if (!data) return <Loading error={error} retry={reload} />;
  const next = data.upcoming[0];

  const reschedule = async () => {
    if (!next || next.rescheduleRequested) return toast("Your care team will contact you to reschedule");
    try { prime(EP.appointments, await api(`/api/portal/appointments/${next.id}`, { body: { action: "reschedule" } })); toast("Your care team will contact you to reschedule"); }
    catch (e: any) { toast(e.message); }
  };

  return (
    <div style={{ ...screenAnim, maxWidth: 720 }}>
      <h1 style={{ margin: "0 0 6px", fontSize: 32, lineHeight: 1.1, fontWeight: 500, letterSpacing: "-.025em" }}>Appointments</h1>
      <p style={{ margin: "0 0 24px", fontSize: 15, color: C.muted }}>Your visits with the NEYU care team.</p>
      <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 500, color: C.muted }}>Upcoming</h2>
      {next ? (
        <article style={{ padding: 24, borderRadius: 22, background: C.card, border: `1px solid ${C.line}`, display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
            <div style={{ width: 60, flex: "none", display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", borderRadius: 14, background: C.tealWash }}>
              <span style={{ fontSize: 12, color: C.tealDark, letterSpacing: ".06em" }}>{longDateTz(next.startsAt, tz, { month: "short" }).toUpperCase()}</span>
              <span style={{ fontSize: 24, fontWeight: 500, color: C.ink }}>{longDateTz(next.startsAt, tz, { day: "numeric" })}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
              <span style={{ fontSize: 18, fontWeight: 500 }}>{next.title}</span>
              <span style={{ fontSize: 15, color: C.ink2 }}>{next.clinician}</span>
              <span style={{ fontSize: 14, color: C.muted }}>{longDateTz(next.startsAt, tz, { weekday: "long", month: "long", day: "numeric" })} · {longDateTz(next.startsAt, tz, { hour: "numeric", minute: "2-digit" })} · {next.location}</span>
              <span style={{ fontSize: 13, color: C.tealMid, marginTop: 4 }}>
                {next.prepSaved ? `Preparation saved · ${next.questionCount} question${next.questionCount === 1 ? "" : "s"}` : daysAwayLabel(next.startsAt, tz)}
                {next.rescheduleRequested ? " · Reschedule requested" : ""}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button onClick={() => openSheet({ t: "prepare" })} className="h-primary" style={{ height: 44, padding: "0 18px", border: "none", borderRadius: 12, background: C.teal, color: C.card, fontSize: 15, fontWeight: 500, cursor: "pointer" }}>Prepare for visit</button>
            <a href={`/api/portal/appointments/${next.id}/ics`} onClick={() => toast("Added to your calendar")} className="h-ghost" style={{ height: 44, padding: "0 16px", border: `1px solid ${C.line12}`, borderRadius: 12, background: "none", fontSize: 15, color: C.ink, display: "flex", alignItems: "center", textDecoration: "none" }}>Add to calendar</a>
            <button onClick={reschedule} style={{ height: 44, padding: "0 16px", border: "none", borderRadius: 12, background: "none", fontSize: 15, color: C.teal, cursor: "pointer" }}>Reschedule</button>
          </div>
        </article>
      ) : (
        <div style={{ marginBottom: 32 }}>
          <EmptyCard icon="ph ph-calendar-blank" title="No upcoming visits" text="When the clinic books your next appointment, it will appear here with everything you need to prepare." maxWidth="none"
            action={data.questions.length ? <button onClick={() => openSheet({ t: "prepare" })} style={{ ...btnLink, marginTop: 4 }}>Your questions for next time ({data.questions.length})<NIcon name="ph-arrow-right" size="1em" tone="currentColor" /></button> : undefined} />
        </div>
      )}
      <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 500, color: C.muted }}>Past</h2>
      {data.past.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {data.past.map((a) => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "14px 0", borderBottom: `1px solid ${C.line}` }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 15 }}>{a.title}</span>
                <span style={{ fontSize: 14, color: C.muted }}>{a.clinician}{a.status === "cancelled" ? " · Cancelled" : a.summaryAvailable ? " · Visit summary available" : ""}</span>
              </div>
              <span style={{ fontSize: 14, color: C.muted, flex: "none" }}>{shortDate(a.startsAt, tz)}</span>
            </div>
          ))}
        </div>
      ) : <p style={{ margin: 0, fontSize: 15, color: C.muted }}>Your past visits will be listed here.</p>}
    </div>
  );
}

export function Referrals() {
  const { go } = usePortal();
  const { data, error, reload } = useResource<ReferralDTO[]>(EP.referrals);
  return (
    <div style={{ ...screenAnim, maxWidth: 640 }}>
      <h1 style={{ margin: "0 0 6px", fontSize: 32, lineHeight: 1.1, fontWeight: 500, letterSpacing: "-.025em" }}>Referrals</h1>
      <p style={{ margin: "0 0 24px", fontSize: 15, color: C.muted }}>Where each referral stands.</p>
      {!data ? <Loading error={error} retry={reload} /> : data.length === 0 ? (
        <EmptyCard icon="ph ph-arrows-split" title="No referrals yet" text="When a referral to NEYU is linked to your account, you'll be able to follow each step here." maxWidth="none" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {data.map((r) => (
            <article key={r.id} style={{ padding: 24, borderRadius: 22, background: C.card, border: `1px solid ${C.line}` }}>
              <span style={{ fontSize: 18, fontWeight: 500 }}>{r.title}</span>
              <p style={{ margin: "4px 0 20px", fontSize: 14, color: C.muted }}>Status: <span style={{ color: C.tealDark, fontWeight: 500 }}>{r.status}</span></p>
              <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {r.steps.map((s, i) => (
                  <li key={s.label} style={{ display: "grid", gridTemplateColumns: "24px minmax(0,1fr)", gap: 14 }}>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ width: 24, height: 24, borderRadius: 12, background: s.done ? C.tealChip : "transparent", border: s.done ? "none" : "1.5px dashed #B9B4AC", color: C.tealDark, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{s.done && <NIcon name="ph-check" size={13} tone="currentColor" />}</span>
                      <span style={{ flex: 1, width: 1, background: i < r.steps.length - 1 ? "rgba(110,168,182,.4)" : "transparent", minHeight: 18 }} />
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", gap: 2, paddingBottom: 18 }}><span style={{ fontSize: 15, color: s.done ? C.ink : C.muted }}>{s.label}</span><span style={{ fontSize: 13, color: C.muted }}>{s.date}</span></span>
                  </li>
                ))}
              </ol>
              {r.appointmentId && <button onClick={() => go("appointments")} style={btnLink}>View appointment<NIcon name="ph-arrow-right" size="1em" tone="currentColor" /></button>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
