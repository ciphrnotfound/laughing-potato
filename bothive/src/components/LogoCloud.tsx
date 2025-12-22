"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

const stats = [
    { value: "50K+", label: "Agents deployed", suffix: "" },
    { value: "10M+", label: "Tasks daily", suffix: "" },
    { value: "99.9", label: "Uptime", suffix: "%" },
    { value: "150+", label: "Countries", suffix: "" },
];

const companies = ["OpenAI", "Anthropic", "Google", "Microsoft", "Stripe", "Vercel"];

// Animated counter component
function AnimatedNumber({ value, suffix = "" }: { value: string; suffix?: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.span
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-block"
        >
            {value}{suffix}
        </motion.span>
    );
}

export function LogoCloud() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const y = useTransform(scrollYProgress, [0, 0.2], [60, 0]);

    return (
        <section ref={containerRef} className="relative py-32 bg-white dark:bg-[#08080c] overflow-hidden transition-colors duration-500">
            {/* Animated gradient line */}
            <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
                <motion.div
                    className="h-full w-1/2 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"
                    animate={{ x: ["-100%", "300%"] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                />
            </div>

            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-violet-500/30"
                    style={{
                        left: `${15 + i * 15}%`,
                        top: `${20 + (i % 3) * 25}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 3 + i * 0.5,
                        delay: i * 0.3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}

            <motion.div style={{ opacity, y }} className="max-w-5xl mx-auto px-6">
                {/* Companies with staggered reveal */}
                <div className="text-center mb-20">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-sm text-black/50 dark:text-white/30 mb-10"
                    >
                        Trusted by engineers at
                    </motion.p>

                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                        {companies.map((company, i) => (
                            <motion.span
                                key={company}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                whileHover={{
                                    scale: 1.1,
                                    textShadow: "0 0 20px rgba(139,92,246,0.3)"
                                }}
                                className="text-xl font-medium text-black/40 dark:text-white/20 cursor-default transition-all duration-300"
                            >
                                {company}
                            </motion.span>
                        ))}
                    </div>
                </div>

                {/* Stats with animated counters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + index * 0.15, duration: 0.6 }}
                            whileHover={{ scale: 1.05 }}
                            className="relative text-center group cursor-default"
                        >
                            {/* Glow effect on hover */}
                            <motion.div
                                className="absolute inset-0 bg-violet-500/5 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
                            />

                            <motion.p
                                className="relative text-5xl md:text-6xl font-semibold text-black dark:text-white mb-2 tracking-tight"
                            >
                                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                            </motion.p>
                            <p className="relative text-sm text-black/50 dark:text-white/40 group-hover:text-black/70 dark:group-hover:text-white/60 transition-colors duration-300">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}

export default LogoCloud;
