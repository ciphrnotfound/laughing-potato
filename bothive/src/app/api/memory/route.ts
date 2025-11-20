import { NextRequest } from "next/server";
import { memoryStorage } from "@/lib/storage";

interface MemoryEntry {
  key: string;
  value: unknown;
  timestamp: number;
  agentId: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agentId");
  const key = searchParams.get("key");

  const allEntries = (await memoryStorage.read()) as MemoryEntry[];

  if (agentId) {
    const entries = allEntries.filter((e: MemoryEntry) => e.agentId === agentId);
    if (key) {
      const filtered = entries.filter((e: MemoryEntry) => e.key === key);
      return Response.json({ entries: filtered });
    }
    return Response.json({ entries });
  }

  return Response.json({ entries: allEntries });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, key, value } = body;

    if (!agentId || !key) {
      return Response.json(
        { error: "agentId and key are required" },
        { status: 400 }
      );
    }

    const entry: MemoryEntry = {
      key,
      value,
      timestamp: Date.now(),
      agentId,
    };

    const entries = await memoryStorage.read();
    entries.push(entry);
    await memoryStorage.write(entries);

    return Response.json(entry, { status: 201 });
  } catch (error) {
    console.error("Memory error:", error);
    return Response.json(
      { error: "Failed to save memory" },
      { status: 500 }
    );
  }
}

