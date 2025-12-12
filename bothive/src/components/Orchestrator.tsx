import React from 'react';

export default function Orchestrator({ agents }: { agents: any[] }) {
    return (
        <div className="p-8 text-center text-white/50 bg-black rounded-lg border border-white/10">
            <h3 className="text-lg font-medium text-white mb-2">Swarm Orchestrator</h3>
            <p>Active Agents: {agents?.length || 0}</p>
        </div>
    );
}
