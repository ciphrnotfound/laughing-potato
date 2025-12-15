import OpenAI from "openai";

// Lazy-loaded AI client to handle environment variable loading issues
let _aiClient: OpenAI | null = null;

function getAiClient(): OpenAI {
    if (!_aiClient) {
        // Support for Groq, OpenAI, or xAI (Grok)
        const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || process.env.XAI_API_KEY;

        if (!apiKey) {
            throw new Error("No AI API key found. Please set GROQ_API_KEY, OPENAI_API_KEY, or XAI_API_KEY environment variable.");
        }

        // Default to Groq URL if GROQ_API_KEY is present, otherwise standard OpenAI or custom
        const defaultBaseURL = process.env.GROQ_API_KEY
            ? "https://api.groq.com/openai/v1"
            : "https://api.openai.com/v1";

        const baseURL = process.env.OPENAI_BASE_URL || defaultBaseURL;

        _aiClient = new OpenAI({
            apiKey: apiKey,
            baseURL: baseURL,
        });
    }
    return _aiClient;
}

export const aiClient = {
    get chat() {
        return getAiClient().chat;
    }
} as OpenAI;

// Default model logic
export const AI_MODEL = process.env.AI_MODEL || (process.env.GROQ_API_KEY ? "llama-3.3-70b-versatile" : "gpt-4-turbo");
export const FALLBACK_MODELS = ["llama-3.1-70b-versatile", "llama-3.2-11b-vision-preview", "mixtral-8x7b-32768"];

export async function generateText(prompt: string, model: string | string[] = AI_MODEL): Promise<string> {
    const primaryCandidates = Array.isArray(model) ? model : [model];
    const candidates = [...primaryCandidates, ...FALLBACK_MODELS];
    let lastError: unknown = null;

    for (const candidate of candidates) {
        try {
            const response = await aiClient.chat.completions.create({
                model: candidate,
                messages: [{ role: "user", content: prompt }],
            });
            const content = response.choices[0]?.message?.content?.trim();
            if (content) return content;
        } catch (error) {
            lastError = error;
            console.warn(`Model ${candidate} failed:`, error);
            // Continue to next candidate
        }
    }

    throw lastError instanceof Error ? lastError : new Error("All AI models failed to respond.");
}
