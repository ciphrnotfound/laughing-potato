"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSession } from "@/lib/app-session-context";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/database.types";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Database as DatabaseIcon,
  CheckCircle2,
  Save,
  Settings,
  ChevronRight,
  Loader2,
  Key,
  Trash2,
  Plus
} from "lucide-react";

// Section Config
const SETTINGS_SECTIONS = [
  { id: 'profile', name: 'Profile', icon: User },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'preferences', name: 'Preferences', icon: Settings },
  { id: 'billing', name: 'Billing', icon: CreditCard },
  // { id: 'data', name: 'Data', icon: DatabaseIcon }
];

export default function SettingsPage() {
  const { profile } = useAppSession();
  const { theme } = useTheme();
  const supabase = createClientComponentClient<Database>();

  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form States
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    avatarUrl: ''
  });

  const [apiKeys, setApiKeys] = useState<any[]>([]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;
      setLoading(true);
      try {
        // 1. Profile Data (from session/users table)
        // We can trust useAppSession for initial load, but maybe fetch fresh to be safe?
        // Actually useAppSession is live enough.
        setProfileForm({
          fullName: profile.fullName || '',
          email: profile.email || '',
          avatarUrl: profile.avatarUrl || ''
        });

        // 2. Security Data (API Keys)
        const { data: keys } = await supabase
          .from('api_keys')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });

        setApiKeys(keys || []);

      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profile]);

  // Handle Save (Profile)
  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profileForm.fullName,
          avatar_url: profileForm.avatarUrl
        })
        .eq('id', profile.id);

      if (error) throw error;

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Update failed:", error);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) return;

    try {
      const { error } = await supabase.from('api_keys').delete().eq('id', id);
      if (error) throw error;
      setApiKeys(prev => prev.filter(k => k.id !== id));
    } catch (error) {
      console.error("Error deleting key:", error);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">Profile Details</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage your public profile information.</p>
            </div>

            <div className="flex items-start gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-100 dark:bg-white/10">
                  {profileForm.avatarUrl ? (
                    <img src={profileForm.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-neutral-400">
                      {profileForm.fullName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                {/* Placeholder for upload feature */}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Display Name</label>
                <input
                  value={profileForm.fullName}
                  onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-[#6C43FF] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Email Address</label>
                <input
                  value={profileForm.email}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 text-neutral-500 cursor-not-allowed"
                />
                <p className="text-xs text-neutral-400 mt-1">Email cannot be changed via settings.</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#6C43FF] text-white rounded-xl font-medium shadow-lg shadow-[#6C43FF]/20 hover:shadow-[#6C43FF]/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">Security & Access</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage your API keys and security preferences.</p>
            </div>

            {/* API Keys */}
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#6C43FF]" /> API Keys
                  </h3>
                  <p className="text-sm text-neutral-500">Manage keys used to access your bots programmatically.</p>
                </div>
                <button className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                  Generate New Key
                </button>
              </div>

              <div className="space-y-3">
                {apiKeys.length > 0 ? (
                  apiKeys.map(key => (
                    <div key={key.id} className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">{key.label || 'Unnamed Key'}</p>
                        <p className="text-xs text-neutral-500 font-mono mt-1">
                          {key.key_hash ? `Ends in ...${key.key_hash.slice(-4)}` : 'Hidden'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-neutral-500">Created {new Date(key.created_at).toLocaleDateString()}</span>
                        <button
                          onClick={() => handleDeleteApiKey(key.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    No API keys found.
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 text-neutral-400">
              <Settings className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Coming Soon</h3>
            <p className="text-neutral-500 mt-2 max-w-sm">
              This section is currently under development. Check back later for updates.
            </p>
          </div>
        );
    }
  };

  if (!profile) return null;

  return (
    <DashboardPageShell
      title="Settings"
      description="Manage your account preferences and configurations."
      headerAction={<ThemeToggle />}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">

        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1 sticky top-6">
            {SETTINGS_SECTIONS.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm",
                    isActive
                      ? "bg-[#6C43FF]/10 text-[#6C43FF] shadow-sm ring-1 ring-[#6C43FF]/20"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {section.name}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5" />
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm">
            {renderContent()}
          </div>
        </div>

      </div>
    </DashboardPageShell>
  );
}
