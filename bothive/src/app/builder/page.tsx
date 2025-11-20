"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  CloudUpload,
  Code2,
  Database,
  FileText,
  Gauge,
  Keyboard,
  LifeBuoy,
  LineChart,
  Loader2,
  MessageCircle,
  MessageSquare,
  PlayCircle,
  RefreshCw,
  Rocket,
  Settings2,
  Sparkles,
  Store,
  Users,
  Webhook,
  Zap,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { ProfessionalAlert } from "@/components/ui/glass-alert";
import { compileHive } from "@/lib/hive-compiler";
import { supabase } from "@/lib/supabase";
import { cn, slugify } from "@/lib/utils";
import type { AgentMessage, BotCapability, RunResult, ToolManifestEntry } from "@/lib/agentTypes";
import AmbientBackdrop from "@/components/AmbientBackdrop";

import type { EditorProps, OnChange } from "@monaco-editor/react";

const Editor = dynamic<EditorProps>(() => import("@monaco-editor/react").then((mod) => mod.default), {
  ssr: false,
});

const EMPTY_TEMPLATE = `bot WelcomeAgent
  description "Greets the user and explains how to interact with the hive"

  on input
    say """
      Hello {input.name}! I'm your WelcomeAgent. Ask me anything about our swarm.
    """
  end
end
`;

const MODEL_OPTIONS = [
  { label: "OpenAI GPT-4o Mini", value: "gpt-4o-mini" },
  { label: "Anthropic Claude 3.5", value: "claude-3.5" },
];

type BotTemplate = {
  id: "general" | "coding" | "study" | "reminder" | "publisher";
  label: string;
  blurb: string;
  capabilities: BotCapability[];
  systemPrompt?: string;
  toolManifest?: ToolManifestEntry[];
  memoryStrategy?: string;
};

const DEFAULT_SYSTEM_PROMPT =
  "You are a Bothive autonomous agent. Collaborate with specialist bots via shared memory and tool calls. Always explain your reasoning briefly before acting.";

const TEMPLATE_SYSTEM_PROMPTS: Record<BotTemplate["id"], string> = {
  general:
    "You are the Bothive Concierge, a proactive generalist who understands the swarm's goals. Summarize, plan, and delegate. When collaborating, note which specialist should handle follow-up tasks and record decisions in shared memory.",
  coding:
    "You are the Bothive Forge, a senior engineer focused on high-quality TypeScript and modern tooling. Produce diffs, list caveats, and request reviews from teammates when work spans multiple files. Prefer actionable checklists.",
  study:
    "You are the Bothive Mentor, an adaptive tutor. Break concepts into digestible modules, generate spaced-repetition prompts, and track student progress via shared memory keys.",
  reminder:
    "You are the RemindMe Orchestrator. Gather tenant context, confirm reminder slots with users, and schedule WhatsApp sends backed by the tenant's data store. Always log state updates to Firebase before dispatching a message.",
  publisher:
    "You are the Hive Broadcaster, a social campaign specialist. Craft concise posts, confirm platform tone, and publish updates using the connected Twitter/X account. If credentials or context are missing, ask the user to connect or supply details before posting.",
};

const TEMPLATE_TOOL_MANIFEST: Record<BotTemplate["id"], ToolManifestEntry[]> = {
  general: [
    { capability: "general.respond", tool: "general.respond", enabled: true, description: "Conversational Grok-powered helper" },
  ],
  coding: [
    { capability: "coding.generate", tool: "coding.generateSnippet", enabled: true, description: "Generate typed code snippets" },
    { capability: "coding.review", tool: "coding.reviewSnippet", enabled: true, description: "Review code and flag issues" },
  ],
  study: [
    { capability: "study.tutor", tool: "study.explain", enabled: true, description: "Explain topics with structure" },
    { capability: "study.quiz", tool: "study.quizBuilder", enabled: true, description: "Generate flashcards and quizzes" },
  ],
  reminder: [
    {
      capability: "integrations.firebase.read",
      tool: "integrations.firebase.read",
      enabled: true,
      description: "Fetch tenant reminder payloads from Firebase",
    },
    {
      capability: "integrations.firebase.write",
      tool: "integrations.firebase.write",
      enabled: true,
      description: "Persist reminder state back to Firebase",
    },
    {
      capability: "integrations.whatsapp.send",
      tool: "integrations.whatsapp.send",
      enabled: true,
      description: "Dispatch WhatsApp notifications via tenant credentials",
    },
  ],
  publisher: [
    {
      capability: "social.publish",
      tool: "social.publish",
      enabled: true,
      description: "Publish to the connected Twitter/X account",
    },
    {
      capability: "social.publish",
      tool: "social.schedule",
      enabled: true,
      description: "Queue Twitter/X posts for scheduled delivery",
    },
    {
      capability: "general.respond",
      tool: "general.respond",
      enabled: true,
      description: "Hold planning conversations before posting",
    },
  ],
};

const TEMPLATE_SOURCES: Record<BotTemplate["id"], string> = {
  general: `bot NebulaConcierge
  description "Greets users and offers guidance inside the Hive"

  on input
    say """
      Welcome to the Nebula Forge. Ask me about capabilities, pricing, or recommended templates.
    """
  end
end
`,
  coding: `bot ForgeMentor
  description "Pair-programming companion with actionable feedback"

  on input
    say """
      Drop your coding task and I'll respond with code, cautions, and next steps.
    """
  end
end
`,
  study: `bot StarTutor
  description "Friendly tutor that breaks topics into cosmic lessons"

  on input
    say """
      Tell me what you want to learn. I'll craft bite-sized explanations and follow-up exercises.
    """
  end
end
`,
  reminder: `bot RemindMeOrchestrator
  description "Coordinates tenant reminders using Firebase and WhatsApp"

  memory namespace "remindme"

  on input
    set $tenantId to input.tenantId
    call integrations.firebase.read with {
      document: "tenants/" + $tenantId + "/reminders/" + input.reminderId
    }
    say """
      I found a reminder for {input.recipientName} set for {input.sendAt}. Scheduling the WhatsApp send now.
    """
    call integrations.whatsapp.send with {
      to: input.phone,
      body: input.message
    }
    call integrations.firebase.write with {
      document: "tenants/" + $tenantId + "/reminders/" + input.reminderId,
      data: {
        status: "sent",
        sentAt: now()
      }
    }
  end
end
`,
  publisher: `bot HiveAutoScheduler
  description "Generates or schedules Twitter/X updates automatically"

  memory shared
    scheduled store key "hive.autoposter.queue"
  end

  on input
    if input.text?
      remember input.text as tweet
    else
      say "Drafting fresh copy for X…"
      call general.respond with {
        prompt: "Write a concise Twitter/X update announcing Bothive progress. Include one emoji and a short CTA. Keep it under 240 characters."
      } as draft
      remember draft.output as tweet
    end

    if tweet.blank?
      say "I need a topic or draft before I can post."
      stop
    end

    set $publishAt to input.publishAt ?? format("%sT09:00:00Z", today())
    call social.schedule with {
      platform: "twitter",
      content: tweet,
      scheduledFor: $publishAt,
      source: "trend_bot"
    } as record

    call shared.scheduled.append with {
      createdAt: now(),
      tweet,
      scheduledFor: $publishAt,
      postId: record.data.id
    }

    say "Queued an X update for {$publishAt}."
  end
end
`,
};

const POSTGREST_NO_ROWS_CODE = "PGRST116";
const POSTGRES_UNDEFINED_COLUMN = "42703";

const AVAILABLE_TOOL_CATALOG: Array<{
  tool: string;
  capability: BotCapability;
  label: string;
  description: string;
}> = [
  {
    tool: "general.recordTask",
    capability: "general.respond",
    label: "Record task",
    description: "Capture a follow-up or TODO in the shared automation queue.",
  },
  {
    tool: "calendar.scheduleDailyStandup",
    capability: "general.respond",
    label: "Schedule standup",
    description: "Book a short meeting slot and log a reminder task.",
  },
  {
    tool: "crm.logInteraction",
    capability: "general.respond",
    label: "Log CRM interaction",
    description: "Save a customer touchpoint and queue a follow-up.",
  },
  {
    tool: "crm.createLead",
    capability: "general.respond",
    label: "Create lead",
    description: "Add a new lead with auto-generated nurture tasks.",
  },
  {
    tool: "content.draftStatusUpdate",
    capability: "general.respond",
    label: "Draft status update",
    description: "Generate a weekly status summary with highlights/blockers.",
  },
  {
    tool: "content.generateSocialThread",
    capability: "general.respond",
    label: "Social thread",
    description: "Produce a four-post announcement thread.",
  },
  {
    tool: "coding.generateSnippet",
    capability: "coding.generate",
    label: "Generate snippet",
    description: "Draft strongly typed code snippets from a spec.",
  },
  {
    tool: "coding.reviewSnippet",
    capability: "coding.review",
    label: "Review snippet",
    description: "Audit code and highlight improvements.",
  },
  {
    tool: "study.explain",
    capability: "study.tutor",
    label: "Explain concept",
    description: "Break down a topic into digestible lessons.",
  },
  {
    tool: "study.quizBuilder",
    capability: "study.quiz",
    label: "Quiz builder",
    description: "Generate flashcards or quizzes for spaced repetition.",
  },
  {
    tool: "integrations.firebase.read",
    capability: "integrations.firebase.read",
    label: "Fetch tenant data",
    description: "Query a tenant's Firebase store for reminders or user context.",
  },
  {
    tool: "integrations.firebase.write",
    capability: "integrations.firebase.write",
    label: "Update tenant data",
    description: "Persist reminder status or metadata back to the tenant Firebase store.",
  },
  {
    tool: "integrations.whatsapp.send",
    capability: "integrations.whatsapp.send",
    label: "Send WhatsApp message",
    description: "Deliver reminders to end users over WhatsApp via tenant credentials.",
  },
  {
    tool: "social.publish",
    capability: "social.publish",
    label: "Publish to Twitter/X",
    description: "Post updates to the authenticated Twitter/X account using social.publish.",
  },
  {
    tool: "social.schedule",
    capability: "social.publish",
    label: "Schedule Twitter/X post",
    description: "Create a scheduled or draft post in the social queue using social.schedule.",
  },
];

function isNoRowError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  return "code" in error && (error as { code?: string }).code === POSTGREST_NO_ROWS_CODE;
}

const TEMPLATE_MEMORY_STRATEGY: Record<BotTemplate["id"], string> = {
  general: "ephemeral",
  coding: "ephemeral",
  study: "ephemeral",
  reminder: "session",
  publisher: "ephemeral",
};

const MEMORY_STRATEGY_OPTIONS = [
  { label: "Ephemeral run", value: "ephemeral" },
  { label: "Session scope", value: "session" },
  { label: "Persistent hive", value: "persistent" },
];

const CAPABILITY_LABELS: Record<BotCapability, string> = {
  "general.respond": "General response",
  "coding.generate": "Code generation",
  "coding.review": "Code review",
  "study.tutor": "Tutor",
  "study.quiz": "Quiz builder",
  "integrations.firebase.read": "Firebase read",
  "integrations.firebase.write": "Firebase write",
  "integrations.whatsapp.send": "WhatsApp send",
  "social.publish": "Social publish",
};

type TenantStepTone = "required" | "recommended" | "upcoming";

const TENANT_BADGE_STYLES: Record<TenantStepTone, string> = {
  required: "border border-rose-500/30 bg-rose-500/10 text-rose-200",
  recommended: "border border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  upcoming: "border border-slate-500/30 bg-slate-500/10 text-slate-200",
};

const TENANT_SETUP_STEPS: Array<{
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: TenantStepTone;
  badgeLabel: string;
}> = [
  {
    id: "firebase",
    title: "Firebase adapter",
    description: "Store service account credentials or REST token so the bot can read and write tenant reminders.",
    icon: Database,
    tone: "required",
    badgeLabel: "Required",
  },
  {
    id: "whatsapp",
    title: "WhatsApp adapter",
    description: "Connect the tenant's WhatsApp provider (Twilio / Meta Cloud) and map sending numbers to workspace users.",
    icon: Webhook,
    tone: "required",
    badgeLabel: "Required",
  },
  {
    id: "scheduler",
    title: "Scheduler webhook",
    description: "Register the external scheduler callback so timed jobs invoke this bot with reminder payloads.",
    icon: Clock,
    tone: "upcoming",
    badgeLabel: "Coming soon",
  },
];

const BOT_TEMPLATES: BotTemplate[] = [
  {
    id: "reminder",
    label: "RemindMe orchestrator",
    blurb: "Tenant-scoped reminder flow using Firebase data and WhatsApp delivery.",
    capabilities: ["integrations.firebase.read", "integrations.firebase.write", "integrations.whatsapp.send"],
    systemPrompt: TEMPLATE_SYSTEM_PROMPTS.reminder,
    toolManifest: TEMPLATE_TOOL_MANIFEST.reminder,
    memoryStrategy: TEMPLATE_MEMORY_STRATEGY.reminder,
  },
  {
    id: "general",
    label: "General assistant",
    blurb: "Flexible conversational helper for quick tasks and summaries.",
    capabilities: ["general.respond"],
    systemPrompt: TEMPLATE_SYSTEM_PROMPTS.general,
    toolManifest: TEMPLATE_TOOL_MANIFEST.general,
    memoryStrategy: TEMPLATE_MEMORY_STRATEGY.general,
  },
  {
    id: "coding",
    label: "Coding buddy",
    blurb: "Generates and reviews snippets with developer-focused prompts.",
    capabilities: ["coding.generate", "coding.review"],
    systemPrompt: TEMPLATE_SYSTEM_PROMPTS.coding,
    toolManifest: TEMPLATE_TOOL_MANIFEST.coding,
    memoryStrategy: TEMPLATE_MEMORY_STRATEGY.coding,
  },
  {
    id: "study",
    label: "Study companion",
    blurb: "Explains topics and builds flashcards for learners.",
    capabilities: ["study.tutor", "study.quiz"],
    systemPrompt: TEMPLATE_SYSTEM_PROMPTS.study,
    toolManifest: TEMPLATE_TOOL_MANIFEST.study,
    memoryStrategy: TEMPLATE_MEMORY_STRATEGY.study,
  },
  {
    id: "publisher",
    label: "X autoposter",
    blurb: "Drafts and publishes updates to Twitter/X using connected credentials.",
    capabilities: ["general.respond", "social.publish"],
    systemPrompt: TEMPLATE_SYSTEM_PROMPTS.publisher,
    toolManifest: TEMPLATE_TOOL_MANIFEST.publisher,
    memoryStrategy: TEMPLATE_MEMORY_STRATEGY.publisher,
  },
];

type TestScenario = {
  id: string;
  title: string;
  description: string;
  capability: BotCapability;
  payload: Record<string, unknown> | string;
};

const TEST_SCENARIOS: Record<BotTemplate["id"], TestScenario[]> = {
  general: [
    {
      id: "general-plan-day",
      title: "Plan a balanced day",
      description: "Create a balanced study and rest schedule for a busy student.",
      capability: "general.respond",
      payload: {
        prompt:
          "Help me plan a productive weekday with time for classes, homework, and at least two short breaks.",
      },
    },
    {
      id: "general-summarize-article",
      title: "Summarize research article",
      description: "Turn dense research notes into a quick summary with takeaways.",
      capability: "general.respond",
      payload: {
        prompt:
          "Summarize the key findings from a research article about AI-assisted studying and list two actionable takeaways.",
      },
    },
  ],
  coding: [
    {
      id: "coding-generate-endpoint",
      title: "Generate API handler",
      description: "Draft a TypeScript endpoint with validation and response shape.",
      capability: "coding.generate",
      payload: {
        language: "typescript",
        task: "Create an Express route that validates a POST body with zod and returns a JSON success message.",
      },
    },
    {
      id: "coding-review-snippet",
      title: "Review debounce utility",
      description: "Spot issues in an existing helper function.",
      capability: "coding.review",
      payload: {
        code: "function debounce(fn, delay){ let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(fn(...args), delay); }; }",
      },
    },
  ],
  study: [
    {
      id: "study-explain-physics",
      title: "Explain physics concept",
      description: "Break down Newton's Second Law for an intermediate learner.",
      capability: "study.tutor",
      payload: {
        topic: "Newton's Second Law",
        level: "intermediate",
      },
    },
    {
      id: "study-quiz-biology",
      title: "Generate biology flashcards",
      description: "Create quick flashcards on cell organelles.",
      capability: "study.quiz",
      payload: {
        subject: "Cell organelles and their functions",
      },
    },
  ],
  reminder: [
    {
      id: "reminder-daily-check",
      title: "Confirm daily reminder",
      description: "Ensure the WhatsApp notification is scheduled with tenant context.",
      capability: "integrations.whatsapp.send",
      payload: {
        to: "+15555550123",
        body: "Reminder: Send the daily summary to the Growth channel.",
      },
    },
    {
      id: "reminder-sync-firebase",
      title: "Sync Firebase payload",
      description: "Load reminder payload from tenant Firebase namespace and acknowledge.",
      capability: "integrations.firebase.read",
      payload: {
        document: "tenants/sample-tenant/reminders/sample",
      },
    },
  ],
  publisher: [
    {
      id: "publisher-post-launch",
      title: "Post product launch update",
      description: "Schedule a celebratory update to Twitter/X.",
      capability: "social.publish",
      payload: {
        platform: "twitter",
        content: "We just shipped the Bothive X autoposter! Follow for launch threads and insights. 🚀",
        scheduledFor: "2025-01-01T09:00:00Z",
      },
    },
  ],
};

type CompileDiagnostic = {
  message: string;
  line: number;
  column: number;
  severity: "error" | "warning";
};

type CompileMetadata = {
  name: string;
  description?: string;
  tools: string[];
  memory: string[];
};

interface CompileResult {
  code: string;
  diagnostics: CompileDiagnostic[];
  metadata: CompileMetadata;
}

interface BotVersion {
  id: string;
  version: number;
  created_at: string;
  model: string;
  description: string | null;
  label?: string | null;
  published_at?: string | null;
}

type AlertState = {
  variant: "success" | "error" | "info";
  title: string;
  message?: string;
  autoClose?: number;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
};

type SectionId = "overview" | "build" | "play" | "deploy" | "store";

const SECTION_COPY: Record<SectionId, { title: string; description: string }> = {
  overview: {
    title: "My Feed",
    description: "Central hub for your agent's status, highlights, and quick diagnostics.",
  },
  build: {
    title: "Groups",
    description: "Curate personas, tool manifests, and Hive source in a cohesive workspace.",
  },
  play: {
    title: "Messages",
    description: "Run live conversations, validate capabilities, and iterate quickly.",
  },
  deploy: {
    title: "Bookmarks",
    description: "Verify readiness checklists, review timelines, and prepare launches.",
  },
  store: {
    title: "Hive Store",
    description: "Discover bots built by the swarm or publish your own listings to the marketplace.",
  },
};

const PANEL_CLASS =
  "rounded-3xl border border-white/8 bg-[#0b0b18]/80 backdrop-blur-2xl shadow-[0_42px_90px_-60px_rgba(0,0,0,0.65)]";
const CAPS_LABEL = "text-[11px] font-medium uppercase tracking-[0.14em] text-white/65";

type FeedCard = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const FEED_CARDS: FeedCard[] = [
  {
    id: "ai",
    title: "AI-Driven Enhancements",
    description: "Build sleek, high-performing experiences faster with swarm tooling.",
    icon: Sparkles,
  },
  {
    id: "languages",
    title: "Languages Support",
    description: "Localize conversations across markets with automatic translation flows.",
    icon: Users,
  },
  {
    id: "plugins",
    title: "Plugins and extensions",
    description: "Wire external tooling into the hive via tool manifests and shared memory.",
    icon: Settings2,
  },
];

const QUICK_COMMANDS: Array<{ id: string; label: string; shortcut: string }> = [
  { id: "compile", label: "Compile code", shortcut: "⌘K" },
  { id: "nodes", label: "Switch to logic nodes", shortcut: "⌘L" },
  { id: "collaborators", label: "Add collaborators", shortcut: "⇧⌘C" },
];


const CODE_SNIPPET = `bot SupportGuide
  description "Answers onboarding questions for new Hive members"

  memory shared
    notes store key "faq"
  end

  on input when input.question?
    say "Here’s what I found about {input.topic}:"
    recall notes as faq
    if faq.blank?
      say "No entry yet — logging this so another agent can fill it in."
      notes.append key "faq" value "{input.topic}: pending research"
    else
      say faq
    end
  end

  on input when not input.question?
    say "Ask me anything about Hiveland policies, pricing, or integrations."
  end
end`;

const INPUT_CLASS =
  "w-full rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white/90 placeholder:text-white/35 transition focus:border-white/40 focus:outline-none focus:ring-0";
const TEXTAREA_CLASS =
  "w-full rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white/90 placeholder:text-white/35 transition focus:border-white/40 focus:outline-none focus:ring-0";
const SELECT_CLASS =
  "w-full appearance-none rounded-xl border border-white/12 bg-white/5 px-3 py-2.5 text-sm text-white/90 transition focus:border-white/40 focus:outline-none focus:ring-0";
const SURFACE_CARD = "rounded-2xl border border-white/10 bg-white/[0.04]";
const SURFACE_INSET = "rounded-2xl border border-white/10 bg-white/[0.02]";
const CHIP_MUTED =
  "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-white/60";

export default function BuilderPage() {
  const [botName, setBotName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [model, setModel] = useState<string>(MODEL_OPTIONS[0]!.value);
  const [source, setSource] = useState<string>(EMPTY_TEMPLATE);
  const [compiled, setCompiled] = useState<string>("");
  const [diagnostics, setDiagnostics] = useState<CompileDiagnostic[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const compileStartedAt = useRef<number | null>(null);
  const [compileDurationMs, setCompileDurationMs] = useState<number | null>(null);
  const [versionHistory, setVersionHistory] = useState<BotVersion[]>([]);
  const [activeTab, setActiveTab] = useState<"preview" | "diagnostics">("preview");
  const [templateId, setTemplateId] = useState<BotTemplate["id"]>("reminder");
  const [lastBotId, setLastBotId] = useState<string | null>(null);
  const [lastBotVersionId, setLastBotVersionId] = useState<string | null>(null);
  const [isRunningScenario, setIsRunningScenario] = useState(false);
  const [runTranscript, setRunTranscript] = useState<AgentMessage[]>([]);
  const [runOutput, setRunOutput] = useState<string>("");
  const [runError, setRunError] = useState<string | null>(null);
  const [lastScenarioId, setLastScenarioId] = useState<string | null>(null);
  const compileTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>(TEMPLATE_SYSTEM_PROMPTS.general ?? DEFAULT_SYSTEM_PROMPT);
  const [memoryStrategy, setMemoryStrategy] = useState<string>(TEMPLATE_MEMORY_STRATEGY.general ?? "ephemeral");
  const [toolManifest, setToolManifest] = useState<ToolManifestEntry[]>(() =>
    (TEMPLATE_TOOL_MANIFEST.general ?? []).map((entry) => ({ ...entry }))
  );
  const [toolSearch, setToolSearch] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatRunId, setChatRunId] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [selectedChatCapability, setSelectedChatCapability] = useState<BotCapability>("general.respond");
  const [activeSection, setActiveSection] = useState<SectionId>("build");
  const dismissAlert = useCallback(() => setAlert(null), []);
  const triggerAlert = useCallback(
    (variant: AlertState["variant"], title: string, message?: string, autoClose?: number) => {
      setAlert({ variant, title, message, autoClose });
    },
    []
  );
  const generateChatId = useCallback(() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2);
  }, []);

  const navItems = useMemo(
    () => [
      { id: "overview" as SectionId, label: "Mission control", icon: Gauge },
      { id: "build" as SectionId, label: "Forge", icon: Code2 },
      { id: "play" as SectionId, label: "Playground", icon: MessageSquare },
      { id: "deploy" as SectionId, label: "Launch", icon: Rocket },
      { id: "store" as SectionId, label: "Hive Store", icon: Store },
    ],
    []
  );

  const activeManifest = useMemo(() => toolManifest.filter((entry) => entry.enabled !== false), [toolManifest]);
  const disabledManifest = useMemo(() => toolManifest.filter((entry) => entry.enabled === false), [toolManifest]);

  const editorStatus = useMemo(() => {
    if (isCompiling) {
      return {
        tone: "bg-amber-400",
        label: "Compiling",
        helper: "Crunching the latest hive draft...",
      };
    }

    if (diagnostics.length > 0) {
      return {
        tone: "bg-rose-400",
        label: `${diagnostics.length} diagnostic${diagnostics.length === 1 ? "" : "s"}`,
        helper: "Review issues in the Diagnostics tab",
      };
    }

    return {
      tone: "bg-emerald-400",
      label: "Ready",
      helper: "Build is clean and ready for testing",
    };
  }, [diagnostics.length, isCompiling]);

  const handleToggleTool = useCallback((tool: string, capability: BotCapability) => {
    setToolManifest((prev) => {
      const exists = prev.some((entry) => entry.tool === tool);
      if (!exists) {
        return [...prev, { tool, capability, enabled: true }];
      }
      return prev.map((entry) =>
        entry.tool === tool ? { ...entry, enabled: entry.enabled === false ? true : false } : entry
      );
    });
  }, []);

  const handleCapabilityChange = useCallback((tool: string, capability: BotCapability) => {
    setToolManifest((prev) => prev.map((entry) => (entry.tool === tool ? { ...entry, capability } : entry)));
  }, []);

  const handleRemoveTool = useCallback((tool: string) => {
    setToolManifest((prev) => prev.filter((entry) => entry.tool !== tool));
  }, []);

  const filteredAvailableTools = useMemo(() => {
    const activeTools = new Set(toolManifest.map((entry) => entry.tool));
    const query = toolSearch.trim().toLowerCase();
    return AVAILABLE_TOOL_CATALOG.filter((record) => {
      if (activeTools.has(record.tool)) return false;
      if (!query) return true;
      return (
        record.label.toLowerCase().includes(query) ||
        record.description.toLowerCase().includes(query) ||
        record.tool.toLowerCase().includes(query)
      );
    });
  }, [toolManifest, toolSearch]);

  const resetEditor = useCallback(() => {
    const template = BOT_TEMPLATES.find((entry) => entry.id === templateId);
    if (!template) {
      setSource(EMPTY_TEMPLATE);
      setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
      setMemoryStrategy("ephemeral");
      setToolManifest([]);
      return;
    }

    setSource(TEMPLATE_SOURCES[template.id] ?? EMPTY_TEMPLATE);
    setSystemPrompt(template.systemPrompt ?? DEFAULT_SYSTEM_PROMPT);
    setMemoryStrategy(template.memoryStrategy ?? "ephemeral");
    setToolManifest((template.toolManifest ?? []).map((entry) => ({ ...entry })));
  }, [templateId]);

  const handleRunScenario = useCallback(
    async (scenario: TestScenario) => {
      if (!lastBotId) {
        triggerAlert(
          "info",
          "Deploy first",
          "Deploy the bot to create a baseline before running curated scenarios."
        );
        return;
      }

      setIsRunningScenario(true);
      setRunTranscript([]);
      setRunOutput("");
      setRunError(null);
      setLastScenarioId(scenario.id);

      try {
        const response = await fetch("/api/run", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            botId: lastBotId,
            botVersionId: lastBotVersionId ?? undefined,
            steps: [
              {
                agentId: scenario.capability,
                input: scenario.payload,
              },
            ],
          }),
        });

        if (!response.ok) {
          let details = "Scenario run failed";
          try {
            const data = (await response.json()) as { error?: string };
            if (data?.error) {
              details = data.error;
            }
          } catch (parseError) {
            console.error("Failed to parse scenario error response", parseError);
          }
          throw new Error(details);
        }

        const result = (await response.json()) as RunResult & { runId: string };
        setRunTranscript(result.transcript ?? []);
        setRunOutput(result.output ?? "");
      } catch (error) {
        console.error("Scenario run failed", error);
        const message = error instanceof Error ? error.message : "Unknown error running scenario";
        setRunError(message);
        triggerAlert("error", "Scenario failed", message);
      } finally {
        setIsRunningScenario(false);
      }
    },
    [lastBotId, lastBotVersionId, triggerAlert]
  );

  const selectedTemplate = useMemo(
    () => BOT_TEMPLATES.find((entry) => entry.id === templateId) ?? BOT_TEMPLATES[0],
    [templateId]
  );

  const selectableCapabilities = useMemo(
    () =>
      Array.from(
        new Set([
          ...(selectedTemplate.capabilities ?? []),
          ...activeManifest.map((entry) => entry.capability),
          ...filteredAvailableTools.map((record) => record.capability),
        ])
      ),
    [activeManifest, filteredAvailableTools, selectedTemplate.capabilities]
  );

  const activeChatCapability = useMemo(() => {
    const enabledCapabilities = activeManifest.map((entry) => entry.capability);
    if (enabledCapabilities.includes(selectedChatCapability)) {
      return selectedChatCapability;
    }
    if (enabledCapabilities.length > 0) {
      return enabledCapabilities[0]!;
    }
    return selectedTemplate.capabilities[0] ?? "general.respond";
  }, [activeManifest, selectedChatCapability, selectedTemplate]);

  const chatCapabilityLabel = useMemo(
    () => CAPABILITY_LABELS[activeChatCapability as BotCapability] ?? activeChatCapability,
    [activeChatCapability]
  );

  const hasBlockingDiagnostics = useMemo(
    () => diagnostics.some((diag) => diag.severity === "error"),
    [diagnostics]
  );

  const deploymentState = useMemo(() => {
    if (isDeploying) {
      return { label: "Deploying", tone: "bg-amber-400/15 text-amber-200 border border-amber-300/30" };
    }
    if (lastBotVersionId) {
      return { label: "Live", tone: "bg-emerald-400/15 text-emerald-200 border border-emerald-300/30" };
    }
    return { label: "Draft", tone: "bg-white/10 text-white/70 border border-white/20" };
  }, [isDeploying, lastBotVersionId]);

  const readinessChecklist = useMemo(
    () => [
      {
        label: "Unique bot name",
        checked: botName.trim().length > 2,
      },
      {
        label: "Describe capabilities",
        checked: description.trim().length > 10,
      },
      {
        label: "Hive source saves",
        checked: source.trim().length > 0,
      },
      {
        label: "Compilation succeeds",
        checked: !hasBlockingDiagnostics && compiled.length > 0,
      },
      {
        label: "Price configured",
        checked: price >= 0,
      },
    ],
    [botName, description, source, hasBlockingDiagnostics, compiled.length, price]
  );

  const selectedModel = useMemo(
    () => MODEL_OPTIONS.find((option) => option.value === model),
    [model]
  );

  const availableScenarios = useMemo(() => TEST_SCENARIOS[templateId] ?? [], [templateId]);

  const selectedScenario = useMemo(
    () => availableScenarios.find((scenario) => scenario.id === lastScenarioId) ?? null,
    [availableScenarios, lastScenarioId]
  );

  const normalizeTranscript = useCallback((transcript: AgentMessage[]): ChatMessage[] => {
    return transcript.map((message, index) => {
      const role: ChatMessage["role"] =
        message.role === "user" ? "user" : message.role === "system" ? "system" : "assistant";

      return {
        id: `${message.timestamp}-${index}`,
        role,
        content: message.content,
        timestamp: message.timestamp,
      };
    });
  }, []);

  const buildChatInputPayload = useCallback(
    (rawInput: string): Record<string, unknown> => {
      switch (activeChatCapability) {
        case "coding.generate":
          return { task: rawInput, language: "typescript" };
        case "coding.review":
          return { code: rawInput };
        case "study.tutor":
          return { topic: rawInput, level: "intermediate" };
        case "study.quiz":
          return { subject: rawInput };
        default:
          return { prompt: rawInput };
      }
    },
    [activeChatCapability]
  );

  const handleSubmitChat = useCallback(async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) {
      return;
    }

    if (!lastBotId) {
      triggerAlert(
        "info",
        "Deploy your bot",
        "Deploy the bot before starting a live conversation so the runtime can load its persona."
      );
      return;
    }

    const userMessage: ChatMessage = {
      id: generateChatId(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsSendingChat(true);
    setChatError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          botId: lastBotId,
          botVersionId: lastBotVersionId ?? undefined,
          runId: chatRunId ?? undefined,
          capability: activeChatCapability,
          input: buildChatInputPayload(trimmed),
          context: {
            mode: "builder-chat",
          },
        }),
      });

      if (!response.ok) {
        let details = "Chat run failed";
        try {
          const data = (await response.json()) as { error?: string };
          if (data?.error) {
            details = data.error;
          }
        } catch (parseError) {
          console.error("Failed to parse chat error response", parseError);
        }
        throw new Error(details);
      }

      const result = (await response.json()) as RunResult & { runId: string };
      setChatRunId(result.runId);
      setChatMessages(normalizeTranscript(result.transcript ?? []));
    } catch (error) {
      console.error("Chat execution failed", error);
      const message = error instanceof Error ? error.message : "Unknown chat error";
      setChatError(message);
      setChatMessages((prev) => [
        ...prev,
        {
          id: generateChatId(),
          role: "system",
          content: message,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  }, [
    activeChatCapability,
    buildChatInputPayload,
    chatInput,
    chatRunId,
    generateChatId,
    lastBotId,
    lastBotVersionId,
    normalizeTranscript,
    triggerAlert,
  ]);

  const handleResetChat = useCallback(() => {
    setChatMessages([]);
    setChatRunId(null);
    setChatError(null);
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    const template = BOT_TEMPLATES.find((entry) => entry.id === templateId);
    if (!template) {
      return;
    }
    setSystemPrompt(template.systemPrompt ?? DEFAULT_SYSTEM_PROMPT);
    setMemoryStrategy(template.memoryStrategy ?? "ephemeral");
    setToolManifest((template.toolManifest ?? []).map((entry) => ({ ...entry })));
  }, [templateId]);

  const renderSection = () => {
    switch (activeSection) {
      case "overview": {
        const overviewStats = [
          { label: "Status", value: deploymentState.label },
          { label: "Model", value: selectedModel?.label ?? "Select a model" },
          {
            label: "Capabilities",
            value: selectedTemplate.capabilities
              .map((cap) => CAPABILITY_LABELS[cap] ?? cap)
              .join(", ") || "None",
          },
          { label: "Last publish", value: versionHistory[0]?.label ?? "—" },
          { label: "Hive source", value: source.trim().length > 0 ? "Ready" : "Pending" },
          { label: "Price", value: price > 0 ? `$${price.toFixed(0)}` : "Set price" },
        ];

        return (
          <div className="grid gap-8 xl:grid-cols-[minmax(0,0.65fr)_minmax(0,0.35fr)]">
            <div className="min-w-0 space-y-6">
              <PanelContainer className="bg-white/[0.02] p-8" contentClassName="space-y-7">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="space-y-3">
                    <span className={cn(CHIP_MUTED, "border-white/15 bg-white/[0.06] text-white/65")}> 
                      <Gauge className="h-3 w-3" /> Mission control
                    </span>
                    <h2 className="text-2xl font-semibold text-white">Observe your swarm at a glance</h2>
                    <p className="max-w-xl text-sm text-white/60">
                      Track compilation health, deployment status, and recent activity in one streamlined console.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeploy}
                    disabled={isDeploying}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7c4dff] via-[#6741ff] to-[#4b31ff] px-5 py-2 text-sm font-semibold text-white shadow-[0_18px_45px_-25px_rgba(90,64,255,0.7)] transition hover:shadow-[0_22px_55px_-25px_rgba(90,64,255,0.85)] disabled:opacity-60"
                  >
                    {isDeploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                    {isDeploying ? "Deploying" : "Launch update"}
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {overviewStats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">{stat.label}</p>
                      <p className="mt-3 text-base font-semibold text-white/90">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </PanelContainer>

              <PanelContainer className="p-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white/80">Highlights feed</h3>
                  <span className="text-[11px] uppercase tracking-[0.35em] text-white/40">Insights</span>
                </div>
                <div className="mt-5 space-y-3">
                  {FEED_CARDS.map((card, index) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.id}
                        className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-white/90">{card.title}</p>
                          <p className="text-xs text-white/60">{card.description}</p>
                        </div>
                        <span className="ml-auto text-xs text-white/40">{String(index + 1).padStart(2, "0")}</span>
                      </div>
                    );
                  })}
                </div>
              </PanelContainer>

              <PanelContainer className="p-8">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Timeline</span>
                  <span className="text-[11px] uppercase tracking-[0.3em] text-white/40">Versions</span>
                </div>
                <div className="mt-5 max-h-[260px] overflow-y-auto pr-1">
                  <VersionTimeline items={versionHistory} />
                </div>
              </PanelContainer>
            </div>

            <div className="space-y-6">
              <PanelContainer className="space-y-5 p-6">
                <div className="flex items-center justify-between text-sm text-white/80">
                  <span>Command palette</span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/45">
                    ⌘K
                  </span>
                </div>
                <div className="relative">
                  <MessageCircle className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search actions or jump to a surface"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3 pl-12 pr-4 text-sm text-white/85 placeholder:text-white/35 focus:border-[#7c4dff]/50 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  {QUICK_COMMANDS.map((command) => (
                    <div key={command.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80">
                      <span>{command.label}</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white/50">
                        {command.shortcut}
                      </span>
                    </div>
                  ))}
                </div>
              </PanelContainer>

              <PanelContainer className="space-y-4 p-6">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>HiveLang example · SupportGuide</span>
                  <button className="inline-flex items-center gap-2 text-xs font-medium text-white/70 transition hover:text-white">
                    <ClipboardCheck className="h-4 w-4" />
                    Copy
                  </button>
                </div>
                <pre className="max-h-[240px] overflow-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs leading-relaxed text-white/80">
                  <code>{CODE_SNIPPET}</code>
                </pre>
              </PanelContainer>

              <PanelContainer className="space-y-4 p-6">
                <h4 className="text-sm font-semibold text-white/80">Scenario digest</h4>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70">
                  {runOutput ? runOutput : "Run a curated scenario to populate outcome summaries."}
                </div>
              </PanelContainer>

              <PanelContainer className="space-y-4 p-6">
                <h4 className="text-sm font-semibold text-white/80">Recent chat excerpts</h4>
                <div className="space-y-3">
                  {chatMessages.length > 0 ? (
                    chatMessages
                      .slice(-4)
                      .reverse()
                      .map((message) => (
                        <div key={message.id} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-white/75">
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-white/45">
                            <span>{message.role}</span>
                            <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="mt-2 text-white/80">{message.content}</p>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs text-white/45">Start a conversation to populate this feed.</p>
                  )}
                </div>
              </PanelContainer>
            </div>
          </div>
        );
      }
      case "build":
        return (
          <div className="grid gap-8 xl:grid-cols-[minmax(0,0.66fr)_minmax(0,0.34fr)]">
            <PanelContainer className="min-w-0 space-y-6 p-6 md:p-8">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Bot name" hint="Public-facing">
                    <input
                      value={botName}
                      onChange={(event) => setBotName(event.target.value)}
                      placeholder="Nebula Concierge"
                      className={INPUT_CLASS}
                    />
                  </Field>
                  <Field label="Marketplace price" hint="USD">
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/40">$</span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={price}
                        onChange={(event) => setPrice(Number(event.target.value))}
                        className={cn(INPUT_CLASS, "pl-7")}
                      />
                    </div>
                  </Field>
                  <Field label="Model" hint="Provider">
                    <div className="relative">
                      <select value={model} onChange={(event) => setModel(event.target.value)} className={cn(SELECT_CLASS, "pr-10") }>
                        {MODEL_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value} className="bg-[#0b101b] text-slate-100">
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/40">⌄</span>
                    </div>
                  </Field>
                </div>

                <Field label="Summary" hint="For marketplace">
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Summarize what your agent excels at..."
                    className={TEXTAREA_CLASS}
                    rows={4}
                  />
                </Field>
              </div>

              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-white/80">Starter templates</h3>
                    <p className="text-xs text-white/45">Swap between curated scaffolds as you iterate.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={resetEditor}
                      className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-white/25 hover:text-white"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Reset to template
                    </button>
                    <button
                      type="button"
                      onClick={() => scheduleCompilation(source)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-gradient-to-r from-white/10 to-white/5 px-3 py-1.5 text-xs font-medium text-white/85 transition hover:border-white/25 hover:text-white"
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      Compile draft
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {BOT_TEMPLATES.map((template) => {
                    const isActive = template.id === templateId;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setTemplateId(template.id)}
                        className={cn(
                          "group flex flex-col gap-2 rounded-2xl border px-4 py-3 text-left transition",
                          isActive
                            ? "border-white/25 bg-white/12 text-white shadow-[0_25px_70px_-45px_rgba(124,77,255,0.75)]"
                            : "border-white/12 bg-white/3 text-white/70 hover:border-white/20 hover:text-white"
                        )}
                      >
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80 group-hover:text-white">
                          {template.label}
                        </span>
                        <span className="text-xs text-white/55">{template.blurb}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#05060f]/95 shadow-[0_60px_140px_-80px_rgba(0,0,0,0.75)]">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-white/[0.02] px-5 py-3">
                    <div className="flex items-center gap-3 text-sm text-white/80">
                      <span className="flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1 font-mono text-xs uppercase tracking-[0.12em] text-white/70">
                        <Code2 className="h-3.5 w-3.5" /> hive/blueprint.hive
                      </span>
                      <span className="hidden items-center gap-2 text-xs text-white/45 sm:flex">
                        <Sparkles className="h-3.5 w-3.5 text-white/50" /> Autocomplete live
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/55">
                      <span className="hidden items-center gap-1 rounded-full border border-white/10 px-2 py-1 font-medium text-white/65 md:flex">
                        <Keyboard className="h-3 w-3" /> cmd + enter
                      </span>
                      <button
                        type="button"
                        onClick={() => scheduleCompilation(source)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/12 px-3 py-1 font-medium text-white/80 transition hover:border-white/25 hover:text-white"
                      >
                        <PlayCircle className="h-3.5 w-3.5" /> Run build
                      </button>
                    </div>
                  </div>
                  <Editor
                    language="hive"
                    theme="vs-dark"
                    height="420px"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      fontFamily: "JetBrains Mono, monospace",
                      smoothScrolling: true,
                      automaticLayout: true,
                      wordWrap: "on",
                    }}
                    value={source}
                    onChange={handleEditorChange}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 bg-black/70 px-5 py-2.5 text-xs text-white/60">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-full", editorStatus.tone)} />
                      <span className="font-medium text-white/75">{editorStatus.label}</span>
                      <span className="hidden text-white/45 sm:inline">{editorStatus.helper}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/45">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {compileDurationMs !== null ? `${compileDurationMs}ms` : "Idle"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {chatMessages.length} chat log{chatMessages.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </PanelContainer>

            <div className="space-y-6">
              {selectedTemplate.id === "reminder" && (
                <GlassCard
                  title="Tenant adapters & ops"
                  accent="from-[#2c244622] via-transparent to-transparent"
                  icon={<CheckCircle2 className="h-4 w-4 text-emerald-200" />}
                >
                  <p className="text-xs text-white/65">
                    Provision each tenant with credentials before scheduling live WhatsApp reminders. Keep adapters scoped to the tenant to avoid cross-workspace data leaks.
                  </p>
                  <div className="space-y-3">
                    {TENANT_SETUP_STEPS.map((step) => {
                      const StepIcon = step.icon;
                      return (
                        <div
                          key={step.id}
                          className="flex items-start gap-3 rounded-2xl border border-white/12 bg-white/5 p-4"
                        >
                          <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/80">
                            <StepIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-white/85">{step.title}</span>
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.3em]",
                                  TENANT_BADGE_STYLES[step.tone]
                                )}
                              >
                                {step.badgeLabel}
                              </span>
                            </div>
                            <p className="text-xs text-white/60">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Link
                    href="/docs/hivelang"
                    className="inline-flex items-center gap-2 text-xs font-medium text-white/70 transition hover:text-white"
                  >
                    Read integration guide
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </GlassCard>
              )}

              <GlassCard
                title="Persona core"
                accent="from-[#28213f22] via-transparent to-transparent"
                icon={<Sparkles className="h-4 w-4 text-white/80" />}
              >
                <Field label="System prompt" hint="Guiding voice">
                  <textarea
                    value={systemPrompt}
                    onChange={(event) => setSystemPrompt(event.target.value)}
                    placeholder="Explain the agent's persona, tone, and decision framework."
                    className={TEXTAREA_CLASS}
                    rows={5}
                  />
                </Field>

                <div className="space-y-5">
                  <Field label="Memory strategy" hint="Persistence">
                    <select value={memoryStrategy} onChange={(event) => setMemoryStrategy(event.target.value)} className={SELECT_CLASS}>
                      {MEMORY_STRATEGY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="bg-[#0b101b] text-slate-100">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-medium text-white/70">Active capabilities</span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/50 px-3 py-1 text-[11px] font-medium text-white/55">
                          {activeManifest.length} enabled
                        </span>
                      </div>
                      <div className="space-y-3">
                        {activeManifest.length === 0 ? (
                          <div className="rounded-2xl border border-white/12 bg-black/35 p-5 text-sm text-white/65">
                            No tools enabled yet. Browse the catalog below to add capabilities.
                          </div>
                        ) : (
                          activeManifest.map((entry) => (
                            <div
                              key={entry.tool}
                              className="rounded-2xl border border-white/12 bg-black/40 p-5 text-sm text-white/80"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0 space-y-1">
                                  <span className="block font-mono text-sm font-semibold tracking-tight text-white">{entry.tool}</span>
                                  <p className="text-xs text-white/55">{CAPABILITY_LABELS[entry.capability] ?? entry.capability}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleTool(entry.tool, entry.capability)}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-[11px] font-medium text-white/75 transition hover:border-white/30"
                                  >
                                    Disable
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTool(entry.tool)}
                                    className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 px-3 py-1 text-[11px] font-medium text-rose-200 transition hover:border-rose-400/70"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                              <label className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-medium text-white/60">
                                <span>Capability slot</span>
                                <select
                                  value={entry.capability}
                                  onChange={(event) =>
                                    handleCapabilityChange(entry.tool, event.target.value as BotCapability)
                                  }
                                  className="rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[11px] text-white/70"
                                >
                                  {selectableCapabilities.map((cap) => (
                                    <option key={`${entry.tool}-${cap}`} value={cap}>
                                      {cap}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {disabledManifest.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-white/55">
                          <span>Sleeping tools</span>
                          <span>{disabledManifest.length}</span>
                        </div>
                        <div className="space-y-2">
                          {disabledManifest.map((entry) => (
                            <button
                              key={`${entry.tool}-disabled`}
                              type="button"
                              onClick={() => handleToggleTool(entry.tool, entry.capability)}
                              className="flex w-full flex-col items-start gap-2 rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-left text-sm text-white/70 transition hover:border-white/25 hover:text-white"
                            >
                              <span className="font-mono text-sm font-semibold tracking-tight text-white">{entry.tool}</span>
                              <span className="text-[11px] text-white/50">Capability: {entry.capability}</span>
                              <span className="text-[11px] font-medium text-white/55">Enable</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs font-medium text-white/65">Tool catalog</span>
                        <input
                          value={toolSearch}
                          onChange={(event) => setToolSearch(event.target.value)}
                          placeholder="Search tools"
                          className="h-8 rounded-full border border-white/15 bg-black/60 px-3 text-xs text-white/80 placeholder:text-white/40 focus:border-white/35 focus:outline-none"
                        />
                      </div>
                      <div className="grid gap-2">
                        {filteredAvailableTools.length === 0 ? (
                          <p className="rounded-2xl border border-white/12 bg-black/35 p-4 text-xs text-white/55">
                            No matching tools. Adjust your search or revisit the manifest above.
                          </p>
                        ) : (
                          filteredAvailableTools.map((record) => (
                            <button
                              key={record.tool}
                              type="button"
                              onClick={() => handleToggleTool(record.tool, record.capability)}
                              className="group flex w-full flex-col items-start gap-1 rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-left text-sm text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
                            >
                              <span className="font-mono text-sm font-semibold tracking-tight text-white/90 group-hover:text-white">
                                {record.label}
                              </span>
                              <span className="font-mono text-[11px] text-white/45 group-hover:text-white/70">
                                {record.tool}
                              </span>
                              <span className="text-xs text-white/55 group-hover:text-white/80">{record.description}</span>
                              <span className="text-[10px] font-medium text-white/50 group-hover:text-white/65">Add to manifest</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-xs text-white/65">
                  <strong className="mr-2 font-semibold text-white/80">Persona tip:</strong>
                  Outline tone, safety rails, and how this bot collaborates with the swarm to avoid conflicting instructions.
                </p>
              </GlassCard>

              <GlassCard title="Insights console" accent="from-[#1f284522] via-transparent to-transparent" icon={<Activity className="h-4 w-4 text-indigo-200" />}>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs",
                      activeTab === "preview"
                        ? "border-[#7c4dff]/60 bg-[#1b2031] text-white"
                        : "border-white/12 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                    )}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("diagnostics")}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs",
                      activeTab === "diagnostics"
                        ? "border-[#7c4dff]/60 bg-[#1b2031] text-white"
                        : "border-white/12 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                    )}
                  >
                    Diagnostics
                  </button>
                </div>

                <div className="mt-4 h-[340px] overflow-hidden rounded-2xl border border-white/12 bg-[#05060f]/95">
                  {activeTab === "preview" ? (
                    <PreviewPane compiled={compiled} isCompiling={isCompiling} />
                  ) : (
                    <DiagnosticsPane diagnostics={diagnostics} />
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        );
      case "play":
        return (
          <div className="grid gap-8 xl:grid-cols-[minmax(0,0.62fr)_minmax(0,0.38fr)]">
            <GlassCard title="Live chat sandbox" accent="from-[#1f264222] via-transparent to-transparent" icon={<MessageSquare className="h-4 w-4 text-indigo-200" />}>
              <div className="flex h-[460px] flex-col gap-4">
                <div ref={chatScrollRef} className="flex-1 overflow-y-auto rounded-2xl border border-white/5 bg-[#0b101b] p-4">
                  {chatMessages.length === 0 ? (
                    <p className="text-sm text-slate-400">Start a conversation to observe real-time responses.</p>
                  ) : (
                    <div className="space-y-3">
                      {chatMessages.map((message) => (
                        <div key={message.id} className="flex flex-col gap-1">
                          <span
                            className={cn(
                              "text-[10px] uppercase tracking-[0.3em]",
                              message.role === "user"
                                ? "text-slate-300"
                                : message.role === "assistant"
                                  ? "text-indigo-300"
                                  : "text-slate-500"
                            )}
                          >
                            {message.role}
                            <span className="ml-2 text-[9px] lowercase text-slate-500">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </span>
                          <p className="text-sm text-slate-100">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {chatError && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{chatError}</div>
                )}

                <div className="flex flex-col gap-4 md:flex-row md:items-end">
                  <div className="flex-1">
                    <label className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                      Message
                      <span className="rounded-full border border-white/10 bg-[#10131f] px-3 py-0.5 text-[10px] uppercase tracking-[0.25em] text-slate-200">
                        {chatCapabilityLabel}
                      </span>
                    </label>
                    <textarea
                      value={chatInput}
                      onChange={(event) => setChatInput(event.target.value)}
                      placeholder="Ask your agent anything..."
                      className={TEXTAREA_CLASS}
                      rows={4}
                    />
                  </div>
                  <div className="flex flex-col gap-2 md:w-56">
                    <select
                      value={selectedChatCapability}
                      onChange={(event) => setSelectedChatCapability(event.target.value as BotCapability)}
                      className={SELECT_CLASS}
                    >
                      {selectableCapabilities.map((capability) => (
                        <option key={capability} value={capability} className="bg-[#0b101b] text-slate-100">
                          {CAPABILITY_LABELS[capability] ?? capability}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSubmitChat}
                        disabled={isSendingChat}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6f6cff] to-[#4e44ff] px-4 py-2 text-sm font-semibold text-white transition hover:shadow-[0_16px_40px_-25px_rgba(97,90,255,0.9)] disabled:opacity-60"
                      >
                        {isSendingChat ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {isSendingChat ? "Sending" : "Send"}
                      </button>
                      <button
                        type="button"
                        onClick={handleResetChat}
                        className="inline-flex items-center justify-center rounded-full border border-white/5 bg-[#12172a] px-3 py-2 text-sm text-slate-300 transition hover:border-indigo-400/40"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            <div className="space-y-6">
              <GlassCard title="Scenario arena" accent="from-[#232c4922] via-transparent to-transparent" icon={<Activity className="h-4 w-4 text-indigo-200" />}>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Curated tests</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {availableScenarios.map((scenario) => {
                    const isSelected = scenario.id === lastScenarioId;
                    return (
                      <button
                        key={scenario.id}
                        type="button"
                        onClick={() => void handleRunScenario(scenario)}
                        disabled={isRunningScenario}
                        className={cn(
                          "flex flex-col gap-1 rounded-2xl border px-4 py-3 text-left text-xs transition",
                          isSelected
                            ? "border-indigo-400/40 bg-[#1b2032] text-slate-100"
                            : "border-white/5 bg-[#10131f] text-slate-300 hover:border-indigo-400/30 hover:text-slate-100",
                          isRunningScenario ? "opacity-70" : ""
                        )}
                      >
                        <span className="text-[11px] font-semibold uppercase tracking-[0.28em]">{scenario.title}</span>
                        <span className="text-slate-400">{scenario.description}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 space-y-4 rounded-2xl border border-white/5 bg-[#111426] p-4 text-sm text-slate-200">
                  {isRunningScenario ? (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Loader2 className="h-4 w-4 animate-spin" /> Running scenario...
                    </div>
                  ) : runError ? (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-200">{runError}</div>
                  ) : selectedScenario ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">Transcript</p>
                        <div className="mt-2 space-y-2 rounded-2xl border border-white/5 bg-[#0b101b] p-3 text-xs">
                          {runTranscript.length === 0 ? (
                            <p className="text-slate-500">Trigger a scenario to see agent dialogue.</p>
                          ) : (
                            runTranscript.map((message, index) => (
                              <div key={`${message.timestamp}-${index}`} className="space-y-1">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                                  {message.role} · {new Date(message.timestamp).toLocaleTimeString()}
                                </p>
                                <p className="text-slate-100">{message.content}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">Output</p>
                        <div className="mt-2 rounded-2xl border border-white/5 bg-[#0f1524] p-3 text-xs text-slate-100">
                          {runOutput ? runOutput : "Awaiting scenario output..."}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500">Choose a scenario to simulate how your agent handles real workloads.</p>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        );
      case "deploy":
        return (
          <GlassCard title="Deployment readiness" accent="from-[#20284422] via-transparent to-transparent" icon={<CloudUpload className="h-4 w-4 text-indigo-200" />}>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">Checklist</p>
                <ul className="mt-2 space-y-2 text-xs text-slate-200">
                  {readinessChecklist.map((item) => (
                    <ChecklistItem key={item.label} label={item.label} checked={item.checked} />
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">Recent versions</p>
                <div className="mt-2 max-h-[260px] overflow-y-auto pr-1">
                  <VersionTimeline items={versionHistory} />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDeploy}
              disabled={isDeploying}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6f6cff] to-[#4e44ff] px-5 py-2 text-sm font-semibold text-white transition hover:shadow-[0_18px_45px_-25px_rgba(96,90,255,0.85)] disabled:opacity-60"
            >
              {isDeploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isDeploying ? "Deploying" : "Launch update"}
            </button>
          </GlassCard>
        );
      case "store":
        return (
          <PanelContainer withAmbient={false} className="p-8 text-center" contentClassName="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#14182c] px-4 py-1 text-[11px] uppercase tracking-[0.35em] text-slate-400">
              <Store className="h-3.5 w-3.5 text-indigo-300" />
              Hive Store
            </div>
            <h2 className="text-2xl font-semibold text-white">Browse and publish from the dedicated Hive Store</h2>
            <p className="mx-auto max-w-2xl text-sm text-slate-400">
              We moved listings into a standalone experience that is tuned for mobile shoppers and desktop builders. Visit the Hive Store to explore featured bots, manage submissions, and launch new experiences.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/hivestore"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6b64ff] via-[#6056ff] to-[#5144ff] px-5 py-2 text-sm font-semibold text-white transition hover:shadow-[0_12px_32px_rgba(94,86,255,0.35)]"
              >
                Open Hive Store
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setActiveSection("deploy")}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#12152a] px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-indigo-400/40"
              >
                Back to deployment checklist
              </button>
            </div>
          </PanelContainer>
        );
      default:
        return null;
    }
  };

  const activeCopy = useMemo(() => SECTION_COPY[activeSection], [activeSection]);

  const runCompilation = useCallback(
    async (input: string) => {
      compileStartedAt.current = performance.now();
      setCompileDurationMs(null);
      setIsCompiling(true);
      try {
        const result = (await compileHive(input)) as CompileResult;
        setCompiled(result.code);
        setDiagnostics(result.diagnostics ?? []);
        if (result.diagnostics?.some((diag) => diag.severity === "error")) {
          setActiveTab("diagnostics");
          triggerAlert("error", "Compilation errors detected", "Resolve the diagnostics before deploying.");
        }
      } catch (err) {
        console.error("Compilation failed", err);
        setCompiled("");
        setDiagnostics([
          {
            severity: "error",
            message: err instanceof Error ? err.message : "Unknown compilation error",
            line: 0,
            column: 0,
          },
        ]);
        setActiveTab("diagnostics");
        triggerAlert("error", "Compilation failed", err instanceof Error ? err.message : "Unknown compilation error");
      } finally {
        const finishedAt = performance.now();
        if (compileStartedAt.current) {
          setCompileDurationMs(Math.max(0, Math.round(finishedAt - compileStartedAt.current)));
        }
        setIsCompiling(false);
      }
    },
    [triggerAlert]
  );

  const scheduleCompilation = useCallback(
    (input: string) => {
      if (compileTimeout.current) {
        clearTimeout(compileTimeout.current);
      }
      compileStartedAt.current = performance.now();
      setCompileDurationMs(null);
      compileTimeout.current = setTimeout(() => {
        void runCompilation(input);
      }, 350);
    },
    [runCompilation]
  );

  useEffect(() => {
    scheduleCompilation(source);
    return () => {
      if (compileTimeout.current) {
        clearTimeout(compileTimeout.current);
      }
    };
  }, [scheduleCompilation, source]);

  const fetchVersionHistory = useCallback(async () => {
    const trimmedName = botName.trim();
    if (!trimmedName) {
      setVersionHistory([]);
      setLastBotId(null);
      setLastBotVersionId(null);
      return;
    }
    const { data: botLookup, error: botLookupError } = await supabase
      .from("bots")
      .select("id")
      .eq("name", trimmedName)
      .maybeSingle();

    if (botLookupError && !isNoRowError(botLookupError)) {
      console.error("Failed to locate bot", botLookupError);
      triggerAlert("error", "Unable to load bot", botLookupError.message);
      return;
    }

    if (!botLookup?.id) {
      setVersionHistory([]);
      setLastBotId(null);
      setLastBotVersionId(null);
      return;
    }

    setLastBotId(botLookup.id);

    const { data, error } = await supabase
      .from("bot_versions")
      .select("id, version, created_at, model, description, label, published_at")
      .eq("bot_id", botLookup.id)
      .order("version", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Failed to load version history", error);
      triggerAlert("error", "Unable to load version history", error.message);
      return;
    }

    setVersionHistory(data ?? []);
    setLastBotVersionId(data && data.length > 0 ? data[0]!.id : null);
  }, [botName, triggerAlert]);

  useEffect(() => {
    void fetchVersionHistory();
  }, [fetchVersionHistory]);

  useEffect(() => {
    setRunTranscript([]);
    setRunOutput("");
    setRunError(null);
    setLastScenarioId(null);
  }, [templateId]);

  const handleDeploy = useCallback(async () => {
    const trimmedName = botName.trim();

    if (!trimmedName) {
      triggerAlert("error", "Bot name required", "Please choose a memorable handle for your bot.");
      return;
    }
    if (!source.trim()) {
      triggerAlert("error", "Hive source missing", "Write some Hive code before deploying.");
      return;
    }
    setIsDeploying(true);
    try {
      const compilation = (await compileHive(source)) as CompileResult;
      if (compilation.diagnostics?.some((diag) => diag.severity === "error")) {
        setDiagnostics(compilation.diagnostics);
        setActiveTab("diagnostics");
        triggerAlert("error", "Fix compilation errors first", "Your Hive script must compile before deployment.");
        return;
      }

      const template = BOT_TEMPLATES.find((entry): entry is BotTemplate => entry.id === templateId) ?? BOT_TEMPLATES[0];
      const manifest = toolManifest.length > 0 ? toolManifest : template.toolManifest ?? [];
      const finalSystemPrompt = (systemPrompt?.trim() || template.systemPrompt || DEFAULT_SYSTEM_PROMPT) as string;
      const finalMemoryStrategy = memoryStrategy || template.memoryStrategy || "ephemeral";

      const metadataPayload = {
        compile: compilation.metadata,
        templateId: template.id,
        capabilities: template.capabilities,
        manifest,
      };

      const ensureUniqueSlug = async (desiredSlug: string, existingId?: string): Promise<string> => {
        const base = desiredSlug || `agent-${Date.now().toString(36)}`;
        let attempt = 0;
        let candidate = base;
        while (attempt < 10) {
          const { data: slugRows, error: slugCheckError } = await supabase
            .from("bots")
            .select("id")
            .eq("slug", candidate)
            .limit(1);

          if (slugCheckError) {
            throw slugCheckError;
          }

          const conflict = Array.isArray(slugRows) && slugRows.length > 0 && slugRows[0]?.id !== existingId;
          if (!conflict) {
            return candidate;
          }

          attempt += 1;
          candidate = `${base}-${attempt}`;
        }

        throw new Error("Unable to generate a unique slug. Try a different bot name.");
      };

      let supportsSlug = true;
      let existingBotId: string | null = null;
      let existingBotSlug: string | null = null;

      const { data: existingBot, error: existingBotError } = await supabase
        .from("bots")
        .select("id, slug")
        .eq("name", trimmedName)
        .maybeSingle();

      if (existingBotError) {
        if (existingBotError.code === POSTGRES_UNDEFINED_COLUMN) {
          supportsSlug = false;
        } else if (!isNoRowError(existingBotError)) {
          throw existingBotError;
        }
      } else if (existingBot) {
        existingBotId = existingBot.id ?? null;
        existingBotSlug = existingBot.slug ?? null;
      }

      if (!supportsSlug && existingBotId === null) {
        const { data: fallbackBot, error: fallbackError } = await supabase
          .from("bots")
          .select("id")
          .eq("name", trimmedName)
          .maybeSingle();

        if (fallbackError && !isNoRowError(fallbackError)) {
          throw fallbackError;
        }

        existingBotId = fallbackBot?.id ?? null;
      }

      const slugSource = slugify(trimmedName || compilation.metadata?.name || "");
      const resolvedSlug = supportsSlug
        ? await ensureUniqueSlug(existingBotSlug ?? slugSource, existingBotId ?? undefined)
        : null;

      const botPayload = {
        name: trimmedName,
        ...(supportsSlug && resolvedSlug ? { slug: resolvedSlug } : {}),
        description: description.trim() || compilation.metadata?.description || null,
        model,
        price,
        source,
        compiled: compilation.code,
        capabilities: template.capabilities,
        config: { template: template.id },
        system_prompt: finalSystemPrompt,
        tool_manifest: manifest,
        memory_strategy: finalMemoryStrategy,
        metadata: metadataPayload,
        status: "active",
      };

      let botId = existingBotId;

      if (botId) {
        const { data: updatedBot, error: updateError } = await supabase
          .from("bots")
          .update(botPayload)
          .eq("id", botId)
          .select("id")
          .single();

        if (updateError) {
          throw updateError;
        }

        botId = updatedBot.id;
      } else {
        const { data: insertedBot, error: insertError } = await supabase
          .from("bots")
          .insert(botPayload)
          .select("id")
          .single();

        if (insertError) {
          throw insertError;
        }

        botId = insertedBot.id;
      }

      if (!botId) {
        throw new Error("Bot record was not created.");
      }

      setLastBotId(botId);

      const { data: latestVersionRows, error: latestVersionError } = await supabase
        .from("bot_versions")
        .select("version")
        .eq("bot_id", botId)
        .order("version", { ascending: false })
        .limit(1);

      if (latestVersionError) {
        throw latestVersionError;
      }

      const nextVersion = ((latestVersionRows?.[0]?.version as number | undefined) ?? 0) + 1;

      const { data: versionRecord, error: versionError } = await supabase
        .from("bot_versions")
        .insert({
          bot_id: botId,
          bot_name: trimmedName,
          version: nextVersion,
          label: `v${nextVersion}`,
          description: description.trim() || compilation.metadata?.description || null,
          model,
          price,
          source,
          compiled: compilation.code,
          system_prompt: finalSystemPrompt,
          tool_manifest: manifest,
          memory_strategy: finalMemoryStrategy,
          metadata: metadataPayload,
          published_at: new Date().toISOString(),
        })
        .select("id, version")
        .single();

      if (versionError) {
        throw versionError;
      }

      if (!versionRecord?.id) {
        throw new Error("Bot version creation failed.");
      }

      setLastBotVersionId(versionRecord.id);

      const { error: defaultVersionError } = await supabase
        .from("bots")
        .update({ default_version_id: versionRecord.id })
        .eq("id", botId);

      if (defaultVersionError) {
        if (defaultVersionError.code === POSTGRES_UNDEFINED_COLUMN) {
          console.warn("default_version_id column missing, skipping pointer update");
        } else {
          throw defaultVersionError;
        }
      }

      triggerAlert("success", "Bot deployed", `Published version ${versionRecord.version}.`, 3200);
      void fetchVersionHistory();
    } catch (error) {
      console.error("Deploy failed", error);
      triggerAlert("error", "Deployment failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsDeploying(false);
    }
  }, [
    botName,
    description,
    fetchVersionHistory,
    memoryStrategy,
    model,
    price,
    source,
    systemPrompt,
    templateId,
    toolManifest,
    triggerAlert,
  ]);

  const handleEditorChange: OnChange = (value) => {
    const nextValue = value ?? "";
    setSource(nextValue);
    scheduleCompilation(nextValue);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04040a] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,77,255,0.22),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(6,7,18,0.85)_0%,rgba(4,4,10,0)_55%)]" />
      <AmbientBackdrop className="-z-10 opacity-24" maskClassName="[mask-image:radial-gradient(ellipse_at_center,transparent_18%,black)]" />

      <ProfessionalAlert
        open={alert !== null}
        variant={alert?.variant ?? "info"}
        title={alert?.title}
        message={alert?.message}
        autoClose={alert?.autoClose}
        onClose={dismissAlert}
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-white/10 bg-black/30 px-5 py-5 backdrop-blur-xl sm:px-8 lg:px-12">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-white/60">
                <Sparkles className="h-3.5 w-3.5 text-white/70" /> Builder Console
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-semibold text-white sm:text-2xl">{activeCopy.title}</h1>
                <span className={cn("rounded-full px-3 py-1 text-xs", deploymentState.tone)}>{deploymentState.label}</span>
              </div>
            </div>

            <div className="flex flex-1 flex-wrap items-center justify-end gap-3 text-sm">
              <nav className="flex flex-wrap items-center gap-1 rounded-full border border-white/10 bg-black/40 px-1 py-1">
                {navItems.map(({ id, label }) => {
                  const isActive = id === activeSection;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveSection(id)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium transition",
                        isActive
                          ? "bg-white/90 text-black shadow-[0_12px_30px_-18px_rgba(124,77,255,0.65)]"
                          : "text-white/60 hover:text-white"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </nav>

              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-white/60 lg:flex">
                <Users className="h-4 w-4 text-white/50" />
                <span className="truncate text-xs font-medium uppercase tracking-[0.16em] text-white/70">
                  {selectedModel?.label ?? "Pick a model"}
                </span>
              </div>
              <ThemeToggle />
              <Link
                href="/docs/hiveland"
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/60 transition hover:text-white md:inline-flex"
              >
                Docs <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleDeploy}
                disabled={isDeploying}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7c4dff] via-[#6d3cff] to-[#4525ff] px-5 py-2 text-sm font-semibold text-white shadow-[0_18px_45px_-20px_rgba(124,77,255,0.55)] transition hover:shadow-[0_20px_60px_-25px_rgba(102,57,255,0.55)] disabled:opacity-60"
              >
                {isDeploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span className="uppercase tracking-[0.16em]">{isDeploying ? "Deploying" : "Publish"}</span>
              </button>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/55">{activeCopy.description}</p>
        </header>

        <main className="relative flex-1 overflow-y-auto overflow-x-hidden px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <AmbientBackdrop className="-z-10 opacity-30" maskClassName="[mask-image:radial-gradient(ellipse_at_center,transparent_18%,black)]" />
          <div className="relative z-10">
            {activeSection === "overview" ? (
              <div className="space-y-10 pb-16">
                {renderSection()}
              </div>
            ) : (
              <>
                <div className="grid gap-6 pb-12 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)]">
                  <GlassCard title="Operational metrics" accent="from-[#2a24531f] via-transparent to-transparent" icon={<LineChart className="h-4 w-4 text-indigo-200" />}>
                    <div className="grid gap-3 md:grid-cols-2">
                      <StatCard title="Capabilities live" value={selectedTemplate.capabilities.length.toString()} detail="Enabled skills in current manifest" />
                      <StatCard title="Active tools" value={activeManifest.length.toString()} detail={activeManifest.map((entry) => entry.tool).join(", ") || "No tools enabled yet"} />
                      <StatCard title="Memory mode" value={memoryStrategy === "ephemeral" ? "Ephemeral" : memoryStrategy === "session" ? "Session" : "Persistent"} detail="How transcripts persist across runs" />
                      <StatCard title="Last publish" value={versionHistory[0]?.label ?? "N/A"} detail="Most recent deployment tag" />
                    </div>
                  </GlassCard>

                  <GlassCard title="Recent activity" accent="from-[#1e1a331f] via-transparent to-transparent" icon={<Bell className="h-4 w-4 text-indigo-200" />}>
                    <VersionTimeline items={versionHistory} />
                  </GlassCard>
                </div>

                <div className="space-y-10 pb-16">
                  {renderSection()}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex w-full flex-col gap-2 text-xs text-white/75">
      <span className={cn("flex flex-wrap items-center justify-between gap-2 text-white/60", CAPS_LABEL)}>
        {label}
        {hint && <span className="text-[10px] text-white/40">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function PanelContainer({
  children,
  className,
  contentClassName,
  accent,
  ambientClassName,
  ambientMaskClassName,
  withAmbient = false,
}: {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  accent?: string;
  ambientClassName?: string;
  ambientMaskClassName?: string;
  withAmbient?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden", PANEL_CLASS, className)}>
      {withAmbient && (
        <AmbientBackdrop
          className={cn("-z-10 opacity-40", ambientClassName)}
          maskClassName={ambientMaskClassName}
        />
      )}
      {accent && (
        <div className={cn("pointer-events-none absolute inset-0 opacity-15 blur-2xl", `bg-gradient-to-br ${accent}`)} />
      )}
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </div>
  );
}

function GlassCard({ title, accent, icon, children }: { title: string; accent: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <PanelContainer accent={accent} className="px-5 py-5" contentClassName="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/[0.05] text-white/70">
            {icon}
          </span>
        )}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white/85">{title}</p>
          <div className="h-px w-10 bg-white/12" />
        </div>
      </div>
      {children}
    </PanelContainer>
  );
}

function StatCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-white/[0.04] px-5 py-5 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.65)]">
      <p className="text-[12px] font-semibold text-white/70">{title}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-semibold text-white">{value}</span>
      </div>
      <p className="mt-3 text-xs text-white/55 line-clamp-2">{detail || ""}</p>
    </div>
  );
}

function PreviewPane({ compiled, isCompiling }: { compiled: string; isCompiling: boolean }) {
  if (isCompiling) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="text-xs uppercase tracking-[0.35em]">Compiling Hive</p>
      </div>
    );
  }

  if (!compiled) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
        <PlayCircle className="h-5 w-5" />
        <p className="text-xs uppercase tracking-[0.35em]">Compile to view generated JavaScript</p>
      </div>
    );
  }

  return (
    <pre className="h-full overflow-auto bg-transparent p-4 text-sm text-slate-200">
{compiled}
    </pre>
  );
}

function DiagnosticsPane({ diagnostics }: { diagnostics: CompileDiagnostic[] }) {
  if (diagnostics.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-emerald-300/80">
        <span className="text-xs uppercase tracking-[0.35em]">No diagnostics</span>
        <p className="text-[11px] text-emerald-200/70">Your Hive code compiled without issues.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      <ul className="space-y-3 text-xs text-slate-200">
        {diagnostics.map((diag, index) => (
          <li
            key={`${diag.message}-${index}`}
            className={cn(
              "rounded-xl border px-3 py-2",
              diag.severity === "error"
                ? "border-rose-500/50 bg-rose-500/10 text-rose-100"
                : "border-amber-500/40 bg-amber-500/10 text-amber-100"
            )}
          >
            <p className="font-semibold">{diag.message}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[-0.05em] opacity-70">
              line {diag.line} · column {diag.column} · {diag.severity}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function VersionTimeline({ items }: { items: BotVersion[] }) {
  if (items.length === 0) {
    return <p className="text-xs text-white/50">Deploy to create your first version snapshot.</p>;
  }

  return (
    <div className="space-y-4 text-xs text-white/70">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3">
          <div className="mt-1 h-2 w-2 rounded-full bg-[#C7B5FF]" />
          <div className="flex-1">
            <p className="font-semibold text-white/90">{item.label ?? `Version ${item.version}`}</p>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
              {new Intl.DateTimeFormat("en", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(item.published_at ?? item.created_at))}
            </p>
            <p className="mt-1 text-white/60">Model: {item.model}</p>
            {item.description && <p className="mt-1 text-white/50">{item.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChecklistItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={cn(
          "inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px]",
          checked ? "border-emerald-400 bg-emerald-500/20 text-emerald-300" : "border-white/20 text-white/40"
        )}
      >
        {checked ? "✔" : ""}
      </span>
      <span>{label}</span>
    </li>
  );
}
