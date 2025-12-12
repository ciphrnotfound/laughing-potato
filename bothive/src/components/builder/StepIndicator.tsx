"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type BuilderStep = "template" | "configure" | "test" | "deploy";

interface StepIndicatorProps {
    currentStep: BuilderStep;
    onStepClick?: (step: BuilderStep) => void;
}

const STEPS: { id: BuilderStep; label: string; number: number }[] = [
    { id: "template", label: "Template", number: 1 },
    { id: "configure", label: "Configure", number: 2 },
    { id: "test", label: "Test", number: 3 },
    { id: "deploy", label: "Deploy", number: 4 },
];

export default function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

    return (
        <div className="flex items-center justify-center gap-2 py-6">
            {STEPS.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = step.id === currentStep;
                const isClickable = onStepClick && index <= currentIndex;

                return (
                    <React.Fragment key={step.id}>
                        {/* Step Circle */}
                        <motion.button
                            type="button"
                            onClick={() => isClickable && onStepClick?.(step.id)}
                            disabled={!isClickable}
                            className={cn(
                                "relative flex items-center gap-3 rounded-full px-4 py-2 text-sm font-medium transition-all",
                                isCompleted && "cursor-pointer",
                                isCurrent
                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30"
                                    : isCompleted
                                        ? "bg-violet-600/20 text-violet-300 hover:bg-violet-600/30"
                                        : "bg-white/5 text-white/40"
                            )}
                            whileHover={isClickable ? { scale: 1.02 } : {}}
                            whileTap={isClickable ? { scale: 0.98 } : {}}
                        >
                            <span
                                className={cn(
                                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                                    isCurrent
                                        ? "bg-white text-violet-600"
                                        : isCompleted
                                            ? "bg-violet-500 text-white"
                                            : "bg-white/10 text-white/50"
                                )}
                            >
                                {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.number}
                            </span>
                            <span className="hidden sm:inline">{step.label}</span>
                        </motion.button>

                        {/* Connector Line */}
                        {index < STEPS.length - 1 && (
                            <div
                                className={cn(
                                    "h-[2px] w-8 rounded-full transition-colors",
                                    index < currentIndex ? "bg-violet-500" : "bg-white/10"
                                )}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
