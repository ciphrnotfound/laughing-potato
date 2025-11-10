"use client";

import React from "react";
import { motion } from "framer-motion";

const tiers = [
  {
    id: "starter",
    name: "Starter",
    price: "Free",
    description: "Good for personal projects and quick experiments.",
    features: ["1 agent", "Community support", "Basic integrations"],
    cta: "Get started",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    unit: "/mo",
    description: "For power users and small teams.",
    features: ["10 agents", "Priority support", "Custom templates"],
    cta: "Upgrade",
    highlighted: true,
  },
  {
    id: "team",
    name: "Team",
    price: "$99",
    unit: "/mo",
    description: "Scale across your organization with teams and roles.",
    features: ["Unlimited agents", "SAML & SSO", "Dedicated support"],
    cta: "Contact sales",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 28 } },
};

export default function PricingPage() {
  return (
    <main className="bg-black text-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Pricing built for teams of all sizes</h1>
        <p className="mt-4 text-white/70">Simple, predictable pricing — scale with confidence. Try any plan risk-free.</p>
      </section>

      <section className="mx-auto mt-8 max-w-4xl">
        <div className="flex justify-center">
          <div className="rounded-full bg-white/5 px-1 py-1 flex items-center gap-1 text-sm">
            <button className="px-3 py-1 rounded-full bg-white/8 text-white/90">Monthly</button>
            <button className="px-3 py-1 rounded-full hover:bg-white/6 text-white/70">Yearly (save 20%)</button>
          </div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {tiers.map((tier) => (
            <motion.article
              key={tier.id}
              variants={item}
              className={`relative flex flex-col rounded-2xl border border-white/6 p-6 bg-white/3 backdrop-blur-sm shadow-sm overflow-hidden ${
                tier.highlighted ? "ring-2 ring-violet-400/20 scale-102" : ""
              }`}
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold">{tier.price}</span>
                  {tier.unit && <span className="text-sm text-white/70">{tier.unit}</span>}
                </div>
                <p className="mt-3 text-sm text-white/70">{tier.description}</p>

                <ul className="mt-4 space-y-2 text-sm">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-3 w-3 rounded-full bg-emerald-400/80" />
                      <span className="text-white/80">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <button
                  aria-label={`${tier.cta} for ${tier.name}`}
                  className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                    tier.highlighted ? "bg-violet-600 text-black hover:bg-violet-700" : "bg-white/6 text-white hover:bg-white/10"
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section className="mx-auto mt-12 max-w-4xl text-center">
        <p className="text-sm text-white/60">Need custom billing or SSO? Contact sales for enterprise options.</p>
      </section>
    </main>
  );
}

