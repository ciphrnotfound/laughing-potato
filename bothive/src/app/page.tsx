"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar2 from "@/components/Navbar2";
import Hero from "@/components/Hero";
import Bento from "@/components/Bento";
import Features from "@/components/Features";
import Clients from "@/components/Clients";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import AgentBuilder from "@/components/AgentBuilder";
import Marketplace from "@/components/Marketplace";
import Orchestrator from "@/components/Orchestrator";
import Integrations from "@/components/Integrations";
export default function Home() {
  const logos = [
    "/brands/harvard.png",
    "/brands/mckesson.png",
    "/brands/samsung.png",
    "/public/placeholder.png",
  ];

  const features = [
    {
      title: "Bot orchestration",
      desc: "Design, connect and run autonomous AI bots across pipelines and channels.",
      image: "/App.png",
    },
    {
      title: "Visual dashboards",
      desc: "Live metrics, traces and simulations that make agent behaviour obvious at a glance.",
      image: "/Hero.png",
    },
    {
      title: "Smart Agent Generator",
      desc: "Generate specialized bots from prompts and templates, then iterate with feedback loops.",
      image: "/bothive.png",
    },
  ];

  const testimonials = [
    {
      name: "Tala Taylor",
      role: "Head of AI Ops @ Quantum",
      quote:
        "This ecosystem transformed how we build, deploy and monetize AI agents across products.",
      avatar: "/App.png",
    },
  ];

  const [billing, setBilling] = useState("monthly");
  const plans = [
    {
      name: "Starter",
      priceMonthly: "$29/mo",
      priceYearly: "$290/yr",
      bullets: ["Deploy single bot", "Basic observability", "Community templates"],
    },
    {
      name: "Pro",
      featured: true,
      priceMonthly: "$79/mo",
      priceYearly: "$790/yr",
      bullets: ["Everything Starter has", "Advanced orchestration", "Team collaboration"],
    },
    {
      name: "Business",
      priceMonthly: "$149/mo",
      priceYearly: "$1490/yr",
      bullets: ["Enterprise scaling", "API & multi-seat", "Priority support"],
    },
  ];

  return (
    <div className="bg-black text-white">
      <Navbar2 />
      
      {/* Hero */}
      <Hero />

      {/* Bento showcase (design section) */}
      <Bento />

      <Features/>
      
        <Clients/>

        <Pricing/>
        
        <CTA/>

        <Marketplace/>

       <Integrations/>
    </div>
  );
}