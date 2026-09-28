"use client";

import React, { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import NavRail from "@/components/NavRail";
import MobileNav from "@/components/MobileNav";
import SearchOverlay from "@/components/SearchOverlay";
import { useIsMobile } from "@/lib/useViewport";

// Universal navigation for every public page: desktop rail (≥860px) or
// mobile tab bar (<860px), plus the shared search overlay. Admin is excluded.
export default function NavChrome() {
  const pathname = usePathname();
  const mobile = useIsMobile();
  const [search, setSearch] = useState(false);
  const openSearch = useCallback(() => setSearch(true), []);
  const closeSearch = useCallback(() => setSearch(false), []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      {mobile ? <MobileNav onSearch={openSearch} /> : <NavRail onSearch={openSearch} />}
      <SearchOverlay open={search} onClose={closeSearch} />
    </>
  );
}