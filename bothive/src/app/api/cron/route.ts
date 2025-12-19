import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This route should be protected by a secret key in production
// Calling this endpoint acts as a "Tick" for the Hive Scheduler

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // 1. Fetch all active bots with "on every" triggers
    // We use the JSONB contains operator @> 
    // But since the structure is { cron: [...] }, we need to check if that path exists and is not empty.
    // Simplifying for now: fetch all bots, filter in memory for MVP (assuming <1000 bots)
    // or use a better PostgREST query if possible.

    // Efficient Query: triggers->'cron' is not null and not empty array
    // Supabase JS doesn't support advanced JSON filtering easily in one go without raw SQL or RPC.
    // We'll fetch columns: id, name, triggers

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: bots, error } = await supabase
        .from('bots')
        .select('id, name, triggers, code')
        .not('triggers', 'is', null);

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const scheduledBots = bots?.filter((bot: any) =>
        bot.triggers?.cron &&
        Array.isArray(bot.triggers.cron) &&
        bot.triggers.cron.length > 0
    ) || [];

    console.log(`[Hive Scheduler] Found ${scheduledBots.length} active scheduled bots.`);

    const results = [];

    // 2. Process each bot
    for (const bot of scheduledBots) {
        for (const job of bot.triggers.cron) {
            // Check matching schedule (mocking 'match' for now)
            // In prod: if (cronParser.parseExpression(job.schedule).hasNext() ... )

            console.log(`[Hive Scheduler] ⚡ Triggering ${bot.name} on schedule: "${job.schedule}"`);

            // TODO: actually run the bot code
            // We would call: runHivelang(bot.code, ...)
            results.push({ bot: bot.name, status: "triggered", schedule: job.schedule });
        }
    }

    return NextResponse.json({
        success: true,
        found: scheduledBots.length,
        executed: results,
        timestamp: new Date().toISOString()
    });
}
