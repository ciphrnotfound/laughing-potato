"use client";

import React from "react";
import { motion } from "framer-motion";
import { Twitter, Linkedin, Github, Mail, Sparkles, ArrowRight, Quote } from "lucide-react";
import Navbar2 from "@/components/Navbar2";
import Footer from "@/components/Footer";

export default function FounderPage() {
    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#030014] text-[#0a0a0f] dark:text-white">
            <Navbar2 />

            {/* Hero */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-500/10 rounded-full blur-[150px]" />
                </div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row items-center gap-12"
                    >
                        {/* Photo */}
                        <div className="relative">
                            <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                                {/* Placeholder avatar - replace with actual photo */}
                                <div className="w-full h-full bg-gradient-to-br from-violet-600 via-purple-500 to-violet-700 flex items-center justify-center">
                                    <span className="text-6xl md:text-7xl font-bold text-white/90">S</span>
                                </div>
                            </div>
                            {/* Decorative ring */}
                            <div className="absolute -inset-2 rounded-[2rem] border border-violet-500/20 -z-10" />
                        </div>

                        {/* Info */}
                        <div className="text-center md:text-left">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs font-medium text-violet-600 dark:text-violet-400 mb-4">
                                <Sparkles className="w-3 h-3" />
                                Founder & CEO
                            </span>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-4">
                                Shay
                            </h1>
                            <p className="text-lg text-black/50 dark:text-white/50 max-w-lg mb-6">
                                Building BotHive — the operating system for the AI era. On a mission to make AI agents accessible to everyone.
                            </p>

                            {/* Social links */}
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                {[
                                    { icon: Twitter, href: "https://twitter.com/bothive", label: "Twitter" },
                                    { icon: Linkedin, href: "https://linkedin.com/in/bothive", label: "LinkedIn" },
                                    { icon: Github, href: "https://github.com/bothive", label: "GitHub" },
                                    { icon: Mail, href: "mailto:shay@bothive.io", label: "Email" },
                                ].map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                                        aria-label={social.label}
                                    >
                                        <social.icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Story */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl md:text-3xl font-semibold mb-8">The Story</h2>

                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            <p className="text-black/70 dark:text-white/70 leading-relaxed mb-6">
                                BotHive started from a simple observation: building AI agents shouldn't require a PhD in machine learning. As AI models became more powerful, I saw countless developers and entrepreneurs struggling to harness that power for their specific needs.
                            </p>
                            <p className="text-black/70 dark:text-white/70 leading-relaxed mb-6">
                                I believed there had to be a better way — a platform where anyone could create, deploy, and monetize AI agents as easily as building a website. Where these agents could collaborate, share knowledge, and evolve together.
                            </p>
                            <p className="text-black/70 dark:text-white/70 leading-relaxed mb-6">
                                That vision became BotHive. Today, we're building the infrastructure that powers AI agents for thousands of users — from solopreneurs automating their businesses to enterprises deploying sophisticated AI workforces.
                            </p>
                            <p className="text-black/70 dark:text-white/70 leading-relaxed">
                                We're just getting started, and I'd love for you to be part of this journey.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Quote */}
            <section className="py-20 px-6 bg-[#f0f0f5] dark:bg-[#0a0a0f]">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Quote className="w-10 h-10 mx-auto mb-6 text-violet-500/30" />
                        <blockquote className="text-2xl md:text-3xl font-medium italic text-black/80 dark:text-white/80 mb-6">
                            "The future isn't about AI replacing humans — it's about AI amplifying what humans can achieve."
                        </blockquote>
                        <cite className="text-black/50 dark:text-white/50 not-italic">— Shay, Founder of BotHive</cite>
                    </motion.div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-2xl md:text-3xl font-semibold mb-4">What I believe in</h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Democratize AI",
                                description: "Everyone should have access to powerful AI tools, not just big tech companies.",
                            },
                            {
                                title: "Build in public",
                                description: "Transparency builds trust. We share our journey, wins, and failures openly.",
                            },
                            {
                                title: "Community first",
                                description: "The best products are built with users, not just for them.",
                            },
                        ].map((value, i) => (
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-white/[0.02]"
                            >
                                <h3 className="font-semibold mb-2">{value.title}</h3>
                                <p className="text-sm text-black/60 dark:text-white/60">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 border-t border-black/5 dark:border-white/5">
                <div className="max-w-xl mx-auto text-center">
                    <h2 className="text-2xl font-semibold mb-4">Let's connect</h2>
                    <p className="text-black/50 dark:text-white/50 mb-8">
                        Have an idea? Want to collaborate? I'd love to hear from you.
                    </p>
                    <a
                        href="mailto:shay@bothive.io"
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0a0a0f] dark:bg-white text-white dark:text-black font-medium hover:opacity-90 transition-opacity"
                    >
                        Send me an email
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </section>

            <Footer />
        </div>
    );
}
