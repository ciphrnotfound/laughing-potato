"use client";

import React from "react";
import Navbar2 from "@/components/Navbar2";
import Footer from "@/components/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Book, Code, Terminal, Boxes, Zap, FileText, ArrowRight } from "lucide-react";
import { SpotlightCard } from "@/components/ui/ThreeDCard";

const DOC_CATEGORIES = [
    {
        title: "Quick Start",
        icon: Zap,
        description: "Deploy your first swarm in under 5 minutes.",
        href: "/docs/quick-start",
        gradient: "from-yellow-400/20 to-orange-500/20"
    },
    {
        title: "Core Concepts",
        icon: Book,
        description: "Learn about Agents, Hives, and the Orchestrator.",
        href: "/docs/concepts",
        gradient: "from-blue-400/20 to-cyan-500/20"
    },
    {
        title: "API Reference",
        icon: Code,
        description: "Complete REST and WebSocket API documentation.",
        href: "/docs/api",
        gradient: "from-violet-400/20 to-purple-500/20"
    },
    {
        title: "HiveLang SDK",
        icon: Terminal,
        description: "Building powerful agents with our declarative language.",
        href: "/docs/hivelang",
        gradient: "from-emerald-400/20 to-green-500/20"
    },
    {
        title: "Integrations",
        icon: Boxes,
        description: "Connect your bots to Linear, Notion, and Discord.",
        href: "/docs/integrations",
        gradient: "from-pink-400/20 to-rose-500/20"
    },
    {
        title: "Patterns",
        icon: FileText,
        description: "Common architectural patterns for large swarms.",
        href: "/docs/patterns",
        gradient: "from-white/10 to-white/5"
    }
];

export default function DocumentationPage() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);
    const rotate = useTransform(scrollY, [0, 1000], [0, 20]);

    return (
        <div className="min-h-screen bg-[#020202] text-white selection:bg-violet-500/30 overflow-hidden perspective-1000">
            <Navbar2 />

            {/* 3D Background Grid */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_90%)]" />
                <motion.div
                    style={{ rotateX: 60, y: y1 }}
                    className="absolute -inset-[100%] opacity-20 bg-[linear-gradient(to_right,rgba(139,92,246,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.1)_1px,transparent_1px)] bg-[size:100px_100px] [transform-style:preserve-3d]"
                />
            </div>

            <main className="relative z-10 pt-32 pb-24 px-6 max-w-7xl mx-auto">

                {/* Hero Section */}
                <div className="text-center mb-24 relative">
                    {/* Floating 3D Elements */}
                    <motion.div style={{ y: y2, rotate: rotate }} className="absolute -top-20 -left-20 w-32 h-32 bg-gradient-to-br from-violet-600/20 to-transparent border border-violet-500/20 rounded-xl backdrop-blur-sm -z-10 animate-float" />
                    <motion.div style={{ y: y1, rotate: -rotate }} className="absolute bottom-0 -right-20 w-48 h-48 bg-gradient-to-tr from-blue-600/10 to-transparent border border-blue-500/10 rounded-full backdrop-blur-sm -z-10 animate-float-delayed" />

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent"
                    >
                        Documentation
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-2xl mx-auto relative group"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                        <div className="relative flex items-center bg-[#0a0a0f] border border-white/10 rounded-xl p-2 shadow-2xl">
                            <Search className="w-5 h-5 text-white/50 ml-3" />
                            <input
                                type="text"
                                placeholder="Search for guides, components, or API references..."
                                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-white/50 px-4 py-2"
                            />
                            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-white/5 rounded border border-white/5 text-[10px] text-white/50">
                                <span className="text-xs">⌘</span> K
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* HiveLang v2 Announcement */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-24 relative"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 rounded-3xl opacity-20 blur-xl" />
                    <div className="relative bg-[#050508] border border-white/10 rounded-3xl overflow-hidden">
                        <div className="grid lg:grid-cols-2 gap-0">
                            <div className="p-10 flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider">New Release</span>
                                    <span className="text-white/40 text-sm">v2.0.0</span>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                    Introducing HiveLang v2
                                </h2>
                                <p className="text-white/60 text-lg mb-8 leading-relaxed">
                                    A complete reimplementation of our agent DSL. Cleaner syntax, parallel execution steps, and strictly typed tool calls.
                                </p>

                                <div className="space-y-4 mb-8">
                                    {[
                                        "Unified 'bot' and 'agent' block structure",
                                        "Native 'parallel' execution blocks",
                                        "Type-safe tool calls: call tool(arg: value)",
                                        "Enhanced error handling with 'try/onerror'"
                                    ].map((feature, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.3 + (i * 0.1) }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                                <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-neutral-300">{feature}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                <button className="self-start px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors flex items-center gap-2">
                                    Read Migration Guide <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="bg-[#0a0a0f] border-t lg:border-t-0 lg:border-l border-white/5 p-8 font-mono text-sm overflow-hidden relative group">
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                </div>
                                <div className="mt-8 space-y-1">
                                    <div className="text-neutral-500"># v2 Syntax Example</div>
                                    <div className="pl-4 border-l-2 border-violet-500/30">
                                        <div><span className="text-fuchsia-400">bot</span> <span className="text-green-300">"ResearchAssistant"</span></div>
                                        <div className="text-neutral-500 ml-4">description "Handles comprehensive topic research"</div>
                                        <br />
                                        <div><span className="text-fuchsia-400">on input</span></div>
                                        <div className="ml-4">
                                            <span className="text-fuchsia-400">parallel</span>
                                            <div className="ml-4 p-2 bg-violet-500/5 rounded border border-violet-500/10 my-1">
                                                <span className="text-blue-400">call</span> <span className="text-yellow-300">google.search</span>(
                                                <div className="ml-4"><span className="text-neutral-300">query:</span> <span className="text-green-300">"Hivelang v2 docs"</span></div>
                                                ) <span className="text-fuchsia-400">as</span> results
                                            </div>
                                            <div className="ml-4 p-2 bg-violet-500/5 rounded border border-violet-500/10 my-1">
                                                <span className="text-blue-400">call</span> <span className="text-yellow-300">slack.notify</span>(
                                                <div className="ml-4"><span className="text-neutral-300">channel:</span> <span className="text-green-300">"#updates"</span>,</div>
                                                <div className="ml-4"><span className="text-neutral-300">msg:</span> <span className="text-green-300">"Researching..."</span></div>
                                                )
                                            </div>
                                        </div>
                                        <br />
                                        <div className="ml-4"><span className="text-blue-400">say</span> <span className="text-green-300">"Research complete. Found "</span> + results.count + <span className="text-green-300">" items."</span></div>
                                        <div><span className="text-fuchsia-400">end</span></div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-50" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {DOC_CATEGORIES.map((category, i) => (
                        <SpotlightCard key={category.title} className="group cursor-pointer">
                            <div className="p-8 h-full flex flex-col relative z-20">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${category.gradient} border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
                                    <category.icon className="w-6 h-6 text-white" />
                                </div>

                                <h3 className="text-xl font-bold mb-2 group-hover:text-violet-400 transition-colors">{category.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{category.description}</p>

                                <div className="mt-auto pt-6 flex items-center text-xs font-mono text-white/30 group-hover:text-white transition-colors">
                                    <span>Learn more</span>
                                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </div>
                        </SpotlightCard>
                    ))}
                </div>

                {/* Quick Links Section */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02]">
                        <h3 className="text-2xl font-bold mb-6">Popular Articles</h3>
                        <ul className="space-y-4">
                            {["How to define a Bot in HiveLang", "Connecting to PostgreSQL", "Understanding Memory Scopes", "Deploying to AWS"].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-white/60 hover:text-white cursor-pointer transition-colors group">
                                    <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] group-hover:bg-violet-500/20 group-hover:text-violet-400 transition-colors">{i + 1}</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-violet-900/20 to-black relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Need Help?</h3>
                            <p className="text-white/50 mb-8">Passionate developers are waiting to help you in our Discord community.</p>
                            <button className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors">
                                Join Discord
                            </button>
                        </div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-500/20 blur-3xl rounded-full" />
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
