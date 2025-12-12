"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, Loader2, ShieldCheck, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from "next/link";

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
        price: 9900, // Converted approx from 9900 Naira or just kept as standard SaaS pricing for landing page
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
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    return (
        <section
            id="pricing"
            className="relative py-32 px-6 bg-[#fafafa] dark:bg-[#030014] overflow-hidden"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/5 rounded-full blur-[120px]" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            <div ref={containerRef} className="relative max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 mb-6">
                            <Sparkles className="w-3 h-3" />
                            Simple Pricing
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-black to-black/60 dark:from-white dark:to-white/60">
                            Choose your workforce
                        </h2>
                        <p className="text-lg text-black/50 dark:text-white/50 mb-10">
                            Start for free, upgrade when you 're ready. Join the ecosystem where AI agents work for you.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
                    {PLANS.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 40 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                            whileHover={{ y: -5 }}
                            className={cn(
                                "relative rounded-3xl p-8 flex flex-col justify-between border transition-all duration-300",
                                plan.popular
                                    ? "bg-[#0a0a0f] dark:bg-white text-white dark:text-black shadow-2xl scale-105 z-10 border-transparent relative"
                                    : "bg-white dark:bg-white/[0.02] border-black/5 dark:border-white/5 text-black dark:text-white hover:border-black/10 dark:hover:border-white/10 hover:shadow-xl dark:hover:shadow-black/20"
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div>
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <p className={cn("text-sm mb-6", plan.popular ? "text-white/70 dark:text-black/70" : "text-black/50 dark:text-white/50")}>
                                    {plan.description}
                                </p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-bold">
                                        {plan.price === 0 ? "Free" : `${plan.currency}${plan.price}`}
                                    </span>
                                    {plan.price > 0 && <span className="text-sm opacity-60">/month</span>}
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-3 text-sm">
                                            <div className={cn(
                                                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                                                plan.popular ? "bg-white/20 text-white dark:bg-black/10 dark:text-black" : "bg-black/5 dark:bg-white/10 text-black dark:text-white"
                                            )}>
                                                <Check className="w-3 h-3" />
                                            </div>
                                            <span className={plan.popular ? "text-white/90 dark:text-black/90" : "text-black/70 dark:text-white/70"}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Link href={plan.price === 0 ? "/signup" : "/dashboard/billing"} className="w-full">
                                <button
                                    className={cn(
                                        "w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                                        plan.popular
                                            ? "bg-white text-black hover:bg-white/90 dark:bg-black dark:text-white dark:hover:bg-black/90 shadow-lg"
                                            : "bg-[#0a0a0f] dark:bg-white text-white dark:text-black hover:opacity-90 shadow-md"
                                    )}
                                >
                                    {plan.cta} <Zap className="w-4 h-4" />
                                </button>
                            </Link>

                            {plan.popular && (
                                <div className="mt-4 flex items-center justify-center gap-2 text-xs opacity-60">
                                    <ShieldCheck className="w-3 h-3" />
                                    Secure payment via Paystack
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* FAQ Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                >
                    <p className="text-black/40 dark:text-white/40 text-sm">
                        Have more questions?{" "}
                        <a href="#faq" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
                            Check our FAQ
                        </a>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
