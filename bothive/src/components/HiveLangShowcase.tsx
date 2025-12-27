"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Terminal, Zap, Code2, Play, Pause, RotateCcw } from "lucide-react";

// Sample HiveLang code that will be typed out
const HIVELANG_CODE = `bot SupportAgent
  description "24/7 customer support AI"
  
  memory
    scope user
    persist true
  end

  on input when contains("refund")
    call crm.lookup with { email: user.email } as customer
    call ai.analyze with { query: input, context: customer }
    say "I found your order. Processing refund..."
    call stripe.refund with { order_id: customer.last_order }
  end

  on input
    call ai.respond with { tone: "helpful" }
  end
end`;

// Typing animation hook
function useTypingAnimation(text: string, speed: number = 30, isPlaying: boolean = true) {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!isPlaying) return;

        if (currentIndex < text.length) {
            const timer = setTimeout(() => {
                setDisplayedText(text.slice(0, currentIndex + 1));
                setCurrentIndex(currentIndex + 1);
            }, speed);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, text, speed, isPlaying]);

    const reset = () => {
        setDisplayedText("");
        setCurrentIndex(0);
    };

    return { displayedText, isComplete: currentIndex >= text.length, reset };
}

// Syntax highlighted line
function SyntaxLine({ line, lineNumber }: { line: string; lineNumber: number }) {
    // Simple syntax highlighting
    const highlightLine = (text: string) => {
        return text
            .replace(/(bot|end|on|when|call|with|as|say|memory|scope|persist|description)/g, '<span class="text-violet-400">$1</span>')
            .replace(/(input|user|true|false)/g, '<span class="text-blue-400">$1</span>')
            .replace(/(".*?")/g, '<span class="text-emerald-400">$1</span>')
            .replace(/(contains|lookup|analyze|respond|refund)/g, '<span class="text-amber-400">$1</span>')
            .replace(/(\{|\}|\[|\])/g, '<span class="text-white/50">$1</span>')
            .replace(/(crm|ai|stripe|customer|email|order_id|last_order|query|context|tone)/g, '<span class="text-cyan-400">$1</span>');
    };

    return (
        <div className="flex">
            <span className="w-8 text-right pr-4 text-white/20 select-none text-xs">
                {lineNumber}
            </span>
            <span
                className="text-white/80"
                dangerouslySetInnerHTML={{ __html: highlightLine(line) || "&nbsp;" }}
            />
        </div>
    );
}

export default function HiveLangShowcase() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [isPlaying, setIsPlaying] = useState(true);
    const { displayedText, isComplete, reset } = useTypingAnimation(HIVELANG_CODE, 25, isPlaying && isInView);

    const lines = displayedText.split("\n");

    const handleRestart = () => {
        reset();
        setIsPlaying(true);
    };

    return (
        <section
            ref={ref}
            className="relative py-24 md:py-32 overflow-hidden bg-[#08080c]"
        >
            {/* Background grid */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
                    backgroundSize: "24px 24px",
                }}
            />

            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-500/5 rounded-full blur-[150px]" />

            <div className="relative max-w-6xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 mb-6">
                        <Code2 className="w-4 h-4 text-violet-400" />
                        <span className="text-xs font-medium text-violet-400">Introducing HiveLang</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-4">
                        Code that thinks
                    </h2>
                    <p className="text-base md:text-lg text-white/40 max-w-xl mx-auto">
                        A declarative language designed for AI agents. Write once, deploy everywhere.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Code Editor */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="relative"
                    >
                        <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0f] shadow-2xl">
                            {/* Editor header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-[#0f0f14] border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                                        <div className="w-3 h-3 rounded-full bg-[#27ca40]" />
                                    </div>
                                    <span className="text-xs text-white/30 font-mono">support-agent.hive</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="p-1.5 rounded hover:bg-white/10 transition-colors"
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-3.5 h-3.5 text-white/40" />
                                        ) : (
                                            <Play className="w-3.5 h-3.5 text-white/40" />
                                        )}
                                    </button>
                                    <button
                                        onClick={handleRestart}
                                        className="p-1.5 rounded hover:bg-white/10 transition-colors"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5 text-white/40" />
                                    </button>
                                </div>
                            </div>

                            {/* Code area */}
                            <div className="p-4 font-mono text-sm leading-relaxed h-[400px] overflow-hidden">
                                {lines.map((line, i) => (
                                    <SyntaxLine key={i} line={line} lineNumber={i + 1} />
                                ))}
                                {/* Cursor */}
                                {!isComplete && (
                                    <motion.span
                                        className="inline-block w-2 h-4 bg-violet-400 ml-1"
                                        animate={{ opacity: [1, 0] }}
                                        transition={{ duration: 0.5, repeat: Infinity }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Reflection */}
                        <div className="absolute -bottom-6 left-6 right-6 h-6 bg-gradient-to-b from-violet-500/5 to-transparent rounded-b-xl blur-sm" />
                    </motion.div>

                    {/* Features */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6"
                    >
                        {[
                            {
                                icon: Terminal,
                                title: "Declarative syntax",
                                description: "Define what your agent should do, not how. HiveLang handles the complexity."
                            },
                            {
                                icon: Zap,
                                title: "Built-in memory",
                                description: "Persistent state management across conversations. Your agents remember."
                            },
                            {
                                icon: Code2,
                                title: "Tool orchestration",
                                description: "Call any API, database, or service. Chain tools together seamlessly."
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                                className="p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                                        <feature.icon className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white mb-1">{feature.title}</h3>
                                        <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={isInView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="pt-4"
                        >
                            <a
                                href="/docs/hivelang"
                                className="inline-flex items-center gap-2 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
                            >
                                Read the docs
                                <span className="text-violet-400/50">→</span>
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
