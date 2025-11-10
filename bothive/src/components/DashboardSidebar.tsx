"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  Network,
  Store,
  Brain,
  Plug,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

const sidebarItems: SidebarItem[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" />, href: "/dashboard" },
  { id: "agents", label: "Agents", icon: <Zap className="w-5 h-5" />, href: "/dashboard?tab=agents" },
  { id: "orchestrator", label: "Orchestrator", icon: <Network className="w-5 h-5" />, href: "/dashboard?tab=orchestrator" },
  { id: "marketplace", label: "Marketplace", icon: <Store className="w-5 h-5" />, href: "/dashboard?tab=marketplace" },
  { id: "memory", label: "Memory", icon: <Brain className="w-5 h-5" />, href: "/dashboard?tab=memory" },
  { id: "integrations", label: "Integrations", icon: <Plug className="w-5 h-5" />, href: "/dashboard?tab=integrations" },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function DashboardSidebar({ isOpen, onClose, onCollapseChange }: DashboardSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get("tab") || "overview";
  const [collapsed, setCollapsed] = useState(false);

  const handleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      window.location.href = "/signin";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-white/70 dark:bg-white/5 backdrop-blur-2xl border-r border-black/10 dark:border-white/10 z-50 transition-all duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Minimal grid background */}
        <div className="absolute inset-0 opacity-60 pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:28px_28px]" />
        </div>

        {/* Subtle dark purple wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#160825]/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 px-4 py-5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white/70 shadow-sm dark:border-white/15 dark:bg-white/10">
                <Image
                  src="/colored-logo (2).png"
                  alt="Bothive"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <span className="block truncate text-sm font-semibold tracking-wide text-black dark:text-white">Bothive</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40">Dashboard</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCollapse}
                className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-black/50 transition hover:border-black/20 hover:text-black dark:border-white/10 dark:text-white/60 dark:hover:border-white/20 dark:hover:text-white"
                title={collapsed ? "Expand" : "Collapse"}
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="lg:hidden h-9 w-9 rounded-lg border border-black/10 text-black/50 transition hover:border-black/20 hover:text-black dark:border-white/10 dark:text-white/60 dark:hover:border-white/20 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id || (item.id === "overview" && pathname === "/dashboard" && !activeTab);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    onClose();
                  }}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg border px-3 py-2.5 transition",
                    isActive
                      ? "border-black/10 bg-black/5 text-black dark:border-white/10 dark:bg-white/10 dark:text-white"
                      : "border-transparent text-black/60 hover:border-black/10 hover:bg-black/5 hover:text-black dark:text-white/60 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <span className={cn(
                    "relative z-10 flex-shrink-0 text-sm",
                    isActive ? "text-[#6A00FF]" : ""
                  )}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="relative z-10 truncate text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="relative z-10 ml-auto rounded-full bg-black/10 px-2 py-0.5 text-xs text-black/60 dark:bg-white/10 dark:text-white/60">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="space-y-1 border-t border-black/10 px-3 py-4 sm:px-4 dark:border-white/10">
            <Link
              href="/dashboard?tab=settings"
              className={cn(
                "group relative flex items-center gap-3 rounded-lg border px-3 py-2.5 text-black/60 transition hover:border-black/10 hover:bg-black/5 hover:text-black dark:text-white/60 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white",
                collapsed && "justify-center"
              )}
              title={collapsed ? "Settings" : undefined}
            >
              <Settings className="relative z-10 h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="relative z-10 text-sm font-medium">Settings</span>}
            </Link>
            <button
              onClick={handleSignOut}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-black/60 transition hover:border-black/10 hover:bg-black/5 hover:text-black dark:text-white/60 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white",
                collapsed && "justify-center"
              )}
              title={collapsed ? "Sign Out" : undefined}
            >
              <LogOut className="relative z-10 h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="relative z-10 text-sm font-medium">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

