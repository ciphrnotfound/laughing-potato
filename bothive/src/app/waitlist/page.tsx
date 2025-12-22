"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconSparkles, IconBrandGithub, IconBrandTwitter, IconCheck, IconLoader2 } from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function WaitlistPage() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleJoinWaitlist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setIsSuccess(true);
                toast.success("Welcome to the swarm!");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } catch (error) {
            toast.error("Failed to join waitlist.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-900/20 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-2xl px-6 text-center">
                <AnimatePresence mode="wait">
                    {!isSuccess ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
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

                            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8" onSubmit={handleJoinWaitlist}>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-violet-500/50 transition-all"
                                />
                                <button
                                    disabled={isSubmitting}
                                    className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <IconLoader2 className="w-4 h-4 animate-spin" /> : "Join Waitlist"}
                                </button>
                            </form>

                            {/* Invite Code Bypass */}
                            <div className="max-w-xs mx-auto mb-12">
                                <div className="flex flex-col gap-3">
                                    <input
                                        type="text"
                                        id="invite-code-input"
                                        placeholder="Have an invite code?"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-violet-500/50 transition-all uppercase tracking-widest"
                                    />
                                    <button
                                        onClick={() => {
                                            const input = document.getElementById('invite-code-input') as HTMLInputElement;
                                            const code = input?.value?.toUpperCase();
                                            if (code === 'BOTHIVE-EARLY') {
                                                localStorage.setItem('bothive_invite_token', 'valid');
                                                toast.success("Access Granted! Redirecting...");
                                                window.location.href = '/dashboard';
                                            } else {
                                                toast.error("Invalid invite code");
                                            }
                                        }}
                                        className="w-full py-3 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest hover:bg-violet-600/20 transition-all"
                                    >
                                        Unlock Access
                                    </button>
                                </div>
                            </div>

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
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 border border-white/10 p-12 rounded-3xl backdrop-blur-2xl max-w-md w-full relative"
                        >
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-violet-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.5)]">
                                <IconCheck className="w-12 h-12 text-white" strokeWidth={3} />
                            </div>

                            <h2 className="text-3xl font-bold mb-4 mt-6">You're on the list!</h2>
                            <p className="text-neutral-400 mb-8">
                                Check your inbox at <span className="text-violet-400 font-medium">{email}</span>. We've sent you a confirmation email.
                            </p>

                            <button
                                onClick={() => setIsSuccess(false)}
                                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium"
                            >
                                Back to home
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
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
