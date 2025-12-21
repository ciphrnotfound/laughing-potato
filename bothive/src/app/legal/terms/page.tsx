"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-violet-500/30 font-sans">
            <div className="max-w-3xl mx-auto px-6 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Link href="/waitlist" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-12">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>

                    <h1 className="text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
                    <p className="text-neutral-500 mb-12">Last updated: December 16, 2025</p>

                    <div className="prose prose-invert prose-neutral max-w-none">

                        <h3>1. Agreement to Terms</h3>
                        <p>
                            These Terms of Service constitute a legally binding agreement made between you ("User") and Bothive ("we"), concerning your access to and use of our AI agent ecosystem and HiveLang development tools.
                        </p>

                        <h3>2. User Representations and Bot Creation</h3>
                        <p>
                            By creating or deploying a bot on Bothive, you represent and warrant that:
                        </p>
                        <ul>
                            <li>You own or have the necessary licenses for all code and prompts included in your bot.</li>
                            <li>Your bot does not violate any third-party rights or produce content that is illegal, harmful, or fraudulent.</li>
                            <li>You are responsible for the actions initiated by your bots through connected integrations.</li>
                        </ul>

                        <h3>3. Marketplace and Monetization</h3>
                        <p>
                            If you publish a bot to the Hive Store:
                        </p>
                        <ul>
                            <li><strong>Revenue Share:</strong> Bothive may retain a platform fee on all paid installations.</li>
                            <li><strong>Transfers:</strong> Purchases grant a license to use the bot but do not transfer underlying intellectual property unless explicitly stated.</li>
                            <li><strong>Refunds:</strong> Due to the digital nature of AI agents, refunds are subject to our discretionary review and platform policy.</li>
                        </ul>

                        <h3>4. AI Responsibility and Liability</h3>
                        <p>
                            Bothive provides the infrastructure for AI execution. We are not liable for:
                        </p>
                        <ul>
                            <li>Inaccuracies or hallucinations produced by large language models.</li>
                            <li>Data loss or corruption resulting from the autonomous actions of bots integrated with third-party APIs.</li>
                            <li>Service interruptions caused by underlying AI provider outages (e.g., OpenAI, Anthropic).</li>
                        </ul>

                        <h3>5. Prohibited Activities</h3>
                        <p>
                            You may not use Bothive to:
                        </p>
                        <ul>
                            <li>Develop malware or phishing agents.</li>
                            <li>Reverse engineer the Pulse Engine or HiveLang compiler.</li>
                            <li>Scrape Bothive's proprietary marketplace data or user profiles.</li>
                        </ul>

                        <h3>6. Contact Us</h3>
                        <p>
                            For legal inquiries or complaints, contact us at: <br />
                            <a href="mailto:legal@bothive.com" className="text-violet-400 hover:text-violet-300">legal@bothive.com</a>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
