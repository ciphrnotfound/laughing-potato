"use client";

import React from "react";
import Navbar2 from "@/components/Navbar2";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Network,
  Brain,
  Code2,
  ShieldCheck,
  Share2,
  Bot,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SpotlightCard } from "@/components/ui/ThreeDCard";

const FeatureCard = ({
  children,
  className,
  title,
  description,
  icon: Icon
}: {
  children?: React.ReactNode,
  className?: string,
  title: string,
  description: string,
  icon: any
}) => {
  return (
    <SpotlightCard
      className={cn(
        "p-8 flex flex-col group h-full transition-transform hover:-translate-y-1",
        className
      )}
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-6 flex items-center justify-between">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-white group-hover:bg-violet-500/20 group-hover:text-violet-300 transition-colors">
            <Icon className="w-6 h-6" />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/50 text-sm leading-relaxed mb-8">{description}</p>

        <div className="mt-auto">
          {children}
        </div>
      </div>
    </SpotlightCard>
  );
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-violet-500/30">
      <Navbar2 />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs font-medium text-violet-400 mb-6"
          >
            <Zap className="w-3 h-3" />
            The Hive Architecture
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent">
            Beyond Chatbots. <br />
            True <span className="text-violet-400">Agentic Intelligence.</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Traditional bots are isolated and amnesic. Bothive creates a connected neural network of specialized agents that share memory, tools, and goals.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[minmax(300px,auto)]">
          <FeatureCard
            className="md:col-span-6 lg:col-span-8 bg-gradient-to-br from-[#0a0a0f] to-[#0f0f16]"
            title="Neural Orchestration"
            description="Don't rely on a single prompt. Our Queen Bee One model dynamically routes tasks to specialized sub-agents based on intent, complexity, and required tools."
            icon={Network}
          >
            <div className="w-full h-48 rounded-xl bg-black/40 border border-white/5 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
              <div className="relative z-10 flex items-center gap-8">
                <div className="w-16 h-16 rounded-2xl bg-[#1a1a20] border border-violet-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                  <Network className="w-8 h-8 text-violet-400" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="w-16 h-1 bg-gradient-to-r from-violet-500/50 to-transparent rounded-full animate-pulse" />
                  <div className="w-16 h-1 bg-gradient-to-r from-violet-500/30 to-transparent rounded-full" />
                  <div className="w-16 h-1 bg-gradient-to-r from-violet-500/10 to-transparent rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-lg bg-[#1a1a20] border border-white/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white/30" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FeatureCard>

          <FeatureCard
            className="md:col-span-6 lg:col-span-4"
            title="HiveLang v1.0"
            description="A declarative, type-safe language built specifically for defining agent behaviors, state machines, and tool interfaces."
            icon={Code2}
          >
            <div className="w-full h-full rounded-xl bg-[#050505] border border-white/10 p-4 font-mono text-[10px] text-zinc-400 leading-relaxed overflow-hidden">
              <span className="text-violet-400">bot</span> <span className="text-yellow-200">ResearchAgent</span> <span className="text-white">{"{"}</span>
              <br />
              &nbsp;&nbsp;<span className="text-violet-400">memory</span> <span className="text-blue-300">session</span>
              <br />
              &nbsp;&nbsp;<span className="text-violet-400">on</span> <span className="text-blue-300">input</span> <span className="text-white">{"{"}</span>
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-400">call</span> <span className="text-yellow-200">browser.search</span>
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-400">with</span> <span className="text-white">{"}"}</span>
              <br />
              &nbsp;&nbsp;<span className="text-white">{"}"}</span>
              <br />
              <span className="text-white">{"}"}</span>
            </div>
          </FeatureCard>

          <FeatureCard
            className="md:col-span-4 lg:col-span-4"
            title="Graph Memory"
            description="Agents don't just remember text; they remember relationships. Our semantic graph database links concepts, allowing for true long-term recall."
            icon={Brain}
          >
            <div className="mt-4 flex flex-wrap gap-2">
              {['User Preference', 'Past Projects', 'Code Style', 'API Keys'].map((tag, i) => (
                <span key={i} className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-white/60">
                  {tag}
                </span>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard
            className="md:col-span-4 lg:col-span-4"
            title="Enterprise Security"
            description="SOC 2 Type II compliant. Your data is encrypted at rest and in transit. We never train on customer data."
            icon={ShieldCheck}
          >
            <div className="mt-4 flex items-center gap-4">
              <ShieldCheck className="w-12 h-12 text-emerald-500/20" />
              <div className="text-xs text-emerald-400 font-mono">
                STATUS: SECURE<br />
                ENCRYPTION: AES-256
              </div>
            </div>
          </FeatureCard>

          <FeatureCard
            className="md:col-span-4 lg:col-span-4"
            title="100+ Integrations"
            description="Web browsing, GitHub, Linear, Slack, Notion, and Google Drive. If it has an API, Bothive can use it."
            icon={Share2}
          >
            <div className="grid grid-cols-4 gap-2 mt-4 opacity-50">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="w-8 h-8 rounded bg-white/10" />
              ))}
            </div>
          </FeatureCard>
        </div>

        <div className="mt-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to build your swarm?</h2>
          <div className="flex items-center justify-center gap-4">
            <Link href="/builder" className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors">
              Start Building
            </Link>
            <Link href="/pricing" className="px-8 py-3 bg-white/5 text-white font-semibold rounded-full border border-white/10 hover:bg-white/10 transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
