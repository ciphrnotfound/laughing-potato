"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bot, X, Send, ChevronUp, ChevronDown, Sparkles,
    Zap, Lock, MessageSquare, User, Loader2, Minimize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import { SubscriptionTier, TIER_NAMES } from "@/lib/subscription-tiers";
import Link from "next/link";

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

export default function HiveMind() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "I'm HiveMind. Ready to optimize your intelligence economy?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [usage, setUsage] = useState({ used: 0, limit: 5 });
    const [tier, setTier] = useState<SubscriptionTier>('free');
    const scrollRef = useRef<HTMLDivElement>(null);
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

    const isInBuilder = pathname.includes('/builder') || pathname.includes('/integrations/new');

    const builderTips = [
        "How do I define an @integration?",
        "Help me write a @capability",
        "Explain HiveLang @auth types",
        "Generate a meme-bot template"
    ];

    // Fetch usage on mount and open
    useEffect(() => {
        fetchUsage();
    }, [isOpen]);

    const fetchUsage = async () => {
        try {
            const res = await fetch("/api/usage/check");
            if (res.ok) {
                const data = await res.json();
                setTier(data.tier);
                setUsage({
                    used: data.usage.aiMessagesUsed,
                    limit: data.limits.aiMessagesPerMonth
                });
            }
        } catch (e) {
            console.error("Failed to fetch usage", e);
        }
    };

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (customMsg?: string) => {
        const userMessage = customMsg || input.trim();
        if (!userMessage || isLoading) return;

        if (!customMsg) setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const res = await fetch("/api/hivemind", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    conversationHistory: messages.slice(-10),
                    currentPath: pathname
                })
            });

            const data = await res.json();

            if (res.status === 429) {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "🚫 Weekly token limit reached. Efficiency protocols require an upgrade to proceed."
                }]);
            } else if (!res.ok) {
                throw new Error(data.error || "Failed to respond");
            } else {
                setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
                setUsage(prev => ({ ...prev, used: prev.used + 1 }));
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Network anomaly detected. I'm stabilizing the connection."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const remaining = usage.limit === -1 ? Infinity : Math.max(0, usage.limit - usage.used);
    const isUnlimited = usage.limit === -1;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className={cn(
                            "w-80 md:w-96 rounded-3xl overflow-hidden pointer-events-auto mb-4 border shadow-2xl backdrop-blur-2xl",
                            isDark
                                ? "bg-[#050505]/90 border-white/5 shadow-violet-500/5 ring-1 ring-white/10"
                                : "bg-white/90 border-gray-200/50 shadow-xl ring-1 ring-black/5"
                        )}
                    >
                        {/* Minimal Header */}
                        <div className={cn(
                            "p-4 flex items-center justify-between border-b",
                            isDark ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50/50"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-violet-500 blur-sm opacity-50 animate-pulse" />
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn("text-sm font-semibold tracking-tight", isDark ? "text-white" : "text-gray-900")}>
                                        HiveMind
                                    </span>
                                    <span className="text-[10px] font-medium text-violet-500 uppercase tracking-wider">
                                        {TIER_NAMES[tier]} INTEL
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "p-2 rounded-full transition-all duration-200",
                                        isDark ? "hover:bg-white/10 text-neutral-400 hover:text-white" : "hover:bg-gray-100 text-neutral-500 hover:text-black"
                                    )}
                                >
                                    <Minimize2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div
                            ref={scrollRef}
                            className={cn(
                                "h-80 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-violet-500/20 scrollbar-track-transparent custom-scrollbar",
                                isDark ? "bg-[#0a0a0f]/50" : "bg-white/50"
                            )}
                        >
                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={i}
                                    className={cn(
                                        "flex flex-col gap-1 max-w-[85%]",
                                        msg.role === "user" ? "ml-auto items-end" : "items-start"
                                    )}
                                >
                                    <div className={cn(
                                        "px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed",
                                        msg.role === "user"
                                            ? "bg-[#2A2A35] text-white rounded-br-none shadow-sm"
                                            : isDark
                                                ? "bg-violet-600/10 text-violet-100 border border-violet-500/10 rounded-bl-none"
                                                : "bg-gray-100 text-gray-800 rounded-bl-none"
                                    )}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[9px] text-neutral-500 pl-1 uppercase tracking-tighter">
                                        {msg.role === 'user' ? 'You' : 'HiveMind'}
                                    </span>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <div className="flex items-start gap-2">
                                    <div className={cn(
                                        "px-4 py-3 rounded-2xl rounded-bl-none",
                                        isDark ? "bg-violet-600/5 border border-violet-500/5" : "bg-gray-50"
                                    )}>
                                        <div className="flex gap-1.5 items-center h-4">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{
                                                        y: [0, -3, 0],
                                                        opacity: [0.3, 1, 0.3]
                                                    }}
                                                    transition={{
                                                        repeat: Infinity,
                                                        duration: 0.8,
                                                        delay: i * 0.15,
                                                        ease: "easeInOut"
                                                    }}
                                                    className="w-1.5 h-1.5 rounded-full bg-violet-400"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Contextual Tips */}
                            {isInBuilder && messages.length < 3 && (
                                <div className="pt-2 space-y-2">
                                    <p className="text-[9px] font-bold text-violet-500 uppercase tracking-widest pl-1">Builder Tips</p>
                                    <div className="flex flex-wrap gap-2">
                                        {builderTips.map(tip => (
                                            <button
                                                key={tip}
                                                onClick={() => handleSend(tip)}
                                                className="px-2 py-1.5 rounded-lg bg-violet-500/5 border border-violet-500/10 text-[10px] text-violet-400 hover:bg-violet-500/10 transition-all"
                                            >
                                                {tip}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className={cn(
                            "p-3 m-2 rounded-2xl border flex items-end gap-2 transition-colors",
                            isDark
                                ? "bg-[#050505] border-white/10 focus-within:border-violet-500/30"
                                : "bg-white border-gray-200 focus-within:border-violet-200"
                        )}>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Ask HiveMind..."
                                rows={1}
                                className={cn(
                                    "w-full bg-transparent p-2 text-sm focus:outline-none resize-none max-h-20 scrollbar-none",
                                    isDark ? "text-white placeholder-neutral-600" : "text-gray-900 placeholder-neutral-400"
                                )}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={isLoading || !input.trim()}
                                className={cn(
                                    "p-2 rounded-xl transition-all duration-200 mb-0.5",
                                    input.trim()
                                        ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-500"
                                        : "bg-neutral-800/50 text-neutral-600 cursor-not-allowed"
                                )}
                            >
                                <Send size={16} />
                            </button>
                        </div>

                        {/* Footer info */}
                        <div className="px-5 pb-3 flex items-center justify-between">
                            {!isUnlimited ? (
                                <span className="text-[9px] text-neutral-500 uppercase tracking-tighter">
                                    {remaining} messages left
                                </span>
                            ) : (
                                <span className="text-[9px] text-violet-400 font-bold uppercase tracking-tighter flex items-center gap-1">
                                    <Sparkles size={10} /> Infinite Intel
                                </span>
                            )}
                            <Link href="/dashboard/billing" className="text-[9px] text-neutral-500 hover:text-violet-400 transition-colors uppercase tracking-widest">
                                Manage Plan
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Toggle Button (Keeping the Neural Core) */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-14 w-14 flex items-center justify-center transition-all duration-500 pointer-events-auto relative group",
                    isOpen
                        ? "text-white"
                        : "text-white hover:text-violet-400"
                )}
            >
                <div className="absolute inset-0 bg-violet-600/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />

                <AnimatePresence mode='wait'>
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X size={20} className="text-white/80" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="relative flex items-center justify-center"
                        >
                            {/* Neural Core Icon - Custom SVG */}
                            <div className="relative w-8 h-8 flex items-center justify-center">
                                <div className="absolute inset-0 bg-violet-500/20 blur-lg group-hover:bg-violet-500/40 transition-colors duration-500 rounded-full" />
                                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 relative z-10 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]">
                                    <motion.path
                                        d="M12 2L4 7V17L12 22L20 17V7L12 2Z"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        animate={{
                                            strokeDasharray: ["0 100", "100 0"],
                                            strokeDashoffset: [0, -100]
                                        }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="text-violet-400"
                                    />
                                    <motion.path
                                        d="M12 22V12M12 12L20 7M12 12L4 7"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="text-violet-300"
                                    />
                                    <circle cx="12" cy="12" r="2.5" className="fill-white" />
                                    <motion.circle
                                        cx="12"
                                        cy="12"
                                        r="4"
                                        className="stroke-violet-400 fill-none"
                                        strokeWidth="0.5"
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </svg>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </motion.button>
        </div>
    );
}
