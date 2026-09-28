"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAlba } from "@/components/AlbaContext";
import type { NavLink } from "@/data/homeContent";

// Custom events the homepage listens for (health map layer, map focus).
export const HUB_EVENT = "anra-hub";
export const MAPFOCUS_EVENT = "anra-mapfocus";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: "smooth" });
}

// One handler for every navigable item (rail, mobile menu, search, hub
// panel, concierge steps, footer), so they all behave identically.
export function useAnraNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { openAlba } = useAlba();

  return useCallback((l: NavLink) => {
    if (l.alba) return openAlba();
    const onHome = pathname === "/";

    if (l.hub) {
      if (onHome) {
        document.dispatchEvent(new CustomEvent(HUB_EVENT, { detail: l.hub }));
        setTimeout(() => scrollToId("hub"), 40);
      } else {
        router.push(`/?layer=${l.hub.layer}${l.hub.sub != null ? `&sub=${l.hub.sub}` : ""}#hub`);
      }
      return;
    }

    const href = l.href || "/";
    if (/^https?:/.test(href)) { window.open(href, "_blank", "noopener"); return; }
    if (/^(tel:|mailto:)/.test(href)) { window.location.href = href; return; }

    const [path, hash] = href.split("#");
    if (hash && (path === "" || path === "/") && onHome) {
      if (l.mapFocus) document.dispatchEvent(new CustomEvent(MAPFOCUS_EVENT, { detail: l.mapFocus }));
      setTimeout(() => scrollToId(hash), 40);
      return;
    }
    if (l.mapFocus) { router.push(`/?focus=${l.mapFocus}#${hash || "locations"}`); return; }
    router.push(href);
  }, [openAlba, pathname, router]);
}