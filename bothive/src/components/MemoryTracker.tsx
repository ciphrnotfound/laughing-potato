"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Activity, Clock, TrendingUp, Database, Zap, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface MemoryEntry {
  id: string;
  type: "conversation" | "task" | "knowledge" | "preference";
  content: string;
  timestamp: string;
  importance: "low" | "medium" | "high";
  size: number;
}

interface MemoryStats {
  totalMemories: number;
  totalSize: number;
  typeDistribution: Record<string, number>;
  recentActivity: number;
}

export default function MemoryTracker() {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockMemories: MemoryEntry[] = [
      {
        id: "1",
        type: "conversation",
        content: "User prefers TypeScript over JavaScript for new projects",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        importance: "high",
        size: 256
      },
      {
        id: "2",
        type: "task",
        content: "Completed database migration for user authentication system",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        importance: "medium",
        size: 512
      },
      {
        id: "3",
        type: "knowledge",
        content: "React hooks best practices and optimization techniques",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        importance: "high",
        size: 1024
      },
      {
        id: "4",
        type: "preference",
        content: "Prefers dark theme and violet color scheme",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        importance: "medium",
        size: 128
      }
    ];

    const mockStats: MemoryStats = {
      totalMemories: mockMemories.length,
      totalSize: mockMemories.reduce((acc, mem) => acc + mem.size, 0),
      typeDistribution: {
        conversation: mockMemories.filter(m => m.type === "conversation").length,
        task: mockMemories.filter(m => m.type === "task").length,
        knowledge: mockMemories.filter(m => m.type === "knowledge").length,
        preference: mockMemories.filter(m => m.type === "preference").length
      },
      recentActivity: 3
    };

    setTimeout(() => {
      setMemories(mockMemories);
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  const getTypeIcon = (type: MemoryEntry["type"]) => {
    switch (type) {
      case "conversation":
        return <MessageSquare className="w-4 h-4" />;
      case "task":
        return <Activity className="w-4 h-4" />;
      case "knowledge":
        return <Brain className="w-4 h-4" />;
      case "preference":
        return <Zap className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const getImportanceColor = (importance: MemoryEntry["importance"]) => {
    switch (importance) {
      case "high":
        return "text-red-500 bg-red-50 dark:bg-red-900/20";
      case "medium":
        return "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
      case "low":
        return "text-green-500 bg-green-50 dark:bg-green-900/20";
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-violet-500" />
            Memory Tracker
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor and manage AI memory and learning patterns
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Database className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Total Memories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalMemories}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stats.recentActivity} recent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Memory Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatSize(stats.totalSize)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total storage used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Activity Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.recentActivity}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                94%
              </div>
              <Progress value={94} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Type Distribution */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Memory Type Distribution</CardTitle>
            <CardDescription>
              Breakdown of memory types stored in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.typeDistribution).map(([type, count]) => (
                <div key={type} className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-lg bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
                    {getTypeIcon(type as MemoryEntry["type"])}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                    {count}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {type}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Memories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Memories</CardTitle>
          <CardDescription>
            Latest memory entries and learning patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {memories.map((memory, index) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${getImportanceColor(memory.importance)}`}>
                  {getTypeIcon(memory.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {memory.content}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {formatTimestamp(memory.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="capitalize">{memory.type}</span>
                    <span>{formatSize(memory.size)}</span>
                    <span className={`capitalize ${getImportanceColor(memory.importance).split(' ')[0]}`}>
                      {memory.importance} importance
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}