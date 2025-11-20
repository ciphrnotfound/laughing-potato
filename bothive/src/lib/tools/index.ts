import { ToolDescriptor } from "@/lib/agentTypes";
import { calendarTools } from "./calendar";
import { tasksStorage, AutomationTask } from "@/lib/storage";
import { randomUUID } from "crypto";
import OpenAI from "openai";
import { getConnectedAccount } from "@/lib/connected-accounts";
import { createSocialPost, updateSocialPostStatus } from "@/lib/social-posts";
import { publishTweet } from "@/lib/integrations/twitter";
import { publishLinkedInPost } from "@/lib/integrations/linkedin";
import { sendSlackMessage } from "@/lib/integrations/slack";
import { createIssue } from "@/lib/integrations/github";
import { createNotionPage } from "@/lib/integrations/notion";

const groqClient =
  process.env.GROQ_API_KEY
    ? new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: process.env.GROQ_API_URL ?? "https://api.groq.com/openai/v1",
      })
    : null;

const GROQ_MODEL_CANDIDATES = ["openai/gpt-oss-20b"];

async function runGrokCommand(prompt: string, models: string | string[] = GROQ_MODEL_CANDIDATES) {
  if (!groqClient) {
    throw new Error("Missing GROQ_API_KEY environment variable. Add it to .env.local to enable Groq tools.");
  }

  const modelCandidates = Array.isArray(models) ? models : [models];
  let lastError: unknown = null;

  for (const candidate of modelCandidates) {
    try {
      const response = await groqClient.responses.create({
        model: candidate,
        input: prompt,
      });

      const text =
        (response as { output_text?: string }).output_text ??
        response.output
          ?.map((item) =>
            "content" in item
              ? item.content
                  ?.map((contentItem) => ("text" in contentItem && contentItem.text ? contentItem.text : ""))
                  .join("\n") ?? ""
              : ""
          )
          .join("\n") ?? "";

      if (text.trim()) {
        return text.trim();
      }
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const isPermission = message.includes("401") || message.includes("403") || message.toLowerCase().includes("permission");
      const isNotFound = message.includes("404") || message.toLowerCase().includes("not found");
      const isLimit = message.includes("429");
      if (isPermission || isNotFound || isLimit) {
        continue;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Grok models unavailable. Verify key access or adjust model list.");
}

export const integrationTools: ToolDescriptor[] = [
  {
    name: "integrations.firebase.read",
    capability: "integrations.firebase.read",
    description: "Read tenant-scoped data using the configured Firebase adapter.",
    async run(args, ctx) {
      const adapter = ctx.tenant?.firebase;
      if (!adapter) {
        return { success: false, output: "No tenant Firebase adapter configured for this run." };
      }

      const payload = (args ?? {}) as Record<string, unknown>;
      const collection = typeof payload.collection === "string" ? payload.collection : undefined;
      const document = typeof payload.document === "string" ? payload.document : undefined;
      const query = payload.query && typeof payload.query === "object" ? (payload.query as Record<string, unknown>) : undefined;
      const options = payload.options && typeof payload.options === "object" ? (payload.options as Record<string, unknown>) : undefined;

      try {
        let result: unknown;

        if (document && adapter.getDocument) {
          result = await adapter.getDocument(document, options);
        } else if (collection && adapter.getCollection) {
          result = await adapter.getCollection(collection, options);
        } else if (query && adapter.runQuery) {
          result = await adapter.runQuery(query);
        } else {
          return {
            success: false,
            output: "Provide a document path, collection path, or query compatible with the tenant adapter.",
          };
        }

        const output = typeof result === "string" ? result : JSON.stringify(result ?? null, null, 2);
        return { success: true, output, data: result };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown Firebase read error.";
        return { success: false, output: message };
      }
    },
  },
  {
    name: "integrations.firebase.write",
    capability: "integrations.firebase.write",
    description: "Persist tenant data via the configured Firebase adapter.",
    async run(args, ctx) {
      const adapter = ctx.tenant?.firebase;
      if (!adapter?.setDocument) {
        return { success: false, output: "No tenant Firebase write adapter available for this run." };
      }

      const payload = (args ?? {}) as Record<string, unknown>;
      const document = typeof payload.document === "string" ? payload.document : undefined;
      const rawData = payload.data;
      const options = payload.options && typeof payload.options === "object" ? (payload.options as Record<string, unknown>) : undefined;

      if (!document) {
        return { success: false, output: "Document path is required to write to Firebase." };
      }

      if (rawData === undefined) {
        return { success: false, output: "Provide a data payload to persist." };
      }

      let parsedData: unknown = rawData;

      if (typeof rawData === "string") {
        try {
          parsedData = JSON.parse(rawData);
        } catch {
          parsedData = rawData;
        }
      }

      try {
        await adapter.setDocument(document, parsedData, options);
        return {
          success: true,
          output: `Saved document ${document} to tenant Firebase store.`,
          data: { document, data: parsedData },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown Firebase write error.";
        return { success: false, output: message };
      }
    },
  },
  {
    name: "integrations.whatsapp.send",
    capability: "integrations.whatsapp.send",
    description: "Send a WhatsApp message using tenant-provided credentials.",
    async run(args, ctx) {
      const adapter = ctx.tenant?.whatsapp;
      if (!adapter?.sendMessage) {
        return { success: false, output: "No tenant WhatsApp adapter configured for this run." };
      }

      const payload = (args ?? {}) as Record<string, unknown>;
      const to = typeof payload.to === "string" ? payload.to.trim() : "";
      const body = typeof payload.body === "string" ? payload.body : "";
      const mediaUrl = typeof payload.mediaUrl === "string" ? payload.mediaUrl : undefined;
      const template = typeof payload.template === "string" ? payload.template : undefined;
      const variables = payload.variables && typeof payload.variables === "object" ? (payload.variables as Record<string, string>) : undefined;

      if (!to || !body) {
        return { success: false, output: "Both 'to' and 'body' fields are required to send a WhatsApp message." };
      }

      try {
        const result = await adapter.sendMessage({ to, body, mediaUrl, template, variables });
        return {
          success: true,
          output: `Sent WhatsApp message to ${to}.`,
          data: result,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown WhatsApp send error.";
        return { success: false, output: message };
      }
    },
  },
  {
    name: "social.schedule",
    capability: "social.publish",
    description: "Queue a social post for Twitter/X with an optional scheduled time instead of publishing immediately.",
    async run(args, ctx) {
      const platformRaw = typeof args.platform === "string" ? args.platform.toLowerCase().trim() : "";
      const platform = platformRaw === "linkedin" ? "linkedin" : "twitter";
      const content = typeof args.content === "string" ? args.content.trim() : "";
      const scheduledFor = typeof args.scheduledFor === "string" ? args.scheduledFor : null;
      const source = typeof args.source === "string" ? (args.source as "manual" | "trend_bot") : "trend_bot";

      if (!content) {
        return { success: false, output: "Provide content to schedule." };
      }

      const userId = ctx.metadata.userId;
      if (!userId) {
        return {
          success: false,
          output: "Unable to determine user context. Schedule from an authenticated session instead.",
        };
      }

      const record = await createSocialPost({
        userId,
        platform,
        content,
        scheduledFor,
        status: scheduledFor ? "scheduled" : "draft",
        source,
      });

      if (!record) {
        return { success: false, output: "Failed to schedule the social post." };
      }

      return {
        success: true,
        output: scheduledFor
          ? `Queued a ${platform === "twitter" ? "Twitter/X" : "LinkedIn"} post for ${scheduledFor}.`
          : `Saved a draft ${platform === "twitter" ? "Twitter/X" : "LinkedIn"} post for later review.`,
        data: record,
      };
    },
  },
];

export const generalTools: ToolDescriptor[] = [
  {
    name: "general.respond",
    capability: "general.respond",
    description: "Generate a conversational response",
    async run(args, ctx) {
      const prompt = typeof args.prompt === "string" ? args.prompt.trim() : "";
      if (!prompt) {
        return { success: false, output: "Missing prompt" };
      }

      const persona = ctx.metadata?.botSystemPrompt?.trim()
        ? ctx.metadata.botSystemPrompt.trim()
        : "You are a Bothive automation copilot. Introduce yourself as a Bothive-built agent, never as ChatGPT or any other provider.";

      const rawHistory = Array.isArray((args as Record<string, unknown>).history)
        ? ((args as Record<string, unknown>).history as Array<{ role?: string; content?: string }>)
        : [];

      const formattedHistory = rawHistory
        .filter((entry) => typeof entry === "object" && entry !== null && typeof entry.content === "string")
        .map((entry) => {
          const role = entry.role === "assistant" ? "Assistant" : entry.role === "system" ? "System" : "User";
          return `${role}: ${entry.content}`;
        });

      if (formattedHistory.length === 0) {
        formattedHistory.push(`User: ${prompt}`);
      }

      const conversation = formattedHistory.join("\n");
      const finalPrompt = `SYSTEM: ${persona}\nSYSTEM: Stay fully in character as a Bothive agent. Never claim to be ChatGPT or mention external providers.\n\n${conversation}\nAssistant:`;

      const output = await runGrokCommand(finalPrompt);
      await ctx.sharedMemory.append("history", { role: "assistant", output });
      return { success: true, output };
    },
  },
  {
    name: "general.recordTask",
    capability: "general.respond",
    description: "Capture a lightweight task in the shared automation list.",
    async run(args) {
      const title = typeof args.title === "string" && args.title.trim() ? args.title.trim() : "Untitled task";
      const due = typeof args.due === "string" ? args.due : null;
      const task: AutomationTask = {
        id: randomUUID(),
        title,
        status: "open",
        createdAt: new Date().toISOString(),
        dueDate: due,
        metadata: { createdBy: "general.recordTask", originalArgs: args },
      };

      const tasks = await tasksStorage.read();
      tasks.push(task);
      await tasksStorage.write(tasks);

      return {
        success: true,
        output: `Added "${title}" to the automation queue${due ? ` (due ${due})` : ""}. Reference: ${task.id.slice(0, 6)}.`,
        data: task,
      };
    },
  },
  {
    name: "integrations.createGithubIssue",
    capability: "general.respond",
    description: "Create a GitHub issue using the connected account.",
    async run(args, ctx) {
      const userId = ctx.metadata.userId;
      if (!userId) {
        return {
          success: false,
          output: "No workspace user associated with this run. Connect GitHub in settings and retry.",
        };
      }

      const account = await getConnectedAccount(userId, "github");
      if (!account) {
        return { success: false, output: "No GitHub account connected. Link one in settings first." };
      }

      const owner = typeof args.owner === "string" && args.owner.trim() ? args.owner.trim() : (account.metadata?.owner as string | undefined);
      const repo = typeof args.repo === "string" && args.repo.trim() ? args.repo.trim() : (account.metadata?.repo as string | undefined);
      const title = typeof args.title === "string" && args.title.trim() ? args.title.trim() : "";
      const body = typeof args.body === "string" ? args.body : undefined;
      const labels = Array.isArray((args as Record<string, unknown>).labels)
        ? ((args as Record<string, unknown>).labels as unknown[]).map(String)
        : undefined;

      if (!owner || !repo) {
        return {
          success: false,
          output: "Provide both owner and repo, or set defaults in the connected GitHub account metadata.",
        };
      }

      if (!title) {
        return { success: false, output: "Cannot create an issue without a title." };
      }

      try {
        const result = await createIssue({ account, owner, repo, title, body, labels });
        return {
          success: true,
          output: `Created GitHub issue #${result.number}: ${result.url}`,
          data: result,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "GitHub issue creation failed.";
        return { success: false, output: message };
      }
    },
  },
  {
    name: "integrations.createNotionPage",
    capability: "general.respond",
    description: "Create a Notion page in a linked database.",
    async run(args, ctx) {
      const userId = ctx.metadata.userId;
      if (!userId) {
        return {
          success: false,
          output: "No workspace user associated with this run. Connect Notion in settings and retry.",
        };
      }

      const account = await getConnectedAccount(userId, "notion");
      if (!account) {
        return { success: false, output: "No Notion integration connected. Link one in settings first." };
      }

      const databaseId = typeof args.databaseId === "string" && args.databaseId.trim()
        ? args.databaseId.trim()
        : (account.metadata?.databaseId as string | undefined);
      const title = typeof args.title === "string" && args.title.trim() ? args.title.trim() : "Untitled";
      const properties = (args as Record<string, unknown>).properties as Record<string, unknown> | undefined;
      const children = Array.isArray((args as Record<string, unknown>).children)
        ? ((args as Record<string, unknown>).children as unknown[])
        : undefined;

      if (!databaseId) {
        return {
          success: false,
          output: "Provide databaseId or set a default in the Notion connected account metadata.",
        };
      }

      try {
        const result = await createNotionPage({ account, databaseId, title, properties, children });
        return {
          success: true,
          output: `Created Notion page: ${result.url}`,
          data: result,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Notion page creation failed.";
        return { success: false, output: message };
      }
    },
  },
  ...calendarTools,
];

export const crmTools: ToolDescriptor[] = [
  {
    name: "crm.logInteraction",
    capability: "general.respond",
    description: "Log a customer interaction and schedule a follow-up task.",
    async run(args) {
      const contact = typeof args.contact === "string" && args.contact.trim() ? args.contact.trim() : "Unnamed contact";
      const channel = typeof args.channel === "string" && args.channel.trim() ? args.channel.trim() : "email";
      const summary = typeof args.summary === "string" && args.summary.trim() ? args.summary.trim() : "General check-in";
      const followUpInDays = Number(args.followUpInDays ?? 2);

      const due = new Date();
      due.setDate(due.getDate() + (Number.isFinite(followUpInDays) ? followUpInDays : 2));

      const task: AutomationTask = {
        id: randomUUID(),
        title: `Follow up with ${contact}`,
        status: "open",
        createdAt: new Date().toISOString(),
        dueDate: due.toISOString(),
        metadata: {
          createdBy: "crm.logInteraction",
          channel,
          summary,
        },
      };

      const tasks = await tasksStorage.read();
      tasks.push(task);
      await tasksStorage.write(tasks);

      return {
        success: true,
        output: `Logged a ${channel} touchpoint with ${contact}. Summary: ${summary}. Scheduled a follow-up for ${due.toLocaleDateString()}. Reference ${task.id.slice(0, 6)}.`,
        data: task,
      };
    },
  },
  {
    name: "crm.createLead",
    capability: "general.respond",
    description: "Create a lightweight lead record with scoring heuristics.",
    async run(args) {
      const company = typeof args.company === "string" && args.company.trim() ? args.company.trim() : "Unknown Co.";
      const interest = typeof args.interest === "string" && args.interest.trim() ? args.interest.trim() : "general";
      const score = Math.min(100, Math.max(10, Number(args.score ?? 65)));

      const task: AutomationTask = {
        id: randomUUID(),
        title: `Nurture lead: ${company}`,
        status: "open",
        createdAt: new Date().toISOString(),
        metadata: {
          createdBy: "crm.createLead",
          company,
          interest,
          score,
        },
      };

      const tasks = await tasksStorage.read();
      tasks.push(task);
      await tasksStorage.write(tasks);

      return {
        success: true,
        output: `Created a lead for ${company} (score ${score}). Focus area: ${interest}. Added to nurture queue (${task.id.slice(0, 6)}).`,
        data: task,
      };
    },
  },
];

export const messagingTools: ToolDescriptor[] = [
  {
    name: "messaging.fetchFeed",
    capability: "general.respond",
    description: "Collect recent messages from a workspace, channel, or inbox using a synthetic feed.",
    async run(args) {
      const provider = typeof args.provider === "string" && args.provider.trim() ? args.provider.trim() : "slack";
      const channel = typeof args.channel === "string" && args.channel.trim() ? args.channel.trim() : "#general";
      const timeWindow = typeof args.timeWindow === "string" && args.timeWindow.trim() ? args.timeWindow.trim() : "last 6 hours";
      const limit = Number.isFinite(Number(args.limit)) ? Math.min(Number(args.limit), 50) : 12;

      const prompt = `Act as an assistant that synthesises message feeds.
Provider: ${provider}
Channel or mailbox: ${channel}
Time window: ${timeWindow}
Return up to ${limit} representative messages in this JSON format (array only):
[
  {
    "id": "unique-id",
    "author": "Display name",
    "timestamp": "ISO timestamp",
    "summary": "short paraphrased message",
    "raw": "original text"
  }
]
Only output JSON.`;

      try {
        const output = await runGrokCommand(prompt, GROQ_MODEL_CANDIDATES);
        return { success: true, output };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to reach language model.";
        return {
          success: false,
          output: `Could not fetch synthetic feed (${message}). Ask the user to provide recent messages manually.`,
        };
      }
    },
  },
  {
    name: "messaging.postSlackMessage",
    capability: "general.respond",
    description: "Send a Slack message via the connected workspace bot.",
    async run(args, ctx) {
      const userId = ctx.metadata.userId;
      if (!userId) {
        return {
          success: false,
          output: "No workspace user associated with this run. Connect Slack in settings and retry.",
        };
      }

      const account = await getConnectedAccount(userId, "slack");
      if (!account) {
        return { success: false, output: "No Slack workspace connected. Link one in settings first." };
      }

      const channel = typeof args.channel === "string" && args.channel.trim()
        ? args.channel.trim()
        : (account.metadata?.defaultChannel as string | undefined);
      const text = typeof args.text === "string" && args.text.trim() ? args.text.trim() : "";
      const threadTs = typeof args.threadTs === "string" && args.threadTs.trim() ? args.threadTs.trim() : undefined;

      if (!channel) {
        return {
          success: false,
          output: "Provide a Slack channel (e.g. C123) or set a default in the connected account metadata.",
        };
      }

      if (!text) {
        return { success: false, output: "Cannot send an empty Slack message." };
      }

      try {
        const result = await sendSlackMessage({ account, channel, text, threadTs });
        const link = result.permalink ?? `https://slack.com/app_redirect?channel=${result.channel}&message=${result.ts}`;
        return {
          success: true,
          output: `Posted to Slack channel ${result.channel}. Link: ${link}`,
          data: result,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Slack message failed.";
        return { success: false, output: message };
      }
    },
  },
  {
    name: "messaging.filterImportant",
    capability: "general.respond",
    description: "Score and extract high-priority messages based on custom criteria.",
    async run(args) {
      const messages = typeof args.messages === "string" ? args.messages : JSON.stringify(args.messages ?? []);
      const criteria = typeof args.criteria === "string" && args.criteria.trim() ? args.criteria.trim() : "customer urgency, executives, blockers";
      const prompt = `You triage inboxes. Analyse the following messages and return only the important ones.

Messages JSON:
${messages}

Importance criteria: ${criteria}

Respond as JSON only:
{
  "important": [
    {
      "id": "same id",
      "reason": "why flagged",
      "suggestedAction": "next step"
    }
  ],
  "summary": "one paragraph overview"
}`;

      try {
        const output = await runGrokCommand(prompt, GROQ_MODEL_CANDIDATES);
        return { success: true, output };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to reach language model.";
        return {
          success: false,
          output: `Could not triage automatically (${message}). Share the criteria and let the user mark items manually.`,
        };
      }
    },
  },
  {
    name: "messaging.routeSummary",
    capability: "general.respond",
    description: "Summarise important threads and produce follow-up tasks for specific stakeholders.",
    async run(args) {
      const audience = typeof args.audience === "string" && args.audience.trim() ? args.audience.trim() : "team leads";
      const format = typeof args.format === "string" && args.format.trim() ? args.format.trim() : "markdown bullet list";
      const important = typeof args.important === "string" ? args.important : JSON.stringify(args.important ?? []);

      const prompt = `You prepare concise briefings from selected messages.

Audience: ${audience}
Preferred format: ${format}
Messages JSON:
${important}

Return JSON only:
{
  "summary": "formatted summary for the audience",
  "tasks": [
    { "owner": "assignee or team", "action": "next step", "due": "optional due date" }
  ]
}`;

      try {
        const output = await runGrokCommand(prompt, GROQ_MODEL_CANDIDATES);
        return { success: true, output };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to reach language model.";
        return {
          success: false,
          output: `Could not route the summary automatically (${message}). Provide the highlights manually.`,
        };
      }
    },
  },
  {
    name: "social.publish",
    capability: "general.respond",
    description: "Publish a composed post to the connected social platform account.",
    async run(args, ctx) {
      const platformRaw = typeof args.platform === "string" ? args.platform.toLowerCase().trim() : "";
      const platform = platformRaw === "linkedin" ? "linkedin" : platformRaw === "twitter" ? "twitter" : null;
      const content = typeof args.content === "string" ? args.content.trim() : "";
      const postId = typeof args.postId === "string" ? args.postId : null;

      if (!platform) {
        return { success: false, output: "Provide a supported platform: twitter or linkedin." };
      }

      if (!content) {
        return { success: false, output: "Cannot publish empty content." };
      }

      const userId = ctx.metadata.userId;
      if (!userId) {
        return {
          success: false,
          output: "No workspace user associated with this run. Connect an account and retry from an authenticated session.",
        };
      }

      const providerKey = platform === "twitter" ? "twitter" : "linkedin";
      const account = await getConnectedAccount(userId, providerKey);

      if (!account) {
        return {
          success: false,
          output: `No ${platform === "twitter" ? "Twitter/X" : "LinkedIn"} account connected. Ask the user to link their account in settings first.`,
        };
      }

      try {
        const publishedAt = new Date().toISOString();
        const result = platform === "twitter"
          ? await publishTweet({ account, text: content })
          : await publishLinkedInPost({ account, text: content });

        if (postId) {
          await updateSocialPostStatus(postId, "published", {
            externalId: result.externalId,
            publishedAt,
          });
        }

        return {
          success: true,
          output: `Published to ${platform === "twitter" ? "Twitter/X" : "LinkedIn"}. Track it here: ${result.url}`,
          data: result,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to reach the social API.";
        return {
          success: false,
          output: `Could not publish the post (${message}). Ask the user to retry or verify permissions.`,
        };
      }
    },
  },
];

export const contentTools: ToolDescriptor[] = [
  {
    name: "content.draftStatusUpdate",
    capability: "general.respond",
    description: "Draft a weekly status update using provided metrics and highlights.",
    async run(args) {
      const highlights = typeof args.highlights === "string" ? args.highlights : "No explicit highlights provided.";
      const blockers = typeof args.blockers === "string" ? args.blockers : "None";
      const goals = typeof args.goals === "string" ? args.goals : "Maintain momentum.";
      const prompt = `Write a concise weekly status update. Highlights: ${highlights}. Blockers: ${blockers}. Next goals: ${goals}. Format with headings.`;

      try {
        const output = await runGrokCommand(prompt);
        return { success: true, output };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to reach language model.";
        return {
          success: false,
          output: `Could not draft the update automatically (${message}). Draft manually starting with: Highlights - ${highlights}`,
        };
      }
    },
  },
  {
    name: "content.generateSocialThread",
    capability: "general.respond",
    description: "Generate a short social media thread describing a product feature.",
    async run(args) {
      const feature = typeof args.feature === "string" ? args.feature : "our latest feature";
      const prompt = `Create a 4-post Twitter/X thread announcing ${feature}. Keep it energetic, with emojis, and end with a CTA.`;

      try {
        const output = await runGrokCommand(prompt);
        return { success: true, output };
      } catch (error) {
        const fallback = `Post 1: We're excited to share ${feature}!\nPost 2: It helps teams stay organized.\nPost 3: Early users are loving the speed.\nPost 4: Try it today.`;
        return { success: false, output: fallback };
      };
    },
  },
];

export const codingTools: ToolDescriptor[] = [
  {
    name: "coding.generateSnippet",
    capability: "coding.generate",
    description: "Produce sample code for a requested task",
    async run(args, ctx) {
      const language = typeof args.language === "string" ? args.language : "typescript";
      const task = typeof args.task === "string" ? args.task : "";
      const prompt = `You are a senior engineer. Language: ${language}. Task: ${task}. Provide well-structured code with concise commentary.`;
      const output = await runGrokCommand(prompt, GROQ_MODEL_CANDIDATES);
      await ctx.sharedMemory.append("code-snippets", { language, output });
      return { success: true, output };
    },
  },
  {
    name: "coding.reviewSnippet",
    capability: "coding.review",
    description: "Review a code snippet and highlight improvements",
    async run(args) {
      const code = typeof args.code === "string" ? args.code : "";
      const output = await runGrokCommand(`Review this code and suggest improvements:\n\n${code}`, GROQ_MODEL_CANDIDATES);
      return { success: true, output };
    },
  },
];

export const studyTools: ToolDescriptor[] = [
  {
    name: "study.explain",
    capability: "study.tutor",
    description: "Explain a topic in a structured way",
    async run(args) {
      const topic = typeof args.topic === "string" ? args.topic : "the requested concept";
      const level = typeof args.level === "string" ? args.level : "beginner";
      const prompt = `Explain ${topic} to a ${level} learner with numbered steps and simple examples.`;
      const output = await runGrokCommand(prompt);
      return { success: true, output };
    },
  },
  {
    name: "study.quizBuilder",
    capability: "study.quiz",
    description: "Create quick flashcards or quiz questions",
    async run(args) {
      const subject = typeof args.subject === "string" ? args.subject : "the topic";
      const output = await runGrokCommand(
        `Create 5 flashcards about ${subject}. Format each as "Q: ..." on one line and "A: ..." on the next line.`,
        GROQ_MODEL_CANDIDATES
      );
      return { success: true, output };
    },
  },
];

export const socialTools: ToolDescriptor[] = [
  {
    name: "social.trends",
    capability: "general.respond",
    description:
      "Summarise current trending topics for a given industry and audience so the bot can plan content.",
    async run(args) {
      const industry =
        typeof args.industry === "string" && args.industry.trim()
          ? args.industry.trim()
          : "software and SaaS";
      const audience =
        typeof args.audience === "string" && args.audience.trim()
          ? args.audience.trim()
          : "startup founders";
      const region =
        typeof args.region === "string" && args.region.trim() ? args.region.trim() : "global";

      const prompt = `You are a social media strategist.

Industry: ${industry}
Audience: ${audience}
Region: ${region}

List 5-8 concrete, current-feeling trending topics that this business could post about.
For each topic, respond in this JSON format (array only, no extra text):
[
  {
    "topic": "short hook-style title",
    "angle": "how this relates to the business and why it matters",
    "platformFit": {
      "twitter": "how well this fits Twitter/X (0-10)",
      "linkedin": "how well this fits LinkedIn (0-10)"
    }
  }
]
Only output valid JSON.`;

      try {
        const output = await runGrokCommand(prompt, GROQ_MODEL_CANDIDATES);
        return { success: true, output };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to reach language model.";
        return {
          success: false,
          output: `Could not fetch trends automatically (${message}). Pick 3-5 topics manually based on what you're seeing in your feeds.`,
        };
      }
    },
  },
  {
    name: "social.draftFromTrend",
    capability: "general.respond",
    description:
      "Turn a single trending topic into ready-to-edit Twitter or LinkedIn post drafts.",
    async run(args) {
      const trend = typeof args.trend === "string" ? args.trend.trim() : "";
      const platformRaw = typeof args.platform === "string" ? args.platform.toLowerCase().trim() : "twitter";
      const platform = platformRaw === "linkedin" ? "linkedin" : "twitter";
      const tone =
        typeof args.tone === "string" && args.tone.trim() ? args.tone.trim() : "friendly, clear, and confident";
      const maxLength = Number.isFinite(Number(args.maxLength)) ? Number(args.maxLength) : undefined;

      if (!trend) {
        return { success: false, output: "Missing 'trend' text to draft from." };
      }

      const lengthHint =
        typeof maxLength === "number"
          ? `Keep each draft under ${maxLength} characters.`
          : platform === "twitter"
          ? "Keep each draft under 280 characters."
          : "Aim for 2-3 tight sentences that still feel premium on LinkedIn.";

      const prompt = `You are crafting ${platform === "twitter" ? "Twitter/X" : "LinkedIn"} copy for a futuristic, polished automation brand.

Trend/topic: ${trend}
Desired tone: ${tone}

Write 3 alternative drafts that this business could post. ${lengthHint}
Avoid hashtag spam—0-2 relevant hashtags max.
Return your answer as JSON only in this shape:
{
  "drafts": [
    { "text": "first draft" },
    { "text": "second draft" },
    { "text": "third draft" }
  ]
}`;

      try {
        const output = await runGrokCommand(prompt, GROQ_MODEL_CANDIDATES);
        return { success: true, output };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to reach language model.";
        return {
          success: false,
          output: `Could not generate drafts automatically (${message}). Write 2-3 short variants by hand based on this trend: ${trend}`,
        };
      }
    },
  },
];
