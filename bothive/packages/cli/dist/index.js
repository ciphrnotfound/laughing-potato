#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const init_js_1 = require("./commands/init.js");
const login_js_1 = require("./commands/login.js");
const push_js_1 = require("./commands/push.js");
const dev_js_1 = require("./commands/dev.js");
const program = new commander_1.Command();
// Minimal futuristic header
console.log(`
${chalk_1.default.dim('─────────────────────────────────────')}
${chalk_1.default.white.bold('  BOTHIVE')} ${chalk_1.default.dim('v1.0.0')}
${chalk_1.default.dim('  Build AI bots with HiveLang')}
${chalk_1.default.dim('─────────────────────────────────────')}
`);
program
    .name('bothive')
    .description('Build and deploy AI bots with HiveLang')
    .version('1.0.0');
program
    .command('init [name]')
    .description('Create a new bot project')
    .option('-t, --template <template>', 'Bot template to use', 'custom')
    .action(init_js_1.initCommand);
program
    .command('login')
    .description('Authenticate with BotHive')
    .action(login_js_1.loginCommand);
program
    .command('push')
    .description('Deploy bot to BotHive cloud')
    .option('-m, --message <message>', 'Deployment message')
    .action(push_js_1.pushCommand);
program
    .command('dev')
    .description('Run bot locally for testing')
    .option('-p, --port <port>', 'Port to run on', '3001')
    .action(dev_js_1.devCommand);
program
    .command('logs')
    .description('View bot execution logs')
    .option('-f, --follow', 'Follow logs in real-time')
    .action(() => {
    console.log(chalk_1.default.dim('  Coming soon: View execution logs'));
});
program.parse();
