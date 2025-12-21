"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Search, PenTool, Brain, Library, Quote, Clock, Sparkles, ArrowRight } from "lucide-react";

const buddies = [
    {
        title: "Researcher",
        desc: "Synthesizes academic papers & sources.",
        icon: Search,
        color: "from-blue-500 to-cyan-500",
        glow: "bg-blue-500/20"
    },
    {
        title: "Essay Architect",
        desc: "Structural guidance & thesis builder.",
        icon: PenTool,
        color: "from-amber-500 to-orange-500",
        glow: "bg-amber-500/20"
    },
    {
        title: "Socratic Tutor",
        desc: "Interactive learning through dialogue.",
        icon: Brain,
        color: "from-purple-500 to-violet-500",
        glow: "bg-purple-500/20"
    },
    {
        title: "Flashcard Gen",
        desc: "Automated spaced-repetition decks.",
        icon: Library,
        color: "from-emerald-500 to-teal-500",
        glow: "bg-emerald-500/20"
    }
];

export const StudyBuddyGrid = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {buddies.map((buddy, i) => (
                <motion.div
                    key={buddy.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative"
                >
                    <div className={cn(
                        "absolute -inset-0.5 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500",
                        buddy.glow
                    )} />
                    <div className="relative h-full p-6 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-sm group-hover:bg-zinc-900/60 transition-all flex flex-col">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500",
                            "bg-gradient-to-br",
                            buddy.color
                        )}>
                            <buddy.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-white font-bold mb-1 tracking-tight">{buddy.title}</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-4 flex-1">{buddy.desc}</p>
                        <div className="flex items-center justify-between mt-auto">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Idle</span>
                            <button className="p-2 rounded-full bg-white/5 text-zinc-400 group-hover:text-white transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
