import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';

export async function GET(req: NextRequest) {
    const testEmail = req.nextUrl.searchParams.get('email') || 'test@example.com';

    console.log('[EMAIL TEST] Starting email test...');
    console.log('[EMAIL TEST] RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('[EMAIL TEST] Key prefix:', process.env.RESEND_API_KEY?.substring(0, 10) + '...');

    if (!process.env.RESEND_API_KEY) {
        return NextResponse.json({
            error: 'RESEND_API_KEY not found in environment',
            hint: 'Make sure to restart the server after adding the key to .env.local'
        }, { status: 500 });
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        console.log('[EMAIL TEST] Sending to:', testEmail);

        const result = await resend.emails.send({
            from: 'Bothive <onboarding@resend.dev>',
            to: testEmail,
            subject: '🐝 Test Email from Bothive',
            html: `
                <div style="font-family: -apple-system, sans-serif; background: #000; color: #fff; padding: 40px; text-align: center;">
                    <img src="https://media.giphy.com/media/g9582DNuQppxC/giphy.gif" alt="Celebration" style="width: 120px; height: 120px; margin-bottom: 20px; border-radius: 16px;" />
                    <h1 style="color: #fff; margin-bottom: 8px;">Email Test Successful! 🎉</h1>
                    <p style="color: #a1a1aa;">Your Resend integration is working perfectly.</p>
                    <p style="color: #52525b; font-size: 12px; margin-top: 20px;">Sent at: ${new Date().toISOString()}</p>
                </div>
            `
        });

        console.log('[EMAIL TEST] Result:', result);

        return NextResponse.json({
            success: true,
            message: `Test email sent to ${testEmail}`,
            result
        });
    } catch (error: any) {
        console.error('[EMAIL TEST] Error:', error);
        return NextResponse.json({
            error: error?.message || 'Unknown error',
            details: error
        }, { status: 500 });
    }
}
