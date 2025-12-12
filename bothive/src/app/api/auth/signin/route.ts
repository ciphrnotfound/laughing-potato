import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/auth/signin - Sign in with email/password or OAuth
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, provider } = body;

        // OAuth sign in
        if (provider) {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${req.nextUrl.origin}/auth/callback`,
                }
            });

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }

            return NextResponse.json({ url: data.url });
        }

        // Email/password sign in
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password required" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }

        return NextResponse.json({
            user: data.user,
            session: data.session,
        });
    } catch (error: any) {
        console.error('Sign in error:', error);
        return NextResponse.json(
            { error: error.message || "Authentication failed" },
            { status: 500 }
        );
    }
}
