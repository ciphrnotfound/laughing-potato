import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/billing/usage/track - Track usage for billing
 */
export async function POST(req: NextRequest) {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { eventType, quantity = 1, metadata = {} } = body;

        if (!eventType) {
            return NextResponse.json(
                { error: "eventType required" },
                { status: 400 }
            );
        }

        // Track usage event
        const { data, error } = await supabase
            .from('usage_events')
            .insert({
                user_id: session.user.id,
                event_type: eventType,
                quantity,
                metadata,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Check usage limits
        const { data: usage } = await supabase
            .from('usage_events')
            .select('quantity')
            .eq('user_id', session.user.id)
            .eq('event_type', eventType)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        const totalUsage = usage?.reduce((sum, e) => sum + e.quantity, 0) || 0;

        // Get user's plan limits
        const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select('plan_limits')
            .eq('user_id', session.user.id)
            .single();

        const limits = subscription?.plan_limits || {
            bot_executions: 100,
            bots: 5,
            api_calls: 1000,
        };

        const limitKey = `${eventType}s` as keyof typeof limits;
        const limit = limits[limitKey] || Infinity;
        const remaining = Math.max(0, limit - totalUsage);

        return NextResponse.json({
            success: true,
            event: data,
            usage: {
                type: eventType,
                current: totalUsage,
                limit,
                remaining,
                percentage: limit > 0 ? (totalUsage / limit) * 100 : 0,
            },
        });
    } catch (error: any) {
        console.error('Usage tracking error:', error);
        return NextResponse.json(
            { error: error.message || "Failed to track usage" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/billing/usage/track - Get usage statistics
 */
export async function GET(req: NextRequest) {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: usage } = await supabase
            .from('usage_events')
            .select('event_type, quantity, created_at')
            .eq('user_id', session.user.id)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        // Aggregate by event type
        const aggregated: Record<string, number> = {};
        usage?.forEach(event => {
            aggregated[event.event_type] = (aggregated[event.event_type] || 0) + event.quantity;
        });

        return NextResponse.json({
            usage: aggregated,
            period: '30d',
        });
    } catch (error: any) {
        console.error('Usage fetch error:', error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch usage" },
            { status: 500 }
        );
    }
}
