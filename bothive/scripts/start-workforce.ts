// Load environment variables from .env.local before any imports
import { readFileSync } from 'fs';
import { join } from 'path';

try {
  const envPath = join(process.cwd(), '.env.local');
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value && !value.startsWith('#')) {
        process.env[key.trim()] = value.replace(/['"]/g, '');
      }
    }
  });
  console.log("Environment variables loaded from .env.local");
} catch (err) {
  console.log("Could not load .env.local file, using existing environment variables");
}

console.log("Starting workforce worker...");
console.log("GROQ_API_KEY available:", !!process.env.GROQ_API_KEY);
console.log("SUPABASE_URL available:", !!process.env.SUPABASE_URL);

import { startWorkforceWorker } from "@/lib/queues/workforce";

// Start the worker
const worker = startWorkforceWorker();

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing worker...");
  await worker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing worker...");
  await worker.close();
  process.exit(0);
});

console.log("Workforce worker started successfully");