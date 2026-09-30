"use client";

import React, { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NavRail from "@/components/NavRail";
import MobileNav from "@/components/MobileNav";
import SearchOverlay from "@/components/SearchOverlay";
import AccountButton from "@/components/AccountButton";
import BackButton from "@/components/BackButton";
import { useIsMobile } from "@/lib/useViewport";

// Universal navigation for every public page: desktop rail (≥860px) or
// mobile tab bar (<860px), the shared search overlay, the back button
// (top-left) and the account button (top-right). Admin is excluded.
export default function NavChrome() {
  const pathname = usePathname();
  const mobile = useIsMobile();
  const [search, setSearch] = useState(false);
  const openSearch = useCallback(() => setSearch(true), []);
  const closeSearch = useCallback(() => setSearch(false), []);

  // Phones: the floating Back / Sign-in pills slide away while scrolling down
  // (so they never cover headings) and return on scroll up or near the top.
  useEffect(() => {
    const root = document.documentElement;
    let last = window.scrollY, ticking = false;
    const run = () => {
      ticking = false;
      const y = window.scrollY, hide = y > 90 && y > last + 4, show = y < 90 || y < last - 4;
      if (hide) root.dataset.chrome = "hidden"; else if (show) root.dataset.chrome = "shown";
      last = y;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); delete root.dataset.chrome; };
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      {mobile ? <MobileNav onSearch={openSearch} /> : <NavRail onSearch={openSearch} />}
      <BackButton mobile={mobile} />
      <AccountButton mobile={mobile} />
      <SearchOverlay open={search} onClose={closeSearch} />
    </>
  );
}
