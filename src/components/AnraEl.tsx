"use client";

import React, { useLayoutEffect, useRef } from "react";

// Renders an ANRA motion custom element and keeps its *observed* attributes
// (e.g. mode/param, stage, focus, nodes/active) in sync via setAttribute.
//
// Why: Next.js 15 runs React 19, which assigns props to custom-element
// *properties* once the element is upgraded. The design's elements read
// attributes (attributeChangedCallback), so dynamic values must always be
// written as attributes. Static, read-once attributes (words, density, …)
// can still be passed as normal props.
export default function AnraEl({ tag, attrs = {}, ...rest }: { tag: string; attrs?: Record<string, string | number>; style?: React.CSSProperties; [k: string]: unknown }) {
  const ref = useRef<HTMLElement>(null);
  const key = JSON.stringify(attrs);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    for (const [k, v] of Object.entries(attrs)) {
      const s = String(v);
      if (el.getAttribute(k) !== s) el.setAttribute(k, s);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return React.createElement(tag, { ref, ...rest });
}