"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

interface AlbaContextType {
  isOpen: boolean;
  openAlba: () => void;
  closeAlba: () => void;
  albaNodeRect: DOMRect | null;
  registerAlbaNode: (el: HTMLElement | null) => void;
}

const AlbaContext = createContext<AlbaContextType | null>(null);

export function AlbaProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [albaNodeRect, setAlbaNodeRect] = useState<DOMRect | null>(null);
  const lastRectRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const registerAlbaNode = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const last = lastRectRef.current;
    // Only update state when the position actually moved — otherwise the
    // inline ref callback fires every render and this loops forever.
    if (!last || last.x !== rect.x || last.y !== rect.y || last.w !== rect.width || last.h !== rect.height) {
      lastRectRef.current = { x: rect.x, y: rect.y, w: rect.width, h: rect.height };
      setAlbaNodeRect(rect);
    }
  }, []);

  return (
    <AlbaContext.Provider
      value={{
        isOpen,
        openAlba: () => setIsOpen(true),
        closeAlba: () => setIsOpen(false),
        albaNodeRect,
        registerAlbaNode,
      }}
    >
      {children}
    </AlbaContext.Provider>
  );
}

export function useAlba() {
  const ctx = useContext(AlbaContext);
  if (!ctx) throw new Error("useAlba must be used within AlbaProvider");
  return ctx;
}