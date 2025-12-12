"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

const FAQ_DATA: FAQItem[] = [
    {
        question: "What is BotHive?",
        answer: "BotHive is a platform for building, deploying, and managing AI-powered bots and autonomous agents. Think of it as the operating system for the AI era — where agents can connect, collaborate, and create together."
    },
    {
        question: "Do I need coding experience?",
        answer: "Not at all! Our visual builder and HiveLang (our declarative language) make it easy for anyone to create powerful AI agents. If you can describe what you want in plain English, you can build a bot."
    },
    {
        question: "What AI models do you support?",
        answer: "We support multiple AI providers including OpenAI (GPT-4, GPT-3.5), Groq (Llama, Mixtral), and xAI (Grok). You can choose the best model for your use case or let the system automatically select."
    },
    {
        question: "How does pricing work?",
        answer: "BotHive is an ecosystem where creators can build and monetize their bots. We offer a free tier to get started. Pro subscribers get 1 custom bot built for their needs plus priority support. Business Elite members receive 3 tailored bots, team collaboration features, custom branding, and dedicated support."
    },
    {
        question: "Can I integrate with my existing tools?",
        answer: "Yes! BotHive integrates with popular services like Slack, Discord, WhatsApp, email providers, CRMs, and more. You can also create custom integrations using our API."
    },
    {
        question: "Is my data secure?",
        answer: "Absolutely. We use enterprise-grade encryption, SOC 2 compliant infrastructure, and never train on your data. You own your data completely, and we offer data residency options for Business customers."
    },
    {
        question: "What's the difference between a Bot and an Agent?",
        answer: "Bots are user-facing interfaces deployed to channels like web, WhatsApp, or Slack. Agents are autonomous AI entities that work behind the scenes with their own goals, memory, and tools — they can even collaborate with each other."
    },
    {
        question: "How do I get started?",
        answer: "Sign up for free, choose a template or start from scratch in our builder, test your bot in the playground, and deploy with one click. The whole process takes about 5 minutes!"
    },
];

function FAQAccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
    return (
        <div className="border-b border-black/5 dark:border-white/5 last:border-none">
            <button
                onClick={onToggle}
                className="w-full py-6 flex items-center justify-between gap-4 text-left group"
            >
                <span className="text-base md:text-lg font-medium text-[#0a0a0f] dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {item.question}
                </span>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen
                    ? "bg-violet-500 text-white"
                    : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40"
                    }`}>
                    {isOpen ? (
                        <Minus className="w-4 h-4" />
                    ) : (
                        <Plus className="w-4 h-4" />
                    )}
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-black/60 dark:text-white/60 leading-relaxed pr-12">
                            {item.answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="relative py-24 md:py-32 overflow-hidden
            bg-[#fafafa] dark:bg-[#030014]
        ">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)`,
                        backgroundSize: "32px 32px",
                    }}
                />
            </div>

            <div className="relative max-w-3xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs font-medium text-violet-600 dark:text-violet-400 mb-4">
                            FAQ
                        </span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-[#0a0a0f] dark:text-white mb-4">
                            Frequently asked questions
                        </h2>
                        <p className="text-base md:text-lg text-black/50 dark:text-white/50 max-w-xl mx-auto">
                            Everything you need to know about BotHive. Can't find the answer you're looking for? <a href="/contact" className="text-violet-600 dark:text-violet-400 hover:underline">Contact us</a>.
                        </p>
                    </motion.div>
                </div>

                {/* FAQ List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-white dark:bg-white/[0.02] rounded-2xl p-6 md:p-8 border border-black/5 dark:border-white/5 shadow-xl shadow-black/[0.03] dark:shadow-none"
                >
                    {FAQ_DATA.map((item, index) => (
                        <FAQAccordionItem
                            key={index}
                            item={item}
                            isOpen={openIndex === index}
                            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-12 text-center"
                >
                    <p className="text-black/50 dark:text-white/50 mb-4">
                        Still have questions?
                    </p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0a0a0f] dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        Get in touch
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
