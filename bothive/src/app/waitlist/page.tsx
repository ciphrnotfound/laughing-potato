"use client";

import { motion } from "framer-motion";
import { IconSparkles, IconBrandGithub, IconBrandTwitter } from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";

export default function WaitlistPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-900/20 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-2xl px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Logo */}
                    <div className="mb-8 flex justify-center">
                        <Image src="/bothive-ai-logo.svg" alt="Bothive" width={64} height={64} className="drop-shadow-2xl" />
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-violet-300 mb-8 backdrop-blur-sm">
                        <IconSparkles className="w-4 h-4" />
                        <span>Early Access Only</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                        We're currently at capacity.
                    </h1>

                    <p className="text-lg text-neutral-400 mb-10 leading-relaxed max-w-lg mx-auto">
                        Bothive is in private beta. We are gradually rolling out access to ensure the best experience for our early users.
                    </p>

                    <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-12" onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-violet-500/50 transition-all"
                        />
                        <button className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors">
                            Join Waitlist
                        </button>
                    </form>

                    <div className="flex items-center justify-center gap-6 text-neutral-500">
                        <Link href="#" className="hover:text-white transition-colors">
                            <IconBrandTwitter className="w-5 h-5" />
                        </Link>
                        <Link href="#" className="hover:text-white transition-colors">
                            <IconBrandGithub className="w-5 h-5" />
                        </Link>
                        <Link href="/signin" className="text-sm font-medium hover:text-white transition-colors">
                            Sign In
                        </Link>
                    </div>
                </motion.div>
            </div>

            <footer className="absolute bottom-0 w-full px-8 py-6 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500 border-t border-white/5 bg-black/40 backdrop-blur-xl">
                <div className="flex items-center gap-1 mb-4 md:mb-0">
                    <span className="font-semibold text-neutral-400">Bothive</span>
                    <span>© 2025</span>
                </div>
                <div className="flex items-center gap-8 font-medium">
                    <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
                    <Link href="mailto:support@bothive.com" className="hover:text-white transition-colors">Contact</Link>
                </div>
            </footer>
        </div>
    );
}
