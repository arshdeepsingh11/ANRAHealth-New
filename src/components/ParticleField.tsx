"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  wobble: number;
  wobblePhase: number;
  twinklePhase: number;
  baseAlpha: number;
}

export default function ParticleField({ color = "120, 96, 164" }: { color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationId: number;
    let width = 0;
    let height = 0;
    const dpr = window.devicePixelRatio || 1;

    function makeParticle(): Particle {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.5 + Math.random() * 1.6,
        speedY: -(0.05 + Math.random() * 0.2),
        wobble: (Math.random() - 0.5) * 0.16,
        wobblePhase: Math.random() * Math.PI * 2,
        twinklePhase: Math.random() * Math.PI * 2,
        baseAlpha: 0.16 + Math.random() * 0.55, // 0.16–0.71, per Glacier spec
      };
    }

    function resize() {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);

      // Higher density than before — "more particles" per Glacier direction
      const count = Math.min(320, Math.floor((width * height) / 3800));
      particles = Array.from({ length: count }, makeParticle);
    }

    function frame(t: number) {
      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y += p.speedY;
        p.x += Math.sin(p.wobblePhase + t / 2000) * p.wobble;

        if (p.y < -5) p.y = height + 5;
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;

        const twinkle = 0.5 + 0.5 * Math.sin(p.twinklePhase + t / 900);
        const alpha = p.baseAlpha * twinkle;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${color}, ${alpha.toFixed(3)})`;
        // Soft glow around each dot — "good glowing" per Glacier direction
        ctx!.shadowBlur = 5;
        ctx!.shadowColor = `rgba(${color}, ${(alpha * 0.8).toFixed(3)})`;
        ctx!.fill();
      }
      animationId = requestAnimationFrame(frame);
    }

    resize();
    animationId = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}