"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
    Bot,
    Workflow,
    Zap,
    Shield,
    Globe,
    BarChart3,
    Plug,
    Users,
} from "lucide-react";

const features = [
    { icon: Bot, title: "Autonomous Agents", description: "AI that executes complex tasks independently." },
    { icon: Workflow, title: "Visual Workflows", description: "Drag-and-drop automation builder." },
    { icon: Zap, title: "Fast Execution", description: "Sub-millisecond response times." },
    { icon: Shield, title: "Enterprise Security", description: "SOC 2 certified with encryption." },
    { icon: Globe, title: "Global Scale", description: "150+ regions with auto-failover." },
    { icon: BarChart3, title: "Analytics", description: "Real-time AI-powered insights." },
    { icon: Plug, title: "Integrations", description: "200+ tools out of the box." },
    { icon: Users, title: "Collaboration", description: "Team workspaces with permissions." },
];

export function FeaturesGrid() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <section
            ref={ref}
            className="relative py-24 md:py-32 overflow-hidden transition-colors duration-500
                bg-white dark:bg-[#0a0a0f]
            "
        >
            {/* Subtle gradient orbs */}
            <motion.div
                className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/[0.04] dark:bg-violet-600/[0.03] rounded-full blur-[120px]"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/[0.03] dark:bg-purple-600/[0.02] rounded-full blur-[100px]"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
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
                        Capabilities
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                        animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                        transition={{ duration: 0.6, delay: 0.05 }}
                        className="text-3xl md:text-4xl font-semibold text-black dark:text-white tracking-tight"
                    >
                        Everything you need
                    </motion.h2>
                </div>

                {/* Features Grid */}
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border
                        bg-black/[0.04] border-black/[0.06]
                        dark:bg-white/[0.02] dark:border-white/[0.04]
                    "
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{
                                    duration: 0.5,
                                    delay: 0.2 + index * 0.05,
                                    ease: [0.25, 0.1, 0.25, 1]
                                }}
                                whileHover={{
                                    backgroundColor: "rgba(139,92,246,0.02)",
                                    transition: { duration: 0.2 }
                                }}
                                className="group p-8 bg-white dark:bg-[#0a0a0f] transition-colors"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.15, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                >
                                    <Icon className="w-5 h-5 text-violet-500/50 dark:text-white/25 mb-4 group-hover:text-violet-600 dark:group-hover:text-white/50 transition-colors duration-300" />
                                </motion.div>
                                <h3 className="text-sm font-medium text-black dark:text-white mb-1 group-hover:text-black dark:group-hover:text-white transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-xs text-black/40 dark:text-white/40 leading-relaxed group-hover:text-black/50 dark:group-hover:text-white/50 transition-colors">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}

export default FeaturesGrid;
