"use client";

import React, { useState } from 'react';
import { AgentDefinition } from "@/lib/agentTypes";
import { Plus, Save, Bot, Brain, Sparkles } from 'lucide-react';

interface AgentBuilderProps {
    onSave: (agent: AgentDefinition) => void;
}

export default function AgentBuilder({ onSave }: AgentBuilderProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [skills, setSkills] = useState<string>("");
    const [memoryKeys, setMemoryKeys] = useState<string>("");

    const handleSave = () => {
        if (!name.trim()) return;

        const newAgent: AgentDefinition = {
            id: crypto.randomUUID(),
            name,
            description,
            skills: skills.split(',').map(s => s.trim()).filter(Boolean),
            memoryKeys: memoryKeys.split(',').map(s => s.trim()).filter(Boolean),
        };

        onSave(newAgent);

        // Reset form
        setName("");
        setDescription("");
        setSkills("");
        setMemoryKeys("");
    };

    return (
        <div className="space-y-6 text-white bg-black/50 p-6 rounded-xl border border-white/10">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400">
                    <Bot className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">New Agent Definition</h3>
                    <p className="text-white/50 text-sm">Define capabilities and memory access</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Agent Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="e.g. Researcher Bot"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors h-24"
                        placeholder="What is this agent's primary purpose?"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Skills (comma separated)</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="search, write_code, analyze_data"
                        />
                        <Sparkles className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Memory Keys (comma separated)</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={memoryKeys}
                            onChange={(e) => setMemoryKeys(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="user_preferences, current_task"
                        />
                        <Brain className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={!name.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all"
                >
                    <Save className="w-4 h-4" />
                    Save Agent
                </button>
            </div>
        </div>
    );
}
