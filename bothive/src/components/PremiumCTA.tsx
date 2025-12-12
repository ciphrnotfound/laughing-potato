"use client";

import React, { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

// Subtle grid with intersection dots - Vercel/Linear style
function SubtleGrid() {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Dot grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.15] dark:opacity-[0.08]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)`,
                    backgroundSize: "32px 32px",
                }}
            />

            {/* Single horizontal line that pulses */}
            <motion.div
                className="absolute left-0 right-0 h-px top-1/2"
                style={{
                    background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)",
                }}
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
}

// Minimal glow - single centered
function CenterGlow() {
    return (
        <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-20 dark:opacity-10 blur-[120px] pointer-events-none"
            style={{
                background: "radial-gradient(ellipse, rgba(139,92,246,0.4) 0%, transparent 70%)",
            }}
            animate={{
                scale: [1, 1.05, 1],
            }}
            transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
    );
}

export default function PremiumCTA() {
    const containerRef = useRef<HTMLDivElement>(null);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

    return (
        <section
            ref={containerRef}
            className="relative py-32 md:py-40 overflow-hidden
                bg-[#fafafa] dark:bg-[#0a0a0a]
            "
        >
            <SubtleGrid />
            <CenterGlow />

            {/* Top border line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />

            <motion.div
                ref={ref}
                style={{ y }}
                className="relative max-w-3xl mx-auto px-6 text-center"
            >
                {/* Minimal badge */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-8
                        border-black/[0.08] bg-white/50 backdrop-blur-sm
                        dark:border-white/[0.08] dark:bg-white/[0.03]
                    "
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                    <span className="text-xs font-medium text-black/60 dark:text-white/60">
                        Now available
                    </span>
                </motion.div>

                {/* Headline - clean, no gradients */}
                <motion.h2
                    initial={{ opacity: 0, y: 24 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl md:text-5xl lg:text-[56px] font-semibold tracking-[-0.02em] leading-[1.1] mb-6
                        text-[#0a0a0a] dark:text-white
                    "
                >
                    Ship AI agents
                    <br />
                    <span className="text-violet-600 dark:text-violet-400">in minutes</span>
                </motion.h2>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-base md:text-lg max-w-lg mx-auto leading-relaxed mb-10
                        text-black/50 dark:text-white/50
                    "
                >
                    The platform for building, deploying, and scaling autonomous AI agents. Start free, scale infinitely.
                </motion.p>

                {/* CTA Buttons - Linear style */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3"
                >
                    {/* Primary */}
                    <Link
                        href="/signup"
                        className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium
                            bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]
                            dark:bg-white dark:text-black dark:hover:bg-white/90
                            transition-colors
                        "
                    >
                        Get started
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>

                    {/* Secondary */}
                    <Link
                        href="/demo"
                        className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium
                            text-black/70 hover:text-black border border-black/10 hover:border-black/20 hover:bg-black/[0.02]
                            dark:text-white/70 dark:hover:text-white dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/[0.02]
                            transition-all
                        "
                    >
                        <Play className="w-3.5 h-3.5" />
                        Watch demo
                    </Link>
                </motion.div>

                {/* Stats - minimal */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-16 pt-10 border-t border-black/[0.06] dark:border-white/[0.06]"
                >
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                        {[
                            { value: "10K+", label: "Agents deployed" },
                            { value: "99.9%", label: "Uptime SLA" },
                            { value: "<50ms", label: "P95 latency" },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-2xl font-semibold text-[#0a0a0a] dark:text-white tracking-tight">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-black/40 dark:text-white/40 mt-1">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            {/* Bottom border line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
        </section>
    );
}
