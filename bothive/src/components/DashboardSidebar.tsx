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
  HelpCircle,
  Search,
  Video,
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
  { id: "overview", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, href: "/dashboard" },
  { id: "agents", label: "Projects", icon: <Zap className="w-5 h-5" />, href: "/dashboard?tab=agents" },
  { id: "orchestrator", label: "Tasks", icon: <Network className="w-5 h-5" />, href: "/dashboard?tab=orchestrator" },
  { id: "marketplace", label: "Reporting", icon: <Store className="w-5 h-5" />, href: "/dashboard?tab=marketplace" },
  { id: "memory", label: "Users", icon: <Brain className="w-5 h-5" />, href: "/dashboard?tab=memory" },
  { id: "integrations", label: "Automation", icon: <Plug className="w-5 h-5" />, href: "/dashboard?tab=integrations" },
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
          "fixed left-0 top-0 h-full bg-[#0B0F19] text-white border-r border-white/10 z-50 transition-all duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "w-20" : "w-72"
        )}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:28px_28px]" />
        </div>

        <div className="relative z-10 flex h-full flex-col px-4 pb-6">
          <div className="flex items-center justify-between pt-6 pb-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8C89FF] via-[#C0B8FF] to-white shadow-[0_10px_20px_rgba(140,137,255,0.35)]">
                <span className="h-5 w-5 rounded-xl bg-[#181C2F]" />
              </span>
              {!collapsed && (
                <div>
                  <p className="text-sm font-semibold">Untitled UI</p>
                  <p className="text-xs text-white/50">Control center</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCollapse}
                className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/60 transition hover:border-white/20 hover:text-white"
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="lg:hidden h-9 w-9 rounded-lg border border-white/10 text-white/60 transition hover:border-white/20 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!collapsed && (
            <div className="mb-6 hidden rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white/60 md:flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="truncate">Search</span>
              <span className="ml-auto rounded border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/40">⌘K</span>
            </div>
          )}

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id || (item.id === "overview" && pathname === "/dashboard" && !activeTab);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/55 hover:bg-white/5 hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0 text-white/60 group-hover:text-white">{item.icon}</span>
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                  {item.badge && !collapsed && (
                    <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {!collapsed && (
            <div className="mt-6 space-y-4 text-sm text-white/70">
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-white/5 text-left">
                <HelpCircle className="h-4 w-4 text-white/50" />
                Support
              </button>
              <Link
                href="/dashboard?tab=settings"
                className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-white/5"
              >
                <Settings className="h-4 w-4 text-white/50" />
                Settings
              </Link>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <Video className="h-5 w-5 text-white/80" />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-semibold text-white">New features available!</p>
                      <p className="text-xs text-white/55">Check out the new dashboard view. Pages now load faster.</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/60">
                      <button className="rounded-md border border-white/15 px-3 py-1 hover:bg-white/10">Dismiss</button>
                      <button className="rounded-md bg-white/90 px-3 py-1 font-medium text-black hover:bg-white">What’s new?</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8C89FF] to-[#5A57D9] text-sm font-semibold">OR</span>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-white">Olivia Rhye</p>
                <p className="truncate text-xs text-white/55">olivia@untitledui.com</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleSignOut}
                className="rounded-lg border border-white/10 px-3 py-1 text-xs text-white/60 transition hover:border-white/20 hover:text-white"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

