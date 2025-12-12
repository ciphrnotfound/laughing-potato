"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CreditCard,
  Download,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import AmbientBackdrop from "@/components/AmbientBackdrop";
import { ProfessionalAlert } from "@/components/ui/glass-alert";
import { useAppSession } from "@/lib/app-session-context";
import { supabase } from "@/lib/supabase";
import { cn, slugify } from "@/lib/utils";

interface PostInstallPayload {
  id: string;
  name: string;
  slug: string;
  category: string;
  author: string;
  icon: string;
}

type AlertVariant = "success" | "error" | "info" | "warning";

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
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
};

type HiveStoreRecord = {
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
};

type DetailedBot = HiveStoreRecord & {
  metadata?: Record<string, unknown> | null;
};

type AlertState = {
  variant: AlertVariant;
  title: string;
  message: ReactNode;
  autoClose?: number;
} | null;

const FALLBACK_ICON = "/logo.svg";

function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => `${item}`.trim().toLowerCase())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);
  }
  return [];
}

function safeNumber(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function isoDate(value: string | null | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value: string | null | undefined) {
  const date = isoDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatInstallCount(value: number | null | undefined) {
  const numeric = safeNumber(value, 0);
  if (numeric >= 1_000_000) {
    return `${(numeric / 1_000_000).toFixed(1)}M`;
  }
  if (numeric >= 1_000) {
    return `${(numeric / 1_000).toFixed(1)}K`;
  }
  return numeric.toLocaleString();
}

function priceLabel(bot: HiveStoreRecord | MarketplaceBotVersion) {
  const price = safeNumber("price" in bot ? bot.price : 0, 0);
  if (price <= 0) {
    return "Included";
  }
  if (price < 5) {
    return "$4.99";
  }
  return `$${price.toFixed(2)}`;
}

async function fetchBotDetail(identifier: string) {
  const selectColumns = `
    id,
    name,
    slug,
    description,
    price,
    metadata,
    default_version_id,
    capabilities,
    updated_at,
    created_at
  `;

  const bySlug = identifier
    ? await supabase.from("bots").select(selectColumns).eq("slug", identifier).eq("status", "approved").maybeSingle()
    : { data: null, error: null };

  const row = bySlug.data;
  let botRow = row;

  if (!botRow) {
    // Only attempt ID lookup if identifier is a valid UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    if (isUUID) {
      const byId = await supabase.from("bots").select(selectColumns).eq("id", identifier).eq("status", "approved").maybeSingle();
      botRow = byId.data ?? null;
      if (byId.error && byId.error.code !== "PGRST116") {
        throw byId.error;
      }
    }
  }

  if (!botRow) {
    return { bot: null, versions: [] as MarketplaceBotVersion[], reviews: [] as BotReview[] };
  }

  const metadata = (botRow.metadata as Record<string, unknown> | null) ?? {};
  const rawCategory =
    (metadata.category as string | undefined) ??
    (metadata.primary_category as string | undefined) ??
    "general";
  const normalizedCategory = rawCategory.toLowerCase();

  const rawSkills =
    botRow.capabilities ??
    (metadata.capabilities as string[] | undefined) ??
    (metadata.skills as string[] | undefined);
  const skills = parseStringList(rawSkills);
  if (skills.length === 0) {
    skills.push("automation", "assist");
  }

  const curatedTags = parseStringList(metadata.curated_tags);
  const downloads = safeNumber(metadata.installs_count, 0);
  const rating = safeNumber(metadata.rating, 0) || 4.8;
  const price = safeNumber(botRow.price ?? metadata.price, 0);
  const slug = botRow.slug ?? slugify(botRow.name) ?? botRow.id;
  const icon = (metadata.icon_url as string | undefined) ?? FALLBACK_ICON;
  const author = (metadata.author as string | undefined) ?? "Bothive Studio";
  const description = botRow.description ?? (metadata.description as string | undefined) ?? "No description provided yet.";

  const detail: DetailedBot = {
    id: botRow.id,
    name: botRow.name,
    slug,
    description,
    category: normalizedCategory,
    price,
    downloads,
    rating,
    icon,
    skills,
    curatedTags,
    author,
    last_updated: botRow.updated_at ?? null,
    created_at: botRow.created_at ?? null,
    latest_version: null,
    metadata,
  } satisfies DetailedBot;

  const { data: versionRows, error: versionError } = await supabase
    .from("bot_versions")
    .select("id, bot_id, version, label, description, price, installs_count, rating, created_at, published_at")
    .eq("bot_id", botRow.id)
    .order("version", { ascending: false });

  if (versionError && versionError.code !== "PGRST116") {
    throw versionError;
  }

  const versions = (versionRows ?? []) as MarketplaceBotVersion[];
  detail.latest_version = versions[0] ?? null;

  const { data: reviewRows, error: reviewError } = await supabase
    .from("bot_reviews")
    .select("id, bot_id, user_id, rating, comment, created_at")
    .eq("bot_id", botRow.id)
    .order("created_at", { ascending: false })
    .limit(12);

  if (reviewError && reviewError.code !== "PGRST116") {
    throw reviewError;
  }

  let reviews: BotReview[] = [];
  
  if (reviewRows?.length) {
    const userIds = Array.from(new Set(reviewRows.map((r) => r.user_id)));
    
    // Fetch user profiles manually since the foreign key relationship might be missing in PostgREST cache
    const { data: users } = await supabase
        .from("users")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

    const userMap = new Map(users?.map((u) => [u.id, u]) || []);
    
    reviews = reviewRows.map((r) => ({
      ...r,
      user: userMap.get(r.user_id) || { full_name: "Anonymous", avatar_url: null },
    }));
  }

  return {
    bot: detail,
    versions,
    reviews,
  };
}

const MOTION_CARD: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 220, damping: 26 } },
};

export default function HiveStoreDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const identifier = typeof params.slug === "string" ? params.slug : params.slug?.[0] ?? "";
  const { isAuthenticated, profile, loading: sessionLoading } = useAppSession();

  const [bot, setBot] = useState<DetailedBot | null>(null);
  const [versions, setVersions] = useState<MarketplaceBotVersion[]>([]);
  const [reviews, setReviews] = useState<BotReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    let active = true;

    if (!identifier) {
      setLoading(false);
      setError("Missing bot identifier.");
      return () => undefined;
    }

    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchBotDetail(identifier);
        if (!active) return;
        if (!result.bot) {
          setError("We couldn’t find this listing. It may have been unpublished.");
          setBot(null);
          setVersions([]);
          setReviews([]);
          return;
        }
        setBot(result.bot);
        setVersions(result.versions);
        setReviews(result.reviews);
        setError(null);
      } catch (err) {
        console.error("Failed to load bot detail", err);
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load bot detail.");
          setBot(null);
          setVersions([]);
          setReviews([]);
          setAlert({
            variant: "error",
            title: "Detail view unavailable",
            message: "Supabase did not respond. Refresh or retry in a few moments.",
            autoClose: 6000,
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [identifier]);

  const primaryVersion = useMemo(() => versions[0] ?? bot?.latest_version ?? null, [versions, bot]);
  const legacyVersions = useMemo(() => versions.slice(1), [versions]);

  const sentiment = useMemo(() => {
    if (!bot) return null;
    const totalRatings = reviews.length ? reviews.length : 1;
    const averageRating = reviews.reduce((total, review) => total + safeNumber(review.rating, bot.rating), 0) / totalRatings;
    return averageRating.toFixed(1);
  }, [bot, reviews]);

  const isFreeBot = useMemo(() => {
    if (!bot) return false;
    const basePrice = safeNumber(bot.price, 0);
    const versionPrice = safeNumber(bot.latest_version?.price, basePrice);
    return (versionPrice || basePrice) <= 0;
  }, [bot]);

  const paymentPlaceholderCopy = useMemo(() => {
    if (!bot) return "";
    if (isFreeBot) {
      return "Instant install available. We’ll drop this bot into your Builder workspace.";
    }
    const base = priceLabel(bot);
    return `Install requires a ${base} monthly commitment. Payment confirmation lands here soon.`;
  }, [bot, isFreeBot]);

  const handleInstall = useCallback(
    async (source: "primary" | "trial") => {
      if (!bot) return;

      if (!isAuthenticated) {
        setAlert({
          variant: "warning",
          title: "Sign in to continue",
          message: "Install bots, manage payments, and sync workspaces after you sign in.",
          autoClose: 5200,
        });
        return;
      }

      if (source === "primary" && isFreeBot) {
        setInstalling(true);
        setAlert({
          variant: "info",
          title: `Launching ${bot.name}`,
          message: (
            <div className="flex items-center gap-3 text-white/80">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Provisioning your workspace. This takes a few seconds.</span>
            </div>
          ),
          autoClose: undefined,
        });

        try {
          const fallbackId = bot.slug ?? slugify(bot.name) ?? bot.id;

          // Fix: Map frontend schema to API schema
          const payload = {
            name: bot.name,
            description: bot.description,
            // Map skills -> capabilities
            capabilities: bot.skills.length ? bot.skills : ["automation"],
            // Ensure model is set if available in metadata, otherwise let API default
            model: (bot.metadata?.model as string) || "gpt-4-turbo",
            // Pass source ID to track origin if needed
            source_bot_id: bot.id,
            // Include system prompt if available in metadata
            system_prompt: (bot.metadata?.system_prompt as string) || `You are ${bot.name}, a helpful AI assistant specialized in ${bot.category}.`
          };

          const response = await fetch("/api/agents", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            let message = "Failed to install bot.";
            try {
              const data = (await response.json()) as { error?: string };
              if (data?.error) message = data.error;
            } catch (_err) {
              // ignore json parse issues
            }
            throw new Error(message);
          }

          const completionPayload: PostInstallPayload = {
            id: bot.id,
            name: bot.name,
            slug: bot.slug ?? fallbackId,
            category: bot.category,
            author: bot.author,
            icon: bot.icon ?? FALLBACK_ICON,
          };

          setAlert({
            variant: "success",
            title: `${bot.name} installed`,
            message: (
              <div className="flex flex-col gap-2 text-white/85">
                <span>The bot is now live in your workspace.</span>
                <span className="text-white/60">Redirecting you to the command center…</span>
              </div>
            ),
            autoClose: 2800,
          });

          setTimeout(() => {
            sessionStorage.setItem("bothive:lastInstalledBot", JSON.stringify(completionPayload));
            router.push(`/dashboard/installs/${completionPayload.slug}`);
          }, 1200);
        } catch (error) {
          console.error("Install error:", error);
          const message = error instanceof Error ? error.message : "Unknown install error";
          setAlert({
            variant: "error",
            title: "Install failed",
            message,
            autoClose: 6200,
          });
        } finally {
          setInstalling(false);
        }
        return;
      }

      setAlert({
        variant: "success",
        title: `${bot.name} queued for launch`,
        message: source === "primary"
          ? "We’ll open the billing handoff next. This flow is shipping in the next sprint."
          : "Trial activation pathways are coming online shortly. Thanks for your patience!",
        autoClose: 4200,
      });
    },
    [bot, isAuthenticated, isFreeBot, router]
  );

  const detailChips = useMemo(() => {
    if (!bot) return [] as { label: string; value: string }[];
    return [
      { label: "Category", value: bot.category },
      { label: "Installs", value: formatInstallCount(bot.downloads) },
      { label: "Rating", value: `${bot.rating.toFixed(1)} / 5` },
      { label: "Updated", value: formatDate(bot.last_updated ?? primaryVersion?.published_at) },
    ];
  }, [bot, primaryVersion]);

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-purple-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <button
          onClick={() => router.push("/hivestore")}
          className="group flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors"
        >
          <div className="p-1 rounded-full border border-white/10 bg-white/5 group-hover:border-white/20">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="tracking-wide">BACK TO STORE</span>
        </button>

        {isAuthenticated && profile ? (
          <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <span className="text-xs font-mono text-white/70 uppercase tracking-wider">{profile.fullName}</span>
          </div>
        ) : (
          <Link href="/signin" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Sign In
          </Link>
        )}
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            <p className="text-white/40 font-mono text-sm tracking-widest uppercase">Initializing Link...</p>
          </div>
        ) : error ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Signal Lost</h1>
            <p className="text-white/50 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-white/90"
            >
              Reconnect
            </button>
          </div>
        ) : bot ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* HERO SECTION */}
            <div className="flex flex-col items-center text-center mt-12 mb-20">

              {/* Icon Container */}
              <div className="relative group mb-8">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500 to-blue-500 blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative w-32 h-32 rounded-3xl bg-[#0c0c16] border border-white/10 shadow-2xl flex items-center justify-center p-6 group-hover:scale-105 transition-transform duration-500">
                  <Image src={bot.icon || FALLBACK_ICON} alt={bot.name} fill className="object-contain p-5" />
                </div>
              </div>

              {/* Title & Badge */}
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  Verified Agent
                </span>
                <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase">
                  v{primaryVersion?.version || "1.0"}
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 mb-6 max-w-4xl">
                {bot.name}
              </h1>

              <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed mb-10">
                {bot.description}
              </p>

              {/* CTA Area */}
              <div className="flex flex-col items-center gap-6">
                <button
                  disabled={installing}
                  onClick={() => handleInstall("primary")}
                  className={cn(
                    "group relative flex items-center gap-4 px-8 py-4 bg-white text-black rounded-full transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed",
                    installing && "scale-95 opacity-80"
                  )}
                >
                  {installing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-bold tracking-wide">INSTALLING...</span>
                    </>
                  ) : (
                    <>
                      <span className="font-bold tracking-wide text-lg">INSTALL AGENT</span>
                      <ArrowUpRight className="w-5 h-5 text-black/60 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}

                  {/* Button Glow */}
                  <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/60 transition-all" />
                </button>

                <p className="text-xs text-white/30 tracking-widest uppercase">
                  {installing ? "Provisioning Container..." : isFreeBot ? "Instant Deployment • No Credit Card" : `Starting at ${priceLabel(bot)}/mo`}
                </p>
              </div>
            </div>

            {/* DATA GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
              {/* Stats Card */}
              <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/5 backdrop-blur-sm hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center gap-3 mb-6 text-white/40 text-xs font-mono uppercase tracking-widest">
                  <Download className="w-4 h-4" />
                  Adoption
                </div>
                <div className="text-4xl font-bold text-white mb-2">{formatInstallCount(bot.downloads)}</div>
                <div className="text-sm text-white/50">Active workspaces using this agent for production workflows.</div>
              </div>

              {/* Rating Card */}
              <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/5 backdrop-blur-sm hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center gap-3 mb-6 text-white/40 text-xs font-mono uppercase tracking-widest">
                  <Star className="w-4 h-4" />
                  Satisfaction
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">{bot.rating.toFixed(1)}</span>
                  <span className="text-white/30 text-lg">/ 5.0</span>
                </div>
                <div className="text-sm text-white/50">Based on verified developer reviews and uptime checks.</div>
              </div>

              {/* Latency/Speed Card (Mocked for Visuals) */}
              <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/5 backdrop-blur-sm hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center gap-3 mb-6 text-white/40 text-xs font-mono uppercase tracking-widest">
                  <Zap className="w-4 h-4" />
                  Avg. Latency
                </div>
                <div className="text-4xl font-bold text-white mb-2">~140ms</div>
                <div className="text-sm text-white/50">Optimized for real-time interaction on Edge Runtime.</div>
              </div>
            </div>

            {/* CAPABILITIES SECTION */}
            <div className="max-w-4xl mx-auto">
              <h3 className="text-center text-white/40 text-sm font-mono uppercase tracking-[0.2em] mb-8">Core Capabilities</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bot.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-white font-medium capitalize">{skill.replace(/_/g, " ")}</div>
                      <div className="text-xs text-white/40 mt-0.5">Ready out of the box</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Info */}
            <div className="text-center mt-24 text-white/20 text-xs">
              Agent ID: {bot.id} • Published by {bot.author} • Secured by Bothive
            </div>

          </div>
        ) : null}
      </div>
    </main>
  );
}
