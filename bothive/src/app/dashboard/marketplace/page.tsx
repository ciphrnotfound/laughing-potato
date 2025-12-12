"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Store, Bot, Users, Plug, Star, Download, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { useTheme } from "@/lib/theme-context";

// Types
type ItemType = 'bot' | 'agent' | 'integration';

interface MarketplaceItem {
    id: string;
    title: string;
    description: string;
    type: ItemType;
    author: string;
    rating: number;
    downloads: string;
    price: 'free' | 'premium';
    priceAmount?: string;
    image?: string; // Color or gradient for now
    tags: string[];
}

// Dummy Data
const MARKETPLACE_ITEMS: MarketplaceItem[] = [
    {
        id: "1",
        title: "Study Buddy",
        description: "An AI tutor that helps you learn any subject with quizzes and flashcards.",
        type: "bot",
        author: "Bothive Team",
        rating: 4.8,
        downloads: "2.3k",
        price: "free",
        tags: ["Education", "Learning"],
    },
    {
        id: "2",
        title: "Dev Helper Agent",
        description: "Autonomous agent that reviews PRs, writes tests, and docs.",
        type: "agent",
        author: "DevSwarm",
        rating: 4.9,
        downloads: "850",
        price: "premium",
        priceAmount: "$19/mo",
        tags: ["Development", "Productivity"],
    },
    {
        id: "3",
        title: "GitHub Integration",
        description: "Connect your bots to GitHub repositories to read and write code.",
        type: "integration",
        author: "GitHub",
        rating: 4.7,
        downloads: "5k+",
        price: "free",
        tags: ["DevOps", "Version Control"],
    },
    {
        id: "4",
        title: "Surreal Oracle",
        description: "A creative bot that generates abstract art prompts and poetry.",
        type: "bot",
        author: "ArtMind",
        rating: 4.5,
        downloads: "1.2k",
        price: "free",
        tags: ["Creative", "Art"],
    },
    {
        id: "5",
        title: "Linear Sync",
        description: "Two-way sync between your agents and Linear issues.",
        type: "integration",
        author: "Linear",
        rating: 4.8,
        downloads: "3.1k",
        price: "premium",
        priceAmount: "$9/mo",
        tags: ["Productivity", "Management"],
    },
    {
        id: "6",
        title: "Research Agent",
        description: "Scours the web to create detailed research reports on any topic.",
        type: "agent",
        author: "DeepSearch",
        rating: 4.9,
        downloads: "15k",
        price: "premium",
        priceAmount: "$49/mo",
        tags: ["Research", "Business"],
    },
];

export default function MarketplacePage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [activeTab, setActiveTab] = useState<ItemType | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState("");

    const filteredItems = MARKETPLACE_ITEMS.filter(item => {
        const matchesTab = activeTab === 'all' || item.type === activeTab;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <DashboardPageShell title="Marketplace" description="Discover powerful bots and autonomous agents">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Search & Filter Header */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10 py-4 backdrop-blur-md bg-transparent">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-violet-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search marketplace..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                "w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all",
                                isDark
                                    ? "bg-white/5 border-white/10 focus:border-violet-500/50 focus:bg-white/10"
                                    : "bg-white border-neutral-200 focus:border-violet-500/50 focus:shadow-sm"
                            )}
                        />
                    </div>

                    <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 w-full md:w-auto overflow-x-auto">
                        <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} icon={Store} label="All" />
                        <TabButton active={activeTab === 'bot'} onClick={() => setActiveTab('bot')} icon={Bot} label="Bots" />
                        <TabButton active={activeTab === 'agent'} onClick={() => setActiveTab('agent')} icon={Users} label="Agents" />
                        <TabButton active={activeTab === 'integration'} onClick={() => setActiveTab('integration')} icon={Plug} label="Integrations" />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <MarketplaceCard key={item.id} item={item} isDark={isDark} />
                    ))}

                    {filteredItems.length === 0 && (
                        <div className="col-span-full py-20 text-center text-neutral-500">
                            <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">No results found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    )}
                </div>

            </div>
        </DashboardPageShell>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                active
                    ? "bg-white dark:bg-neutral-800 text-violet-600 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            )}
        >
            <Icon className="h-4 w-4" />
            {label}
        </button>
    );
}

function MarketplaceCard({ item, isDark }: { item: MarketplaceItem, isDark: boolean }) {
    const typeColors = {
        bot: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        agent: "text-violet-500 bg-violet-500/10 border-violet-500/20",
        integration: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    };

    const typeIcons = {
        bot: Bot,
        agent: Users,
        integration: Plug,
    };

    const Icon = typeIcons[item.type];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className={cn(
                "group relative flex flex-col p-5 rounded-2xl border transition-all duration-300",
                isDark
                    ? "bg-white/[0.02] border-white/10 hover:border-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/10"
                    : "bg-white border-neutral-100 shadow-sm hover:shadow-lg hover:border-violet-200"
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center text-2xl shadow-inner",
                    isDark ? "bg-gradient-to-br from-white/10 to-transparent" : "bg-gradient-to-br from-neutral-100 to-white"
                )}>
                    {/* Placeholder Icon Logic */}
                    <Icon className={cn("h-6 w-6 opacity-80",
                        item.type === 'bot' ? "text-blue-500" : item.type === 'agent' ? "text-violet-500" : "text-emerald-500"
                    )} />
                </div>
                <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border", typeColors[item.type])}>
                    {item.type}
                </span>
            </div>

            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 group-hover:text-violet-500 transition-colors">
                {item.title}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 line-clamp-2 h-10">
                {item.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-neutral-500 mb-6">
                <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span>{item.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Download className="h-3.5 w-3.5" />
                    <span>{item.downloads}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>{item.author}</span>
                </div>
            </div>

            <div className="mt-auto flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-white/5">
                <div className="font-semibold text-neutral-900 dark:text-white text-sm">
                    {item.price === 'free' ? 'Free' : item.priceAmount}
                </div>
                <button className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0",
                    "bg-[#6C43FF] text-white hover:bg-[#5b37d9] shadow-lg shadow-violet-500/20"
                )}>
                    Get <ChevronRight className="h-3 w-3" />
                </button>
            </div>

        </motion.div>
    );
}
