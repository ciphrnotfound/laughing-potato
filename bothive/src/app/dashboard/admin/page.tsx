"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSession } from "@/lib/app-session-context";
import { useTheme } from "@/lib/theme-context";
import DashboardBackground from "@/components/DashboardBackground";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Spotlight } from "@/components/ui/Spotlight";
import {
  Users,
  Bot,
  DollarSign,
  TrendingUp,
  Activity,
  Settings,
  Shield,
  BarChart3,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  Cpu,
  Globe,
  Zap,
  MoreVertical,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { profile } = useAppSession();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDevelopers: 0,
    totalBots: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingApprovals: 0
  });

  useEffect(() => {
    // Verify admin access
    if (profile?.email !== "akinlorinjeremiah@gmail.com") {
      window.location.href = "/dashboard";
      return;
    }
    fetchAdminStats();
  }, [profile]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/stats");
      const result = await response.json();

      if (response.ok) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <DashboardBackground>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-violet-500/10 rounded-full animate-pulse blur-sm" />
                </div>
            </div>
        </div>
      </DashboardBackground>
    );
  }

  return (
    <DashboardBackground>
      <div className="relative min-h-screen px-6 py-12 lg:px-12">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20 opacity-40" fill="white" />
        
        {/* Header Section */}
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold uppercase tracking-wider text-violet-400">
                    Nexus Core
                </span>
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                    v3.4.0-stable
                </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
                Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Center</span>
            </h1>
            <p className="text-zinc-500 max-w-md">
                Real-time orchestration of the Bothive neural network and platform econometrics.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
             <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2">
                <Download className="w-4 h-4 text-zinc-400" />
                Export Data
             </button>
             <button className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                System Config
             </button>
          </motion.div>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <StatCard 
                title="Total Revenue" 
                value={formatCurrency(stats.totalRevenue)} 
                trend="+24.8%" 
                icon={DollarSign}
                delay={0}
                color="emerald"
                description="Aggregated marketplace gross"
            />
            <StatCard 
                title="Active Nodes" 
                value={formatNumber(stats.totalBots)} 
                trend="+12.4%" 
                icon={Bot}
                delay={0.1}
                color="violet"
                description="Deployed autonomous agents"
            />
            <StatCard 
                title="Dev Population" 
                value={formatNumber(stats.totalDevelopers)} 
                trend="+8.9%" 
                icon={Users}
                delay={0.2}
                color="blue"
                description="Registered platform architects"
            />
        </div>

        {/* Secondary Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <MiniStat title="Total Intelligence" value={formatNumber(stats.totalUsers)} icon={Globe} color="cyan" />
                 <MiniStat title="Neural Throughput" value="1.4M ops" icon={Zap} color="orange" />
                 <MiniStat title="Pending Validations" value={stats.pendingApprovals.toString()} icon={Shield} color="rose" />
            </div>
            <div className="lg:col-span-1">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="h-full relative group rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 overflow-hidden flex flex-col justify-between"
                >
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative z-10">
                        <h3 className="text-white font-bold text-lg mb-1">System Integrity</h3>
                        <p className="text-white/60 text-xs">All clusters nominal</p>
                    </div>
                    <div className="relative z-10 flex items-end justify-between">
                        <div className="text-4xl font-black text-white">99.9%</div>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="w-1 h-4 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>

        {/* Action Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-1 relative rounded-[2.5rem] bg-zinc-900/40 border border-white/5 p-8 overflow-hidden backdrop-blur-xl"
            >
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-violet-400" />
                    Neural Orchestration
                </h3>
                <div className="space-y-4">
                    <ActionButton icon={Users} label="Identity Management" desc="Audit user access" color="violet" />
                    <ActionButton icon={Shield} label="Approval Queue" desc="Validate new integrations" color="rose" />
                    <ActionButton icon={DollarSign} label="Financial Systems" desc="Marketplace settlement" color="emerald" />
                    <ActionButton icon={AlertTriangle} label="Incident Logs" desc="Debug system reports" color="orange" />
                    
                    <button className="w-full mt-4 py-4 rounded-2xl bg-white/5 border border-dashed border-white/10 text-zinc-500 text-sm hover:border-white/20 hover:text-white transition-all flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        Custom Command
                    </button>
                </div>
            </motion.div>

            {/* Recent Pulsations (Activity) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="lg:col-span-2 relative rounded-[2.5rem] bg-zinc-900/40 border border-white/5 p-8 overflow-hidden backdrop-blur-xl"
            >
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        Live Feed
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Real-time Stream</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <LogItem icon={Bot} color="violet" user="Jarvis-V4" action="deployment successful" time="2m ago" />
                    <LogItem icon={Users} color="blue" user="Developer X" action="registered on platform" time="15m ago" />
                    <LogItem icon={TrendingUp} color="emerald" user="Nexus Marketplace" action="transaction: ₦45,000 processed" time="1h ago" />
                    <LogItem icon={AlertTriangle} color="orange" user="Cloud Service" action="latency spike detected in US-EAST" time="3h ago" />
                </div>
            </motion.div>
        </div>
      </div>
    </DashboardBackground>
  );
}

function StatCard({ title, value, trend, icon: Icon, delay, color, description }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay }}
            className="relative group rounded-[2.5rem] bg-zinc-900/40 border border-white/5 p-8 overflow-hidden backdrop-blur-xl"
        >
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-8">
                    <div className={cn(
                        "p-4 rounded-2xl bg-white/5 flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                        color === "emerald" && "text-emerald-400 border border-emerald-500/10",
                        color === "violet" && "text-violet-400 border border-violet-500/10",
                        color === "blue" && "text-blue-400 border border-blue-500/10",
                    )}>
                        <Icon strokeWidth={1.5} className="w-7 h-7" />
                    </div>
                    <div className={cn(
                        "flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border",
                        trend.startsWith('+') ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-zinc-500/10 border-white/5 text-zinc-400"
                    )}>
                        {trend}
                        <ArrowUpRight className="w-3 h-3" />
                    </div>
                </div>

                <div>
                    <div className="text-4xl font-black text-white mb-2 tracking-tighter">
                        {value}
                    </div>
                    <div className="text-sm font-medium text-zinc-300 mb-1">
                        {title}
                    </div>
                    <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                        {description}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function MiniStat({ title, value, icon: Icon, color }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative p-6 rounded-[2rem] bg-zinc-900/40 border border-white/5 flex items-center gap-5 backdrop-blur-xl"
        >
             <div className={cn(
                "w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center",
                color === "cyan" && "text-cyan-400",
                color === "orange" && "text-orange-400",
                color === "rose" && "text-rose-400",
             )}>
                <Icon className="w-5 h-5" />
             </div>
             <div>
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{title}</div>
                <div className="text-xl font-bold text-white">{value}</div>
             </div>
        </motion.div>
    );
}

function ActionButton({ icon: Icon, label, desc, color }: any) {
    return (
        <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all text-left group">
            <div className={cn(
                "w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110",
                color === "violet" && "text-violet-400 bg-violet-500/10",
                color === "rose" && "text-rose-400 bg-rose-500/10",
                color === "emerald" && "text-emerald-400 bg-emerald-500/10",
                color === "orange" && "text-orange-400 bg-orange-500/10",
            )}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <div className="text-sm font-bold text-white">{label}</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">{desc}</div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
        </button>
    );
}

function LogItem({ icon: Icon, color, user, action, time }: any) {
    return (
        <div className="flex items-center gap-5 p-4 rounded-3xl bg-white/2 hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
             <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                color === "violet" && "bg-violet-600/20 text-violet-400 shadow-violet-500/10",
                color === "blue" && "bg-blue-600/20 text-blue-400 shadow-blue-500/10",
                color === "emerald" && "bg-emerald-600/20 text-emerald-400 shadow-emerald-500/10",
                color === "orange" && "bg-orange-600/20 text-orange-400 shadow-orange-500/10",
             )}>
                <Icon className="w-5 h-5" />
             </div>
             <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-zinc-200">{user}</span>
                    <span className="text-xs text-zinc-600">•</span>
                    <span className="text-xs text-zinc-500">{time}</span>
                </div>
                <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{action}</div>
             </div>
             <button className="p-2 rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all">
                <MoreVertical className="w-4 h-4 text-zinc-500" />
             </button>
        </div>
    );
}
