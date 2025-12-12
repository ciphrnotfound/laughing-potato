
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase URL or Service Key. Please check .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    const migrationPath = path.join(process.cwd(), "supabase/migrations/20241208_hivemind_memory.sql");

    if (!fs.existsSync(migrationPath)) {
        console.error(`Migration file not found at ${migrationPath}`);
        process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, "utf-8");

    console.log("Applying HiveMind Memory migration...");

    // Split SQL into statements to execute them one by one if needed, 
    // but supabase-js doesn't have a direct 'query' method for raw SQL unless via RPC.
    // HOWEVER, we can use the specific 'pg' method if we were using 'pg' library.
    // Since we don't have 'pg' configured with a connection string (no DATABASE_URL in .env.local),
    // we have to rely on a trick: Supabase REST API doesn't support raw SQL execution for security.

    // Checking if there is a helper RPC
    const { error: rpcCheck } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (rpcCheck) {
        if (rpcCheck.code === 'PGRST202') { // Function not found
            console.error("Error: 'exec_sql' RPC function not found. Cannot apply migration automatically.");
            console.error("Please execute the following SQL in your Supabase Dashboard SQL Editor:");
            console.log("\n" + sql + "\n");
        } else {
            console.error("Error executing migration:", rpcCheck.message);
        }
    } else {
        console.log("Migration applied successfully via RPC!");
    }
}

runMigration();
