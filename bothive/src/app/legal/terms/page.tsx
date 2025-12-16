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
                            These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Bothive ("we," "us" or "our"), concerning your access to and use of the Bothive website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
                        </p>

                        <h3>2. Intellectual Property Rights</h3>
                        <p>
                            Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                        </p>

                        <h3>3. User Representations</h3>
                        <p>
                            By using the Site, you represent and warrant that:
                        </p>
                        <ul>
                            <li>All registration information you submit will be true, accurate, current, and complete.</li>
                            <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                            <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                            <li>You are not under the age of 13.</li>
                        </ul>

                        <h3>4. Prohibited Activities</h3>
                        <p>
                            You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                        </p>

                        <h3>5. Contact Us</h3>
                        <p>
                            In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: <br />
                            <a href="mailto:legal@bothive.com" className="text-violet-400 hover:text-violet-300">legal@bothive.com</a>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
