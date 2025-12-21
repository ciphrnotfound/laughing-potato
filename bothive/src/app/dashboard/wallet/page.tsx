"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard,
    Plus,
    History,
    ShieldCheck,
    Zap,
    TrendingUp,
    Gift,
    DollarSign
} from "lucide-react";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

const MOCK_TRANSACTIONS = [
    { id: 1, type: "purchase", amount: 50.00, credits: 5000, date: "2025-12-20", status: "completed" },
    { id: 2, type: "usage", amount: -2.30, credits: -230, date: "2025-12-19", status: "completed", bot: "SEO Scout" },
    { id: 3, type: "payout", amount: -150.00, credits: -15000, date: "2025-12-18", status: "pending" },
    { id: 4, type: "royalty", amount: 15.00, credits: 1500, date: "2025-12-17", status: "completed", bot: "History Tutor" },
    { id: 5, type: "referral", amount: 5.00, credits: 500, date: "2025-12-16", status: "completed" },
];

export default function WalletPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <DashboardPageShell
            title="Earnings & Wallet"
            headerAction={<ThemeToggle />}
        >
            <div className="max-w-7xl mx-auto space-y-8 pb-20">

                {/* Balance Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-600 to-indigo-700 p-10 text-white shadow-2xl shadow-indigo-500/20"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                            <Wallet className="w-48 h-48" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <p className="text-violet-100 font-medium mb-1 opacity-80 uppercase tracking-widest text-xs">Total Balance</p>
                                <h2 className="text-6xl font-black tracking-tighter mb-4">$1,240.50</h2>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm text-sm font-bold">
                                    <Zap className="w-4 h-4 text-amber-400" />
                                    124,050 Credits
                                </div>
                            </div>

                            <div className="flex gap-4 mt-12">
                                <button className="flex-1 bg-white text-indigo-600 px-6 py-4 rounded-2xl font-black hover:bg-violet-50 transition-colors flex items-center justify-center gap-2 shadow-xl">
                                    <Plus className="w-5 h-5" /> Buy Credits
                                </button>
                                <button className="flex-1 bg-indigo-500/20 text-white border border-white/20 px-6 py-4 rounded-2xl font-black hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                                    <ArrowUpRight className="w-5 h-5" /> Withdraw
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className={cn(
                                "p-8 rounded-[2rem] border transition-all",
                                isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100 shadow-sm"
                            )}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Revenue (MTD)</p>
                                    <h4 className="text-2xl font-black text-white">$450.00</h4>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[65%]" />
                            </div>
                            <p className="text-xs text-zinc-500 mt-4">
                                <span className="text-emerald-500 font-bold">+12%</span> vs last month
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className={cn(
                                "p-8 rounded-[2rem] border transition-all",
                                isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100 shadow-sm"
                            )}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
                                    <Gift className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Referral Bonus</p>
                                    <h4 className="text-2xl font-black text-white">$85.20</h4>
                                </div>
                            </div>
                            <button className="w-full py-3 rounded-xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 text-xs font-bold transition-all">
                                View Referrals
                            </button>
                        </motion.div>
                    </div>
                </div>

                {/* Main Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Recent Transactions */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                <History className="w-6 h-6 text-indigo-500" />
                                Recent Transactions
                            </h3>
                            <button className="text-sm font-bold text-indigo-500 hover:text-indigo-400">View All</button>
                        </div>

                        <div className={cn(
                            "rounded-[2.5rem] border overflow-hidden",
                            isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-100 shadow-sm"
                        )}>
                            <div className="divide-y divide-zinc-800">
                                {MOCK_TRANSACTIONS.map((tx, i) => (
                                    <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-3 rounded-2xl",
                                                tx.amount > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-400"
                                            )}>
                                                {tx.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold group-hover:text-indigo-400 transition-colors">
                                                    {tx.type === "royalty" ? `Royalty: ${tx.bot}` :
                                                        tx.type === "usage" ? `API Usage: ${tx.bot}` :
                                                            tx.type === "referral" ? "Referral Commission" :
                                                                tx.type === "purchase" ? "Added Funds" : "Withdrawal"}
                                                </p>
                                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{tx.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn(
                                                "text-lg font-black",
                                                tx.amount > 0 ? "text-emerald-500" : "text-white"
                                            )}>
                                                {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-zinc-500 font-bold">{Math.abs(tx.credits)} Credits</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Earning Tips */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black text-white">Earn More</h3>

                        <div className="p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br from-indigo-900/40 to-black overflow-hidden relative group cursor-pointer">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <DollarSign className="w-20 h-20 text-white" />
                            </div>
                            <h4 className="text-white font-black text-xl mb-2">Publish a Bot</h4>
                            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                                Turn your expert workflows into agents. Earn 80% on every execution credit.
                            </p>
                            <button className="w-full py-4 rounded-xl bg-white text-black font-black hover:bg-zinc-200 transition-all text-sm">
                                Open Builder
                            </button>
                        </div>

                        <div className="p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br from-emerald-900/40 to-black overflow-hidden relative group cursor-pointer">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Users className="w-20 h-20 text-white" />
                            </div>
                            <h4 className="text-white font-black text-xl mb-2">Invite Builders</h4>
                            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                                Refer a developer who creates a bot, and earn 10% of their total royalty forever.
                            </p>
                            <button className="w-full py-4 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-500 transition-all text-sm">
                                Get Referral Link
                            </button>
                        </div>

                        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h5 className="text-white font-bold text-sm">Verified Payments</h5>
                                <p className="text-xs text-zinc-500">Secure Stripe & Paystack logic.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardPageShell>
    );
}

function Users({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    )
}
