import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const AGENTS_FILE = path.join(DATA_DIR, "agents.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const MEMORY_FILE = path.join(DATA_DIR, "memory.json");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (_error) {
    // Directory might already exist
  }
}

// Generic file operations
async function readFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch (_error) {
    return defaultValue;
  }
}

async function writeFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

type KeyValueStore = Record<string, unknown>;
type MemoryStore = unknown[];
type TaskStore = AutomationTask[];

export type AutomationTask = {
  id: string;
  title: string;
  dueDate?: string | null;
  status: "open" | "done";
  createdAt: string;
  metadata?: Record<string, unknown>;
};

// Agents storage
export const agentsStorage = {
  async read(): Promise<KeyValueStore> {
    return readFile<KeyValueStore>(AGENTS_FILE, {} as KeyValueStore);
  },
  async write(data: KeyValueStore): Promise<void> {
    await writeFile(AGENTS_FILE, data);
  },
};

// Users storage
export const usersStorage = {
  async read(): Promise<KeyValueStore> {
    return readFile<KeyValueStore>(USERS_FILE, {} as KeyValueStore);
  },
  async write(data: KeyValueStore): Promise<void> {
    await writeFile(USERS_FILE, data);
  },
};

// Memory storage
export const memoryStorage = {
  async read(): Promise<MemoryStore> {
    return readFile<MemoryStore>(MEMORY_FILE, [] as MemoryStore);
  },
  async write(data: MemoryStore): Promise<void> {
    await writeFile(MEMORY_FILE, data);
  },
};

// Automation tasks storage
export const tasksStorage = {
  async read(): Promise<TaskStore> {
    return readFile<TaskStore>(TASKS_FILE, [] as TaskStore);
  },
  async write(data: TaskStore): Promise<void> {
    await writeFile(TASKS_FILE, data);
  },
};

// Sessions storage
export const sessionsStorage = {
  async read(): Promise<KeyValueStore> {
    return readFile<KeyValueStore>(SESSIONS_FILE, {} as KeyValueStore);
  },
  async write(data: KeyValueStore): Promise<void> {
    await writeFile(SESSIONS_FILE, data);
  },
};

