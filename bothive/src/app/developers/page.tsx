"use client";

import React from "react";
import Navbar2 from "@/components/Navbar2";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Briefcase, Zap, Code, Users } from "lucide-react";
import { HiveLangLogo } from "@/components/HiveLangLogo";

const OPEN_ROLES = [
  {
    title: "Senior AI Engineer (RAG & Vector)",
    team: "Core Infrastructure",
    location: "San Francisco / Remote",
    type: "Full-time",
    description: "Scale our distributed Pinecone/Milvus clusters and optimize the context retrieval pipeline for million-token contexts."
  },
  {
    title: "Founding Frontend Engineer",
    team: "Product Experience",
    location: "Remote",
    type: "Full-time",
    description: "Own the visual builder. Expertise in ReactFlow, Canvas API, and conflict-free replicated data types (CRDTs) for multiplayer syncing."
  },
  {
    title: "Developer Advocate",
    team: "Growth",
    location: "New York / Remote",
    type: "Full-time",
    description: "Be the face of BotHive. Write technical deep-dives on HiveLang, speak at conferences, and nurture our Discord community."
  },
  {
    title: "Compiler Engineer (Rust/WASM)",
    team: "HiveLang",
    location: "Remote",
    type: "Full-time",
    description: "Help us port the HiveLang compiler to WASM for client-side execution and optimize the AST walker."
  }
];

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#030014] text-[#0a0a0f] dark:text-white selection:bg-violet-500/30">
      <Navbar2 />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Blurs (Matching Founder Page) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs font-medium text-violet-600 dark:text-violet-400 mb-6">
              <Users className="w-3 h-3" />
              Careers at BotHive
            </span>

            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-8">
              Build the <span className="text-violet-600 dark:text-violet-500">Operating System</span> <br />
              for the Agentic Era.
            </h1>

            <p className="text-xl text-black/60 dark:text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
              We are a small, high-density team solving hard problems in distributed systems and AI.
              If you obsess over quality and want to ship tools that define the next decade of software, join us.
            </p>

            <div className="flex items-center justify-center gap-4">
              <a href="#roles" className="px-8 py-4 bg-[#0a0a0f] dark:bg-white text-white dark:text-black font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                View Open Roles
              </a>
              <a href="https://github.com/bothive" target="_blank" className="px-8 py-4 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-2">
                <Code className="w-4 h-4" />
                Our Stack
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Culture / Values */}
      <section className="py-20 px-6 bg-white dark:bg-white/[0.02] border-y border-black/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="text-center md:text-left">
            <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-6 mx-auto md:mx-0">
              <Zap className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Ship relentlessly.</h3>
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              We don't do multi-month specs. We build prototypes, dogfood them, and ship to users. Speed is our leverage.
            </p>
          </div>
          <div className="text-center md:text-left">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6 mx-auto md:mx-0">
              <HiveLangLogo className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Toolsmiths at heart.</h3>
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              We build tools for builders. We care deeply about developer experience, API design, and clean documentation.
            </p>
          </div>
          <div className="text-center md:text-left">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center mb-6 mx-auto md:mx-0">
              <Users className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Zero ego.</h3>
            <p className="text-black/60 dark:text-white/60 leading-relaxed">
              Best idea wins, regardless of title. We debate vigorously but commit fully once a decision is made.
            </p>
          </div>
        </div>
      </section>

      {/* Jobs List */}
      <section id="roles" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <h2 className="text-3xl font-semibold">Open Roles</h2>
            <span className="text-sm text-black/40 dark:text-white/40">{OPEN_ROLES.length} positions available</span>
          </div>

          <div className="space-y-4">
            {OPEN_ROLES.map((role, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-violet-500/30 dark:hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{role.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-black/50 dark:text-white/50 font-medium">
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {role.team}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {role.location}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-xs font-medium">
                      {role.type}
                    </span>
                  </div>
                </div>
                <p className="text-black/60 dark:text-white/60 leading-relaxed text-sm mb-4">
                  {role.description}
                </p>
                <div className="flex items-center text-sm font-medium text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform">
                  Apply for this role <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 p-8 rounded-3xl bg-violet-500/5 border border-violet-500/10 text-center">
            <h3 className="text-xl font-semibold mb-2">Don't see your role?</h3>
            <p className="text-black/60 dark:text-white/60 mb-6">
              We are always looking for exceptional generalists.
            </p>
            <a href="mailto:careers@bothive.io" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
              Email us directly &rarr;
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
