"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginCommand = loginCommand;
const chalk_1 = __importDefault(require("chalk"));
const readline_1 = __importDefault(require("readline"));
const conf_1 = __importDefault(require("conf"));
const config = new conf_1.default({ projectName: 'bothive' });
async function loginCommand() {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    console.log(`
  ${chalk_1.default.dim('Get your API key at:')}
  ${chalk_1.default.cyan('https://bothive.app/dashboard/developer/api-keys')}
`);
    rl.question(`  ${chalk_1.default.dim('API Key:')} `, async (apiKey) => {
        rl.close();
        if (!apiKey || apiKey.trim().length < 10) {
            console.log(chalk_1.default.red('\n  Invalid API key'));
            return;
        }
        // Validate the API key with the server
        try {
            const response = await fetch('https://localhost:3000/api/auth/validate-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: apiKey.trim() }),
            });
            if (response.ok) {
                config.set('authToken', apiKey.trim());
                console.log(chalk_1.default.green('\n  Authenticated successfully'));
            }
            else {
                // In dev mode, accept any key
                config.set('authToken', apiKey.trim());
                console.log(chalk_1.default.dim('\n  Key saved (dev mode)'));
            }
        }
        catch {
            // Network error - save locally for dev mode
            config.set('authToken', apiKey.trim());
            console.log(chalk_1.default.dim('\n  Key saved locally'));
        }
    });
}
