import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const AGENTS_FILE = path.join(DATA_DIR, "agents.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const MEMORY_FILE = path.join(DATA_DIR, "memory.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

// Generic file operations
async function readFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch (error) {
    return defaultValue;
  }
}

async function writeFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// Agents storage
export const agentsStorage = {
  async read() {
    return readFile<Record<string, any>>(AGENTS_FILE, {});
  },
  async write(data: Record<string, any>) {
    await writeFile(AGENTS_FILE, data);
  },
};

// Users storage
export const usersStorage = {
  async read() {
    return readFile<Record<string, any>>(USERS_FILE, {});
  },
  async write(data: Record<string, any>) {
    await writeFile(USERS_FILE, data);
  },
};

// Memory storage
export const memoryStorage = {
  async read() {
    return readFile<any[]>(MEMORY_FILE, []);
  },
  async write(data: any[]) {
    await writeFile(MEMORY_FILE, data);
  },
};

// Sessions storage
export const sessionsStorage = {
  async read() {
    return readFile<Record<string, any>>(SESSIONS_FILE, {});
  },
  async write(data: Record<string, any>) {
    await writeFile(SESSIONS_FILE, data);
  },
};

