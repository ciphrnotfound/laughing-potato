"use client";

import React from "react";
import { ArrowLeft, Code2, Terminal, Cpu, Share2, Globe } from "lucide-react";
import Link from "next/link";

export default function HiveLangDocsPage() {
    return (
        <div className="min-h-screen bg-[#04010b] text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <Link href="/builder" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Builder
                </Link>

                <header className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium uppercase tracking-wider">
                        <Code2 className="w-3.5 h-3.5" />
                        HiveLang 1.0
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        The Language of Agents
                    </h1>
                    <p className="text-lg text-white/60 max-w-2xl">
                        HiveLang is a domain-specific language designed for orchestrating autonomous agents.
                        It focuses on delegation, tool usage, and collaboration rather than low-level computation.
                    </p>
                </header>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                            <Terminal className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Declarative Syntax</h3>
                        <p className="text-sm text-white/60">
                            Define "what" you want to happen, not "how". HiveLang handles the complexity of LLM context management and tool execution.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                            <Share2 className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Native Collaboration</h3>
                        <p className="text-sm text-white/60">
                            Built-in primitives for broadcasting messages, listening for events, and sharing memory between agents.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
                            <Globe className="w-5 h-5 text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Universal Integration</h3>
                        <p className="text-sm text-white/60">
                            Connect to any API via HTTP requests or webhooks. HiveLang treats the entire internet as a tool library.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4">
                            <Cpu className="w-5 h-5 text-orange-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Sandboxed Execution</h3>
                        <p className="text-sm text-white/60">
                            Safe by default. Agents run in isolated environments with strict permission controls defined in the manifest.
                        </p>
                    </div>
                </div>

                <div className="p-8 rounded-3xl border border-white/10 bg-black/40">
                    <h2 className="text-2xl font-bold mb-6">Example: Multi-Agent Orchestration</h2>
                    <pre className="font-mono text-sm bg-black/60 p-6 rounded-xl overflow-x-auto border border-white/5 text-blue-300">
                        {`bot Orchestrator
  description "Coordinates a research and reporting workflow"

  on input
    say "Starting research on {input.topic}..."
    
    // Broadcast a task to the research swarm
    call agent.broadcast with {
      type: "research_request",
      payload: { topic: input.topic }
    }

    // Wait for results
    say "Waiting for researchers to report back..."
    call agent.listen as reports

    // Synthesize the findings
    call agent.analyze with {
      data: reports
    } as summary

    say "Here is the consolidated report: {summary}"
  end
end`}
                    </pre>
                </div>
            </div>
        </div>
    );
}
