"use client";

// A digital map of Calgary drawn in SVG (no Google embed): rivers, the main
// trails and Stoney Trail, both NEYU clinics as live pins, and — when you add
// your postal code — Neyu finds the closer clinic and draws the way there.
// Distances are straight-line estimates from postal-code (FSA) centres.
import React, { useMemo, useState } from "react";
import { locations } from "@/data/content";
import { N } from "./kit";
import { NIcon } from "./icons";

type LL = [number, number]; // [lat, lon]
const BOX = { latN: 51.205, latS: 50.855, lonW: -114.33, lonE: -113.79 };
const W = 1000, H = 640;
const px = ([lat, lon]: LL): [number, number] => [((lon - BOX.lonW) / (BOX.lonE - BOX.lonW)) * W, ((BOX.latN - lat) / (BOX.latN - BOX.latS)) * H];
const line = (pts: LL[]) => pts.map((p, i) => { const [x, y] = px(p); return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`; }).join(" ");
const curve = (pts: LL[]) => { const P = pts.map(px); return P.reduce((d, [x, y], i) => { if (!i) return `M${x.toFixed(1)} ${y.toFixed(1)}`; const [x0, y0] = P[i - 1]; const mx = (x0 + x) / 2, my = (y0 + y) / 2; return `${d} Q${x0.toFixed(1)} ${y0.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`; }, "") + ` L${P[P.length - 1][0].toFixed(1)} ${P[P.length - 1][1].toFixed(1)}`; };

export const CLINIC_LL: Record<string, LL> = { "North East": [51.0788, -113.9962], "Meadow Miles": [50.9772, -114.0478] };
const ROADS: { n: string; major?: boolean; pts: LL[] }[] = [
  { n: "Deerfoot Trail", major: true, pts: [[51.2, -114.006], [51.13, -114.02], [51.085, -114.03], [51.055, -114.035], [51.04, -114.04], [51.0, -114.03], [50.955, -114.02], [50.9, -114.0], [50.86, -113.985]] },
  { n: "Stoney Trail", major: true, pts: [[51.155, -114.215], [51.178, -114.13], [51.175, -114.06], [51.16, -113.98], [51.13, -113.935], [51.07, -113.925], [51.0, -113.925], [50.93, -113.935], [50.89, -113.99], [50.88, -114.06], [50.9, -114.14], [50.95, -114.2], [51.01, -114.215], [51.08, -114.225], [51.155, -114.215]] },
  { n: "Glenmore Trail", pts: [[50.983, -114.215], [50.986, -114.12], [50.982, -114.05], [50.98, -113.99], [50.979, -113.925]] },
  { n: "16 Ave N", pts: [[51.072, -114.26], [51.069, -114.15], [51.067, -114.07], [51.067, -114.0], [51.069, -113.925]] },
  { n: "Macleod Trail", pts: [[51.046, -114.064], [51.0, -114.067], [50.95, -114.07], [50.9, -114.068], [50.86, -114.07]] },
  { n: "Blackfoot Trail", pts: [[51.03, -114.042], [51.0, -114.045], [50.975, -114.05], [50.955, -114.052]] },
  { n: "Crowchild Trail", pts: [[51.13, -114.215], [51.09, -114.15], [51.06, -114.12], [51.035, -114.11], [51.0, -114.12], [50.97, -114.135]] },
  { n: "McKnight Blvd", pts: [[51.095, -114.1], [51.096, -114.03], [51.097, -113.96], [51.098, -113.925]] },
];
const RIVERS: LL[][] = [
  [[51.105, -114.33], [51.09, -114.24], [51.083, -114.19], [51.066, -114.13], [51.058, -114.09], [51.053, -114.06], [51.045, -114.035], [51.02, -114.02], [50.98, -114.015], [50.93, -114.0], [50.89, -113.97], [50.855, -113.95]],
  [[50.968, -114.2], [50.975, -114.155], [50.995, -114.115], [51.02, -114.085], [51.035, -114.06], [51.045, -114.04]],
];
// Approximate centres of Calgary-area postal codes (first three characters).
const FSA: Record<string, LL> = {
  T1X: [51.04, -113.82], T1Y: [51.077, -113.966], T2A: [51.046, -113.962], T2B: [51.02, -113.972], T2C: [50.99, -114.0], T2E: [51.062, -114.03], T2G: [51.034, -114.04], T2H: [50.99, -114.062], T2J: [50.953, -114.05], T2K: [51.098, -114.07],
  T2L: [51.09, -114.13], T2M: [51.07, -114.085], T2N: [51.06, -114.105], T2P: [51.047, -114.07], T2R: [51.039, -114.077], T2S: [51.024, -114.083], T2T: [51.03, -114.112], T2V: [50.982, -114.083], T2W: [50.951, -114.1], T2X: [50.908, -114.06],
  T2Y: [50.915, -114.093], T2Z: [50.925, -113.98], T3A: [51.128, -114.158], T3B: [51.086, -114.19], T3C: [51.04, -114.14], T3E: [51.008, -114.13], T3G: [51.128, -114.228], T3H: [51.04, -114.21], T3J: [51.118, -113.952], T3K: [51.152, -114.07],
  T3L: [51.152, -114.212], T3M: [50.886, -113.97], T3N: [51.152, -113.963], T3P: [51.172, -114.11], T3R: [51.172, -114.162], T3S: [50.9, -113.94], T3Z: [51.08, -114.32],
};
const km = (a: LL, b: LL) => { const R = 6371, dLat = ((b[0] - a[0]) * Math.PI) / 180, dLon = ((b[1] - a[1]) * Math.PI) / 180; const s = Math.sin(dLat / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(s)); };

export default function CityMap({ height = "auto" }: { height?: number | string }) {
  const [pick, setPickState] = useState<string>(locations[0].tag);
  const [manual, setManual] = useState(false);
  const setPick = (t: string) => { setPickState(t); setManual(true); };
  const [postal, setPostal] = useState("");
  const fsa = postal.toUpperCase().replace(/\s/g, "").slice(0, 3);
  const you = FSA[fsa];
  const near = useMemo(() => {
    if (!you) return null;
    const rows = locations.map((l) => ({ l, d: km(you, CLINIC_LL[l.tag]) })).sort((a, b) => a.d - b.d);
    return rows;
  }, [you]);
  const target = near && !manual ? near[0].l.tag : pick;
  const cur = locations.find((l) => l.tag === target)!;
  const [yx, yy] = you ? px(you) : [0, 0];
  const [tx, ty] = px(CLINIC_LL[target]);
  const down = px([51.047, -114.067]), air = px([51.131, -114.011]);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 18, alignItems: "stretch" }}>
      <div style={{ position: "relative", borderRadius: 26, overflow: "hidden", border: `1px solid ${N.line}`, background: "linear-gradient(160deg,#FBFCFB,#F1F6F6)", minHeight: 300, height }}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Map of Calgary showing the NEYU ${locations.map((l) => l.tag).join(" and ")} clinics${you ? ` and your area (${fsa})` : ""}`} style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="cmGrid" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="rgba(14,27,44,.08)" /></pattern>
            <linearGradient id="cmG" x1="0" x2="1"><stop offset="0" stopColor="#2FBF94" /><stop offset="1" stopColor="#2273D6" /></linearGradient>
            <radialGradient id="cmPulse"><stop offset="0" stopColor="#1FA7B4" stopOpacity=".45" /><stop offset="1" stopColor="#1FA7B4" stopOpacity="0" /></radialGradient>
          </defs>
          <rect width={W} height={H} fill="url(#cmGrid)" />
          {/* city limits glow */}
          <path d={line(ROADS[1].pts)} fill="rgba(31,167,180,.05)" stroke="none" />
          <ellipse cx={px([50.983, -114.13])[0]} cy={px([50.983, -114.13])[1]} rx="26" ry="15" fill="rgba(31,167,180,.18)" />
          {RIVERS.map((r, i) => <path key={i} d={curve(r)} fill="none" stroke="rgba(31,167,180,.38)" strokeWidth={i ? 3 : 5} strokeLinecap="round" />)}
          {ROADS.map((r) => <path key={r.n} d={curve(r.pts)} fill="none" stroke={r.major ? "rgba(14,27,44,.26)" : "rgba(14,27,44,.14)"} strokeWidth={r.major ? 3 : 1.8} strokeLinecap="round" strokeLinejoin="round" />)}
          {ROADS.filter((r) => r.major).map((r) => { const [x, y] = px(r.pts[r.n === "Deerfoot Trail" ? 7 : 3]); return <text key={r.n} x={x + 8} y={y} fontSize="12" fill="rgba(14,27,44,.45)" style={{ fontFamily: "inherit", letterSpacing: ".06em" }}>{r.n.toUpperCase()}</text>; })}
          <g transform={`translate(${down[0]} ${down[1]})`}><rect x="-9" y="-9" width="18" height="18" rx="4" fill="#fff" stroke="rgba(14,27,44,.3)" /><text x="14" y="4" fontSize="12.5" fill="rgba(14,27,44,.6)" style={{ fontFamily: "inherit" }}>Downtown</text></g>
          <g transform={`translate(${air[0]} ${air[1]})`}><circle r="6" fill="#fff" stroke="rgba(14,27,44,.3)" /><text x="12" y="4" fontSize="12.5" fill="rgba(14,27,44,.5)" style={{ fontFamily: "inherit" }}>YYC</text></g>
          {you && <>
            <path d={`M${yx} ${yy} Q${(yx + tx) / 2 + (ty - yy) * 0.15} ${(yy + ty) / 2 - (tx - yx) * 0.15} ${tx} ${ty}`} fill="none" stroke="url(#cmG)" strokeWidth="3" strokeDasharray="8 8"><animate attributeName="stroke-dashoffset" from="32" to="0" dur="1.2s" repeatCount="indefinite" /></path>
            <g transform={`translate(${yx} ${yy})`}><circle r="22" fill="url(#cmPulse)"><animate attributeName="r" values="14;26;14" dur="2.4s" repeatCount="indefinite" /></circle><circle r="8" fill="#fff" stroke="#0E1B2C" strokeWidth="2.5" /><text y="-16" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0E1B2C" style={{ fontFamily: "inherit" }}>You · {fsa}</text></g>
          </>}
          {locations.map((l) => { const [x, y] = px(CLINIC_LL[l.tag]); const on = l.tag === target; return (
            <g key={l.tag} transform={`translate(${x} ${y})`} role="button" tabIndex={0} aria-label={`${l.name}, ${l.address}`} aria-pressed={on} onClick={() => setPick(l.tag)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPick(l.tag); } }} style={{ cursor: "pointer" }}>
              <circle r="34" fill="url(#cmPulse)"><animate attributeName="r" values="22;40;22" dur="3s" repeatCount="indefinite" /></circle>
              <path d="M0 0 C-12 -16 -14 -22 -14 -28 a14 14 0 0 1 28 0 c0 6 -2 12 -14 28z" fill={on ? "url(#cmG)" : "#fff"} stroke={on ? "none" : "#1FA7B4"} strokeWidth="2" />
              <circle cy="-28" r="5" fill={on ? "#fff" : "#1FA7B4"} />
              <g transform="translate(0 12)"><rect x={-l.tag.length * 4.2 - 12} y="0" width={l.tag.length * 8.4 + 24} height="26" rx="13" fill="#fff" stroke={on ? "rgba(31,167,180,.5)" : "rgba(14,27,44,.12)"} /><text x="0" y="17.5" textAnchor="middle" fontSize="13" fontWeight={on ? 600 : 500} fill="#0E1B2C" style={{ fontFamily: "inherit" }}>{l.tag}</text></g>
            </g>
          ); })}
          <g transform={`translate(${W - 70} ${H - 70})`} opacity=".55"><circle r="22" fill="#fff" stroke="rgba(14,27,44,.2)" /><path d="M0 -14 L5 2 L0 -2 L-5 2Z" fill="#0E1B2C" /><text y="16" textAnchor="middle" fontSize="10" fill="#0E1B2C" style={{ fontFamily: "inherit" }}>N</text></g>
        </svg>
      </div>
      <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
        <form onSubmit={(e) => e.preventDefault()} style={{ display: "grid", gap: 8, padding: 18, borderRadius: 22, background: "linear-gradient(160deg,#FFFFFF,#F1F9F7)", border: "1px solid rgba(47,191,148,.28)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: N.teal, fontWeight: 600 }}><NIcon name="spark" size={16} tone="grad" />Neyu · nearest clinic</span>
          <label style={{ display: "grid", gap: 6, fontSize: 14, color: N.ink2 }}>Your postal code
            <input value={postal} onChange={(e) => { setPostal(e.target.value); setManual(false); }} maxLength={7} placeholder="e.g. T2J 4V3" autoComplete="postal-code" style={{ height: 48, padding: "0 14px", borderRadius: 14, border: `1px solid ${N.line}`, fontSize: 16, background: "#fff", color: N.ink }} />
          </label>
          <p aria-live="polite" style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: N.ink }}>
            {fsa.length < 3 ? "Add your postal code and Neyu shows which clinic is closer and the way there." : !you ? `${fsa} is outside the Calgary area on this map — both clinics are listed below.` : `${near![0].l.tag} is closer — about ${near![0].d.toFixed(1)} km away (${near![1].l.tag}: ${near![1].d.toFixed(1)} km). Straight-line estimate.`}
          </p>
        </form>
        {locations.map((l) => { const on = l.tag === target; return (
          <button key={l.tag} onClick={() => setPick(l.tag)} aria-pressed={on} style={{ textAlign: "left", padding: 18, borderRadius: 22, cursor: "pointer", display: "grid", gap: 8, background: "#fff", border: `1px solid ${on ? "rgba(31,167,180,.5)" : N.line}`, boxShadow: on ? "0 24px 44px -32px rgba(34,115,214,.6)" : "none", color: N.ink }}>
            <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}><b style={{ fontWeight: 500, fontSize: 18 }}>{l.name}</b>{near && near[0].l.tag === l.tag && <span style={{ fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: N.deep, fontWeight: 600 }}>Closest</span>}</span>
            <span style={{ display: "flex", gap: 8, fontSize: 14.5, color: N.ink2 }}><NIcon name="pin" size={17} tone="grad" style={{ marginTop: 1 }} />{l.address}</span>
            <span style={{ display: "flex", gap: 8, fontSize: 14.5, color: N.ink2 }}><NIcon name="phone" size={17} tone="grad" style={{ marginTop: 1 }} />{l.phone} · Fax {l.fax}</span>
          </button>
        ); })}
        <a href={"https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(cur.address)} target="_blank" rel="noopener" style={{ display: "inline-flex", alignItems: "center", gap: 8, justifySelf: "start", height: 48, padding: "0 20px", borderRadius: 999, background: N.ink, color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 500 }}><NIcon name="route" size={18} tone="light" />Directions to {cur.tag}</a>
      </div>
    </div>
  );
}
