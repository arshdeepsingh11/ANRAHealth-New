"use client";

import React from "react";

/**
 * HeroVisual — fully custom, brand-owned animated background.
 * No stock or real clinic/patient footage required.
 *
 * Later, if you license real stock video, pass it as `videoSrc` and it
 * renders as a layer beneath the animation (animation stays as an overlay
 * accent) — no other code needs to change.
 */
export default function HeroVisual({ videoSrc }: { videoSrc?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-graphite-900">
      {videoSrc && (
        <video
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
      )}

      {/* Ambient gold glass orbs — depth layer */}
      <div
        className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blob1"
        style={{ background: "radial-gradient(circle, rgba(201,162,39,0.18) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[520px] h-[520px] rounded-full blob2"
        style={{ background: "radial-gradient(circle, rgba(201,162,39,0.14) 0%, transparent 70%)" }}
      />

      {/* Large-scale ECG waveform — the Pulse brand signature, at hero scale */}
      <svg
        viewBox="0 0 1440 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="ecgGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#C9A227" stopOpacity="0" />
            <stop offset="45%" stopColor="#DEBD54" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#DEBD54" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#C9A227" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,320 L220,320 L260,320 L290,220 L320,420 L350,140 L380,320 L430,320 L470,300 L520,320 L1440,320"
          fill="none"
          stroke="url(#ecgGrad)"
          strokeWidth="2.5"
          className="ecg-draw"
          style={{ animationDuration: "3.2s" }}
        />
        {/* faint repeat for depth */}
        <path
          d="M0,380 L220,380 L260,380 L290,300 L320,460 L350,220 L380,380 L430,380 L470,365 L520,380 L1440,380"
          fill="none"
          stroke="#C9A227"
          strokeOpacity="0.12"
          strokeWidth="1.5"
        />
      </svg>

      {/* Subtle particle field — DNA/data motif */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 1440 600">
        {Array.from({ length: 18 }).map((_, i) => (
          <circle
            key={i}
            cx={(i * 83) % 1440}
            cy={90 + ((i * 137) % 420)}
            r={i % 3 === 0 ? 2.5 : 1.5}
            fill="#DEBD54"
            className="animate-pulse-glow"
            style={{ animationDelay: `${(i % 6) * 0.4}s` }}
          />
        ))}
      </svg>
    </div>
  );
}