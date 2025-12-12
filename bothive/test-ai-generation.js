// Test the AI generation part directly without authentication
const { aiClient, AI_MODEL } = require('./src/lib/ai-client.ts');

async function testAIGeneration() {
  try {
    console.log('Testing AI generation directly...');
    console.log('AI Model:', AI_MODEL);
    
    const goal = "Monitor hackernews for 'AI' and slack me";
    
    const systemPrompt = `
    You are the Swarm Architect. Your job is to design an autonomous agent workflow based on a user's goal.
    
    Available Tools:
    - Triggers: Webhook, Schedule (Cron), Email, Form Submit
    - Integrations: Slack, Gmail, HubSpot
    - Logic: Condition, Loop, delay
    - User's Custom Bots: None

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

    console.log('Sending request to AI...');
    const response = await aiClient.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `GOAL: ${goal}` }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    console.log('AI Response received');
    const content = response.choices[0]?.message?.content;
    console.log('Raw AI content:', content);
    
    const blueprint = JSON.parse(content || "{}");
    console.log('Parsed blueprint:', JSON.stringify(blueprint, null, 2));
    
    return blueprint;
  } catch (error) {
    console.error('AI Generation error:', error);
    throw error;
  }
}

testAIGeneration();