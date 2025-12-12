"use client";

import React from "react";
import { motion } from "framer-motion";

interface BotField {
    id: string;
    label: string;
    type: "text" | "textarea" | "select" | "number" | "checkbox";
    placeholder?: string;
    options?: { value: string; label: string }[];
    required?: boolean;
    helper?: string;
    min?: number;
    max?: number;
    step?: number;
}

interface BotHelperFormProps {
    bot: {
        fields: BotField[];
    };
}

export function BotHelperForm({ bot }: BotHelperFormProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6">
                {bot.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                        <label htmlFor={field.id} className="text-sm font-medium text-white/80">
                            {field.label} {field.required && <span className="text-purple-400">*</span>}
                        </label>

                        {field.type === "textarea" ? (
                            <textarea
                                id={field.id}
                                placeholder={field.placeholder}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 min-h-[100px]"
                            />
                        ) : field.type === "select" ? (
                            <select
                                id={field.id}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
                            >
                                <option value="">Select an option...</option>
                                {field.options?.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        ) : field.type === "checkbox" ? (
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id={field.id}
                                    className="w-5 h-5 rounded border-white/10 bg-black/40 text-purple-600 focus:ring-purple-500/50"
                                />
                                <span className="text-sm text-white/60">{field.helper}</span>
                            </div>
                        ) : (
                            <input
                                type={field.type}
                                id={field.id}
                                placeholder={field.placeholder}
                                min={field.min}
                                max={field.max}
                                step={field.step}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
                            />
                        )}

                        {field.type !== "checkbox" && field.helper && (
                            <p className="text-xs text-white/40">{field.helper}</p>
                        )}
                    </div>
                ))}
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors"
                >
                    Save Configuration
                </button>
            </div>
        </form>
    );
}
