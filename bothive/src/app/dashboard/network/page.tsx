"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from "@supabase/supabase-js";
import {
    Search,
    Filter,
    Bot,
    Zap,
    Star,
    Globe,
    Cpu,
    ArrowRight,
    ShieldCheck,
    Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MarketBot {
    id: string;
    name: string;
    description?: string; // Assuming description exists or we use capabilities
    capabilities: string[];
    role?: string; // If stored
    hiring_fee: number;
    reputation_score: number;
    review_count: number;
    owner_id?: string; // To show if it's yours
}

export default function NetworkPage() {
    const [bots, setBots] = useState<MarketBot[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [userCredits, setUserCredits] = useState(0);

    useEffect(() => {
        fetchMarketplace();
    }, []);

    const fetchMarketplace = async () => {
        setLoading(true);
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 1. Fetch User Wallet (canonical HiveCredits wallet)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: wallet } = await supabase
                .from('wallets')
                .select('balance')
                .eq('user_id', user.id)
                .single();
            if (wallet) setUserCredits(Number(wallet.balance || 0));
        }

        // 2. Fetch Public Bots
        // Note: For now we might fetch ALL bots if is_public isn't widely set, 
        // to demo the UI. In prod, strictly eq('is_public', true).
        // For demo: Let's fetch all and pretend some are public.
        const { data: allBots } = await supabase
            .from('bots')
            .select('*')
            .limit(20);

        // Mocking marketplace data for existing bots that lack it
        const marketBots = (allBots || []).map((b: any) => ({
            ...b,
            hiring_fee: b.hiring_fee || Math.floor(Math.random() * 50) + 10,
            reputation_score: b.reputation_score || (4 + Math.random()),
            review_count: b.review_count || Math.floor(Math.random() * 100),
            description: b.description || "A specialized autonomous agent ready for hire."
        }));

        setBots(marketBots);
        setLoading(false);
    };

    const categories = ["All", "Development", "Data", "Creative", "Analysis"];

    return (
        <div className="min-h-screen bg-[#050507] text-white font-sans p-8 md:p-12 relative overflow-hidden">

            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                                <Globe size={12} /> Global Network
                            </span>
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-4">
                            The Hive Network
                        </h1>
                        <p className="text-lg text-gray-400 max-w-2xl font-light leading-relaxed">
                            Discover and hire specialized autonomous agents from the global collective.
                            Build your super-swarm by contracting experts.
                        </p>
                    </div>

                    {/* Wallet Card */}
                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl flex items-center gap-5 min-w-[240px]">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Coins size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Your Balance</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-white font-mono">{userCredits}</span>
                                <span className="text-sm text-yellow-500 font-bold">HIVE</span>
                            </div>
                        </div>
                        <button className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowRight size={18} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">

                    {/* Categories */}
                    <div className="flex items-center gap-2 p-1.5 bg-white/[0.03] border border-white/[0.05] rounded-full overflow-x-auto max-w-full">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat.toLowerCase())}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                                    filter === cat.toLowerCase()
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative group w-full md:w-96">
                        <Search className="absolute left-4 top-3.5 text-gray-500 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find an agent (e.g., 'SEO Auditor')..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-600"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {bots.map((bot, i) => (
                        <motion.div
                            key={bot.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group relative bg-[#0f0f12] border border-white/[0.06] rounded-3xl p-6 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(37,99,235,0.1)] transition-all duration-300"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5",
                                    i % 3 === 0 ? "bg-cyan-500/10 text-cyan-400" :
                                        i % 2 === 0 ? "bg-purple-500/10 text-purple-400" :
                                            "bg-emerald-500/10 text-emerald-400"
                                )}>
                                    <Bot size={24} />
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                                        <Star size={12} fill="currentColor" />
                                        <span>{bot.reputation_score.toFixed(1)}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-500">({bot.review_count})</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{bot.name}</h3>
                                <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed h-10">
                                    {bot.description}
                                </p>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-6 h-16 content-start">
                                {bot.capabilities.slice(0, 3).map((cap: string) => (
                                    <span key={cap} className="px-2 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] text-gray-400 font-mono uppercase tracking-wider">
                                        {cap.replace('.', ' ')}
                                    </span>
                                ))}
                            </div>

                            {/* Footer / Price */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-1.5">
                                    <Zap size={14} className="text-yellow-500" />
                                    <span className="text-white font-bold font-mono text-lg">{bot.hiring_fee}</span>
                                    <span className="text-xs text-gray-500 font-medium">/ call</span>
                                </div>

                                <button className="px-4 py-2 bg-white text-black text-sm font-medium rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/5">
                                    Hire
                                </button>
                            </div>

                            {/* Hover Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl" />
                        </motion.div>
                    ))}
                </div>

            </div>
        </div>
    );
}
