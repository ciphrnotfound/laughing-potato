"use client";

import React from "react";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { motion } from "framer-motion";
import { Gem, Sparkles, Check, Zap, Cpu, Globe, Shield, Bot, ArrowRight, Zap as ZapIcon } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PERKS_DETAIL = [
    {
        id: 'starter',
        name: 'Starter',
        price: 'Free',
        description: 'For hobbyists and explorers.',
        icon: <Bot size={24} className="text-neutral-400" />,
        features: [
            { text: '5 AI Assistant Messages / week', detail: 'Basic HiveMind intelligence' },
            { text: '2 Active Bot Instances', detail: 'Host small autonomous tasks' },
            { text: 'Basic Templates', detail: 'Access to community shared code' },
            { text: 'Standard Support', detail: 'Community-driven help' }
        ],
        perks: ['HiveLang Interpreter', 'Global Edge Runtime', 'Basic Analytics'],
        cta: "Current Plan",
        color: "neutral"
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '₦9,900',
        description: 'For power users and creators.',
        popular: true,
        icon: <Zap size={24} className="text-violet-400" />,
        features: [
            { text: 'Unlimited Assistant Messages', detail: 'Full HiveMind access' },
            { text: 'Unlimited Active Bots', detail: 'Scale your workforce' },
            { text: '1 Free Premium Bot / mo', detail: 'Claim from marketplace' },
            { text: '15% Store Discount', detail: 'On all integration fees' },
            { text: 'Priority Support', detail: 'Direct line to dev team' }
        ],
        perks: ['Custom HiveLang Extensions', 'Private Integration Hosting', 'Advanced Pulse Engine', '60-Day History'],
        cta: "Upgrade to Pro",
        color: "violet"
    },
    {
        id: 'business',
        name: 'Business',
        price: '₦24,900',
        description: 'For teams and enterprises.',
        icon: <Gem size={24} className="text-emerald-400" />,
        features: [
            { text: 'Everything in Pro', detail: 'Plus specialized tools' },
            { text: 'Unlimited Everything', detail: 'No technical caps' },
            { text: '1 Free Super Business Bot', detail: 'Enterprise-grade agent' },
            { text: '30% Store Discount', detail: 'Maximum savings' },
            { text: 'SLA Guarantee', detail: '99.9% runtime uptime' }
        ],
        perks: ['White-label Bot UI', 'On-Premise Deployment', 'Dedicated Success Manager', 'SSO/SAML Auth'],
        cta: "Enter Business Tier",
        color: "emerald"
    }
];

export default function PerksPage() {
    const { tier } = useSubscription();
    const currentTierIndex = tier; // 0: Starter, 1: Pro, 2: Business

    return (
        <DashboardPageShell
            title="Membership Perks"
            description="Manage your subscription and unlock advanced autonomous capabilities."
        >
            <div className="max-w-7xl mx-auto px-4 pb-20">
                {/* Visual Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative mb-12 rounded-3xl overflow-hidden bg-[#0a0a0f] border border-white/5 p-8 md:p-12"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-emerald-500/5 opacity-50" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                                <Sparkles size={12} />
                                Intelligence Economy
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                                Your Status: <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-emerald-400 uppercase tracking-tighter">
                                    {tier === 0 ? 'Discovery' : tier === 1 ? 'Pro' : 'Business'}
                                </span>
                            </h2>
                            <p className="text-neutral-400 text-lg leading-relaxed">
                                You are currently utilizing our core autonomous engine. Upgrade to unlock deeper HiveLang integration and priority edge execution.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center">
                                <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Messages</div>
                                <div className="text-2xl font-bold text-white tracking-tight">{tier === 0 ? '5/wk' : '∞'}</div>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center">
                                <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Instances</div>
                                <div className="text-2xl font-bold text-white tracking-tight">{tier === 0 ? '2' : '∞'}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Detailed Perk Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {PERKS_DETAIL.map((plan, idx) => {
                        const isCurrent = currentTierIndex === idx;
                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={cn(
                                    "relative rounded-3xl p-8 border flex flex-col transition-all duration-500",
                                    plan.popular
                                        ? "bg-[#0a0a0f] border-violet-500/30 ring-1 ring-violet-500/10 shadow-2xl shadow-violet-500/5"
                                        : "bg-black/40 border-white/5",
                                    isCurrent && "border-emerald-500/30 ring-1 ring-emerald-500/10"
                                )}
                            >
                                {isCurrent && (
                                    <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                                        Active <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    </div>
                                )}

                                <div className="mb-8">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
                                        plan.color === 'violet' ? "bg-violet-500/10" : plan.color === 'emerald' ? "bg-emerald-500/10" : "bg-white/5"
                                    )}>
                                        {plan.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-3xl font-bold text-white tracking-tighter">{plan.price}</span>
                                        {idx > 0 && <span className="text-neutral-500 text-sm">/mo</span>}
                                    </div>
                                    <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="space-y-4 mb-8 flex-grow">
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-white/5 pb-2">Plan Benefits</p>
                                    {plan.features.map((feature, fidx) => (
                                        <div key={fidx} className="flex gap-4">
                                            <div className="mt-1">
                                                <div className={cn(
                                                    "w-4 h-4 rounded-full flex items-center justify-center",
                                                    isCurrent ? "bg-emerald-500/20" : "bg-white/10"
                                                )}>
                                                    <Check size={10} className={isCurrent ? "text-emerald-400" : "text-neutral-400"} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-neutral-200">{feature.text}</div>
                                                <div className="text-xs text-neutral-500">{feature.detail}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-white/5 space-y-4 mb-8">
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Premium Extensions</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {plan.perks.map((perk, pidx) => (
                                            <div key={pidx} className="flex items-center gap-2 text-[11px] text-neutral-400 font-medium">
                                                <ZapIcon size={10} className="text-violet-500/50" />
                                                {perk}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Link href={idx === 0 ? "#" : "/dashboard/billing"} className="mt-auto">
                                    <button
                                        disabled={isCurrent}
                                        className={cn(
                                            "w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2",
                                            isCurrent
                                                ? "bg-neutral-900 text-neutral-500 cursor-default"
                                                : plan.popular
                                                    ? "bg-violet-600 hover:bg-violet-500 text-white shadow-xl shadow-violet-500/20"
                                                    : "bg-white/5 hover:bg-white/10 text-white border border-white/5"
                                        )}
                                    >
                                        {isCurrent ? "Active Plan" : plan.cta}
                                        {!isCurrent && <ArrowRight size={16} />}
                                    </button>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Visual Guarantee */}
                <div className="mt-16 p-8 rounded-3xl bg-[#0a0a0f] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                            <Shield size={32} className="text-violet-500" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white mb-1">BotHive Guarantee</h4>
                            <p className="text-sm text-neutral-500">Cancel or upgrade at any time. Your data and bot source code stay private, always.</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardPageShell>
    );
}


