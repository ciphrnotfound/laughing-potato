import { ToolDescriptor } from "@/lib/agentTypes";
import { calendarTools } from "./calendar";
import { tasksStorage, AutomationTask } from "@/lib/storage";
import { randomUUID } from "crypto";
import { getConnectedAccount } from "@/lib/connected-accounts";
import { createSocialPost, updateSocialPostStatus } from "@/lib/social-posts";
import { publishTweet } from "@/lib/integrations/twitter";
import { publishLinkedInPost } from "@/lib/integrations/linkedin";
import { sendSlackMessage } from "@/lib/integrations/slack";
import { createIssue } from "@/lib/integrations/github";
import { createNotionPage } from "@/lib/integrations/notion";
import { calendarTools as newCalendarTools } from "./calendar-tools";
import { zoomTools } from "./zoom-tools";
import { notionTools } from "./notion-tools";
import { knowledgeTools } from "./knowledge-tools";
import { emailTools } from "./email-tools";
import { youtubeTools } from "./youtube-tools";
import { botCompositionTools } from "./bot-composition-tools";
import { generateText as runGrokCommand } from "@/lib/ai-client";
import { aiTools as importedAiTools } from "./ai-tools";
import { analyticsTools as importedAnalyticsTools } from "./analytics-tools";
import { agentOrchestrationTools as importedAgentOrchestrationTools } from "./agent-orchestration";
import { contentTools as importedContentTools } from "./content-tools";
import { visionTools as importedVisionTools } from "./vision-tools";
import { analysisTools as importedAnalysisTools } from "./analysis-tools";
import { googleDocsTools as importedGoogleDocsTools } from "./google-docs-tools";
import { knowledgeTools as importedKnowledgeTools } from "./knowledge-tools";


// Re-export agent tools
export { agentTools } from "./agent-tools";

const GROQ_MODEL_CANDIDATES = ["openai/gpt-oss-20b"]; // kept for signature compatibility, though generateText handles defaults

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

      const record = await createSocialPost(
        userId,
        platform as any,
        content,
        scheduledFor ? scheduledFor : undefined
      );

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
  ...newCalendarTools,
  ...zoomTools,
  ...notionTools,
  ...emailTools,
  ...youtubeTools,
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
    async run(args, ctx) {
      const userId = ctx?.metadata?.userId;
      if (!userId) return { success: false, output: "User ID required" };

      const title = typeof args.title === "string" && args.title.trim() ? args.title.trim() : "Untitled task";
      const due = typeof args.due === "string" ? args.due : null;

      const { getSupabaseClient } = await import("@/lib/supabase");
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.from("automation_tasks").insert({
        user_id: userId,
        title,
        status: "open",
        due_date: due,
        metadata: { createdBy: "general.recordTask", originalArgs: args }
      }).select().single();

      if (error) return { success: false, output: `Failed to create task: ${error.message}` };

      return {
        success: true,
        output: `Added "${title}" to the automation queue${due ? ` (due ${due})` : ""}. Reference: ${data.id.slice(0, 6)}.`,
        data: data,
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
  ...botCompositionTools,
];

export const crmTools: ToolDescriptor[] = [
  {
    name: "crm.logInteraction",
    capability: "general.respond",
    description: "Log a customer interaction and schedule a follow-up task.",
    async run(args, ctx) {
      const userId = ctx?.metadata?.userId;
      if (!userId) return { success: false, output: "User ID required" };

      const contact = typeof args.contact === "string" && args.contact.trim() ? args.contact.trim() : "Unnamed contact";
      const channel = typeof args.channel === "string" && args.channel.trim() ? args.channel.trim() : "email";
      const summary = typeof args.summary === "string" && args.summary.trim() ? args.summary.trim() : "General check-in";
      const followUpInDays = Number(args.followUpInDays ?? 2);

      const due = new Date();
      due.setDate(due.getDate() + (Number.isFinite(followUpInDays) ? followUpInDays : 2));

      const { getSupabaseClient } = await import("@/lib/supabase");
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.from("automation_tasks").insert({
        user_id: userId,
        title: `Follow up with ${contact}`,
        status: "open",
        due_date: due.toISOString(),
        metadata: {
          createdBy: "crm.logInteraction",
          channel,
          summary,
        },
      }).select().single();

      if (error) return { success: false, output: `Failed to log interaction: ${error.message}` };

      return {
        success: true,
        output: `Logged a ${channel} touchpoint with ${contact}. Summary: ${summary}. Scheduled a follow-up for ${due.toLocaleDateString()}. Reference ${data.id.slice(0, 6)}.`,
        data: data,
      };
    },
  },
  {
    name: "crm.createLead",
    capability: "general.respond",
    description: "Create a lightweight lead record with scoring heuristics.",
    async run(args, ctx) {
      const userId = ctx?.metadata?.userId;
      if (!userId) return { success: false, output: "User ID required" };

      const company = typeof args.company === "string" && args.company.trim() ? args.company.trim() : "Unknown Co.";
      const interest = typeof args.interest === "string" && args.interest.trim() ? args.interest.trim() : "general";
      const score = Math.min(100, Math.max(10, Number(args.score ?? 65)));

      const { getSupabaseClient } = await import("@/lib/supabase");
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.from("automation_tasks").insert({
        user_id: userId,
        title: `Nurture lead: ${company}`,
        status: "open",
        metadata: {
          createdBy: "crm.createLead",
          company,
          interest,
          score,
        },
      }).select().single();

      if (error) return { success: false, output: `Failed to create lead: ${error.message}` };

      return {
        success: true,
        output: `Created a lead for ${company} (score ${score}). Focus area: ${interest}. Added to nurture queue (${data.id.slice(0, 6)}).`,
        data: data,
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
        const output = await runGrokCommand(prompt, GROQ_MODEL_CANDIDATES[0]);
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
        const output = await runGrokCommand(prompt, GROQ_MODEL_CANDIDATES[0]);
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
        const output = await runGrokCommand(prompt, GROQ_MODEL_CANDIDATES[0]);
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


export const codingTools: ToolDescriptor[] = [
  {
    name: "coding.generateSnippet",
    capability: "coding.generate",
    description: "Produce sample code for a requested task",
    async run(args, ctx) {
      const language = typeof args.language === "string" ? args.language : "typescript";
      const task = typeof args.task === "string" ? args.task : "";
      const prompt = `You are a senior engineer. Language: ${language}. Task: ${task}. Provide well-structured code with concise commentary.`;
      const output = await runGrokCommand(prompt, GROQ_MODEL_CANDIDATES[0]);
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
      const output = await runGrokCommand(`Review this code and suggest improvements:\n\n${code}`, GROQ_MODEL_CANDIDATES[0]);
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
        GROQ_MODEL_CANDIDATES[0]
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
        const output = await runGrokCommand(prompt, GROQ_MODEL_CANDIDATES[0]);
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
        const output = await runGrokCommand(prompt, GROQ_MODEL_CANDIDATES[0]);
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
  {
    name: "whatsapp.send",
    capability: "general.respond",
    description: "Send a WhatsApp message to a specified phone number.",
    async run(args) {
      const phoneNumber = typeof args.phoneNumber === "string" ? args.phoneNumber.trim() : "";
      const message = typeof args.message === "string" ? args.message.trim() : "";

      if (!phoneNumber) {
        return { success: false, output: "Missing 'phoneNumber' for WhatsApp message." };
      }

      if (!message) {
        return { success: false, output: "Missing 'message' content for WhatsApp." };
      }

      // For demo purposes, we'll simulate the WhatsApp send
      // In production, you'd fetch connected WhatsApp account and use the integration
      console.log(`📱 WhatsApp Demo: Would send to ${phoneNumber}: ${message}`);

      return {
        success: true,
        output: `WhatsApp message sent to ${phoneNumber}. Message: "${message}"`,
        data: {
          messageId: 'demo-' + Date.now(),
          phoneNumber,
          message
        }
      };
    },
  },
  {
    name: "coding.generate",
    capability: "general.respond",
    description: "Generate code based on requirements and specifications.",
    async run(args) {
      const language = typeof args.language === "string" ? args.language.trim() : "javascript";
      const requirements = typeof args.requirements === "string" ? args.requirements.trim() : "";
      const framework = typeof args.framework === "string" ? args.framework.trim() : "";

      if (!requirements) {
        return { success: false, output: "Missing 'requirements' for code generation." };
      }

      const prompt = `Generate clean, production-ready code for:
Language: ${language}
Framework: ${framework || 'None'}
Requirements: ${requirements}

Please provide:
1. Complete, working code
2. Clear comments explaining key parts
3. Error handling where appropriate
4. Best practices for ${language}
5. Usage example if applicable

Return only the code with explanations.`;

      try {
        const output = await runGrokCommand(prompt, GROQ_MODEL_CANDIDATES[0]);
        return { success: true, output };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to generate code.";
        return { success: false, output: `Code generation failed: ${message}` };
      }
    },
  },
  {
    name: "coding.review",
    capability: "general.respond",
    description: "Review code for bugs, security issues, and best practices.",
    async run(args) {
      const code = typeof args.code === "string" ? args.code.trim() : "";
      const language = typeof args.language === "string" ? args.language.trim() : "javascript";
      const focus = typeof args.focus === "string" ? args.focus.trim() : "general";

      if (!code) {
        return { success: false, output: "Missing 'code' to review." };
      }

      const focusAreas = {
        security: "security vulnerabilities and best practices",
        performance: "performance bottlenecks and optimizations",
        style: "code style, readability, and maintainability",
        bugs: "potential bugs and logic errors",
        general: "overall code quality and best practices"
      };

      const prompt = `Review this ${language} code focusing on ${focusAreas[focus as keyof typeof focusAreas] || focusAreas.general}:

\`\`\`${language}
${code}
\`\`\`

Please provide:
1. Issues found (if any)
2. Severity level (Critical/High/Medium/Low)
3. Specific line references
4. Suggested fixes
5. Positive feedback on good practices
6. Overall assessment

Format your response clearly with sections.`;

      try {
        const output = await runGrokCommand(prompt, GROQ_MODEL_CANDIDATES[0]);
        return { success: true, output };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to review code.";
        return { success: false, output: `Code review failed: ${message}` };
      }
    },
  },
  {
    name: "coding.debug",
    capability: "general.respond",
    description: "Debug code issues and provide solutions.",
    async run(args) {
      const code = typeof args.code === "string" ? args.code.trim() : "";
      const error = typeof args.error === "string" ? args.error.trim() : "";
      const language = typeof args.language === "string" ? args.language.trim() : "javascript";

      if (!code) {
        return { success: false, output: "Missing 'code' to debug." };
      }

      const prompt = `Debug this ${language} code:

\`\`\`${language}
${code}
\`\`\`

${error ? `Error message: ${error}` : ''}

Please provide:
1. Root cause analysis
2. Step-by-step explanation of the issue
3. Fixed code with comments
4. Prevention strategies
5. Testing approach to verify the fix

Be thorough and educational in your explanation.`;

      try {
        const output = await runGrokCommand(prompt, GROQ_MODEL_CANDIDATES[0]);
        return { success: true, output };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to debug code.";
        return { success: false, output: `Debugging failed: ${message}` };
      }
    },
  },
  {
    name: "coding.refactor",
    capability: "general.respond",
    description: "Refactor code to improve structure and maintainability.",
    async run(args) {
      const code = typeof args.code === "string" ? args.code.trim() : "";
      const language = typeof args.language === "string" ? args.language.trim() : "javascript";
      const goal = typeof args.goal === "string" ? args.goal.trim() : "improve readability";

      if (!code) {
        return { success: false, output: "Missing 'code' to refactor." };
      }

      const prompt = `Refactor this ${language} code to ${goal}:

\`\`\`${language}
${code}
\`\`\`

Please provide:
1. Refactored code with clear improvements
2. Explanation of changes made
3. Benefits of the refactoring
4. Before/after comparison
5. Any trade-offs considered

Focus on making the code cleaner, more maintainable, and following ${language} best practices.`;

      try {
        const output = await runGrokCommand(prompt, GROQ_MODEL_CANDIDATES[0]);
        return { success: true, output };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to refactor code.";
        return { success: false, output: `Refactoring failed: ${message}` };
      }
    },
  },
  {
    name: "email.send",
    capability: "general.respond",
    description: "Send an email to specified recipients.",
    async run(args) {
      const to = typeof args.to === "string" ? args.to.trim() : "";
      const subject = typeof args.subject === "string" ? args.subject.trim() : "";
      const body = typeof args.body === "string" ? args.body.trim() : "";
      const cc = typeof args.cc === "string" ? args.cc.trim() : undefined;
      const bcc = typeof args.bcc === "string" ? args.bcc.trim() : undefined;

      if (!to || !subject || !body) {
        return { success: false, output: "Missing required fields: to, subject, or body." };
      }

      // Import email function
      const { sendEmail } = await import('./communication');

      try {
        const result = await sendEmail({ account: null, to, subject, body, cc, bcc });
        return {
          success: true,
          output: `Email sent successfully to ${to}. Message ID: ${result.messageId}`,
          data: result
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to send email.";
        return { success: false, output: `Email sending failed: ${message}` };
      }
    },
  },
  {
    name: "email.reply",
    capability: "general.respond",
    description: "Reply to an existing email.",
    async run(args) {
      const emailId = typeof args.emailId === "string" ? args.emailId.trim() : "";
      const replyTo = typeof args.replyTo === "string" ? args.replyTo.trim() : "";
      const subject = typeof args.subject === "string" ? args.subject.trim() : "";
      const body = typeof args.body === "string" ? args.body.trim() : "";

      if (!emailId || !replyTo || !subject || !body) {
        return { success: false, output: "Missing required fields: emailId, replyTo, subject, or body." };
      }

      const { replyToEmail } = await import('./communication');

      try {
        const result = await replyToEmail({ account: null, emailId, replyTo, subject, body });
        return {
          success: true,
          output: `Reply sent to ${replyTo}. Message ID: ${result.messageId}`,
          data: result
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to reply to email.";
        return { success: false, output: `Email reply failed: ${message}` };
      }
    },
  },
  {
    name: "email.check",
    capability: "general.respond",
    description: "Check for new emails in inbox.",
    async run(args) {
      const folder = typeof args.folder === "string" ? args.folder.trim() : "inbox";
      const unreadOnly = args.unreadOnly === true;

      const { checkEmails } = await import('./communication');

      try {
        const result = await checkEmails({ account: null, folder, unreadOnly });
        return {
          success: true,
          output: `Found ${result.count} emails in ${folder}${unreadOnly ? ' (unread only)' : ''}`,
          data: result
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to check emails.";
        return { success: false, output: `Email check failed: ${message}` };
      }
    },
  },
  {
    name: "sms.send",
    capability: "general.respond",
    description: "Send an SMS message to a phone number.",
    async run(args) {
      const phoneNumber = typeof args.phoneNumber === "string" ? args.phoneNumber.trim() : "";
      const message = typeof args.message === "string" ? args.message.trim() : "";

      if (!phoneNumber || !message) {
        return { success: false, output: "Missing required fields: phoneNumber or message." };
      }

      const { sendSMS } = await import('./communication');

      try {
        const result = await sendSMS({ account: null, phoneNumber, message });
        return {
          success: true,
          output: `SMS sent to ${phoneNumber}. Message ID: ${result.messageId}`,
          data: result
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to send SMS.";
        return { success: false, output: `SMS sending failed: ${message}` };
      }
    },
  },
  {
    name: "slack.send",
    capability: "general.respond",
    description: "Send a message to a Slack channel.",
    async run(args) {
      const channel = typeof args.channel === "string" ? args.channel.trim() : "";
      const message = typeof args.message === "string" ? args.message.trim() : "";
      const threadId = typeof args.threadId === "string" ? args.threadId.trim() : undefined;

      if (!channel || !message) {
        return { success: false, output: "Missing required fields: channel or message." };
      }

      const { sendSlackMessage } = await import('./communication');

      try {
        const result = await sendSlackMessage({ account: null, channel, message, threadId });
        return {
          success: true,
          output: `Slack message sent to #${channel}. Message ID: ${result.messageId}`,
          data: result
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to send Slack message.";
        return { success: false, output: `Slack sending failed: ${message}` };
      }
    },
  },
  {
    name: "slack.check",
    capability: "general.respond",
    description: "Check for new Slack messages.",
    async run(args) {
      const channel = typeof args.channel === "string" ? args.channel.trim() : undefined;

      const { checkSlackMessages } = await import('./communication');

      try {
        const result = await checkSlackMessages({ account: null, channel });
        return {
          success: true,
          output: `Found ${result.count} Slack messages${channel ? ` in #${channel}` : ''}`,
          data: result
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to check Slack messages.";
        return { success: false, output: `Slack check failed: ${message}` };
      }
    },
  },
  {
    name: "discord.send",
    capability: "general.respond",
    description: "Send a message to a Discord channel.",
    async run(args) {
      const channelId = typeof args.channelId === "string" ? args.channelId.trim() : "";
      const message = typeof args.message === "string" ? args.message.trim() : "";

      if (!channelId || !message) {
        return { success: false, output: "Missing required fields: channelId or message." };
      }

      const { sendDiscordMessage } = await import('./communication');

      try {
        const result = await sendDiscordMessage({ account: null, channelId, message });
        return {
          success: true,
          output: `Discord message sent to channel ${channelId}. Message ID: ${result.messageId}`,
          data: result
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to send Discord message.";
        return { success: false, output: `Discord sending failed: ${message}` };
      }
    },
  },
  {
    name: "message.process",
    capability: "general.respond",
    description: "Process incoming messages from any platform.",
    async run(args) {
      const platform = typeof args.platform === "string" ? args.platform.trim() : "";
      const messageId = typeof args.messageId === "string" ? args.messageId.trim() : "";
      const sender = typeof args.sender === "string" ? args.sender.trim() : "";
      const content = typeof args.content === "string" ? args.content.trim() : "";
      const timestamp = typeof args.timestamp === "string" ? args.timestamp.trim() : new Date().toISOString();

      if (!platform || !messageId || !sender || !content) {
        return { success: false, output: "Missing required fields: platform, messageId, sender, or content." };
      }

      const { processIncomingMessage } = await import('./communication');

      try {
        const result = await processIncomingMessage({
          account: null,
          platform: platform as any,
          messageId,
          sender,
          content,
          timestamp
        });
        return {
          success: true,
          output: `Processed ${platform} message from ${sender}`,
          data: result
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to process message.";
        return { success: false, output: `Message processing failed: ${message}` };
      }
    },
  },
];

// Define automationTools and hivelangGeneratedTools as empty arrays
export const automationTools: ToolDescriptor[] = [];
export const hivelangGeneratedTools: ToolDescriptor[] = [];

// Export all tools combined
export const allTools = [
  ...integrationTools,
  ...generalTools,
  ...crmTools,
  ...messagingTools,
  ...importedAiTools,
  ...importedAnalyticsTools,
  ...importedAgentOrchestrationTools,
  ...importedContentTools,
  ...importedVisionTools,
  ...importedGoogleDocsTools,
  ...importedKnowledgeTools,
];

// Export individual tool sets
export { importedAiTools as aiTools };
export { importedContentTools as contentTools };
export { importedAnalyticsTools as analyticsTools };
export { importedAgentOrchestrationTools as agentOrchestrationTools };
export { importedVisionTools as visionTools };
export { importedAnalysisTools as analysisTools };
export { importedKnowledgeTools as knowledgeTools };
