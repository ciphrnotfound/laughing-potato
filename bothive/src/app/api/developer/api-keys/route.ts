import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

// GET /api/developer/api-keys - List user's API keys
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: "", ...options });
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const { data: apiKeys, error } = await supabase
            .from("api_keys")
            .select("id, label, key, last_used_at, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching API keys:", error);
            return NextResponse.json(
                { error: "Failed to fetch API keys" },
                { status: 500 }
            );
        }

        // Mask keys for security (only show first 8 and last 4 chars)
        const maskedKeys = (apiKeys || []).map(k => ({
            ...k,
            key: `${k.key.substring(0, 8)}...${k.key.slice(-4)}`
        }));

        return NextResponse.json({ apiKeys: maskedKeys });

    } catch (error: any) {
        console.error("Error in GET /api/developer/api-keys:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/developer/api-keys - Create a new API key
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { label } = body;

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: "", ...options });
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Generate a secure API key
        const apiKey = `bh_${randomBytes(32).toString("hex")}`;

        const { data: newKey, error } = await supabase
            .from("api_keys")
            .insert({
                user_id: user.id,
                key: apiKey,
                label: label || "CLI Key",
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating API key:", error);
            return NextResponse.json(
                { error: "Failed to create API key" },
                { status: 500 }
            );
        }

        // Return the full key only on creation (never again)
        return NextResponse.json({
            success: true,
            apiKey: {
                id: newKey.id,
                key: apiKey, // Full key shown only once
                label: newKey.label,
                created_at: newKey.created_at,
            },
            message: "Save this key now - you won't be able to see it again!"
        });

    } catch (error: any) {
        console.error("Error in POST /api/developer/api-keys:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/developer/api-keys - Delete an API key
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const keyId = searchParams.get("id");

        if (!keyId) {
            return NextResponse.json(
                { error: "Key ID is required" },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: "", ...options });
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const { error } = await supabase
            .from("api_keys")
            .delete()
            .eq("id", keyId)
            .eq("user_id", user.id);

        if (error) {
            console.error("Error deleting API key:", error);
            return NextResponse.json(
                { error: "Failed to delete API key" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error in DELETE /api/developer/api-keys:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
