"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/clinic-building.jpg",
    eyebrow: "Calgary, Alberta · Two Locations",
    title: "Every heart deserves precise, coordinated care.",
    subtitle: "Cardiology, internal medicine, and endocrinology together in one clinic.",
    cta: { label: "Book an Appointment", to: "/contact" },
  },
  {
    image: "/dr-kapoor-home.jpeg",
    eyebrow: "Founded by Dr. Anmol S. Kapoor",
    title: "Alberta's first onsite Exercise Stress Echocardiogram program.",
    subtitle: "More specific than a thallium stress test, without the radiation exposure.",
    cta: { label: "Meet Our Physicians", to: "/physicians" },
  },
  {
    image: "/clinic-building.jpg",
    eyebrow: "Now Open",
    title: "We're here to serve you, at both Calgary locations.",
    subtitle: "North East and Meadow Miles clinics, open Monday to Friday.",
    cta: { label: "Get Directions", to: "/contact" },
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 3000);
    return () => clearInterval(t);
  }, []);

  const slide = slides[index];
  const go = (dir: number) => setIndex((i) => (i + dir + slides.length) % slides.length);

  return (
    <div className="relative h-[480px] md:h-[560px] overflow-hidden">
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <img src={s.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(11,23,38,0.75) 0%, rgba(11,23,38,0.35) 55%, rgba(11,23,38,0.1) 100%)" }} />
        </div>
      ))}

      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 lg:px-10 flex items-center">
        <div className="max-w-xl">
          <p className="text-sm font-semibold tracking-wide uppercase mb-4 text-white/80">{slide.eyebrow}</p>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.12] mb-6 text-white">{slide.title}</h1>
          <p className="text-base md:text-lg mb-8 text-white/85">{slide.subtitle}</p>
          <Link href={slide.cta.to} className="inline-block px-6 py-3 rounded-full text-sm font-semibold text-white bg-blue transition-transform hover:scale-105">
            {slide.cta.label}
          </Link>
        </div>
      </div>

      <button onClick={() => go(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white backdrop-blur-sm" aria-label="Previous slide">
        <ChevronLeft size={20} />
      </button>
      <button onClick={() => go(1)} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white backdrop-blur-sm" aria-label="Next slide">
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className="h-1.5 rounded-full transition-all"
            style={{ width: i === index ? 24 : 8, background: i === index ? "white" : "rgba(255,255,255,0.4)" }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
