"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Variants, Transition } from "framer-motion";
import {
  Search,
  Star,
  Download,
  TrendingUp,
  Filter,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
  Workflow,
  CircuitBoard,
  Zap,
  Globe2,
  LineChart,
  Layers,
  Cpu,
  Play,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AgentDefinition } from "@/lib/agentTypes";

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
  accent: string;
  icon: LucideIcon;
}

interface CreatorSpotlight {
  id: string;
  studio: string;
  monogram: string;
  focus: string;
  delta: string;
  categories: string[];
}

interface PulseMetric {
  id: string;
  label: string;
  change: string;
  trend: "up" | "down";
  description: string;
}

export default function Marketplace() {
  const [agents, setAgents] = useState<MarketplaceAgent[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [curation, setCuration] = useState<string>("trending");

  const categories = ["all", "research", "development", "automation", "analytics"];
  const curationFilters = [
    { id: "trending", label: "Trending Now" },
    { id: "featured", label: "Featured Hive" },
    { id: "new", label: "New Launches" },
  ];

  const collections: HighlightCollection[] = [
    {
      id: "starter",
      title: "Starter Swarm",
      description: "Plug-and-play multi-role agents curated for fresh teams and pilots.",
      metric: "1.1K installs this week",
      range: "4 agents",
      accent: "from-[#c4b5fd]/35 via-transparent to-transparent",
      icon: Sparkles,
    },
    {
      id: "automation-grid",
      title: "Automation Grid",
      description: "Ops-first bundles covering CRM follow-ups, stand-ups, and ticket triage.",
      metric: "92% completion rate",
      range: "5 agents",
      accent: "from-[#22d3ee]/30 via-transparent to-transparent",
      icon: Workflow,
    },
    {
      id: "insights-lab",
      title: "Insights Lab",
      description: "Analyst copilots with dashboards, anomaly detection, and reporting flows.",
      metric: "Top pick for analytics teams",
      range: "3 agents",
      accent: "from-[#f472b6]/30 via-transparent to-transparent",
      icon: CircuitBoard,
    },
    {
      id: "support-mesh",
      title: "Global Support Mesh",
      description: "Localized responders covering 12+ languages with sentiment routing.",
      metric: "4.7★ average rating",
      range: "6 agents",
      accent: "from-[#34d399]/30 via-transparent to-transparent",
      icon: Globe2,
    },
  ];

  const creatorSpotlights: CreatorSpotlight[] = [
    {
      id: "neuron-forge",
      studio: "Neuron Forge Labs",
      monogram: "NF",
      focus: "Automation rituals built for ops-heavy teams scaling async.",
      delta: "+312 installs this week",
      categories: ["automation", "ops"],
    },
    {
      id: "lumen-research",
      studio: "Lumen Research Collective",
      monogram: "LR",
      focus: "Deep research copilots with citation guardrails and audit trails.",
      delta: "+188 watchlists",
      categories: ["research", "analysis"],
    },
  ];

  useEffect(() => {
    // Simulate marketplace agents
    const mockAgents: MarketplaceAgent[] = [
      {
        id: "mkt-1",
        name: "Web Research Pro",
        description: "Advanced web research agent with citation tracking",
        skills: ["web_search", "citation_tracking", "summarization"],
        memoryKeys: ["research_context"],
        author: "Bothive Team",
        rating: 4.8,
        downloads: 1234,
        price: 0,
        category: "research",
      },
      {
        id: "mkt-2",
        name: "Code Generator",
        description: "Generate production-ready code from specifications",
        skills: ["code_generation", "testing", "documentation"],
        memoryKeys: ["project_context", "code_style"],
        author: "DevCorp",
        rating: 4.6,
        downloads: 892,
        price: 29,
        category: "development",
      },
      {
        id: "mkt-3",
        name: "Data Analyzer",
        description: "Analyze and visualize data from multiple sources",
        skills: ["data_analysis", "visualization", "reporting"],
        memoryKeys: ["data_sources"],
        author: "DataLabs",
        rating: 4.9,
        downloads: 2156,
        price: 49,
        category: "analytics",
      },
      {
        id: "mkt-4",
        name: "Slack Automation",
        description: "Automate Slack workflows and notifications",
        skills: ["slack_api", "workflow_automation"],
        memoryKeys: ["workspace_config"],
        author: "AutoBot Inc",
        rating: 4.7,
        downloads: 567,
        price: 19,
        category: "automation",
      },
      {
        id: "mkt-5",
        name: "Growth Analyst",
        description: "Blend marketing telemetry and CRM signals for growth experiments",
        skills: ["analytics_stack", "forecasting", "report_automation"],
        memoryKeys: ["growth_context"],
        author: "Growthsmith",
        rating: 4.5,
        downloads: 742,
        price: 24,
        category: "analytics",
      },
      {
        id: "mkt-6",
        name: "Global Support Desk",
        description: "Human-grade support triage with multilingual sentiment cues",
        skills: ["translation", "qa_matching", "sentiment"],
        memoryKeys: ["support_cases"],
        author: "Atlas Ops",
        rating: 4.7,
        downloads: 1289,
        price: 0,
        category: "automation",
      },
    ];

    setAgents(mockAgents);
  }, []);

  const curatedAgents = agents
    .filter((agent) => {
      const matchesSearch =
        agent.name.toLowerCase().includes(search.toLowerCase()) ||
        (agent.description?.toLowerCase() || "").includes(search.toLowerCase());
      const matchesCategory = category === "all" || agent.category === category;
      return matchesSearch && matchesCategory;
    })
    .filter((agent) => {
      if (curation === "featured") {
        return agent.rating >= 4.7 || (agent.price ?? 0) > 0;
      }
      if (curation === "new") {
        return agent.downloads < 1000;
      }
      return true;
    });

  const filteredAgents = [...curatedAgents].sort((a, b) => {
    if (curation === "new") {
      return a.downloads - b.downloads;
    }
    if (curation === "featured") {
      return b.rating - a.rating;
    }
    return b.downloads - a.downloads;
  });

  const fallbackHighlight = [...agents].sort((a, b) => b.downloads - a.downloads)[0];
  const curatedHighlight = filteredAgents[0] ?? fallbackHighlight ?? null;
  const activeCuration = curationFilters.find((filter) => filter.id === curation)?.label;

  const handleInstall = async (agent: MarketplaceAgent) => {
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agent),
      });

      if (response.ok) {
        alert(`${agent.name} installed successfully!`);
      }
    } catch (error) {
      console.error("Failed to install agent:", error);
      alert("Failed to install agent");
    }
  };

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const springTransition: Transition = { type: "spring", stiffness: 300, damping: 24 };

  const item: Variants = {
    hidden: { opacity: 0, y: 8, scale: 0.995 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: springTransition,
    },
  };

  const stats = [
    { label: "Verified creators", value: "124" },
    { label: "Average rating", value: "4.8" },
    { label: "Deploy-ready packs", value: "36" },
    { label: "Weekly installs", value: "3.2K" },
  ];

  const pulseMetrics: PulseMetric[] = [
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

  const insights = [
    { label: "Most installed category", value: "Research suites" },
    { label: "Fastest growing", value: "Automation" },
    { label: "Median install time", value: "2m 14s" },
  ];

  const baseHighlight = curatedHighlight ?? fallbackHighlight ?? null;
  const heroDeck = baseHighlight
    ? [
        baseHighlight,
        ...filteredAgents.filter((agent) => agent.id !== baseHighlight.id).slice(0, 3),
      ]
    : filteredAgents.slice(0, 4);
  const primaryHighlight = heroDeck[0] ?? null;
  const secondaryHighlights = heroDeck.slice(1);

  const getPriceLabel = (agent: MarketplaceAgent) => {
    if (agent.price == null) {
      return "Free trial";
    }
    return agent.price === 0 ? "Included" : `$${agent.price}`;
  };

  return (
    <div className="relative space-y-12">
      <div className="pointer-events-none absolute inset-0 -z-[1]">
        <div className="absolute inset-x-0 top-[-180px] h-[420px] rounded-full bg-[radial-gradient(circle,_rgba(167,139,250,0.18),_rgba(8,6,14,0.85)_72%)] blur-3xl" />
        <div className="absolute -bottom-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#6d28d9]/20 blur-[140px]" />
      </div>
      <section className="relative overflow-hidden rounded-[38px] border border-white/12 bg-[linear-gradient(150deg,rgba(13,16,28,0.95),rgba(20,24,40,0.92))] p-6 sm:p-8 shadow-[0_55px_160px_rgba(8,6,14,0.55)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(99,102,241,0.22),transparent_60%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:gap-8">
          <div className="flex-1 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-1 text-[11px] uppercase tracking-[0.32em] text-white/70">
              <Sparkles className="h-4 w-4 text-[#c4b5fd]" />
              Hive Store Bulletin
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold sm:text-4xl">Essential installs for thriving hives.</h1>
              <p className="max-w-2xl text-sm text-white/70">
                Spotlighted agents, curated collections, and real-time stats inspired by the Mac App Store—rebuilt with Bothive&#39;s gaming DNA and fully responsive across every device.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.28em] text-white/50">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1">
                <TrendingUp className="h-3.5 w-3.5 text-[#c4b5fd]" /> {activeCuration ?? "Trending Now"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1">
                <ShieldCheck className="h-4 w-4 text-[#a78bfa]" /> Bias-audited · Game ready
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-white shadow-[0_20px_65px_rgba(8,6,14,0.32)]"
                >
                  <span className="text-[11px] uppercase tracking-[0.3em] text-white/45">{stat.label}</span>
                  <div className="mt-2 text-2xl font-semibold">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {primaryHighlight ? (
              <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-black/45 p-6 shadow-[0_28px_85px_rgba(6,4,18,0.55)]">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.32em] text-white/45">
                  <span>Spotlight</span>
                  <span className="inline-flex items-center gap-2 text-white/60">
                    <TrendingUp className="h-3.5 w-3.5 text-[#c4b5fd]" />
                    {primaryHighlight.category}
                  </span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-white">{primaryHighlight.name}</h2>
                  <p className="text-sm text-white/70">{primaryHighlight.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {primaryHighlight.skills.slice(0, 4).map((skill, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/65"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="grid gap-2 text-sm text-white/65 sm:grid-cols-2">
                  <span className="inline-flex items-center gap-2">
                    <Download className="h-4 w-4" /> {primaryHighlight.downloads.toLocaleString()} installs
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Star className="h-4 w-4 text-[#c4b5fd]" fill="#c4b5fd" /> {primaryHighlight.rating}
                  </span>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleInstall(primaryHighlight)}
                    aria-label={`Install ${primaryHighlight.name}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-[0_18px_55px_rgba(167,139,250,0.35)] transition hover:-translate-y-0.5"
                  >
                    Install spotlight
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                  <span className="text-xs uppercase tracking-[0.3em] text-white/45">{getPriceLabel(primaryHighlight)}</span>
                </div>
              </div>
            ) : (
              <div className="h-full rounded-[28px] border border-white/10 bg-white/10" />
            )}

            {secondaryHighlights.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {secondaryHighlights.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex flex-col gap-3 rounded-[20px] border border-white/10 bg-black/40 p-4 transition hover:-translate-y-0.5 hover:border-white/20"
                  >
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-white/45">
                      <span>{agent.category}</span>
                      <span>{agent.rating}</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                      <p className="line-clamp-2 text-sm text-white/65">{agent.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/55">
                      <span>{getPriceLabel(agent)}</span>
                      <button
                        onClick={() => handleInstall(agent)}
                        aria-label={`Install ${agent.name}`}
                        className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-black"
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

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr),260px]">
        <div className="rounded-[32px] border border-white/10 bg-black/35 p-6 shadow-[0_28px_85px_rgba(6,4,18,0.5)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents, studios, or workflows"
              className="w-full rounded-[24px] border border-white/10 bg-black/70 px-12 py-3 text-sm text-white shadow-[0_14px_45px_rgba(6,4,18,0.45)] placeholder:text-white/30 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-[#a78bfa]/35"
            />
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Browse curations</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {curationFilters.map((filter) => {
                  const active = curation === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setCuration(filter.id)}
                      className={`rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] transition ${
                        active ? "bg-white text-black" : "border border-white/12 text-white/60 hover:text-white"
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Categories</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const active = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`rounded-full px-4 py-1.5 text-[11px] tracking-[0.22em] transition ${
                        active ? "bg-white text-black" : "border border-white/12 text-white/55 hover:text-white"
                      }`}
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
                  className="rounded-2xl border border-white/10 bg-white/8 px-3 py-3 text-xs uppercase tracking-[0.28em] text-white/55"
                >
                  <span className="block text-white/35">{insight.label}</span>
                  <span className="mt-1 block text-sm text-white">{insight.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-white/10 bg-black/45 p-4 shadow-[0_20px_65px_rgba(6,4,18,0.45)]">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/45">
              <span>Pulse monitor</span>
              <Play className="h-4 w-4 text-white/55" />
            </div>
            <div className="mt-3 space-y-3 text-sm text-white/65">
              {pulseMetrics.map((metric) => (
                <div key={metric.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/45">
                    <span>{metric.label}</span>
                    <span className={metric.trend === "down" ? "text-rose-400" : "text-emerald-400"}>{metric.change}</span>
                  </div>
                  <p className="mt-1 text-[13px] text-white/70">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/45 p-4 shadow-[0_20px_65px_rgba(6,4,18,0.45)]">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/45">
              <span>Creator spotlights</span>
              <ArrowUpRight className="h-4 w-4 text-white/55" />
            </div>
            <div className="mt-3 space-y-4">
              {creatorSpotlights.map((spotlight) => (
                <div key={spotlight.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/45">
                    <span>{spotlight.studio}</span>
                    <span>{spotlight.delta}</span>
                  </div>
                  <p className="mt-2 text-[13px]">{spotlight.focus}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.26em] text-white/55">
                    {spotlight.categories.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/12 bg-white/10 px-2.5 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/40 p-6 shadow-[0_45px_120px_rgba(8,6,14,0.55)]">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black via-black/30 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black via-black/30 to-transparent" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/60">
              Curated collections
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-white sm:text-[1.8rem]">
              Launch-ready packs tuned for {activeCuration?.toLowerCase() ?? "today"}
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Mix and match bundles engineered to drop into your hive with zero cold-start time. Each collection ships with shared memory keys, compatibility notes, and tuning recipes.
            </p>
          </div>
          <span className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/55 sm:inline-flex">
            {filteredAgents.length} agents visible
          </span>
        </div>
        <div className="relative mt-6 -mx-2 flex gap-4 overflow-x-auto px-2 pb-2 sm:mt-7">
          {collections.map((collection) => {
            const Icon = collection.icon;
            return (
              <div
                key={collection.id}
                className="group relative min-w-[240px] snap-start rounded-[26px] border border-white/12 bg-white/[0.04] p-5 shadow-[0_30px_85px_rgba(8,6,14,0.45)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 sm:min-w-[280px]"
              >
                <div
                  className={`pointer-events-none absolute inset-0 rounded-[26px] opacity-0 transition duration-300 group-hover:opacity-100 bg-gradient-to-br ${collection.accent}`}
                />
                <div className="relative flex h-full flex-col justify-between gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white">
                      <Icon className="h-5 w-5 text-[#c4b5fd]" />
                    </div>
                    <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/55">
                      {collection.range}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-white">{collection.title}</h4>
                    <p className="text-sm text-white/65">{collection.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/55">
                    <span>{collection.metric}</span>
                    <button className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70 transition hover:text-white">
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

      <motion.div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3" variants={container} initial="hidden" animate="show">
        {filteredAgents.map((agent) => (
          <motion.div
            key={agent.id}
            variants={item}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.995 }}
            className="group relative overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(160deg,rgba(167,139,250,0.08)_0%,rgba(7,6,12,0.92)_55%,rgba(10,8,18,0.98)_100%)] p-6 shadow-[0_40px_110px_rgba(6,4,12,0.55)] transition"
          >
            <div className="pointer-events-none absolute inset-0 rounded-[30px] border border-white/10 opacity-0 transition duration-300 group-hover:opacity-100" />
            <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
              <div className="absolute inset-x-0 -top-32 h-48 bg-[radial-gradient(circle,_rgba(167,139,250,0.22),_transparent_65%)] blur-3xl" />
            </div>
            <div className="relative flex h-full flex-col gap-5">
              <span className="text-[10px] uppercase tracking-[0.35em] text-white/35">
                {activeCuration ?? "Trending"}
              </span>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/55">
                    {agent.category}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
                  <p className="mt-1 text-sm text-white/55">{agent.author}</p>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-sm text-white/70">
                  <Star className="h-4 w-4 text-[#c4b5fd]" fill="#c4b5fd" />
                  {agent.rating}
                </div>
              </div>

              <p className="line-clamp-3 text-sm text-white/70">{agent.description}</p>

              <div className="flex flex-wrap gap-2">
                {agent.skills.slice(0, 4).map((skill, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/65"
                  >
                    {skill}
                  </span>
                ))}
                {agent.skills.length > 4 && (
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/60">
                    +{agent.skills.length - 4}
                  </span>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/65">
                <span className="inline-flex items-center gap-2 text-white/70">
                  <Download className="h-4 w-4" />
                  {agent.downloads.toLocaleString()}
                </span>
                <span className={agent.price === 0 ? "text-[#c4b5fd]" : "text-white"}>
                  {agent.price === 0 ? "Included" : `$${agent.price}`}
                </span>
                <button
                  onClick={() => handleInstall(agent)}
                  aria-label={`Install ${agent.name}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-black shadow-[0_18px_55px_rgba(167,139,250,0.35)] transition hover:-translate-y-0.5"
                >
                  Install
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredAgents.length === 0 && (
        <div className="rounded-[32px] border border-white/10 bg-black/50 py-16 text-center text-white/50">
          <p>No agents match your filters yet. Adjust your search or check back tomorrow for fresh drops.</p>
        </div>
      )}
    </div>
  );
}

