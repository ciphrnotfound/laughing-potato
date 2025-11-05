"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Star, Download, TrendingUp, Filter } from "lucide-react";
import { AgentDefinition } from "@/lib/agentTypes";

interface MarketplaceAgent extends AgentDefinition {
  author: string;
  rating: number;
  downloads: number;
  price?: number;
  category: string;
}

export default function Marketplace() {
  const [agents, setAgents] = useState<MarketplaceAgent[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const categories = ["all", "research", "development", "automation", "analytics"];

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
    ];

    setAgents(mockAgents);
  }, []);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      (agent.description?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesCategory = category === "all" || agent.category === category;
    return matchesSearch && matchesCategory;
  });

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

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const item = {
    hidden: { opacity: 0, y: 8, scale: 0.995 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Agent Marketplace</h2>
          <p className="text-white/60">Discover, test, and integrate pre-built AI agents</p>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <span className="text-sm text-white/60">Trending</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-white/60" />
          <select
            aria-label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-black">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Agent Grid (mobile-first, animated) */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={container} initial="hidden" animate="show">
        {filteredAgents.map((agent) => (
          <motion.div
            key={agent.id}
            variants={item}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.995 }}
            className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{agent.name}</h3>
                <p className="text-sm text-white/60 mb-2">{agent.author}</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{agent.rating}</span>
              </div>
            </div>

            <p className="text-sm text-white/70 mb-4 line-clamp-2">{agent.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {agent.skills.slice(0, 3).map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-full bg-purple-500/20 text-xs text-purple-300"
                >
                  {skill}
                </span>
              ))}
              {agent.skills.length > 3 && (
                <span className="px-2 py-1 rounded-full bg-white/10 text-xs text-white/60">
                  +{agent.skills.length - 3}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {agent.downloads}
                </span>
                <span className={agent.price === 0 ? "text-green-400" : ""}>
                  {agent.price === 0 ? "Free" : `$${agent.price}`}
                </span>
              </div>
              <button
                onClick={() => handleInstall(agent)}
                aria-label={`Install ${agent.name}`}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition"
              >
                Install
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12 text-white/40">
          <p>No agents found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

