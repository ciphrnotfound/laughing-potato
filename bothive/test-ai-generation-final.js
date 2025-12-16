// Test AI generation directly to confirm it works
import { readFileSync } from 'fs';
import OpenAI from 'openai';

// Load environment variables manually
try {
  const envContent = readFileSync('.env.local', 'utf8');
  const envLines = envContent.split('\n');
  for (const line of envLines) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value && !value.startsWith('#')) {
        process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    }
  }
  console.log('Environment variables loaded for test');
} catch (error) {
  console.log('Could not load .env.local:', error.message);
}

// Initialize AI client
const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
const baseURL = process.env.GROQ_API_KEY ? 'https://api.groq.com/openai/v1' : undefined;
const AI_MODEL = process.env.AI_MODEL || (process.env.GROQ_API_KEY ? "llama-3.3-70b-versatile" : "gpt-4-turbo");

if (!apiKey) {
  throw new Error("No AI API key found");
}

const aiClient = new OpenAI({
  apiKey: apiKey,
  baseURL: baseURL
});

async function testAIGeneration() {
  try {
    const goal = "Monitor hackernews for 'AI' and slack me";
    const availableIntegrations = ['Slack', 'Gmail'];
    const availableBots = [];
    
    const systemPrompt = `
    You are the Swarm Architect. Your job is to design an autonomous agent workflow based on a user's goal.
    
    Available Tools:
    - Triggers: Webhook, Schedule (Cron), Email, Form Submit
    - Integrations: ${availableIntegrations?.join(', ') || 'Slack, Gmail, HubSpot'}
    - Logic: Condition, Loop, delay
    - User's Custom Bots: ${availableBots?.map((b: any) => `${b.name} (${b.id})`).join(', ') || 'None'}

    Output Rules:
    1. Return ONLY valid JSON. No markdown.
    2. Format: { "nodes": [], "edges": [] }
    3. Nodes must have: id, type='workflowNode', position: {x, y}, data: { label, icon, category }
    4. Category must be one of: 'triggers', 'ai', 'integrations', 'logic'
    5. Position nodes in a logical left-to-right flow (x: 0, 250, 500...).
    
    Example Goal: "Monitor hackernews for 'AI' and slack me"
    Example Output:
    {
      "nodes": [
        { "id": "t1", "type": "workflowNode", "position": { "x": 0, "y": 100 }, "data": { "label": "Schedule (10m)", "icon": "calendar", "category": "triggers" } },
        { "id": "a1", "type": "workflowNode", "position": { "x": 250, "y": 100 }, "data": { "label": "News Scraper", "icon": "bot", "category": "ai" } },
        { "id": "i1", "type": "workflowNode", "position": { "x": 500, "y": 100 }, "data": { "label": "Slack Alert", "icon": "messagesquare", "category": "integrations" } }
      ],
      "edges": [
        { "id": "e1", "source": "t1", "target": "a1" },
        { "id": "e2", "source": "a1", "target": "i1" }
      ]
    }
    `;

    console.log('Testing AI generation with goal:', goal);
    console.log('Using model:', AI_MODEL);
    
    const response = await aiClient.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `GOAL: ${goal}` }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    const blueprint = JSON.parse(content || "{}");
    
    console.log('✅ AI generation successful!');
    console.log('Generated blueprint:');
    console.log(JSON.stringify(blueprint, null, 2));
    
    // Validate the blueprint structure
    if (blueprint.nodes && blueprint.edges) {
      console.log('✅ Blueprint structure is valid');
      console.log(`- Nodes: ${blueprint.nodes.length}`);
      console.log(`- Edges: ${blueprint.edges.length}`);
      
      // Check each node has required fields
      const validNodes = blueprint.nodes.every(node => 
        node.id && node.type && node.position && node.data && 
        node.data.label && node.data.icon && node.data.category
      );
      
      if (validNodes) {
        console.log('✅ All nodes have required fields');
      } else {
        console.log('❌ Some nodes are missing required fields');
      }
      
      return blueprint;
    } else {
      console.log('❌ Invalid blueprint structure');
      return null;
    }
    
  } catch (error) {
    console.error('❌ AI Generation failed:', error);
    return null;
  }
}

// Run the test
testAIGeneration();