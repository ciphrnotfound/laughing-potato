"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Calendar, Zap, ArrowRight, X } from "lucide-react";

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    botDetails: {
        name: string;
        description: string;
        type: "agent" | "bot";
        category: string;
        pricingTier: string;
    };
    isLoading?: boolean;
}

export default function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    botDetails,
    isLoading = false,
}: ConfirmationDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-lg mx-4"
            >
                <div className="rounded-3xl border border-white/10 bg-[#0b0b18]/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
                    {/* Success Header */}
                    <div className="relative bg-gradient-to-br from-[#6C43FF]/20 via-[#8A63FF]/10 to-transparent p-8 border-b border-white/10">
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="p-2 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#6C43FF] to-[#8A63FF] shadow-lg shadow-[#6C43FF]/25">
                                <CheckCircle2 className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Ready to Deploy</h2>
                                <p className="text-sm text-white/60 mt-1">
                                    Review your {botDetails.type} details before deployment
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bot Details Card */}
                    <div className="p-8 space-y-6">
                        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 space-y-4">
                            {/* Bot Name */}
                            <div>
                                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-[#6C43FF]" />
                                    {botDetails.name}
                                </h3>
                                <p className="text-sm text-white/70 mt-2 leading-relaxed">
                                    {botDetails.description}
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-white/10" />

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="text-xs text-white/50 uppercase tracking-wider">Type</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">
                                            {botDetails.type === "agent" ? "🤖" : "⚡"}
                                        </span>
                                        <span className="text-white font-medium capitalize">
                                            {botDetails.type}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-xs text-white/50 uppercase tracking-wider">Category</div>
                                    <div className="text-white font-medium capitalize">
                                        {botDetails.category}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-xs text-white/50 uppercase tracking-wider">Pricing Tier</div>
                                    <div className="text-white font-medium capitalize">
                                        {botDetails.pricingTier}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-xs text-white/50 uppercase tracking-wider">Est. Deploy Time</div>
                                    <div className="text-white font-medium flex items-center gap-1">
                                        <Zap className="w-4 h-4 text-yellow-400" />
                                        ~30 seconds
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What Happens Next */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
                            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#6C43FF]" />
                                What happens next?
                            </h4>
                            <ul className="space-y-2 text-sm text-white/70">
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6C43FF] mt-2" />
                                    <span>Your {botDetails.type} will be deployed to BotHive infrastructure</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6C43FF] mt-2" />
                                    <span>You'll receive a confirmation email (if enabled)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6C43FF] mt-2" />
                                    <span>Access your {botDetails.type} from the Dashboard</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6C43FF] mt-2" />
                                    <span>Optionally publish to HiveStore for others to use</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center gap-3 border-t border-white/10 px-8 py-6 bg-white/[0.02]">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] text-white font-medium hover:shadow-lg hover:shadow-[#6C43FF]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Deploying...
                                </>
                            ) : (
                                <>
                                    Confirm Deployment
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
