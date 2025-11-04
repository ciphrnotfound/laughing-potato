"use client";

import React from "react";

export default function CTA() {
  return (
    <section className="mx-auto px-6 py-20">
      <div className="relative mx-auto max-w-6xl rounded-2xl overflow-hidden">
        {/* top purple band */}
        <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(124,58,237,0.95),transparent)]" />

        {/* grid background */}
        {/* <div className="absolute inset-0 bg-black/80">
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full opacity-30 mix-blend-overlay"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="cta-grid" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M0 0 H64 M0 0 V64" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-grid)" />
          </svg>
          {/* dark vignette */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/30 to-black/80" />
        {/* </div>  */}
        <GridLines/>

        {/* content */}
        <div className="relative z-10 px-8 py-20 text-center text-white">
          <h2 className="mx-auto max-w-3xl text-4xl sm:text-5xl md:text-6xl  leading-tight">
            Bothive — 
            
            The Future of Collaborative AI
          </h2>

          <div className="mt-8 flex justify-center">
            <form className="relative flex w-full max-w-2xl  items-center gap-4">
              <input
                type="email"
                placeholder="Your email"
                aria-label="Your email"
                className="flex-1 min-w-0 rounded-md border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40 ring-0 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30"
              />

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-black shadow-[0_6px_24px_rgba(124,58,237,0.28)] hover:brightness-95 transition"
              >
                Join waitlist
              </button>
            </form>
          </div>

          <p className="mx-auto mt-6 max-w-md text-sm text-zinc-300">No credit card required · 7-days free trial</p>
        </div>
      </div>
    </section>
  );
}
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
