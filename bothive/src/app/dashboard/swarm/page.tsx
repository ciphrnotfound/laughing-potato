"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Zap,
  Play,
  Plus,
  Network,
  Cpu,
  CheckCircle2,
  X,
  Activity,
  ArrowRight
} from 'lucide-react';
import { swarmManager, SwarmBot, SwarmWorkflow } from '@/lib/swarm-communication';

// --- Components ---

const MinimalCard = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <motion.div
    whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(120, 50, 255, 0.15)" }}
    onClick={onClick}
    className={`bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl transition-all duration-300 cursor-default ${className}`}
  >
    {children}
  </motion.div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    running: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse",
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    draft: "bg-white/5 text-gray-400 border-white/10",
    error: "bg-red-500/10 text-red-400 border-red-500/20"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-medium border tracking-wide uppercase ${styles[status as keyof typeof styles] || styles.draft}`}>
      {status}
    </span>
  );
};

// --- Main Page ---

export default function SwarmPage() {
  const [workflows, setWorkflows] = useState<SwarmWorkflow[]>([]);
  const [availableBots, setAvailableBots] = useState<SwarmBot[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedBots, setSelectedBots] = useState<string[]>([]);
  const [swarmName, setSwarmName] = useState("");
  const [swarmDescription, setSwarmDescription] = useState("");

  // Fetch bots on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const bots = await swarmManager.fetchAvailableBots();
      setAvailableBots(bots);
      setLoading(false);
    };
    init();

    // Subscribe to workflow events
    swarmManager.on('workflow:created', (w: SwarmWorkflow) => setWorkflows(prev => [...prev, w]));
    swarmManager.on('workflow:started', (w: SwarmWorkflow) => updateWorkflow(w));
    swarmManager.on('workflow:completed', (w: SwarmWorkflow) => updateWorkflow(w));
    swarmManager.on('workflow:error', (w: SwarmWorkflow) => updateWorkflow(w));

    return () => {
      // Cleanup listeners if needed
    };
  }, []);

  const updateWorkflow = (updated: SwarmWorkflow) => {
    setWorkflows(prev => prev.map(w => w.id === updated.id ? { ...updated } : w));
  };

  const handleCreateSwarm = async () => {
    if (selectedBots.length < 2 || !swarmName) return;

    setLoading(true);
    try {
      await swarmManager.createWorkflow(swarmName, swarmDescription, selectedBots);
      setIsCreating(false);
      setSwarmName("");
      setSwarmDescription("");
      setSelectedBots([]);
    } catch (e) {
      console.error(e);
      alert("Failed to create swarm");
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteSwarm = async (id: string) => {
    try {
      await swarmManager.executeWorkflow(id);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleBotSelection = (botId: string) => {
    setSelectedBots(prev =>
      prev.includes(botId) ? prev.filter(id => id !== botId) : [...prev, botId]
    );
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white p-8 md:p-12 font-sans selection:bg-purple-500/30">

      {/* Subtle Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[180px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[180px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.05] text-xs font-medium text-purple-300 mb-4"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Neural Network Active
            </motion.div>
            <h1 className="text-5xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-3">
              Swarm Intelligence
            </h1>
            <p className="text-lg text-gray-400 font-light max-w-lg leading-relaxed">
              Orchestrate autonomous agents in a unified, collaborative environment.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreating(true)}
            className="group flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full font-medium shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all"
          >
            <Plus size={18} />
            <span>New Swarm</span>
            <ArrowRight size={16} className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
          </motion.button>
        </header>

        {/* Active Swarms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {workflows.map((workflow) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <MinimalCard className="h-full flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <Network size={20} />
                      </div>
                      <StatusBadge status={workflow.status} />
                    </div>

                    <h3 className="text-xl font-medium mb-2 text-white/90">{workflow.name}</h3>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed line-clamp-2">{workflow.description}</p>

                    {/* Agents Stack */}
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-3">
                        {workflow.bots.map((bot, i) => (
                          <div key={i} className="w-9 h-9 rounded-full bg-[#111] border-2 border-[#1a1a1a] flex items-center justify-center text-[10px] text-gray-400 font-medium shadow-lg" title={bot.name}>
                            {bot.name[0]}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-gray-600 font-medium">
                        {workflow.bots.length} Agents
                      </span>
                    </div>
                  </div>

                  {/* Actions / Terminal */}
                  <div className="mt-8 pt-6 border-t border-white/[0.04]">
                    {workflow.status === 'running' ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs text-purple-400 font-medium">
                          <Activity size={12} className="animate-spin" />
                          Processing...
                        </div>
                        <div className="h-24 overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
                          <div className="space-y-2">
                            {workflow.steps.map((s, i) => (
                              <div key={i} className={`text-xs font-mono ${s.status === 'completed' ? 'text-gray-600' : 'text-gray-300'}`}>
                                <span className="mr-2 opacity-50">{s.status === 'completed' ? '✓' : '→'}</span>
                                {s.description}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 font-medium">
                          Ready to deploy
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleExecuteSwarm(workflow.id)}
                          disabled={(workflow.status as string) === 'running'}
                          className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center text-white transition-colors"
                        >
                          <Play size={16} fill="currentColor" className="ml-0.5" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </MinimalCard>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {workflows.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-32 flex flex-col items-center justify-center text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-6">
                <Cpu size={32} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No Active Swarms</h3>
              <p className="text-gray-500 max-w-sm mb-8">
                Initialize a new swarm protocol to begin orchestrating your autonomous agents.
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
              >
                Create New Swarm &rarr;
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Creation Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0f0f11] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-1">Initialize Swarm</h2>
                    <p className="text-gray-500 text-sm">Configure your autonomous agent collective.</p>
                  </div>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Identity</label>
                      <input
                        type="text"
                        placeholder="Name your swarm..."
                        className="w-full bg-transparent border-b border-white/10 px-0 py-3 text-lg focus:outline-none focus:border-purple-500 transition-colors placeholder:text-gray-700"
                        value={swarmName}
                        onChange={(e) => setSwarmName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Objective</label>
                      <textarea
                        placeholder="What is the primary goal?"
                        className="w-full bg-transparent border-b border-white/10 px-0 py-3 text-base focus:outline-none focus:border-purple-500 transition-colors h-24 resize-none placeholder:text-gray-700"
                        value={swarmDescription}
                        onChange={(e) => setSwarmDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-4 uppercase tracking-wider">Select Agents</label>
                    <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {loading ? (
                        <div className="col-span-2 py-12 text-center text-gray-600 text-sm">Loading agents...</div>
                      ) : availableBots.map((bot) => (
                        <div
                          key={bot.id}
                          onClick={() => toggleBotSelection(bot.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center gap-4 group ${selectedBots.includes(bot.id)
                            ? 'bg-purple-500/[0.08] border-purple-500/30'
                            : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
                            }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedBots.includes(bot.id) ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-[#1a1a1a] text-gray-500'
                            }`}>
                            <Bot size={18} />
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${selectedBots.includes(bot.id) ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                              {bot.name}
                            </div>
                            <div className="text-[10px] text-gray-600 font-medium uppercase tracking-wide">
                              {bot.capabilities[0]?.split('.')[0] || 'Agent'}
                            </div>
                          </div>
                          {selectedBots.includes(bot.id) && (
                            <CheckCircle2 size={18} className="ml-auto text-purple-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-10">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSwarm}
                    disabled={loading || selectedBots.length < 2 || !swarmName}
                    className="px-8 py-3 bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-sm font-medium transition-all shadow-lg shadow-white/5"
                  >
                    {loading ? 'Initializing...' : 'Deploy Swarm'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
