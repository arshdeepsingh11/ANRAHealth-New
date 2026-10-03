"use client";

import { useEffect, useState } from "react";

// Design breakpoint: below 860px the layout switches to mobile
// (bottom tab bar, full-screen Neyu, bottom sheets).
export const MOBILE_BP = 860;

export function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const on = () => setMobile(window.innerWidth < MOBILE_BP);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return mobile;
}
