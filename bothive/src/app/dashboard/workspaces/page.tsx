"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAppSession } from "@/lib/app-session-context";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import ThemeToggle from "@/components/ThemeToggle";
import ProfessionalAlert from "@/components/ui/game-alert";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Activity,
  Bot,
  X
} from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  member_count?: number;
  bots_count?: number;
  recent_activity?: number;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  user: {
    id: string;
    email: string;
    user_metadata: {
      name?: string;
      avatar_url?: string;
    };
  };
}

export default function WorkspacesPage() {
  const router = useRouter();
  const { profile } = useAppSession();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [showAlert, setShowAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
    autoClose?: number;
  } | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/workspaces?include_members=true");
      const data = await response.json();

      if (data.workspaces) {
        const workspacesWithStats = data.workspaces.map((ws: Workspace) => ({
          ...ws,
          member_count: (ws as any).members?.length || 0,
          bots_count: Math.floor(Math.random() * 20),
          recent_activity: Math.floor(Math.random() * 100)
        }));
        setWorkspaces(workspacesWithStats);
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (workspaceId: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`);
      const data = await response.json();

      if (data.workspace?.workspace_members) {
        setMembers(data.workspace.workspace_members);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const filteredWorkspaces = workspaces.filter(ws =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ws.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const slug = formData.get("slug") as string;

    try {
      const { data, error } = await supabase
        .from("workspaces")
        .insert({
          name,
          description,
          slug,
          owner_id: profile?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setShowAlert({
        type: "success",
        title: "Workspace Created!",
        message: `"${name}" has been created successfully.`,
        autoClose: 3000
      });

      setShowCreateModal(false);
      fetchWorkspaces();
    } catch (error) {
      setShowAlert({
        type: "error",
        title: "Creation Failed",
        message: error instanceof Error ? error.message : "Failed to create workspace"
      });
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspace || !inviteEmail) return;

    try {
      const response = await fetch(`/api/workspaces/${selectedWorkspace.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail })
      });

      if (response.ok) {
        setShowAlert({
          type: "success",
          title: "Invitation Sent!",
          message: `Invitation sent to ${inviteEmail}`,
          autoClose: 3000
        });
        setInviteEmail("");
        setShowInviteModal(false);
        fetchMembers(selectedWorkspace.id);
      } else {
        throw new Error("Failed to send invitation");
      }
    } catch (error) {
      setShowAlert({
        type: "error",
        title: "Invitation Failed",
        message: error instanceof Error ? error.message : "Failed to send invitation"
      });
    }
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner": return isDark ? "bg-violet-500/20 text-violet-400" : "bg-violet-100 text-violet-700";
      case "admin": return isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700";
      default: return isDark ? "bg-white/10 text-white/60" : "bg-black/[0.05] text-black/60";
    }
  };

  return (
    <DashboardPageShell
      title="Workspaces"
      description="Collaborate with your team"
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
            New Workspace
          </motion.button>
        </div>
      }
    >
      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="relative">
          <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5", textSecondary)} />
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-colors focus:border-violet-500",
              inputBg, textPrimary
            )}
          />
        </div>
      </motion.div>

      {/* Workspaces Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={cn("h-48 rounded-2xl border animate-pulse", cardBg)}
            />
          ))}
        </div>
      ) : filteredWorkspaces.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className={cn(
            "w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center",
            isDark ? "bg-white/[0.03]" : "bg-black/[0.03]"
          )}>
            <Users className={cn("w-8 h-8", textSecondary)} />
          </div>
          <h3 className={cn("text-lg font-semibold mb-2", textPrimary)}>No workspaces yet</h3>
          <p className={cn("mb-6", textSecondary)}>Create your first workspace to start collaborating</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className={cn(
              "px-6 py-3 rounded-xl font-medium",
              isDark
                ? "bg-white text-black hover:bg-white/90"
                : "bg-black text-white hover:bg-black/90"
            )}
          >
            Create Workspace
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredWorkspaces.map((workspace, index) => (
              <motion.div
                key={workspace.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ y: -4 }}
                className={cn(
                  "p-5 rounded-2xl border cursor-pointer transition-all",
                  cardBg,
                  isDark ? "hover:border-white/[0.12]" : "hover:border-black/[0.12] hover:shadow-md"
                )}
                onClick={() => {
                  setSelectedWorkspace(workspace);
                  fetchMembers(workspace.id);
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className={cn("text-lg font-semibold mb-1 truncate", textPrimary)}>
                      {workspace.name}
                    </h3>
                    {workspace.description && (
                      <p className={cn("text-sm line-clamp-2", textSecondary)}>
                        {workspace.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                    )}
                  >
                    <MoreVertical className={cn("w-4 h-4", textSecondary)} />
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className={cn("text-xl font-bold", textPrimary)}>{workspace.member_count}</p>
                    <p className={cn("text-xs", textSecondary)}>Members</p>
                  </div>
                  <div className="text-center">
                    <p className={cn("text-xl font-bold", textPrimary)}>{workspace.bots_count}</p>
                    <p className={cn("text-xs", textSecondary)}>Bots</p>
                  </div>
                  <div className="text-center">
                    <p className={cn("text-xl font-bold", textPrimary)}>{workspace.recent_activity}</p>
                    <p className={cn("text-xs", textSecondary)}>Activity</p>
                  </div>
                </div>

                {/* Members Avatars */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(3, workspace.member_count || 0))].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium",
                          isDark
                            ? "bg-violet-500/20 border-[#0a0a0f] text-violet-400"
                            : "bg-violet-100 border-white text-violet-700"
                        )}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                    {(workspace.member_count || 0) > 3 && (
                      <div className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium",
                        isDark
                          ? "bg-white/10 border-[#0a0a0f] text-white/60"
                          : "bg-black/[0.05] border-white text-black/60"
                      )}>
                        +{(workspace.member_count || 0) - 3}
                      </div>
                    )}
                  </div>
                  <div className={cn("flex items-center gap-1 text-xs", textSecondary)}>
                    <Activity className="w-3 h-3" />
                    Active
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Workspace Detail Modal */}
      <AnimatePresence>
        {selectedWorkspace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedWorkspace(null)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={cn(
                "relative w-full max-w-2xl rounded-2xl border overflow-hidden",
                isDark ? "bg-[#0a0a0f] border-white/[0.1]" : "bg-white border-black/[0.1]"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={cn(
                "p-6 border-b",
                isDark ? "border-white/[0.06]" : "border-black/[0.06]"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={cn("text-xl font-bold", textPrimary)}>{selectedWorkspace.name}</h2>
                    <p className={textSecondary}>{selectedWorkspace.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedWorkspace(null)}
                    className={cn("p-2 rounded-lg transition-colors", isDark ? "hover:bg-white/10" : "hover:bg-black/5")}
                  >
                    <X className={cn("w-5 h-5", textSecondary)} />
                  </button>
                </div>
              </div>

              {/* Members */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={cn("text-lg font-semibold", textPrimary)}>Team Members</h3>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowInviteModal(true)}
                    className={cn(
                      "px-4 py-2 rounded-xl font-medium flex items-center gap-2 text-sm",
                      isDark
                        ? "bg-white text-black hover:bg-white/90"
                        : "bg-black text-white hover:bg-black/90"
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    Invite
                  </motion.button>
                </div>

                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border",
                        isDark
                          ? "border-white/[0.06] bg-white/[0.01]"
                          : "border-black/[0.06] bg-black/[0.01]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-medium",
                          isDark ? "bg-violet-500/20 text-violet-400" : "bg-violet-100 text-violet-700"
                        )}>
                          {member.user.user_metadata?.name?.[0] || member.user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className={cn("font-medium", textPrimary)}>
                            {member.user.user_metadata?.name || member.user.email}
                          </p>
                          <p className={cn("text-sm", textSecondary)}>{member.user.email}</p>
                        </div>
                      </div>
                      <span className={cn("px-3 py-1 text-xs font-medium rounded-lg capitalize", getRoleColor(member.role))}>
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Workspace Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={cn(
                "relative w-full max-w-md p-6 rounded-2xl border",
                isDark ? "bg-[#0a0a0f] border-white/[0.1]" : "bg-white border-black/[0.1]"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={cn("text-xl font-bold mb-6", textPrimary)}>Create Workspace</h2>

              <form onSubmit={handleCreateWorkspace}>
                <div className="space-y-4">
                  <div>
                    <label className={cn("block text-sm font-medium mb-2", textPrimary)}>Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="My Workspace"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border outline-none transition-colors focus:border-violet-500",
                        inputBg, textPrimary
                      )}
                      required
                    />
                  </div>

                  <div>
                    <label className={cn("block text-sm font-medium mb-2", textPrimary)}>Description</label>
                    <textarea
                      name="description"
                      placeholder="What's this workspace about?"
                      rows={3}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border outline-none transition-colors focus:border-violet-500 resize-none",
                        inputBg, textPrimary
                      )}
                    />
                  </div>

                  <div>
                    <label className={cn("block text-sm font-medium mb-2", textPrimary)}>URL Slug</label>
                    <div className="flex">
                      <span className={cn(
                        "px-4 py-3 rounded-l-xl border-y border-l text-sm",
                        isDark
                          ? "bg-white/[0.03] border-white/[0.08] text-white/50"
                          : "bg-black/[0.02] border-black/[0.1] text-black/50"
                      )}>
                        bothive.app/
                      </span>
                      <input
                        type="text"
                        name="slug"
                        placeholder="my-workspace"
                        className={cn(
                          "flex-1 px-4 py-3 rounded-r-xl border outline-none transition-colors focus:border-violet-500",
                          inputBg, textPrimary
                        )}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-medium border transition-colors",
                      isDark
                        ? "border-white/[0.1] text-white hover:bg-white/5"
                        : "border-black/[0.1] text-black hover:bg-black/5"
                    )}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className={cn(
                      "flex-1 py-3 rounded-xl font-medium transition-all",
                      isDark
                        ? "bg-white text-black hover:bg-white/90"
                        : "bg-black text-white hover:bg-black/90"
                    )}
                  >
                    Create Workspace
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && selectedWorkspace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={cn(
                "relative w-full max-w-md p-6 rounded-2xl border",
                isDark ? "bg-[#0a0a0f] border-white/[0.1]" : "bg-white border-black/[0.1]"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={cn("text-xl font-bold mb-6", textPrimary)}>Invite Member</h2>

              <form onSubmit={handleInviteMember}>
                <div>
                  <label className={cn("block text-sm font-medium mb-2", textPrimary)}>Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border outline-none transition-colors focus:border-violet-500",
                      inputBg, textPrimary
                    )}
                    required
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-medium border transition-colors",
                      isDark
                        ? "border-white/[0.1] text-white hover:bg-white/5"
                        : "border-black/[0.1] text-black hover:bg-black/5"
                    )}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className={cn(
                      "flex-1 py-3 rounded-xl font-medium transition-all",
                      isDark
                        ? "bg-white text-black hover:bg-white/90"
                        : "bg-black text-white hover:bg-black/90"
                    )}
                  >
                    Send Invite
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert */}
      <AnimatePresence>
        {showAlert && (
          <ProfessionalAlert
            open={!!showAlert}
            title={showAlert?.title || ""}
            message={showAlert?.message}
            onClose={() => setShowAlert(null)}
            variant={showAlert?.type || "info"}
            autoClose={showAlert?.autoClose}
          />
        )}
      </AnimatePresence>
    </DashboardPageShell>
  );
}
