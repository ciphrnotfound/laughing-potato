
import { Token, TokenType, Tokenizer } from './tokenizer';
import * as AST from './ast';

export class Parser {
    private tokens: Token[];
    private current = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens.filter(t => t.type !== 'NEWLINE'); // Simplified: Ignore distinct newlines for logic, rely on INDENT/DEDENT block structure
    }

    parse(): AST.ProgramNode {
        const body: (AST.BotDefinitionNode | AST.StatementNode)[] = [];

        while (!this.isAtEnd()) {
            if (this.matchKeyword('bot')) {
                body.push(this.parseBot());
            } else {
                body.push(this.parseStatement());
            }
        }

        return { type: 'Program', body };
    }

    // --- Definitions ---

    private parseBot(): AST.BotDefinitionNode {
        // consumed 'bot'
        const name = this.consume('IDENTIFIER', "Expected bot name").value;
        let description: string | undefined;
        const body: any[] = [];

        // Check for block start (INDENT) or inline (rare)
        if (this.match('INDENT')) {
            while (!this.check('DEDENT') && !this.isAtEnd()) {
                if (this.matchKeyword('description')) {
                    description = this.consume('STRING', "Expected string after 'description'").formattedValue;
                } else if (this.matchKeyword('type')) {
                    this.advance(); // Skip 'agent' or other type word for now
                } else if (this.matchKeyword('memory')) {
                    this.parseMemoryBlock();
                } else if (this.matchKeyword('agent')) {
                    body.push(this.parseAgent());
                } else if (this.matchKeyword('on')) {
                    body.push(this.parseOn());
                } else {
                    body.push(this.parseStatement());
                }
            }
            this.consume('DEDENT', "Expected 'end' of bot block");
        }

        // Optional 'end' keyword
        this.matchKeyword('end');

        return { type: 'BotDefinition', name, description, body };
    }

    private parseAgent(): AST.AgentDefinitionNode {
        // consumed 'agent'
        const name = this.consume('IDENTIFIER', "Expected agent name").value;
        let description: string | undefined;
        const body: (AST.OnInputHandlerNode | AST.OnEventHandlerNode)[] = [];

        if (this.match('INDENT')) {
            while (!this.check('DEDENT') && !this.isAtEnd()) {
                if (this.matchKeyword('description')) {
                    description = this.consume('STRING', "Expected string after 'description'").formattedValue;
                } else if (this.matchKeyword('on')) {
                    body.push(this.parseOn());
                } else {
                    // Ignore unknown agent-level statements for now
                    this.advance();
                }
            }
            this.consume('DEDENT', "Expected dedent after agent body");
        }

        this.matchKeyword('end');
        return { type: 'AgentDefinition', name, description, body };
    }

    private parseMemoryBlock() {
        // consumed 'memory'
        this.consume('IDENTIFIER'); // name e.g. 'session'
        if (this.match('INDENT')) {
            while (!this.check('DEDENT') && !this.isAtEnd()) {
                if (this.matchKeyword('var')) {
                    this.consume('IDENTIFIER'); // name
                    if (this.match('IDENTIFIER')) { /* type */ }
                } else {
                    this.advance();
                }
            }
            this.consume('DEDENT');
        }
        this.matchKeyword('end');
    }

    private parseOn(): AST.OnInputHandlerNode | AST.OnEventHandlerNode {
        // consumed 'on'
        if (this.matchKeyword('input')) {
            let condition: AST.ExpressionNode | undefined;
            if (this.matchKeyword('when')) {
                condition = this.parseExpression();
            }

            const body = this.parseBlock();
            this.matchKeyword('end');

            return { type: 'OnInputHandler', condition, body };
        } else if (this.matchKeyword('event')) {
            const eventName = this.consume('STRING', "Expected event name string after 'on event'").formattedValue;

            const body = this.parseBlock();
            this.matchKeyword('end');

            return { type: 'OnEventHandler', event: eventName, body };
        }

        throw new Error("Expected 'input' or 'event' after 'on'");
    }

    // --- Statements ---

    private parseBlock(): AST.BlockNode {
        const statements: AST.StatementNode[] = [];
        if (this.consume('INDENT', "Expected indented block")) {
            while (!this.check('DEDENT') && !this.isAtEnd()) {
                statements.push(this.parseStatement());
            }
            this.consume('DEDENT', "Expected end of block");
        }
        return { type: 'Block', statements };
    }

    private parseStatement(): AST.StatementNode {
        if (this.matchKeyword('if')) return this.parseIf();
        if (this.matchKeyword('call')) return this.parseCall();
        if (this.matchKeyword('say')) return this.parseSay();
        if (this.matchKeyword('set')) return this.parseAssignment();
        if (this.matchKeyword('delegate')) return this.parseDelegate();
        if (this.matchKeyword('return')) return this.parseReturn();
        if (this.matchKeyword('loop')) return this.parseLoop();

        // Check for "variable = value" assignment without 'set'
        if (this.check('IDENTIFIER') && this.checkNext('PUNCTUATION', '=')) {
            return this.parseAssignment(false); // implicit set
        }

        throw new Error(`Unexpected token: ${this.peek().value} (${this.peek().type}) at line ${this.peek().line}`);
    }

    private parseIf(): AST.IfStatementNode {
        const condition = this.parseExpression();
        // optionally 'then' (uncommon in python/hive but allowed?)
        this.matchKeyword('then');

        const consequent = this.parseBlock();
        let alternate: AST.IfStatementNode | AST.BlockNode | undefined;

        if (this.matchKeyword('else')) {
            alternate = this.parseBlock();
        } else if (this.matchKeyword('elif')) {
            alternate = this.parseIf(); // Recursive for elif chain
        }

        this.matchKeyword('end'); // Optional end for if
        return { type: 'IfStatement', condition, consequent, alternate };
    }

    private parseCall(): AST.CallExpressionNode {
        // call tool.name with arg: val
        let toolName = this.consume('IDENTIFIER', "Expected tool name").value;
        // Handle dot notation: http.get
        while (this.match('PUNCTUATION', '.')) {
            toolName += '.' + this.consume('IDENTIFIER').value;
        }

        let args: Record<string, AST.ExpressionNode> = {};
        if (this.matchKeyword('with')) {
            args = this.parseArguments();
        }

        let outputVariable: string | undefined;
        if (this.matchKeyword('as')) {
            outputVariable = this.consume('IDENTIFIER', "Expected variable name after 'as'").value;
        }

        return { type: 'CallExpression', tool: toolName, arguments: args, outputVariable };
    }

    private parseSay(): AST.SayStatementNode {
        const message = this.parseExpression();
        return { type: 'SayStatement', message };
    }

    private parseDelegate(): AST.DelegateStatementNode {
        this.consumeKeyword('to', "Expected 'to' after 'delegate'");
        const agentName = this.consume('IDENTIFIER').value;

        let params: Record<string, AST.ExpressionNode> = {};
        if (this.matchKeyword('with')) {
            params = this.parseArguments();
        }

        return { type: 'DelegateStatement', targetAgent: agentName, params };
    }

    private parseAssignment(keywordConsumed = true): AST.AssignmentNode {
        let variable: string;
        if (keywordConsumed) {
            // 'set' already consumed
            variable = this.consume('IDENTIFIER').value;
            if (this.matchKeyword('to')) {
                // set x to y
            } else {
                this.consume('PUNCTUATION', '='); // set x = y
            }
        } else {
            // implicit: x = y
            variable = this.consume('IDENTIFIER').value;
            this.consume('PUNCTUATION', '=');
        }

        const value = this.parseExpression();
        return { type: 'Assignment', variable, value };
    }

    private parseReturn(): AST.ReturnStatementNode {
        const value = this.parseExpression();
        return { type: 'ReturnStatement', value };
    }

    private parseLoop(): AST.LoopStatementNode {
        // loop item in list
        const variable = this.consume('IDENTIFIER').value;
        this.consumeKeyword('in', "Expected 'in' in loop");
        const iterable = this.parseExpression();

        const body = this.parseBlock();
        this.matchKeyword('end');

        return { type: 'LoopStatement', variable, iterable, body };
    }

    // --- Helpers ---

    private parseArguments(): Record<string, AST.ExpressionNode> {
        const args: Record<string, AST.ExpressionNode> = {};
        const hasBraces = this.match('PUNCTUATION', '{');

        if (hasBraces && this.check('PUNCTUATION', '}')) {
            this.advance();
            return args;
        }

        do {
            // Allow identifiers OR keywords as keys
            let key: string;
            if (this.match('IDENTIFIER') || this.match('KEYWORD')) {
                key = this.previous().value;
            } else {
                throw new Error(`Expected argument name but found ${this.peek().type} '${this.peek().value}' at ${this.peek().line}:${this.peek().column}`);
            }

            this.consume('PUNCTUATION', ':', "Expected ':' after argument name");
            const value = this.parseExpression();
            args[key] = value;

            // Allow trailing comma
            if (this.check('PUNCTUATION', '}') && hasBraces) break;
        } while (this.match('PUNCTUATION', ','));

        if (hasBraces) {
            this.consume('PUNCTUATION', '}', "Expected '}' at end of argument block");
        }

        return args;
    }

    // --- Expression Parsing (with Precedence) ---

    private parseExpression(): AST.ExpressionNode {
        return this.parseNullish();
    }

    private parseNullish(): AST.ExpressionNode {
        let left = this.parseLogicOr();
        while (this.match('OPERATOR', '??')) {
            const operator = '??';
            const right = this.parseLogicOr();
            left = { type: 'BinaryExpression', operator, left, right };
        }
        return left;
    }

    private parseLogicOr(): AST.ExpressionNode {
        let left = this.parseLogicAnd();
        while (this.matchKeyword('or')) {
            const operator = 'or';
            const right = this.parseLogicAnd();
            left = { type: 'BinaryExpression', operator, left, right };
        }
        return left;
    }

    private parseLogicAnd(): AST.ExpressionNode {
        let left = this.parseEquality();
        while (this.matchKeyword('and')) {
            const operator = 'and';
            const right = this.parseEquality();
            left = { type: 'BinaryExpression', operator, left, right };
        }
        return left;
    }

    private parseEquality(): AST.ExpressionNode {
        let left = this.parseComparison();
        while (this.match('OPERATOR', '==') || this.match('OPERATOR', '!=')) {
            const operator = this.previous().value;
            const right = this.parseComparison();
            left = { type: 'BinaryExpression', operator, left, right };
        }
        return left;
    }

    private parseComparison(): AST.ExpressionNode {
        let left = this.parseTerm();
        while (this.match('OPERATOR', '>') || this.match('OPERATOR', '<') ||
            this.match('OPERATOR', '>=') || this.match('OPERATOR', '<=') ||
            this.matchKeyword('contains')) {
            const operator = this.previous().value;
            const right = this.parseTerm();
            left = { type: 'BinaryExpression', operator, left, right };
        }
        return left;
    }

    private parseTerm(): AST.ExpressionNode {
        let left = this.parseFactor();
        while (this.match('OPERATOR', '+') || this.match('OPERATOR', '-')) {
            const operator = this.previous().value;
            const right = this.parseFactor();
            left = { type: 'BinaryExpression', operator, left, right };
        }
        return left;
    }

    private parseFactor(): AST.ExpressionNode {
        let left = this.parsePrimary(); // This handles parens/arrays/objects

        while (this.match('OPERATOR', '*') || this.match('OPERATOR', '/') || this.match('OPERATOR', '%')) {
            const operator = this.previous().value;
            const right = this.parsePrimary();
            left = { type: 'BinaryExpression', operator, left, right };
        }

        // Handle Member Access (Array index / Property access) here, after Primary
        while (true) {
            if (this.match('PUNCTUATION', '[')) {
                const property = this.parseExpression();
                this.consume('PUNCTUATION', ']', "Expected ']' after index");
                left = { type: 'MemberExpression', object: left, property, computed: true };
            } else if (this.match('PUNCTUATION', '.')) {
                let name: string;
                if (this.match('IDENTIFIER') || this.match('KEYWORD')) {
                    name = this.previous().value;
                } else {
                    throw new Error(`Expected property name after '.' but found ${this.peek().type} '${this.peek().value}'`);
                }
                const property: AST.IdentifierNode = { type: 'Identifier', name };
                left = { type: 'MemberExpression', object: left, property, computed: false };
            } else {
                break;
            }
        }

        return left;
    }

    private parsePrimary(): AST.ExpressionNode {
        // Parentheses
        if (this.match('PUNCTUATION', '(')) {
            const expr = this.parseExpression();
            this.consume('PUNCTUATION', ')', "Expected ')'");
            return expr;
        }

        // Arrays [1, 2]
        if (this.match('PUNCTUATION', '[')) {
            const elements: AST.ExpressionNode[] = [];
            if (!this.check('PUNCTUATION', ']')) {
                do {
                    elements.push(this.parseExpression());
                } while (this.match('PUNCTUATION', ','));
            }
            this.consume('PUNCTUATION', ']', "Expected ']' at end of array");
            return { type: 'ArrayLiteral', elements };
        }

        // Objects {a: 1}
        if (this.match('PUNCTUATION', '{')) {
            const properties: Record<string, AST.ExpressionNode> = {};
            if (!this.check('PUNCTUATION', '}')) {
                do {
                    // key can be identifier or string
                    let key: string;
                    if (this.match('STRING')) {
                        key = this.previous().formattedValue;
                    } else if (this.match('IDENTIFIER') || this.match('KEYWORD')) {
                        key = this.previous().value;
                    } else {
                        throw new Error(`Expected object key but found ${this.peek().type} '${this.peek().value}'`);
                    }

                    this.consume('PUNCTUATION', ':');
                    const value = this.parseExpression();
                    properties[key] = value;
                } while (this.match('PUNCTUATION', ','));
            }
            this.consume('PUNCTUATION', '}', "Expected '}' at end of object");
            return { type: 'ObjectLiteral', properties };
        }

        if (this.match('STRING')) {
            return { type: 'Literal', value: this.previous().formattedValue, raw: this.previous().value };
        }
        if (this.match('NUMBER')) {
            return { type: 'Literal', value: this.previous().formattedValue, raw: this.previous().value };
        }
        if (this.match('FSTRING')) {
            // Parse F-String content
            const raw = this.previous().formattedValue;
            return { type: 'FString', parts: [raw], loc: { start: 0, end: 0, line: this.previous().line } };
        }
        if (this.match('IDENTIFIER')) {
            return { type: 'Identifier', name: this.previous().value };
        }
        if (this.matchKeyword('true')) return { type: 'Literal', value: true, raw: 'true' };
        if (this.matchKeyword('false')) return { type: 'Literal', value: false, raw: 'false' };
        // NEW: Allow 'input' keyword to be used as a variable expression
        if (this.matchKeyword('input')) return { type: 'Identifier', name: 'input' };
        if (this.matchKeyword('null')) return { type: 'Literal', value: null, raw: 'null' };

        throw new Error(`Expected expression at ${this.peek().line}:${this.peek().column}, found ${this.peek().type} '${this.peek().value}'`);
    }

    // --- Core Navigation ---

    private match(type: TokenType, value?: string): boolean {
        if (this.check(type, value)) {
            this.advance();
            return true;
        }
        return false;
    }

    private matchKeyword(keyword: string): boolean {
        return this.match('KEYWORD', keyword);
    }

    private consume(type: TokenType, message?: string): Token {
        if (this.check(type)) return this.advance();
        if (type === 'PUNCTUATION' && arguments[1]) {
            // Special case for specific punctuation match check
            if (this.check('PUNCTUATION', arguments[1])) return this.advance();
        }
        throw new Error(message || `Expected ${type} but found ${this.peek().type}`);
    }

    private consumeKeyword(keyword: string, message?: string): Token {
        if (this.check('KEYWORD', keyword)) return this.advance();
        throw new Error(message || `Expected keyword '${keyword}'`);
    }

    private check(type: TokenType, value?: string): boolean {
        if (this.isAtEnd()) return false;
        const t = this.peek();
        if (t.type !== type) return false;
        if (value && t.value !== value) return false;
        return true;
    }

    private checkNext(type: TokenType, value?: string): boolean {
        if (this.current + 1 >= this.tokens.length) return false;
        const t = this.tokens[this.current + 1];
        if (t.type !== type) return false;
        if (value && t.value !== value) return false;
        return true;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private isAtEnd(): boolean {
        return this.peek().type === 'EOF';
    }

    private peek(): Token {
        return this.tokens[this.current];
    }

    private previous(): Token {
        return this.tokens[this.current - 1];
    }
}
