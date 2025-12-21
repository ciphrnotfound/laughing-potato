"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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

                    <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
                    <p className="text-neutral-500 mb-12">Last updated: December 16, 2025</p>

                    <div className="prose prose-invert prose-neutral max-w-none">
                        <p>
                            At Bothive, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website or use our application.
                        </p>

                        <h3>1. Information We Collect</h3>
                        <p>
                            We collect information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, or otherwise when you contact us.
                        </p>
                        <ul>
                            <li><strong>Identity Data:</strong> Includes full name, email address, and profile pictures.</li>
                            <li><strong>Neural Network Data:</strong> Interaction history with bots, system prompts you create, and HiveLang scripts.</li>
                            <li><strong>Integration Data:</strong> Metadata from connected services (Notion, WhatsApp, etc.), though we never store your third-party credentials in plain text.</li>
                            <li><strong>Usage Data:</strong> Information about how you use our Site, products, and services, including bot execution logs and performance metrics.</li>
                        </ul>

                        <h3>2. AI Data Usage and Training</h3>
                        <p>
                            Bothive uses advanced AI models to provide services. Please note:
                        </p>
                        <ul>
                            <li><strong>Training:</strong> We may use anonymized interaction logs to improve HiveLang's orchestration capabilities and our Pulse Engine.</li>
                            <li><strong>Privacy by Design:</strong> Your private system prompts and proprietary code are kept confidential and are not shared with other users or used to train public models without explicit consent.</li>
                        </ul>

                        <h3>3. How We Use Your Information</h3>
                        <p>
                            We use collected information to:
                        </p>
                        <ul>
                            <li>Provide, operate, and maintain our AI agent ecosystem.</li>
                            <li>Improve, personalize, and expand our platform capabilities.</li>
                            <li>Analyze how you use Bothive to prevent fraud and ensure security.</li>
                            <li>Process your marketplace transactions and payouts.</li>
                            <li>Communicate with you regarding updates, security alerts, and support.</li>
                        </ul>

                        <h3>4. Data Security</h3>
                        <p>
                            We implement a variety of security measures to maintain the safety of your personal information. All sensitive information (like API keys or tokens) is encrypted at rest using industry-standard protocols.
                        </p>

                        <h3>5. Your Rights</h3>
                        <p>
                            Depending on your location (e.g., GDPR, CCPA), you may have the right to access, correct, or delete your personal data. You can manage most of these settings directly through your dashboard.
                        </p>

                        <h3>6. Contact Us</h3>
                        <p>
                            If you have questions or comments about this Privacy Policy, please contact us at: <br />
                            <a href="mailto:privacy@bothive.com" className="text-violet-400 hover:text-violet-300">privacy@bothive.com</a>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
