import { NextRequest, NextResponse } from "next/server";
import { aiClient, AI_MODEL } from "@/lib/ai-client";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { TIER_CONFIG, SubscriptionTier } from "@/lib/subscription-tiers";
import { HiveMindMemory } from "@/lib/memory/hivemind-memory";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
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

        // 1. Authenticate
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { message, conversationHistory = [], currentPath } = body;

        // 2. Get User Context (Tier, Bots, Usage)
        // Admin Override
        const ADMIN_EMAIL = "akinlorinjeremiah@gmail.com";
        let tier: SubscriptionTier = 'free';
        let limit = 5;
        let isUnlimited = false;

        if (user.email === ADMIN_EMAIL) {
            tier = 'business';
            limit = -1;
            isUnlimited = true;
        } else {
            const { data: userData } = await supabase
                .from("users")
                .select("tier")
                .eq("id", user.id)
                .single();
            tier = userData?.tier || 'free';
            limit = TIER_CONFIG[tier].aiMessagesPerMonth;
        }

        const currentMonth = new Date().toISOString().slice(0, 7);

        if (!isUnlimited && limit !== -1) {
            const { data: usageData } = await supabase
                .from("usage_tracking")
                .select("ai_messages_used")
                .eq("user_id", user.id)
                .eq("month_year", currentMonth)
                .single();

            if ((usageData?.ai_messages_used || 0) >= limit) {
                return NextResponse.json({
                    error: "Usage limit reached",
                    upgradeRequired: true
                }, { status: 429 });
            }
        }

        // 3. Gather Dashboard Context & MEMORIES
        const [botStats, userMemories] = await Promise.all([
            supabase.from("bots").select("*", { count: 'exact', head: true }).eq("user_id", user.id),
            HiveMindMemory.recallAll(user.id)
        ]);

        const botCount = botStats.count || 0;

        // Format memories for prompt
        const memoryContext = Object.entries(userMemories)
            .map(([key, value]) => `- ${key}: ${value}`)
            .join('\n');

        // 4. Construct System Prompt
        const systemPrompt = `You are HiveMind, the intelligent AI engine powering Bothive.
        
Context:
- User Tier: ${tier.toUpperCase()}${isUnlimited ? " (ADMIN MODE)" : ""}
- User Bot Count: ${botCount}
- Current Page: ${currentPath || "Unknown"}
- Current Month: ${currentMonth}

User Memories (Things you know about this user):
${memoryContext || "No previous memories."}

HiveLang Syntax (Reference):
\`\`\`
bot Name 
  description "..."
  memory scope ... end
  on input [when condition] ... end
  call tool.name with { param: value } as result
  say "message " + result.output
end
\`\`\`

Your Role:
- You are a senior engineer and strategic advisor.
- You know HiveLang syntax perfectly and can write code snippets.
- Use the User Memories to personalize your response (e.g. use their name if known (context_user_name), or recall their business type).
- **MEMORY MANAGEMENT**: If the user tells you something important (like their name, business goals, or preferences), SAVE IT.
  - To save a memory, add this exact line at the end of your response:
  - \`[MEMORY: key | value]\`
  - Example: \`[MEMORY: user_name | Jeremiah]\` or \`[MEMORY: business_type | Real Estate]\`

Response Style:
- Concise, professional yet conversational.
- Use code blocks for HiveLang.
- Be proactive.`;

        // 5. Generate Response
        const messages = [
            { role: "system", content: systemPrompt },
            ...conversationHistory.map((msg: any) => ({ role: msg.role, content: msg.content })),
            { role: "user", content: message }
        ];

        const response = await aiClient.chat.completions.create({
            model: AI_MODEL,
            messages: messages as any,
            temperature: 0.7,
        });

        let content = response.choices[0]?.message?.content?.trim() || "";

        // 6. Validating & Saving Memories
        // Extract [MEMORY: key | value] lines
        const memoryRegex = /\[MEMORY:\s*(.*?)\s*\|\s*(.*?)\]/g;
        let match;
        const memoriesToSave: Promise<any>[] = [];

        while ((match = memoryRegex.exec(content)) !== null) {
            const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
            const value = match[2].trim();
            if (key && value) {
                console.log(`[HiveMind] Saving memory: ${key} = ${value}`);
                memoriesToSave.push(HiveMindMemory.remember(user.id, key, value));
            }
        }

        // Remove memory commands from output so user doesn't see them
        content = content.replace(memoryRegex, '').trim();

        // Save memories in background (fire and forget, or await if critical)
        await Promise.allSettled(memoriesToSave);

        // 7. Track Usage
        await supabase.rpc('increment_ai_usage', { p_user_id: user.id });

        return NextResponse.json({
            response: content,
            usage: response.usage
        });

    } catch (error) {
        console.error("HiveMind API error:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}
