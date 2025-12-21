"use client";

import { motion } from "framer-motion";
import { ShieldAlert, RefreshCcw } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="bg-[#070910] text-white flex items-center justify-center min-h-screen">
                <div className="max-w-md w-full px-6">
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-12 text-center space-y-8 backdrop-blur-xl">
                        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
                            <ShieldAlert className="w-10 h-10 text-red-500" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold uppercase tracking-tight">Critical Synapse Failure</h1>
                            <p className="text-white/40 text-sm">
                                The root coordination layer has encountered a fatal error.
                            </p>
                        </div>

                        <button
                            onClick={() => reset()}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-all"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Force Re-sync
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
