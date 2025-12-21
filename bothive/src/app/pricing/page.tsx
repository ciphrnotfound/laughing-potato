"use client";

import React from "react";
import Navbar2 from "@/components/Navbar2";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Globe, Sparkles } from "lucide-react";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar2 />

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full mix-blend-screen opacity-50" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-white/[0.05] text-white/80 border border-white/[0.05] mb-6">
              <Sparkles className="w-3 h-3 text-violet-400" />
              Transparent Economics
            </span>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white mb-6">
              Invest in your <br />
              <span className="text-white/40">Autonomous Workforce</span>
            </h1>
            <p
              className="text-lg text-white/40 max-w-2xl mx-auto mb-10"
            >
              Simple pricing for teams. Lucrative economics for creators.
              <br /> Join the economy where intelligence is the currency.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Platform Pricing Component */}
      <Pricing />

      {/* Creator Economics Section */}
      <section className="relative py-24 px-6 border-t border-white/[0.04] bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6"
              >
                <DollarSign className="w-4 h-4" />
                Creator Economy
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-semibold text-white mb-6 tracking-tight"
              >
                Build once. <br />
                Earn perpetually.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-white/40 mb-10"
              >
                Bothive isn't just a tool—it's a marketplace. Publish your specialized agents and earn recurring revenue every time they're deployed by other teams.
              </motion.p>

              <div className="space-y-4">
                {[
                  {
                    title: "Marketplace Commission",
                    description: "Earn 85% of every bot sale. We handle payments, fraud, and support.",
                    icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
                  },
                  {
                    title: "Recurring Usage",
                    description: "Get 75% of metered extension fees from high-volume enterprise users.",
                    icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
                  },
                  {
                    title: "Global Reach",
                    description: "Sell to customers in 58 countries with automatic tax compliance.",
                    icon: <Globe className="w-5 h-5 text-violet-400" />,
                  }
                ].map((stream, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="flex gap-4 p-4 rounded-2xl border border-transparent hover:border-white/[0.04] hover:bg-white/[0.02] transition-all"
                  >
                    <div className="p-2.5 rounded-xl bg-white/[0.05] h-fit">
                      {stream.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-1">{stream.title}</h3>
                      <p className="text-sm text-white/40">{stream.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-emerald-500/10 blur-[80px] rounded-full" />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative z-10 rounded-3xl border border-white/[0.04] bg-[#0c0c12] p-8 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <p className="text-sm text-white/40 uppercase tracking-widest font-mono">Estimated Earnings</p>
                    <h3 className="text-3xl font-semibold text-white mt-2">$12,450<span className="text-lg text-white/30 font-normal">/mo</span></h3>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                    +12% this week
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Research Agent Pro", sales: "1,204 deployments", rev: "$8,420" },
                    { label: "Email Triager", sales: "850 deployments", rev: "$2,950" },
                    { label: "Code Reviewer", sales: "320 deployments", rev: "$1,080" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.03]">
                      <div>
                        <p className="font-medium text-white text-sm">{item.label}</p>
                        <p className="text-xs text-white/30 mt-0.5">{item.sales}</p>
                      </div>
                      <p className="font-mono text-white text-sm">{item.rev}</p>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-8 py-3 rounded-xl bg-white text-black font-semibold hover:bg-neutral-200 transition-colors text-sm">
                  Start Monetizing
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
