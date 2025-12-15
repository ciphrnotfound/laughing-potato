"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Send,
  Sparkles,
  Twitter,
  Linkedin,
  Loader2,
  Plug,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Wand2,
  Brain,
  TrendingUp,
  Clock,
  Target,
  BarChart3,
} from "lucide-react";
import { useAppSession } from "@/lib/app-session-context";
import { CronControl } from "@/components/cron-control";
import { listSocialPosts, createSocialPost, type SocialPostRecord, type SocialPlatform } from "@/lib/social-posts";
import { useRouter } from "next/navigation";
import AISocialAssistant from "@/components/AISocialAssistant";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

type ConnectedAccountSummary = {
  provider: string;
  metadata: Record<string, unknown> | null;
  expiresAt: string | null;
  connectedAt: string | null;
  updatedAt: string | null;
};
type AutoposterInputs = {
  industry: string;
  audience: string;
  tone: string;
  region: string;
  publishMode: "post" | "schedule";
  publishAt: string;
  trend?: string;
};

const INITIAL_AUTOPOSTER: AutoposterInputs = {
  industry: "tech lifestyle",
  audience: "startup founders",
  tone: "futuristic, confident, calm",
  region: "global",
  publishMode: "post",
  publishAt: "",
  trend: "",
};
export default function SocialDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading, profile } = useAppSession();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [posts, setPosts] = useState<SocialPostRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [composerPlatform, setComposerPlatform] = useState<SocialPlatform>("twitter");
  const [composerText, setComposerText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [connections, setConnections] = useState<ConnectedAccountSummary[] | null>(null);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [autoposterInputs, setAutoposterInputs] = useState<AutoposterInputs>(INITIAL_AUTOPOSTER);
  const [autoposterStatus, setAutoposterStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [autoposterRunId, setAutoposterRunId] = useState<string | null>(null);
  const [autoposterOutput, setAutoposterOutput] = useState<string | null>(null);
  const [autoposterError, setAutoposterError] = useState<string | null>(null);
  const [publishingPostId, setPublishingPostId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // AI Content Suggestion
  const generateAISuggestion = async () => {
    if (!composerText.trim()) return;

    try {
      // Mock AI suggestion - integrate with AI API when ready
      const suggestions = [
        "Just discovered an amazing AI tool that transformed our workflow! The future of automation is here 🚀 #AI #Innovation #Tech",
        "Building a startup? Focus on solving real problems first. Your users will thank you later. 🎯 #Startup #Entrepreneurship",
        "Day in the life of our team! From morning coffee standups to late-night coding sessions. This is how the magic happens ✨ #TeamLife #BehindTheScenes",
        "The future of work is remote, flexible, and AI-powered. Are you ready for what's coming? 🤖 #FutureOfWork #RemoteWork #AI",
        "Productivity tip: Use AI to automate repetitive tasks, so you can focus on what truly matters - innovation and creativity! 💡 #Productivity #AI #Tips"
      ];

      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      setAiSuggestion(randomSuggestion);
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
    }
  };

  const applyAISuggestion = () => {
    if (aiSuggestion) {
      setComposerText(aiSuggestion);
      setAiSuggestion(null);
    }
  };


  const refreshPosts = useCallback(async () => {
    if (!profile?.id) return;
    setIsLoading(true);
    const rows = await listSocialPosts(profile.id as string);
    setPosts(rows);
    setIsLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void refreshPosts();
  }, [isAuthenticated, refreshPosts]);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/signin");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !profile?.id) return;
    const userId = profile.id as string;
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      const rows = await listSocialPosts(userId);
      if (!cancelled) {
        setPosts(rows);
        setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, profile?.id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    const loadConnections = async () => {
      setConnectionsLoading(true);
      try {
        const response = await fetch("/api/connected-accounts", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load connected accounts");
        }
        const data = (await response.json()) as { accounts: ConnectedAccountSummary[] };
        if (!cancelled) {
          setConnections(data.accounts ?? []);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setConnections([]);
        }
      } finally {
        if (!cancelled) {
          setConnectionsLoading(false);
        }
      }
    };

    void loadConnections();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const upcoming = useMemo(() => posts.filter((p) => p.status === "scheduled"), [posts]);
  const drafts = useMemo(() => posts.filter((p) => p.status === "draft"), [posts]);
  const twitterAccount = useMemo(
    () => connections?.find((account) => account.provider === "twitter"),
    [connections]
  );

  const handleCompose = async (mode: "draft" | "scheduleNow") => {
    if (!profile?.id || !composerText.trim()) return;
    setIsSaving(true);
    try {
      const scheduledFor = mode === "scheduleNow" ? new Date().toISOString() : null;
      const created = await createSocialPost(
        profile.id,
        composerPlatform,
        composerText.trim(),
        scheduledFor || undefined
      );
      if (created) {
        setPosts((prev) => [created, ...prev]);
        setComposerText("");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishPost = async (postId: string) => {
    if (!postId || publishingPostId === postId) return;
    setPublishingPostId(postId);
    setPublishError(null);
    setPublishSuccess(null);
    try {
      const response = await fetch("/api/social/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details?.error ?? "Failed to publish post");
      }

      await response.json();
      setPublishSuccess("Post published to your social account.");
      await refreshPosts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to publish post.";
      setPublishError(message);
    } finally {
      setPublishingPostId(null);
    }
  };
  const handleAutoposterRun = async () => {
    if (autoposterStatus === "running") return;
    setAutoposterStatus("running");
    setAutoposterError(null);

    try {
      const response = await fetch("/api/autoposter/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(autoposterInputs),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details?.error ?? "Autoposter run failed");
      }

      const payload = (await response.json()) as { runId?: string; output?: string; scheduled?: boolean };
      setAutoposterRunId(payload.runId ?? null);
      setAutoposterOutput(payload.output ?? "Autoposter finished without returning copy.");
      setAutoposterStatus("success");

      // If posts were scheduled, trigger the publish-scheduled check
      if (payload.scheduled) {
        console.log('📅 Posts were scheduled, checking for due posts...');
        try {
          await fetch("/api/social/publish-scheduled", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
        } catch (e) {
          console.log('Note: Scheduled posts created, but cron check failed');
        }
      }
      await refreshPosts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to trigger autoposter.";
      setAutoposterError(message);
      setAutoposterStatus("error");
    } finally {
      setAutoposterStatus((status) => (status === "running" ? "idle" : status));
    }
  };
  const PlatformIcon = composerPlatform === "twitter" ? Twitter : Linkedin;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04010b] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(101,67,255,0.45),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(24,222,255,0.3),transparent_45%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-3"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/60 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-white/80" />
              Social Command Center
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl md:text-[2.6rem] md:leading-tight">
              Orchestrate your voice across networks with precision
            </h1>
            <p className="max-w-2xl text-sm text-white/65">
              Wire up Twitter, queue drafts, and watch the approval gate before autopilot unlocks. The orchestration grid keeps everything aligned with Bothive’s futuristic mission control vibe.
            </p>
          </motion.div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_35px_90px_rgba(15,23,42,0.58)] backdrop-blur-xl sm:p-6"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/4 via-transparent to-white/5 opacity-80" />
              <div className="relative">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-white/55">
                    <Sparkles className="h-4 w-4 text-violet-200" />
                    Composer
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-1 text-[11px] text-white/55">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Planner view
                  </div>
                </div>

                <div className="mb-3 flex gap-1 rounded-2xl bg-black/45 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setComposerPlatform("twitter")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-3 py-2 transition ${composerPlatform === "twitter" ? "bg-white text-black" : "text-white/60 hover:bg-white/8"
                      }`}
                  >
                    <Twitter className="h-3.5 w-3.5" />
                    Twitter
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposerPlatform("linkedin")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-3 py-2 transition ${composerPlatform === "linkedin" ? "bg-white text-black" : "text-white/60 hover:bg-white/8"
                      }`}
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    LinkedIn
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <textarea
                      value={composerText}
                      onChange={(e) => setComposerText(e.target.value)}
                      rows={5}
                      placeholder="Draft something your future self will be proud you shipped."
                      className="w-full resize-none rounded-2xl border border-white/12 bg-black/55 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/25"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/5" />
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs text-white/55">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1.5">
                      <PlatformIcon className="h-3.5 w-3.5" />
                      {composerPlatform === "twitter"
                        ? "Short and punchy works best."
                        : "Add context and a call-to-action."}
                    </div>
                    <span>{composerText.length} chars</span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {/* AI Suggestion Button */}
                    <button
                      type="button"
                      onClick={generateAISuggestion}
                      className="inline-flex items-center gap-2 rounded-2xl border border-[#6C43FF]/30 bg-gradient-to-r from-[#6C43FF]/10 to-[#8A63FF]/10 px-4 py-2 text-xs font-medium text-white transition hover:from-[#6C43FF]/20 hover:to-[#8A63FF]/20"
                    >
                      <Brain className="h-3.5 w-3.5 text-[#6C43FF]" />
                      AI Suggest
                    </button>

                    <button
                      type="button"
                      disabled={!composerText.trim() || isSaving}
                      onClick={() => void handleCompose("draft")}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/7 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      Save as draft
                    </button>
                    <button
                      type="button"
                      disabled={!composerText.trim() || isSaving}
                      onClick={() => void handleCompose("scheduleNow")}
                      className="inline-flex items-center gap-2 rounded-2xl border border-transparent bg-white px-4 py-2 text-xs font-semibold text-black shadow-[0_18px_45px_rgba(255,255,255,0.18)] transition hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      Queue for today
                    </button>
                  </div>

                  {/* AI Suggestion Display */}
                  {aiSuggestion && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-2xl border border-[#6C43FF]/30 bg-gradient-to-r from-[#6C43FF]/10 to-[#8A63FF]/10 backdrop-blur-sm"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-[#6C43FF]" />
                          <span className="text-sm font-medium text-white">AI Suggestion</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={applyAISuggestion}
                            className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] text-white text-xs font-medium"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => setAiSuggestion(null)}
                            className="px-3 py-1 rounded-lg bg-white/20 text-white text-xs font-medium"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                      <p className="text-white/80 text-sm">{aiSuggestion}</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: 0.12 }}
              className="flex min-h-[260px] flex-col gap-4 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/70 p-5 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.26em] text-white/50">Planner</p>
                  <h2 className="text-sm font-semibold text-white">Upcoming & drafts</h2>
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-1 items-center justify-center text-xs text-white/60">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading posts
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-xs text-white/60">
                  <Sparkles className="h-5 w-5 text-violet-300" />
                  <p>No posts yet. Draft something on the left and save it.</p>
                </div>
              ) : (
                <div className="flex flex-1 flex-col gap-4 overflow-hidden">
                  {(publishError || publishSuccess) && (
                    <div
                      className={`rounded-2xl border px-3 py-2 text-[11px] ${publishError
                        ? "border-rose-500/40 bg-rose-500/10 text-rose-100"
                        : "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
                        }`}
                    >
                      {publishError ?? publishSuccess}
                    </div>
                  )}
                  {upcoming.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-300/80">Scheduled</p>
                      <ul className="space-y-2 text-xs">
                        {upcoming.map((post) => (
                          <li
                            key={post.id}
                            className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/45 px-3 py-2.5"
                          >
                            <div className="space-y-1">
                              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                                {post.platform === "twitter" ? "Twitter" : "LinkedIn"}
                              </p>
                              <p className="line-clamp-2 text-xs text-white/85">{post.content}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-medium text-emerald-300">
                                Queued
                              </span>
                              <button
                                type="button"
                                onClick={() => void handlePublishPost(post.id)}
                                disabled={publishingPostId === post.id}
                                className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 px-2 py-1 text-[10px] font-semibold text-emerald-200 transition hover:border-emerald-300 disabled:opacity-60"
                              >
                                {publishingPostId === post.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Send className="h-3.5 w-3.5" />
                                )}
                                Post now
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {drafts.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/45">Drafts</p>
                      <ul className="space-y-2 text-xs">
                        {drafts.map((post) => (
                          <li
                            key={post.id}
                            className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/35 px-3 py-2.5"
                          >
                            <div className="space-y-1">
                              <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                                {post.platform === "twitter" ? "Twitter" : "LinkedIn"}
                              </p>
                              <p className="line-clamp-2 text-xs text-white/80">{post.content}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="rounded-full bg-white/6 px-2 py-1 text-[10px] font-medium text-white/75">
                                Draft
                              </span>
                              <button
                                type="button"
                                onClick={() => void handlePublishPost(post.id)}
                                disabled={publishingPostId === post.id}
                                className="inline-flex items-center gap-1 rounded-full border border-white/25 px-2 py-1 text-[10px] font-semibold text-white transition hover:border-white disabled:opacity-60"
                              >
                                {publishingPostId === post.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Send className="h-3 w-3" />
                                )}
                                Post now
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.section>
          </div>



          <div className="space-y-6">
            {/* AI Social Assistant */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.02 }}
              className="rounded-3xl border border-white/12 bg-white/[0.04] backdrop-blur-xl overflow-hidden"
            >
              <div className="p-5 border-b border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/55">AI Intelligence</p>
                    <h2 className="text-lg font-semibold text-white">Social Assistant</h2>
                  </div>
                  <button
                    onClick={() => setShowAIAssistant(!showAIAssistant)}
                    className="inline-flex items-center gap-1 rounded-full bg-[#6C43FF]/20 px-3 py-1 text-[11px] text-[#6C43FF] border border-[#6C43FF]/30"
                  >
                    <Brain className="h-3.5 w-3.5" />
                    {showAIAssistant ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showAIAssistant && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <AISocialAssistant />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="rounded-3xl border border-white/12 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/55">Hive autoposter</p>
                  <h2 className="text-lg font-semibold text-white">Generate & queue</h2>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/65">
                  <Wand2 className="h-3.5 w-3.5" />
                  {autoposterStatus === "running" ? "Running" : "Ready"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-xs text-white/80">
                {/* industry */}
                <input
                  className="rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-white focus:border-white/40 focus:outline-none"
                  placeholder="Industry"
                  value={autoposterInputs.industry}
                  onChange={(event) => setAutoposterInputs((prev) => ({ ...prev, industry: event.target.value }))}
                />
                {/* audience */}
                <input
                  className="rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-white focus:border-white/40 focus:outline-none"
                  placeholder="Audience"
                  value={autoposterInputs.audience}
                  onChange={(event) => setAutoposterInputs((prev) => ({ ...prev, audience: event.target.value }))}
                />
                {/* tone */}
                <input
                  className="rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-white focus:border-white/40 focus:outline-none"
                  placeholder="Tone (e.g. calm, bold)"
                  value={autoposterInputs.tone}
                  onChange={(event) => setAutoposterInputs((prev) => ({ ...prev, tone: event.target.value }))}
                />
                {/* mode + datetime */}
                <div className="grid gap-2 sm:grid-cols-2">
                  <select
                    className="rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-white focus:border-white/40 focus:outline-none"
                    value={autoposterInputs.publishMode}
                    onChange={(event) =>
                      setAutoposterInputs((prev) => ({
                        ...prev,
                        publishMode: event.target.value as AutoposterInputs["publishMode"],
                      }))
                    }
                  >
                    <option value="post">Post immediately</option>
                    <option value="schedule">Schedule</option>
                  </select>
                  <input
                    type="datetime-local"
                    className="rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-white focus:border-white/40 focus:outline-none"
                    value={autoposterInputs.publishAt}
                    disabled={autoposterInputs.publishMode !== "schedule"}
                    onChange={(event) => setAutoposterInputs((prev) => ({ ...prev, publishAt: event.target.value }))}
                  />
                </div>
                {/* trend */}
                <textarea
                  rows={3}
                  className="rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-white focus:border-white/40 focus:outline-none"
                  placeholder="Optional trend/topic to anchor"
                  value={autoposterInputs.trend ?? ""}
                  onChange={(event) => setAutoposterInputs((prev) => ({ ...prev, trend: event.target.value }))}
                />
              </div>

              <button
                type="button"
                disabled={autoposterStatus === "running"}
                onClick={handleAutoposterRun}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-transparent bg-white px-4 py-2 text-xs font-semibold text-black shadow-[0_18px_45px_rgba(255,255,255,0.18)] transition hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {autoposterStatus === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                Run autoposter
              </button>

              {autoposterError && (
                <p className="mt-3 text-[11px] text-rose-300/90">{autoposterError}</p>
              )}

              {autoposterOutput && (
                <div className="mt-4 rounded-2xl border border-white/12 bg-black/40 p-4 text-xs text-white/80">
                  <p className="mb-2 font-semibold text-white">Latest output</p>
                  <p className="whitespace-pre-wrap">{autoposterOutput}</p>
                  {autoposterRunId && <p className="mt-2 text-[11px] text-white/50">Run ID: {autoposterRunId}</p>}
                </div>
              )}
            </motion.section>
            <motion.section
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.1 }}
              className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6"
            >
              <div className="absolute -top-32 right-0 h-64 w-64 rounded-full bg-purple-600/20 blur-[120px]" />
              <div className="relative space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/55">Connections</p>
                    <h2 className="text-lg font-semibold text-white">Linked platforms</h2>
                  </div>
                  <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] text-white/60">
                    {connectionsLoading ? "Syncing…" : `${connections?.length ?? 0} linked`}
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl border border-white/12 bg-black/45 p-4 backdrop-blur">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1DA1F2]/15">
                          <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">Twitter / X</p>
                          {twitterAccount ? (
                            <p className="text-xs text-white/60">
                              Connected as {String(twitterAccount.metadata?.handle ?? "@account")}
                            </p>
                          ) : (
                            <p className="text-xs text-white/55">Connect your account to draft and approve posts.</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-2 sm:items-end">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${twitterAccount
                            ? "bg-emerald-500/20 text-emerald-200"
                            : "bg-white/8 text-white/70"
                            }`}
                        >
                          {twitterAccount ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                            </>
                          ) : (
                            <>
                              <Plug className="h-3.5 w-3.5" /> Not connected
                            </>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            window.location.href = "/api/oauth/twitter/start";
                          }}
                          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold transition ${twitterAccount
                            ? "border border-white/20 bg-white/[0.08] text-white hover:bg-white/[0.14]"
                            : "border border-transparent bg-[#1DA1F2] text-black hover:bg-[#33b0ff]"
                            }`}
                        >
                          {twitterAccount ? "Reconnect" : "Connect"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/12 bg-black/35 p-4 backdrop-blur">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                          <ShieldCheck className="h-5 w-5 text-white/75" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">Approval gate</p>
                          <p className="text-xs text-white/60">5 manual approvals unlock autopost. Keep reviewing drafts until the counter clears.</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-1 text-[11px] text-white/70 sm:items-end">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-300" /> Manual approvals still required
                        </span>
                        <span className="text-xs text-white/50">Auto-post unlock coming right after 5 approvals.</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {[0, 1, 2, 3, 4].map((step) => (
                        <div
                          // eslint-disable-next-line react/no-array-index-key
                          key={step}
                          className={`flex-1 rounded-2xl border border-white/10 px-3 py-2 text-center text-[11px] font-semibold transition ${step < 1 ? "bg-emerald-400/20 text-emerald-200" : "bg-white/6 text-white/60"
                            }`}
                        >
                          {step + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16 }}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-white/55">
                  <Sparkles className="h-4 w-4 text-cyan-200" />
                  Coming soon
                </div>
                <p className="text-sm text-white/70">
                  Trend analysis, collaborative approvals, and auto-post metrics will surface here. Hook in additional platforms as we expand the toolkit.
                </p>
              </div>
            </motion.section>
          </div>
        </div>

        {/* Cron Control Widget */}
        <CronControl />
      </div>
    </div>
  );
}
