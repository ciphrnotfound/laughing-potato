"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link'; // Added missing Link import
import { useParams } from 'next/navigation'; // Using useParams instead of props for better client component handling
import AIBotAssistant from '@/components/AIBotAssistant';
import AIChatInterface from '@/components/AIChatInterface'; // New import
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/lib/theme-context";
import { useAppSession } from "@/lib/app-session-context";
import {
  Brain,
  Zap,
  Play,
  Settings,
  Sparkles,
  Code,
  Check,
  Copy,
  Terminal,
  Activity,
  GitBranch,
  Clock,
  Loader2,
  Globe,
  ExternalLink
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Real bot interface
interface Bot {
  id: string;
  name: string;
  slug?: string; // Added slug
  description: string;
  category?: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  code?: string;
  system_prompt?: string;
  capabilities?: string[]; // Added capabilities
  skills?: string[]; // Added skills fallback
  is_public: boolean;
  status?: 'draft' | 'pending_approval' | 'active' | 'approved' | 'rejected';
}

function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => `${item}`.trim()).filter(Boolean);
  }
  return [];
}

export default function BotPage({ params }: { params: { botId: string } }) {
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false); // Added publishing state
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [activeTab, setActiveTab] = useState<"configure" | "test" | "deploy">("configure");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchBot() {
      try {
        const { data, error } = await supabase
          .from('bots')
          .select('*')
          .eq('id', params.botId)
          .single();

        if (data) {
          console.log("[Builder] Fetched bot data:", data);
          setBot(data);
        }
      } catch (e) {
        console.error("Error fetching bot:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchBot();
  }, [supabase, params.botId]);

  const handlePublish = async () => {
    try {
      setPublishing(true);
      const { error } = await supabase
        .from('bots')
        .update({ status: 'pending_approval' })
        .eq('id', params.botId);

      if (error) throw error;

      console.log("[Publish] Status update successful");
      setBot(prev => prev ? { ...prev, status: 'pending_approval' } : null);
    } catch (error) {
      console.error("Error publishing:", error);
      alert("Failed to submit for review. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", isDark ? "bg-black" : "bg-white")}>
        <div className="animate-spin w-6 h-6 border-2 border-zinc-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!bot) {
    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center gap-4", isDark ? "bg-black text-white" : "bg-white text-black")}>
        <h1 className="text-2xl font-semibold">Bot not found</h1>
        <p className="text-zinc-500">The bot you are looking for does not exist or you don't have permission to view it.</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-200",
      isDark ? "bg-black text-white" : "bg-white text-zinc-900"
    )}>
      {/* Header */}
      <div className={cn(
        "border-b px-8 py-6 sticky top-0 z-10 backdrop-blur-xl bg-opacity-80",
        isDark ? "border-white/10 bg-black/80" : "border-black/5 bg-white/80"
      )}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
              isDark ? "bg-zinc-900 border border-white/10" : "bg-white border border-black/5"
            )}>
              <BotIcon name={bot.name} className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{bot.name}</h1>
              <div className="flex items-center gap-3 text-sm text-zinc-500 mt-0.5">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(bot.created_at).toLocaleDateString()}
                </span>
                {bot.category && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    <span>{bot.category}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                showAIAssistant
                  ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                  : isDark
                    ? "bg-zinc-900 text-zinc-300 border-white/10 hover:bg-zinc-800"
                    : "bg-white text-zinc-600 border-black/10 hover:bg-zinc-50"
              )}
            >
              <Brain className="w-4 h-4" />
              {showAIAssistant ? 'Hide AI' : 'Ask AI'}
            </button>
            <div className={cn("h-6 w-px", isDark ? "bg-white/10" : "bg-black/10")} />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-8 py-8">
        {/* AI Assistant Panel */}
        <AnimatePresence>
          {showAIAssistant && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className={cn(
                "rounded-2xl border overflow-hidden",
                isDark ? "bg-zinc-900/50 border-white/10" : "bg-zinc-50 border-black/5"
              )}>
                <AIBotAssistant botId={params.botId} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 border-b border-black/5 dark:border-white/10 pb-1">
          {[
            { id: "configure", label: "Configuration", icon: Settings },
            { id: "test", label: "Playground", icon: Play },
            { id: "deploy", label: "Deployment", icon: Zap }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                activeTab === tab.id
                  ? isDark ? "text-white" : "text-black"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              )}
            >
              <tab.icon className={cn("w-4 h-4", activeTab === tab.id && "text-purple-600")} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-[-5px] left-0 right-0 h-0.5 bg-purple-600"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "configure" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className={cn(
                    "p-6 rounded-2xl border",
                    isDark ? "bg-zinc-900/30 border-white/10" : "bg-white border-black/5 shadow-sm"
                  )}>
                    <h2 className="text-lg font-semibold mb-1">General Settings</h2>
                    <p className="text-sm text-zinc-500 mb-6">Configure your bot's core identity and behavior.</p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Name</label>
                        <input
                          type="text"
                          defaultValue={bot.name}
                          className={cn(
                            "w-full px-3 py-2 rounded-lg border bg-transparent transition-colors focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500",
                            isDark ? "border-white/10" : "border-black/10"
                          )}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Description</label>
                        <textarea
                          defaultValue={bot.description}
                          rows={3}
                          className={cn(
                            "w-full px-3 py-2 rounded-lg border bg-transparent transition-colors focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500",
                            isDark ? "border-white/10" : "border-black/10"
                          )}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">System Prompt</label>
                        <textarea
                          defaultValue={bot.system_prompt || "You are a helpful assistant."}
                          rows={6}
                          className={cn(
                            "w-full px-3 py-2 rounded-lg border bg-transparent font-mono text-sm transition-colors focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500",
                            isDark ? "border-white/10 bg-black/20" : "border-black/10 bg-zinc-50"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className={cn(
                    "p-6 rounded-2xl border",
                    isDark ? "bg-zinc-900/30 border-white/10" : "bg-white border-black/5 shadow-sm"
                  )}>
                    <h3 className="text-sm font-medium mb-4">Metadata</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-dashed border-zinc-200 dark:border-zinc-800">
                        <span className="text-sm text-zinc-500">ID</span>
                        <code className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{bot.id.substring(0, 8)}...</code>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-dashed border-zinc-200 dark:border-zinc-800">
                        <span className="text-sm text-zinc-500">Status</span>
                        {bot.status === 'active' || bot.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Active
                          </span>
                        ) : bot.status === 'pending_approval' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                            Pending Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-600 dark:text-zinc-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                            Draft
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-zinc-500">Visibility</span>
                        <span className="text-sm">{bot.is_public ? 'Public' : 'Private'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "test" && (
              <div className="h-[600px] w-full">
                <AIChatInterface
                  botCapabilities={parseStringList(bot.capabilities || bot.skills || [])}
                />
              </div>
            )}

            {activeTab === "deploy" && (
              <div className="grid grid-cols-1 space-y-8">
                {/* Store Publishing Card */}
                <div className={cn(
                  "p-6 rounded-2xl border",
                  isDark ? "bg-gradient-to-br from-purple-900/20 to-blue-900/10 border-purple-500/30" : "bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200"
                )}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Hive Store Listing</h3>
                        <p className="text-sm text-zinc-500">Submit your bot to the public marketplace</p>
                      </div>
                    </div>

                    {bot.status === 'active' || bot.status === 'approved' ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20 text-sm font-medium">
                        <Check className="w-4 h-4" /> Live in Store
                      </div>
                    ) : bot.status === 'pending_approval' ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 text-sm font-medium">
                        <Clock className="w-4 h-4" /> Under Review
                      </div>
                    ) : (
                      <button
                        onClick={handlePublish}
                        disabled={publishing}
                        className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {publishing ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                          </span>
                        ) : (
                          "Submit for Review"
                        )}
                      </button>
                    )}
                  </div>

                  <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
                    {bot.status === 'active' || bot.status === 'approved'
                      ? "Your bot is approved and visible to all users. Updates will trigger a re-review."
                      : bot.status === 'pending_approval'
                        ? "Your submission is being reviewed by the Bothive team. This usually takes 24-48 hours."
                        : "Once submitted, your bot will be reviewed for quality and security before appearing in the Hive Store."
                    }
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* View in Store (Only if active or approved) */}
                  {(bot.status === 'approved' || bot.status === 'active') && (
                    <div className={cn(
                      "p-6 rounded-2xl border",
                      isDark ? "bg-zinc-900/30 border-white/10" : "bg-white border-black/5 shadow-sm"
                    )}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Public Page</h3>
                          <p className="text-sm text-zinc-500">View on HiveStore</p>
                        </div>
                      </div>

                      <Link
                        href={`/hivestore/${bot.slug || bot.id}`}
                        target="_blank"
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border border-dashed transition-all group",
                          isDark ? "border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/5" : "border-black/10 hover:border-emerald-500/50 hover:bg-emerald-50"
                        )}
                      >
                        <span className="text-sm font-medium truncate opacity-70 group-hover:opacity-100 transition-opacity">
                          bothive.ai/store/{bot.slug || bot.id}
                        </span>
                        <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </div>
                  )}

                  {/* Embed Widget */}
                  <div className={cn(
                    "p-6 rounded-2xl border",
                    isDark ? "bg-zinc-900/30 border-white/10" : "bg-white border-black/5 shadow-sm"
                  )}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        <Code className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Embed Widget</h3>
                        <p className="text-sm text-zinc-500">Add to your website</p>
                      </div>
                    </div>

                    <div className="relative group">
                      <pre className={cn(
                        "p-4 rounded-xl text-sm font-mono overflow-x-auto transition-colors",
                        isDark ? "bg-zinc-950 border border-white/10" : "bg-zinc-50 border border-black/5"
                      )}>
                        <code className="text-purple-600 dark:text-purple-400">
                          {`<script src="https://bothive.app/widget.js" data-bot-id="${params.botId}"></script>`}
                        </code>
                      </pre>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`<script src="https://bothive.app/widget.js" data-bot-id="${params.botId}"></script>`);
                          alert("Copied to clipboard!");
                        }}
                        className={cn(
                          "absolute top-2 right-2 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100",
                          isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10"
                        )}
                      >
                        <Copy className="w-4 h-4 text-zinc-500" />
                      </button>
                    </div>
                  </div>

                  {/* CLI Deployment */}
                  <div className={cn(
                    "p-6 rounded-2xl border",
                    isDark ? "bg-zinc-900/30 border-white/10" : "bg-white border-black/5 shadow-sm"
                  )}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">CLI Deployment</h3>
                        <p className="text-sm text-zinc-500">Deploy from terminal</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className={cn(
                        "p-3 rounded-lg font-mono text-sm flex items-center justify-between",
                        isDark ? "bg-zinc-950 border border-white/10" : "bg-zinc-50 border border-black/5"
                      )}>
                        <span>npx bothive login</span>
                      </div>
                      <div className={cn(
                        "p-3 rounded-lg font-mono text-sm flex items-center justify-between",
                        isDark ? "bg-zinc-950 border border-white/10" : "bg-zinc-50 border border-black/5"
                      )}>
                        <span>npx bothive push</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function BotIcon({ name, className }: { name: string, className?: string }) {
  // Deterministic icon based on name
  const icons = [Brain, Zap, Sparkles, Activity, GitBranch];
  const index = name.length % icons.length;
  const Icon = icons[index];
  return <Icon className={className} />;
}
