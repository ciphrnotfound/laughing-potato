"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type DropdownItem = {
    title: string;
    description: string;
    href: string;
    icon?: any;
};

interface NavDropdownProps {
    title: string;
    items: DropdownItem[];
    scrolled: boolean;
}

export const NavDropdown = ({ title, items, scrolled }: NavDropdownProps) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div
            className="relative h-full flex items-center"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/10",
                    isOpen ? "text-[#5D6BFF]" : "text-[#1F2758]/75 dark:text-white/65",
                )}
            >
                {title}
                <ChevronDown
                    className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        isOpen ? "rotate-180" : ""
                    )}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 w-80 p-2 bg-white dark:bg-[#0a0a0f] border border-black/5 dark:border-white/10 rounded-2xl shadow-xl backdrop-blur-3xl z-50 overflow-hidden"
                    >
                        <div className="grid gap-1">
                            {items.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="group flex items-start gap-4 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-black/90 dark:text-white/90">
                                                {item.title}
                                            </span>
                                            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-violet-500" />
                                        </div>
                                        <p className="text-xs text-black/50 dark:text-white/50 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
