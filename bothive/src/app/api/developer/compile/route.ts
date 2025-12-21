import { NextRequest, NextResponse } from "next/server";
import { validateHiveLangProgram } from "@/lib/agents/hivelang-executor";

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ valid: false, errors: ["No code provided"] }, { status: 400 });
        }

        // Available tools can be empty for basic syntax validation
        const result = await validateHiveLangProgram(code, []);

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({
            valid: false,
            errors: [error.message || "Internal Server Error"],
            warnings: []
        }, { status: 500 });
    }
}
