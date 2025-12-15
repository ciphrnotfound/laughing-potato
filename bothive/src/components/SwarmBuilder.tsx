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
import Editor from "@monaco-editor/react"; // REAL Monaco Editor
import { motion } from 'framer-motion';
import { Bot, Play, Plus, Cpu, Zap, Box, Layers, Terminal, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTheme } from '@/lib/theme-context';

// ============================================================================
// PARSER (Regex)
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
            {/* Cyber Glow */}
            {selected && (
                <div className="absolute -inset-[2px] bg-cyan-500 rounded-lg blur-[2px] opacity-100" />
            )}

            <div className={cn(
                "relative min-w-[240px] bg-[#09090b] border border-[#27272a] rounded-lg overflow-hidden shadow-2xl transition-all",
                selected ? "border-cyan-500/50" : "hover:border-white/20"
            )}>
                {/* Header Bar */}
                <div className="flex items-center justify-between px-3 py-2 bg-[#18181b] border-b border-[#27272a]">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            data.isActive ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-zinc-600"
                        )} />
                        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                            ID: {data.id?.substring(0, 4)}
                        </span>
                    </div>
                    <Bot className="w-3 h-3 text-zinc-500" />
                </div>

                {/* Content Body */}
                <div className="p-4">
                    <div className="flex items-start gap-4 mb-3">
                        <div className={cn(
                            "p-2.5 rounded bg-zinc-900 border border-zinc-800",
                            data.color || "text-cyan-400"
                        )}>
                            <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white font-mono tracking-tight">{data.label}</h3>
                            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wide">Autonomous Agent</p>
                        </div>
                    </div>

                    {/* Mini Terminal Preview */}
                    <div className="bg-[#000] border border-zinc-800 rounded p-2 font-mono text-[10px] text-zinc-400 h-[60px] overflow-hidden leading-relaxed opacity-80 relative">
                        <div className="absolute top-0 right-0 p-1 opacity-20"><Terminal className="w-3 h-3" /></div>
                        <span className="text-purple-400">agent</span> <span className="text-yellow-200">{data.label}</span>
                        <div className="opacity-70 mt-1">{data.codeSnippet?.substring(0, 60)}...</div>
                    </div>
                </div>

                {/* Status Footer */}
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

const INITIAL_CODE = `bot IvySwarm
  description "Elite Ivy League Essay Coaching System"

  agent Interviewer
    on input
      say "Tell me a story about failure."
    end
  end

  agent Strategist
    on input
      call analysis.structure with { text: input }
    end
  end

  agent Critic
    on input
      call analysis.style with { text: input }
    end
  end

  on input
    # Queen Bee Logic
    call agent.delegate with { agent: "Interviewer" }
  end
end`;

export default function SwarmBuilder() {
    return (
        <ReactFlowProvider>
            <SwarmBuilderInner />
        </ReactFlowProvider>
    );
}

function SwarmBuilderInner() {
    const [code, setCode] = useState(INITIAL_CODE);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [viewMode, setViewMode] = useState<'visual' | 'code' | 'architect'>('architect'); // Default to minimalist

    // Sync Code to Nodes (One-way for now in this effect)
    useEffect(() => {
        const agents = parseAgentsFromCode(code);
        // ... (Existing node mapping logic) ...
        const newNodes = agents.map((agent, index) => {
            const existingNode = nodes.find(n => n.id === agent.name);
            return {
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
            };
        });
        if (!newNodes.find(n => n.id === 'IvySwarm')) {
            newNodes.unshift({
                id: 'IvySwarm',
                type: 'agentNode',
                position: { x: 350, y: 0 },
                data: { id: 'IvySwarm', label: 'IvySwarm', role: 'Orchestrator', codeSnippet: 'on input...', color: "text-amber-400" }
            });
        }
        if (JSON.stringify(newNodes.map(n => n.id)) !== JSON.stringify(nodes.map(n => n.id))) {
            setNodes(newNodes);
            const newEdges = agents.map(a => ({
                id: `e-IvySwarm-${a.name}`,
                source: 'IvySwarm',
                target: a.name,
                animated: true,
                style: { stroke: '#06b6d4', strokeWidth: 1.5 },
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' }
            }));
            setEdges(newEdges);
        }
    }, [code]);

    const addNewAgent = () => {
        const newAgentName = `Agent_${Math.floor(Math.random() * 1000)}`;
        const newBlock = `\n  agent ${newAgentName}\n    on input\n      say "I am ready."\n    end\n  end`;
        const lastEndIndex = code.lastIndexOf('end');
        if (lastEndIndex !== -1) {
            const newCode = code.slice(0, lastEndIndex) + newBlock + "\n" + code.slice(lastEndIndex);
            setCode(newCode);
            toast.success("Agent Created");
        }
    };

    const runSimulation = async () => {
        setIsSimulating(true);
        const sequence = ['IvySwarm', ...nodes.filter(n => n.id !== 'IvySwarm').map(n => n.id)];
        for (const id of sequence) {
            setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, isActive: true } } : { ...n, data: { ...n.data, isActive: false } }));
            await new Promise(r => setTimeout(r, 800));
        }
        setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, isActive: false } })));
        setIsSimulating(false);
    };

    // Minimalist Architect View Components
    const agentsList = parseAgentsFromCode(code);

    return (
        <div className="flex flex-col h-full w-full bg-[#09090b] text-white font-sans overflow-hidden">
            {/* Top Navigation Bar */}
            <div className="h-14 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between px-6">
                <div className="flex items-center gap-2">
                    <Box className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold tracking-tight">Swarm Architect</span>
                </div>

                <div className="flex items-center gap-1 p-1 bg-[#27272a] rounded-lg">
                    <button onClick={() => setViewMode('architect')} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all", viewMode === 'architect' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white")}>Architect</button>
                    <button onClick={() => setViewMode('visual')} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all", viewMode === 'visual' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white")}>Visual Graph</button>
                    <button onClick={() => setViewMode('code')} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all", viewMode === 'code' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white")}>Source Code</button>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={runSimulation} className="text-xs font-mono text-emerald-400 flex items-center gap-2 hover:bg-emerald-500/10 px-3 py-1.5 rounded-md transition-colors">
                        {isSimulating ? <Zap className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        {isSimulating ? "RUNNING" : "TEST SWARM"}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative">

                {/* VIEW 1: ARCHITECT (Minimalist List) */}
                {viewMode === 'architect' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full max-w-4xl mx-auto p-8 overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-light text-white">Agent Roster</h2>
                                <p className="text-zinc-500 text-sm mt-1">Define your swarm's specialized agents.</p>
                            </div>
                            <button onClick={addNewAgent} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:scale-105 transition-transform">
                                <Plus className="w-4 h-4" /> New Agent
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Orchestrator Card */}
                            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-amber-500/20 hover:border-amber-500/40 transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Layers className="w-5 h-5" /></div>
                                        <span className="font-semibold text-lg">Ivy Swarm</span>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">Orchestrator</span>
                                </div>
                                <p className="text-sm text-zinc-400 leading-relaxed mb-4">The master controller. Routes user input to the appropriate specialist agent based on intent.</p>
                                <div className="text-xs font-mono text-zinc-600">ID: a0ee...</div>
                            </div>

                            {/* Dynamic Agents */}
                            {agentsList.map((agent, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="p-2 cursor-pointer hover:bg-zinc-800 rounded-lg text-zinc-400"><Code className="w-4 h-4" /></div>
                                    </div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-zinc-800 rounded-lg text-zinc-300"><Bot className="w-5 h-5" /></div>
                                        <span className="font-semibold text-lg">{agent.name}</span>
                                    </div>

                                    {/* Minimal Instruction Editor (Fake for visuals, but reflects code) */}
                                    <div className="bg-black/30 rounded-lg p-3 mb-3">
                                        <div className="flex items-center gap-2 mb-2 text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">
                                            <Terminal className="w-3 h-3" /> Instructions
                                        </div>
                                        <div className="text-zinc-400 text-sm font-mono truncate opacity-70">
                                            {agent.content.split('\n')[0]}...
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-4">
                                        <span className="text-[10px] text-zinc-500 px-2 py-1 bg-zinc-800/50 rounded-full">Automated</span>
                                        <span className="text-[10px] text-zinc-500 px-2 py-1 bg-zinc-800/50 rounded-full">HiveLang</span>
                                    </div>
                                </div>
                            ))}

                            {/* Empty State / Add New */}
                            <button onClick={addNewAgent} className="p-6 rounded-2xl border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/30 transition-all flex flex-col items-center justify-center gap-3 text-zinc-500 hover:text-zinc-300 group">
                                <div className="p-3 bg-zinc-900 rounded-full group-hover:scale-110 transition-transform"><Plus className="w-6 h-6" /></div>
                                <span className="font-medium text-sm">Add Specialist Agent</span>
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* VIEW 2: VISUAL GRAPH */}
                <div className={cn("absolute inset-0 transition-opacity duration-300", viewMode === 'visual' ? "opacity-100 z-10" : "opacity-0 -z-10")}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        fitView
                        className="bg-[#09090b]"
                        defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
                    >
                        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#3f3f46" />
                        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                            <div className="px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded text-[10px] text-zinc-400 font-mono">
                                GRAPH_VIEW: ACTIVE
                            </div>
                        </div>
                    </ReactFlow>
                </div>

                {/* VIEW 3: SOURCE CODE */}
                <div className={cn("absolute inset-0 bg-[#1e1e1e] transition-opacity duration-300 flex flex-col", viewMode === 'code' ? "opacity-100 z-10" : "opacity-0 -z-10")}>
                    <div className="h-full">
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
        </div>
    );
}
