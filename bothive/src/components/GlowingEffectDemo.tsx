"use client";

import { Bot, Workflow, Zap, Shield, Globe } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { motion } from "framer-motion";

export function GlowingEffectDemo() {
    return (
        <section className="relative py-24 bg-white dark:bg-[#0a0a0f] transition-colors duration-500">
            {/* Subtle background pulse */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1a1025] rounded-full blur-[200px]"
                    animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="relative max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-sm text-black/40 dark:text-white/40 uppercase tracking-[0.2em] mb-4"
                    >
                        Platform
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-semibold text-black dark:text-white tracking-tight"
                    >
                        Built for the future
                    </motion.h2>
                </div>

                {/* Bento Grid */}
                <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
                    <GridItem
                        area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
                        icon={<Bot className="h-5 w-5" />}
                        title="Intelligent Agents"
                        description="Autonomous AI agents that learn and execute complex tasks."
                        delay={0}
                    />

                    <GridItem
                        area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
                        icon={<Workflow className="h-5 w-5" />}
                        title="Visual Builder"
                        description="Design workflows with drag-and-drop. No code required."
                        delay={0.1}
                    />

                    <GridItem
                        area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
                        icon={<Shield className="h-5 w-5" />}
                        title="Enterprise Security"
                        description="SOC 2 certified with end-to-end encryption and granular access controls."
                        delay={0.2}
                    />

                    <GridItem
                        area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
                        icon={<Zap className="h-5 w-5" />}
                        title="Lightning Fast"
                        description="Sub-millisecond response times on global edge infrastructure."
                        delay={0.3}
                    />

                    <GridItem
                        area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
                        icon={<Globe className="h-5 w-5" />}
                        title="Global Scale"
                        description="Deploy across 150+ regions with auto-failover and load balancing."
                        delay={0.4}
                    />
                </ul>
            </div>
        </section>
    );
}

interface GridItemProps {
    area: string;
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
    delay?: number;
}

const GridItem = ({ area, icon, title, description, delay = 0 }: GridItemProps) => {
    return (
        <motion.li
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className={`min-h-[14rem] list-none ${area}`}
        >
            <motion.div
                className="relative h-full rounded-2xl border bg-white border-black/[0.06] dark:bg-[#0a0a0f] dark:border-white/[0.04] p-2 md:rounded-3xl md:p-3 group transition-colors duration-500"
                whileHover={{ borderColor: "rgba(255,255,255,0.08)" }}
                transition={{ duration: 0.3 }}
            >
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                />
                <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                        <motion.div
                            className="w-fit rounded-xl border border-black/[0.06] bg-black/[0.02] text-black/50 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-white/30 p-2.5 group-hover:text-black/70 dark:group-hover:text-white/60 group-hover:border-black/[0.16] dark:group-hover:border-white/10 transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                        >
                            {icon}
                        </motion.div>
                        <div className="space-y-3">
                            <h3 className="font-medium text-xl text-black dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">
                                {title}
                            </h3>
                            <p className="text-sm text-black/60 dark:text-white/40 leading-relaxed group-hover:text-black/80 dark:group-hover:text-white/60 transition-colors">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.li>
    );
};

export default GlowingEffectDemo;
