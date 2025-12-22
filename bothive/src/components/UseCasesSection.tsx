"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
    Code,
    GraduationCap,
    Building2,
    ArrowRight,
    Terminal,
    Sparkles,
    Zap,
    Users,
    Bot,
    GitBranch,
    Lightbulb,
    BookOpen,
    Rocket,
    BarChart3,
    Clock,
    Shield,
    Workflow
} from "lucide-react";

const useCases = [
    {
        id: "developers",
        title: "For Developers",
        subtitle: "Ship AI features in hours, not weeks",
        icon: Code,
        gradient: "from-violet-500 to-purple-600",
        lightGradient: "from-violet-600 to-purple-700",
        description: "Build production-ready AI agents with our type-safe SDK. Full control over agent behavior, tool execution, and memory management.",
        features: [
            { icon: Terminal, text: "Type-safe SDK with IntelliSense" },
            { icon: GitBranch, text: "Version control for agent behaviors" },
            { icon: Zap, text: "Deploy to 150+ edge locations" },
        ],
        workflow: {
            title: "Developer workflow",
            steps: [
                { label: "Define", description: "Create agent with custom prompts, tools, and memory" },
                { label: "Test", description: "Iterate rapidly in sandbox with real-time logs" },
                { label: "Deploy", description: "One command to push live globally" },
                { label: "Monitor", description: "Track latency, errors, and usage in real-time" },
            ]
        },
        codeSnippet: `import { Bothive } from "@bothive/sdk";

const agent = new Bothive.Agent({
  name: "support-agent",
  model: "claude-3-opus",
  tools: [ticket, escalate, resolve],
  memory: "persistent",
});

// Deploy globally
await agent.deploy({ regions: "all" });`,
    },
    {
        id: "students",
        title: "For Learners",
        subtitle: "Master AI through building",
        icon: GraduationCap,
        gradient: "from-blue-500 to-cyan-500",
        lightGradient: "from-blue-600 to-cyan-600",
        description: "The best way to learn AI is by building. Start with templates, understand the patterns, then create your own agents from scratch.",
        features: [
            { icon: BookOpen, text: "Interactive tutorials with explanations" },
            { icon: Lightbulb, text: "Visual debugging to understand flow" },
            { icon: Users, text: "Active community for questions" },
        ],
        workflow: {
            title: "Learning journey",
            steps: [
                { label: "Explore", description: "Browse 50+ educational templates" },
                { label: "Understand", description: "Step through agent execution visually" },
                { label: "Modify", description: "Experiment by changing behaviors" },
                { label: "Create", description: "Build portfolio projects from scratch" },
            ]
        },
        codeSnippet: `// Start with a template
const tutor = await Bothive.fork(
  "templates/study-assistant"
);

// See how it works
tutor.on("step", (step) => {
  console.log(step.reasoning);
  console.log(step.action);
});

// Customize for your needs
tutor.addTool(flashcardGenerator);`,
    },
    {
        id: "businesses",
        title: "For Teams",
        subtitle: "Automate without compromising security",
        icon: Building2,
        gradient: "from-emerald-500 to-teal-500",
        lightGradient: "from-emerald-600 to-teal-600",
        description: "Enterprise-grade AI automation with SOC 2 compliance, SSO, audit logs, and dedicated support. Your data never leaves your control.",
        features: [
            { icon: Shield, text: "SOC 2 Type II certified" },
            { icon: Workflow, text: "Connect to 200+ enterprise tools" },
            { icon: BarChart3, text: "ROI dashboards and analytics" },
        ],
        workflow: {
            title: "Implementation process",
            steps: [
                { label: "Assess", description: "Identify high-impact automation opportunities" },
                { label: "Pilot", description: "Deploy agents in controlled environment" },
                { label: "Scale", description: "Roll out across teams and departments" },
                { label: "Optimize", description: "Continuous improvement from analytics" },
            ]
        },
        codeSnippet: `// Enterprise workflow automation
const workflow = new Bothive.Workflow({
  trigger: {
    event: "slack.message",
    filter: "channel:support"
  },
  steps: [
    classifyIntent,
    searchKnowledgeBase,
    draftResponse,
    humanReviewIfNeeded,
    sendReply
  ],
  audit: true,  // Full audit trail
  sso: true,    // SSO integration
});`,
    },
];

function WorkflowStep({ step, index, isActive }: { step: { label: string; description: string }; index: number; isActive: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
            className="flex items-start gap-4"
        >
            <div className="flex flex-col items-center">
                <motion.div
                    className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-medium transition-all duration-300 ${isActive
                            ? "border-violet-500/50 bg-violet-500/10 text-violet-600 dark:border-white/30 dark:bg-white/10 dark:text-white"
                            : "border-black/10 text-black/40 dark:border-white/10 dark:text-white/40"
                        }`}
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5 }}
                >
                    {index + 1}
                </motion.div>
                {index < 3 && <div className="w-px h-8 bg-black/[0.06] dark:bg-white/[0.06]" />}
            </div>
            <div className="pb-6">
                <p className={`text-sm font-medium transition-colors ${isActive ? "text-black dark:text-white" : "text-black/60 dark:text-white/60"}`}>
                    {step.label}
                </p>
                <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">{step.description}</p>
            </div>
        </motion.div>
    );
}

function UseCaseCard({ useCase, index, isActive, onClick }: {
    useCase: typeof useCases[0];
    index: number;
    isActive: boolean;
    onClick: () => void;
}) {
    const Icon = useCase.icon;

    return (
        <motion.button
            onClick={onClick}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -2 }}
            className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${isActive
                    ? "border-violet-500/20 bg-violet-500/[0.03] dark:border-white/[0.12] dark:bg-white/[0.03]"
                    : "border-black/[0.06] hover:border-black/[0.12] dark:border-white/[0.04] dark:hover:border-white/[0.08]"
                }`}
        >
            <div className="flex items-center gap-4 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${useCase.lightGradient} dark:${useCase.gradient} p-[1px]`}>
                    <div className="w-full h-full rounded-xl bg-white dark:bg-[#0a0a0f] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-violet-600 dark:text-white/70" />
                    </div>
                </div>
                <div>
                    <h3 className="text-base font-medium text-black dark:text-white">{useCase.title}</h3>
                    <p className="text-xs text-black/40 dark:text-white/40">{useCase.subtitle}</p>
                </div>
            </div>
            <p className="text-sm text-black/50 dark:text-white/50 leading-relaxed">
                {useCase.description}
            </p>

            {isActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1 mt-4 text-xs text-violet-600 dark:text-white/40"
                >
                    <span>View details</span>
                    <ArrowRight className="w-3 h-3" />
                </motion.div>
            )}
        </motion.button>
    );
}

function DetailPanel({ useCase }: { useCase: typeof useCases[0] }) {
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 4);
        }, 2500);
        return () => clearInterval(interval);
    }, [useCase.id]);

    return (
        <motion.div
            key={useCase.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="h-full"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Workflow */}
                <div className="p-6 rounded-2xl border border-black/[0.06] bg-white dark:border-white/[0.04] dark:bg-[#0a0a0f]">
                    <p className="text-xs text-black/40 dark:text-white/40 uppercase tracking-wider mb-6">{useCase.workflow.title}</p>
                    <div>
                        {useCase.workflow.steps.map((step, i) => (
                            <WorkflowStep
                                key={step.label}
                                step={step}
                                index={i}
                                isActive={i === activeStep}
                            />
                        ))}
                    </div>
                </div>

                {/* Code Example */}
                <div className="p-6 rounded-2xl border border-black/[0.06] bg-[#1a1a1f] dark:border-white/[0.04] dark:bg-[#0a0a0f]">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs text-white/40 uppercase tracking-wider">Example code</p>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                        </div>
                    </div>
                    <motion.pre
                        className="text-[11px] font-mono text-white/70 leading-relaxed overflow-x-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <code>{useCase.codeSnippet}</code>
                    </motion.pre>

                    {/* Features */}
                    <div className="mt-6 pt-6 border-t border-white/[0.06]">
                        <div className="space-y-3">
                            {useCase.features.map((feature, i) => {
                                const FeatureIcon = feature.icon;
                                return (
                                    <motion.div
                                        key={feature.text}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                        className="flex items-center gap-3 text-xs text-white/50"
                                    >
                                        <FeatureIcon className="w-3.5 h-3.5 text-white/30" />
                                        <span>{feature.text}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function UseCasesSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [activeCase, setActiveCase] = useState(0);

    return (
        <section
            ref={ref}
            className="relative py-24 md:py-32 overflow-hidden transition-colors duration-500
                bg-[#fafafa] dark:bg-[#08080c]
            "
            id="use-cases"
        >
            {/* Subtle ambient glow */}
            <motion.div
                className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-violet-500/[0.03] dark:bg-violet-600/[0.03] rounded-full blur-[150px] -translate-y-1/2"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5 }}
                        className="text-sm text-black/40 dark:text-white/40 uppercase tracking-widest mb-4"
                    >
                        Use Cases
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                        animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                        transition={{ duration: 0.6, delay: 0.05 }}
                        className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-4
                            text-black dark:text-white
                        "
                    >
                        Built for how you work
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-lg text-black/40 dark:text-white/40 max-w-2xl mx-auto"
                    >
                        Whether you&apos;re shipping your first agent or scaling across your organization
                    </motion.p>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Use Case Selector */}
                    <div className="lg:col-span-4 space-y-4">
                        {useCases.map((useCase, index) => (
                            <UseCaseCard
                                key={useCase.id}
                                useCase={useCase}
                                index={index}
                                isActive={activeCase === index}
                                onClick={() => setActiveCase(index)}
                            />
                        ))}
                    </div>

                    {/* Right: Detail Panel */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            <DetailPanel useCase={useCases[activeCase]} />
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}
