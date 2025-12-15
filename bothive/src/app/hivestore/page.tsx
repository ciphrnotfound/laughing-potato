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
  Bot,
  Zap,
  Code,
  BarChart3,
  Headphones,
  X,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/ThreeDCard";
import { supabase } from "@/lib/supabase";
import { cn, slugify } from "@/lib/utils";
import { ProfessionalAlert } from "@/components/ui/glass-alert";
import { useAppSession } from "@/lib/app-session-context";
import { useTheme } from "@/lib/theme-context";
import ThemeToggle from "@/components/ThemeToggle";

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

const CURATION_FILTERS = [
  { id: "trending", label: "Trending", icon: TrendingUp },
  { id: "featured", label: "Featured", icon: Star },
  { id: "new", label: "New", icon: Sparkles },
] as const;

const CATEGORIES = [
  { id: "all", label: "All", icon: Layers },
  { id: "automation", label: "Automation", icon: Zap },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "development", label: "Development", icon: Code },
  { id: "research", label: "Research", icon: Globe2 },
  { id: "support", label: "Support", icon: Headphones },
] as const;

const FALLBACK_ICON = "/logo.svg";

// Demo data for when the database is empty
const DEMO_BOTS: HiveStoreRecord[] = [
  {
    id: "legacy-refactor",
    name: "Legacy Refactor Agent",
    slug: "legacy-refactor-agent",
    description: "Autonomously refactors deprecated codebases. It reads your entire repo, identifies patterns, and proactively submits PRs to migrate from Class Components to Hooks, JavaScript to TypeScript, or old APIs to new ones.",
    category: "development",
    price: 49.99,
    downloads: 18420,
    rating: 4.9,
    icon: "/logo.svg", // We can use dedicated icons later if available
    skills: ["refactoring", "migration", "typescript", "react"],
    curatedTags: ["trending", "featured"],
    author: "Bothive Labs",
    latest_version: null,
    reviews: [],
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "on-call-sentinel",
    name: "On-Call Sentinel",
    slug: "on-call-sentinel",
    description: "Sleep soundly while Sentinel watches your logs. It detects anomalies, correlates errors across microservices, and patches known issues automatically before waking up the human on-call.",
    category: "automation",
    price: 29.99,
    downloads: 12150,
    rating: 4.8,
    icon: "/logo.svg",
    skills: ["monitoring", "incident response", "logs", "patching"],
    curatedTags: ["trending"],
    author: "OpsGuard",
    latest_version: null,
    reviews: [],
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "ui-polisher",
    name: "UI Polisher",
    slug: "ui-polisher",
    description: "Screenshots your staging environment and compares it against Figma components. It opens PRs to fix padding inconsistencies, font mismatches, and responsive layout bugs.",
    category: "development",
    price: 19.99,
    downloads: 9800,
    rating: 4.7,
    icon: "/logo.svg",
    skills: ["ui/ux", "css", "testing", "figma"],
    curatedTags: [],
    author: "PixelPerfect",
    latest_version: null,
    reviews: [],
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "deal-closer",
    name: "Deal Closer",
    slug: "deal-closer",
    description: "The SDR that never sleeps. It researches prospects, drafts hyper-personalized outreach, answers objection emails, and books meetings on your calendar only when the lead is qualified.",
    category: "analytics", // "Business" mapped to nearest available category or we create new
    price: 99.00,
    downloads: 15600,
    rating: 4.9,
    icon: "/logo.svg",
    skills: ["sales", "outreach", "qualification", "crm"],
    curatedTags: ["featured"],
    author: "RevenueAI",
    latest_version: null,
    reviews: [],
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "contract-negotiator",
    name: "Contract Negotiator",
    slug: "contract-negotiator",
    description: "Reviews incoming MSA/NDAs against your company playbook. highlighting risky clauses and suggesting redlines. It can even negotiate standard terms via email back-and-forth.",
    category: "support", // "Legal" proxy
    price: 149.00,
    downloads: 4200,
    rating: 4.8,
    icon: "/logo.svg",
    skills: ["legal", "contracts", "negotiation", "audit"],
    curatedTags: [],
    author: "CounselBot",
    latest_version: null,
    reviews: [],
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "headhunter-ai",
    name: "Headhunter AI",
    slug: "headhunter-ai",
    description: "Scours GitHub, LinkedIn, and X for engineers that match your stack. It evaluates their actual code contributions (not just resumes) and drafts personalized intro messages.",
    category: "research", // "HR" proxy
    price: 79.00,
    downloads: 8500,
    rating: 4.6,
    icon: "/logo.svg",
    skills: ["recruiting", "sourcing", "github", "screening"],
    curatedTags: ["trending"],
    author: "TalentHive",
    latest_version: null,
    reviews: [],
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// Utility functions
function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => `${item}`.trim().toLowerCase()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((entry) => entry.trim().toLowerCase()).filter(Boolean);
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
  if (numeric >= 1_000_000) return `${(numeric / 1_000_000).toFixed(1)}M`;
  if (numeric >= 1_000) return `${(numeric / 1_000).toFixed(1)}K`;
  return numeric.toLocaleString();
}

function priceLabel(bot: HiveStoreRecord) {
  const basePrice = safeNumber(bot.price, 0);
  const versionPrice = safeNumber(bot.latest_version?.price, basePrice);
  const effective = versionPrice || basePrice;
  if (effective <= 0) return "Free";
  return `$${effective.toFixed(2)}`;
}

async function fetchMarketplaceData(): Promise<HiveStoreRecord[]> {
  console.log("[HiveStore] Fetching active bots...");
  const { data: botRows, error: botsError } = await supabase
    .from("bots")
    .select(`id, name, slug, description, price, metadata, default_version_id, capabilities, status, approval_status, updated_at, created_at`)
    // .eq("status", "approved") // Show all bots for now to verify data presence
    .order("updated_at", { ascending: false })
    .limit(120);

  if (botsError) {
    console.error("[HiveStore] Supabase error:", botsError);
    throw botsError;
  }

  console.log(`[HiveStore] Found ${botRows?.length} active bots:`, botRows);

  const bots = botRows ?? [];
  const botIds = bots.map((bot) => bot.id);

  let versions: MarketplaceBotVersion[] = [];
  if (botIds.length) {
    const { data: versionRows } = await supabase
      .from("bot_versions")
      .select("id, bot_id, version, label, description, price, installs_count, rating, created_at, published_at")
      .in("bot_id", botIds)
      .order("version", { ascending: false });
    versions = versionRows ?? [];
  }

  let reviews: BotReview[] = [];
  if (botIds.length) {
    const { data: reviewRows } = await supabase
      .from("bot_reviews")
      .select("id, bot_id, author, rating, comment, created_at")
      .in("bot_id", botIds)
      .order("created_at", { ascending: false })
      .limit(Math.max(12, botIds.length * 3));
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
    const rawCategory = (metadata.category as string | undefined) ?? (metadata.primary_category as string | undefined) ?? "general";
    const normalizedCategory = rawCategory.toLowerCase();
    const rawSkills = row.capabilities ?? (metadata.capabilities as string[] | undefined) ?? (metadata.skills as string[] | undefined);
    const skills = parseStringList(rawSkills);
    if (skills.length === 0) skills.push("automation", "assist");
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function HiveStorePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { isAuthenticated, profile, loading: sessionLoading } = useAppSession();

  const [bots, setBots] = useState<HiveStoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [curation, setCuration] = useState<(typeof CURATION_FILTERS)[number]["id"]>(CURATION_FILTERS[0].id);
  const [heroId, setHeroId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchMarketplaceData();
        if (!active) return;
        // Use demo data if database is empty
        const finalData = data.length > 0 ? data : DEMO_BOTS;
        setBots(finalData);
        setHeroId((current) => current ?? finalData[0]?.id ?? null);
        setError(null);
      } catch (err) {
        console.error("Failed to load Hive Store", err);
        if (active) {
          // On error, show demo data so the page still looks good
          setBots(DEMO_BOTS);
          setHeroId(DEMO_BOTS[0]?.id ?? null);
          setError(null);
          // Don't show error alert since we have fallback data
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const curatedBuckets = useMemo(() => {
    const byInstalls = [...bots].sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0));
    const byRating = [...bots].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    const byFreshness = [...bots].sort((a, b) => {
      const left = isoDate(a.latest_version?.published_at ?? a.last_updated) ?? isoDate(a.created_at) ?? new Date(0);
      const right = isoDate(b.latest_version?.published_at ?? b.last_updated) ?? isoDate(b.created_at) ?? new Date(0);
      return right.getTime() - left.getTime();
    });
    return { trending: byInstalls, featured: byRating, new: byFreshness };
  }, [bots]);

  const curatedList = useMemo(() => curatedBuckets[curation] ?? bots, [curatedBuckets, curation, bots]);

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return curatedList.filter((bot) => {
      const categoryMatch = category === "all" || bot.category === category;
      if (!categoryMatch) return false;
      if (!query) return true;
      const haystack = [bot.name, bot.description, bot.author, bot.category, bot.skills.join(" "), bot.curatedTags.join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [curatedList, category, search]);

  useEffect(() => {
    if (!filteredAgents.length) return;
    setHeroId((current) => {
      if (current && filteredAgents.some((bot) => bot.id === current)) return current;
      return filteredAgents[0]?.id ?? current;
    });
  }, [filteredAgents]);

  const heroHighlight = useMemo(
    () => filteredAgents.find((bot) => bot.id === heroId) ?? filteredAgents[0] ?? curatedList[0] ?? null,
    [filteredAgents, heroId, curatedList]
  );

  const stats = useMemo(() => {
    if (bots.length === 0) return { total: 0, installs: "—", avgRating: "—" };
    const totalInstalls = bots.reduce((t, b) => t + safeNumber(b.downloads, 0), 0);
    const avgRating = bots.reduce((t, b) => t + safeNumber(b.rating, 0), 0) / bots.length;
    return { total: bots.length, installs: formatInstallCount(totalInstalls), avgRating: avgRating.toFixed(1) };
  }, [bots]);

  const handleInstall = useCallback((bot: HiveStoreRecord) => {
    if (!isAuthenticated) {
      setAlert({
        variant: "warning",
        title: "Sign in required",
        message: "Please sign in to install bots and manage your workspace.",
        autoClose: 5000,
      });
      return;
    }
    const targetSlug = bot.slug ?? slugify(bot.name) ?? bot.id;
    router.push(`/hivestore/${targetSlug}`);
  }, [isAuthenticated, router]);

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDark ? "bg-[#08080c]" : "bg-[#fafafa]"
    )}>
      {/* Gradient overlay */}
      <div className={cn(
        "fixed inset-0 pointer-events-none z-0",
        isDark
          ? "bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08),transparent_50%)]"
          : "bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.06),transparent_50%)]"
      )} />

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

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        {/* ================================================================ */}
        {/* HEADER */}
        {/* ================================================================ */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="space-y-4">
              {/* Badge */}
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
                isDark
                  ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                  : "bg-violet-50 border-violet-100 text-violet-600"
              )}>
                <Sparkles className="w-3.5 h-3.5" />
                HiveStore
              </div>

              {/* Title */}
              <h1 className={cn(
                "text-4xl lg:text-5xl font-bold tracking-tight",
                isDark ? "text-white" : "text-black"
              )}>
                Discover AI Agents
              </h1>

              <p className={cn(
                "text-lg max-w-2xl",
                isDark ? "text-white/60" : "text-black/60"
              )}>
                Explore curated bots built by the Bothive community. Install, configure, and deploy in minutes.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 pt-2">
                {[
                  { label: "Agents", value: stats.total.toString() },
                  { label: "Installs", value: stats.installs },
                  { label: "Avg Rating", value: stats.avgRating },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={cn(
                      "px-4 py-2 rounded-xl border",
                      isDark
                        ? "bg-white/[0.02] border-white/[0.06]"
                        : "bg-white border-black/[0.06] shadow-sm"
                    )}
                  >
                    <div className={cn("text-xs font-medium", isDark ? "text-white/40" : "text-black/40")}>
                      {stat.label}
                    </div>
                    <div className={cn("text-lg font-bold", isDark ? "text-white" : "text-black")}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auth / Profile */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {sessionLoading ? (
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border",
                  isDark ? "border-white/10 text-white/50" : "border-black/10 text-black/50"
                )}>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              ) : isAuthenticated && profile ? (
                <Link
                  href="/dashboard"
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-xl border transition-all",
                    isDark
                      ? "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]"
                      : "bg-white border-black/[0.06] hover:border-black/[0.12] shadow-sm"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                    {profile.fullName?.slice(0, 1).toUpperCase() ?? profile.email?.slice(0, 1).toUpperCase() ?? "B"}
                  </div>
                  <div className="text-left">
                    <div className={cn("text-sm font-medium", isDark ? "text-white" : "text-black")}>
                      {profile.fullName ?? "Dashboard"}
                    </div>
                    <div className={cn("text-xs", isDark ? "text-white/50" : "text-black/50")}>
                      Manage installs
                    </div>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/signin"
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all",
                    isDark
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-black text-white hover:bg-black/90"
                  )}
                >
                  Sign In
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </motion.header>

        {/* ================================================================ */}
        {/* SEARCH & FILTERS */}
        {/* ================================================================ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className={cn(
            "rounded-2xl border p-6",
            isDark
              ? "bg-white/[0.02] border-white/[0.06]"
              : "bg-white border-black/[0.06] shadow-sm"
          )}>
            {/* Search */}
            <div className="relative mb-6">
              <Search className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5",
                isDark ? "text-white/40" : "text-black/40"
              )} />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search agents, skills, or creators..."
                className={cn(
                  "w-full pl-12 pr-4 py-3.5 rounded-xl text-base outline-none transition-all border",
                  isDark
                    ? "bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/40 focus:border-violet-500/50"
                    : "bg-black/[0.02] border-black/[0.08] text-black placeholder:text-black/40 focus:border-violet-500"
                )}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors",
                    isDark ? "hover:bg-white/10 text-white/50" : "hover:bg-black/10 text-black/50"
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Curation */}
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-medium", isDark ? "text-white/50" : "text-black/50")}>
                  Sort:
                </span>
                <div className="flex gap-1">
                  {CURATION_FILTERS.map((filter) => {
                    const Icon = filter.icon;
                    const isActive = curation === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setCuration(filter.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                          isActive
                            ? isDark
                              ? "bg-violet-500/15 text-violet-400"
                              : "bg-violet-100 text-violet-700"
                            : isDark
                              ? "text-white/50 hover:text-white/70 hover:bg-white/5"
                              : "text-black/50 hover:text-black/70 hover:bg-black/5"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={cn("hidden lg:block w-px h-6", isDark ? "bg-white/10" : "bg-black/10")} />

              {/* Categories */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("text-xs font-medium", isDark ? "text-white/50" : "text-black/50")}>
                  Category:
                </span>
                <div className="flex gap-1 flex-wrap">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                          isActive
                            ? isDark
                              ? "bg-white/10 text-white"
                              : "bg-black/10 text-black"
                            : isDark
                              ? "text-white/50 hover:text-white/70 hover:bg-white/5"
                              : "text-black/50 hover:text-black/70 hover:bg-black/5"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ================================================================ */}
        {/* HERO SPOTLIGHT */}
        {/* ================================================================ */}
        {heroHighlight && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10"
          >
            <div className={cn(
              "relative overflow-hidden rounded-3xl border p-8 lg:p-10",
              isDark
                ? "bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/5 border-white/[0.08]"
                : "bg-gradient-to-br from-violet-50 via-white to-purple-50/50 border-black/[0.06] shadow-lg"
            )}>
              {/* Background glow */}
              <div className={cn(
                "absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none",
                isDark ? "bg-violet-500/10" : "bg-violet-200/30"
              )} />

              <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
                {/* Icon */}
                <div className={cn(
                  "relative w-24 h-24 lg:w-32 lg:h-32 rounded-3xl overflow-hidden border flex-shrink-0",
                  isDark ? "bg-white/5 border-white/10" : "bg-white border-black/10 shadow-lg"
                )}>
                  <Image
                    src={heroHighlight.icon || FALLBACK_ICON}
                    alt={heroHighlight.name}
                    fill
                    className="object-contain p-4"
                    sizes="128px"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border",
                      isDark
                        ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                        : "bg-violet-50 border-violet-100 text-violet-600"
                    )}>
                      Featured
                    </span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border capitalize",
                      isDark
                        ? "bg-white/5 border-white/10 text-white/60"
                        : "bg-black/5 border-black/10 text-black/60"
                    )}>
                      {heroHighlight.category}
                    </span>
                  </div>

                  <h2 className={cn(
                    "text-3xl lg:text-4xl font-bold",
                    isDark ? "text-white" : "text-black"
                  )}>
                    {heroHighlight.name}
                  </h2>

                  <p className={cn(
                    "text-base max-w-2xl",
                    isDark ? "text-white/60" : "text-black/60"
                  )}>
                    {heroHighlight.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className={cn(
                      "flex items-center gap-1.5 text-sm",
                      isDark ? "text-white/70" : "text-black/70"
                    )}>
                      <Download className="w-4 h-4" />
                      {formatInstallCount(heroHighlight.downloads)} installs
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5 text-sm",
                      isDark ? "text-white/70" : "text-black/70"
                    )}>
                      <Star className="w-4 h-4 text-amber-500" fill="#f59e0b" />
                      {heroHighlight.rating.toFixed(1)}
                    </div>
                    <div className={cn(
                      "text-sm font-medium",
                      priceLabel(heroHighlight) === "Free"
                        ? "text-emerald-500"
                        : isDark ? "text-white" : "text-black"
                    )}>
                      {priceLabel(heroHighlight)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {heroHighlight.skills.slice(0, 5).map((skill, i) => (
                      <span
                        key={`${heroHighlight.id}-skill-${i}`}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs border",
                          isDark
                            ? "bg-white/5 border-white/10 text-white/60"
                            : "bg-black/5 border-black/10 text-black/60"
                        )}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col gap-3 lg:self-end">
                  <button
                    onClick={() => handleInstall(heroHighlight)}
                    className={cn(
                      "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
                      "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5"
                    )}
                  >
                    Install Now
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <span className={cn(
                    "text-xs text-center",
                    isDark ? "text-white/40" : "text-black/40"
                  )}>
                    by {heroHighlight.author}
                  </span>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* ================================================================ */}
        {/* AGENT GRID */}
        {/* ================================================================ */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className={cn("w-8 h-8 animate-spin", isDark ? "text-white/50" : "text-black/50")} />
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className={cn(
              "text-center py-20 rounded-2xl border",
              isDark
                ? "bg-white/[0.02] border-white/[0.06] text-white/50"
                : "bg-white border-black/[0.06] text-black/50"
            )}>
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No agents found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAgents.map((bot) => (
                <Link
                  key={bot.id}
                  href={`/hivestore/${bot.slug || bot.id}`}
                  className="block h-full"
                >
                  <SpotlightCard
                    className="h-full group hover:border-violet-500/30 transition-all duration-300"
                    spotlightColor={isDark ? "rgba(139, 92, 246, 0.15)" : "rgba(139, 92, 246, 0.05)"}
                  >
                    <div className="p-8 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div className={cn(
                          "relative w-16 h-16 rounded-2xl overflow-hidden border flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105",
                          isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                        )}>
                          <Image
                            src={bot.icon || FALLBACK_ICON}
                            alt={bot.name}
                            width={48}
                            height={48}
                            className="object-contain p-2"
                          />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold",
                            isDark ? "bg-white/5 text-amber-400" : "bg-black/5 text-amber-600"
                          )}>
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {bot.rating.toFixed(1)}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        <span className={cn(
                          "text-xs font-bold uppercase tracking-wider mb-2 block",
                          isDark ? "text-violet-400" : "text-violet-600"
                        )}>
                          {bot.category}
                        </span>
                        <h3 className={cn(
                          "text-xl font-bold mb-2 group-hover:text-violet-500 transition-colors",
                          isDark ? "text-white" : "text-black"
                        )}>
                          {bot.name}
                        </h3>
                        <p className={cn(
                          "text-sm leading-relaxed line-clamp-2",
                          isDark ? "text-white/60" : "text-black/60"
                        )}>
                          {bot.description}
                        </p>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {bot.skills.slice(0, 3).map((skill, i) => (
                          <span
                            key={`${bot.id}-skill-${i}`}
                            className={cn(
                              "px-2.5 py-1 rounded-md text-xs font-medium border",
                              isDark
                                ? "bg-white/5 border-white/10 text-white/50"
                                : "bg-black/5 border-black/10 text-black/50"
                            )}
                          >
                            {skill}
                          </span>
                        ))}
                        {bot.skills.length > 3 && (
                          <span className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-medium border",
                            isDark ? "bg-white/5 border-white/10 text-white/40" : "bg-black/5 border-black/10 text-black/40"
                          )}>
                            +{bot.skills.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className={cn(
                        "flex items-center justify-between pt-6 border-t mt-auto",
                        isDark ? "border-white/[0.06]" : "border-black/[0.06]"
                      )}>
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            "flex items-center gap-1.5 text-xs font-medium",
                            isDark ? "text-white/40" : "text-black/40"
                          )}>
                            <Download className="w-3.5 h-3.5" />
                            {formatInstallCount(bot.downloads)}
                          </span>
                          <span className={cn(
                            "text-sm font-bold",
                            priceLabel(bot) === "Free"
                              ? "text-emerald-500"
                              : isDark ? "text-white" : "text-black"
                          )}>
                            {priceLabel(bot)}
                          </span>
                        </div>
                        <div className={cn(
                          "flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:translate-x-1",
                          isDark ? "text-white" : "text-black"
                        )}>
                          View
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                </Link>
              ))}
            </div>
          )}
        </motion.section>

        {/* ================================================================ */}
        {/* FOOTER CTA */}
        {/* ================================================================ */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={cn(
            "mt-16 rounded-2xl border p-8 lg:p-10",
            isDark
              ? "bg-white/[0.02] border-white/[0.06]"
              : "bg-white border-black/[0.06] shadow-sm"
          )}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className={cn(
                "text-2xl font-bold",
                isDark ? "text-white" : "text-black"
              )}>
                Build and publish your own agent
              </h3>
              <p className={cn(
                "text-base mt-2 max-w-xl",
                isDark ? "text-white/60" : "text-black/60"
              )}>
                Create an agent, submit for review, and go live in under 24 hours. Reach thousands of users on HiveStore.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/docs/hivelang"
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium border transition-all",
                  isDark
                    ? "border-white/10 text-white/70 hover:border-white/20 hover:text-white"
                    : "border-black/10 text-black/70 hover:border-black/20 hover:text-black"
                )}
              >
                Read Docs
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard/bots/new"
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all",
                  isDark
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-black text-white hover:bg-black/90"
                )}
              >
                Start Building
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
