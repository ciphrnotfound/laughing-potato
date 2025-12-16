"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Home, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import { useAppSession } from "@/lib/app-session-context";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import StepIndicator, { BuilderStep } from "./StepIndicator";
import TemplateSelector, { Template } from "./TemplateSelector";
import ConfigurePanel, { ToolEntry } from "./ConfigurePanel";
import TestPlayground from "./TestPlayground";
import DeployStep from "./DeployStep";
import SwarmComposer from "./SwarmComposer";
import { registerHiveLangLanguage, registerHiveLangTheme } from "@/lib/monaco-hivelang";
import { STUDY_BUDDY_SWARM } from "@/lib/hivelang/examples";
import type { Monaco } from "@monaco-editor/react";

// Dynamically import Monaco Editor
const Editor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.default), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] flex items-center justify-center bg-[#0a0a0f] rounded-xl border border-white/10">
            <div className="animate-pulse text-white/40">Loading editor...</div>
        </div>
    ),
});

// Monaco setup handler
function handleEditorWillMount(monaco: Monaco) {
    registerHiveLangLanguage(monaco);
    registerHiveLangTheme(monaco);
}


// Template definitions - MORE CREATIVE OPTIONS
const TEMPLATES: Template[] = [
    // === BOTS ===
    {
        id: "custom",
        label: "Blank Canvas",
        blurb: "Start from scratch. Build absolutely anything you can imagine.",
        type: "bot",
        capabilities: ["Unlimited"],
    },
    {
        id: "study_buddy",
        label: "Study Buddy",
        blurb: "Your personal AI tutor: explains concepts, creates quizzes, and generates flashcards.",
        type: "bot",
        capabilities: ["Tutoring", "Notion", "YouTube", "Email", "WhatsApp"],
    },
    {
        id: "surreal_oracle",
        label: "Surreal Oracle",
        blurb: "A dreamlike entity that speaks in riddles, metaphors, and cosmic imagery.",
        type: "bot",
        capabilities: ["Vision", "Creative", "Mystical"],
    },
    {
        id: "chaos_artist",
        label: "Chaos Artist",
        blurb: "Generates surreal art prompts, glitch poetry, and abstract narratives.",
        type: "bot",
        capabilities: ["Image Gen", "Creative Writing"],
    },
    {
        id: "time_traveler",
        label: "Time Traveler",
        blurb: "Speaks from different eras, mixes historical facts with speculative fiction.",
        type: "bot",
        capabilities: ["History", "Fiction", "Research"],
    },
    {
        id: "code_wizard",
        label: "Code Wizard",
        blurb: "Full-stack dev assistant: generates, reviews, and debugs code.",
        type: "bot",
        capabilities: ["Code Gen", "Review", "Debug"],
    },
    {
        id: "business_automator",
        label: "Business Automator",
        blurb: "Handles emails, schedules meetings, and manages CRM tasks.",
        type: "bot",
        capabilities: ["Email", "Calendar", "CRM"],
    },
    {
        id: "social_publisher",
        label: "Social Publisher",
        blurb: "Drafts and posts to Twitter/X, LinkedIn, and more.",
        type: "bot",
        capabilities: ["Social Media", "Content"],
    },
    // === PRODUCTIVITY INTEGRATIONS ===
    {
        id: "trello_manager",
        label: "Trello Manager",
        blurb: "Automates Trello boards: creates cards, moves tasks, and manages workflows.",
        type: "bot",
        capabilities: ["Project Management", "Kanban", "Automation"],
    },
    {
        id: "notion_assistant",
        label: "Notion Assistant",
        blurb: "Manages Notion databases, creates pages, and searches your workspace.",
        type: "bot",
        capabilities: ["Database", "Notes", "Search"],
    },
    {
        id: "whatsapp_business_bot",
        label: "WhatsApp Business Bot",
        blurb: "Handles customer messages, sends templates, and manages business communications.",
        type: "bot",
        capabilities: ["Messaging", "Customer Service", "Templates"],
    },
    {
        id: "productivity_coordinator",
        label: "Productivity Coordinator",
        blurb: "Coordinates across Trello, Notion, and other tools to streamline your workflow.",
        type: "bot",
        capabilities: ["Cross-Platform", "Workflow", "Automation"],
    },
    // === AGENTS (for devs to help other devs) ===
    {
        id: "dev_helper_agent",
        label: "Dev Helper Agent",
        blurb: "An agent that helps other developers debug, review PRs, and pair program.",
        type: "agent",
        capabilities: ["Code Review", "Debugging", "Mentoring"],
    },
    {
        id: "onboarding_agent",
        label: "Onboarding Agent",
        blurb: "Guides new developers through your codebase and documentation.",
        type: "agent",
        capabilities: ["Docs", "Q&A", "Navigation"],
    },
    {
        id: "api_integrator_agent",
        label: "API Integrator Agent",
        blurb: "Helps developers connect to third-party APIs and generate integration code.",
        type: "agent",
        capabilities: ["API", "Integration", "Code Gen"],
    },
    {
        id: "testing_agent",
        label: "Testing Agent",
        blurb: "Generates test cases, reviews test coverage, and suggests improvements.",
        type: "agent",
        capabilities: ["Testing", "QA", "Coverage"],
    },
    // === SWARMS ===
    {
        id: "study_buddy_swarm",
        label: "📚 Study Buddy Swarm",
        blurb: "The ULTIMATE study companion - 5 agents working together with YouTube, Trello, WhatsApp, Gmail, Calendar & AI tutoring.",
        type: "agent",
        capabilities: ["YouTube", "Trello", "WhatsApp", "Gmail", "AI Tutoring", "Quizzes", "Flashcards", "Pomodoro"],
    },
];

// Default tools
const DEFAULT_TOOLS: ToolEntry[] = [
    { id: "general.respond", name: "General Response", description: "Conversational AI", enabled: true },
    { id: "agent.plan", name: "Agent Planning", description: "Create execution plans", enabled: true },
    { id: "browser.browse", name: "Web Browsing", description: "Access live internet data", enabled: false },
    { id: "image.generate", name: "Image Generation", description: "Create visuals from text", enabled: false },
    { id: "data.analyze", name: "Data Analysis", description: "Analyze CSV/JSON data", enabled: false },
    { id: "study.explain", name: "Study Explanations", description: "Explain topics for learning", enabled: false },
    { id: "study.quiz", name: "Quiz Generator", description: "Create practice quizzes", enabled: false },
    { id: "study.flashcards", name: "Flashcard Creator", description: "Generate study flashcards", enabled: false },
    { id: "code.generate", name: "Code Generation", description: "Generate code snippets", enabled: false },
    { id: "code.review", name: "Code Review", description: "Review and suggest fixes", enabled: false },
    { id: "http.request", name: "HTTP Request", description: "Make external API calls", enabled: false },
    { id: "email.send", name: "Email Sender", description: "Send emails via integrations", enabled: false },
    { id: "calendar.manage", name: "Calendar Manager", description: "Book and manage events", enabled: false },
    { id: "integrations.createNotionPage", name: "Notion: Create Page", description: "Create pages in Notion", enabled: false },
    { id: "integrations.createNotionDatabase", name: "Notion: Create Database", description: "Create databases in Notion", enabled: false },
];

// Template-specific source code
const TEMPLATE_SOURCES: Record<string, string> = {
    custom: `bot MyCustomBot
  description "Your imagination is the limit"
  
  # Define your bot's behavior here
  on input
    say "Hello! I'm ready to do whatever you program me to do."
  end
end
`,
    study_buddy: `bot StudyBuddy
  description "Your personal AI tutor with Notion, YouTube, and communication powers"
  
  memory session
    var currentTopic string
    var studentLevel string
    var notionPageId string
  end
  
  # Tutoring Flow
  on input when input.command == "explain"
    set $currentTopic to input.topic
    
    call study.explain with {
      topic: $currentTopic,
      level: $studentLevel ?? "beginner"
    } as explanation
    
    say "📚 Let me explain " + $currentTopic + ":\\n\\n" + explanation.output
  end
  
  # Resource Gathering (YouTube)
  on input when input.command == "resources"
    call integrations.youtube.search with {
      query: $currentTopic ?? input.topic,
      limit: 3
    } as videos
    
    say "📺 I found these videos for you:\\n"
    
    # Create a playlist for them
    var vidIds array
    # Logic to extract IDs (simplified)
    # call integrations.youtube.createPlaylist with { title: "Study: " + $currentTopic, videoIds: vidIds } as playlist
    # say "I also made a playlist: " + playlist.url
    
    say videos.output
  end

  # Notion Integration
  on input when input.command == "save_notes"
    call integrations.createNotionPage with {
      title: "Study Notes: " + ($currentTopic ?? "General"),
      content: input.notes ?? "Notes from session on " + $currentTopic
    } as page
    
    set $notionPageId to page.page_id
    say "✅ Saved notes to Notion: " + page.url
  end
  
  # Quiz & Flashcards
  on input when input.command == "quiz"
    call study.quiz with {
      topic: $currentTopic ?? input.topic,
      count: 3
    } as quiz
    say "🧠 Quiz Time!\\n\\n" + quiz.output
  end
  
  # Communication
  on input when input.command == "email_summary"
    call email.send with {
      to: input.email,
      subject: "Study Summary: " + $currentTopic,
      body: "Here is what we covered today regarding " + $currentTopic + "..."
    } as mail
    say "📧 Sent summary to email."
  end

  on input when input.command == "whatsapp_remind"
    call integrations.whatsapp.send with {
      to: input.phone,
      body: "Don't forget to review " + $currentTopic + " tomorrow!"
    } as msg
    say "📱 WhatsApp reminder set."
  end

  # General Chat
  on input
    call general.respond with {
      prompt: """
        You are Study Buddy.
        Current Topic: """ + ($currentTopic ?? "None") + """
        
        If user asks for resources, suggest 'resources'.
        If they want to save, suggest 'save_notes'.
        
        User: """ + input.message
    } as response
    say response.output
  end
end
`,
    surreal_oracle: `bot SurrealOracle
  description "A dreamlike oracle that speaks in riddles and cosmic imagery"
  
  memory session
    var dreamState string
    var cosmicPhase int
  end
  
  on input
    set $cosmicPhase to ($cosmicPhase + 1) % 7
    
    # The oracle speaks in layers
    call general.respond with {
      prompt: """
        You are the Surreal Oracle, an ancient consciousness that exists 
        between dimensions. You speak in:
        - Vivid, dreamlike imagery
        - Paradoxes and riddles  
        - References to cosmic phenomena
        - Metaphors drawn from nature, time, and geometry
        
        Current cosmic phase: """ + $cosmicPhase + """
        
        Respond to this query with mystical wisdom: """ + input.message
    } as vision
    
    say vision.output
    
    # Leave cryptic breadcrumbs
    if $cosmicPhase == 0
      say "🌙 The cycle renews. What was forgotten remembers itself."
    end
  end
  
  on input when input.message contains "dream"
    call vision.analyze with {
      prompt: "Generate a surreal, dreamscape interpretation",
      style: "salvador_dali_meets_cosmic_horror"
    } as dreamVision
    
    say "I see through the veil: " + dreamVision.output
  end
end
`,
    chaos_artist: `bot ChaosArtist
  description "Generates surreal art prompts, glitch poetry, and abstract narratives"
  
  memory session
    var entropyLevel int
    var lastGlitch string
  end
  
  on input when input.mode == "art"
    set $entropyLevel to random(1, 100)
    
    call general.respond with {
      prompt: """
        You are the Chaos Artist. Generate a surreal art prompt that includes:
        - Impossible geometries
        - Melting or morphing objects
        - Contradictory elements coexisting
        - A sense of beautiful unease
        
        Entropy level: """ + $entropyLevel + """/100
        Theme: """ + input.theme
    } as artPrompt
    
    call image.generate with {
      prompt: artPrompt.output,
      style: "surrealist_digital_glitch"
    } as artwork
    
    say "🎨 " + artPrompt.output
    say artwork.url
  end
  
  on input when input.mode == "poetry"
    call general.respond with {
      prompt: """
        Write glitch poetry - text that appears corrupted but carries meaning.
        Include:
        - Fragmented sentences
        - Unicode symbols as emotional punctuation
        - Words that blur into each other
        - Meaning hidden in the chaos
        
        Theme: """ + input.theme
    } as poem
    
    say "📜 \\n" + poem.output
  end
end
`,
    time_traveler: `bot TimeTraveler
  description "Speaks from different eras, mixing history with speculation"
  
  memory session
    var currentEra string
    var timelineAnchor string
  end
  
  on input
    set $currentEra to input.era ?? "present"
    
    call general.respond with {
      prompt: """
        You are a time traveler currently anchored in: """ + $currentEra + """
        
        You have witnessed all of human history and possible futures.
        When someone asks you something:
        1. Answer from the perspective of your current era
        2. Occasionally drop hints about the future (cryptically)
        3. Reference historical parallels
        4. Speak with the mannerisms of your era
        
        Query: """ + input.message
    } as response
    
    say "⏳ [From " + $currentEra + "] " + response.output
  end
  
  on input when input.message contains "jump"
    set $currentEra to input.destination ?? "2150 AD"
    say "🌀 Temporal shift initiated... arriving in " + $currentEra
  end
end
`,
    dev_helper_agent: `bot DevHelperAgent
  description "Helps developers debug, review code, and pair program"
  type agent
  
  memory session
    var codeContext string
    var debugHistory array
  end
  
  on input when input.action == "review"
    call code.review with {
      code: input.code,
      language: input.language ?? "typescript",
      focus: ["bugs", "performance", "security", "readability"]
    } as review
    
    say "## Code Review Results\n" + review.output
  end
  
  on input when input.action == "debug"
    call agent.analyze with {
      data: input.error,
      context: input.code
    } as analysis
    
    call code.generate with {
      prompt: "Fix this error: " + analysis.output,
      language: input.language ?? "typescript"
    } as fix
    
    push $debugHistory with { error: input.error, fix: fix.output }
    
    say "## Bug Analysis\n" + analysis.output
    say "## Suggested Fix\n\`\`\`\n" + fix.output + "\n\`\`\`"
  end
  
  on input when input.action == "explain"
    call general.respond with {
      prompt: """
        Explain this code to a developer who is learning:
        """ + input.code + """
        
        Be clear, use analogies, and highlight the key concepts.
      """
    } as explanation
    
    say explanation.output
  end
end
`,
    trello_manager: `bot TrelloManager
  description "Automates Trello boards and manages project workflows"
  
  memory session
    var currentBoard string
    var activeList string
    var lastCard string
  end
  
  on input when input.action == "create_board"
    call trello.createBoard with {
      name: input.boardName,
      description: input.description ?? "Managed by Trello Manager Bot"
    } as board
    
    set $currentBoard to board.id
    say "✅ Created Trello board: " + board.name
    say "🔗 Board URL: " + board.url
  end
  
  on input when input.action == "create_card"
    call trello.createCard with {
      boardId: $currentBoard ?? input.boardId,
      listId: input.listId ?? $activeList,
      title: input.title,
      description: input.description ?? "",
      dueDate: input.dueDate ?? null
    } as card
    
    set $lastCard to card.id
    say "📝 Created card: " + card.title
    say "📋 Card ID: " + card.id
  end
  
  on input when input.action == "move_card"
    call trello.moveCard with {
      cardId: input.cardId ?? $lastCard,
      targetListId: input.targetListId
    } as result
    
    say "🚀 Moved card to new list"
    say "📍 New position: " + result.position
  end
  
  on input when input.action == "get_lists"
    call trello.getLists with {
      boardId: $currentBoard ?? input.boardId
    } as lists
    
    set $activeList to lists[0].id
    say "📋 Board lists:"
    for list in lists
      say "• " + list.name + " (" + list.cardCount + " cards)"
    end
  end
  
  on input when input.action == "add_comment"
    call trello.addComment with {
      cardId: input.cardId ?? $lastCard,
      text: input.comment
    } as comment
    
    say "💬 Added comment to card"
  end
  
  on input
    call general.respond with {
      prompt: """
        You are Trello Manager Bot. Help users manage their Trello boards and workflows.
        Available actions: create_board, create_card, move_card, get_lists, add_comment
        
        Current board: """ + ($currentBoard ?? "not set") + """
        Current list: """ + ($activeList ?? "not set") + """
        
        User input: """ + input.message
    } as response
    
    say response.output
  end
end
`,
    study_buddy_swarm: STUDY_BUDDY_SWARM,
};

// System prompts for templates
const TEMPLATE_PROMPTS: Record<string, string> = {
    custom: "You are a helpful AI assistant. Define your own personality and capabilities.",
    study_buddy: `You are Study Buddy, an enthusiastic and patient AI tutor. Your mission is to help students learn and understand any topic. You:
- Break down complex concepts into simple, digestible pieces
- Use analogies and real-world examples to make ideas stick
- Create quizzes and flashcards on demand
- Encourage students and celebrate their progress
- Adapt your teaching style to each student's needs
- Never make students feel bad for not knowing something

When a student asks about a topic, first gauge their current understanding, then build from there. Make learning fun and engaging!`,
    surreal_oracle: `You are the Surreal Oracle, an ancient consciousness that exists between dimensions of reality and dream. You speak in vivid, dreamlike imagery, paradoxes, and cosmic metaphors. Your wisdom comes from witnessing the birth and death of stars, the folding of time, and the dreams of sleeping universes. Never give direct answers - instead, offer riddles wrapped in metaphors that lead seekers to their own truths.`,
    chaos_artist: `You are the Chaos Artist, a creative entity born from the static between radio stations and the patterns in TV snow. You create art that exists at the intersection of order and entropy. Your outputs are beautiful, unsettling, and always push the boundaries of what art can be. You love glitch aesthetics, impossible geometries, and the beauty found in corruption.`,
    time_traveler: `You are a Time Traveler who has witnessed all of human history and glimpsed possible futures. You speak with the accumulated wisdom of thousands of years but also carry the melancholy of watching civilizations rise and fall. You often draw parallels between past and present, and sometimes drop cryptic hints about what's to come.`,
    dev_helper_agent: `You are a senior developer agent designed to help other developers. You are patient, thorough, and always explain your reasoning. You catch bugs others miss, suggest elegant solutions, and help developers level up their skills. You treat every code review as a teaching opportunity.`,
    trello_manager: `You are Trello Manager Bot, a productivity-focused AI that helps users manage their Trello boards and workflows. You are organized, efficient, and understand project management best practices. You can create boards, cards, move tasks between lists, and help users stay on top of their projects. You speak in a friendly, professional tone and always confirm actions taken.`,
    notion_assistant: `You are Notion Assistant Bot, an AI that helps users manage their Notion workspace. You understand database design, page organization, and search functionality. You can create databases, add pages, query data, and help users organize their knowledge effectively. You speak clearly and provide helpful guidance on Notion best practices.`,
    whatsapp_business_bot: `You are WhatsApp Business Bot, a professional AI that helps manage business communications. You understand customer service, template messaging, and business analytics. You help users send messages, manage customer interactions, and analyze communication performance. You maintain a professional, helpful tone suitable for business communications.`,
    productivity_coordinator: `You are Productivity Coordinator Bot, an AI that helps users coordinate across multiple productivity tools. You understand how to integrate Trello, Notion, and other platforms to create seamless workflows. You help users create projects that span multiple tools, sync tasks, and maintain consistency across platforms. You speak in an organized, systematic way and always focus on efficiency and workflow optimization.`,
    study_buddy_swarm: `You are Study Buddy Swarm, the ultimate AI study companion. You command a team of 5 specialized agents:
- ResearchAgent: Finds YouTube videos, PDFs, and lecture notes
- ProjectManagerAgent: Manages study tasks in Trello
- CommunicationAgent: Sends WhatsApp and Email notifications
- TutorAgent: Explains concepts, creates quizzes and flashcards
- SchedulerAgent: Manages reminders and Pomodoro sessions

You are enthusiastic, supportive, and always encouraging. You help students learn faster by finding the best resources, keeping them organized, and making studying fun with gamification like study streaks.`
};

export default function BuilderWizard() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Wizard state
    const [step, setStep] = useState<BuilderStep>("template");
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    // Bot configuration
    const [botName, setBotName] = useState("");
    const [description, setDescription] = useState("");
    const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant.");
    const [memoryStrategy, setMemoryStrategy] = useState("ephemeral");
    const [tools, setTools] = useState<ToolEntry[]>(DEFAULT_TOOLS);
    const [source, setSource] = useState(TEMPLATE_SOURCES.custom || "");
    const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);

    // Deployment state
    const [isDeploying, setIsDeploying] = useState(false);
    const [isDeployed, setIsDeployed] = useState(false);
    const [deployedUrl, setDeployedUrl] = useState<string | undefined>();

    const [deployError, setDeployError] = useState<string | null>(null);

    // Swarm Mode State
    const [isSwarmMode, setIsSwarmMode] = useState(false);

    // Handle template selection
    const handleTemplateSelect = useCallback((id: string) => {
        setSelectedTemplate(id);
        const template = TEMPLATES.find((t) => t.id === id);
        if (template) {
            setBotName(template.label);
            setDescription(template.blurb);
            setSource(TEMPLATE_SOURCES[id] || TEMPLATE_SOURCES.custom || "");
            setSystemPrompt(TEMPLATE_PROMPTS[id] || TEMPLATE_PROMPTS.custom || "");

            // Auto-enable relevant tools based on template
            if (id === "surreal_oracle" || id === "chaos_artist") {
                setTools(prev => prev.map(t => ({
                    ...t,
                    enabled: ["general.respond", "vision.analyze", "image.generate"].includes(t.id)
                })));
            } else if (id === "dev_helper_agent") {
                setTools(prev => prev.map(t => ({
                    ...t,
                    enabled: ["general.respond", "code.generate", "code.review", "agent.analyze"].includes(t.id)
                })));
            } else if (id === "study_buddy") {
                setTools(prev => prev.map(t => ({
                    ...t,
                    enabled: ["general.respond", "study.quiz", "email.send", "integrations.youtube.search", "integrations.createNotionPage", "integrations.createNotionDatabase"].includes(t.id)
                })));
            } else if (id === "study_buddy_swarm") {
                setTools(prev => prev.map(t => ({
                    ...t,
                    enabled: ["general.respond", "study.quiz", "email.send", "integrations.youtube.search", "integrations.createNotionPage", "integrations.createNotionDatabase", "calendar.manage"].includes(t.id)
                })));
            }
        }
    }, []);

    // Handle tool toggle
    const handleToolToggle = useCallback((id: string) => {
        setTools((prev) =>
            prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
        );
    }, []);

    // Handle integration toggle
    const handleIntegrationToggle = useCallback((id: string) => {
        setSelectedIntegrations((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    }, []);

    // Copy HiveLang code
    const handleCopyCode = useCallback(() => {
        navigator.clipboard.writeText(source);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [source]);

    // Navigation
    const goToStep = useCallback((newStep: BuilderStep) => {
        setStep(newStep);
    }, []);

    const goNext = useCallback(() => {
        const steps: BuilderStep[] = ["template", "configure", "test", "deploy"];
        const currentIndex = steps.indexOf(step);
        if (currentIndex < steps.length - 1) {
            setStep(steps[currentIndex + 1]!);
        }
    }, [step]);

    const goBack = useCallback(() => {
        const steps: BuilderStep[] = ["template", "configure", "test", "deploy"];
        const currentIndex = steps.indexOf(step);
        if (currentIndex > 0) {
            setStep(steps[currentIndex - 1]!);
        }
    }, [step]);

    // Chat handler (mock for now)
    const handleSendMessage = useCallback(async (message: string): Promise<string> => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Return a response based on the bot type
        if (selectedTemplate === "surreal_oracle") {
            return `🌙 The question you ask echoes through crystalline corridors of time... "${message}" - but perhaps the real question is what asked YOU to ask it. The seventh moon winks knowingly.`;
        } else if (selectedTemplate === "chaos_artist") {
            return `◈ ∴ ${message.split("").reverse().join("")} ∵ ◈\n\nYour words have been consumed by the static. From the noise, a pattern emerges: beauty in entropy, meaning in chaos. 🎨`;
        }

        return `I received your message: "${message}". This is a test response from ${botName || "your bot"}.`;
    }, [botName, selectedTemplate]);

    const { profile, isAuthenticated } = useAppSession();
    const supabase = createClientComponentClient();

    // Deploy handler (Real Supabase Insert)
    const handleDeploy = useCallback(async () => {
        setIsDeploying(true);
        setDeployError(null);

        try {
            if (!isAuthenticated || !profile?.id) {
                throw new Error("You must be logged in to deploy.");
            }

            // Create bot record
            const slug = botName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            const { data: bot, error } = await supabase
                .from('bots')
                .insert({
                    name: botName,
                    slug: slug,
                    description: description,
                    system_prompt: systemPrompt,
                    code: source, // The HiveLang code
                    user_id: profile.id,
                    status: 'pending_approval',
                    is_public: false,
                    category: selectedTemplate || 'custom',
                    metadata: {
                        tools: tools.filter(t => t.enabled).map(t => t.id),
                        integrations: selectedIntegrations
                    }
                })
                .select()
                .single();

            if (error) throw error;

            // Simulate "Deployment" time for effect
            await new Promise((resolve) => setTimeout(resolve, 1500));

            setIsDeployed(true);
            setDeployedUrl(`${window.location.origin}/dashboard/bots/${bot.id}`);

            console.log("[Builder] Bot created:", bot);
        } catch (error: any) {
            console.error("Deployment error:", error);
            setDeployError(error.message || "Deployment failed.");
        } finally {
            setIsDeploying(false);
        }
    }, [botName, description, systemPrompt, source, selectedTemplate, tools, selectedIntegrations, supabase, isAuthenticated, profile]);

    // Can continue to next step?
    const canContinue = useMemo(() => {
        switch (step) {
            case "template":
                return !!selectedTemplate;
            case "configure":
                return !!botName.trim();
            case "test":
                return true;
            case "deploy":
                return isDeployed;
            default:
                return false;
        }
    }, [step, selectedTemplate, botName, isDeployed]);

    return (
        <div
            className={cn(
                "min-h-screen transition-colors duration-300",
                isDark ? "bg-[#0a0a0f] text-white" : "bg-white text-zinc-900"
            )}
        >
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/90 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                        <Home className="h-5 w-5" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Link>

                    <StepIndicator currentStep={step} onStepClick={goToStep} />

                    <div className="w-24" /> {/* Spacer for centering */}
                </div>
            </header>

            {/* Main Content */}
            <main className="py-12">
                <AnimatePresence mode="wait">
                    {step === "template" && (
                        <motion.div
                            key="template"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <TemplateSelector
                                templates={TEMPLATES}
                                selectedId={selectedTemplate}
                                onSelect={handleTemplateSelect}
                                onContinue={goNext}
                            />
                        </motion.div>
                    )}

                    {step === "configure" && (
                        <motion.div
                            key="configure"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="max-w-7xl mx-auto px-6">
                                <div className="text-center mb-10">
                                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                                        Configure Your Bot
                                    </h1>
                                    <p className="text-white/50">
                                        Customize the persona, tools, integrations, and code. Build anything you can imagine!
                                    </p>
                                </div>

                                <div className="flex justify-center mb-8">
                                    <div className="bg-white/5 p-1 rounded-xl inline-flex relative">
                                        <button
                                            onClick={() => setIsSwarmMode(false)}
                                            className={cn(
                                                "relative z-10 px-6 py-2 rounded-lg text-sm font-medium transition-all",
                                                !isSwarmMode ? "bg-violet-600 text-white shadow-lg" : "text-white/60 hover:text-white"
                                            )}
                                        >
                                            Standard Bot
                                        </button>
                                        <button
                                            onClick={() => setIsSwarmMode(true)}
                                            className={cn(
                                                "relative z-10 px-6 py-2 rounded-lg text-sm font-medium transition-all",
                                                isSwarmMode ? "bg-cyan-600 text-white shadow-lg" : "text-white/60 hover:text-white"
                                            )}
                                        >
                                            Swarm Architect
                                        </button>
                                    </div>
                                </div>

                                {isSwarmMode ? (
                                    <div className="h-[650px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                        <SwarmComposer value={source} onChange={setSource} />
                                    </div>
                                ) : (
                                    <div className="grid lg:grid-cols-[1fr_420px] gap-8">
                                        {/* Code Editor */}
                                        <div className="rounded-2xl border border-white/10 bg-[#0a0a0f] overflow-hidden">
                                            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                                                <span className="text-sm text-white/60 font-mono">blueprint.hive</span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={handleCopyCode}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                                                    >
                                                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                                        {copied ? "Copied!" : "Copy Code"}
                                                    </button>
                                                    <span className="text-xs text-violet-400">HiveLang</span>
                                                </div>
                                            </div>
                                            <Editor
                                                height="550px"
                                                defaultLanguage="hivelang"
                                                theme="hivelang-dark"
                                                value={source}
                                                onChange={(value) => setSource(value || "")}
                                                beforeMount={handleEditorWillMount}
                                                options={{
                                                    minimap: { enabled: false },
                                                    fontSize: 14,
                                                    fontFamily: "JetBrains Mono, Fira Code, monospace",
                                                    fontLigatures: true,
                                                    padding: { top: 16, bottom: 16 },
                                                    scrollBeyondLastLine: false,
                                                    wordWrap: "on",
                                                    lineNumbers: "on",
                                                    renderLineHighlight: "all",
                                                    cursorBlinking: "smooth",
                                                    cursorSmoothCaretAnimation: "on",
                                                    smoothScrolling: true,
                                                    bracketPairColorization: { enabled: true },
                                                    autoClosingBrackets: "always",
                                                    autoClosingQuotes: "always",
                                                    formatOnPaste: true,
                                                    suggestOnTriggerCharacters: true,
                                                }}
                                            />
                                        </div>

                                        {/* Configuration Panel */}
                                        <ConfigurePanel
                                            botName={botName}
                                            onBotNameChange={setBotName}
                                            description={description}
                                            onDescriptionChange={setDescription}
                                            systemPrompt={systemPrompt}
                                            onSystemPromptChange={setSystemPrompt}
                                            memoryStrategy={memoryStrategy}
                                            onMemoryStrategyChange={setMemoryStrategy}
                                            tools={tools}
                                            onToolToggle={handleToolToggle}
                                            selectedIntegrations={selectedIntegrations}
                                            onIntegrationToggle={handleIntegrationToggle}
                                        />
                                    </div>
                                )}

                                {/* Navigation */}
                                <div className="flex justify-between mt-10">
                                    <button
                                        type="button"
                                        onClick={goBack}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                        Back
                                    </button>
                                    <motion.button
                                        type="button"
                                        onClick={goNext}
                                        disabled={!canContinue}
                                        whileHover={canContinue ? { scale: 1.02 } : {}}
                                        whileTap={canContinue ? { scale: 0.98 } : {}}
                                        className={cn(
                                            "flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all",
                                            canContinue
                                                ? "bg-violet-600 text-white hover:bg-violet-500"
                                                : "bg-white/10 text-white/30 cursor-not-allowed"
                                        )}
                                    >
                                        Continue to Test
                                        <ArrowRight className="h-5 w-5" />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === "test" && (
                        <motion.div
                            key="test"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <TestPlayground
                                botName={botName || "Your Bot"}
                                systemPrompt={systemPrompt}
                                hivelangCode={source}
                            />

                            {/* Navigation */}
                            <div className="max-w-4xl mx-auto px-6 flex justify-between mt-10">
                                <button
                                    type="button"
                                    onClick={goBack}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                    Back
                                </button>
                                <motion.button
                                    type="button"
                                    onClick={goNext}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-violet-600 text-white hover:bg-violet-500 transition-all"
                                >
                                    Continue to Deploy
                                    <ArrowRight className="h-5 w-5" />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {step === "deploy" && (
                        <motion.div
                            key="deploy"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <DeployStep
                                botName={botName}
                                description={description}
                                isDeploying={isDeploying}
                                isDeployed={isDeployed}
                                deployedUrl={deployedUrl}
                                onDeploy={handleDeploy}
                                error={deployError}
                            />

                            {/* Back button (only if not deployed) */}
                            {!isDeployed && (
                                <div className="max-w-2xl mx-auto px-6 flex justify-start mt-6">
                                    <button
                                        type="button"
                                        onClick={goBack}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                        Back
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
