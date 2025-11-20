import type { ConnectedAccount } from "@/lib/connected-accounts";

export interface CreateIssueArgs {
  account: ConnectedAccount;
  owner: string;
  repo: string;
  title: string;
  body?: string;
  labels?: string[];
}

export interface CreateIssueResult {
  number: number;
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

export async function createIssue({ account, owner, repo, title, body, labels }: CreateIssueArgs): Promise<CreateIssueResult> {
  if (!account.accessToken) {
    throw new Error("GitHub account is missing a personal access token");
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${account.accessToken}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, body, labels }),
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

    throw new Error(`GitHub issue creation failed: ${detail}`);
  }

  const data = (await response.json()) as { number?: number; html_url?: string };

  if (!data.number || !data.html_url) {
    throw new Error("GitHub issue creation succeeded but missing number or URL");
  }

  return {
    number: data.number,
    url: data.html_url,
  } satisfies CreateIssueResult;
}
