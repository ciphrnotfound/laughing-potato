"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppSession } from "@/lib/app-session-context";
import { supabase } from "@/lib/supabase";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Users,
  BarChart3,
  Activity,
  TrendingUp,
  Clock,
  DollarSign,
  Settings,
  Plus,
  MoreHorizontal,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  PenSquare,
  UserPlus,
  Network,
  CalendarDays,
  SlidersHorizontal
} from "lucide-react";
import DashboardSidebarWrapper from "@/components/DashboardSidebarWrapper";
import AgentBuilder from "@/components/AgentBuilder";
import Orchestrator from "@/components/Orchestrator";
import Marketplace from "@/components/Marketplace";
import MemoryTracker from "@/components/MemoryTracker";
import Integrations from "@/components/Integrations";
import { AgentDefinition } from "@/lib/agentTypes";
import { cn } from "@/lib/utils";
import DashboardHeader from "@/components/DashboardHeader";

type DashboardTab = "overview" | "agents" | "orchestrator" | "marketplace" | "memory" | "integrations";

const TIMEFRAME_OPTIONS = ["12 months", "30 days", "7 days", "24 hours"] as const;

type TimeframeOption = typeof TIMEFRAME_OPTIONS[number];

const MRR_SERIES: Record<TimeframeOption, { label: string; value: number }[]> = {
  "12 months": [
    { label: "Jan", value: 15400 },
    { label: "Feb", value: 15840 },
    { label: "Mar", value: 16280 },
    { label: "Apr", value: 16720 },
    { label: "May", value: 17100 },
    { label: "Jun", value: 17560 },
    { label: "Jul", value: 17820 },
    { label: "Aug", value: 18140 },
    { label: "Sep", value: 18360 },
    { label: "Oct", value: 18520 },
    { label: "Nov", value: 18680 },
    { label: "Dec", value: 18880 },
  ],
  "30 days": [
    { label: "Day 1", value: 18040 },
    { label: "Day 5", value: 18110 },
    { label: "Day 10", value: 18280 },
    { label: "Day 15", value: 18410 },
    { label: "Day 20", value: 18540 },
    { label: "Day 25", value: 18620 },
    { label: "Day 30", value: 18880 },
  ],
  "7 days": [
    { label: "Mon", value: 18520 },
    { label: "Tue", value: 18580 },
    { label: "Wed", value: 18620 },
    { label: "Thu", value: 18660 },
    { label: "Fri", value: 18740 },
    { label: "Sat", value: 18810 },
    { label: "Sun", value: 18880 },
  ],
  "24 hours": [
    { label: "02:00", value: 18740 },
    { label: "06:00", value: 18780 },
    { label: "10:00", value: 18820 },
    { label: "14:00", value: 18840 },
    { label: "18:00", value: 18860 },
    { label: "22:00", value: 18870 },
    { label: "24:00", value: 18880 },
  ],
};

const SUMMARY_METRICS = [
  { label: "Total members", value: "4,862", change: "+9.2%" },
  { label: "Paid members", value: "2,671", change: "+6.6%" },
  { label: "Email open rate", value: "82%", change: "+8.1%" },
];

const ACTION_SHORTCUTS = [
  {
    title: "Compose mission update",
    description: "Share the latest deployment status with the crew.",
    icon: PenSquare,
    accent: "from-[#8A2FFF] to-[#4F2EFF]",
  },
  {
    title: "Invite collaborator",
    description: "Bring teammates into Bothive mission control.",
    icon: UserPlus,
    accent: "from-[#28D1FF] to-[#1276FF]",
  },
];

const RECENT_POSTS = [
  {
    id: "post-1",
    title: "UX review presentations",
    excerpt: "How our product design team prepares async show-and-tell updates.",
    gradient: "from-[#8A2FFF] via-[#5936FF] to-[#130A2C]",
  },
  {
    id: "post-2",
    title: "Migrating to Linear 101",
    excerpt: "A tactical breakdown of migrating workflows without losing momentum.",
    gradient: "from-[#28D1FF] via-[#1763FF] to-[#0A1226]",
  },
];

const TOP_MEMBERS = [
  { name: "Phoenix Baker", detail: "Member since Feb 2025" },
  { name: "Lana Steiner", detail: "Member since Jan 2025" },
  { name: "Demi Wilkinson", detail: "Member since Mar 2025" },
  { name: "Candice Wu", detail: "Member since Feb 2025" },
  { name: "Natali Craig", detail: "Member since Jan 2025" },
  { name: "Orlando Diggs", detail: "Member since Apr 2025" },
  { name: "Drew Cano", detail: "Member since Apr 2025" },
];

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeOption>("12 months");

  const chartSeries = MRR_SERIES[activeTimeframe] ?? [];

  const chartGeometry = useMemo(() => {
    if (!chartSeries.length) {
      return { line: "", area: "", min: 0, max: 0 };
    }

    const values = chartSeries.map((point) => point.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = Math.max(maxValue - minValue, 1);
    const coords = chartSeries.map((point, index) => {
      const x = (index / Math.max(chartSeries.length - 1, 1)) * 100;
      const y = 85 - ((point.value - minValue) / range) * 70;
      return { x, y };
    });

    const line = coords
      .map((coord, index) => `${index === 0 ? "M" : "L"} ${coord.x.toFixed(2)} ${coord.y.toFixed(2)}`)
      .join(" ");

    const area = [
      `M ${coords[0]?.x.toFixed(2) ?? 0} 100`,
      ...coords.map((coord) => `L ${coord.x.toFixed(2)} ${coord.y.toFixed(2)}`),
      `L ${coords.at(-1)?.x.toFixed(2) ?? 100} 100`,
      "Z",
    ].join(" ");

    return { line, area, min: minValue, max: maxValue };
  }, [chartSeries]);

  const currentMRR = chartSeries.at(-1)?.value ?? 0;
  const startingMRR = chartSeries[0]?.value ?? 0;
  const mrrDeltaPercent = startingMRR ? ((currentMRR - startingMRR) / startingMRR) * 100 : 0;

  const dashboardStats: { label: string; value: string; change: string; icon: LucideIcon }[] = [
    {
      label: "Active agents",
      value: agents.length.toString(),
      change: "+12%",
      icon: Zap,
    },
    {
      label: "Workflows",
      value: "8",
      change: "+3",
      icon: Network,
    },
    {
      label: "Success rate",
      value: "94.2%",
      change: "+2.1%",
      icon: TrendingUp,
    },
    {
      label: "Total interactions",
      value: "1.2K",
      change: "+156",
      icon: Activity,
    },
  ];

  useEffect(() => {
    // Get tab from URL
    const tab = searchParams?.get("tab") as DashboardTab;
    if (tab && ["overview", "agents", "orchestrator", "marketplace", "memory", "integrations"].includes(tab)) {
      setActiveTab(tab);
    }
    fetchAgents();
  }, [searchParams]);

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
        
        if (data.agents.length === 0) {
          await fetch("/api/seed", { method: "POST" });
          const seedResponse = await fetch("/api/agents");
          if (seedResponse.ok) {
            const seedData = await seedResponse.json();
            setAgents(seedData.agents || []);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentSave = (agent: AgentDefinition) => {
    setAgents((prev) => [...prev, agent]);
    fetchAgents();
  };

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    if (tab === "overview") {
      router.push("/dashboard");
    } else {
      router.push(`/dashboard?tab=${tab}`);
    }
  };

  const stats = [
    { label: "Active Agents", value: agents.length, icon: Zap, change: "+12%", color: "purple" },
    { label: "Workflows", value: "8", icon: Network, change: "+3", color: "blue" },
    { label: "Success Rate", value: "94.2%", icon: TrendingUp, change: "+2.1%", color: "green" },
    { label: "Total Interactions", value: "1.2K", icon: Activity, change: "+156", color: "orange" },
  ];

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white min-h-screen flex relative overflow-hidden transition-colors duration-300">
      {/* Futuristic grid background */}
      <div className="fixed inset-0 opacity-20 dark:opacity-30 pointer-events-none">
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        {/* Diagonal grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(124,58,237,0.02)_1px,transparent_1px),linear-gradient(-45deg,rgba(124,58,237,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(45deg,rgba(124,58,237,0.03)_1px,transparent_1px),linear-gradient(-45deg,rgba(124,58,237,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Gradient overlays */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-violet-500/3 dark:from-violet-500/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-violet-500/3 dark:from-violet-500/5 via-transparent to-transparent" />
      </div>

      {/* Sidebar */}
      <DashboardSidebarWrapper 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onCollapseChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 relative z-10",
        sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}>
        {/* Header */}
        <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "overview" && (
            <div className="relative p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-black/35 dark:text-white/35">Dashboard</p>
                    <h1 className="text-3xl sm:text-4xl font-semibold text-black dark:text-white">
                      Mission telemetry
                    </h1>
                    <p className="max-w-xl text-sm text-black/55 dark:text-white/55">
                      Monitor Bothive swarms, orchestrations, and customer momentum in a single control panel.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {TIMEFRAME_OPTIONS.map((option) => {
                      const isActive = option === activeTimeframe;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setActiveTimeframe(option)}
                          className={cn(
                            "rounded-full px-4 py-2 text-xs font-medium transition border",
                            isActive
                              ? "border-violet-500/80 bg-violet-500/10 text-violet-500"
                              : "border-black/10 bg-white/60 text-black/60 hover:border-black/20 hover:text-black dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/20"
                          )}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
                  <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/70 p-6 backdrop-blur-lg dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.18),transparent_65%)]" />
                    <div className="relative z-10 flex flex-col gap-6">
                      <header className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-black/50 dark:text-white/50">MRR</p>
                          <div className="mt-2 flex items-baseline gap-3">
                            <span className="text-3xl font-semibold text-black dark:text-white">
                              ${currentMRR.toLocaleString()}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-500">
                              <ArrowUpRight className="h-3 w-3" />
                              {mrrDeltaPercent >= 0 ? `+${mrrDeltaPercent.toFixed(1)}%` : `${mrrDeltaPercent.toFixed(1)}%`}
                            </span>
                          </div>
                          <p className="text-xs text-black/45 dark:text-white/45">Revenue trend across {activeTimeframe.toLowerCase()}.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-black/70 hover:border-black/20 dark:border-white/15 dark:bg-white/10 dark:text-white/70">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Select dates
                          </button>
                          <button className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-black/70 hover:border-black/20 dark:border-white/15 dark:bg-white/10 dark:text-white/70">
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            Filters
                          </button>
                        </div>
                      </header>

                      <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-b from-white via-white/80 to-white/60 dark:border-white/10 dark:from-transparent dark:via-white/5 dark:to-white/5">
                        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="mrr-area" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(124,58,237,0.32)" />
                              <stop offset="100%" stopColor="rgba(124,58,237,0)" />
                            </linearGradient>
                            <linearGradient id="mrr-line" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="rgba(167,139,250,1)" />
                              <stop offset="100%" stopColor="rgba(124,58,237,1)" />
                            </linearGradient>
                          </defs>
                          <path d={chartGeometry.area} fill="url(#mrr-area)" fillOpacity={0.9} />
                          <path d={chartGeometry.line} fill="none" stroke="url(#mrr-line)" strokeWidth={1.4} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-x-6 bottom-4 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-black/45 dark:text-white/45">
                          {chartSeries.map((point) => (
                            <span key={point.label}>{point.label}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.section>

                  <div className="space-y-6">
                    <motion.section
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.35 }}
                      className="rounded-3xl border border-black/10 bg-white/70 p-6 backdrop-blur-lg dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-black/50 dark:text-white/50">
                          Summary
                        </h2>
                        <button className="text-xs text-violet-500 hover:text-violet-400">View report</button>
                      </div>
                      <div className="mt-5 space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          {stats.map((stat, index) => (
                            <div key={index}>
                              <p className="text-xs uppercase tracking-[0.18em] text-black/45 dark:text-white/45">
                                {stat.label}
                              </p>
                              <p className="text-2xl font-semibold text-black dark:text-white">{stat.value}</p>
                              <p className="text-xs text-emerald-400">{stat.change}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.section>

                  <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.35 }}
                    className="rounded-3xl border border-black/10 bg-white/70 p-6 backdrop-blur-lg dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-black/50 dark:text-white/50">
                        Recent posts
                      </h2>
                      <button className="text-xs text-violet-500 hover:text-violet-400">Open library</button>
                    </div>
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {RECENT_POSTS.map((post) => (
                        <article
                          key={post.id}
                          className={cn(
                            "relative overflow-hidden rounded-2xl border border-black/10 bg-white/80 p-4 text-left transition hover:border-black/20 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:border-white/20",
                            `bg-gradient-to-br ${post.gradient}`
                          )}
                        >
                          <div className="space-y-2 text-white">
                            <p className="text-xs uppercase tracking-[0.18em] text-white/70">{post.id}</p>
                            <h3 className="text-lg font-semibold leading-tight">{post.title}</h3>
                            <p className="text-sm text-white/80">{post.excerpt}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </motion.section>
                </div>

                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.35 }}
                  className="grid gap-4 rounded-3xl border border-black/10 bg-white/70 p-6 backdrop-blur-lg dark:border-white/10 dark:bg-white/5 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
                >
                  <div className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-black/50 dark:text-white/50">
                      Activity feed
                    </h2>
                    <ul className="space-y-3 text-sm text-black/70 dark:text-white/70">
                      {agents.slice(0, 4).map((agent) => (
                        <li key={agent.id} className="flex items-center justify-between rounded-xl border border-black/10 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/10">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                              <Zap className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-black dark:text-white">{agent.name}</p>
                              <p className="text-xs text-black/45 dark:text-white/45">Agent deployed</p>
                            </div>
                          </div>
                          <span className="text-xs text-black/40 dark:text-white/50">moments ago</span>
                        </li>
                      ))}
                      {agents.length === 0 && (
                        <li className="rounded-xl border border-dashed border-black/15 bg-white/50 px-4 py-6 text-center text-sm text-black/45 dark:border-white/20 dark:bg-white/5 dark:text-white/50">
                          No agent activity yet. Seed the hive to populate this stream.
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-black/10 bg-white/80 p-5 dark:border-white/10 dark:bg-white/10">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-black/50 dark:text-white/50">Release notes</p>
                      <h3 className="mt-1 text-lg font-semibold text-black dark:text-white">Hive Store refresh</h3>
                      <p className="mt-2 text-sm text-black/55 dark:text-white/55">
                        Discover curated copilots, spotlighted vendors, and the newest orchestrations approved for the marketplace.
                      </p>
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-500 transition hover:border-violet-500/30 hover:text-violet-400">
                      Read changelog
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </motion.section>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab !== "overview" && (
            <div className="p-4 sm:p-6 lg:p-8">
              {loading ? (
                <div className="text-center py-12 text-white/60">Loading...</div>
              ) : (
                <>
                  {activeTab === "agents" && (
                    <div className="max-w-5xl mx-auto">
                      <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Agent Builder</h2>
                        <p className="text-white/60">
                          Create AI agents using our no-code interface or SDK
                        </p>
                      </div>
                      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-950/20 to-black border border-white/10">
                        <AgentBuilder onSave={handleAgentSave} />
                      </div>
                    </div>
                  )}

                  {activeTab === "orchestrator" && (
                    <div className="h-[600px] sm:h-[800px] rounded-2xl bg-gradient-to-br from-purple-950/20 to-black border border-white/10 overflow-hidden">
                      <Orchestrator agents={agents} />
                    </div>
                  )}

                  {activeTab === "marketplace" && (
                    <div className="max-w-7xl mx-auto">
                      <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Agent Marketplace</h2>
                        <p className="text-white/60">
                          Discover, test, and integrate pre-built AI agents
                        </p>
                      </div>
                      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-950/20 to-black border border-white/10">
                        <Marketplace />
                      </div>
                    </div>
                  )}

                  {activeTab === "memory" && (
                    <div className="max-w-6xl mx-auto">
                      <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Memory & Learning</h2>
                        <p className="text-white/60">
                          Track agent interactions and shared memory
                        </p>
                      </div>
                      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-950/20 to-black border border-white/10">
                        <MemoryTracker />
                      </div>
                    </div>
                  )}

                  {activeTab === "integrations" && (
                    <div className="max-w-7xl mx-auto">
                      <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Integrations</h2>
                        <p className="text-white/60">
                          Connect Bothive to your favorite tools and automate workflows
                        </p>
                      </div>
                      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-950/20 to-black border border-white/10">
                        <Integrations />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

import DashboardHome from "./home";

export default function Dashboard() {
  return <DashboardHome />;
}
