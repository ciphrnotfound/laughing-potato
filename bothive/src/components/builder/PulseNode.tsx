
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Code, Terminal, MessageSquare, Database } from 'lucide-react';

const icons: Record<string, any> = {
    brain: Brain,
    code: Code,
    terminal: Terminal,
    chat: MessageSquare,
    database: Database,
};

export const PulseNode = memo(({ data, selected }: NodeProps) => {
    const Icon = icons[data.icon] || Brain;
    const isThinking = data.status === 'thinking';
    const isActive = data.status === 'active' || isThinking;
    const isError = data.status === 'error';

    return (
        <div className="relative group">
            {/* Thought Bubble */}
            <AnimatePresence>
                {isThinking && data.label && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: -45, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-300 px-3 py-1.5 rounded-full shadow-xl border border-zinc-200 dark:border-zinc-700 whitespace-nowrap z-50 flex items-center gap-1.5 font-medium"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        {data.thought || "Processing..."}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Node */}
            <motion.div
                animate={{
                    boxShadow: isThinking
                        ? "0 0 0 4px rgba(168, 85, 247, 0.4), 0 0 20px rgba(168, 85, 247, 0.2)"
                        : selected
                            ? "0 0 0 2px rgba(168, 85, 247, 0.5)"
                            : "0 0 0 0px rgba(0,0,0,0)",
                    scale: isThinking ? 1.05 : 1,
                    borderColor: isThinking ? "#a855f7" : isError ? "#ef4444" : "#e4e4e7"
                }}
                transition={{ duration: 0.3 }}
                className={`
          flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 
          border-2 border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors
          min-w-[180px]
          ${isThinking ? 'border-purple-500 dark:border-purple-500' : ''}
          ${isError ? 'border-red-500 dark:border-red-500' : ''}
        `}
            >
                <div className={`
          p-2 rounded-lg 
          ${isThinking ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}
        `}>
                    <Icon size={18} />
                </div>

                <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                        {data.label}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                        {data.role || "Agent"}
                    </span>
                </div>

                {/* Status Activity Dot */}
                {isActive && (
                    <div className="absolute top-2 right-2">
                        <span className="flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
                        </span>
                    </div>
                )}
            </motion.div>

            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-zinc-200 dark:bg-zinc-700 hover:bg-purple-500 transition-colors border-2 border-white dark:border-zinc-900" />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-zinc-200 dark:bg-zinc-700 hover:bg-purple-500 transition-colors border-2 border-white dark:border-zinc-900" />
        </div>
    );
});
