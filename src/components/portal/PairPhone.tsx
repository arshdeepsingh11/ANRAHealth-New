"use client";

// Phone page after scanning the QR on the computer. One tap gets a private
// sync link; the NEYU Sync shortcut sends Apple Health data to that link;
// this page shows live when NEYU receives it.
import React, { useEffect, useRef, useState } from "react";
import NeyuLogo from "@/components/brand/NeyuLogo";

const C = { ink: "#14181B", ink2: "#3A4147", muted: "#5A626A", line: "#E3DED5", card: "#FFFFFF", teal: "#3F6F7C", tealSoft: "#E8F2F4", good: "#2E7D5B", goodSoft: "#EAF4EE", warn: "#8B4B37", warnSoft: "#FBEDE6", violet: "#6A5096" };
type Claim = { syncLink: string; shortcutUrl: string | null; device: string; local: boolean };
type Status = { connected: boolean; lastAttemptAt: string | null; stored: number; metrics: string[]; rejected: { field: string; reason: string }[] };

function copyText(text: string, input: HTMLInputElement | null) {
  // navigator.clipboard needs https; on a home network (http) fall back to selecting + execCommand.
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(() => true, () => false);
  if (!input) return Promise.resolve(false);
  input.focus(); input.setSelectionRange(0, text.length);
  let ok = false; try { ok = document.execCommand("copy"); } catch { ok = false; }
  return Promise.resolve(ok);
}

function Step({ n, title, done, children }: { n: number; title: string; done?: boolean; children: React.ReactNode }) {
  return (
    <section style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 20, padding: 18, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ width: 30, height: 30, borderRadius: 15, display: "grid", placeItems: "center", fontSize: 14, fontWeight: 600, flex: "none", background: done ? C.good : C.ink, color: "#fff" }}>{done ? <i className="ph ph-check" /> : n}</span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
const btn: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", minHeight: 52, borderRadius: 14, border: 0, background: C.ink, color: "#fff", fontSize: 16, fontWeight: 500, textDecoration: "none", cursor: "pointer" };
const li: React.CSSProperties = { fontSize: 15, lineHeight: 1.5, color: C.ink2 };

export default function PairPhone({ code }: { code: string }) {
  const [claim, setClaim] = useState<Claim | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<boolean | null>(null);
  const [added, setAdded] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const start = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/pair/claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Something went wrong.");
      setClaim(j);
    } catch (e: any) { setErr(e.message || "Couldn't reach NEYU. Check you're on the same Wi-Fi as your computer."); }
    finally { setBusy(false); }
  };
  const copy = async () => { if (claim) setCopied(await copyText(claim.syncLink, input.current)); };

  // Live status once paired.
  useEffect(() => {
    if (!claim) return;
    let stop = false;
    const tick = async () => {
      try { const r = await fetch(`/api/pair/status?code=${encodeURIComponent(code)}`, { cache: "no-store" }); if (r.ok && !stop) setStatus(await r.json()); } catch { /* keep polling */ }
    };
    tick(); const id = setInterval(tick, 4000);
    return () => { stop = true; clearInterval(id); };
  }, [claim, code]);

  const got = status?.lastAttemptAt ? status : null;

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "28px 16px 120px", color: C.ink, display: "grid", gap: 14 }}>
      <header style={{ display: "grid", gap: 8, textAlign: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", justifyContent: "center" }}><NeyuLogo height={40} /></div>
        <h1 style={{ margin: "6px 0 0", fontSize: 28, lineHeight: 1.1, letterSpacing: "-.03em", fontWeight: 500 }}>Connect Apple Health</h1>
        <p style={{ margin: 0, fontSize: 15.5, color: C.muted, lineHeight: 1.5 }}>Your iPhone will send a daily summary — steps, activity, heart and sleep — to My Health Space. You choose what’s shared.</p>
      </header>

      {!claim ? (
        <section style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 20, padding: 20, display: "grid", gap: 14 }}>
          <p style={{ margin: 0, ...li }}>This takes about a minute. You’ll copy one link, add one shortcut, and allow Health access.</p>
          <button onClick={start} disabled={busy} style={{ ...btn, opacity: busy ? 0.6 : 1 }}>{busy ? "Connecting…" : "Start"}<i className="ph ph-arrow-right" /></button>
          {err && <p role="alert" style={{ margin: 0, padding: "12px 14px", borderRadius: 12, background: C.warnSoft, color: C.warn, fontSize: 15 }}>{err}</p>}
        </section>
      ) : (
        <>
          {claim.local && (
            <p style={{ margin: 0, padding: "12px 14px", borderRadius: 14, background: C.warnSoft, color: C.warn, fontSize: 14, lineHeight: 1.5, display: "flex", gap: 10 }}>
              <i className="ph ph-wifi-high" style={{ fontSize: 18, flex: "none" }} />Test mode: NEYU is running on your computer, so syncing only works while it’s on and your iPhone is on the same Wi-Fi.
            </p>
          )}
          <Step n={1} title="Copy your private sync link" done={!!copied}>
            <input ref={input} readOnly value={claim.syncLink} onFocus={(e) => e.currentTarget.select()} aria-label="Your private sync link"
              style={{ width: "100%", height: 46, padding: "0 12px", borderRadius: 12, border: `1px solid ${C.line}`, background: "#F6F4F0", fontSize: 13, fontFamily: "ui-monospace, monospace", color: C.ink }} />
            <button onClick={copy} style={btn}><i className={copied ? "ph ph-check" : "ph ph-copy"} />{copied ? "Copied" : "Copy link"}</button>
            {copied === false && <p style={{ margin: 0, fontSize: 14, color: C.warn }}>Tap the link above, then tap Copy.</p>}
            <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Shown once. Anyone with this link can add data to your record — don’t share it.</p>
          </Step>

          <Step n={2} title="Add the NEYU Sync shortcut" done={added}>
            {claim.shortcutUrl ? (
              <>
                <a href={claim.shortcutUrl} onClick={() => setAdded(true)} style={{ ...btn, background: "linear-gradient(120deg,#3F6F7C,#6A5096)" }}><i className="ph ph-plus-circle" />Add NEYU Sync</a>
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}>
                  <li style={li}>Tap <b>Add Shortcut</b>.</li>
                  <li style={li}>When it asks for your <b>NEYU sync link</b>, tap the box and <b>Paste</b>.</li>
                  <li style={li}>Tap <b>Add Shortcut</b> again to finish.</li>
                </ol>
              </>
            ) : (
              <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                <li style={li}>Open <b>Shortcuts</b> → tap <b>+</b> → name it <b>NEYU Sync</b>.</li>
                <li style={li}>Add <b>Find Health Samples</b>: Type <b>Steps</b> · Start Date <b>is today</b> · Group By <b>Day</b>.</li>
                <li style={li}>Add <b>Get Contents of URL</b> → paste your link as the URL.</li>
                <li style={li}>Tap the arrow › → Method <b>POST</b> → Request Body <b>JSON</b> → Add new field → <b>Text</b> → key <code>steps</code>, value <b>Health Samples</b>.</li>
                <li style={li}>Tap <b>Done</b>. No header or token needed — the link includes it.</li>
                <li style={{ ...li, listStyle: "none", marginLeft: -20 }}><button onClick={() => setAdded(true)} style={{ ...btn, minHeight: 44, background: "none", color: C.teal, border: `1px solid ${C.line}` }}>I’ve made the shortcut</button></li>
              </ol>
            )}
          </Step>

          <Step n={3} title="Run it once" done={!!got?.stored}>
            <p style={{ margin: 0, ...li }}>In Shortcuts, tap <b>NEYU Sync</b>. When iPhone asks, tap <b>Allow</b> for Health data and <b>Allow</b> to send to NEYU.</p>
            <div aria-live="polite" style={{ padding: "14px 16px", borderRadius: 14, background: got?.stored ? C.goodSoft : got ? C.warnSoft : C.tealSoft, display: "grid", gap: 6 }}>
              {!got && <span style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 15, color: C.teal }}><i className="ph ph-circle-notch" style={{ animation: "spin 1s linear infinite" }} />Waiting for your iPhone…</span>}
              {got && got.stored > 0 && <>
                <span style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 16, color: C.good, fontWeight: 500 }}><i className="ph-fill ph-check-circle" style={{ fontSize: 22 }} />NEYU received your data</span>
                <span style={{ fontSize: 14, color: C.ink2 }}>{got.metrics.join(" · ")}</span>
              </>}
              {got && got.stored === 0 && <>
                <span style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 15, color: C.warn, fontWeight: 500 }}><i className="ph ph-info" style={{ fontSize: 20 }} />Your iPhone reached NEYU, but sent no data</span>
                <span style={{ fontSize: 14, color: C.ink2 }}>{got.rejected.length ? got.rejected.slice(0, 3).map((r) => `${r.field}: ${r.reason}`).join(" · ") : "Apple Health had no samples for today yet — walk a little and run it again."}</span>
              </>}
            </div>
          </Step>

          <Step n={4} title="Make it automatic">
            <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}>
              <li style={li}>In Shortcuts, tap <b>Automation</b> → <b>+</b> (or <b>New Automation</b>).</li>
              <li style={li}>Choose <b>Time of Day</b> → <b>9:00 PM</b> → <b>Daily</b>.</li>
              <li style={li}>Select <b>Run Immediately</b> → <b>Next</b>.</li>
              <li style={li}>Pick <b>NEYU Sync</b>. Done — it runs every evening.</li>
            </ol>
          </Step>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted, textAlign: "center" }}>You can close this page. Your computer shows the same status.</p>
        </>
      )}
    </main>
  );
}
