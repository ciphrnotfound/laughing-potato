"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAppSession } from "@/lib/app-session-context";
import { useTheme } from "@/lib/theme-context";
import DashboardBackground from "@/components/DashboardBackground";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Webhook,
  Plus,
  Search,
  Settings,
  Play,
  Pause,
  Trash2,
  Copy,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical
} from "lucide-react";

interface Webhook {
  id: string;
  name: string;
  description?: string;
  endpoint_url: string;
  trigger_events: string[];
  method: string;
  is_active: boolean;
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  last_called?: string;
  last_success?: string;
  last_failure?: string;
  created_at: string;
  updated_at: string;
}

interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  status: string;
  attempted_at: string;
  response_status_code?: number;
  duration_ms?: number;
}

export default function WebhooksPage() {
  const { profile } = useAppSession();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/webhooks");
      const data = await response.json();
      
      if (data.webhooks) {
        setWebhooks(data.webhooks);
      }
    } catch (error) {
      console.error("Error fetching webhooks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveries = async (webhookId: string) => {
    try {
      const response = await fetch(`/api/webhooks?include_deliveries=true`);
      const data = await response.json();
      
      if (data.webhooks) {
        const webhook = data.webhooks.find((w: Webhook) => w.id === webhookId);
        if (webhook?.webhook_deliveries) {
          setDeliveries(webhook.webhook_deliveries);
        }
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  };

  const testWebhook = async (webhook: Webhook) => {
    try {
      setTestingWebhook(webhook.id);
      const response = await fetch(`/api/webhooks/${webhook.id}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test_event: webhook.trigger_events[0] || "test.event"
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success notification
        fetchWebhooks(); // Refresh to update stats
      }
    } catch (error) {
      console.error("Error testing webhook:", error);
    } finally {
      setTestingWebhook(null);
    }
  };

  const toggleWebhook = async (webhook: Webhook) => {
    try {
      const response = await fetch(`/api/webhooks/${webhook.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !webhook.is_active })
      });
      
      if (response.ok) {
        fetchWebhooks();
      }
    } catch (error) {
      console.error("Error toggling webhook:", error);
    }
  };

  const filteredWebhooks = webhooks.filter(webhook =>
    webhook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    webhook.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    webhook.endpoint_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "text-green-600 bg-green-50 border-green-200";
      case "failed": return "text-red-600 bg-red-50 border-red-200";
      case "pending": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "failed": return <XCircle className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getSuccessRate = (webhook: Webhook) => {
    if (webhook.total_calls === 0) return 0;
    return Math.round((webhook.successful_calls / webhook.total_calls) * 100);
  };

  return (
    <DashboardBackground>
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">Webhooks</h1>
              <p className="text-gray-500 mt-1">Connect external services</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors"
              style={{
                backgroundColor: isDark ? '#000000' : '#1a1a1a',
                color: 'white'
              }}
            >
              <Plus className="w-4 h-4" />
              New Webhook
            </motion.button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search webhooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
              style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              Active
            </button>
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              Inactive
            </button>
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              All
            </button>
          </div>
        </div>
      </div>

      {/* Webhooks List */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : filteredWebhooks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Webhook className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">No webhooks yet</h3>
            <p className="text-gray-500 mb-6">Create your first webhook to connect external services</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-xl font-medium transition-colors"
              style={{
                backgroundColor: isDark ? '#000000' : '#1a1a1a',
                color: 'white'
              }}
            >
              Create Webhook
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredWebhooks.map((webhook) => (
                <motion.div
                  key={webhook.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="border rounded-2xl p-6 hover:shadow-lg transition-all"
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-black">{webhook.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                          webhook.is_active 
                            ? "text-green-600 bg-green-50 border-green-200" 
                            : "text-gray-600 bg-gray-50 border-gray-200"
                        }`}>
                          {webhook.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      {webhook.description && (
                        <p className="text-gray-500 text-sm mb-2">{webhook.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          {webhook.method.toUpperCase()}
                        </span>
                        <span className="flex items-center gap-1 truncate max-w-md">
                          <ExternalLink className="w-3 h-3" />
                          {webhook.endpoint_url}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => testWebhook(webhook)}
                        disabled={testingWebhook === webhook.id}
                        className="p-2 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Play className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => toggleWebhook(webhook)}
                        className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {webhook.is_active ? (
                          <Pause className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Play className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedWebhook(webhook);
                          fetchDeliveries(webhook.id);
                        }}
                        className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-black">{webhook.total_calls}</div>
                      <div className="text-xs text-gray-500">Total Calls</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">{webhook.successful_calls}</div>
                      <div className="text-xs text-gray-500">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-red-600">{webhook.failed_calls}</div>
                      <div className="text-xs text-gray-500">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">{getSuccessRate(webhook)}%</div>
                      <div className="text-xs text-gray-500">Success Rate</div>
                    </div>
                  </div>

                  {/* Trigger Events */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Triggers:</span>
                    <div className="flex flex-wrap gap-1">
                      {webhook.trigger_events.slice(0, 3).map((event) => (
                        <span key={event} className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-lg">
                          {event}
                        </span>
                      ))}
                      {webhook.trigger_events.length > 3 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg">
                          +{webhook.trigger_events.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Webhook Detail Modal */}
      <AnimatePresence>
        {selectedWebhook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedWebhook(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-black">{selectedWebhook.name}</h2>
                    <p className="text-gray-500 mt-1">{selectedWebhook.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedWebhook(null)}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-100">
                <div className="flex">
                  <button className="px-6 py-3 text-sm font-medium text-black border-b-2 border-purple-600">
                    Deliveries
                  </button>
                  <button className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-black transition-colors">
                    Settings
                  </button>
                  <button className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-black transition-colors">
                    Logs
                  </button>
                </div>
              </div>

              {/* Deliveries List */}
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="space-y-3">
                  {deliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(delivery.status)}`}>
                          {getStatusIcon(delivery.status)}
                        </div>
                        <div>
                          <div className="font-medium text-black capitalize">
                            {delivery.event_type.replace('.', ' ')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(delivery.attempted_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-black">
                          {delivery.response_status_code || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {delivery.duration_ms ? `${delivery.duration_ms}ms` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                  {deliveries.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No deliveries yet</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Webhook Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-black mb-6">Create Webhook</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="My Webhook"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Description (Optional)</label>
                  <textarea
                    placeholder="What does this webhook do?"
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Endpoint URL</label>
                  <input
                    type="url"
                    placeholder="https://api.example.com/webhook"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Trigger Events</label>
                  <div className="space-y-2">
                    {["bot.created", "bot.executed", "member.joined", "workspace.updated"].map((event) => (
                      <label key={event} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                        <input type="checkbox" className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-black">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-black rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition-colors"
                >
                  Create
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </DashboardBackground>
  );
}
