"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";

export const TextGenerateEffect = ({
    words,
    className,
    filter = true,
    duration = 0.5,
}: {
    words: string;
    className?: string;
    filter?: boolean;
    duration?: number;
}) => {
    const [scope, animate] = useAnimate();
    let wordsArray = words.split(" ");
    useEffect(() => {
        if (scope.current) {
            animate(
                "span",
                {
                    opacity: 1,
                    filter: filter ? "blur(0px)" : "none",
                },
                {
                    duration: duration ? duration : 1,
                    delay: stagger(0.2),
                }
            );
        }
    }, [animate, duration, filter, scope]);

    const renderWords = () => {
        return (
            <motion.div ref={scope}>
                {wordsArray.map((word, idx) => (
                    <motion.span
                        key={word + idx}
                        className={cn(
                            idx > 40
                                ? "text-transparent bg-clip-text bg-gradient-to-br from-violet-700 via-violet-500 to-indigo-600 dark:from-white/90 dark:via-white dark:to-white"
                                : "text-slate-900 dark:text-white",
                            "opacity-0"
                        )}
                        style={{
                            filter: filter ? "blur(10px)" : "none",
                        }}
                    >
                        {word}{" "}
                    </motion.span>
                ))}
            </motion.div>
        );
    };

    return (
        <div className={cn("font-medium text-slate-900 dark:text-white", className)}>{renderWords()}</div>
    );
};
