'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Loader2, Database, FileText, Share2 } from 'lucide-react';
import { useTheme } from 'next-themes';

// Node Types
const NODE_TYPES = {
    kb: ({ data }: any) => (
        <div className="px-4 py-2 shadow-xl rounded-xl bg-violet-500/10 border-2 border-violet-500 backdrop-blur-md min-w-[150px] text-center">
            <div className="flex justify-center mb-1">
                <Database className="w-6 h-6 text-violet-500" />
            </div>
            <div className="font-bold text-sm text-foreground">{data.label}</div>
            <div className="text-[10px] text-muted-foreground">{data.count} docs</div>
        </div>
    ),
    doc: ({ data }: any) => (
        <div className="px-3 py-2 shadow-sm rounded-lg bg-card border border-border min-w-[120px] flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <div className="text-xs font-medium truncate max-w-[100px]">{data.label}</div>
        </div>
    ),
};

export default function KnowledgeGraphPage() {
    const { theme } = useTheme();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    useEffect(() => {
        fetchGraphData();
    }, []);

    const fetchGraphData = async () => {
        try {
            const res = await fetch('/api/knowledge/bases'); // Reuse existing API
            const data = await res.json();

            if (!data.kbs) return;

            const newNodes: Node[] = [];
            const newEdges: Edge[] = [];
            let yOffset = 0;

            // Simple layout algorithm
            data.kbs.forEach((kb: any, i: number) => {
                const kbId = `kb-${kb.id}`;
                const xPos = 250 * i;

                // KB Node
                newNodes.push({
                    id: kbId,
                    type: 'kb',
                    position: { x: xPos, y: 0 },
                    data: { label: kb.name, count: kb.documents?.[0]?.count || 0 }
                });

                // Simulate Document Nodes (Since standard API might not return all docs detail yet)
                // In a real scenario, we'd fetch docs for each KB
                const docCount = kb.documents?.[0]?.count || 0;
                for (let j = 0; j < Math.min(docCount, 5); j++) {
                    const docId = `doc-${kb.id}-${j}`;
                    newNodes.push({
                        id: docId,
                        type: 'doc',
                        position: { x: xPos + (j % 2 === 0 ? -50 : 50), y: 150 + (j * 60) },
                        data: { label: `Document ${j + 1}` }
                    });

                    newEdges.push({
                        id: `e-${kbId}-${docId}`,
                        source: kbId,
                        target: docId,
                        animated: true,
                        style: { stroke: '#8b5cf6' }
                    });
                }
            });

            setNodes(newNodes);
            setEdges(newEdges);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full bg-background relative overflow-hidden">
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Share2 className="w-6 h-6 text-violet-500" /> Knowledge Graph
                </h1>
                <p className="text-muted-foreground text-sm">Visualizing your HiveMind's neural pathways.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                </div>
            ) : (
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={NODE_TYPES}
                    fitView
                    attributionPosition="bottom-right"
                    className="bg-background"
                >
                    <Background color={theme === 'dark' ? '#333' : '#ddd'} gap={20} />
                    <Controls className="bg-card border-border fill-foreground" />
                    <MiniMap
                        nodeStrokeColor={(n) => {
                            if (n.type === 'kb') return '#8b5cf6';
                            return '#eee';
                        }}
                        nodeColor={(n) => {
                            if (n.type === 'kb') return '#8b5cf6';
                            return '#fff';
                        }}
                        className="bg-card border border-border"
                    />
                </ReactFlow>
            )}
        </div>
    );
}
