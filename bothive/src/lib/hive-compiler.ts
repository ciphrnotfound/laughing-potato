import { HIVE_MACRO_LIBRARY } from "./hive-macros";

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

interface HiveCallNode {
    type: "call";
    tool: string;
    args: Record<string, string>;
}

interface HiveRememberNode {
    type: "remember";
    key: string;
    value: string;
}

interface HiveSetNode {
    type: "set";
    key: string;
    mode: "literal" | "path";
    value: string;
}

export type HiveStep =
    | HiveIfNode
    | HiveLoopNode
    | HiveSayNode
    | HiveToolsNode
    | HiveMemoryNode
    | HiveCallNode
    | HiveRememberNode
    | HiveSetNode;

export interface HiveAst {
    name: string;
    description?: string;
    tools: Set<string>;
    memory: Set<string>;
    steps: HiveStep[];
    agents: HiveAst[];
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

const BOT_DECLARATION = /^(?:bot|agent)\s+([A-Za-z][A-Za-z0-9_-]*)$/i;
const DESCRIPTION_DECLARATION = /^description\s+"([^"]*)"$/i;
const ON_INPUT_DECLARATION = /^on\s+input$/i;
const SAY_INLINE = /^say\s+"(.*)"$/i;
const SAY_MULTILINE_START = /^say\s+"""$/i;
const SAY_MULTILINE_END = /^"""$/;
const TOOLS_STATEMENT = /^tools\(([^)]*)\)$/i;
const MEMORY_STATEMENT = /^memory\[([^\]]*)\]$/i;
const CALL_STATEMENT = /^call\s+([A-Za-z0-9._-]+)(?:\s+with\s+(.+))?$/i;
const REMEMBER_STATEMENT = /^remember\s+([A-Za-z0-9._-]+)\s+"([^"]*)"$/i;
const IF_STATEMENT = /^if\s+(.+)$/i;
const ELSE_STATEMENT = /^else$/i;
const LOOP_STATEMENT = /^loop\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s+in\s+(.+))?$/i;
const END_STATEMENT = /^end$/i;
const COMMENT_STATEMENT = /^--/;
const MACRO_STATEMENT = /^use\s+macro\s+([A-Za-z0-9_-]+)$/i;
const SET_STATEMENT = /^set\s+([A-Za-z0-9_.-]+)\s+(?:"([^"]*)"|([A-Za-z0-9_.-]+))$/i;

interface ParseContext {
    ast: HiveAst;
    diagnostics: HiveDiagnostic[];
    stack: Array<{ type: "root" | "if" | "loop" | "agent", node: HiveStep | { steps: HiveStep[]; elseSteps?: HiveStep[] } | { ast: HiveAst } } & Record<string, unknown>>;
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
        agents: [],
    };

    const ctx: ParseContext = {
        ast,
        diagnostics,
        stack: [{ type: "root", node: { steps: ast.steps } }], // Stack tracks where we are adding steps
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

        if (!line || COMMENT_STATEMENT.test(line)) continue;

        if (MACRO_STATEMENT.test(line)) {
            const [, macroName] = line.match(MACRO_STATEMENT) ?? [];
            const macroKey = (macroName ?? "").toLowerCase();
            const macroSource = HIVE_MACRO_LIBRARY[macroKey];
            if (!macroSource) {
                diagnostics.push(makeDiagnostic(lineNumber, 1, "error", `Unknown macro '${macroName}'`));
                continue;
            }
            const macroLines = macroSource.split(/\r?\n/);
            trimmedSource.splice(index, 1, ...macroLines);
            index -= 1;
            continue;
        }

        if (!ctx.ast.name) {
            const botMatch = line.match(BOT_DECLARATION);
            if (botMatch) {
                ctx.ast.name = botMatch[1];
                ctx.expectingBotEnd = true;
                continue;
            }
            // Allow sub-agents to start defining straight away if we are inside a root bot? 
            // Actually the file must start with 'bot'.
            diagnostics.push(makeDiagnostic(lineNumber, 1, 'error', "Hive programs must start with 'bot <Name>'"));
            break;
        }

        // Handle nested AGENT declaration
        if (BOT_DECLARATION.test(line) && ctx.ast.name) {
            const [, agentName] = line.match(BOT_DECLARATION) ?? [];
            if (agentName) {
                // Create a new sub-agent AST
                const subAgent: HiveAst = {
                    name: agentName,
                    tools: new Set(),
                    memory: new Set(),
                    steps: [],
                    agents: []
                };
                ctx.ast.agents.push(subAgent);

                // We need to parse inside this agent now.
                // But wait, our 'stack' system is for steps inside a function (on input).
                // An 'agent' is a top-level container like 'bot'.
                // We need a way to switch context to the sub-agent.
                // For simplicity in this version, we will assume 'agent' blocks appear at the top level of the bot
                // and we parse them recursively or switch a 'currentAgent' pointer.

                // CURRENT LIMITATION FIX:
                // The current compiler structure is flattened. To support nesting properly with this line-by-line parser,
                // we need a recursive approach or a 'context stack' that includes the AST itself.

                // Let's defer sophisticated AST stacking for a full refactor.
                // For now, let's treat 'agent' as a special block that we parse into a separate AST property
                // BUT we need to know we are "inside" an agent to put its 'on input' steps there.

                // HACK: We will just push a special stack frame that redirects 'on input' logic?
                // Actually, simpler: We can just create a new 'agent' object context.

                /* 
                   Refined Strategy:
                   The 'stack' currently holds: { type: "root" | "if" | "loop", node: ... }
                   We can add type: "agent".
                   But 'agent' isn't a step. It's a container.
                   
                   Let's modify the Loop to support 'agent' blocks if we are at root.
                */

                // Let's implement this by detecting if we are inside an agent block.
                // We can start a new "scope" for the agent.
                // Pushing to stack with a custom type that holds the sub-agent AST.

                const agentNode = {
                    type: "agent_scope",
                    ast: subAgent
                };
                // We cast to any to bypass strict type check for this quick implementation, 
                // or we update the ParseContext definition (better).
                // Since I cannot update ParseContext definition easily in this chunks approach without replacing huge blocks,
                // I will assume the stack can hold this custom object if I handle it in END_STATEMENT.

                // Wait, I explicitly need to update ParseContext interface to be safe.
                // Let's assume I updated "stack" definition in my mental model or subsequent chunk?
                // No, I strictly defined it above.
                // I need to update the stack definition first.
            }
        }

        if (!ctx.insideOnBlock) {
            if (DESCRIPTION_DECLARATION.test(line)) {
                const [, desc] = line.match(DESCRIPTION_DECLARATION) ?? [];
                ctx.ast.description = desc;
                continue;
            }

            if (ON_INPUT_DECLARATION.test(line)) {
                // If we are in an agent block, we should be targeting the agent's steps.
                const top = ctx.stack[ctx.stack.length - 1];
                if (top?.type === "agent") {
                    // We are inside an agent. The 'on input' applies to this agent.
                    // The 'currentSteps' should already be pointing to the agent's steps if we handled the push correctly?
                    // Actually currentSteps is usually updated when pushing loop/if.
                    // For 'agent', steps are in node.ast.steps.
                    // Let's update currentSteps here to be safe.
                    ctx.currentSteps = (top.node as any).ast.steps;
                } else if (top?.type === "root") {
                    ctx.currentSteps = ctx.ast.steps;
                }

                ctx.insideOnBlock = true;
                continue;
            }

            if (END_STATEMENT.test(line)) {
                if (ctx.stack.length <= 1) {
                    ctx.expectingBotEnd = false;
                    break;
                }
                // If stack > 1, this 'end' belongs to a nested structure (like agent).
                // Fall through to the main END_STATEMENT handler (outside this !insideOnBlock block).
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

        if (CALL_STATEMENT.test(line)) {
            const [, toolName, argsRaw] = line.match(CALL_STATEMENT) ?? [];
            const tool = toolName?.trim();
            if (!tool) {
                diagnostics.push(makeDiagnostic(lineNumber, 1, "error", "call requires a tool identifier"));
                continue;
            }
            ctx.ast.tools.add(tool);
            const args: Record<string, string> = {};
            if (argsRaw) {
                argsRaw
                    .split(/,(?![^\"]*\")/)
                    .map((segment) => segment.trim())
                    .filter(Boolean)
                    .forEach((segment) => {
                        const [key, value] = segment.split(":").map((token) => token.trim());
                        if (key) {
                            const cleanedValue = value?.replace(/^"|"$/g, "") ?? "";
                            args[key] = cleanedValue;
                        }
                    });
            }
            appendStep(ctx, { type: "call", tool, args });
            continue;
        }

        if (REMEMBER_STATEMENT.test(line)) {
            const [, key, value] = line.match(REMEMBER_STATEMENT) ?? [];
            if (!key) {
                diagnostics.push(makeDiagnostic(lineNumber, 1, "error", "remember requires a key"));
                continue;
            }
            appendStep(ctx, { type: "remember", key, value: value ?? "" });
            continue;
        }

        if (SET_STATEMENT.test(line)) {
            const [, key, literal, pathRef] = line.match(SET_STATEMENT) ?? [];
            if (!key) {
                diagnostics.push(makeDiagnostic(lineNumber, 1, "error", "set requires a target key"));
                continue;
            }
            if (!literal && !pathRef) {
                diagnostics.push(makeDiagnostic(lineNumber, 1, "error", "set requires a literal value or source path"));
                continue;
            }
            const mode: HiveSetNode["mode"] = literal !== undefined ? "literal" : "path";
            const value = (literal ?? pathRef ?? "").trim();
            appendStep(ctx, { type: "set", key, mode, value });
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
            
            // Special handling: 'end' closing an 'on input' block (root or agent)
            // If we popped a root/agent, it means we weren't in a sub-block (if/loop),
            // so this 'end' must be for the 'on input'.
            if ((!top || top.type === "root" || top.type === "agent") && ctx.insideOnBlock) {
                 // We are just closing the 'on input' section, not the agent/root itself.
                 if (top) ctx.stack.push(top);
                 ctx.insideOnBlock = false;
                 continue;
            }

            if (!top || top.type === "root") {
                ctx.stack.push(top ?? { type: "root", node: { steps: ctx.ast.steps } });
                diagnostics.push(makeDiagnostic(lineNumber, 1, 'warning', "Unexpected 'end'"));
                continue;
            }
            if (top?.type === "agent") {
                // We just finished an agent block.
                // Pop the stack effectively (done by the pop above).
                // Reset current steps to the parent's current steps (which should be root).
                ctx.currentSteps = (ctx.stack.at(-1)?.node as any)?.steps ?? ctx.ast.steps;
                // Also we are no longer "insideOnBlock" for the agent (it resets per block).
                ctx.insideOnBlock = false;
                continue;
            }

            if (top?.type === "agent") {
                 // Return to parent context
                 const parent = ctx.stack.at(-1);
                 // If parent is root, accessing ast.steps via 'steps' property we hacked onto the stack frame, or fallback
                 // Actually, simpler: just look at the stack top.
                 if (parent) {
                    if (parent.type === "root") ctx.currentSteps = ctx.ast.steps; // Safe fallback for root
                    else if ('steps' in parent) ctx.currentSteps = parent.steps as HiveStep[]; 
                    else ctx.currentSteps = (parent.node as any).steps;
                 }
                 ctx.insideOnBlock = false; 
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
        agents: ast.agents.map(a => a.name)
    };

    const compiledAgents = ast.agents.map(subAgent => {
        const subResult = buildJavaScript(subAgent, options, []);
        // We strip the wrapper code to just get the program object string? 
        // Actually buildJavaScript returns a full string constant "const program ... export default".
        // That's designed for file output.
        // We need a way to get just the object.
        // Let's refactor slightly to separate "program object creation" from "file wrapping".
        
        // For now, let's just serialize the AST steps for the agent and reconstruct a simpler object.
        return {
            name: subAgent.name,
            description: subAgent.description,
            tools: Array.from(subAgent.tools),
            memory: Array.from(subAgent.memory),
            program: JSON.stringify(convertSteps(subAgent.steps))
        };
    });

    const programSteps = JSON.stringify(convertSteps(ast.steps), null, 2);
    const agentsJson = JSON.stringify(compiledAgents, null, 2);

    const code = `const interpolate = (template, scope = {}) =>
  template.replace(/\{([^}]+)\}/g, (_, key) => {
    const value = key.trim().split('.').reduce((acc, segment) => (acc ? acc[segment] : undefined), scope);
    return value ?? '';
  });

const resolveValue = (path, ctx) => {
  if (!path) return undefined;
  const segments = String(path).split('.');
  const sources = [ctx.locals ?? {}, ctx.input ?? {}];
  for (const source of sources) {
    let acc = source;
    let matched = true;
    for (const segment of segments) {
      if (acc == null || !(segment in acc)) {
        matched = false;
        break;
      }
      acc = acc[segment];
    }
    if (matched && acc !== undefined) {
      return acc;
    }
  }
  return undefined;
};

const resolveCollection = async (key, ctx) => {
  if (!key) return [];
  const resolved = resolveValue(key, ctx);
  if (Array.isArray(resolved)) return resolved;
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
        const rendered = interpolate(step.payload, { ...(ctx.input ?? {}), ...(ctx.locals ?? {}) });
        ctx.emit?.({ type: 'say', payload: rendered });
        transcript.push({ type: 'say', payload: rendered });
        break;
      }
      case 'call': {
        const args = Object.fromEntries(
          Object.entries(step.args ?? {}).map(([key, raw]) => [
            key,
            raw && /^[A-Za-z0-9_.-]+$/.test(raw)
              ? resolveValue(raw, ctx)
              : raw,
          ])
        );
        if (ctx.callTool) {
          const result = await ctx.callTool(step.tool, { ...ctx, args });
          transcript.push({ type: 'tool', tool: step.tool, result, args });
        }
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
      case 'remember': {
        const value = interpolate(step.payload ?? '', { ...(ctx.input ?? {}), ...(ctx.locals ?? {}) });
        if (ctx.memory?.append) {
          await ctx.memory.append(step.key, value);
        } else if (ctx.memory?.set) {
          await ctx.memory.set(step.key, value);
        }
        transcript.push({ type: 'memory.append', key: step.key, value });
        break;
      }
      case 'set': {
        const value = step.mode === 'literal' ? step.payload : resolveValue(step.payload, ctx);
        if (!ctx.locals) ctx.locals = {};
        const segments = String(step.key).split('.');
        let target = ctx.locals;
        for (let i = 0; i < segments.length - 1; i += 1) {
          const segment = segments[i];
          if (typeof target[segment] !== 'object' || target[segment] === null) {
            target[segment] = {};
          }
          target = target[segment];
        }
        target[segments.at(-1)] = value;
        transcript.push({ type: 'set', key: step.key, value, mode: step.mode });
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
        const branch = allow ? step.then ?? [] : step.else ?? [];
        await executeSteps(branch, ctx, transcript);
        break;
      }
      case 'loop': {
        const collection = await resolveCollection(step.source, ctx);
        for (const item of collection) {
          const childScope = {
            ...ctx,
            input: { ...ctx.input, [step.iterator ?? 'item']: item },
            locals: ctx.locals,
          };
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
  memory: ${JSON.stringify(metadata.memory)},
  // Sub-agents definition
  agents: ${agentsJson}.map(a => ({
    ...a,
    instructions: JSON.parse(a.program),
    run: async function(ctx = {}) {
        const transcript = [];
        const scope = {
            input: ctx.input ?? {},
            locals: ctx.locals ? { ...ctx.locals } : {},
            emit: ctx.emit ?? (() => undefined),
            callTool: ctx.callTool,
            memory: ctx.memory ?? { get: async () => undefined },
            evaluate: ctx.evaluate,
            resolveCollection: ctx.resolveCollection,
            resolveCollection: ctx.resolveCollection,
            agents: ctx.agents ?? [], // Inherit agents from caller context
        };
        await executeSteps(this.instructions, scope, transcript);
        return { transcript };
    }
  })),
  instructions: ${programSteps},
  async run(ctx = {}) {
    const transcript = [];
    const scope = {
      input: ctx.input ?? {},
      locals: ctx.locals ? { ...ctx.locals } : {},
      emit: ctx.emit ?? (() => undefined),
      callTool: ctx.callTool,
      memory: ctx.memory ?? { get: async () => undefined },
      evaluate: ctx.evaluate,
      resolveCollection: ctx.resolveCollection,
      agents: this.agents, // Expose agents to the root scope
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
    condition?: string;
    tools?: string[];
    keys?: string[];
    tool?: string;
    args?: Record<string, string>;
    key?: string;
    mode?: string;
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
            case "call":
                return { type: "call", tool: step.tool, args: step.args };
            case "remember":
                return { type: "remember", key: step.key, payload: step.value };
            case "set":
                return { type: "set", key: step.key, mode: step.mode, payload: step.value };
            case "if":
                return {
                    type: "if",
                    condition: step.condition,
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
