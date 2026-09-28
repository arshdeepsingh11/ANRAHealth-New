"use client";

import { useEffect } from "react";

// Loads the ANRA motion engine (canvas-based custom elements ported from the
// Claude Design artifact) once, on the client only. Elements rendered before
// this runs simply upgrade in place when their definitions arrive.
export default function MotionElements() {
  useEffect(() => {
    // Side-effect scripts (IIFEs that register custom elements), not ES modules.
    // @ts-ignore
    import("@/lib/motion/anra-motion.js");
    // @ts-ignore
    import("@/lib/motion/anra-motion2.js");
  }, []);
  return null;
}