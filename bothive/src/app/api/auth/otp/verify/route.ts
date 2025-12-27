
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const { email, code, token, name } = await req.json();

        if (!email || !code || !token) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Verify token format
        const parts = token.split(':');
        if (parts.length !== 2) return NextResponse.json({ error: "Invalid token" }, { status: 400 });

        const [expiresAtStr, signature] = parts;
        const expiresAt = parseInt(expiresAtStr);

        if (Date.now() > expiresAt) {
            return NextResponse.json({ error: "Code expired" }, { status: 400 });
        }

        // Verify signature
        const secret = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const data = `${email}:${code}:${expiresAt}`;
        const expectedSignature = crypto.createHmac('sha256', secret).update(data).digest('hex');

        if (signature !== expectedSignature) {
            return NextResponse.json({ error: "Invalid code" }, { status: 400 });
        }

        // Code is valid! Proceed to login/signup.

        // Check if user exists (by email)
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        // Note: listUsers() might be paginated but for now assume small scale or use getUserByEmail if available?
        // admin.listUsers() is not ideal for large userbase. but getUserByEmail is not exposed?
        // Ah, supabaseAdmin.auth.admin.getUserByEmail doesn't exist? It does not.
        // But we can filter listUsers? No.
        // Wait, createUser will fail if exists. Or we can just try generateLink directly!
        // If user doesn't exist, generateLink might fail or create it? 
        // Docs: generateLink does NOT create user.

        // So we MUST ensure user exists.
        // Optimistic: Try to create, ignore "already exists" error.

        const { error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: { full_name: name }
        });

        // Ignore error if it is "User already registered" (approximate check)
        // Actually, if error, we proceed to generate link (assuming user exists).

        // Generate Session Link to log them in
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: email
        });

        if (linkError) {
            console.error("GenerateLink Error:", linkError);
            throw linkError;
        }

        console.log("GenerateLink Properties:", linkData?.properties);

        const { properties: { action_link } } = linkData;

        // Parse action_link to get the hash
        const urlObj = new URL(action_link);
        const urlParams = urlObj.searchParams;
        const tokenHash = urlParams.get('token_hash') || urlParams.get('token');

        console.log("Extracted TokenHash:", tokenHash ? "FOUND" : "MISSING", "ActionLink:", action_link);

        if (!tokenHash) {
            console.error("CRITICAL: No token hash found in magic link!");
            return NextResponse.json({ error: "Could not generate login token" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            tokenHash,
            type: 'email'
        });

    } catch (e: any) {
        console.error("OTP Verify Error:", e);
        return NextResponse.json({ error: e.message || "Verification failed" }, { status: 500 });
    }
}
