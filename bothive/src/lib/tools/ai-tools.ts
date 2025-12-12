import { ToolDescriptor } from "@/lib/agentTypes";
import { generateText, AI_MODEL } from "@/lib/ai-client";

/**
 * Comprehensive AI tools for bot developers
 * These tools provide real AI capabilities that can be used in any bot
 */

export const aiTools: ToolDescriptor[] = [
    {
        name: "ai.generate.content",
        capability: "ai.content",
        description: "Generate high-quality content using AI (articles, posts, descriptions, etc.)",
        async run(args, ctx) {
            const prompt = typeof args.prompt === "string" ? args.prompt : "";
            const type = typeof args.type === "string" ? args.type : "article";
            const tone = typeof args.tone === "string" ? args.tone : "professional";
            const length = typeof args.length === "string" ? args.length : "medium";
            const keywords = Array.isArray(args.keywords) ? args.keywords : [];

            if (!prompt) {
                return { success: false, output: "Content prompt is required" };
            }

            const fullPrompt = `You are an expert content creator. Generate ${type} content that is:
- Tone: ${tone}
- Length: ${length}
- SEO optimized with keywords: ${keywords.join(", ")}
- Engaging and valuable to readers
- Well-structured with clear formatting

User request: ${prompt}

Return only the generated content, no explanations.`;

            try {
                const content = await generateText(fullPrompt, AI_MODEL);

                return {
                    success: true,
                    output: content,
                    data: { type, tone, length, keywords, content },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Content generation failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "ai.analyze.data",
        capability: "ai.analysis",
        description: "Analyze data and extract insights using AI",
        async run(args, ctx) {
            const data = typeof args.data === "string" ? args.data : JSON.stringify(args.data);
            const analysisType = typeof args.type === "string" ? args.type : "summary";
            const focus = typeof args.focus === "string" ? args.focus : "general";
            const format = typeof args.format === "string" ? args.format : "text";

            const fullPrompt = `You are a data analyst expert. Analyze the provided data and provide ${analysisType} analysis with focus on ${focus}.

Requirements:
- Be thorough and accurate
- Identify patterns and trends
- Provide actionable insights
- Format output as ${format}
- Include specific recommendations when relevant

Data to analyze:
${data}`;

            try {
                const analysis = await generateText(fullPrompt, AI_MODEL);

                return {
                    success: true,
                    output: analysis,
                    data: { analysisType, focus, format, analysis },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Data analysis failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "ai.classify.content",
        capability: "ai.classification",
        description: "Classify content into categories using AI",
        async run(args, ctx) {
            const content = typeof args.content === "string" ? args.content : "";
            const categories = Array.isArray(args.categories) ? args.categories : ["positive", "negative", "neutral"];
            const confidence = typeof args.confidence === "boolean" ? args.confidence : false;

            if (!content) {
                return { success: false, output: "Content to classify is required" };
            }

            const fullPrompt = `You are a classification expert. Classify the given content into one of these categories: ${categories.join(", ")}.

${confidence ? "Also provide confidence score (0-100%) and reasoning." : "Return only the category name."}

Content to classify:
${content}`;

            try {
                const result = await generateText(fullPrompt, AI_MODEL);

                return {
                    success: true,
                    output: result,
                    data: { content, categories, classification: result },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Classification failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "ai.extract.entities",
        capability: "ai.extraction",
        description: "Extract entities (names, dates, locations, etc.) from text using AI",
        async run(args, ctx) {
            const text = typeof args.text === "string" ? args.text : "";
            const entityTypes = Array.isArray(args.entityTypes) ? args.entityTypes : ["person", "organization", "location", "date"];

            if (!text) {
                return { success: false, output: "Text to analyze is required" };
            }

            const fullPrompt = `You are an entity extraction expert. Extract ${entityTypes.join(", ")} entities from the given text.

Return a JSON object with extracted entities grouped by type. Be precise and comprehensive.

Text to analyze:
${text}`;

            try {
                const entitiesJson = await generateText(fullPrompt, AI_MODEL);
                const entities = JSON.parse(entitiesJson || "{}");

                return {
                    success: true,
                    output: JSON.stringify(entities, null, 2),
                    data: { text, entityTypes, entities },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Entity extraction failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "ai.translate.text",
        capability: "ai.translation",
        description: "Translate text between languages using AI",
        async run(args, ctx) {
            const text = typeof args.text === "string" ? args.text : "";
            const targetLanguage = typeof args.targetLanguage === "string" ? args.targetLanguage : "english";
            const sourceLanguage = typeof args.sourceLanguage === "string" ? args.sourceLanguage : "auto";
            const preserveTone = typeof args.preserveTone === "boolean" ? args.preserveTone : true;

            if (!text) {
                return { success: false, output: "Text to translate is required" };
            }

            const fullPrompt = `You are a professional translator. Translate the given text to ${targetLanguage}.

Requirements:
- ${preserveTone ? "Preserve the original tone and style" : "Use neutral, professional tone"}
- Maintain accuracy and context
- ${sourceLanguage !== "auto" ? `Source language: ${sourceLanguage}` : "Auto-detect source language"}
- Return only the translated text

Text to translate:
${text}`;

            try {
                const translation = await generateText(fullPrompt, AI_MODEL);

                return {
                    success: true,
                    output: translation,
                    data: { original: text, translation, targetLanguage, sourceLanguage },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Translation failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "ai.summarize.text",
        capability: "ai.summarization",
        description: "Summarize long text into concise key points using AI",
        async run(args, ctx) {
            const text = typeof args.text === "string" ? args.text : "";
            const maxLength = typeof args.maxLength === "number" ? args.maxLength : 200;
            const style = typeof args.style === "string" ? args.style : "concise";
            const focus = typeof args.focus === "string" ? args.focus : "main points";

            if (!text) {
                return { success: false, output: "Text to summarize is required" };
            }

            const fullPrompt = `You are an expert at creating ${style} summaries. Summarize the given text focusing on ${focus}.

Requirements:
- Maximum ${maxLength} characters
- Include only the most important information
- ${style === "bullet" ? "Use bullet points" : "Use paragraph format"}
- Maintain accuracy and clarity

Text to summarize:
${text}`;

            try {
                const summary = await generateText(fullPrompt, AI_MODEL);

                return {
                    success: true,
                    output: summary,
                    data: { originalLength: text.length, summaryLength: summary.length, style, focus },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Summarization failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "ai.generate.code",
        capability: "ai.code",
        description: "Generate code in various programming languages using AI",
        async run(args, ctx) {
            const description = typeof args.description === "string" ? args.description : "";
            const language = typeof args.language === "string" ? args.language : "javascript";
            const complexity = typeof args.complexity === "string" ? args.complexity : "simple";
            const includeComments = typeof args.includeComments === "boolean" ? args.includeComments : true;

            if (!description) {
                return { success: false, output: "Code description is required" };
            }

            const fullPrompt = `You are an expert programmer. Generate ${complexity} ${language} code based on the description.

Requirements:
- ${includeComments ? "Include helpful comments" : "No comments needed"}
- Follow best practices for ${language}
- Make code clean and readable
- Handle edge cases appropriately
- Return only the code, no explanations

Description: ${description}`;

            try {
                const code = await generateText(fullPrompt, AI_MODEL);

                return {
                    success: true,
                    output: code,
                    data: { language, complexity, description, code },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Code generation failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "ai.process.image",
        capability: "ai.vision",
        description: "Analyze image descriptions and provide insights using AI",
        async run(args, ctx) {
            const imageDescription = typeof args.imageDescription === "string" ? args.imageDescription : "";
            const task = typeof args.task === "string" ? args.task : "analyze";
            const detail = typeof args.detail === "string" ? args.detail : "normal";

            if (!imageDescription) {
                return { success: false, output: "Image description is required" };
            }

            const fullPrompt = `You are an AI expert at analyzing image descriptions. ${task} this image based on the description provided with ${detail} detail.

Image description: ${imageDescription}

Provide accurate, helpful analysis. Be specific and detailed in your observations.`;

            try {
                const analysis = await generateText(fullPrompt, AI_MODEL);

                return {
                    success: true,
                    output: analysis,
                    data: { task, detail, imageDescription, analysis },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Image analysis failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "ai.search.web",
        capability: "ai.search",
        description: "Search for information using AI-powered web search",
        async run(args, ctx) {
            const query = typeof args.query === "string" ? args.query : "";
            const maxResults = typeof args.maxResults === "number" ? args.maxResults : 5;
            const sources = typeof args.sources === "string" ? args.sources : "general";
            const timeFilter = typeof args.timeFilter === "string" ? args.timeFilter : "anytime";

            if (!query) {
                return { success: false, output: "Search query is required" };
            }

            // For now, we'll use AI to generate comprehensive search results
            // In production, you'd integrate with actual search APIs
            const fullPrompt = `You are an AI search expert. Provide comprehensive information about "${query}" based on ${sources} sources.

Requirements:
- Provide ${maxResults} key findings or information points
- Focus on recent information (${timeFilter})
- Be accurate and factual
- Include specific details and examples
- Format as structured information

Search query: ${query}`;

            try {
                const searchResults = await generateText(fullPrompt, AI_MODEL);

                return {
                    success: true,
                    output: searchResults,
                    data: { query, maxResults, sources, timeFilter, results: searchResults },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Search failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "ai.optimize.text",
        capability: "ai.optimization",
        description: "Optimize text for different purposes (SEO, engagement, clarity) using AI",
        async run(args, ctx) {
            const text = typeof args.text === "string" ? args.text : "";
            const purpose = typeof args.purpose === "string" ? args.purpose : "general";
            const constraints = typeof args.constraints === "string" ? args.constraints : "";

            if (!text) {
                return { success: false, output: "Text to optimize is required" };
            }

            const fullPrompt = `You are a text optimization expert. Optimize the given text for ${purpose}.

Requirements:
- Maintain the original meaning and intent
- ${constraints ? `Follow these constraints: ${constraints}` : "Apply general best practices"}
- Improve clarity, engagement, and effectiveness
- Return only the optimized text

Original text:
${text}`;

            try {
                const optimized = await generateText(fullPrompt, AI_MODEL);

                return {
                    success: true,
                    output: optimized,
                    data: { original: text, optimized, purpose, constraints },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Text optimization failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "ai.process.video",
        capability: "ai.vision",
        description: "Analyze video descriptions and provide insights using AI",
        async run(args, ctx) {
            const videoDescription = typeof args.videoDescription === "string" ? args.videoDescription : "";
            const task = typeof args.task === "string" ? args.task : "analyze";
            const detail = typeof args.detail === "string" ? args.detail : "medium";
            const duration = typeof args.duration === "string" ? args.duration : "unknown";
            
            if (!videoDescription) {
                return { success: false, output: "Video description is required" };
            }
            
            const fullPrompt = `You are an AI expert at analyzing video content. ${task} this video based on the description provided with ${detail} detail.
Video description: ${videoDescription}
Duration: ${duration}
Return only the analysis results.`;
            
            try {
                const analysis = await generateText(fullPrompt, AI_MODEL);
                return {
                    success: true,
                    output: analysis,
                    data: { task, detail, duration, videoDescription, analysis },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Video analysis failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "ai.generate.video.script",
        capability: "ai.content",
        description: "Generate video scripts for different platforms and purposes using AI",
        async run(args, ctx) {
            const topic = typeof args.topic === "string" ? args.topic : "";
            const platform = typeof args.platform === "string" ? args.platform : "youtube";
            const duration = typeof args.duration === "string" ? args.duration : "5 minutes";
            const tone = typeof args.tone === "string" ? args.tone : "engaging";
            const targetAudience = typeof args.targetAudience === "string" ? args.targetAudience : "general";
            
            if (!topic) {
                return { success: false, output: "Video topic is required" };
            }
            
            const platformConstraints = {
                youtube: "Optimize for YouTube: engaging hook, clear structure, calls to action, SEO-friendly",
                tiktok: "Optimize for TikTok: quick hook, trending elements, vertical format, under 60 seconds",
                instagram: "Optimize for Instagram: visual storytelling, square/vertical format, engaging captions",
                linkedin: "Optimize for LinkedIn: professional tone, business value, educational content",
                twitter: "Optimize for Twitter: concise, impactful, thread-friendly format"
            };
            
            const fullPrompt = `You are an expert video script writer. Create a compelling video script about "${topic}" for ${platform}.

Requirements:
- Duration: ${duration}
- Tone: ${tone}
- Target Audience: ${targetAudience}
- ${platformConstraints[platform as keyof typeof platformConstraints] || platformConstraints.youtube}

Include:
1. Hook/Introduction
2. Main content sections
3. Call to action
4. Visual cues and transitions
5. Estimated timing for each section

Return a complete, ready-to-use script.`;
            
            try {
                const script = await generateText(fullPrompt, AI_MODEL);
                return {
                    success: true,
                    output: script,
                    data: { topic, platform, duration, tone, targetAudience, script },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Video script generation failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "ai.analyze.video.trends",
        capability: "ai.analytics",
        description: "Analyze video trends and provide insights for content strategy using AI",
        async run(args, ctx) {
            const videoDescriptions = Array.isArray(args.videoDescriptions) ? args.videoDescriptions : [];
            const niche = typeof args.niche === "string" ? args.niche : "general";
            const timeframe = typeof args.timeframe === "string" ? args.timeframe : "recent";
            
            if (!videoDescriptions.length) {
                return { success: false, output: "Video descriptions array is required" };
            }
            
            const fullPrompt = `You are a video content strategy expert. Analyze these video descriptions for trends and patterns in the ${niche} niche.

Timeframe: ${timeframe}
Number of videos: ${videoDescriptions.length}

Video Descriptions:
${videoDescriptions.map((desc, i) => `${i + 1}. ${desc}`).join('\n')}

Provide analysis on:
1. Common themes and topics
2. Engagement patterns
3. Content format trends
4. Optimization opportunities
5. Recommendations for future content

Return a comprehensive trend analysis report.`;
            
            try {
                const analysis = await generateText(fullPrompt, AI_MODEL);
                return {
                    success: true,
                    output: analysis,
                    data: { niche, timeframe, videoCount: videoDescriptions.length, analysis },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Video trends analysis failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },
];

export default aiTools;