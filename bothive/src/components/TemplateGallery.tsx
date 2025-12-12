"use client";

import React from "react";
import { Bot, Code2, GraduationCap, Layout, MessageSquare, Share2, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type BotTemplateId = "custom" | "general" | "coding" | "study" | "reminder" | "publisher" | "roast_master" | "orchestrator";

interface TemplateGalleryProps {
    onSelect: (id: BotTemplateId) => void;
    selectedId: BotTemplateId;
}

const TEMPLATES = [
    {
        id: "custom",
        label: "Custom Agent",
        icon: Bot,
        description: "Start from scratch with a blank canvas.",
        color: "text-white",
        bg: "bg-white/10",
    },
    {
        id: "general",
        label: "General Assistant",
        icon: MessageSquare,
        description: "A helpful AI assistant for everyday tasks.",
        color: "text-blue-400",
        bg: "bg-blue-400/10",
    },
    {
        id: "coding",
        label: "Code Engineer",
        icon: Code2,
        description: "Specialized in writing and debugging code.",
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
    },
    {
        id: "study",
        label: "Study Tutor",
        icon: GraduationCap,
        description: "Helps you learn new topics with quizzes.",
        color: "text-amber-400",
        bg: "bg-amber-400/10",
    },
    {
        id: "roast_master",
        label: "Roast Master",
        icon: Zap,
        description: "Sassy critic for UI/UX reviews.",
        color: "text-rose-500",
        bg: "bg-rose-500/10",
    },
    {
        id: "orchestrator",
        label: "Orchestrator",
        icon: Layout,
        description: "Coordinates multiple bots to solve complex tasks.",
        color: "text-purple-400",
        bg: "bg-purple-400/10",
    },
] as const;

export default function TemplateGallery({ onSelect, selectedId }: TemplateGalleryProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((template) => {
                const Icon = template.icon;
                const isSelected = selectedId === template.id;

                return (
                    <button
                        key={template.id}
                        onClick={() => onSelect(template.id as BotTemplateId)}
                        className={cn(
                            "group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-md",
                            isSelected
                                ? "border-purple-500/50 bg-purple-500/5 ring-1 ring-purple-500/20"
                                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                        )}
                    >
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", template.bg, template.color)}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-medium text-white">{template.label}</h3>
                            <p className="mt-1 text-xs text-white/60">{template.description}</p>
                        </div>
                        {isSelected && (
                            <div className="absolute right-3 top-3">
                                <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
