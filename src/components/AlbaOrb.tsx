import React from "react";

// Neyu's living orb — the universal Neyu AI icon (brand green → teal → blue), ported from the design's
// `orb(size, glow)`. Sizes used by the design: 22 (xs), 26 (sm), 30 (fab),
// 40 (md, glow), 120/180 (lg, glow).
export default function AlbaOrb({ size = 26, glow = false, motion = true }: { size?: number; glow?: boolean; motion?: boolean }) {
  const an = (v: string) => (motion ? v : "none");
  const dot = Math.max(3, size * 0.14);
  return (
    <span aria-hidden="true" style={{ position: "relative", display: "inline-block", width: size, height: size, flex: "none" }}>
      {glow && (
        <span style={{ position: "absolute", inset: -size * 0.4, borderRadius: "50%", background: "radial-gradient(circle, rgba(42,132,228,.38), rgba(110,168,182,.14) 55%, transparent 70%)", animation: an("albaGlow 2.4s ease-in-out infinite") }} />
      )}
      {size >= 24 && (
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid rgba(42,132,228,.6)", animation: an("albaRipple 2.4s ease-out infinite") }} />
      )}
      {size >= 24 && (
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(110,168,182,.6)", animation: an("albaRipple 2.4s .3s ease-out infinite") }} />
      )}
      <span style={{ position: "absolute", inset: -size * 0.17, borderRadius: "50%", border: "1px solid rgba(42,132,228,.3)", animation: an("spin 4s linear infinite") }}>
        <span style={{ position: "absolute", top: -dot / 2, left: "50%", width: dot, height: dot, marginLeft: -dot / 2, borderRadius: "50%", background: "#6EA8B6", boxShadow: "0 0 6px #6EA8B6" }} />
      </span>
      <span
        style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "radial-gradient(circle at 34% 30%, #FFFFFF 0%, #DDF6EC 18%, #6FDCB8 42%, #2FB3C4 60%, #2A84E4 80%, #1B4F8A 100%)",
          boxShadow: `inset 0 -${Math.max(2, size * 0.1)}px ${Math.max(4, size * 0.22)}px rgba(47,85,97,.45), 0 0 ${Math.max(6, size * 0.35)}px rgba(42,132,228,.45)`,
          animation: an("albaBeat 2.4s ease-in-out infinite"),
        }}
      >
        <span style={{ position: "absolute", left: "22%", top: "18%", width: "26%", height: "18%", borderRadius: "50%", background: "rgba(255,255,255,.75)", filter: "blur(1px)" }} />
      </span>
    </span>
  );
}
