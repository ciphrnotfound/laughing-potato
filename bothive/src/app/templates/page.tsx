"use client";

import React from "react";
import Navbar2 from "@/components/Navbar2";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Copy, ArrowRight, LayoutTemplate, Search, Tag, Box, Share2, Layers } from "lucide-react";
import { SpotlightCard } from "@/components/ui/ThreeDCard";

const TEMPLATES = [
    {
        title: "SEO Content Swarm",
        description: "A 3-agent swarm that researches keywords, writes articles, and optimizes for SEO scores.",
        tags: ["Marketing", "Content", "SEO"],
        agents: 3,
        complexity: "Intermediate"
    },
    {
        title: "Lead Qualification Pipeline",
        description: "Automate inbound lead scoring. One agent parses emails, another enriches data via Clearbit, and a third updates CRM.",
        tags: ["Sales", "Automation", "CRM"],
        agents: 3,
        complexity: "Advanced"
    },
    {
        title: "QA Testing Swarm",
        description: "Deploys headless browsers to crawl your site, check for broken links, and validate critical user flows.",
        tags: ["DevOps", "QA", "Testing"],
        agents: 5,
        complexity: "Expert"
    },
    {
        title: "Social Media Manager",
        description: "Monitors brand mentions, generates replies for approval, and schedules posts across platforms.",
        tags: ["Social", "Marketing"],
        agents: 2,
        complexity: "Beginner"
    },
    {
        title: "Customer Support Triage",
        description: "First-line defense for support tickets. Classifies issues, suggests documentation, and escalates to humans.",
        tags: ["Support", "Customer Success"],
        agents: 1,
        complexity: "Beginner"
    },
    {
        title: "Data Extraction Specialist",
        description: "Scrapes unstructured data from PDFs and websites, structures it into JSON, and saves to database.",
        tags: ["Data", "Scraping"],
        agents: 1,
        complexity: "Intermediate"
    }
];

export default function TemplatesPage() {
    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#030014] text-[#0a0a0f] dark:text-white selection:bg-violet-500/30">
            <Navbar2 />

            <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs font-medium text-violet-600 dark:text-violet-400 mb-6"
                    >
                        <LayoutTemplate className="w-3 h-3" />
                        Swarm Patterns
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-bold tracking-tight mb-6"
                    >
                        Start with a <span className="text-violet-600 dark:text-violet-500">Pattern.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-black/60 dark:text-white/60 max-w-2xl mx-auto"
                    >
                        Don't reinvent the wheel. Copy, paste, and customize battle-tested architectures for common use cases.
                    </motion.p>
                </div>

                {/* Search Bar Placeholder */}
                <div className="max-w-xl mx-auto mb-16 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-white/40" />
                    <input
                        type="text"
                        placeholder="Search templates (e.g. 'Customer Support')"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium placeholder:text-black/30 dark:placeholder:text-white/30"
                    />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TEMPLATES.map((template, i) => (
                        <SpotlightCard key={i} className="group h-full bg-white dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-violet-500/30 transition-all">
                            <div className="p-8 h-full flex flex-col">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300">
                                        <Layers className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 rounded-md bg-black/5 dark:bg-white/10 text-[10px] font-mono uppercase tracking-wider font-semibold">
                                            {template.agents} Agent{template.agents > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                    {template.title}
                                </h3>

                                <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed mb-6 flex-1">
                                    {template.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-8">
                                    {template.tags.map(tag => (
                                        <span key={tag} className="text-xs font-medium text-black/40 dark:text-white/40 flex items-center gap-1">
                                            <Tag className="w-3 h-3" /> {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center gap-3 mt-auto">
                                    <button className="flex-1 py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                                        <Copy className="w-3.5 h-3.5" /> Use Template
                                    </button>
                                    <button className="p-2.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                        <Share2 className="w-4 h-4 text-black/60 dark:text-white/60" />
                                    </button>
                                </div>
                            </div>
                        </SpotlightCard>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
