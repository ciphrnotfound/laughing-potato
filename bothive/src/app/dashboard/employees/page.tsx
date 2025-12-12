"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, MoreVertical, Mail, Calendar, User, Briefcase, Trash2, Edit2 } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

// Layout wrapper would be imported here in a real app, assuming this renders inside DashboardLayout

interface Employee {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive' | 'on_leave';
    avatar_url?: string;
    skills?: string[];
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const supabase = createClientComponentClient();

    useEffect(() => {
        fetchEmployees();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('employees_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, () => {
                fetchEmployees();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchEmployees = async () => {
        try {
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setEmployees(data || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error("Failed to load employees");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newEmployee = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            role: formData.get('role') as string,
            status: 'active',
            owner_id: (await supabase.auth.getUser()).data.user?.id
        };

        try {
            const { error } = await supabase.from('employees').insert(newEmployee);
            if (error) throw error;
            toast.success("Employee added successfully");
            setShowAddModal(false);
        } catch (error) {
            console.error('Error adding employee:', error);
            toast.error("Failed to add employee");
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">My Workforce</h1>
                    <p className="text-muted-foreground">Manage your team of experts and AI handlers.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-violet-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Hire Employee
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-4 mb-8 bg-white dark:bg-white/5 p-2 rounded-2xl border border-black/5 dark:border-white/5">
                <Search className="w-5 h-5 text-muted-foreground ml-3" />
                <input
                    type="text"
                    placeholder="Search by name, role, or email..."
                    className="flex-1 bg-transparent border-none focus:outline-none p-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Employees Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 rounded-3xl bg-black/5 dark:bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-violet-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No employees yet</h3>
                    <p className="text-muted-foreground mb-6">Start building your dream team to manage your bots.</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="text-violet-500 hover:text-violet-400 font-medium"
                    >
                        Add your first employee
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEmployees.map((emp) => (
                        <Link href={`/dashboard/employees/${emp.id}`} key={emp.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -4 }}
                                className="group relative bg-white dark:bg-[#0a0a0f] border border-black/5 dark:border-white/10 rounded-3xl p-6 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5 transition-all cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{emp.name}</h3>
                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                                {emp.role}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${emp.status === 'active' ? 'bg-emerald-500' : 'bg-gray-500'
                                        }`} />
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Mail className="w-4 h-4" />
                                        {emp.email}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Briefcase className="w-4 h-4" />
                                        <span>0 Active Tasks</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">View Profile</span>
                                    <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-violet-500 group-hover:text-white transition-colors">
                                        <MoreVertical className="w-4 h-4" />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Add Employee Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-[#0a0a0f] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold mb-6">Hire Employee</h2>
                            <form onSubmit={handleAddEmployee} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Full Name</label>
                                    <input name="name" required className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="e.g. Alex Smith" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Email Address</label>
                                    <input name="email" type="email" required className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="alex@bothive.io" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Role</label>
                                    <select name="role" className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500">
                                        <option value="Developer">Bot Developer</option>
                                        <option value="Manager">Project Manager</option>
                                        <option value="Support">Support Agent</option>
                                        <option value="Analyst">Data Analyst</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 font-medium">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-lg shadow-violet-500/20">Hire Now</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
