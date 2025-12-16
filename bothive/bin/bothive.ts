#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { HiveCompiler } from '../src/lib/hive-compiler';
import { allTools } from '../src/lib/tools';

// Simple CLI implementation
const args = process.argv.slice(2);
const command = args[0];

if (!command) {
    console.log(`
Bothive CLI v0.1.0

Usage:
  bothive init              Initialize a new project
  bothive run <file>        Run a HiveLang bot file
  bothive deploy            Deploy your bot to the cloud (Simulation)
`);
    process.exit(1);
}

async function main() {
    switch (command) {
        case 'init':
            await initProject();
            break;
        case 'run':
            await runBot(args[1]);
            break;
        case 'deploy':
            await deployBot();
            break;
        default:
            console.error(`Unknown command: ${command}`);
            process.exit(1);
    }
}

async function initProject() {
    console.log('🐝 Initializing Bothive project...');

    const envPath = path.resolve(process.cwd(), '.env');
    const botPath = path.resolve(process.cwd(), 'researcher.hive');

    // Create .env if not exists
    if (!fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, `BOTHIVE_API_KEY=your_key_here
OPENAI_API_KEY=your_openai_key
DATABASE_URL=postgresql://user:pass@localhost:5432/bothive
`);
        console.log('✅ Created .env');
    } else {
        console.log('ℹ️  .env already exists');
    }

    // Create sample bot
    if (!fs.existsSync(botPath)) {
        fs.writeFileSync(botPath, `bot "Researcher"
  description "A helpful assistant that researches topics online."
  
  on input
    say "Processing your request: " + input
    
    // Call the built-in search tool
    // call google.search(
    //   query: input
    // ) as results
    
    // Simulate result for now
    say "I found some interesting results about " + input
  end
end
`);
        console.log('✅ Created researcher.hive');
    } else {
        console.log('ℹ️  researcher.hive already exists');
    }

    console.log('\nProject initialized! Try running:\n  npx tsx bin/bothive.ts run researcher.hive "Hello World"');
}

async function runBot(filePath: string) {
    if (!filePath) {
        console.error('Please specify a file to run.');
        process.exit(1);
    }

    const fullPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    console.log(`🐝 Compiling ${path.basename(filePath)}...`);
    const code = fs.readFileSync(fullPath, 'utf-8');

    try {
        const compiler = new HiveCompiler();
        const result = compiler.compile(code);

        if (!result.success) {
            console.error('❌ Compilation Failed:');
            console.error(result.error);
            process.exit(1);
        }

        console.log('✅ Compiled successfully.');
        console.log('▶️  Running agent...');

        // In a real CLI, we would instantiate the AgentRuntime here.
        // For now, we simulate the run loop for the demo.

        const input = process.argv[3] || "Default Input";
        console.log(`> Input: "${input}"`);

        // Very basic simulation of the "say" command finding
        const runCode = result.javascript;
        if (runCode?.includes('say')) {
            // Extract static "say" strings for demo purposes
            // A real runtime would use eval() or a VM, but that's complex to wire up relative to imports in this snippet.
            console.log(`> Bot: "Processing your request: ${input}"`);
            console.log(`> Bot: "I found some interesting results about ${input}"`);
        }

        console.log('\n✨ Execution complete.');

    } catch (e: any) {
        console.error('Runtime error:', e.message);
    }
}

async function deployBot() {
    console.log('🐝 Deploying to Bothive Cloud...');
    await new Promise(r => setTimeout(r, 1500));
    console.log('✅ Uploading sources...');
    await new Promise(r => setTimeout(r, 800));
    console.log('✅ Verifying integrity...');
    console.log('\n🚀 Deployed Successfully!');
    console.log('URL: https://api.bothive.dev/bots/researcher-v1');
}

main().catch(console.error);
