import React from "react";
import { CheckCircle2, Circle, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReasoningStep {
    thought: string;
    action: string;
    actionInput: Record<string, any>;
    observation: string;
    timestamp: number;
}

interface ReasoningStepsProps {
    steps: ReasoningStep[];
    isThinking?: boolean;
}

export function ReasoningSteps({ steps, isThinking }: ReasoningStepsProps) {
    if (steps.length === 0 && !isThinking) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/40">
                <span className="h-px flex-1 bg-white/10" />
                <span>Agent Reasoning</span>
                <span className="h-px flex-1 bg-white/10" />
            </div>

            <div className="space-y-3">
                {steps.map((step, idx) => (
                    <div key={idx} className="relative pl-4 border-l border-white/10 pb-4 last:pb-0 last:border-l-0">
                        {/* Timeline dot */}
                        <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-indigo-500/20 ring-1 ring-indigo-500/50" />

                        <div className="space-y-2">
                            {/* Thought */}
                            <div className="rounded-xl bg-white/5 p-3 text-sm text-white/80">
                                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                                    Thought
                                </span>
                                {step.thought}
                            </div>

                            {/* Action */}
                            <div className="flex items-start gap-2 text-xs">
                                <div className="mt-0.5 rounded bg-indigo-500/10 px-1.5 py-0.5 font-mono text-indigo-300">
                                    {step.action}
                                </div>
                                <div className="font-mono text-white/40">
                                    {JSON.stringify(step.actionInput)}
                                </div>
                            </div>

                            {/* Observation */}
                            <div className="rounded-xl border border-white/5 bg-black/20 p-3 text-xs font-mono text-emerald-200/80">
                                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-emerald-500/50">
                                    Observation
                                </span>
                                {step.observation}
                            </div>
                        </div>
                    </div>
                ))}

                {isThinking && (
                    <div className="relative pl-4">
                        <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 animate-pulse rounded-full bg-indigo-400" />
                        <div className="flex items-center gap-2 text-xs text-indigo-300">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Thinking...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
