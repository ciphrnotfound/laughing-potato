"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSession } from "@/lib/app-session-context";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/database.types";
import {
  Search,
  Plug,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  ExternalLink,
  Webhook,
  Play,
  Pause,
  TrendingUp,
  AlertCircle,
  Slack,
  Twitter,
  Github,
  Cloud,
  CreditCard,
  Bot,
  Grid3x3,
  MessageSquare,
  Calendar,
  Code,
  BarChart3,
  Database as DbIcon,
  Shield,
  Key,
  ShoppingBag,
  Building,
  Braces,
  DollarSign,
  Terminal,
  Smartphone,
  Linkedin,
  Globe,
  Mail,
  FileText,
  Zap,
  Users,
  Clock,
  Info,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Edit,
  MoreVertical,
  Lock
} from "lucide-react";
import { CredentialForm, Field } from "@/components/integrations/CredentialForm";
import { getAuthFields } from "@/lib/integrations/auth-parser";

// Types for integrations
interface Integration {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: 'communication' | 'productivity' | 'development' | 'analytics' | 'payment' | 'storage' | 'ai' | 'other';
  type: 'oauth' | 'api_key' | 'webhook' | 'custom';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  icon: React.ReactNode;
  features: string[];
  pricing: 'free' | 'paid' | 'freemium';
  documentation: string;
  setupTime: string;
  lastSync?: string;
  errorCount: number;
  usageCount: number;
  credentials?: {
    apiKey?: string;
    webhookUrl?: string;
    oauthToken?: string;
    [key: string]: any;
  };
  configuration?: {
    [key: string]: any;
  };
  webhooks?: WebhookConfig[];
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  lastTriggered?: string;
  triggerCount: number;
}

// Categories configuration
const CATEGORIES = [
  { id: 'all', name: 'All Apps', icon: Grid3x3 },
  { id: 'communication', name: 'Communication', icon: MessageSquare },
  { id: 'productivity', name: 'Productivity', icon: Calendar },
  { id: 'developer', name: 'Development', icon: Code },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'payment', name: 'Payment', icon: CreditCard },
  { id: 'storage', name: 'Storage', icon: DbIcon },
  { id: 'ai', name: 'AI / ML', icon: Bot },
  { id: 'other', name: 'Other', icon: Plug }
];

// Helper to get category icon
const getCategoryIcon = (category: string) => {
  const cat = CATEGORIES.find(c => c.id === category);
  return cat ? <cat.icon className="w-6 h-6" /> : <Plug className="w-6 h-6" />;
};

// Type configurations
const TYPE_CONFIGS = {
  oauth: { label: 'OAuth 2.0', color: 'bg-blue-500 text-blue-400', icon: Shield },
  api_key: { label: 'API Key', color: 'bg-yellow-500 text-yellow-400', icon: Key },
  webhook: { label: 'Webhook', color: 'bg-purple-500 text-purple-400', icon: Webhook },
  custom: { label: 'Custom', color: 'bg-green-500 text-green-400', icon: Code }
};

// Fallback empty list
const AVAILABLE_INTEGRATIONS: Integration[] = [];

export default function IntegrationsPage() {
  const { profile } = useAppSession();
  const { theme } = useTheme();
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>(AVAILABLE_INTEGRATIONS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Fetch integrations from Supabase
  useEffect(() => {
    const fetchIntegrations = async () => {
      if (!profile) return;

      const supabase = createClientComponentClient<Database>();

      // 1. Fetch available integrations
      const { data: dbIntegrations, error: integrationsError } = await supabase
        .from('integrations')
        .select('*, hivelang_code')
        .eq('is_active', true);

      if (integrationsError) {
        console.error("Error fetching integrations:", integrationsError);
        return;
      }

      // 2. Fetch user connections
      const { data: userConns, error: userError } = await supabase
        .from('user_integrations')
        .select('integration_id, status')
        .eq('user_id', profile.id);

      if (dbIntegrations) {
        const mapped: Integration[] = dbIntegrations.map(di => {
          const userConn = userConns?.find(uc => uc.integration_id === di.id);

          return {
            id: di.id,
            slug: di.slug, // Storing slug for router
            name: di.name,
            description: di.description || "",
            category: (di.category as any) || 'other',
            type: (di.type as any) || 'custom',
            status: userConn ? (userConn.status as any) : 'disconnected',
            icon: getCategoryIcon(di.category || 'other'),
            features: Array.isArray(di.features) ? (di.features as string[]) : [],
            pricing: (di.pricing_model as any) || 'free',
            documentation: di.documentation_url || '#',
            setupTime: di.setup_time || '5 minutes',
            errorCount: 0,
            usageCount: 0
          };
        });

        setIntegrations(mapped);
      }
    };
    fetchIntegrations();
  }, [profile]);

  // Filter integrations
  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });


  const handleConnect = useCallback(async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    setConnectingId(integrationId);

    if (integration.type === 'oauth') {
      // Trigger OAuth redirect
      router.push(`/api/integrations/${integration.slug?.toLowerCase() || integration.name.toLowerCase()}/oauth/authorize?state=${profile?.id}`);
    } else {
      // Show credential form for API key / Custom
      setSelectedIntegration(integration);
      setConnectingId(null);
    }
  }, [integrations, profile, router]);

  const handleSaveCredentials = async (data: Record<string, string>) => {
    if (!profile || !selectedIntegration) return;

    const supabase = createClientComponentClient<Database>();

    // Save to user_integrations
    const { error } = await supabase
      .from('user_integrations')
      .upsert({
        user_id: profile.id,
        integration_id: selectedIntegration.id,
        access_token: data.apiKey || data.access_token || JSON.stringify(data),
        additional_config: data,
        status: 'active'
      }, { onConflict: 'user_id, integration_id' });

    if (error) throw error;

    // Update local state
    setIntegrations(prev => prev.map(i =>
      i.id === selectedIntegration.id ? { ...i, status: 'connected' } : i
    ));

    return Promise.resolve();
  };

  const handleDisconnect = useCallback(async (integrationId: string) => {
    setLoading(true);
    try {
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: 'disconnected', credentials: undefined, webhooks: undefined }
          : integration
      ));
    } catch (error) {
      console.error('Disconnection failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleWebhookToggle = useCallback((integrationId: string, webhookId: string) => {
    // Mock implementation
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-gray-400';
      case 'error': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeConfig = (type: string) => {
    return TYPE_CONFIGS[type as keyof typeof TYPE_CONFIGS] || TYPE_CONFIGS.custom;
  };

  const rootBackground = cn(
    "min-h-screen relative overflow-hidden",
    theme === 'dark' ? "bg-neutral-950" : "bg-neutral-100"
  );

  const radialOverlayClass = cn(
    "absolute inset-0 z-0",
    theme === 'dark'
      ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950"
      : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-neutral-100 to-neutral-100"
  );

  const gridOverlayClass = cn(
    "absolute inset-0 z-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]",
    theme === 'dark' ? "opacity-20" : "opacity-40"
  );

  const subduedText = theme === 'dark' ? "text-neutral-400" : "text-neutral-500";

  return (
    <>
      <div className={rootBackground}>
        <div className="pointer-events-none absolute inset-0">
          <div className={radialOverlayClass} />
          <div className={gridOverlayClass} />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="relative z-10">
            <div className="flex justify-between items-center p-6">
              <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-[#6C43FF] to-[#8A63FF] bg-clip-text text-transparent">
                  Integrations
                </h1>
                <p className={subduedText + " mt-2"}>
                  Connect your favorite services and automate your workflows
                </p>
              </div>
              <ThemeToggle />
            </div>

            {/* Stats Cards - Simplified for brevity in restoration */}
            <div className="px-6 pb-6">
              {/* ... (Keeping it simple for now, can add back detailed stats if needed) ... */}
            </div>

            {/* Main Content */}
            <div className="p-6 max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search integrations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 focus:ring-2 focus:ring-[#6C43FF] outline-none transition-all"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push("/dashboard/integrations/new")}
                    className="flex items-center gap-2 px-4 py-3 bg-linear-to-r from-[#6C43FF] to-[#8A63FF] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add Custom</span>
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredIntegrations.map((integration, index) => {
                    const typeConfig = getTypeConfig(integration.type);
                    return (
                      <motion.div
                        key={integration.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[#6C43FF]">
                              {integration.icon}
                            </div>
                            <h3 className="font-bold text-neutral-900 dark:text-white">{integration.name}</h3>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${integration.status === 'connected' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}`}>
                            {integration.status}
                          </span>
                        </div>

                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 h-10 line-clamp-2">
                          {integration.description}
                        </p>

                        <div className="flex gap-2 mt-4">
                          {integration.status === 'connected' ? (
                            <button
                              onClick={() => handleDisconnect(integration.id)}
                              className="flex-1 px-3 py-2 text-sm rounded-lg bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20"
                            >
                              Disconnect
                            </button>
                          ) : (
                            <button
                              onClick={() => handleConnect(integration.id)}
                              disabled={connectingId === integration.id}
                              className="flex-1 px-3 py-2 text-sm rounded-lg bg-[#6C43FF] text-white hover:bg-[#5a36db] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {connectingId === integration.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Connecting...</span>
                                </>
                              ) : (
                                <>
                                  <Plug className="w-4 h-4" />
                                  <span>Connect</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Dynamic Credential Modal */}
      <AnimatePresence>
        {selectedIntegration && (
          <CredentialForm
            integration={selectedIntegration}
            isDark={theme === 'dark'}
            onClose={() => setSelectedIntegration(null)}
            onSubmit={handleSaveCredentials}
            fields={getAuthFields(
              (integrations.find(i => i.id === selectedIntegration.id) as any)?.hivelang_code
            )}
          />
        )}
      </AnimatePresence>
    </>
  );
}
