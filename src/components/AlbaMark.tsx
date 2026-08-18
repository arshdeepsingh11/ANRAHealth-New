import React from "react";

export default function AlbaMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="albaMarkGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0E1B2" />
          <stop offset="50%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#8D7A4B" />
        </linearGradient>
      </defs>
      {/* Concentric rings — signal "listening/connected", not a face or figure */}
      <circle cx="24" cy="24" r="16" stroke="url(#albaMarkGrad)" strokeWidth="1.3" opacity="0.35" />
      <circle cx="24" cy="24" r="10" stroke="url(#albaMarkGrad)" strokeWidth="1.5" opacity="0.6" />
      {/* Heartbeat/pulse line through the center — ties to the medical brand */}
      <path
        d="M14 24h5l2-6 3 12 2-8 1.5 2h5.5"
        stroke="url(#albaMarkGrad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}