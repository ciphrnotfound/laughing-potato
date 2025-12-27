"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme-context";
import { useAppSession } from "@/lib/app-session-context";
import { cn } from "@/lib/utils";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { useGlassAlert } from "@/components/ui/glass-alert";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Activity,
  Bot,
  X,
  Mail,
  Copy,
  Check,
  Settings,
  Trash2,
  UserPlus,
  Crown,
  Shield,
  ArrowRight,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

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
  const { profile } = useAppSession();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { showAlert } = useGlassAlert();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/workspaces?include_members=true");
      const data = await response.json();

      if (data.workspaces) {
        const workspacesWithStats = data.workspaces.map((ws: any) => ({
          ...ws,
          member_count: ws.workspace_members?.length || 0,
          bots_count: Math.floor(Math.random() * 5) + 1 // Placeholder for now
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

      if (data.members) {
        setMembers(data.members);
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
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, slug })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create workspace");
      }

      await showAlert("Workspace Created", `"${name}" is ready for your team.`, "success");
      setShowCreateModal(false);
      fetchWorkspaces();
    } catch (error) {
      await showAlert("Creation Failed", error instanceof Error ? error.message : "Please try again.", "error");
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspace || !inviteEmail) return;

    setInviteLoading(true);
    try {
      const response = await fetch(`/api/workspaces/${selectedWorkspace.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail })
      });

      const data = await response.json();

      if (response.ok) {
        await showAlert("Invitation Sent", `${inviteEmail} will receive an invite.`, "success");
        setInviteEmail("");
        setShowInviteModal(false);
        fetchMembers(selectedWorkspace.id);
      } else {
        throw new Error(data.error || "Failed to send invitation");
      }
    } catch (error) {
      await showAlert("Invitation Failed", error instanceof Error ? error.message : "Please try again.", "error");
    } finally {
      setInviteLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (!selectedWorkspace) return;
    const link = `${window.location.origin}/join/${selectedWorkspace.slug}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner": return <Crown className="w-3 h-3" />;
      case "admin": return <Shield className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  return (
    <DashboardPageShell
      title="Workspaces"
      description="Collaborate with your team"
      headerAction={
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Workspace
        </button>
      }
    >
      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Workspaces Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 rounded-xl border border-white/5 bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      ) : filteredWorkspaces.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/5 mx-auto mb-4 flex items-center justify-center">
            <Users className="w-6 h-6 text-neutral-600" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No workspaces yet</h3>
          <p className="text-neutral-500 mb-6 text-sm">Create a workspace to start collaborating with your team.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            Create Workspace
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkspaces.map((ws, index) => (
            <motion.div
              key={ws.id}
              layoutId={`workspace-${ws.id}`}
              onClick={() => setSelectedWorkspace(ws)}
              className={cn(
                "group relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer",
                isDark
                  ? "bg-[#111113] border-white/5 hover:border-violet-500/30 hover:bg-[#161619]"
                  : "bg-white border-black/5 hover:border-violet-500/30 hover:bg-neutral-50 shadow-sm hover:shadow-md"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg",
                  isDark ? "bg-white/5" : "bg-neutral-100"
                )}>
                  <Users className={cn("w-6 h-6", isDark ? "text-violet-400" : "text-violet-600")} />
                </div>
              </div>

              <h3 className={cn("text-lg font-bold mb-1", isDark ? "text-white" : "text-neutral-900")}>
                {ws.name}
              </h3>
              <p className={cn("text-sm line-clamp-2 mb-6 h-10", isDark ? "text-neutral-400" : "text-neutral-600")}>
                {ws.description || "No description provided."}
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-xs font-medium text-neutral-500">
                    {ws.member_count} member{ws.member_count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-xs font-medium text-neutral-500">
                    {ws.bots_count} bot{ws.bots_count !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className={cn(
                "absolute top-6 right-6 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity",
                isDark ? "bg-white/5 text-white" : "bg-black/5 text-black"
              )}>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className={cn(
                "relative h-full w-full max-w-lg shadow-2xl border-l flex flex-col",
                isDark ? "bg-[#0c0c0f] border-white/10" : "bg-white border-black/10 shadow-lg"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sidebar Header */}
              <div className={cn(
                "p-6 border-b flex items-center justify-between bg-gradient-to-br",
                isDark ? "from-white/[0.02] to-transparent border-white/10" : "from-neutral-50 to-white border-black/5"
              )}>
                <div>
                  <h2 className={cn("text-xl font-bold", isDark ? "text-white" : "text-neutral-900")}>
                    {selectedWorkspace.name}
                  </h2>
                  <p className="text-sm text-neutral-500">Workspace Management</p>
                </div>
                <button
                  onClick={() => setSelectedWorkspace(null)}
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    isDark ? "hover:bg-white/5 text-neutral-400" : "hover:bg-neutral-100 text-neutral-600"
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {/* Description */}
                <div className="mb-8">
                  <h3 className={cn("text-xs font-bold uppercase tracking-widest mb-3", isDark ? "text-neutral-500" : "text-neutral-400")}>
                    Description
                  </h3>
                  <p className={cn("text-sm leading-relaxed", isDark ? "text-neutral-300" : "text-neutral-600")}>
                    {selectedWorkspace.description || "No description provided."}
                  </p>
                </div>

                {/* Team Members */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-neutral-500" : "text-neutral-400")}>
                      Team Members
                    </h3>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="text-xs font-bold text-violet-500 hover:text-violet-400 transition-colors uppercase tracking-widest flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Invite
                    </button>
                  </div>

                  <div className="space-y-3">
                    {members.length === 0 ? (
                      <div className={cn(
                        "p-8 rounded-xl border border-dashed text-center",
                        isDark ? "border-white/10" : "border-black/10"
                      )}>
                        <Users className="w-8 h-8 text-neutral-700 mx-auto mb-2 opacity-20" />
                        <p className="text-xs text-neutral-500">No members found</p>
                      </div>
                    ) : (
                      members.map((member) => (
                        <div
                          key={member.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border transition-all",
                            isDark ? "bg-white/[0.02] border-white/5" : "bg-neutral-50 border-black/5"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm",
                              isDark ? "bg-violet-500/10 text-violet-400" : "bg-violet-500 text-white"
                            )}>
                              {member.user.user_metadata?.name?.[0] || member.user.email[0]}
                            </div>
                            <div className="min-w-0">
                              <p className={cn("text-sm font-bold truncate", isDark ? "text-white" : "text-neutral-900")}>
                                {member.user.user_metadata?.name || member.user.email.split('@')[0]}
                              </p>
                              <p className="text-[10px] text-neutral-500 truncate">{member.user.email}</p>
                            </div>
                          </div>
                          <div className={cn(
                            "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            member.role === "owner" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                              member.role === "admin" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                                isDark ? "bg-white/5 text-neutral-400" : "bg-black/5 text-neutral-600"
                          )}>
                            {member.role}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {/* Invite Link Section */}
                <div className="mt-5 pt-5 border-t border-white/5">
                  <p className="text-xs text-neutral-500 mb-2">Invite Link</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/join/${selectedWorkspace.slug}`}
                      className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/5 rounded-lg text-sm text-neutral-400"
                    />
                    <button
                      onClick={copyInviteLink}
                      className="px-3 py-2 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-neutral-400" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md p-6 bg-[#0c0c0f] border border-white/10 rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white mb-5">Create Workspace</h2>

              <form onSubmit={handleCreateWorkspace} className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="My Team"
                    className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Description</label>
                  <textarea
                    name="description"
                    placeholder="What's this workspace for?"
                    rows={2}
                    className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">URL Slug</label>
                  <div className="flex">
                    <span className="px-3 py-2.5 bg-white/[0.02] border border-r-0 border-white/10 rounded-l-lg text-sm text-neutral-600">
                      bothive.cloud/join/
                    </span>
                    <input
                      type="text"
                      name="slug"
                      placeholder="my-team"
                      className="flex-1 px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-r-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 border border-white/10 text-neutral-400 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors"
                  >
                    Create
                  </button>
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
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm p-5 bg-[#0c0c0f] border border-white/10 rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-base font-semibold text-white mb-4">Invite Team Member</h2>

              <form onSubmit={handleInviteMember}>
                <div className="mb-4">
                  <label className="block text-sm text-neutral-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 py-2.5 border border-white/10 text-neutral-400 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="flex-1 py-2.5 bg-violet-500 text-white rounded-lg text-sm font-medium hover:bg-violet-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {inviteLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Send Invite
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardPageShell>
  );
}
