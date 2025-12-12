"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CTA() {
    return (
        <section className="relative py-24 overflow-hidden">
            {/* Dark Purple Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a0b2e] via-[#11051f] to-[#05020a] z-0" />

            {/* Animated Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mb-8 flex justify-center"
                >
                    <div className="relative w-20 h-20 md:w-24 md:h-24">
                        <Image
                            src="/colored-logo (2).png"
                            alt="Bothive Logo"
                            fill
                            className="object-contain drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                        />
                    </div>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
                >
                    Ready to orchestrate your swarm?
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-white/60 mb-10 max-w-2xl mx-auto"
                >
                    Join thousands of developers and teams building the future of autonomous work. Start for free, scale as you grow.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Link
                        href="/signup"
                        className="px-8 py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105"
                    >
                        Start Building Free
                    </Link>
                    <Link
                        href="/contact"
                        className="px-8 py-4 rounded-xl border border-white/10 bg-white/5 text-white font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
                    >
                        Contact Sales
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
