import { NextRequest } from "next/server";
import { getWorkforceStatus } from "@/lib/workforce/status";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    const searchParams = new URL(req.url).searchParams;
    const id = searchParams.get("id");

    if (!id) {
        return new Response("Missing id", { status: 400 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            let cancelled = false;
            let interval: NodeJS.Timeout;

            const send = async () => {
                try {
                    const status = await getWorkforceStatus(id);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(status)}\n\n`));

                    if (!status.success || status.status === "completed" || status.status === "failed") {
                        clearInterval(interval);
                        controller.close();
                    }
                } catch (error) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ success: false, error: "stream_error" })}\n\n`));
                    clearInterval(interval);
                    controller.close();
                }
            };

            void send();
            interval = setInterval(() => {
                if (!cancelled) {
                    void send();
                }
            }, 2000);
        },
        cancel() {},
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}
