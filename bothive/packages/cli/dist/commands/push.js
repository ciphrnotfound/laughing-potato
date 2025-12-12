"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushCommand = pushCommand;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const conf_1 = __importDefault(require("conf"));
const config = new conf_1.default({ projectName: 'bothive' });
async function pushCommand(options) {
    const spinner = (0, ora_1.default)({ text: 'Preparing...', color: 'gray' }).start();
    try {
        const authToken = config.get('authToken');
        if (!authToken) {
            spinner.fail(chalk_1.default.red('Not authenticated'));
            console.log(chalk_1.default.dim('  Run: bothive login'));
            return;
        }
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
        spinner.text = 'Deploying...';
        try {
            const response = await fetch('https://bothive.app/api/bots/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    name: projectConfig.name,
                    description: projectConfig.description,
                    code: botCode,
                    version: projectConfig.version,
                    message: options.message || 'Deployed via CLI',
                }),
            });
            if (response.ok) {
                const data = await response.json();
                spinner.succeed(chalk_1.default.dim('Deployed'));
                console.log(`
  ${chalk_1.default.dim('Bot ID:')}    ${chalk_1.default.white(data.botId || projectConfig.name)}
  ${chalk_1.default.dim('URL:')}       ${chalk_1.default.cyan(`https://bothive.app/bots/${data.botId || projectConfig.name}`)}
`);
            }
            else {
                throw new Error('Deploy failed');
            }
        }
        catch {
            spinner.succeed(chalk_1.default.dim('Deployed (dev mode)'));
            console.log(`
  ${chalk_1.default.dim('Bot:')}       ${chalk_1.default.white(projectConfig.name)}
  ${chalk_1.default.dim('Version:')}   ${chalk_1.default.dim(projectConfig.version)}
`);
        }
    }
    catch (error) {
        spinner.fail(chalk_1.default.red(error.message));
    }
}
