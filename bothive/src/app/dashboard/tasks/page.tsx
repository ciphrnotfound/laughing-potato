"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Plus, Filter, Calendar, User, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

interface Task {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date: string;
    assigned_to: string;
    assigned_employee?: { name: string; avatar_url?: string };
}

interface Employee {
    id: string;
    name: string;
}

const COLUMNS = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-500/10 text-gray-500' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500/10 text-blue-500' },
    { id: 'review', title: 'Review', color: 'bg-amber-500/10 text-amber-500' },
    { id: 'done', title: 'Done', color: 'bg-emerald-500/10 text-emerald-500' },
];

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filterEmployee, setFilterEmployee] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const supabase = createClientComponentClient();

    const fetchTasks = async () => {
        // In production join with employees, simplified here
        const { data: tasksData } = await supabase.from('employee_tasks').select('*').order('created_at', { ascending: false });

        if (tasksData) {
            // Fetch employee details manually for now since we don't have a view/join setup in client
            const empIds = [...new Set(tasksData.map(t => t.assigned_to).filter(Boolean))];
            if (empIds.length > 0) {
                const { data: emps } = await supabase.from('employees').select('id, name').in('id', empIds);
                const empMap = new Map(emps?.map(e => [e.id, e]));

                const enrichedTasks = tasksData.map(t => ({
                    ...t,
                    assigned_employee: empMap.get(t.assigned_to)
                }));
                setTasks(enrichedTasks);
            } else {
                setTasks(tasksData);
            }
        }
    };

    const fetchEmployees = async () => {
        const { data } = await supabase.from('employees').select('id, name');
        if (data) setEmployees(data);
    };

    useEffect(() => {
        fetchTasks();
        fetchEmployees();

        const channel = supabase
            .channel('tasks_board')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'employee_tasks' }, fetchTasks)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    const handleUpdateStatus = async (taskId: string, newStatus: string) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));

        const { error } = await supabase.from('employee_tasks').update({ status: newStatus }).eq('id', taskId);
        if (error) {
            toast.error("Failed to update status");
            fetchTasks(); // Revert
        }
    };

    const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newTask = {
            title: formData.get('title'),
            description: formData.get('description'),
            assigned_to: formData.get('assigned_to'),
            priority: formData.get('priority'),
            due_date: formData.get('due_date'),
            status: 'todo',
            owner_id: (await supabase.auth.getUser()).data.user?.id
        };

        const { error } = await supabase.from('employee_tasks').insert(newTask);
        if (error) toast.error("Failed to create task");
        else {
            toast.success("Task created");
            setShowAddModal(false);
        }
    };

    const filteredTasks = filterEmployee === 'all'
        ? tasks
        : tasks.filter(t => t.assigned_to === filterEmployee);

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen overflow-x-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Task Board</h1>
                    <p className="text-muted-foreground">Manage ongoing work across your entire team.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <select
                            className="bg-transparent border-none focus:outline-none text-sm"
                            value={filterEmployee}
                            onChange={(e) => setFilterEmployee(e.target.value)}
                        >
                            <option value="all">All Employees</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-violet-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        New Task
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-w-[1000px]">
                {COLUMNS.map(col => (
                    <div key={col.id} className="flex flex-col h-full">
                        <div className={`flex items-center justify-between px-4 py-3 rounded-xl mb-4 ${col.color} bg-opacity-20`}>
                            <h3 className="font-semibold">{col.title}</h3>
                            <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
                                {filteredTasks.filter(t => t.status === col.id).length}
                            </span>
                        </div>

                        <div className="flex-1 space-y-4">
                            {filteredTasks.filter(t => t.status === col.id).map(task => (
                                <motion.div
                                    key={task.id}
                                    layoutId={task.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white dark:bg-[#0a0a0f] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={cn(
                                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider",
                                            task.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                                                task.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                                    'bg-blue-500/10 text-blue-500'
                                        )}>
                                            {task.priority}
                                        </span>

                                        {/* Simplified Move Actions */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            {col.id !== 'todo' && (
                                                <button onClick={() => handleUpdateStatus(task.id, 'todo')} className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-violet-500 hover:text-white" title="Move to Todo">
                                                    <span className="text-xs">←</span>
                                                </button>
                                            )}
                                            {col.id !== 'done' && (
                                                <button onClick={() => handleUpdateStatus(task.id, 'done')} className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-violet-500 hover:text-white" title="Move to Done">
                                                    <span className="text-xs">→</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <h4 className="font-medium mb-1 line-clamp-2">{task.title}</h4>
                                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{task.description}</p>

                                    <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[10px] text-white font-bold">
                                                {task.assigned_employee?.name?.charAt(0) || '?'}
                                            </div>
                                            <span className="text-xs text-muted-foreground truncate max-w-[80px]">{task.assigned_employee?.name || 'Unassigned'}</span>
                                        </div>
                                        {task.due_date && (
                                            <span className={cn(
                                                "text-xs flex items-center gap-1",
                                                new Date(task.due_date) < new Date() ? "text-red-500 font-medium" : "text-muted-foreground"
                                            )}>
                                                <Clock className="w-3 h-3" />
                                                {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Task Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-[#0a0a0f] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold mb-6">Create New Task</h2>
                            <form onSubmit={handleAddTask} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Title</label>
                                    <input name="title" required className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Task title" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Description</label>
                                    <textarea name="description" rows={2} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Details..." />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Assign To</label>
                                    <select name="assigned_to" required className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500">
                                        <option value="">Select Employee</option>
                                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
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
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 font-medium">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-lg shadow-violet-500/20">Create Task</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
