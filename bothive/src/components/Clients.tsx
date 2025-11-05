"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

/*
  Clients section implementation matching the provided design:
  - Large heading "Our clients"
  - Subtitle centered beneath
  - Main testimonial card with: left avatar image, right quote and author
  - Thin grid lines around card
  - Strong purple glow / radial gradient behind the card
*/

const Clients: React.FC = () => {
  const slides = useMemo(
    () => [
      {
        img: "/tony.jpg",
        quote:
          "This product has completely transformed how I manage projects and deadlines",
        name: "Talia Taylor",
        role: "Digital Marketing Director @ Quantum",
      },
      {
        img: "/public/john.jpg".replace("/public", ""),
        quote: "We boosted campaign ROI by 48% in 3 weeks using these tools",
        name: "Jordan Lee",
        role: "Head of Growth @ Aurora",
      },
      {
        img: "/public/tony.jpg".replace("/public", ""),
        quote: "Onboarding took minutes and our team adopted it immediately",
        name: "Priya Patel",
        role: "Product Manager @ Vertex",
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-advance interval (pausable). Avoid defining functions after useEffect to fix lint warnings.
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  // Touch/swipe support for mobile
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) setIndex((i) => (i + 1) % slides.length);
      else setIndex((i) => (i - 1 + slides.length) % slides.length);
    }
    touchStartX.current = null;
  };

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 md:py-32">
      {/* Background glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* Wide ambient glow */}
        <div
          className="h-[520px] w-[720px] rounded-[40px] opacity-80 blur-2xl sm:h-[640px] sm:w-[880px] sm:rounded-[48px] sm:blur-3xl md:h-[760px] md:w-[1080px] md:rounded-[56px]"
          style={{
            background:
              "radial-gradient(40% 40% at 50% 50%, rgba(168,85,247,0.45) 0%, rgba(109,40,217,0.55) 35%, rgba(76,29,149,0.45) 60%, rgba(0,0,0,0) 78%)",
            boxShadow:
              "0 0 220px 60px rgba(168,85,247,0.28), 0 0 420px 160px rgba(168,85,247,0.22)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-3xl  tracking-tight text-white sm:text-4xl md:text-6xl">Our clients</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-zinc-300 sm:mt-4 sm:max-w-2xl sm:text-base md:text-lg">
          Hear firsthand how our solutions have boosted online success for users like you.
        </p>

        {/* Carousel container matching exact card visuals */}
        <div
          className="relative mt-10 overflow-hidden rounded-2xl border border-white/15 bg-white/3 sm:mt-14 md:mt-20"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Card edge highlight */}
          <div className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-inset ring-white/10" />
          <GridLines />

          <motion.div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            ref={containerRef}
            className="flex"
            animate={{ x: `-${index * 100}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            style={{ width: `${slides.length * 100}%` }}
          >
            {slides.map((s, i) => (
              <article key={i} className="grid w-full shrink-0 grid-cols-1 items-stretch sm:grid-cols-1 md:grid-cols-[320px_1fr]">
                {/* Left image */}
                <div className="relative p-4 md:p-10 sm:p-6">
                  <div className="relative mx-auto aspect-square w-52 overflow-hidden rounded-2xl bg-purple-500/20 sm:w-64 md:mx-0 md:w-full md:rounded-[18px]">
                    {/* Image glow behind */}
                    <div
                      aria-hidden
                      className="absolute inset-0 -z-10 rounded-[22px]"
                      style={{
                        filter: "blur(28px)",
                        background:
                          "radial-gradient(60% 60% at 50% 50%, rgba(168,85,247,0.55) 0%, rgba(109,40,217,0.45) 45%, rgba(76,29,149,0.30) 70%, rgba(0,0,0,0) 85%)",
                      }}
                    />
                    <Image
                      src={s.img}
                      alt="Client avatar"
                      fill
                      className="object-cover mix-blend-luminosity"
                      sizes="(max-width: 768px) 256px, 320px"
                      priority={i === index}
                    />
                  </div>
                </div>

                {/* Right content */}
                <div className="relative flex flex-col justify-center p-4 pt-0 sm:p-6 md:p-10">
                  {/* Thin divider across card at mid-height */}
                  <div className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px translate-y-[-50%] bg-linear-to-r from-white/20 via-white/40 to-white/10 md:block" />
                  <blockquote className="text-left text-base leading-snug text-white sm:text-lg md:text-2xl">
                    “{s.quote}”
                  </blockquote>
                  <div className="mt-4 text-left sm:mt-5 md:mt-6">
                    <p className="text-sm  text-white">{s.name}</p>
                    <p className="text-xs text-zinc-300 sm:text-sm">{s.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </motion.div>

          {/* Indicators */}
          <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 sm:gap-2 md:bottom-6">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full ${i === index ? "bg-white/80" : "bg-white/30"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

function GridLines() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="220" height="160" patternUnits="userSpaceOnUse">
          <path d="M 220 0 L 0 0 0 160" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
        </pattern>
        <linearGradient id="fade" x1="0" x2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
        </linearGradient>
      </defs>
      {/* Outer grid */}
      <rect width="100%" height="100%" fill="url(#grid)" />
      {/* Horizontal accent line */}
      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="url(#fade)" strokeWidth="1" />
    </svg>
  );
}

export default Clients;
