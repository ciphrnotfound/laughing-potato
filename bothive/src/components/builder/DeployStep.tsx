"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Rocket, Check, AlertCircle, Loader2, Copy, Clock, Home, Book } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeployStepProps {
    botName: string;
    description: string;
    isDeploying: boolean;
    isDeployed: boolean;
    deployedUrl?: string;
    isPendingApproval?: boolean;
    onDeploy: () => void;
    onCopyUrl?: () => void;
    error?: string | null;
}

export default function DeployStep({
    botName,
    description,
    isDeploying,
    isDeployed,
    deployedUrl,
    isPendingApproval = false,
    onDeploy,
    onCopyUrl,
    error,
}: DeployStepProps) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        if (deployedUrl) {
            navigator.clipboard.writeText(deployedUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            onCopyUrl?.();
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-6">
            {/* Header */}
            <div className="text-center mb-10">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold text-white mb-3"
                >
                    {isDeployed
                        ? (isPendingApproval ? "Submitted for Approval! 📋" : "Bot Deployed! 🎉")
                        : "Ready to Deploy"}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/50"
                >
                    {isDeployed
                        ? isPendingApproval
                            ? "Your bot is awaiting admin review before going live."
                            : "Your bot is now live and ready to use."
                        : "Review your bot configuration before deploying."}
                </motion.p>
            </div>

            {/* Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl p-8 mb-8"
            >
                <div className="flex items-start gap-4 mb-6 pb-6 border-b border-white/10">
                    <div className={cn(
                        "p-3 rounded-xl",
                        isDeployed
                            ? isPendingApproval
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-emerald-500/10 text-emerald-400"
                            : "bg-violet-500/10 text-violet-400"
                    )}>
                        {isDeployed
                            ? isPendingApproval
                                ? <Clock className="h-6 w-6" />
                                : <Check className="h-6 w-6" />
                            : <Rocket className="h-6 w-6" />}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-white mb-1">{botName}</h2>
                        <p className="text-sm text-white/50">{description || "No description provided."}</p>
                    </div>
                </div>

                {/* Checklist */}
                <div className="space-y-3 mb-8">
                    {[
                        { label: "Bot name configured", checked: !!botName },
                        { label: "Description added", checked: !!description },
                        { label: "System prompt defined", checked: true },
                        { label: "Tools selected", checked: true },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center",
                                    item.checked
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : "bg-amber-500/20 text-amber-400"
                                )}
                            >
                                {item.checked ? (
                                    <Check className="h-3 w-3" />
                                ) : (
                                    <AlertCircle className="h-3 w-3" />
                                )}
                            </div>
                            <span className={cn("text-sm", item.checked ? "text-white/70" : "text-amber-400")}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Pending Approval Notice */}
                {isDeployed && isPendingApproval && (
                    <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <div className="text-amber-400 font-medium mb-1">Pending Admin Approval</div>
                                <p className="text-sm text-amber-400/70">
                                    Your bot has been submitted and is awaiting review. You'll be notified once it's approved.
                                    You can check the status in your dashboard.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Deployed URL (only if approved) */}
                {isDeployed && !isPendingApproval && deployedUrl && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <div className="text-xs text-emerald-400/70 mb-2">Bot Endpoint</div>
                        <div className="flex items-center gap-3">
                            <code className="flex-1 text-sm text-emerald-400 font-mono truncate">
                                {deployedUrl}
                            </code>
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Deploy Button */}
                {!isDeployed && (
                    <motion.button
                        type="button"
                        onClick={onDeploy}
                        disabled={isDeploying || !botName}
                        whileHover={!isDeploying && botName ? { scale: 1.02 } : {}}
                        whileTap={!isDeploying && botName ? { scale: 0.98 } : {}}
                        className={cn(
                            "w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all",
                            isDeploying
                                ? "bg-violet-600/50 text-white/50 cursor-wait"
                                : botName
                                    ? "bg-violet-600 text-white hover:bg-violet-500 shadow-xl shadow-violet-500/20"
                                    : "bg-white/10 text-white/30 cursor-not-allowed"
                        )}
                    >
                        {isDeploying ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Submitting for Review...
                            </>
                        ) : (
                            <>
                                <Rocket className="h-5 w-5" />
                                Submit for Approval
                            </>
                        )}
                    </motion.button>
                )}

                {/* Post-deploy actions */}
                {isDeployed && (
                    <div className="grid grid-cols-2 gap-4">
                        <Link
                            href="/dashboard"
                            className="py-3 rounded-xl font-medium text-white/70 border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                        >
                            <Home className="h-4 w-4" />
                            Dashboard
                        </Link>
                        <Link
                            href="/guides"
                            className="py-3 rounded-xl font-medium bg-violet-600 text-white hover:bg-violet-500 transition-colors flex items-center justify-center gap-2"
                        >
                            <Book className="h-4 w-4" />
                            View Guides
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
