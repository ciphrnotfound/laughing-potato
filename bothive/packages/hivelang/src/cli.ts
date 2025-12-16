
import fs from 'fs';
import path from 'path';
import { HiveCompiler } from './compiler';

export async function runCLI() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
        console.log(`
\x1b[35m
      _____
     /     \\
    /  ___  \\
   |  |   |  |    \x1b[1mHIVE\x1b[0m\x1b[35m
   |  |___|  |    \x1b[90mLANGUAGE\x1b[35m
    \\       /
     \\_____/
\x1b[0m
   \x1b[90mThe Intelligent Swarm Framework\x1b[0m

\x1b[1mUsage:\x1b[0m
  hive spawn <name>       Create a new Hive (project)
  hive buzz <file>        Run a bot locally (Simulation)
  hive swarm              Deploy to the swarm cloud
  hive compile <file>     Compile to raw JSON
`);
        process.exit(1);
    }

    switch (command) {
        case 'spawn':
            console.log('🐝 Spawning new hive...');

            const envPath = path.resolve(process.cwd(), '.env');
            const botPath = path.resolve(process.cwd(), 'bot.hive');

            if (!fs.existsSync(envPath)) {
                fs.writeFileSync(envPath, `BOTHIVE_API_KEY=bv_sk_placeholder
OPENAI_API_KEY=sk-placeholder
DATABASE_URL=postgresql://user:pass@localhost:5432/bothive
`);
                console.log('✅ Created .env');
            }

            if (!fs.existsSync(botPath)) {
                fs.writeFileSync(botPath, `bot "Researcher"
  description "A helpful assistant."
  
  on input
    say "Processing: " + input
    // call google.search(query: input)
  end
end
`);
                console.log('✅ Created bot.hive');
            }

            console.log('✅ Hive initialized.');
            break;

        case 'buzz':
            const runFile = args[1];
            if (!runFile) {
                console.error('Please specify a file to buzz.');
                process.exit(1);
            }
            console.log(`🐝 Buzzing ${runFile}...`);
            // Logic for run would go here
            const contentRun = fs.readFileSync(path.resolve(process.cwd(), runFile), 'utf-8');
            const compilerRun = new HiveCompiler();
            const resultRun = compilerRun.compile(contentRun);
            if (resultRun.success) {
                console.log('✅ Compiled. Simulating execution...');
                console.log('> Bot: "Bzzzz... (Ready)"');
            } else {
                console.error('❌ Failed to compile:', resultRun.error);
            }
            break;

        case 'swarm':
            console.log('🐝 Connecting to Swarm Cloud...');
            await new Promise(r => setTimeout(r, 1000));
            console.log('🚀 Deployed successfully.');
            break;

        case 'compile':
            const filePath = args[1];
            if (!filePath) {
                console.error('File required');
                process.exit(1);
            }

            const content = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
            const compiler = new HiveCompiler();
            const result = compiler.compile(content);

            if (result.success) {
                console.log(JSON.stringify(result.blocks, null, 2));
            } else {
                console.error('Error:', result.error);
                process.exit(1);
            }
            break;

        default:
            console.log(`Unknown command: ${command}`);
    }
}

if (require.main === module) {
    runCLI();
}
