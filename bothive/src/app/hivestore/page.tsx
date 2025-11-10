"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Download,
  Filter,
  Globe2,
  Laptop,
  Layers,
  LineChart,
  Monitor,
  Play,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import AmbientBackdrop from "@/components/AmbientBackdrop";
import { cn } from "@/lib/utils";
import type { AgentDefinition } from "@/lib/agentTypes";

interface MarketplaceAgent extends AgentDefinition {
  author: string;
  rating: number;
  downloads: number;
  price?: number;
  category: string;
}

interface HighlightCollection {
  id: string;
  title: string;
  description: string;
  metric: string;
  range: string;
  icon: LucideIcon;
  accentDark: string;
  accentLight: string;
}

interface PulseMetric {
  id: string;
  label: string;
  change: string;
  trend: "up" | "down";
  description: string;
}

const MARKETPLACE_AGENTS: MarketplaceAgent[] = [
  {
    id: "agent-web-research",
    name: "Web Research Pro",
    description: "Advanced web research agent with citation tracking and knowledge synthesis pipelines.",
    skills: ["web_search", "citation_tracking", "summarization"],
    memoryKeys: ["research_context"],
    author: "Bothive Studio",
    rating: 4.8,
    downloads: 2140,
    price: 0,
    category: "research",
  },
  {
    id: "agent-ops-automation",
    name: "Ops Automation Mesh",
    description: "Automate stand-ups, incident routing, and CRM follow-ups without touching a workflow builder.",
    skills: ["ops_triage", "incident_routing", "crm_followups", "summaries"],
    memoryKeys: ["ops_state"],
    author: "Neuron Forge Labs",
    rating: 4.6,
    downloads: 1894,
    price: 19,
    category: "automation",
  },
  {
    id: "agent-growth-analyst",
    name: "Growth Analyst",
    description: "Blend product telemetry and marketing signals, then close the loop with auto-generated experiment briefs.",
    skills: ["analytics_stack", "forecasting", "report_automation"],
    memoryKeys: ["growth_context"],
    author: "Growthsmith",
    rating: 4.7,
    downloads: 1432,
    price: 24,
    category: "analytics",
  },
  {
    id: "agent-code-generator",
    name: "Code Author",
    description: "Generate production-ready code skeletons, add tests, and draft documentation in one click.",
    skills: ["code_generation", "testing", "documentation"],
    memoryKeys: ["project_context", "code_style"],
    author: "DevCorp",
    rating: 4.5,
    downloads: 972,
    price: 29,
    category: "development",
  },
  {
    id: "agent-data-analyst",
    name: "Signal Analyzer",
    description: "Analyze and visualize metric deltas with anomaly detection and executive-ready reporting.",
    skills: ["data_analysis", "visualization", "reporting", "anomaly_detection"],
    memoryKeys: ["data_sources"],
    author: "DataLabs",
    rating: 4.9,
    downloads: 2688,
    price: 0,
    category: "analytics",
  },
  {
    id: "agent-support-mesh",
    name: "Global Support Mesh",
    description: "Localized responders covering 12+ languages with sentiment-aware ticket classification.",
    skills: ["translation", "qa_matching", "sentiment"],
    memoryKeys: ["support_cases"],
    author: "Atlas Ops",
    rating: 4.7,
    downloads: 1554,
    price: 0,
    category: "support",
  },
];

const CURATION_FILTERS = [
  { id: "trending", label: "Trending Now" },
  { id: "featured", label: "Featured Hive" },
  { id: "new", label: "Fresh Drops" },
];

const CATEGORIES = ["all", "research", "automation", "analytics", "development", "support"];

const HIGHLIGHT_COLLECTIONS: HighlightCollection[] = [
  {
    id: "starter",
    title: "Starter Swarm",
    description: "Plug-and-play multi-role agents for new teams piloting their first hive.",
    metric: "1.1K installs this week",
    range: "4 agents",
    icon: Sparkles,
    accentDark: "from-[#c4b5fd]/40 via-transparent to-transparent",
    accentLight: "from-[#7c3aed]/10 via-transparent to-transparent",
  },
  {
    id: "automation",
    title: "Automation Grid",
    description: "Ops-first bundles covering stand-ups, incident triage, and CRM hygiene.",
    metric: "92% completion rate",
    range: "5 agents",
    icon: Workflow,
    accentDark: "from-[#22d3ee]/35 via-transparent to-transparent",
    accentLight: "from-[#0ea5e9]/15 via-transparent to-transparent",
  },
  {
    id: "insights",
    title: "Insights Lab",
    description: "Analyst copilots with dashboards, anomaly detection, and narrative reports.",
    metric: "Top pick for analytics",
    range: "3 agents",
    icon: LineChart,
    accentDark: "from-[#f472b6]/30 via-transparent to-transparent",
    accentLight: "from-[#ec4899]/12 via-transparent to-transparent",
  },
  {
    id: "global-support",
    title: "Global Support Mesh",
    description: "Localized responders with compliance-ready transcripts and real-time QA.",
    metric: "4.7★ average rating",
    range: "6 agents",
    icon: Globe2,
    accentDark: "from-[#34d399]/30 via-transparent to-transparent",
    accentLight: "from-[#22c55e]/12 via-transparent to-transparent",
  },
];

const PULSE_METRICS: PulseMetric[] = [
  {
    id: "activation",
    label: "Activation",
    change: "+18%",
    trend: "up",
    description: "Teams launching workflows after install",
  },
  {
    id: "retention",
    label: "Retention",
    change: "+9%",
    trend: "up",
    description: "Active bots after 14 days",
  },
  {
    id: "latency",
    label: "Turnaround",
    change: "-22%",
    trend: "down",
    description: "Median task completion time",
  },
];

const INSIGHTS = [
  { label: "Most installed category", value: "Research suites" },
  { label: "Fastest growing", value: "Automation" },
  { label: "Median install time", value: "2m 14s" },
];

const MOTION_CONTAINER = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const MOTION_CARD = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 26 } },
};

export default function HiveStorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [curation, setCuration] = useState<string>("trending");

  const filteredAgents = useMemo(() => {
    const base = MARKETPLACE_AGENTS.filter((agent) => {
      const matchesSearch =
        agent.name.toLowerCase().includes(search.toLowerCase()) ||
        (agent.description?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
        agent.author.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || agent.category === category;
      return matchesSearch && matchesCategory;
    });

    const curated = base.filter((agent) => {
      if (curation === "featured") {
        return agent.rating >= 4.7 || (agent.price ?? 0) > 0;
      }
      if (curation === "new") {
        return agent.downloads <= 1000;
      }
      return true;
    });

    const ordered = [...curated].sort((a, b) => {
      if (curation === "new") {
        return a.downloads - b.downloads;
      }
      if (curation === "featured") {
        return b.rating - a.rating;
      }
      return b.downloads - a.downloads;
    });

    return ordered;
  }, [search, category, curation]);

  const heroDeck = useMemo(() => {
    if (filteredAgents.length === 0) {
      return MARKETPLACE_AGENTS.slice(0, 3);
    }
    return filteredAgents.slice(0, 3);
  }, [filteredAgents]);

  const heroHighlight = heroDeck[0] ?? null;
  const secondaryHighlights = heroDeck.slice(1);
  const activeCuration = CURATION_FILTERS.find((filter) => filter.id === curation)?.label ?? "Trending Now";

  const getPriceLabel = (agent: MarketplaceAgent) => {
    if (agent.price == null || agent.price === 0) {
      return agent.price === 0 ? "Included" : "Free trial";
    }
    return `$${agent.price}`;
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-700 text-slate-100 transition-colors duration-300 dark:bg-[#05060f] dark:text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-[-280px] h-[520px] rounded-full bg-[radial-gradient(circle,_rgba(124,58,237,0.16),_transparent_65%)] blur-3xl dark:bg-[radial-gradient(circle,_rgba(167,139,250,0.22),_rgba(8,6,14,0.85)_72%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-20 mb-10 flex items-center justify-between rounded-2xl border border-slate-200/60 bg-black/75 px-5 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-md transition dark:border-white/12 dark:bg-[#0a0e1d]/85 dark:shadow-[0_24px_65px_rgba(5,6,16,0.6)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed]/85 to-[#4c1d95] text-white shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-300">Hive Store</p>
              <h1 className="text-base font-semibold">Discover, launch, and publish bots</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/builder"
              className="hidden rounded-full border border-slate-200/60 px-4 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-500/50 hover:text-indigo-600 dark:border-white/15 dark:text-slate-200 dark:hover:border-indigo-400/60 dark:hover:text-indigo-200 sm:inline-flex"
            >
              Open builder
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/60 bg-black/80 p-8 shadow-[0_45px_120px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/12 dark:bg-[#0d1224]/80 dark:shadow-[0_55px_145px_rgba(5,6,16,0.75)]">
          <AmbientBackdrop className="opacity-0 dark:opacity-70" maskClassName="dark:[mask-image:radial-gradient(ellipse_at_top,transparent_18%,black)]" />
          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-start">
            <div className="max-w-xl space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-black/60 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-slate-500 dark:border-white/20 dark:bg-white/10 dark:text-slate-200">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                App-store inspired
              </span>
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
                  The Hive Store is now its own destination—built for pocket discovery and desktop launches.
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  New sign-ups drop here first. Scroll to explore featured installs, curated collections, and live stats. Install on mobile, then graduate to desktop or laptop when you7re ready to build, govern, or monetize.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    title: "Mobile explorers",
                    description: "Browse listings, watch demos, and add favorites right from your phone.",
                    icon: Smartphone,
                  },
                  {
                    title: "Developers",
                    description: "Switch to a laptop to design agents, wire manifests, and ship updates.",
                    icon: Laptop,
                  },
                  {
                    title: "Business HQ",
                    description: "Use a desktop for analytics, governance, and billing workflows.",
                    icon: Monitor,
                  },
                ].map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.title}
                      className="rounded-2xl border border-slate-200/65 bg-black/60 p-4 text-sm text-slate-700 shadow-sm transition hover:-translate-y-1 hover:border-indigo-400/50 hover:shadow-md dark:border-white/12 dark:bg-[#111730]/80 dark:text-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 text-indigo-600 dark:from-indigo-400/20 dark:to-indigo-500/20 dark:text-indigo-200">
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{card.title}</p>
                      </div>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{card.description}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Link
                  href="#catalog"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7c3aed] via-[#6056ff] to-[#4936ff] px-5 py-2 font-semibold text-white shadow-[0_20px_55px_rgba(93,80,255,0.35)] transition hover:-translate-y-0.5"
                >
                  Explore catalog
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-4 py-2 font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-500/50 hover:text-indigo-600 dark:border-white/15 dark:text-slate-200 dark:hover:border-indigo-400/60 dark:hover:text-indigo-200"
                >
                  Start building
                </Link>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {heroHighlight ? (
                <div className="rounded-[28px] border border-slate-200/70 bg-white/70 p-6 text-slate-700 shadow-[0_28px_85px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 dark:border-white/12 dark:bg-[#101628]/85 dark:text-slate-200 dark:shadow-[0_45px_120px_rgba(5,6,16,0.55)]">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
                    <span>Spotlight</span>
                    <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-200">
                      <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
                      {heroHighlight.category}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">{heroHighlight.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{heroHighlight.description}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {heroHighlight.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-slate-600 dark:border-white/12 dark:bg-white/5 dark:text-slate-200"
                      >
                        {skill.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                    <span className="inline-flex items-center gap-2">
                      <Download className="h-4 w-4" /> {heroHighlight.downloads.toLocaleString()} installs
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Star className="h-4 w-4 text-indigo-500" fill="#7c3aed" /> {heroHighlight.rating}
                    </span>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(51,65,85,0.35)] transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-900"
                    >
                      Install spotlight
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{getPriceLabel(heroHighlight)}</span>
                  </div>
                </div>
              ) : (
                <div className="h-72 rounded-[28px] border border-dashed border-slate-200" />
              )}

              {secondaryHighlights.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {secondaryHighlights.map((agent) => (
                    <div
                      key={agent.id}
                      className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 text-sm text-slate-600 shadow-sm transition hover:-translate-y-1 hover:border-indigo-400/50 dark:border-white/12 dark:bg-[#0f1528]/80 dark:text-slate-200"
                    >
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-300">
                        <span>{agent.category}</span>
                        <span>{agent.rating}</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{agent.name}</h4>
                        <p className="line-clamp-2 text-slate-600 dark:text-slate-300">{agent.description}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                        <span>{getPriceLabel(agent)}</span>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-3 py-1 font-semibold uppercase tracking-[0.28em] text-slate-600 transition hover:border-indigo-400/60 hover:text-indigo-600 dark:border-white/12 dark:text-slate-200"
                        >
                          Get
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="catalog" className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-[32px] border border-slate-200/70 bg-white/80 p-6 shadow-[0_24px_75px_rgba(15,23,42,0.1)] backdrop-blur dark:border-white/12 dark:bg-[#0c1222]/80 dark:shadow-[0_45px_120px_rgba(5,6,16,0.55)]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search agents, studios, or workflows"
                className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-12 py-3 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 dark:border-white/10 dark:bg-[#0f1528] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400"
              />
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-300">Browse curations</p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
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
                            ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                            : "border border-slate-200/70 text-slate-600 hover:border-indigo-400/60 hover:text-indigo-600 dark:border-white/15 dark:text-slate-300 dark:hover:border-indigo-400/60 dark:hover:text-indigo-200"
                        )}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-300">Categories</p>
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
                            ? "bg-indigo-600 text-white shadow"
                            : "border border-slate-200/70 text-slate-600 hover:border-indigo-400/60 hover:text-indigo-600 dark:border-white/15 dark:text-slate-300 dark:hover:border-indigo-400/60 dark:hover:text-indigo-200"
                        )}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {INSIGHTS.map((insight) => (
                  <div
                    key={insight.label}
                    className="rounded-2xl border border-slate-200/70 bg-white/75 px-3 py-3 text-xs uppercase tracking-[0.28em] text-slate-500 shadow-sm dark:border-white/12 dark:bg-white/5 dark:text-slate-300"
                  >
                    <span className="block text-slate-400 dark:text-slate-500">{insight.label}</span>
                    <span className="mt-1 block text-sm font-semibold text-slate-700 dark:text-slate-100">{insight.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[24px] border border-slate-200/65 bg-white/80 p-4 text-sm text-slate-600 shadow-sm dark:border-white/12 dark:bg-[#0e1529]/80 dark:text-slate-300">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
                <span>Pulse monitor</span>
                <Play className="h-4 w-4" />
              </div>
              <div className="mt-3 space-y-3">
                {PULSE_METRICS.map((metric) => (
                  <div
                    key={metric.id}
                    className="rounded-xl border border-slate-200/65 bg-white/70 px-3 py-2 text-sm text-slate-600 shadow-sm dark:border-white/12 dark:bg-white/5 dark:text-slate-300"
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-300">
                      <span>{metric.label}</span>
                      <span className={metric.trend === "down" ? "text-rose-500" : "text-emerald-500"}>{metric.change}</span>
                    </div>
                    <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">{metric.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200/65 bg-white/80 p-4 text-sm text-slate-600 shadow-sm dark:border-white/12 dark:bg-[#0e1529]/80 dark:text-slate-300">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
                <span>Creator spotlights</span>
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <div className="mt-3 space-y-3">
                {[
                  {
                    id: "neuron",
                    studio: "Neuron Forge Labs",
                    delta: "+312 installs",
                    focus: "Automation rituals built for ops-heavy teams scaling async.",
                    tags: ["automation", "ops"],
                  },
                  {
                    id: "lumen",
                    studio: "Lumen Research Collective",
                    delta: "+188 watchlists",
                    focus: "Deep research copilots with citation guardrails and audit trails.",
                    tags: ["research", "analysis"],
                  },
                ].map((spotlight) => (
                  <div
                    key={spotlight.id}
                    className="rounded-xl border border-slate-200/65 bg-white/70 p-3 shadow-sm dark:border-white/12 dark:bg-white/5"
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-300">
                      <span>{spotlight.studio}</span>
                      <span>{spotlight.delta}</span>
                    </div>
                    <p className="mt-2 text-[13px] text-slate-600 dark:text-slate-300">{spotlight.focus}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">
                      {spotlight.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-200/70 px-2.5 py-0.5 dark:border-white/12"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-12 rounded-[32px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_40px_110px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/12 dark:bg-[#0d1325]/85 dark:shadow-[0_45px_120px_rgba(5,6,16,0.6)]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:border-white/12 dark:bg-white/5 dark:text-slate-300">
                Curated collections
              </span>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white sm:text-[1.8rem]">
                Launch-ready packs tuned for {activeCuration.toLowerCase()}
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                Mix and match bundles engineered to drop into your hive with zero cold-start time. Each collection ships with shared memory keys, compatibility notes, and tuning recipes.
              </p>
            </div>
            <span className="inline-flex rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-500 dark:border-white/12 dark:bg-white/5 dark:text-slate-300">
              {filteredAgents.length} agents visible
            </span>
          </div>
          <div className="relative mt-6 -mx-2 flex gap-4 overflow-x-auto px-2 pb-2 sm:mt-8">
            {HIGHLIGHT_COLLECTIONS.map((collection) => {
              const Icon = collection.icon;
              return (
                <div
                  key={collection.id}
                  className="group relative min-w-[240px] snap-start rounded-[26px] border border-slate-200/70 bg-white/75 p-5 shadow-[0_28px_85px_rgba(15,23,42,0.12)] transition duration-300 hover:-translate-y-1 dark:border-white/12 dark:bg-[#111730]/85 dark:shadow-[0_30px_95px_rgba(5,6,16,0.6)] sm:min-w-[280px]"
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 rounded-[26px] opacity-0 transition duration-300 group-hover:opacity-100",
                      "bg-gradient-to-br",
                      collection.accentLight,
                      "dark:" + collection.accentDark
                    )}
                  />
                  <div className="relative flex h-full flex-col justify-between gap-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/70 bg-white/80 text-indigo-600 shadow-sm dark:border-white/15 dark:bg-white/10 dark:text-indigo-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:border-white/12 dark:bg-white/5 dark:text-slate-300">
                        {collection.range}
                      </span>
                    </div>
                    <div className="space-y-2 text-slate-600 dark:text-slate-300">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{collection.title}</h4>
                      <p className="text-sm">{collection.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                      <span>{collection.metric}</span>
                      <button className="inline-flex items-center gap-1 rounded-full border border-slate-200/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600 transition hover:border-indigo-400/60 hover:text-indigo-600 dark:border-white/12 dark:text-slate-300 dark:hover:border-indigo-400/60 dark:hover:text-indigo-200">
                        Preview lineup
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <motion.section
          className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3"
          variants={MOTION_CONTAINER}
          initial="hidden"
          animate="show"
        >
          {filteredAgents.map((agent) => (
            <motion.div
              key={agent.id}
              variants={MOTION_CARD}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.995 }}
              className="group relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/80 p-6 text-slate-600 shadow-[0_32px_90px_rgba(15,23,42,0.12)] transition dark:border-white/12 dark:bg-[#0f1528]/85 dark:text-slate-300 dark:shadow-[0_40px_110px_rgba(5,6,16,0.55)]"
            >
              <div className="relative flex h-full flex-col gap-5">
                <span className="text-[10px] uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300">{activeCuration}</span>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:border-white/12 dark:bg-white/5 dark:text-slate-300">
                      {agent.category}
                    </div>
                    <h4 className="text-xl font-semibold text-slate-900 dark:text-white">{agent.name}</h4>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{agent.author}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-slate-200/70 bg-white/75 px-2.5 py-1 text-sm text-slate-600 shadow-sm dark:border-white/12 dark:bg-white/5 dark:text-slate-200">
                    <Star className="h-4 w-4 text-indigo-500" fill="#7c3aed" />
                    {agent.rating}
                  </div>
                </div>

                <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{agent.description}</p>

                <div className="flex flex-wrap gap-2 text-xs">
                  {agent.skills.slice(0, 4).map((skill, index) => (
                    <span
                      key={`${agent.id}-skill-${index}`}
                      className="rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-slate-600 dark:border-white/12 dark:bg-white/5 dark:text-slate-200"
                    >
                      {skill.replace(/_/g, " ")}
                    </span>
                  ))}
                  {agent.skills.length > 4 && (
                    <span className="rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-slate-600 dark:border-white/12 dark:bg-white/5 dark:text-slate-200">
                      +{agent.skills.length - 4}
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-white/12 dark:bg-white/5 dark:text-slate-200">
                  <span className="inline-flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    {agent.downloads.toLocaleString()}
                  </span>
                  <span className={agent.price === 0 || agent.price == null ? "text-indigo-600 dark:text-indigo-200" : "text-slate-700 dark:text-slate-200"}>
                    {getPriceLabel(agent)}
                  </span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-900 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/20 dark:bg-white dark:text-slate-900"
                  >
                    Install
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.section>

        {filteredAgents.length === 0 && (
          <div className="mt-10 rounded-[32px] border border-slate-200/70 bg-white/85 py-16 text-center text-slate-500 shadow-sm dark:border-white/12 dark:bg-[#0f1528]/80 dark:text-slate-300">
            <p>No agents match your filters yet. Adjust your search or check back tomorrow for fresh drops.</p>
          </div>
        )}

        <footer className="mt-16 rounded-[28px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur dark:border-white/12 dark:bg-[#0d1325]/85 dark:shadow-[0_40px_110px_rgba(5,6,16,0.55)]">
          <div className="flex flex-col gap-5 text-sm text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Ready to launch your own listing?</h4>
              <p className="mt-1 max-w-xl text-slate-600 dark:text-slate-300">
                Complete the listing checklist inside the builder, submit for review, and go live in under 24 hours. We 92ll keep your analytics front and center here in the Hive Store.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/builder?section=store"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-4 py-2 font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-400/60 hover:text-indigo-600 dark:border-white/12 dark:text-slate-200 dark:hover:border-indigo-400/60 dark:hover:text-indigo-200"
              >
                Open listing toolkit
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs/hivelang"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 font-semibold text-white shadow hover:-translate-y-0.5 dark:bg-white dark:text-slate-900"
              >
                Review docs
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
