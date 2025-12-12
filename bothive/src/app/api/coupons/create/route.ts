import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        // 1. Init Supabase with Service Role Key (Bypasses RLS)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        // 2. Parse Body
        const { code, discount_percent } = await req.json();

        if (!code || !discount_percent) {
            return NextResponse.json({ error: 'Missing code or discount' }, { status: 400 });
        }

        // 3. Create Coupon
        const { data, error } = await supabaseAdmin
            .from('coupons')
            .insert({
                code: code.toUpperCase(),
                discount_percent: discount_percent,
                is_active: true
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase Insert Error:", error);
            // Handle constraint violation (duplicate code)
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });
            }
            throw error;
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error creating coupon:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
