"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Plus, Copy, Check, Trash2, AlertCircle, Terminal, Eye, EyeOff, Shield, Code } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import ThemeToggle from "@/components/ThemeToggle";

interface ApiKey {
    id: string;
    key: string;
    label: string;
    last_used_at: string | null;
    created_at: string;
}

export default function ApiKeysPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newKeyLabel, setNewKeyLabel] = useState("");
    const [showNewKey, setShowNewKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchApiKeys();
    }, []);

    async function fetchApiKeys() {
        try {
            const res = await fetch("/api/developer/api-keys");
            if (res.ok) {
                const data = await res.json();
                setApiKeys(data.apiKeys || []);
            } else {
                setError("Failed to load API keys");
            }
        } catch (e) {
            setError("Failed to load API keys");
        } finally {
            setLoading(false);
        }
    }

    async function createApiKey() {
        setCreating(true);
        setError(null);
        try {
            const res = await fetch("/api/developer/api-keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ label: newKeyLabel || "CLI Key" }),
            });

            if (res.ok) {
                const data = await res.json();
                setShowNewKey(data.apiKey.key);
                setNewKeyLabel("");
                fetchApiKeys();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to create API key");
            }
        } catch (e) {
            setError("Failed to create API key");
        } finally {
            setCreating(false);
        }
    }

    async function deleteApiKey(id: string) {
        try {
            const res = await fetch(`/api/developer/api-keys?id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchApiKeys();
            }
        } catch (e) {
            setError("Failed to delete API key");
        }
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    // Theme-aware styles
    const cardBg = isDark
        ? "bg-white/[0.02] border-white/[0.06]"
        : "bg-white border-black/[0.06] shadow-sm";
    const textPrimary = isDark ? "text-white" : "text-black";
    const textSecondary = isDark ? "text-white/60" : "text-black/60";
    const inputBg = isDark
        ? "bg-white/[0.03] border-white/[0.08] focus:border-violet-500/50"
        : "bg-white border-black/[0.1] focus:border-violet-500";

    return (
        <DashboardPageShell
            title="API Keys"
            description="Manage your API keys for the BotHive CLI and integrations"
            headerAction={<ThemeToggle />}
        >
            {/* New Key Alert */}
            <AnimatePresence>
                {showNewKey && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                            "mb-6 p-5 rounded-2xl border",
                            isDark
                                ? "bg-emerald-500/10 border-emerald-500/20"
                                : "bg-emerald-50 border-emerald-200"
                        )}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className={cn(
                                "p-2 rounded-lg",
                                isDark ? "bg-emerald-500/20" : "bg-emerald-100"
                            )}>
                                <Check className="w-4 h-4 text-emerald-500" />
                            </div>
                            <span className={cn(
                                "font-semibold",
                                isDark ? "text-emerald-400" : "text-emerald-700"
                            )}>
                                API Key Created!
                            </span>
                        </div>
                        <p className={cn(
                            "text-sm mb-4",
                            isDark ? "text-emerald-300/80" : "text-emerald-600"
                        )}>
                            Save this key now — you won&apos;t be able to see it again.
                        </p>
                        <div className="flex items-center gap-2">
                            <code className={cn(
                                "flex-1 p-3 rounded-xl font-mono text-sm break-all",
                                isDark ? "bg-black/40 text-emerald-300" : "bg-emerald-100 text-emerald-800"
                            )}>
                                {showNewKey}
                            </code>
                            <button
                                onClick={() => copyToClipboard(showNewKey)}
                                className={cn(
                                    "p-3 rounded-xl transition-colors",
                                    isDark
                                        ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
                                        : "bg-emerald-100 hover:bg-emerald-200 text-emerald-600"
                                )}
                            >
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                        <button
                            onClick={() => setShowNewKey(null)}
                            className={cn(
                                "mt-4 text-sm font-medium hover:underline",
                                isDark ? "text-emerald-400" : "text-emerald-600"
                            )}
                        >
                            I&apos;ve saved this key
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Alert */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                            "mb-6 p-4 rounded-2xl border flex items-center gap-3",
                            isDark
                                ? "bg-red-500/10 border-red-500/20 text-red-400"
                                : "bg-red-50 border-red-200 text-red-600"
                        )}
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-6">
                {/* Create New Key */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("p-6 rounded-2xl border", cardBg)}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className={cn(
                            "p-2.5 rounded-xl",
                            isDark ? "bg-violet-500/10" : "bg-violet-50"
                        )}>
                            <Plus className="w-5 h-5 text-violet-500" />
                        </div>
                        <h2 className={cn("text-lg font-semibold", textPrimary)}>Create New API Key</h2>
                    </div>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Key label (e.g., 'Production' or 'Development')"
                            value={newKeyLabel}
                            onChange={(e) => setNewKeyLabel(e.target.value)}
                            className={cn(
                                "flex-1 px-4 py-3 rounded-xl border outline-none transition-colors",
                                inputBg, textPrimary
                            )}
                        />
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={createApiKey}
                            disabled={creating}
                            className={cn(
                                "px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all",
                                isDark
                                    ? "bg-white text-black hover:bg-white/90"
                                    : "bg-black text-white hover:bg-black/90",
                                "disabled:opacity-50"
                            )}
                        >
                            <Key className="w-4 h-4" />
                            {creating ? "Creating..." : "Generate Key"}
                        </motion.button>
                    </div>
                </motion.div>

                {/* Direct API Usage */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={cn("p-6 rounded-2xl border", cardBg)}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className={cn(
                            "p-2.5 rounded-xl",
                            isDark ? "bg-violet-500/10" : "bg-violet-50"
                        )}>
                            <Code className="w-5 h-5 text-violet-500" />
                        </div>
                        <h2 className={cn("text-lg font-semibold", textPrimary)}>Direct API Usage</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className={cn("text-sm mb-2 font-medium", textPrimary)}>With cURL:</p>
                            <pre className={cn(
                                "p-4 rounded-xl font-mono text-sm overflow-x-auto",
                                isDark ? "bg-[#0a0a0f] text-emerald-400" : "bg-black text-emerald-400"
                            )}>
                                <code>curl -X GET https://api.bothive.ai/v1/agents \<br />
                                    &nbsp;&nbsp;-H "x-api-key: your_api_key"</code>
                            </pre>
                        </div>
                        <div>
                            <p className={cn("text-sm mb-2 font-medium", textPrimary)}>With JavaScript:</p>
                            <pre className={cn(
                                "p-4 rounded-xl font-mono text-sm overflow-x-auto",
                                isDark ? "bg-[#0a0a0f] text-amber-400" : "bg-black text-amber-400"
                            )}>
                                <code>fetch('https://api.bothive.ai/v1/agents', {"{"}<br />
                                    &nbsp;&nbsp;headers: {"{"}<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;'x-api-key': 'your_api_key'<br />
                                    &nbsp;&nbsp;{"}"}<br />
                                    {"}"})</code>
                            </pre>
                        </div>
                    </div>
                </motion.div>

                {/* CLI Usage */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn("p-6 rounded-2xl border", cardBg)}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className={cn(
                            "p-2.5 rounded-xl",
                            isDark ? "bg-violet-500/10" : "bg-violet-50"
                        )}>
                            <Terminal className="w-5 h-5 text-violet-500" />
                        </div>
                        <h2 className={cn("text-lg font-semibold", textPrimary)}>CLI Usage</h2>
                    </div>
                    <p className={cn("text-sm mb-4", textSecondary)}>
                        Authenticate with the BotHive CLI using your API key:
                    </p>
                    <pre className={cn(
                        "p-4 rounded-xl font-mono text-sm overflow-x-auto",
                        isDark ? "bg-[#0a0a0f] text-violet-300" : "bg-black text-violet-300"
                    )}>
                        <code>npx bothive login{"\n"}# Paste your API key when prompted</code>
                    </pre>
                </motion.div>

                {/* Existing Keys */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={cn("p-6 rounded-2xl border", cardBg)}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className={cn(
                            "p-2.5 rounded-xl",
                            isDark ? "bg-violet-500/10" : "bg-violet-50"
                        )}>
                            <Shield className="w-5 h-5 text-violet-500" />
                        </div>
                        <h2 className={cn("text-lg font-semibold", textPrimary)}>Active API Keys</h2>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto" />
                        </div>
                    ) : apiKeys.length === 0 ? (
                        <div className="text-center py-12">
                            <div className={cn(
                                "w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center",
                                isDark ? "bg-white/[0.03]" : "bg-black/[0.03]"
                            )}>
                                <Key className={cn("w-8 h-8", textSecondary)} />
                            </div>
                            <p className={cn("font-medium mb-1", textPrimary)}>No API keys yet</p>
                            <p className={textSecondary}>Create your first key to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {apiKeys.map((key, index) => (
                                <motion.div
                                    key={key.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border transition-colors",
                                        isDark
                                            ? "border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02]"
                                            : "border-black/[0.06] bg-black/[0.01] hover:bg-black/[0.02]"
                                    )}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className={cn("font-medium", textPrimary)}>{key.label}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <code className={cn("text-sm font-mono", textSecondary)}>
                                                {showKeys[key.id] ? key.key : key.key.replace(/./g, "•").slice(0, 24) + "..."}
                                            </code>
                                            <button
                                                onClick={() => setShowKeys(prev => ({ ...prev, [key.id]: !prev[key.id] }))}
                                                className={cn("p-1 rounded hover:bg-white/10 transition-colors", textSecondary)}
                                            >
                                                {showKeys[key.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                        <div className={cn("text-xs mt-2", textSecondary)}>
                                            Created {new Date(key.created_at).toLocaleDateString()}
                                            {key.last_used_at && ` • Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => copyToClipboard(key.key)}
                                            className={cn(
                                                "p-2 rounded-lg transition-colors",
                                                isDark
                                                    ? "hover:bg-white/10 text-white/50 hover:text-white/80"
                                                    : "hover:bg-black/5 text-black/40 hover:text-black/70"
                                            )}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteApiKey(key.id)}
                                            className={cn(
                                                "p-2 rounded-lg transition-colors",
                                                "text-red-500 hover:bg-red-500/10"
                                            )}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </DashboardPageShell>
    );
}
