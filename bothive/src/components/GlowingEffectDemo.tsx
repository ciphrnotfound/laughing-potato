"use client";

import { Bot, Workflow, Zap, Shield, Globe } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function GlowingEffectDemo() {
    return (
        <section className="relative py-32 bg-[#0a0a0f] overflow-hidden">
            {/* Animated background glow */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/5 rounded-full blur-[200px]"
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.15, 1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Floating particles */}
            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-violet-500/30"
                    style={{
                        left: `${5 + i * 10}%`,
                        top: `${10 + (i % 5) * 18}%`,
                    }}
                    animate={{
                        y: [0, -50, 0],
                        x: [0, i % 2 ? 20 : -20, 0],
                        opacity: [0.2, 0.6, 0.2],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: 5 + i * 0.5,
                        delay: i * 0.3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}

            <div className="relative max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-20">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-sm text-white/40 uppercase tracking-[0.2em] mb-4"
                    >
                        Platform
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-semibold text-white tracking-tight"
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
                        featured
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
    featured?: boolean;
}

const GridItem = ({ area, icon, title, description, delay = 0, featured = false }: GridItemProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.li
            ref={ref}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay, duration: 0.6, ease: "easeOut" }}
            className={`min-h-[14rem] list-none ${area}`}
        >
            <motion.div
                className="relative h-full rounded-2xl border border-white/[0.04] bg-[#0a0a0f] p-2 md:rounded-3xl md:p-3 group overflow-hidden"
                whileHover={{
                    borderColor: "rgba(139,92,246,0.2)",
                    transition: { duration: 0.3 }
                }}
            >
                {/* Animated gradient overlay */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />

                {/* Corner glow on hover */}
                <motion.div
                    className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />

                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                />

                <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                        {/* Icon with animation */}
                        <motion.div
                            className="w-fit rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-white/30 group-hover:text-violet-400 group-hover:border-violet-500/20 transition-all duration-300"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            {icon}
                        </motion.div>

                        <div className="space-y-3">
                            {/* Title with underline animation */}
                            <div className="relative overflow-hidden">
                                <h3 className="font-semibold text-xl text-white group-hover:text-white transition-colors">
                                    {title}
                                </h3>
                                <motion.div
                                    className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-violet-500 to-purple-500"
                                    initial={{ width: 0 }}
                                    whileInView={{ width: featured ? "100%" : "60%" }}
                                    viewport={{ once: true }}
                                    transition={{ delay: delay + 0.3, duration: 0.8 }}
                                />
                            </div>

                            <p className="text-sm text-white/40 leading-relaxed group-hover:text-white/60 transition-colors duration-300">
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
