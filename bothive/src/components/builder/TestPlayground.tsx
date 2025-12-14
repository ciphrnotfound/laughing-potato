"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles, RotateCcw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
    model?: string;
}

interface TestPlaygroundProps {
    botName: string;
    systemPrompt?: string;
    hivelangCode?: string;
    onSendMessage?: (message: string) => Promise<string>;
}

export default function TestPlayground({
    botName,
    systemPrompt,
    hivelangCode,
    onSendMessage
}: TestPlaygroundProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [lastModel, setLastModel] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || sending) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content: input.trim(),
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        const messageText = input.trim();
        setInput("");
        setSending(true);

        try {
            let responseContent: string = "";
            let model: string | undefined;

            // If custom handler provided, use it (for backwards compatibility)
            if (onSendMessage) {
                responseContent = await onSendMessage(messageText);
            } else {
                // Use real AI API
                const conversationHistory = messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                }));

                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: messageText,
                        systemPrompt,
                        botName,
                        hivelangCode,
                        conversationHistory,
                        temperature: 0.8,
                    }),
                });

                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error || "Failed to get AI response");
                }

                const data = await res.json();
                responseContent = data.response;
                model = data.model;
                setLastModel(model || null);
            }

            const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: responseContent,
                timestamp: Date.now(),
                model,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: "assistant",
                content: `❌ ${error instanceof Error ? error.message : "Sorry, something went wrong. Please try again."}`,
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearChat = () => {
        setMessages([]);
        setLastModel(null);
    };

    return (
        <div className="max-w-4xl mx-auto px-6">
            {/* Header */}
            <div className="text-center mb-8">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold text-white mb-3"
                >
                    Test Your Bot
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/50"
                >
                    Chat with <span className="text-violet-400 font-medium">{botName}</span> powered by real AI.
                </motion.p>
            </div>

            {/* Chat Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl overflow-hidden"
            >
                {/* Chat Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">{botName}</h3>
                            <div className="flex items-center gap-2 text-xs text-white/40">
                                <Zap className="h-3 w-3 text-emerald-400" />
                                <span>Powered by Groq AI</span>
                                {lastModel && (
                                    <span className="text-violet-400">• {lastModel}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={clearChat}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Clear
                    </button>
                </div>

                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="h-[400px] overflow-y-auto p-6 space-y-4"
                >
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="p-4 rounded-2xl bg-white/5 mb-4">
                                <Bot className="h-8 w-8 text-white/30" />
                            </div>
                            <p className="text-white/40 text-sm mb-2">
                                Start a conversation to test your bot's AI responses.
                            </p>
                            <p className="text-white/30 text-xs">
                                Using Groq's Llama 3.3 70B model for fast, intelligent responses.
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={cn(
                                        "flex gap-3",
                                        message.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {message.role === "assistant" && (
                                        <div className="flex-shrink-0 p-2 rounded-xl bg-violet-500/10 text-violet-400 h-fit">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                    )}
                                    <div
                                        className={cn(
                                            "max-w-[75%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap",
                                            message.role === "user"
                                                ? "bg-violet-600 text-white"
                                                : "bg-white/5 text-white/90 border border-white/10"
                                        )}
                                    >
                                        {message.content}
                                    </div>
                                    {message.role === "user" && (
                                        <div className="flex-shrink-0 p-2 rounded-xl bg-white/10 text-white/60 h-fit">
                                            <User className="h-4 w-4" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {/* Typing indicator */}
                    {sending && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3"
                        >
                            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                                <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
                                <span className="text-sm text-white/50">Thinking...</span>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            disabled={sending}
                            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50"
                        />
                        <motion.button
                            type="button"
                            onClick={handleSend}
                            disabled={!input.trim() || sending}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                "px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2",
                                input.trim() && !sending
                                    ? "bg-violet-600 text-white hover:bg-violet-500"
                                    : "bg-white/10 text-white/30 cursor-not-allowed"
                            )}
                        >
                            <Send className="h-4 w-4" />
                            Send
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
