// HiveLang Monaco Language Definition
// Custom language support for Monaco Editor

import type { Monaco } from "@monaco-editor/react";

// HiveLang tokens and keywords
export const HIVELANG_KEYWORDS = [
    "bot",
    "agent",
    "end",
    "on",
    "when",
    "call",
    "with",
    "as",
    "say",
    "ask",
    "set",
    "if",
    "else",
    "loop",
    "in",
    "memory",
    "session",
    "user",
    "var",
    "tools",
    "description",
    "type",
    "scope",
    "persist",
    "true",
    "false",
    "input",
    "output",
    "remember",
    "contains",
    "and",
    "or",
    "not",
    // Hivelang v2 - New keywords
    "use",
    "try",
    "onerror",
    "parallel",
    "return",
    "emit",
    "wait",
];

export const HIVELANG_TYPES = [
    "string",
    "int",
    "float",
    "bool",
    "array",
    "object",
    "any",
];

export const HIVELANG_BUILTINS = [
    "general.respond",
    "agent.plan",
    "agent.analyze",
    "agent.delegate",
    "code.generate",
    "code.review",
    "code.debug",
    "email.send",
    "email.read",
    "calendar.create",
    "calendar.list",
    "crm.lookup",
    "crm.update",
    "stripe.charge",
    "stripe.refund",
    "ai.analyze",
    "ai.respond",
    "ai.generate",
    "vision.analyze",
    "study.quiz",
    "study.flashcards",
    "study.explain",
];

// Register HiveLang language with Monaco
export function registerHiveLangLanguage(monaco: Monaco) {
    // Register the language
    monaco.languages.register({ id: "hivelang" });

    // Set the language configuration (brackets, comments, etc.)
    monaco.languages.setLanguageConfiguration("hivelang", {
        comments: {
            lineComment: "#",
            blockComment: ["/*", "*/"],
        },
        brackets: [
            ["{", "}"],
            ["[", "]"],
            ["(", ")"],
        ],
        autoClosingPairs: [
            { open: "{", close: "}" },
            { open: "[", close: "]" },
            { open: "(", close: ")" },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
        ],
        surroundingPairs: [
            { open: "{", close: "}" },
            { open: "[", close: "]" },
            { open: "(", close: ")" },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
        ],
        indentationRules: {
            increaseIndentPattern: /^\s*(bot|on|if|loop|memory|tools|try|parallel)\b.*$/,
            decreaseIndentPattern: /^\s*(end|onerror)\b.*$/,
        },
    });

    // Define the tokenizer (syntax highlighting)
    monaco.languages.setMonarchTokensProvider("hivelang", {
        keywords: HIVELANG_KEYWORDS,
        typeKeywords: HIVELANG_TYPES,
        operators: ["==", "!=", "<", ">", "<=", ">=", "??", "+", "-", "*", "/", "%"],

        tokenizer: {
            root: [
                // Comments
                [/#.*$/, "comment"],
                [/\/\*/, "comment", "@comment"],

                // Strings
                [/"([^"\\]|\\.)*$/, "string.invalid"], // non-terminated string
                [/"/, "string", "@string"],
                [/'([^'\\]|\\.)*$/, "string.invalid"],
                [/'/, "string", "@string_single"],

                // Triple-quoted strings
                [/"""/, "string", "@multistring"],

                // Bot/Agent definition (highlight specially)
                [/\b(bot|agent)\s+([A-Z][a-zA-Z0-9_]*)/, ["keyword", "type.identifier"]],

                // Keywords
                [
                    /\b(bot|agent|end|on|when|call|with|as|say|ask|set|if|else|loop|in|memory|session|user|var|tools|description|type|scope|persist|remember|contains|and|or|not|use|try|onerror|parallel|return|emit|wait)\b/,
                    "keyword",
                ],

                // Booleans
                [/\b(true|false)\b/, "constant"],

                // Types
                [/\b(string|int|float|bool|array|object|any)\b/, "type"],

                // Built-in tool calls (e.g., general.respond, ai.analyze)
                [/\b([a-z]+\.[a-z]+)\b/, "function"],

                // Variables with $
                [/\$[a-zA-Z_][a-zA-Z0-9_]*/, "variable"],

                // Property access
                [/\b(input|output|user|customer|email|query|context|tone|result)\b/, "variable.predefined"],

                // Numbers
                [/\d+(\.\d+)?/, "number"],

                // Identifiers
                [/[a-zA-Z_][a-zA-Z0-9_]*/, "identifier"],

                // Whitespace
                [/\s+/, "white"],

                // Brackets
                [/[{}()\[\]]/, "@brackets"],

                // Operators
                [/[=<>!+\-*/%]/, "operator"],
            ],

            comment: [
                [/[^/*]+/, "comment"],
                [/\*\//, "comment", "@pop"],
                [/[/*]/, "comment"],
            ],

            string: [
                [/[^\\"]+/, "string"],
                [/\\./, "string.escape"],
                [/"/, "string", "@pop"],
            ],

            string_single: [
                [/[^\\']+/, "string"],
                [/\\./, "string.escape"],
                [/'/, "string", "@pop"],
            ],

            multistring: [
                [/[^"]+/, "string"],
                [/"""/, "string", "@pop"],
                [/"/, "string"],
            ],
        },
    });

    // Register completion provider
    monaco.languages.registerCompletionItemProvider("hivelang", {
        provideCompletionItems: (model: any, position: any) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
            };

            const suggestions = [
                // Keywords
                ...HIVELANG_KEYWORDS.map((keyword) => ({
                    label: keyword,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: keyword,
                    range,
                })),

                // Types
                ...HIVELANG_TYPES.map((type) => ({
                    label: type,
                    kind: monaco.languages.CompletionItemKind.TypeParameter,
                    insertText: type,
                    range,
                })),

                // Built-in tools
                ...HIVELANG_BUILTINS.map((tool) => ({
                    label: tool,
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: tool,
                    detail: "Built-in tool",
                    range,
                })),

                // Snippets
                {
                    label: "bot",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: [
                        "bot ${1:BotName}",
                        '  description "${2:Description}"',
                        "",
                        "  on input",
                        "    ${3:# Your logic here}",
                        "  end",
                        "end",
                    ].join("\n"),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Create a new bot definition",
                    range,
                },
                {
                    label: "agent",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: [
                        "agent ${1:AgentName}",
                        "  on input",
                        "    ${2:# Agent behavior}",
                        "  end",
                        "end",
                    ].join("\n"),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Create a sub-agent definition",
                    range,
                },
                {
                    label: "on-input",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: ["on input", "  ${1:# Handle input}", "end"].join("\n"),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Handle user input",
                    range,
                },
                {
                    label: "call-tool",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: "call ${1:tool.name} with { ${2:param}: ${3:value} } as ${4:result}",
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Call a tool with parameters",
                    range,
                },
                {
                    label: "memory-block",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: ["memory ${1:session}", "  var ${2:varName} ${3:string}", "end"].join("\n"),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Define a memory block",
                    range,
                },
                {
                    label: "if-condition",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: ['if ${1:condition}', '  ${2:# True branch}', 'end'].join("\n"),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Conditional statement",
                    range,
                },
                {
                    label: "when-handler",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: ['on input when ${1:input.command == "value"}', '  ${2:# Handle specific input}', 'end'].join("\n"),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Handle input with condition",
                    range,
                },
                // Hivelang v2 snippets
                {
                    label: "use-import",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: 'use "${1:path/to/file}" as ${2:alias}',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Import another .hive file",
                    range,
                },
                {
                    label: "try-onerror",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: ["try", "  ${1:# Risky operation}", "onerror", '  say "Error: {error}"', "end"].join("\\n"),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Error handling block",
                    range,
                },
                {
                    label: "parallel-block",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: ["parallel", "  call ${1:tool1} as ${2:result1}", "  call ${3:tool2} as ${4:result2}", "end"].join("\\n"),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Execute multiple calls concurrently",
                    range,
                },
                {
                    label: "wait-delay",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: "wait ${1:2s}",
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Pause execution for a duration",
                    range,
                },
                {
                    label: "emit-event",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: 'emit "${1:event_name}" with { ${2:key}: ${3:value} }',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Fire an event with data",
                    range,
                },
            ];

            return { suggestions };
        },
    });

    // Register hover provider for documentation
    monaco.languages.registerHoverProvider("hivelang", {
        provideHover: (model: any, position: any) => {
            const word = model.getWordAtPosition(position);
            if (!word) return null;

            const hoverDocs: Record<string, string> = {
                bot: "**bot** - Define a new bot with a name and behavior",
                agent: "**agent** - Define an autonomous agent with tools and goals",
                end: "**end** - Close a block (bot, on, if, loop, memory, try, parallel)",
                on: "**on** - Define an event handler (e.g., `on input`)",
                when: "**when** - Add a condition to an event handler",
                call: "**call** - Invoke a tool or function",
                with: "**with** - Pass parameters to a call",
                as: "**as** - Assign the result of a call to a variable",
                say: "**say** - Output a message to the user",
                ask: "**ask** - Query the AI for a response",
                set: "**set** - Assign a value to a variable",
                memory: "**memory** - Define persistent storage for the bot",
                tools: "**tools** - Declare available tools for the bot",
                input: "**input** - The current user input/message",
                // Hivelang v2 keywords
                use: "**use** - Import another .hive file (e.g., `use \"helpers/auth\" as auth`)",
                try: "**try** - Start an error handling block",
                onerror: "**onerror** - Handle errors from the try block (access `error` variable)",
                parallel: "**parallel** - Execute multiple calls concurrently",
                return: "**return** - Exit the current handler early",
                emit: "**emit** - Fire an event with optional data",
                wait: "**wait** - Pause execution (e.g., `wait 2s`)",
                // Tools
                "general.respond": "**general.respond** - Generate a conversational AI response",
                "agent.analyze": "**agent.analyze** - Analyze data or context",
                "ai.respond": "**ai.respond** - Generate an AI response with custom parameters",
                "code.generate": "**code.generate** - Generate code from a description",
            };

            const doc = hoverDocs[word.word];
            if (doc) {
                return {
                    range: {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn,
                    },
                    contents: [{ value: doc }],
                };
            }

            return null;
        },
    });
}

// Custom dark theme for HiveLang (Midnight Hive)
export function registerHiveLangTheme(monaco: Monaco) {
    monaco.editor.defineTheme("hivelang-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
            { token: "comment", foreground: "6B7280", fontStyle: "italic" },
            { token: "string", foreground: "10B981" },
            { token: "string.escape", foreground: "34D399" },
            { token: "keyword", foreground: "A78BFA", fontStyle: "bold" },
            { token: "type", foreground: "60A5FA" },
            { token: "type.identifier", foreground: "F472B6", fontStyle: "bold" },
            { token: "function", foreground: "FBBF24" },
            { token: "variable", foreground: "38BDF8" },
            { token: "variable.predefined", foreground: "67E8F9" },
            { token: "constant", foreground: "FB923C" },
            { token: "number", foreground: "FB923C" },
            { token: "operator", foreground: "94A3B8" },
            { token: "identifier", foreground: "E2E8F0" },
        ],
        colors: {
            "editor.background": "#08080C",
            "editor.foreground": "#E2E8F0",
            "editor.lineHighlightBackground": "#111116",
            "editorCursor.foreground": "#A78BFA",
            "editor.selectionBackground": "#A78BFA30",
            "editor.inactiveSelectionBackground": "#A78BFA15",
            "editorLineNumber.foreground": "#3F3F46",
            "editorLineNumber.activeForeground": "#A78BFA",
            "editorIndentGuide.background": "#18181B",
            "editorIndentGuide.activeBackground": "#27272A",
            "editor.border": "#18181B",
        },
    });
}

// Custom light theme for HiveLang (Clean Hive)
export function registerHiveLangLightTheme(monaco: Monaco) {
    monaco.editor.defineTheme("hivelang-light", {
        base: "vs",
        inherit: true,
        rules: [
            { token: "comment", foreground: "94A3B8", fontStyle: "italic" },
            { token: "string", foreground: "059669" },
            { token: "string.escape", foreground: "10B981" },
            { token: "keyword", foreground: "7C3AED", fontStyle: "bold" },
            { token: "type", foreground: "2563EB" },
            { token: "type.identifier", foreground: "DB2777", fontStyle: "bold" },
            { token: "function", foreground: "D97706" },
            { token: "variable", foreground: "0284C7" },
            { token: "variable.predefined", foreground: "0891B2" },
            { token: "constant", foreground: "EA580C" },
            { token: "number", foreground: "EA580C" },
            { token: "operator", foreground: "64748B" },
            { token: "identifier", foreground: "1E293B" },
        ],
        colors: {
            "editor.background": "#FAFAFA",
            "editor.foreground": "#1E293B",
            "editor.lineHighlightBackground": "#F1F5F9",
            "editorCursor.foreground": "#7C3AED",
            "editor.selectionBackground": "#7C3AED20",
            "editor.inactiveSelectionBackground": "#7C3AED10",
            "editorLineNumber.foreground": "#CBD5E1",
            "editorLineNumber.activeForeground": "#7C3AED",
            "editorIndentGuide.background": "#F1F5F9",
            "editorIndentGuide.activeBackground": "#E2E8F0",
        },
    });
}
