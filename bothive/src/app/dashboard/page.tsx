"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Network, 
  Zap, 
  TrendingUp, 
  Activity, 
  Plus,
} from "lucide-react";
import DashboardSidebarWrapper from "@/components/DashboardSidebarWrapper";
import DashboardHeader from "@/components/DashboardHeader";
import AgentBuilder from "@/components/AgentBuilder";
import Orchestrator from "@/components/Orchestrator";
import Marketplace from "@/components/Marketplace";
import MemoryTracker from "@/components/MemoryTracker";
import Integrations from "@/components/Integrations";
import { AgentDefinition } from "@/lib/agentTypes";
import { cn } from "@/lib/utils";

type DashboardTab = "overview" | "agents" | "orchestrator" | "marketplace" | "memory" | "integrations";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [loading, setLoading] = useState(true);

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
        <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "overview" && (
            <div className="relative p-4 sm:p-6 lg:p-8">
              {/* Welcome Section */}
              <div className="mb-8 space-y-3">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-black/35 dark:text-white/35">Overview</p>
                  <h1 className="text-3xl sm:text-4xl font-semibold text-black dark:text-white">Your command center</h1>
                </div>
                <p className="max-w-2xl text-sm text-black/55 dark:text-white/55">
                  Track your agents, workflows, and activity in one minimalist workspace.
                </p>
              </div>

              {/* Welcome Card */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="mb-8 p-6 rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md"
              >
                <h2 className="text-lg font-semibold text-black dark:text-white mb-1">Welcome back 👋</h2>
                <p className="text-sm text-black/60 dark:text-white/60">You have {agents.length} active agents and 8 workflows in motion. Keep building.</p>
              </motion.div>

              {/* Stats Grid */}
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  const colorClasses = {
                    purple: { bg: "bg-white/30 dark:bg-white/5", text: "text-black dark:text-white", border: "border-black/10 dark:border-white/10" },
                    blue: { bg: "bg-white/30 dark:bg-white/5", text: "text-black dark:text-white", border: "border-black/10 dark:border-white/10" },
                    green: { bg: "bg-white/30 dark:bg-white/5", text: "text-black dark:text-white", border: "border-black/10 dark:border-white/10" },
                    orange: { bg: "bg-white/30 dark:bg-white/5", text: "text-black dark:text-white", border: "border-black/10 dark:border-white/10" },
                  };
                  const colors = colorClasses[stat.color as keyof typeof colorClasses];
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      whileHover={{ y: -4 }}
                      className={`p-5 sm:p-6 rounded-2xl border ${colors.border} ${colors.bg} backdrop-blur-md transition-colors duration-200`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2.5 rounded-lg bg-white/70 dark:bg-white/10 ${colors.text} transition-colors`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm text-black/50 dark:text-white/60 font-medium">
                          {stat.change}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className={`text-2xl sm:text-3xl font-semibold ${colors.text}`}>{stat.value}</p>
                        <p className="text-xs sm:text-sm text-black/60 dark:text-white/60">{stat.label}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Quick Actions & Recent Activity */}
              <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative overflow-hidden rounded-xl border border-black/10 bg-white/60 p-6 backdrop-blur-md dark:border-white/10 dark:bg-white/5"
                >
                  <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:18px_18px]" />

                  <h3 className="relative z-10 mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-black/60 dark:text-white/60">
                    Quick actions
                  </h3>
                  <div className="relative z-10 space-y-2">
                    <button
                      onClick={() => handleTabChange("agents")}
                      className="flex w-full items-center justify-between rounded-lg border border-black/10 bg-white/80 p-4 text-left transition hover:border-black/20 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:border-white/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white text-black dark:border-white/15 dark:bg-white/10 dark:text-white">
                          <Plus className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-black dark:text-white">Create new agent</p>
                          <p className="text-xs text-black/50 dark:text-white/55">Start with a fresh blueprint</p>
                        </div>
                      </div>
                      <span className="text-xs text-black/40 transition dark:text-white/50">→</span>
                    </button>
                    <button
                      onClick={() => handleTabChange("orchestrator")}
                      className="flex w-full items-center justify-between rounded-lg border border-black/10 bg-white/80 p-4 text-left transition hover:border-black/20 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:border-white/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white text-black dark:border-white/15 dark:bg-white/10 dark:text-white">
                          <Network className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-black dark:text-white">Build workflow</p>
                          <p className="text-xs text-black/50 dark:text-white/55">Connect agents into a swarm</p>
                        </div>
                      </div>
                      <span className="text-xs text-black/40 transition dark:text-white/50">→</span>
                    </button>
                    <button
                      onClick={() => handleTabChange("marketplace")}
                      className="flex w-full items-center justify-between rounded-lg border border-black/10 bg-white/80 p-4 text-left transition hover:border-black/20 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:border-white/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white text-black dark:border-white/15 dark:bg-white/10 dark:text-white">
                          <Zap className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-black dark:text-white">Browse marketplace</p>
                          <p className="text-xs text-black/50 dark:text-white/55">Discover ready-made agents</p>
                        </div>
                      </div>
                      <span className="text-xs text-black/40 transition dark:text-white/50">→</span>
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative overflow-hidden rounded-xl border border-black/10 bg-white/60 p-6 backdrop-blur-md dark:border-white/10 dark:bg-white/5"
                >
                  <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:18px_18px]" />

                  <h3 className="relative z-10 mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-black/60 dark:text-white/60">
                    Recent activity
                  </h3>
                  <div className="relative z-10 space-y-2">
                    {agents.slice(0, 5).map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center gap-3 rounded-lg border border-black/10 bg-white/80 p-3 transition hover:border-black/20 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:border-white/20"
                      >
                        <div className="h-2 w-2 animate-pulse rounded-full bg-[#6A00FF]" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-black dark:text-white">{agent.name}</p>
                          <p className="text-xs text-black/50 dark:text-white/55">Agent created</p>
                        </div>
                        <span className="text-xs text-black/40 dark:text-white/50">Just now</span>
                      </div>
                    ))}
                    {agents.length === 0 && (
                      <div className="rounded-lg border border-dashed border-black/10 py-8 text-center text-sm text-black/50 dark:border-white/15 dark:text-white/50">
                        No recent activity
                        <button
                          onClick={() => handleTabChange("agents")}
                          className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-black/60 transition hover:text-black dark:text-white/60 dark:hover:text-white"
                        >
                          <span>Create your first agent</span>
                          <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
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

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
