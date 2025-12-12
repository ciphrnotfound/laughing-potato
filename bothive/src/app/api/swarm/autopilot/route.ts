import { NextRequest, NextResponse } from "next/server";
import { aiClient, AI_MODEL } from "@/lib/ai-client";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        const { goal, availableBots, availableIntegrations } = await request.json();

        if (!goal) {
            return NextResponse.json({ error: "Goal is required" }, { status: 400 });
        }

        // Authentication is optional for blueprint generation
        // The AI can generate workflows without user context
        let user = null;
        try {
            const cookieStore = await cookies();
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        get(name: string) { return cookieStore.get(name)?.value; },
                        set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }); },
                        remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }); },
                    },
                }
            );
            const { data: { user: authUser } } = await supabase.auth.getUser();
            user = authUser;
        } catch (authError) {
            // User is not authenticated, but we can still generate blueprints
            console.log('User not authenticated, proceeding with anonymous blueprint generation');
        }

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

        const response = await aiClient.chat.completions.create({
            model: AI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `GOAL: ${goal}` }
            ],
            temperature: 0.2, // Low temp for consistent JSON structure
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        const blueprint = JSON.parse(content || "{}");

        return NextResponse.json({ blueprint });

    } catch (error: any) {
        console.error("Autopilot error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
