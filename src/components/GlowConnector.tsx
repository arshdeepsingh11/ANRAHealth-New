"use client";

import React, { useId } from "react";

interface GlowConnectorProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  curve?: number;
  color?: string;
  delay?: number;
  strokeWidth?: number;
  baseOpacity?: number;
  dashLength?: number;
  gapLength?: number;
  duration?: number;
}

export default function GlowConnector({
  x1, y1, x2, y2,
  curve = 40,
  color = "#99a455",
  delay = 0,
  strokeWidth = 2,
  baseOpacity = 0.18,
  dashLength = 6,
  gapLength = 220,
  duration = 3.2,
}: GlowConnectorProps) {
  const id = useId();
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const ctrlX = midX + nx * curve;
  const ctrlY = midY + ny * curve;

  const path = `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`;
  const totalDash = dashLength + gapLength;

  return (
    <g>
      <path d={path} fill="none" stroke={color} strokeOpacity={baseOpacity} strokeWidth={strokeWidth * 0.6} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dashLength} ${gapLength}`}
        strokeLinecap="round"
        style={{
          animation: `glowDash-${id} ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
        }}
      />
      <style jsx>{`
        @keyframes glowDash-${id} {
          0% { stroke-dashoffset: ${totalDash}; opacity: 0; }
          8% { opacity: 1; }
          90% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
      `}</style>
    </g>
  );
}