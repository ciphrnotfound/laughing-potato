import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Node,
    Edge,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    MarkerType,
    NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PulseNode } from './PulseNode';
import { Button } from '@/components/ui/button';
import { Play, RotateCw } from 'lucide-react';

const nodeTypes: NodeTypes = {
    pulse: PulseNode,
};

const initialNodes: Node[] = [
    {
        id: 'router',
        type: 'pulse',
        data: { label: 'Swarm Router', icon: 'brain', role: 'Orchestrator' },
        position: { x: 300, y: 50 },
    },
    {
        id: 'research',
        type: 'pulse',
        data: { label: 'Deep Research', icon: 'database', role: 'Analyst' },
        position: { x: 100, y: 250 },
    },
    {
        id: 'coder',
        type: 'pulse',
        data: { label: 'Polyglot Coder', icon: 'code', role: 'Engineer' },
        position: { x: 500, y: 250 },
    },
    {
        id: 'reviewer',
        type: 'pulse',
        data: { label: 'Code Reviewer', icon: 'terminal', role: 'QA' },
        position: { x: 300, y: 450 },
    },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: 'router', target: 'research', animated: true, style: { stroke: '#e4e4e7', strokeWidth: 2 } },
    { id: 'e1-3', source: 'router', target: 'coder', animated: true, style: { stroke: '#e4e4e7', strokeWidth: 2 } },
    { id: 'e3-4', source: 'coder', target: 'reviewer', animated: true, style: { stroke: '#e4e4e7', strokeWidth: 2 } },
    { id: 'e2-4', source: 'research', target: 'reviewer', animated: true, style: { stroke: '#e4e4e7', strokeWidth: 2 } },
];

export function SwarmCanvas() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [isSimulating, setIsSimulating] = useState(false);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#e4e4e7', strokeWidth: 2 } }, eds)),
        [setEdges],
    );

    const runSimulation = async () => {
        setIsSimulating(true);

        // Reset
        setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle', thought: '' } })));
        setEdges(eds => eds.map(e => ({ ...e, style: { ...e.style, stroke: '#e4e4e7', strokeWidth: 2 }, animated: false })));

        const sequence = [
            { id: 'router', status: 'thinking', thought: 'Analyzing user request...', duration: 1500 },
            { id: 'router', status: 'active', thought: 'Delegating tasks...' },
            {
                parallel: true, actions: [
                    { id: 'research', status: 'thinking', thought: 'Searching internal docs...', duration: 2500, edge: 'e1-2' },
                    { id: 'coder', status: 'thinking', thought: 'Generating boilerplate...', duration: 2000, edge: 'e1-3' }
                ]
            },
            { id: 'coder', status: 'active', thought: 'Code generated.' },
            { id: 'research', status: 'active', thought: 'Context retrieved.' },
            { id: 'reviewer', status: 'thinking', thought: 'Validating output...', duration: 1500, edge: ['e3-4', 'e2-4'] },
            { id: 'reviewer', status: 'active', thought: 'Check passed!' },
        ];

        for (const step of sequence) {
            if (step.parallel && step.actions) {
                await Promise.all(step.actions.map(async (action) => {
                    setNodes(nds => nds.map(n => n.id === action.id ? { ...n, data: { ...n.data, status: action.status, thought: action.thought } } : n));
                    if (action.edge) {
                        const edgeIds = Array.isArray(action.edge) ? action.edge : [action.edge];
                        setEdges(eds => eds.map(e => edgeIds.includes(e.id) ? { ...e, animated: true, style: { ...e.style, stroke: '#a855f7', strokeWidth: 3 } } : e));
                    }
                    if (action.duration) await new Promise(r => setTimeout(r, action.duration));
                }));
            } else {
                setNodes(nds => nds.map(n => n.id === step.id ? { ...n, data: { ...n.data, status: step.status, thought: step.thought } } : n));
                if (step.duration) await new Promise(r => setTimeout(r, step.duration));
            }
        }

        setIsSimulating(false);
        // Reset styling after a delay
        setTimeout(() => {
            setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle', thought: '' } })));
            setEdges(eds => eds.map(e => ({ ...e, style: { ...e.style, stroke: '#e4e4e7', strokeWidth: 2 }, animated: false })));
        }, 3000);
    };

    return (
        <div className="h-[600px] w-full border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-neutral-950 relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button
                    size="sm"
                    onClick={runSimulation}
                    disabled={isSimulating}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20"
                >
                    {isSimulating ? <RotateCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2 fill-current" />}
                    {isSimulating ? 'Simulating Swarm...' : 'Test Swarm Neurology'}
                </Button>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-dots-pattern"
            >
                <Background color="#94a3b8" gap={20} size={1} />
                <Controls className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 fill-zinc-500" />
            </ReactFlow>
        </div>
    );
}
