"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const testimonials = [
    {
        id: 1,
        quote: "Bothive transformed how we think about AI automation. We deployed 50+ agents in a week and saw immediate results.",
        author: "Sarah Chen",
        role: "VP of Engineering",
        company: "TechFlow",
    },
    {
        id: 2,
        quote: "The visual workflow builder is a game-changer. Our non-technical team can now create sophisticated automations.",
        author: "Marcus Johnson",
        role: "Head of Operations",
        company: "ScaleUp",
    },
    {
        id: 3,
        quote: "We evaluated 12 platforms. Bothive was the only one that could handle our enterprise requirements.",
        author: "Emily Rodriguez",
        role: "CTO",
        company: "DataFirst",
    },
];

export function Testimonials() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <section
            ref={ref}
            className="relative py-24 md:py-32 overflow-hidden transition-colors duration-500
                bg-[#fafafa] dark:bg-[#0a0a0f]
            "
        >
            {/* Subtle ambient glow */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-violet-500/[0.03] dark:bg-violet-600/[0.02] rounded-full blur-[120px]"
                animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5 }}
                        className="text-sm text-black/40 dark:text-white/40 uppercase tracking-widest mb-4"
                    >
                        Testimonials
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                        animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                        transition={{ duration: 0.6, delay: 0.05 }}
                        className="text-3xl md:text-4xl font-semibold text-black dark:text-white tracking-tight"
                    >
                        Trusted by engineering teams
                    </motion.h2>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                            transition={{
                                duration: 0.6,
                                delay: 0.15 + index * 0.12,
                                ease: [0.25, 0.1, 0.25, 1]
                            }}
                            whileHover={{
                                y: -4,
                                transition: { duration: 0.25 }
                            }}
                            className="group p-8 rounded-2xl border transition-all duration-300
                                border-black/[0.06] bg-white hover:border-black/[0.12] hover:shadow-lg hover:shadow-black/5
                                dark:border-white/[0.04] dark:bg-gradient-to-b dark:from-white/[0.01] dark:to-transparent dark:hover:border-white/[0.08] dark:hover:bg-white/[0.01]
                            "
                        >
                            <motion.blockquote
                                className="text-black/60 dark:text-white/60 leading-relaxed mb-8 group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors"
                            >
                                &ldquo;{testimonial.quote}&rdquo;
                            </motion.blockquote>

                            <div className="flex items-center gap-4">
                                <motion.div
                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-white/[0.06] dark:to-white/[0.02] flex items-center justify-center border border-violet-200/50 dark:border-white/[0.04]"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <span className="text-sm font-medium text-violet-600 dark:text-white/50 group-hover:text-violet-700 dark:group-hover:text-white/70 transition-colors">
                                        {testimonial.author.charAt(0)}
                                    </span>
                                </motion.div>
                                <div>
                                    <p className="text-sm font-medium text-black dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">
                                        {testimonial.author}
                                    </p>
                                    <p className="text-xs text-black/40 dark:text-white/40">
                                        {testimonial.role}, {testimonial.company}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Testimonials;
