"use client";

import React, { useState } from "react";
import { Plus, Trash2, Save, Code, Wand2 } from "lucide-react";
import { AgentDefinition } from "@/lib/agentTypes";

interface AgentBuilderProps {
  onSave?: (agent: AgentDefinition) => void;
}

export default function AgentBuilder({ onSave }: AgentBuilderProps) {
  const [agent, setAgent] = useState<Partial<AgentDefinition>>({
    name: "",
    description: "",
    skills: [],
    memoryKeys: [],
  });
  const [newSkill, setNewSkill] = useState("");
  const [newMemoryKey, setNewMemoryKey] = useState("");
  const [mode, setMode] = useState<"visual" | "code">("visual");

  const addSkill = () => {
    if (newSkill.trim()) {
      setAgent((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    setAgent((prev) => ({
      ...prev,
      skills: prev.skills?.filter((_, i) => i !== index) || [],
    }));
  };

  const addMemoryKey = () => {
    if (newMemoryKey.trim()) {
      setAgent((prev) => ({
        ...prev,
        memoryKeys: [...(prev.memoryKeys || []), newMemoryKey.trim()],
      }));
      setNewMemoryKey("");
    }
  };

  const removeMemoryKey = (index: number) => {
    setAgent((prev) => ({
      ...prev,
      memoryKeys: prev.memoryKeys?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSave = async () => {
    if (!agent.name || !agent.name.trim()) {
      alert("Please provide an agent name");
      return;
    }

    const fullAgent: AgentDefinition = {
      id: `agent-${Date.now()}`,
      name: agent.name,
      description: agent.description || "",
      skills: agent.skills || [],
      memoryKeys: agent.memoryKeys || [],
    };

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullAgent),
      });

      if (response.ok) {
        onSave?.(fullAgent);
        alert("Agent saved successfully!");
        setAgent({ name: "", description: "", skills: [], memoryKeys: [] });
      }
    } catch (error) {
      console.error("Failed to save agent:", error);
      alert("Failed to save agent");
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 rounded-lg bg-white/5 border border-white/10">
        <button
          onClick={() => setMode("visual")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition ${
            mode === "visual"
              ? "bg-white text-black"
              : "text-white/70 hover:text-white"
          }`}
        >
          <Wand2 className="w-4 h-4" />
          Visual Builder
        </button>
        <button
          onClick={() => setMode("code")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition ${
            mode === "code"
              ? "bg-white text-black"
              : "text-white/70 hover:text-white"
          }`}
        >
          <Code className="w-4 h-4" />
          SDK/Code
        </button>
      </div>

      {mode === "visual" ? (
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Agent Name</label>
              <input
                type="text"
                value={agent.name}
                onChange={(e) => setAgent((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Research Assistant"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={agent.description}
                onChange={(e) => setAgent((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="What does this agent do?"
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 resize-none"
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium mb-2">Skills</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSkill()}
                placeholder="e.g., web_search, code_generation"
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
              />
              <button
                onClick={addSkill}
                aria-label="Add skill"
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {agent.skills?.map((skill, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(i)}
                    className="hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Memory Keys */}
          <div>
            <label className="block text-sm font-medium mb-2">Memory Keys (for context)</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newMemoryKey}
                onChange={(e) => setNewMemoryKey(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addMemoryKey()}
                placeholder="e.g., user_preferences, project_context"
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
              />
              <button
                onClick={addMemoryKey}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {agent.memoryKeys?.map((key, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-sm"
                >
                  {key}
                  <button
                    onClick={() => removeMemoryKey(i)}
                    className="hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">SDK Code</label>
            <pre className="p-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 overflow-x-auto">
{`import { Bothive } from '@bothive/sdk';

const agent = new Bothive.Agent({
  name: "${agent.name || "MyAgent"}",
  description: "${agent.description || ""}",
  skills: ${JSON.stringify(agent.skills || [], null, 2)},
  memoryKeys: ${JSON.stringify(agent.memoryKeys || [], null, 2)},
});

await agent.register();`}
            </pre>
          </div>
          <p className="text-sm text-white/60">
            Use the Bothive SDK to programmatically create agents. Install: <code className="px-2 py-1 rounded bg-white/10 text-xs">npm install @bothive/sdk</code>
          </p>
        </div>
      )}

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium transition shadow-lg"
      >
        <Save className="w-4 h-4" />
        Save Agent
      </button>
    </div>
  );
}

