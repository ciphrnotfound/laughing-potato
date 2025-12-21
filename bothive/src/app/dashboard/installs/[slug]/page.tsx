"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import { useAppSession } from "@/lib/app-session-context";
import AIChatInterface from "@/components/AIChatInterface";
import {
  IconArrowLeft,
  IconRobot,
  IconActivity,
  IconBrain,
  IconClock,
  IconBolt,
  IconExternalLink,
  IconSettings,
  IconFileText,
  IconCalendar,
  IconCheck,
  IconLoader2,
  IconSparkles,
  IconDeviceDesktopAnalytics
} from "@tabler/icons-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface BotData {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  code?: string;
  hivelang_code?: string;
  category?: string;
  capabilities?: string[];
}

interface TaskAction {
  id: string;
  type: "notion" | "calendar" | "email" | "task" | "other" | "api";
  description: string;
  status: "pending" | "success" | "error";
  timestamp: Date;
  link?: string;
}

export default function BotInteractionPage() {
  const { slug: botId } = useParams();
  const { theme } = useTheme();
  const { profile } = useAppSession();
  const router = useRouter();
  const isDark = theme === "dark";
  const supabase = createClientComponentClient();

  const [bot, setBot] = useState<BotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskActions, setTaskActions] = useState<TaskAction[]>([]);

  useEffect(() => {
    async function fetchBot() {
      try {
        const { data, error } = await supabase
          .from("bots")
          .select("*")
          .eq("id", botId)
          .single();

        if (error) throw error;
        setBot(data);
      } catch (error) {
        console.error("Error fetching bot:", error);
      } finally {
        setLoading(false);
      }
    }

    if (botId) fetchBot();
  }, [botId, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
            <IconLoader2 className="w-10 h-10 text-violet-500 animate-spin" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-white/20 font-mono tracking-[0.3em] uppercase text-[10px]">Initializing Neural Link</p>
          <div className="h-1 w-48 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="h-full w-1/2 bg-violet-500 shadow-[0_0_15px_rgba(124,58,237,0.5)]"
            />
          </div>
        </div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-6 px-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center">
          <IconRobot className="w-10 h-10 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Agent Not Found</h1>
          <p className="text-white/40 max-w-xs mx-auto text-sm">The requested neural signature could not be located in the local hive.</p>
        </div>
        <Link href="/dashboard/installs">
          <button className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 font-bold">
            Return to Library
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Ultra-Premium Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-sm text-white/30 hover:text-white transition-all font-semibold"
            >
              <IconArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Library</span>
            </button>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-violet-600/20 blur-lg opacity-50" />
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  {bot.icon_url ? (
                    <img src={bot.icon_url} alt={bot.name} className="w-6 h-6 object-contain" />
                  ) : (
                    <IconRobot className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
              <div>
                <h1 className="font-bold text-white tracking-tight text-lg">{bot.name}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold font-mono">{bot.category || "General Utility"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl bg-violet-500/5 border border-violet-500/10">
              <IconSparkles className="w-4 h-4 text-violet-400" />
              <span className="text-[10px] text-violet-300 font-bold uppercase tracking-wider">Sync Active</span>
            </div>
            <Link href={`/dashboard/bots/${bot.id}`}>
              <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5">
                <IconSettings className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Application Core */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-160px)]">
          {/* Neural Interface (Chat) */}
          <div className="lg:col-span-8 flex flex-col h-full">
            <div className="flex-1 rounded-[2rem] border border-white/5 bg-[#050505] shadow-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-violet-600/[0.03] to-transparent pointer-events-none group-hover:from-violet-600/[0.05] transition-all" />
              <AIChatInterface
                botCapabilities={bot.capabilities || []}
                hivelangCode={bot.hivelang_code || bot.code}
              />
            </div>
          </div>

          {/* Meta Sidebar (Intelligence & Activity) */}
          <div className="lg:col-span-4 flex flex-col h-full gap-8 overflow-hidden">
            {/* Live Intelligence Panel */}
            <div className="flex-1 rounded-[2rem] border border-white/5 bg-[#050505] flex flex-col overflow-hidden relative">
              <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20">
                    <IconActivity className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white tracking-tight">Live Intelligence</h3>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono">Real-time Stream</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-tighter border border-emerald-500/20">
                  LIVE
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {taskActions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-violet-600/10 blur-2xl rounded-full" />
                      <div className="relative w-20 h-20 rounded-[2rem] bg-gradient-to-br from-violet-600/5 to-purple-600/5 flex items-center justify-center border border-white/5">
                        <IconBrain className="w-10 h-10 text-violet-400/40" />
                      </div>
                      <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-black flex items-center justify-center shadow-xl">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-white/60 tracking-tight text-lg">Neural Pulse Nominal</p>
                      <p className="text-xs text-white/20 max-w-[200px] leading-relaxed font-medium">
                        Initialize a directive to observe the agent's cognitive processing.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {taskActions.map((action) => (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group cursor-default"
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "p-2 rounded-xl border transition-colors",
                            action.status === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                              action.status === "error" ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                "bg-violet-500/10 border-violet-500/20 text-violet-400"
                          )}>
                            {action.status === "pending" ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <IconCheck className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="text-sm text-white/80 font-semibold truncate tracking-tight">{action.description}</p>
                            <div className="flex items-center gap-2">
                              <IconClock className="w-3 h-3 text-white/10" />
                              <span className="text-[10px] text-white/20 font-bold uppercase tracking-wider font-mono">{action.timestamp.toLocaleTimeString()}</span>
                            </div>
                          </div>
                          {action.link && (
                            <a href={action.link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100">
                              <IconExternalLink className="w-4 h-4 text-white/20 hover:text-white" />
                            </a>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cognitive Insights Card */}
            <div className="p-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-violet-600/10 via-transparent to-transparent space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-600/20">
                  <IconSparkles className="w-4 h-4 text-violet-400" />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Agent Insight</h4>
              </div>

              <p className="text-xs text-white/40 leading-relaxed font-medium">
                This agent is actively monitoring its <span className="text-violet-400">HiveLang</span> core. You can orchestrate complex multi-step routines by referencing its unique capabilities.
              </p>

              <div className="space-y-2 pt-2">
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group">
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Quick Routine</span>
                  <IconBolt className="w-3.5 h-3.5 text-violet-400 group-hover:scale-125 transition-transform" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group">
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Neural Logs</span>
                  <IconDeviceDesktopAnalytics className="w-3.5 h-3.5 text-violet-400 group-hover:scale-125 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
