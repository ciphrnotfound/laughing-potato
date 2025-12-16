"use client";

import React from "react";
import { ArrowRight, Zap, Code2, Boxes } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="space-y-12 py-8 max-w-4xl">

      {/* Header */}
      <div className="space-y-6 border-b border-white/5 pb-10">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          Bothive Documentation
        </h1>
        <p className="text-xl text-white/60 leading-relaxed">
          Build, deploy, and manage autonomous agent swarms. Bothive provides the infrastructure, language (HiveLang), and runtime for next-generation AI applications.
        </p>
        <div className="flex gap-4">
          <Link href="/docs/quick-start" className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-neutral-200 transition-colors inline-flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Quick Start
          </Link>
          <Link href="/docs/hivelang" className="px-5 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors inline-flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            HiveLang SDK
          </Link>
        </div>
      </div>

      {/* Introduction Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">What is Bothive?</h2>
          <p className="text-white/60 leading-relaxed">
            Bothive is a platform for orchestrating LLM-powered agents. Unlike simple chatbots, Bothive agents can execute tools, maintain long-term memory, and collaborate with other agents in a "swarm."
          </p>
          <p className="text-white/60 leading-relaxed">
            It is built on top of a highly optimized runtime that handles context window management, tool execution sandboxing, and parallel inference.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Core Pillars</h2>
          <ul className="space-y-3">
            <li className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Code2 className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <div>
                <strong className="block text-white">Declarative Logic</strong>
                <span className="text-white/50 text-sm">Define behavior with HiveLang, not prompt engineering.</span>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Boxes className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div>
                <strong className="block text-white">Universal Runtime</strong>
                <span className="text-white/50 text-sm">Run on Edge, Serverless, or specialized GPU clusters.</span>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <strong className="block text-white">Instant Integrations</strong>
                <span className="text-white/50 text-sm">Connect to Notion, Linear, Slack, and PostgreSQL in seconds.</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Next Steps */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Next Steps</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/docs/installation" className="group p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="font-mono text-sm text-white/40">01</span>
            </div>
            <h3 className="font-semibold text-white mb-2">Installation</h3>
            <p className="text-sm text-white/50">Set up your local environment and CLI.</p>
          </Link>
          <Link href="/docs/concepts" className="group p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="font-mono text-sm text-white/40">02</span>
            </div>
            <h3 className="font-semibold text-white mb-2">Core Concepts</h3>
            <p className="text-sm text-white/50">Learn about Hives, Swarms, and Memory.</p>
          </Link>
          <Link href="/docs/hivelang" className="group p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="font-mono text-sm text-white/40">03</span>
            </div>
            <h3 className="font-semibold text-white mb-2">HiveLang</h3>
            <p className="text-sm text-white/50">Master the language of agents.</p>
          </Link>
        </div>
      </div>

    </div>
  );
}
