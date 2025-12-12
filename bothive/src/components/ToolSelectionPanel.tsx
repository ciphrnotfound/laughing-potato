"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Globe,
    Zap,
    Eye,
    Brain,
    BarChart3,
    MessageSquare,
    Code,
    Database,
    Cloud,
    Smartphone,
    Mail,
    Calendar,
    FileText,
    Settings,
    Sparkles,
    Shield,
    Clock,
    TrendingUp,
    Users,
    Bot,
    Check,
    Plus,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";

interface Tool {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: React.ComponentType<{ className?: string }>;
    capabilities: string[];
    enabled: boolean;
    premium?: boolean;
    beta?: boolean;
}

interface ToolSelectionPanelProps {
    selectedTools: string[];
    onToolsChange: (tools: string[]) => void;
    className?: string;
}

const TOOLS: Tool[] = [
    {
        id: "web-search",
        name: "Web Search",
        description: "Real-time web search and information retrieval",
        category: "Research",
        icon: Globe,
        capabilities: ["search", "browse", "scrape"],
        enabled: true,
    },
    {
        id: "code-execution",
        name: "Code Runner",
        description: "Execute and test code in multiple languages",
        category: "Development",
        icon: Code,
        capabilities: ["execute", "test", "debug"],
        enabled: true,
    },
    {
        id: "image-analysis",
        name: "Vision AI",
        description: "Analyze and understand images and visual content",
        category: "AI",
        icon: Eye,
        capabilities: ["analyze", "describe", "recognize"],
        enabled: true,
        beta: true,
    },
    {
        id: "memory-store",
        name: "Memory Bank",
        description: "Persistent conversation memory and context",
        category: "Memory",
        icon: Brain,
        capabilities: ["store", "recall", "learn"],
        enabled: true,
        premium: true,
    },
    {
        id: "analytics",
        name: "Analytics",
        description: "Usage analytics and performance insights",
        category: "Analytics",
        icon: BarChart3,
        capabilities: ["track", "analyze", "report"],
        enabled: true,
    },
    {
        id: "monitoring",
        name: "Monitoring",
        description: "Real-time performance monitoring and alerts",
        category: "Analytics",
        icon: TrendingUp,
        capabilities: ["monitor", "alert", "notify"],
        enabled: true,
        premium: true,
    },
    {
        id: "chat-interface",
        name: "Chat UI",
        description: "Beautiful chat interface for conversations",
        category: "Interface",
        icon: MessageSquare,
        capabilities: ["chat", "respond", "interact"],
        enabled: true,
    },
    {
        id: "api-integration",
        name: "API Connector",
        description: "Connect to external APIs and services",
        category: "Integration",
        icon: Cloud,
        capabilities: ["connect", "integrate", "sync"],
        enabled: true,
    },
    {
        id: "database",
        name: "Database",
        description: "Store and manage structured data",
        category: "Data",
        icon: Database,
        capabilities: ["store", "query", "manage"],
        enabled: true,
        premium: true,
    },
    {
        id: "mobile-app",
        name: "Mobile App",
        description: "Native mobile app integration",
        category: "Mobile",
        icon: Smartphone,
        capabilities: ["mobile", "push", "sync"],
        enabled: true,
        beta: true,
    },
    {
        id: "email-service",
        name: "Email Service",
        description: "Send and receive emails",
        category: "Communication",
        icon: Mail,
        capabilities: ["send", "receive", "template"],
        enabled: true,
    },
    {
        id: "calendar",
        name: "Calendar",
        description: "Schedule and manage events",
        category: "Productivity",
        icon: Calendar,
        capabilities: ["schedule", "remind", "organize"],
        enabled: true,
    },
    {
        id: "document-processor",
        name: "Document AI",
        description: "Process and analyze documents",
        category: "AI",
        icon: FileText,
        capabilities: ["process", "extract", "summarize"],
        enabled: true,
        beta: true,
    },
    {
        id: "security-suite",
        name: "Security Suite",
        description: "Advanced security and privacy features",
        category: "Security",
        icon: Shield,
        capabilities: ["encrypt", "protect", "audit"],
        enabled: true,
        premium: true,
    },
    {
        id: "automation",
        name: "Automation",
        description: "Automate repetitive tasks and workflows",
        category: "Productivity",
        icon: Sparkles,
        capabilities: ["automate", "schedule", "trigger"],
        enabled: true,
    },
];

const CATEGORIES = [
    { id: "all", name: "All Tools", icon: Settings },
    { id: "AI", name: "AI & ML", icon: Brain },
    { id: "Development", name: "Development", icon: Code },
    { id: "Analytics", name: "Analytics", icon: BarChart3 },
    { id: "Communication", name: "Communication", icon: MessageSquare },
    { id: "Productivity", name: "Productivity", icon: Clock },
    { id: "Data", name: "Data & Storage", icon: Database },
    { id: "Integration", name: "Integration", icon: Cloud },
    { id: "Interface", name: "Interface", icon: Globe },
    { id: "Memory", name: "Memory", icon: Brain },
    { id: "Mobile", name: "Mobile", icon: Smartphone },
    { id: "Security", name: "Security", icon: Shield },
];

export default function ToolSelectionPanel({
    selectedTools,
    onToolsChange,
    className,
}: ToolSelectionPanelProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [showSelectedOnly, setShowSelectedOnly] = useState(false);

    const filteredTools = useMemo(() => {
        let tools = TOOLS.filter(tool => tool.enabled);

        if (selectedCategory !== "all") {
            tools = tools.filter(tool => tool.category === selectedCategory);
        }

        if (searchQuery) {
            tools = tools.filter(tool =>
                tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tool.capabilities.some(cap => cap.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        if (showSelectedOnly) {
            tools = tools.filter(tool => selectedTools.includes(tool.id));
        }

        return tools;
    }, [selectedCategory, searchQuery, showSelectedOnly, selectedTools]);

    const toggleTool = (toolId: string) => {
        if (selectedTools.includes(toolId)) {
            onToolsChange(selectedTools.filter(id => id !== toolId));
        } else {
            onToolsChange([...selectedTools, toolId]);
        }
    };

    const cardClass = cn(
        "group relative overflow-hidden rounded-2xl border bg-white/5 p-6 transition-all duration-300",
        "hover:bg-white/10 hover:scale-[1.02] hover:shadow-xl",
        isDark ? "border-white/10" : "border-black/10"
    );

    const selectedCardClass = cn(
        "ring-2 ring-purple-500 bg-purple-500/10",
        "shadow-purple-500/20 shadow-xl"
    );

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold text-white">AI Tools</h3>
                    <p className="text-sm text-white/60">Select capabilities for your bot</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">
                        {selectedTools.length} selected
                    </span>
                    <button
                        onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                        className={cn(
                            "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition-colors",
                            showSelectedOnly
                                ? "bg-purple-500 text-white"
                                : "bg-white/10 text-white/60 hover:bg-white/20"
                        )}
                    >
                        <Eye className="h-3 w-3" />
                        Selected Only
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search tools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "w-full rounded-xl border bg-white/5 pl-10 pr-4 py-3 text-sm transition-all",
                            "placeholder:text-white/40 focus:outline-none focus:ring-2",
                            isDark
                                ? "border-white/10 text-white focus:border-white/20 focus:ring-white/10"
                                : "border-black/10 text-black focus:border-black/20 focus:ring-black/10"
                        )}
                    />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={cn(
                                "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
                                selectedCategory === category.id
                                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                                    : "bg-white/10 text-white/60 hover:bg-white/20"
                            )}
                        >
                            <category.icon className="h-4 w-4" />
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                    {filteredTools.map((tool, index) => (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            onClick={() => toggleTool(tool.id)}
                            className={cn(
                                cardClass,
                                selectedTools.includes(tool.id) && selectedCardClass,
                                "cursor-pointer"
                            )}
                        >
                            {/* Premium/Beta Badges */}
                            <div className="absolute right-3 top-3 flex gap-1">
                                {tool.premium && (
                                    <span className="rounded bg-gradient-to-r from-yellow-500 to-orange-500 px-2 py-0.5 text-xs font-medium text-white">
                                        PRO
                                    </span>
                                )}
                                {tool.beta && (
                                    <span className="rounded bg-gradient-to-r from-blue-500 to-cyan-500 px-2 py-0.5 text-xs font-medium text-white">
                                        BETA
                                    </span>
                                )}
                            </div>

                            {/* Icon */}
                            <div className={cn(
                                "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br",
                                selectedTools.includes(tool.id)
                                    ? "from-purple-500 to-pink-500"
                                    : "from-white/20 to-white/10"
                            )}>
                                <tool.icon className={cn(
                                    "h-6 w-6",
                                    selectedTools.includes(tool.id) ? "text-white" : "text-white/60"
                                )} />
                            </div>

                            {/* Content */}
                            <h4 className={cn(
                                "mb-2 font-semibold",
                                selectedTools.includes(tool.id) ? "text-white" : "text-white/80"
                            )}>
                                {tool.name}
                            </h4>
                            <p className={cn(
                                "mb-3 text-sm",
                                selectedTools.includes(tool.id) ? "text-white/70" : "text-white/50"
                            )}>
                                {tool.description}
                            </p>

                            {/* Capabilities */}
                            <div className="mb-4 flex flex-wrap gap-1">
                                {tool.capabilities.map((capability) => (
                                    <span
                                        key={capability}
                                        className={cn(
                                            "rounded-full px-2 py-1 text-xs",
                                            selectedTools.includes(tool.id)
                                                ? "bg-purple-500/20 text-purple-300"
                                                : "bg-white/10 text-white/50"
                                        )}
                                    >
                                        {capability}
                                    </span>
                                ))}
                            </div>

                            {/* Selection Indicator */}
                            <div className={cn(
                                "absolute bottom-4 right-4 flex h-6 w-6 items-center justify-center rounded-full border transition-all",
                                selectedTools.includes(tool.id)
                                    ? "border-purple-500 bg-purple-500"
                                    : "border-white/20 bg-white/10 group-hover:border-white/40"
                            )}>
                                {selectedTools.includes(tool.id) && (
                                    <Check className="h-3 w-3 text-white" />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredTools.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bot className="mb-4 h-12 w-12 text-white/20" />
                    <p className="text-white/60">No tools found</p>
                    <p className="text-sm text-white/40">Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
}