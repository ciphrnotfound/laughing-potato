
import { compileHive } from './src/lib/hive-compiler';
import { STUDY_BUDDY_SWARM } from './src/lib/hivelang/examples';

async function run() {
    console.log("--- COMPILER OUTPUT DEBUG ---");

    const compiled = await compileHive(STUDY_BUDDY_SWARM);

    console.log(`Diagnostics: ${compiled.diagnostics.length}`);
    if (compiled.diagnostics.length > 0) {
        compiled.diagnostics.slice(0, 5).forEach(d => {
            console.log(`[${d.severity.toUpperCase()}] Line ${d.line}: ${d.message}`);
        });
    }

    console.log("\n--- GENERATED CODE SNIPPET (First 800 chars) ---");
    console.log(compiled.code.substring(0, 800));
    console.log("--- END SNIPPET ---");

    try {
        const cleanCode = compiled.code.replace(/export default program;/, "");
        const programFactory = new Function(cleanCode + "\nreturn program;");
        const program = programFactory();

        console.log(`Program Object Type: ${typeof program}`);
        if (program) {
            console.log(`Program Keys: ${Object.keys(program).join(", ")}`);
            console.log(`Root Steps: ${program.steps ? program.steps.length : 'UNDEFINED'}`);
            console.log(`Agents: ${program.agents ? program.agents.length : 'UNDEFINED'}`);
        }
    } catch (err) {
        console.error("FAILED TO EVALUATE PROGRAM:", err);
    }
}

run().catch(console.error);
