import { ToolDescriptor } from "@/lib/agentTypes";
import OpenAI from "openai";

// Lazy-load OpenAI client to avoid initialization errors and support Groq
let _openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("No AI API key found for vision tools");
    }
    _openai = new OpenAI({
      apiKey: apiKey,
      baseURL: process.env.GROQ_API_KEY ? "https://api.groq.com/openai/v1" : undefined,
    });
  }
  return _openai;
}

export const visionTools: ToolDescriptor[] = [
  {
    name: "vision.process.image",
    capability: "ai.vision",
    description: "Analyze actual images using OpenAI Vision API (requires OpenAI API key)",
    async run(args, ctx) {
      const imageUrl = typeof args.imageUrl === "string" ? args.imageUrl : "";
      const task = typeof args.task === "string" ? args.task : "analyze";
      const detail = typeof args.detail === "string" ? args.detail : "auto";
      
      if (!imageUrl) {
        return { success: false, output: "Image URL is required" };
      }
      
      if (!process.env.OPENAI_API_KEY) {
        return { 
          success: false, 
          output: "OpenAI API key required for vision processing. Use ai.process.image for text-based analysis with Groq." 
        };
      }
      
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: `${task} this image with ${detail} detail` },
                { type: "image_url", image_url: { url: imageUrl, detail: detail as "auto" | "low" | "high" } }
              ]
            }
          ],
          max_tokens: 1000,
        });
        
        const analysis = response.choices[0]?.message?.content || "No analysis returned";
        
        return {
          success: true,
          output: analysis,
          data: { task, detail, imageUrl, analysis },
        };
      } catch (error) {
        return {
          success: false,
          output: `Vision processing failed: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  },

  {
    name: "vision.process.video.frames",
    capability: "ai.vision",
    description: "Analyze video frames using OpenAI Vision API (requires OpenAI API key)",
    async run(args, ctx) {
      const frameUrls = Array.isArray(args.frameUrls) ? args.frameUrls : [];
      const task = typeof args.task === "string" ? args.task : "analyze video frames";
      const context = typeof args.context === "string" ? args.context : "";
      
      if (!frameUrls.length) {
        return { success: false, output: "Frame URLs array is required" };
      }
      
      if (!process.env.OPENAI_API_KEY) {
        return { 
          success: false, 
          output: "OpenAI API key required for vision processing. Use ai.process.video for text-based analysis with Groq." 
        };
      }
      
      try {
        const messages = [
          {
            role: "user",
            content: [
              { type: "text", text: `${task}. ${context ? `Context: ${context}` : ""}` },
              ...frameUrls.map(url => ({ 
                type: "image_url" as const, 
                image_url: { url, detail: "auto" as const } 
              }))
            ]
          }
        ];
        
        const response = await openai.chat.completions.create({
          model: "gpt-4-vision-preview",
          messages,
          max_tokens: 1500,
        });
        
        const analysis = response.choices[0]?.message?.content || "No analysis returned";
        
        return {
          success: true,
          output: analysis,
          data: { task, context, frameCount: frameUrls.length, frameUrls, analysis },
        };
      } catch (error) {
        return {
          success: false,
          output: `Video frame processing failed: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  },

  {
    name: "vision.extract.text",
    capability: "ai.vision",
    description: "Extract text from images using OpenAI Vision API (OCR functionality)",
    async run(args, ctx) {
      const imageUrl = typeof args.imageUrl === "string" ? args.imageUrl : "";
      const language = typeof args.language === "string" ? args.language : "auto-detect";
      
      if (!imageUrl) {
        return { success: false, output: "Image URL is required" };
      }
      
      if (!process.env.OPENAI_API_KEY) {
        return { 
          success: false, 
          output: "OpenAI API key required for OCR. Consider using dedicated OCR services for better accuracy." 
        };
      }
      
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: `Extract all text from this image${language !== "auto-detect" ? ` in ${language}` : ""}. Return only the extracted text, maintaining formatting where possible.` },
                { type: "image_url", image_url: { url: imageUrl, detail: "high" } }
              ]
            }
          ],
          max_tokens: 2000,
        });
        
        const extractedText = response.choices[0]?.message?.content || "No text found";
        
        return {
          success: true,
          output: extractedText,
          data: { imageUrl, language, extractedText },
        };
      } catch (error) {
        return {
          success: false,
          output: `Text extraction failed: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  },
];

export default visionTools;