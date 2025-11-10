export type HiveDiagnosticSeverity = "error" | "warning";

export interface HiveDiagnostic {
  message: string;
  line: number;
  column: number;
  severity: HiveDiagnosticSeverity;
}

interface HiveCompileOptions {
  defaultModel?: string;
}

interface HiveIfNode {
  type: "if";
  condition: string;
  thenSteps: HiveStep[];
  elseSteps?: HiveStep[];
}

interface HiveLoopNode {
  type: "loop";
  target: string;
  iterator?: string;
  steps: HiveStep[];
}

interface HiveSayNode {
  type: "say";
  payload: string;
}

interface HiveToolsNode {
  type: "tools";
  tools: string[];
}

interface HiveMemoryNode {
  type: "memory";
  keys: string[];
}

export type HiveStep = HiveIfNode | HiveLoopNode | HiveSayNode | HiveToolsNode | HiveMemoryNode;

export interface HiveAst {
  name: string;
  description?: string;
  tools: Set<string>;
  memory: Set<string>;
  steps: HiveStep[];
}

export interface HiveCompileResult {
  code: string;
  diagnostics: HiveDiagnostic[];
  metadata: {
    name: string;
    description?: string;
    tools: string[];
    memory: string[];
  };
}

const BOT_DECLARATION = /^bot\s+([A-Za-z][A-Za-z0-9_-]*)$/i;
const DESCRIPTION_DECLARATION = /^description\s+"([^"]*)"$/i;
const ON_INPUT_DECLARATION = /^on\s+input$/i;
const SAY_INLINE = /^say\s+"(.*)"$/i;
const SAY_MULTILINE_START = /^say\s+"""$/i;
const SAY_MULTILINE_END = /^"""$/;
const TOOLS_STATEMENT = /^tools\(([^)]*)\)$/i;
const MEMORY_STATEMENT = /^memory\[([^\]]*)\]$/i;
const IF_STATEMENT = /^if\s+(.+)$/i;
const ELSE_STATEMENT = /^else$/i;
const LOOP_STATEMENT = /^loop\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s+in\s+(.+))?$/i;
const END_STATEMENT = /^end$/i;

interface ParseContext {
  ast: HiveAst;
  diagnostics: HiveDiagnostic[];
  stack: Array<{ type: "root" | "if" | "loop"; node: HiveStep | { steps: HiveStep[]; elseSteps?: HiveStep[] } } & Record<string, unknown>>;
  currentSteps: HiveStep[];
  captureMultiline?: {
    buffer: string[];
    line: number;
  };
  insideSay?: boolean;
  expectingBotEnd: boolean;
  insideOnBlock: boolean;
}

export async function compileHive(source: string, options: HiveCompileOptions = {}): Promise<HiveCompileResult> {
  const diagnostics: HiveDiagnostic[] = [];
  const trimmedSource = source.split(/\r?\n/);

  const ast: HiveAst = {
    name: "",
    description: undefined,
    tools: new Set<string>(),
    memory: new Set<string>(),
    steps: [],
  };

  const ctx: ParseContext = {
    ast,
    diagnostics,
    stack: [{ type: "root", node: { steps: ast.steps } }],
    currentSteps: ast.steps,
    expectingBotEnd: false,
    insideOnBlock: false,
  };

  for (let index = 0; index < trimmedSource.length; index += 1) {
    const rawLine = trimmedSource[index] ?? "";
    const line = rawLine.trim();
    const lineNumber = index + 1;

    if (ctx.captureMultiline) {
      if (SAY_MULTILINE_END.test(line)) {
        const payload = ctx.captureMultiline.buffer.join("\n");
        appendStep(ctx, { type: "say", payload });
        ctx.captureMultiline = undefined;
        ctx.insideSay = false;
      } else {
        ctx.captureMultiline.buffer.push(rawLine.replace(/^\s*/, ""));
      }
      continue;
    }

    if (!line) continue;

    if (!ctx.ast.name) {
      const botMatch = line.match(BOT_DECLARATION);
      if (botMatch) {
        ctx.ast.name = botMatch[1];
        ctx.expectingBotEnd = true;
        continue;
      }
      diagnostics.push(makeDiagnostic(lineNumber, 1, 'error', "Hive programs must start with 'bot <Name>'"));
      break;
    }

    if (!ctx.insideOnBlock) {
      if (DESCRIPTION_DECLARATION.test(line)) {
        const [, desc] = line.match(DESCRIPTION_DECLARATION) ?? [];
        ctx.ast.description = desc;
        continue;
      }

      if (ON_INPUT_DECLARATION.test(line)) {
        ctx.insideOnBlock = true;
        continue;
      }

      if (END_STATEMENT.test(line)) {
        ctx.expectingBotEnd = false;
        break;
      }

      diagnostics.push(makeDiagnostic(lineNumber, 1, 'warning', `Unexpected statement outside 'on input' block: ${line}`));
      continue;
    }

    if (SAY_INLINE.test(line)) {
      const [, payload] = line.match(SAY_INLINE) ?? [];
      appendStep(ctx, { type: "say", payload: payload ?? "" });
      continue;
    }

    if (SAY_MULTILINE_START.test(line)) {
      ctx.captureMultiline = { buffer: [], line: lineNumber };
      ctx.insideSay = true;
      continue;
    }

    if (TOOLS_STATEMENT.test(line)) {
      const [, toolsRaw] = line.match(TOOLS_STATEMENT) ?? [];
      const tools = toolsRaw
        ?.split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
      if (!tools || tools.length === 0) {
        diagnostics.push(makeDiagnostic(lineNumber, 1, 'warning', "tools() requires at least one identifier"));
        continue;
      }
      tools.forEach((tool) => ctx.ast.tools.add(tool));
      appendStep(ctx, { type: "tools", tools });
      continue;
    }

    if (MEMORY_STATEMENT.test(line)) {
      const [, memoryRaw] = line.match(MEMORY_STATEMENT) ?? [];
      const keys = memoryRaw
        ?.split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
      if (!keys || keys.length === 0) {
        diagnostics.push(makeDiagnostic(lineNumber, 1, 'warning', "memory[] requires at least one key"));
        continue;
      }
      keys.forEach((key) => ctx.ast.memory.add(key));
      appendStep(ctx, { type: "memory", keys });
      continue;
    }

    if (IF_STATEMENT.test(line)) {
      const [, condition] = line.match(IF_STATEMENT) ?? [];
      const node: HiveIfNode = { type: "if", condition: condition?.trim() ?? "", thenSteps: [] };
      appendStep(ctx, node);
      ctx.stack.push({ type: "if", node, steps: node.thenSteps, elseSteps: [] });
      ctx.currentSteps = node.thenSteps;
      continue;
    }

    if (ELSE_STATEMENT.test(line)) {
      const top = ctx.stack.at(-1);
      if (!top || top.type !== "if") {
        diagnostics.push(makeDiagnostic(lineNumber, 1, 'error', "'else' without matching 'if'"));
        continue;
      }
      const node = top.node as HiveIfNode;
      node.elseSteps = [];
      top.elseSteps = node.elseSteps;
      ctx.currentSteps = node.elseSteps;
      continue;
    }

    if (LOOP_STATEMENT.test(line)) {
      const [, iterator, targetRaw] = line.match(LOOP_STATEMENT) ?? [];
      const node: HiveLoopNode = {
        type: "loop",
        target: (targetRaw ?? iterator ?? "").trim(),
        iterator: iterator?.trim(),
        steps: [],
      };
      appendStep(ctx, node);
      ctx.stack.push({ type: "loop", node, steps: node.steps });
      ctx.currentSteps = node.steps;
      continue;
    }

    if (END_STATEMENT.test(line)) {
      const top = ctx.stack.pop();
      if (!top || top.type === "root") {
        ctx.stack.push(top ?? { type: "root", node: { steps: ctx.ast.steps } });
        diagnostics.push(makeDiagnostic(lineNumber, 1, 'warning', "Unexpected 'end'"));
        continue;
      }
      ctx.currentSteps = (ctx.stack.at(-1)?.steps as HiveStep[]) ?? ctx.ast.steps;
      continue;
    }

    diagnostics.push(makeDiagnostic(lineNumber, 1, 'warning', `Unrecognised statement: ${line}`));
  }

  if (ctx.captureMultiline) {
    diagnostics.push(makeDiagnostic(ctx.captureMultiline.line, 1, 'error', "Unterminated multi-line say block"));
  }

  if (!ctx.ast.name) {
    diagnostics.push(makeDiagnostic(1, 1, 'error', "No bot declaration found"));
  }

  if (ctx.expectingBotEnd) {
    diagnostics.push(makeDiagnostic(trimmedSource.length, 1, 'warning', "Missing 'end' to close bot definition"));
  }

  const compileResult = buildJavaScript(ctx.ast, options, diagnostics);
  return compileResult;
}

function appendStep(ctx: ParseContext, step: HiveStep) {
  ctx.currentSteps.push(step);
}

function makeDiagnostic(line: number, column: number, severity: HiveDiagnosticSeverity, message: string): HiveDiagnostic {
  return { line, column, severity, message };
}

function buildJavaScript(ast: HiveAst, options: HiveCompileOptions, diagnostics: HiveDiagnostic[]): HiveCompileResult {
  const metadata = {
    name: ast.name,
    description: ast.description,
    tools: Array.from(ast.tools),
    memory: Array.from(ast.memory),
  };

  const program = JSON.stringify(convertSteps(ast.steps), null, 2);

  const code = `const interpolate = (template, scope = {}) =>
  template.replace(/\{([^}]+)\}/g, (_, key) => {
    const value = key.trim().split('.').reduce((acc, segment) => (acc ? acc[segment] : undefined), scope);
    return value ?? '';
  });

const resolveCollection = async (key, ctx) => {
  if (!key) return [];
  if (Array.isArray(ctx?.input?.[key])) return ctx.input[key];
  const resolver = ctx?.resolveCollection ?? ctx?.memory?.get;
  if (resolver) {
    const value = await resolver.call(ctx.memory ?? ctx, key, ctx);
    return Array.isArray(value) ? value : [];
  }
  return [];
};

const executeSteps = async (steps, ctx, transcript) => {
  for (const step of steps) {
    switch (step.type) {
      case 'say': {
        const rendered = interpolate(step.payload, ctx.input ?? {});
        ctx.emit?.({ type: 'say', payload: rendered });
        transcript.push({ type: 'say', payload: rendered });
        break;
      }
      case 'tools': {
        for (const toolName of step.tools) {
          if (ctx.callTool) {
            const result = await ctx.callTool(toolName, ctx);
            transcript.push({ type: 'tool', tool: toolName, result });
          }
        }
        break;
      }
      case 'memory': {
        for (const key of step.keys) {
          const value = await ctx.memory?.get?.(key);
          transcript.push({ type: 'memory', key, value });
        }
        break;
      }
      case 'if': {
        const allow = (await ctx.evaluate?.(step.condition, ctx)) ?? false;
        const branch = allow ? step.then : step.else ?? [];
        await executeSteps(branch, ctx, transcript);
        break;
      }
      case 'loop': {
        const collection = await resolveCollection(step.source, ctx);
        for (const item of collection) {
          const childScope = { ...ctx, input: { ...ctx.input, [step.iterator ?? 'item']: item } };
          await executeSteps(step.steps, childScope, transcript);
        }
        break;
      }
      default: {
        ctx.emit?.({ type: 'noop', step });
      }
    }
  }
};

const program = {
  name: ${JSON.stringify(ast.name)},
  description: ${JSON.stringify(ast.description ?? '')},
  model: ${JSON.stringify(options.defaultModel ?? 'gpt-4o-mini')},
  tools: ${JSON.stringify(metadata.tools)},
  memory: ${JSON.stringify(metadata.memory)},
  instructions: ${program},
  async run(ctx = {}) {
    const transcript = [];
    const scope = {
      input: ctx.input ?? {},
      emit: ctx.emit ?? (() => undefined),
      callTool: ctx.callTool,
      memory: ctx.memory ?? { get: async () => undefined },
      evaluate: ctx.evaluate,
      resolveCollection: ctx.resolveCollection,
    };
    await executeSteps(this.instructions, scope, transcript);
    return { transcript };
  },
};

export default program;
`;

  return {
    code,
    diagnostics,
    metadata,
  };
}

interface SerializableStep {
  type: string;
  payload?: string;
  tools?: string[];
  keys?: string[];
  then?: SerializableStep[];
  else?: SerializableStep[];
  steps?: SerializableStep[];
  iterator?: string;
  source?: string;
}

function convertSteps(steps: HiveStep[]): SerializableStep[] {
  return steps.map((step) => {
    switch (step.type) {
      case "say":
        return { type: "say", payload: step.payload };
      case "tools":
        return { type: "tools", tools: step.tools };
      case "memory":
        return { type: "memory", keys: step.keys };
      case "if":
        return {
          type: "if",
          payload: step.condition,
          then: convertSteps(step.thenSteps),
          else: step.elseSteps ? convertSteps(step.elseSteps) : undefined,
        };
      case "loop":
        return {
          type: "loop",
          iterator: step.iterator ?? "item",
          source: step.target,
          steps: convertSteps(step.steps),
        };
      default:
        return { type: "unknown" };
    }
  });
}
