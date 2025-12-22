"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
    Code,
    GraduationCap,
    Building2,
    ArrowRight,
    Terminal,
    Zap,
    Users,
    GitBranch,
    Lightbulb,
    BookOpen,
    Shield,
    Workflow,
    BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Data ---
const useCases = [
    {
        id: "developers",
        title: "For Developers",
        subtitle: "Ship AI features in hours",
        icon: Code,
        gradient: "from-violet-500 to-purple-600",
        lightGradient: "from-violet-600 to-purple-700",
        description: "Build production-ready AI agents with our type-safe SDK. Full control over behavior, tools, and memory.",
        features: [
            { icon: Terminal, text: "Type-safe SDK" },
            { icon: GitBranch, text: "Version control" },
            { icon: Zap, text: "Global Edge" },
        ],
        codeSnippet: `const agent = new Bothive.Agent({
  name: "support-agent",
  model: "claude-3-opus",
  tools: [ticket, escalate],
});

await agent.deploy({ region: "global" });`,
    },
    {
        id: "students",
        title: "For Learners",
        subtitle: "Master AI by building",
        icon: GraduationCap,
        gradient: "from-blue-500 to-cyan-500",
        lightGradient: "from-blue-600 to-cyan-600",
        description: "Start with templates, visual debugging, and understand the patterns of autonomous systems.",
        features: [
            { icon: BookOpen, text: "Interactive Tutorials" },
            { icon: Lightbulb, text: "Visual Debugging" },
            { icon: Users, text: "Community" },
        ],
        codeSnippet: `const tutor = await Bothive.fork(
  "templates/study-assistant"
);

tutor.on("step", (step) => {
  console.log(step.reasoning);
});`,
    },
    {
        id: "businesses",
        title: "For Teams",
        subtitle: "Enterprise automation",
        icon: Building2,
        gradient: "from-emerald-500 to-teal-500",
        lightGradient: "from-emerald-600 to-teal-600",
        description: "SOC 2 Type II compliant automation with SSO, audit logs, and RBS (Role Based Security).",
        features: [
            { icon: Shield, text: "SOC 2 Certified" },
            { icon: Workflow, text: "200+ Integrations" },
            { icon: BarChart3, text: "ROI Analytics" },
        ],
        codeSnippet: `const workflow = new Workflow({
  trigger: "slack.message",
  steps: [classify, search, reply],
  audit: true,
  sso: true
});`,
    },
];

// --- 3D Card Component ---
const Card3D = ({ activeCase }: { activeCase: typeof useCases[0] }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXFromCenter = e.clientX - rect.left - width / 2;
        const mouseYFromCenter = e.clientY - rect.top - height / 2;

        x.set(mouseXFromCenter / width);
        y.set(mouseYFromCenter / height);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            className="perspective-[1000px] w-full max-w-4xl mx-auto h-[500px] relative z-20 group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className="w-full h-full relative rounded-3xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-[#0a0a0f]/50 backdrop-blur-xl shadow-2xl transition-colors duration-500"
            >
                {/* Dynamic Spotlight */}
                <motion.div
                    style={{
                        background: useTransform(
                            [mouseX, mouseY],
                            ([latestX, latestY]) => `radial-gradient(
                                600px circle at ${50 + latestX * 100}% ${50 + latestY * 100}%,
                                rgba(139, 92, 246, 0.15),
                                transparent 80%
                            )`
                        ),
                    }}
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                />

                {/* Content Layout */}
                <div className="flex flex-col md:flex-row h-full p-8 md:p-12 gap-8 items-center">

                    {/* Left: Text Info */}
                    <div className="flex-1 space-y-6 pointer-events-none" style={{ transform: "translateZ(30px)" }}>
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br p-[1px]",
                                activeCase.id === "developers" ? "from-violet-500 to-purple-600" :
                                    activeCase.id === "students" ? "from-blue-500 to-cyan-500" :
                                        "from-emerald-500 to-teal-500"
                            )}>
                                <div className="w-full h-full rounded-xl bg-white dark:bg-[#0a0a0f] flex items-center justify-center">
                                    <activeCase.icon className="w-5 h-5 text-black dark:text-white" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-black dark:text-white" style={{ textShadow: "0 0 20px rgba(0,0,0,0.1)" }}>
                                {activeCase.title}
                            </h3>
                        </div>

                        <p className="text-lg text-black/60 dark:text-white/60 leading-relaxed">
                            {activeCase.description}
                        </p>

                        <div className="space-y-3 pt-4">
                            {activeCase.features.map((feature, i) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={i} className="flex items-center gap-3 text-sm text-black/70 dark:text-white/70">
                                        <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5">
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        {feature.text}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Code Block (Floating Depth) */}
                    <div className="flex-1 w-full max-w-sm" style={{ transform: "translateZ(60px)" }}>
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 bg-[#fafafa] dark:bg-[#111] p-6 group-hover:shadow-violet-500/10 transition-shadow duration-500">
                            {/* Terminal Dots */}
                            <div className="flex gap-2 mb-4 opacity-50">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            </div>
                            {/* Code */}
                            <pre className="text-[11px] md:text-xs font-mono text-zinc-600 dark:text-zinc-400 overflow-x-auto">
                                <code>{activeCase.codeSnippet}</code>
                            </pre>

                            {/* Floating Badge */}
                            <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full blur-xl opacity-20" />
                        </div>
                    </div>

                </div>
            </motion.div>
        </motion.div>
    );
};


export default function UseCasesSection() {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <section className="relative py-32 overflow-hidden bg-[#fafafa] dark:bg-[#08080c] transition-colors duration-500">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-violet-500/5 to-transparent blur-3xl pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white mb-6">
                        Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">Everyone</span>
                    </h2>
                    <p className="text-lg text-black/50 dark:text-white/50">
                        Whether you're writing your first line of code or scaling a Fortune 500 company.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-12">
                    <div className="flex p-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 backdrop-blur-sm">
                        {useCases.map((item, index) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(index)}
                                className={cn(
                                    "relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                    activeTab === index
                                        ? "text-black dark:text-white shadow-sm"
                                        : "text-black/50 dark:text-white/50 hover:text-black/80 dark:hover:text-white/80"
                                )}
                            >
                                {activeTab === index && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white dark:bg-white/10 rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <item.icon className="w-4 h-4" />
                                    {item.title}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3D Content Area */}
                <div className="relative h-[550px] w-full flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <Card3D activeCase={useCases[activeTab]} />
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>
        </section>
    );
}
