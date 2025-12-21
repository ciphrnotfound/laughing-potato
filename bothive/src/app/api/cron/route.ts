import { NextResponse } from 'next/server';
import { pulseEngine } from '@/lib/swarm/pulse-engine';

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    await pulseEngine.pulse();

    return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString()
    });
}
