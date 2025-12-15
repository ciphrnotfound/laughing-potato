"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Mail, Briefcase, Calendar, CheckCircle, Clock, AlertCircle, Plus, Send, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types
interface Task {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date: string;
}

interface Message {
    id: string;
    content: string;
    created_at: string;
    sender_type: 'owner' | 'employee';
}

interface Employee {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    avatar_url?: string;
}

export default function EmployeeProfilePage() {
    const { id } = useParams();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeTab, setActiveTab] = useState<'tasks' | 'messages'>('tasks');
    const [newMessage, setNewMessage] = useState("");
    const [showTaskModal, setShowTaskModal] = useState(false);
    const supabase = createClientComponentClient();

    const fetchEmployeeDetails = async () => {
        const { data } = await supabase.from('employees').select('*').eq('id', id).single();
        if (data) setEmployee(data);
    };

    const fetchTasks = async () => {
        const { data } = await supabase.from('employee_tasks').select('*').eq('assigned_to', id).order('created_at', { ascending: false });
        if (data) setTasks(data);
    };

    const fetchMessages = async () => {
        // In a real app, filtering by recipient + sender logic would be more complex
        const { data } = await supabase.from('employee_messages').select('*').eq('recipient_employee_id', id).order('created_at', { ascending: true });
        if (data) setMessages(data);
    };

    useEffect(() => {
        fetchEmployeeDetails();
        fetchTasks();
        fetchMessages();

        // Subscribe to realtime updates
        const channel = supabase
            .channel(`employee_${id}`)
            .on('postgres_changes', { event: '*', schema: 'public', filter: `assigned_to=eq.${id}`, table: 'employee_tasks' }, fetchTasks)
            .on('postgres_changes', { event: '*', schema: 'public', filter: `recipient_employee_id=eq.${id}`, table: 'employee_messages' }, fetchMessages)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);



    const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newTask = {
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            due_date: formData.get('due_date'),
            owner_id: (await supabase.auth.getUser()).data.user?.id,
            assigned_to: id,
            status: 'todo'
        };

        const { error } = await supabase.from('employee_tasks').insert(newTask);
        if (error) toast.error("Failed to assign task");
        else {
            toast.success("Task assigned successfully");
            setShowTaskModal(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const { error } = await supabase.from('employee_messages').insert({
            content: newMessage,
            recipient_employee_id: id,
            owner_id: (await supabase.auth.getUser()).data.user?.id,
            sender_type: 'owner'
        });

        if (error) toast.error("Failed to send message");
        else setNewMessage("");
    };

    if (!employee) return <div className="p-8"><div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" /></div>;

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header Profile */}
            <div className="bg-white dark:bg-[#0a0a0f] border border-black/5 dark:border-white/10 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-violet-500/20">
                        {employee.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">{employee.name}</h1>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {employee.email}</span>
                            <span className="flex items-center gap-1 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full text-xs font-medium text-foreground"><Briefcase className="w-3 h-3" /> {employee.role}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
                        <Trash2 className="w-4 h-4" /> Terminate
                    </button>
                    <button
                        onClick={() => setShowTaskModal(true)}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-violet-500/20 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Assign Task
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Tasks */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-[#0a0a0f] border border-black/5 dark:border-white/5 p-6 rounded-3xl">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-emerald-500" /> Completed
                            </div>
                            <div className="text-3xl font-bold">{tasks.filter(t => t.status === 'done').length}</div>
                        </div>
                        <div className="bg-white dark:bg-[#0a0a0f] border border-black/5 dark:border-white/5 p-6 rounded-3xl">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                                <Clock className="w-4 h-4 text-amber-500" /> Pending
                            </div>
                            <div className="text-3xl font-bold">{tasks.filter(t => t.status !== 'done').length}</div>
                        </div>
                        <div className="bg-white dark:bg-[#0a0a0f] border border-black/5 dark:border-white/5 p-6 rounded-3xl">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                                <AlertCircle className="w-4 h-4 text-red-500" /> Overdue
                            </div>
                            <div className="text-3xl font-bold">0</div>
                        </div>
                    </div>

                    {/* Tasks List */}
                    <div className="bg-white dark:bg-[#0a0a0f] border border-black/5 dark:border-white/5 rounded-3xl p-8 min-h-[500px]">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-violet-500" /> Assigned Tasks
                        </h2>
                        <div className="space-y-4">
                            {tasks.length === 0 ? (
                                <div className="text-center py-20 text-muted-foreground">No active tasks assigned.</div>
                            ) : (
                                tasks.map(task => (
                                    <div key={task.id} className="p-4 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex items-start justify-between group hover:border-violet-500/20 transition-colors">
                                        <div>
                                            <h3 className="font-semibold mb-1">{task.title}</h3>
                                            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                                            <div className="flex gap-2">
                                                <span className={cn(
                                                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                                    task.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                                                        task.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                                            'bg-blue-500/10 text-blue-500'
                                                )}>
                                                    {task.priority}
                                                </span>
                                                <span className="text-xs text-muted-foreground bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {new Date(task.due_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={cn(
                                                "text-xs font-medium px-2 py-1 rounded-lg",
                                                task.status === 'done' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                            )}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Messages */}
                <div className="bg-white dark:bg-[#0a0a0f] border border-black/5 dark:border-white/5 rounded-3xl p-6 flex flex-col h-[calc(100vh-200px)] sticky top-8">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/5 dark:border-white/5">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Mail className="w-5 h-5 text-violet-500" /> Messages
                        </h2>
                        <span className="text-xs text-muted-foreground">Direct Chat</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="text-center text-sm text-muted-foreground py-10">Start a conversation with {employee.name.split(' ')[0]}</div>
                        ) : (
                            messages.map(msg => (
                                <div key={msg.id} className={cn(
                                    "max-w-[85%] p-3 rounded-2xl text-sm",
                                    msg.sender_type === 'owner'
                                        ? "bg-violet-600 text-white ml-auto rounded-br-none"
                                        : "bg-black/5 dark:bg-white/10 rounded-bl-none"
                                )}>
                                    {msg.content}
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleSendMessage} className="relative">
                        <input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                        />
                        <button type="submit" className="absolute right-2 top-2 p-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Task Modal */}
            <AnimatePresence>
                {showTaskModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-[#0a0a0f] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold mb-6">Assign New Task</h2>
                            <form onSubmit={handleAddTask} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Title</label>
                                    <input name="title" required className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="e.g. Fix Bot Navigation Error" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Description</label>
                                    <textarea name="description" rows={3} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Details about the task..." />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Due Date</label>
                                        <input name="due_date" type="date" required className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Priority</label>
                                        <select name="priority" className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500">
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 font-medium">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-lg shadow-violet-500/20">Assign</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
