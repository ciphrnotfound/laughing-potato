/**
 * Simplified HiveLang Runtime - Match Original Bot HiveLang Style
 * Python-like syntax, no function keyword, built-in helpers
 */

interface HttpResponse {
    status: number;
    ok: boolean; // NEW: response.ok helper
    headers: Record<string, string>;
    data: any; // Parsed JSON data
    text: string; // Raw text
    error?: any; // Error from API
}

interface HttpOptions {
    headers?: Record<string, string>;
    body?: any;
    params?: Record<string, string>;
    timeout?: number;
}

/**
 * Built-in HTTP module for HiveLang (HTTPS-only)
 */
class HttpModule {
    private defaultTimeout = 30000;

    private async request(
        method: string,
        url: string,
        options: HttpOptions = {}
    ): Promise<HttpResponse> {
        // Force HTTPS
        if (!url.startsWith('https://') && !url.startsWith('http://localhost')) {
            throw new Error('Only HTTPS URLs are allowed in production');
        }

        // Add query params
        if (options.params) {
            const params = new URLSearchParams(options.params);
            url += (url.includes('?') ? '&' : '?') + params.toString();
        }

        const controller = new AbortController();
        const timeout = setTimeout(
            () => controller.abort(),
            options.timeout || this.defaultTimeout
        );

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'User-Agent': 'BotHive-Integration/1.0',
                    ...options.headers,
                },
                body: options.body ? JSON.stringify(options.body) : undefined,
                signal: controller.signal,
            });

            const text = await response.text();
            let data: any;
            let error: any;

            try {
                data = JSON.parse(text);
                if (!response.ok && data.error) {
                    error = data.error;
                }
            } catch {
                data = text;
            }

            return {
                status: response.status,
                ok: response.ok, // NEW: True if 200-299
                headers: Object.fromEntries(response.headers.entries()),
                data,
                text,
                error,
            };
        } finally {
            clearTimeout(timeout);
        }
    }

    async get(url: string, options?: HttpOptions): Promise<HttpResponse> {
        return this.request('GET', url, options);
    }

    async post(url: string, options?: HttpOptions): Promise<HttpResponse> {
        return this.request('POST', url, options);
    }

    async put(url: string, options?: HttpOptions): Promise<HttpResponse> {
        return this.request('PUT', url, options);
    }

    async patch(url: string, options?: HttpOptions): Promise<HttpResponse> {
        return this.request('PATCH', url, options);
    }

    async delete(url: string, options?: HttpOptions): Promise<HttpResponse> {
        return this.request('DELETE', url, options);
    }
}

/**
 * Built-in helper functions
 */
class HiveLangHelpers {
    static error(message: string): never {
        throw new Error(message);
    }

    static log(message: string) {
        console.log(`[HiveLang] ${message}`);
    }

    static warn(message: string) {
        console.warn(`[HiveLang] ${message}`);
    }
}

/**
 * Runtime context with user credentials
 */
interface RuntimeContext {
    user: {
        id: string;
        email?: string;
        api_key?: string;
        access_token?: string;
        refresh_token?: string;
        [key: string]: any;
    };
    integration: {
        id: string;
        name: string;
        slug: string;
    };
}

/**
 * Simplified HiveLang Runtime
 */
export class HiveLangRuntime {
    private http: HttpModule;
    private context: RuntimeContext | null = null;
    private capabilities: Map<string, Function> = new Map();

    constructor() {
        this.http = new HttpModule();
    }

    setContext(context: RuntimeContext) {
        this.context = context;
    }

    /**
     * Parse simplified HiveLang code
     * NEW syntax: @capability name(param1, param2)
     */
    loadCode(code: string) {
        this.capabilities.clear();

        // Extract capabilities with new syntax
        // @capability function_name(param1, param2)
        //     code here
        const capabilityRegex = /@capability\s+(\w+)\s*\((.*?)\)\s*\n([\s\S]*?)(?=@capability|$)/g;
        let match;

        while ((match = capabilityRegex.exec(code)) !== null) {
            const [, capabilityName, params, body] = match;

            // Parse parameters
            const paramsList = params
                .split(',')
                .map(p => p.trim())
                .filter(Boolean);

            // Transpile HiveLang body to JavaScript
            const jsCode = this.transpileToJS(body);

            try {
                // Create async JavaScript function
                const fn = new Function(
                    ...paramsList,
                    'context',
                    'http',
                    'error',
                    'log',
                    'warn',
                    `return (async () => { ${jsCode} })()`
                );

                this.capabilities.set(capabilityName, fn);
            } catch (err) {
                console.error(`Error loading capability ${capabilityName}:`, err);
                throw new Error(`Failed to compile capability: ${capabilityName}`);
            }
        }
    }

    /**
     * Wrap Python-style kwargs in HTTP calls into a JS options object
     * Handles nested braces properly
     */
    private wrapHttpKwargs(code: string): string {
        // Match http.method("url", followed by kwargs on next lines ending with )
        const httpCallPattern = /(http\.(get|post|put|patch|delete))\s*\(\s*([^\n,]+),\s*\n/g;

        let result = code;
        let match;

        // Find all http calls that have kwargs
        while ((match = httpCallPattern.exec(code)) !== null) {
            const startIdx = match.index;
            const httpMethod = match[1];
            const firstArg = match[3];
            const afterFirstArg = startIdx + match[0].length;

            // Find the closing paren by counting braces
            let braceCount = 0;
            let parenCount = 1; // We're inside the main call's opening paren
            let endIdx = afterFirstArg;
            let foundKwarg = false;

            for (let i = afterFirstArg; i < code.length; i++) {
                const char = code[i];
                if (char === '{') braceCount++;
                else if (char === '}') braceCount--;
                else if (char === '(' && braceCount === 0) parenCount++;
                else if (char === ')' && braceCount === 0) {
                    parenCount--;
                    if (parenCount === 0) {
                        endIdx = i;
                        break;
                    }
                }
                // Check if we see a kwarg pattern
                if (char === '=' && braceCount === 0 && code.slice(i - 10, i).match(/\w+\s*$/)) {
                    foundKwarg = true;
                }
            }

            if (foundKwarg && endIdx > afterFirstArg) {
                // Extract the kwargs block
                const kwargsBlock = code.slice(afterFirstArg, endIdx);

                // Convert kwargs: "    headers = {" → "    headers: {"
                const convertedKwargs = kwargsBlock.replace(/(\s*)(\w+)\s*=\s*\{/g, '$1$2: {');

                // Rebuild the call with wrapped kwargs
                const newCall = `${httpMethod}(${firstArg}, {\n${convertedKwargs}})`;
                const originalCall = code.slice(startIdx, endIdx + 1);

                result = result.replace(originalCall, newCall);
            }
        }

        return result;
    }

    /**
     * Transpile simplified HiveLang to JavaScript
     */
    private transpileToJS(hiveLangCode: string): string {
        let jsCode = hiveLangCode;

        // 1. Convert f-strings: f"text {var}" → `text ${var}`
        jsCode = jsCode.replace(/f"([^"]*?)"/g, (_, str) => {
            return '`' + str.replace(/\{(\w+(?:\.\w+)*)\}/g, '${$1}') + '`';
        });

        // 2. Convert f'strings' too: f'text {var}' → `text ${var}`
        jsCode = jsCode.replace(/f'([^']*?)'/g, (_, str) => {
            return '`' + str.replace(/\{(\w+(?:\.\w+)*)\}/g, '${$1}') + '`';
        });

        // 3. Wrap Python-style kwargs in HTTP calls into JS objects
        // Pattern: http.post("url",\n    headers = {...},\n    body = {...}\n)
        // Becomes: http.post("url", {\n    headers: {...},\n    body: {...}\n})
        jsCode = this.wrapHttpKwargs(jsCode);

        // 3b. Also handle simple single-line kwargs
        jsCode = jsCode.replace(/(\s+)(\w+)\s*=\s*\{/g, '$1$2: {');

        // 4. Convert user.api_key → context.user.api_key
        jsCode = jsCode.replace(/\buser\./g, 'context.user.');

        // 5. Auto-await HTTP calls: http.get(...) → await http.get(...)
        jsCode = jsCode.replace(/(\w+\s*=\s*)?(http\.(get|post|put|patch|delete))\(/g, '$1await $2(');

        // 6. response.data already works (no transpilation needed)

        // 7. Handle 'if not' with braces: if not x { -> if (!x) {
        // We capture everything between 'if not' and '{'
        jsCode = jsCode.replace(/if\s+not\s+([^{]+?)\s*\{/g, (_, condition) => {
            return `if (!(${condition.trim()})) {`;
        });

        // 8. Handle 'if' with braces: if x { -> if (x) {
        // We capture everything between 'if' and '{', avoiding 'else if'
        jsCode = jsCode.replace(/(?<!else\s+)\bif\s+(?!not\s|\()([^{]+?)\s*\{/g, (_, condition) => {
            return `if (${condition.trim()}) {`;
        });

        // 9. Handle 'elif' -> 'else if': elif x { -> else if (x) {
        jsCode = jsCode.replace(/elif\s+([^{]+?)\s*\{/g, (_, condition) => {
            return `else if (${condition.trim()}) {`;
        });

        // 10. General operators
        jsCode = jsCode.replace(/\bnot\s+/g, '!');
        jsCode = jsCode.replace(/\band\b/g, '&&');
        jsCode = jsCode.replace(/\bor\b/g, '||');

        // 11. Python list comprehension: [x for x in list] → list.map(x => x)
        jsCode = jsCode.replace(/\[([^[\]]+)\s+for\s+(\w+)\s+in\s+([^\]]+)\]/g, '$3.map($2 => $1)');

        // 12. Clean up indentation (Python-style to JS)
        // We now rely on braces {}, so indentation is just whitespace

        // 13. Ensure return statements work
        jsCode = jsCode.replace(/\breturn\s+/g, 'return ');

        return jsCode;
    }

    /**
     * Execute a capability
     */
    async executeCapability(
        capabilityName: string,
        params: Record<string, any>
    ): Promise<any> {
        if (!this.context) {
            throw new Error('Runtime context not set');
        }

        const fn = this.capabilities.get(capabilityName);
        if (!fn) {
            throw new Error(`Capability not found: ${capabilityName}`);
        }

        try {
            const paramValues = Object.values(params);

            // Execute with context and built-in helpers
            const result = await fn(
                ...paramValues,
                this.context,
                this.http,
                HiveLangHelpers.error,
                HiveLangHelpers.log,
                HiveLangHelpers.warn
            );

            return result;
        } catch (error: any) {
            console.error(`Error executing ${capabilityName}:`, error);
            throw error;
        }
    }
}

/**
 * Integration cache (LRU)
 */
class IntegrationCache {
    private cache = new Map<string, HiveLangRuntime>();
    private maxSize = 100;

    get(integrationId: string): HiveLangRuntime | null {
        return this.cache.get(integrationId) || null;
    }

    set(integrationId: string, runtime: HiveLangRuntime) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(integrationId, runtime);
    }

    clear() {
        this.cache.clear();
    }
}

export const integrationCache = new IntegrationCache();
