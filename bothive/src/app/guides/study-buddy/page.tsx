"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft, GraduationCap, Clock, CheckCircle2, Copy, Check,
    ArrowRight, Bot, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import ThemeToggle from "@/components/ThemeToggle";

const HIVELANG_CODE = `bot StudyBuddy
  description "Your personal AI tutor for any subject"
  
  memory session
    var currentTopic string
    var studentLevel string
  end
  
  on input when input.command == "explain"
    set $currentTopic to input.topic
    
    call study.explain with {
      topic: $currentTopic,
      level: $studentLevel ?? "beginner"
    } as explanation
    
    say "📚 " + explanation.output
  end
  
  on input when input.command == "quiz"
    call study.quiz with {
      topic: $currentTopic ?? input.topic,
      count: 5,
      difficulty: "medium"
    } as quiz
    
    say "🧠 Quiz Time!\\n\\n" + quiz.output
  end
  
  on input when input.command == "flashcards"
    call study.flashcards with {
      topic: $currentTopic ?? input.topic,
      count: 10
    } as cards
    
    say "🃏 Flashcards:\\n\\n" + cards.output
  end
  
  on input
    call general.respond with {
      prompt: "Help the student learn: " + input.message
    } as response
    say response.output
  end
end`;

const SYSTEM_PROMPT = `You are Study Buddy, an enthusiastic and patient AI tutor. Your mission is to help students learn and understand any topic.

You:
- Break down complex concepts into simple pieces
- Use analogies and real-world examples
- Create quizzes and flashcards on demand
- Encourage students and celebrate progress
- Never make students feel bad for not knowing something

When a student asks about a topic, first gauge their understanding, then build from there. Make learning fun!`;

export default function StudyBuddyGuidePage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [copiedCode, setCopiedCode] = React.useState(false);
    const [copiedPrompt, setCopiedPrompt] = React.useState(false);

    const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
        navigator.clipboard.writeText(text);
        setter(true);
        setTimeout(() => setter(false), 2000);
    };

    const steps = [
        {
            title: "Go to the Builder",
            description: "Click the button below or navigate to /builder to start creating your Study Buddy.",
            action: (
                <Link
                    href="/builder"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors"
                >
                    Open Builder
                    <ArrowRight className="h-4 w-4" />
                </Link>
            ),
        },
        {
            title: "Select the Study Buddy Template",
            description: "In the template selection screen, find and click on 'Study Buddy'. This will pre-load the tutoring configuration.",
        },
        {
            title: "Customize the System Prompt",
            description: "In the Configure step, update the system prompt to specialize your tutor. For example, if you want it to focus on Physics, add that context.",
            code: SYSTEM_PROMPT,
            codeLabel: "System Prompt",
            copied: copiedPrompt,
            onCopy: () => copyToClipboard(SYSTEM_PROMPT, setCopiedPrompt),
        },
        {
            title: "Enable Study Tools",
            description: "Make sure these tools are enabled in the Configure panel: Study Explanations, Quiz Generator, and Flashcard Creator.",
        },
        {
            title: "Optional: Customize the HiveLang Code",
            description: "For advanced users, you can modify the HiveLang code to add custom behaviors. Here's the default code:",
            code: HIVELANG_CODE,
            codeLabel: "HiveLang Code",
            copied: copiedCode,
            onCopy: () => copyToClipboard(HIVELANG_CODE, setCopiedCode),
        },
        {
            title: "Test Your Bot",
            description: "Click 'Continue to Test' and try asking questions like:\n• 'Explain photosynthesis'\n• 'Give me a quiz on World War 2'\n• 'Create flashcards for Spanish vocabulary'",
        },
        {
            title: "Submit for Approval",
            description: "When you're happy with your bot, click 'Submit for Approval'. An admin will review it before it goes live.",
        },
    ];

    return (
        <div className={cn(
            "min-h-screen transition-colors duration-300",
            isDark ? "bg-[#0a0a0f] text-white" : "bg-gray-50 text-gray-900"
        )}>
            {/* Header */}
            <header className={cn(
                "sticky top-0 z-50 border-b backdrop-blur-xl",
                isDark ? "border-white/10 bg-[#0a0a0f]/90" : "border-gray-200 bg-white/90"
            )}>
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/guides"
                        className={cn(
                            "flex items-center gap-2 text-sm font-medium transition-colors",
                            isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900"
                        )}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Guides
                    </Link>
                    <ThemeToggle />
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-violet-500/10 text-violet-400 mb-6">
                        <GraduationCap className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Build a Study Buddy Bot
                    </h1>
                    <p className={cn("text-lg max-w-2xl mx-auto mb-6", isDark ? "text-white/60" : "text-gray-600")}>
                        Create an AI tutor that explains concepts, generates quizzes, and creates flashcards for students.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                            Beginner
                        </span>
                        <span className={cn("flex items-center gap-1", isDark ? "text-white/50" : "text-gray-500")}>
                            <Clock className="h-4 w-4" />
                            10 minutes
                        </span>
                    </div>
                </motion.div>

                {/* Steps */}
                <div className="space-y-8">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className={cn(
                                "rounded-2xl border p-6",
                                isDark ? "bg-[#0d0d12] border-white/10" : "bg-white border-gray-200"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold text-sm">
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                                    <p className={cn("text-sm whitespace-pre-line", isDark ? "text-white/60" : "text-gray-600")}>
                                        {step.description}
                                    </p>

                                    {step.action && (
                                        <div className="mt-4">{step.action}</div>
                                    )}

                                    {step.code && (
                                        <div className="mt-4">
                                            <div className={cn(
                                                "rounded-xl border overflow-hidden",
                                                isDark ? "border-white/10" : "border-gray-200"
                                            )}>
                                                <div className={cn(
                                                    "px-4 py-2 flex items-center justify-between border-b",
                                                    isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
                                                )}>
                                                    <span className="text-xs font-medium text-violet-400">{step.codeLabel}</span>
                                                    <button
                                                        onClick={step.onCopy}
                                                        className={cn(
                                                            "flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors",
                                                            isDark ? "text-white/50 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                                        )}
                                                    >
                                                        {step.copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                                        {step.copied ? "Copied!" : "Copy"}
                                                    </button>
                                                </div>
                                                <pre className={cn(
                                                    "p-4 text-xs overflow-x-auto",
                                                    isDark ? "bg-black/30 text-white/80" : "bg-gray-50 text-gray-800"
                                                )}>
                                                    <code>{step.code}</code>
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Success Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className={cn(
                        "mt-12 rounded-2xl border p-8 text-center",
                        isDark ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"
                    )}
                >
                    <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">You're Ready!</h3>
                    <p className={cn("mb-6", isDark ? "text-white/60" : "text-gray-600")}>
                        Once approved, your Study Buddy will be available for students to use.
                    </p>
                    <Link
                        href="/builder"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-500 transition-colors"
                    >
                        <Bot className="h-5 w-5" />
                        Start Building Now
                    </Link>
                </motion.div>
            </main>
        </div>
    );
}
