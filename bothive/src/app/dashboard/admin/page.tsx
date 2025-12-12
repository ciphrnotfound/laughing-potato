"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppSession } from "@/lib/app-session-context";
import { useTheme } from "@/lib/theme-context";
import DashboardBackground from "@/components/DashboardBackground";
import ThemeToggle from "@/components/ThemeToggle";
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
  Eye,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export default function AdminDashboard() {
  const { profile } = useAppSession();
  const { theme } = useTheme();
  const isDark = theme === "dark";
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
      // Mock admin stats for now
      setStats({
        totalUsers: 1247,
        totalDevelopers: 89,
        totalBots: 456,
        totalRevenue: 45678,
        activeUsers: 892,
        pendingApprovals: 12
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <DashboardBackground>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} 
                className="rounded-2xl h-32 animate-pulse"
                style={{
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                }}
              />
            ))}
          </div>
        </div>
      </DashboardBackground>
    );
  }

  return (
    <DashboardBackground>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Platform overview and management</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border rounded-2xl p-6"
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+12.5%</span>
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {formatNumber(stats.totalUsers)}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Total Users
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border rounded-2xl p-6"
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+8.3%</span>
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {formatNumber(stats.totalBots)}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Total Bots
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border rounded-2xl p-6"
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+24.7%</span>
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(stats.totalRevenue)}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Total Revenue
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="border rounded-2xl p-6"
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-xl">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+5.2%</span>
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {formatNumber(stats.activeUsers)}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Active Users
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border rounded-2xl p-6"
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-yellow-600 font-medium">Pending</span>
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.pendingApprovals}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Pending Approvals
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="border rounded-2xl p-6"
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+18.9%</span>
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.totalDevelopers}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Total Developers
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="border rounded-2xl p-6"
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors"
                style={{
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                }}>
                <Users className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                <span style={{ color: 'var(--text-primary)' }}>Manage Users</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors"
                style={{
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                }}>
                <Bot className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                <span style={{ color: 'var(--text-primary)' }}>Review Bots</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors"
                style={{
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                }}>
                <Settings className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                <span style={{ color: 'var(--text-primary)' }}>Platform Settings</span>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="border rounded-2xl p-6"
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div className="flex-1">
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    New bot approved
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    2 minutes ago
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    New developer registered
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    15 minutes ago
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <div className="flex-1">
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    Bot requires review
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    1 hour ago
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardBackground>
  );
}
