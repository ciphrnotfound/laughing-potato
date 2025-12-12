import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { EncryptionService } from "@/lib/encryption";

/**
 * POST /api/hivetools/install - Install a HiveTool for the user
 */
export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: '', ...options })
                    },
                },
            }
        );

        // Get user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        const allCookies = cookieStore.getAll();
        const supabaseCookies = allCookies.filter(c => c.name.includes('sb-'));

        console.log('=== Install API Debug ===');
        console.log('Total cookies:', allCookies.length);
        console.log('All cookie names:', allCookies.map(c => c.name));
        console.log('Supabase cookies:', supabaseCookies.map(c => ({ name: c.name, valueLength: c.value?.length })));
        console.log('Has session:', !!session);
        console.log('User ID:', session?.user?.id);
        console.log('Session error:', sessionError);
        console.log('Access token (first 50 chars):', session?.access_token?.substring(0, 50));
        console.log('========================');

        if (!session) {
            return NextResponse.json({
                error: "Unauthorized",
                debug: {
                    sessionError,
                    cookieCount: allCookies.length,
                    hasSupabaseCookies: supabaseCookies.length > 0,
                    supabaseCookieNames: supabaseCookies.map(c => c.name)
                }
            }, { status: 401 });
        }

        const body = await req.json();
        const { toolName, credentials } = body;

        if (!toolName) {
            return NextResponse.json({ error: "Tool name is required" }, { status: 400 });
        }

        // Generate user encryption key (in production, derive from user's password)
        const salt = EncryptionService.generateSalt();
        const userKey = EncryptionService.generateUserKey(session.user.id, salt);

        // Encrypt credentials
        const encryptedCredentials = EncryptionService.encryptObject(credentials, userKey);

        // Store installation
        const { data: installation, error } = await supabase
            .from('user_tool_installations')
            .upsert({
                user_id: session.user.id,
                tool_name: toolName,
                encrypted_credentials: encryptedCredentials.encrypted,
                credentials_iv: encryptedCredentials.iv,
                credentials_auth_tag: encryptedCredentials.authTag,
                salt,
                installed_at: new Date().toISOString(),
                is_active: true,
            }, {
                onConflict: 'user_id,tool_name'
            })
            .select()
            .single();

        if (error) {
            console.error('Installation error:', error);
            return NextResponse.json({ error: "Failed to install tool" }, { status: 500 });
        }

        // Increment download count
        await supabase.rpc('increment_tool_downloads', { tool_name: toolName });

        return NextResponse.json({
            success: true,
            installation: {
                id: installation.id,
                toolName,
                installedAt: installation.installed_at,
            },
        });
    } catch (error: any) {
        console.error('Installation API error:', error);
        return NextResponse.json(
            { error: error.message || "Installation failed" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/hivetools/install - Get user's installed tools
 */
export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: '', ...options })
                    },
                },
            }
        );

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: installations, error } = await supabase
            .from('user_tool_installations')
            .select('id, tool_name, installed_at, is_active')
            .eq('user_id', session.user.id)
            .order('installed_at', { ascending: false });

        if (error) {
            console.error('Fetch installations error:', error);
            return NextResponse.json({ error: "Failed to fetch installations" }, { status: 500 });
        }

        return NextResponse.json({
            installations: installations || [],
        });
    } catch (error: any) {
        console.error('Get installations API error:', error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch installations" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/hivetools/install - Uninstall a HiveTool
 */
export async function DELETE(req: NextRequest) {
    try {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: '', ...options })
                    },
                },
            }
        );

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { toolName } = body;

        if (!toolName) {
            return NextResponse.json({ error: "Tool name is required" }, { status: 400 });
        }

        const { error } = await supabase
            .from('user_tool_installations')
            .delete()
            .eq('user_id', session.user.id)
            .eq('tool_name', toolName);

        if (error) {
            console.error('Uninstall error:', error);
            return NextResponse.json({ error: "Failed to uninstall tool" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "Tool uninstalled successfully",
        });
    } catch (error: any) {
        console.error('Uninstall API error:', error);
        return NextResponse.json(
            { error: error.message || "Uninstall failed" },
            { status: 500 }
        );
    }
}
