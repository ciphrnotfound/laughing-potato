import { NextRequest, NextResponse } from "next/server";
import { HiveLangRuntime } from "@/lib/hivelang/runtime";

/**
 * POST /api/integrations/test
 * Test a HiveLang integration without saving to database
 */
export async function POST(request: NextRequest) {
    try {
        const { hivelang_code, capability, params, test_credentials } = await request.json();

        if (!hivelang_code || !capability) {
            return NextResponse.json(
                { error: "hivelang_code and capability are required" },
                { status: 400 }
            );
        }

        // Create runtime and load code
        const runtime = new HiveLangRuntime();

        try {
            runtime.loadCode(hivelang_code);
        } catch (error: any) {
            return NextResponse.json({
                success: false,
                error: "Syntax Error",
                message: error.message,
                stage: "compilation"
            }, { status: 400 });
        }

        // Set test context
        runtime.setContext({
            user: {
                id: "test-user",
                email: "test@example.com",
                api_key: test_credentials?.api_key || "test-api-key",
                access_token: test_credentials?.access_token || "test-access-token",
                ...test_credentials,
            },
            integration: {
                id: "test-integration",
                name: "Test Integration",
                slug: "test_integration",
            },
        });

        // Execute capability
        const startTime = Date.now();
        let result: any;
        let success = true;
        let errorMessage: string | null = null;
        let errorStack: string | null = null;

        try {
            result = await runtime.executeCapability(capability, params || {});
        } catch (error: any) {
            success = false;
            errorMessage = error.message;
            errorStack = error.stack;
        }

        const executionTime = Date.now() - startTime;

        if (!success) {
            return NextResponse.json({
                success: false,
                error: "Runtime Error",
                message: errorMessage,
                stack: errorStack,
                execution_time_ms: executionTime,
                stage: "execution"
            }, { status: 200 }); // Still 200 so test UI can show the error
        }

        return NextResponse.json({
            success: true,
            data: result,
            execution_time_ms: executionTime,
            stage: "complete"
        });

    } catch (error: any) {
        console.error("Error in integration test:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Server Error",
                message: error.message,
                stage: "server"
            },
            { status: 500 }
        );
    }
}
