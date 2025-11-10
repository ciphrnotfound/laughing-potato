"use client";

import React from "react";

export default function CTA() {
  return (
    <section className="mx-auto px-6 py-20">
      <div className="relative mx-auto max-w-6xl rounded-3xl overflow-hidden border border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-xl group hover:border-white/40 dark:hover:border-white/20 transition-all">
        {/* top purple band */}
        <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(124,58,237,0.15),transparent)]" />

        {/* grid background */}
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
                className="flex-1 min-w-0 rounded-xl border border-white/20 bg-white/10 dark:bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 ring-0 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm hover:border-white/30 dark:hover:border-white/20 transition-all"
              />

              <button
                type="submit"
                className="group relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-violet-500 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/20"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative">Join waitlist</span>
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
