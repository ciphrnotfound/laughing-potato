import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { EmailService } from "@/lib/email";

// POST /api/bots/[botId]/deploy - Deploy a bot (make it public)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ botId: string }> }
) {
    try {
        const { botId } = await params;

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: "", ...options });
                    },
                },
            }
        );

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Verify bot ownership
        const { data: bot, error: botError } = await supabase
            .from("bots")
            .select("*")
            .eq("id", botId)
            .eq("user_id", user.id)
            .single();

        if (botError || !bot) {
            return NextResponse.json(
                { error: "Bot not found or access denied" },
                { status: 404 }
            );
        }

        // Update bot to be public/deployed
        const { data: updatedBot, error: updateError } = await supabase
            .from("bots")
            .update({
                is_public: true,
                deployed_at: new Date().toISOString()
            })
            .eq("id", botId)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json(
                { error: "Failed to deploy bot" },
                { status: 500 }
            );
        }


        // Send deployment notification
        await EmailService.sendDeployNotification(user.email || 'user@example.com', updatedBot.name);

        return NextResponse.json({
            success: true,
            bot: updatedBot,
            widgetUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/widget/${botId}`,
            apiEndpoint: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/bots/${botId}/run`,
        });

    } catch (error: any) {
        console.error("Error in POST /api/bots/[botId]/deploy:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/bots/[botId]/deploy - Undeploy a bot (make it private)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ botId: string }> }
) {
    try {
        const { botId } = await params;

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: "", ...options });
                    },
                },
            }
        );

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Update bot to be private
        const { data: updatedBot, error: updateError } = await supabase
            .from("bots")
            .update({ is_public: false })
            .eq("id", botId)
            .eq("user_id", user.id)
            .select()
            .single();

        if (updateError || !updatedBot) {
            return NextResponse.json(
                { error: "Bot not found or access denied" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            bot: updatedBot,
        });

    } catch (error: any) {
        console.error("Error in DELETE /api/bots/[botId]/deploy:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
