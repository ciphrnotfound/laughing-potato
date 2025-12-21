"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Database, Wrench, Check, Plug, Loader2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface ToolEntry {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
}

interface UserIntegration {
    id: string;
    integration: {
        id: string;
        name: string;
        slug: string;
        description: string;
        icon_url: string;
        category: string;
    };
    status: string;
}

interface ConfigurePanelProps {
    botName: string;
    onBotNameChange: (name: string) => void;
    description: string;
    onDescriptionChange: (desc: string) => void;
    systemPrompt: string;
    onSystemPromptChange: (prompt: string) => void;
    memoryStrategy: string;
    onMemoryStrategyChange: (strategy: string) => void;
    tools: ToolEntry[];
    onToolToggle: (id: string) => void;
    selectedIntegrations?: string[];
    onIntegrationToggle?: (id: string) => void;
    pricingModel: "free" | "paid";
    onPricingModelChange: (model: "free" | "paid") => void;
    price: number;
    onPriceChange: (price: number) => void;
}

const MEMORY_OPTIONS = [
    { value: "ephemeral", label: "Ephemeral", desc: "Cleared after each run" },
    { value: "session", label: "Session", desc: "Retained during conversation" },
    { value: "persistent", label: "Persistent", desc: "Stored across sessions" },
];

export default function ConfigurePanel({
    botName,
    onBotNameChange,
    description,
    onDescriptionChange,
    systemPrompt,
    onSystemPromptChange,
    memoryStrategy,
    onMemoryStrategyChange,
    tools,
    onToolToggle,
    selectedIntegrations = [],
    onIntegrationToggle,
    pricingModel,
    onPricingModelChange,
    price,
    onPriceChange,
}: ConfigurePanelProps) {
    const [userIntegrations, setUserIntegrations] = useState<UserIntegration[]>([]);
    const [loadingIntegrations, setLoadingIntegrations] = useState(true);
    const [expandedIntegrations, setExpandedIntegrations] = useState<string[]>([]);

    // Integration capabilities mapping
    const integrationCapabilities: Record<string, string[]> = {
        'trello': [
            'Create boards and manage projects',
            'Add cards with descriptions and due dates',
            'Move cards between lists',
            'Get board structure and lists',
            'Add comments to cards',
            'Update card details'
        ],
        'notion': [
            'Create databases with custom schemas',
            'Add pages to databases',
            'Query and filter database entries',
            'Search across workspace',
            'Update page content',
            'Add content blocks to pages'
        ],
        'whatsapp': [
            'Send text messages to customers',
            'Send pre-approved template messages',
            'Get message delivery status',
            'View business account information',
            'Manage conversation labels',
            'Access business analytics',
            'Setup webhooks for incoming messages'
        ],
        'gmail': [
            'Send emails with attachments',
            'Read inbox messages',
            'Manage email labels',
            'Search email conversations',
            'Draft and schedule emails'
        ],
        'slack': [
            'Send messages to channels',
            'Post to private channels',
            'Manage channel membership',
            'Access workspace information',
            'Handle file uploads'
        ],
        'discord': [
            'Send messages to Discord channels',
            'Manage server roles',
            'Access guild information',
            'Handle voice channel operations'
        ],
        'firebase': [
            'Read/write to Firestore',
            'Query collections',
            'Manage real-time data',
            'Handle authentication'
        ],
        'twitter': [
            'Post tweets',
            'Search tweets',
            'Manage user timeline',
            'Handle mentions and replies'
        ],
        'linkedin': [
            'Post company updates',
            'Manage company pages',
            'Access professional network data'
        ],
        'spotify': [
            'Play music and control playback',
            'Search for tracks/artists',
            'Manage playlists'
        ],
        'github': [
            'Create and manage issues',
            'List repositories'
        ],
        'weather': [
            'Get current weather',
            'Get forecast'
        ],
        'youtube': [
            'Search videos',
            'Get channel stats'
        ],
        'google_search': [
            'Perform web searches'
        ],
        'calendar': [
            'List events',
            'Create events'
        ],
        'stripe': [
            'View transactions'
        ],
        'vercel': [
            'View deployments'
        ],
        'sendgrid': [
            'Send emails'
        ]
    };

    const toggleExpanded = (integrationId: string) => {
        setExpandedIntegrations(prev =>
            prev.includes(integrationId)
                ? prev.filter(id => id !== integrationId)
                : [...prev, integrationId]
        );
    };

    // Fetch user's installed integrations
    useEffect(() => {
        async function fetchUserIntegrations() {
            try {
                const res = await fetch("/api/user/integrations");
                if (res.ok) {
                    const data = await res.json();
                    setUserIntegrations(data.connections || []);
                }
            } catch (error) {
                console.error("Failed to fetch user integrations:", error);
            } finally {
                setLoadingIntegrations(false);
            }
        }
        fetchUserIntegrations();
    }, []);

    return (
        <div className="w-full max-w-md space-y-6 p-6 rounded-2xl border border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl overflow-y-auto max-h-[calc(100vh-200px)]">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                    <Sparkles className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white">Configure Bot</h2>
                    <p className="text-xs text-white/50">Define persona and capabilities</p>
                </div>
            </div>

            {/* Bot Name */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Bot Name</label>
                <input
                    type="text"
                    value={botName}
                    onChange={(e) => onBotNameChange(e.target.value)}
                    placeholder="e.g. DreamweaverBot, CosmicOracle, etc."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Describe what your bot does... Be creative!"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                />
            </div>

            {/* System Prompt */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">System Prompt</label>
                <p className="text-xs text-white/40">Define your bot's personality, tone, and behavior. Be as creative as you want!</p>
                <textarea
                    value={systemPrompt}
                    onChange={(e) => onSystemPromptChange(e.target.value)}
                    placeholder="You are a surreal dream interpreter who speaks in riddles and metaphors..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors resize-none font-mono text-sm"
                />
            </div>

            {/* Pricing Configuration */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-white/70">
                    <Database className="h-4 w-4" />
                    Monetization
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => onPricingModelChange("free")}
                        className={cn(
                            "p-3 rounded-xl border text-center transition-all",
                            pricingModel === "free"
                                ? "border-violet-500 bg-violet-500/10"
                                : "border-white/10 bg-white/[0.02] hover:border-white/20"
                        )}
                    >
                        <div className="text-sm font-medium text-white">Free</div>
                        <div className="text-[10px] text-white/40 mt-0.5">Open to all</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => onPricingModelChange("paid")}
                        className={cn(
                            "p-3 rounded-xl border text-center transition-all",
                            pricingModel === "paid"
                                ? "border-emerald-500 bg-emerald-500/10"
                                : "border-white/10 bg-white/[0.02] hover:border-white/20"
                        )}
                    >
                        <div className="text-sm font-medium text-white">Paid / License</div>
                        <div className="text-[10px] text-white/40 mt-0.5">Community buy-in</div>
                    </button>
                </div>

                {pricingModel === "paid" && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2 pt-1"
                    >
                        <label className="text-xs font-medium text-white/50">Set Price (₦ or USD equivalent)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold">₦</span>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => onPriceChange(Number(e.target.value))}
                                placeholder="0.00"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
                            />
                        </div>
                        <p className="text-[10px] text-white/30 italic">Platform takes a small fee on every sale.</p>
                    </motion.div>
                )}
            </div>

            {/* Memory Strategy */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-white/70">
                    <Database className="h-4 w-4" />
                    Memory Strategy
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {MEMORY_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onMemoryStrategyChange(opt.value)}
                            className={cn(
                                "p-3 rounded-xl border text-left transition-all",
                                memoryStrategy === opt.value
                                    ? "border-violet-500 bg-violet-500/10"
                                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                            )}
                        >
                            <div className="text-sm font-medium text-white">{opt.label}</div>
                            <div className="text-xs text-white/40 mt-0.5">{opt.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* User's Installed Integrations */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/70">
                        <Plug className="h-4 w-4" />
                        Your Integrations
                    </div>
                    <Link
                        href="/integrations"
                        className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                    >
                        Install more <ExternalLink className="h-3 w-3" />
                    </Link>
                </div>

                {loadingIntegrations ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-white/40" />
                    </div>
                ) : userIntegrations.length === 0 ? (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                        <p className="text-sm text-white/50 mb-3">No integrations installed yet</p>
                        <Link
                            href="/integrations"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors"
                        >
                            <Plug className="h-4 w-4" />
                            Browse Integrations
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {userIntegrations.map((userInt) => {
                            const isSelected = selectedIntegrations.includes(userInt.integration.id);
                            const isExpanded = expandedIntegrations.includes(userInt.integration.id);
                            const capabilities = integrationCapabilities[userInt.integration.slug] || [];

                            return (
                                <div key={userInt.id} className="space-y-1">
                                    <motion.button
                                        type="button"
                                        onClick={() => onIntegrationToggle?.(userInt.integration.id)}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                                            isSelected
                                                ? "border-emerald-500/30 bg-emerald-500/5"
                                                : "border-white/10 bg-white/[0.02] opacity-70 hover:opacity-100"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                                                isSelected
                                                    ? "bg-emerald-500 border-emerald-500"
                                                    : "border-white/20 bg-transparent"
                                            )}
                                        >
                                            {isSelected && <Check className="h-3 w-3 text-white" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-white truncate">{userInt.integration.name}</div>
                                            <div className="text-xs text-white/40 truncate">{userInt.integration.description}</div>
                                        </div>
                                        <span className={cn(
                                            "text-xs px-2 py-0.5 rounded-full",
                                            userInt.status === "connected"
                                                ? "bg-emerald-500/10 text-emerald-400"
                                                : "bg-amber-500/10 text-amber-400"
                                        )}>
                                            {userInt.status}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleExpanded(userInt.integration.id);
                                            }}
                                            className="p-1 rounded-md hover:bg-white/10 transition-colors"
                                        >
                                            {isExpanded ? (
                                                <ChevronUp className="h-4 w-4 text-white/60" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-white/60" />
                                            )}
                                        </button>
                                    </motion.button>

                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="ml-4 mr-2 space-y-3 pt-2"
                                        >
                                            {capabilities.length > 0 && (
                                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                                    <div className="text-xs font-medium text-white/70 mb-2">Capabilities:</div>
                                                    <ul className="space-y-1">
                                                        {capabilities.map((capability, index) => (
                                                            <li key={index} className="text-xs text-white/50 flex items-center gap-2">
                                                                <div className="w-1 h-1 rounded-full bg-emerald-400"></div>
                                                                {capability}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Configuration Form */}
                                            <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-3">
                                                <div className="flex items-center gap-2 text-xs font-medium text-white/70">
                                                    <Wrench className="h-3 w-3" />
                                                    Configuration
                                                </div>

                                                <div className="space-y-2">
                                                    <div>
                                                        <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">API Key / Secret</label>
                                                        <input
                                                            type="password"
                                                            placeholder="Paste API Key here..."
                                                            className="w-full mt-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50"
                                                            onKeyDown={async (e) => {
                                                                if (e.key === 'Enter') {
                                                                    const input = e.currentTarget;
                                                                    const val = input.value;
                                                                    if (!val) return;

                                                                    try {
                                                                        const res = await fetch(`/api/user/integrations/${userInt.integration.id}`, {
                                                                            method: 'PATCH',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({
                                                                                config: { api_key: val }
                                                                            })
                                                                        });
                                                                        if (res.ok) {
                                                                            alert("API Key saved!");
                                                                            input.value = "";
                                                                        } else {
                                                                            alert("Failed to save.");
                                                                        }
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Access Token (OAuth)</label>
                                                        <input
                                                            type="password"
                                                            placeholder="Paste Access Token here..."
                                                            className="w-full mt-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50"
                                                            onKeyDown={async (e) => {
                                                                if (e.key === 'Enter') {
                                                                    const input = e.currentTarget;
                                                                    const val = input.value;
                                                                    if (!val) return;

                                                                    try {
                                                                        // For OAuth credentials, we might need a more complex merge, 
                                                                        // but for this "Manual Fix" we just overwrite access_token.
                                                                        const res = await fetch(`/api/user/integrations/${userInt.integration.id}`, {
                                                                            method: 'PATCH',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({
                                                                                config: { access_token: val }
                                                                            })
                                                                        });
                                                                        if (res.ok) {
                                                                            alert("Token saved!");
                                                                            input.value = "";
                                                                        }
                                                                    } catch (err) { console.error(err); }
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-white/30 italic">Press Enter to save. Changes apply immediately.</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Tools & Capabilities */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/70">
                        <Wrench className="h-4 w-4" />
                        Tools & Capabilities
                    </div>
                    <span className="text-xs text-white/40">
                        {tools.filter((t) => t.enabled).length} active
                    </span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {tools.map((tool) => (
                        <motion.button
                            key={tool.id}
                            type="button"
                            onClick={() => onToolToggle(tool.id)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                                tool.enabled
                                    ? "border-violet-500/30 bg-violet-500/5"
                                    : "border-white/10 bg-white/[0.02] opacity-60 hover:opacity-80"
                            )}
                        >
                            <div
                                className={cn(
                                    "flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                                    tool.enabled
                                        ? "bg-violet-500 border-violet-500"
                                        : "border-white/20 bg-transparent"
                                )}
                            >
                                {tool.enabled && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white truncate">{tool.name}</div>
                                <div className="text-xs text-white/40 truncate">{tool.description}</div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Tip */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20">
                <p className="text-xs text-white/60">
                    <strong className="text-violet-400">💡 Tip:</strong> Use your installed integrations to give your bot real superpowers — connect to Trello for project management, Notion for knowledge bases, WhatsApp Business for customer communications, Slack, Discord, Gmail, and more!
                </p>
            </div>
        </div>
    );
}
