"use client";

import React from "react";
import Navbar2 from "@/components/Navbar2";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Globe, ShieldCheck } from "lucide-react";

const revenueStreams = [
  {
    title: "Marketplace Commission",
    description: "Earn 85% of every bot sale. We handle payments, fraud, and support.",
    icon: <DollarSign className="w-6 h-6 text-emerald-400" />,
  },
  {
    title: "Recurring Usage",
    description: "Get 75% of metered extension fees from high-volume enterprise users.",
    icon: <TrendingUp className="w-6 h-6 text-blue-400" />,
  },
  {
    title: "Global Reach",
    description: "Sell to customers in 58 countries with automatic tax compliance.",
    icon: <Globe className="w-6 h-6 text-violet-400" />,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-violet-500/30">
      <Navbar2 />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-violet-600/20 blur-[120px] rounded-full mix-blend-screen" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-6"
          >
            Invest in your <br />
            <span className="text-violet-400">Autonomous Workforce</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-neutral-400 max-w-2xl mx-auto"
          >
            Transparent pricing for teams. Lucrative economics for creators.
            <br /> Join the economy where intelligence is the currency.
          </motion.p>
        </div>
      </section>

      {/* Platform Pricing */}
      <Pricing />

      {/* Creator Economics Section */}
      <section className="relative py-24 px-6 border-t border-white/10 bg-neutral-900/30">
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
                className="text-4xl font-bold mb-6"
              >
                Build once. <br />
                Earn perpetually.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-neutral-400 mb-8"
              >
                Bothive isn't just a tool—it's a marketplace. Publish your specialized agents and earn recurring revenue every time they're deployed by other teams.
              </motion.p>

              <div className="space-y-6">
                {revenueStreams.map((stream, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 h-fit">
                      {stream.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{stream.title}</h3>
                      <p className="text-sm text-neutral-400">{stream.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-emerald-500/20 blur-[80px] rounded-full" />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative z-10 rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl p-8"
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <p className="text-sm text-neutral-400 uppercase tracking-wider">Estimated Earnings</p>
                    <h3 className="text-3xl font-bold text-white">$12,450<span className="text-lg text-neutral-500 font-normal">/mo</span></h3>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                    +12% this week
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Research Agent Pro", sales: "1,204 deployments", rev: "$8,420" },
                    { label: "Email Triager", sales: "850 deployments", rev: "$2,950" },
                    { label: "Code Reviewer", sales: "320 deployments", rev: "$1,080" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                      <div>
                        <p className="font-medium text-white">{item.label}</p>
                        <p className="text-xs text-neutral-500">{item.sales}</p>
                      </div>
                      <p className="font-mono text-white">{item.rev}</p>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-8 py-3 rounded-xl bg-white text-black font-semibold hover:bg-neutral-200 transition-colors">
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
