"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";

export const TextGenerateEffect2 = ({
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
    const { theme } = useTheme();
    const isDark = theme === "dark";
    let wordsArray = words.split(" ");
    useEffect(() => {
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
    }, [scope.current]);

    const renderWords = () => {
        return (
            <motion.div ref={scope}>
                {wordsArray.map((word, idx) => (
                    <motion.span
                        key={word + idx}
                        className={cn(
                            idx > 2
                                ? isDark
                                    ? "text-transparent bg-gradient-to-br from-white/90 via-white to-white bg-clip-text"
                                    : "text-transparent bg-gradient-to-br from-violet-700 via-violet-500 to-purple-800 bg-clip-text"
                                : isDark
                                    ? "text-white"
                                    : "text-slate-900",
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
        <div className={cn("max-w-xl", className, isDark ? "text-white" : "text-slate-900")}>{renderWords()}</div>
    );
};
