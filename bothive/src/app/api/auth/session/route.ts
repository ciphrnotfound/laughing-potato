import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/auth/session - Check current session
 */
export async function GET(req: NextRequest) {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
            return NextResponse.json({
                authenticated: false,
                user: null
            });
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                id: session.user.id,
                email: session.user.email,
                user_metadata: session.user.user_metadata,
            },
            session: {
                access_token: session.access_token,
                expires_at: session.expires_at,
            }
        });
    } catch (error: any) {
        console.error('Session check error:', error);
        return NextResponse.json({
            authenticated: false,
            user: null,
            error: error.message
        }, { status: 500 });
    }
}

/**
 * DELETE /api/auth/session - Sign out
 */
export async function DELETE(req: NextRequest) {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        return NextResponse.json({ message: "Signed out successfully" });
    } catch (error: any) {
        console.error('Sign out error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
