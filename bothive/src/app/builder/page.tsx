"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Bell,
  ClipboardCheck,
  CloudUpload,
  Code2,
  Gauge,
  Globe,
  LifeBuoy,
  LineChart,
  Loader2,
  Laptop,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Monitor,
  RefreshCw,
  Puzzle,
  PlayCircle,
  Smartphone,
  SidebarClose,
  SidebarOpen,
  Star,
  Rocket,
  Settings2,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { ProfessionalAlert } from "@/components/ui/glass-alert";
import { compileHive } from "@/lib/hive-compiler";
import { supabase } from "@/lib/supabase";
import { cn, slugify } from "@/lib/utils";
import type { ToolManifestEntry } from "@/lib/agentTypes";
import AmbientBackdrop from "@/components/AmbientBackdrop";
import type { LucideIcon } from "lucide-react";

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
  id: "general" | "coding" | "study";
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
};

const POSTGREST_NO_ROWS_CODE = "PGRST116";
const POSTGRES_UNDEFINED_COLUMN = "42703";

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
};

const BOT_TEMPLATES: BotTemplate[] = [
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

type StoreFormState = {
  tagline: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  landingUrl: string;
  heroImage: string;
  previewVideo: string;
  supportEmail: string;
  complianceAcknowledged: boolean;
};

const STORE_CATEGORIES = [
  "General Assistant",
  "Developer Tools",
  "Education",
  "Productivity",
  "Sales & Success",
  "Custom",
];

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

const PANEL_CLASS = "rounded-3xl border border-slate-900 bg-black/80 shadow-[0_45px_90px_-60px_rgba(10,10,40,0.9)] backdrop-blur-xl";

const FEED_CARDS = [
  {
    id: "ai",
    title: "AI-Driven Enhancements",
    description: "Build sleek, high-performing websites faster than ever with our powerful UI kit — the ultimate boost for your SaaS product.",
    icon: Sparkles,
  },
  {
    id: "languages",
    title: "Languages Support",
    description: "Seamlessly adapt your product to global audiences with multilingual support and smooth language switching.",
    icon: Globe,
  },
  {
    id: "plugins",
    title: "Plugins and extensions",
    description: "Extend your platform with compatible plugins, marketplace integrations, and powerful automation.",
    icon: Puzzle,
  },
];

const QUICK_COMMANDS = [
  { id: "compile", label: "Compile code", shortcut: "⌘K" },
  { id: "nodes", label: "Switch to logic nodes", shortcut: "⌘L" },
  { id: "collaborators", label: "Add collaborators", shortcut: "⇧⌘C" },
];

const FAKE_STORE_LISTINGS: Array<{
  id: string;
  name: string;
  category: string;
  blurb: string;
  rating: string;
  icon: LucideIcon;
}> = [
  {
    id: "concierge-ai",
    name: "Concierge AI",
    category: "Productivity",
    blurb: "Automates daily standups, drafts recaps, and pings owners when blockers linger too long.",
    rating: "4.9",
    icon: Sparkles,
  },
  {
    id: "sales-sensei",
    name: "Sales Sensei",
    category: "Customer success",
    blurb: "Qualifies inbound leads, recommends follow-up playbooks, and syncs outcomes into your CRM.",
    rating: "4.8",
    icon: MessageCircle,
  },
  {
    id: "atlas-analytics",
    name: "Atlas Analytics",
    category: "Developers",
    blurb: "Explains complex telemetry in human terms and suggests experiments to boost retention.",
    rating: "4.7",
    icon: Activity,
  },
  {
    id: "mentor-muse",
    name: "Mentor Muse",
    category: "Education",
    blurb: "Delivers adaptive lesson plans and synchronous study prompts for remote classrooms.",
    rating: "4.9",
    icon: Globe,
  },
  {
    id: "support-pro",
    name: "Support Pro",
    category: "Customer success",
    blurb: "Drafts empathetic replies, escalates urgent threads, and keeps knowledge bases up to date.",
    rating: "4.8",
    icon: LifeBuoy,
  },
  {
    id: "fusion-forge",
    name: "Fusion Forge",
    category: "Developers",
    blurb: "Pairs with engineers to scaffold services, review pull requests, and generate release notes.",
    rating: "4.9",
    icon: Code2,
  },
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
  "w-full rounded-lg border border-white/5 bg-[#10131f] px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-indigo-400/40 focus:outline-none focus:ring-0";
const TEXTAREA_CLASS =
  "w-full rounded-xl border border-white/5 bg-[#10131f] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-indigo-400/40 focus:outline-none focus:ring-0";
const SELECT_CLASS =
  "w-full rounded-lg border border-white/5 bg-[#10131f] px-3 py-2 text-sm text-slate-100 transition focus:border-indigo-400/40 focus:outline-none focus:ring-0";

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
  const [versionHistory, setVersionHistory] = useState<BotVersion[]>([]);
  const [activeTab, setActiveTab] = useState<"preview" | "diagnostics">("preview");
  const [templateId, setTemplateId] = useState<BotTemplate["id"]>("general");
  const [lastBotId, setLastBotId] = useState<string | null>(null);
  const [lastBotVersionId, setLastBotVersionId] = useState<string | null>(null);
  const [isRunningScenario, setIsRunningScenario] = useState(false);
  const [runTranscript, setRunTranscript] = useState<AgentMessage[]>([]);
  const [runOutput, setRunOutput] = useState<string>("");
  const [runError, setRunError] = useState<string | null>(null);
  const [lastScenarioId, setLastScenarioId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const compileTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>(TEMPLATE_SYSTEM_PROMPTS.general ?? DEFAULT_SYSTEM_PROMPT);
  const [memoryStrategy, setMemoryStrategy] = useState<string>(TEMPLATE_MEMORY_STRATEGY.general ?? "ephemeral");
  const [toolManifest, setToolManifest] = useState<ToolManifestEntry[]>(() =>
    (TEMPLATE_TOOL_MANIFEST.general ?? []).map((entry) => ({ ...entry }))
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatRunId, setChatRunId] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [selectedChatCapability, setSelectedChatCapability] = useState<BotCapability>("general.respond");
  const [activeSection, setActiveSection] = useState<SectionId>("build");
  const [storeDraft, setStoreDraft] = useState<StoreFormState>({
    tagline: "",
    shortDescription: "",
    longDescription: "",
    category: STORE_CATEGORIES[0] ?? "General Assistant",
    landingUrl: "",
    heroImage: "",
    previewVideo: "",
    supportEmail: "",
    complianceAcknowledged: false,
  });
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

  const toggleManifestEntry = useCallback((toolName: string) => {
    setToolManifest((prev) =>
      prev.map((entry) => {
        if (entry.tool !== toolName) return entry;
        const currentlyEnabled = entry.enabled !== false;
        return { ...entry, enabled: !currentlyEnabled };
      })
    );
  }, []);

  const sidebarItems = useMemo(
    () => [
      { id: "overview" as SectionId, label: "Mission control", icon: Gauge },
      { id: "build" as SectionId, label: "Forge", icon: Code2 },
      { id: "play" as SectionId, label: "Playground", icon: MessageSquare },
      { id: "deploy" as SectionId, label: "Launch", icon: Rocket },
      { id: "store" as SectionId, label: "Hive store", icon: Store },
    ],
    []
  );

  const handleStoreChange = useCallback(<K extends keyof StoreFormState>(key: K, value: StoreFormState[K]) => {
    setStoreDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

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

  const activeManifest = useMemo(
    () => toolManifest.filter((entry) => entry.enabled !== false),
    [toolManifest]
  );

  const selectableCapabilities = useMemo(
    () => (activeManifest.length > 0 ? activeManifest.map((entry) => entry.capability) : selectedTemplate.capabilities),
    [activeManifest, selectedTemplate]
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

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((previous) => !previous);
  }, []);

  const openMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(true);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const renderSidebarContent = useCallback(
    (isCompact: boolean, variant: "desktop" | "mobile" = "desktop") => {
      const now = new Date();

      const handleNavigate = (id: SectionId) => {
        setActiveSection(id);
        if (variant === "mobile") {
          closeMobileSidebar();
        }
      };

      return (
        <div className="flex h-full flex-col gap-6">
          <div
            className={cn(
              "flex items-center gap-3 text-sm font-medium text-slate-300",
              isCompact ? "justify-center" : ""
            )}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#11111a] text-indigo-300">
              <Sparkles className="h-4 w-4" />
            </div>
            {!isCompact && (
              <div className="leading-tight">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">.code</p>
                <p className="text-base text-slate-200">Nebula Forge</p>
              </div>
            )}
            {variant === "mobile" && (
              <button
                type="button"
                onClick={closeMobileSidebar}
                className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:border-indigo-400/40"
                aria-label="Close sidebar"
              >
                <SidebarClose className="h-4 w-4" />
              </button>
            )}
          </div>

          <div
            className={cn(
              "rounded-2xl border border-slate-800/70 bg-[#11111a]/80 px-4 py-3 text-xs text-slate-400",
              isCompact ? "text-center" : "flex items-center justify-between"
            )}
          >
            <div
              className={cn(
                "flex flex-col",
                isCompact ? "items-center gap-1" : ""
              )}
            >
              <span className="uppercase tracking-[0.35em]">Server time</span>
              <span className="mt-1 text-slate-200">
                {now.toLocaleDateString()} · {now.toLocaleTimeString()}
              </span>
            </div>
            {!isCompact && <MoreHorizontal className="h-4 w-4 text-slate-600" />}
          </div>

          <nav className="space-y-1 text-sm text-slate-300">
            {sidebarItems.map(({ id, label, icon: Icon }) => {
              const isActive = id === activeSection;
              return (
                <button
                  key={id}
                  type="button"
                  aria-label={label}
                  onClick={() => handleNavigate(id)}
                  className={cn(
                    "flex w-full items-center rounded-2xl py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60",
                    isCompact ? "justify-center gap-0 px-0" : "gap-3 px-4",
                    isActive
                      ? "bg-[linear-gradient(135deg,rgba(108,99,255,0.35),rgba(45,33,76,0.6))] text-white shadow-[0_12px_35px_-20px_rgba(96,90,255,0.8)]"
                      : "bg-transparent text-slate-500 hover:bg-[#12121f] hover:text-slate-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {!isCompact && <span className="font-medium tracking-wide">{label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3 text-sm text-slate-400">
            <button
              type="button"
              className={cn(
                "flex w-full items-center justify-between rounded-2xl border border-slate-800/70 bg-[#10101a] px-4 py-3 text-left transition hover:border-indigo-400/40",
                isCompact ? "flex-col gap-2 text-center" : ""
              )}
            >
              <div className={cn("flex items-center gap-3", isCompact ? "justify-center" : "")}>{
                <>
                  <LifeBuoy className="h-4 w-4 text-slate-500" />
                  {!isCompact && <span>Support</span>}
                </>
              }</div>
              {!isCompact && <ArrowUpRight className="h-4 w-4 text-slate-600" />}
            </button>
            <button
              type="button"
              className={cn(
                "flex w-full items-center justify-between rounded-2xl border border-slate-800/70 bg-[#10101a] px-4 py-3 text-left transition hover:border-indigo-400/40",
                isCompact ? "flex-col gap-2 text-center" : ""
              )}
            >
              <div className={cn("flex items-center gap-3", isCompact ? "justify-center" : "")}>{
                <>
                  <Settings2 className="h-4 w-4 text-slate-500" />
                  {!isCompact && <span>Settings</span>}
                </>
              }</div>
              {!isCompact && <ArrowUpRight className="h-4 w-4 text-slate-600" />}
            </button>

            {variant === "desktop" && (
              <button
                type="button"
                onClick={toggleSidebarCollapse}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/5 bg-[#11111a] px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-indigo-400/40"
              >
                {isCompact ? <SidebarOpen className="h-4 w-4" /> : <SidebarClose className="h-4 w-4" />}
                {!isCompact && <span>{isCompact ? "Expand" : "Collapse"}</span>}
              </button>
            )}
          </div>
        </div>
      );
    },
    [activeSection, closeMobileSidebar, sidebarItems, toggleSidebarCollapse]
  );

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
            <div className="space-y-6">
              <PanelContainer withAmbient={false} className="p-8">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-slate-400">
                      <Gauge className="h-3 w-3 text-indigo-300" />
                      Mission control
                    </span>
                    <h2 className="text-2xl font-semibold text-white">Observe your swarm at a glance</h2>
                    <p className="max-w-xl text-sm text-slate-400">
                      Track compilation health, deployment status, and recent activity in one streamlined console.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeploy}
                    disabled={isDeploying}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6f6cff] via-[#5c57ff] to-[#423aff] px-5 py-2 text-sm font-semibold text-white transition hover:shadow-[0_18px_45px_-20px_rgba(95,90,255,0.75)] disabled:opacity-60"
                  >
                    {isDeploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                    {isDeploying ? "Deploying" : "Launch update"}
                  </button>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {overviewStats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/5 bg-white/2 p-4">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">{stat.label}</p>
                      <p className="mt-3 text-base font-semibold text-slate-100">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </PanelContainer>

              <div className={cn("p-8", PANEL_CLASS)}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-200">Highlights feed</h3>
                  <span className="text-[11px] uppercase tracking-[0.35em] text-slate-500">Insights</span>
                </div>
                <div className="mt-5 space-y-3">
                  {FEED_CARDS.map((card, index) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.id}
                        className="flex items-start gap-4 rounded-2xl border border-white/5 bg-[#10121d] px-5 py-4"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#181c2c] text-indigo-300">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-100">{card.title}</p>
                          <p className="text-xs text-slate-400">{card.description}</p>
                        </div>
                        <span className="ml-auto text-xs text-slate-600">{String(index + 1).padStart(2, "0")}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={cn("p-8", PANEL_CLASS)}>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Timeline</span>
                  <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Versions</span>
                </div>
                <div className="mt-5 max-h-[260px] overflow-y-auto pr-1">
                  <VersionTimeline items={versionHistory} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className={cn("space-y-5 p-6", PANEL_CLASS)}>
                <div className="flex items-center justify-between text-sm text-slate-200">
                  <span>Command palette</span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-500">
                    ⌘K
                  </span>
                </div>
                <div className="relative">
                  <MessageCircle className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                  <input
                    type="text"
                    placeholder="Search actions or jump to a surface"
                    className="w-full rounded-2xl border border-white/5 bg-[#10131f] py-3 pl-12 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400/40 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  {QUICK_COMMANDS.map((command) => (
                    <div key={command.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#0e111c] px-4 py-3 text-sm text-slate-200">
                      <span>{command.label}</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-500">
                        {command.shortcut}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={cn("space-y-4 p-6", PANEL_CLASS)}>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>HiveLang example · SupportGuide</span>
                  <button className="inline-flex items-center gap-2 text-xs font-medium text-indigo-300 transition hover:text-indigo-200">
                    <ClipboardCheck className="h-4 w-4" />
                    Copy
                  </button>
                </div>
                <pre className="max-h-[240px] overflow-auto rounded-2xl border border-white/5 bg-[#0c101c] p-4 text-xs leading-relaxed text-slate-200">
                  <code>{CODE_SNIPPET}</code>
                </pre>
              </div>

              <div className={cn("space-y-4 p-6", PANEL_CLASS)}>
                <h4 className="text-sm font-semibold text-slate-200">Scenario digest</h4>
                <div className="rounded-2xl border border-white/5 bg-[#0e111c] px-4 py-3 text-sm text-slate-200">
                  {runOutput ? runOutput : "Run a curated scenario to populate outcome summaries."}
                </div>
              </div>

              <div className={cn("space-y-4 p-6", PANEL_CLASS)}>
                <h4 className="text-sm font-semibold text-slate-200">Recent chat excerpts</h4>
                <div className="space-y-3">
                  {chatMessages.length > 0 ? (
                    chatMessages
                      .slice(-4)
                      .reverse()
                      .map((message) => (
                        <div key={message.id} className="rounded-2xl border border-white/5 bg-[#0e111c] px-4 py-3 text-xs text-slate-200">
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-slate-500">
                            <span>{message.role}</span>
                            <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="mt-2 text-slate-300">{message.content}</p>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs text-slate-500">Start a conversation to populate this feed.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }
      case "build":
        return (
          <div className="grid gap-8 xl:grid-cols-[minmax(0,0.66fr)_minmax(0,0.34fr)]">
            <div className={cn("space-y-6 p-8", PANEL_CLASS)}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Bot name">
                  <input
                    value={botName}
                    onChange={(event) => setBotName(event.target.value)}
                    placeholder="WelcomeAgent"
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Marketplace price (USD)">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={price}
                    onChange={(event) => setPrice(Number(event.target.value))}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Model">
                  <select value={model} onChange={(event) => setModel(event.target.value)} className={SELECT_CLASS}>
                    {MODEL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-[#0b101b] text-slate-100">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Summarize what your agent excels at..."
                  className={TEXTAREA_CLASS}
                  rows={4}
                />
              </Field>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Templates</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={resetEditor}
                      className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-[#12172a] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-indigo-400/40"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Load template
                    </button>
                    <button
                      type="button"
                      onClick={() => scheduleCompilation(source)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-[#12172a] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-indigo-400/40"
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      Recompile
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {BOT_TEMPLATES.map((template) => {
                    const isActive = template.id === templateId;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setTemplateId(template.id)}
                        className={cn(
                          "flex flex-col gap-2 rounded-2xl border px-4 py-3 text-left transition",
                          isActive
                            ? "border-indigo-400/50 bg-[#1a1f33] text-slate-100"
                            : "border-white/5 bg-[#10131f] text-slate-300 hover:border-indigo-400/30 hover:text-slate-100"
                        )}
                      >
                        <span className="text-xs font-semibold uppercase tracking-[0.28em]">{template.label}</span>
                        <span className="text-xs text-slate-400">{template.blurb}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0b101b]">
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
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <GlassCard title="Persona core" accent="from-[#28213f22] via-transparent to-transparent" icon={<Sparkles className="h-4 w-4 text-indigo-200" />}>
                <Field label="System prompt">
                  <textarea
                    value={systemPrompt}
                    onChange={(event) => setSystemPrompt(event.target.value)}
                    placeholder="Explain the agent's persona, tone, and decision framework."
                    className={TEXTAREA_CLASS}
                    rows={5}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]">
                  <Field label="Memory strategy">
                    <select value={memoryStrategy} onChange={(event) => setMemoryStrategy(event.target.value)} className={SELECT_CLASS}>
                      {MEMORY_STRATEGY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="bg-[#0b101b] text-slate-100">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Tool manifest</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {toolManifest.map((entry) => {
                        const enabled = entry.enabled !== false;
                        return (
                          <button
                            key={entry.tool}
                            type="button"
                            onClick={() => toggleManifestEntry(entry.tool)}
                            className={cn(
                              "flex flex-col gap-1 rounded-xl border px-3 py-3 text-left transition",
                              enabled
                                ? "border-indigo-400/40 bg-[#1b2032] text-slate-100"
                                : "border-white/5 bg-[#10131f] text-slate-400 hover:border-indigo-400/30 hover:text-slate-100"
                            )}
                          >
                            <span className="text-[11px] uppercase tracking-[0.28em]">{CAPABILITY_LABELS[entry.capability] ?? entry.capability}</span>
                            <span className="text-xs text-slate-400">{entry.description ?? entry.tool}</span>
                            <span className="text-[10px] text-slate-500">{enabled ? "Active" : "Muted"}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <p className="rounded-2xl border border-white/5 bg-[#111426] px-4 py-3 text-xs text-slate-400">
                  <strong className="mr-2 font-semibold text-slate-100">Persona tip:</strong>
                  Outline tone, safety rails, and how this bot collaborates with the swarm.
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
                        ? "border-indigo-400/60 bg-[#1b2031] text-slate-100"
                        : "border-white/5 bg-[#10131f] text-slate-400 hover:border-indigo-400/30 hover:text-slate-100"
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
                        ? "border-indigo-400/60 bg-[#1b2031] text-slate-100"
                        : "border-white/5 bg-[#10131f] text-slate-400 hover:border-indigo-400/30 hover:text-slate-100"
                    )}
                  >
                    Diagnostics
                  </button>
                </div>

                <div className="mt-4 h-[340px] overflow-hidden rounded-2xl border border-white/5 bg-[#0b101b]">
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
                              message.role === "user" ? "text-slate-300" : message.role === "assistant" ? "text-indigo-300" : "text-slate-500"
                            )}
                          >
                            {message.role}
                            <span className="ml-2 text-[9px] lowercase text-slate-500">{new Date(message.timestamp).toLocaleTimeString()}</span>
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
            message: err instanceof Error ? err.message : "Unknown compilation error",
            line: 1,
            column: 1,
            severity: "error",
          },
        ]);
        setActiveTab("diagnostics");
        triggerAlert("error", "Compilation failed", err instanceof Error ? err.message : "Unknown compilation error");
      } finally {
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
    <div className="relative flex min-h-screen bg-[#0b0c10] text-slate-100">
      <AmbientBackdrop className="-z-10 opacity-80" maskClassName="[mask-image:radial-gradient(ellipse_at_center,transparent_12%,black)]" />

      <ProfessionalAlert
        open={alert !== null}
        variant={alert?.variant ?? "info"}
        title={alert?.title}
        message={alert?.message}
        autoClose={alert?.autoClose}
        onClose={dismissAlert}
      />

      <aside
        className={cn(
          "relative z-20 hidden h-full flex-col overflow-hidden border-r border-slate-900/80 bg-black/80 backdrop-blur-xl transition-all duration-300 lg:flex",
          isSidebarCollapsed ? "w-[92px] px-4 py-6" : "w-[260px] px-6 py-8"
        )}
        aria-label="Sidebar navigation"
      >
        <AmbientBackdrop className="-z-10 opacity-40" maskClassName="[mask-image:radial-gradient(ellipse_at_center,transparent_18%,black)]" />
        <div className="relative z-10 h-full">{renderSidebarContent(isSidebarCollapsed)}</div>
      </aside>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={closeMobileSidebar}
            role="presentation"
          />
          <div className="absolute inset-y-0 left-0 flex w-[260px] flex-col overflow-hidden border-r border-slate-900/80 bg-black/90 px-6 py-8 shadow-xl">
            <AmbientBackdrop className="-z-10 opacity-45" maskClassName="[mask-image:radial-gradient(ellipse_at_center,transparent_18%,black)]" />
            <div className="relative z-10 h-full">{renderSidebarContent(false, "mobile")}</div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <header className="relative overflow-hidden border-b border-slate-900/80 bg-black/80 px-5 py-6 backdrop-blur-xl sm:px-8 lg:px-10">
          <AmbientBackdrop className="-z-10 opacity-35" maskClassName="[mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openMobileSidebar}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:border-indigo-400/40 lg:hidden"
                  aria-label="Open sidebar"
                >
                  <SidebarOpen className="h-4 w-4" />
                </button>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-800/70 bg-[#11111b] px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-slate-500">
                  <Sparkles className="h-3 w-3 text-indigo-300" />
                  Builder
                </span>
                <button
                  type="button"
                  onClick={toggleSidebarCollapse}
                  className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:border-indigo-400/40 lg:inline-flex"
                  aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {isSidebarCollapsed ? <SidebarOpen className="h-4 w-4" /> : <SidebarClose className="h-4 w-4" />}
                </button>
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-slate-50">{activeCopy.title}</h1>
                <p className="text-sm text-slate-500">{activeCopy.description}</p>
              </div>
            </div>

            <div className="flex w-full flex-wrap items-center justify-end gap-3 text-sm sm:flex-nowrap lg:w-auto">
              <ThemeToggle />
              <Link
                href="/docs/hiveland"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-800/70 bg-[#11111b] px-4 py-2 text-slate-400 transition hover:border-slate-700 hover:text-slate-100 sm:w-auto"
              >
                Hiveland docs
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <div className="hidden min-w-[200px] items-center gap-3 rounded-2xl border border-slate-800/70 bg-[#11111b] px-4 py-2 text-slate-400 lg:flex">
                <Users className="h-4 w-4 text-indigo-300" />
                <span className="truncate">{selectedModel?.label ?? "Pick a model"}</span>
              </div>
              <button
                type="button"
                onClick={handleDeploy}
                disabled={isDeploying}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6b64ff] via-[#6056ff] to-[#5144ff] px-5 py-2 text-sm font-semibold text-white transition hover:shadow-[0_12px_32px_rgba(94,86,255,0.35)] disabled:opacity-60 sm:w-auto"
              >
                {isDeploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isDeploying ? "Deploying" : "Generate release"}
              </button>
            </div>
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto overflow-x-hidden px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
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
    <label className="flex w-full flex-col gap-2 text-xs text-white/70">
      <span className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-white/55">
        {label}
        {hint && <span className="text-[10px] text-white/35">{hint}</span>}
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
  withAmbient = true,
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
          className={cn("-z-10 opacity-65", ambientClassName)}
          maskClassName={ambientMaskClassName}
        />
      )}
      {accent && (
        <div className={cn("pointer-events-none absolute inset-0 opacity-20 blur-2xl", `bg-gradient-to-br ${accent}`)} />
      )}
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </div>
  );
}

function GlassCard({ title, accent, icon, children }: { title: string; accent: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <PanelContainer withAmbient={false} accent={accent} className="px-6 py-6" contentClassName="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {icon && <span className="rounded-full border border-slate-800 bg-slate-900/80 p-2 text-slate-300">{icon}</span>}
        <h2 className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-200">{title}</h2>
      </div>
      {children}
    </PanelContainer>
  );
}

function StatCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-3xl border border-slate-900 bg-slate-950/80 px-5 py-5 shadow-[0_35px_80px_-60px_rgba(15,15,40,0.85)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">{title}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-semibold text-slate-100">{value}</span>
      </div>
      <p className="mt-2 text-xs text-slate-500 line-clamp-2">{detail || ""}</p>
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
