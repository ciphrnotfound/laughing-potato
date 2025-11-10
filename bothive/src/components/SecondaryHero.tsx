"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const cards = [
  {
    title: "Instant deployments",
    desc: "Launch curated automations in minutes with pre-built runbooks.",
  },
  {
    title: "Audit-friendly",
    desc: "Black-and-white telemetry keeps every signal easy to scan and share.",
  },
  {
    title: "Storefront ready",
    desc: "Bundle agents with pricing, trials, and analytics in one console.",
  },
];

export default function SecondaryHero() {
  return (
    <section className="relative w-full border-y border-white/10 bg-black/95 py-24 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_65%)]" aria-hidden="true" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-white/45">
            <span>Storefront preview</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-[46px]">
              Curate your hive like an app store.
            </h2>
            <p className="text-sm text-white/65 sm:text-base">
              Present agents, pricing, and live metrics in a calm monochrome canvas. Bothive keeps focus on capability—not neon.
            </p>
          </div>

          <motion.ul
            initial="hidden"
            animate="show"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
            className="space-y-5"
          >
            {cards.map((card) => (
              <motion.li
                key={card.title}
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                className="flex items-start gap-3"
              >
                <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-white/80" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">{card.title}</p>
                  <p className="mt-1 text-sm text-white/55">{card.desc}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>

          <div className="flex flex-wrap gap-3 text-xs text-white/55">
            <span className="rounded-full border border-white/15 px-3 py-1">Dark UI</span>
            <span className="rounded-full border border-white/15 px-3 py-1">Agent catalog</span>
            <span className="rounded-full border border-white/15 px-3 py-1">Conversion-ready</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-xl overflow-hidden rounded-[32px] border border-white/12 bg-black/70 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
        >
          <div className="rounded-[24px] border border-white/10 bg-black/80 p-6">
            <div className="mb-6 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/45">
              <span>Storefront layout</span>
              <span>Monochrome</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/60 p-4">
                <div>
                  <p className="text-sm font-semibold text-white">Launch Kit</p>
                  <p className="text-xs text-white/55">Automation bundle</p>
                </div>
                <button className="rounded-full border border-white/20 px-4 py-1 text-xs font-medium text-white/70 transition hover:text-white">
                  Install
                </button>
              </div>
              <Image
                src="/App.png"
                alt="Bothive monochrome store preview"
                width={1200}
                height={900}
                className="rounded-2xl border border-white/10"
              />
              <p className="text-xs text-white/60">
                App-store inspired layout for showcasing your hive without colour distraction.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
