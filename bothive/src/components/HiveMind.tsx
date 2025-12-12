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

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

export default function HiveMind() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "I'm HiveMind. Ready to optimize your workflow?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [usage, setUsage] = useState({ used: 0, limit: 5 });
    const [tier, setTier] = useState<SubscriptionTier>('free');
    const scrollRef = useRef<HTMLDivElement>(null);

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

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const res = await fetch("/api/hivemind", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    conversationHistory: messages.slice(-10),
                    currentPath: window.location.pathname
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
                // Update local usage optimistically
                setUsage(prev => ({ ...prev, used: prev.used + 1 }));
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Network anomaly detected. Please retry in a moment."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const remaining = usage.limit === -1 ? Infinity : Math.max(0, usage.limit - usage.used);
    // Admin Check: if limit is -1, we assume admin/business and show a subtle infinite loop or just hide progress
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

                        {/* Chat Area - Minimal & Clean */}
                        <div
                            ref={scrollRef}
                            className={cn(
                                "h-80 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-violet-500/20 scrollbar-track-transparent",
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
                                            ? "bg-[#2A2A35] text-white rounded-br-none shadow-sm" // Dark simple bubble for user
                                            : isDark
                                                ? "bg-violet-600/10 text-violet-100 border border-violet-500/10 rounded-bl-none"
                                                : "bg-gray-100 text-gray-800 rounded-bl-none"
                                    )}>
                                        {msg.content}
                                    </div>
                                    {msg.role === "assistant" && i === messages.length - 1 && (
                                        <span className="text-[10px] text-neutral-500 pl-1">Just now</span>
                                    )}
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-2">
                                    <div className={cn(
                                        "px-4 py-3 rounded-2xl rounded-bl-none",
                                        isDark ? "bg-violet-600/5 border border-violet-500/5" : "bg-gray-50"
                                    )}>
                                        <div className="flex gap-1">
                                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-violet-400/50" />
                                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-violet-400/50" />
                                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-violet-400/50" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Premium Input Area */}
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
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className={cn(
                                    "p-2 rounded-xl transition-all duration-200 mb-0.5",
                                    input.trim()
                                        ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-500 transform hover:-translate-y-0.5"
                                        : "bg-neutral-800/50 text-neutral-600 cursor-not-allowed"
                                )}
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Subtle Footer info */}
                        {!isUnlimited && (
                            <div className="px-5 pb-3 text-[10px] text-center text-neutral-500">
                                {remaining} messages remaining • <span className="hover:text-violet-400 cursor-pointer transition-colors">Upgrade</span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modern Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-12 w-12 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 pointer-events-auto relative group border",
                    isOpen
                        ? "bg-[#0a0a0f] border-white/10 text-white"
                        : "bg-black dark:bg-[#0a0a0f] border-white/10 text-white hover:border-violet-500/50 hover:shadow-violet-500/20"
                )}
            >
                <AnimatePresence mode='wait'>
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X className="h-5 w-5" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                        >
                            {/* Abstract Logo Icon */}
                            <Sparkles className="h-5 w-5 text-violet-400" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Status indicator dot */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-violet-500 rounded-full border-2 border-black dark:border-[#0a0a0f]" />
                )}
            </motion.button>
        </div>
    );
}
