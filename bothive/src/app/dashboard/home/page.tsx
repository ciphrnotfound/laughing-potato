"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  CalendarDays,
  MessageCircle,
  Clock3,
  Zap,
  FileText,
  BarChart3,
  Settings,
  Loader2,
  Send,
  Home,
  Layers,
  Bookmark,
  Menu,
  Plus,
  Globe,
  ArrowUpRight,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAppSession } from "@/lib/app-session-context";
import { supabase } from "@/lib/supabase";
import type { RunResult } from "@/lib/agentTypes";
import { PageLoadingOverlay } from "@/components/PageLoadingOverlay";

const sidebarLinks: Array<{ label: string; href: string; icon: LucideIcon }> = [
  { label: "Command Center", href: "/dashboard/home", icon: Home },
  { label: "My Bots", href: "/hivestore", icon: Layers },
  { label: "Playbooks", href: "/automations", icon: Bookmark },
  { label: "Signal Logs", href: "/dashboard/activity", icon: BarChart3 },
  { label: "Support", href: "/contact", icon: Globe },
];

const ACCENT_GRADIENTS = [
  "from-[#7C3AED] to-[#4F46E5]",
  "from-[#22D3EE] to-[#0EA5E9]",
  "from-[#F97316] to-[#EA580C]",
  "from-[#10B981] to-[#059669]",
];

const PRIMARY_ACTION_ICONS: LucideIcon[] = [Sparkles, CalendarDays, MessageCircle, Zap];
const QUICK_WIN_ICONS: LucideIcon[] = [Clock3, Zap, FileText, BarChart3];
const FALLBACK_ICON = "/logo.svg";

type PrimaryActionCard = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  accent: string;
};

type QuickWinCard = {
  icon: LucideIcon;
  title: string;
  detail: string;
};

type ResourceLink = {
  title: string;
  description: string;
  href: string;
};

type DailyRhythmEntry = {
  title: string;
  detail: string;
};

interface DashboardBot {
  id: string;
  name: string;
  slug?: string | null;
  category?: string | null;
  installs?: number | null;
  icon?: string | null;
  summary?: string | null;
  capabilities?: string[];
}

interface DashboardRun {
  id: string;
  botId?: string | null;
  botName: string;
  status?: string | null;
  createdAt?: string | null;
  completedAt?: string | null;
}

interface DashboardStats {
  totalRuns: number | null;
  successRate: number | null;
  activeBots: number;
}

const FALLBACK_PRIMARY_ACTIONS: PrimaryActionCard[] = [
  {
    icon: Sparkles,
    title: "Let bots summarise inbox",
    description: "Have your assistants collect highlights from email threads every morning.",
    href: "/automations/email-digest",
    accent: ACCENT_GRADIENTS[0]!,
  },
  {
    icon: CalendarDays,
    title: "Schedule status pings",
    description: "Draft weekly updates for stakeholders and send for review automatically.",
    href: "/automations/status-update",
    accent: ACCENT_GRADIENTS[1]!,
  },
  {
    icon: MessageCircle,
    title: "Answer support tickets",
    description: "Route the top three support questions to a ready-to-go helper bot.",
    href: "/automations/support-sprint",
    accent: ACCENT_GRADIENTS[2]!,
  },
];

const FALLBACK_QUICK_WINS: QuickWinCard[] = [
  {
    icon: Clock3,
    title: "Morning snapshot",
    detail: "Daily digest of meetings, blockers, and trending mentions delivered to Slack.",
  },
  {
    icon: FileText,
    title: "Report writer",
    detail: "Automatically assemble a weekly summary deck from Notion docs and sheets.",
  },
  {
    icon: Zap,
    title: "Campaign ready",
    detail: "Draft social captions and queue them for approval before noon.",
  },
  {
    icon: BarChart3,
    title: "KPI monitor",
    detail: "Alert you when metrics move beyond the comfort zone you define.",
  },
];

const FALLBACK_RESOURCES: ResourceLink[] = [
  {
    title: "Showcase playbook",
    description: "See how teams let automations take the repetitive work off their plate.",
    href: "/playbooks/showcase",
  },
  {
    title: "Invite a teammate",
    description: "Share your workspace and collaborate on automations instantly.",
    href: "/settings/team",
  },
  {
    title: "Success office hours",
    description: "Book time with our success crew for a live walkthrough of best practices.",
    href: "https://cal.com/bothive/success",
  },
];

const FALLBACK_DAILY_RHYTHM: DailyRhythmEntry[] = [
  {
    title: "08:00 — Inbox summary",
    detail: "Bot drafts a highlight reel from overnight conversations.",
  },
  {
    title: "11:30 — Content sweep",
    detail: "Generate social posts and queue for approval automatically.",
  },
  {
    title: "16:00 — Wrap-up brief",
    detail: "Receive an end-of-day report with upcoming deadlines.",
  },
];

export default function HomeDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, profile } = useAppSession();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [primaryActions, setPrimaryActions] = useState<PrimaryActionCard[]>(FALLBACK_PRIMARY_ACTIONS);
  const [quickWins, setQuickWins] = useState<QuickWinCard[]>(FALLBACK_QUICK_WINS);
  const [resources, setResources] = useState<ResourceLink[]>(FALLBACK_RESOURCES);
  const [dailyRhythm, setDailyRhythm] = useState<DailyRhythmEntry[]>(FALLBACK_DAILY_RHYTHM);
  const [bots, setBots] = useState<DashboardBot[]>([]);
  const [recentRuns, setRecentRuns] = useState<DashboardRun[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalRuns: null, successRate: null, activeBots: 0 });
  const [chatBotId, setChatBotId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ id: string; role: "user" | "assistant" | "system"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isLinkActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/signin");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    const loadDashboard = async () => {
      setIsLoadingData(true);
      try {
        const [{ data: botRows, error: botError }, { data: runRows, error: runError }] = await Promise.all([
          supabase
            .from("bots")
            .select("id, name, slug, metadata, capabilities, created_at")
            .order("created_at", { ascending: false })
            .limit(4),
          supabase
            .from("bot_runs")
            .select("id, bot_id, status, created_at, completed_at, bots(name)")
            .order("created_at", { ascending: false })
            .limit(6),
        ]);

        if (botError) throw botError;
        if (runError) throw runError;

        if (cancelled) return;

        const mappedBots: DashboardBot[] = (botRows ?? []).map((row) => {
          const metadata = (row.metadata as Record<string, unknown> | null) ?? {};
          const summary = (metadata.summary as string | undefined) ?? (metadata.description as string | undefined) ?? null;
          const installs = Number(metadata.installs_count ?? metadata.downloads ?? 0) || null;
          const icon = (metadata.icon_url as string | undefined) ?? FALLBACK_ICON;
          const category = (metadata.category as string | undefined) ?? "general";
          const rawCapabilities = Array.isArray(row.capabilities)
            ? (row.capabilities as unknown[])
            : Array.isArray(metadata.capabilities)
            ? (metadata.capabilities as unknown[])
            : [];
          const capabilities = rawCapabilities
            .map((entry) => `${entry}`.trim())
            .filter(Boolean);
          return {
            id: row.id,
            name: row.name,
            slug: row.slug,
            category,
            installs,
            icon,
            summary,
            capabilities,
          } satisfies DashboardBot;
        });
        setBots(mappedBots);

        const mappedRuns: DashboardRun[] = (runRows ?? []).map((row) => {
          const botName = (row as any)?.bots?.name ?? mappedBots.find((bot) => bot.id === row.bot_id)?.name ?? "Unknown bot";
          return {
            id: row.id,
            botId: row.bot_id,
            botName,
            status: row.status,
            createdAt: row.created_at,
            completedAt: row.completed_at,
          } satisfies DashboardRun;
        });
        setRecentRuns(mappedRuns);

        const totalRuns = mappedRuns.length ? mappedRuns.length : null;
        const succeededRuns = mappedRuns.filter((run) => run.status === "succeeded").length;
        const successRate = totalRuns ? Math.round((succeededRuns / totalRuns) * 100) : null;
        setStats({ totalRuns, successRate, activeBots: mappedBots.length });

        if (mappedBots.length > 0) {
          const dynamicActions: PrimaryActionCard[] = mappedBots.slice(0, 4).map((bot, index) => {
            const Icon = PRIMARY_ACTION_ICONS[index % PRIMARY_ACTION_ICONS.length] ?? Sparkles;
            return {
              icon: Icon,
              title: `Automate with ${bot.name}`,
              description: bot.summary ?? `Launch a workflow powered by ${bot.name}.`,
              href: `/dashboard/installs/${bot.slug ?? bot.id}`,
              accent: ACCENT_GRADIENTS[index % ACCENT_GRADIENTS.length] ?? ACCENT_GRADIENTS[0]!,
            } satisfies PrimaryActionCard;
          });
          setPrimaryActions(dynamicActions);

          const dynamicQuickWins: QuickWinCard[] = mappedBots.slice(0, 4).map((bot, index) => {
            const Icon = QUICK_WIN_ICONS[index % QUICK_WIN_ICONS.length] ?? Clock3;
            const detail = bot.summary
              ? bot.summary
              : `Spin up ${bot.name} to assist with ${bot.category ?? "team"} workflows.`;
            return {
              icon: Icon,
              title: bot.name,
              detail,
            } satisfies QuickWinCard;
          });
          setQuickWins(dynamicQuickWins);

          const dynamicResources: ResourceLink[] = mappedBots.slice(0, 3).map((bot) => {
            const description = bot.summary
              ? bot.summary
              : `Set ${bot.name} loose on your ${bot.category ?? "workspace"} tasks.`;
            return {
              title: `${bot.name} playbook`,
              description,
              href: `/dashboard/installs/${bot.slug ?? bot.id}`,
            } satisfies ResourceLink;
          });
          setResources(dynamicResources);

          const dynamicRhythm: DailyRhythmEntry[] = mappedRuns.slice(0, 3).map((run, index) => {
            const timeSlots = ["08:00", "11:30", "16:00", "20:00"];
            const slot = timeSlots[index % timeSlots.length] ?? "10:00";
            const detail = run.status === "succeeded"
              ? `${run.botName} completed its workflow successfully.`
              : run.status
              ? `${run.botName} run ended with status ${run.status}.`
              : `${run.botName} started a workflow.`;
            return {
              title: `${slot} — ${run.botName}`,
              detail,
            } satisfies DailyRhythmEntry;
          });
          if (dynamicRhythm.length > 0) {
            setDailyRhythm(dynamicRhythm);
          }
        } else {
          setPrimaryActions(FALLBACK_PRIMARY_ACTIONS);
          setQuickWins(FALLBACK_QUICK_WINS);
          setResources(FALLBACK_RESOURCES);
          setDailyRhythm(FALLBACK_DAILY_RHYTHM);
        }
      } catch (error) {
        console.error("Failed to load dashboard", error);
        if (cancelled) return;
        setPrimaryActions(FALLBACK_PRIMARY_ACTIONS);
        setQuickWins(FALLBACK_QUICK_WINS);
        setResources(FALLBACK_RESOURCES);
        setDailyRhythm(FALLBACK_DAILY_RHYTHM);
      } finally {
        if (!cancelled) {
          setIsLoadingData(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (bots.length > 0 && !chatBotId) {
      setChatBotId(bots[0]!.id);
    }
  }, [bots, chatBotId]);

  const initials = useMemo(() => {
    if (profile?.fullName) {
      return profile.fullName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    if (profile?.email) {
      return profile.email.slice(0, 2).toUpperCase();
    }
    return "BH";
  }, [profile]);

  const displayName = profile?.fullName || profile?.email || "Bothive member";
  const firstName = displayName.split(" ")[0] ?? displayName;
  const activeChatBot = useMemo(() => bots.find((bot) => bot.id === chatBotId) ?? bots[0] ?? null, [bots, chatBotId]);
  const canChat = Boolean(activeChatBot?.capabilities?.includes("general.respond"));

  const quickStats = useMemo(
    () => [
      {
        label: "Runs today",
        value: stats.totalRuns !== null ? stats.totalRuns.toString() : "—",
        caption: "Completed orchestrations",
      },
      {
        label: "Success rate",
        value: stats.successRate !== null ? `${stats.successRate}%` : "—",
        caption: "Stable automations",
      },
      {
        label: "Active bots",
        value: stats.activeBots.toString(),
        caption: "Deployed units",
      },
    ],
    [stats]
  );

  const renderSidebar = (onNavigate?: () => void) => (
    <>
      <Link href="/" className="flex items-center gap-3">
        <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl">
          <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#7C3AED]/30 via-[#4338CA]/20 to-transparent blur-md" />
          <Image src="/Logo2.png" alt="Bothive" width={32} height={32} className="relative z-10 h-8 w-8" priority />
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-[0.35em] text-white/80">BOTHIVE</span>
          <span className="text-[10px] uppercase tracking-[0.32em] text-white/40">Mission control</span>
        </div>
      </Link>

      <div className="mt-8 flex flex-1 flex-col">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">Navigation</p>
          <nav className="mt-4 space-y-2">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => onNavigate?.()}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "border-white/20 bg-white/10 text-white shadow-[0_24px_60px_rgba(124,58,237,0.32)]"
                      : "border-transparent text-white/60 hover:border-white/10 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition group-hover:border-white/20 group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{link.label}</span>
                  <span
                    className={cn(
                      "ml-auto h-2 w-2 rounded-full transition",
                      isActive ? "bg-white" : "bg-white/20 group-hover:bg-white/60"
                    )}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#211046]/70 via-[#120b2c]/80 to-[#050413]/90 p-5 shadow-[0_36px_80px_rgba(14,10,40,0.55)]">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Operations summary</p>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Total runs</span>
              <span className="text-white/90">{stats.totalRuns ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Success rate</span>
              <span className="text-white/90">{stats.successRate !== null ? `${stats.successRate}%` : "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Active bots</span>
              <span className="text-white/90">{stats.activeBots}</span>
            </div>
          </div>
          <Link
            href="/dashboard/activity"
            onClick={() => onNavigate?.()}
            className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-violet-200 transition hover:text-white"
          >
            View analytics trail
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-auto space-y-4">
          <Link
            href="/builder"
            onClick={() => onNavigate?.()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#4338CA] to-[#0EA5E9] px-4 py-3 text-sm font-semibold text-white shadow-[0_25px_65px_rgba(67,56,202,0.4)] transition hover:shadow-[0_30px_80px_rgba(14,165,233,0.45)]"
          >
            <Sparkles className="h-4 w-4" /> Launch new automation
          </Link>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 p-4">
            {profile?.avatarUrl ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/20">
                <Image src={profile.avatarUrl} alt={displayName} fill sizes="40px" className="object-cover" />
              </div>
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold text-white/80">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white/90">{displayName}</p>
              <p className="truncate text-[11px] uppercase tracking-[0.28em] text-white/45">Secure workspace</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    if (!activeChatBot) {
      setChatError("Select a bot to start chatting.");
      return;
    }
    if (!canChat) {
      setChatError("This bot doesn’t include a conversational capability yet.");
      return;
    }

    const userMessage = { id: crypto.randomUUID(), role: "user" as const, content: chatInput.trim() };
    const nextHistory = [...chatMessages, userMessage];
    setChatMessages(nextHistory);
    setChatInput("");
    setChatError(null);
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId: activeChatBot.id,
          steps: [
            {
              agentId: "general.respond",
              input: {
                prompt: userMessage.content,
                history: nextHistory,
              },
            },
          ],
          context: {
            chatHistory: nextHistory,
          },
        }),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details?.error ?? "Bot run failed");
      }

      const result = (await response.json()) as RunResult & { output?: string };
      const assistantOutput = result.output ?? "No response received.";
      setChatMessages([...nextHistory, { id: crypto.randomUUID(), role: "assistant", content: assistantOutput }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to reach the bot.";
      setChatError(message);
      setChatMessages(chatMessages);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030008] text-white">
      <PageLoadingOverlay show={loading || isLoadingData} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.25),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(14,165,233,0.2),transparent_60%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-5 pb-16 pt-8 sm:px-8 lg:px-10 xl:flex-row">
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="hidden w-full max-w-[260px] shrink-0 flex-col rounded-[32px] border border-white/10 bg-black/60 p-6 shadow-[0_40px_120px_rgba(8,5,25,0.55)] backdrop-blur-2xl xl:flex"
        >
          {renderSidebar()}
        </motion.aside>

        <div className="flex-1">
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-7 flex items-center justify-between rounded-3xl border border-white/10 bg-black/40 px-5 py-4 backdrop-blur-xl sm:px-7"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 shadow-[0_20px_50px_rgba(9,6,28,0.45)] transition hover:border-white/20 hover:text-white xl:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">Welcome back</p>
                <h1 className="text-xl font-semibold text-white sm:text-2xl">{firstName}, your command center is live</h1>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.28em] text-white/60">
              <Settings className="hidden h-4 w-4 sm:inline" />
              <span>{profile?.email ?? "Personal workspace"}</span>
            </div>
          </motion.header>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.25),transparent_65%)] p-8 backdrop-blur-2xl sm:p-10"
          >
            <div className="pointer-events-none absolute inset-0 border border-white/10/60 [mask:linear-gradient(135deg,rgba(255,255,255,0.1),transparent_55%)]" />
            <div className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.35),transparent_70%)]" />
            <div className="relative z-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-white/60">
                  <Sparkles className="h-4 w-4" /> Launch sequence ready
                </div>
                <h2 className="text-3xl font-semibold text-white sm:text-[2.6rem] sm:leading-tight">
                  Deploy automations that feel like a futuristic ops team
                </h2>
                <p className="max-w-xl text-sm text-white/70">
                  Your personalised mission control keeps automations, data signals, and support flows synchronised across tenant workspaces.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/hivestore"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-[0_24px_70px_rgba(255,255,255,0.3)] transition hover:bg-white/90"
                  >
                    <Layers className="h-4 w-4" /> Discover automations
                  </Link>
                  <Link
                    href="/builder"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 shadow-[0_24px_70px_rgba(13,10,40,0.45)] transition hover:border-white/40 hover:text-white"
                  >
                    <Plus className="h-4 w-4" /> Launch builder console
                  </Link>
                </div>
                <div className="grid gap-3 pt-4 sm:grid-cols-3">
                  {quickStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-[0_22px_60px_rgba(8,5,28,0.45)]"
                    >
                      <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">{stat.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                      <p className="text-xs text-white/50">{stat.caption}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/60 p-6 text-sm text-white/75 shadow-[0_30px_90px_rgba(12,12,12,0.5)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">Daily rhythm</h3>
                  {stats.totalRuns !== null ? (
                    <span className="text-[11px] uppercase tracking-[0.28em] text-white/50">
                      {stats.totalRuns} runs · {stats.successRate ?? 0}% success
                    </span>
                  ) : null}
                </div>
                <ul className="mt-5 space-y-3">
                  {dailyRhythm.map((entry) => (
                    <li key={entry.title} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-sm font-semibold text-white">{entry.title}</p>
                      <p className="text-xs text-white/60">{entry.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-12 grid gap-6 lg:grid-cols-[1.3fr_1fr]"
          >
            <div className="rounded-[32px] border border-white/10 bg-black/40 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Mission quick wins</h3>
                <Link href="/automations" className="text-[11px] uppercase tracking-[0.28em] text-white/50 hover:text-white">
                  View all
                </Link>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {quickWins.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-[#0d0a1f] p-5 text-white/75 shadow-[0_26px_70px_rgba(9,6,28,0.45)]">
                    <div className="flex items-center gap-3 text-sm font-semibold text-white">
                      <item.icon className="h-4 w-4 text-white/70" />
                      {item.title}
                    </div>
                    <p className="mt-2 text-xs text-white/55">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex h-full flex-col gap-5 rounded-[32px] border border-white/10 bg-black/40 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-white">Signal library</h3>
              <ul className="flex flex-col gap-4">
                {resources.map((resource) => (
                  <li key={resource.title} className="rounded-2xl border border-white/10 bg-[#0c091c] p-4">
                    <p className="text-sm font-semibold text-white/85">{resource.title}</p>
                    <p className="mt-1 text-xs text-white/60">{resource.description}</p>
                    <Link
                      href={resource.href}
                      className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-white/70 underline-offset-4 hover:text-white hover:underline"
                    >
                      Open
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mt-12 grid gap-6 lg:grid-cols-[1.35fr_1fr]"
          >
            <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.25),transparent_70%)] p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Bots in your workspace</h3>
                {isLoadingData ? (
                  <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-white/50">
                    <Loader2 className="h-4 w-4 animate-spin" /> Syncing
                  </span>
                ) : (
                  <Link href="/builder" className="text-[11px] uppercase tracking-[0.28em] text-white/50 hover:text-white">
                    Manage bots
                  </Link>
                )}
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {bots.length === 0 ? (
                  <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-black/40 px-5 py-10 text-center text-sm text-white/60">
                    Install your first bot to see tailored recommendations here.
                  </div>
                ) : (
                  bots.map((bot) => (
                    <div key={bot.id} className="rounded-2xl border border-white/10 bg-[#0d0a1f] p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-white/15 bg-white/10">
                          <Image src={bot.icon ?? FALLBACK_ICON} alt={bot.name} fill sizes="40px" className="object-contain" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{bot.name}</p>
                          <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">{bot.category ?? "general"}</p>
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-2 text-xs text-white/55">{bot.summary ?? "Configure this bot to automate your daily rituals."}</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-white/55">
                        <span>{bot.installs ? `${bot.installs.toLocaleString()} installs` : "Fresh install"}</span>
                        <Link href={`/dashboard/installs/${bot.slug ?? bot.id}`} className="text-white/80 underline-offset-4 hover:underline">
                          View
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-black/40 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Recent automations</h3>
                {stats.totalRuns !== null ? (
                  <span className="text-[11px] uppercase tracking-[0.28em] text-white/50">{stats.totalRuns} total runs</span>
                ) : null}
              </div>
              <div className="mt-5 space-y-3">
                {recentRuns.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-[#090716] px-4 py-6 text-center text-sm text-white/60">
                    Launch a workflow to see real-time activity logs.
                  </div>
                ) : (
                  recentRuns.map((run) => (
                    <div key={run.id} className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-[#090716] px-4 py-3 text-sm">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-white/50">
                        <span>{run.botName}</span>
                        <span>{run.createdAt ? new Date(run.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-white/65">
                        <span>Status: {run.status ?? "running"}</span>
                        {run.completedAt ? <span>Completed · {new Date(run.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span> : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mt-12 rounded-[32px] border border-white/10 bg-black/45 p-6 sm:p-8"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="w-full max-w-xl space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-white">Chat with your bot</h2>
                  {activeChatBot ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/60">
                      {activeChatBot.name}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-white/60">
                  Send a prompt and the bot will reply using its conversational capability. Use this space for quick guidance, recap actions, or test fresh automations.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/55">
                  <label className="flex items-center gap-2">
                    Bot
                    <select
                      value={chatBotId ?? ""}
                      onChange={(event) => {
                        setChatMessages([]);
                        setChatBotId(event.target.value || null);
                      }}
                      className="rounded-full border border-white/15 bg-black/70 px-3 py-1.5 text-xs uppercase tracking-[0.28em] text-white/80 focus:border-white/40 focus:outline-none"
                    >
                      {bots.map((bot) => (
                        <option key={bot.id} value={bot.id} className="bg-black text-white">
                          {bot.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span>
                    {canChat ? "Conversational ready" : "Add general.respond capability to chat"}
                  </span>
                </div>
              </div>
              <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-black/60 p-4">
                <div className="h-72 overflow-y-auto rounded-2xl border border-white/10 bg-black/80 p-4 text-sm">
                  {chatMessages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.28em] text-white/40">
                      Start a conversation to see messages here.
                    </div>
                  ) : (
                    <ul className="flex flex-col gap-4">
                      {chatMessages.map((message, index) => {
                        const isUser = message.role === "user";
                        const isAssistant = message.role === "assistant";
                        const bubbleClasses = isUser
                          ? "bg-gradient-to-br from-white/95 via-white to-white/85 text-black shadow-[0_18px_40px_rgba(255,255,255,0.15)]"
                          : isAssistant
                          ? "border border-white/10 bg-gradient-to-br from-[#201A42]/80 via-[#16122B]/85 to-[#0B0A15]/90 text-white shadow-[0_20px_45px_rgba(12,10,40,0.65)]"
                          : "border border-white/10 bg-black/50 text-white/70";

                        return (
                          <motion.li
                            key={message.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: index * 0.03 }}
                            className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                          >
                            <div className="max-w-[85%] space-y-2">
                              <span
                                className={`block text-[10px] uppercase tracking-[0.32em] ${
                                  isUser ? "text-white/60 text-right" : "text-white/55"
                                }`}
                              >
                                {isUser ? "You" : activeChatBot?.name ?? "System"}
                              </span>
                              <div className={`rounded-3xl px-4 py-3 backdrop-blur ${bubbleClasses}`}>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/85 [&>strong]:text-white">
                                  {message.content}
                                </p>
                              </div>
                            </div>
                          </motion.li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <form
                  className="mt-4 flex flex-col gap-3 md:flex-row"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleSendMessage();
                  }}
                >
                  <div className="flex-1">
                    <label className="sr-only" htmlFor="bot-message">
                      Message
                    </label>
                    <textarea
                      id="bot-message"
                      value={chatInput}
                      onChange={(event) => setChatInput(event.target.value)}
                      placeholder={canChat ? "Ask your bot for help…" : "This bot needs a conversational capability to respond."}
                      className="w-full rounded-2xl border border-white/15 bg-black/70 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                      rows={3}
                      disabled={!canChat || isChatLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!canChat || isChatLoading || !chatInput.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isChatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span>{isChatLoading ? "Thinking" : "Send"}</span>
                  </button>
                </form>
                {chatError ? <p className="mt-2 text-xs text-red-400">{chatError}</p> : null}
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      <AnimatePresence>
        {isSidebarOpen ? (
          <motion.div
            key="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur"
            onClick={() => setIsSidebarOpen(false)}
          >
            <motion.aside
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="absolute left-0 top-0 flex h-full w-[85%] max-w-[300px] flex-col gap-6 rounded-r-[32px] border border-white/10 bg-[#060312]/95 p-6 shadow-[0_40px_120px_rgba(8,5,25,0.65)]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition hover:border-white/20 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
              {renderSidebar(() => setIsSidebarOpen(false))}
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
