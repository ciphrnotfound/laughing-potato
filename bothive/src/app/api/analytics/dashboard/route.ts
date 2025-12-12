import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/analytics/dashboard - Get analytics dashboard data
 */
export async function GET(req: NextRequest) {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Get bot statistics
        const { data: bots } = await supabase
            .from('bots')
            .select('id, deployment_status, total_runs, created_at')
            .eq('user_id', userId);

        // Get execution statistics
        const { data: executions } = await supabase
            .from('bot_executions')
            .select('status, execution_time_ms, created_at')
            .eq('user_id', userId)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        // Get gamification data
        const { data: gamification } = await supabase
            .from('user_gamification')
            .select('*')
            .eq('user_id', userId)
            .single();

        // Calculate metrics
        const totalBots = bots?.length || 0;
        const activeBots = bots?.filter(b => b.deployment_status === 'active').length || 0;
        const totalRuns = bots?.reduce((sum, b) => sum + (b.total_runs || 0), 0) || 0;

        const recentExecutions = executions || [];
        const successfulRuns = recentExecutions.filter(e => e.status === 'completed').length;
        const failedRuns = recentExecutions.filter(e => e.status === 'failed').length;
        const successRate = recentExecutions.length > 0
            ? (successfulRuns / recentExecutions.length) * 100
            : 0;

        const avgExecutionTime = recentExecutions.length > 0
            ? recentExecutions.reduce((sum, e) => sum + (e.execution_time_ms || 0), 0) / recentExecutions.length
            : 0;

        // Group executions by date for  chart data
        const executionsByDate: Record<string, number> = {};
        recentExecutions.forEach(exec => {
            const date = new Date(exec.created_at).toISOString().split('T')[0];
            executionsByDate[date] = (executionsByDate[date] || 0) + 1;
        });

        const chartData = Object.entries(executionsByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({
                date,
                executions: count,
            }));

        return NextResponse.json({
            overview: {
                totalBots,
                activeBots,
                totalRuns,
                successRate: Math.round(successRate),
                avgExecutionTime: Math.round(avgExecutionTime),
            },
            executions: {
                total: recentExecutions.length,
                successful: successfulRuns,
                failed: failedRuns,
                chartData,
            },
            gamification: gamification || {
                level: 1,
                xp: 0,
                total_xp: 0,
                streak_days: 0,
            },
            bots: bots || [],
        });
    } catch (error: any) {
        console.error('Analytics error:', error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}
