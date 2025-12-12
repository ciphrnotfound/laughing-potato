import { NextRequest, NextResponse } from "next/server";
import { workforceQueue } from "@/lib/queues/workforce";

export async function POST(req: NextRequest) {
  const { userId, request } = await req.json();

  if (!request) {
    return NextResponse.json({ success: false, error: "Missing request" }, { status: 400 });
  }

  const job = await workforceQueue.add("run", { userId: userId ?? "anon", request });
  return NextResponse.json({ success: true, jobId: job.id, redirectUrl: `/dashboard/workforce/${job.id}` });
}
