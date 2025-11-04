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

export type RunStep = {
  agentId: string;
  input: string;
};

export type RunRequest = {
  steps: RunStep[];
  context?: Record<string, unknown>;
};

export type RunResult = {
  transcript: AgentMessage[];
  output: string;
};



