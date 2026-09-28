"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Region } from "@/data/bioaroCatalog";

// Visitor region (Canada / US / UK). Controls which BioAro products show as
// available and which regional store a product link opens. Saved per device.
const KEY = "anra-region";

interface RegionCtx { region: Region; setRegion: (r: Region) => void }
const Ctx = createContext<RegionCtx>({ region: "CA", setRegion: () => {} });

export const REGIONS: { code: Region; full: string }[] = [
  { code: "CA", full: "Canada" },
  { code: "US", full: "United States" },
  { code: "UK", full: "United Kingdom" },
];

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegionState] = useState<Region>("CA");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as Region | null;
      if (saved === "CA" || saved === "US" || saved === "UK") setRegionState(saved);
    } catch {}
  }, []);

  const setRegion = (r: Region) => {
    setRegionState(r);
    try { localStorage.setItem(KEY, r); } catch {}
  };

  return <Ctx.Provider value={{ region, setRegion }}>{children}</Ctx.Provider>;
}

export const useRegion = () => useContext(Ctx);