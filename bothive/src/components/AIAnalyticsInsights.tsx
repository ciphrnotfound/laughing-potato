"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Users, Zap, AlertCircle, CheckCircle } from "lucide-react";

interface Insight {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  description: string;
  metric?: string;
  value?: string;
  trend?: "up" | "down" | "neutral";
}

export default function AIAnalyticsInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI-generated insights
    const mockInsights: Insight[] = [
      {
        id: "1",
        type: "success",
        title: "Bot Performance Optimized",
        description: "Your coding assistant bot is responding 40% faster after recent optimizations.",
        metric: "Response Time",
        value: "1.2s",
        trend: "down"
      },
      {
        id: "2",
        type: "warning",
        title: "API Usage Spike Detected",
        description: "Notion integration usage increased by 150% this week. Consider reviewing automation rules.",
        metric: "API Calls",
        value: "2,847",
        trend: "up"
      },
      {
        id: "3",
        type: "info",
        title: "New Workflow Opportunity",
        description: "Based on your usage patterns, automating daily reports could save 3 hours/week.",
        metric: "Potential Savings",
        value: "3 hrs/week",
        trend: "neutral"
      },
      {
        id: "4",
        type: "success",
        title: "User Engagement High",
        description: "Your team members are actively using 85% of deployed bots this week.",
        metric: "Active Users",
        value: "12/14",
        trend: "up"
      }
    ];

    setTimeout(() => {
      setInsights(mockInsights);
      setLoading(false);
    }, 1000);
  }, []);

  const getIcon = (type: Insight["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Brain className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTrendIcon = (trend?: "up" | "down" | "neutral") => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend === "down") return <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />;
    return <div className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          AI Insights
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Brain className="w-4 h-4" />
          <span>Powered by AI</span>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${
              insight.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : insight.type === "warning"
                ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">{getIcon(insight.type)}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {insight.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {insight.description}
                </p>
                {(insight.metric || insight.value) && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {insight.metric}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {insight.value}
                      </span>
                    </div>
                    {getTrendIcon(insight.trend)}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg text-white">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-5 h-5" />
          <h3 className="font-semibold">Pro Tip</h3>
        </div>
        <p className="text-sm opacity-90">
          Set up automated alerts to get notified when your bot usage patterns change significantly.
        </p>
      </div>
    </div>
  );
}