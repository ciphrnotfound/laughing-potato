import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/email';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // 1. Add to waitlist table (assuming it exists, or just send email for now)
        // For now, we'll just send the email and log it.
        // In a real app, you'd insert into a 'waitlist' table in Supabase.

        console.log(`[WAITLIST] New join request: ${email}`);

        // try {
        //   await supabase.from('waitlist').insert([{ email, joined_at: new Date().toISOString() }]);
        // } catch (dbError) {
        //   console.error('[WAITLIST] DB Error:', dbError);
        //   // Continue anyway to send email if DB fails but email works
        // }

        // 2. Send the confirmation email
        await EmailService.sendWaitlistEmail(email);

        return NextResponse.json({ success: true, message: 'Joined waitlist successfully' });
    } catch (error: any) {
        console.error('[WAITLIST] API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
