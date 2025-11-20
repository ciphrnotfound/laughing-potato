import type { ConnectedAccount } from "@/lib/connected-accounts";

export interface PublishTweetArgs {
  account: ConnectedAccount;
  text: string;
}

export interface PublishTweetResult {
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

export async function publishTweet({ account, text }: PublishTweetArgs): Promise<PublishTweetResult> {
  if (!account.accessToken) {
    throw new Error("Twitter account is missing an access token");
  }

  const response = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${account.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const data = (await response.json()) as { errors?: Array<{ detail?: string }> };
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        detail = data.errors.map((item) => item.detail ?? detail).join("; ");
      }
    } catch (error) {
      detail = extractErrorMessage(error);
    }

    throw new Error(`Twitter publish failed: ${detail}`);
  }

  const data = (await response.json()) as { data?: { id?: string } };
  const id = data?.data?.id;

  if (!id) {
    throw new Error("Twitter publish succeeded but no tweet id was returned");
  }

  return {
    externalId: id,
    url: `https://x.com/i/web/status/${id}`,
  } satisfies PublishTweetResult;
}
