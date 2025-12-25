"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    Send, ArrowUp, User, Settings, History,
    PanelLeft, Search, Plus, Hash, CheckCircle2,
    MoreHorizontal, Paperclip, Smile, Image as ImageIcon,
    Command, Zap, Trash2, Sparkles, Bot
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppSession } from "@/lib/app-session-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGlassAlert } from "@/components/ui/glass-alert";

interface Message {
    role: "user" | "assistant";
    content: string;
    id: string;
    timestamp: Date;
}

export default function HiveMindPage() {
    const { profile } = useAppSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }, [messages, isLoading]);

    const handleSend = async (text?: string) => {
        const contentToSend = text || input;
        if (!contentToSend.trim() || isLoading) return;

        const userMsg: Message = {
            role: "user",
            content: contentToSend,
            id: Date.now().toString(),
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/hivemind", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg.content,
                    conversationHistory: messages.map(m => ({ role: m.role, content: m.content })).slice(-10),
                    currentPath: "/hivemind",
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: data.response,
                    id: (Date.now() + 1).toString(),
                    timestamp: new Date()
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "I encountered an error processing that request.",
                    id: (Date.now() + 1).toString(),
                    timestamp: new Date()
                }]);
            }
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Network error. Please try again.",
                id: (Date.now() + 1).toString(),
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    };

    const { showAlert } = useGlassAlert();

    const handleNewChat = () => {
        setMessages([]);
        setInput("");
        inputRef.current?.focus();
    };

    const handleClearSession = async () => {
        await showAlert("Clear Session", "Security protocol: Permanently wiping current conversation history and clearing neural cache.", "error");
        setMessages([]);
        setInput("");
    };

    return (
        <div className="flex h-screen w-full bg-[#0B0C0E] text-[#EEEEEE] font-sans antialiased overflow-hidden selection:bg-violet-500/30">

            {/* Linear-style Mini Sidebar */}
            <div className="w-[56px] flex flex-col items-center py-4 border-r border-white/5 bg-[#0B0C0E] flex-none z-20">
                <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/5 transition-colors text-white/60 hover:text-white mb-4">
                    <PanelLeft size={18} strokeWidth={1.5} />
                </button>
                <button
                    onClick={handleNewChat}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-white/5 text-white mb-2 shadow-inner shadow-white/5 hover:bg-white/10 transition-colors"
                >
                    <Plus size={18} strokeWidth={1.5} />
                </button>
                <div className="w-4 h-[1px] bg-white/10 my-2" />
                <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/5 transition-colors text-white/40 hover:text-white mb-2 relative group">
                    <Search size={18} strokeWidth={1.5} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/5 transition-colors text-white/40 hover:text-white mb-2">
                    <History size={18} strokeWidth={1.5} />
                </button>
                <div className="mt-auto flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 opacity-80 hover:opacity-100 transition-opacity flex items-center justify-center bg-gradient-to-tr from-violet-600 to-fuchsia-500">
                        <span className="font-bold text-[10px] text-white">B</span>
                    </div>
                </div>
            </div>

            {/* Main Content Stream */}
            <div className="flex-1 flex flex-col relative min-w-0 bg-[#0B0C0E]">

                {/* Header: Breadcrumbs & Status */}
                <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 flex-none bg-[#0B0C0E]/80 backdrop-blur-sm z-10 w-full">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-white/40">
                        <span className="hover:text-white/80 transition-colors cursor-pointer" onClick={handleNewChat}>HiveMind</span>
                        <span className="text-white/20">/</span>
                        <span className="flex items-center gap-1.5 text-white/90">
                            <span className="text-violet-500">#</span>
                            <span className="truncate max-w-[200px]">New Session</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                            Engine Active
                        </div>
                        <button className="text-white/40 hover:text-white transition-colors" onClick={handleClearSession}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                </header>

                {/* Stream Area */}
                <ScrollArea className="flex-1 w-full" ref={scrollRef}>
                    <div className="max-w-[840px] mx-auto w-full px-6 py-8">
                        {messages.length === 0 ? (
                            <div className="mt-20 px-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
                                <div className="h-10 w-10 mb-6 bg-gradient-to-br from-violet-600/20 to-fuchsia-500/20 rounded-lg border border-violet-500/20 flex items-center justify-center">
                                    <Sparkles size={20} className="text-violet-400" fill="currentColor" />
                                </div>
                                <h1 className="text-2xl font-medium text-white mb-3 tracking-tight">
                                    Good to see you{profile?.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}
                                </h1>
                                <p className="text-[#8A8F98] text-[15px] max-w-md leading-relaxed mb-8">
                                    Bothive Intelligence is online. Start a new thread for debugging, content generation, or complex problem solving.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        "Draft a Q1 roadmap",
                                        "Explain this repo structure",
                                        "Generate migration script",
                                        "Analyze recent metrics"
                                    ].map((prompt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(prompt)}
                                            className="text-left px-4 py-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-violet-500/20 transition-all group"
                                        >
                                            <span className="text-[13px] text-white/80 group-hover:text-white">{prompt}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col pb-4">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className="group flex gap-4 py-4 hover:bg-white/[0.01] -mx-4 px-4 rounded-lg transition-colors">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {msg.role === "assistant" ? (
                                                <div className="w-6 h-6 rounded flex items-center justify-center bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20">
                                                    <Sparkles size={14} fill="currentColor" />
                                                </div>
                                            ) : (
                                                <Avatar className="h-6 w-6 rounded">
                                                    <AvatarImage src={profile?.avatarUrl || ""} />
                                                    <AvatarFallback className="rounded bg-[#2C2D30] text-white/60 text-[10px]">
                                                        {profile?.fullName?.[0] || <User size={14} />}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[13px] font-bold text-white/90">
                                                    {msg.role === "assistant" ? "Bothive" : (profile?.fullName || "You")}
                                                </span>
                                                <span className="text-[12px] text-white/20 font-mono">
                                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="text-[15px] leading-relaxed text-[#D4D6D8] whitespace-pre-wrap font-normal">
                                                {msg.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-4 py-4 px-4">
                                        <div className="w-6 h-6 rounded flex items-center justify-center bg-violet-500/10 text-violet-500">
                                            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                                        </div>
                                        <div className="flex items-center gap-1.5 pt-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-white/20 animate-pulse" />
                                            <span className="h-1.5 w-1.5 rounded-full bg-white/20 animate-pulse delay-75" />
                                            <span className="h-1.5 w-1.5 rounded-full bg-white/20 animate-pulse delay-150" />
                                        </div>
                                    </div>
                                )}
                                <div ref={bottomRef} className="h-px" />
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Composer Area - Linear Style */}
                <div className="flex-none p-6 pt-0 bg-[#0B0C0E]">
                    <div className="max-w-[840px] mx-auto relative group">
                        <div
                            className={cn(
                                "relative w-full rounded-xl border bg-[#141517] overflow-hidden transition-all duration-200",
                                "border-white/10 hover:border-white/20 focus-within:border-violet-500/30 focus-within:shadow-[0_0_0_1px_rgba(124,58,237,0.1)]"
                            )}
                        >
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        void handleSend();
                                    }
                                }}
                                placeholder="Write a message..."
                                className="w-full bg-transparent border-none outline-none text-[15px] px-4 py-3 text-[#EEEEEE] placeholder:text-[#5F6368] resize-none min-h-[44px] max-h-[300px] scrollbar-thin scrollbar-thumb-white/10"
                                rows={1}
                                style={{ height: 'auto', minHeight: '44px' }}
                            />

                            <div className="h-10 border-t border-white/5 flex items-center justify-between px-2 bg-[#141517]">
                                <div className="flex items-center gap-1">
                                    <button className="p-1.5 rounded hover:bg-white/5 text-white/40 hover:text-white/80 transition-colors">
                                        <Plus size={16} />
                                    </button>
                                    <button className="p-1.5 rounded hover:bg-white/5 text-white/40 hover:text-white/80 transition-colors">
                                        <Smile size={16} />
                                    </button>
                                    <button className="p-1.5 rounded hover:bg-white/5 text-white/40 hover:text-white/80 transition-colors">
                                        <Paperclip size={16} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 pr-2">
                                    <span className="text-[11px] text-white/20 font-medium hidden sm:block">Markdown supported</span>
                                    <div className="h-3 w-[1px] bg-white/10 hidden sm:block" />
                                    <button
                                        onClick={() => void handleSend()}
                                        disabled={!input.trim() || isLoading}
                                        className={cn(
                                            "flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition-colors",
                                            input.trim()
                                                ? "bg-violet-600 text-white hover:bg-violet-500"
                                                : "bg-white/5 text-white/30 cursor-not-allowed"
                                        )}
                                    >
                                        <span>Send</span>
                                        <Command size={10} className="opacity-60" />
                                        <span className="text-[9px] opacity-60">↵</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="max-w-[840px] mx-auto mt-2 text-center">
                        <p className="text-[11px] text-[#5F6368]">
                            HiveMind may produce inaccurate information about people, places, or facts.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
