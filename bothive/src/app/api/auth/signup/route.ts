import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { EmailService } from "@/lib/email";

/**
 * POST /api/auth/signup - Create new user account
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, firstName, lastName } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password required" },
                { status: 400 }
            );
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    full_name: `${firstName || ''} ${lastName || ''}`.trim(),
                }
            }
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // Initialize user profile and gamification  
        if (data.user) {
            // Create user profile
            try {
                await supabase.from('user_profiles').insert({
                    id: data.user.id,
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                });
            } catch (err) {
                console.error('Profile creation failed:', err);
            }

            // Initialize gamification
            try {
                await supabase.from('user_gamification').insert({
                    user_id: data.user.id,
                    level: 1,
                    xp: 0,
                    total_xp: 0,
                    streak_days: 0,
                });
            } catch (err) {
                console.error('Gamification init failed:', err);
            }

            // Send Welcome Email
            await EmailService.sendWelcomeEmail(email, firstName || 'User');
        }

        return NextResponse.json({
            user: data.user,
            session: data.session,
            message: data.user?.identities?.length === 0
                ? "Check your email to confirm your account"
                : "Account created successfully"
        }, { status: 201 });
    } catch (error: any) {
        console.error('Sign up error:', error);
        return NextResponse.json(
            { error: error.message || "Registration failed" },
            { status: 500 }
        );
    }
}
