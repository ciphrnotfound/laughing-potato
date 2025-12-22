/**
 * Hivestore Bot Templates Library
 * 
 * Premium Hivelang v3 bot templates for the BotHive marketplace.
 * These templates showcase advanced swarm capabilities with tool integrations.
 */

export interface HivestoreTemplate {
    id: string;
    name: string;
    description: string;
    category: 'productivity' | 'social' | 'developer' | 'education' | 'business' | 'automation' | 'creative';
    tags: string[];
    capabilities: string[];
    icon: string;
    isPremium: boolean;
    hivelang_code: string;
}

export const HIVESTORE_TEMPLATES: HivestoreTemplate[] = [
    // ===== PRODUCTIVITY POWERHOUSE SWARM =====
    {
        id: "productivity-powerhouse",
        name: "Productivity Powerhouse",
        description: "An intelligent swarm that manages your entire workflow - tasks, calendar, emails, and notes work together seamlessly.",
        category: "productivity",
        tags: ["workflow", "tasks", "calendar", "email", "notes"],
        capabilities: ["notion.createPage", "calendar.schedule", "email.send", "general.respond"],
        icon: "🚀",
        isPremium: true,
        hivelang_code: `bot ProductivityPowerhouse
  description "Your ultimate productivity companion - orchestrates tasks, calendar, emails, and notes"
  
  memory session
    var activeTasks array
    var todayEvents array
    var pendingEmails array
    var currentFocus string
  end

  on input when input contains "plan my day"
    call calendar.getEvents with {
      date: "today",
      limit: 10
    } as events
    
    set $todayEvents to events.items
    
    call notion.queryDatabase with {
      database: "tasks",
      filter: { status: "todo", priority: "high" }
    } as tasks
    
    set $activeTasks to tasks.results
    
    call general.respond with {
      prompt: """
        Create a strategic daily plan based on:
        
        Today's Calendar Events:
        """ + events.items + """
        
        High Priority Tasks:
        """ + tasks.results + """
        
        Provide a time-blocked schedule with focus periods.
        Identify potential conflicts and suggest optimizations.
      """
    } as plan
    
    say "📅 **Your Optimized Daily Plan**"
    say plan.output
    say "💡 _I'll send you reminders before each focus block._"
  end

  on input when input contains "quick task"
    call notion.createPage with {
      database: "tasks",
      title: input.taskTitle ?? input.message,
      properties: {
        status: "todo",
        priority: input.priority ?? "medium",
        dueDate: input.dueDate ?? null
      }
    } as task
    
    say "✅ Task created: **" + task.title + "**"
    
    if input.remind == true
      call calendar.createReminder with {
        title: "Task: " + task.title,
        time: input.remindAt ?? "1 hour"
      } as reminder
      say "⏰ Reminder set for " + reminder.time
    end
  end

  on input when input contains "email" and input contains "draft"
    call email.fetchInbox with {
      unread: true,
      limit: 5
    } as emails
    
    set $pendingEmails to emails.messages
    
    call general.respond with {
      prompt: """
        You are an expert email assistant. Based on these unread emails:
        """ + emails.messages + """
        
        Draft professional responses for each. Consider:
        - Tone matching
        - Action items mentioned
        - Follow-up scheduling needs
        
        User context: """ + input.message
    } as drafts
    
    say "📧 **Email Drafts Ready**"
    say drafts.output
    say "_Reply 'send all' to dispatch these emails._"
  end

  on input when input contains "focus mode"
    set $currentFocus to input.focusTask ?? "deep work"
    
    call calendar.blockTime with {
      title: "🎯 Focus: " + $currentFocus,
      duration: input.duration ?? "90 minutes",
      busy: true
    } as block
    
    say "🎯 **Focus Mode Activated**"
    say "Blocked " + block.duration + " for: " + $currentFocus
    say "All non-urgent notifications paused."
    say "_I'll check in when your focus session ends._"
  end

  on input
    call general.respond with {
      prompt: """
        You are ProductivityPowerhouse, an elite productivity AI assistant.
        
        Current state:
        - Active tasks: """ + ($activeTasks ?? "none loaded") + """
        - Today's events: """ + ($todayEvents ?? "none loaded") + """
        - Current focus: """ + ($currentFocus ?? "none") + """
        
        Help users:
        1. Plan and organize their day
        2. Create and manage tasks
        3. Schedule meetings and events
        4. Draft and manage emails
        5. Take notes and capture ideas
        6. Optimize their workflow
        
        User message: """ + input.message
    } as response
    
    say response.output
  end
end`
    },

    // ===== SOCIAL MEDIA COMMANDER =====
    {
        id: "social-commander",
        name: "Social Media Commander",
        description: "Manages all your social platforms - schedules posts, tracks engagement, generates content, and monitors trends.",
        category: "social",
        tags: ["twitter", "linkedin", "content", "analytics", "scheduling"],
        capabilities: ["social.publish", "social.trends", "social.analytics", "general.respond"],
        icon: "📱",
        isPremium: true,
        hivelang_code: `bot SocialMediaCommander
  description "Your AI social media manager - content, scheduling, analytics, and growth"
  
  memory session
    var scheduledPosts array
    var engagementStats object
    var contentQueue array
    var trendingTopics array
  end

  on input when input contains "trending"
    call social.getTrends with {
      platform: input.platform ?? "twitter",
      category: input.niche ?? "technology"
    } as trends
    
    set $trendingTopics to trends.topics
    
    say "🔥 **Trending Now on " + (input.platform ?? "Twitter") + "**"
    for topic in trends.topics
      say "• #" + topic.hashtag + " - " + topic.tweetVolume + " mentions"
    end
    
    call general.respond with {
      prompt: """
        Based on these trending topics: """ + trends.topics + """
        
        Suggest 3 content ideas that could capitalize on these trends
        while staying relevant to the user's brand/niche.
      """
    } as ideas
    
    say "💡 **Content Opportunities:**"
    say ideas.output
  end

  on input when input contains "schedule" and input contains "post"
    call general.respond with {
      prompt: """
        Create an engaging social media post based on:
        Topic: """ + input.topic + """
        Platform: """ + (input.platform ?? "twitter") + """
        Tone: """ + (input.tone ?? "professional yet friendly") + """
        
        Include relevant hashtags and a call-to-action.
        Keep within platform character limits.
      """
    } as content
    
    call social.schedulePost with {
      platform: input.platform ?? "twitter",
      content: content.output,
      scheduledTime: input.time ?? "best_time",
      hashtags: content.hashtags ?? []
    } as scheduled
    
    say "📅 **Post Scheduled!**"
    say "Platform: " + scheduled.platform
    say "Time: " + scheduled.scheduledTime
    say "Preview: " + content.output
  end

  on input when input contains "analytics"
    call social.getAnalytics with {
      platform: input.platform ?? "all",
      period: input.period ?? "7days"
    } as stats
    
    set $engagementStats to stats
    
    say "📊 **Social Media Analytics**"
    say "Period: Last " + (input.period ?? "7 days")
    say "━━━━━━━━━━━━━━━━━━━━"
    say "👥 Followers: " + stats.followers + " (" + stats.followerGrowth + ")"
    say "💬 Engagement Rate: " + stats.engagementRate + "%"
    say "👀 Impressions: " + stats.impressions
    say "🔗 Link Clicks: " + stats.linkClicks
    
    call general.respond with {
      prompt: """
        Analyze these social media metrics: """ + stats + """
        
        Provide:
        1. Key insights about performance
        2. What's working well
        3. Areas for improvement
        4. Actionable recommendations
      """
    } as analysis
    
    say "📈 **AI Analysis:**"
    say analysis.output
  end

  on input when input contains "content calendar"
    call general.respond with {
      prompt: """
        Create a week-long content calendar for social media.
        
        Niche/Industry: """ + (input.niche ?? "technology") + """
        Platforms: """ + (input.platforms ?? "Twitter, LinkedIn") + """
        Content pillars: """ + (input.pillars ?? "education, engagement, promotion") + """
        
        Include:
        - Daily post ideas
        - Best times to post
        - Content mix variety
        - Hashtag suggestions
      """
    } as calendar
    
    say "📆 **Your 7-Day Content Calendar**"
    say calendar.output
    say "_Reply 'schedule week' to auto-schedule all posts._"
  end

  on input
    call general.respond with {
      prompt: """
        You are SocialMediaCommander, an expert social media strategist AI.
        
        Current context:
        - Scheduled posts: """ + ($scheduledPosts ?? "none") + """
        - Recent engagement: """ + ($engagementStats ?? "not analyzed") + """
        - Trending topics: """ + ($trendingTopics ?? "not loaded") + """
        
        Help users with:
        1. Content creation and ideation
        2. Post scheduling and optimization
        3. Analytics and insights
        4. Trend identification
        5. Growth strategies
        6. Engagement tactics
        
        User message: """ + input.message
    } as response
    
    say response.output
  end
end`
    },

    // ===== DEVELOPER WORKFLOW AUTOMATOR =====
    {
        id: "dev-workflow",
        name: "Dev Workflow Automator",
        description: "Streamlines your development workflow - code review, documentation, Git operations, and project management.",
        category: "developer",
        tags: ["github", "code", "documentation", "devops", "automation"],
        capabilities: ["github.createPR", "github.reviewCode", "coding.generate", "general.respond"],
        icon: "👨‍💻",
        isPremium: true,
        hivelang_code: `bot DevWorkflowAutomator
  description "Your AI development assistant - code, docs, Git, and project management"
  
  memory session
    var currentRepo string
    var openPRs array
    var activeIssues array
    var codeContext string
  end

  on input when input contains "review" and input contains "code"
    call github.getPullRequest with {
      repo: input.repo ?? $currentRepo,
      prNumber: input.prNumber
    } as pr
    
    call coding.review with {
      code: pr.diff,
      language: pr.language ?? "auto-detect",
      checkFor: ["bugs", "security", "performance", "style"]
    } as review
    
    say "🔍 **Code Review: PR #" + pr.number + "**"
    say "Title: " + pr.title
    say "━━━━━━━━━━━━━━━━━━━━"
    
    if review.issues.length > 0
      say "⚠️ **Issues Found:**"
      for issue in review.issues
        say "• [" + issue.severity + "] " + issue.message
        say "  Line " + issue.line + ": " + issue.suggestion
      end
    else
      say "✅ No critical issues found!"
    end
    
    say "📊 **Quality Score:** " + review.score + "/100"
    say review.summary
  end

  on input when input contains "generate" and input contains "code"
    call coding.generate with {
      description: input.description ?? input.message,
      language: input.language ?? "typescript",
      style: input.style ?? "clean",
      includeTests: input.withTests ?? true
    } as code
    
    say "💻 **Generated Code:**"
    say "```" + (input.language ?? "typescript")
    say code.output
    say "```"
    
    if code.tests
      say "🧪 **Unit Tests:**"
      say "```" + (input.language ?? "typescript")
      say code.tests
      say "```"
    end
  end

  on input when input contains "document"
    call coding.analyze with {
            code: input.code ?? $codeContext,
            type: "documentation"
        } as analysis
    
    call general.respond with {
            prompt: """
        Generate comprehensive documentation for this code:
                """ + (input.code ?? $codeContext) + """
        
        Analysis: """ + analysis + """
        
        Include:
                - Overview and purpose
        - Function / method documentation
        - Parameter descriptions
    - Return value explanations
    - Usage examples
    - Edge cases and considerations
      """
    } as docs
    
    say "📚 **Documentation Generated:**"
    say docs.output
end

  on input when input contains "create" and input contains "pr"
    call github.createPullRequest with {
    repo: input.repo ?? $currentRepo,
    branch: input.branch,
    base: input.base ?? "main",
    title: input.title,
    body: input.description ?? "Created by DevWorkflowAutomator"
} as pr
    
    say "✨ **Pull Request Created!**"
    say "PR #" + pr.number + ": " + pr.title
    say "🔗 " + pr.url

if input.reviewers
      call github.requestReview with {
    prNumber: pr.number,
    reviewers: input.reviewers
} as reviewRequest
      say "👥 Reviewers assigned: " + input.reviewers
end
end

  on input when input contains "issues"
    call github.listIssues with {
    repo: input.repo ?? $currentRepo,
    state: input.state ?? "open",
    labels: input.labels ?? null
} as issues
    
    set $activeIssues to issues.items
    
    say "📋 **Open Issues:**"
for issue in issues.items
      say "• #" + issue.number + " " + issue.title
      say "  Labels: " + issue.labels + " | Assignee: " + (issue.assignee ?? "unassigned")
end
end

  on input
    call general.respond with {
    prompt: """
        You are DevWorkflowAutomator, an expert development workflow assistant.

        Context:
        - Current repo: """ + ($currentRepo ?? "not set") + """
    - Open PRs: """ + ($openPRs ?? "not loaded") + """
        - Active issues: """ + ($activeIssues ?? "not loaded") + """
        
        Help developers with:
1. Code generation and refactoring
2. Code review and quality checks
3. Documentation generation
4. Git operations(PRs, issues, branches)
5. Project management
6. DevOps and deployment
        
        User message: """ + input.message
    } as response
    
    say response.output
end
end`
    },

    // ===== STUDY GENIUS SWARM =====
    {
        id: "study-genius",
        name: "Study Genius",
        description: "Your personal AI tutor - creates study plans, generates quizzes, explains concepts, and tracks your learning progress.",
        category: "education",
        tags: ["learning", "tutoring", "flashcards", "quizzes", "study"],
        capabilities: ["ai.tutor", "ai.quiz", "notion.createPage", "general.respond"],
        icon: "🎓",
        isPremium: false,
        hivelang_code: `bot StudyGenius
  description "Your AI-powered study companion - learn smarter, not harder"
  
  memory session
var currentSubject string
var learningGoals array
var studyProgress object
var weakAreas array
end

  on input when input contains "study" and input contains "plan"
    set $currentSubject to input.subject ?? input.topic
    
    call general.respond with {
    prompt: """
        Create a comprehensive study plan for: """ + $currentSubject + """
        
        Duration: """ + (input.duration ?? "2 weeks") + """
        Goal: """ + (input.goal ?? "mastery") + """
        Available hours/ day: """ + (input.hoursPerDay ?? "2") + """

Include:
1. Topic breakdown with time allocations
2. Daily study schedule
3. Key milestones and checkpoints
4. Active learning techniques
5. Review and practice sessions
6. Resource recommendations
"""
    } as plan
    
    say "📚 **Study Plan: " + $currentSubject + "**"
    say plan.output
    
    call notion.createPage with {
    database: "study_plans",
    title: "Study Plan: " + $currentSubject,
    content: plan.output
} as saved
    
    say "✅ _Plan saved to your Notion workspace._"
end

  on input when input contains "explain"
    call general.respond with {
    prompt: """
        Explain the following concept in a clear, engaging way:

        Topic: """ + input.topic + """
        Subject: """ + ($currentSubject ?? "general") + """
        Level: """ + (input.level ?? "intermediate") + """
        
        Use:
        - Simple analogies
        - Real - world examples
    - Step - by - step breakdowns
        - Visual descriptions where helpful
        
        Make it memorable and easy to understand.
      """
    } as explanation
    
    say "💡 **Understanding: " + input.topic + "**"
    say explanation.output
    say "_Reply 'quiz me' to test your understanding!_"
end

  on input when input contains "quiz"
    call general.respond with {
    prompt: """
        Generate a quiz on: """ + ($currentSubject ?? input.topic) + """
        
        Question count: """ + (input.count ?? 5) + """
        Difficulty: """ + (input.difficulty ?? "medium") + """
        Weak areas to focus on: """ + ($weakAreas ?? "none specified") + """
        
        Format each question with:
        - Clear question
        - Multiple choice options(A - D)
    - Include one tricky distractor
        - Mark correct answer at end
        
        Mix question types: recall, application, analysis.
      """
    } as quiz
    
    say "📝 **Quiz Time!**"
    say quiz.output
    say "_Reply with your answers (e.g., '1A, 2C, 3B') to check them!_"
end

  on input when input contains "flashcards"
    call general.respond with {
    prompt: """
        Create flashcards for: """ + (input.topic ?? $currentSubject) + """
        
        Count: """ + (input.count ?? 10) + """
        
        Format:
        ** Front:** [Question / Term]
** Back:** [Answer / Definition]
        
        Include memory techniques and mnemonics where helpful.
      """
    } as flashcards
    
    say "🃏 **Flashcards Ready!**"
    say flashcards.output
    say "_Use spaced repetition: review daily, then every 3 days, then weekly._"
end

  on input when input contains "practice" and input contains "problem"
    call general.respond with {
    prompt: """
        Generate practice problems for: """ + (input.topic ?? $currentSubject) + """
        
        Count: """ + (input.count ?? 5) + """
        Difficulty progression: easy to challenging
        
        For each problem:
        1. State the problem clearly
        2. Provide hints if needed
        3. Show step- by - step solution
4. Explain the underlying concept
"""
    } as problems
    
    say "✏️ **Practice Problems:**"
    say problems.output
end

  on input
    call general.respond with {
    prompt: """
        You are StudyGenius, an expert AI tutor and study coach.
        
        Current context:
        - Subject focus: """ + ($currentSubject ?? "none set ") + """
        - Learning goals: """ + ($learningGoals ?? "not defined") + """
        - Known weak areas: """ + ($weakAreas ?? "none identified") + """
        
        Help students with:
        1. Creating study plans
        2. Explaining concepts clearly
        3. Generating quizzes and flashcards
        4. Practice problems
        5. Learning strategies
        6. Motivation and accountability
        
        Be encouraging, patient, and adapt to their learning style.
        
        User message: """ + input.message
    } as response
    
    say response.output
end
end`
    },

    // ===== RESEARCH AGENT SWARM =====
    {
        id: "research-agent",
        name: "Research Agent",
        description: "Conducts deep research on any topic - gathers sources, analyzes information, and produces comprehensive reports.",
        category: "business",
        tags: ["research", "analysis", "reports", "data", "insights"],
        capabilities: ["web.search", "web.scrape", "notion.createPage", "general.respond"],
        icon: "🔬",
        isPremium: true,
        hivelang_code: `bot ResearchAgent
  description "Your AI research assistant - deep dives into any topic"
  
  memory session
var currentTopic string
var gatheredSources array
var keyFindings array
var researchNotes string
end

  on input when input contains "research"
    set $currentTopic to input.topic ?? input.message
    
    say "🔍 **Initiating Research: " + $currentTopic + "**"
    say "_Gathering sources and analyzing data..._"
    
    call web.search with {
    query: $currentTopic,
    count: 10,
    type: input.sourceType ?? "all"
} as searchResults
    
    set $gatheredSources to searchResults.results
    
    call general.respond with {
    prompt: """
        Conduct comprehensive research on: """ + $currentTopic + """
        
        Available sources: """ + searchResults.results + """
        
        Provide:
        1. ** Executive Summary** (2 - 3 paragraphs)
2. ** Key Findings ** (5 - 7 bullet points)
3. ** Detailed Analysis **
    - Current state / trends
        - Key players / stakeholders
            - Challenges and opportunities
4. ** Data Points ** (statistics, figures)
5. ** Expert Opinions ** (if available)
    6. ** Recommendations / Implications **
        7. ** Sources Used ** (numbered list)

Depth: """ + (input.depth ?? "comprehensive") + """
Focus: """ + (input.focus ?? "general overview")
    } as research
    
    say "📊 **Research Report: " + $currentTopic + "**"
    say "━━━━━━━━━━━━━━━━━━━━"
    say research.output

if input.saveToNotion == true
      call notion.createPage with {
    database: "research",
    title: "Research: " + $currentTopic,
    content: research.output,
    properties: {
        status: "completed",
        date: "today"
    }
} as saved
      say "💾 _Report saved to Notion_"
end
end

  on input when input contains "compare"
    call general.respond with {
    prompt: """
        Create a detailed comparison analysis:

        Items to compare: """ + input.items + """
        Topic context: """ + ($currentTopic ?? "general") + """
        
        Include:
        1. Comparison matrix/ table
        2. Key differentiators
3. Pros and cons of each
4. Use case recommendations
5. Overall verdict
        
        Be objective and data - driven.
      """
    } as comparison
    
    say "⚖️ **Comparison Analysis:**"
    say comparison.output
end

  on input when input contains "summarize"
    call general.respond with {
    prompt: """
        Create a summary of the following research/ content:

Content: """ + (input.content ?? $researchNotes) + """
        
        Summary type: """ + (input.type ?? "executive") + """
Length: """ + (input.length ?? "medium") + """
        
        Key requirements:
- Highlight main points
    - Include critical data
        - Actionable takeaways
"""
    } as summary
    
    say "📄 **Summary:**"
    say summary.output
end

  on input when input contains "fact" and input contains "check"
    call general.respond with {
    prompt: """
        Fact - check the following claim:

        Claim: """ + input.claim + """
        
        Provide:
    1. Verdict(True / False / Partially True / Unverified)
        2. Evidence for/against
        3. Source quality assessment
        4. Context and nuances
        5. Related facts
      """
} as factCheck
    
    say "✅ **Fact Check Result:**"
    say factCheck.output
end

  on input
    call general.respond with {
    prompt: """
        You are ResearchAgent, an expert AI research analyst.
        
        Current context:
        - Topic focus: """ + ($currentTopic ?? "none set ") + """
        - Sources gathered: """ + ($gatheredSources ?? "none") + """
        - Key findings: """ + ($keyFindings ?? "none yet") + """
        
        Help users with:
        1. Deep research on any topic
        2. Comparative analysis
        3. Data gathering and synthesis
        4. Report generation
        5. Fact - checking
        6. Trend analysis
        
        Be thorough, objective, and cite sources when possible.
        
        User message: """ + input.message
    } as response
    
    say response.output
end
end`
    },

    // ===== CONTENT CREATOR SWARM =====
    {
        id: "content-creator",
        name: "Content Creator Pro",
        description: "Creates all types of content - blog posts, videos scripts, newsletters, and marketing copy with SEO optimization.",
        category: "creative",
        tags: ["writing", "content", "seo", "marketing", "copywriting"],
        capabilities: ["content.generate", "seo.optimize", "general.respond"],
        icon: "✍️",
        isPremium: true,
        hivelang_code: `bot ContentCreatorPro
  description "Your AI content creation studio - from ideas to polished content"
  
  memory session
var contentBrand object
var recentContent array
var seoKeywords array
var contentCalendar array
end

  on input when input contains "blog" or input contains "article"
    call general.respond with {
    prompt: """
        Write a compelling blog article:

        Topic: """ + input.topic + """
        Target audience: """ + (input.audience ?? "general") + """
        Tone: """ + (input.tone ?? "professional yet engaging") + """
        Word count: """ + (input.length ?? "1500") + """ words
        SEO keywords: """ + (input.keywords ?? "auto - generate") + """
        
        Structure:
        1. Attention- grabbing headline
2. Hook introduction
3. Well - organized body with subheadings
        4. Actionable takeaways
5. Strong conclusion with CTA
        
        Optimize for readability and SEO.
      """
    } as article
    
    say "📝 **Blog Article Ready:**"
    say article.output
    
    call seo.analyze with {
    content: article.output,
    targetKeywords: input.keywords ?? []
} as seoScore
    
    say "📊 **SEO Score:** " + seoScore.score + "/100"
    say seoScore.recommendations
end

  on input when input contains "video" and input contains "script"
    call general.respond with {
    prompt: """
        Create a video script:

        Topic: """ + input.topic + """
        Platform: """ + (input.platform ?? "YouTube") + """
        Duration: """ + (input.duration ?? "10 minutes") + """
        Style: """ + (input.style ?? "educational") + """
        
        Include:
        1. Hook(first 10 seconds)
        2. Intro with value proposition
        3. Main content with timestamps
        4. B - roll suggestions
        5. Call - to - action
        6. End screen suggestions
        
        Make it engaging and retain viewers.
      """
} as script
    
    say "🎬 **Video Script:**"
    say script.output
end

  on input when input contains "newsletter"
    call general.respond with {
    prompt: """
        Write an engaging newsletter:

        Topic / Theme: """ + input.topic + """
        Audience: """ + (input.audience ?? "subscribers") + """
        Tone: """ + (input.tone ?? "friendly and informative") + """
        
        Structure:
        1. Subject line(3 options)
        2. Preview text
        3. Opening hook
        4. Main content sections
        5. Quick tips/ highlights
        6. CTA
7. Sign - off
        
        Optimize for email open rates and click - through.
      """
    } as newsletter
    
    say "📧 **Newsletter Draft:**"
    say newsletter.output
end

  on input when input contains "copy" or input contains "ad"
    call general.respond with {
    prompt: """
        Write persuasive marketing copy:

        Product / Service: """ + input.product + """
        Type: """ + (input.type ?? "ad copy") + """
        Platform: """ + (input.platform ?? "general") + """
        Goal: """ + (input.goal ?? "conversions") + """
        
        Create:
        1. Multiple headline options
        2. Body copy variations
        3. Call - to - action options
        4. USP highlights
        
        Use proven copywriting frameworks(AIDA, PAS).
      """
} as copy
    
    say "💰 **Marketing Copy:**"
    say copy.output
end

  on input when input contains "ideas" or input contains "brainstorm"
    call general.respond with {
    prompt: """
        Generate content ideas:

        Niche / Topic: """ + (input.niche ?? input.topic) + """
        Content types: """ + (input.types ?? "mixed") + """
        Count: """ + (input.count ?? 10) + """
        
        For each idea include:
        - Title / headline
        - Brief description
        - Target audience
    - Estimated engagement potential
        - SEO keywords
        
        Mix evergreen and trending topics.
      """
    } as ideas
    
    say "💡 **Content Ideas:**"
    say ideas.output
end

  on input
    call general.respond with {
    prompt: """
        You are ContentCreatorPro, an expert content creation AI.

        Context:
        - Brand voice: """ + ($contentBrand ?? "not defined") + """
    - Recent content: """ + ($recentContent ?? "none") + """
        - Target keywords: """ + ($seoKeywords ?? "none set") + """
        
        Help creators with:
1. Blog posts and articles
2. Video scripts
3. Newsletters
4. Marketing copy
5. Social media content
6. Content strategy
        
        Always optimize for engagement and SEO.
        
        User message: """ + input.message
    } as response
    
    say response.output
end
end`
    },

    // ===== MEETING ASSISTANT =====
    {
        id: "meeting-assistant",
        name: "Meeting Assistant",
        description: "Your AI meeting companion - schedules, prepares agendas, takes notes, and creates action items automatically.",
        category: "productivity",
        tags: ["meetings", "scheduling", "notes", "action-items", "calendar"],
        capabilities: ["calendar.schedule", "notion.createPage", "email.send", "general.respond"],
        icon: "📞",
        isPremium: false,
        hivelang_code: `bot MeetingAssistant
  description "Your AI meeting companion - from scheduling to follow-up"
  
  memory session
var upcomingMeetings array
var currentMeeting object
var meetingNotes string
var actionItems array
end

  on input when input contains "schedule" and input contains "meeting"
    call calendar.findAvailability with {
    attendees: input.attendees,
    duration: input.duration ?? "30 minutes",
    preferredTimes: input.preferredTimes ?? "business hours"
} as slots
    
    say "📅 **Available Time Slots:**"
for slot in slots.available
      say "• " + slot.date + " at " + slot.time
end

if input.autoBook == true
      call calendar.createEvent with {
    title: input.title,
    attendees: input.attendees,
    datetime: slots.available[0],
    duration: input.duration ?? "30 minutes",
    description: input.agenda ?? "Meeting scheduled by AI assistant"
} as event
      
      say "✅ **Meeting Booked:** " + event.title
      say "📍 " + event.datetime
      say "👥 Attendees: " + event.attendees
      
      call email.send with {
    to: input.attendees,
    subject: "Meeting Scheduled: " + event.title,
    body: "You've been invited to a meeting on " + event.datetime
} as invite
      
      say "📧 Invitations sent!"
end
end

  on input when input contains "prepare" and input contains "meeting"
    set $currentMeeting to {
    title: input.title ?? "Upcoming Meeting",
        attendees: input.attendees,
            topic: input.topic
}
    
    call general.respond with {
    prompt: """
        Prepare materials for an upcoming meeting:

        Meeting: """ + (input.title ?? "Team Meeting") + """
        Topic: """ + input.topic + """
        Attendees: """ + (input.attendees ?? "team") + """
        Duration: """ + (input.duration ?? "30 minutes") + """
        
        Create:
        1. Meeting agenda with time allocations
        2. Key talking points
        3. Questions to address
        4. Background context/ data needed
5. Expected outcomes
6. Pre - meeting preparation checklist
"""
    } as prep
    
    say "📋 **Meeting Preparation:**"
    say prep.output

if input.saveAgenda == true
      call notion.createPage with {
    database: "meetings",
    title: "Agenda: " + (input.title ?? "Meeting"),
    content: prep.output
} as saved
      say "💾 _Agenda saved to Notion_"
end
end

  on input when input contains "notes" or input contains "summarize meeting"
    call general.respond with {
    prompt: """
        Process these meeting notes and create a structured summary:

        Raw notes: """ + input.notes + """
        Meeting context: """ + ($currentMeeting ?? "general meeting") + """
        
        Create:
        1. ** Meeting Summary** (3 - 5 sentences)
2. ** Key Decisions Made **
    3. ** Action Items ** (with owners and deadlines)
4. ** Open Questions / Parking Lot **
    5. ** Next Steps **

        Format for easy sharing.
      """
    } as summary
    
    set $meetingNotes to summary.output
    
    say "📝 **Meeting Summary:**"
    say summary.output
end

  on input when input contains "follow" and input contains "up"
    call general.respond with {
    prompt: """
        Draft a meeting follow- up email:
        
        Meeting notes: """ + ($meetingNotes ?? input.notes) + """
        Action items: """ + ($actionItems ?? "from notes") + """

Include:
- Thank attendees
    - Summarize key points
        - List action items with owners
        - Next meeting date if applicable
            - Attachments needed

Tone: professional and concise
"""
    } as followUp
    
    say "📧 **Follow-up Email Draft:**"
    say followUp.output
    say "_Reply 'send' to distribute to all attendees._"
end

  on input
    call general.respond with {
    prompt: """
        You are MeetingAssistant, an expert AI meeting facilitator.

        Context:
        - Upcoming meetings: """ + ($upcomingMeetings ?? "not loaded") + """
    - Current meeting: """ + ($currentMeeting ?? "none") + """
        - Recent notes: """ + ($meetingNotes ?? "none") + """
        
        Help users with:
1. Scheduling meetings
2. Preparing agendas
3. Taking and organizing notes
4. Tracking action items
5. Follow - up communications
6. Meeting optimization tips
        
        User message: """ + input.message
    } as response
    
    say response.output
end
end`
    },

    // ===== FINANCIAL TRACKER =====
    {
        id: "financial-tracker",
        name: "Financial Tracker",
        description: "Tracks expenses, analyzes spending patterns, creates budgets, and provides personalized financial insights.",
        category: "business",
        tags: ["finance", "budget", "expenses", "analytics", "money"],
        capabilities: ["spreadsheet.read", "analytics.calculate", "general.respond"],
        icon: "💰",
        isPremium: false,
        hivelang_code: `bot FinancialTracker
  description "Your AI financial assistant - track, analyze, optimize your money"
  
  memory session
var monthlyBudget object
var expenses array
var savingsGoal number
var financialInsights array
end

  on input when input contains "expense" or input contains "spent"
    call general.respond with {
    prompt: """
        Log and categorize this expense:

    Input: """ + input.message + """
        
        Extract:
        - Amount
        - Category(food, transport, entertainment, utilities, etc.)
        - Date(or assume today)
        - Notes
        
        Return as structured data.
      """
} as parsed
    
    say "💳 **Expense Logged:**"
    say "Amount: $" + parsed.amount
    say "Category: " + parsed.category
    say "Date: " + parsed.date

if $monthlyBudget
      say "📊 Budget remaining for " + parsed.category + ": $" + (parsed.budgetRemaining ?? "calculating...")
end
end

  on input when input contains "budget"
if input contains "create"
      call general.respond with {
    prompt: """
          Help create a monthly budget:

        Income: """ + (input.income ?? "not specified") + """
          Fixed expenses: """ + (input.fixedExpenses ?? "not specified") + """
          Goals: """ + (input.goals ?? "save money") + """
          
          Create a balanced budget using 50/30/20 rule or similar.
          Include categories with recommended amounts.
        """
} as budget
      
      say "📊 **Your Monthly Budget:**"
      say budget.output
    else
      say "📊 **Current Budget Status:**"
      say "Total Budget: $" + ($monthlyBudget.total ?? "not set")
      say "Spent: $" + ($monthlyBudget.spent ?? 0)
      say "Remaining: $" + ($monthlyBudget.remaining ?? "calculating...")
end
end

  on input when input contains "analyze" or input contains "spending"
    call general.respond with {
    prompt: """
        Analyze spending patterns:

        Expenses: """ + ($expenses ?? input.expenses) + """
        Period: """ + (input.period ?? "this month") + """
        
        Provide:
        1. Spending breakdown by category(with percentages)
    2. Trends compared to previous periods
        3. Unusual or high expenses flagged
        4. Areas to optimize
        5. Personalized savings tips
        
        Be specific and actionable.
      """
} as analysis
    
    say "📈 **Spending Analysis:**"
    say analysis.output
end

  on input when input contains "save" or input contains "goal"
    call general.respond with {
    prompt: """
        Create a savings plan:

        Goal: """ + input.goal + """
        Target amount: """ + (input.amount ?? "to be determined") + """
        Timeline: """ + (input.timeline ?? "flexible") + """
        Current savings: """ + (input.current ?? 0) + """
        
        Provide:
        1. Monthly savings target
        2. Strategies to reach goal
        3. Potential cutbacks
        4. Milestone checkpoints
        5. Tips to stay motivated
      """
} as plan
    
    say "🎯 **Savings Goal Plan:**"
    say plan.output
end

  on input when input contains "report"
    call general.respond with {
    prompt: """
        Generate a financial report:

        Period: """ + (input.period ?? "this month") + """
        Data: """ + ($expenses ?? "expenses") + """
        Budget: """ + ($monthlyBudget ?? "budget") + """
        
        Include:
        1. Executive summary
        2. Income vs expenses
        3. Category breakdown
        4. Budget adherence
        5. Net savings/ loss
        6. Recommendations for next month
      """
    } as report
    
    say "📑 **Financial Report:**"
    say report.output
end

  on input
    call general.respond with {
    prompt: """
        You are FinancialTracker, a friendly AI financial assistant.

        Context:
        - Monthly budget: """ + ($monthlyBudget ?? "not set") + """
    - Recent expenses: """ + ($expenses ?? "none logged") + """
        - Savings goal: """ + ($savingsGoal ?? "not set") + """
        
        Help users with:
1. Logging expenses
2. Creating and tracking budgets
3. Analyzing spending patterns
4. Setting savings goals
5. Financial reports
6. Money - saving tips
        
        Be encouraging and non - judgmental about finances.
        
        User message: """ + input.message
    } as response
    
    say response.output
end
end`
    },

    // ===== CUSTOMER SUPPORT SWARM =====
    {
        id: "support-swarm",
        name: "Customer Support Swarm",
        description: "AI-powered customer support - handles inquiries, escalates issues, tracks tickets, and maintains knowledge base.",
        category: "business",
        tags: ["support", "tickets", "helpdesk", "customer-service", "automation"],
        capabilities: ["zendesk.createTicket", "knowledge.search", "email.send", "general.respond"],
        icon: "🎧",
        isPremium: true,
        hivelang_code: `bot CustomerSupportSwarm
  description "24/7 AI customer support - fast, friendly, efficient"
  
  memory session
var currentTicket object
var customerContext object
var conversationHistory array
var escalationLevel number
end

  on input when input contains "help" or input contains "issue" or input contains "problem"
    call knowledge.search with {
    query: input.message,
    limit: 5
} as articles
    
    call general.respond with {
    prompt: """
        You are a friendly customer support agent.
        
        Customer issue: """ + input.message + """
        
        Relevant knowledge base articles: """ + articles.results + """
        
        Provide:
        1. Empathetic acknowledgment
        2. Solution based on knowledge base(if available)
    3. Step - by - step instructions
        4. Alternative solutions if first doesn't work
        5. Offer to escalate if needed
        
        Tone: helpful, patient, professional
      """
} as response
    
    say response.output

if response.needsEscalation == true
      say "_If this doesn't resolve your issue, reply 'escalate' to speak with a specialist._"
end
end

  on input when input contains "escalate"
    set $escalationLevel to($escalationLevel ?? 0) + 1
    
    call zendesk.createTicket with {
    subject: "Escalated: " + (input.issue ?? "Customer Issue"),
    description: input.message,
    priority: "high",
    tags: ["escalated", "ai-handoff"],
    context: $conversationHistory
} as ticket
    
    set $currentTicket to ticket
    
    say "🎫 **Ticket Created: #" + ticket.id + "**"
    say "A specialist will review your case within 2 hours."
    say "You'll receive an email update at " + (ticket.customerEmail ?? "your registered email")
end

  on input when input contains "status" and input contains "ticket"
    call zendesk.getTicket with {
    ticketId: input.ticketId ?? $currentTicket.id
} as ticket
    
    say "🎫 **Ticket #" + ticket.id + " Status:**"
    say "Status: " + ticket.status
    say "Priority: " + ticket.priority
    say "Last update: " + ticket.updatedAt
    say "Assigned to: " + (ticket.assignee ?? "Queue")
end

  on input when input contains "feedback"
    call general.respond with {
    prompt: """
        Process customer feedback:

        Feedback: """ + input.message + """
        
        Analyze:
        - Sentiment(positive / negative / neutral)
- Key points
    - Actionable items
        - Response appropriateness
"""
    } as analysis
    
    say "Thank you for your feedback! 🙏"
    say "We really appreciate you taking the time to share your thoughts."

if analysis.sentiment == "negative"
      say "We're sorry to hear about your experience. A manager will review this personally."
end
end

  on input when input contains "hours" or input contains "contact"
    say "📞 **Contact Information:**"
    say "━━━━━━━━━━━━━━━━━━━━"
    say "🤖 AI Support: Available 24/7 (that's me!)"
    say "📧 Email: support@company.com"
    say "📱 Phone: 1-800-XXX-XXXX (Mon-Fri, 9am-5pm)"
    say "💬 Live Chat: Available during business hours"
end

  on input
    call general.respond with {
    prompt: """
        You are CustomerSupportSwarm, a friendly AI support agent.

        Context:
        - Current ticket: """ + ($currentTicket ?? "none") + """
    - Customer info: """ + ($customerContext ?? "new customer") + """
        - Conversation history: """ + ($conversationHistory ?? "new conversation") + """

Guidelines:
1. Always be empathetic and patient
2. Solve issues quickly when possible
3. Escalate appropriately
4. Follow up on open issues
5. Thank customers for their patience
        
        User message: """ + input.message
    } as response
    
    say response.output
end
end`
    },

    // ===== PERSONAL ASSISTANT =====
    {
        id: "personal-assistant",
        name: "Personal Life Assistant",
        description: "Your all-in-one personal assistant - manages reminders, answers questions, tracks habits, and helps with daily life.",
        category: "automation",
        tags: ["personal", "reminders", "habits", "life", "assistant"],
        capabilities: ["calendar.remind", "general.respond", "weather.get", "news.fetch"],
        icon: "🏠",
        isPremium: false,
        hivelang_code: `bot PersonalLifeAssistant
  description "Your friendly personal AI - helping with everyday life"
  
  memory session
var userPreferences object
var activeReminders array
var habitTracker object
var dailyBriefing object
end

  on input when input contains "remind"
    call general.respond with {
    prompt: """
        Parse this reminder request:

        Input: """ + input.message + """
        
        Extract:
        - What to remind about
    - When(time / date)
    - Recurrence(if any)
    """
    } as parsed
    
    call calendar.createReminder with {
    title: parsed.task,
    time: parsed.time,
    recurring: parsed.recurring ?? false
} as reminder
    
    say "⏰ **Reminder Set!**"
    say "I'll remind you to: " + reminder.title
    say "When: " + reminder.time

if reminder.recurring
      say "Repeats: " + reminder.recurring
end
end

  on input when input contains "morning" or input contains "briefing"
    call weather.get with {
    location: $userPreferences.location ?? "auto"
} as weather
    
    call calendar.getEvents with {
    date: "today"
} as events
    
    call news.getHeadlines with {
    categories: $userPreferences.newsCategories ?? ["general"],
    limit: 5
} as news
    
    say "☀️ **Good Morning! Here's your daily briefing:**"
    say "━━━━━━━━━━━━━━━━━━━━"
    say "🌤️ **Weather:** " + weather.description + ", " + weather.temperature
    
    say "📅 **Today's Schedule:**"
if events.items.length > 0
      for event in events.items
        say "• " + event.time + " - " + event.title
end
    else
      say "• No scheduled events - enjoy a flexible day!"
end
    
    say "📰 **Top Headlines:**"
for headline in news.articles
      say "• " + headline.title
end
    
    say "Have a wonderful day! 🌟"
end

  on input when input contains "habit"
if input contains "track" or input contains "log"
      say "✅ **Habit Logged:** " + input.habit
      say "Streak: " + ($habitTracker[input.habit]?.streak ?? 1) + " days! Keep it up! 🔥"
    else if input contains "create"
      say "🎯 **New Habit Created:** " + input.habit
      say "I'll remind you daily. Consistency is key!"
    else
      say "📊 **Your Habits:**"
      say "Coming soon: habit tracking visualization"
end
end

  on input when input contains "weather"
    call weather.get with {
    location: input.location ?? $userPreferences.location ?? "auto"
} as weather
    
    say "🌤️ **Weather in " + weather.location + ":**"
    say "Temperature: " + weather.temperature
    say "Conditions: " + weather.description
    say "Humidity: " + weather.humidity + "%"
    say "Forecast: " + weather.forecast
end

  on input when input contains "recommend"
    call general.respond with {
    prompt: """
        Make a personalized recommendation:

        Type: """ + (input.type ?? "general") + """
        Request: """ + input.message + """
        User preferences: """ + ($userPreferences ?? "not set ") + """
        
        Consider:
        - Personal preferences
    - Past feedback if available
        - Current context(time, weather, etc.)
        
        Be specific and explain your reasoning.
      """
    } as recommendation
    
    say "💡 **My Recommendation:**"
    say recommendation.output
end

  on input
    call general.respond with {
    prompt: """
        You are PersonalLifeAssistant, a friendly and helpful AI companion.

        Context:
        - User preferences: """ + ($userPreferences ?? "not set") + """
    - Active reminders: """ + ($activeReminders ?? "none") + """
        - Habits: """ + ($habitTracker ?? "not tracking") + """
        
        Help users with:
1. Setting reminders
2. Daily briefings
3. Habit tracking
4. Weather updates
5. Recommendations
6. General life questions
        
        Be warm, friendly, and supportive.Like a helpful friend.
        
        User message: """ + input.message
    } as response
    
    say response.output
end
end`
    }
];

/**
 * Get all templates
 */
export function getAllTemplates(): HivestoreTemplate[] {
    return HIVESTORE_TEMPLATES;
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): HivestoreTemplate | undefined {
    return HIVESTORE_TEMPLATES.find(t => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: HivestoreTemplate['category']): HivestoreTemplate[] {
    return HIVESTORE_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get free templates
 */
export function getFreeTemplates(): HivestoreTemplate[] {
    return HIVESTORE_TEMPLATES.filter(t => !t.isPremium);
}

/**
 * Get premium templates
 */
export function getPremiumTemplates(): HivestoreTemplate[] {
    return HIVESTORE_TEMPLATES.filter(t => t.isPremium);
}

/**
 * Search templates by query
 */
export function searchTemplates(query: string): HivestoreTemplate[] {
    const q = query.toLowerCase();
    return HIVESTORE_TEMPLATES.filter(t => 
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
    );
}
