import { agentRegistry } from "@/lib/registry";
import { AgentDefinition } from "@/lib/agentTypes";

export async function POST() {
  // Seed some default agents
  const seedAgents: AgentDefinition[] = [
    {
      id: "agent-research",
      name: "Research Assistant",
      description: "Specialized in web research and information gathering",
      skills: ["web_search", "citation_tracking", "summarization"],
      memoryKeys: ["research_context", "user_preferences"],
    },
    {
      id: "agent-code",
      name: "Code Generator",
      description: "Generates production-ready code from specifications",
      skills: ["code_generation", "testing", "documentation"],
      memoryKeys: ["project_context", "code_style"],
    },
    {
      id: "agent-data",
      name: "Data Analyzer",
      description: "Analyzes and visualizes data from multiple sources",
      skills: ["data_analysis", "visualization", "reporting"],
      memoryKeys: ["data_sources"],
    },
  ];

  for (const agent of seedAgents) {
    await agentRegistry.upsert(agent);
  }

  return Response.json({ 
    message: "Seeded successfully",
    agents: seedAgents 
  });
}

