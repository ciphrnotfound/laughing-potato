"use client";

import React, { useState, useCallback } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    NodeChange,
    EdgeChange,
    Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Play, Save, Zap } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

interface WorkflowNode extends Node {
    data: {
        label: string;
        tool?: string;
        config?: Record<string, any>;
        icon?: string;
    };
}

const initialNodes: WorkflowNode[] = [
    {
        id: '1',
        type: 'trigger',
        data: { label: 'Trigger', icon: '⚡' },
        position: { x: 250, y: 50 },
    },
];

const initialEdges: Edge[] = [];

export default function WorkflowBuilderPage() {
    const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds) as WorkflowNode[]),
        []
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect = useCallback(
        (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
        []
    );

    const addTrigger = () => {
        const newNode: WorkflowNode = {
            id: `trigger-${Date.now()}`,
            type: 'trigger',
            data: { label: 'New Trigger', icon: '🎯' },
            position: { x: Math.random() * 500, y: Math.random() * 300 },
        };
        setNodes((nds) => [...nds, newNode]);
    };

    const addAction = () => {
        const newNode: WorkflowNode = {
            id: `action-${Date.now()}`,
            type: 'action',
            data: { label: 'New Action', icon: '⚙️' },
            position: { x: Math.random() * 500, y: Math.random() * 300 + 100 },
        };
        setNodes((nds) => [...nds, newNode]);
    };

    const addCondition = () => {
        const newNode: WorkflowNode = {
            id: ` condition-${Date.now()}`,
            type: 'condition',
            data: { label: 'If/Then', icon: '🔀' },
            position: { x: Math.random() * 500, y: Math.random() * 300 + 200 },
        };
        setNodes((nds) => [...nds, newNode]);
    };

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <div className="bg-card/50 backdrop-blur-sm border-b border-border/50 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Zap className="w-6 h-6 text-primary" />
                        <h1 className="text-2xl font-bold">Workflow Builder</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-card hover:bg-muted rounded-lg transition-colors flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                            <Play className="w-4 h-4" />
                            Test Run
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex">
                {/* Sidebar - Tool Palette */}
                <div className="w-64 bg-card/30 backdrop-blur-sm border-r border-border/50 p-4 overflow-y-auto">
                    <h3 className="font-semibold mb-4">Add to Workflow</h3>

                    <div className="space-y-2">
                        <ToolPaletteItem
                            icon="⚡"
                            label="Trigger"
                            description="When this happens..."
                            onClick={addTrigger}
                        />
                        <ToolPaletteItem
                            icon="⚙️"
                            label="Action"
                            description="Do this..."
                            onClick={addAction}
                        />
                        <ToolPaletteItem
                            icon="🔀"
                            label="Condition"
                            description="If/then logic"
                            onClick={addCondition}
                        />
                    </div>

                    <div className="mt-6">
                        <h3 className="font-semibold mb-4">Popular HiveTools</h3>
                        <div className="space-y-2">
                            <HiveToolItem icon="🎵" name="TikTok" category="Social" />
                            <HiveToolItem icon="📺" name="YouTube" category="Social" />
                            <HiveToolItem icon="⚙️" name="GitHub" category="Developer" />
                            <HiveToolItem icon="📝" name="Notion" category="Productivity" />
                            <HiveToolItem icon="📊" name="Airtable" category="Data" />
                        </div>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 relative bg-gradient-to-br from-background via-background to-muted/10">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={(_, node) => setSelectedNode(node as WorkflowNode)}
                        fitView
                        nodeTypes={{
                            trigger: TriggerNode,
                            action: ActionNode,
                            condition: ConditionNode,
                        }}
                    >
                        <Background />
                        <Controls />
                    </ReactFlow>

                    {/* Empty State */}
                    {nodes.length <= 1 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center max-w-md">
                                <div className="text-6xl mb-4">🐝</div>
                                <h2 className="text-2xl font-bold mb-2">Build Your First Workflow</h2>
                                <p className="text-muted-foreground">
                                    Drag tools from the sidebar to create automated workflows.
                                    No coding required!
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel - Node Configuration */}
                {selectedNode && (
                    <div className="w-80 bg-card/30 backdrop-blur-sm border-l border-border/50 p-4 overflow-y-auto">
                        <h3 className="font-semibold mb-4">Configure {selectedNode.data.label}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Label</label>
                                <input
                                    type="text"
                                    value={selectedNode.data.label}
                                    onChange={(e) => {
                                        setNodes((nds) =>
                                            nds.map((n) =>
                                                n.id === selectedNode.id
                                                    ? { ...n, data: { ...n.data, label: e.target.value } }
                                                    : n
                                            )
                                        );
                                    }}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>

                            {selectedNode.type === 'action' && (
                                <>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Select HiveTool</label>
                                        <select className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                                            <option>Choose a tool...</option>
                                            <option>TikTok - Reply to Comment</option>
                                            <option>YouTube - Summarize Video</option>
                                            <option>GitHub - Create Issue</option>
                                            <option>Notion - Create Page</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Configuration</label>
                                        <textarea
                                            placeholder="Enter configuration JSON..."
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 h-32 font-mono text-sm"
                                        />
                                    </div>
                                </>
                            )}

                            <button className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors">
                                Delete Node
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ToolPaletteItem({ icon, label, description, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="w-full p-3 bg-card/50 hover:bg-card rounded-lg transition-colors text-left border border-border/30 hover:border-primary/50"
        >
            <div className="flex items-start gap-3">
                <div className="text-2xl">{icon}</div>
                <div>
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-muted-foreground">{description}</div>
                </div>
            </div>
        </button>
    );
}

function HiveToolItem({ icon, name, category }: any) {
    return (
        <div className="p-3 bg-card/30 rounded-lg text-sm">
            <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-xs text-muted-foreground">{category}</div>
                </div>
            </div>
        </div>
    );
}

// Custom Node Components
function TriggerNode({ data }: any) {
    return (
        <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg border-2 border-green-400">
            <div className="flex items-center gap-2">
                <span className="text-2xl">{data.icon}</span>
                <div>
                    <div className="text-xs opacity-80">TRIGGER</div>
                    <div className="font-semibold">{data.label}</div>
                </div>
            </div>
        </div>
    );
}

function ActionNode({ data }: any) {
    return (
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg border-2 border-blue-400">
            <div className="flex items-center gap-2">
                <span className="text-2xl">{data.icon}</span>
                <div>
                    <div className="text-xs opacity-80">ACTION</div>
                    <div className="font-semibold">{data.label}</div>
                </div>
            </div>
        </div>
    );
}

function ConditionNode({ data }: any) {
    return (
        <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl shadow-lg border-2 border-orange-400">
            <div className="flex items-center gap-2">
                <span className="text-2xl">{data.icon}</span>
                <div>
                    <div className="text-xs opacity-80">CONDITION</div>
                    <div className="font-semibold">{data.label}</div>
                </div>
            </div>
        </div>
    );
}
