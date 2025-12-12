"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAppSession } from "@/lib/app-session-context";
import { useTheme } from "@/lib/theme-context";
import ProfessionalAlert from "@/components/ui/game-alert";
import DashboardBackground from "@/components/DashboardBackground";
import ThemeToggle from "@/components/ThemeToggle";
import AIAnalyticsInsights from "@/components/AIAnalyticsInsights";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Zap,
    HardDrive,
    Calendar,
    Download,
    Settings,
    Activity,
    Target,
    Clock,
    PieChart,
    BarChart3,
    Filter,
    Brain
} from "lucide-react";

interface AnalyticsData {
    subscription: {
        plan: {
            name: string;
            max_api_calls_per_month: number;
            max_tokens_per_month: number;
            max_storage_mb: number;
        };
        status: string;
        current_period_start: string;
        current_period_end: string;
    };
    usage: {
        api_calls: {
            used: number;
            limit: number;
            percentage: number;
            cost: number;
        };
        tokens: {
            used: number;
            limit: number;
            percentage: number;
            cost: number;
        };
        storage: {
            used: number;
            limit: number;
            percentage: number;
            cost: number;
        };
    };
    usage_records: any[];
    alerts: any[];
    period: {
        start: string;
        end: string;
        type: string;
    };
}

export default function AnalyticsPage() {
    const { profile } = useAppSession();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("current");
    const [selectedMetric, setSelectedMetric] = useState("overview");
    const [showAlert, setShowAlert] = useState<{
        type: "success" | "error" | "warning" | "info";
        title: string;
        message?: string;
        autoClose?: number;
    } | null>(null);
    const [showAIInsights, setShowAIInsights] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/billing/usage/track?period=${period}`);
            const data = await response.json();
            setAnalytics(data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const formatCurrency = (cents: number) => {
        return `$${(cents / 100).toFixed(2)}`;
    };

    const getUsageColor = (percentage: number) => {
        if (percentage >= 90) return "text-red-600 bg-red-50 border-red-200";
        if (percentage >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200";
        return "text-green-600 bg-green-50 border-green-200";
    };

    const getTrendIcon = (isPositive: boolean) => {
        return isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
        ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
        );
    };

    if (loading) {
        return (
            <DashboardBackground>
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Analytics Dashboard</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Monitor your usage and performance metrics</p>
                        </div>
                        <ThemeToggle />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="bg-gray-50 rounded-2xl h-32 animate-pulse" />
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
                        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Analytics Dashboard</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Monitor your usage and performance metrics</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* AI Insights Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAIInsights(!showAIInsights)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300"
                            style={{
                                background: showAIInsights
                                    ? 'linear-gradient(135deg, #6C43FF, #8A63FF)'
                                    : isDark
                                        ? 'rgba(255, 255, 255, 0.1)'
                                        : 'rgba(139, 92, 246, 0.1)',
                                color: showAIInsights ? 'white' : isDark ? 'white' : '#6C43FF',
                                border: `1px solid ${showAIInsights ? 'transparent' : isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`
                            }}
                        >
                            <Brain className="w-4 h-4" />
                            {showAIInsights ? 'Hide' : 'Show'} AI
                        </motion.button>

                        <div className="flex items-center gap-2">
                            {["current", "last_month", "year"].map((periodOption) => (
                                <button
                                    key={periodOption}
                                    onClick={() => setPeriod(periodOption)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                        period === periodOption
                                            ? "bg-linear-to-r from-purple-600 to-purple-800 shadow-lg shadow-purple-500/25"
                                            : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                                    }`}
                                >
                                    {periodOption === "current" ? "This Month" : periodOption === "last_month" ? "Last Month" : "This Year"}
                                </button>
                            ))}
                        </div>
                        <ThemeToggle />
                    </div>
                </div>

                {/* AI Insights Section */}
                <AnimatePresence>
                    {showAIInsights && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8"
                        >
                            <div className="max-w-7xl mx-auto">
                                <div className="rounded-3xl border border-white/12 bg-white/[0.04] backdrop-blur-xl overflow-hidden">
                                    <AIAnalyticsInsights />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setShowAlert({
                                type: "info",
                                title: "Export Analytics",
                                message: "Analytics data will be downloaded as CSV file",
                                autoClose: 3000
                            });
                        }}
                        className="p-2.5 backdrop-blur-sm border rounded-xl hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                        style={{
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                            borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.3)'
                        }}
                    >
                        <Download className="w-5 h-5 text-purple-600" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2.5 backdrop-blur-sm border rounded-xl hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                        style={{
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                            borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.3)'
                        }}
                    >
                        <Settings className="w-5 h-5 text-purple-600" />
                    </motion.button>
                </div>
            </div>

            {/* Subscription Status */}
            {analytics?.subscription && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                    <div className="bg-linear-to-r from-purple-600 to-purple-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold mb-1">{analytics?.subscription?.plan?.name || 'Unknown'} Plan</h2>
                                <p className="text-purple-100">
                                    Period: {new Date(analytics?.subscription?.current_period_start || Date.now()).toLocaleDateString()} -{" "}
                                    {new Date(analytics?.subscription?.current_period_end || Date.now()).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold">
                                    {formatCurrency((analytics.usage.api_calls?.cost || 0) + (analytics.usage.tokens?.cost || 0) + (analytics.usage.storage?.cost || 0))}
                                </div>
                                <div className="text-purple-100 text-sm">Current Period Cost</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Usage Overview */}
            {analytics?.usage && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* API Calls */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-200 rounded-2xl p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-50 rounded-xl">
                                    <Zap className="w-6 h-6 text-purple-600" />
                                </div>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getUsageColor(analytics.usage.api_calls.percentage)}`}>
                  {analytics.usage.api_calls.percentage}% used
                </span>
                            </div>
                            <div className="mb-4">
                                <div className="text-2xl font-bold text-black">
                                    {formatNumber(analytics.usage.api_calls.used)}
                                </div>
                                <div className="text-gray-500 text-sm">
                                    of {formatNumber(analytics.usage.api_calls.limit)} calls
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                <div
                                    className="bg-linear-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(analytics.usage.api_calls.percentage, 100)}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Cost: {formatCurrency(analytics.usage.api_calls.cost)}</span>
                                {getTrendIcon(true)}
                            </div>
                        </motion.div>

                        {/* Tokens */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white border border-gray-200 rounded-2xl p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-50 rounded-xl">
                                    <Activity className="w-6 h-6 text-blue-600" />
                                </div>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getUsageColor(analytics.usage.tokens.percentage)}`}>
                  {analytics.usage.tokens.percentage}% used
                </span>
                            </div>
                            <div className="mb-4">
                                <div className="text-2xl font-bold text-black">
                                    {formatNumber(analytics.usage.tokens.used)}
                                </div>
                                <div className="text-gray-500 text-sm">
                                    of {formatNumber(analytics.usage.tokens.limit)} tokens
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                <div
                                    className="bg-linear-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(analytics.usage.tokens.percentage, 100)}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Cost: {formatCurrency(analytics.usage.tokens.cost)}</span>
                                {getTrendIcon(true)}
                            </div>
                        </motion.div>

                        {/* Storage */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white border border-gray-200 rounded-2xl p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-50 rounded-xl">
                                    <BarChart3 className="w-6 h-6 text-green-600" />
                                </div>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getUsageColor(analytics.usage.storage.percentage)}`}>
                  {analytics.usage.storage.percentage}% used
                </span>
                            </div>
                            <div className="mb-4">
                                <div className="text-2xl font-bold text-black">
                                    {analytics.usage.storage.used} MB
                                </div>
                                <div className="text-gray-500 text-sm">
                                    of {analytics.usage.storage.limit} MB
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                <div
                                    className="bg-linear-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(analytics.usage.storage.percentage, 100)}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Cost: {formatCurrency(analytics.usage.storage.cost)}</span>
                                {getTrendIcon(false)}
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Detailed Analytics */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Usage Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-black">Usage Trends</h3>
                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1.5 text-sm bg-purple-50 text-purple-600 rounded-lg font-medium">
                                    Daily
                                </button>
                                <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                    Weekly
                                </button>
                                <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                    Monthly
                                </button>
                            </div>
                        </div>

                        {/* Mock Chart */}
                        <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
                            <div className="text-center">
                                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">Usage chart will appear here</p>
                                <p className="text-gray-400 text-sm mt-1">Integration with chart library needed</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white border border-gray-200 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-semibold text-black mb-4">Recent Activity</h3>

                        <div className="space-y-3">
                            {analytics?.usage_records?.slice(0, 5).map((record, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Zap className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-black text-sm">
                                                {record.usage_type.replace('_', ' ').charAt(0).toUpperCase() + record.usage_type.slice(1)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(record.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-black text-sm">
                                            {formatNumber(record.quantity)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatCurrency(record.total_cost_cents)}
                                        </div>
                                    </div>
                                </div>
                            )) || (
                                <div className="text-center py-8">
                                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Alerts */}
                {analytics?.alerts && analytics.alerts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-6 bg-white border border-gray-200 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-semibold text-black mb-4">Usage Alerts</h3>

                        <div className="space-y-3">
                            {analytics.alerts.map((alert, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                            <Filter className="w-4 h-4 text-yellow-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-black">
                                                {alert.metric_type.charAt(0).toUpperCase() + alert.metric_type.slice(1)} Alert
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Threshold: {alert.threshold_percent}%
                                            </div>
                                        </div>
                                    </div>
                                    <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                                        Configure
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Alert Component */}
            <AnimatePresence>
                {showAlert && (
                    <ProfessionalAlert
                        open={!!showAlert}
                        title={showAlert?.title || ""}
                        message={showAlert?.message}
                        onClose={() => setShowAlert(null)}
                        variant={showAlert?.type || "info"}
                        autoClose={showAlert?.autoClose}
                    />
                )}
            </AnimatePresence>
        </DashboardBackground>
    );
}
