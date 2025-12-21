"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Circle, Sparkles, Zap, Brain, Library } from "lucide-react";

interface Node {
    id: string;
    label: string;
    x: number;
    y: number;
    type: "core" | "concept" | "resource";
    icon?: any;
}

const nodes: Node[] = [
    { id: "1", label: "Quantum Physics", x: 50, y: 50, type: "core", icon: Brain },
    { id: "2", label: "Wave Function", x: 35, y: 35, type: "concept", icon: Zap },
    { id: "3", label: "Entanglement", x: 65, y: 35, type: "concept", icon: Sparkles },
    { id: "4", label: "Superposition", x: 65, y: 65, type: "concept", icon: Network },
    { id: "5", label: "Schrödinger's Cat", x: 35, y: 65, type: "concept", icon: Library },
    { id: "6", label: "Lecture Notes v1", x: 20, y: 25, type: "resource" },
];

const connections = [
    ["1", "2"], ["1", "3"], ["1", "4"], ["1", "5"],
    ["2", "6"]
];

export const KnowledgeMap = () => {
    // Generate background particles
    const particles = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 3 + 2
    })), []);

    return (
        <div className="relative w-full h-[700px] bg-[#020205] overflow-hidden group">
            {/* Stardust Background */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute bg-violet-400 rounded-full opacity-20 pointer-events-none"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                    }}
                    animate={{
                        opacity: [0.1, 0.4, 0.1],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Grid Mask */}
            <div className="absolute inset-0 opacity-[0.05]" style={{
                backgroundImage: `radial-gradient(rgba(255,255,255,0.2) 1px, transparent 0)`,
                backgroundSize: '40px 40px'
            }} />

            {/* Central Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.05" />
                        <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {connections.map(([sourceId, targetId]) => {
                    const source = nodes.find(n => n.id === sourceId)!;
                    const target = nodes.find(n => n.id === targetId)!;
                    return (
                        <g key={`${sourceId}-${targetId}`}>
                            <motion.line
                                x1={`${source.x}%`}
                                y1={`${source.y}%`}
                                x2={`${target.x}%`}
                                y2={`${target.y}%`}
                                stroke="url(#edgeGradient)"
                                strokeWidth="1"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 2, delay: 0.5 }}
                            />
                            {/* Animated Particle on line */}
                            <motion.circle
                                r="1.5"
                                fill="#A78BFA"
                                filter="url(#glow)"
                                animate={{
                                    cx: [`${source.x}%`, `${target.x}%`],
                                    cy: [`${source.y}%`, `${target.y}%`],
                                    opacity: [0, 1, 0]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: Math.random() * 2
                                }}
                            />
                        </g>
                    );
                })}
            </svg>

            <AnimatePresence>
                {nodes.map((node, i) => (
                    <motion.div
                        key={node.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.8 + i * 0.1
                        }}
                        whileHover={{ scale: 1.1 }}
                    >
                        <div className="relative group/node">
                            {/* Multi-layered Glow */}
                            <div className={cn(
                                "absolute inset-[-20px] rounded-full opacity-0 group-hover/node:opacity-40 transition-all duration-700 blur-2xl",
                                node.type === "core" ? "bg-violet-500/50" : "bg-indigo-500/30"
                            )} />

                            <div className={`
                                relative w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500
                                ${node.type === "core"
                                    ? "bg-violet-600/90 border-violet-400/50 text-white shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                                    : node.type === "concept"
                                        ? "bg-black/60 border-white/10 backdrop-blur-xl text-violet-400 group-hover/node:border-violet-500/50"
                                        : "bg-black/80 border-white/5 text-zinc-600 group-hover/node:text-zinc-300"}
                            `}>
                                {node.icon ? <node.icon className="w-6 h-6" /> : <Circle className="w-5 h-5 fill-current" />}

                                {/* Shimmer Ring */}
                                {node.type === "core" && (
                                    <motion.div
                                        className="absolute inset-[-4px] rounded-[18px] border border-violet-400/30"
                                        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.05, 1] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    />
                                )}
                            </div>

                            {/* Label */}
                            <div className="absolute top-20 left-1/2 -translate-x-1/2 whitespace-nowrap overflow-hidden">
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10"
                                >
                                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{node.label}</span>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Ultra-Modern HUD Overlay */}
            <div className="absolute top-10 left-10 p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Neural Density: High</span>
                </div>
                <div className="w-32 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
                <div className="space-y-3">
                    <div className="flex items-center gap-3 group cursor-help">
                        <div className="w-2.5 h-2.5 rounded bg-violet-600 ring-1 ring-violet-400/50" />
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">Master Category</span>
                    </div>
                    <div className="flex items-center gap-3 group cursor-help">
                        <div className="w-2.5 h-2.5 rounded bg-zinc-900 border border-violet-500/30" />
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">Neural Node</span>
                    </div>
                    <div className="flex items-center gap-3 group cursor-help">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 border border-white/5" />
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">Active Resource</span>
                    </div>
                </div>
            </div>

            {/* Interactive Hints */}
            <div className="absolute bottom-10 right-10 flex gap-4">
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest backdrop-blur-sm">
                    Drag to reorder
                </div>
                <div className="px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/20 text-[9px] font-bold text-violet-400 uppercase tracking-widest backdrop-blur-sm">
                    Scroll to scale
                </div>
            </div>
        </div>
    );
};
