"use client";

import React, { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Create",
    description: "Build AI agents using our visual builder or SDK.",
  },
  {
    number: "02",
    title: "Connect",
    description: "Link agents into workflows with triggers and conditions.",
  },
  {
    number: "03",
    title: "Deploy",
    description: "Push to production with one click. Auto-scale globally.",
  },
  {
    number: "04",
    title: "Monitor",
    description: "Track performance in real-time with AI-powered insights.",
  },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const lineWidth = useTransform(scrollYProgress, [0.2, 0.6], ["0%", "100%"]);

  return (
    <section
      ref={containerRef}
      className="relative py-24 md:py-32 overflow-hidden transition-colors duration-500
                bg-[#f5f5f7] dark:bg-[#08080c]
            "
    >
      {/* Subtle ambient glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-500/[0.04] dark:bg-violet-600/[0.03] rounded-full blur-[120px]"
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div ref={ref} className="relative max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-sm text-black/40 dark:text-white/40 uppercase tracking-widest mb-4"
          >
            How it works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-3xl md:text-4xl font-semibold text-black dark:text-white tracking-tight"
          >
            From idea to production
          </motion.h2>
        </div>

        {/* Connecting line (desktop) */}
        <div className="hidden md:block absolute top-[calc(50%+2rem)] left-[15%] right-[15%] h-px">
          <div className="w-full h-full bg-black/[0.06] dark:bg-white/[0.04]" />
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500/40 via-purple-500/40 to-violet-500/40"
            style={{ width: lineWidth }}
          />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.15 + index * 0.12,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              className="text-center group"
            >
              {/* Number with subtle glow on hover */}
              <motion.div
                className="relative inline-flex items-center justify-center w-14 h-14 rounded-full border mb-6 transition-colors
                                    border-black/[0.1] bg-white
                                    dark:border-white/[0.08] dark:bg-[#0a0a0f]
                                "
                whileHover={{
                  scale: 1.08,
                  transition: { duration: 0.2 }
                }}
              >
                {/* Subtle glow behind */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-violet-500/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <span className="relative text-sm font-mono text-black/40 dark:text-white/40 group-hover:text-violet-600 dark:group-hover:text-white/70 transition-colors">
                  {step.number}
                </span>
              </motion.div>

              {/* Title */}
              <h3 className="text-lg font-medium text-black dark:text-white mb-2 group-hover:text-black dark:group-hover:text-white transition-colors">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-black/40 dark:text-white/40 leading-relaxed max-w-[200px] mx-auto group-hover:text-black/50 dark:group-hover:text-white/50 transition-colors">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
