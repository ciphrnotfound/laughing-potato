"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft, Code, Clock, CheckCircle2, Copy, Check,
    ArrowRight, Bot, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import ThemeToggle from "@/components/ThemeToggle";

const SYSTEM_PROMPT = `You are a senior developer agent designed to help other developers. You are patient, thorough, and always explain your reasoning.

Your capabilities:
- Code Review: Analyze code for bugs, security issues, and best practices
- Debugging: Help identify and fix errors
- Pair Programming: Guide developers through implementation
- Mentoring: Explain concepts and teach coding patterns

Always:
- Explain the "why" behind suggestions
- Provide code examples when relevant
- Be encouraging but honest about improvements needed
- Consider edge cases and error handling`;

const HIVELANG_CODE = `bot DevHelper
  description "Senior dev agent for code help"
  type agent
  
  memory session
    var codeContext string
    var language string
  end
  
  on input when input.action == "review"
    set $language to input.language ?? "typescript"
    
    call code.review with {
      code: input.code,
      language: $language,
      focus: ["bugs", "security", "performance"]
    } as review
    
    say "## Code Review\\n" + review.output
  end
  
  on input when input.action == "debug"
    call agent.analyze with {
      data: input.error,
      context: input.code
    } as analysis
    
    call code.generate with {
      prompt: "Fix: " + analysis.output,
      language: $language ?? "typescript"
    } as fix
    
    say "## Issue\\n" + analysis.output
    say "## Fix\\n\`\`\`\\n" + fix.output + "\\n\`\`\`"
  end
  
  on input when input.action == "explain"
    call general.respond with {
      prompt: "Explain this code clearly: " + input.code
    } as explanation
    
    say explanation.output
  end
  
  on input
    call general.respond with {
      prompt: "Help this developer: " + input.message
    } as response
    say response.output
  end
end`;

export default function DevHelperGuidePage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [copiedPrompt, setCopiedPrompt] = React.useState(false);
    const [copiedCode, setCopiedCode] = React.useState(false);

    const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
        navigator.clipboard.writeText(text);
        setter(true);
        setTimeout(() => setter(false), 2000);
    };

    const steps = [
        {
            title: "Open the Builder",
            description: "Navigate to the Bothive Builder to start creating your Dev Helper agent.",
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
            title: "Select Dev Helper Agent Template",
            description: "Find 'Dev Helper Agent' in the template grid and select it. This pre-configures the agent type and basic tools.",
        },
        {
            title: "Customize the System Prompt",
            description: "Tailor the system prompt to your team's coding standards. Add context about your tech stack, preferred patterns, and coding style:",
            code: SYSTEM_PROMPT,
            codeLabel: "System Prompt",
            copied: copiedPrompt,
            onCopy: () => copyToClipboard(SYSTEM_PROMPT, setCopiedPrompt),
        },
        {
            title: "Enable Developer Tools",
            description: "Make sure these tools are enabled:\n• Code Generation - Generate code snippets\n• Code Review - Analyze code for issues\n• Data Analysis - Understand errors and context",
        },
        {
            title: "Customize the HiveLang Code",
            description: "For advanced customization, modify the HiveLang to add specific behaviors for your workflow:",
            code: HIVELANG_CODE,
            codeLabel: "HiveLang Code",
            copied: copiedCode,
            onCopy: () => copyToClipboard(HIVELANG_CODE, setCopiedCode),
        },
        {
            title: "Test with Real Code",
            description: "Test your agent by:\n• Pasting code and asking for a review\n• Sharing an error message to debug\n• Asking it to explain a complex function",
        },
        {
            title: "Share with Your Team",
            description: "Once approved, share the agent with your development team. They can use it for code reviews and pair programming.",
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
                        <Code className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Build a Dev Helper Agent
                    </h1>
                    <p className={cn("text-lg max-w-2xl mx-auto mb-6", isDark ? "text-white/60" : "text-gray-600")}>
                        Create an AI agent that helps developers with code reviews, debugging, and pair programming.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm">
                        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-medium">
                            Intermediate
                        </span>
                        <span className={cn("flex items-center gap-1", isDark ? "text-white/50" : "text-gray-500")}>
                            <Clock className="h-4 w-4" />
                            15 minutes
                        </span>
                        <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 font-medium">
                            Developers
                        </span>
                    </div>
                </motion.div>

                {/* Developer Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                        "rounded-xl border p-4 mb-8 flex items-start gap-3",
                        isDark ? "bg-violet-500/5 border-violet-500/20" : "bg-violet-50 border-violet-200"
                    )}
                >
                    <Code className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className={cn("text-sm font-medium", isDark ? "text-violet-400" : "text-violet-700")}>
                            For Development Teams
                        </p>
                        <p className={cn("text-sm", isDark ? "text-violet-400/70" : "text-violet-600")}>
                            This agent is designed to help developers write better code. Customize it with your
                            team's coding standards and best practices.
                        </p>
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

                {/* Success */}
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
                    <h3 className="text-xl font-bold mb-2">Level Up Your Team!</h3>
                    <p className={cn("mb-6", isDark ? "text-white/60" : "text-gray-600")}>
                        Your Dev Helper will be available to assist developers with code reviews and debugging.
                    </p>
                    <Link
                        href="/builder"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-500 transition-colors"
                    >
                        <Bot className="h-5 w-5" />
                        Start Building
                    </Link>
                </motion.div>
            </main>
        </div>
    );
}
