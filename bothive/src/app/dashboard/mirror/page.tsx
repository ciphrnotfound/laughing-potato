"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { useGlassAlert } from "@/components/ui/glass-alert";
import {
    Fingerprint,
    BrainCircuit,
    MessageSquare,
    ShieldAlert,
    Sparkles,
    Send,
    History,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Search,
    Plus
} from "lucide-react";

interface DNATrait {
    label: string;
    value: string;
    score: number;
}

export default function MirrorDashboardPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const { showAlert } = useGlassAlert();

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [trainingText, setTrainingText] = useState("");
    const [dnaProfile, setDnaProfile] = useState<any>(null);
    const [testMessage, setTestMessage] = useState("");
    const [testResult, setTestResult] = useState("");
    const [isDrafting, setIsDrafting] = useState(false);

    // Mock initial data
    useEffect(() => {
        setDnaProfile({
            tone: "Visionary & Direct",
            emojis: "🚀, ⚡, 🤝",
            slang: "LFG, Ship it, Alpha",
            quirks: "Ending with double space",
            match_score: 92
        });
    }, []);

    const handleStartAnalysis = async () => {
        if (!trainingText.trim()) return;
        setIsAnalyzing(true);
        // Simulate analysis
        await new Promise(r => setTimeout(r, 400));
        setDnaProfile({
            tone: "Analytic & Precise",
            emojis: "🧠, 🔍, ✅",
            slang: "Deep dive, Vector, Optimized",
            quirks: "Perfect grammar",
            match_score: 95
        });
        setIsAnalyzing(false);
        showAlert("Identity dna updated successfully.", "success");
    };

    const handleTestDraft = async () => {
        if (!testMessage.trim()) return;
        setIsDrafting(true);
        // Simulate ghostwriting
        await new Promise(r => setTimeout(r, 300));
        setTestResult(`Hey! Read your message about "${testMessage}". Sounds like a great vector for us to explore 🧠. I'll take a deep dive into the numbers tonight ✅.`);
        setIsDrafting(false);
    };

    return (
        <DashboardPageShell
            title="Digital Doppelgänger"
            description="Manage your identity scaling and mirror swarm intelligence"
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: DNA & Training (Total 8 cols) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* DNA Profile Summary */}
                    <div className={cn(
                        "p-8 rounded-3xl border relative overflow-hidden transition-all duration-500",
                        isDark
                            ? "bg-[#111113] border-white/5 hover:border-violet-500/30"
                            : "bg-white border-black/5 shadow-sm"
                    )}>
                        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                            <Fingerprint className="w-32 h-32 text-violet-500" />
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                                <BrainCircuit className="w-6 h-6 text-violet-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Personality DNA</h3>
                                <p className="text-sm text-neutral-500">Last scanned 2 hours ago</p>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                <div className="text-right">
                                    <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Match Accuracy</p>
                                    <p className="text-2xl font-black text-violet-400">{dnaProfile?.match_score || 0}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: "Voice Tone", value: dnaProfile?.tone || "Analyzing...", icon: Sparkles },
                                { label: "Emoji DNA", value: dnaProfile?.emojis || "Analyzing...", icon: MessageSquare },
                                { label: "Linguistics", value: dnaProfile?.slang || "Analyzing...", icon: History },
                                { label: "Quirks", value: dnaProfile?.quirks || "Analyzing...", icon: Fingerprint },
                            ].map((trait, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4 group hover:bg-white/[0.04] transition-colors">
                                    <div className="p-2 rounded-lg bg-neutral-800/50 text-neutral-400 group-hover:text-violet-400 transition-colors border border-white/5">
                                        <trait.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-600 mb-0.5">{trait.label}</p>
                                        <p className="text-sm text-neutral-200 font-medium">{trait.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Training Input Area */}
                    <div className={cn(
                        "p-8 rounded-3xl border",
                        isDark ? "bg-[#111113] border-white/5" : "bg-white border-black/5 shadow-sm"
                    )}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <RefreshCw className={cn("w-5 h-5 text-violet-400", isAnalyzing && "animate-spin")} />
                                Update Mirror Logic
                            </h3>
                            <span className="text-xs text-neutral-500">Paste past emails or messages</span>
                        </div>

                        <textarea
                            value={trainingText}
                            onChange={(e) => setTrainingText(e.target.value)}
                            placeholder="Paste your past sent messages here to help the Historian learn your deep personality traits..."
                            className="w-full h-40 bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-sm text-neutral-300 focus:outline-none focus:border-violet-500/50 transition-colors resize-none mb-4"
                        />

                        <button
                            onClick={handleStartAnalysis}
                            disabled={isAnalyzing || !trainingText.trim()}
                            className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAnalyzing ? "Processing Personality DNA..." : "Calibrate Mirror Swarm"}
                        </button>
                    </div>

                </div>

                {/* Right Column: Gatekeeper & Preview (Total 4 cols) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Gatekeeper Rules */}
                    <div className={cn(
                        "p-6 rounded-3xl border",
                        isDark ? "bg-[#111113] border-white/5" : "bg-white border-black/5 shadow-sm"
                    )}>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-rose-500" />
                            Gatekeeper Rules
                        </h3>
                        <div className="space-y-3">
                            {[
                                "Urgent or crisis language",
                                "Negative sentiment detections",
                                "VIP / Executive contacts",
                                "Direct payment requests"
                            ].map((rule, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                    <span className="text-sm text-neutral-400">{rule}</span>
                                    <div className="w-8 h-4 rounded-full bg-violet-600/30 border border-violet-500/50 relative">
                                        <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-violet-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-bold text-neutral-400 hover:bg-white/[0.05] flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add Escalation Rule
                        </button>
                    </div>

                    {/* Live Mirror Preview */}
                    <div className={cn(
                        "p-6 rounded-3xl border relative overflow-hidden",
                        isDark ? "bg-[#111113] border-white/5" : "bg-white border-black/5 shadow-sm"
                    )}>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Live Identity Preview</h3>

                        <div className="space-y-4 min-h-[200px] mb-4">
                            {!testResult && !isDrafting && (
                                <div className="text-center py-10">
                                    <MessageSquare className="w-10 h-10 text-neutral-800 mx-auto mb-2" />
                                    <p className="text-xs text-neutral-600 italic">Test an inbound message below to see your Twin's voice.</p>
                                </div>
                            )}

                            {isDrafting && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-violet-500/20 animate-pulse" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse" />
                                        <div className="h-4 bg-white/5 rounded-full w-1/2 animate-pulse" />
                                    </div>
                                </div>
                            )}

                            {testResult && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 relative"
                                >
                                    <div className="absolute -top-2 left-4 px-2 py-0.5 bg-violet-500 rounded-full text-[8px] font-black uppercase text-white shadow-lg">
                                        Mirror Swarm Draft
                                    </div>
                                    <p className="text-sm text-neutral-200 leading-relaxed">{testResult}</p>
                                    <div className="mt-3 flex items-center justify-end gap-2">
                                        <button className="text-[10px] font-bold text-violet-400 hover:text-white uppercase">Approve & Send</button>
                                        <button className="text-[10px] font-bold text-neutral-500 hover:text-white uppercase" onClick={() => setTestResult("")}>Redraft</button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="relative">
                            <input
                                value={testMessage}
                                onChange={(e) => setTestMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleTestDraft()}
                                placeholder="Type a test message..."
                                className="w-full bg-white/[0.05] border border-white/5 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                            />
                            <button
                                onClick={handleTestDraft}
                                disabled={isDrafting || !testMessage.trim()}
                                className="absolute right-2 top-1.5 p-2 bg-violet-500 rounded-lg text-white hover:bg-violet-600 transition-colors disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </DashboardPageShell>
    );
}
