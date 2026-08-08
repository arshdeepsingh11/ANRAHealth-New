"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { LANGUAGES } from "./languages";
import { UI_STRINGS } from "./ui";

type LanguageContextValue = {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // IMPORTANT (Next.js SSR difference from the old Vite app): the server has
  // no localStorage, so the initial render must always be "en" on both
  // server and client to avoid a hydration mismatch. The saved language is
  // then applied client-side in the effect below, right after mount.
  const [lang, setLang] = useState("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("anra-lang");
      if (saved) setLang(saved);
    } catch {
      // localStorage unavailable — just stay on "en"
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("anra-lang", lang);
    } catch {
      // localStorage unavailable — language just won't persist across reloads
    }
    const meta = LANGUAGES.find((l) => l.code === lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = meta && meta.rtl ? "rtl" : "ltr";
  }, [lang]);

  // t(key) — UI string lookup. Always falls back to English, then to the raw key,
  // so a missing translation never breaks the page, it just shows English.
  const t = (key: string): string => {
    return (UI_STRINGS[lang] && UI_STRINGS[lang][key]) || UI_STRINGS.en[key] || key;
  };

  const dir: "ltr" | "rtl" = (LANGUAGES.find((l) => l.code === lang) || {}).rtl ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
