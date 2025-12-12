import React, { useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Node,
    Edge,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
    {
        id: 'queen',
        type: 'input',
        data: { label: '👑 Queen Bee' },
        position: { x: 250, y: 0 },
        style: {
            background: '#F59E0B',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        },
    },
    {
        id: 'worker-1',
        data: { label: '🕵️ Researcher' },
        position: { x: 100, y: 150 },
        style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' },
    },
    {
        id: 'worker-2',
        data: { label: '✍️ Writer' },
        position: { x: 400, y: 150 },
        style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' },
    },
];

const initialEdges: Edge[] = [
    {
        id: 'e1-2',
        source: 'queen',
        target: 'worker-1',
        animated: true,
        style: { stroke: '#F59E0B' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#F59E0B' },
    },
    {
        id: 'e1-3',
        source: 'queen',
        target: 'worker-2',
        animated: true,
        style: { stroke: '#F59E0B' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#F59E0B' },
    },
];

export function SwarmCanvas() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    return (
        <div className="h-[600px] w-full border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-neutral-900">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
            >
                <Background color="#94a3b8" gap={16} />
                <Controls />
            </ReactFlow>
        </div>
    );
}
