"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Renders nothing — just fires a background log call every time the route
// changes. Mounted once, globally, in layout.tsx.
export default function PageVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
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

  return null;
}