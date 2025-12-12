"use client";

import React from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, ArrowRight, Sparkles, Users, Heart, Zap } from "lucide-react";
import Link from "next/link";
import Navbar2 from "@/components/Navbar2";
import Footer from "@/components/Footer";

const JOB_OPENINGS = [
    {
        id: "senior-fullstack",
        title: "Senior Full-Stack Engineer",
        department: "Engineering",
        location: "Remote (Worldwide)",
        type: "Full-time",
        description: "Build the core platform that powers AI agents for thousands of users.",
    },
    {
        id: "ai-engineer",
        title: "AI/ML Engineer",
        department: "AI Research",
        location: "Remote (Worldwide)",
        type: "Full-time",
        description: "Design and implement the next generation of agent orchestration systems.",
    },
    {
        id: "product-designer",
        title: "Senior Product Designer",
        department: "Design",
        location: "Remote (Worldwide)",
        type: "Full-time",
        description: "Shape the future of how humans interact with AI agents.",
    },
    {
        id: "devrel",
        title: "Developer Relations Engineer",
        department: "Developer Experience",
        location: "Remote (Worldwide)",
        type: "Full-time",
        description: "Help developers succeed with HiveLang and the BotHive platform.",
    },
];

const VALUES = [
    {
        icon: Sparkles,
        title: "Build the future",
        description: "We're creating technology that will define how humans and AI work together.",
    },
    {
        icon: Users,
        title: "Remote-first",
        description: "Work from anywhere in the world. We believe great talent isn't limited by geography.",
    },
    {
        icon: Heart,
        title: "Impact-driven",
        description: "Every feature we ship helps thousands of creators build better AI experiences.",
    },
    {
        icon: Zap,
        title: "Move fast",
        description: "We ship weekly, iterate constantly, and aren't afraid to experiment.",
    },
];

function JobCard({ job }: { job: typeof JOB_OPENINGS[0] }) {
    return (
        <Link href={`/careers/${job.id}`}>
            <motion.div
                whileHover={{ y: -4 }}
                className="group p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:border-violet-500/20 transition-all"
            >
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <span className="text-xs font-medium text-violet-600 dark:text-violet-400">{job.department}</span>
                        <h3 className="text-lg font-semibold mt-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {job.title}
                        </h3>
                    </div>
                    <ArrowRight className="w-5 h-5 text-black/20 dark:text-white/20 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                </div>

                <p className="text-sm text-black/60 dark:text-white/60 mb-4">{job.description}</p>

                <div className="flex items-center gap-4 text-xs text-black/40 dark:text-white/40">
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.type}
                    </span>
                </div>
            </motion.div>
        </Link>
    );
}

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#030014] text-[#0a0a0f] dark:text-white">
            <Navbar2 />

            {/* Hero */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-500/10 rounded-full blur-[150px]" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs font-medium text-violet-600 dark:text-violet-400 mb-4">
                            <Briefcase className="w-3 h-3" />
                            We're hiring
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-4">
                            Build the future of AI
                        </h1>
                        <p className="text-lg text-black/50 dark:text-white/50 max-w-xl mx-auto mb-8">
                            Join a team of ambitious builders shaping how the world interacts with AI agents.
                        </p>
                        <a
                            href="#openings"
                            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0a0a0f] dark:bg-white text-white dark:text-black font-medium hover:opacity-90 transition-opacity"
                        >
                            View open positions
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Why join BotHive?</h2>
                        <p className="text-black/50 dark:text-white/50">
                            We're building something meaningful — and we want you to be part of it.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {VALUES.map((value, i) => (
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center p-6"
                            >
                                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                                    <value.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                </div>
                                <h3 className="font-semibold mb-2">{value.title}</h3>
                                <p className="text-sm text-black/50 dark:text-white/50">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Job Openings */}
            <section id="openings" className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Open positions</h2>
                        <p className="text-black/50 dark:text-white/50">
                            {JOB_OPENINGS.length} roles available. Don't see a fit? Email us at{" "}
                            <a href="mailto:careers@bothive.io" className="text-violet-600 dark:text-violet-400 hover:underline">
                                careers@bothive.io
                            </a>
                        </p>
                    </motion.div>

                    <div className="grid gap-4">
                        {JOB_OPENINGS.map((job, i) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <JobCard job={job} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Perks */}
            <section className="py-20 px-6 border-t border-black/5 dark:border-white/5">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">Benefits & Perks</h2>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        {[
                            { emoji: "🌍", title: "Work from anywhere", desc: "100% remote, async-first" },
                            { emoji: "💰", title: "Competitive salary", desc: "Plus equity in a growing startup" },
                            { emoji: "🏖️", title: "Unlimited PTO", desc: "We trust you to manage your time" },
                            { emoji: "💻", title: "Home office budget", desc: "$2,000 to set up your workspace" },
                            { emoji: "📚", title: "Learning budget", desc: "$1,000/year for courses & books" },
                            { emoji: "🩺", title: "Health coverage", desc: "Comprehensive health insurance" },
                        ].map((perk) => (
                            <div key={perk.title}>
                                <div className="text-3xl mb-3">{perk.emoji}</div>
                                <h3 className="font-semibold mb-1">{perk.title}</h3>
                                <p className="text-sm text-black/50 dark:text-white/50">{perk.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
