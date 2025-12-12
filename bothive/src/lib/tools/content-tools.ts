import { ToolDescriptor } from "@/lib/agentTypes";
import { generateText, AI_MODEL } from "@/lib/ai-client";

/**
 * Advanced AI content creation and marketing tools
 * Perfect for social media bots, marketing automation, content creators
 */

export const contentTools: ToolDescriptor[] = [
    {
        name: "ai.content.social.post",
        capability: "ai.content.social",
        description: "Create engaging social media posts with hashtags and emojis",
        async run(args, ctx) {
            const topic = typeof args.topic === "string" ? args.topic : "";
            const platform = typeof args.platform === "string" ? args.platform : "twitter";
            const tone = typeof args.tone === "string" ? args.tone : "engaging";
            const includeImage = typeof args.includeImage === "boolean" ? args.includeImage : false;
            const callToAction = typeof args.callToAction === "string" ? args.callToAction : "";

            if (!topic) {
                return { success: false, output: "Topic is required for social post" };
            }

            const platformGuidelines = {
                twitter: { maxLength: 280, style: "concise and punchy" },
                linkedin: { maxLength: 3000, style: "professional and insightful" },
                instagram: { maxLength: 2200, style: "visual and engaging" },
                facebook: { maxLength: 63206, style: "conversational and friendly" },
            };

            const guidelines = platformGuidelines[platform as keyof typeof platformGuidelines] || platformGuidelines.twitter;

            const fullPrompt = `You are a social media expert. Create a ${tone} ${platform} post about "${topic}".

Requirements:
- Maximum ${guidelines.maxLength} characters
- Style: ${guidelines.style}
- Include relevant hashtags (3-5)
- Include appropriate emojis
${callToAction ? `- Include call-to-action: ${callToAction}` : ""}
- Make it engaging and shareable
- Use platform-specific best practices

Return only the post content, no explanations.`;

            try {
                const post = await generateText(fullPrompt, AI_MODEL);

                return {
                    success: true,
                    output: post,
                    data: { platform, topic, tone, post, characterCount: post.length },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Social post creation failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "ai.content.email.write",
        capability: "ai.content.email",
        description: "Write professional emails with customizable tone and purpose",
        async run(args, ctx) {
            const purpose = typeof args.purpose === "string" ? args.purpose : "";
            const recipient = typeof args.recipient === "string" ? args.recipient : "valued customer";
            const tone = typeof args.tone === "string" ? args.tone : "professional";
            const keyPoints = Array.isArray(args.keyPoints) ? args.keyPoints : [];
            const includeSubject = typeof args.includeSubject === "boolean" ? args.includeSubject : true;

            if (!purpose) {
                return { success: false, output: "Email purpose is required" };
            }

            const fullPrompt = `You are an expert email copywriter. Write a ${tone} email to "${recipient}" for the purpose of "${purpose}".

Requirements:
- Include these key points: ${keyPoints.join(", ")}
- Tone: ${tone}
- ${includeSubject ? "Include compelling subject line" : "No subject line needed"}
- Professional formatting
- Clear call-to-action
- Appropriate greeting and closing
- Proofread and polished

Return the complete email${includeSubject ? " with subject line" : ""}.`;

            try {
                const email = await generateText(fullPrompt, AI_MODEL);

                return {
                    success: true,
                    output: email,
                    data: { purpose, recipient, tone, keyPoints, email },
                };
            } catch (error) {
                return {
                    success: false, 
                    output: `Email writing failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "ai.content.blog.write",
        capability: "ai.content.blog",
        description: "Write SEO-optimized blog posts with proper structure",
        async run(args, ctx) {
            const topic = typeof args.topic === "string" ? args.topic : "";
            const targetAudience = typeof args.targetAudience === "string" ? args.targetAudience : "general audience";
            const wordCount = typeof args.wordCount === "number" ? args.wordCount : 1000;
            const keywords = Array.isArray(args.keywords) ? args.keywords : [];
            const includeImages = typeof args.includeImages === "boolean" ? args.includeImages : true;
            const style = typeof args.style === "string" ? args.style : "informative";

            if (!topic) {
                return { success: false, output: "Blog topic is required" };
            }

            const fullPrompt = `You are an expert blog writer and SEO specialist. Write a ${style} blog post about "${topic}" for ${targetAudience}.

Requirements:
- Word count: approximately ${wordCount} words
- Target keywords: ${keywords.join(", ")}
- Include compelling title and meta description
- Use proper heading structure (H1, H2, H3)
- Include introduction and conclusion
- ${includeImages ? "Suggest image placement with alt text" : "Text only"}
- Optimize for search engines
- Make it engaging and valuable
- Include internal linking opportunities

Return the complete blog post with proper formatting.`;

            try {
                const blogPost = await generateText(fullPrompt, AI_MODEL);

                return {
                    success: true,
                    output: blogPost,
                    data: { topic, targetAudience, wordCount, keywords, blogPost },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Blog writing failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "ai.content.product.description",
        capability: "ai.content.product",
        description: "Create compelling product descriptions that convert",
        async run(args, ctx) {
            const productName = typeof args.productName === "string" ? args.productName : "";
            const features = Array.isArray(args.features) ? args.features : [];
            const targetAudience = typeof args.targetAudience === "string" ? args.targetAudience : "customers";
            const tone = typeof args.tone === "string" ? args.tone : "persuasive";
            const length = typeof args.length === "string" ? args.length : "medium";
            const includeBenefits = typeof args.includeBenefits === "boolean" ? args.includeBenefits : true;

            if (!productName) {
                return { success: false, output: "Product name is required" };
            }

            const fullPrompt = `You are an expert copywriter specializing in product descriptions. Create a ${tone} product description for "${productName}".

Product features: ${features.join(", ")}
Target audience: ${targetAudience}
Length: ${length}

Requirements:
- ${includeBenefits ? "Focus on benefits, not just features" : "List features clearly"}
- Create emotional connection with ${targetAudience}
- Use persuasive language that drives action
- Include sensory details and vivid imagery
- Address potential objections
- Create sense of urgency or desire
- Professional formatting with bullet points

Return the compelling product description.`;

            try {
                const description = await generateText(fullPrompt, AI_MODEL);

                return {
                    success: true,
                    output: description,
                    data: { productName, features, targetAudience, tone, description },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Product description failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "ai.content.script.video",
        capability: "ai.content.video",
        description: "Write engaging video scripts for different platforms and formats",
        async run(args, ctx) {
            const topic = typeof args.topic === "string" ? args.topic : "";
            const platform = typeof args.platform === "string" ? args.platform : "youtube";
            const duration = typeof args.duration === "number" ? args.duration : 300; // seconds
            const tone = typeof args.tone === "string" ? args.tone : "engaging";
            const targetAudience = typeof args.targetAudience === "string" ? args.targetAudience : "general viewers";
            const includeVisuals = typeof args.includeVisuals === "boolean" ? args.includeVisuals : true;

            if (!topic) {
                return { success: false, output: "Video topic is required" };
            }

            const fullPrompt = `You are an expert video scriptwriter. Create a ${tone} ${platform} video script about "${topic}" for ${targetAudience}.

Requirements:
- Duration: ${duration} seconds (${Math.ceil(duration/60)} minutes)
- Include hook, main content, and call-to-action
- ${includeVisuals ? "Include visual cues and B-roll suggestions" : "Focus on dialogue only"}
- Platform-specific formatting and style
- Natural dialogue that sounds conversational
- Proper pacing for the platform
- Engagement techniques throughout
- Clear structure with timestamps

Write video script about ${topic}.

Return the complete video script.`;

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
                    output: `Video script failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "ai.content.ad.copy",
        capability: "ai.content.advertising",
        description: "Create high-converting ad copy for different platforms",
        async run(args, ctx) {
            const product = typeof args.product === "string" ? args.product : "";
            const platform = typeof args.platform === "string" ? args.platform : "facebook";
            const objective = typeof args.objective === "string" ? args.objective : "conversion";
            const targetAudience = typeof args.targetAudience === "string" ? args.targetAudience : "broad audience";
            const tone = typeof args.tone === "string" ? args.tone : "persuasive";
            const includeVisual = typeof args.includeVisual === "boolean" ? args.includeVisual : true;

            if (!product) {
                return { success: false, output: "Product/service is required" };
            }

            const fullPrompt = `You are a digital advertising expert. Create ${tone} ad copy for "${product}" on ${platform} with ${objective} objective.

Target audience: ${targetAudience}

Requirements:
- Platform-specific ad format and best practices
- Compelling headline and primary text
- Clear value proposition
- Strong call-to-action
- ${includeVisual ? "Include visual concept suggestions" : ""}
- Address pain points and desires
- Create urgency or desire
- A/B testing variations
- Professional formatting

Create ad copy for ${product} on ${platform}.

Return the complete ad copy with variations.`;

            try {
                const adCopy = await generateText(fullPrompt, AI_MODEL);

                return {
                    success: true,
                    output: adCopy,
                    data: { product, platform, objective, targetAudience, tone, adCopy },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Ad copy failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "ai.content.newsletter.write",
        capability: "ai.content.newsletter",
        description: "Create engaging newsletter content with proper structure and CTAs",
        async run(args, ctx) {
            const theme = typeof args.theme === "string" ? args.theme : "";
            const sections = Array.isArray(args.sections) ? args.sections : ["intro", "main", "cta"];
            const tone = typeof args.tone === "string" ? args.tone : "friendly";
            const targetAudience = typeof args.targetAudience === "string" ? args.targetAudience : "subscribers";
            const includePersonalization = typeof args.includePersonalization === "boolean" ? args.includePersonalization : true;

            if (!theme) {
                return { success: false, output: "Newsletter theme is required" };
            }

            const fullPrompt = `You are an email marketing expert. Create a ${tone} newsletter about "${theme}" for ${targetAudience}.

Required sections: ${sections.join(", ")}

Requirements:
- Compelling subject line and preheader
- ${includePersonalization ? "Include personalization tokens" : ""}
- Mobile-friendly formatting
- Clear hierarchy and scannable content
- Strategic CTAs throughout
- Valuable content that builds trust
- Professional email template structure
- Unsubscribe and contact information

Create newsletter about ${theme}.

Return the complete newsletter content.`;

            try {
                const newsletter = await generateText(fullPrompt, AI_MODEL);

                return {
                    success: true,
                    output: newsletter,
                    data: { theme, sections, tone, targetAudience, newsletter },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Newsletter creation failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },
];

export default contentTools;