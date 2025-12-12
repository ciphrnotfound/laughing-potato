"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  BookOpen, Bot, Plug, Sparkles, ArrowRight, Code, 
  GraduationCap, ChevronRight, Clock, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import ThemeToggle from "@/components/ThemeToggle";

const guides = [
  {
    id: "study-buddy",
    icon: GraduationCap,
    title: "Build a Study Buddy Bot",
    description: "Create an AI tutor that explains concepts, generates quizzes, and creates flashcards for any subject.",
    difficulty: "Beginner",
    time: "10 min",
    audience: "Everyone",
  },
  {
    id: "custom-integration",
    icon: Plug,
    title: "Create a Custom Integration",
    description: "Connect any external API to Bothive and let your bots use it. Great for developers.",
    difficulty: "Intermediate",
    time: "20 min",
    audience: "Developers",
  },
  {
    id: "dev-helper",
    icon: Code,
    title: "Build a Dev Helper Agent",
    description: "Create an agent that helps developers with code reviews, debugging, and pair programming.",
    difficulty: "Intermediate",
    time: "15 min",
    audience: "Developers",
  },
  {
    id: "creative-bot",
    icon: Sparkles,
    title: "Create a Creative Bot",
    description: "Build artistic bots that generate dreamlike content, surreal narratives, and abstract art.",
    difficulty: "Beginner",
    time: "5 min",
    audience: "Everyone",
  },
];

export default function GuidesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDark ? "bg-[#0a0a0f] text-white" : "bg-gray-50 text-gray-900"
    )}>
      {/* Simple Header */}
      <header className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-xl",
        isDark ? "border-white/10 bg-[#0a0a0f]/90" : "border-gray-200 bg-white/90"
      )}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">Bothive</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/builder" className={cn("text-sm font-medium transition-colors", isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900")}>
              Builder
            </Link>
            <Link href="/integrations" className={cn("text-sm font-medium transition-colors", isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900")}>
              Integrations
            </Link>
            <Link href="/dashboard" className={cn("text-sm font-medium transition-colors", isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900")}>
              Dashboard
            </Link>
          </nav>

          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 text-violet-400 text-sm font-medium mb-6"
          >
            <BookOpen className="h-4 w-4" />
            Guides & Tutorials
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Learn to Build with Bothive
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn("text-lg max-w-2xl mx-auto", isDark ? "text-white/60" : "text-gray-600")}
          >
            Step-by-step tutorials to create AI bots, integrations, and agents.
            Choose a guide based on your skill level.
          </motion.p>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {guides.map((guide, i) => (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Link
                  href={`/guides/${guide.id}`}
                  className={cn(
                    "block group rounded-2xl border p-6 transition-all hover:shadow-lg",
                    isDark 
                      ? "bg-[#0d0d12] border-white/10 hover:border-violet-500/30" 
                      : "bg-white border-gray-200 hover:border-violet-300"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
                      <guide.icon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium",
                          guide.difficulty === "Beginner" 
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        )}>
                          {guide.difficulty}
                        </span>
                        <span className={cn(
                          "flex items-center gap-1 text-xs",
                          isDark ? "text-white/40" : "text-gray-500"
                        )}>
                          <Clock className="h-3 w-3" />
                          {guide.time}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold mb-2 group-hover:text-violet-400 transition-colors">
                        {guide.title}
                      </h3>
                      
                      <p className={cn("text-sm mb-4", isDark ? "text-white/60" : "text-gray-600")}>
                        {guide.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded",
                          isDark ? "bg-white/5 text-white/50" : "bg-gray-100 text-gray-600"
                        )}>
                          {guide.audience}
                        </span>
                        <span className="flex items-center gap-1 text-violet-400 text-sm font-medium group-hover:gap-2 transition-all">
                          Start Guide
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={cn(
        "py-16 border-t",
        isDark ? "border-white/10" : "border-gray-200"
      )}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Building?</h2>
          <p className={cn("mb-8", isDark ? "text-white/60" : "text-gray-600")}>
            Jump straight into the builder or pick a guide above.
          </p>
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-500 transition-colors"
          >
            <Bot className="h-5 w-5" />
            Open Builder
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
