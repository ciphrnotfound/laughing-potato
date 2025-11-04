"use client";

import React, { useState } from "react";
import { Slack, FileText, MessageSquare, Github, Zap, Check } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  connected: boolean;
  category: string;
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "slack",
      name: "Slack",
      icon: <Slack className="w-6 h-6" />,
      description: "Send notifications and trigger workflows from Slack",
      connected: false,
      category: "communication",
    },
    {
      id: "notion",
      name: "Notion",
      icon: <FileText className="w-6 h-6" />,
      description: "Sync agents with your Notion workspace",
      connected: false,
      category: "productivity",
    },
    {
      id: "discord",
      name: "Discord",
      icon: <MessageSquare className="w-6 h-6" />,
      description: "Integrate agents into Discord servers",
      connected: false,
      category: "communication",
    },
    {
      id: "github",
      name: "GitHub",
      icon: <Github className="w-6 h-6" />,
      description: "Connect agents to GitHub repositories",
      connected: false,
      category: "development",
    },
    {
      id: "zapier",
      name: "Zapier",
      icon: <Zap className="w-6 h-6" />,
      description: "Connect to 5000+ apps via Zapier",
      connected: false,
      category: "automation",
    },
  ]);

  const handleConnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === id ? { ...int, connected: !int.connected } : int
      )
    );
  };

  const categories = [
    "all",
    "communication",
    "productivity",
    "development",
    "automation",
  ];
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredIntegrations =
    selectedCategory === "all"
      ? integrations
      : integrations.filter((int) => int.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Integrations</h2>
        <p className="text-white/60">
          Connect Bothive to your favorite tools and automate workflows
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedCategory === cat
                ? "bg-purple-600 text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Integration Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map((integration) => (
          <div
            key={integration.id}
            className={`p-6 rounded-xl border transition ${
              integration.connected
                ? "bg-purple-500/10 border-purple-500/30"
                : "bg-white/5 border-white/10 hover:border-white/30"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-lg ${
                    integration.connected
                      ? "bg-purple-500/20 text-purple-300"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {integration.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{integration.name}</h3>
                  {integration.connected && (
                    <span className="text-xs text-green-400 flex items-center gap-1 mt-1">
                      <Check className="w-3 h-3" />
                      Connected
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-white/70 mb-4">{integration.description}</p>

            <button
              onClick={() => handleConnect(integration.id)}
              className={`w-full py-2 rounded-lg text-sm font-medium transition ${
                integration.connected
                  ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              {integration.connected ? "Disconnect" : "Connect"}
            </button>
          </div>
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12 text-white/40">
          <p>No integrations found in this category</p>
        </div>
      )}
    </div>
  );
}

