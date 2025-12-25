"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppSession } from "@/lib/app-session-context";
import { useTheme } from "@/lib/theme-context";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import {
  Users,
  Bot,
  DollarSign,
  Activity,
  Shield,
  Zap,
  Globe,
  Plus,
  ArrowUpRight,
  MoreHorizontal,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStats {
  totalUsers: number;
  totalDevelopers: number;
  totalBots: number;
  totalRevenue: number;
  activeUsers: number;
  pendingApprovals: number;
}

interface ActivityItem {
  id: string;
  type: 'purchase' | 'alert' | 'signup' | 'system';
  user: string;
  action: string;
  time: string;
}

export default function AdminDashboard() {
  const { profile } = useAppSession();
  const { theme } = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isDark = theme === "dark";
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDevelopers: 0,
    totalBots: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingApprovals: 0
  });
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (profile?.email !== "akinlorinjeremiah@gmail.com") {
      window.location.href = "/dashboard";
      return;
    }
    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/activity")
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      if (activityRes.ok) {
        const data = await activityRes.json();
        setActivity(data.activity);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading && !stats.totalUsers) { // Show skeleton only on initial load
    return (
      <DashboardPageShell title="Overview" className="">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-neutral-100 dark:bg-white/5" />
            ))}
          </div>
          <div className="h-96 rounded-lg bg-neutral-100 dark:bg-white/5" />
        </div>
      </DashboardPageShell>
    )
  }

  return (
    <DashboardPageShell
      title="Overview"
      description="Platform metrics and management"
      className=""
    >
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            delta={"+12%"}
          />
          <StatCard
            label="Active Bots"
            value={formatNumber(stats.totalBots)}
            delta={"+5%"}
          />
          <StatCard
            label="Developers"
            value={formatNumber(stats.totalDevelopers)}
          />
          <StatCard
            label="Total Users"
            value={formatNumber(stats.totalUsers)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">

            {/* Activity Feed */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Live Activity</h3>
                <div className="flex gap-2">
                  <button className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-md transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-white/10">
                    <Search className="w-3.5 h-3.5 text-neutral-500" />
                  </button>
                  <button className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-md transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-white/10">
                    <Filter className="w-3.5 h-3.5 text-neutral-500" />
                  </button>
                </div>
              </div>

              <div className="border border-neutral-200 dark:border-white/10 rounded-lg bg-white dark:bg-black overflow-hidden shadow-[0px_2px_8px_rgba(0,0,0,0.02)]">
                <div className="divide-y divide-neutral-100 dark:divide-white/5">
                  {activity.length === 0 ? (
                    <div className="p-8 text-center text-sm text-neutral-500">No recent activity found.</div>
                  ) : (
                    activity.map((item) => (
                      <ActivityRow
                        key={item.id}
                        user={item.user}
                        action={item.action}
                        time={getTimeAgo(item.time)}
                        type={item.type}
                      />
                    ))
                  )}
                </div>
                <div className="p-2 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-white/10 text-center">
                  <button className="w-full py-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">
                    View Full Log
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Quick Actions */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <QuickAction label="Manage Users" href="/dashboard/admin/users" />
                <QuickAction label="Review Bots" href="/dashboard/admin/approvals" badge={stats.pendingApprovals > 0 ? stats.pendingApprovals.toString() : undefined} />
                <QuickAction label="System Logs" href="/dashboard/admin/logs" />

                <button className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-md transition-colors border border-dashed border-neutral-200 dark:border-white/10">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Resource</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-neutral-50/50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">System Health</h4>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Operational</span>
                </div>
              </div>
              <div className="space-y-3">
                <HealthIndicator label="API Latency" value="24ms" status="good" />
                <HealthIndicator label="Error Rate" value="0.01%" status="good" />
                <HealthIndicator label="Database" value="Connected" status="good" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardPageShell>
  );
}

function StatCard({ label, value, delta }: { label: string, value: string, delta?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-5 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black shadow-[0px_2px_8px_rgba(0,0,0,0.02)]"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold text-neutral-900 dark:text-white tracking-tight leading-none">
          {value}
        </span>
        {delta && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-500 mb-0.5">
            {delta}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function ActivityRow({ user, action, time, type }: { user: string, action: string, time: string, type: string }) {
  const getIcon = () => {
    switch (type) {
      case 'purchase': return <DollarSign className="w-3.5 h-3.5 text-emerald-500" />;
      case 'signup': return <Users className="w-3.5 h-3.5 text-blue-500" />;
      case 'alert': return <AlertCircle className="w-3.5 h-3.5 text-orange-500" />;
      default: return <CheckCircle2 className="w-3.5 h-3.5 text-neutral-500" />;
    }
  };

  return (
    <div className="flex items-center gap-3 p-3.5 hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors group">
      <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200 dark:border-white/5">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-200 truncate pr-4">
            {action}
          </p>
          <div className="flex items-center gap-1.5 shrink-0 text-neutral-400">
            <Clock className="w-3 h-3" />
            <span className="text-xs">{time}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          <p className="text-xs text-neutral-500 truncate">
            {user}
          </p>
        </div>
      </div>
      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-200 dark:hover:bg-white/10 rounded transition-all">
        <MoreHorizontal className="w-4 h-4 text-neutral-500" />
      </button>
    </div>
  );
}

function QuickAction({ label, href, badge }: { label: string, href?: string, badge?: string }) {
  return (
    <a href={href || "#"} className="flex items-center justify-between px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 rounded-md transition-all text-left group border border-transparent hover:border-neutral-200 dark:hover:border-white/10">
      <span>{label}</span>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 rounded-full">
            {badge}
          </span>
        )}
        <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>
    </a>
  );
}

function HealthIndicator({ label, value, status }: { label: string, value: string, status: 'good' | 'neutral' | 'bad' }) {
  const color = {
    good: 'bg-emerald-500',
    neutral: 'bg-amber-500',
    bad: 'bg-rose-500'
  }[status];

  return (
    <div className="flex items-center justify-between text-xs group cursor-default">
      <span className="text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono font-medium text-neutral-900 dark:text-neutral-200">{value}</span>
        <div className={cn("w-1.5 h-1.5 rounded-full shadow-sm", color)} />
      </div>
    </div>
  );
}
