import { NextRequest } from "next/server";
import { agentRegistry } from "@/lib/registry";
import { RunRequest, RunResult, AgentMessage } from "@/lib/agentTypes";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RunRequest;
    const { steps, context = {} } = body;

    if (!steps || steps.length === 0) {
      return Response.json(
        { error: "At least one step is required" },
        { status: 400 }
      );
    }

    const transcript: AgentMessage[] = [];
    let output = "";

    // Execute each step in sequence
    for (const step of steps) {
      const agent = await agentRegistry.get(step.agentId);
      if (!agent) {
        transcript.push({
          role: "system",
          content: `Agent ${step.agentId} not found`,
          timestamp: Date.now(),
        });
        continue;
      }

      // Simulate agent execution
      const agentMessage: AgentMessage = {
        role: "agent",
        content: `[${agent.name}] Processing: ${step.input}`,
        agentId: agent.id,
        timestamp: Date.now(),
      };

      transcript.push(agentMessage);

      // Simulate agent thinking/processing
      const response = `I've processed "${step.input}" using my skills: ${agent.skills.join(", ")}. Context: ${JSON.stringify(context)}`;
      
      transcript.push({
        role: "agent",
        content: response,
        agentId: agent.id,
        timestamp: Date.now(),
      });

      output = response;
    }

    const result: RunResult = {
      transcript,
      output,
    };

    return Response.json(result);
  } catch (error) {
    console.error("Run error:", error);
    return Response.json(
      { error: "Failed to execute workflow" },
      { status: 500 }
    );
  }
}

