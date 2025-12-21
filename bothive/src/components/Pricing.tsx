"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from "next/link";
import { GlowingEffect } from "@/components/ui/glowing-effect";

const PLANS = [
    {
        name: 'Starter',
        price: 0,
        description: 'For hobbyists and explorers.',
        features: ['1 Workspace', '3 Active Bots', 'Basic Analytics', 'Community Support'],
        popular: false,
        cta: "Get Started Free"
    },
    {
        name: 'Pro',
        price: 9900,
        currency: "₦",
        description: 'For power users and creators.',
        features: ['Unlimited Workspaces', 'Unlimited Bots', '1 Free Premium Bot / mo', '15% Store Discount', 'Full HiveMind Access', 'Priority Support'],
        popular: true,
        cta: "Start Pro Trial"
    },
    {
        name: 'Business',
        price: 24900,
        currency: "₦",
        description: 'For teams scaling up.',
        features: ['Everything in Pro', '1 Free Super Business Bot', '30% Store Discount', 'Request Special Bot', 'Dedicated Success Manager', 'SLA Guarantee'],
        popular: false,
        cta: "Contact Sales"
    },
];

export default function Pricing() {
    return (
        <section
            id="pricing"
            className="relative py-24 px-6 bg-[#0a0a0f] overflow-hidden"
        >
            {/* Subtle background pulse */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1a1025] rounded-full blur-[200px]"
                    animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="relative max-w-7xl mx-auto z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-6">
                            <Sparkles className="w-3 h-3" />
                            Simple Pricing
                        </span>
                        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">
                            Choose your workforce
                        </h2>
                        <p className="text-lg text-white/50 max-w-2xl mx-auto">
                            Start for free, upgrade when you 're ready. Join the economy where AI agents work for you.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLANS.map((plan, index) => (
                        <PricingCard key={plan.name} plan={plan} delay={index * 0.1} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function PricingCard({ plan, delay }: { plan: typeof PLANS[0], delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className="relative h-full"
        >
            <div className={cn(
                "relative h-full rounded-3xl border bg-[#0a0a0f] p-1",
                plan.popular ? "border-violet-500/50" : "border-white/[0.04]"
            )}>
                {/* Popular Glow Effect */}
                {plan.popular && (
                    <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-violet-500/20 to-transparent blur-md opacity-50" />
                )}

                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                />

                <div className="relative h-full flex flex-col justify-between rounded-[1.3rem] p-8 bg-[#0a0a0f] overflow-hidden">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-medium text-white">{plan.name}</h3>
                            {plan.popular && (
                                <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-semibold border border-violet-500/20">
                                    Popular
                                </span>
                            )}
                        </div>

                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-semibold text-white">
                                {plan.price === 0 ? "Free" : `${plan.currency}${plan.price.toLocaleString()}`}
                            </span>
                            {plan.price > 0 && <span className="text-sm text-white/40">/month</span>}
                        </div>

                        <p className="text-sm text-white/40 mb-8 border-b border-white/[0.06] pb-8">
                            {plan.description}
                        </p>

                        <ul className="space-y-4 mb-8">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
                                    <div className="w-5 h-5 rounded-full bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <Link href={plan.price === 0 ? "/signup" : "/dashboard/billing"} className="w-full block">
                            <button
                                className={cn(
                                    "w-full py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2",
                                    plan.popular
                                        ? "bg-white text-black hover:bg-neutral-200"
                                        : "bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.05]"
                                )}
                            >
                                {plan.cta} <Zap className="w-4 h-4" />
                            </button>
                        </Link>
                        {plan.popular && (
                            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-white/20">
                                <ShieldCheck className="w-3 h-3" />
                                Secure payment via Paystack
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
