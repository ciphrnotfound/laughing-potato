"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.devCommand = devCommand;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
// Premium chat UI HTML
function getChatHTML(botName, botDescription) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${botName} | BotHive</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: #09090b;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            width: 100%;
            max-width: 440px;
            background: rgba(24, 24, 27, 0.9);
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.08);
            overflow: hidden;
            backdrop-filter: blur(20px);
        }
        .header {
            padding: 24px;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .avatar {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }
        .header-info h1 {
            color: #fafafa;
            font-size: 16px;
            font-weight: 600;
        }
        .header-info p {
            color: #71717a;
            font-size: 13px;
            margin-top: 2px;
        }
        .status {
            margin-left: auto;
            display: flex;
            align-items: center;
            gap: 6px;
            color: #22c55e;
            font-size: 12px;
        }
        .status-dot {
            width: 6px;
            height: 6px;
            background: #22c55e;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }
        .messages {
            height: 380px;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 14px;
        }
        .messages::-webkit-scrollbar { width: 4px; }
        .messages::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
        .message {
            max-width: 85%;
            padding: 12px 16px;
            border-radius: 14px;
            font-size: 14px;
            line-height: 1.6;
            animation: slideIn 0.2s ease;
        }
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .message.bot {
            align-self: flex-start;
            background: #27272a;
            color: #e4e4e7;
        }
        .message.user {
            align-self: flex-end;
            background: #7c3aed;
            color: #fff;
        }
        .typing {
            align-self: flex-start;
            padding: 12px 16px;
            display: flex;
            gap: 5px;
        }
        .typing span {
            width: 6px;
            height: 6px;
            background: #52525b;
            border-radius: 50%;
            animation: typing 1.2s infinite;
        }
        .typing span:nth-child(2) { animation-delay: 0.15s; }
        .typing span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes typing {
            0%, 60% { transform: translateY(0); }
            30% { transform: translateY(-6px); }
        }
        .input-area {
            padding: 16px 20px 20px;
            border-top: 1px solid rgba(255,255,255,0.06);
            display: flex;
            gap: 10px;
        }
        input {
            flex: 1;
            padding: 14px 18px;
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 12px;
            color: #fafafa;
            font-size: 14px;
            font-family: inherit;
            outline: none;
            transition: border-color 0.2s;
        }
        input:focus { border-color: #7c3aed; }
        input::placeholder { color: #52525b; }
        button {
            width: 48px;
            height: 48px;
            background: #7c3aed;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        button:hover { background: #6d28d9; transform: scale(1.02); }
        button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        button svg { fill: #fff; width: 18px; height: 18px; }
        .footer {
            padding: 12px 20px;
            text-align: center;
            font-size: 11px;
            color: #3f3f46;
            border-top: 1px solid rgba(255,255,255,0.04);
        }
        .footer a { color: #7c3aed; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="avatar">B</div>
            <div class="header-info">
                <h1>${botName}</h1>
                <p>${botDescription || 'AI Assistant'}</p>
            </div>
            <div class="status">
                <div class="status-dot"></div>
                dev
            </div>
        </div>
        <div class="messages" id="messages">
            <div class="message bot">Hello! I'm ${botName}. How can I assist you?</div>
        </div>
        <div class="input-area">
            <input type="text" id="input" placeholder="Message ${botName}..." autocomplete="off" />
            <button id="send">
                <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
        </div>
        <div class="footer">
            Built with <a href="https://bothive.app" target="_blank">BotHive</a>
        </div>
    </div>
    <script>
        const messages = document.getElementById('messages');
        const input = document.getElementById('input');
        const send = document.getElementById('send');
        let loading = false;

        function add(text, type) {
            const el = document.createElement('div');
            el.className = 'message ' + type;
            el.textContent = text;
            messages.appendChild(el);
            messages.scrollTop = messages.scrollHeight;
        }

        function showTyping() {
            const el = document.createElement('div');
            el.className = 'typing';
            el.id = 'typing';
            el.innerHTML = '<span></span><span></span><span></span>';
            messages.appendChild(el);
            messages.scrollTop = messages.scrollHeight;
        }

        function hideTyping() {
            document.getElementById('typing')?.remove();
        }

        async function submit() {
            const text = input.value.trim();
            if (!text || loading) return;
            add(text, 'user');
            input.value = '';
            loading = true;
            send.disabled = true;
            showTyping();
            try {
                const res = await fetch('/run', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: text })
                });
                hideTyping();
                const data = await res.json();
                add(data.response || 'No response', 'bot');
            } catch (e) {
                hideTyping();
                add('Connection error', 'bot');
            }
            loading = false;
            send.disabled = false;
        }

        send.onclick = submit;
        input.onkeydown = e => e.key === 'Enter' && submit();
        input.focus();
    </script>
</body>
</html>`;
}
async function devCommand(options) {
    const port = parseInt(options.port || '3001');
    const spinner = (0, ora_1.default)({ text: 'Loading bot...', color: 'gray' }).start();
    try {
        const configPath = path_1.default.join(process.cwd(), 'bothive.json');
        let projectConfig;
        try {
            const configContent = await promises_1.default.readFile(configPath, 'utf-8');
            projectConfig = JSON.parse(configContent);
        }
        catch {
            spinner.fail(chalk_1.default.red('No bothive.json found'));
            return;
        }
        const botPath = path_1.default.join(process.cwd(), projectConfig.main || 'bot.hive');
        let botCode;
        try {
            botCode = await promises_1.default.readFile(botPath, 'utf-8');
        }
        catch {
            spinner.fail(chalk_1.default.red('Could not read bot file'));
            return;
        }
        spinner.succeed(chalk_1.default.dim('Bot loaded'));
        const server = http_1.default.createServer(async (req, res) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }
            if (req.method === 'GET' && req.url === '/') {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(getChatHTML(projectConfig.name, projectConfig.description));
                return;
            }
            if (req.method === 'GET' && req.url === '/info') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    name: projectConfig.name,
                    description: projectConfig.description,
                    version: projectConfig.version,
                    status: 'running'
                }));
                return;
            }
            if (req.method === 'POST' && req.url === '/run') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', async () => {
                    try {
                        const { prompt } = JSON.parse(body);
                        console.log(chalk_1.default.dim(`  > ${prompt}`));
                        const response = await generateResponse(prompt, botCode, projectConfig);
                        console.log(chalk_1.default.white(`  < ${response.substring(0, 60)}${response.length > 60 ? '...' : ''}`));
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, response }));
                    }
                    catch (error) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: error.message }));
                    }
                });
                return;
            }
            res.writeHead(404);
            res.end();
        });
        server.listen(port, () => {
            console.log(`
${chalk_1.default.dim('─────────────────────────────────────')}
${chalk_1.default.white.bold('  DEV SERVER')}
${chalk_1.default.dim('─────────────────────────────────────')}

  ${chalk_1.default.dim('Bot:')}      ${chalk_1.default.white(projectConfig.name)}
  ${chalk_1.default.dim('Chat:')}     ${chalk_1.default.cyan(`http://localhost:${port}`)}
  ${chalk_1.default.dim('API:')}      ${chalk_1.default.dim(`POST /run`)}

${chalk_1.default.dim('  Press Ctrl+C to stop')}
`);
        });
        process.on('SIGINT', () => {
            console.log(chalk_1.default.dim('\n  Server stopped'));
            server.close();
            process.exit(0);
        });
    }
    catch (error) {
        spinner.fail(chalk_1.default.red(error.message));
    }
}
// AI-powered response generator
async function generateResponse(prompt, botCode, config) {
    // Try to call AI API if key is available (check in priority order)
    const groqKey = process.env.GROQ_API_KEY;
    const xaiKey = process.env.XAI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const apiKey = groqKey || xaiKey || openaiKey;
    if (apiKey) {
        try {
            const systemPrompt = extractSystemPrompt(botCode, config);
            // Determine endpoint and model based on which key is available
            let endpoint;
            let model;
            if (groqKey) {
                endpoint = 'https://api.groq.com/openai/v1/chat/completions';
                model = 'llama-3.3-70b-versatile';
            }
            else if (xaiKey) {
                endpoint = 'https://api.x.ai/v1/chat/completions';
                model = 'grok-3-latest';
            }
            else {
                endpoint = 'https://api.openai.com/v1/chat/completions';
                model = 'gpt-4o-mini';
            }
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });
            if (response.ok) {
                const data = await response.json();
                return data.choices?.[0]?.message?.content || 'No response generated';
            }
        }
        catch (e) {
            // Fall through to local response
        }
    }
    // Local fallback responses
    return generateLocalResponse(prompt, config);
}
function extractSystemPrompt(botCode, config) {
    // Try to extract description from bot code
    const descMatch = botCode.match(/@description\s+"([^"]+)"/);
    const desc = descMatch ? descMatch[1] : config.description || '';
    return `You are ${config.name}, an AI assistant. ${desc}
Be helpful, concise, and friendly. This is a dev environment for testing.`;
}
function generateLocalResponse(prompt, config) {
    const lower = prompt.toLowerCase();
    if (lower.match(/^(hi|hello|hey|greetings)/)) {
        return `Hello! I'm ${config.name}. How can I help you today?`;
    }
    if (lower.includes('help') || lower.includes('what can you do')) {
        return `I'm ${config.name}. Set XAI_API_KEY or OPENAI_API_KEY in your environment for full AI responses.`;
    }
    if (lower.includes('name')) {
        return `I'm ${config.name}, built with BotHive and HiveLang.`;
    }
    return `[Local Mode] Add XAI_API_KEY or OPENAI_API_KEY to enable AI responses. Received: "${prompt}"`;
}
