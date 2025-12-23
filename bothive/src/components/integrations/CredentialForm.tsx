"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Shield,
    Key,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Plug,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Field {
    name: string;
    label: string;
    type: "text" | "password" | "number" | "url";
    placeholder?: string;
    required?: boolean;
    helpText?: string;
}

interface CredentialFormProps {
    integration: {
        id: string;
        name: string;
        description: string;
        icon?: React.ReactNode;
    };
    fields: Field[];
    onSubmit: (data: Record<string, string>) => Promise<void>;
    onClose: () => void;
    isDark?: boolean;
}

export function CredentialForm({
    integration,
    fields,
    onSubmit,
    onClose,
    isDark = true
}: CredentialFormProps) {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await onSubmit(formData);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Failed to save credentials");
        } finally {
            setLoading(false);
        }
    };

    const textPrimary = isDark ? "text-white" : "text-gray-900";
    const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
    const bgCard = isDark ? "bg-neutral-900/90 border-white/10" : "bg-white border-gray-200";
    const bgInput = isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={cn(
                    "relative w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl",
                    bgCard
                )}
            >
                {/* Header Section */}
                <div className="p-8 pb-0">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500">
                                {integration.icon || <Key className="w-6 h-6" />}
                            </div>
                            <div>
                                <h2 className={cn("text-xl font-bold", textPrimary)}>Connect {integration.name}</h2>
                                <p className={cn("text-sm", textSecondary)}>{integration.description}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={cn("p-2 rounded-xl hover:bg-white/10 transition-colors", textSecondary)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs mb-8">
                        <Lock className="w-4 h-4" />
                        Your credentials are encrypted end-to-end and stored securely.
                    </div>
                </div>

                {/* Form Body */}
                <div className="px-8 pb-8">
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="py-12 text-center"
                            >
                                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className={cn("text-lg font-semibold mb-2", textPrimary)}>Successfully Connected!</h3>
                                <p className={cn("text-sm mb-8", textSecondary)}>You can now use {integration.name} tools in your bots.</p>
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-all"
                                >
                                    Close
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {fields.map((field) => (
                                    <div key={field.name}>
                                        <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            required={field.required}
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            value={formData[field.name] || ""}
                                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                            className={cn(
                                                "w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-purple-500/50 transition-all",
                                                bgInput,
                                                textPrimary,
                                                "placeholder:text-neutral-600"
                                            )}
                                        />
                                        {field.helpText && (
                                            <p className="mt-1 text-[11px] text-neutral-500 flex items-center gap-1">
                                                <Info className="w-3 h-3" />
                                                {field.helpText}
                                            </p>
                                        )}
                                    </div>
                                ))}

                                {error && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl font-semibold border transition-all",
                                            isDark ? "border-white/10 text-white hover:bg-white/5" : "border-gray-200 text-gray-700 hover:bg-gray-50"
                                        )}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Connecting...
                                            </>
                                        ) : (
                                            <>
                                                <Plug className="w-4 h-4" />
                                                Connect Integration
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </AnimatePresence>
                </div>

                {/* Glossy Overlay */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-60 h-60 bg-purple-600/10 blur-[100px] pointer-events-none" />
            </motion.div>
        </div>
    );
}
