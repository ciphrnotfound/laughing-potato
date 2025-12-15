"use client";

import { useDeadlines } from "@/lib/deadline-context";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    Plus,
    Trash2,
    Bot,
    Terminal,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    X,
    AlertCircle
} from "lucide-react";
import { useState, useMemo } from "react";

// Helper to get days in month
function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
    const { deadlines, addDeadline, removeDeadline } = useDeadlines();

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [newTitle, setNewTitle] = useState("");
    const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month); // 0 = Sunday

    // Generate Calendar Grid
    const calendarDays = useMemo(() => {
        const days = [];
        // Padding for prev month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        // Actual days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    }, [year, month, daysInMonth, firstDay]);

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle || !selectedDate) return;

        // Set time to end of day for deadline logic usually, but here we just use the date
        const dateWithTime = new Date(selectedDate);
        dateWithTime.setHours(12, 0, 0, 0);

        addDeadline({
            title: newTitle,
            date: dateWithTime.toISOString(),
            priority: newPriority
        });

        setNewTitle("");
        setIsModalOpen(false);
    };

    // High Agency Bots Data (kept from previous version)
    const highAgencyBots = [
        {
            role: "Developer",
            icon: Terminal,
            agents: [
                { name: "Legacy Refactor", desc: "Refactors old code patterns." },
                { name: "On-Call Sentinel", desc: "Monitors logs 24/7." },
            ]
        },
        {
            role: "Business",
            icon: Briefcase,
            agents: [
                { name: "Deal Closer", desc: "Personalized follow-ups." },
                { name: "Headhunter AI", desc: "Drafts recruiting messages." },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#06070a] text-zinc-100 p-8 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-bold flex items-center gap-3 mb-2 text-white">
                            <CalendarIcon className="w-8 h-8 text-indigo-500" />
                            Command Center
                        </h1>
                        <p className="text-zinc-400 max-w-xl">
                            Sync your production schedule and delegate critical path tasks to autonomous agents.
                        </p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" className="w-5 h-5" alt="GCal" />
                        Sync Google Calendar
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Main Calendar Grid */}
                    <div className="lg:col-span-3 flex flex-col bg-zinc-900/20 border border-white/5 rounded-3xl overflow-hidden min-h-[600px]">

                        {/* Calendar Header */}
                        <div className="p-6 flex items-center justify-between border-b border-white/5">
                            <h2 className="text-2xl font-semibold text-white">
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h2>
                            <div className="flex gap-2">
                                <button onClick={handlePrevMonth} className="p-2 rounded-lg hover:bg-white/5"><ChevronLeft className="w-5 h-5" /></button>
                                <button onClick={handleNextMonth} className="p-2 rounded-lg hover:bg-white/5"><ChevronRight className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {/* Days Header */}
                        <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02]">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="py-3 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                            {calendarDays.map((date, i) => {
                                if (!date) return <div key={`empty-${i}`} className="border-b border-r border-white/5 bg-zinc-950/30" />;

                                const dateStr = date.toISOString().split('T')[0];
                                const daysDeadlines = deadlines.filter(d => d.date.startsWith(dateStr));
                                const isToday = new Date().toDateString() === date.toDateString();

                                return (
                                    <div
                                        key={i}
                                        onClick={() => handleDayClick(date)}
                                        className={cn(
                                            "border-b border-r border-white/5 p-3 relative cursor-pointer group transition-colors hover:bg-white/[0.02]",
                                            isToday && "bg-indigo-500/5"
                                        )}
                                    >
                                        <span className={cn(
                                            "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-2",
                                            isToday ? "bg-indigo-600 text-white" : "text-zinc-400 group-hover:text-white"
                                        )}>
                                            {date.getDate()}
                                        </span>

                                        <div className="space-y-1">
                                            {daysDeadlines.map(deadline => (
                                                <div key={deadline.id} className={cn(
                                                    "px-2 py-1 rounded-md text-[10px] font-medium truncate border",
                                                    deadline.priority === 'high' ? "bg-red-500/10 text-red-300 border-red-500/20" :
                                                        deadline.priority === 'medium' ? "bg-amber-500/10 text-amber-300 border-amber-500/20" :
                                                            "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                                                )}>
                                                    {deadline.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6 overflow-y-auto pr-2">

                        {/* Context Widget */}
                        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-900/20">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">Focus Mode</div>
                                    <div className="text-2xl font-bold">Q4 Sprint</div>
                                </div>
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                                    <Clock className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm opacity-80">
                                    <span>Tasks Remaining</span>
                                    <span>12</span>
                                </div>
                                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                                    <div className="h-full w-[65%] bg-white rounded-full" />
                                </div>
                            </div>
                        </div>

                        {/* Draggable Agents */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Available Agents</h3>
                            {highAgencyBots.map((category) => (
                                <div key={category.role} className="space-y-2">
                                    {category.agents.map((agent) => (
                                        <div key={agent.name} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-zinc-900/40 hover:border-indigo-500/30 cursor-grab active:cursor-grabbing transition-all hover:bg-zinc-900/60">
                                            <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400">
                                                <category.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-zinc-200">{agent.name}</div>
                                                <div className="text-xs text-zinc-500">{agent.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>

            {/* Add Deadline Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-3xl p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">
                                    New Deadline
                                    <span className="block text-sm font-normal text-zinc-500 mt-1">
                                        for {selectedDate?.toLocaleDateString()}
                                    </span>
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Task Title</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="e.g. Production Deployment"
                                        className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-600"
                                        value={newTitle}
                                        onChange={e => setNewTitle(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Severity Level</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['low', 'medium', 'high'] as const).map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setNewPriority(p)}
                                                className={cn(
                                                    "py-2 rounded-lg text-sm font-medium border transition-all capitalize",
                                                    newPriority === p && p === 'high' ? "bg-red-500/20 border-red-500 text-red-400" :
                                                        newPriority === p && p === 'medium' ? "bg-amber-500/20 border-amber-500 text-amber-400" :
                                                            newPriority === p && p === 'low' ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
                                                                "bg-zinc-900/50 border-white/5 text-zinc-500 hover:bg-white/5"
                                                )}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/20">
                                        Create Deadline
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
