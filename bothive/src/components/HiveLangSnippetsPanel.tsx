"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    MessageSquare,
    Lightbulb,
    Database,
    Zap,
    Globe,
    Bell,
    Send,
    Search,
    ChevronRight,
    Copy,
    Check,
    Sparkles,
    BookOpen,
    HelpCircle,
    ListChecks,
    Timer,
    Mail,
    MessageCircle,
    Calendar,
    FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Snippet {
    id: string;
    label: string;
    description: string;
    code: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface SnippetCategory {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    snippets: Snippet[];
}

// AI Primitives snippets
const AI_SNIPPETS: Snippet[] = [
    {
        id: "ask-ai",
        label: "Ask AI",
        description: "Simple AI query",
        icon: MessageSquare,
        code: `ask ai "Your question here"`,
    },
    {
        id: "ask-ai-model",
        label: "Ask AI (with model)",
        description: "Query specific model",
        icon: Sparkles,
        code: `ask ai "Your question" with model: "gpt-4o"`,
    },
    {
        id: "think",
        label: "Think (Chain-of-Thought)",
        description: "Step-by-step reasoning",
        icon: Brain,
        code: `think about "How should I solve this problem?" with context: {topic: $topic}`,
    },
    {
        id: "decide",
        label: "Decide (ReAct)",
        description: "Autonomous decision with tools",
        icon: Lightbulb,
        code: `decide with tools: [notion.createPage, email.send] goal: "Create schedule and notify user"`,
    },
    {
        id: "remember",
        label: "Remember",
        description: "Store in memory",
        icon: Database,
        code: `remember "user_preference" as "dark mode"`,
    },
    {
        id: "recall",
        label: "Recall",
        description: "Retrieve from memory",
        icon: Search,
        code: `recall "user_preference"`,
    },
    {
        id: "summarize",
        label: "Summarize",
        description: "Condense text",
        icon: FileText,
        code: `summarize "$long_text" in 3 sentences`,
    },
    {
        id: "explain",
        label: "Explain",
        description: "Teach a concept",
        icon: BookOpen,
        code: `explain "quantum computing" for: "beginner"`,
    },
    {
        id: "quiz",
        label: "Quiz",
        description: "Generate practice questions",
        icon: HelpCircle,
        code: `quiz on "photosynthesis" count: 5`,
    },
];

// Integration snippets
const INTEGRATION_SNIPPETS: Snippet[] = [
    {
        id: "notion-create",
        label: "Notion: Create Page",
        description: "Add a page to Notion",
        icon: FileText,
        code: `call notion.createPage with database_id: "your_db_id", title: "My Page", content: "{content}"`,
    },
    {
        id: "whatsapp-send",
        label: "WhatsApp: Send Message",
        description: "Send WhatsApp message",
        icon: MessageCircle,
        code: `call whatsapp.sendMessage with phone: "+1234567890", message: "Hello from Study Buddy!"`,
    },
    {
        id: "email-send",
        label: "Email: Send",
        description: "Send email via SendGrid",
        icon: Mail,
        code: `call email.send with to: "user@example.com", subject: "Study Notes", body: "{summary}"`,
    },
    {
        id: "telegram-send",
        label: "Telegram: Send Message",
        description: "Send Telegram message",
        icon: Send,
        code: `call telegram.sendMessage with chatId: "123456", text: "Reminder: Study time!"`,
    },
    {
        id: "discord-send",
        label: "Discord: Send Message",
        description: "Send Discord message",
        icon: MessageSquare,
        code: `call discord.sendMessage with channelId: "123456", content: "New update!"`,
    },
    {
        id: "twitter-post",
        label: "Twitter: Post Tweet",
        description: "Post to Twitter/X",
        icon: Globe,
        code: `call twitter.postTweet with text: "Sharing my learning progress! 📚"`,
    },
    {
        id: "paystack-init",
        label: "Paystack: Initialize Payment",
        description: "Start a payment",
        icon: Zap,
        code: `call paystack.initializeTransaction with email: "user@email.com", amount: 50000`,
    },
    {
        id: "calendar-schedule",
        label: "Calendar: Schedule Event",
        description: "Add calendar event",
        icon: Calendar,
        code: `call calendar.schedule with title: "Study Session", date: "2024-12-10", time: "10:00"`,
    },
];

// HTTP & Webhook snippets
const HTTP_SNIPPETS: Snippet[] = [
    {
        id: "http-get",
        label: "HTTP GET",
        description: "Fetch data from API",
        icon: Globe,
        code: `call http.get with url: "https://api.example.com/data"`,
    },
    {
        id: "http-post",
        label: "HTTP POST",
        description: "Send data to API",
        icon: Send,
        code: `call http.post with url: "https://api.example.com/create", body: {"name": $name}`,
    },
    {
        id: "webhook-listen",
        label: "Webhook: Listen",
        description: "Create webhook endpoint",
        icon: Bell,
        code: `webhook.listen "/my-webhook"`,
    },
    {
        id: "webhook-trigger",
        label: "Webhook: Trigger",
        description: "Trigger a webhook",
        icon: Zap,
        code: `webhook.trigger "https://hooks.example.com/abc" with {event: "completed"}`,
    },
];

// Bot structure snippets
const STRUCTURE_SNIPPETS: Snippet[] = [
    {
        id: "bot-basic",
        label: "Basic Bot",
        description: "Simple bot template",
        icon: Sparkles,
        code: `bot MyBot
  description "A helpful assistant"

  on input
    say """Hello! How can I help you today?"""
  end
end`,
    },
    {
        id: "if-contains",
        label: "If Contains",
        description: "Check input for keyword",
        icon: ListChecks,
        code: `if input contains "help"
  say """Here's how I can help you..."""
end`,
    },
    {
        id: "if-else",
        label: "If-Else Block",
        description: "Conditional logic",
        icon: ListChecks,
        code: `if input contains "yes"
  say """Great! Let's continue."""
else
  say """No problem, let me know if you change your mind."""
end`,
    },
    {
        id: "loop",
        label: "Loop",
        description: "Iterate over items",
        icon: Timer,
        code: `loop item in $items
  say """Processing: {item}"""
end`,
    },
    {
        id: "set-variable",
        label: "Set Variable",
        description: "Store a value",
        icon: Database,
        code: `set topic input`,
    },
    {
        id: "say-simple",
        label: "Say (Simple)",
        description: "Output a message",
        icon: MessageSquare,
        code: `say "Hello, world!"`,
    },
    {
        id: "say-multiline",
        label: "Say (Multiline)",
        description: "Output formatted message",
        icon: MessageSquare,
        code: `say """📚 **Study Buddy**

Here's what I found:
{result}

Need more help?"""`,
    },
];

const SNIPPET_CATEGORIES: SnippetCategory[] = [
    { id: "ai", label: "🧠 AI Primitives", icon: Brain, snippets: AI_SNIPPETS },
    { id: "integrations", label: "🔗 Integrations", icon: Zap, snippets: INTEGRATION_SNIPPETS },
    { id: "http", label: "🌐 HTTP & Webhooks", icon: Globe, snippets: HTTP_SNIPPETS },
    { id: "structure", label: "📦 Bot Structure", icon: FileText, snippets: STRUCTURE_SNIPPETS },
];

interface HiveLangSnippetsPanelProps {
    onInsert: (code: string) => void;
    className?: string;
}

export function HiveLangSnippetsPanel({ onInsert, className }: HiveLangSnippetsPanelProps) {
    const [activeCategory, setActiveCategory] = useState<string>("ai");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const currentCategory = SNIPPET_CATEGORIES.find(c => c.id === activeCategory);

    const filteredSnippets = searchQuery
        ? SNIPPET_CATEGORIES.flatMap(c => c.snippets).filter(
            s => s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : currentCategory?.snippets || [];

    const handleInsert = (snippet: Snippet) => {
        onInsert(snippet.code);
        setCopiedId(snippet.id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    return (
        <div className={cn(
            "flex flex-col h-full bg-[#0d0d1a]/90 backdrop-blur-xl rounded-2xl border border-white/10",
            className
        )}>
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <h3 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    HiveLang Snippets
                </h3>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search snippets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-purple-500/50"
                    />
                </div>
            </div>

            {/* Category Tabs */}
            {!searchQuery && (
                <div className="flex gap-1 p-2 border-b border-white/5 overflow-x-auto scrollbar-hide">
                    {SNIPPET_CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                                activeCategory === category.id
                                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                            )}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Snippets List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <AnimatePresence mode="popLayout">
                    {filteredSnippets.map((snippet) => (
                        <motion.button
                            key={snippet.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            onClick={() => handleInsert(snippet)}
                            className="w-full group p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-purple-500/20 transition-all text-left"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                    <snippet.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-medium text-white/90">
                                            {snippet.label}
                                        </span>
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            {copiedId === snippet.id ? (
                                                <Check className="w-4 h-4 text-green-400" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-white/40" />
                                            )}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/40 mt-0.5">
                                        {snippet.description}
                                    </p>
                                    <pre className="mt-2 text-[10px] text-purple-300/60 bg-black/20 rounded px-2 py-1 overflow-x-auto whitespace-pre-wrap">
                                        {snippet.code.split('\n')[0]}
                                        {snippet.code.includes('\n') ? '...' : ''}
                                    </pre>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </AnimatePresence>

                {filteredSnippets.length === 0 && (
                    <div className="text-center py-8 text-white/30 text-sm">
                        No snippets found
                    </div>
                )}
            </div>

            {/* Quick Tips */}
            <div className="p-3 border-t border-white/5 bg-white/[0.02]">
                <p className="text-[10px] text-white/40 leading-relaxed">
                    💡 <span className="text-purple-400/60">Tip:</span> Click any snippet to insert at cursor position.
                    Use <code className="text-purple-300/60 bg-black/30 px-1 rounded">{'$variable'}</code> for dynamic values.
                </p>
            </div>
        </div>
    );
}

export default HiveLangSnippetsPanel;
