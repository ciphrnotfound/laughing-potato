
import * as AST from './ast';
import { Tokenizer } from './tokenizer';
import { Parser } from './parser';

export interface ExecutionContext {
    variables: Record<string, any>;
    output: string[];
    errors: string[];
    toolCalls: any[];
}

export type HostFunction = (args: any, context: ExecutionContext) => Promise<any>;

export class Interpreter {
    private globals: Record<string, any> = {};
    private tools: Record<string, HostFunction> = {};
    private bots: Record<string, AST.BotDefinitionNode> = {};

    // Runtime state
    private context: ExecutionContext;
    private currentAgent: string | null = null;

    constructor() {
        this.context = {
            variables: {},
            output: [],
            errors: [],
            toolCalls: []
        };
    }

    registerTool(name: string, fn: HostFunction) {
        this.tools[name] = fn;
    }

    async load(code: string) {
        // 1. Tokenize
        const tokenizer = new Tokenizer(code);
        const tokens = tokenizer.tokenize();

        // 2. Parse
        const parser = new Parser(tokens);
        const program = parser.parse();

        // 3. Register Bots
        for (const node of program.body) {
            if (node.type === 'BotDefinition') {
                this.bots[node.name] = node;
            }
        }
        return program;
    }

    async run(code: string, input: any, initialVariables?: Record<string, any>): Promise<ExecutionContext> {
        // Reset state with initial variables if provided
        this.context = { 
            variables: { ...initialVariables, input }, 
            output: [], 
            errors: [], 
            toolCalls: [] 
        };

        const program = await this.load(code);

        // Execute top-level or bot handlers
        for (const node of program.body) {
            if (node.type === 'BotDefinition') {
                await this.executeBot(node, input);
            } else {
                // Top-level statement
                await this.executeNode(node);
            }
        }

        return this.context;
    }

    async emitEvent(eventName: string, input: any): Promise<ExecutionContext> {
        // We assume bots are already registered (e.g. from a previous run or pre-loading)
        // Reset context for this event run
        this.context = { variables: { input, event: eventName }, output: [], errors: [], toolCalls: [] };

        for (const bot of Object.values(this.bots)) {
            await this.executeBotEvent(bot, eventName, input);
        }

        return this.context;
    }

    private async executeBotEvent(bot: AST.BotDefinitionNode, eventName: string, input: any) {
        for (const node of bot.body) {
            if (node.type === 'OnEventHandler' && node.event === eventName) {
                await this.executeBlock(node.body);
            } else if (node.type === 'AgentDefinition') {
                await this.executeAgentEvent(node, eventName, input);
            }
        }
    }

    private async executeAgentEvent(agent: AST.AgentDefinitionNode, eventName: string, input: any) {
        for (const node of agent.body) {
            if (node.type === 'OnEventHandler' && node.event === eventName) {
                await this.executeBlock(node.body);
            }
        }
    }

    private async executeBot(bot: AST.BotDefinitionNode, input: any) {
        // Find default handler (implicit or explicit)
        // In v3, we look for 'on input' at bot level OR delegate to main agent
        for (const node of bot.body) {
            if (node.type === 'OnInputHandler') {
                let shouldRun = true;
                if (node.condition) {
                    shouldRun = await this.evaluate(node.condition);
                }

                if (shouldRun) {
                    await this.executeBlock(node.body);
                }
            }
        }
    }

    private async executeNode(node: AST.StatementNode | AST.BlockNode) {
        switch (node.type) {
            case 'Block':
                await this.executeBlock(node as AST.BlockNode);
                break;
            case 'IfStatement':
                await this.executeIf(node as AST.IfStatementNode);
                break;
            case 'CallExpression':
                await this.executeCall(node as AST.CallExpressionNode);
                break;
            case 'SayStatement':
                await this.executeSay(node as AST.SayStatementNode);
                break;
            case 'Assignment':
                await this.executeAssignment(node as AST.AssignmentNode);
                break;
            case 'LoopStatement':
                await this.executeLoop(node as AST.LoopStatementNode);
                break;
            case 'DelegateStatement':
                await this.executeDelegate(node as AST.DelegateStatementNode);
                break;
            case 'ReturnStatement':
                // For now, return just stops execution of block, we don't have function stack yet
                break;
        }
    }

    private async executeBlock(block: AST.BlockNode) {
        for (const stmt of block.statements) {
            await this.executeNode(stmt);
        }
    }

    private async executeIf(node: AST.IfStatementNode) {
        const truthy = await this.evaluate(node.condition);
        if (truthy) {
            await this.executeBlock(node.consequent);
        } else if (node.alternate) {
            if (node.alternate.type === 'IfStatement') {
                await this.executeIf(node.alternate);
            } else {
                await this.executeBlock(node.alternate);
            }
        }
    }

    private fallbackToolHandler?: HostFunction;

    setFallbackToolHandler(fn: HostFunction) {
        this.fallbackToolHandler = fn;
    }

    private async executeCall(node: AST.CallExpressionNode) {
        const toolName = node.tool;
        const args: Record<string, any> = {};

        for (const [key, valExpr] of Object.entries(node.arguments)) {
            args[key] = await this.evaluate(valExpr);
        }

        let result = null;
        if (this.tools[toolName]) {
            try {
                this.context.toolCalls.push({ tool: toolName, args });
                result = await this.tools[toolName](args, this.context);
            } catch (e: any) {
                this.context.errors.push(`Error executing ${toolName}: ${e.message}`);
            }
        } else if (this.fallbackToolHandler) {
            // Try fallback
            try {
                // We don't push to toolCalls immediately here, let the handler decide or push after success?
                // Actually, let's record it.
                this.context.toolCalls.push({ tool: toolName, args, isFallback: true });
                result = await this.fallbackToolHandler({ tool: toolName, ...args }, this.context);
            } catch (e: any) {
                this.context.errors.push(`Error executing ${toolName} (fallback): ${e.message}`);
            }
        } else {
            this.context.errors.push(`Tool not found: ${toolName}`);
        }

        if (node.outputVariable) {
            // Smart merge: if tool returned a "data" object, merge it into the top-level result 
            // so Hivelang can access res.url instead of res.data.url
            let processedResult = result;
            if (result && typeof result === 'object' && result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
                processedResult = { ...result, ...result.data };
            }
            this.context.variables[node.outputVariable] = processedResult;
        }

    }

    private async executeSay(node: AST.SayStatementNode) {
        const message = await this.evaluate(node.message);
        this.context.output.push(message);
    }

    private async executeAssignment(node: AST.AssignmentNode) {
        const value = await this.evaluate(node.value);
        this.context.variables[node.variable] = value;
    }

    private async executeLoop(node: AST.LoopStatementNode) {
        const iterable = await this.evaluate(node.iterable);
        if (Array.isArray(iterable)) {
            for (const item of iterable) {
                this.context.variables[node.variable] = item;
                await this.executeBlock(node.body);
            }
        }
    }

    private async executeDelegate(node: AST.DelegateStatementNode) {
        // In v3, delegate would perform a context switch to another agent
        // For this simple version, we mainly just log it
        this.context.toolCalls.push({ tool: 'delegate', agent: node.targetAgent, params: node.params });
        // TODO: Real agent cleanup
    }

    // --- Evaluation ---

    private async evaluate(node: AST.ExpressionNode): Promise<any> {
        switch (node.type) {
            case 'Literal':
                return node.value;
            case 'Identifier':
                return this.context.variables[node.name] ?? null;
            case 'VariableAccess':
                return this.resolveVariable(node.parts);
            case 'BinaryExpression':
                return this.evaluateBinary(node as AST.BinaryExpressionNode);
            case 'FString':
                return this.evaluateFString(node as AST.FStringNode);
            case 'ArrayLiteral': {
                const arr = [];
                for (const elem of (node as AST.ArrayLiteralNode).elements) {
                    arr.push(await this.evaluate(elem));
                }
                return arr;
            }
            case 'ObjectLiteral': {
                const obj: Record<string, any> = {};
                for (const [key, valExpr] of Object.entries((node as AST.ObjectLiteralNode).properties)) {
                    obj[key] = await this.evaluate(valExpr);
                }
                return obj;
            }
            case 'MemberExpression':
                return this.evaluateMember(node as AST.MemberExpressionNode);
            default:
                return null;
        }
    }

    private resolveVariable(parts: string[]): any {
        let current = this.context.variables[parts[0]];
        for (let i = 1; i < parts.length; i++) {
            if (current == null) return null;
            current = current[parts[i]];
        }
        return current;
    }

    private async evaluateMember(node: AST.MemberExpressionNode): Promise<any> {
        const object = await this.evaluate(node.object);
        let property: any;

        if (node.computed) {
            property = await this.evaluate(node.property);
        } else {
            // Non-computed property is an identifier node, but we want its name string
            property = (node.property as AST.IdentifierNode).name;
        }

        if (object == null) return null;
        return object[property];
    }

    private async evaluateBinary(node: AST.BinaryExpressionNode): Promise<any> {
        const left = await this.evaluate(node.left);
        const right = await this.evaluate(node.right);

        switch (node.operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            case '%': return left % right;
            case '==': return left == right; // loose equality for friendliness
            case '!=': return left != right;
            case '>': return left > right;
            case '<': return left < right;
            case '>=': return left >= right;
            case '<=': return left <= right;
            case 'and': return left && right;
            case 'or': return left || right;
            case '??': return (left !== null && left !== undefined) ? left : right;
            case 'contains':
                let leftVal = left;
                // Coerce objects to their primary text for checking "contains"
                if (typeof leftVal === 'object' && leftVal !== null && !Array.isArray(leftVal)) {
                    leftVal = (leftVal as any).input || (leftVal as any).message || String(leftVal);
                }

                if (typeof leftVal === 'string' && typeof right === 'string') {
                    return leftVal.toLowerCase().includes(right.toLowerCase());
                }
                if (Array.isArray(leftVal)) {
                    return leftVal.some(item => String(item).toLowerCase() === String(right).toLowerCase());
                }
                return false;
            default: return null;
        }
    }

    private async evaluateFString(node: AST.FStringNode): Promise<string> {
        const raw = node.parts[0] as string;

        // Match {expression} patterns
        // We use a replacer function that manually parses the path
        return raw.replace(/\{([^}]+)\}/g, (_, expr) => {
            const trimmed = expr.trim();
            // Try to resolve path: user.name or list[0]
            try {
                const val = this.resolvePath(trimmed);
                return val !== undefined && val !== null ? String(val) : `null`;
            } catch (e) {
                return `{${trimmed}}`; // keep raw if fail
            }
        });
    }

    // Helper to resolve string paths like "user.name" or "items[0]"
    private resolvePath(path: string): any {
        // Tokenize path by . or [ ]
        // exclude quotes if any

        // Simple regex to split by . or [ ]
        // e.g. "items[0]" -> ["items", "0"]
        // "config.mode" -> ["config", "mode"]
        const parts = path.split(/[.\[\]]/).filter(p => p !== '');

        let current = this.context.variables[parts[0]];
        for (let i = 1; i < parts.length; i++) {
            if (current == null) return undefined;

            const part = parts[i];
            // Check if it's an array index
            if (!isNaN(parseInt(part))) {
                current = current[parseInt(part)];
            } else {
                current = current[part];
            }
        }
        return current;
    }
}
