import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const code = body.code?.trim().toUpperCase();

        console.log(`[VERIFY] Verifying coupon: '${code}'`);
        
        if (!code) {
            console.log('[VERIFY] No code provided');
            return NextResponse.json({ valid: false, message: 'Code required' });
        }

        // 1. Init Supabase with Service Role Key
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceKey) {
            console.error('[VERIFY] CRITICAL: Service role key missing');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceKey
        );

        // 2. Check Coupon
        const { data, error } = await supabaseAdmin
            .from('coupons')
            .select('code, discount_percent, is_active')
            .eq('code', code)
            .eq('is_active', true)
            .single();

        if (error) {
            console.error(`[VERIFY] Database error for '${code}':`, error.message);
        }

        if (error || !data) {
            console.log(`[VERIFY] Invalid or expired: '${code}'`);
            return NextResponse.json({ valid: false, message: 'Invalid or expired coupon' });
        }

        console.log(`[VERIFY] Success: '${code}' - ${data.discount_percent}%`);

        return NextResponse.json({
            valid: true,
            discount_percent: data.discount_percent,
            code: data.code
        });
    } catch (error) {
        console.error('[VERIFY] Internal Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
