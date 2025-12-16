import OpenAI from "openai";

// Support for Groq, OpenAI, or xAI (Grok)
const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || process.env.XAI_API_KEY;

// Default to Groq URL if GROQ_API_KEY is present, otherwise standard OpenAI or custom
const defaultBaseURL = process.env.GROQ_API_KEY
    ? "https://api.groq.com/openai/v1"
    : "https://api.openai.com/v1";

const baseURL = process.env.OPENAI_BASE_URL || defaultBaseURL;

export const aiClient = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
});

// Default model logic
export const AI_MODEL = process.env.AI_MODEL || (process.env.GROQ_API_KEY ? "llama-3.3-70b-versatile" : "gpt-4-turbo");
export const FALLBACK_MODELS = ["openai/gpt-4-turbo", "gpt-3.5-turbo"];

export async function generateText(prompt: string, model: string = AI_MODEL): Promise<string> {
    const candidates = [model, ...FALLBACK_MODELS];
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
