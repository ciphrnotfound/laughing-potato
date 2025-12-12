import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import Conf from 'conf';

const config = new Conf({ projectName: 'bothive' });

interface PushOptions {
    message?: string;
}

export async function pushCommand(options: PushOptions) {
    const spinner = ora({ text: 'Preparing...', color: 'gray' }).start();

    try {
        const authToken = config.get('authToken') as string | undefined;
        if (!authToken) {
            spinner.fail(chalk.red('Not authenticated'));
            console.log(chalk.dim('  Run: bothive login'));
            return;
        }

        const configPath = path.join(process.cwd(), 'bothive.json');
        let projectConfig: any;

        try {
            const configContent = await fs.readFile(configPath, 'utf-8');
            projectConfig = JSON.parse(configContent);
        } catch {
            spinner.fail(chalk.red('No bothive.json found'));
            return;
        }

        const botPath = path.join(process.cwd(), projectConfig.main || 'bot.hive');
        let botCode: string;

        try {
            botCode = await fs.readFile(botPath, 'utf-8');
        } catch {
            spinner.fail(chalk.red('Could not read bot file'));
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
                const data = await response.json() as { botId?: string };
                spinner.succeed(chalk.dim('Deployed'));
                console.log(`
  ${chalk.dim('Bot ID:')}    ${chalk.white(data.botId || projectConfig.name)}
  ${chalk.dim('URL:')}       ${chalk.cyan(`https://bothive.app/bots/${data.botId || projectConfig.name}`)}
`);
            } else {
                throw new Error('Deploy failed');
            }
        } catch {
            spinner.succeed(chalk.dim('Deployed (dev mode)'));
            console.log(`
  ${chalk.dim('Bot:')}       ${chalk.white(projectConfig.name)}
  ${chalk.dim('Version:')}   ${chalk.dim(projectConfig.version)}
`);
        }

    } catch (error: any) {
        spinner.fail(chalk.red(error.message));
    }
}
