"use client";

import React from "react";
import { motion } from "motion/react";

interface BottomUpLettersProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export function BottomUpLetters({ text, className = "", delay = 0, staggerDelay = 0.03 }: BottomUpLettersProps) {
  const letters = Array.from(text);

  return (
    <span className={className} aria-label={text}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: delay + i * staggerDelay,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ display: "inline-block", whiteSpace: letter === " " ? "pre" : "normal" }}
        >
          {letter}
        </motion.span>
      ))}
    </span>
  );
}