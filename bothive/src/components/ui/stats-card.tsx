"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  description,
  className,
  loading,
}: StatsCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-br from-violet-600/10 to-violet-900/20 p-6 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-violet-500/10",
        className
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-violet-900/10" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "p-2 rounded-lg",
            "bg-violet-500/10 text-violet-400"
          )}>
            <Icon className="w-5 h-5" />
          </div>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-gray-500"
            )}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : null}
              {Math.abs(change)}%
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          <p className="text-sm text-violet-200">{title}</p>
          {description && (
            <p className="text-xs text-violet-300/70 mt-2">{description}</p>
          )}
        </div>
      </div>

      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/20 via-violet-600/10 to-violet-500/20 opacity-0 transition-opacity hover:opacity-100" />
    </motion.div>
  );
}