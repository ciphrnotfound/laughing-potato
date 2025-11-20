export type ToolInvocation = {
  name: string;
  arguments: Record<string, unknown>;
};

export type AgentMessage = {
  role: "user" | "agent" | "system";
  content: string;
  tools?: ToolInvocation[];
  timestamp: number;
  agentId?: string;
};

export type AgentDefinition = {
  id: string;
  name: string;
  description?: string;
  skills: string[];
  memoryKeys?: string[];
};

export type BotCapability =
  | "general.respond"
  | "coding.generate"
  | "coding.review"
  | "study.tutor"
  | "study.quiz"
  | "integrations.firebase.read"
  | "integrations.firebase.write"
  | "integrations.whatsapp.send"
  | "social.publish";

export type TenantFirebaseAdapter = {
  getCollection?: (collectionPath: string, options?: Record<string, unknown>) => Promise<unknown>;
  getDocument?: (documentPath: string, options?: Record<string, unknown>) => Promise<unknown>;
  setDocument?: (documentPath: string, data: unknown, options?: Record<string, unknown>) => Promise<void>;
  runQuery?: (query: Record<string, unknown>) => Promise<unknown>;
};

export type TenantWhatsAppAdapter = {
  sendMessage?: (payload: {
    to: string;
    body: string;
    mediaUrl?: string;
    template?: string;
    variables?: Record<string, string>;
  }) => Promise<Record<string, unknown>>;
};

export type TenantContext = {
  id?: string;
  name?: string;
  timezone?: string | null;
  firebase?: TenantFirebaseAdapter;
  whatsapp?: TenantWhatsAppAdapter;
  integrations?: Record<string, unknown>;
};

export type SharedMemory = {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
  append: (key: string, value: unknown) => Promise<void>;
};

export type ToolContext = {
  supabaseService?: unknown;
  metadata: {
    botId: string;
    runId: string;
    userId?: string;
    botVersionId?: string;
    botVersion?: number;
    botSystemPrompt?: string;
    memoryStrategy?: string;
  };
  sharedMemory: SharedMemory;
  tenant?: TenantContext;
};

export type ToolResult = {
  success: boolean;
  output: string;
  data?: unknown;
};

export type ToolDescriptor = {
  name: string;
  capability: BotCapability;
  description: string;
  run: (args: Record<string, unknown>, ctx: ToolContext) => Promise<ToolResult>;
};

export type ToolManifestEntry = {
  capability: BotCapability;
  tool: string;
  description?: string;
  enabled?: boolean;
};

export type RunStep = {
  agentId: string;
  input: Record<string, unknown> | string;
};

export type RunRequest = {
  steps: RunStep[];
  context?: Record<string, unknown>;
  botVersionId?: string;
};

export type RunResult = {
  transcript: AgentMessage[];
  output: string;
};
