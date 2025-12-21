"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Users,
    Link as LinkIcon,
    Copy,
    Check,
    TrendingUp,
    DollarSign,
    Share2,
    Twitter,
    Linkedin,
    Mail,
    Award,
    Zap
} from "lucide-react";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "sonner";

export default function AffiliatePage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [referralCode] = useState("JEREMIAH77");
    const [copied, setCopied] = useState(false);

    const shareUrl = `https://bothive.ai/signup?ref=${referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <DashboardPageShell
            title="Affiliate Program"
            headerAction={<ThemeToggle />}
        >
            <div className="max-w-7xl mx-auto space-y-12 pb-20">

                {/* Hero / Promo Section */}
                <div className="relative overflow-hidden rounded-[3rem] bg-[#0d0e16] border border-white/5 p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/10 to-transparent pointer-events-none" />

                    <div className="flex-1 space-y-6 relative z-10 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest"
                        >
                            <Award className="w-4 h-4" />
                            Lifetime Referral Program
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-tight"
                        >
                            Earn <span className="text-indigo-500 italic">while they</span> scale.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-zinc-400 max-w-xl font-medium"
                        >
                            Refer businesses, builders, or students. You get <span className="text-white font-bold">10% lifetime commission</span> on every credit they ever purchase.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative z-10"
                    >
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-3 pl-2">Your Unique Link</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-black border border-white/10 rounded-2xl p-4 text-zinc-400 text-sm font-mono truncate">
                                        {shareUrl}
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className="p-4 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                                    >
                                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                    <Twitter className="w-4 h-4 text-blue-400" /> Tweet
                                </button>
                                <button className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                    <Linkedin className="w-4 h-4 text-blue-600" /> Post
                                </button>
                                <button className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="Total Referrals" value="24" icon={Users} color="text-indigo-400" />
                    <StatCard label="Conversion Rate" value="12.5%" icon={TrendingUp} color="text-emerald-400" />
                    <StatCard label="Pending Rewards" value="$140.20" icon={DollarSign} color="text-amber-400" />
                    <StatCard label="Total Earned" value="$2,450.00" icon={Award} color="text-indigo-400" />
                </div>

                {/* Referral List */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-white">Referred Accounts</h3>
                    <div className={cn(
                        "rounded-[2.5rem] border overflow-hidden",
                        isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100 shadow-sm"
                    )}>
                        <div className="divide-y divide-zinc-800">
                            {[
                                { name: "Nexus Solutions", date: "Dec 15, 2025", type: "Business", total: "$1,200", commission: "$120" },
                                { name: "Sarah Jenkins", date: "Dec 12, 2025", type: "Student", total: "$45", commission: "$4.50" },
                                { name: "Aria Digital", date: "Dec 10, 2025", type: "Enterprise", total: "$5,000", commission: "$500" },
                                { name: "DevFlow Inc", date: "Dec 08, 2025", type: "Business", total: "$800", commission: "$80" },
                            ].map((ref, i) => (
                                <div key={i} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                                            {ref.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">{ref.name}</p>
                                            <p className="text-xs text-zinc-500 font-medium">{ref.type} • Joined {ref.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8 text-right">
                                        <div>
                                            <p className="text-xs text-zinc-500 uppercase font-black tracking-widest mb-1">Total Spending</p>
                                            <p className="text-white font-black">{ref.total}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-indigo-400 uppercase font-black tracking-widest mb-1">Your Commission</p>
                                            <p className="text-indigo-400 font-black">{ref.commission}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FAQ / How it works */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-10 rounded-[2.5rem] bg-indigo-600/5 border border-indigo-500/10 space-y-4">
                        <h4 className="text-xl font-bold text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-indigo-500" />
                            How it works
                        </h4>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Every user you refer is locked to your account forever. Whenever they purchase credits to run bots or subscribe to premium tiers, a 10% cut is automatically deposited into your wallet. No caps, no expiration.
                        </p>
                    </div>
                    <div className="p-10 rounded-[2.5rem] bg-emerald-600/5 border border-emerald-500/10 space-y-4">
                        <h4 className="text-xl font-bold text-white flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-emerald-500" />
                            Payout Schedule
                        </h4>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Earnings are verified after a 24-hour holding period to prevent fraud. Once verified, you can withdraw your balance to your bank account via Paystack or Stripe once you hit the $50 minimum threshold.
                        </p>
                    </div>
                </div>

            </div>
        </DashboardPageShell>
    );
}

function StatCard({ label, value, icon: Icon, color }: any) {
    return (
        <div className="bg-[#0d0e16] border border-white/5 rounded-[2rem] p-8 space-y-4">
            <div className={cn("p-3 rounded-xl bg-white/5 w-fit", color)}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
                <h4 className="text-3xl font-black text-white leading-none">{value}</h4>
            </div>
        </div>
    )
}
