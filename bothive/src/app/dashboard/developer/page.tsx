"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSession } from "@/lib/app-session-context";
import {
  Bot,
  DollarSign,
  TrendingUp,
  Download,
  Plus,
  Code2,
  Package,
  Users,
  Activity,
  Zap,
  ArrowUpRight,
  MoreHorizontal,
  Settings,
  Star,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// --- Types ---

interface Integration {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  active_installs: number;
  total_revenue: number;
  rating: number;
  created_at: string;
}

interface DeveloperStats {
  totalIntegrations: number;
  activeInstalls: number;
  totalRevenue: number;
  pendingEarnings: number;
}

// --- Components ---

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  trend,
  delay
}: {
  title: string;
  value: string;
  change: string;
  icon: any;
  trend: "up" | "down" | "neutral";
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/50 p-6 backdrop-blur-xl transition-all hover:border-white/10 hover:bg-zinc-900/70"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    <div className="relative z-10 flex justify-between items-start mb-8">
      <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-white/70 group-hover:text-white group-hover:border-white/10 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      {(change) && (
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border",
          trend === "up" ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/10" :
            trend === "down" ? "text-rose-400 border-rose-400/20 bg-rose-400/10" :
              "text-zinc-400 border-zinc-500/20 bg-zinc-500/10"
        )}>
          {trend === "up" && <TrendingUp className="w-3 h-3" />}
          {change}
        </div>
      )}
    </div>
    <div className="relative z-10">
      <h3 className="text-3xl font-medium text-white mb-1 tracking-tight">{value}</h3>
      <p className="text-sm text-zinc-400 font-medium">{title}</p>
    </div>
  </motion.div>
);

const QuickAction = ({
  icon: Icon,
  label,
  desc,
  href,
  delay
}: {
  icon: any;
  label: string;
  desc: string;
  href: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <Link
      href={href}
      className="group flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700/50 transition-all"
    >
    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-300">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1">
      <h4 className="text-white font-medium mb-0.5">{label}</h4>
      <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">{desc}</p>
    </div>
    <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
    </Link>
  </motion.div>
);

// --- Page ---

export default function DeveloperDashboard() {
  const { profile } = useAppSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DeveloperStats>({
    totalIntegrations: 0,
    activeInstalls: 0,
    totalRevenue: 0,
    pendingEarnings: 0
  });
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/developer/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setIntegrations(data.integrations);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helpers
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatNumber = (val: number) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(val);

  return (
    <div className="min-h-screen w-full bg-[#06070a] text-zinc-100 font-sans selection:bg-purple-500/30">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[80vh] flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-sm text-zinc-500 font-medium">Loading studio...</p>
            </div>
          </motion.div>
        ) : (
          <div className="max-w-[1600px] mx-auto px-6 py-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold tracking-wide uppercase mb-4"
                >
                  <Code2 className="w-3 h-3" />
                  Developer Studio
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/50 tracking-tight"
                >
                  Overview
                </motion.h1>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <Link href="/dashboard/settings/developer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors text-sm font-medium">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <Link href="/dashboard/developer/submit" className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors text-sm font-semibold shadow-lg shadow-white/5">
                  <Plus className="w-4 h-4" />
                  Create Bot
                </Link>
              </motion.div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left Column: Stats & Quick Actions */}
              <div className="lg:col-span-2 space-y-8">

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats.totalRevenue)}
                    change="" // No historical data yet
                    trend="neutral"
                    icon={DollarSign}
                    delay={0.3}
                  />
                  <StatCard
                    title="Active Installs"
                    value={formatNumber(stats.activeInstalls)}
                    change=""
                    trend="neutral"
                    icon={Download}
                    delay={0.4}
                  />
                  {/* Calculate Avg Rating if possible, else placeholder */}
                  <StatCard
                    title="Avg. Rating"
                    value={integrations.length > 0 ? (integrations.reduce((acc, curr) => acc + (curr.rating || 0), 0) / integrations.length).toFixed(1) : "0.0"}
                    change=""
                    trend="neutral"
                    icon={Star}
                    delay={0.5}
                  />
                </div>

                {/* Chart / Activity Section */}
                {integrations.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="rounded-3xl border border-white/5 bg-zinc-900/30 p-8 min-h-[300px] flex flex-col justify-center items-center text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-2">
                      <Activity className="w-8 h-8 text-zinc-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">No Activity Yet</h3>
                      <p className="text-zinc-500 text-sm max-w-sm mx-auto mt-2">
                        Once you publish your first bot, analytics and live metrics will appear here.
                      </p>
                    </div>
                    <Link href="/dashboard/developer/submit" className="mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
                      Create your first bot &rarr;
                    </Link>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-lg font-semibold text-white">Live Deployments</h3>
                    </div>
                    <div className="grid gap-3">
                      {integrations.map((bot, i) => (
                        <motion.div
                          key={bot.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + i * 0.1 }}
                          className="group flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-white/10 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center">
                              <Bot className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{bot.name}</h4>
                              <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                                <span className={cn(
                                  "flex items-center gap-1.5",
                                  bot.status === "approved" ? "text-emerald-400" :
                                    bot.status === "pending" ? "text-amber-400" : "text-rose-400"
                                )}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                  {bot.status.charAt(0).toUpperCase() + bot.status.slice(1)}
                                </span>
                                <span>•</span>
                                <span>{bot.active_installs} installs</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right hidden sm:block">
                              <div className="text-white font-medium">{formatCurrency(bot.total_revenue)}</div>
                              <div className="text-xs text-zinc-500">Revenue</div>
                            </div>
                            <Link href={`/dashboard/developer/integrations/${bot.id}`} className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors">
                              <MoreHorizontal className="w-5 h-5" />
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Sidebar / Tools */}
              <div className="space-y-6">

                {/* Profile Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-6 rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black backdrop-blur-xl"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {profile?.fullName?.[0] || "D"}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{profile?.fullName || "Developer"}</h3>
                      <p className="text-sm text-zinc-500">Standard Plan</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Monthly Cap</span>
                      <span className="text-white">--</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 w-[15%] rounded-full" />
                    </div>
                    <p className="text-xs text-zinc-500 pt-1">
                      Usage metrics will appear here.
                    </p>
                  </div>
                  <button className="w-full mt-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium text-white transition-colors">
                    Upgrade Plan
                  </button>
                </motion.div>

                {/* Quick Launch */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 px-2">Quick Launch</h3>
                  <div className="space-y-3">
                    <QuickAction
                      icon={Zap}
                      label="New Integration"
                      desc="Connect a new service"
                      href="/dashboard/integrations/new"
                      delay={0.6}
                    />
                    <QuickAction
                      icon={Package}
                      label="Submit Plugin"
                      desc="Publish to marketplace"
                      href="/dashboard/developer/submit"
                      delay={0.7}
                    />
                    <QuickAction
                      icon={Users}
                      label="Community"
                      desc="Join Discord"
                      href="https://discord.gg/bothive"
                      delay={0.8}
                    />
                  </div>
                </div>

                {/* Resources */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="p-6 rounded-3xl bg-zinc-900/20 border border-white/5"
                >
                  <h3 className="text-white font-medium mb-4">Resources</h3>
                  <ul className="space-y-3">
                    {['API Documentation', 'Developer Forum', 'Status Page'].map(item => (
                      <li key={item}>
                        <a href="#" className="flex items-center justify-between text-sm text-zinc-500 hover:text-purple-400 transition-colors group">
                          {item}
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>

              </div>

            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
