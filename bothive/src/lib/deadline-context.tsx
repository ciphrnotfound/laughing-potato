"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface Deadline {
    id: string;
    title: string;
    date: string; // ISO string
    priority: "high" | "medium" | "low";
    relatedBotId?: string; // Optional: Link a bot to help with this task
}

interface DeadlineContextType {
    deadlines: Deadline[];
    addDeadline: (deadline: Omit<Deadline, "id">) => void;
    removeDeadline: (id: string) => void;
}

const DeadlineContext = createContext<DeadlineContextType | undefined>(undefined);

export function DeadlineProvider({ children }: { children: React.ReactNode }) {
    const [deadlines, setDeadlines] = useState<Deadline[]>(() => {
        if (typeof window === "undefined") return [];
        try {
            const saved = localStorage.getItem("bothive_deadlines");
            if (saved) return JSON.parse(saved);
        } catch {}
        // Default / Example Data
        return [
            {
                id: "1",
                title: "Q4 Roadmap Review",
                date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
                priority: "high" as const,
                relatedBotId: "legacy-refactor"
            }
        ];
    });

    // Save to local storage on change
    useEffect(() => {
        try {
            localStorage.setItem("bothive_deadlines", JSON.stringify(deadlines));
        } catch {}
    }, [deadlines]);

    const addDeadline = (deadline: Omit<Deadline, "id">) => {
        setDeadlines((prev) => [
            ...prev,
            { ...deadline, id: Math.random().toString(36).substr(2, 9) }
        ]);
    };

    const removeDeadline = (id: string) => {
        setDeadlines((prev) => prev.filter((d) => d.id !== id));
    };

    return (
        <DeadlineContext.Provider value={{ deadlines, addDeadline, removeDeadline }}>
            {children}
        </DeadlineContext.Provider>
    );
}

export function useDeadlines() {
    const context = useContext(DeadlineContext);
    if (context === undefined) {
        throw new Error("useDeadlines must be used within a DeadlineProvider");
    }
    return context;
}
