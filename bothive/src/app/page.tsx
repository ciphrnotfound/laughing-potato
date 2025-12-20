"use client";

import React from "react";
import Navbar2 from "@/components/Navbar2";
import UseCasesSection from "@/components/UseCasesSection";
import Hero from "@/components/Hero";
import LogoCloud from "@/components/LogoCloud";
import FeaturesGrid from "@/components/FeaturesGrid";
import HowItWorksSection from "@/components/HowItWorksSection";
import { GlowingEffectDemo } from "@/components/GlowingEffectDemo";
import { WorldMapDemo } from "@/components/WorldMapDemo";
import Clients from "@/components/Clients";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import { GoogleGeminiEffectDemo } from "@/components/GoogleGeminiEffectDemo";
import PremiumCTA from "@/components/PremiumCTA";
import Footer from "@/components/Footer";
import HiveLangShowcase from "@/components/HiveLangShowcase";
import ScrollDevice3D from "@/components/ScrollDevice3D";
import FAQSection from "@/components/FAQSection";
import {
  ScrollProgress,
  TextReveal,
  ZoomSection,
  ScrollCounter,
  FloatingElement,
} from "@/components/ScrollEffects";

export default function Home() {
  return (
    <div className="relative transition-colors duration-500
      bg-[#fafafa] text-[#0C1024]
      dark:bg-[#030014] dark:text-white
    ">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Bothive",
            "url": "https://bothive.cloud",
            "logo": "https://bothive.cloud/bothive-ai-logo.svg",
            "description": "The operating system for the AI era. Build and deploy autonomous AI agents.",
            "sameAs": [
              "https://twitter.com/bothive",
              "https://linkedin.com/company/bothive"
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Bothive",
            "url": "https://bothive.cloud",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://bothive.cloud/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is Bothive?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Bothive is the operating system for the AI era — a platform where autonomous agents connect, collaborate, and create new intelligence together."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need coding experience to use Bothive?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No! Bothive features a visual builder and HiveLang, a declarative language that makes it easy to build AI agents even with zero coding experience."
                }
              },
              {
                "@type": "Question",
                "name": "What AI models does Bothive support?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Bothive supports top-tier models from OpenAI, Anthropic, Groq, and xAI, allowing you to choose the best intelligence for your specific task."
                }
              }
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Bothive",
            "operatingSystem": "Web, Cloud",
            "applicationCategory": "BusinessApplication, DeveloperApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "1200"
            }
          })
        }}
      />
      {/* Scroll Progress Bar */}
      <ScrollProgress color="bg-gradient-to-r from-violet-500 to-purple-500" />

      {/* Navigation */}
      <Navbar2 />

      {/* Hero Section */}
      <Hero />

      {/* Logo Cloud - Social Proof */}
      <LogoCloud />

      <UseCasesSection />

      {/* HiveLang Showcase - Code that thinks */}
      <HiveLangShowcase />

      {/* 3D Scroll Device Mockup */}
      <ScrollDevice3D videoUrl="/hero-demo.mp4" />

      {/* Features Bento Grid */}
      <ZoomSection>
        <GlowingEffectDemo />
      </ZoomSection>

      {/* How It Works */}
      <HowItWorksSection />

      {/* Features Grid */}
      <FeaturesGrid />

      {/* World Map - Global Reach */}
      <ZoomSection>
        <WorldMapDemo />
      </ZoomSection>

      {/* Testimonials */}
      <Testimonials />

      {/* Client Reviews Marquee */}
      <Clients />

      {/* Pricing */}
      <ZoomSection>
        <Pricing />
      </ZoomSection>

      {/* FAQ */}
      <FAQSection />

      {/* Gemini Effect Demo */}
      <GoogleGeminiEffectDemo />

      <PremiumCTA />

      {/* Giant BOTHIVE Text with Stats */}
      <section className="relative py-32 overflow-hidden transition-colors duration-500
        bg-gradient-to-b from-[#f0f0f5] via-[#fafafa] to-[#f0f0f5]
        dark:bg-gradient-to-b dark:from-[#0a0a0f] dark:via-[#050508] dark:to-[#0a0a0f]
      ">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }} />
        </div>

        {/* Floating orbs */}
        <FloatingElement className="absolute top-20 left-[10%]" yRange={[-20, 20]} xRange={[-10, 10]}>
          <div className="w-32 h-32 rounded-full bg-violet-500/10 blur-2xl" />
        </FloatingElement>
        <FloatingElement className="absolute bottom-20 right-[10%]" yRange={[20, -20]} xRange={[10, -10]}>
          <div className="w-40 h-40 rounded-full bg-purple-500/10 blur-2xl" />
        </FloatingElement>

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-500/10 dark:bg-violet-500/[0.08] rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center gap-8 text-center">
          {/* Animated gradient text */}
          <TextReveal>
            <h2
              className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter select-none bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(90deg, #8B5CF6, #EC4899, #8B5CF6, #EC4899)",
                backgroundSize: "300% 100%",
                animation: "gradient-x 8s ease infinite",
              }}
            >
              BOTHIVE
            </h2>
          </TextReveal>

          <TextReveal>
            <p className="text-lg text-black/50 dark:text-white/50 max-w-md">
              The operating system for the AI era
            </p>
          </TextReveal>

          {/* Stats with scroll counters */}
          <div className="mt-8 grid grid-cols-3 gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#0a0a0f] dark:text-white">
                <ScrollCounter to={10} suffix="K+" />
              </div>
              <div className="text-sm text-black/40 dark:text-white/40 mt-1">Agents Deployed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#0a0a0f] dark:text-white">
                <ScrollCounter to={99} suffix="%" />
              </div>
              <div className="text-sm text-black/40 dark:text-white/40 mt-1">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#0a0a0f] dark:text-white">
                <ScrollCounter to={50} prefix="<" suffix="ms" />
              </div>
              <div className="text-sm text-black/40 dark:text-white/40 mt-1">Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}