"use client";

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import ReactFlow, {
    addEdge,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Node,
    Connection,
    BackgroundVariant,
    Panel,
    ReactFlowProvider,
    useReactFlow,
    Handle,
    Position,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    Layers,
    Settings,
    Play,
    Save,
    Database,
    Globe,
    MessageSquare,
    Mail,
    Search,
    Bot,
    Filter,
    Check,
    X,
    Sparkles,
    Code,
    FileText,
    Image,
    Webhook,
    Calendar,
    ShoppingCart,
    CreditCard,
    Cloud,
    Workflow,
    GitBranch,
    Repeat,
    Timer,
    MousePointer2,
    LucideIcon,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTheme } from '@/lib/theme-context';

// ============================================================================
// ICON MAP - Maps string IDs to Lucide components
// ============================================================================
const iconMap: Record<string, LucideIcon> = {
    zap: Zap,
    webhook: Webhook,
    calendar: Calendar,
    mail: Mail,
    filetext: FileText,
    sparkles: Sparkles,
    bot: Bot,
    filter: Filter,
    image: Image,
    code: Code,
    messagesquare: MessageSquare,
    creditcard: CreditCard,
    shoppingcart: ShoppingCart,
    gitbranch: GitBranch,
    repeat: Repeat,
    timer: Timer,
    database: Database,
    globe: Globe,
    cloud: Cloud,
    workflow: Workflow,
};

// Helper to get icon component for sidebar
const getIcon = (iconId: string) => {
    return iconMap[iconId] || Zap;
};

// ============================================================================
// CUSTOM NODE COMPONENT - Premium Glassmorphic Design
// ============================================================================
const WorkflowNode = ({ data, selected, id }: { data: any; selected: boolean; id: string }) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Get icon from map using string ID, fallback to Zap
    const IconComponent = iconMap[data.icon] || Zap;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={
                cn(
                    "relative group cursor-pointer",
                    "min-w-[220px] max-w-[280px]"
                )
            }
        >
            {/* Glow Effect on Selection */}
            {
                selected && (
                    <motion.div
                        layoutId={`glow-${id}`}
                        className={cn(
                            "absolute -inset-1 rounded-2xl opacity-60 blur-xl",
                            data.glowColor || "bg-violet-500"
                        )}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                    />
                )
            }

            {/* Main Card */}
            <div className={cn(
                "relative rounded-2xl border backdrop-blur-xl transition-all duration-300",
                "p-4",
                isDark
                    ? "bg-[#0f0f17]/90 border-white/[0.08]"
                    : "bg-white/90 border-black/[0.06] shadow-lg shadow-black/5",
                selected
                    ? isDark
                        ? "border-violet-500/50 shadow-[0_0_30px_rgba(139,92,246,0.15)]"
                        : "border-violet-500/50 shadow-xl shadow-violet-500/10"
                    : isDark
                        ? "hover:border-white/[0.15]"
                        : "hover:border-black/[0.12]"
            )}>
                {/* Input Handle */}
                <Handle
                    type="target"
                    position={Position.Top}
                    className={cn(
                        "!w-4 !h-4 !-top-2 !rounded-lg !border-2 transition-all duration-300",
                        isDark
                            ? "!bg-[#0f0f17] !border-violet-500/50"
                            : "!bg-white !border-violet-500/50",
                        "hover:!border-violet-500 hover:!scale-110"
                    )}
                />

                {/* Header Row */}
                <div className="flex items-start gap-3">
                    {/* Icon Container with Gradient */}
                    <div className={cn(
                        "relative flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden",
                        "bg-gradient-to-br shadow-lg",
                        data.gradient || "from-violet-500 to-purple-600"
                    )}>
                        <IconComponent className="w-5 h-5 text-white" />
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className={cn(
                            "text-sm font-semibold truncate",
                            isDark ? "text-white" : "text-black"
                        )}>
                            {data.label}
                        </h3>
                        <p className={cn(
                            "text-xs truncate mt-0.5",
                            isDark ? "text-white/50" : "text-black/50"
                        )}>
                            {data.description || data.category}
                        </p>
                    </div>
                </div>

                {/* Output Handle */}
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className={cn(
                        "!w-4 !h-4 !-bottom-2 !rounded-lg !border-2 transition-all duration-300",
                        isDark
                            ? "!bg-[#0f0f17] !border-violet-500/50"
                            : "!bg-white !border-violet-500/50",
                        "hover:!border-violet-500 hover:!scale-110"
                    )}
                />
            </div>
        </motion.div >
    );
};

const nodeTypes = {
    workflowNode: WorkflowNode,
};

// ============================================================================
// NODE TEMPLATES - Using string IDs for icons
// ============================================================================
const nodeCategories = [
    {
        id: 'triggers',
        name: 'Triggers',
        description: 'Start your workflow',
        icon: 'zap',
        nodes: [
            { id: 'webhook', label: 'Webhook', description: 'HTTP trigger', icon: 'webhook', gradient: 'from-amber-500 to-orange-500', glowColor: 'bg-amber-500' },
            { id: 'schedule', label: 'Schedule', description: 'Cron job', icon: 'calendar', gradient: 'from-orange-500 to-red-500', glowColor: 'bg-orange-500' },
            { id: 'email_trigger', label: 'New Email', description: 'Email received', icon: 'mail', gradient: 'from-rose-500 to-pink-500', glowColor: 'bg-rose-500' },
            { id: 'form_submit', label: 'Form Submit', description: 'Form completed', icon: 'filetext', gradient: 'from-cyan-500 to-blue-500', glowColor: 'bg-cyan-500' },
        ]
    },
    {
        id: 'ai',
        name: 'AI',
        description: 'AI-powered actions',
        icon: 'sparkles',
        nodes: [
            { id: 'gpt4', label: 'GPT-4', description: 'Generate text', icon: 'sparkles', gradient: 'from-violet-500 to-purple-600', glowColor: 'bg-violet-500' },
            { id: 'claude', label: 'Claude', description: 'AI assistant', icon: 'bot', gradient: 'from-orange-400 to-amber-500', glowColor: 'bg-orange-400' },
            { id: 'classifier', label: 'Classify', description: 'Categorize data', icon: 'filter', gradient: 'from-indigo-500 to-violet-500', glowColor: 'bg-indigo-500' },
            { id: 'summarize', label: 'Summarize', description: 'Extract key points', icon: 'filetext', gradient: 'from-purple-500 to-pink-500', glowColor: 'bg-purple-500' },
            { id: 'vision', label: 'Vision AI', description: 'Analyze images', icon: 'image', gradient: 'from-pink-500 to-rose-500', glowColor: 'bg-pink-500' },
            { id: 'code_gen', label: 'Code Gen', description: 'Generate code', icon: 'code', gradient: 'from-emerald-500 to-teal-500', glowColor: 'bg-emerald-500' },
        ]
    },
    {
        id: 'integrations',
        name: 'Apps',
        description: 'Connect services',
        icon: 'cloud',
        nodes: [
            { id: 'gmail', label: 'Gmail', description: 'Send email', icon: 'mail', gradient: 'from-red-500 to-rose-500', glowColor: 'bg-red-500' },
            { id: 'slack', label: 'Slack', description: 'Send message', icon: 'messagesquare', gradient: 'from-purple-600 to-pink-500', glowColor: 'bg-purple-600' },
            { id: 'notion', label: 'Notion', description: 'Update page', icon: 'filetext', gradient: 'from-gray-700 to-gray-900', glowColor: 'bg-gray-700' },
            { id: 'stripe', label: 'Stripe', description: 'Payment action', icon: 'creditcard', gradient: 'from-indigo-500 to-purple-500', glowColor: 'bg-indigo-500' },
            { id: 'shopify', label: 'Shopify', description: 'E-commerce', icon: 'shoppingcart', gradient: 'from-green-500 to-emerald-500', glowColor: 'bg-green-500' },
        ]
    },
    {
        id: 'logic',
        name: 'Logic',
        description: 'Control flow',
        icon: 'gitbranch',
        nodes: [
            { id: 'condition', label: 'Condition', description: 'If/else branch', icon: 'gitbranch', gradient: 'from-emerald-500 to-green-500', glowColor: 'bg-emerald-500' },
            { id: 'loop', label: 'Loop', description: 'Repeat action', icon: 'repeat', gradient: 'from-teal-500 to-cyan-500', glowColor: 'bg-teal-500' },
            { id: 'delay', label: 'Delay', description: 'Wait time', icon: 'timer', gradient: 'from-sky-500 to-blue-500', glowColor: 'bg-sky-500' },
            { id: 'filter_data', label: 'Filter', description: 'Filter data', icon: 'filter', gradient: 'from-blue-500 to-indigo-500', glowColor: 'bg-blue-500' },
        ]
    },
    {
        id: 'data',
        name: 'Data',
        description: 'Work with data',
        icon: 'database',
        nodes: [
            { id: 'database', label: 'Database', description: 'Query DB', icon: 'database', gradient: 'from-cyan-500 to-blue-500', glowColor: 'bg-cyan-500' },
            { id: 'http', label: 'HTTP Request', description: 'API call', icon: 'globe', gradient: 'from-green-500 to-emerald-500', glowColor: 'bg-green-500' },
            { id: 'transform', label: 'Transform', description: 'Modify data', icon: 'code', gradient: 'from-yellow-500 to-orange-500', glowColor: 'bg-yellow-500' },
        ]
    }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
interface VisualWorkflowBuilderProps {
    workflowId?: string;
    onBack?: () => void;
}

export default function VisualWorkflowBuilder({ workflowId, onBack }: VisualWorkflowBuilderProps) {
    return (
        <ReactFlowProvider>
            <WorkflowBuilderInner workflowId={workflowId} onBack={onBack} />
        </ReactFlowProvider>
    );
}

function WorkflowBuilderInner({ workflowId, onBack }: VisualWorkflowBuilderProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const reactFlowInstance = useReactFlow();
    const wrapperRef = useRef<HTMLDivElement>(null);

    // State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [workflowName, setWorkflowName] = useState('Untitled Swarm');
    const [workflowDescription, setWorkflowDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(workflowId || null);
    const [activeCategory, setActiveCategory] = useState(nodeCategories[0].id);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);
    const [realUserBots, setRealUserBots] = useState<any[]>([]);

    // Load available data (Integrations + Bots)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Integrations
                const intRes = await fetch('/api/integrations/status');
                if (intRes.ok) {
                    const data = await intRes.json();
                    setConnectedIntegrations(data.connected || []);
                }

                // 2. Real Bots (for "AI" category)
                const botsRes = await fetch('/api/bots');
                if (botsRes.ok) {
                    const data = await botsRes.json();
                    if (data.bots) {
                        setRealUserBots(data.bots);
                    }
                }
            } catch (err) {
                console.error('Failed to init dashboard data', err);
            }
        };
        fetchData();
    }, []);

    // Merge real bots into categories
    const dynamicNodeCategories = useMemo(() => {
        return nodeCategories.map(category => {
            // Replace Mock AI nodes with Real Bots
            if (category.id === 'ai') {
                // Create nodes for user's bots
                const botNodes = realUserBots.map(bot => ({
                    id: bot.id, // Real UUID
                    label: bot.name,
                    description: bot.description || 'User created bot',
                    icon: 'bot',
                    gradient: 'from-violet-500 to-purple-600',
                    glowColor: 'bg-violet-500',
                    data: { ...bot } // Store full bot data
                }));

                // Fallback if no bots exist yet
                if (botNodes.length === 0) {
                    return {
                        ...category,
                        nodes: [
                            { id: 'create_new_bot', label: 'Create New Bot...', description: 'Go to Marketplace', icon: 'zap', gradient: 'from-gray-500 to-gray-600', glowColor: 'bg-gray-500' },
                            ...category.nodes
                        ]
                    };
                }

                return {
                    ...category,
                    nodes: botNodes // Use ONLY real bots (or maybe keep standard ones too?)
                };
            }
            return category;
        });
    }, [nodeCategories, realUserBots]);

    // Update filter logic to use dynamic list
    const filteredCategories = useMemo(() => {
        const cats = dynamicNodeCategories; // Use the dynamic one
        if (!searchQuery) return cats;

        return cats.map(cat => ({
            ...cat,
            nodes: cat.nodes.filter(node =>
                node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                node.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(cat => cat.nodes.length > 0);
    }, [searchQuery, dynamicNodeCategories]);

    // Load workflow if editing existing one
    useEffect(() => {
        if (workflowId && workflowId !== 'new') {
            loadWorkflow(workflowId);
        }
    }, [workflowId]);

    // Track changes
    useEffect(() => {
        if (nodes.length > 0 || edges.length > 0) {
            setHasUnsavedChanges(true);
        }
    }, [nodes, edges]);

    // Edge styling
    const defaultEdgeOptions = useMemo(() => ({
        type: 'smoothstep',
        animated: true,
        style: {
            stroke: isDark ? '#8b5cf6' : '#7c3aed',
            strokeWidth: 2,
        },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isDark ? '#8b5cf6' : '#7c3aed',
        },
    }), [isDark]);

    // Load workflow from API
    const loadWorkflow = async (id: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/workflows/${id}`);
            if (response.ok) {
                const { workflow } = await response.json();
                setWorkflowName(workflow.name || 'Untitled Workflow');
                setWorkflowDescription(workflow.description || '');
                setCurrentWorkflowId(workflow.id);

                // Load nodes and edges from configuration
                if (workflow.configuration) {
                    if (workflow.configuration.nodes) {
                        setNodes(workflow.configuration.nodes);
                    }
                    if (workflow.configuration.edges) {
                        setEdges(workflow.configuration.edges);
                    }
                }
                setHasUnsavedChanges(false);
                toast.success('Workflow loaded');
            } else {
                toast.error('Failed to load workflow');
            }
        } catch (error) {
            console.error('Error loading workflow:', error);
            toast.error('Failed to load workflow');
        } finally {
            setLoading(false);
        }
    };

    // Save workflow to API
    const saveWorkflow = async () => {
        setSaving(true);
        try {
            const configuration = { nodes, edges };

            if (currentWorkflowId && currentWorkflowId !== 'new') {
                // Update existing workflow
                const response = await fetch(`/api/workflows/${currentWorkflowId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: workflowName,
                        description: workflowDescription,
                        configuration,
                    }),
                });

                if (response.ok) {
                    setHasUnsavedChanges(false);
                    toast.success('Workflow saved!');
                } else {
                    throw new Error('Failed to save');
                }
            } else {
                // Create new workflow
                const response = await fetch('/api/workflows', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: workflowName,
                        description: workflowDescription || 'Created in Visual Builder',
                        configuration,
                    }),
                });

                if (response.ok) {
                    const { workflow } = await response.json();
                    setCurrentWorkflowId(workflow.id);
                    setHasUnsavedChanges(false);
                    toast.success('Workflow created!');
                } else {
                    throw new Error('Failed to create');
                }
            }
        } catch (error) {
            console.error('Error saving workflow:', error);
            toast.error('Failed to save swarm');
        } finally {
            setSaving(false);
        }
    };



    // Drag handlers
    const onDragStart = (event: React.DragEvent, nodeData: any, category: string) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({ ...nodeData, category }));
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();

        if (!wrapperRef.current) return;

        const bounds = wrapperRef.current.getBoundingClientRect();
        const dataStr = event.dataTransfer.getData('application/reactflow');

        if (!dataStr) return;

        const nodeData = JSON.parse(dataStr);
        const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top,
        });

        const newNode: Node = {
            id: `${nodeData.id}-${Date.now()}`,
            type: 'workflowNode',
            position,
            data: nodeData,
        };

        setNodes((nds) => [...nds, newNode]);
        toast.success(`Added ${nodeData.label}`);
    }, [reactFlowInstance, setNodes]);

    const onConnect = useCallback((params: Connection) => {
        setEdges((eds) => addEdge({ ...params, ...defaultEdgeOptions }, eds));
    }, [setEdges, defaultEdgeOptions]);

    const runWorkflow = async () => {
        if (nodes.length === 0) {
            toast.error('Add some nodes first!');
            return;
        }

        // Save first if there are unsaved changes
        if (hasUnsavedChanges) {
            await saveWorkflow();
        }

        toast.success('Swarm simulation started! Logic is flowing...');

        try {
            const response = await fetch('/api/swarm/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include authentication cookies
                body: JSON.stringify({ nodes, edges }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`Execution Complete: ${data.executionTime}`);
                data.logs.forEach((log: string, index: number) => {
                    setTimeout(() => toast.message(log), index * 500);
                });
            } else {
                toast.error('Execution failed');
            }
        } catch (error) {
            console.error('Execution error:', error);
            toast.error('Failed to contact Swarm Engine');
        }
    };

    if (loading) {
        return (
            <div className={cn(
                "flex h-[calc(100vh-140px)] w-full items-center justify-center rounded-2xl border",
                isDark ? "bg-[#08080c] border-white/[0.06]" : "bg-gray-50 border-black/[0.06]"
            )}>
                <div className="text-center">
                    <Loader2 className={cn("w-8 h-8 animate-spin mx-auto mb-4", isDark ? "text-white/50" : "text-black/50")} />
                    <p className={isDark ? "text-white/50" : "text-black/50"}>Loading swarm...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "flex h-[calc(100vh-140px)] w-full gap-0 rounded-2xl overflow-hidden border",
            isDark ? "bg-[#08080c] border-white/[0.06]" : "bg-gray-50 border-black/[0.06]"
        )}>
            {/* ================================================================ */}
            {/* SIDEBAR - Node Palette */}
            {/* ================================================================ */}
            <AnimatePresence mode="wait">
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={cn(
                            "flex-shrink-0 flex flex-col border-r overflow-hidden",
                            isDark ? "bg-[#0a0a0f] border-white/[0.06]" : "bg-white border-black/[0.06]"
                        )}
                    >
                        {/* Sidebar Header */}
                        <div className={cn(
                            "p-4 border-b",
                            isDark ? "border-white/[0.06]" : "border-black/[0.06]"
                        )}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "p-1.5 rounded-lg",
                                        isDark ? "bg-violet-500/10" : "bg-violet-50"
                                    )}>
                                        <Layers className="w-4 h-4 text-violet-500" />
                                    </div>
                                    <span className={cn("font-semibold text-sm", isDark ? "text-white" : "text-black")}>
                                        Components
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        "p-1.5 rounded-lg transition-colors",
                                        isDark ? "hover:bg-white/5 text-white/50" : "hover:bg-black/5 text-black/50"
                                    )}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className={cn(
                                    "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                                    isDark ? "text-white/40" : "text-black/40"
                                )} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search components..."
                                    className={cn(
                                        "w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all border",
                                        isDark
                                            ? "bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/40 focus:border-violet-500/50"
                                            : "bg-black/[0.02] border-black/[0.08] text-black placeholder:text-black/40 focus:border-violet-500"
                                    )}
                                />
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div className={cn(
                            "flex gap-1 p-2 border-b overflow-x-auto scrollbar-hide",
                            isDark ? "border-white/[0.06]" : "border-black/[0.06]"
                        )}>
                            {nodeCategories.map((cat) => {
                                const CatIcon = getIcon(cat.icon);
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                                            activeCategory === cat.id
                                                ? isDark
                                                    ? "bg-violet-500/15 text-violet-400"
                                                    : "bg-violet-100 text-violet-700"
                                                : isDark
                                                    ? "text-white/50 hover:text-white/70 hover:bg-white/5"
                                                    : "text-black/50 hover:text-black/70 hover:bg-black/5"
                                        )}
                                    >
                                        <CatIcon className="w-3.5 h-3.5" />
                                        {cat.name}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Nodes List */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {/* Drag hint */}
                            <div className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-3",
                                isDark ? "bg-white/[0.03] text-white/50" : "bg-black/[0.02] text-black/50"
                            )}>
                                <MousePointer2 className="w-3.5 h-3.5" />
                                <span>Drag components to canvas</span>
                            </div>

                            {(searchQuery ? filteredCategories : dynamicNodeCategories.filter(c => c.id === activeCategory)).map((category) => (
                                <div key={category.id}>
                                    {searchQuery && (
                                        <div className={cn(
                                            "text-xs font-medium mb-2 px-1",
                                            isDark ? "text-white/50" : "text-black/50"
                                        )}>
                                            {category.name}
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                        {category.nodes.map((node) => {
                                            const NodeIcon = getIcon(node.icon);
                                            return (
                                                <motion.div
                                                    key={node.id}
                                                    draggable
                                                    onDragStart={(e) => onDragStart(e as any, node, category.name)}
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={cn(
                                                        "relative p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all group",
                                                        isDark
                                                            ? "bg-white/[0.02] border-white/[0.08] hover:border-violet-500/30 hover:bg-white/[0.04]"
                                                            : "bg-white border-black/[0.06] hover:border-violet-500/30 hover:shadow-md shadow-sm"
                                                    )}
                                                >
                                                    {/* Icon */}
                                                    <div className={cn(
                                                        "w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 bg-gradient-to-br shadow-lg group-hover:scale-105 transition-transform",
                                                        node.gradient
                                                    )}>
                                                        <NodeIcon className="w-4 h-4 text-white" />
                                                    </div>

                                                    {/* Text */}
                                                    <div className={cn(
                                                        "text-xs font-semibold truncate",
                                                        isDark ? "text-white" : "text-black"
                                                    )}>
                                                        <div className="flex items-center gap-1.5">
                                                            {node.label}
                                                            {category.id === 'integrations' && connectedIntegrations.includes(node.id.toLowerCase()) && (
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Connected" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={cn(
                                                        "text-[10px] truncate mt-0.5",
                                                        isDark ? "text-white/50" : "text-black/50"
                                                    )}>
                                                        {node.description}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* ================================================================ */}
            {/* CANVAS AREA */}
            {/* ================================================================ */}
            <div
                ref={wrapperRef}
                className="flex-1 relative"
                onDragOver={onDragOver}
                onDrop={onDrop}
            >
                {/* Subtle gradient background */}
                <div className={cn(
                    "absolute inset-0 pointer-events-none",
                    isDark
                        ? "bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.03)_0%,transparent_70%)]"
                        : "bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.04)_0%,transparent_70%)]"
                )} />

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
                    fitView
                    className="!bg-transparent"
                    proOptions={{ hideAttribution: true }}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={20}
                        size={1}
                        color={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}
                    />

                    <Controls
                        className={cn(
                            "!border !rounded-xl !overflow-hidden !shadow-lg",
                            isDark
                                ? "!bg-[#0f0f17] !border-white/[0.08] [&>button]:!bg-transparent [&>button]:!border-white/[0.08] [&>button]:!text-white/60 [&>button:hover]:!bg-white/5"
                                : "!bg-white !border-black/[0.08] [&>button]:!bg-transparent [&>button]:!border-black/[0.08] [&>button]:!text-black/60 [&>button:hover]:!bg-black/5"
                        )}
                    />

                    <MiniMap
                        className={cn(
                            "!border !rounded-xl !overflow-hidden !shadow-lg",
                            isDark ? "!bg-[#0f0f17] !border-white/[0.08]" : "!bg-white !border-black/[0.08]"
                        )}
                        nodeColor={isDark ? '#8b5cf6' : '#7c3aed'}
                        maskColor={isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'}
                    />

                    {/* ============================================================ */}
                    {/* TOP TOOLBAR */}
                    {/* ============================================================ */}
                    <Panel position="top-center" className="!m-4">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={cn(
                                "flex items-center gap-2 p-2 rounded-2xl border backdrop-blur-xl shadow-2xl",
                                isDark
                                    ? "bg-[#0a0a0f]/80 border-white/[0.08]"
                                    : "bg-white/80 border-black/[0.08]"
                            )}
                        >
                            {/* Toggle Sidebar */}
                            {!sidebarOpen && (
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className={cn(
                                        "p-2 rounded-xl transition-all border-r mr-1",
                                        isDark
                                            ? "hover:bg-white/5 text-white/60 border-white/[0.08]"
                                            : "hover:bg-black/5 text-black/60 border-black/[0.08]"
                                    )}
                                >
                                    <Layers className="w-4 h-4" />
                                </button>
                            )}

                            {/* Workflow Name Input */}
                            <input
                                type="text"
                                value={workflowName}
                                onChange={(e) => setWorkflowName(e.target.value)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-sm font-medium bg-transparent outline-none w-48 transition-all border border-transparent",
                                    isDark
                                        ? "text-white hover:bg-white/5 focus:bg-white/5 focus:border-violet-500/30"
                                        : "text-black hover:bg-black/5 focus:bg-black/5 focus:border-violet-500/50"
                                )}
                            />

                            {/* Unsaved indicator */}
                            {hasUnsavedChanges && (
                                <div className={cn(
                                    "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs",
                                    isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600"
                                )}>
                                    <AlertCircle className="w-3 h-3" />
                                    Unsaved
                                </div>
                            )}

                            <div className={cn(
                                "w-px h-6",
                                isDark ? "bg-white/[0.08]" : "bg-black/[0.08]"
                            )} />

                            {/* Save Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={saveWorkflow}
                                disabled={saving}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                                    isDark
                                        ? "bg-white text-black hover:bg-white/90"
                                        : "bg-black text-white hover:bg-black/90",
                                    saving && "opacity-50"
                                )}
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {saving ? 'Saving...' : 'Save'}
                            </motion.button>

                            {/* Run Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={runWorkflow}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                                    isDark
                                        ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                        : "border-emerald-500/50 text-emerald-600 hover:bg-emerald-50"
                                )}
                            >
                                <Play className="w-4 h-4" />
                                Test Run
                            </motion.button>

                            {/* Settings */}
                            <button className={cn(
                                "p-2 rounded-xl transition-all",
                                isDark
                                    ? "hover:bg-white/5 text-white/50"
                                    : "hover:bg-black/5 text-black/50"
                            )}>
                                <Settings className="w-4 h-4" />
                            </button>
                        </motion.div>
                    </Panel>

                    {/* Empty State / Autopilot */}
                    {nodes.length === 0 && (
                        <Panel position="bottom-center" className="pointer-events-none mb-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center pointer-events-auto"
                            >
                                <div className={cn(
                                    "w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center backdrop-blur-xl border shadow-xl",
                                    isDark ? "bg-[#0f0f17]/80 border-white/[0.08]" : "bg-white/80 border-black/[0.08]"
                                )}>
                                    <Sparkles className={cn(
                                        "w-10 h-10",
                                        isDark ? "text-violet-400" : "text-violet-600"
                                    )} />
                                </div>
                                <h3 className={cn(
                                    "text-xl font-semibold mb-2",
                                    isDark ? "text-white" : "text-black"
                                )}>
                                    What should the swarm do?
                                </h3>
                                <p className={cn(
                                    "text-sm mb-6 max-w-sm mx-auto",
                                    isDark ? "text-white/50" : "text-black/50"
                                )}>
                                    Describe a goal and I'll draft the workflow for you.
                                </p>

                                {/* Autopilot Input */}
                                <div className="relative max-w-md mx-auto group">
                                    <div className={cn(
                                        "absolute -inset-0.5 rounded-xl opacity-75 blur transition duration-1000 group-hover:duration-200",
                                        "bg-gradient-to-r from-violet-600 to-indigo-600"
                                    )} />
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            placeholder="e.g. Monitor prices and slack me..."
                                            className={cn(
                                                "w-full px-4 py-3.5 rounded-xl outline-none text-sm transition-all shadow-xl",
                                                isDark
                                                    ? "bg-[#0f0f17] text-white placeholder:text-white/30"
                                                    : "bg-white text-black placeholder:text-black/30"
                                            )}
                                            onKeyDown={async (e) => {
                                                if (e.key === 'Enter') {
                                                    const val = e.currentTarget.value;
                                                    if (!val) return;

                                                    const toastId = toast.loading("Autopilot is thinking...");

                                                    try {
                                                        const res = await fetch('/api/swarm/autopilot', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            credentials: 'include', // Include authentication cookies
                                                            body: JSON.stringify({
                                                                goal: val,
                                                                availableBots: realUserBots,
                                                                availableIntegrations: connectedIntegrations
                                                            })
                                                        });

                                                        if (!res.ok) throw new Error("Failed to generate");

                                                        const { blueprint } = await res.json();

                                                        if (blueprint && blueprint.nodes && blueprint.edges) {
                                                            setNodes(blueprint.nodes);
                                                            setEdges(blueprint.edges);
                                                            toast.success("Swarm constructed!", { id: toastId });
                                                        } else {
                                                            toast.error("AI returned invalid structure", { id: toastId });
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        toast.error("Autopilot failed to connect", { id: toastId });
                                                    }
                                                }
                                            }}
                                        />
                                        <button className="absolute right-2 p-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors">
                                            <Sparkles className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </Panel>
                    )}
                </ReactFlow>
            </div>
        </div>
    );
}
