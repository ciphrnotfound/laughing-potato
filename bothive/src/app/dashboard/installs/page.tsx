"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme-context";
import { useAppSession } from "@/lib/app-session-context";
import {
    IconRobot,
    IconSearch,
    IconLoader2,
    IconBolt,
    IconStar,
    IconCalendar,
    IconDownload
} from "@tabler/icons-react";
import Link from "next/link";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface InstalledBot {
    id: string;
    bot_id: string;
    installed_at: string;
    bot: {
        id: string;
        name: string;
        description: string;
        icon_url: string;
        category: string;
        install_count: number;
        rating: number;
    };
}

export default function InstallsPage() {
    const { profile } = useAppSession();
    const supabase = createClientComponentClient();

    const [installs, setInstalls] = useState<InstalledBot[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function fetchInstalls() {
            if (!profile) return;
            try {
                const { data, error } = await supabase
                    .from("user_bot_installs")
                    .select(`
                        id,
                        bot_id,
                        installed_at,
                        bot:bot_id (
                            id,
                            name,
                            description,
                            icon_url,
                            category,
                            install_count,
                            rating
                        )
                    `)
                    .eq("user_id", profile.id)
                    .order("installed_at", { ascending: false });

                if (error) throw error;
                setInstalls(data as any || []);
            } catch (error) {
                console.error("Error fetching installs:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchInstalls();
    }, [profile, supabase]);

    const filteredInstalls = installs.filter(item =>
        item.bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.bot.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <section className="min-h-screen bg-[#0a0a0f] text-white py-12 md:py-24 relative overflow-hidden">
            {/* Subtle styling element from demo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1a1025] rounded-full blur-[200px]"
                    animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="relative max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
                    <div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-white/40 uppercase tracking-[0.2em] mb-4"
                        >
                            Library
                        </motion.p>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl md:text-4xl font-semibold text-white tracking-tight"
                        >
                            Installed Agents
                        </motion.h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/60 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-white/10 transition-all w-[200px]"
                            />
                        </div>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <IconLoader2 className="w-8 h-8 text-white/20 animate-spin" />
                        <p className="text-sm text-white/20 font-mono tracking-widest uppercase">Syncing...</p>
                    </div>
                ) : filteredInstalls.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 border border-white/[0.04] rounded-3xl bg-[#0a0a0f] relative overflow-hidden">
                        <GlowingEffect spread={60} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
                        <div className="relative z-10 text-center space-y-4">
                            <div className="w-12 h-12 bg-white/[0.05] rounded-xl flex items-center justify-center mx-auto border border-white/[0.05]">
                                <IconRobot className="w-6 h-6 text-white/20" />
                            </div>
                            <p className="text-white/40">No agents found in your library.</p>
                            <Link href="/marketplace">
                                <button className="px-6 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors">
                                    Browse Store
                                </button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredInstalls.map((item, index) => (
                            <BotGridItem
                                key={item.id}
                                item={item}
                                delay={index * 0.05}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

function BotGridItem({ item, delay }: { item: InstalledBot; delay: number }) {
    return (
        <motion.li
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="min-h-[14rem] list-none h-full"
        >
            <Link href={`/dashboard/installs/${item.bot.id}`} className="block h-full">
                <div className="relative h-full rounded-2xl border border-white/[0.04] bg-[#0a0a0f] p-2 md:rounded-3xl md:p-3 group transition-all duration-300 hover:border-white/[0.08]">
                    <GlowingEffect
                        spread={40}
                        glow={true}
                        disabled={false}
                        proximity={64}
                        inactiveZone={0.01}
                    />

                    <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6">
                        <div className="flex items-start justify-between">
                            <motion.div
                                className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/30 group-hover:text-white/60 group-hover:border-white/10 transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                            >
                                {item.bot.icon_url ? (
                                    <img src={item.bot.icon_url} alt="icon" className="w-5 h-5 object-contain opacity-60 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <IconRobot className="w-5 h-5" />
                                )}
                            </motion.div>

                            <div className="flex items-center gap-1">
                                <IconStar className="w-3 h-3 text-white/10 group-hover:text-amber-400/50 transition-colors" />
                                <span className="text-[10px] font-mono text-white/20 group-hover:text-white/40">{item.bot.rating}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-medium text-xl text-white group-hover:text-white transition-colors">
                                {item.bot.name}
                            </h3>
                            <p className="text-sm text-white/40 leading-relaxed line-clamp-2 group-hover:text-white/60 transition-colors">
                                {item.bot.description}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] text-white/20 font-mono uppercase tracking-wider">
                                <IconCalendar className="w-3 h-3" />
                                <span>{new Date(item.installed_at).toLocaleDateString()}</span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-medium text-violet-400">
                                <span>Launch</span>
                                <IconBolt className="w-3 h-3" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.li>
    );
}
