"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Download,
  Filter,
  Globe2,
  Layers,
  Loader2,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Eye,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn, slugify } from "@/lib/utils";
import AmbientBackdrop from "@/components/AmbientBackdrop";
import { ProfessionalAlert } from "@/components/ui/glass-alert";
import { useAppSession } from "@/lib/app-session-context";

type AlertVariant = "success" | "error" | "info" | "warning";

type MarketplaceBot = {
  id: string;
  name: string;
  slug?: string | null;
  description: string | null;
  price: number | null;
  installs_count: number | null;
  rating: number | null;
  metadata?: Record<string, unknown> | null;
  default_version_id?: string | null;
  capabilities?: string[] | null;
  updated_at?: string | null;
  created_at?: string | null;
};

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
  author: string | null;
  rating: number | null;
  comment: string | null;
  created_at: string | null;
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
  latest_version: MarketplaceBotVersion | null;
  reviews: BotReview[];
  last_updated: string | null;
  created_at: string | null;
};

type AlertState = {
  variant: AlertVariant;
  title: string;
  message: string;
  autoClose?: number;
} | null;

type PulseMetric = {
  id: string;
  label: string;
  change: string;
  trend: "up" | "down";
  description: string;
};

const CURATION_FILTERS = [
  { id: "trending", label: "Trending now" },
  { id: "featured", label: "Featured" },
  { id: "new", label: "Fresh drops" },
] as const;

const CATEGORIES = ["all", "automation", "analytics", "development", "research", "support"] as const;

const HIGHLIGHT_COLLECTIONS = [
  {
    id: "ops",
    title: "Ops acceleration kit",
    description: "Automation-first copilots for revenue, ops, and onboarding rituals.",
    metric: "Avg 4.9 rating",
    range: "3-5 bots",
    icon: Layers,
    accentLight: "from-indigo-100/70 via-white/40 to-transparent",
    accentDark: "from-violet-600/25 via-transparent to-indigo-950/40",
  },
  {
    id: "global",
    title: "Global research lane",
    description: "Multilingual researchers with citation guardrails and live news taps.",
    metric: "+34% session depth",
    range: "4-6 bots",
    icon: Globe2,
    accentLight: "from-violet-200/60 via-white/30 to-transparent",
    accentDark: "from-fuchsia-600/20 via-transparent to-indigo-900/50",
  },
  {
    id: "trust",
    title: "Trustworthy assistants",
    description: "Compliant support agents with audit trails and fallback intents.",
    metric: "SOC2-ready",
    range: "2-3 bots",
    icon: ShieldCheck,
    accentLight: "from-purple-200/60 via-white/40 to-transparent",
    accentDark: "from-purple-700/20 via-transparent to-slate-900/45",
  },
] as const;

const CREATOR_SPOTLIGHTS = [
  {
    id: "neuron",
    studio: "Neuron Forge Labs",
    delta: "+312 installs",
    focus: "Ops copilots with sync automations and alerting rituals.",
    tags: ["automation", "ops"],
  },
  {
    id: "lumen",
    studio: "Lumen Research Collective",
    delta: "+188 watchlists",
    focus: "Research copilots with citation guardrails and audit trails.",
    tags: ["research", "analysis"],
  },
] as const;

const FALLBACK_ICON = "/logo.svg";

const STAGGER_CONTAINER: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.04,
    },
  },
};

const CARD_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

const SECTION_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

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

function priceLabel(bot: HiveStoreRecord) {
  const basePrice = safeNumber(bot.price, 0);
  const versionPrice = safeNumber(bot.latest_version?.price, basePrice);
  const effective = versionPrice || basePrice;
  if (effective <= 0) {
    return "Included";
  }
  if (effective < 5) {
    return "$4.99";
  }
  return `$${effective.toFixed(2)}`;
}

async function fetchMarketplaceData(): Promise<HiveStoreRecord[]> {
  const { data: botRows, error: botsError } = await supabase
    .from("bots")
    .select(
      `
        id,
        name,
        slug,
        description,
        price,
        metadata,
        default_version_id,
        capabilities,
        status,
        updated_at,
        created_at
      `
    )
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(120);

  if (botsError) {
    throw botsError;
  }

  const bots = botRows ?? [];
  const botIds = bots.map((bot) => bot.id);

  let versions: MarketplaceBotVersion[] = [];
  if (botIds.length) {
    const { data: versionRows, error: versionsError } = await supabase
      .from("bot_versions")
      .select("id, bot_id, version, label, description, price, installs_count, rating, created_at, published_at")
      .in("bot_id", botIds)
      .order("version", { ascending: false });

    if (versionsError && versionsError.code !== "PGRST116") {
      throw versionsError;
    }

    versions = versionRows ?? [];
  }

  let reviews: BotReview[] = [];
  if (botIds.length) {
    const { data: reviewRows, error: reviewsError } = await supabase
      .from("bot_reviews")
      .select("id, bot_id, author, rating, comment, created_at")
      .in("bot_id", botIds)
      .order("created_at", { ascending: false })
      .limit(Math.max(12, botIds.length * 3));

    if (reviewsError && reviewsError.code !== "PGRST116") {
      throw reviewsError;
    }

    reviews = reviewRows ?? [];
  }

  const latestVersionByBot = new Map<string, MarketplaceBotVersion>();
  for (const version of versions) {
    if (!latestVersionByBot.has(version.bot_id)) {
      latestVersionByBot.set(version.bot_id, version);
    }
  }

  const reviewsByBot = new Map<string, BotReview[]>();
  for (const review of reviews) {
    const list = reviewsByBot.get(review.bot_id) ?? [];
    if (list.length < 3) {
      list.push(review);
      reviewsByBot.set(review.bot_id, list);
    }
  }

  return bots.map((row) => {
    const metadata = (row.metadata as Record<string, unknown> | null) ?? {};
    const rawCategory =
      (metadata.category as string | undefined) ??
      (metadata.primary_category as string | undefined) ??
      "general";
    const normalizedCategory = rawCategory.toLowerCase();

    const rawSkills = row.capabilities ?? (metadata.capabilities as string[] | undefined) ?? (metadata.skills as string[] | undefined);
    const skills = parseStringList(rawSkills);
    if (skills.length === 0) {
      skills.push("automation", "assist");
    }

    const curatedTags = parseStringList(metadata.curated_tags);
    const downloads = safeNumber(metadata.installs_count, 0);
    const rating = safeNumber(metadata.rating, 0) || 4.8;
    const price = safeNumber(row.price ?? metadata.price, 0);
    const slug = row.slug ?? slugify(row.name) ?? row.id;
    const icon = (metadata.icon_url as string | undefined) ?? FALLBACK_ICON;
    const author = (metadata.author as string | undefined) ?? "Bothive Studio";
    const description = row.description ?? (metadata.description as string | undefined) ?? "No description provided yet.";

    return {
      id: row.id,
      name: row.name,
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
      latest_version: latestVersionByBot.get(row.id) ?? null,
      reviews: reviewsByBot.get(row.id) ?? [],
      last_updated: row.updated_at ?? null,
      created_at: row.created_at ?? null,
    } satisfies HiveStoreRecord;
  });
}

export default function HiveStorePage() {
  const router = useRouter();
  const { isAuthenticated, profile, loading: sessionLoading } = useAppSession();

  const [bots, setBots] = useState<HiveStoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("all");
  const [curation, setCuration] = useState<(typeof CURATION_FILTERS)[number]["id"]>(CURATION_FILTERS[0].id);
  const [heroId, setHeroId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchMarketplaceData();
        if (!active) return;
        setBots(data);
        setHeroId((current) => current ?? data[0]?.id ?? null);
        setError(null);
      } catch (err) {
        console.error("Failed to load Hive Store", err);
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load Hive Store data.");
          setAlert({
            variant: "error",
            title: "Marketplace unavailable",
            message: "We couldn’t reach Supabase. Refresh or try again later.",
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
  }, []);

  const curatedBuckets = useMemo(() => {
    const byInstalls = [...bots].sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0));
    const byRating = [...bots].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    const byFreshness = [...bots].sort((a, b) => {
      const left = isoDate(a.latest_version?.published_at ?? a.last_updated) ?? isoDate(a.created_at) ?? new Date(0);
      const right = isoDate(b.latest_version?.published_at ?? b.last_updated) ?? isoDate(b.created_at) ?? new Date(0);
      return right.getTime() - left.getTime();
    });

    return {
      trending: byInstalls,
      featured: byRating,
      new: byFreshness,
    } as Record<(typeof CURATION_FILTERS)[number]["id"], HiveStoreRecord[]>;
  }, [bots]);

  const curatedList = useMemo(() => curatedBuckets[curation] ?? bots, [curatedBuckets, curation, bots]);

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return curatedList.filter((bot) => {
      const categoryMatch = category === "all" || bot.category === category;
      if (!categoryMatch) {
        return false;
      }
      if (!query) {
        return true;
      }
      const haystack = [bot.name, bot.description, bot.author, bot.category, bot.skills.join(" "), bot.curatedTags.join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [curatedList, category, search]);

  useEffect(() => {
    if (!filteredAgents.length) {
      return;
    }
    setHeroId((current) => {
      if (current && filteredAgents.some((bot) => bot.id === current)) {
        return current;
      }
      return filteredAgents[0]?.id ?? current;
    });
  }, [filteredAgents]);

  const heroHighlight = useMemo(
    () => filteredAgents.find((bot) => bot.id === heroId) ?? filteredAgents[0] ?? curatedList[0] ?? null,
    [filteredAgents, heroId, curatedList]
  );

  const secondaryHighlights = useMemo(() => {
    if (!heroHighlight) return filteredAgents.slice(0, 2);
    return filteredAgents.filter((bot) => bot.id !== heroHighlight.id).slice(0, 2);
  }, [filteredAgents, heroHighlight]);

  const activeCuration = useMemo(
    () => CURATION_FILTERS.find((filter) => filter.id === curation)?.label ?? CURATION_FILTERS[0].label,
    [curation]
  );

  const insights = useMemo(() => {
    if (bots.length === 0) {
      return [
        { label: "Active bots", value: "—" },
        { label: "Total installs", value: "—" },
        { label: "Avg. rating", value: "—" },
      ];
    }
    const totalInstalls = bots.reduce((total, bot) => total + safeNumber(bot.downloads, 0), 0);
    const averageRating = bots.reduce((total, bot) => total + safeNumber(bot.rating, 0), 0) / bots.length;
    const contributorCount = new Set(bots.map((bot) => bot.author)).size;
    return [
      { label: "Active bots", value: bots.length.toString() },
      { label: "Total installs", value: formatInstallCount(totalInstalls) },
      { label: "Studios live", value: contributorCount.toString() },
      { label: "Avg. rating", value: averageRating.toFixed(1) },
    ];
  }, [bots]);

  const pulseMetrics = useMemo<PulseMetric[]>(() => {
    if (!bots.length) {
      return [
        { id: "adoption", label: "Adoption", change: "—", trend: "up", description: "Waiting for live data." },
      ];
    }
    const topPerformer = curatedBuckets.trending[0];
    const newest = curatedBuckets.new[0];
    const installGrowth = topPerformer ? `${formatInstallCount(topPerformer.downloads)} installs` : "Stable";
    return [
      {
        id: "install-velocity",
        label: "Install velocity",
        change: installGrowth,
        trend: "up",
        description: `${topPerformer?.name ?? "Bots"} leading this window.`,
      },
      {
        id: "freshness",
        label: "Fresh drops",
        change: newest?.name ? newest.name : "New arrivals",
        trend: "up",
        description: newest?.description?.slice(0, 72) ?? "Latest launches land here first.",
      },
      {
        id: "retention",
        label: "Retention",
        change: "94%",
        trend: "up",
        description: "Week-over-week teams keeping their installed bots active.",
      },
    ];
  }, [bots, curatedBuckets]);

  const liveIndicators = useMemo(() => {
    if (!bots.length) {
      return {
        watchers: "—",
        trending: "curation warming",
      };
    }
    const watchersBaseline = Math.max(bots.length * 42, 220);
    const trendingLane = curatedBuckets.trending[0]?.category ?? "automation";
    return {
      watchers: `${formatInstallCount(watchersBaseline)} observers`,
      trending: trendingLane,
    };
  }, [bots, curatedBuckets]);

  const handleInstall = useCallback(
    (bot: HiveStoreRecord, source: "hero" | "card") => {
      if (!isAuthenticated) {
        setAlert({
          variant: "warning",
          title: "Sign in to continue",
          message: "Install bots, manage payments, and sync workspaces after you sign in.",
          autoClose: 5200,
        });
        return;
      }

      setAlert({
        variant: "success",
        title: `${bot.name} ready to launch`,
        message: "Opening the detail view so you can confirm install & payment.",
        autoClose: 3800,
      });

      const targetSlug = bot.slug ?? slugify(bot.name) ?? bot.id;
      const target = `/hivestore/${targetSlug}`;

      setTimeout(() => {
        router.push(target);
      }, source === "hero" ? 240 : 120);
    },
    [isAuthenticated, router]
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#05060F] via-[#0B1021] to-[#05040F] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(114,92,255,0.22),transparent_60%),radial-gradient(circle_at_bottom,rgba(76,55,189,0.18),transparent_62%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(-120deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:64px_64px] opacity-25" />
        <div className="absolute -top-32 left-1/2 h-[24rem] w-[34rem] -translate-x-1/2 rounded-[45%] bg-[radial-gradient(circle_at_center,rgba(130,116,255,0.32),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-16rem] left-[-12rem] h-[24rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(142,128,255,0.22),transparent_68%)] blur-3xl" />
        <div className="absolute top-1/4 right-[-14rem] h-[22rem] w-[26rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(116,112,255,0.24),transparent_70%)] blur-3xl" />
      </div>
      <AmbientBackdrop className="opacity-70" maskClassName="[mask-image:radial-gradient(circle_at_center,transparent_25%,black_85%)]" />

      {alert && (
        <ProfessionalAlert
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          open
          autoClose={alert.autoClose}
          onClose={() => setAlert(null)}
        />
      )}

      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-20 pt-16 sm:px-8"
        initial="hidden"
        animate="show"
        variants={SECTION_VARIANTS}
      >
        <motion.header
          className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between"
          variants={SECTION_VARIANTS}
        >
          <div className="space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 self-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/70 lg:self-start">
              <Sparkles className="h-3.5 w-3.5" /> Hive Store
            </span>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
                Deploy AI copilots, ready to ship.
              </h1>
              <p className="mx-auto max-w-2xl text-base text-white/70 lg:mx-0">
                Discover curated bots built by the Bothive community. Install, subscribe, and compose workflows that feel
                like a minimalist app store—all powered by live Supabase data.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.28em] text-white/65 lg:justify-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <ArrowRight className="h-3.5 w-3.5" /> {bots.length ? `${bots.length} bots live` : "Syncing"}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <ShieldCheck className="h-3.5 w-3.5" /> Payments coming soon
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <Eye className="h-3.5 w-3.5" /> {liveIndicators.watchers}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <TrendingUp className="h-3.5 w-3.5" /> {liveIndicators.trending}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end lg:self-end">
            {sessionLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking session
              </div>
            ) : isAuthenticated && profile ? (
              <Link
                href="/dashboard"
                className="group flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 text-sm font-semibold">
                  {profile.fullName?.slice(0, 2).toUpperCase() ?? profile.email?.slice(0, 2).toUpperCase() ?? "BH"}
                </div>
                <div className="flex flex-col text-left text-xs uppercase tracking-[0.28em] text-white/70">
                  <span>{profile.fullName ?? profile.email ?? "Your account"}</span>
                  <span className="text-white/50">Manage installs</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/60" />
              </Link>
            ) : (
              <Link
                href="/signin"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.3em] text-white/70"
              >
                Sign in
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </motion.header>

        <motion.section
          className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
        >
          <motion.div
            className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-8 text-white shadow-[0_45px_100px_rgba(76,29,149,0.35)]"
            variants={CARD_VARIANTS}
          >
            <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-white/5" />
            {heroHighlight ? (
              <div className="relative flex h-full flex-col gap-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/70">
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-200" />
                    <span>{heroHighlight.category}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      <Download className="h-4 w-4" /> {formatInstallCount(heroHighlight.downloads)} installs
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      <Star className="h-4 w-4 text-indigo-200" fill="#c4b5fd" /> {heroHighlight.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-3">
                    <h2 className="text-3xl font-semibold text-white sm:text-[2.2rem]">{heroHighlight.name}</h2>
                    <p className="max-w-xl text-sm text-white/70">{heroHighlight.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {heroHighlight.skills.slice(0, 6).map((skill) => (
                        <span
                          key={`${heroHighlight.id}-${skill}`}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-[0.3em] text-white/70"
                        >
                          {skill.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <div className="relative h-24 w-24 overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-4 shadow-xl">
                      <Image
                        src={heroHighlight.icon || FALLBACK_ICON}
                        alt={`${heroHighlight.name} icon`}
                        fill
                        className="object-contain"
                        sizes="96px"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleInstall(heroHighlight, "hero")}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] px-5 py-3 text-sm font-semibold text-white shadow-[0_24px_65px_rgba(108,67,255,0.4)] transition hover:brightness-110 hover:-translate-y-0.5"
                  >
                    Install spotlight
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                  <span className="text-xs uppercase tracking-[0.3em] text-white/60">{priceLabel(heroHighlight)}</span>
                </div>
              </div>
            ) : (
              <div className="flex h-60 items-center justify-center text-white/40">
                {loading ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" /> Syncing spotlight
                  </div>
                ) : error ? (
                  <p>{error}</p>
                ) : (
                  <p>No spotlight available.</p>
                )}
              </div>
            )}
          </motion.div>

          <motion.div className="flex flex-col gap-4" variants={STAGGER_CONTAINER} initial="hidden" animate="show">
            {secondaryHighlights.map((bot) => (
              <motion.div
                key={bot.id}
                className="relative rounded-[26px] border border-white/10 bg-white/5 p-5 text-sm text-white/70 shadow-[0_28px_85px_rgba(15,23,42,0.28)] transition hover:-translate-y-1"
                variants={CARD_VARIANTS}
              >
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-white/50">
                  <span>{bot.category}</span>
                  <span>{bot.rating.toFixed(1)}</span>
                </div>
                <div className="mt-3 space-y-2">
                  <h3 className="text-lg font-semibold text-white">{bot.name}</h3>
                  <p className="line-clamp-3 text-white/70">{bot.description}</p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-white/60">
                  <span>{priceLabel(bot)}</span>
                  <button
                    type="button"
                    onClick={() => handleInstall(bot, "hero")}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 uppercase tracking-[0.3em] text-white/75 transition hover:border-white/60 hover:text-white"
                  >
                    Get
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
          <motion.div
            className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_32px_85px_rgba(15,23,42,0.28)]"
            variants={CARD_VARIANTS}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search bots, studios, or workflows"
                className="w-full rounded-2xl border border-white/12 bg-white/10 px-12 py-3 text-sm text-white placeholder:text-white/40 backdrop-blur focus:border-[#6C43FF]/50 focus:outline-none focus:ring-2 focus:ring-[#6C43FF1f]"
              />
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.32em] text-white/60">Browse curations</p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-white/60">
                    <Filter className="h-3.5 w-3.5" />
                    {activeCuration}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CURATION_FILTERS.map((filter) => {
                    const isActive = curation === filter.id;
                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setCuration(filter.id)}
                        className={cn(
                          "rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] transition",
                          isActive
                            ? "bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] text-white shadow-[0_12px_35px_rgba(108,67,255,0.35)]"
                            : "border border-white/15 text-white/70 hover:border-white/40 hover:text-white"
                        )}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-white/60">Categories</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const isActive = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={cn(
                          "rounded-full px-4 py-1.5 text-[11px] tracking-[0.24em] transition",
                          isActive
                            ? "bg-gradient-to-r from-[#6C43FF] via-[#7A54FF] to-[#8A63FF] text-white shadow-[0_12px_30px_rgba(108,67,255,0.28)]"
                            : "border border-white/15 text-white/70 hover:border-white/40 hover:text-white"
                        )}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {insights.map((insight) => (
                  <div
                    key={insight.label}
                    className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-xs uppercase tracking-[0.28em] text-white/60"
                  >
                    <span className="block text-white/40">{insight.label}</span>
                    <span className="mt-1 block text-sm font-semibold text-white/90">{insight.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.aside
            className="space-y-4"
            variants={STAGGER_CONTAINER}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div className="rounded-[26px] border border-white/10 bg-white/5 p-4 text-sm text-white/70 shadow-[0_24px_75px_rgba(15,23,42,0.28)]" variants={CARD_VARIANTS}>
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
                <span>Pulse monitor</span>
                <Play className="h-4 w-4" />
              </div>
              <div className="mt-3 space-y-3">
                {pulseMetrics.map((metric) => (
                  <div key={metric.id} className="rounded-xl border border-white/10 bg-white/10 px-3 py-2">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/60">
                      <span>{metric.label}</span>
                      <span className={metric.trend === "down" ? "text-rose-300" : "text-emerald-300"}>{metric.change}</span>
                    </div>
                    <p className="mt-1 text-[13px] text-white/60">{metric.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div className="rounded-[26px] border border-white/10 bg-white/5 p-4 text-sm text-white/70 shadow-[0_24px_75px_rgba(15,23,42,0.28)]" variants={CARD_VARIANTS}>
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
                <span>Creator spotlights</span>
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <div className="mt-3 space-y-3">
                {CREATOR_SPOTLIGHTS.map((spotlight) => (
                  <div key={spotlight.id} className="rounded-xl border border-white/10 bg-white/10 p-3">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/60">
                      <span>{spotlight.studio}</span>
                      <span>{spotlight.delta}</span>
                    </div>
                    <p className="mt-2 text-[13px] text-white/60">{spotlight.focus}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.26em] text-white/50">
                      {spotlight.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-white/15 px-2.5 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.aside>
        </section>

        <motion.section
          className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3"
          variants={STAGGER_CONTAINER}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {filteredAgents.map((bot) => (
            <motion.div
              key={bot.id}
              className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 text-white/70 shadow-[0_32px_90px_rgba(15,23,42,0.32)]"
              variants={CARD_VARIANTS}
            >
              <div className="relative flex h-full flex-col gap-5">
                <span className="text-[10px] uppercase tracking-[0.35em] text-white/50">{activeCuration}</span>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/60">
                      {bot.category}
                    </div>
                    <h4 className="text-xl font-semibold text-white">{bot.name}</h4>
                    <p className="mt-1 text-sm text-white/60">{bot.author}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-sm text-white/70">
                    <Star className="h-4 w-4 text-indigo-200" fill="#c4b5fd" />
                    {bot.rating.toFixed(1)}
                  </div>
                </div>

                <p className="line-clamp-3 text-sm text-white/60">{bot.description}</p>

                <div className="flex flex-wrap gap-2 text-xs">
                  {bot.skills.slice(0, 4).map((skill, index) => (
                    <span
                      key={`${bot.id}-skill-${index}`}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-white/60"
                    >
                      {skill.replace(/_/g, " ")}
                    </span>
                  ))}
                  {bot.skills.length > 4 && (
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-white/60">
                      +{bot.skills.length - 4}
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-4 rounded-2xl border border-white/12 bg-white/10 px-4 py-3 text-sm text-white/70 backdrop-blur">
                  <span className="inline-flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    {formatInstallCount(bot.downloads)}
                  </span>
                  <span className={priceLabel(bot) === "Included" ? "text-indigo-200" : "text-white"}>{priceLabel(bot)}</span>
                  <button
                    type="button"
                    onClick={() => handleInstall(bot, "card")}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-white shadow-[0_12px_30px_rgba(108,67,255,0.35)] hover:brightness-110"
                  >
                    Install
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.section>

        {!loading && filteredAgents.length === 0 && (
          <div className="mt-10 rounded-[32px] border border-white/10 bg-white/10 py-16 text-center text-white/60">
            <p>No bots match your filters yet. Adjust your search or check back tomorrow for fresh drops.</p>
          </div>
        )}

        <footer className="mt-16 rounded-[28px] border border-white/10 bg-white/10 p-6 text-white/70 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
          <div className="flex flex-col gap-5 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-white">Ready to launch your own listing?</h4>
              <p className="mt-1 max-w-xl text-white/60">
                Complete the listing checklist inside the builder, submit for review, and go live in under 24 hours. We’ll keep your analytics front and center here in the Hive Store.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/builder?section=store"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-semibold text-white/80 transition hover:-translate-y-0.5 hover:border-white/40 hover:text-white"
              >
                Open listing toolkit
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs/hivelang"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 font-semibold text-slate-900 shadow hover:-translate-y-0.5"
              >
                Review docs
              </Link>
            </div>
          </div>
        </footer>
      </motion.div>
    </main>
  );
}
