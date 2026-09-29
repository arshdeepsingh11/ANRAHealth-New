"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Renders nothing. Logs a page view on every route change, and a click
// whenever a visitor follows a link to another site (e.g. BioAro Labs).
// Staff pages (/admin) and share links (/share/…) are never logged. Mounted once in layout.tsx.
export default function PageVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/share/")) return;
    fetch("/api/log-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
      }),
    }).catch(() => {
      // Silently ignore — a failed visit log should never affect the visitor.
    });
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/share/")) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      let url: URL;
      try { url = new URL(a.href, window.location.href); } catch { return; }
      if (!/^https?:$/.test(url.protocol) || url.host === window.location.host) return;
      const body = JSON.stringify({ outbound: url.href, from: window.location.pathname });
      // sendBeacon survives the page unloading as the link opens.
      if (!navigator.sendBeacon?.("/api/log-visit", new Blob([body], { type: "application/json" }))) {
        fetch("/api/log-visit", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
