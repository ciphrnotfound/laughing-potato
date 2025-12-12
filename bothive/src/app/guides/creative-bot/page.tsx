"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft, Sparkles, Clock, CheckCircle2, Bot, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import ThemeToggle from "@/components/ThemeToggle";

export default function CreativeBotGuidePage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const steps = [
        {
            title: "Open the Builder",
            description: "Navigate to the Bothive Builder to start creating your creative bot.",
            action: (
                <Link
                    href="/builder"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors"
                >
                    Open Builder
                    <ArrowRight className="h-4 w-4" />
                </Link>
            ),
        },
        {
            title: "Choose a Creative Template",
            description: "Select one of our creative templates:\n• Surreal Oracle - Speaks in riddles and cosmic imagery\n• Chaos Artist - Generates glitch poetry and abstract art prompts",
        },
        {
            title: "Explore the Pre-built Prompt",
            description: "The template comes with a creative system prompt already configured. Feel free to read it and understand how it creates the surreal personality.",
        },
        {
            title: "Test with Imaginative Prompts",
            description: "Try prompts like:\n• 'Tell me about the dreams of clouds'\n• 'What does the color blue taste like?'\n• 'Generate art about the passage of time'",
        },
        {
            title: "Submit for Approval",
            description: "When you're happy with your creative bot, submit it for approval. Others can then experience your unique AI creation!",
        },
    ];

    return (
        <div className={cn(
            "min-h-screen transition-colors duration-300",
            isDark ? "bg-[#0a0a0f] text-white" : "bg-gray-50 text-gray-900"
        )}>
            {/* Header */}
            <header className={cn(
                "sticky top-0 z-50 border-b backdrop-blur-xl",
                isDark ? "border-white/10 bg-[#0a0a0f]/90" : "border-gray-200 bg-white/90"
            )}>
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/guides"
                        className={cn(
                            "flex items-center gap-2 text-sm font-medium transition-colors",
                            isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900"
                        )}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Guides
                    </Link>
                    <ThemeToggle />
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-violet-500/10 text-violet-400 mb-6">
                        <Sparkles className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Create a Creative Bot
                    </h1>
                    <p className={cn("text-lg max-w-2xl mx-auto mb-6", isDark ? "text-white/60" : "text-gray-600")}>
                        Build artistic bots that generate dreamlike content, surreal narratives, and abstract creative outputs.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                            Beginner
                        </span>
                        <span className={cn("flex items-center gap-1", isDark ? "text-white/50" : "text-gray-500")}>
                            <Clock className="h-4 w-4" />
                            5 minutes
                        </span>
                        <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 font-medium">
                            Everyone
                        </span>
                    </div>
                </motion.div>

                {/* Fun Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                        "rounded-xl border p-4 mb-8 flex items-start gap-3",
                        isDark ? "bg-violet-500/5 border-violet-500/20" : "bg-violet-50 border-violet-200"
                    )}
                >
                    <Sparkles className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className={cn("text-sm font-medium", isDark ? "text-violet-400" : "text-violet-700")}>
                            No Code Required!
                        </p>
                        <p className={cn("text-sm", isDark ? "text-violet-400/70" : "text-violet-600")}>
                            This is the easiest guide. Just pick a template, test it, and submit. The creative
                            personality is already built in!
                        </p>
                    </div>
                </motion.div>

                {/* Steps */}
                <div className="space-y-8">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className={cn(
                                "rounded-2xl border p-6",
                                isDark ? "bg-[#0d0d12] border-white/10" : "bg-white border-gray-200"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold text-sm">
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                                    <p className={cn("text-sm whitespace-pre-line", isDark ? "text-white/60" : "text-gray-600")}>
                                        {step.description}
                                    </p>

                                    {step.action && (
                                        <div className="mt-4">{step.action}</div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Success */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className={cn(
                        "mt-12 rounded-2xl border p-8 text-center",
                        isDark ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"
                    )}
                >
                    <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Express Yourself!</h3>
                    <p className={cn("mb-6", isDark ? "text-white/60" : "text-gray-600")}>
                        Creative bots are a fun way to explore what AI can do. Share yours with the community!
                    </p>
                    <Link
                        href="/builder"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-500 transition-colors"
                    >
                        <Bot className="h-5 w-5" />
                        Start Creating
                    </Link>
                </motion.div>
            </main>
        </div>
    );
}
