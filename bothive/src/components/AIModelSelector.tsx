"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    Zap,
    Clock,
    TrendingUp,
    Shield,
    Globe,
    Check,
    Info,
    Star,
    Bolt,
    Cpu,
    MemoryStick,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";

interface AIModel {
    id: string;
    name: string;
    provider: string;
    description: string;
    speed: number; // 1-5
    accuracy: number; // 1-5
    cost: number; // 1-5 (1 = cheapest)
    context: number; // context window in tokens (thousands)
    features: string[];
    color: string;
    icon: React.ComponentType<{ className?: string }>;
    recommended?: boolean;
    popular?: boolean;
    new?: boolean;
    premium?: boolean;
}

interface AIModelSelectorProps {
    selectedModel: string;
    onModelChange: (modelId: string) => void;
    className?: string;
}

const AI_MODELS: AIModel[] = [
    {
        id: "llama-3.3-70b-versatile",
        name: "Llama 3.3 70B",
        provider: "Groq",
        description: "Most versatile and balanced model for general purpose tasks",
        speed: 5,
        accuracy: 4,
        cost: 4,
        context: 128,
        features: ["Fast", "Accurate", "General Purpose", "Code", "Reasoning"],
        color: "from-purple-500 to-pink-500",
        icon: Brain,
        recommended: true,
        popular: true,
    },
    {
        id: "mixtral-8x7b-32768",
        name: "Mixtral 8x7B",
        provider: "Groq",
        description: "Excellent for complex reasoning and analysis tasks",
        speed: 4,
        accuracy: 5,
        cost: 3,
        context: 32,
        features: ["Complex Reasoning", "Analysis", "Scientific", "Technical"],
        color: "from-blue-500 to-cyan-500",
        icon: Cpu,
    },
    {
        id: "gemma-7b-it",
        name: "Gemma 7B",
        provider: "Groq",
        description: "Lightning fast model for simple tasks and quick responses",
        speed: 5,
        accuracy: 3,
        cost: 5,
        context: 8,
        features: ["Ultra Fast", "Simple Tasks", "Chat", "Quick Response"],
        color: "from-green-500 to-emerald-500",
        icon: Zap,
        new: true,
    },
    {
        id: "llama3-70b-8192",
        name: "Llama 3 70B",
        provider: "Groq",
        description: "Large context model for document processing",
        speed: 3,
        accuracy: 4,
        cost: 3,
        context: 8,
        features: ["Large Context", "Documents", "Summarization", "Analysis"],
        color: "from-orange-500 to-red-500",
        icon: MemoryStick,
    },
    {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        provider: "OpenAI",
        description: "Industry standard for complex tasks and creativity",
        speed: 3,
        accuracy: 5,
        cost: 2,
        context: 128,
        features: ["Creative", "Complex Tasks", "Vision", "Code"],
        color: "from-yellow-500 to-orange-500",
        icon: Star,
        premium: true,
    },
    {
        id: "claude-3-sonnet",
        name: "Claude 3 Sonnet",
        provider: "Anthropic",
        description: "Excellent for creative writing and analysis",
        speed: 3,
        accuracy: 4,
        cost: 2,
        context: 200,
        features: ["Creative Writing", "Analysis", "Long Context", "Safe"],
        color: "from-red-500 to-pink-500",
        icon: Globe,
        premium: true,
    },
];

export default function AIModelSelector({
    selectedModel,
    onModelChange,
    className,
}: AIModelSelectorProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [hoveredModel, setHoveredModel] = useState<string | null>(null);

    const renderStars = (rating: number, max: number = 5) => {
        return (
            <div className="flex gap-1">
                {[...Array(max)].map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            "h-3 w-3",
                            i < rating ? "fill-yellow-400 text-yellow-400" : "text-white/20"
                        )}
                    />
                ))}
            </div>
        );
    };

    const StatBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">{label}</span>
                <span className="text-white/80">{value}/5</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                    className={cn("h-full rounded-full transition-all duration-500", color)}
                    style={{ width: `${(value / 5) * 100}%` }}
                />
            </div>
        </div>
    );

    const cardClass = cn(
        "group relative overflow-hidden rounded-3xl border bg-white/5 p-6 transition-all duration-300",
        "hover:bg-white/10 hover:scale-[1.02] hover:shadow-2xl",
        isDark ? "border-white/10" : "border-black/10"
    );

    const selectedCardClass = cn(
        "ring-2 ring-purple-500 bg-purple-500/10",
        "shadow-purple-500/20 shadow-xl"
    );

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-white">AI Model</h3>
                    <p className="text-sm text-white/60">Choose the brain for your bot</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1">
                        <div className="h-2 w-2 rounded-full bg-green-400" />
                        <span className="text-xs text-green-300">Groq Available</span>
                    </div>
                </div>
            </div>

            {/* Model Grid */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {AI_MODELS.map((model) => (
                    <motion.div
                        key={model.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                        onHoverStart={() => setHoveredModel(model.id)}
                        onHoverEnd={() => setHoveredModel(null)}
                        onClick={() => onModelChange(model.id)}
                        className={cn(
                            cardClass,
                            selectedModel === model.id && selectedCardClass,
                            "cursor-pointer"
                        )}
                    >
                        {/* Badges */}
                        <div className="absolute right-4 top-4 flex gap-2">
                            {model.recommended && (
                                <span className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-2 py-1 text-xs font-medium text-white">
                                    Recommended
                                </span>
                            )}
                            {model.popular && (
                                <span className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2 py-1 text-xs font-medium text-white">
                                    Popular
                                </span>
                            )}
                            {model.new && (
                                <span className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-2 py-1 text-xs font-medium text-white">
                                    New
                                </span>
                            )}
                        </div>

                        {/* Header */}
                        <div className="mb-4 flex items-center gap-4">
                            <div className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br transition-all duration-300",
                                model.color,
                                selectedModel === model.id ? "scale-110" : ""
                            )}>
                                <model.icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className={cn(
                                    "text-lg font-semibold transition-colors",
                                    selectedModel === model.id ? "text-white" : "text-white/90"
                                )}>
                                    {model.name}
                                </h4>
                                <p className="text-sm text-white/60">{model.provider}</p>
                            </div>
                        </div>

                        {/* Description */}
                        <p className={cn(
                            "mb-4 text-sm transition-colors",
                            selectedModel === model.id ? "text-white/80" : "text-white/60"
                        )}>
                            {model.description}
                        </p>

                        {/* Stats */}
                        <div className="mb-4 space-y-2">
                            <StatBar label="Speed" value={model.speed} color="from-green-500 to-emerald-500" />
                            <StatBar label="Accuracy" value={model.accuracy} color="from-blue-500 to-cyan-500" />
                            <StatBar label="Cost Efficiency" value={model.cost} color="from-yellow-500 to-orange-500" />
                        </div>

                        {/* Features */}
                        <div className="mb-4 flex flex-wrap gap-2">
                            {model.features.map((feature) => (
                                <span
                                    key={feature}
                                    className={cn(
                                        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                        selectedModel === model.id
                                            ? "bg-purple-500/20 text-purple-300"
                                            : "bg-white/10 text-white/60"
                                    )}
                                >
                                    {feature}
                                </span>
                            ))}
                        </div>

                        {/* Context Window */}
                        <div className={cn(
                            "mb-4 flex items-center justify-between rounded-xl border p-3 transition-colors",
                            selectedModel === model.id
                                ? "border-purple-500/30 bg-purple-500/10"
                                : "border-white/10 bg-white/5"
                        )}>
                            <div className="flex items-center gap-2">
                                <MemoryStick className="h-4 w-4 text-white/60" />
                                <span className="text-sm text-white/60">Context Window</span>
                            </div>
                            <span className="text-sm font-medium text-white">{model.context}k tokens</span>
                        </div>

                        {/* Selection Indicator */}
                        <div className={cn(
                            "absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border transition-all",
                            selectedModel === model.id
                                ? "border-purple-500 bg-purple-500"
                                : "border-white/20 bg-white/10 group-hover:border-white/40"
                        )}>
                            {selectedModel === model.id && (
                                <Check className="h-4 w-4 text-white" />
                            )}
                        </div>

                        {/* Hover Effect */}
                        <AnimatePresence>
                            {hoveredModel === model.id && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={cn(
                                        "absolute inset-0 rounded-3xl",
                                        "bg-gradient-to-br from-white/5 to-transparent"
                                    )}
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>

            {/* Model Comparison */}
            <div className="rounded-3xl border bg-white/5 p-6">
                <h4 className="mb-4 text-lg font-semibold text-white">Model Comparison</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="pb-3 text-left text-white/60">Model</th>
                                <th className="pb-3 text-center text-white/60">Speed</th>
                                <th className="pb-3 text-center text-white/60">Accuracy</th>
                                <th className="pb-3 text-center text-white/60">Cost</th>
                                <th className="pb-3 text-center text-white/60">Context</th>
                            </tr>
                        </thead>
                        <tbody>
                            {AI_MODELS.map((model) => (
                                <tr
                                    key={model.id}
                                    className={cn(
                                        "border-b border-white/5 transition-colors",
                                        selectedModel === model.id ? "bg-purple-500/10" : "hover:bg-white/5"
                                    )}
                                >
                                    <td className="py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br", model.color)}>
                                                <model.icon className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{model.name}</p>
                                                <p className="text-xs text-white/60">{model.provider}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 text-center">
                                        {renderStars(model.speed)}
                                    </td>
                                    <td className="py-3 text-center">
                                        {renderStars(model.accuracy)}
                                    </td>
                                    <td className="py-3 text-center">
                                        {renderStars(model.cost)}
                                    </td>
                                    <td className="py-3 text-center">
                                        <span className="text-white/80">{model.context}k</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}