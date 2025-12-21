import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    try {
        // Check Supabase connection
        const { error } = await supabase.from('users').select('id').limit(1)

        if (error) throw error

        return NextResponse.json(
            {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                services: {
                    database: 'connected',
                }
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error('Health check failed:', error)
        return NextResponse.json(
            {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            },
            { status: 503 }
        )
    }
}
