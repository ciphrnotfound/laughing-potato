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
    ? await supabase.from("bots").select(selectColumns).eq("slug", identifier).eq("status", "active").maybeSingle()
    : { data: null, error: null };

  const row = bySlug.data;
  let botRow = row;

  if (!botRow) {
    const byId = await supabase.from("bots").select(selectColumns).eq("id", identifier).eq("status", "active").maybeSingle();
    botRow = byId.data ?? null;
    if (byId.error && byId.error.code !== "PGRST116") {
      throw byId.error;
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
    .select("id, bot_id, author, rating, comment, created_at")
    .eq("bot_id", botRow.id)
    .order("created_at", { ascending: false })
    .limit(12);

  if (reviewError && reviewError.code !== "PGRST116") {
    throw reviewError;
  }

  return {
    bot: detail,
    versions,
    reviews: (reviewRows ?? []) as BotReview[],
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
          const response = await fetch("/api/agents", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: fallbackId,
              name: bot.name,
              description: bot.description,
              skills: bot.skills.length ? bot.skills : ["automation"],
              memoryKeys: bot.curatedTags,
            }),
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

          const payload: PostInstallPayload = {
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
            sessionStorage.setItem("bothive:lastInstalledBot", JSON.stringify(payload));
            router.push(`/dashboard/installs/${payload.slug}`);
          }, 1200);
        } catch (error) {
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
    <main className="relative min-h-screen overflow-hidden bg-[#050312] text-white">
      <AmbientBackdrop className="opacity-90" maskClassName="[mask-image:radial-gradient(circle_at_center,transparent_0%,black_70%)]" />

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

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 pb-24 pt-14 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/hivestore")}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-white/70 transition hover:border-white/40 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to listings
          </button>
          {sessionLoading ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/60">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking session
            </div>
          ) : isAuthenticated && profile ? (
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/70 transition hover:border-white/40 hover:text-white"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 text-[11px] font-semibold">
                {profile.fullName?.slice(0, 2).toUpperCase() ?? profile.email?.slice(0, 2).toUpperCase() ?? "BH"}
              </div>
              <span>Workspace</span>
              <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-[2px]" />
            </Link>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-white/70 transition hover:border-white/40 hover:text-white"
            >
              Sign in
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-[32px] border border-white/10 bg-white/5 text-white/60">
            <div className="inline-flex items-center gap-3 text-sm">
              <Loader2 className="h-5 w-5 animate-spin" />
              Syncing listing data
            </div>
          </div>
        ) : error ? (
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 text-center text-white/70">
            <h2 className="text-2xl font-semibold text-white">{error}</h2>
            <p className="mt-2 text-sm text-white/60">
              Return to the Hive Store or refresh the page to try again.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/hivestore")}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:-translate-y-0.5 hover:border-white/40 hover:text-white"
              >
                Back to Hive Store
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5"
              >
                Retry load
              </button>
            </div>
          </div>
        ) : bot ? (
          <div className="space-y-12">
            <motion.section
              initial="hidden"
              animate="show"
              variants={MOTION_CARD}
              className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/5 p-8 shadow-[0_45px_100px_rgba(76,29,149,0.35)]"
            >
              <div className="pointer-events-none absolute inset-0 rounded-[36px] border border-white/5" />
              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-6">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/60">
                    <Sparkles className="h-4 w-4" /> Spotlight detail
                  </span>
                  <div className="space-y-3">
                    <h1 className="text-4xl font-semibold text-white sm:text-5xl">{bot.name}</h1>
                    <p className="max-w-2xl text-sm text-white/70">{bot.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.28em] text-white/60">
                    {detailChips.map((chip) => (
                      <span key={chip.label} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2">
                        {chip.label}: {chip.value}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => void handleInstall("primary")}
                      disabled={installing}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-[0_24px_65px_rgba(255,255,255,0.35)] transition",
                        "bg-white text-slate-900 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                      )}
                    >
                      {installing ? "Installing..." : isFreeBot ? "Install now" : "Install & billing"}
                      <CreditCard className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleInstall("trial")}
                      disabled={installing}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm uppercase tracking-[0.28em] text-white/75 transition hover:border-white/40 hover:text-white",
                        installing && "cursor-not-allowed opacity-60"
                      )}
                    >
                      Request trial
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <span className="text-xs uppercase tracking-[0.32em] text-white/60">{paymentPlaceholderCopy}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-5">
                  <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-5 shadow-xl">
                    <Image src={bot.icon || FALLBACK_ICON} alt={`${bot.name} icon`} fill className="object-contain" sizes="112px" />
                  </div>
                  <div className="flex flex-col items-center gap-2 text-xs uppercase tracking-[0.32em] text-white/60">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-white/70">
                      <Download className="h-4 w-4" /> {formatInstallCount(bot.downloads)} installs
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-white/70">
                      <Star className="h-4 w-4 text-indigo-200" fill="#c4b5fd" /> {sentiment ?? bot.rating.toFixed(1)} rating
                    </span>
                  </div>
                </div>
              </div>
            </motion.section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                variants={MOTION_CARD}
                className="space-y-6 rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_32px_85px_rgba(15,23,42,0.28)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-white">Capabilities &amp; ritual fit</h2>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/60">
                    <ShieldCheck className="h-4 w-4" /> Guardrails ready
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.28em] text-white/65">
                  {bot.skills.slice(0, 8).map((skill, index) => (
                    <span key={`${bot.id}-skill-${index}`} className="rounded-full border border-white/15 bg-white/10 px-4 py-1">
                      {skill.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-5 text-sm text-white/65">
                  <p>
                    This bot ships with shared memory keys and automation hooks tuned for {bot.category} teams. Configure orchestrations inside the Builder to sync with your stack—Slack, Linear, Notion, and more.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {bot.curatedTags.slice(0, 4).map((tag) => (
                    <div
                      key={tag}
                      className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs uppercase tracking-[0.32em] text-white/60"
                    >
                      <span className="block text-white/40">Curated signal</span>
                      <span className="mt-1 block text-sm font-semibold text-white">{tag}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.aside
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                variants={MOTION_CARD}
                className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm text-white/70 shadow-[0_24px_75px_rgba(15,23,42,0.28)]"
              >
                <h3 className="text-base font-semibold text-white">Install checklist</h3>
                <ol className="space-y-3 text-xs uppercase tracking-[0.3em] text-white/60">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-emerald-300" /> Sign in with workspace owner account
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-emerald-300" /> Confirm billing preference (Stripe coming soon)
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-emerald-300" /> Choose default version &amp; deployment slot
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-emerald-300" /> Assign teammates &amp; automation triggers
                  </li>
                </ol>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-white/65">
                  <p>
                    Billing flows are rolling out gradually. Your workspace will receive priority access in the next release wave. Until then, installs land in a sandbox state.
                  </p>
                </div>
              </motion.aside>
            </section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                variants={MOTION_CARD}
                className="rounded-[30px] border border-white/10 bg-white/5 p-6 text-white/70 shadow-[0_32px_85px_rgba(15,23,42,0.28)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">Version timeline</h3>
                  <span className="text-xs uppercase tracking-[0.32em] text-white/60">
                    {versions.length ? `${versions.length} releases` : "No releases yet"}
                  </span>
                </div>
                <div className="mt-5 space-y-4">
                  {versions.length ? (
                    versions.map((version) => (
                      <div
                        key={version.id}
                        className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.3em] text-white/60">
                          <span>v{version.version}</span>
                          <span>{formatDate(version.published_at ?? version.created_at)}</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-white/70">
                          <span>{version.label ?? "Unlabeled release"}</span>
                          <span className={priceLabel(version) === "Included" ? "text-indigo-200" : "text-white"}>{priceLabel(version)}</span>
                        </div>
                        {version.description ? (
                          <p className="text-xs text-white/60">{version.description}</p>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-8 text-center text-sm text-white/60">
                      Version history will appear here once the creator publishes their first milestone release.
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                variants={MOTION_CARD}
                className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm text-white/70 shadow-[0_24px_75px_rgba(15,23,42,0.28)]"
              >
                <h3 className="text-base font-semibold text-white">Latest reviews</h3>
                {reviews.length ? (
                  <div className="space-y-3">
                    {reviews.slice(0, 4).map((review) => (
                      <div key={review.id} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
                          <span>{review.author ?? "Anonymous"}</span>
                          <span>{formatDate(review.created_at)}</span>
                        </div>
                        <div className="mt-1 inline-flex items-center gap-2 text-sm text-white/70">
                          <Star className="h-4 w-4 text-indigo-200" fill="#c4b5fd" />
                          {safeNumber(review.rating, bot.rating).toFixed(1)}
                        </div>
                        {review.comment ? (
                          <p className="mt-2 text-xs text-white/60">{review.comment}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-8 text-center text-sm text-white/60">
                    Reviews land here once teams start sharing feedback.
                  </div>
                )}
              </motion.div>
            </section>

            <motion.section
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={MOTION_CARD}
              className="rounded-[30px] border border-white/10 bg-white/5 p-6 text-white/70 shadow-[0_32px_85px_rgba(15,23,42,0.28)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Creator studio</h3>
                  <p className="text-sm text-white/60">
                    Published by {bot.author}. Listing analytics, billing, and expansion packs will surface here for creators.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:border-white/40 hover:text-white"
                  onClick={() => setAlert({
                    variant: "info",
                    title: "Creator dashboard coming soon",
                    message: "Studio metrics and monetization controls are rolling out alongside the billing launch.",
                    autoClose: 4800,
                  })}
                >
                  Join creator beta
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </motion.section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
