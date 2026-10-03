"use client";

import React, { useEffect, useMemo, useState } from "react";
import { NEA, NEA_TREATMENTS, NEA_CATS, NEA_META, NEA_REL, NEA_AXES, neaTreatmentUrl, type NeaTreatment, type NeaCat, type NeaAxis } from "@/data/nea";
import { T, card, btnInk, btnGhost, chip, eyebrow, Book, Icon, Segmented } from "./ui";

const fmtRange = (r?: [number, number], unit = "") => (!r ? "—" : r[1] === 0 ? "None" : r[0] === r[1] ? `${r[1]}${unit}` : `${r[0]}–${r[1]}${unit}`);

function Sheet({ label, onClose, children, width = 620 }: { label: string; onClose: () => void; children: React.ReactNode; width?: number }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="anra-chrome">
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 85, background: "rgba(20,24,27,.38)", backdropFilter: "blur(4px)", animation: "fadeUp .2s" }} />
      <div role="dialog" aria-modal="true" aria-label={label} style={{ position: "fixed", zIndex: 86, left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: `min(${width}px,calc(100% - 24px))`, maxHeight: "88vh", overflow: "auto", background: T.paper, borderRadius: 24, padding: "clamp(20px,4vw,32px)", boxShadow: "0 40px 90px -30px rgba(20,24,27,.5)", animation: "fadeUp .25s ease" }}>
        {children}
      </div>
    </div>
  );
}
const CloseBtn = ({ onClose }: { onClose: () => void }) => <button onClick={onClose} aria-label="Close" style={{ width: 40, height: 40, border: 0, background: T.line2, borderRadius: 12, display: "grid", placeItems: "center", cursor: "pointer", flex: "none" }}><i className="ph ph-x" /></button>;

function FocusBars({ id }: { id: string }) {
  const rel = NEA_REL[id] || {};
  const on = NEA_AXES.filter((a) => rel[a.id as NeaAxis]);
  if (!on.length) return null;
  return (
    <div style={{ display: "grid", gap: 7 }}>
      {on.map((a) => { const v = rel[a.id as NeaAxis]!; return (
        <div key={a.id} style={{ display: "grid", gridTemplateColumns: "130px 1fr 90px", gap: 10, alignItems: "center", fontSize: 13.5 }}>
          <span>{a.label}</span>
          <span style={{ height: 8, borderRadius: 4, background: T.line2 }}><span style={{ display: "block", height: "100%", width: v === 2 ? "100%" : "50%", borderRadius: 4, background: v === 2 ? "#B4583F" : "#E7C3B8" }} /></span>
          <span style={{ color: T.muted, fontSize: 12.5 }}>{v === 2 ? "Primary focus" : "Also helps"}</span>
        </div>
      ); })}
    </div>
  );
}

export function Detail({ t, onClose, onAsk }: { t: NeaTreatment; onClose: () => void; onAsk?: (q: string) => void }) {
  const m = NEA_META[t.id];
  return (
    <Sheet label={t.name} onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <span style={{ ...eyebrow, color: T.deep }}>{t.cat} · Nea Precision Skin</span>
        <CloseBtn onClose={onClose} />
      </div>
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 8 }}>
        <Icon name={t.icon} box={52} size={26} />
        <h2 style={{ margin: 0, fontSize: "clamp(24px,4vw,32px)", lineHeight: 1.08, letterSpacing: "-.03em", fontWeight: 500 }}>{t.name}</h2>
      </div>
      <p style={{ margin: "14px 0 0", fontSize: 17, color: T.ink2 }}>{t.summary}</p>
      {t.facts.length > 0 && (
        <dl style={{ margin: "18px 0 0", display: "grid", gridTemplateColumns: `repeat(${Math.min(3, t.facts.length)},1fr)`, gap: 12, padding: "14px 0", borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
          {t.facts.map(([k, v]) => <div key={k}><dt style={{ fontSize: 12, color: T.muted }}>{k}</dt><dd style={{ margin: "4px 0 0", fontSize: 15.5 }}>{v}</dd></div>)}
        </dl>
      )}
      <ul style={{ margin: "16px 0 0", paddingLeft: 20, display: "grid", gap: 8, fontSize: 15.5, lineHeight: 1.55, color: T.ink2, listStyle: "disc" }}>{t.details.map((d) => <li key={d}>{d}</li>)}</ul>
      {t.tech && <p style={{ margin: "14px 0 0", fontSize: 14, color: T.muted, display: "flex", gap: 8, alignItems: "center" }}><i className="ph ph-cpu" />{t.tech}</p>}
      {(NEA_REL[t.id] && Object.keys(NEA_REL[t.id]).length > 0) && <div style={{ marginTop: 18 }}><div style={{ ...eyebrow, marginBottom: 10 }}>What it focuses on</div><FocusBars id={t.id} /></div>}
      {m && (
        <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8 }}>
          {m.downtime && <MiniStat k="Downtime" v={fmtRange(m.downtime, " days")} />}
          {m.sessionMin && <MiniStat k="Session" v={fmtRange(m.sessionMin, " min")} />}
          {m.sessions && <MiniStat k="Sessions" v={fmtRange(m.sessions)} />}
          {m.onsetDays != null && <MiniStat k="Full effect" v={m.onsetDays === 0 ? "Immediate" : `${m.onsetDays} days`} />}
          {m.lastsMonths && <MiniStat k="Lasts" v={m.lastsMonths[0] ? `${m.lastsMonths[0]}–${m.lastsMonths[1]} months` : `Up to ${m.lastsMonths[1]} months`} />}
        </div>
      )}
      <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Book />
        <a href={neaTreatmentUrl(t.id)} target="_blank" rel="noopener" style={btnGhost}>On Nea’s site<i className="ph ph-arrow-up-right" /></a>
        {onAsk && <button onClick={() => { onClose(); onAsk(`Tell me about ${t.name} — how does it work, how many sessions, and what should I expect?`); }} style={{ ...btnGhost, border: 0, color: T.violet }}><i className="ph ph-sparkle" />Ask Neyu</button>}
      </div>
      <p style={{ margin: "14px 0 0", fontSize: 13, color: T.muted }}>Starts with a free 15-minute consultation. Pricing is set with Nea. Information from neaprecisionskin.com — not medical advice.</p>
    </Sheet>
  );
}
const MiniStat = ({ k, v }: { k: string; v: string }) => <div style={{ padding: "10px 12px", borderRadius: 12, background: "#fff", border: `1px solid ${T.line2}` }}><div style={{ fontSize: 11.5, color: T.muted }}>{k}</div><div style={{ fontSize: 15, marginTop: 2 }}>{v}</div></div>;

function Compare({ ids, onClose, open }: { ids: string[]; onClose: () => void; open: (t: NeaTreatment) => void }) {
  const ts = ids.map((id) => NEA_TREATMENTS.find((t) => t.id === id)!);
  const rows: [string, (t: NeaTreatment) => React.ReactNode][] = [
    ["Category", (t) => t.cat],
    ["What it does", (t) => t.summary],
    ["Technology", (t) => t.tech || "—"],
    ["Downtime", (t) => fmtRange(NEA_META[t.id]?.downtime, " days")],
    ["Session", (t) => fmtRange(NEA_META[t.id]?.sessionMin, " min")],
    ["Sessions", (t) => fmtRange(NEA_META[t.id]?.sessions)],
    ["Focus", (t) => NEA_AXES.filter((a) => NEA_REL[t.id]?.[a.id as NeaAxis] === 2).map((a) => a.label).join(", ") || "—"],
    ["Published facts", (t) => t.facts.map(([k, v]) => `${k}: ${v}`).join(" · ") || "—"],
  ];
  return (
    <Sheet label="Compare treatments" onClose={onClose} width={960}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 500, letterSpacing: "-.02em" }}>Compare side by side</h2>
        <CloseBtn onClose={onClose} />
      </div>
      <div style={{ overflowX: "auto", marginTop: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14.5, minWidth: 560 }}>
          <thead><tr><th style={{ width: 130 }} />{ts.map((t) => <th key={t.id} style={{ textAlign: "left", padding: "0 10px 14px", verticalAlign: "top" }}><button onClick={() => open(t)} style={{ border: 0, background: "none", padding: 0, cursor: "pointer", display: "grid", gap: 8, textAlign: "left" }}><Icon name={t.icon} box={38} size={19} /><span style={{ fontWeight: 500, fontSize: 16, color: T.ink }}>{t.name}</span></button></th>)}</tr></thead>
          <tbody>{rows.map(([k, f]) => <tr key={k}><th scope="row" style={{ textAlign: "left", padding: "12px 10px 12px 0", color: T.muted, fontWeight: 400, borderTop: `1px solid ${T.line}`, verticalAlign: "top" }}>{k}</th>{ts.map((t) => <td key={t.id} style={{ padding: "12px 10px", borderTop: `1px solid ${T.line}`, verticalAlign: "top", color: T.ink2 }}>{f(t)}</td>)}</tr>)}</tbody>
          <tfoot><tr><td />{ts.map((t) => <td key={t.id} style={{ padding: "14px 10px 0" }}><Book small /></td>)}</tr></tfoot>
        </table>
      </div>
    </Sheet>
  );
}

type Sort = "az" | "cat" | "down";
export default function Treatments({ cat, setCat, open }: { cat: NeaCat | "All"; setCat: (c: NeaCat | "All") => void; open: (t: NeaTreatment) => void }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<Sort>("cat");
  const [cmp, setCmp] = useState<string[]>([]);
  const [showCmp, setShowCmp] = useState(false);
  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    const l = NEA_TREATMENTS.filter((t) => (cat === "All" || t.cat === cat) && (!q || (t.name + " " + t.summary + " " + t.concerns.join(" ") + " " + (t.tech || "")).toLowerCase().includes(q)));
    const d = (t: NeaTreatment) => NEA_META[t.id]?.downtime?.[1] ?? 99;
    return [...l].sort((a, b) => sort === "az" ? a.name.localeCompare(b.name) : sort === "down" ? d(a) - d(b) || a.name.localeCompare(b.name) : NEA_CATS.indexOf(a.cat) - NEA_CATS.indexOf(b.cat));
  }, [cat, search, sort]);
  const toggle = (id: string) => setCmp((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]));
  const CmpBox = ({ id }: { id: string }) => (
    <label onClick={(e) => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: cmp.includes(id) ? T.ink : T.muted, cursor: "pointer" }}>
      <input type="checkbox" checked={cmp.includes(id)} disabled={!cmp.includes(id) && cmp.length >= 3} onChange={() => toggle(id)} style={{ accentColor: T.deep, width: 16, height: 16 }} />Compare
    </label>
  );
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ position: "relative", flex: "1 1 280px", maxWidth: 420 }}>
          <i className="ph ph-magnifying-glass" style={{ position: "absolute", left: 14, top: 15, color: T.muted }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, concern or laser" aria-label="Search treatments" style={{ width: "100%", height: 46, padding: "0 14px 0 40px", borderRadius: 14, border: `1px solid ${T.line}`, background: "#fff", fontSize: 15 }} />
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Segmented label="Sort" value={sort} onChange={setSort} options={[{ v: "cat", label: "Category" }, { v: "az", label: "A–Z" }, { v: "down", label: "Least downtime" }]} />
          <Segmented label="View" value={view} onChange={setView} options={[{ v: "grid", label: "", icon: "ph-squares-four" }, { v: "list", label: "", icon: "ph-list" }]} />
        </div>
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {(["All", ...NEA_CATS] as const).map((c) => <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} style={chip(cat === c)}>{c}<span style={{ opacity: 0.6 }}>{c === "All" ? NEA_TREATMENTS.length : NEA_TREATMENTS.filter((t) => t.cat === c).length}</span></button>)}
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 13.5, color: T.muted }} aria-live="polite">{list.length} treatment{list.length === 1 ? "" : "s"}{cat !== "All" ? ` in ${cat}` : ""}{search ? ` matching “${search}”` : ""}</p>

      {view === "grid" ? (
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,270px),1fr))", gap: 14 }}>
          {list.map((t, i) => (
            <article key={t.id} id={t.id} className="nea-card" style={{ ...card, padding: 20, display: "grid", gridTemplateRows: "auto auto 1fr auto", gap: 10, cursor: "pointer", animation: `fadeUp .35s ${Math.min(i, 12) * 0.03}s both`, outline: cmp.includes(t.id) ? `2px solid ${T.nea}` : "none" }} onClick={() => open(t)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && open(t)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Icon name={t.icon} />
                <span style={{ fontSize: 11.5, letterSpacing: ".1em", textTransform: "uppercase", color: T.muted }}>{t.cat}</span>
              </div>
              <h3 style={{ margin: 0, fontSize: 19, lineHeight: 1.2, letterSpacing: "-.015em", fontWeight: 500 }}>{t.name}</h3>
              <p style={{ margin: 0, fontSize: 14.5, color: T.ink2, lineHeight: 1.5 }}>{t.summary}</p>
              <div style={{ display: "grid", gap: 10, paddingTop: 12, borderTop: `1px solid ${T.line2}` }}>
                {NEA_META[t.id]?.downtime && <span style={{ fontSize: 12.5, color: NEA_META[t.id]!.downtime![1] === 0 ? T.good : T.muted, display: "inline-flex", gap: 6, alignItems: "center" }}><i className="ph ph-timer" />Downtime: {fmtRange(NEA_META[t.id]!.downtime, " days")}</span>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <CmpBox id={t.id} />
                  <a href={NEA.book} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()} style={{ fontSize: 12.5, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600, color: T.deep, textDecoration: "none" }}>Book →</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div style={{ ...card, marginTop: 14, overflow: "hidden" }}>
          {list.map((t, i) => (
            <div key={t.id} id={t.id} onClick={() => open(t)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && open(t)} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center", padding: "14px 18px", borderTop: i ? `1px solid ${T.line2}` : 0, cursor: "pointer" }} className="nea-row">
              <Icon name={t.icon} box={38} size={19} />
              <span style={{ minWidth: 0 }}><b style={{ fontWeight: 500, fontSize: 15.5 }}>{t.name}</b><span style={{ display: "block", fontSize: 13.5, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.cat} · {t.summary}</span></span>
              <span style={{ display: "flex", gap: 14, alignItems: "center" }}><CmpBox id={t.id} /><i className="ph ph-caret-right" style={{ color: T.muted }} /></span>
            </div>
          ))}
        </div>
      )}
      {!list.length && <p style={{ color: T.muted, marginTop: 16 }}>No treatments match. Try Neyu Skin Match — describe it in your own words.</p>}

      {cmp.length > 0 && (
        <div className="anra-chrome" style={{ position: "fixed", left: "50%", bottom: 18, transform: "translateX(-50%)", zIndex: 70, width: "min(640px,calc(100% - 24px))", display: "flex", gap: 10, alignItems: "center", padding: 10, borderRadius: 18, background: "rgba(20,24,27,.92)", color: "#F7F5F1", boxShadow: "0 20px 50px -20px rgba(0,0,0,.6)", animation: "fadeUp .25s" }}>
          <div style={{ display: "flex", gap: 6, flex: 1, minWidth: 0, overflowX: "auto" }}>
            {cmp.map((id) => { const t = NEA_TREATMENTS.find((x) => x.id === id)!; return <span key={id} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 10, background: "rgba(255,255,255,.12)", fontSize: 13, whiteSpace: "nowrap" }}>{t.name}<button onClick={() => toggle(id)} aria-label={`Remove ${t.name}`} style={{ border: 0, background: "none", color: "#fff", cursor: "pointer", padding: 0 }}><i className="ph ph-x" /></button></span>; })}
          </div>
          <button onClick={() => setShowCmp(true)} disabled={cmp.length < 2} style={{ ...btnInk, background: "#fff", color: T.ink, height: 42, opacity: cmp.length < 2 ? 0.5 : 1 }}>{cmp.length < 2 ? "Pick 1 more" : `Compare ${cmp.length}`}</button>
        </div>
      )}
      {showCmp && <Compare ids={cmp} onClose={() => setShowCmp(false)} open={(t) => { setShowCmp(false); open(t); }} />}
    </div>
  );
}
