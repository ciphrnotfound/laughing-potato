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
    <div className="bg-black text-white min-h-screen flex relative overflow-hidden">
      {/* Futuristic grid background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        {/* Diagonal grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(124,58,237,0.03)_1px,transparent_1px),linear-gradient(-45deg,rgba(124,58,237,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Purple gradient overlays */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-purple-500/5 via-transparent to-transparent" />
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
            <div className="p-4 sm:p-6 lg:p-8 relative">
              {/* Futuristic accent lines */}
              <div className="absolute top-0 left-8 w-px h-32 bg-gradient-to-b from-purple-500/50 via-purple-500/20 to-transparent" />
              
              {/* Welcome Section */}
              <div className="mb-8 relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-transparent rounded-full" />
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Dashboard
                    </h1>
                    <p className="text-white/60 font-mono text-sm mt-1">SYSTEM_STATUS: OPERATIONAL</p>
                  </div>
                </div>
                <p className="text-white/60 ml-4">Monitor and manage your AI agent ecosystem</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  const colorClasses = {
                    purple: "bg-purple-500/10 text-purple-400",
                    blue: "bg-blue-500/10 text-blue-400",
                    green: "bg-green-500/10 text-green-400",
                    orange: "bg-orange-500/10 text-orange-400",
                  };
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 sm:p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all hover:scale-[1.02] relative overflow-hidden group"
                    >
                      {/* Grid pattern overlay */}
                      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:10px_10px]" />
                      
                      {/* Corner accent */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="relative z-10 flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]} relative`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Icon className="w-5 h-5 relative z-10" />
                        </div>
                        <span className="text-xs sm:text-sm text-green-400 font-medium font-mono">
                          {stat.change}
                        </span>
                      </div>
                      <div className="space-y-1 relative z-10">
                        <p className="text-2xl sm:text-3xl font-bold font-mono">{stat.value}</p>
                        <p className="text-xs sm:text-sm text-white/60">{stat.label}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Quick Actions & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm relative overflow-hidden"
                >
                  {/* Grid pattern */}
                  <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:15px_15px]" />
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500/50 to-transparent" />
                  
                  <h3 className="text-lg font-semibold mb-4 relative z-10 flex items-center gap-2">
                    <span className="w-1 h-5 bg-purple-500 rounded-full" />
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleTabChange("agents")}
                      className="w-full flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition">
                          <Plus className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium">Create New Agent</p>
                          <p className="text-xs text-white/50">Build a custom AI agent</p>
                        </div>
                      </div>
                      <span className="text-xs text-white/40 group-hover:text-white transition">→</span>
                    </button>
                    <button
                      onClick={() => handleTabChange("orchestrator")}
                      className="w-full flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition">
                          <Network className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium">Build Workflow</p>
                          <p className="text-xs text-white/50">Connect agents together</p>
                        </div>
                      </div>
                      <span className="text-xs text-white/40 group-hover:text-white transition">→</span>
                    </button>
                    <button
                      onClick={() => handleTabChange("marketplace")}
                      className="w-full flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition">
                          <Zap className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium">Browse Marketplace</p>
                          <p className="text-xs text-white/50">Discover pre-built agents</p>
                        </div>
                      </div>
                      <span className="text-xs text-white/40 group-hover:text-white transition">→</span>
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm relative overflow-hidden"
                >
                  {/* Grid pattern */}
                  <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:15px_15px]" />
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500/50 to-transparent" />
                  
                  <h3 className="text-lg font-semibold mb-4 relative z-10 flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-500 rounded-full" />
                    Recent Activity
                  </h3>
                  <div className="space-y-2">
                    {agents.slice(0, 5).map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
                      >
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{agent.name}</p>
                          <p className="text-xs text-white/50">Agent created</p>
                        </div>
                        <span className="text-xs text-white/40">Just now</span>
                      </div>
                    ))}
                    {agents.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-sm text-white/50">No recent activity</p>
                        <button
                          onClick={() => handleTabChange("agents")}
                          className="mt-4 text-sm text-purple-400 hover:text-purple-300 transition"
                        >
                          Create your first agent →
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
