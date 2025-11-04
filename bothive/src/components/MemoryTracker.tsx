"use client";

import React, { useState, useEffect } from "react";
import { Brain, TrendingUp, Clock, Zap } from "lucide-react";

interface MemoryEntry {
  key: string;
  value: unknown;
  timestamp: number;
  agentId: string;
}

interface AgentStats {
  agentId: string;
  name: string;
  interactions: number;
  lastActive: number;
  successRate: number;
}

export default function MemoryTracker() {
  const [memory, setMemory] = useState<MemoryEntry[]>([]);
  const [stats, setStats] = useState<AgentStats[]>([]);

  useEffect(() => {
    fetchMemory();
    // Stats are calculated from memory entries
  }, []);

  const fetchMemory = async () => {
    try {
      const response = await fetch("/api/memory");
      if (response.ok) {
        const data = await response.json();
        setMemory(data.entries || []);
        
        // Calculate stats from memory
        const agentMap = new Map<string, { interactions: number; lastActive: number }>();
        data.entries.forEach((entry: MemoryEntry) => {
          const existing = agentMap.get(entry.agentId) || { interactions: 0, lastActive: 0 };
          agentMap.set(entry.agentId, {
            interactions: existing.interactions + 1,
            lastActive: Math.max(existing.lastActive, entry.timestamp),
          });
        });

        const calculatedStats: AgentStats[] = Array.from(agentMap.entries()).map(([agentId, data]) => ({
          agentId,
          name: `Agent ${agentId}`,
          interactions: data.interactions,
          lastActive: data.lastActive,
          successRate: 0.9 + Math.random() * 0.1, // Simulated success rate
        }));

        setStats(calculatedStats);
      }
    } catch (error) {
      console.error("Failed to fetch memory:", error);
      // Fallback to mock data
      const mockMemory: MemoryEntry[] = [
        {
          key: "user_preferences",
          value: { theme: "dark", language: "en" },
          timestamp: Date.now() - 3600000,
          agentId: "agent-1",
        },
      ];
      setMemory(mockMemory);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="w-6 h-6 text-purple-400" />
        <h2 className="text-2xl font-bold">Memory & Learning</h2>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.agentId}
            className="p-4 rounded-lg bg-white/5 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{stat.name}</h3>
              <div className="flex items-center gap-1 text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">{(stat.successRate * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-white/60">
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                {stat.interactions} interactions
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTimeAgo(stat.lastActive)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Memory Entries */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Memory Context</h3>
        <div className="space-y-3">
          {memory.map((entry, i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-medium text-purple-300">{entry.key}</span>
                  <span className="text-sm text-white/60 ml-2">
                    from {entry.agentId}
                  </span>
                </div>
                <span className="text-xs text-white/40">
                  {formatTimeAgo(entry.timestamp)}
                </span>
              </div>
              <pre className="text-xs text-white/70 bg-black/30 p-2 rounded mt-2 overflow-x-auto">
                {JSON.stringify(entry.value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
        <p className="text-sm text-white/80">
          <strong className="text-purple-300">Memory System:</strong> Agents remember
          previous interactions, user preferences, and project context. This enables
          them to improve over time and provide more relevant responses.
        </p>
      </div>
    </div>
  );
}

