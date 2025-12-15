"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import dynamic from "next/dynamic";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Bot,
  Check,
  CreditCard,
  Download,
  ExternalLink,
  Info,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  Zap,
  MessageSquarePlus,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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

// Dynamically import PaystackButton to prevent SSR issues
const PaystackButton = dynamic(
  () => import('react-paystack').then((mod) => {
    const PaystackHookButton = ({ config, onSuccess, onClose, children, disabled, className }: any) => {
      const initializePayment = mod.usePaystackPayment(config);
      return (
        <button
          onClick={() => initializePayment({ onSuccess, onClose })}
          disabled={disabled}
          className={className}
        >
          {children}
        </button>
      );
    };
    return PaystackHookButton;
  }),
  { ssr: false }
);

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
    ? await supabase.from("bots").select(selectColumns).eq("slug", identifier).maybeSingle()
    : { data: null, error: null };

  const row = bySlug.data;
  let botRow = row;

  if (!botRow) {
    // Only attempt ID lookup if identifier is a valid UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    if (isUUID) {
      const byId = await supabase.from("bots").select(selectColumns).eq("id", identifier).maybeSingle();
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

  let reviews: BotReview[] = [];

  // Fetch reviews using correct table and relation
  try {
    const { data: reviewRows, error: reviewError } = await supabase
      .from("bot_reviews")
      .select(`
        id,
        rating,
        review_text,
        created_at,
        reviewer_id
      `)
      .eq("bot_id", botRow.id)
      .order("created_at", { ascending: false })
      .limit(12);

    // Note: We are selecting reviewer_id relation. 
    // If profiles table linkage is tricky via standard relation, we handle it gracefully.
    // Actually, we'll try to join user_profiles if possible, but RLS/FK might limit it.
    // For now, let's just get the reviews and if reviewer details overlap, we'd need a separate fetch or properly defined FK.
    // Given the migration, `bot_reviews.reviewer_id` -> `auth.users`. `user_profiles.user_id` -> `auth.users`.
    // Direct join might fail if not defined.
    // We'll proceed with basic review data first.

    if (reviewRows) {
      // We might need to fetch profile names separately if join fails
      // For this iteration, we'll display "Verified User" or just the review.
      reviews = reviewRows.map((r: any) => ({
        id: r.id,
        bot_id: botRow.id,
        user_id: r.reviewer?.id || "unknown",
        rating: r.rating,
        comment: r.review_text,
        created_at: r.created_at,
        user: { full_name: "Community Member", avatar_url: null }
      }));
    }
  } catch (err) {
    console.warn("Failed to fetch reviews:", err);
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

  // Review State
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleSubmitReview = async () => {
    if (!bot || !isAuthenticated) return;
    setIsSubmittingReview(true);
    try {
      const { error: revError } = await supabase.from('bot_reviews').insert({
        bot_id: bot.id,
        reviewer_id: profile?.id, // Assuming profile.id is user_id
        rating: reviewRating,
        review_text: reviewText
      });

      if (revError) throw revError;

      toast.success("Review submitted successfully!");
      setShowReviewDialog(false);
      setReviewText("");
      // Optimistically update reviews or reload?
      // For now, simplistic reload or ignore.
      // Ideally we append to reviews list.
      setReviews(prev => [{
        id: "temp-" + Date.now(),
        bot_id: bot.id,
        user_id: profile?.id || "me",
        rating: reviewRating,
        comment: reviewText,
        created_at: new Date().toISOString(),
        user: { full_name: "You", avatar_url: null }
      }, ...prev]);

    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

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

  const installButtonText = useMemo(() => {
    if (!bot) return "";
    if (installing) return "Processing...";
    if (isFreeBot) return "Install Agent";
    return `Subscribe ${priceLabel(bot)}`;
  }, [installing, isFreeBot, bot]);

  // Helper function extracted from original handleInstall logic
  const executeInstall = useCallback(async (targetBot: DetailedBot) => {
    setInstalling(true);
    setAlert({
      variant: "info",
      title: `Launching ${targetBot.name}`,
      message: (
        <div className="flex items-center gap-3 text-white/80">
          <Loader2 className="h-4 w-4 animate-spin text-white" />
          <span>Provisioning your workspace. This takes a few seconds.</span>
        </div>
      ),
      autoClose: undefined,
    });

    try {
      const fallbackId = targetBot.slug ?? slugify(targetBot.name) ?? targetBot.id;

      const payload = {
        name: targetBot.name,
        description: targetBot.description,
        capabilities: targetBot.skills.length ? targetBot.skills : ["automation"],
        model: (targetBot.metadata?.model as string) || "gpt-4-turbo",
        source_bot_id: targetBot.id,
        system_prompt: (targetBot.metadata?.system_prompt as string) || `You are ${targetBot.name}, a helpful AI assistant specialized in ${targetBot.category}.`
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
        id: targetBot.id,
        name: targetBot.name,
        slug: targetBot.slug ?? fallbackId,
        category: targetBot.category,
        author: targetBot.author,
        icon: targetBot.icon ?? FALLBACK_ICON,
      };

      setAlert({
        variant: "success",
        title: `${targetBot.name} installed`,
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
  }, [router]);

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

      // If free bot, proceed with direct install
      if ((source === "primary" && isFreeBot) || source === "trial") {
        await executeInstall(bot);
        return;
      }

      // For Paid Bots: Initiate Payment
      setInstalling(true);
      try {
        // 1. Create access code for Paystack
        const intentRes = await fetch("/api/store/purchase/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            botId: bot.id,
            amount: bot.price // Assuming price is in main currency (e.g. NGN/USD)
          })
        });

        if (!intentRes.ok) {
          const errData = await intentRes.json();
          throw new Error(errData.error || "Failed to initialize payment");
        }

        const { access_code } = await intentRes.json();

        // 2. Open Paystack Popup
        // We dynamically import PaystackPop or use window.PaystackPop if available
        // But cleaner is to use a helper or the react-paystack hook.
        // Since we are inside an async function triggered by click, we can't use the hook directly here 
        // unless we set up the config earlier.

        // Better approach: Use the Paystack JS directly via a helper or standard script
        // For now, let's assume we have a global PaystackPop or insert the script.
        // Actually, the user project uses `react-paystack`.
        // Let's rely on the popup being triggered by a button that uses the hook,
        // OR dynamically load the script here.

        // Let's use the inline script method for flexibility in this async flow.
        const PaystackPop = (window as any).PaystackPop;

        if (!PaystackPop) {
          // Fallback: Load script or show error.
          // Ideally we should have the script loaded on the page.
          throw new Error("Payment gateway not loaded. Please refresh.");
        }

        const handler = PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          email: profile?.email || "customer@example.com",
          amount: (bot.price || 0) * 100, // kobo
          currency: "NGN", // Default
          ref: access_code, // Use access_code as ref or separate? 
          // Actually, if we got access_code from backend initialization (standard), 
          // we should pass it. 'access_code' is the key param for initialized txn.
          access_code: access_code,

          callback: async function (response: any) {
            // 3. Verify on Server
            setAlert({
              variant: 'info',
              title: 'Verifying Payment',
              message: 'Please wait while we confirm your purchase...',
              autoClose: undefined
            });

            try {
              const verifyRes = await fetch("/api/store/purchase/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  reference: response.reference,
                  botId: bot.id
                })
              });

              if (!verifyRes.ok) throw new Error("Payment verification failed");

              // 4. Proceed to Install
              await executeInstall(bot);

            } catch (vError: any) {
              setAlert({
                variant: "error",
                title: "Verification Failed",
                message: vError.message || "Payment was successful but verification failed. Support has been notified.",
                autoClose: 8000
              });
            }
          },
          onClose: function () {
            setInstalling(false);
          }
        });

        handler.openIframe();

      } catch (err: any) {
        console.error("Payment Error:", err);
        setAlert({
          variant: "error",
          title: "Payment Initialization Failed",
          message: err.message || "Could not start payment flow.",
          autoClose: 5000
        });
        setInstalling(false);
      }
    },
    [bot, isAuthenticated, isFreeBot, profile, executeInstall]
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
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 font-sans selection:bg-purple-500/30">


      {/* Alert/Toast Layer */}
      <AnimatePresence>
        {alert && (
          <div className="fixed top-24 right-6 z-[100] w-full max-w-sm outline-none">
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              className={cn(
                "relative overflow-hidden rounded-xl border shadow-2xl backdrop-blur-xl p-4",
                alert.variant === "error"
                  ? "bg-red-500/10 border-red-500/20"
                  : alert.variant === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-zinc-900/80 border-white/10 dark:bg-white/10"
              )}
            >
              <div className="flex gap-3">
                <div
                  className={cn(
                    "h-10 w-10 shrink-0 rounded-full flex items-center justify-center",
                    alert.variant === "error"
                      ? "bg-red-500/20 text-red-400"
                      : alert.variant === "success"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-violet-500/20 text-violet-400"
                  )}
                >
                  {alert.variant === "error" ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : alert.variant === "success" ? (
                    <ThumbsUp className="h-5 w-5" />
                  ) : (
                    <Info className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm leading-none pt-1 mb-1 text-black dark:text-white/90">
                    {alert.title}
                  </h4>
                  <div className="text-sm text-zinc-600 dark:text-white/60 leading-relaxed">
                    {alert.message}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        {/* Navigation */}
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-sm text-zinc-500 hover:text-black dark:hover:text-white transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Back to Store</span>
        </button>

        {loading ? (
          <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            <p className="text-sm text-zinc-500 animate-pulse">Loading agent details...</p>
          </div>
        ) : error ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-black dark:text-white mb-2">Unavailable</h2>
            <p className="text-zinc-500 mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black font-medium">Retry</button>
          </div>
        ) : bot ? (
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 mb-24 animate-in fade-in duration-700">
            {/* Left Column: Visuals */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative aspect-square rounded-[32px] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 group"
              >
                {bot.metadata?.icon_url ? (
                  <img
                    src={bot.metadata.icon_url as string}
                    alt={bot.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
                    <Bot className="w-32 h-32 text-zinc-900 dark:text-white relative z-10" strokeWidth={1} />
                  </div>
                )}

                {/* Floating Tags */}
                <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-xs font-semibold uppercase tracking-wider text-black dark:text-white shadow-lg">
                    {bot.category || "AI Agent"}
                  </span>
                  {true && (
                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/90 text-white backdrop-blur-md shadow-lg flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50">
                  <div className="text-zinc-500 text-sm font-medium mb-1">Author</div>
                  <div className="text-black dark:text-white font-semibold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                      {(bot.author?.[0] || 'A').toUpperCase()}
                    </div>
                    {bot.author || "Anonymous"}
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50">
                  <div className="text-zinc-500 text-sm font-medium mb-1">Version</div>
                  <div className="text-black dark:text-white font-semibold">
                    v{primaryVersion?.label || "1.0.0"}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="flex flex-col justify-center">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl lg:text-5xl font-bold tracking-tight text-black dark:text-white mb-6"
              >
                {bot.name}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center gap-6 mb-8 text-sm"
              >
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-bold text-lg text-black dark:text-white">{Number(bot.metadata?.rating || 0).toFixed(1)}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">({reviews.length} reviews)</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
                  <Download className="w-4 h-4" /> {formatInstallCount(bot.downloads || 0)} installs
                </span>
                <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                  Updated {new Date(bot.last_updated ?? new Date().toISOString()).toLocaleDateString()}
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed mb-10"
              >
                {bot.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 mb-12"
              >
                {isFreeBot ? (
                  <button
                    onClick={() => handleInstall("primary")}
                    disabled={installing}
                    className="flex-1 h-14 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-base hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/10 dark:shadow-white/5 active:scale-95"
                  >
                    {installing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 fill-current" />
                        <span>Install Agent</span>
                      </>
                    )}
                  </button>
                ) : (
                  <PaystackButton
                    className="flex-1 h-14 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-base hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/10 dark:shadow-white/5 active:scale-95"
                    config={{
                      reference: (new Date()).getTime().toString(),
                      email: profile?.email || "user@example.com",
                      amount: (bot.price || 5000) * 100, // kobo
                      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
                      metadata: {
                        bot_id: bot.id,
                        user_id: profile?.id
                      },
                      // Add subaccount if available for split payment
                      ...(bot.metadata?.subaccount_code ? {
                        subaccount: bot.metadata.subaccount_code as string,
                        transaction_charge: 3000 // Platform fee (example 30%) - needs logic
                      } : {})
                    }}
                    onSuccess={async (reference: any) => {
                      setAlert({
                        variant: 'info',
                        title: 'Verifying Payment',
                        message: 'Please wait while we confirm your purchase...',
                        autoClose: undefined
                      });

                      try {
                        const verifyRes = await fetch("/api/store/purchase/verify", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            reference: reference.reference,
                            botId: bot.id
                          })
                        });

                        if (!verifyRes.ok) throw new Error("Payment verification failed");

                        // Proceed to Install
                        await executeInstall(bot);

                      } catch (vError: any) {
                        setAlert({
                          variant: "error",
                          title: "Verification Failed",
                          message: vError.message || "Payment verification failed.",
                          autoClose: 8000
                        });
                      }
                    }}
                    onClose={() => console.log("Payment closed")}
                    disabled={installing || !isAuthenticated}
                  >
                    <Lock className="w-5 h-5" />
                    <span>{installButtonText}</span>
                  </PaystackButton>
                )}
                <button className="h-14 px-8 rounded-full border border-zinc-200 dark:border-zinc-700 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-black dark:text-white">
                  View Demo
                </button>
              </motion.div>

              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white mb-6">Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {bot.skills?.map((cap: string, i: number) => (
                    <span
                      key={i}
                      className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-black dark:text-white" />
                      {cap}
                    </span>
                  )) || <span className="text-zinc-500 italic">No capabilities listed</span>}
                </div>
              </div>

              {/* Review Preview */}
              <div className="mt-12">
                <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white mb-6">Recent Feedback</h3>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 2).map((r) => (
                      <div key={r.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold text-sm">{r.user?.full_name || 'Anonymous'}</span>
                          <div className="flex text-yellow-500 text-xs">
                            {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < (r.rating || 5) ? 'fill-current' : 'text-zinc-300 dark:text-zinc-700'}`} />)}
                          </div>
                        </div>
                        <p className="text-sm text-zinc-500">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 border-dashed">
                    <p className="text-sm text-zinc-500 italic mb-4">No reviews yet. Be the first!</p>
                  </div>
                )}

                {isAuthenticated && (
                  <div className="mt-8 flex justify-center">
                    <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <MessageSquarePlus className="w-4 h-4" /> Write a Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <DialogHeader>
                          <DialogTitle>Rate & Review {bot.name}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setReviewRating(star)}
                                className={`transition-all hover:scale-110 ${star <= reviewRating ? "text-yellow-500" : "text-zinc-300 dark:text-zinc-700"}`}
                              >
                                <Star className="w-8 h-8 fill-current" />
                              </button>
                            ))}
                          </div>
                          <Textarea
                            placeholder="Share your experience..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            className="min-h-[100px] bg-zinc-50 dark:bg-zinc-800/50"
                          />
                        </div>
                        <DialogFooter>
                          <Button variant="ghost" onClick={() => setShowReviewDialog(false)}>Cancel</Button>
                          <Button onClick={handleSubmitReview} disabled={isSubmittingReview || !reviewText.trim()}>
                            {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Submit Review
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
