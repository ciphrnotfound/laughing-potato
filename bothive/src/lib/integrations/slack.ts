import type { ConnectedAccount } from "@/lib/connected-accounts";

export interface SendSlackMessageArgs {
    account: ConnectedAccount;
    channel: string;
    text: string;
    threadTs?: string;
}

export interface SendSlackMessageResult {
    channel: string;
    ts: string;
    permalink?: string;
}

function extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    try {
        return JSON.stringify(error);
    } catch {
        return "Unknown error";
    }
}

export async function sendSlackMessage({ account, channel, text, threadTs }: SendSlackMessageArgs): Promise<SendSlackMessageResult> {
    if (!account.accessToken) {
        throw new Error("Slack account is missing an access token");
    }

    const response = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${account.accessToken}`,
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ channel, text, thread_ts: threadTs }),
    });

    let payload: { ok?: boolean; error?: string; channel?: string; ts?: string; message?: { permalink?: string } };

    try {
        payload = (await response.json()) as typeof payload;
    } catch (error) {
        throw new Error(`Slack publish failed: ${extractErrorMessage(error)}`);
    }

    if (!payload.ok) {
        throw new Error(`Slack publish failed: ${payload.error ?? "unknown_error"}`);
    }

    if (!payload.channel || !payload.ts) {
        throw new Error("Slack publish succeeded but no timestamp/channel returned");
    }

    return {
        channel: payload.channel,
        ts: payload.ts,
        permalink: payload.message?.permalink,
    } satisfies SendSlackMessageResult;
}
