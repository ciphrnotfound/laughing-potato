import { NextRequest, NextResponse } from "next/server";
import { getWorkforceStatus } from "@/lib/workforce/status";

export async function GET(req: NextRequest) {
    const searchParams = new URL(req.url).searchParams;
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
    }

    const statusResponse = await getWorkforceStatus(id);
    if (!statusResponse.success) {
        return NextResponse.json(statusResponse, { status: 404 });
    }

    return NextResponse.json(statusResponse);
}
