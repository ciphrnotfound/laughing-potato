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
  const [userMode, setUserMode] = useState<'simple' | 'developer' | 'admin'>('simple');
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
        let mode: 'simple' | 'developer' | 'admin' = 'simple';
        if (profile.role === 'admin') mode = 'admin';
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
      title="Overview"
      headerAction={<ThemeToggle />}
    >
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Personalized Welcome Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600/10 to-indigo-600/10 dark:from-violet-900/20 dark:to-indigo-900/20 p-8 md:p-10">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2"
              >
                {greeting}, <span className="text-[#6C43FF]">
                  {profile.team_name || profile.preferred_name || profile.name || profile.full_name || 'User'}
                </span>.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-neutral-500 dark:text-neutral-400 max-w-xl text-lg"
              >
                {userMode === 'developer'
                  ? "Your bots have been busy. Here's what's happening with your swarms today."
                  : "Ready to supercharge your workflow? Let's build something amazing."}
              </motion.p>
            </div>

            {/* Conditional AI Assistant Feature - Only for Devs/Admins or Paid */}
            {(userMode === 'developer' || userMode === 'admin') && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAiAssistant(!showAiAssistant)}
                className="flex items-center gap-2 px-5 py-3 bg-[#6C43FF] text-white rounded-xl font-medium shadow-lg shadow-violet-500/20"
              >
                <Sparkles className="w-5 h-5" />
                AI Assistant
              </motion.button>
            )}
          </div>

          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Total Bots" value={stats.botCount} icon={<Bot className="w-5 h-5" />} delay={0} />
          <StatBox label="Deployments" value={stats.deployments} icon={<Rocket className="w-5 h-5" />} delay={0.1} />
          <StatBox label="API Keys" value={stats.keyCount} icon={<Key className="w-5 h-5" />} delay={0.2} />
          <StatBox label="Credits" value="2,500" icon={<Gift className="w-5 h-5" />} delay={0.3} link="/dashboard/settings" />
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
                  isDark
                    ? "bg-white/[0.02] border-white/10 hover:bg-white/[0.05]"
                    : "bg-white border-neutral-100 shadow-sm hover:shadow-md"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                  isDark ? "bg-white/10" : "bg-neutral-100",
                  card.color
                )}>
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">{card.title}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">{card.description}</p>

                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                  <ArrowUpRight className="w-5 h-5 text-neutral-400" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Recent Activity</h3>
              <Link href="/dashboard/profile" className="text-sm text-[#6C43FF] hover:underline">View All</Link>
            </div>
            <div className={cn(
              "rounded-2xl border min-h-[300px]",
              isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-neutral-100"
            )}>
              {recentActivity.length > 0 ? (
                <div className="divide-y divide-neutral-100 dark:divide-white/5">
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="p-4 flex items-center gap-4 hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors">
                      <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">Bot Execution</p>
                        <p className="text-xs text-neutral-500">Completed 2 tasks successfully</p>
                      </div>
                      <span className="text-xs text-neutral-400">2h ago</span>
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
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Did you know?</h3>
            <div className={cn(
              "rounded-2xl border p-6 space-y-4",
              isDark ? "bg-gradient-to-br from-[#6C43FF]/20 to-purple-900/20 border-[#6C43FF]/20" : "bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-100"
            )}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#6C43FF] text-white rounded-lg mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white mb-1">New Integrations Available</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    You can now connect Slack and GitHub directly to your bot swarms.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/integrations"
                className="block w-full py-3 text-center rounded-xl bg-[#6C43FF] text-white font-medium hover:opacity-90 transition-opacity"
              >
                Check it out
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
            isDark ? "bg-neutral-900 border-white/10" : "bg-white border-neutral-200"
          )}>
            <div className="p-4 bg-linear-to-r from-[#6C43FF] to-[#8A63FF] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-bold">Antigravity AI</span>
              </div>
              <button onClick={() => setShowAiAssistant(false)} className="hover:bg-white/20 p-1 rounded-full"><Users className="w-4 h-4" /></button>
            </div>
            <div className="h-80 p-4 overflow-y-auto">
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#6C43FF]/20 flex items-center justify-center text-[#6C43FF] shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className={cn("p-3 rounded-2xl rounded-tl-none text-sm", isDark ? "bg-white/10" : "bg-neutral-100")}>
                  Hello {profile.name.split(' ')[0]}! How can I help you optimize your bots today?
                </div>
              </div>
            </div>
            <div className="p-3 border-t border-neutral-200 dark:border-white/10">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full px-4 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 outline-none border border-transparent focus:border-[#6C43FF] transition-colors"
              />
            </div>
          </div>
        </div>
      )}
    </DashboardPageShell>
  );
}

function StatBox({ label, value, icon, delay, link }: { label: string, value: string | number, icon: React.ReactNode, delay: number, link?: string }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const Content = (
    <div className={cn(
      "p-5 rounded-2xl border transition-all duration-200 hover:shadow-md",
      isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-neutral-100"
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{label}</span>
        <div className={cn("p-2 rounded-lg", isDark ? "bg-white/5" : "bg-neutral-100")}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-neutral-900 dark:text-white">
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
