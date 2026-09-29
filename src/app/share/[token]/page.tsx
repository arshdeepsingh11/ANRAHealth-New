// /share/{token} — read-only health summary a patient shared with a clinician.
// Expiring, revocable, never indexed; every view is counted and logged.
import type { Metadata } from "next";
import { getSharedView } from "@backend/social";
import { clientMeta } from "@backend/patientAuth";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shared health summary — ANRA Health", robots: { index: false, follow: false }, referrer: "no-referrer" };

const card: React.CSSProperties = { padding: "20px 22px", borderRadius: 18, background: "#FFFDFB", border: "1px solid rgba(29,35,39,.07)", marginBottom: 16 };
const th: React.CSSProperties = { textAlign: "left", padding: "8px 10px", fontSize: 12, color: "#5B6369", fontWeight: 500, borderBottom: "1px solid rgba(29,35,39,.1)" };
const td: React.CSSProperties = { padding: "8px 10px", fontSize: 14, borderBottom: "1px solid rgba(29,35,39,.06)" };

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const v = await getSharedView(decodeURIComponent(token), (await clientMeta()).ip);
  if (!v) return (
    <main style={{ maxWidth: 640, margin: "48px auto", padding: "0 16px", fontFamily: "inherit" }}>
      <div style={card}><h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 500 }}>This link has expired or was turned off</h1><p style={{ margin: 0, color: "#5B6369", fontSize: 15 }}>Ask the patient to share a new link from My Health Space.</p></div>
    </main>
  );
  return (
    <main className="share-print" style={{ maxWidth: 880, margin: "32px auto 64px", padding: "0 16px", color: "#1D2327" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: ".14em", color: "#5B6369", fontWeight: 500 }}>ANRA HEALTH · SHARED BY THE PATIENT</div>
          <h1 style={{ margin: "6px 0 4px", fontSize: 30, fontWeight: 500, letterSpacing: "-.02em" }}>{v.name}</h1>
          <div style={{ fontSize: 14, color: "#5B6369" }}>{v.dob ? `DOB ${v.dob}${v.age != null ? ` · ${v.age} y` : ""} · ` : ""}For: {v.label} · Link valid until {v.expires}</div>
        </div>
        <PrintButton />
      </div>
      <p style={{ ...card, background: "#FBEEE8", fontSize: 13.5, lineHeight: 1.55, color: "#8B4B37" }}>Patient-generated and consumer-device data (wearables, home measurements, self-reported check-ins). Not validated clinical measurements. Generated {v.generated}.</p>

      {v.bp && (
        <section style={card}>
          <h2 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 500 }}>Home blood pressure</h2>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: "#454C52" }}>7-day average: <b>{v.bp.avg7 || "—"}</b> · 30-day average: <b>{v.bp.avg30 || "—"}</b> · {v.bp.status}</p>
          {v.bp.readings.length > 0 && <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th style={th}>When</th><th style={th}>BP (mmHg)</th><th style={th}>Pulse</th></tr></thead><tbody>{v.bp.readings.map((r, i) => <tr key={i}><td style={td}>{r.when}</td><td style={td}>{r.value}</td><td style={td}>{r.pulse}</td></tr>)}</tbody></table></div>}
        </section>
      )}
      {v.scope.includes("trends") && (
        <section style={card}>
          <h2 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 500 }}>Wearable and home trends</h2>
          {v.trends.length ? <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}><thead><tr><th style={th}>Signal</th><th style={th}>Latest</th><th style={th}>7-day avg</th><th style={th}>30-day avg</th><th style={th}>90-day avg</th></tr></thead><tbody>{v.trends.map((t) => <tr key={t.label}><td style={td}>{t.label}</td><td style={td}>{t.last}</td><td style={td}>{t.avg7}</td><td style={td}>{t.avg30}</td><td style={td}>{t.avg90}</td></tr>)}</tbody></table></div> : <p style={{ margin: 0, color: "#5B6369", fontSize: 14 }}>No trend data yet.</p>}
        </section>
      )}
      {v.scope.includes("labs") && (
        <section style={card}>
          <h2 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 500 }}>Latest lab results</h2>
          {v.labs.length ? <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th style={th}>Test</th><th style={th}>Result</th><th style={th}>Reference</th><th style={th}>Collected</th></tr></thead><tbody>{v.labs.map((l) => <tr key={l.name}><td style={td}>{l.name}</td><td style={{ ...td, color: l.flag ? "#8B4B37" : undefined, fontWeight: l.flag ? 500 : 400 }}>{l.value}{l.flag ? " ⚑" : ""}</td><td style={td}>{l.ref}</td><td style={td}>{l.date}</td></tr>)}</tbody></table></div> : <p style={{ margin: 0, color: "#5B6369", fontSize: 14 }}>No results.</p>}
        </section>
      )}
      {v.scope.includes("lifestyle") && (
        <section style={card}>
          <h2 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 500 }}>Lifestyle check-ins (14 days)</h2>
          {v.lifestyle.length ? <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th style={th}>Day</th><th style={th}>Water</th><th style={th}>Caffeine</th><th style={th}>Alcohol</th><th style={th}>Mood</th><th style={th}>Stress</th></tr></thead><tbody>{v.lifestyle.map((l) => <tr key={l.day}><td style={td}>{l.day}</td><td style={td}>{l.water}</td><td style={td}>{l.caffeine}</td><td style={td}>{l.alcohol}</td><td style={td}>{l.mood}</td><td style={td}>{l.stress}</td></tr>)}</tbody></table></div> : <p style={{ margin: 0, color: "#5B6369", fontSize: 14 }}>No check-ins.</p>}
        </section>
      )}
      <p style={{ fontSize: 12.5, color: "#737A80" }}>Shared from ANRA Health My Health Space. The patient can turn this link off at any time.</p>
    </main>
  );
}
