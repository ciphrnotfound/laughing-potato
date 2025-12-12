export const BLOG_POSTS = [
    {
        id: "introducing-hivelang",
        title: "Introducing HiveLang: A Declarative Language for AI Agents",
        excerpt: "Today we're launching HiveLang — a domain-specific language that makes building AI agents as intuitive as describing what you want them to do.",
        content: `
# Introducing HiveLang

We believe that building AI agents shouldn't require a PhD in Machine Learning. It should be as simple as describing a workflow.

That's why we built **HiveLang**.

## What is HiveLang?

HiveLang is a declarative, human-readable language designed specifically for orchestrating AI agents. It abstracts away the complexity of context management, tool calling, and memory persistence.

\`\`\`ruby
bot ResearchAssistant
  description "Helps gather information from the web"
  
  agent Searcher
    on input
      call browser.search with { query: input }
    end
  end
end
\`\`\`

## Key Features

1. **Declarative Syntax**: Focus on *what* the agent should do, not *how*.
2. **Type Safety**: Built-in validation for tool inputs and outputs.
3. **Seamless Orchestration**: Define multi-agent swarms in a single file.

Try it out in the Agent Builder today!
    `,
        category: "Product",
        date: "Dec 10, 2024",
        readTime: "5 min read",
        author: "Shay",
        featured: true,
        image: "/blog/hivelang.png",
    },
    {
        id: "agent-orchestration",
        title: "The Future of AI: Why Agent Orchestration Matters",
        excerpt: "As AI models become more capable, the real power lies in how we coordinate them. Here's why agent orchestration is the next frontier.",
        content: `
# The Future of AI is Orchestration

Single LLMs are powerful, but they are generalists. To solve complex, real-world problems, we need specialists working together.

## The Swarm Approach

Imagine a team of experts:
- A researcher offering data.
- A writer drafting content.
- A critic reviewing the work.

This is **Agent Orchestration**. By breaking tasks down into specialized sub-agents, we reduce hallucinations and improve accuracy.

## BotHive's Role

BotHive provides the infrastructure to run these swarms at scale. We handle the state, the memory, and the inter-agent communication protocols.
    `,
        category: "Insights",
        date: "Dec 8, 2024",
        readTime: "7 min read",
        author: "Shay",
        featured: true,
        image: "/blog/orchestration.png",
    },
    {
        id: "building-memory",
        title: "Building Long-Term Memory for AI Agents",
        excerpt: "How we're implementing persistent memory in HiveMind to create truly personalized AI experiences.",
        content: `
# Memory: The Missing Piece

Conversations with AI often feel ephemeral. You close the tab, and the context is gone.

We're changing that with **HiveMind Memory**.

## Semantic Search + Graph Database

We combine vector embeddings (for semantic relevance) with knowledge graphs (for structured relationships). This allows agents to remember not just *what* you said, but *how* it relates to your goals.

## Privacy First

Your memory graph is encrypted and isolated. We believe your thoughts belong to you.
    `,
        category: "Engineering",
        date: "Dec 5, 2024",
        readTime: "8 min read",
        author: "Shay",
        featured: false,
    },
    {
        id: "marketplace-launch",
        title: "Announcing the BotHive Marketplace",
        excerpt: "A new way for creators to monetize their AI agents and for users to discover powerful automation tools.",
        content: `
# The BotHive Marketplace is Live!

We are thrilled to open the doors to the **BotHive Marketplace**.

## For Creators
Publish your specialized agents and earn revenue every time they are used. Whether it's a "Legal Contract Reviewer" or a "Python Debugger", your expertise has value.

## For Users
Discover pre-built solution swarms. Don't reinvent the wheel—deploy a proven team of agents in seconds.
    `,
        category: "Announcement",
        date: "Dec 1, 2024",
        readTime: "4 min read",
        author: "Shay",
        featured: false,
    },
    {
        id: "security-first",
        title: "Security-First: How We Protect Your Data",
        excerpt: "An inside look at our security architecture and why we'll never train on your data.",
        content: `
# Our Security Promise

In the age of AI, data privacy is paramount. Here is how BotHive keeps your data safe.

1. **No Training on User Data**: We never use your inputs or outputs to train our base models.
2. **SOC 2 Compliance**: We are currently undergoing SOC 2 Type II attestation.
3. **End-to-End Encryption**: Data is encrypted at rest and in transit.
    `,
        category: "Security",
        date: "Nov 28, 2024",
        readTime: "6 min read",
        author: "Shay",
        featured: false,
    },
    {
        id: "swarm-intelligence",
        title: "Swarm Intelligence: When AI Agents Collaborate",
        excerpt: "Exploring how multiple AI agents can work together to solve complex problems that single agents cannot.",
        content: `
# The Power of the Swarm

Nature shows us that simple rules can lead to complex, intelligent behavior. Ants, bees, and starlings demonstrate **Swarm Intelligence**.

We are applying these principles to AI.

## Emergent Behavior

When you connect multiple agents with different system prompts and tools, you often see emergent problem-solving strategies that no single agent possessed alone. This is the frontier we are exploring at BotHive.
    `,
        category: "Research",
        date: "Nov 25, 2024",
        readTime: "10 min read",
        author: "Shay",
        featured: false,
    },
];

export const CATEGORIES = ["All", "Product", "Engineering", "Insights", "Announcement", "Security", "Research"];
