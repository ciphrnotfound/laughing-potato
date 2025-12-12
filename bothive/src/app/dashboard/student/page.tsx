"use client";

import { motion } from "framer-motion";
import {
    BookOpen,
    GraduationCap,
    PenTool,
    Brain,
    Clock,
    Calendar,
    Search,
    FileText,
    Quote,
    Library,
    ChevronRight,
    Sparkles,
    Plus
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MotionLink = motion(Link);

const StudyToolCard = ({
    title,
    description,
    icon: Icon,
    color,
    href,
    delay
}: {
    title: string;
    description: string;
    icon: any;
    color: string;
    href: string;
    delay: number;
}) => (
    <MotionLink
        href={href}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-6 hover:bg-zinc-900/60 transition-all hover:-translate-y-1 block"
    >
        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity", color.replace("text-", "bg-"))} />
        <div className="flex items-start justify-between mb-4">
            <div className={cn("p-3 rounded-2xl bg-zinc-900 border border-white/5", color)}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="p-2 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-4 h-4 text-zinc-400" />
            </div>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </MotionLink>
);

export default function StudentDashboard() {
    const assignments = [
        { subject: "History 101", title: "The Industrial Revolution Essay", due: "Tomorrow", priority: "high" },
        { subject: "Calculus II", title: "Problem Set 4", due: "3 Days", priority: "medium" },
        { subject: "Computer Science", title: "Data Structures Project", due: "1 Week", priority: "low" },
    ];

    return (
        <div className="min-h-screen w-full bg-[#06070a] text-zinc-100 font-sans selection:bg-indigo-500/30">
            <div className="max-w-7xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div className="space-y-2">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase"
                        >
                            <GraduationCap className="w-3 h-3" />
                            Student Hub
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-bold text-white tracking-tight"
                        >
                            Your Study Space
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-zinc-400 max-w-xl"
                        >
                            AI-powered tools to help you research faster, write better, and stay organized.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex gap-3"
                    >
                        <Link href="/dashboard" className="px-5 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
                            Back to Main
                        </Link>
                        <button className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors font-medium shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Ask AI Tutor
                        </button>
                    </motion.div>
                </div>

                {/* Assignments Ticker */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-4 h-4 text-zinc-500" />
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Upcoming Deadlines</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {assignments.map((assignment, i) => (
                            <motion.div
                                key={assignment.title}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="p-4 rounded-2xl border border-white/5 bg-zinc-900/30 flex items-center justify-between"
                            >
                                <div>
                                    <div className="text-xs font-medium text-indigo-400 mb-1">{assignment.subject}</div>
                                    <div className="text-sm font-medium text-white">{assignment.title}</div>
                                </div>
                                <div className={cn(
                                    "px-2 py-1 rounded-md text-xs font-medium border",
                                    assignment.priority === "high" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                        assignment.priority === "medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                            "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                )}>
                                    {assignment.due}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <StudyToolCard
                        title="Research Assistant"
                        description="Find credible sources, summarize papers, and extract key arguments in seconds."
                        icon={Search}
                        color="text-blue-400"
                        href="/dashboard/student/research"
                        delay={0.5}
                    />
                    <StudyToolCard
                        title="Essay Architect"
                        description="Generate outlines, brainstorm thesis statements, and refine your arguments."
                        icon={PenTool}
                        color="text-amber-400"
                        href="/dashboard/student/writing"
                        delay={0.6}
                    />
                    <StudyToolCard
                        title="Socratic Tutor"
                        description="Master complex concepts through interactive dialogue and problem solving."
                        icon={Brain}
                        color="text-purple-400"
                        href="/dashboard/student/tutor"
                        delay={0.7}
                    />
                    <StudyToolCard
                        title="Flashcard Generator"
                        description="Turn your notes or textbooks into study decks instantly."
                        icon={Library}
                        color="text-emerald-400"
                        href="/dashboard/student/flashcards"
                        delay={0.8}
                    />
                    <StudyToolCard
                        title="Citation Machine"
                        description="Auto-format references in APA, MLA, Chicago, and Harvard styles."
                        icon={Quote}
                        color="text-rose-400"
                        href="/dashboard/student/citations"
                        delay={0.9}
                    />
                    <StudyToolCard
                        title="Study Planner"
                        description="Optimize your schedule and break down large assignments into tasks."
                        icon={Clock}
                        color="text-cyan-400"
                        href="/dashboard/student/planner"
                        delay={1.0}
                    />
                </div>

                {/* Hivemind Recommendations */}
                <div className="mb-12">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        Hivemind Recommendations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "The Socratic Debater",
                                desc: "Doesn't just answer. It challenges your thesis to strengthen your arguments before you write.",
                                tags: ["Writing", "Logic"],
                                color: "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            },
                            {
                                title: "Lecture Alchemist",
                                desc: "Upload raw audio. Get a summary, key dates, and a ready-to-use Anki flashcard deck.",
                                tags: ["Productivity", "Memory"],
                                color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            },
                            {
                                title: "Scholarship Hunter",
                                desc: "Background agent that scans for grants matching your profile and drafts the essays.",
                                tags: ["Finance", "Assistant"],
                                color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                            }
                        ].map((bot, i) => (
                            <motion.div
                                key={bot.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + i * 0.1 }}
                                className="group p-6 rounded-3xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn("px-3 py-1 rounded-full text-xs font-semibold border", bot.color)}>
                                        Recommended
                                    </div>
                                    <button className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{bot.title}</h3>
                                <p className="text-sm text-zinc-400 mb-6 flex-1">{bot.desc}</p>
                                <div className="flex gap-2">
                                    {bot.tags.map(tag => (
                                        <span key={tag} className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded-md">{tag}</span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Quick Tip */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="p-6 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-indigo-500 text-white">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-white font-medium">New: Wolfram Alpha Integration</h3>
                            <p className="text-sm text-zinc-400">Solve complex math and science problems directly in your research chat.</p>
                        </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors">
                        Try Demo
                    </button>
                </motion.div>

            </div>
        </div>
    );
}
