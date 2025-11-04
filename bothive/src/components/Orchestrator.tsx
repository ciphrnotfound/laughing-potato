"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, Square, Zap, Network } from "lucide-react";
import { AgentDefinition } from "@/lib/agentTypes";

interface Node {
  id: string;
  agentId: string;
  position: { x: number; y: number };
}

interface Connection {
  from: string;
  to: string;
}

interface OrchestratorProps {
  agents: AgentDefinition[];
}

export default function Orchestrator({ agents }: OrchestratorProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addNode = (agent: AgentDefinition) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      agentId: agent.id,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
  };

  const handleConnect = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const exists = connections.some(
      (c) => c.from === fromId && c.to === toId
    );
    if (!exists) {
      setConnections((prev) => [...prev, { from: fromId, to: toId }]);
    }
  };

  const handleRun = async () => {
    if (nodes.length === 0) {
      alert("Add at least one agent to the canvas");
      return;
    }

    setIsRunning(true);
    setLogs([]);
    
    const log = (msg: string) => {
      setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    };

    log("Starting orchestration...");
    
    try {
      // Build workflow steps from nodes and connections
      const steps = nodes.map((node) => {
        const agent = agents.find((a) => a.id === node.agentId);
        const incoming = connections.filter((c) => c.to === node.id);
        const input = incoming.length > 0 
          ? `Task from ${incoming.length} connected agent(s)`
          : "Initial task";
        
        return {
          agentId: node.agentId,
          input: `${input} - Execute ${agent?.name || "agent"} workflow`,
        };
      });

      // Call API to execute workflow
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Log transcript
        result.transcript.forEach((msg: { role: string; content: string; agentId?: string }) => {
          if (msg.role === "agent") {
            const agent = agents.find((a) => a.id === msg.agentId);
            log(`[${agent?.name || "Agent"}]: ${msg.content}`);
          } else {
            log(`[System]: ${msg.content}`);
          }
        });

        log(`Final output: ${result.output}`);
        log("Orchestration complete!");
      } else {
        log("Failed to execute workflow");
      }
    } catch (error) {
      console.error("Run error:", error);
      log("Error executing workflow");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Network className="w-5 h-5" />
            Agent Orchestrator
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleRun}
              disabled={isRunning || nodes.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition"
            >
              <Play className="w-4 h-4" />
              Run
            </button>
            <button
              onClick={() => setIsRunning(false)}
              disabled={!isRunning}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          </div>
        </div>

        {/* Agent Palette */}
        <div className="flex gap-2">
          {agents.slice(0, 3).map((agent) => (
            <button
              key={agent.id}
              onClick={() => addNode(agent)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-sm text-white transition"
            >
              <Zap className="w-3 h-3 inline mr-1" />
              {agent.name}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative bg-gradient-to-b from-purple-950/20 to-black border-b border-white/10 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full">
          {/* Connections */}
          {connections.map((conn, i) => {
            const fromNode = nodes.find((n) => n.id === conn.from);
            const toNode = nodes.find((n) => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            return (
              <line
                key={i}
                x1={fromNode.position.x + 40}
                y1={fromNode.position.y + 40}
                x2={toNode.position.x + 40}
                y2={toNode.position.y + 40}
                stroke="rgba(147, 51, 234, 0.6)"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="rgba(147, 51, 234, 0.6)" />
            </marker>
          </defs>
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const agent = agents.find((a) => a.id === node.agentId);
          const isSelected = selectedNode === node.id;
          
          return (
            <div
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              onDoubleClick={() => {
                const otherNodes = nodes.filter((n) => n.id !== node.id);
                if (otherNodes.length > 0) {
                  const randomTarget = otherNodes[Math.floor(Math.random() * otherNodes.length)];
                  handleConnect(node.id, randomTarget.id);
                }
              }}
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
              }}
              className={`absolute w-20 h-20 rounded-lg border-2 cursor-move transition ${
                isSelected
                  ? "border-purple-500 bg-purple-500/20"
                  : "border-white/20 bg-white/10 hover:border-white/40"
              }`}
            >
              <div className="flex flex-col items-center justify-center h-full p-2">
                <Zap className="w-6 h-6 text-purple-400" />
                <span className="text-xs text-center text-white/80 mt-1 truncate w-full">
                  {agent?.name || "Agent"}
                </span>
              </div>
            </div>
          );
        })}

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-white/40">
            <div className="text-center">
              <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Add agents from the palette to start building your workflow</p>
              <p className="text-sm mt-2">Double-click nodes to connect them</p>
            </div>
          </div>
        )}
      </div>

      {/* Logs */}
      <div className="h-32 p-4 bg-black/50 border-t border-white/10 overflow-y-auto">
        <div className="text-xs font-mono text-white/60 space-y-1">
          {logs.length === 0 ? (
            <p className="text-white/40">No logs yet...</p>
          ) : (
            logs.map((log, i) => <div key={i}>{log}</div>)
          )}
        </div>
      </div>
    </div>
  );
}

