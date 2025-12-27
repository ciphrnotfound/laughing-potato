"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Bot,
    Zap,
    Search,
    ArrowRight,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Sparkles,
    X,
    Send,
    Activity,
    ShieldCheck,
    Star,
    Filter,
    Coins,
    Settings2,
    Globe
} from "lucide-react";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

interface AvailableBot {
    id: string;
    name: string;
    description: string;
    capabilities: string[];
    collaborationRate: number;
    ownerName?: string;
    metrics?: {
        successRate: number;
        jobsCompleted: number;
    };
    isPublic?: boolean;
}

interface Collaboration {
    id: string;
    requesterBotName: string;
    helperBotName: string;
    taskDescription: string;
    status: 'pending' | 'active' | 'completed' | 'failed';
    hcOffered: number;
    createdAt: string;
}

interface Stats {
    availableBots: number;
    activeCollabs: number;
    completedCollabs: number;
    totalEarned: number;
}

export default function CollaborationHubPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [searchQuery, setSearchQuery] = useState("");
    const [availableBots, setAvailableBots] = useState<AvailableBot[]>([]);
    const [myBots, setMyBots] = useState<AvailableBot[]>([]);
    const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
    const [stats, setStats] = useState<Stats>({ availableBots: 0, activeCollabs: 0, completedCollabs: 0, totalEarned: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'discover' | 'active'>('discover');

    // Hire Modal state
    const [showHireModal, setShowHireModal] = useState(false);
    const [selectedHelperBot, setSelectedHelperBot] = useState<AvailableBot | null>(null);
    const [selectedMyBot, setSelectedMyBot] = useState<string>("");
    const [taskDescription, setTaskDescription] = useState("");
    const [hcOffer, setHcOffer] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);

    // Monetization Modal state
    const [showMonetizationModal, setShowMonetizationModal] = useState(false);
    const [editingBot, setEditingBot] = useState<AvailableBot | null>(null);
    const [editRate, setEditRate] = useState<number>(5);
    const [editIsPublic, setEditIsPublic] = useState(false);
    const [savingListing, setSavingListing] = useState(false);

    // Mock Live Activity
    const [liveActivity, setLiveActivity] = useState("Marketplace active");

    // Fetch data from API
    const fetchData = useCallback(async () => {
        try {
            // Fetch marketplace bots and collaborations
            const collabRes = await fetch('/api/collaborations?include=all');
            const collabData = await collabRes.json();

            setAvailableBots(collabData.bots || []);
            setCollaborations(collabData.collaborations || []);
            setStats(collabData.stats || { availableBots: 0, activeCollabs: 0, completedCollabs: 0, totalEarned: 0 });

            // Fetch MY bots with monetization scopes
            const myBotsRes = await fetch('/api/collaborations?include=bots&scope=my_bots');
            const myBotsData = await myBotsRes.json();
            setMyBots(myBotsData.bots || []);

        } catch (error) {
            console.error('Failed to fetch collaboration data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        // Mock Ticker
        const messages = [
            "Research Pro just earned 200 HC",
            "Data Cruncher completed a job",
            "New bot 'SEO Master' joined the hub",
            "Collaboration traffic up 15% this hour"
        ];
        let i = 0;
        const interval = setInterval(() => {
            setLiveActivity(messages[i]);
            i = (i + 1) % messages.length;
        }, 5000);
        return () => clearInterval(interval);
    }, [fetchData]);

    // Open Hire modal
    const openHireModal = (bot: AvailableBot) => {
        setSelectedHelperBot(bot);
        setHcOffer(bot.collaborationRate);
        setTaskDescription("");
        setSelectedMyBot(myBots.length > 0 ? myBots[0].id : "");
        setShowHireModal(true);
    };

    // Open Monetization modal
    const openMonetizationModal = (bot: AvailableBot) => {
        setEditingBot(bot);
        setEditRate(bot.collaborationRate || 5);
        setEditIsPublic(bot.isPublic || false);
        setShowMonetizationModal(true);
    };

    // Submit collaboration request
    const submitCollaboration = async () => {
        if (!selectedHelperBot || !selectedMyBot || !taskDescription) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/collaborations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requesterBotId: selectedMyBot,
                    helperBotId: selectedHelperBot.id,
                    taskDescription,
                    hcOffer
                })
            });

            if (res.ok) {
                setShowHireModal(false);
                fetchData(); // Refresh data
                setActiveTab('active'); // Switch to active tab
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to create collaboration');
            }
        } catch (error) {
            console.error('Collaboration request failed:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Save Listing (Monetization)
    const saveListing = async () => {
        if (!editingBot) return;

        setSavingListing(true);
        try {
            const res = await fetch('/api/collaborations/listing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    botId: editingBot.id,
                    isPublic: editIsPublic,
                    rate: editRate,
                    capabilities: editingBot.capabilities
                })
            });

            if (res.ok) {
                setShowMonetizationModal(false);
                fetchData(); // Refresh all data
            } else {
                alert('Failed to update listing');
            }
        } catch (error) {
            console.error('Save listing failed:', error);
        } finally {
            setSavingListing(false);
        }
    };

    // Filter bots by search
    const filteredBots = availableBots.filter(bot =>
        bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.capabilities.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Filter my published bots (for display in list? No, usually distinct list)
    // Actually, availableBots likely includes my bots if they are public.

    // Format date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Status badge
    const StatusBadge = ({ status }: { status: Collaboration['status'] }) => {
        const styles = {
            pending: { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: Clock },
            active: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: Loader2 },
            completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: CheckCircle2 },
            failed: { bg: 'bg-red-500/10', text: 'text-red-500', icon: XCircle },
        };
        const style = styles[status];
        const Icon = style.icon;

        return (
            <span className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                isDark ? "border-transparent" : "border-transparent",
                style.bg, style.text
            )}>
                <Icon className={cn("w-3 h-3", status === 'active' && "animate-spin")} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <DashboardPageShell
            title="Collaboration Hub"
            description="Connect your bots with specialized agents to solve complex tasks"
        >
            <div className="max-w-6xl mx-auto space-y-8 pb-20">

                {/* Live Ticker & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl border mb-6",
                                isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-zinc-900")}>
                                    Live activity: <span className="text-zinc-500 font-normal">{liveActivity}</span>
                                </span>
                            </div>
                            <div className="flex gap-4 text-xs font-medium text-zinc-500">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {stats.activeCollabs} Active</span>
                                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {stats.completedCollabs} Done</span>
                            </div>
                        </motion.div>

                        {/* Search & Tabs */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                            <div className={cn(
                                "flex p-1 rounded-lg w-full sm:w-auto",
                                isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200"
                            )}>
                                {[
                                    { id: 'discover', label: 'Marketplace' },
                                    { id: 'active', label: 'My Collaborations' },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                        className={cn(
                                            "flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all",
                                            activeTab === tab.id
                                                ? isDark
                                                    ? "bg-zinc-800 text-white shadow-sm"
                                                    : "bg-zinc-100 text-zinc-900 shadow-sm"
                                                : isDark
                                                    ? "text-zinc-400 hover:text-white"
                                                    : "text-zinc-500 hover:text-zinc-900"
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'discover' && (
                                <div className="relative w-full sm:w-72">
                                    <Search className={cn(
                                        "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                                        isDark ? "text-zinc-500" : "text-zinc-400"
                                    )} />
                                    <input
                                        type="text"
                                        placeholder="Find a specialist..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={cn(
                                            "w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/20",
                                            isDark
                                                ? "bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-violet-500/50"
                                                : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500"
                                        )}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Discover Grid */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'discover' && (
                                <motion.div
                                    key="discover"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    {loading ? (
                                        // Skeletons
                                        [...Array(4)].map((_, i) => (
                                            <div key={i} className="h-40 rounded-xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                                        ))
                                    ) : filteredBots.length > 0 ? (
                                        filteredBots.map((bot, i) => (
                                            <motion.div
                                                key={bot.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                onClick={() => openHireModal(bot)}
                                                className={cn(
                                                    "p-6 rounded-xl border transition-all cursor-pointer group relative overflow-hidden",
                                                    isDark
                                                        ? "bg-zinc-900 border-zinc-800 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10"
                                                        : "bg-white border-zinc-200 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10"
                                                )}
                                            >
                                                {/* Header */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex gap-4">
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                                            isDark ? "bg-zinc-800" : "bg-zinc-100"
                                                        )}>
                                                            <Bot className={cn("w-6 h-6", isDark ? "text-violet-400" : "text-violet-600")} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className={cn("font-semibold", isDark ? "text-white" : "text-zinc-900")}>
                                                                    {bot.name}
                                                                </h3>
                                                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                                            </div>
                                                            <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-zinc-500")}>
                                                                by {bot.ownerName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className={cn(
                                                            "text-lg font-bold",
                                                            isDark ? "text-white" : "text-zinc-900"
                                                        )}>
                                                            {bot.collaborationRate} <span className="text-xs font-normal text-zinc-500">HC</span>
                                                        </span>
                                                        <div className="flex items-center gap-1 text-xs text-amber-500">
                                                            <Star className="w-3 h-3 fill-current" />
                                                            <span>4.9</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <p className={cn(
                                                    "text-sm mb-6 line-clamp-2",
                                                    isDark ? "text-zinc-400" : "text-zinc-600"
                                                )}>
                                                    {bot.description}
                                                </p>

                                                {/* Footer */}
                                                <div className="flex items-center justify-between pt-4 border-t border-dashed border-zinc-500/20">
                                                    <div className="flex gap-2">
                                                        {bot.capabilities.slice(0, 2).map(cap => (
                                                            <span
                                                                key={cap}
                                                                className={cn(
                                                                    "px-2 py-1 rounded text-xs",
                                                                    isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-600"
                                                                )}
                                                            >
                                                                {cap}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <span className={cn(
                                                        "text-xs font-medium text-violet-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    )}>
                                                        Hire Agent <ArrowRight className="w-3 h-3" />
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-20 text-center">
                                            <p className="text-zinc-500">No bots matching your search.</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'active' && (
                                <motion.div
                                    key="active"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-4"
                                >
                                    {collaborations.length > 0 ? (
                                        <div className={cn(
                                            "rounded-xl border overflow-hidden",
                                            "border-none"
                                        )}>
                                            <div className="grid gap-3">
                                                {collaborations.map((collab) => (
                                                    <div
                                                        key={collab.id}
                                                        className={cn(
                                                            "p-5 rounded-xl border flex items-center justify-between transition-all",
                                                            isDark
                                                                ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                                                                : "bg-white border-zinc-200 hover:border-zinc-300"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-6">
                                                            <div>
                                                                <StatusBadge status={collab.status} />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={cn("font-medium", isDark ? "text-white" : "text-zinc-900")}>
                                                                        {collab.helperBotName}
                                                                    </span>
                                                                    <span className="text-zinc-500 text-xs">for {collab.requesterBotName}</span>
                                                                </div>
                                                                <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-zinc-500")}>
                                                                    "{collab.taskDescription}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={cn("font-medium", isDark ? "text-white" : "text-zinc-900")}>
                                                                {collab.hcOffered} HC
                                                            </p>
                                                            <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-zinc-500")}>
                                                                {formatDate(collab.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center border border-dashed rounded-xl border-zinc-700">
                                            <p className="text-zinc-500">No active collaborations.</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar Stats & My Bots */}
                    <div className="space-y-6">
                        <div className={cn(
                            "p-6 rounded-xl border",
                            isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                        )}>
                            <h3 className={cn("text-sm font-medium mb-6 uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-500")}>Your Earnings</h3>
                            <div className="mb-6">
                                <span className={cn("text-4xl font-bold", isDark ? "text-white" : "text-zinc-900")}>
                                    {stats.totalEarned}
                                </span>
                                <span className="text-sm text-zinc-500 ml-2">HC</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Jobs Completed</span>
                                    <span className={isDark ? "text-zinc-300" : "text-zinc-700"}>{stats.completedCollabs}</span>
                                </div>
                            </div>
                        </div>

                        {/* My Bots / Supply Side */}
                        <div className={cn(
                            "rounded-xl border overflow-hidden",
                            isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                        )}>
                            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                                <h3 className={cn("font-semibold", isDark ? "text-white" : "text-zinc-900")}>My Bot Listings</h3>
                                <Settings2 className="w-4 h-4 text-zinc-500" />
                            </div>
                            <div className="divide-y divide-zinc-800">
                                {myBots.length === 0 ? (
                                    <div className="p-4 text-sm text-zinc-500 text-center">
                                        You have no bots. Create one to start earning!
                                    </div>
                                ) : (
                                    myBots.map(bot => (
                                        <div key={bot.id} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center",
                                                    isDark ? "bg-zinc-800" : "bg-zinc-100"
                                                )}>
                                                    <Coins className={cn("w-4 h-4", bot.isPublic ? "text-emerald-500" : "text-zinc-500")} />
                                                </div>
                                                <div>
                                                    <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-zinc-900")}>{bot.name}</p>
                                                    <p className="text-xs text-zinc-500">{bot.isPublic ? `${bot.collaborationRate} HC/task` : 'Private'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => openMonetizationModal(bot)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                                    isDark
                                                        ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                                                        : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
                                                )}
                                            >
                                                Manage
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Promo / Tip */}
                        <div className="p-6 rounded-xl border border-violet-500/20 bg-violet-500/5">
                            <h3 className="text-violet-500 font-medium mb-2">Pro Tip</h3>
                            <p className="text-sm text-violet-500/80">
                                Bots with specialized capabilities (e.g. "Crypto Analysis" or "Python Coding") earn 2x more on average.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Hire Modal */}
                <AnimatePresence>
                    {showHireModal && selectedHelperBot && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowHireModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                                className={cn(
                                    "w-full max-w-md rounded-2xl border p-6 shadow-2xl relative",
                                    isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                                )}
                            >
                                <button
                                    onClick={() => setShowHireModal(false)}
                                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="mb-6 text-center">
                                    <div className="mx-auto w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
                                        <Bot className="w-8 h-8 text-violet-500" />
                                    </div>
                                    <h3 className={cn("text-xl font-bold mb-1", isDark ? "text-white" : "text-zinc-900")}>
                                        Hire {selectedHelperBot.name}
                                    </h3>
                                    <p className="text-sm text-zinc-500">
                                        Rate: {selectedHelperBot.collaborationRate} HC / job
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className={cn("text-xs font-medium uppercase tracking-wider block mb-2", isDark ? "text-zinc-500" : "text-zinc-500")}>
                                            Select Your Bot (Client)
                                        </label>
                                        <select
                                            value={selectedMyBot}
                                            onChange={(e) => setSelectedMyBot(e.target.value)}
                                            className={cn(
                                                "w-full px-4 py-3 rounded-xl border bg-transparent outline-none",
                                                isDark ? "border-zinc-700 text-white" : "border-zinc-200 text-zinc-900"
                                            )}
                                        >
                                            {myBots.length === 0 ? (
                                                <option value="">No bots available</option>
                                            ) : (
                                                myBots.map(bot => (
                                                    <option key={bot.id} value={bot.id}>{bot.name}</option>
                                                ))
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label className={cn("text-xs font-medium uppercase tracking-wider block mb-2", isDark ? "text-zinc-500" : "text-zinc-500")}>
                                            Task Description
                                        </label>
                                        <textarea
                                            value={taskDescription}
                                            onChange={(e) => setTaskDescription(e.target.value)}
                                            placeholder="What do you need this bot to do?"
                                            rows={3}
                                            className={cn(
                                                "w-full px-4 py-3 rounded-xl border bg-transparent outline-none resize-none",
                                                isDark ? "border-zinc-700 text-white placeholder:text-zinc-600" : "border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                                            )}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className={cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-500")}>
                                                Offer Amount (HC)
                                            </label>
                                            <span className="text-xs text-zinc-500">Min: {selectedHelperBot.collaborationRate}</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={hcOffer}
                                            onChange={(e) => setHcOffer(parseInt(e.target.value) || 0)}
                                            className={cn(
                                                "w-full px-4 py-3 rounded-xl border bg-transparent outline-none",
                                                isDark ? "border-zinc-700 text-white" : "border-zinc-200 text-zinc-900"
                                            )}
                                        />
                                    </div>

                                    <button
                                        onClick={submitCollaboration}
                                        disabled={submitting || !selectedMyBot || !taskDescription || hcOffer < selectedHelperBot.collaborationRate}
                                        className={cn(
                                            "w-full py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 mt-2",
                                            submitting || !selectedMyBot || !taskDescription
                                                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                                                : "bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20"
                                        )}
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Request & Pay Escrow"}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Monetization Modal */}
                <AnimatePresence>
                    {showMonetizationModal && editingBot && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowMonetizationModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                                className={cn(
                                    "w-full max-w-md rounded-2xl border p-6 shadow-2xl relative",
                                    isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                                )}
                            >
                                <button
                                    onClick={() => setShowMonetizationModal(false)}
                                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="mb-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-emerald-500/10">
                                            <Coins className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-zinc-900")}>
                                            Monetization Settings
                                        </h3>
                                    </div>
                                    <p className="text-sm text-zinc-500">
                                        Configure how {editingBot.name} appears in the marketplace.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {/* Availability Toggle */}
                                    <div className={cn(
                                        "p-4 rounded-xl border flex items-center justify-between",
                                        isDark ? "border-zinc-800 bg-zinc-800/20" : "border-zinc-200 bg-zinc-50"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <Globe className={cn("w-5 h-5", editIsPublic ? "text-emerald-500" : "text-zinc-500")} />
                                            <div>
                                                <p className={cn("font-medium text-sm", isDark ? "text-white" : "text-zinc-900")}>Public Listing</p>
                                                <p className="text-xs text-zinc-500">{editIsPublic ? "Visible in Marketplace" : "Only visible to you"}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setEditIsPublic(!editIsPublic)}
                                            className={cn(
                                                "w-12 h-6 rounded-full p-1 transition-colors relative",
                                                editIsPublic ? "bg-emerald-500" : "bg-zinc-600"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-4 h-4 rounded-full bg-white transition-transform",
                                                editIsPublic ? "translate-x-6" : "translate-x-0"
                                            )} />
                                        </button>
                                    </div>

                                    {/* Rate Input */}
                                    <div>
                                        <label className={cn("text-xs font-medium uppercase tracking-wider block mb-2", isDark ? "text-zinc-500" : "text-zinc-500")}>
                                            Collaboration Rate (HC)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={editRate}
                                                onChange={(e) => setEditRate(parseInt(e.target.value) || 0)}
                                                className={cn(
                                                    "w-full px-4 py-3 rounded-xl border bg-transparent outline-none",
                                                    isDark ? "border-zinc-700 text-white" : "border-zinc-200 text-zinc-900"
                                                )}
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">HC per task</span>
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-2">
                                            You will earn this amount (minus 5% fee) for each completed task.
                                        </p>
                                    </div>

                                    <button
                                        onClick={saveListing}
                                        disabled={savingListing}
                                        className={cn(
                                            "w-full py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2",
                                            savingListing
                                                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                                                : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
                                        )}
                                    >
                                        {savingListing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </DashboardPageShell>
    );
}
