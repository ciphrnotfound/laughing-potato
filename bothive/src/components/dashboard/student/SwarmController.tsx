"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Layers,
    Play,
    Pause,
    Square,
    Search,
    PenTool,
    Brain,
    Zap,
    Cpu,
    MessageSquare,
    Terminal,
    Target,
    Activity,
    Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

const agents = [
    { id: "researcher", name: "Researcher", icon: Search, color: "text-blue-400", border: "border-blue-400/20", glow: "shadow-blue-500/10" },
    { id: "architect", name: "Architect", icon: PenTool, color: "text-amber-400", border: "border-amber-400/20", glow: "shadow-amber-500/10" },
    { id: "evaluator", name: "Evaluator", icon: Cpu, color: "text-rose-400", border: "border-rose-400/20", glow: "shadow-rose-500/10" },
    { id: "synthesizer", name: "Synthesizer", icon: Brain, color: "text-violet-400", border: "border-violet-400/20", glow: "shadow-violet-500/10" }
];

export const SwarmController = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<{ id: number, text: string, type: string }[]>([]);

    const addLog = (text: string, type = "info") => {
        setLogs(prev => [{ id: Date.now(), text, type }, ...prev].slice(0, 8));
    };

    useEffect(() => {
        if (isRunning) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        setIsRunning(false);
                        addLog(">> Synthesis Complete. Dataset optimized.", "success");
                        return 100;
                    }
                    const inc = Math.random() * 5;
                    if (prev < 20 && prev + inc >= 20) addLog(">> Researcher querying external databases...");
                    if (prev < 50 && prev + inc >= 50) addLog(">> Architect constructing semantic frame...");
                    if (prev < 80 && prev + inc >= 80) addLog(">> Evaluator checking cross-references...");
                    return prev + inc;
                });
            }, 300);
            return () => clearInterval(interval);
        }
    }, [isRunning]);

    const handleLaunch = () => {
        setIsRunning(true);
        setProgress(0);
        setLogs([]);
        addLog(">> Initializing Tactical Swarm...");
        addLog(">> Deploying agents to secure cognitive space.");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Tactical Command Interface */}
            <div className="lg:col-span-2 space-y-10">
                <div className="relative p-10 rounded-[3rem] bg-black/40 border border-white/5 backdrop-blur-3xl overflow-hidden group">
                    {/* Background Tech Detail */}
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                        <Terminal className="w-48 h-48" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 mb-16">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20">
                                    <Target className="w-5 h-5 text-violet-400" />
                                </div>
                                <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Tactical Orchestrator</h2>
                            </div>
                            <h3 className="text-4xl font-bold text-white tracking-tighter">Dynamic Swarm <span className="text-zinc-500">v4.2</span></h3>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => isRunning ? setIsRunning(false) : handleLaunch()}
                                className={cn(
                                    "px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 relative overflow-hidden group/btn",
                                    isRunning
                                        ? "bg-rose-500/10 text-rose-500 border border-rose-500/30"
                                        : "bg-white text-black hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                                )}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {isRunning ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                                    {isRunning ? "Kill Swarm" : "Launch Engine"}
                                </span>
                                {!isRunning && (
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity"
                                    />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Agent Status Matrix */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                        {agents.map((agent) => (
                            <div key={agent.id} className={cn(
                                "p-6 rounded-3xl bg-white/[0.02] border transition-all duration-700 group/agent",
                                agent.border,
                                isRunning && agent.glow
                            )}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className={cn("p-3 rounded-2xl bg-black/40 border border-white/5 transition-transform group-hover/agent:scale-110", agent.color)}>
                                        <agent.icon className="w-5 h-5" />
                                    </div>
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        isRunning ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" : "bg-zinc-800"
                                    )} />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{agent.name}</div>
                                    <div className="text-xs font-bold text-white">
                                        {isRunning ? "Processing" : "Standby"}
                                    </div>
                                </div>
                                {/* Holographic Scanline */}
                                {isRunning && (
                                    <motion.div
                                        className="absolute inset-x-0 h-[1px] bg-white/20"
                                        animate={{ top: ["0%", "100%", "0%"] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Progress HUD */}
                    <div className="space-y-4">
                        <div className="flex items-baseline justify-between">
                            <div className="flex items-center gap-3">
                                <Activity className="w-3 h-3 text-violet-500" />
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Synchronization</span>
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tighter">{Math.floor(progress)}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-600 bg-[length:200%_100%]"
                                initial={{ width: "0%" }}
                                animate={{
                                    width: `${progress}%`,
                                    backgroundPosition: ["0% 0%", "200% 0%"]
                                }}
                                transition={{
                                    width: { type: "spring", damping: 20 },
                                    backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" }
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Holographic Console */}
                <div className="p-8 rounded-[3rem] bg-black/40 border border-white/5 backdrop-blur-3xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.05),transparent)]" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-4 h-4 text-zinc-600" />
                                <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Neural Debug Logs</h3>
                            </div>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-zinc-800" />)}
                            </div>
                        </div>
                        <div className="space-y-3 font-mono">
                            <AnimatePresence mode="popLayout">
                                {logs.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -10, filter: "blur(5px)" }}
                                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="flex items-start gap-4"
                                    >
                                        <span className="text-[10px] text-zinc-700 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                                        <span className={cn(
                                            "text-[11px] font-medium tracking-tight",
                                            log.type === "success" ? "text-emerald-400" : "text-zinc-400"
                                        )}>{log.text}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {logs.length === 0 && (
                                <div className="text-[11px] text-zinc-800 italic font-medium">{" >> "} Initialize engine to begin telemetry...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tactical Sidebar */}
            <div className="space-y-8">
                <section className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl">
                    <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-10">Op-Presets</h3>
                    <div className="space-y-4">
                        {[
                            { title: "Omega Synthesis", desc: "Maximum logical depth", icon: Target, active: true },
                            { title: "Rapid Sieve", desc: "High-speed data scraping", icon: Search },
                            { title: "Ghost Draft", desc: "Indiscernible writing aid", icon: PenTool }
                        ].map((preset) => (
                            <button key={preset.title} className={cn(
                                "w-full text-left p-5 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden",
                                preset.active ? "bg-violet-600 border-violet-400 shadow-xl shadow-violet-500/20" : "bg-black/40 border-white/5 hover:border-white/20"
                            )}>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={cn(
                                        "p-2.5 rounded-xl transition-colors",
                                        preset.active ? "bg-white/20" : "bg-zinc-900 group-hover:bg-zinc-800"
                                    )}>
                                        <preset.icon className={cn("w-4 h-4", preset.active ? "text-white" : "text-zinc-500")} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={cn("text-xs font-bold leading-none mb-1", preset.active ? "text-white" : "text-zinc-300 group-hover:text-white")}>{preset.title}</h4>
                                        <p className={cn("text-[9px] font-medium uppercase tracking-tighter", preset.active ? "text-white/60" : "text-zinc-600")}>{preset.desc}</p>
                                    </div>
                                    {!preset.active && <Lock className="w-3 h-3 text-zinc-800" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="relative p-10 rounded-[2.5rem] bg-gradient-to-br from-violet-600 to-indigo-700 border border-white/20 overflow-hidden shadow-2xl shadow-violet-600/20 group">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-[0.05] pointer-events-none" />
                    <div className="relative z-10 space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-lg font-black text-white tracking-tighter uppercase">Pro Upgrade</h4>
                            <p className="text-xs text-white/70 font-medium leading-relaxed">
                                Unlock <span className="text-white font-bold underline decoration-white/40 underline-offset-4">Parallel Swarm Execution</span> to process up to 12 academic subjects concurrently.
                            </p>
                        </div>
                        <button className="w-full py-3.5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.05] transition-transform active:scale-95 shadow-xl">
                            Elite Access
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};
