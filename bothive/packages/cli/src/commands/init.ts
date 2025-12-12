import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

interface InitOptions {
    template?: string;
}

export async function initCommand(name: string = 'my-bot', options: InitOptions) {
    const spinner = ora({ text: 'Creating project...', color: 'gray' }).start();

    try {
        const projectDir = path.join(process.cwd(), name);

        // Create project directory
        await fs.mkdir(projectDir, { recursive: true });

        // Create bothive.json
        const config = {
            name,
            version: '1.0.0',
            description: 'A bot built with BotHive',
            main: 'bot.hive',
            template: options.template || 'custom'
        };
        await fs.writeFile(
            path.join(projectDir, 'bothive.json'),
            JSON.stringify(config, null, 2)
        );

        // Create bot.hive with HiveLang code
        const botCode = `@bot ${name}
@description "A custom AI assistant"
@model "grok-3-latest"

@capability greet
@capability answer_questions

@trigger on_message
  respond with ai
    context: "You are a helpful assistant"
    tone: friendly
`;
        await fs.writeFile(path.join(projectDir, 'bot.hive'), botCode);

        // Create README
        const readme = `# ${name}

Built with [BotHive](https://bothive.app)

## Development

\`\`\`bash
bothive dev      # Start local server
bothive push     # Deploy to cloud
\`\`\`

## Configuration

Edit \`bot.hive\` to customize your bot's behavior.
`;
        await fs.writeFile(path.join(projectDir, 'README.md'), readme);

        spinner.succeed(chalk.dim('Project created'));

        console.log(`
  ${chalk.dim('Project:')}   ${chalk.white(name)}
  ${chalk.dim('Path:')}      ${chalk.dim(projectDir)}

  ${chalk.dim('Next steps:')}
    cd ${name}
    bothive dev
`);

    } catch (error: any) {
        spinner.fail(chalk.red(error.message));
    }
}
