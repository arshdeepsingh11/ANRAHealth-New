"use client";

import React, { useCallback, useState } from "react";
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
