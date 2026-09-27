"use client";

import React from "react";

export default function TypingLabel({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span
      className={`typing-text ${className}`}
      style={{ "--w": `${text.length}ch` } as React.CSSProperties}
    >
      {text}
    </span>
  );
}