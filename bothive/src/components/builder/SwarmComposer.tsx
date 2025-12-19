"use client";

import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    useNodesState,
    useEdgesState,
    Node,
    Connection,
    BackgroundVariant,
    ReactFlowProvider,
    Handle,
    Position,
    useReactFlow,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PulseNode } from './PulseNode';
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, LayoutGrid, Network, Code, Play, Zap, Volume2, VolumeX, Plus, Bot, Cpu, Terminal } from 'lucide-react';
import { useTTS } from '@/hooks/useTTS';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================================================
// PARSER (Regex) - Same as before
// ============================================================================
const parseAgentsFromCode = (code: string) => {
    const agents: { name: string; content: string }[] = [];
    const agentRegex = /agent\s+([A-Za-z0-9_]+)\s*([\s\S]*?)\s*end/g;
    let match;
    while ((match = agentRegex.exec(code)) !== null) {
        agents.push({ name: match[1], content: match[2].trim() });
    }
    return agents;
};

// ============================================================================
// TECH NODE COMPONENT
// ============================================================================
const TechNode = ({ data, selected }: { data: any; selected: boolean }) => {
    return (
        <div className="relative group">
            {selected && (
                <div className="absolute -inset-[2px] bg-cyan-500 rounded-lg blur-[2px] opacity-100" />
            )}

            <div className={cn(
                "relative min-w-[240px] bg-[#09090b] border border-[#27272a] rounded-lg overflow-hidden shadow-2xl transition-all",
                selected ? "border-cyan-500/50" : "hover:border-white/20"
            )}>
                <div className="flex items-center justify-between px-3 py-2 bg-[#18181b] border-b border-[#27272a]">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", data.isActive ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-zinc-600")} />
                        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">ID: {data.id?.substring(0, 4)}</span>
                    </div>
                    <Bot className="w-3 h-3 text-zinc-500" />
                </div>
                <div className="p-4">
                    <div className="flex items-start gap-4 mb-3">
                        <div className={cn("p-2.5 rounded bg-zinc-900 border border-zinc-800", data.color || "text-cyan-400")}>
                            <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white font-mono tracking-tight">{data.label}</h3>
                            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wide">Autonomous Agent</p>
                        </div>
                    </div>
                    <div className="bg-[#000] border border-zinc-800 rounded p-2 font-mono text-[10px] text-zinc-400 h-[60px] overflow-hidden leading-relaxed opacity-80 relative">
                        <div className="absolute top-0 right-0 p-1 opacity-20"><Terminal className="w-3 h-3" /></div>
                        <span className="text-purple-400">agent</span> <span className="text-yellow-200">{data.label}</span>
                        <div className="opacity-70 mt-1">{data.codeSnippet?.substring(0, 60)}...</div>
                    </div>
                </div>
                <div className="px-3 py-1.5 bg-[#000] border-t border-[#27272a] flex items-center justify-between">
                    <span className="text-[9px] text-zinc-600 font-mono">STATUS: {data.isActive ? "EXECUTING" : "IDLE"}</span>
                    {data.isActive && <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400 animate-pulse" />}
                </div>
                <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-cyan-500 !border-none !rounded-none" />
                <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-cyan-500 !border-none !rounded-none" />
            </div>
        </div>
    );
};

const nodeTypes = { agentNode: TechNode };

interface AgentNodeData {
    id: string;
    label: string;
    codeSnippet: string;
    isActive?: boolean;
    color: string;
    role?: string;
}

interface SwarmComposerProps {
    value: string;
    onChange: (value: string) => void;
}

export default function SwarmComposer({ value, onChange }: SwarmComposerProps) {
    return (
        <ReactFlowProvider>
            <SwarmComposerInner value={value} onChange={onChange} />
        </ReactFlowProvider>
    );
}

function SwarmComposerInner({ value, onChange }: SwarmComposerProps) {
    // Props replace local state for 'code'
    const code = value;
    const setCode = onChange;

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [viewMode, setViewMode] = useState<'visual' | 'code' | 'architect'>('architect');
    const { isMuted, setIsMuted, speak } = useTTS();

    // Sync Code to Nodes
    useEffect(() => {
        try {
            // Parse agents from code
            const agents = parseAgentsFromCode(code);

            // Main Bot Name
            const botNameMatch = code.match(/bot\s+([A-Za-z0-9_]+)/);
            const botName = botNameMatch ? botNameMatch[1] : "HiveSwarm";

            // Generate nodes
            const newNodes: Node[] = [];

            // 1. Add Sub-Agents
            agents.forEach((agent, index) => {
                const existingNode = nodes.find(n => n.id === agent.name);
                newNodes.push({
                    id: agent.name,
                    type: 'agentNode',
                    position: existingNode?.position || { x: 50 + (index * 280), y: 150 + (index % 2 === 0 ? 0 : 100) },
                    data: {
                        id: agent.name,
                        label: agent.name,
                        codeSnippet: agent.content,
                        isActive: false,
                        color: index === 0 ? "text-cyan-400" : index === 1 ? "text-purple-400" : "text-emerald-400"
                    }
                });
            });

            // 2. Add Main Orchestrator
            if (!newNodes.find(n => n.id === botName)) {
                newNodes.unshift({
                    id: botName,
                    type: 'agentNode',
                    position: { x: 350, y: 0 }, // Top center
                    data: {
                        id: botName,
                        label: botName,
                        role: 'Orchestrator',
                        codeSnippet: 'on input...',
                        color: "text-amber-400",
                        isActive: false
                    }
                });
            }

            // Simple check to avoid infinite loop / jitter
            const hasChanges = newNodes.length !== nodes.length || newNodes.some((n, i) => n.id !== nodes[i]?.id);

            if (hasChanges) {
                setNodes(newNodes);
                const newEdges = agents.map(a => ({
                    id: `e-${botName}-${a.name}`,
                    source: botName,
                    target: a.name,
                    animated: true,
                    style: { stroke: '#06b6d4', strokeWidth: 1.5 },
                    type: 'smoothstep',
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' }
                }));
                setEdges(newEdges);
            }
        } catch (e) {
            // Silently fail on invalid code during typing
        }
    }, [code, nodes]);

    const addNewAgent = () => {
        const newAgentName = `Agent_${Math.floor(Math.random() * 1000)}`;
        const newBlock = `\n  agent ${newAgentName}\n    on input\n      say "I am ready."\n    end\n  end`;
        const lastEndIndex = code.lastIndexOf('end');
        if (lastEndIndex !== -1) {
            // Basic insertion logic
            const newCode = code.slice(0, lastEndIndex) + newBlock + "\n" + code.slice(lastEndIndex);
            setCode(newCode);
            toast.success("Agent Module Initialized");
        } else {
            // Fallback if structure is broken
            setCode(code + newBlock);
        }
    };

    const runSimulation = async () => {
        setIsSimulating(true);
        // Sequential simulation
        const botNameMatch = code.match(/bot\s+([A-Za-z0-9_]+)/);
        const botName = botNameMatch ? botNameMatch[1] : "HiveSwarm";

        const sequence = [botName, ...nodes.filter(n => n.id !== botName).map(n => n.id)];

        for (let i = 0; i < sequence.length; i++) {
            const id = sequence[i];

            // Speak!
            const thought = `Processing task for ${id}...`;
            speak(thought, { pitch: 1.0 + (i * 0.1), rate: 1.1, voiceIndex: i });

            setNodes(nds => nds.map(n => n.id === id ? {
                ...n,
                data: { ...n.data, isActive: true, status: 'thinking', thought: thought }
            } : {
                ...n,
                data: { ...n.data, isActive: false, status: 'idle' }
            }));
            await new Promise(r => setTimeout(r, 2000)); // Slightly longer for speech

            // Mark as done thinking, stay active briefly
            setNodes(nds => nds.map(n => n.id === id ? {
                ...n,
                data: { ...n.data, isActive: true, status: 'active', thought: undefined }
            } : n));
        }
        // Reset
        setTimeout(() => {
            setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, isActive: false, status: 'idle' } })));
            setIsSimulating(false);
        }, 1000);
    };

    const agentsList = parseAgentsFromCode(code);
    const botNameMatch = code.match(/bot\s+([A-Za-z0-9_]+)/);
    const botName = botNameMatch ? botNameMatch[1] : "HiveSwarm";

    return (
        <div className="flex flex-col h-full w-full bg-[#0a0a0f] text-white font-sans overflow-hidden border border-white/10 rounded-2xl">
            {/* Swarm Toolbar */}
            <div className="h-12 border-b border-white/10 bg-[#0a0a0f] flex items-center justify-between px-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white/50">
                    <Layers className="w-4 h-4 text-cyan-500" />
                    <span>Swarm Composer</span>
                </div>

                <div className="flex bg-white/5 p-1 rounded-lg">
                    {/* View Modes */}
                    <button onClick={() => setViewMode('architect')} className={cn("flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-all", viewMode === 'architect' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white")}>
                        <LayoutGrid className="w-3 h-3" /> Architect
                    </button>
                    <button onClick={() => setViewMode('visual')} className={cn("flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-all", viewMode === 'visual' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white")}>
                        <Network className="w-3 h-3" /> Graph
                    </button>
                    <button onClick={() => setViewMode('code')} className={cn("flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-all", viewMode === 'code' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white")}>
                        <Code className="w-3 h-3" /> Code
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            isMuted ? "text-red-400 bg-red-400/10 hover:bg-red-400/20" : "text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20"
                        )}
                        title={isMuted ? "Unmute Voice" : "Mute Voice"}
                    >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>

                    <button onClick={runSimulation} className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 hover:bg-emerald-500/10 px-2 py-1 rounded border border-transparent hover:border-emerald-500/30 transition-all">
                        {isSimulating ? <Zap className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        {isSimulating ? "RUNNING..." : "TEST SWARM"}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative bg-[#0a0a0f]">
                {/* MODE 1: ARCHITECT */}
                {viewMode === 'architect' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-800">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-light text-white">Active Agents</h3>
                                <p className="text-white/40 text-xs">Manage the specialized units in your swarm.</p>
                            </div>
                            <button onClick={addNewAgent} className="flex items-center gap-2 px-3 py-1.5 bg-white text-black rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors uppercase tracking-wide">
                                <Plus className="w-3 h-3" /> Add Unit
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Queen Bee Card */}
                            <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/20 hover:border-amber-500/40 transition-all group">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-amber-500/10 rounded text-amber-500"><Layers className="w-4 h-4" /></div>
                                        <span className="font-semibold text-white tracking-tight">{botName}</span>
                                    </div>
                                    <span className="text-[9px] uppercase tracking-wider text-amber-500 font-mono">Orchestrator</span>
                                </div>
                                <div className="h-px w-full bg-amber-500/10 my-3" />
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-zinc-400">
                                        <span>Delegates to:</span>
                                        <span className="text-white">{agentsList.length} Agents</span>
                                    </div>
                                </div>
                            </div>

                            {/* Agents Cards */}
                            {agentsList.map((agent, i) => (
                                <div key={i} className="p-5 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-cyan-500/30 hover:bg-zinc-900/60 transition-all group">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-zinc-800 rounded text-zinc-400 group-hover:text-cyan-400 transition-colors"><Bot className="w-4 h-4" /></div>
                                            <span className="font-semibold text-white tracking-tight">{agent.name}</span>
                                        </div>
                                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono bg-zinc-900 px-2 py-1 rounded">Agent</span>
                                    </div>
                                    <div className="h-px w-full bg-white/5 my-3" />
                                    <div className="text-[10px] font-mono text-zinc-500 truncate bg-black/40 p-2 rounded border border-white/5">
                                        {agent.content.split('\n')[0].substring(0, 40)}...
                                    </div>
                                </div>
                            ))}

                            {/* Add Button */}
                            <button onClick={addNewAgent} className="p-5 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/20 transition-all flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300">
                                <Plus className="w-5 h-5 opacity-50" />
                                <span className="text-xs font-medium">Add New Agent Module</span>
                            </button>
                        </div>
                    </motion.div>
                )}

                <div className={cn("absolute inset-0 transition-opacity duration-300", viewMode === 'visual' ? "opacity-100 z-10" : "opacity-0 -z-10")}>
                    <ReactFlow
                        nodes={nodes.map(n => ({ ...n, type: 'pulse', data: { ...n.data, status: n.data.isActive ? 'active' : 'idle' } }))}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={{ pulse: PulseNode }}
                        fitView
                        className="bg-[#0a0a0f]"
                        defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
                    >
                        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#3f3f46" />
                    </ReactFlow>
                </div>

                {/* MODE 3: CODE */}
                <div className={cn("absolute inset-0 bg-[#0a0a0f] transition-opacity duration-300", viewMode === 'code' ? "opacity-100 z-10" : "opacity-0 -z-10")}>
                    <Editor
                        height="100%"
                        defaultLanguage="ruby"
                        value={code}
                        onChange={(val) => setCode(val || "")}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: true },
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', monospace",
                            padding: { top: 24 }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
