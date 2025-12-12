import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { HiveLangRuntime, integrationCache } from "@/lib/hivelang/runtime";

/**
 * POST /api/integrations/execute
 * Execute a HiveLang integration capability
 */
export async function POST(request: NextRequest) {
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

        // Authenticate user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse request
        const { integration_slug, capability, params } = await request.json();

        if (!integration_slug || !capability) {
            return NextResponse.json(
                { error: "integration_slug and capability are required" },
                { status: 400 }
            );
        }

        // Get integration from database
        const { data: integration, error: integrationError } = await supabase
            .from("integrations")
            .select("id, name, slug, hivelang_code, capabilities")
            .eq("slug", integration_slug)
            .single();

        if (integrationError || !integration) {
            return NextResponse.json(
                { error: "Integration not found" },
                { status: 404 }
            );
        }

        // Check if HiveLang code exists
        if (!integration.hivelang_code) {
            return NextResponse.json(
                { error: "This integration does not use HiveLang. Use the standard API endpoints instead." },
                { status: 400 }
            );
        }

        // Get user's credentials for this integration
        const { data: userIntegration } = await supabase
            .from("user_integrations")
            .select("*")
            .eq("user_id", user.id)
            .eq("integration_id", integration.id)
            .single();

        if (!userIntegration || userIntegration.status !== 'active') {
            return NextResponse.json(
                { error: `Please connect ${integration.name} first` },
                { status: 403 }
            );
        }

        // Get or create runtime from cache
        let runtime = integrationCache.get(integration.id);
        if (!runtime) {
            runtime = new HiveLangRuntime();
            runtime.loadCode(integration.hivelang_code);
            integrationCache.set(integration.id, runtime);
        }

        // Create runtime context
        const context = {
            user: {
                id: user.id,
                email: user.email,
            },
            credentials: {
                access_token: userIntegration.access_token,
                refresh_token: userIntegration.refresh_token,
                ...userIntegration.additional_config,
            },
            config: userIntegration.additional_config,
            integration: {
                id: integration.id,
                name: integration.name,
                slug: integration.slug,
            },
        };

        // Set runtime context
        runtime.setContext(context);

        // Execute capability
        const startTime = Date.now();
        let result: any;
        let success = true;
        let errorMessage: string | null = null;

        try {
            result = await runtime.executeCapability(capability, params || {});
        } catch (error: any) {
            success = false;
            errorMessage = error.message;
            console.error("Integration execution error:", error);
        }

        const responseTime = Date.now() - startTime;

        // Log integration call
        await supabase.from("integration_calls").insert({
            user_id: user.id,
            integration_id: integration.id,
            capability_name: capability,
            input_params: params || {},
            success: success,
            response_time_ms: responseTime,
            error_message: errorMessage,
            response_data: success ? result : null,
        });

        // Update usage count
        await supabase.rpc('increment_integration_usage', {
            integration_id: integration.id
        });

        if (!success) {
            return NextResponse.json(
                { error: errorMessage || "Integration execution failed" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result,
            execution_time_ms: responseTime,
        });

    } catch (error: any) {
        console.error("Error in integration execution:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
