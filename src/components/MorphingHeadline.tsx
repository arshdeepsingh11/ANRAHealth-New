"use client";

import React from "react";

export default function MorphingHeadline({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <h1 className={className}>
      {words.map((w, i) => (
        <span key={i} className="morph-word" style={{ animationDelay: `${i * 0.12}s` }}>
          {w}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </h1>
  );
}