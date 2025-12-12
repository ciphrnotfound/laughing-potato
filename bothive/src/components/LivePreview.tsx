"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare,
    Send,
    Zap,
    Bot,
    User,
    Settings,
    Copy,
    Download,
    Maximize2,
    Minimize2,
    RotateCcw,
    Sparkles,
    Loader2,
    Play,
    Pause,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";

interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
    reasoning?: string[];
    metadata?: {
        model?: string;
        tokens?: number;
        duration?: number;
    };
}

interface LivePreviewProps {
    botName: string;
    botDescription: string;
    aiModel: string;
    tools: string[];
    systemPrompt: string;
    onSendMessage: (message: string) => Promise<string>;
    className?: string;
}

const SAMPLE_CONVERSATIONS = [
    {
        user: "Hello! Can you help me with something?",
        bot: "Hello! I'm here to help. What can I assist you with today?",
    },
    {
        user: "What's the weather like?",
        bot: "I don't have access to real-time weather data, but I can help you with many other things like coding, analysis, or general questions!",
    },
    {
        user: "Can you write a Python function to calculate fibonacci?",
        bot: "```python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\n# Example usage:\nprint(fibonacci(10))  # Output: 55\n```\n\nHere's a simple recursive fibonacci function!",
    },
];

export default function LivePreview({
    botName,
    botDescription,
    aiModel,
    tools,
    systemPrompt,
    onSendMessage,
    className,
}: LivePreviewProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isAutoPlay, setIsAutoPlay] = useState(false);
    const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
    const [showSystemPrompt, setShowSystemPrompt] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: "user",
            content: inputMessage,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputMessage("");
        setIsLoading(true);

        try {
            const response = await onSendMessage(inputMessage);
            
            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response,
                timestamp: new Date(),
                metadata: {
                    model: aiModel,
                    tokens: Math.floor(Math.random() * 100) + 50,
                    duration: Math.floor(Math.random() * 2000) + 500,
                },
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "system",
                content: "Sorry, I encountered an error processing your message.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSampleConversation = async () => {
        if (currentSampleIndex >= SAMPLE_CONVERSATIONS.length) {
            setCurrentSampleIndex(0);
            return;
        }

        const sample = SAMPLE_CONVERSATIONS[currentSampleIndex];
        
        // Add user message
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: "user",
            content: sample.user,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Simulate bot response
        setTimeout(() => {
            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: sample.bot,
                timestamp: new Date(),
                metadata: {
                    model: aiModel,
                    tokens: Math.floor(Math.random() * 100) + 50,
                    duration: Math.floor(Math.random() * 2000) + 500,
                },
            };
            setMessages((prev) => [...prev, botMessage]);
            setCurrentSampleIndex((prev) => prev + 1);
        }, 1000);
    };

    const clearConversation = () => {
        setMessages([]);
        setCurrentSampleIndex(0);
    };

    const copyConversation = () => {
        const conversation = messages
            .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
            .join("\n\n");
        navigator.clipboard.writeText(conversation);
    };

    const exportConversation = () => {
        const data = {
            botName,
            botDescription,
            aiModel,
            tools,
            messages,
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `conversation-${botName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const containerClass = cn(
        "flex flex-col rounded-3xl border bg-gradient-to-br from-gray-900 to-black shadow-2xl transition-all duration-300",
        isMinimized ? "h-20" : "h-[600px]",
        isDark ? "border-white/10" : "border-black/10",
        className
    );

    const headerClass = cn(
        "flex items-center justify-between border-b p-4",
        isDark ? "border-white/10" : "border-black/10"
    );

    return (
        <div className={containerClass}>
            {/* Header */}
            <div className={headerClass}>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
                        <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">{botName}</h3>
                        <p className="text-xs text-white/60">{botDescription}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        title="Show System Prompt"
                    >
                        <Settings className="h-4 w-4 text-white/60" />
                    </button>
                    
                    <button
                        onClick={clearConversation}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        title="Clear Conversation"
                    >
                        <RotateCcw className="h-4 w-4 text-white/60" />
                    </button>
                    
                    <button
                        onClick={copyConversation}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        title="Copy Conversation"
                    >
                        <Copy className="h-4 w-4 text-white/60" />
                    </button>
                    
                    <button
                        onClick={exportConversation}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        title="Export Conversation"
                    >
                        <Download className="h-4 w-4 text-white/60" />
                    </button>
                    
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        title={isMinimized ? "Maximize" : "Minimize"}
                    >
                        {isMinimized ? (
                            <Maximize2 className="h-4 w-4 text-white/60" />
                        ) : (
                            <Minimize2 className="h-4 w-4 text-white/60" />
                        )}
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* System Prompt Panel */}
                    <AnimatePresence>
                        {showSystemPrompt && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-b border-white/10 p-4"
                            >
                                <h4 className="mb-2 text-sm font-medium text-white/80">System Prompt</h4>
                                <p className="text-xs text-white/60 leading-relaxed">{systemPrompt}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
                                    <Bot className="h-8 w-8 text-white" />
                                </div>
                                <h4 className="mb-2 text-lg font-semibold text-white">Start a Conversation</h4>
                                <p className="mb-6 max-w-md text-sm text-white/60">
                                    This is a live preview of your bot. Try asking a question or use the sample conversation below.
                                </p>
                                
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={handleSampleConversation}
                                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-purple-600 hover:to-pink-600"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Try Sample Conversation
                                    </button>
                                    
                                    <button
                                        onClick={() => setIsAutoPlay(!isAutoPlay)}
                                        className={cn(
                                            "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                                            isAutoPlay
                                                ? "bg-green-500 text-white"
                                                : "bg-white/10 text-white/60 hover:bg-white/20"
                                        )}
                                    >
                                        {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                        {isAutoPlay ? "Stop Auto" : "Auto Play"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "flex gap-3",
                                    message.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                {message.role !== "user" && (
                                    <div className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-2xl flex-shrink-0",
                                        message.role === "assistant"
                                            ? "bg-gradient-to-br from-purple-500 to-pink-500"
                                            : "bg-white/10"
                                    )}>
                                        {message.role === "assistant" ? (
                                            <Bot className="h-4 w-4 text-white" />
                                        ) : (
                                            <Zap className="h-4 w-4 text-white/60" />
                                        )}
                                    </div>
                                )}
                                
                                <div className={cn(
                                    "max-w-[80%] rounded-2xl px-4 py-3",
                                    message.role === "user"
                                        ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                                        : message.role === "assistant"
                                        ? "bg-white/10 text-white"
                                        : "bg-red-500/10 text-red-300 border border-red-500/20"
                                )}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    
                                    {message.metadata && (
                                        <div className="mt-2 flex items-center gap-3 text-xs text-white/40">
                                            <span>{message.metadata.model}</span>
                                            <span>•</span>
                                            <span>{message.metadata.tokens} tokens</span>
                                            <span>•</span>
                                            <span>{message.metadata.duration}ms</span>
                                        </div>
                                    )}
                                </div>

                                {message.role === "user" && (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/10 flex-shrink-0">
                                        <User className="h-4 w-4 text-white/60" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                        
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-white/10 p-4">
                        <div className="flex gap-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                                placeholder="Type your message..."
                                disabled={isLoading}
                                className={cn(
                                    "flex-1 rounded-2xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 transition-all",
                                    "focus:outline-none focus:ring-2 focus:ring-purple-500/50",
                                    isDark ? "border-white/10" : "border-black/10"
                                )}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className={cn(
                                    "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white transition-all",
                                    "hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                )}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}