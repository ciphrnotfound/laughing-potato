
import { NextRequest, NextResponse } from "next/server";
import { EmailService } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

        // Generate 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Generate HMAC token
        // Token = expiresAt + ":" + HMAC(secret, email + code + expiresAt)
        const secret = process.env.SUPABASE_SERVICE_ROLE_KEY!; // good secret
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

        const data = `${email}:${code}:${expiresAt}`;
        const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
        const token = `${expiresAt}:${signature}`;

        // Send email
        await EmailService.sendOtpEmail(email, code);

        return NextResponse.json({ success: true, token });
    } catch (e: any) {
        console.error("OTP Send Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
