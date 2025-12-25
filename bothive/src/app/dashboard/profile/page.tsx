"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSession } from "@/lib/app-session-context";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/database.types";
import { useGlassAlert } from "@/components/ui/glass-alert";
import {
  User,
  MapPin,
  Calendar,
  Github,
  Twitter,
  Linkedin,
  ExternalLink,
  Edit,
  Camera,
  Trophy,
  Activity,
  BarChart3,
  Bot,
  Layers,
  Download,
  Star,
  Users,
  Flame,
  Award,
  Shield,
  Rocket,
  Save,
  Share2,
  QrCode,
  Zap
} from "lucide-react";
import { DashboardPageShell } from "@/components/DashboardPageShell";

// Types
interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  joinedDate: string;
  status: 'online' | 'offline';
  social: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
  stats: {
    level: number;
    xp: number;
    totalXp: number;
    streakDays: number;
    botsCreated: number;
    botsDeployed: number;
    totalExecutions: number;
    achievementsUnlocked: number;
  };
  achievements: Achievement[];
  badges: Badge[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category?: string;
  unlockedAt: string;
  xpReward: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  earnedAt?: string;
}

// Default Mock Data (fallback)
const DEFAULT_PROFILE: UserProfile = {
  id: '',
  name: 'User',
  username: 'user',
  email: '',
  avatar: '',
  bio: 'No bio yet.',
  location: 'Unknown',
  website: '',
  joinedDate: new Date().toISOString(),
  status: 'online',
  social: {},
  stats: {
    level: 1,
    xp: 0,
    totalXp: 0,
    streakDays: 0,
    botsCreated: 0,
    botsDeployed: 0,
    totalExecutions: 0,
    achievementsUnlocked: 0
  },
  achievements: [],
  badges: []
};

export default function ProfilePage() {
  const { profile } = useAppSession();
  const { theme } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements'>('overview');
  const { showAlert } = useGlassAlert();
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    social: { github: '', twitter: '', linkedin: '' }
  });

  const supabase = createClientComponentClient<Database>();

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;
      setLoading(true);

      try {
        // 1. Fetch User Details & Game Stats
        const { data: gamification } = await supabase
          .from('user_gamification')
          .select('*')
          .eq('user_id', profile.id)
          .single();

        // 2. Fetch Achievements
        const { data: userAchievements } = await supabase
          .from('user_achievements')
          .select('*, achievements(*)')
          .eq('user_id', profile.id);

        // Transform Data
        const stats = gamification ? {
          level: gamification.level,
          xp: gamification.xp,
          totalXp: gamification.total_xp,
          streakDays: gamification.streak_days,
          botsCreated: gamification.bots_created,
          botsDeployed: gamification.bots_deployed,
          totalExecutions: gamification.total_executions,
          achievementsUnlocked: gamification.achievements_unlocked
        } : DEFAULT_PROFILE.stats;

        const achievements: Achievement[] = userAchievements?.map((ua: any) => ({
          id: ua.achievements.id,
          name: ua.achievements.name,
          description: ua.achievements.description || '',
          icon: ua.achievements.icon_url,
          category: ua.achievements.category,
          unlockedAt: ua.unlocked_at,
          xpReward: ua.achievements.xp_reward || 0
        })) || [];

        setUserProfile({
          id: profile.id!,
          name: profile.fullName || 'User',
          username: profile.email?.split('@')[0] || 'user',
          email: profile.email || '',
          avatar: profile.avatarUrl || '',
          bio: 'AI enthusiast and developer.', // Placeholder as bio isn't in public.users yet
          location: 'Earth', // Placeholder
          website: '',
          joinedDate: new Date().toISOString(), // profile.created_at not in type
          status: 'online',
          social: {},
          stats,
          achievements,
          badges: [ // Static badges for now based on stats
            { id: 'early', name: 'Early Adopter', description: 'Joined early', icon: <Rocket className="w-6 h-6" />, earned: true, earnedAt: new Date().toISOString() },
            { id: 'builder', name: 'Bot Builder', description: 'Created a bot', icon: <Bot className="w-6 h-6" />, earned: (stats.botsCreated > 0) }
          ]
        });

        setEditForm({
          name: profile.fullName || '',
          bio: 'AI enthusiast and developer.',
          location: 'Earth',
          website: '',
          social: { github: '', twitter: '', linkedin: '' }
        });

      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      // Update public.users
      const { error } = await supabase
        .from('users')
        .update({ full_name: editForm.name })
        .eq('id', profile.id);

      if (error) throw error;

      // Update local state
      setUserProfile(prev => ({ ...prev, name: editForm.name })); // Bio/Location not persisted yet
      setIsEditing(false);
      await showAlert("Profile Updated", "Identity records successfully synchronized with the neural network.", "success");
    } catch (error) {
      console.error("Update failed:", error);
      await showAlert("Service Error", "Failed to update identity record. Synchronization failure.", "error");
    } finally {
      setLoading(false);
    }
  };

  const subduedText = theme === 'dark' ? "text-white/60" : "text-neutral-500";
  const cardBg = theme === 'dark' ? "bg-white/[0.02] border-white/10" : "bg-white border-neutral-200";

  if (!profile) return null;

  return (
    <DashboardPageShell
      title="Profile"
      description="Manage your identity and track your progress."
      headerAction={<ThemeToggle />}
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Card */}
        <div className={cn("p-8 rounded-2xl border relative overflow-hidden", cardBg)}>
          {/* Background Gradient */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#6C43FF]/20 to-[#8A63FF]/20" />

          <div className="relative flex flex-col md:flex-row gap-8 mt-12 px-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-[#6C43FF] to-[#8A63FF]">
                <div className="w-full h-full rounded-full bg-neutral-900 overflow-hidden flex items-center justify-center text-3xl font-bold text-white">
                  {userProfile.avatar ? (
                    <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    userProfile.name[0]
                  )}
                </div>
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-[#6C43FF] rounded-full text-white shadow-lg border-2 border-white dark:border-neutral-900">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 pt-2">
              {isEditing ? (
                <div className="space-y-4 max-w-md">
                  <input
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-neutral-100 dark:bg-white/10 border border-transparent focus:border-[#6C43FF] outline-none"
                    placeholder="Full Name"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-neutral-100 dark:bg-white/10 border border-transparent focus:border-[#6C43FF] outline-none"
                    placeholder="Bio"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleUpdateProfile} className="px-4 py-2 bg-[#6C43FF] text-white rounded-lg text-sm font-medium">Save</button>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-neutral-200 dark:bg-white/10 text-neutral-900 dark:text-white rounded-lg text-sm font-medium">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">{userProfile.name}</h2>
                      <p className="text-[#6C43FF] font-medium">@{userProfile.username}</p>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" /> Edit Profile
                    </button>
                  </div>

                  <p className={cn("mt-4 max-w-2xl", subduedText)}>
                    {userProfile.bio}
                  </p>

                  <div className="flex flex-wrap gap-6 mt-6 text-sm">
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                      <MapPin className="w-4 h-4" /> {userProfile.location}
                    </div>
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                      <Calendar className="w-4 h-4" /> Joined {new Date(userProfile.joinedDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                      <Activity className="w-4 h-4" /> Level {userProfile.stats.level}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total XP" value={userProfile.stats.totalXp.toLocaleString()} icon={<Zap className="w-5 h-5 text-yellow-500" />} />
          <StatCard label="Streak" value={`${userProfile.stats.streakDays} Days`} icon={<Flame className="w-5 h-5 text-orange-500" />} />
          <StatCard label="Bots Created" value={userProfile.stats.botsCreated} icon={<Bot className="w-5 h-5 text-blue-500" />} />
          <StatCard label="Total Executions" value={userProfile.stats.totalExecutions.toLocaleString()} icon={<Activity className="w-5 h-5 text-green-500" />} />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-neutral-200 dark:border-white/10 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors relative",
              activeTab === 'overview' ? "text-[#6C43FF]" : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white"
            )}
          >
            Overview
            {activeTab === 'overview' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6C43FF]" />}
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors relative",
              activeTab === 'achievements' ? "text-[#6C43FF]" : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white"
            )}
          >
            Achievements
            {activeTab === 'achievements' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6C43FF]" />}
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Badges */}
              <div className={cn("p-6 rounded-2xl border col-span-2", cardBg)}>
                <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Earned Badges</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {userProfile.badges.map(badge => (
                    <div key={badge.id} className={cn("p-4 rounded-xl border flex flex-col items-center text-center gap-2",
                      badge.earned ? "bg-primary/5 border-primary/20" : "opacity-50 grayscale border-neutral-200 dark:border-white/10"
                    )}>
                      <div className="p-3 bg-neutral-100 dark:bg-white/5 rounded-full text-[#6C43FF]">
                        {badge.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-neutral-900 dark:text-white">{badge.name}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Level */}
              <div className={cn("p-6 rounded-2xl border", cardBg)}>
                <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Next Level Progress</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-500">Level {userProfile.stats.level}</span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">{userProfile.stats.xp} / 1000 XP</span>
                </div>
                <div className="h-3 w-full bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-linear-to-r from-[#6C43FF] to-[#8A63FF]"
                    style={{ width: `${(userProfile.stats.xp / 1000) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-500 text-center">
                  Gain {1000 - userProfile.stats.xp} more XP to reach Level {userProfile.stats.level + 1}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {userProfile.achievements.map((achievement) => (
                <div key={achievement.id} className={cn("p-6 rounded-2xl border flex items-start gap-4", cardBg)}>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 text-yellow-600 dark:text-yellow-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white">{achievement.name}</h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">{achievement.description}</p>
                    <div className="flex items-center gap-2 text-xs font-medium text-[#6C43FF]">
                      <Zap className="w-3 h-3" /> +{achievement.xpReward} XP
                    </div>
                  </div>
                </div>
              ))}
              {userProfile.achievements.length === 0 && (
                <div className="col-span-full py-12 text-center text-neutral-500">
                  No achievements unlocked yet. Start building bots to earn them!
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardPageShell>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
  const { theme } = useTheme();
  const cardBg = theme === 'dark' ? "bg-white/[0.02] border-white/10" : "bg-white border-neutral-200";

  return (
    <div className={cn("p-6 rounded-2xl border flex items-center gap-4", cardBg)}>
      <div className="p-3 rounded-xl bg-neutral-100 dark:bg-white/5">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      </div>
    </div>
  );
}
