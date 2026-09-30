"use client";

// My Health Space — a page inside the website (the site's nav rail, mobile
// nav, footer and ALBA stay). Header + section tabs, in-page navigation
// stack with browser back support (?s=… in the URL), sheets and toast.
// Screens load their own data through the shared cache.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BootstrapDTO, ProfileDTO, SettingsDTO } from "@/lib/portal/types";
import { routeUrl as toUrl } from "@/lib/portal/route";
import { Ctx, PARENT, LABELS, type PortalCtx, type Route, type Screen, type Sheet } from "./context";
import { EP, api, invalidate, load, prime } from "./api";
import { C } from "./ui";
import Today from "./screens/Today";
import { Trends, TrendDetail } from "./screens/Trends";
import { Results, ResultDetail } from "./screens/Results";
import Protocol from "./screens/Protocol";
import Devices from "./screens/Devices";
import History from "./screens/History";
import { Appointments, Referrals } from "./screens/Appointments";
import { More, Profile, Privacy, Notifications } from "./screens/Account";
import Sheets from "./Sheets";
import { Heart, Lifestyle, Family, CareView, Rewards, Story } from "./screens/Universe";
import Baseline from "./screens/Baseline";

export default function PortalApp({ boot, initialRoute }: { boot: BootstrapDTO; initialRoute: Route }) {
  const [route, setRoute] = useState<Route>(initialRoute);
  const [hist, setHist] = useState<Route[]>([]);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileDTO>(boot.profile);
  const [settings, setSettings] = useState<SettingsDTO>(boot.settings);
  const mainRef = useRef<HTMLDivElement>(null);
  const tt = useRef<ReturnType<typeof setTimeout>>(undefined);
  const histRef = useRef(hist); histRef.current = hist;
  const routeRef = useRef(route); routeRef.current = route;

  // Server-rendered data goes straight into the cache (no refetch on first paint).
  useState(() => { prime(EP.today, boot.today); prime(EP.settings, boot.settings); prime(EP.me, boot.profile); return 0; });

  // Warm the other tabs in the background so switching is instant.
  useEffect(() => {
    const warm = () => [EP.brief, EP.profile, EP.trends, EP.results, EP.protocol, EP.appointments, EP.heart, EP.lifestyle].forEach((u) => load(u).catch(() => {}));
    const w = window as any;
    const id = w.requestIdleCallback ? w.requestIdleCallback(warm, { timeout: 2000 }) : setTimeout(warm, 600);
    return () => (w.cancelIdleCallback ? w.cancelIdleCallback(id) : clearTimeout(id));
  }, []);

  // Bring the section tabs back into view when the screen changes.
  const scrollTop = () => {
    const el = mainRef.current;
    if (el && el.getBoundingClientRect().top < 0) window.scrollTo({ top: Math.max(0, window.scrollY + el.getBoundingClientRect().top - 90) });
  };
  const toast = useCallback((t: string) => {
    clearTimeout(tt.current);
    setToastText(t);
    tt.current = setTimeout(() => setToastText(null), 2600);
  }, []);

  const go = useCallback((s: Screen, p?: Omit<Route, "s">) => {
    const r: Route = { s, ...(p || {}) };
    setHist((h) => [...h, routeRef.current]);
    setRoute(r); setSheet(null); scrollTop();
    window.history.pushState({ mhs: true }, "", toUrl(r));
  }, []);
  const tab = useCallback((s: Screen) => {
    const r: Route = { s };
    setHist([]); setRoute(r); setSheet(null); scrollTop();
    window.history.replaceState({ mhs: true }, "", toUrl(r));
  }, []);
  // In-app back: pops our stack (browser history stays in step via popstate).
  const internalBack = useCallback(() => {
    const h = histRef.current;
    if (h.length) { const r = h[h.length - 1]; setHist(h.slice(0, -1)); setRoute(r); return r; }
    const r: Route = { s: PARENT[routeRef.current.s] || "today" };
    setRoute(r); return r;
  }, []);
  const back = useCallback(() => {
    if (histRef.current.length) { window.history.back(); return; }
    const r = internalBack(); scrollTop();
    window.history.replaceState({ mhs: true }, "", toUrl(r));
  }, [internalBack]);
  useEffect(() => {
    const onPop = () => { if (sheetRef.current) { setSheet(null); } internalBack(); scrollTop(); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [internalBack]);
  const sheetRef = useRef(sheet); sheetRef.current = sheet;

  // Esc closes a sheet.
  useEffect(() => {
    if (!sheet) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setSheet(null); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [sheet]);

  const addQuestion = useCallback(async (text: string) => {
    await api("/api/portal/questions", { body: { text } });
    invalidate(EP.appointments); load(EP.appointments, true).catch(() => {});
  }, []);

  const initials = ((profile.firstName[0] || "") + (profile.lastName[0] || "")).toUpperCase();
  const ctx: PortalCtx = useMemo(() => ({
    route, go, tab, back, toast, sheet, openSheet: setSheet, profile, setProfile, settings, setSettings, tz: profile.timezone, initials, addQuestion,
  }), [route, go, tab, back, toast, sheet, profile, settings, initials, addQuestion]);

  const scr = route.s;
  const activeTab = scr === "result" || scr === "trend" || scr === "careview" ? PARENT[scr]! : scr === "privacy" || scr === "settings" ? "profile" : scr === "story" || scr === "baseline" ? "today" : scr;
  const showBack = hist.length > 0 || !!PARENT[scr];
  const backTo = hist.length ? hist[hist.length - 1].s : PARENT[scr] || "today";
  const backLabel = LABELS[backTo] || "Back";
  const TABS: [Screen, string, string][] = [["today", "Today", "ph-sun"], ["heart", "Heart", "ph-heartbeat"], ["lifestyle", "Lifestyle", "ph-leaf"], ["trends", "Trends", "ph-chart-line"], ["results", "Results", "ph-flask"], ["protocol", "Protocol", "ph-check-circle"], ["devices", "Devices", "ph-watch"], ["appointments", "Appointments", "ph-calendar-blank"], ["family", "Family", "ph-users-three"], ["rewards", "Rewards", "ph-trophy"], ["history", "History", "ph-clock-counter-clockwise"], ["referrals", "Referrals", "ph-arrows-split"], ["profile", "Profile", "ph-user-circle"]];

  const screen = (() => {
    switch (scr) {
      case "today": return <Today />;
      case "trends": return <Trends />;
      case "trend": return <TrendDetail k={route.k!} />;
      case "results": return <Results />;
      case "result": return <ResultDetail id={route.id!} />;
      case "protocol": return <Protocol />;
      case "devices": return <Devices />;
      case "history": return <History />;
      case "appointments": return <Appointments />;
      case "referrals": return <Referrals />;
      case "more": return <More />;
      case "profile": return <Profile />;
      case "privacy": return <Privacy />;
      case "settings": return <Notifications />;
      case "heart": return <Heart />;
      case "lifestyle": return <Lifestyle />;
      case "family": return <Family />;
      case "careview": return <CareView id={route.id!} />;
      case "rewards": return <Rewards />;
      case "story": return <Story />;
      case "baseline": return <Baseline id={route.id} />;
    }
  })();

  return (
    <Ctx.Provider value={ctx}>
      <div className="mhs mhs-page">
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
          <button onClick={() => tab("today")} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
            <span style={{ fontSize: 12, letterSpacing: ".14em", color: C.muted, fontWeight: 500 }}>NEYU HEALTH</span>
            <span style={{ fontSize: 19, fontWeight: 500, letterSpacing: "-.01em" }}>My Health Space</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setSheet({ t: "alba" })} className="h-albabtn" aria-label="Ask ALBA about your health data" style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", border: "none", borderRadius: 20, background: "#EFEAF6", color: C.lavDeep, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
              <i className="ph ph-sparkle" style={{ fontSize: 17 }} /><span className="mhs-hide-sm">Ask ALBA</span>
            </button>
          </div>
        </header>

        {/* Section tabs (scroll sideways on small screens) */}
        <nav aria-label="My Health Space" className="mhs-tabs" style={{ display: "flex", gap: 4, overflowX: "auto", margin: "0 -4px 28px", padding: "4px", scrollbarWidth: "none" }}>
          {TABS.map(([id, label, icon]) => {
            const a = activeTab === id;
            return (
              <button key={id} onClick={() => tab(id)} aria-current={a ? "page" : undefined} className="h-nav"
                style={{ flex: "none", display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", border: "none", borderRadius: 12, background: a ? "rgba(63,111,124,.10)" : "transparent", color: a ? C.tealDark : C.ink2, fontSize: 15, fontWeight: a ? 500 : 400, cursor: "pointer", transition: "background 160ms", whiteSpace: "nowrap" }}>
                <i className={(a ? "ph-fill " : "ph ") + icon} style={{ fontSize: 18 }} />{label}
              </button>
            );
          })}
        </nav>

        <div ref={mainRef} style={{ scrollMarginTop: 90 }}>
          {showBack && (
            <button onClick={back} style={{ display: "flex", alignItems: "center", gap: 6, height: 36, padding: 0, marginBottom: 12, border: "none", background: "none", fontSize: 15, fontWeight: 500, color: C.teal, cursor: "pointer" }}><i className="ph ph-caret-left" style={{ fontSize: 18 }} />{backLabel}</button>
          )}
          <div key={scr + (route.k || "") + (route.id || "")}>{screen}</div>
        </div>

        {sheet && <Sheets />}

        {toastText && (
          <div role="status" className="mhs-toast" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", zIndex: 95, display: "flex", alignItems: "center", gap: 8, maxWidth: "calc(100% - 32px)", padding: "12px 16px", borderRadius: 14, background: C.ink, color: C.page, fontSize: 14, boxShadow: "0 12px 32px rgba(29,35,39,.25)", animation: "mhs-fadeUp 260ms ease" }}>
            <i className="ph ph-check-circle" style={{ fontSize: 17, color: "#9FC9D3" }} />{toastText}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}
