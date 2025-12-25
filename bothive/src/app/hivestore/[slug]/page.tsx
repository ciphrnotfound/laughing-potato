"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  Check,
  Download,
  ExternalLink,
  Loader2,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap,
  MessageSquare,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useAppSession } from "@/lib/app-session-context";
import { useGlassAlert } from "@/components/ui/glass-alert";
import { useTheme } from "@/lib/theme-context";
import { supabase } from "@/lib/supabase";
import { cn, slugify } from "@/lib/utils";

// Types
type MarketplaceBotVersion = {
  id: string;
  bot_id: string;
  version: number;
  label?: string | null;
  description?: string | null;
  price?: number | null;
  installs_count?: number | null;
  rating?: number | null;
  created_at?: string | null;
  published_at?: string | null;
};

type BotReview = {
  id: string;
  bot_id: string;
  user_id: string;
  rating: number | null;
  comment: string | null;
  created_at: string | null;
  user?: { full_name: string | null; avatar_url: string | null };
};

type DetailedBot = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  downloads: number;
  rating: number;
  icon: string;
  skills: string[];
  curatedTags: string[];
  author: string;
  last_updated: string | null;
  created_at: string | null;
  latest_version: MarketplaceBotVersion | null;
  metadata?: Record<string, unknown> | null;
};

const FALLBACK_ICON = "/logo.svg";

// Utility functions
function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => `${item}`.trim().toLowerCase()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return [];
}

function safeNumber(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatInstallCount(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function formatPrice(price: number) {
  if (price <= 0) return "Free";
  return `₦${price.toLocaleString()}`;
}

// Fetch bot details
async function fetchBotDetail(identifier: string) {
  const selectColumns = `id, name, slug, description, price, metadata, default_version_id, capabilities, updated_at, created_at`;

  const bySlug = identifier
    ? await supabase.from("bots").select(selectColumns).eq("slug", identifier).maybeSingle()
    : { data: null, error: null };

  let botRow = bySlug.data;

  if (!botRow) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    if (isUUID) {
      const byId = await supabase.from("bots").select(selectColumns).eq("id", identifier).maybeSingle();
      botRow = byId.data ?? null;
    }
  }

  if (!botRow) return { bot: null, versions: [], reviews: [] };

  const metadata = (botRow.metadata as Record<string, unknown> | null) ?? {};
  const rawCategory = (metadata.category as string) ?? (metadata.primary_category as string) ?? "general";
  const rawSkills = botRow.capabilities ?? (metadata.capabilities as string[]) ?? (metadata.skills as string[]);
  const skills = parseStringList(rawSkills);
  if (skills.length === 0) skills.push("automation", "assist");

  const detail: DetailedBot = {
    id: botRow.id,
    name: botRow.name,
    slug: botRow.slug ?? slugify(botRow.name) ?? botRow.id,
    description: botRow.description ?? (metadata.description as string) ?? "No description provided.",
    category: rawCategory.toLowerCase(),
    price: safeNumber(botRow.price ?? metadata.price, 0),
    downloads: safeNumber(metadata.installs_count, 0),
    rating: safeNumber(metadata.rating, 0) || 4.8,
    icon: (metadata.icon_url as string) ?? FALLBACK_ICON,
    skills,
    curatedTags: parseStringList(metadata.curated_tags),
    author: (metadata.author as string) ?? "Bothive Studio",
    last_updated: botRow.updated_at ?? null,
    created_at: botRow.created_at ?? null,
    latest_version: null,
    metadata,
  };

  // Fetch versions
  const { data: versionRows } = await supabase
    .from("bot_versions")
    .select("id, bot_id, version, label, description, price, installs_count, rating, created_at, published_at")
    .eq("bot_id", botRow.id)
    .order("version", { ascending: false });

  const versions = (versionRows ?? []) as MarketplaceBotVersion[];
  detail.latest_version = versions[0] ?? null;

  // Fetch reviews
  let reviews: BotReview[] = [];
  try {
    const { data: reviewRows } = await supabase
      .from("bot_reviews")
      .select("id, rating, review_text, created_at, reviewer_id")
      .eq("bot_id", botRow.id)
      .order("created_at", { ascending: false })
      .limit(6);

    if (reviewRows) {
      reviews = reviewRows.map((r: any) => ({
        id: r.id,
        bot_id: botRow.id,
        user_id: r.reviewer_id || "unknown",
        rating: r.rating,
        comment: r.review_text,
        created_at: r.created_at,
        user: { full_name: "Community Member", avatar_url: null },
      }));
    }
  } catch (err) {
    console.warn("Reviews fetch failed:", err);
  }

  return { bot: detail, versions, reviews };
}

// DEMO BOT for fallback
const DEMO_BOT: DetailedBot = {
  id: "study-buddy-swarm",
  name: "Study Buddy Swarm",
  slug: "study-buddy-swarm",
  description: "Your ultimate multi-agent study companion. Includes Research Agent (finds YouTube tutorials, PDFs), Project Manager (creates Trello study boards), Scheduler (Pomodoro timer + calendar), and Tutor Agent (explains concepts, generates quizzes).",
  category: "education",
  price: 0,
  downloads: 28450,
  rating: 4.9,
  icon: "/logo.svg",
  skills: ["education", "learning", "youtube", "trello", "calendar", "quizzes"],
  curatedTags: ["trending", "featured"],
  author: "Bothive Labs",
  last_updated: new Date().toISOString(),
  created_at: new Date().toISOString(),
  latest_version: null,
  metadata: {
    features: [
      "Multi-agent architecture with 5 specialized agents",
      "YouTube video research and recommendations",
      "Trello integration for study planning",
      "Pomodoro timer with break reminders",
      "AI-powered quiz generation",
      "Spaced repetition scheduling",
    ],
  },
};

export default function HiveStoreDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const identifier = typeof params.slug === "string" ? params.slug : params.slug?.[0] ?? "";
  const { isAuthenticated, profile, loading: sessionLoading } = useAppSession();

  const [bot, setBot] = useState<DetailedBot | null>(null);
  const [versions, setVersions] = useState<MarketplaceBotVersion[]>([]);
  const [reviews, setReviews] = useState<BotReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);
  const { showAlert } = useGlassAlert();

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!identifier) {
        setError("Missing bot identifier.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await fetchBotDetail(identifier);
        if (!active) return;

        if (!result.bot) {
          // Use demo bot for demo slugs
          if (identifier === "study-buddy-swarm") {
            setBot(DEMO_BOT);
            setVersions([]);
            setReviews([]);
            setError(null);
          } else {
            setError("Bot not found. It may have been unpublished.");
            setBot(null);
          }
          return;
        }

        setBot(result.bot);
        setVersions(result.versions);
        setReviews(result.reviews);
        setError(null);
      } catch (err) {
        console.error("Failed to load bot:", err);
        if (active) {
          // Fallback to demo
          setBot(DEMO_BOT);
          setError(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => { active = false; };
  }, [identifier]);

  const isFree = useMemo(() => (bot?.price ?? 0) <= 0, [bot]);

  const handleInstall = useCallback(async () => {
    if (!bot) return;

    if (!isAuthenticated) {
      await showAlert("Identity Required", "Please initialize session to install cognitive agents.", "warning");
      router.push("/signin");
      return;
    }

    if (!isFree) {
      // Redirect to checkout for paid bots
      const targetSlug = bot.slug || slugify(bot.name) || bot.id;
      // Amount is sent in kobo (multiply by 100) to keep consistency with billing checkout
      router.push(`/hivestore/checkout?botId=${bot.id}&botName=${encodeURIComponent(bot.name)}&amount=${bot.price * 100}&slug=${targetSlug}&author=${encodeURIComponent(bot.author)}`);
      return;
    }

    // Free bot - install directly
    setInstalling(true);
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bot.name,
          description: bot.description,
          capabilities: bot.skills.length ? bot.skills : ["automation"],
          model: (bot.metadata?.model as string) || "gpt-4-turbo",
          source_bot_id: bot.id,
          system_prompt: (bot.metadata?.system_prompt as string) || `You are ${bot.name}, a helpful AI assistant.`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to install bot");
      }

      await showAlert("Deployment Successful", `${bot.name} has been integrated into your neural network.`, "success");
      router.push(`/dashboard/my-bots`);
    } catch (err: any) {
      await showAlert("Deployment Failure", err.message || "Installation handshake failed.", "error");
    } finally {
      setInstalling(false);
    }
  }, [bot, isAuthenticated, isFree, router]);

  const features = useMemo(() => {
    if (!bot?.metadata?.features) {
      return [
        "Instant deployment to your workspace",
        "Automatic updates and improvements",
        "24/7 availability",
        "Integration with popular tools",
      ];
    }
    return bot.metadata.features as string[];
  }, [bot]);

  if (loading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", isDark ? "bg-[#0a0a0a]" : "bg-[#fafafa]")}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className={cn("w-8 h-8 animate-spin", isDark ? "text-white/40" : "text-black/40")} />
          <p className={cn("text-sm", isDark ? "text-white/50" : "text-black/50")}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !bot) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", isDark ? "bg-[#0a0a0a]" : "bg-[#fafafa]")}>
        <div className="text-center max-w-md">
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6", isDark ? "bg-white/5" : "bg-black/5")}>
            <Bot className={cn("w-8 h-8", isDark ? "text-white/40" : "text-black/40")} />
          </div>
          <h2 className={cn("text-xl font-semibold mb-2", isDark ? "text-white" : "text-black")}>Bot Not Found</h2>
          <p className={cn("text-sm mb-6", isDark ? "text-white/50" : "text-black/50")}>{error || "This bot may have been unpublished."}</p>
          <Link
            href="/hivestore"
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all",
              isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen transition-colors", isDark ? "bg-[#0a0a0a]" : "bg-[#fafafa]")}>
      {/* Subtle gradient */}
      <div className={cn(
        "fixed inset-0 pointer-events-none",
        isDark
          ? "bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.05),transparent_50%)]"
          : "bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.03),transparent_50%)]"
      )} />

      <div className="relative max-w-5xl mx-auto px-6 py-12 lg:py-16">
        {/* Back Navigation */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-10">
          <Link
            href="/hivestore"
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium transition-colors",
              isDark ? "text-white/50 hover:text-white" : "text-black/50 hover:text-black"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            HiveStore
          </Link>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-16"
        >
          {/* Bot Icon */}
          <div className={cn(
            "w-28 h-28 lg:w-36 lg:h-36 rounded-3xl flex items-center justify-center flex-shrink-0 border",
            isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-black/[0.06] shadow-sm"
          )}>
            <Bot className={cn("w-14 h-14 lg:w-16 lg:h-16", isDark ? "text-violet-400" : "text-violet-600")} strokeWidth={1.5} />
          </div>

          {/* Bot Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {bot.curatedTags.includes("featured") && (
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium",
                  isDark ? "bg-violet-500/10 text-violet-400" : "bg-violet-50 text-violet-600"
                )}>
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Featured
                </span>
              )}
              <span className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                isDark ? "bg-white/5 text-white/60" : "bg-black/5 text-black/60"
              )}>
                {bot.category}
              </span>
            </div>

            <h1 className={cn("text-3xl lg:text-4xl font-bold tracking-tight mb-3", isDark ? "text-white" : "text-black")}>
              {bot.name}
            </h1>

            <div className={cn("flex flex-wrap items-center gap-4 text-sm mb-5", isDark ? "text-white/50" : "text-black/50")}>
              <span>by {bot.author}</span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                {bot.rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                {formatInstallCount(bot.downloads)} installs
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Updated {formatDate(bot.last_updated)}
              </span>
            </div>

            <p className={cn("text-base leading-relaxed max-w-2xl mb-8", isDark ? "text-white/70" : "text-black/70")}>
              {bot.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleInstall}
                disabled={installing}
                className={cn(
                  "flex items-center gap-2 px-8 py-3 rounded-full text-base font-medium transition-all",
                  "bg-gradient-to-r from-violet-600 to-purple-600 text-white",
                  "hover:from-violet-500 hover:to-purple-500 hover:shadow-lg hover:shadow-violet-500/25",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {installing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    {isFree ? "Install Free" : `Get for ${formatPrice(bot.price)}`}
                  </>
                )}
              </button>

              {!isFree && (
                <span className={cn("text-xs", isDark ? "text-white/40" : "text-black/40")}>
                  One-time payment • Lifetime access
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Skills/Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className={cn("text-xs font-medium uppercase tracking-wider mb-4", isDark ? "text-white/40" : "text-black/40")}>
            Capabilities
          </h2>
          <div className="flex flex-wrap gap-2">
            {bot.skills.map((skill) => (
              <span
                key={skill}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium capitalize",
                  isDark ? "bg-white/5 text-white/70" : "bg-black/5 text-black/70"
                )}
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn(
            "rounded-2xl border p-8 mb-16",
            isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-black/[0.06]"
          )}
        >
          <h2 className={cn("text-lg font-semibold mb-6", isDark ? "text-white" : "text-black")}>
            What's Included
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                  isDark ? "bg-emerald-500/10" : "bg-emerald-50"
                )}>
                  <Check className="w-3 h-3 text-emerald-500" />
                </div>
                <span className={cn("text-sm", isDark ? "text-white/70" : "text-black/70")}>{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust Signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid sm:grid-cols-3 gap-6 mb-16"
        >
          {[
            { icon: Shield, label: "Verified & Secure", desc: "All bots are reviewed for safety" },
            { icon: Zap, label: "Instant Deploy", desc: "One-click installation" },
            { icon: Users, label: "Community Trusted", desc: `${formatInstallCount(bot.downloads)}+ users` },
          ].map((item, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-4 p-5 rounded-xl border",
                isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-black/[0.06]"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                isDark ? "bg-violet-500/10" : "bg-violet-50"
              )}>
                <item.icon className={cn("w-5 h-5", isDark ? "text-violet-400" : "text-violet-600")} />
              </div>
              <div>
                <div className={cn("text-sm font-medium mb-0.5", isDark ? "text-white" : "text-black")}>{item.label}</div>
                <div className={cn("text-xs", isDark ? "text-white/50" : "text-black/50")}>{item.desc}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Reviews Preview */}
        {reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-black")}>
                Reviews ({reviews.length})
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {reviews.slice(0, 4).map((review) => (
                <div
                  key={review.id}
                  className={cn(
                    "p-5 rounded-xl border",
                    isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-black/[0.06]"
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3.5 h-3.5",
                            i < (review.rating ?? 5) ? "text-amber-400 fill-amber-400" : "text-zinc-300"
                          )}
                        />
                      ))}
                    </div>
                    <span className={cn("text-xs", isDark ? "text-white/40" : "text-black/40")}>
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  <p className={cn("text-sm leading-relaxed", isDark ? "text-white/70" : "text-black/70")}>
                    {review.comment || "Great bot, works exactly as expected!"}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
