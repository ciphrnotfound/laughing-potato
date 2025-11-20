import type { ConnectedAccount } from "@/lib/connected-accounts";

export interface CreateNotionPageArgs {
  account: ConnectedAccount;
  databaseId: string;
  title: string;
  properties?: Record<string, unknown>;
  children?: unknown[];
}

export interface CreateNotionPageResult {
  id: string;
  url: string;
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

export async function createNotionPage({
  account,
  databaseId,
  title,
  properties,
  children,
}: CreateNotionPageArgs): Promise<CreateNotionPageResult> {
  if (!account.accessToken) {
    throw new Error("Notion account is missing an integration token");
  }

  const mergedProperties = properties ?? {};

  if (!mergedProperties.Title && !mergedProperties.Name) {
    mergedProperties.Title = {
      title: [
        {
          type: "text",
          text: { content: title },
        },
      ],
    };
  }

  const payload = {
    parent: { database_id: databaseId },
    properties: mergedProperties,
    children,
  };

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${account.accessToken}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const data = (await response.json()) as { message?: string };
      if (data?.message) detail = data.message;
    } catch (error) {
      detail = extractErrorMessage(error);
    }

    throw new Error(`Notion page creation failed: ${detail}`);
  }

  const data = (await response.json()) as { id?: string; url?: string };

  if (!data.id || !data.url) {
    throw new Error("Notion page creation succeeded but missing id or url");
  }

  return {
    id: data.id,
    url: data.url,
  } satisfies CreateNotionPageResult;
}
