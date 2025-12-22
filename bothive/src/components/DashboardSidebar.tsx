"use client";
import React, { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconRobot,
  IconAffiliate,
  IconApi,
  IconWebhook,
  IconActivity,
  IconCreditCard,
  IconFiles,
  IconChartBar,
  IconShieldLock,
  IconLock,
  IconListCheck,
  IconWorld,
  IconUsers,
  IconBuildingStore,
  IconTerminal2,
  IconBrain,
  IconPlug,
  IconRosetteDiscountCheckFilled,
  IconBriefcase,
  IconClipboardList,
  IconRocket
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/lib/database.types"; // Ensure user_role is exported or just use string literal if not
import Image from "next/image";

// Map lucide icons or use tabler equivalents for consistency with demo
// Using Tabler icons as requested by "make it this @DashboardDemo"

interface SidebarItem {
  id: string;
  label: string;
  icon: React.JSX.Element | React.ReactNode;
  href: string;
}

// Menu Items Configuration
const BASE_ITEMS: SidebarItem[] = [
  { id: "workspace", label: "Workspace", icon: <IconTerminal2 className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/workspace" },
  { id: "overview", label: "Overview", icon: <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard" },
  { id: "workforce", label: "My Workforce", icon: <IconRobot className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/workforce" },
  { id: "knowledge", label: "Knowledge", icon: <IconBrain className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/knowledge" },
  { id: "agents", label: "Agents", icon: <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/agents" },
  { id: "billing", label: "Billing", icon: <IconCreditCard className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/billing" },
  { id: "invoices", label: "Invoices", icon: <IconFiles className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/billing/invoices" },
  { id: "wallet", label: "Wallet", icon: <IconCreditCard className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/wallet" },
  { id: "affiliate", label: "Affiliate", icon: <IconAffiliate className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/affiliate" },
  { id: "orchestrator", label: "Orchestrator", icon: <IconAffiliate className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/orchestrator" },
];

const MARKETPLACE_ITEM: SidebarItem = { id: "marketplace", label: "Marketplace", icon: <IconBuildingStore className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/marketplace" };
const INTEGRATIONS_ITEM: SidebarItem = { id: "integrations", label: "Integrations", icon: <IconPlug className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/integrations" };


const EMPLOYEES_ITEM: SidebarItem = { id: "employees", label: "Employees", icon: <IconBriefcase className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/employees" };
const TASKS_ITEM: SidebarItem = { id: "tasks", label: "Task Board", icon: <IconClipboardList className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/tasks" };

const ROLE_CONFIG: Record<string, SidebarItem[]> = {
  business: [
    ...BASE_ITEMS,
    EMPLOYEES_ITEM,
    TASKS_ITEM,
    MARKETPLACE_ITEM,
    INTEGRATIONS_ITEM,
    { id: "business-special", label: "Special Request", icon: <IconRosetteDiscountCheckFilled className="h-5 w-5 shrink-0 text-amber-500" />, href: "/dashboard/business/special-request" },
  ],
  developer: [
    ...BASE_ITEMS,
    { id: "api-keys", label: "API Keys", icon: <IconApi className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/developer/api-keys" },
    { id: "webhooks", label: "Webhooks", icon: <IconWebhook className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/developer/webhooks" },
    { id: "logs", label: "Live Logs", icon: <IconActivity className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/developer/logs" },
    { id: "documentation", label: "Docs", icon: <IconFiles className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/docs" },
  ],
  student: [
    { id: "overview", label: "Student Hub", icon: <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/student" },
    ...BASE_ITEMS.filter(item => !['workspace', 'overview'].includes(item.id)),
  ],
  enterprise: [
    ...BASE_ITEMS,
    EMPLOYEES_ITEM,
    TASKS_ITEM,
    { id: "analytics", label: "Analytics", icon: <IconChartBar className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/enterprise/analytics" },
    { id: "compliance", label: "Compliance", icon: <IconShieldLock className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/enterprise/compliance" },
    { id: "sso", label: "SSO Settings", icon: <IconLock className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/enterprise/sso" },
    { id: "audit", label: "Audit Logs", icon: <IconListCheck className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/enterprise/audit" },
  ],
  admin: [
    { id: "global-overview", label: "Global Status", icon: <IconWorld className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/admin/status" },
    { id: "users", label: "User Management", icon: <IconUsers className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/admin/users" },
    { id: "tenants", label: "Tenants", icon: <IconBuildingStore className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/admin/tenants" },
    { id: "approvals", label: "Pending Approvals", icon: <IconListCheck className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/admin/approvals" },
    ...BASE_ITEMS,
    INTEGRATIONS_ITEM,
    { id: "system-logs", label: "System Logs", icon: <IconTerminal2 className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/admin/logs" },
  ],
  teams: [
    { id: "startup-overview", label: "Command Center", icon: <IconActivity className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard" },
    { id: "swarms", label: "Bot Swarms", icon: <IconRobot className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/swarms" },
    { id: "team", label: "Team & Roles", icon: <IconUsers className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/team" },
    { id: "funding", label: "Capital & Credits", icon: <IconChartBar className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/funding" },
    { id: "deployments", label: "Deployments", icon: <IconRocket className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/deployments" },
    INTEGRATIONS_ITEM,
    { id: "settings", label: "Startup Settings", icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />, href: "/dashboard/settings" },
  ]
};

export default function DashboardSidebar() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null); // Start with null to indicate loading/unknown
  const [userEmail, setUserEmail] = useState<string>("");
  const [teamName, setTeamName] = useState<string>("");

  useEffect(() => {
    const fetchUserRole = async () => {
      console.log("[DashboardSidebar] Fetching user role...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error("[DashboardSidebar] Auth error:", authError);
        setRole("business"); // Fallback
        return;
      }

      if (!user) {
        console.warn("[DashboardSidebar] No user found, using fallback role");
        setRole("business"); // Fallback so sidebar still renders
        return;
      }

      console.log("[DashboardSidebar] User found:", user.email);
      setUserEmail(user.email || "");

      // TEMPORARY: For Development/Demo, checking if user wants to see a specific view
      const roleOverride = localStorage.getItem("bothive_role_override");
      if (roleOverride && ROLE_CONFIG[roleOverride]) {
        console.log("[DashboardSidebar] Using role override:", roleOverride);
        setRole(roleOverride);
        return;
      }

      if (user.email?.includes("founder")) {
        setRole("teams");
        return;
      }

      // Strict Admin Check
      if (user.email === "akinlorinjeremiah@gmail.com") {
        setRole("admin");
        return;
      }

      // Database Check
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("role, team_name, preferred_name")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        console.error("[DashboardSidebar] Profile fetch error:", profileError);
        setRole("business"); // Fallback
        return;
      }

      if (userProfile?.role) {
        console.log("[DashboardSidebar] Role from profile:", userProfile.role);
        setRole(userProfile.role);
      } else {
        // Safe Fallback if profile exists but no role (legacy users)
        console.log("[DashboardSidebar] No role in profile, using business fallback");
        setRole("business");
      }

      if (userProfile?.team_name) setTeamName(userProfile.team_name);
      else if (userProfile?.preferred_name) setTeamName(userProfile.preferred_name);
    };
    fetchUserRole();
  }, []);

  // While loading role, show a skeleton sidebar
  if (!role) {
    return (
      <div className="h-full px-4 py-4 hidden md:flex md:flex-col bg-white dark:bg-[#0a0a0f] border-r border-black/[0.06] dark:border-white/[0.06] w-[60px] shrink-0">
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
          <div className="mt-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-8 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const links = ROLE_CONFIG[role] || ROLE_CONFIG.business;

  const handleSignOut = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    window.location.href = "/signin";
  };

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {open ? <Logo role={role} /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link) => (
              <SidebarLink key={link.id} link={link} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <SidebarLink
            link={{
              label: "Settings",
              href: "/dashboard/settings",
              icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />
            }}
          />
          <div onClick={handleSignOut} className="cursor-pointer">
            <SidebarLink
              link={{
                label: "Logout",
                href: "#",
                icon: <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-200" />
              }}
            />
          </div>
          <SidebarLink
            link={{
              label: teamName || userEmail || "User",
              href: "/dashboard/profile",
              icon: (
                <div className="relative">
                  <div className="h-7 w-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-700 dark:text-neutral-200">
                    {(userEmail[0] || "U").toUpperCase()}
                  </div>
                  {userEmail === "akinlorinjeremiah@gmail.com" && (
                    <div className="absolute -top-1 -right-1 bg-white dark:bg-black rounded-full text-blue-500">
                      <IconRosetteDiscountCheckFilled className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ),
            }}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

export const Logo = ({ role }: { role: string }) => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      {/* <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" /> */}
      <Image src="/bothive-ai-logo.svg" alt="logo" width={40} height={40} />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Bothive <span className="text-xs text-neutral-500 uppercase ml-1 tracking-widest">{role}</span>
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
