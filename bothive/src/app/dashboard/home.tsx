"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppSession } from "@/lib/app-session-context";
import { supabase } from "@/lib/supabase";
import {
  Bot,
  Users,
  BarChart3,
  Activity,
  TrendingUp,
  Clock,
  DollarSign,
  Settings,
  Plus,
  MoreHorizontal,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface QuickStat {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: "success" | "error" | "pending";
}

export default function DashboardHome() {
  const { profile } = useAppSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's bots
      const { data: bots } = await supabase
        .from("bots")
        .select("*")
        .eq("user_id", profile?.id)
        .order("created_at", { ascending: false });

      // Fetch workspaces
      const { data: workspaces } = await supabase
        .from("workspaces")
        .select("*")
        .eq("owner_id", profile?.id);

      // Fetch analytics
      const { data: analytics } = await supabase
        .from("bot_analytics")
        .select("*")
        .eq("user_id", profile?.id)
        .order("execution_time", { ascending: false })
        .limit(5);

      // Mock stats for now
      setStats([
        {
          title: "Total Bots",
          value: (bots?.length || 0).toString(),
          change: 12,
          icon: Bot,
          color: "from-purple-600 to-purple-800"
        },
        {
          title: "Team Members",
          value: "24",
          change: -3,
          icon: Users,
          color: "from-blue-600 to-blue-800"
        },
        {
          title: "API Calls",
          value: "1.2K",
          change: 8,
          icon: Activity,
          color: "from-green-600 to-green-800"
        },
        {
          title: "Monthly Cost",
          value: "$29",
          change: 0,
          icon: DollarSign,
          color: "from-gray-600 to-gray-800"
        }
      ]);

      // Mock recent activity
      setRecentActivity([
        {
          id: "1",
          type: "bot_execution",
          description: "Customer Support Bot executed successfully",
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: "success"
        },
        {
          id: "2",
          type: "workspace_created",
          description: "New workspace 'Marketing Team' created",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          status: "success"
        },
        {
          id: "3",
          type: "bot_execution",
          description: "Data Analysis Bot failed to execute",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: "error"
        },
        {
          id: "4",
          type: "member_invited",
          description: "Invited john@example.com to workspace",
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          status: "pending"
        }
      ]);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-green-600 bg-green-50 border-green-200";
      case "error": return "text-red-600 bg-red-50 border-red-200";
      case "pending": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="w-full p-6 max-w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-gray-50 rounded-2xl h-96 animate-pulse" />
          <div className="bg-gray-50 rounded-2xl h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 max-w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Welcome back</h1>
        <p className="text-gray-500">Here's what's happening with your bots today</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-linear-to-r ${stat.color} rounded-xl text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.change > 0 ? "text-green-600" : stat.change < 0 ? "text-red-600" : "text-gray-600"
              }`}>
                {stat.change !== 0 && (
                  <>
                    {stat.change > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(stat.change)}%
                  </>
                )}
              </div>
            </div>
            <div className="text-2xl font-bold text-black mb-1">{stat.value}</div>
            <div className="text-gray-500 text-sm">{stat.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-black">Recent Activity</h2>
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-black">{activity.description}</div>
                    <div className="text-sm text-gray-500">{formatTimestamp(activity.timestamp)}</div>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Create Bot */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 p-4 bg-purple-50 text-purple-600 rounded-xl font-medium hover:bg-purple-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create New Bot
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 text-black rounded-xl font-medium hover:bg-gray-100 transition-colors"
              >
                <Users className="w-5 h-5" />
                Invite Team Member
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 text-black rounded-xl font-medium hover:bg-gray-100 transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
                View Analytics
              </motion.button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-black mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">API Status</span>
                <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Bot Runtime</span>
                <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full">
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database</span>
                <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full">
                  Connected
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
