'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Upload, Database, Loader2, BookOpen, X, ArrowRight, Command } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';

// Types
interface KnowledgeBase {
    id: string;
    name: string;
    description: string;
    created_at: string;
    documents: { count: number }[];
}

export default function KnowledgePage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Create Form State
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');

    useEffect(() => {
        fetchKBs();
    }, []);

    const fetchKBs = async () => {
        try {
            const res = await fetch('/api/knowledge/bases');
            if (res.ok) {
                const data = await res.json();
                setKbs(data.kbs || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newName) {
            toast.error("Please give your brain a name");
            return;
        }
        try {
            const res = await fetch('/api/knowledge/bases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, description: newDesc })
            });
            if (res.ok) {
                toast.success('New Base Created');
                setShowCreateModal(false);
                setNewName('');
                setNewDesc('');
                fetchKBs();
            } else {
                toast.error('Failed to create base');
            }
        } catch (error) {
            toast.error('Connection Error');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, kbId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const toastId = toast.loading('Processing document...');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('kbId', kbId);

            const res = await fetch('/api/knowledge', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                toast.success('Document Added', { id: toastId });
                fetchKBs();
            } else {
                toast.error('Failed to upload', { id: toastId });
            }
        } catch (error) {
            toast.error('Upload failed', { id: toastId });
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="min-h-screen w-full bg-background p-6 md:p-12 font-sans relative">
            {/* Header Section - Vercel Style: Clean, Monochrome */}
            <div className="max-w-6xl mx-auto mb-16 pt-4 border-b border-border pb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight mb-2 text-foreground">
                            Knowledge Bases
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl font-normal">
                            Manage the context and memory for your AI agents.
                        </p>
                    </div>
                    {/* Only show "Add" button if we have KBs, otherwise Empty State handles it */}
                    {!loading && kbs.length > 0 && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-foreground text-background px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Base
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-50">
                        <Loader2 className="w-6 h-6 animate-spin mb-4" />
                        <span className="text-xs font-mono uppercase tracking-widest">Loading...</span>
                    </div>
                ) : kbs.length === 0 ? (
                    // EMPTY STATE - Minimalist
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-32 border border-dashed border-border rounded-xl bg-muted/20"
                    >
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                            <Command className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-medium mb-2 text-foreground">No Knowledge Bases</h2>
                        <p className="text-muted-foreground mb-8 max-w-sm text-center">
                            Create a knowledge base to start storing documents for your agents to reference.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-foreground text-background px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Create First Base
                        </button>
                    </motion.div>
                ) : (
                    // GRID - Dense, Information Focused
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {kbs.map((kb) => (
                            <motion.div
                                key={kb.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="group relative bg-card border border-border hover:border-foreground/20 rounded-xl p-6 transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 rounded-lg bg-muted text-foreground">
                                        <Database className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                        {kb.documents[0]?.count || 0} files
                                    </span>
                                </div>
                                
                                <h3 className="text-lg font-medium mb-2 text-foreground truncate">{kb.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-6 font-normal">
                                    {kb.description || "No description provided."}
                                </p>

                                <label className="w-full h-10 flex items-center justify-center gap-2 rounded-lg border border-input bg-transparent hover:bg-muted/50 transition-colors cursor-pointer text-sm font-medium text-foreground">
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept=".txt,.md,.pdf,.csv"
                                        onChange={(e) => handleFileUpload(e, kb.id)}
                                        disabled={uploading}
                                    />
                                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                    {uploading ? "Uploading..." : "Add Document"}
                                </label>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Overlay - FIXED Z-INDEX [9999] */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6"
                        >
                            <button 
                                onClick={() => setShowCreateModal(false)}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-semibold mb-1 text-foreground">Create Knowledge Base</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                Give your agents a new source of truth.
                            </p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</label>
                                    <input
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="e.g. Technical Documentation"
                                        className="w-full px-3 py-2 rounded-md border border-input bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description (Optional)</label>
                                    <textarea
                                        value={newDesc}
                                        onChange={(e) => setNewDesc(e.target.value)}
                                        placeholder="What does this knowledge base contain?"
                                        className="w-full px-3 py-2 rounded-md border border-input bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none h-24"
                                    />
                                </div>

                                <div className="pt-2 flex justify-end gap-2">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 rounded-md text-sm font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreate}
                                        disabled={!newName}
                                        className={cn(
                                            "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                            newName 
                                                ? "bg-foreground text-background hover:opacity-90" 
                                                : "bg-muted text-muted-foreground cursor-not-allowed"
                                        )}
                                    >
                                        Create Base
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
