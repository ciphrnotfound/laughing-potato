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
                            We collect information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise when you contact us.
                        </p>
                        <ul>
                            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number.</li>
                            <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
                        </ul>

                        <h3>2. Use of Your Information</h3>
                        <p>
                            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
                        </p>
                        <ul>
                            <li>Create and manage your account.</li>
                            <li>Compile anonymous statistical data and analysis for use internally or with third parties.</li>
                            <li>Email you regarding your account or order.</li>
                            <li>Enable user-to-user communications.</li>
                            <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                        </ul>

                        <h3>3. Disclosure of Your Information</h3>
                        <p>
                            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                        </p>
                        <ul>
                            <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                        </ul>

                        <h3>4. Contact Us</h3>
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
