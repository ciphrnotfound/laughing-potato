import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            name,
            description,
            systemPrompt,
            hiveLangCode,
            tools,
            integrations,
            memoryStrategy,
            templateId,
        } = body;

        // Validate required fields
        if (!name || !name.trim()) {
            return NextResponse.json({ error: "Bot name is required" }, { status: 400 });
        }

        // Generate a unique slug
        const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const timestamp = Date.now().toString(36);
        const slug = `${baseSlug}-${timestamp}`;

        // Create the bot with pending_approval status
        const { data: bot, error: insertError } = await supabase
            .from("bots")
            .insert({
                user_id: user.id,
                name: name.trim(),
                slug,
                description: description?.trim() || null,
                system_prompt: systemPrompt || null,
                hivelang_code: hiveLangCode || null,
                tools: tools || [],
                integrations: integrations || [],
                memory_strategy: memoryStrategy || "ephemeral",
                template_id: templateId || null,
                status: "pending_approval", // All new bots go to pending
                is_public: false,
                version: "1.0.0",
            })
            .select()
            .single();

        if (insertError) {
            console.error("Error creating bot:", insertError);
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            bot: {
                id: bot.id,
                name: bot.name,
                slug: bot.slug,
                status: bot.status,
            },
            message: "Your bot has been submitted for approval. You'll be notified when it's reviewed.",
            pendingApproval: true,
        });

    } catch (error) {
        console.error("Deploy error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
