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
          "fixed left-0 top-0 h-full bg-black/95 border-r border-white/10 z-50 transition-all duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Futuristic grid background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
        </div>
        
        {/* Purple glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col h-full relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              {collapsed ? (
                <div className="w-10 h-10 rounded-lg  flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/colored-logo (2).png"
                    alt="Bothive"
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                  />
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-lg  flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0  animate-pulse" />
                    <Image
                      src="/colored-logo (2).png"
                      alt="Bothive"
                      width={28}
                      height={28}
                      className="w-7 h-7 object-contain relative z-10"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-lg font-bold text-white block truncate">BOTHIVE</span>
                    <span className="text-xs text-purple-400/70 font-mono">v1.0</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 transition text-white/70 hover:text-white border border-white/10"
                title={collapsed ? "Expand" : "Collapse"}
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
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
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative overflow-hidden",
                    isActive
                      ? "bg-purple-600/20 text-white border border-purple-500/30"
                      : "text-white/70 hover:bg-white/10 hover:text-white border border-transparent"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {/* Active indicator glow */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent" />
                  )}
                  
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <span className={cn(
                    "relative z-10 flex-shrink-0",
                    isActive && "text-purple-400",
                    !collapsed && "w-5 h-5"
                  )}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="relative z-10 font-medium text-sm truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto relative z-10 px-2 py-0.5 text-xs rounded-full bg-purple-600 text-white">
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
          <div className="p-3 sm:p-4 border-t border-white/10 space-y-1">
            <Link
              href="/dashboard?tab=settings"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors relative overflow-hidden group",
                collapsed && "justify-center"
              )}
              title={collapsed ? "Settings" : undefined}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Settings className="w-5 h-5 relative z-10 flex-shrink-0" />
              {!collapsed && <span className="font-medium text-sm relative z-10">Settings</span>}
            </Link>
            <button
              onClick={handleSignOut}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-colors relative overflow-hidden group",
                collapsed && "justify-center"
              )}
              title={collapsed ? "Sign Out" : undefined}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <LogOut className="w-5 h-5 relative z-10 flex-shrink-0" />
              {!collapsed && <span className="font-medium text-sm relative z-10">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

