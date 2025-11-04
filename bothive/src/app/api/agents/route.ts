import { NextRequest } from "next/server";
import { agentRegistry } from "@/lib/registry";
import { AgentDefinition } from "@/lib/agentTypes";

export async function GET() {
  const agents = await agentRegistry.list();
  return Response.json({ agents });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<AgentDefinition>;
  if (!body?.id || !body?.name) {
    return new Response(
      JSON.stringify({ error: "id and name are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const def: AgentDefinition = {
    id: body.id,
    name: body.name,
    description: body.description ?? "",
    skills: body.skills ?? [],
    memoryKeys: body.memoryKeys ?? [],
  };
  const saved = await agentRegistry.upsert(def);
  return Response.json(saved, { status: 201 });
}



