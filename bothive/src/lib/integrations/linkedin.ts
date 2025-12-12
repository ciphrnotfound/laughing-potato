import type { ConnectedAccount } from "@/lib/connected-accounts";

export interface PublishLinkedInPostArgs {
    account: ConnectedAccount;
    text: string;
}

export interface PublishLinkedInPostResult {
    externalId: string;
    url: string;
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

export async function publishLinkedInPost({ account, text }: PublishLinkedInPostArgs): Promise<PublishLinkedInPostResult> {
    if (!account.accessToken) {
        throw new Error("LinkedIn account is missing an access token");
    }

    const authorUrn = (account.metadata?.authorUrn as string | undefined) ?? account.metadata?.urn?.toString();
    if (!authorUrn) {
        throw new Error("LinkedIn account needs an author URN (company or member)");
    }

    const payload = {
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
            "com.linkedin.ugc.ShareContent": {
                shareCommentary: { text },
                shareMediaCategory: "NONE",
            },
        },
        visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
    };

    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${account.accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        let detail = `${response.status} ${response.statusText}`;
        try {
            const data = (await response.json()) as { message?: string };
            if (data?.message) {
                detail = data.message;
            }
        } catch (error) {
            detail = extractErrorMessage(error);
        }

        throw new Error(`LinkedIn publish failed: ${detail}`);
    }

    const postUrn = response.headers.get("x-restli-id") ?? (await response.text());

    if (!postUrn) {
        throw new Error("LinkedIn publish succeeded but no post URN was returned");
    }

    return {
        externalId: postUrn,
        url: `https://www.linkedin.com/feed/update/${encodeURIComponent(postUrn)}`,
    } satisfies PublishLinkedInPostResult;
}
