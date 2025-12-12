"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCommand = initCommand;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
async function initCommand(name = 'my-bot', options) {
    const spinner = (0, ora_1.default)({ text: 'Creating project...', color: 'gray' }).start();
    try {
        const projectDir = path_1.default.join(process.cwd(), name);
        // Create project directory
        await promises_1.default.mkdir(projectDir, { recursive: true });
        // Create bothive.json
        const config = {
            name,
            version: '1.0.0',
            description: 'A bot built with BotHive',
            main: 'bot.hive',
            template: options.template || 'custom'
        };
        await promises_1.default.writeFile(path_1.default.join(projectDir, 'bothive.json'), JSON.stringify(config, null, 2));
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
        await promises_1.default.writeFile(path_1.default.join(projectDir, 'bot.hive'), botCode);
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
        await promises_1.default.writeFile(path_1.default.join(projectDir, 'README.md'), readme);
        spinner.succeed(chalk_1.default.dim('Project created'));
        console.log(`
  ${chalk_1.default.dim('Project:')}   ${chalk_1.default.white(name)}
  ${chalk_1.default.dim('Path:')}      ${chalk_1.default.dim(projectDir)}

  ${chalk_1.default.dim('Next steps:')}
    cd ${name}
    bothive dev
`);
    }
    catch (error) {
        spinner.fail(chalk_1.default.red(error.message));
    }
}
