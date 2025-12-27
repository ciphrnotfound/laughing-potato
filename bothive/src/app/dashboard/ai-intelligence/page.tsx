"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAppSession } from "@/lib/app-session-context";
import { useTheme } from "@/lib/theme-context";
import ProfessionalAlert from "@/components/ui/game-alert";
import DashboardBackground from "@/components/DashboardBackground";
import ThemeToggle from "@/components/ThemeToggle";
import AIChatInterface from "@/components/AIChatInterface";
import AIVoiceIntegration from "@/components/AIVoiceIntegration";
import {
  Brain,
  TrendingUp,
  Users,
  MessageSquare,
  Zap,
  Target,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Bot,
  Cpu,
  Database,
  RefreshCw,
  Settings,
  Play,
  Pause,
  Calendar,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Globe,
  Wifi,
  Server,
  Shield,
  Layers,
  Grid3X3,
  Command,
  Terminal,
  Code,
  FileText,
  Mail,
  Bell,
  Search,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIMetrics {
  totalInteractions: number;
  averageResponseTime: number;
  userSatisfaction: number;
  intentAccuracy: number;
  learningProgress: number;
  activeConversations: number;
  topIntents: Array<{ type: string; count: number }>;
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  performanceTrends: Array<{
    date: string;
    satisfaction: number;
    responseTime: number;
    interactions: number;
  }>;
  systemHealth: {
    cpu: number;
    memory: number;
    uptime: number;
  };
}

interface CronJob {
  id: string;
  name: string;
  description: string;
  schedule: string;
  status: 'active' | 'paused' | 'error';
  lastRun: string;
  nextRun: string;
  executionTime: number;
  successRate: number;
  enabled: boolean;
}

interface Alert {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  autoClose?: boolean;
}

export default function AIIntelligenceDashboard() {
  const { profile } = useAppSession();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [metrics, setMetrics] = useState<AIMetrics | null>(null);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'error'>('all');
  const [showChat, setShowChat] = useState(false);
  const [alert, setAlert] = useState<Alert | null>(null);

  useEffect(() => {
    if (profile) {
      fetchAIMetrics();
    }
  }, [profile, timeRange]);

  const fetchAIMetrics = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      // For now, use mock data since database isn't set up yet
      // TODO: Replace with real database queries once tables are created
      const mockMetrics: AIMetrics = {
        totalInteractions: 127,
        averageResponseTime: 1850,
        userSatisfaction: 87.3,
        intentAccuracy: 91.2,
        learningProgress: 73.5,
        activeConversations: 8,
        topIntents: [
          { type: "question", count: 45 },
          { type: "task", count: 32 },
          { type: "request", count: 28 },
          { type: "conversation", count: 15 },
          { type: "complaint", count: 7 }
        ],
        sentimentAnalysis: {
          positive: 68,
          neutral: 24,
          negative: 8
        },
        performanceTrends: generateTrends(timeRange),
        systemHealth: {
          cpu: 42.7,
          memory: 61.3,
          uptime: 99.97
        }
      };

      // Simulate API delay
      // await new Promise(resolve => setTimeout(resolve, 1000));

      setMetrics(mockMetrics);

      // Try to fetch real data (will fail gracefully until database is set up)
      try {
        const { data: conversations, error: convError } = await supabase
          .from('conversation_history')
          .select('*')
          .eq('user_id', profile.id)
          .gte('timestamp', getTimeRangeStart(timeRange))
          .order('timestamp', { ascending: false });

        if (!convError && conversations) {
          // Real data available, process it
          const processedMetrics = processMetrics(conversations, [], []);
          setMetrics(processedMetrics);
        }
      } catch (dbError) {
        console.log('Database not set up yet, using mock data');
      }

    } catch (error) {
      console.error('Error fetching AI metrics:', error);
      setAlert({
        type: "error",
        title: "Failed to load AI metrics",
        message: "Using demo data for now."
      });
    } finally {
      setLoading(false);
    }
  };

  const processMetrics = (conversations: any[], learningData: any[], feedbackData: any[]): AIMetrics => {
    // Calculate total interactions
    const totalInteractions = conversations.filter(c => c.role === 'user').length;

    // Calculate average response time
    const avgResponseTime = learningData.length > 0
      ? learningData.reduce((sum, d) => sum + (d.resolution_time || 0), 0) / learningData.length
      : 0;

    // Calculate user satisfaction
    const positiveFeedback = feedbackData.filter(f => f.rating >= 4).length;
    const userSatisfaction = feedbackData.length > 0 ? (positiveFeedback / feedbackData.length) * 100 : 0;

    // Calculate intent accuracy (mock data for now)
    const intentAccuracy = 85 + Math.random() * 10; // 85-95%

    // Calculate learning progress
    const learningProgress = learningData.length > 0 ? Math.min((learningData.length / 100) * 100, 100) : 0;

    // Count active conversations
    const uniqueConversations = new Set(conversations.map(c => c.conversation_id)).size;

    // Analyze top intents
    const intentCounts = conversations
      .filter(c => c.intent_data)
      .reduce((acc, c) => {
        const type = c.intent_data.type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topIntents = Object.entries(intentCounts)
      .sort(([, a]: [string, unknown], [, b]: [string, unknown]) => Number(b) - Number(a))
      .slice(0, 5)
      .map(([type, count]) => ({ type, count: Number(count) }));

    // Analyze sentiment
    const sentimentAnalysis = conversations
      .filter(c => c.intent_data?.sentiment)
      .reduce(
        (acc, c) => {
          const sentiment = c.intent_data.sentiment;
          acc[sentiment as keyof typeof acc]++;
          return acc;
        },
        { positive: 0, neutral: 0, negative: 0 }
      );

    // Generate performance trends (mock data)
    const performanceTrends = generateTrends(timeRange);

    return {
      totalInteractions,
      averageResponseTime: avgResponseTime,
      userSatisfaction,
      intentAccuracy,
      learningProgress,
      activeConversations: uniqueConversations,
      topIntents,
      sentimentAnalysis,
      performanceTrends,
      systemHealth: {
        cpu: 42.7,
        memory: 61.3,
        uptime: 99.97
      }
    };
  };

  const generateTrends = (range: 'day' | 'week' | 'month') => {
    const points = range === 'day' ? 24 : range === 'week' ? 7 : 30;
    const trends = [];

    for (let i = 0; i < points; i++) {
      const date = new Date();
      date.setHours(date.getHours() - (range === 'day' ? i : i * 24));

      trends.push({
        date: date.toISOString().split('T')[0],
        satisfaction: 75 + Math.random() * 20,
        responseTime: 1000 + Math.random() * 2000,
        interactions: Math.floor(Math.random() * 50)
      });
    }

    return trends.reverse();
  };

  const getTimeRangeStart = (range: 'day' | 'week' | 'month') => {
    const now = new Date();
    switch (range) {
      case 'day':
        return new Date(now.setHours(now.getHours() - 24)).toISOString();
      case 'week':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
    }
  };

  // Cron job functionality
  const triggerAlert = useCallback((alert: Alert) => {
    setAlert(alert);
    if (alert.autoClose !== false) {
      setTimeout(() => setAlert(null), 5000);
    }
  }, []);

  const handleCronJobToggle = async (jobId: string, enabled: boolean) => {
    setCronJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, enabled, status: enabled ? 'active' : 'paused' } : job
    ));

    triggerAlert({
      type: 'success',
      title: 'Cron Job Updated',
      message: `Cron job has been ${enabled ? 'enabled' : 'disabled'} successfully.`
    });
  };

  const handleCronJobRun = async (jobId: string) => {
    const job = cronJobs.find(j => j.id === jobId);
    if (job) {
      setCronJobs(prev => prev.map(j =>
        j.id === jobId ? { ...j, status: 'active' } : j
      ));

      triggerAlert({
        type: 'info',
        title: 'Cron Job Triggered',
        message: `${job.name} has been manually triggered.`
      });
    }
  };

  // Mock cron jobs data
  const mockCronJobs: CronJob[] = [
    {
      id: "1",
      name: "AI Model Training",
      description: "Retrain AI models with new data",
      schedule: "0 2 * * *",
      status: "active",
      lastRun: "2024-01-15 02:00:00",
      nextRun: "2024-01-16 02:00:00",
      executionTime: 1247,
      successRate: 98.5,
      enabled: true
    },
    {
      id: "2",
      name: "Data Cleanup",
      description: "Clean up old conversation logs",
      schedule: "0 3 * * 0",
      status: "active",
      lastRun: "2024-01-14 03:00:00",
      nextRun: "2024-01-21 03:00:00",
      executionTime: 342,
      successRate: 100,
      enabled: true
    },
    {
      id: "3",
      name: "Performance Analytics",
      description: "Generate daily performance reports",
      schedule: "0 1 * * *",
      status: "error",
      lastRun: "2024-01-15 01:00:00",
      nextRun: "2024-01-16 01:00:00",
      executionTime: 892,
      successRate: 92.1,
      enabled: true
    },
    {
      id: "4",
      name: "Model Backup",
      description: "Backup trained AI models",
      schedule: "0 4 * * 6",
      status: "paused",
      lastRun: "2024-01-13 04:00:00",
      nextRun: "2024-01-20 04:00:00",
      executionTime: 2156,
      successRate: 96.8,
      enabled: false
    }
  ];

  // Initialize cron jobs
  useEffect(() => {
    if (profile) {
      setCronJobs(mockCronJobs);
    }
  }, [profile]);

  const filteredCronJobs = cronJobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Please sign in to view AI Intelligence dashboard.</p>
      </div>
    );
  }

  // Background classes matching signup page
  const rootBackground = cn(
    "relative min-h-screen overflow-hidden transition-colors duration-500",
    isDark
      ? "bg-[#0C1024] text-white"
      : "bg-gradient-to-br from-[#0C1024] via-[#1a1f3a] to-[#0C1024] text-white"
  );

  const gridOverlayClass = cn(
    "absolute inset-0 bg-[length:64px_64px]",
    isDark
      ? "bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] opacity-40"
      : "bg-[linear-gradient(to_right,rgba(12,16,36,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(12,16,36,0.08)_1px,transparent_1px)] opacity-70"
  );

  const radialOverlayClass = cn(
    "absolute inset-x-0 top-[-240px] h-[520px] rounded-full",
    isDark
      ? "bg-[radial-gradient(circle_at_center,rgba(108,67,255,0.15),transparent_70%)]"
      : "bg-[radial-gradient(circle_at_center,rgba(108,67,255,0.12),transparent_70%)]"
  );

  // Text colors matching signup page
  const subduedText = isDark ? "text-white/60" : "text-white/60";
  const strongText = isDark ? "text-white" : "text-white";

  return (
    <div className={rootBackground}>
      {/* Background overlays matching signup page */}
      <div className="pointer-events-none absolute inset-0">
        <div className={radialOverlayClass} />
        <div className={gridOverlayClass} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className={cn(
              "text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] bg-clip-text text-transparent"
            )}>
              AI Intelligence Center
            </h1>
            <p className={cn("text-base lg:text-lg", subduedText)}>
              Advanced AI analytics, automation, and system monitoring
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Time Range Selector */}
            <div className="flex gap-1 p-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              {(['day', 'week', 'month'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200",
                    timeRange === range
                      ? "bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] text-white shadow-lg shadow-[#6C43FF]/25"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  )}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>

            {/* Metric Selector */}
            <div className="flex items-center gap-2 p-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              {['overview', 'performance', 'automation'].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200",
                    selectedMetric === metric
                      ? "bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] text-white shadow-lg shadow-[#6C43FF]/25"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  )}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>

            <ThemeToggle />
          </div>
        </div>

        {/* Alert */}
        <AnimatePresence>
          {alert && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-4 sm:px-6 lg:px-8 mb-6"
            >
              <ProfessionalAlert
                variant={alert.type}
                title={alert.title}
                message={alert.message}
                open={true}
                onClose={() => setAlert(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Overview Section */}
              {selectedMetric === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Interactions Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#6C43FF]/20 to-[#8A63FF]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-60" />
                      <div className="relative p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-[#6C43FF]/30 hover:bg-white/[0.05] transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-xl bg-gradient-to-r from-[#6C43FF]/20 to-[#8A63FF]/20 border border-white/10">
                            <MessageSquare className="w-5 h-5 text-white" />
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-[#6C43FF]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">{metrics?.totalInteractions.toLocaleString()}</h3>
                        <p className={subduedText + " text-sm"}>Total Interactions</p>
                      </div>
                    </motion.div>

                    {/* User Satisfaction Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#6C43FF]/20 to-[#8A63FF]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-60" />
                      <div className="relative p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-[#6C43FF]/30 hover:bg-white/[0.05] transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-xl bg-gradient-to-r from-[#6C43FF]/20 to-[#8A63FF]/20 border border-white/10">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-[#6C43FF]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">{metrics?.userSatisfaction}%</h3>
                        <p className={subduedText + " text-sm"}>User Satisfaction</p>
                      </div>
                    </motion.div>

                    {/* Response Time Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#6C43FF]/20 to-[#8A63FF]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-60" />
                      <div className="relative p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-[#6C43FF]/30 hover:bg-white/[0.05] transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-xl bg-gradient-to-r from-[#6C43FF]/20 to-[#8A63FF]/20 border border-white/10">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <ArrowDownRight className="w-4 h-4 text-[#6C43FF]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">{metrics?.averageResponseTime}ms</h3>
                        <p className={subduedText + " text-sm"}>Avg Response Time</p>
                      </div>
                    </motion.div>

                    {/* Intent Accuracy Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#6C43FF]/20 to-[#8A63FF]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-60" />
                      <div className="relative p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-[#6C43FF]/30 hover:bg-white/[0.05] transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-xl bg-gradient-to-r from-[#6C43FF]/20 to-[#8A63FF]/20 border border-white/10">
                            <Target className="w-5 h-5 text-white" />
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-[#6C43FF]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">{metrics?.intentAccuracy}%</h3>
                        <p className={subduedText + " text-sm"}>Intent Accuracy</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* System Health and Additional Metrics */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* System Health */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
                    >
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-[#6C43FF]" />
                        System Health
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className={subduedText}>CPU Usage</span>
                            <span className="text-white">{metrics?.systemHealth.cpu}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] h-2 rounded-full transition-all duration-500"
                              style={{ width: `${metrics?.systemHealth.cpu}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className={subduedText}>Memory Usage</span>
                            <span className="text-white">{metrics?.systemHealth.memory}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] h-2 rounded-full transition-all duration-500"
                              style={{ width: `${metrics?.systemHealth.memory}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className={subduedText}>Uptime</span>
                            <span className="text-white">{metrics?.systemHealth.uptime}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${metrics?.systemHealth.uptime}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Sentiment Analysis */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
                    >
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-[#6C43FF]" />
                        Sentiment Analysis
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-green-400 text-sm">Positive</span>
                          <span className="text-white font-medium">{metrics?.sentimentAnalysis.positive}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Neutral</span>
                          <span className="text-white font-medium">{metrics?.sentimentAnalysis.neutral}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-red-400 text-sm">Negative</span>
                          <span className="text-white font-medium">{metrics?.sentimentAnalysis.negative}%</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Top Intents */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
                    >
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#6C43FF]" />
                        Top Intents
                      </h3>
                      <div className="space-y-2">
                        {metrics?.topIntents.slice(0, 5).map((intent, index) => (
                          <div key={intent.type} className="flex justify-between items-center">
                            <span className={subduedText + " text-sm capitalize"}>{intent.type.replace('_', ' ')}</span>
                            <span className="text-white font-medium">{intent.count.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Performance Section */}
              {selectedMetric === 'performance' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                      <h3 className="text-lg font-semibold text-white mb-4">Performance Trends</h3>
                      <div className="space-y-3">
                        {metrics?.performanceTrends.map((trend) => (
                          <div key={trend.date} className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02]">
                            <span className={subduedText}>{trend.date}</span>
                            <div className="flex gap-4">
                              <span className="text-green-400">{trend.satisfaction}% satisfaction</span>
                              <span className="text-blue-400">{trend.responseTime}ms response</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                      <h3 className="text-lg font-semibold text-white mb-4">Learning Progress</h3>
                      <div className="flex items-center justify-center h-32">
                        <div className="relative">
                          <div className="w-32 h-32 rounded-full border-8 border-white/10">
                            <div
                              className="absolute inset-0 rounded-full border-8 border-transparent border-t-[#6C43FF] border-r-[#8A63FF] transition-all duration-1000"
                              style={{
                                transform: `rotate(${(metrics?.learningProgress || 0) * 3.6}deg)`,
                              }}
                            />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">{metrics?.learningProgress}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Automation Section */}
              {selectedMetric === 'automation' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Cron Jobs Controls */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex-1 max-w-md">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="text"
                          placeholder="Search cron jobs..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-[#6C43FF]/50 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-[#6C43FF]/50 focus:outline-none"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="error">Error</option>
                      </select>

                      <button className="p-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Cron Jobs Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredCronJobs.map((job) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group"
                      >
                        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-[#6C43FF]/30 hover:bg-white/[0.05] transition-all duration-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "p-2 rounded-lg",
                                job.status === 'active' ? "bg-green-500/20 text-green-400" :
                                  job.status === 'error' ? "bg-red-500/20 text-red-400" :
                                    "bg-gray-500/20 text-gray-400"
                              )}>
                                <Terminal className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-white">{job.name}</h4>
                                <p className={subduedText + " text-xs"}>{job.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCronJobToggle(job.id, !job.enabled)}
                                className={cn(
                                  "p-2 rounded-lg transition-colors",
                                  job.enabled ? "bg-[#6C43FF]/20 text-[#6C43FF]" : "bg-white/10 text-white/60"
                                )}
                              >
                                {job.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleCronJobRun(job.id)}
                                className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className={subduedText}>Schedule</p>
                              <p className="text-white font-mono">{job.schedule}</p>
                            </div>
                            <div>
                              <p className={subduedText}>Success Rate</p>
                              <p className="text-white">{job.successRate}%</p>
                            </div>
                            <div>
                              <p className={subduedText}>Last Run</p>
                              <p className="text-white">{new Date(job.lastRun).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className={subduedText}>Execution Time</p>
                              <p className="text-white">{job.executionTime}ms</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Add New Cron Job */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] hover:border-[#6C43FF]/30 transition-all duration-200"
                  >
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-r from-[#6C43FF]/20 to-[#8A63FF]/20 border border-white/10 flex items-center justify-center mb-4">
                        <Plus className="w-6 h-6 text-[#6C43FF]" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Add New Cron Job</h3>
                      <p className={subduedText + " mb-4"}>
                        Create automated tasks for AI model training, data processing, and system maintenance
                      </p>
                      <button className="px-4 py-2 bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] text-white rounded-lg hover:shadow-lg hover:shadow-[#6C43FF]/25 transition-all duration-200">
                        Create Cron Job
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <button
          onClick={() => setShowChat(!showChat)}
          className="relative group p-4 rounded-full bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] text-white shadow-lg shadow-[#6C43FF]/25 hover:shadow-xl hover:shadow-[#6C43FF]/40 transition-all duration-300 hover:scale-110"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
          <div className="relative">
            <Bot className="w-6 h-6" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        </button>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black/80 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          AI Assistant
        </div>
      </motion.div>

      {/* AI Chat Interface */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-8 z-40 w-96 max-w-[90vw]"
          >
            <AIChatInterface />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

