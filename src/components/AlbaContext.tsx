"use client";

import React, { createContext, useContext, useState } from "react";

interface AlbaContextType {
  isOpen: boolean;
  openAlba: () => void;
  closeAlba: () => void;
}

const AlbaContext = createContext<AlbaContextType | null>(null);

export function AlbaProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <AlbaContext.Provider value={{ isOpen, openAlba: () => setIsOpen(true), closeAlba: () => setIsOpen(false) }}>
      {children}
    </AlbaContext.Provider>
  );
}

export function useAlba() {
  const ctx = useContext(AlbaContext);
  if (!ctx) throw new Error("useAlba must be used within AlbaProvider");
  return ctx;
}