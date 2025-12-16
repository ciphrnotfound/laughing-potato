"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Cpu,
  Plus,
  Code,
  Settings,
  Play,
  Box,
  ChevronRight,
  Search,
  Zap,
  LayoutGrid,
  List
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Mock data for initial render (while RLS is sorted)
const MOCK_PROJECTS = [
  {
    id: "1",
    name: "Pokemon Fetcher",
    icon: "⚡",
    status: "live",
    lastDeployed: "2m ago",
    requests: 1240,
    type: "integration"
  },
  {
    id: "2",
    name: "Slack Notify Pro",
    icon: "📢",
    status: "building",
    lastDeployed: "1h ago",
    requests: 0,
    type: "integration"
  }
];

export default function DeveloperConsole() {
  const router = useRouter();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[128px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <Terminal className="w-5 h-5 text-purple-400" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">Developer Console</h1>
            </div>
            <p className="text-zinc-400 text-sm max-w-md">
              Extend BotHive with custom Hivelang integrations. Build, test, and deploy serverless agents in seconds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push('/dashboard/developer/editor/new')}
              className="bg-white text-black hover:bg-zinc-200 border-0 font-medium px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Integration
            </Button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { label: "Active Deployments", value: "2", icon: Box },
            { label: "Total Requests", value: "1.2k", icon: Zap },
            { label: "Avg Latency", value: "45ms", icon: Settings },
          ].map((stat, i) => (
            <div key={i} className="group p-4 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-purple-500/20 transition-all">
              <div className="flex items-start justify-between mb-4">
                <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{stat.label}</span>
                <stat.icon className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors" />
              </div>
              <div className="text-2xl font-mono text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search integrations..."
              className="w-full bg-transparent border border-transparent focus:border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 p-1 bg-zinc-900/50 rounded-lg border border-white/5">
            <button
              onClick={() => setView("grid")}
              className={cn("p-1.5 rounded-md transition-all", view === "grid" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("p-1.5 rounded-md transition-all", view === "list" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className={cn(
          "grid gap-4",
          view === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          <AnimatePresence>
            {projects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.01 }}
                className="group cursor-pointer relative overflow-hidden rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-purple-500/30 transition-all p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-xl">
                    {project.icon}
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border",
                    project.status === "live"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", project.status === "live" ? "bg-emerald-400 animate-pulse" : "bg-amber-400")} />
                    {project.status}
                  </div>
                </div>

                <h3 className="text-lg font-medium text-white mb-2 group-hover:text-purple-200 transition-colors">
                  {project.name}
                </h3>

                <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono">
                  <span>{project.type}</span>
                  <span>•</span>
                  <span>{project.lastDeployed}</span>
                </div>

                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                  <ChevronRight className="w-5 h-5 text-purple-400" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State / Create New Card */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            onClick={() => router.push('/dashboard/developer/editor/new')}
            className="relative overflow-hidden rounded-2xl border border-dashed border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[180px]"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <Plus className="w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">Create New Integration</h3>
              <p className="text-xs text-zinc-500 mt-1">Start from scratch or a template</p>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
