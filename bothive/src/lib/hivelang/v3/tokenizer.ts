
export type TokenType =
    | 'KEYWORD'     // bot, agent, if, call, say...
    | 'IDENTIFIER'  // MyBot, input, result
    | 'STRING'      // "hello"
    | 'FSTRING'     // f"hello {name}"
    | 'NUMBER'      // 123
    | 'OPERATOR'    // +, -, ==, >, includes
    | 'PUNCTUATION' // :, ,, .
    | 'INDENT'      // \n  
    | 'DEDENT'      // \n (back)
    | 'NEWLINE'
    | 'EOF';

export interface Token {
    type: TokenType;
    value: string;
    formattedValue?: any; // For parsed strings/numbers
    line: number;
    column: number;
}

const KEYWORDS = new Set([
    'bot', 'agent', 'end', 'description', 'type',
    'on', 'input', 'when',
    'if', 'else', 'elif', 'then',
    'call', 'with', 'as',
    'say', 'delegate', 'to', 'return',
    'set', 'remember', 'loop', 'in',
    'parallel', 'memory', 'var',
    'true', 'false', 'null', 'undefined',
    'and', 'or', 'not', 'contains'
]);

export class Tokenizer {
    private input: string;
    private position: number = 0;
    private line: number = 1;
    private column: number = 1;
    private indentStack: number[] = [0]; // Tracks indentation levels
    private nestingLevel: number = 0; // tracks (), [], {} for ignoring indentation

    constructor(input: string) {
        this.input = input.replace(/\r\n/g, '\n'); // Normalize newlines
    }

    tokenize(): Token[] {
        const tokens: Token[] = [];

        while (this.position < this.input.length) {
            const char = this.current();

            // 1. Handle Newlines and Indentation
            if (char === '\n') {
                this.consume();
                const { indentLevel, spaces } = this.countIndentation();

                // If line is empty/comment, skip
                if (this.current() === '\n' || this.current() === '#') {
                    continue;
                }

                // If we are inside (), [], or {}, ignore NEWLINE and indentation
                if (this.nestingLevel > 0) {
                    continue;
                }

                // Always emit NEWLINE first
                tokens.push(this.makeToken('NEWLINE', '\n'));

                const currentIndent = this.indentStack[this.indentStack.length - 1];

                if (indentLevel > currentIndent) {
                    this.indentStack.push(indentLevel);
                    tokens.push(this.makeToken('INDENT', '  '));
                } else if (indentLevel < currentIndent) {
                    while (this.indentStack.length > 1 && indentLevel < this.indentStack[this.indentStack.length - 1]) {
                        this.indentStack.pop();
                        tokens.push(this.makeToken('DEDENT', ''));
                    }
                    if (indentLevel !== this.indentStack[this.indentStack.length - 1]) {
                        throw new Error(`Indentation Error at Line ${this.line}`);
                    }
                }
                continue;
            }

            // 2. Skip Whitespace
            if (/\s/.test(char)) {
                this.consume();
                continue;
            }

            // 3. Comments
            if (char === '#') {
                this.skipComment();
                continue;
            }

            // 4. Strings (Double Quote and Triple Quote)
            if (char === '"') {
                if (this.peek() === '"' && this.input[this.position + 2] === '"') {
                    tokens.push(this.readTripleQuoteString());
                } else {
                    tokens.push(this.readString());
                }
                continue;
            }


            // 5. F-Strings
            if (char === 'f' && this.peek() === '"') {
                this.consume(); // eat 'f'
                const token = this.readString();
                token.type = 'FSTRING';
                tokens.push(token);
                continue;
            }

            // 6. Symbols / Operators
            // Handle 2-char operators first
            if (char === '=' && this.peek() === '=') {
                this.consume(); this.consume();
                tokens.push(this.makeToken('OPERATOR', '=='));
                continue;
            }
            if (char === '!' && this.peek() === '=') {
                this.consume(); this.consume();
                tokens.push(this.makeToken('OPERATOR', '!='));
                continue;
            }
            if (char === '>' && this.peek() === '=') {
                this.consume(); this.consume();
                tokens.push(this.makeToken('OPERATOR', '>='));
                continue;
            }
            if (char === '<' && this.peek() === '=') {
                this.consume(); this.consume();
                tokens.push(this.makeToken('OPERATOR', '<='));
                continue;
            }
            if (char === '?' && this.peek() === '?') {
                this.consume(); this.consume();
                tokens.push(this.makeToken('OPERATOR', '??'));
                continue;
            }

            // Handle 1-char operators vs punctuation
            if (/[+\-*\/%<>]/.test(char)) {
                tokens.push(this.makeToken('OPERATOR', this.consume()));
                continue;
            }

            // Assignment
            if (char === '=') {
                tokens.push(this.makeToken('PUNCTUATION', this.consume()));
                continue;
            }

            // 7. Punctuation
            if (/[,:.\[\]{}()]/.test(char)) {
                if (char === '(' || char === '[' || char === '{') {
                    this.nestingLevel++;
                } else if (char === ')' || char === ']' || char === '}') {
                    this.nestingLevel = Math.max(0, this.nestingLevel - 1);
                }
                tokens.push(this.makeToken('PUNCTUATION', this.consume()));
                continue;
            }

            // 7. Identifiers and Keywords
            if (/[a-zA-Z_$]/.test(char)) {
                const word = this.readIdentifier();
                if (KEYWORDS.has(word)) {
                    tokens.push(this.makeToken('KEYWORD', word));
                } else {
                    tokens.push(this.makeToken('IDENTIFIER', word));
                }
                continue;
            }

            // 8. Numbers
            if (/\d/.test(char)) {
                tokens.push(this.readNumber());
                continue;
            }

            // Unknown
            throw new Error(`Unexpected character '${char}' at ${this.line}:${this.column}`);
        }

        // Close remaining indents
        while (this.indentStack.length > 1) {
            this.indentStack.pop();
            tokens.push(this.makeToken('DEDENT', ''));
        }

        tokens.push(this.makeToken('EOF', ''));
        return tokens;
    }

    private current(): string {
        return this.input[this.position] || '';
    }

    private peek(): string {
        return this.input[this.position + 1] || '';
    }

    private consume(): string {
        const char = this.current();
        this.position++;
        if (char === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        return char;
    }

    private makeToken(type: TokenType, value: string): Token {
        return { type, value, line: this.line, column: this.column };
    }

    private countIndentation(): { indentLevel: number, spaces: number } {
        let spaces = 0;
        let pos = this.position;
        while (pos < this.input.length && this.input[pos] === ' ') {
            spaces++;
            pos++;
        }
        // Advance actual position
        for (let i = 0; i < spaces; i++) this.consume();

        return { indentLevel: spaces, spaces };
    }

    private skipComment() {
        while (this.current() && this.current() !== '\n') {
            this.consume();
        }
    }

    private readString(): Token {
        this.consume(); // "
        let value = '';
        while (this.current() && this.current() !== '"') {
            if (this.current() === '\\') {
                this.consume();
                value += this.consume(); // simplistic escape
            } else {
                value += this.consume();
            }
        }
        this.consume(); // "
        return { ...this.makeToken('STRING', value), formattedValue: value };
    }

    private readIdentifier(): string {
        let value = '';
        while (/[a-zA-Z0-9_$]/.test(this.current())) {
            value += this.consume();
        }
        return value;
    }

    private readNumber(): Token {
        let value = '';
        while (/\d/.test(this.current())) {
            value += this.consume();
        }
        return { ...this.makeToken('NUMBER', value), formattedValue: parseInt(value) };
    }
}
