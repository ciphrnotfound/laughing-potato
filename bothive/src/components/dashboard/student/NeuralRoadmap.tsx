"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Circle, Star, CheckCircle2, Lock, Zap } from "lucide-react";

interface Milestone {
    id: string;
    title: string;
    status: "completed" | "current" | "locked";
    type: "core" | "achievement" | "assessment";
    position: { x: number; y: number };
}

const milestones: Milestone[] = [
    { id: "1", title: "Foundations of AI", status: "completed", type: "core", position: { x: 10, y: 50 } },
    { id: "2", title: "Logic & Reasoning", status: "completed", type: "core", position: { x: 30, y: 30 } },
    { id: "3", title: "Neural Networks 101", status: "current", type: "core", position: { x: 50, y: 60 } },
    { id: "4", title: "Agentic Systems", status: "locked", type: "assessment", position: { x: 70, y: 20 } },
    { id: "5", title: "Final Hive Project", status: "locked", type: "achievement", position: { x: 90, y: 50 } },
];

export const NeuralRoadmap = () => {
    return (
        <div className="relative w-full h-[300px] rounded-3xl border border-white/5 bg-zinc-900/20 overflow-hidden group">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }} />

            {/* Connection Lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full">
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
                    </linearGradient>
                </defs>
                {milestones.slice(0, -1).map((m, i) => {
                    const next = milestones[i + 1];
                    return (
                        <motion.line
                            key={`line-${m.id}`}
                            x1={`${m.position.x}%`}
                            y1={`${m.position.y}%`}
                            x2={`${next.position.x}%`}
                            y2={`${next.position.y}%`}
                            stroke="url(#lineGradient)"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                        />
                    );
                })}
            </svg>

            {/* Nodes */}
            {milestones.map((m, i) => (
                <motion.div
                    key={m.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{ left: `${m.position.x}%`, top: `${m.position.y}%` }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <div className="relative group/node">
                        {/* Glow Effect */}
                        {m.status === "current" && (
                            <div className="absolute inset-0 rounded-full bg-violet-500/40 blur-md animate-pulse" />
                        )}

                        <div className={cn(
                            "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                            m.status === "completed" ? "bg-violet-500 border-violet-400 text-white" :
                                m.status === "current" ? "bg-zinc-900 border-violet-500 text-violet-400 scale-110" :
                                    "bg-zinc-950 border-white/10 text-zinc-600"
                        )}>
                            {m.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> :
                                m.status === "current" ? <Zap className="w-5 h-5 fill-current" /> :
                                    <Lock className="w-4 h-4" />}
                        </div>

                        {/* Label */}
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider",
                                m.status === "locked" ? "text-zinc-600" : "text-zinc-300"
                            )}>
                                {m.title}
                            </span>
                        </div>
                    </div>
                </motion.div>
            ))}

            {/* Top Left Label */}
            <div className="absolute top-6 left-6 flex items-center gap-2">
                <Circle className="w-3 h-3 fill-violet-500 text-violet-500" />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Neural Learning Path</span>
            </div>
        </div>
    );
};
