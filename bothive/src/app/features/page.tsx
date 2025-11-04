"use client";

import React, { useState, useEffect } from "react";
import AgentBuilder from "@/components/AgentBuilder";
import Orchestrator from "@/components/Orchestrator";
import Marketplace from "@/components/Marketplace";
import MemoryTracker from "@/components/MemoryTracker";
import Integrations from "@/components/Integrations";
import { Wand2, Network, Store, Brain, Plug, X } from "lucide-react";
import { AgentDefinition } from "@/lib/agentTypes";
import Navbar2 from "@/components/Navbar2";

type TabId = "builder" | "orchestrator" | "marketplace" | "memory" | "integrations";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: "builder", label: "Agent Builder", icon: <Wand2 className="w-5 h-5" /> },
  { id: "orchestrator", label: "Orchestrator", icon: <Network className="w-5 h-5" /> },
  { id: "marketplace", label: "Marketplace", icon: <Store className="w-5 h-5" /> },
  { id: "memory", label: "Memory", icon: <Brain className="w-5 h-5" /> },
  { id: "integrations", label: "Integrations", icon: <Plug className="w-5 h-5" /> },
];

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("builder");
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
        
        // If no agents, seed some default ones
        if (data.agents.length === 0) {
          await fetch("/api/seed", { method: "POST" });
          // Refetch after seeding
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

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar2 />
      
      <div className="pt-20">
        {/* Header */}
        <div className="mx-auto max-w-7xl px-6 py-12 border-b border-white/10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Bothive Features
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">
            Build, connect, and orchestrate AI agents that work together as one
            connected mind. No single bot doing everything—thousands working in
            harmony.
          </p>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-2 overflow-x-auto py-6 border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="py-8">
            {loading ? (
              <div className="text-center py-12 text-white/60">Loading...</div>
            ) : (
              <>
                {activeTab === "builder" && (
                  <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold mb-2">Agent Builder</h2>
                      <p className="text-white/60">
                        Create AI agents using our no-code interface or SDK
                      </p>
                    </div>
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-950/20 to-black border border-white/10">
                      <AgentBuilder onSave={handleAgentSave} />
                    </div>
                  </div>
                )}

                {activeTab === "orchestrator" && (
                  <div className="h-[800px] rounded-2xl bg-gradient-to-br from-purple-950/20 to-black border border-white/10 overflow-hidden">
                    <Orchestrator agents={agents} />
                  </div>
                )}

                {activeTab === "marketplace" && (
                  <div className="max-w-7xl mx-auto">
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-950/20 to-black border border-white/10">
                      <Marketplace />
                    </div>
                  </div>
                )}

                {activeTab === "memory" && (
                  <div className="max-w-6xl mx-auto">
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-950/20 to-black border border-white/10">
                      <MemoryTracker />
                    </div>
                  </div>
                )}

                {activeTab === "integrations" && (
                  <div className="max-w-7xl mx-auto">
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-950/20 to-black border border-white/10">
                      <Integrations />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
