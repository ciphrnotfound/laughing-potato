"use client";

import React, { useState } from "react";
import { Sparkles, Wand2, Loader2, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function AISocialAssistant() {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);

        // Simulate AI generation delay
        setTimeout(() => {
            const newSuggestions = [
                `🚀 ${prompt} is changing the game! Here's why you should care... #Tech #Innovation`,
                `Just explored ${prompt} and my mind is blown. The future is now! 🤖✨`,
                `3 reasons why ${prompt} matters:\n1. Efficiency\n2. Scale\n3. Impact\n\nWhat do you think? 👇`,
            ];
            setSuggestions(newSuggestions);
            setIsGenerating(false);
        }, 1500);
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="p-5 space-y-4">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter a topic (e.g., 'AI Agents', 'Remote Work')..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                />
                <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    Generate
                </button>
            </div>

            {suggestions.length > 0 && (
                <div className="grid gap-3">
                    {suggestions.map((suggestion, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 relative group hover:border-white/20 transition-colors"
                        >
                            <p className="text-sm text-white/80 whitespace-pre-wrap pr-8">{suggestion}</p>
                            <button
                                onClick={() => copyToClipboard(suggestion, idx)}
                                className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
                            >
                                {copiedIndex === idx ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
