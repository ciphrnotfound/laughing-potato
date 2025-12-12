#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { loginCommand } from './commands/login.js';
import { pushCommand } from './commands/push.js';
import { devCommand } from './commands/dev.js';

const program = new Command();

// Minimal futuristic header
console.log(`
${chalk.dim('─────────────────────────────────────')}
${chalk.white.bold('  BOTHIVE')} ${chalk.dim('v1.0.0')}
${chalk.dim('  Build AI bots with HiveLang')}
${chalk.dim('─────────────────────────────────────')}
`);

program
    .name('bothive')
    .description('Build and deploy AI bots with HiveLang')
    .version('1.0.0');

program
    .command('init [name]')
    .description('Create a new bot project')
    .option('-t, --template <template>', 'Bot template to use', 'custom')
    .action(initCommand);

program
    .command('login')
    .description('Authenticate with BotHive')
    .action(loginCommand);

program
    .command('push')
    .description('Deploy bot to BotHive cloud')
    .option('-m, --message <message>', 'Deployment message')
    .action(pushCommand);

program
    .command('dev')
    .description('Run bot locally for testing')
    .option('-p, --port <port>', 'Port to run on', '3001')
    .action(devCommand);

program
    .command('logs')
    .description('View bot execution logs')
    .option('-f, --follow', 'Follow logs in real-time')
    .action(() => {
        console.log(chalk.dim('  Coming soon: View execution logs'));
    });

program.parse();

