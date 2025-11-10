import { ToolDescriptor } from "@/lib/agentTypes";
import OpenAI from "openai";

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

export const generalTools: ToolDescriptor[] = [
  {
    name: "general.respond",
    capability: "general.respond",
    description: "Generate a conversational response",
    async run(args, ctx) {
      const prompt = typeof args.prompt === "string" ? args.prompt : "";
      if (!prompt) {
        return { success: false, output: "Missing prompt" };
      }

      const output = await runGrokCommand(prompt);
      await ctx.sharedMemory.append("history", { role: "assistant", output });
      return { success: true, output };
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
        GROK_MODEL_CANDIDATES
      );
      return { success: true, output };
    },
  },
];
