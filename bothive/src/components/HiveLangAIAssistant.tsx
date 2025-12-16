"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Send,
    Loader2,
    Bot,
    User,
    Copy,
    Check,
    Wand2,
    Code,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
    codeSnippet?: string;
}

interface HiveLangAIAssistantProps {
    onInsertCode: (code: string) => void;
    currentCode?: string;
    className?: string;
}

const EXAMPLE_PROMPTS = [
    "Create a study bot that quizzes me on any topic",
    "Add WhatsApp messaging to notify users",
    "Make the bot remember my preferences",
    "Add a condition to check for keywords",
    "Create a loop through my study topics",
];

export function HiveLangAIAssistant({
    onInsertCode,
    currentCode = "",
    className
}: HiveLangAIAssistantProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "👋 Hi! I'm your HiveLang coding assistant. Tell me what you want your bot to do, and I'll write the code for you!\n\nTry: \"Create a study bot that explains topics and generates quizzes\"",
            timestamp: Date.now(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateHiveLangCode = async (prompt: string): Promise<{ content: string; code: string }> => {
        // This would call your AI API - for now, we'll generate based on keywords
        const lowerPrompt = prompt.toLowerCase();

        let code = "";
        let explanation = "";

        if (lowerPrompt.includes("study") || lowerPrompt.includes("quiz") || lowerPrompt.includes("learn")) {
            explanation = "Here's a study bot that can explain topics and generate quizzes:";
            code = `bot StudyHelper
  description "AI study assistant"

  on input
    if input contains "explain"
      set topic input
      explain "$topic" for: "student"
      say """{result}"""
    end

    if input contains "quiz"
      set topic input
      quiz on "$topic" count: 5
      say """📝 Quiz Time!
{result}"""
    end

    if input contains "remember"
      remember "last_topic" as "$topic"
      say """Got it! I'll remember that."""
    end
  end
end`;
        } else if (lowerPrompt.includes("whatsapp") || lowerPrompt.includes("message") || lowerPrompt.includes("notify")) {
            explanation = "Here's how to send WhatsApp notifications:";
            code = `-- Add this inside your bot's on input block

if input contains "notify" or input contains "remind"
  set message input
  call whatsapp.sendMessage with phone: "$phone", message: "$message"
  say """✅ WhatsApp message sent!"""
end`;
        } else if (lowerPrompt.includes("email")) {
            explanation = "Here's code to send emails:";
            code = `-- Add this inside your bot's on input block

if input contains "email" or input contains "send"
  summarize "$content" in 3 sentences
  call email.send with to: "$recipient", subject: "Update from BotHive", body: "{result}"
  say """📧 Email sent successfully!"""
end`;
        } else if (lowerPrompt.includes("notion") || lowerPrompt.includes("schedule") || lowerPrompt.includes("calendar")) {
            explanation = "Here's how to create schedules in Notion:";
            code = `-- Add this inside your bot's on input block

if input contains "schedule" or input contains "plan"
  think about "Create an optimal schedule"
  ask ai """Create a structured weekly schedule for: {input}"""
  call notion.createPage with database_id: "your_db", title: "Weekly Schedule", content: "{result}"
  say """📅 Schedule created in Notion!"""
end`;
        } else if (lowerPrompt.includes("remember") || lowerPrompt.includes("memory") || lowerPrompt.includes("store")) {
            explanation = "Here's how to use memory in your bot:";
            code = `-- Store information
remember "user_name" as "$name"
remember "preferences" as "$prefs"

-- Retrieve later
recall "user_name"
say """Welcome back, {result}!"""`;
        } else if (lowerPrompt.includes("condition") || lowerPrompt.includes("if") || lowerPrompt.includes("check")) {
            explanation = "Here's how to add conditional logic:";
            code = `if input contains "help"
  say """I can help you with:
  - Explaining topics
  - Creating quizzes
  - Setting reminders"""
end

if input contains "urgent"
  call whatsapp.sendMessage with phone: "$admin", message: "Urgent request received!"
  say """I've notified the team about your urgent request."""
end`;
        } else if (lowerPrompt.includes("loop") || lowerPrompt.includes("iterate") || lowerPrompt.includes("each")) {
            explanation = "Here's how to loop through items:";
            code = `-- Loop through a list
set topics ["Math", "Science", "History"]

loop topic in $topics
  explain "$topic" for: "beginner"
  say """📚 {topic}: {result}"""
end`;
        } else {
            explanation = "Here's a general bot template based on your request:";
            code = `bot CustomBot
  description "Custom assistant"

  on input
    -- Analyze what the user wants
    think about "What does the user need help with?"
    
    -- Use AI to respond intelligently
    ask ai """The user said: {input}
    
Respond helpfully and suggest what you can do for them."""
    
    say """{result}"""
    
    -- Remember the conversation
    remember "last_request" as "$input"
  end
end`;
        }

        return { content: explanation, code };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content: input,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const { content, code } = await generateHiveLangCode(input);

            const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content,
                codeSnippet: code,
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again.",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInsertCode = (code: string, id: string) => {
        onInsertCode(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const handleExampleClick = (prompt: string) => {
        setInput(prompt);
        inputRef.current?.focus();
    };

    return (
        <div className={cn(
            "flex flex-col h-full bg-[#0d0d1a]/90 backdrop-blur-xl rounded-2xl border border-white/10",
            className
        )}>
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-purple-400" />
                    AI Coding Assistant
                </h3>
                <p className="text-xs text-white/40 mt-1">
                    Describe what you want, I'll write the HiveLang code
                </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {messages.map((message) => (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "flex gap-3",
                            message.role === "user" ? "flex-row-reverse" : ""
                        )}
                    >
                        <div className={cn(
                            "w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center",
                            message.role === "user"
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-emerald-500/20 text-emerald-400"
                        )}>
                            {message.role === "user" ? (
                                <User className="w-4 h-4" />
                            ) : (
                                <Bot className="w-4 h-4" />
                            )}
                        </div>
                        <div className={cn(
                            "flex-1 max-w-[85%]",
                            message.role === "user" ? "text-right" : ""
                        )}>
                            <div className={cn(
                                "inline-block rounded-xl px-3 py-2 text-sm",
                                message.role === "user"
                                    ? "bg-purple-500/20 text-white/90"
                                    : "bg-white/5 text-white/80"
                            )}>
                                <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>

                            {message.codeSnippet && (
                                <div className="mt-2 rounded-xl bg-black/40 border border-white/10 overflow-hidden">
                                    <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/5">
                                        <span className="text-xs text-white/50 flex items-center gap-1.5">
                                            <Code className="w-3 h-3" />
                                            HiveLang
                                        </span>
                                        <button
                                            onClick={() => handleInsertCode(message.codeSnippet!, message.id)}
                                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs transition-colors"
                                        >
                                            {copiedId === message.id ? (
                                                <>
                                                    <Check className="w-3 h-3" />
                                                    Inserted!
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-3 h-3" />
                                                    Insert Code
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <pre className="p-3 text-xs text-purple-200/80 overflow-x-auto">
                                        <code>{message.codeSnippet}</code>
                                    </pre>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                        </div>
                        <div className="bg-white/5 rounded-xl px-3 py-2">
                            <p className="text-sm text-white/60">Writing HiveLang code...</p>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Example Prompts */}
            {messages.length <= 1 && (
                <div className="px-3 pb-2">
                    <p className="text-[10px] text-white/40 mb-2">Try these:</p>
                    <div className="flex flex-wrap gap-1.5">
                        {EXAMPLE_PROMPTS.slice(0, 3).map((prompt) => (
                            <button
                                key={prompt}
                                onClick={() => handleExampleClick(prompt)}
                                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-white/50 hover:text-white/80 transition-colors"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-white/10">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe what you want..."
                        disabled={isLoading}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-50 disabled:hover:bg-purple-500/20 rounded-xl text-purple-300 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default HiveLangAIAssistant;
