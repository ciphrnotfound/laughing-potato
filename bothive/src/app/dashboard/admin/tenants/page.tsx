"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2,
    Plus,
    Search,
    Users,
    Bot,
    Activity,
    MoreVertical,
    Check,
    X,
    AlertCircle,
    Mail,
    Calendar,
    TrendingUp,
    Shield
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import ThemeToggle from "@/components/ThemeToggle";

interface Tenant {
    id: string;
    name: string;
    slug: string;
    plan: "free" | "pro" | "enterprise";
    status: "active" | "suspended" | "pending";
    owner_email: string;
    member_count: number;
    bots_count: number;
    total_executions: number;
    created_at: string;
    last_active_at: string;
}

// Mock data for demonstration
const MOCK_TENANTS: Tenant[] = [
    {
        id: "1",
        name: "TechFlow Inc",
        slug: "techflow",
        plan: "enterprise",
        status: "active",
        owner_email: "admin@techflow.io",
        member_count: 24,
        bots_count: 12,
        total_executions: 145000,
        created_at: "2024-01-15T00:00:00Z",
        last_active_at: "2024-12-07T10:00:00Z"
    },
    {
        id: "2",
        name: "StartupXYZ",
        slug: "startupxyz",
        plan: "pro",
        status: "active",
        owner_email: "founder@startupxyz.com",
        member_count: 8,
        bots_count: 5,
        total_executions: 23400,
        created_at: "2024-03-20T00:00:00Z",
        last_active_at: "2024-12-06T18:30:00Z"
    },
    {
        id: "3",
        name: "Acme Corp",
        slug: "acme",
        plan: "enterprise",
        status: "active",
        owner_email: "it@acme.com",
        member_count: 56,
        bots_count: 34,
        total_executions: 892000,
        created_at: "2023-11-05T00:00:00Z",
        last_active_at: "2024-12-07T09:45:00Z"
    },
    {
        id: "4",
        name: "DevStudio",
        slug: "devstudio",
        plan: "free",
        status: "pending",
        owner_email: "hello@devstudio.dev",
        member_count: 2,
        bots_count: 1,
        total_executions: 340,
        created_at: "2024-12-01T00:00:00Z",
        last_active_at: "2024-12-05T14:00:00Z"
    }
];

export default function TenantsPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        // Simulate API fetch
        setTimeout(() => {
            setTenants(MOCK_TENANTS);
            setLoading(false);
        }, 500);
    }, []);

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.owner_email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: tenants.length,
        active: tenants.filter(t => t.status === "active").length,
        enterprise: tenants.filter(t => t.plan === "enterprise").length,
        totalUsers: tenants.reduce((acc, t) => acc + t.member_count, 0)
    };

    // Theme-aware styles
    const cardBg = isDark
        ? "bg-white/[0.02] border-white/[0.06]"
        : "bg-white border-black/[0.06] shadow-sm";
    const textPrimary = isDark ? "text-white" : "text-black";
    const textSecondary = isDark ? "text-white/60" : "text-black/60";
    const inputBg = isDark
        ? "bg-white/[0.03] border-white/[0.08]"
        : "bg-white border-black/[0.1]";

    const getPlanColor = (plan: string) => {
        switch (plan) {
            case "enterprise": return isDark ? "bg-violet-500/20 text-violet-400" : "bg-violet-100 text-violet-700";
            case "pro": return isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700";
            default: return isDark ? "bg-white/10 text-white/60" : "bg-black/[0.05] text-black/60";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700";
            case "suspended": return isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700";
            default: return isDark ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-700";
        }
    };

    return (
        <DashboardPageShell
            title="Tenants"
            description="Manage all organizations on your platform"
            headerAction={
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowCreateModal(true)}
                        className={cn(
                            "px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all",
                            isDark
                                ? "bg-white text-black hover:bg-white/90"
                                : "bg-black text-white hover:bg-black/90"
                        )}
                    >
                        <Plus className="w-4 h-4" />
                        Add Tenant
                    </motion.button>
                </div>
            }
        >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("p-5 rounded-2xl border", cardBg)}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-xl", isDark ? "bg-violet-500/10" : "bg-violet-50")}>
                            <Building2 className="w-5 h-5 text-violet-500" />
                        </div>
                        <div>
                            <p className={cn("text-2xl font-bold", textPrimary)}>{stats.total}</p>
                            <p className={cn("text-sm", textSecondary)}>Total Tenants</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className={cn("p-5 rounded-2xl border", cardBg)}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-xl", isDark ? "bg-emerald-500/10" : "bg-emerald-50")}>
                            <Activity className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className={cn("text-2xl font-bold", textPrimary)}>{stats.active}</p>
                            <p className={cn("text-sm", textSecondary)}>Active</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn("p-5 rounded-2xl border", cardBg)}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-xl", isDark ? "bg-blue-500/10" : "bg-blue-50")}>
                            <Shield className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className={cn("text-2xl font-bold", textPrimary)}>{stats.enterprise}</p>
                            <p className={cn("text-sm", textSecondary)}>Enterprise</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={cn("p-5 rounded-2xl border", cardBg)}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-xl", isDark ? "bg-pink-500/10" : "bg-pink-50")}>
                            <Users className="w-5 h-5 text-pink-500" />
                        </div>
                        <div>
                            <p className={cn("text-2xl font-bold", textPrimary)}>{stats.totalUsers}</p>
                            <p className={cn("text-sm", textSecondary)}>Total Users</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
            >
                <div className="relative">
                    <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5", textSecondary)} />
                    <input
                        type="text"
                        placeholder="Search tenants by name, slug, or owner email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-colors focus:border-violet-500",
                            inputBg, textPrimary
                        )}
                    />
                </div>
            </motion.div>

            {/* Tenants Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className={cn("rounded-2xl border overflow-hidden", cardBg)}
            >
                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto" />
                    </div>
                ) : filteredTenants.length === 0 ? (
                    <div className="text-center py-16">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center",
                            isDark ? "bg-white/[0.03]" : "bg-black/[0.03]"
                        )}>
                            <Building2 className={cn("w-8 h-8", textSecondary)} />
                        </div>
                        <p className={cn("font-medium mb-1", textPrimary)}>No tenants found</p>
                        <p className={textSecondary}>Try adjusting your search</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={cn(
                                    "border-b",
                                    isDark ? "border-white/[0.06]" : "border-black/[0.06]"
                                )}>
                                    <th className={cn("text-left px-6 py-4 text-sm font-medium", textSecondary)}>Organization</th>
                                    <th className={cn("text-left px-6 py-4 text-sm font-medium", textSecondary)}>Plan</th>
                                    <th className={cn("text-left px-6 py-4 text-sm font-medium", textSecondary)}>Status</th>
                                    <th className={cn("text-left px-6 py-4 text-sm font-medium", textSecondary)}>Users</th>
                                    <th className={cn("text-left px-6 py-4 text-sm font-medium", textSecondary)}>Bots</th>
                                    <th className={cn("text-left px-6 py-4 text-sm font-medium", textSecondary)}>Executions</th>
                                    <th className={cn("text-left px-6 py-4 text-sm font-medium", textSecondary)}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTenants.map((tenant, index) => (
                                    <motion.tr
                                        key={tenant.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={cn(
                                            "border-b transition-colors cursor-pointer",
                                            isDark
                                                ? "border-white/[0.03] hover:bg-white/[0.02]"
                                                : "border-black/[0.03] hover:bg-black/[0.01]"
                                        )}
                                        onClick={() => setSelectedTenant(tenant)}
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className={cn("font-medium", textPrimary)}>{tenant.name}</p>
                                                <p className={cn("text-sm", textSecondary)}>{tenant.owner_email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-2.5 py-1 rounded-lg text-xs font-medium capitalize", getPlanColor(tenant.plan))}>
                                                {tenant.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-2.5 py-1 rounded-lg text-xs font-medium capitalize", getStatusColor(tenant.status))}>
                                                {tenant.status}
                                            </span>
                                        </td>
                                        <td className={cn("px-6 py-4", textPrimary)}>{tenant.member_count}</td>
                                        <td className={cn("px-6 py-4", textPrimary)}>{tenant.bots_count}</td>
                                        <td className={cn("px-6 py-4", textPrimary)}>{tenant.total_executions.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <button className={cn(
                                                "p-2 rounded-lg transition-colors",
                                                isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                                            )}>
                                                <MoreVertical className={cn("w-4 h-4", textSecondary)} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Tenant Detail Modal */}
            <AnimatePresence>
                {selectedTenant && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedTenant(null)}
                    >
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={cn(
                                "relative w-full max-w-lg p-6 rounded-2xl border",
                                isDark ? "bg-[#0a0a0f] border-white/[0.1]" : "bg-white border-black/[0.1]"
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className={cn("text-xl font-bold", textPrimary)}>{selectedTenant.name}</h2>
                                    <p className={textSecondary}>/{selectedTenant.slug}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedTenant(null)}
                                    className={cn("p-2 rounded-lg transition-colors", isDark ? "hover:bg-white/10" : "hover:bg-black/5")}
                                >
                                    <X className={cn("w-5 h-5", textSecondary)} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className={cn("w-4 h-4", textSecondary)} />
                                    <span className={textPrimary}>{selectedTenant.owner_email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className={cn("w-4 h-4", textSecondary)} />
                                    <span className={textSecondary}>Created {new Date(selectedTenant.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Activity className={cn("w-4 h-4", textSecondary)} />
                                    <span className={textSecondary}>Last active {new Date(selectedTenant.last_active_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-6">
                                <div className={cn("p-4 rounded-xl text-center", isDark ? "bg-white/[0.03]" : "bg-black/[0.02]")}>
                                    <p className={cn("text-xl font-bold", textPrimary)}>{selectedTenant.member_count}</p>
                                    <p className={cn("text-xs", textSecondary)}>Users</p>
                                </div>
                                <div className={cn("p-4 rounded-xl text-center", isDark ? "bg-white/[0.03]" : "bg-black/[0.02]")}>
                                    <p className={cn("text-xl font-bold", textPrimary)}>{selectedTenant.bots_count}</p>
                                    <p className={cn("text-xs", textSecondary)}>Bots</p>
                                </div>
                                <div className={cn("p-4 rounded-xl text-center", isDark ? "bg-white/[0.03]" : "bg-black/[0.02]")}>
                                    <p className={cn("text-xl font-bold", textPrimary)}>{(selectedTenant.total_executions / 1000).toFixed(1)}k</p>
                                    <p className={cn("text-xs", textSecondary)}>Executions</p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button className={cn(
                                    "flex-1 py-3 rounded-xl font-medium transition-colors",
                                    isDark
                                        ? "bg-white text-black hover:bg-white/90"
                                        : "bg-black text-white hover:bg-black/90"
                                )}>
                                    View Dashboard
                                </button>
                                <button className={cn(
                                    "px-4 py-3 rounded-xl font-medium transition-colors border",
                                    isDark
                                        ? "border-white/[0.1] text-white hover:bg-white/5"
                                        : "border-black/[0.1] text-black hover:bg-black/5"
                                )}>
                                    Settings
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardPageShell>
    );
}
