"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme-context";
import { useAppSession } from "@/lib/app-session-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Bot,
  Key,
  Sparkles,
  Users,
  Store,
  Code,
  Zap,
  Activity,
  ArrowUpRight,
  MessageSquare,
  Gift,
  Rocket,
  GraduationCap
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import AIChatInterface from "@/components/AIChatInterface"; // Assuming this exists or will be created/used

export default function Dashboard() {
  const { theme } = useTheme();
  const { profile } = useAppSession();
  const router = useRouter();
  const isDark = theme === "dark";
  const supabase = createClientComponentClient();

  const [stats, setStats] = useState({
    botCount: 0,
    keyCount: 0,
    deployments: 0,
    loading: true
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [userMode, setUserMode] = useState<'simple' | 'developer' | 'admin' | 'teams'>('simple');
  const [greeting, setGreeting] = useState('');
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    if (!profile) return;

    async function fetchDashboardData() {
      if (!profile) return;
      try {
        // Fetch basic stats
        const [{ count: botCount }, { count: keyCount }, { count: deploymentsCount }] = await Promise.all([
          supabase.from('bots').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
          supabase.from('api_keys').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
          supabase.from('deployments').select('*', { count: 'exact', head: true }).eq('user_id', profile.id)
        ]);

        // Fetch recent activity (mock for now if table is empty or structured differently)
        const { data: activityData } = await supabase
          .from('bot_executions') // Using bot_executions as a proxy for activity
          .select('*')
          .eq('user_id', profile.id)
          .order('started_at', { ascending: false })
          .limit(5);

        // Determine user mode/role
        let mode: 'simple' | 'developer' | 'admin' | 'teams' = 'simple';

        // TEMPORARY: Check for Teams Override
        if (typeof window !== 'undefined' && window.localStorage.getItem("bothive_role_override") === "teams") {
          mode = 'teams';
        }
        else if (profile.email?.includes("founder")) mode = 'teams';
        else if (profile.role === 'admin') mode = 'admin';
        else if ((keyCount || 0) > 0 || (botCount || 0) > 0) mode = 'developer';

        setUserMode(mode);

        setStats({
          botCount: botCount || 0,
          keyCount: keyCount || 0,
          deployments: deploymentsCount || 0,
          loading: false
        });

        setRecentActivity(activityData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }

    fetchDashboardData();
  }, [profile, supabase]);

  if (!profile) return null;

  const getDashboardCards = () => {
    const commonCards = [
      {
        title: "Bot Market",
        description: "Explore community bots",
        icon: Store,
        href: "/marketplace",
        color: "text-green-500",
        delay: 0.1
      },
      {
        title: "Integrations",
        description: "Connect your tools",
        icon: Zap,
        href: "/dashboard/integrations",
        color: "text-blue-500",
        delay: 0.2
      }
    ];

    if (userMode === 'teams') {
      return [
        {
          title: "Bot Swarms",
          description: "Manage autonomous clusters",
          icon: Users,
          href: "/dashboard/swarms",
          color: "text-cyan-400",
          delay: 0
        },
        {
          title: "Capital & Funding",
          description: "$125,000 Credits Available",
          icon: Gift, // Placeholder for Funding icon
          href: "/dashboard/funding",
          color: "text-emerald-400",
          delay: 0.1
        },
        {
          title: "Deployments",
          description: "Live production environments",
          icon: Rocket,
          href: "/dashboard/deployments",
          color: "text-purple-400",
          delay: 0.2
        },
        {
          title: "Team Settings",
          description: "Roles, Permissions, API",
          icon: Key,
          href: "/dashboard/settings",
          color: "text-rose-400",
          delay: 0.3
        }
      ];
    }

    if (userMode === 'developer' || userMode === 'admin') {
      return [
        {
          title: "New Bot",
          description: "Create a custom agent",
          icon: Code,
          href: "/dashboard/bots/new",
          color: "text-[#6C43FF]",
          delay: 0
        },
        ...commonCards,
        {
          title: "API Access",
          description: "Manage API keys",
          icon: Key,
          href: "/dashboard/developer/api-keys",
          color: "text-amber-500",
          delay: 0.3
        }
      ];
    } else {
      return [
        {
          title: "Get Started",
          description: "Create your first bot",
          icon: Sparkles,
          href: "/dashboard/bots/new",
          color: "text-[#6C43FF]",
          delay: 0
        },
        ...commonCards,
        {
          title: "Student Hub",
          description: "Tools for school & study",
          icon: GraduationCap,
          href: "/dashboard/student",
          color: "text-indigo-500",
          delay: 0.25
        },
        {
          title: "Documentation",
          description: "Learn how to build",
          icon: Users,
          href: "https://docs.bothive.app",
          color: "text-pink-500",
          delay: 0.3
        }
      ];
    }
  };

  return (
    <DashboardPageShell
      title={userMode === 'teams' ? "Command Center" : "Overview"}
      headerAction={<ThemeToggle />}
      className={userMode === 'teams' ? "font-mono tracking-tight" : ""} // Subtle font change for Teams
    >
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Personalized Welcome Section */}
        <div className={cn(
          "relative overflow-hidden rounded-3xl p-8 md:p-10 transition-all duration-500",
          userMode === 'teams'
            ? "bg-slate-950 border border-slate-800 shadow-[0_0_50px_rgba(6,182,212,0.1)]" // Cyber/Dark Theme
            : "bg-gradient-to-r from-violet-600/10 to-indigo-600/10 dark:from-violet-900/20 dark:to-indigo-900/20"
        )}>
          {/* Teams Mode Specific Background Effects */}
          {userMode === 'teams' && (
            <>
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[length:40px_40px] opacity-20" />
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
            </>
          )}

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "text-3xl md:text-4xl font-bold mb-2",
                  userMode === 'teams' ? "text-cyan-500" : "text-neutral-900 dark:text-white"
                )}
              >
                {userMode === 'teams' ? "SYSTEM ONLINE" : `${greeting},`} <span className={userMode === 'teams' ? "text-white" : "text-[#6C43FF]"}>
                  {userMode === 'teams' ? (profile.fullName || 'FOUNDER') : (profile.fullName || profile.email || 'User')}
                </span>
                {userMode !== 'teams' && "."}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-neutral-500 dark:text-neutral-400 max-w-xl text-lg"
              >
                {userMode === 'teams'
                  ? "Startup metrics nominal. Swarm efficiency at 98%. Ready for scale."
                  : userMode === 'developer'
                    ? "Your bots have been busy. Here's what's happening with your swarms today."
                    : "Ready to supercharge your workflow? Let's build something amazing."}
              </motion.p>
            </div>

            {/* Conditional AI Assistant Feature */}
            {(userMode === 'developer' || userMode === 'admin' || userMode === 'teams') && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAiAssistant(!showAiAssistant)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-xl font-medium shadow-lg transition-all",
                  userMode === 'teams'
                    ? "bg-cyan-950 border border-cyan-800 text-cyan-400 shadow-cyan-500/10 hover:bg-cyan-900"
                    : "bg-[#6C43FF] text-white shadow-violet-500/20"
                )}
              >
                <Sparkles className="w-5 h-5" />
                {userMode === 'teams' ? "AI ADVISOR" : "AI Assistant"}
              </motion.button>
            )}
          </div>

          {/* Decorative circles for standard mode */}
          {userMode !== 'teams' && (
            <>
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            </>
          )}
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Active Swarms" value={stats.botCount} icon={<Bot className="w-5 h-5" />} delay={0} teamMode={userMode === 'teams'} />
          <StatBox label="Deployments" value={stats.deployments} icon={<Rocket className="w-5 h-5" />} delay={0.1} teamMode={userMode === 'teams'} />
          <StatBox label={userMode === 'teams' ? "Burn Rate" : "API Keys"} value={userMode === 'teams' ? "$2.4k/mo" : stats.keyCount} icon={<Activity className="w-5 h-5" />} delay={0.2} teamMode={userMode === 'teams'} />
          <StatBox label="Credits" value={userMode === 'teams' ? "$125k" : "2,500"} icon={<Gift className="w-5 h-5" />} delay={0.3} link="/dashboard/settings" teamMode={userMode === 'teams'} />
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getDashboardCards().map((card) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: card.delay }}
            >
              <Link
                href={card.href}
                className={cn(
                  "group relative block p-6 h-full rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                  userMode === 'teams'
                    ? "bg-slate-900/50 border-slate-800 hover:border-cyan-700/50 hover:shadow-cyan-500/10" // Teams Card Style
                    : isDark
                      ? "bg-white/[0.02] border-white/10 hover:bg-white/[0.05]"
                      : "bg-white border-neutral-100 shadow-sm hover:shadow-md"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                  userMode === 'teams' ? "bg-slate-800 text-cyan-400" : isDark ? "bg-white/10" : "bg-neutral-100",
                  userMode !== 'teams' && card.color
                )}>
                  <card.icon className={cn("w-6 h-6", userMode === 'teams' && card.color)} />
                </div>
                <h3 className={cn(
                  "text-xl font-bold mb-2",
                  userMode === 'teams' ? "text-slate-100" : "text-neutral-900 dark:text-white"
                )}>{card.title}</h3>
                <p className={cn(
                  "text-sm mb-4",
                  userMode === 'teams' ? "text-slate-400" : "text-neutral-500 dark:text-neutral-400"
                )}>{card.description}</p>

                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                  <ArrowUpRight className={cn("w-5 h-5", userMode === 'teams' ? "text-cyan-500" : "text-neutral-400")} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className={cn("text-xl font-bold", userMode === 'teams' ? "text-white" : "text-neutral-900 dark:text-white")}>
                {userMode === 'teams' ? "System Logs" : "Recent Activity"}
              </h3>
              <Link href="/dashboard/profile" className={cn("text-sm hover:underline", userMode === 'teams' ? "text-cyan-500" : "text-[#6C43FF]")}>View All</Link>
            </div>
            <div className={cn(
              "rounded-2xl border min-h-[300px]",
              userMode === 'teams' ? "bg-slate-900/50 border-slate-800 font-mono text-sm" : isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-neutral-100"
            )}>
              {recentActivity.length > 0 || userMode === 'teams' ? ( // Always show fake logs for teams mode default
                <div className={cn("divide-y", userMode === 'teams' ? "divide-slate-800" : "divide-neutral-100 dark:divide-white/5")}>
                  {(userMode === 'teams' ? [
                    { action: "Swarm 'Alpha' initialized", time: "2m ago", status: "success" },
                    { action: "Deployment #424 deployed to edge", time: "15m ago", status: "success" },
                    { action: "Funding round A closed", time: "1h ago", status: "info" },
                    { action: "New member 'Sarah' joined team", time: "3h ago", status: "info" }
                  ] : recentActivity).map((activity, i) => (
                    <div key={i} className={cn("p-4 flex items-center gap-4 transition-colors", userMode === 'teams' ? "hover:bg-slate-800/50 text-slate-300" : "hover:bg-neutral-50 dark:hover:bg-white/[0.02]")}>
                      <div className={cn("p-2 rounded-full", userMode === 'teams' ? "bg-cyan-500/10 text-cyan-500" : "bg-blue-500/10 text-blue-500")}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className={cn("font-medium", userMode === 'teams' ? "text-slate-200" : "text-neutral-900 dark:text-white")}>
                          {userMode === 'teams' ? (activity as any).action : "Bot Execution"}
                        </p>
                        <p className={cn("text-xs", userMode === 'teams' ? "text-slate-500" : "text-neutral-500")}>
                          {userMode === 'teams' ? "System verified" : "Completed 2 tasks successfully"}
                        </p>
                      </div>
                      <span className={cn("text-xs", userMode === 'teams' ? "text-slate-600" : "text-neutral-400")}>{(activity as any).time || "2h ago"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center text-neutral-500">
                  <Activity className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-lg font-medium">No recent activity</p>
                  <p className="text-sm mt-1">Start your first bot to see updates here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Tips / Announcements */}
          <div>
            <h3 className={cn("text-xl font-bold mb-6", userMode === 'teams' ? "text-white" : "text-neutral-900 dark:text-white")}>
              {userMode === 'teams' ? "Investor Updates" : "Did you know?"}
            </h3>
            <div className={cn(
              "rounded-2xl border p-6 space-y-4",
              userMode === 'teams'
                ? "bg-slate-900 border-slate-800"
                : isDark ? "bg-gradient-to-br from-[#6C43FF]/20 to-purple-900/20 border-[#6C43FF]/20" : "bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-100"
            )}>
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg mt-1", userMode === 'teams' ? "bg-emerald-500/20 text-emerald-400" : "bg-[#6C43FF] text-white")}>
                  {userMode === 'teams' ? <Gift className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className={cn("font-bold mb-1", userMode === 'teams' ? "text-white" : "text-neutral-900 dark:text-white")}>
                    {userMode === 'teams' ? "Series B Funding Open" : "New Integrations Available"}
                  </h4>
                  <p className={cn("text-sm", userMode === 'teams' ? "text-slate-400" : "text-neutral-600 dark:text-neutral-300")}>
                    {userMode === 'teams'
                      ? "Your startup metrics classify you for our accelerator program. Apply now."
                      : "You can now connect Slack and GitHub directly to your bot swarms."}
                  </p>
                </div>
              </div>
              <Link
                href={userMode === 'teams' ? "/dashboard/funding" : "/dashboard/integrations"}
                className={cn(
                  "block w-full py-3 text-center rounded-xl font-medium hover:opacity-90 transition-opacity",
                  userMode === 'teams' ? "bg-emerald-600 text-white" : "bg-[#6C43FF] text-white"
                )}
              >
                {userMode === 'teams' ? "View Offer" : "Check it out"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Overlay */}
      {showAiAssistant && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
          <div className={cn(
            "rounded-2xl border shadow-2xl overflow-hidden",
            userMode === 'teams' ? "bg-slate-900 border-slate-700" : isDark ? "bg-neutral-900 border-white/10" : "bg-white border-neutral-200"
          )}>
            <div className={cn(
              "p-4 flex justify-between items-center text-white",
              userMode === 'teams' ? "bg-cyan-900" : "bg-linear-to-r from-[#6C43FF] to-[#8A63FF]"
            )}>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-bold">{userMode === 'teams' ? "Startup Advisor" : "BotHive"}</span>
              </div>
              <button onClick={() => setShowAiAssistant(false)} className="hover:bg-white/20 p-1 rounded-full"><Users className="w-4 h-4" /></button>
            </div>
            <div className="h-80 p-4 overflow-y-auto">
              <div className="flex gap-3 mb-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  userMode === 'teams' ? "bg-cyan-900/50 text-cyan-400" : "bg-[#6C43FF]/20 text-[#6C43FF]"
                )}>
                  <Bot className="w-4 h-4" />
                </div>
                <div className={cn("p-3 rounded-2xl rounded-tl-none text-sm",
                  userMode === 'teams' ? "bg-slate-800 text-slate-200 border border-slate-700" : isDark ? "bg-white/10" : "bg-neutral-100"
                )}>
                  {userMode === 'teams'
                    ? "Greetings, Founder. I've analyzed your burn rate. Shall we optimize server costs?"
                    : `Hello ${(profile.fullName || profile.email || 'User').split(' ')[0]}! How can I help you optimize your bots today?`}
                </div>
              </div>
            </div>
            <div className={cn("p-3 border-t", userMode === 'teams' ? "border-slate-800" : "border-neutral-200 dark:border-white/10")}>
              <input
                type="text"
                placeholder="Type a message..."
                className={cn(
                  "w-full px-4 py-2 rounded-xl outline-none border border-transparent transition-colors",
                  userMode === 'teams'
                    ? "bg-slate-950 text-white focus:border-cyan-500 placeholder:text-slate-600"
                    : "bg-neutral-100 dark:bg-white/5 focus:border-[#6C43FF]"
                )}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardPageShell>
  );
}

function StatBox({ label, value, icon, delay, link, teamMode }: { label: string, value: string | number, icon: React.ReactNode, delay: number, link?: string, teamMode?: boolean }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const Content = (
    <div className={cn(
      "p-5 rounded-2xl border transition-all duration-200 hover:shadow-md",
      teamMode
        ? "bg-slate-900/50 border-slate-800 hover:border-cyan-500/30" // Teams Style
        : isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-neutral-100"
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className={cn("text-sm font-medium", teamMode ? "text-slate-400" : "text-neutral-500 dark:text-neutral-400")}>{label}</span>
        <div className={cn("p-2 rounded-lg",
          teamMode ? "bg-slate-800 text-cyan-400" : isDark ? "bg-white/5" : "bg-neutral-100"
        )}>
          {icon}
        </div>
      </div>
      <div className={cn("text-2xl font-bold", teamMode ? "text-white font-mono" : "text-neutral-900 dark:text-white")}>
        {value}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      {link ? <Link href={link}>{Content}</Link> : Content}
    </motion.div>
  );
}
