"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Bot, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type TemplateType = "agent" | "bot";

export interface Template {
    id: string;
    label: string;
    blurb: string;
    type: TemplateType;
    capabilities: string[];
    icon?: React.ReactNode;
}

interface TemplateSelectorProps {
    templates: Template[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onContinue: () => void;
}

export default function TemplateSelector({
    templates,
    selectedId,
    onSelect,
    onContinue,
}: TemplateSelectorProps) {
    const [filter, setFilter] = useState<"all" | TemplateType>("all");
    const [search, setSearch] = useState("");

    const filteredTemplates = useMemo(() => {
        return templates.filter((t) => {
            const matchesFilter = filter === "all" || t.type === filter;
            const matchesSearch =
                !search ||
                t.label.toLowerCase().includes(search.toLowerCase()) ||
                t.blurb.toLowerCase().includes(search.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [templates, filter, search]);

    const selectedTemplate = templates.find((t) => t.id === selectedId);

    return (
        <div className="max-w-6xl mx-auto px-6">
            {/* Header */}
            <div className="text-center mb-10">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold text-white mb-3"
                >
                    Choose a Template
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/50 max-w-md mx-auto"
                >
                    Start with a pre-built bot or agent, or create something custom.
                </motion.p>
            </div>

            {/* Filters & Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center justify-between gap-4 mb-8"
            >
                {/* Filter Tabs */}
                <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
                    {[
                        { id: "all", label: "All", icon: Sparkles },
                        { id: "bot", label: "Bots", icon: Zap },
                        { id: "agent", label: "Agents", icon: Bot },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFilter(tab.id as typeof filter)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                filter === tab.id
                                    ? "bg-violet-600 text-white shadow-md"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64 pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                </div>
            </motion.div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                <AnimatePresence mode="popLayout">
                    {filteredTemplates.map((template, index) => {
                        const isSelected = template.id === selectedId;
                        const isAgent = template.type === "agent";

                        return (
                            <motion.button
                                key={template.id}
                                type="button"
                                onClick={() => onSelect(template.id)}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.03 }}
                                whileHover={{ y: -4 }}
                                className={cn(
                                    "group relative p-6 rounded-2xl border text-left transition-all duration-200",
                                    isSelected
                                        ? "border-violet-500 bg-violet-500/10 shadow-xl shadow-violet-500/20"
                                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                                )}
                            >
                                {/* Selected indicator */}
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-4 right-4"
                                    >
                                        <CheckCircle2 className="h-5 w-5 text-violet-400" />
                                    </motion.div>
                                )}

                                {/* Type Badge */}
                                <div
                                    className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-4",
                                        isAgent
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                            : "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                                    )}
                                >
                                    {isAgent ? <Bot className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                                    {isAgent ? "Agent" : "Bot"}
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-semibold text-white mb-2">{template.label}</h3>
                                <p className="text-sm text-white/50 mb-4 line-clamp-2">{template.blurb}</p>

                                {/* Capabilities */}
                                <div className="flex flex-wrap gap-1.5">
                                    {template.capabilities.slice(0, 3).map((cap, i) => (
                                        <span
                                            key={i}
                                            className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60"
                                        >
                                            {cap}
                                        </span>
                                    ))}
                                    {template.capabilities.length > 3 && (
                                        <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/40">
                                            +{template.capabilities.length - 3}
                                        </span>
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Continue Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center"
            >
                <motion.button
                    type="button"
                    onClick={onContinue}
                    disabled={!selectedId}
                    whileHover={selectedId ? { scale: 1.02 } : {}}
                    whileTap={selectedId ? { scale: 0.98 } : {}}
                    className={cn(
                        "group flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg transition-all",
                        selectedId
                            ? "bg-violet-600 text-white shadow-xl shadow-violet-500/30 hover:bg-violet-500"
                            : "bg-white/10 text-white/40 cursor-not-allowed"
                    )}
                >
                    Continue with {selectedTemplate?.label || "Template"}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
            </motion.div>
        </div>
    );
}
