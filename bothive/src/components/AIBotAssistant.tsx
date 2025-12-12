"use client";

import React, { useState } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function AIBotAssistant({ botId }: { botId: string }) {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! I can help you configure this bot. What would you like to achieve?" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: "user" as const, content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const responses = [
                "That sounds like a great use case! I'd recommend setting the frequency to 'Weekly' for that.",
                "I can help you optimize the prompt for that specific goal. Try adding more specific constraints.",
                "Have you considered connecting this to a webhook trigger? It might automate the process better."
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            setMessages(prev => [...prev, { role: "assistant", content: randomResponse }]);
            setIsTyping(false);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-[400px]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "assistant" ? "bg-purple-600/20 text-purple-400" : "bg-white/10 text-white"
                            }`}>
                            {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === "assistant"
                                ? "bg-white/5 text-white/90 border border-white/10"
                                : "bg-purple-600 text-white"
                            }`}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-white/5 rounded-2xl px-4 py-2 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-75" />
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-150" />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Ask for help..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-xl transition-colors disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
