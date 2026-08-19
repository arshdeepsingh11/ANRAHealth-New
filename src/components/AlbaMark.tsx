import React from "react";

export default function AlbaMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="albaHeartGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0E1B2" /><stop offset="50%" stopColor="#C9A227" /><stop offset="100%" stopColor="#8D7A4B" />
        </linearGradient>
      </defs>
      <path d="M24 40c-1-.6-13-8.4-17.4-17.6C4.2 17 6.4 10.6 12 8.6c4-1.4 7.8.2 10 3.4 1.4-2 4-3.8 7-3.8 5 0 9 4 9 9.4 0 8.6-13 20-14 20.4Z" fill="none" stroke="url(#albaHeartGrad)" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M11 23h5l2-6 3 12 2-8 1.5 2h6.5" stroke="url(#albaHeartGrad)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse-glow" />
    </svg>
  );
}