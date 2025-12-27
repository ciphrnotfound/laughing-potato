"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bot, Send, Activity, Zap, Search, Plus,
    Sparkles, User, Hash, History, Trash2,
    MessageSquare, ShieldCheck, Download, PanelLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAppSession } from "@/lib/app-session-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import AIChatInterface from "@/components/AIChatInterface";

interface UnifiedBot {
    id: string;
    name: string;
    role: string;
    description: string;
    icon_url: string;
    hivelang_code?: string;
    type: 'owned' | 'installed' | 'global';
    capabilities?: string[];
}

export default function WorkforceTerminalPage() {
    const { profile } = useAppSession();
    const [bots, setBots] = useState<UnifiedBot[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBotId, setSelectedBotId] = useState<string>("global-hivemind");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const activeBot = bots.find(b => b.id === selectedBotId) || {
        id: "global-hivemind",
        name: "HiveMind",
        role: "Global Intelligence",
        description: "BotHive's core neural network.",
        type: "global",
        icon_url: ""
    } as UnifiedBot;

    useEffect(() => {
        const fetchData = async () => {
            if (!profile?.id) return;
            try {
                const { data: owned } = await supabase
                    .from('bots')
                    .select('*')
                    .eq('user_id', profile.id);

                const { data: installed } = await supabase
                    .from('user_bot_installs')
                    .select('*, bot:bot_id(*)')
                    .eq('user_id', profile.id);

                const unified: UnifiedBot[] = [
                    {
                        id: "global-hivemind",
                        name: "HiveMind",
                        role: "Neural Core",
                        description: "Standard Hive Protocol.",
                        icon_url: "",
                        type: "global",
                        capabilities: ["chat", "orchestration", "knowledge"]
                    }
                ];

                (owned || []).forEach(b => {
                    unified.push({
                        id: b.id,
                        name: b.name,
                        role: b.role || "Specialist",
                        description: b.description || "",
                        icon_url: b.icon_url || "",
                        hivelang_code: b.hivelang_code,
                        type: "owned",
                        capabilities: b.capabilities || []
                    });
                });

                (installed || []).forEach(inst => {
                    if (inst.bot) {
                        unified.push({
                            id: inst.bot.id,
                            name: inst.bot.name,
                            role: inst.bot.role || "Remote Agent",
                            description: inst.bot.description || "",
                            icon_url: inst.bot.icon_url || "",
                            hivelang_code: inst.bot.hivelang_code,
                            type: "installed",
                            capabilities: inst.bot.capabilities || []
                        });
                    }
                });

                setBots(unified);
            } catch (err) {
                console.error("Terminal fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [profile]);

    const filteredBots = bots.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-65px)] w-full bg-[#000000] text-[#EEEEEE] font-sans antialiased overflow-hidden">

            {/* 1. Bot Selection Sidebar - Vercel Inspired */}
            <AnimatePresence initial={false}>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 260, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="flex-none border-r border-white/[0.06] bg-[#050505] flex flex-col overflow-hidden"
                    >
                        <div className="p-5 flex items-center justify-between">
                            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">Intelligence</h2>
                            <button className="text-white/20 hover:text-white transition-colors">
                                <Plus size={14} />
                            </button>
                        </div>

                        <div className="px-4 pb-4">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-violet-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search agents..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-[13px] focus:outline-none focus:border-violet-500/40 focus:bg-white/[0.05] transition-all"
                                />
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="px-2 pb-6 space-y-6">
                                {/* Section: Global */}
                                <div>
                                    <div className="space-y-0.5">
                                        <BotItem
                                            bot={bots.find(b => b.id === "global-hivemind")!}
                                            isActive={selectedBotId === "global-hivemind"}
                                            onClick={() => setSelectedBotId("global-hivemind")}
                                        />
                                    </div>
                                </div>

                                {/* Section: My Bots */}
                                <div>
                                    <h4 className="px-3 mb-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.15em]">Owned Agents</h4>
                                    <div className="space-y-0.5">
                                        {filteredBots.filter(b => b.type === 'owned').map(bot => (
                                            <BotItem
                                                key={bot.id}
                                                bot={bot}
                                                isActive={selectedBotId === bot.id}
                                                onClick={() => setSelectedBotId(bot.id)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Section: Installed */}
                                <div>
                                    <h4 className="px-3 mb-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.15em]">Remote Installs</h4>
                                    <div className="space-y-0.5">
                                        {filteredBots.filter(b => b.type === 'installed').map(bot => (
                                            <BotItem
                                                key={bot.id}
                                                bot={bot}
                                                isActive={selectedBotId === bot.id}
                                                onClick={() => setSelectedBotId(bot.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t border-white/[0.06] bg-black/20">
                            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                                <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                                <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">System Active</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. Chat Terminal */}
            <div className="flex-1 flex flex-col relative min-w-0 bg-[#000000]">

                {/* Header - Super Minimalist */}
                <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-6 flex-none bg-black/50 backdrop-blur-xl z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-1.5 rounded-md hover:bg-white/5 text-white/30 hover:text-white transition-all active:scale-90"
                        >
                            <PanelLeft size={16} />
                        </button>
                        
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 group cursor-default">
                                <span className="text-[13px] font-medium text-white/40 group-hover:text-white/60 transition-colors tracking-tight">Terminal</span>
                                <span className="text-white/10 text-[10px]">/</span>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-5 h-5 rounded bg-violet-600/20 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                        {activeBot.type === 'global' ? <Sparkles size={11} fill="currentColor" /> : <Bot size={11} />}
                                    </div>
                                    <span className="text-[13px] font-semibold text-white tracking-tight">
                                        {activeBot.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
                            <Activity size={10} className="text-violet-500" />
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.1em]">Worker v2.0.4</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 p-[1px]">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold">
                                    {profile?.full_name?.charAt(0) || "U"}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Chat Interface */}
                <div className="flex-1 relative overflow-hidden">
                    <AIChatInterface
                        key={activeBot.id}
                        botName={activeBot.name}
                        botId={activeBot.id}
                        hivelangCode={activeBot.hivelang_code}
                        botCapabilities={activeBot.capabilities}
                        botIcon={activeBot.icon_url}
                    />
                </div>
            </div>
        </div>
    );
}

function BotItem({ bot, isActive, onClick }: { bot: UnifiedBot; isActive: boolean; onClick: () => void }) {
    if (!bot) return null;
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative group",
                isActive 
                    ? "bg-white/[0.06] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" 
                    : "text-white/40 hover:bg-white/[0.03] hover:text-white/80"
            )}
        >
            <div className={cn(
                "w-7 h-7 rounded flex items-center justify-center shrink-0 border transition-all duration-300",
                isActive 
                    ? "bg-violet-600 text-white border-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.3)]" 
                    : "bg-white/[0.03] border-white/[0.05] group-hover:border-white/10"
            )}>
                {bot.icon_url ? (
                    <img src={bot.icon_url} className="w-4 h-4 object-contain rounded-sm" />
                ) : (
                    bot.type === 'global' ? <Sparkles size={12} fill={isActive ? "currentColor" : "none"} /> : <Bot size={12} />
                )}
            </div>

            <div className="min-w-0 text-left">
                <p className={cn(
                    "text-[13px] font-medium truncate tracking-tight transition-colors",
                    isActive ? "text-white" : "text-white/60 group-hover:text-white/90"
                )}>
                    {bot.name}
                </p>
                <p className="text-[9px] font-bold text-white/20 truncate uppercase tracking-widest mt-0.5">
                    {bot.role}
                </p>
            </div>
        </button>
    );
}
