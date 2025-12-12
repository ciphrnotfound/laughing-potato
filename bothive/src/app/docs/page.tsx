"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  BookOpen,
  Layers,
  Bot,
  Command,
  ArrowRight,
  Code,
  Copy,
  Check,
  Zap,
  Mail,
  Calendar,
  Youtube,
  MessageCircle,
  BookMarked,
  Rocket,
} from "lucide-react";

// Study Buddy Bot HiveLang Code
const STUDY_BUDDY_BOT = `@bot study_buddy
@description "Your AI-powered study companion for emails, scheduling, and learning resources"
@category productivity
@channels ["web", "whatsapp", "email"]

# Email Response Helper
@capability draft_email_reply(email_content, tone)
    prompt = f"""
    Draft a reply to this email in a {tone} tone.
    Original email: {email_content}
    
    Make the response:
    - Professional and clear
    - Address all points raised
    - Suggest next steps if applicable
    """
    
    response = ai.generate(prompt)
    return {
        "draft": response,
        "suggested_subject": ai.generate(f"Suggest a reply subject for: {email_content}")
    }

# WhatsApp Reply Helper  
@capability suggest_whatsapp_reply(message, context)
    prompt = f"""
    Help me reply to this WhatsApp message.
    Message: {message}
    Context: {context}
    
    Provide 3 reply options:
    1. Quick/Casual
    2. Detailed/Formal  
    3. Friendly but professional
    """
    
    return ai.generate(prompt)

# Schedule Creator
@capability create_study_schedule(subjects, hours_per_day, exam_date)
    prompt = f"""
    Create a study schedule for these subjects: {subjects}
    Available hours per day: {hours_per_day}
    Exam date: {exam_date}
    
    Include:
    - Daily breakdown
    - Pomodoro-style sessions
    - Break times
    - Review sessions before exam
    """
    
    schedule = ai.generate(prompt)
    return {
        "schedule": schedule,
        "calendar_events": ai.generate(f"Convert to calendar format: {schedule}")
    }

# YouTube Video Finder
@capability find_youtube_resources(topic, level)
    search_query = ai.generate(f"Best YouTube search for learning {topic} at {level} level")
    
    videos = http.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
            "q": search_query,
            "type": "video",
            "part": "snippet",
            "maxResults": 5,
            "key": user.youtube_api_key
        }
    })
    
    return {
        "videos": videos.data.items,
        "study_tips": ai.generate(f"Quick tips for learning {topic}")
    }

# Course Resource Finder
@capability find_course_resources(course_name, resource_type)
    prompt = f"""
    Find the best {resource_type} resources for learning {course_name}.
    
    Include:
    - Free online courses (Coursera, edX, Khan Academy)
    - YouTube channels
    - Textbooks (with free PDF links if available)
    - Practice problems
    - GitHub repos with examples
    """
    
    return ai.generate(prompt)

# Homework Helper
@capability help_with_homework(subject, problem, show_steps)
    prompt = f"""
    Help solve this {subject} problem: {problem}
    
    {"Show step-by-step solution" if show_steps else "Give hints without full answer"}
    
    Also suggest:
    - Similar practice problems
    - Concepts to review
    """
    
    return ai.generate(prompt)

# Flashcard Generator
@capability generate_flashcards(topic, count)
    prompt = f"""
    Create {count} flashcards for studying {topic}.
    
    Format each as:
    Q: [Question]
    A: [Answer]
    
    Include a mix of:
    - Definitions
    - Key concepts
    - Application questions
    """
    
    return ai.generate(prompt)`;

// SendGrid Integration HiveLang
const SENDGRID_INTEGRATION = `@integration sendgrid_email
@auth api_key
@category communication
@description "Send emails using SendGrid API"

@capability send_email(to, subject, body, from_email)
    response = http.post("https://api.sendgrid.com/v3/mail/send", {
        headers: {
            "Authorization": f"Bearer {user.api_key}",
            "Content-Type": "application/json"
        },
        body: {
            "personalizations": [{"to": [{"email": to}]}],
            "from": {"email": from_email},
            "subject": subject,
            "content": [{"type": "text/plain", "value": body}]
        }
    })
    
    if not response.ok {
        error(f"Failed to send email: {response.error}")
    }
    
    return {"success": true, "message_id": response.data.message_id}

@capability send_template_email(to, template_id, dynamic_data)
    response = http.post("https://api.sendgrid.com/v3/mail/send", {
        headers: {
            "Authorization": f"Bearer {user.api_key}",
            "Content-Type": "application/json"
        },
        body: {
            "personalizations": [{
                "to": [{"email": to}],
                "dynamic_template_data": dynamic_data
            }],
            "from": {"email": "noreply@yourdomain.com"},
            "template_id": template_id
        }
    })
    
    return {"success": response.ok}`;

// Notion Integration
const NOTION_INTEGRATION = `@integration notion_workspace
@auth oauth2
@category productivity
@description "Create and manage Notion pages and databases"

@capability create_page(parent_id, title, content)
    response = http.post("https://api.notion.com/v1/pages", {
        headers: {
            "Authorization": f"Bearer {user.access_token}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
        },
        body: {
            "parent": {"page_id": parent_id},
            "properties": {
                "title": {"title": [{"text": {"content": title}}]}
            },
            "children": [{
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"text": {"content": content}}]
                }
            }]
        }
    })
    
    return {
        "page_id": response.data.id,
        "url": response.data.url
    }

@capability add_to_database(database_id, properties)
    response = http.post("https://api.notion.com/v1/pages", {
        headers: {
            "Authorization": f"Bearer {user.access_token}",
            "Notion-Version": "2022-06-28"
        },
        body: {
            "parent": {"database_id": database_id},
            "properties": properties
        }
    })
    
    return response.data`;

// Slack Integration
const SLACK_INTEGRATION = `@integration slack_notifications
@auth oauth2
@category communication
@description "Send messages and notifications to Slack"

@capability send_message(channel, text, blocks)
    response = http.post("https://slack.com/api/chat.postMessage", {
        headers: {
            "Authorization": f"Bearer {user.access_token}",
            "Content-Type": "application/json"
        },
        body: {
            "channel": channel,
            "text": text,
            "blocks": blocks
        }
    })
    
    return response.data

@capability create_channel(name, is_private)
    response = http.post("https://slack.com/api/conversations.create", {
        headers: {
            "Authorization": f"Bearer {user.access_token}"
        },
        body: {
            "name": name,
            "is_private": is_private
        }
    })
    
    return response.data.channel`;

// Google Calendar Integration
const CALENDAR_INTEGRATION = `@integration google_calendar
@auth oauth2
@category productivity
@description "Create and manage Google Calendar events"

@capability create_event(calendar_id, title, start_time, end_time, description)
    response = http.post(
        f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events",
        {
            headers: {
                "Authorization": f"Bearer {user.access_token}",
                "Content-Type": "application/json"
            },
            body: {
                "summary": title,
                "description": description,
                "start": {"dateTime": start_time},
                "end": {"dateTime": end_time}
            }
        }
    )
    
    return {
        "event_id": response.data.id,
        "link": response.data.htmlLink
    }

@capability get_upcoming_events(calendar_id, max_results)
    response = http.get(
        f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events",
        {
            headers: {
                "Authorization": f"Bearer {user.access_token}"
            },
            params: {
                "maxResults": max_results,
                "orderBy": "startTime",
                "singleEvents": true,
                "timeMin": datetime.now().isoformat()
            }
        }
    )
    
    return response.data.items`;

const CODE_EXAMPLES = [
  {
    id: "study-buddy",
    title: "Study Buddy Bot",
    description: "A complete AI study assistant with email drafts, scheduling, and resource finding",
    icon: BookMarked,
    code: STUDY_BUDDY_BOT,
    category: "Bots"
  },
  {
    id: "sendgrid",
    title: "SendGrid Email",
    description: "Send transactional and marketing emails",
    icon: Mail,
    code: SENDGRID_INTEGRATION,
    category: "Integrations"
  },
  {
    id: "notion",
    title: "Notion Workspace",
    description: "Create pages and manage databases in Notion",
    icon: Layers,
    code: NOTION_INTEGRATION,
    category: "Integrations"
  },
  {
    id: "slack",
    title: "Slack Notifications",
    description: "Send messages and create channels in Slack",
    icon: MessageCircle,
    code: SLACK_INTEGRATION,
    category: "Integrations"
  },
  {
    id: "calendar",
    title: "Google Calendar",
    description: "Create and manage calendar events",
    icon: Calendar,
    code: CALENDAR_INTEGRATION,
    category: "Integrations"
  },
];

export default function DocsPage() {
  const { isDark } = useTheme();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "Bots" | "Integrations">("all");

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredExamples = activeTab === "all"
    ? CODE_EXAMPLES
    : CODE_EXAMPLES.filter(ex => ex.category === activeTab);

  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const bgCard = isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200";

  return (
    <div className={cn("min-h-screen relative overflow-hidden", isDark ? "bg-[#0A0A0A]" : "bg-gray-50")}>
      {/* Background */}
      {isDark && (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/30 via-purple-900/20 to-transparent pointer-events-none blur-3xl" />
          <div className="absolute top-40 right-0 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/15 via-indigo-800/10 to-transparent pointer-events-none blur-2xl" />
        </>
      )}

      <div className="relative max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6",
            isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
          )}>
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className={cn("text-sm font-medium", textSecondary)}>Developer Documentation</span>
          </div>
          <h1 className={cn("text-4xl md:text-5xl font-bold mb-4", textPrimary)}>
            Build Bots & Integrations
          </h1>
          <p className={cn("text-lg max-w-2xl mx-auto", textSecondary)}>
            Learn HiveLang - the simple language for creating AI-powered bots and connecting to any API
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Link
              href="/builder"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all"
            >
              <Rocket className="w-5 h-5" />
              Open Bot Builder
            </Link>
            <Link
              href="/integrations/new"
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border transition-all",
                isDark
                  ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50"
              )}
            >
              <Zap className="w-5 h-5" />
              Create Integration
            </Link>
          </div>
        </header>

        {/* Quick Start Guide */}
        <section className={cn("p-8 rounded-3xl border mb-12", bgCard)}>
          <h2 className={cn("text-2xl font-bold mb-6 flex items-center gap-3", textPrimary)}>
            <Code className="w-6 h-6 text-purple-500" />
            HiveLang Quick Start
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className={cn("p-6 rounded-2xl", isDark ? "bg-white/5" : "bg-gray-50")}>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-purple-500">1</span>
              </div>
              <h3 className={cn("font-semibold mb-2", textPrimary)}>Define Your Bot/Integration</h3>
              <p className={cn("text-sm", textSecondary)}>
                Start with <code className="px-1 py-0.5 rounded bg-purple-500/20 text-purple-400">@bot</code> or
                <code className="px-1 py-0.5 rounded bg-purple-500/20 text-purple-400 ml-1">@integration</code>
              </p>
            </div>
            <div className={cn("p-6 rounded-2xl", isDark ? "bg-white/5" : "bg-gray-50")}>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-purple-500">2</span>
              </div>
              <h3 className={cn("font-semibold mb-2", textPrimary)}>Add Capabilities</h3>
              <p className={cn("text-sm", textSecondary)}>
                Use <code className="px-1 py-0.5 rounded bg-purple-500/20 text-purple-400">@capability</code> to define
                what your bot can do
              </p>
            </div>
            <div className={cn("p-6 rounded-2xl", isDark ? "bg-white/5" : "bg-gray-50")}>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-purple-500">3</span>
              </div>
              <h3 className={cn("font-semibold mb-2", textPrimary)}>Deploy & Test</h3>
              <p className={cn("text-sm", textSecondary)}>
                Hit deploy, test your capabilities, and iterate
              </p>
            </div>
          </div>
        </section>

        {/* Syntax Reference */}
        <section className={cn("p-8 rounded-3xl border mb-12", bgCard)}>
          <h2 className={cn("text-2xl font-bold mb-6 flex items-center gap-3", textPrimary)}>
            <BookOpen className="w-6 h-6 text-purple-500" />
            HiveLang Syntax Reference
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className={cn("font-semibold mb-3", textPrimary)}>Decorators</h3>
              <div className="space-y-2 text-sm">
                <div className={cn("p-3 rounded-lg font-mono", isDark ? "bg-black/50" : "bg-gray-100")}>
                  <span className="text-purple-400">@bot</span> <span className={textSecondary}>bot_name</span>
                </div>
                <div className={cn("p-3 rounded-lg font-mono", isDark ? "bg-black/50" : "bg-gray-100")}>
                  <span className="text-purple-400">@integration</span> <span className={textSecondary}>integration_name</span>
                </div>
                <div className={cn("p-3 rounded-lg font-mono", isDark ? "bg-black/50" : "bg-gray-100")}>
                  <span className="text-purple-400">@auth</span> <span className={textSecondary}>api_key | oauth2 | none</span>
                </div>
                <div className={cn("p-3 rounded-lg font-mono", isDark ? "bg-black/50" : "bg-gray-100")}>
                  <span className="text-purple-400">@capability</span> <span className={textSecondary}>name(params)</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className={cn("font-semibold mb-3", textPrimary)}>Built-in Functions</h3>
              <div className="space-y-2 text-sm">
                <div className={cn("p-3 rounded-lg font-mono", isDark ? "bg-black/50" : "bg-gray-100")}>
                  <span className="text-blue-400">http.get</span><span className={textSecondary}>(url, options)</span>
                </div>
                <div className={cn("p-3 rounded-lg font-mono", isDark ? "bg-black/50" : "bg-gray-100")}>
                  <span className="text-blue-400">http.post</span><span className={textSecondary}>(url, options)</span>
                </div>
                <div className={cn("p-3 rounded-lg font-mono", isDark ? "bg-black/50" : "bg-gray-100")}>
                  <span className="text-blue-400">ai.generate</span><span className={textSecondary}>(prompt)</span>
                </div>
                <div className={cn("p-3 rounded-lg font-mono", isDark ? "bg-black/50" : "bg-gray-100")}>
                  <span className="text-blue-400">user.</span><span className={textSecondary}>api_key | access_token</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className={cn("text-2xl font-bold", textPrimary)}>Code Examples</h2>
            <div className="flex gap-2">
              {["all", "Bots", "Integrations"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    activeTab === tab
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : cn(
                        isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                      )
                  )}
                >
                  {tab === "all" ? "All" : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {filteredExamples.map((example) => (
              <div key={example.id} className={cn("rounded-3xl border overflow-hidden", bgCard)}>
                <div className="p-6 border-b border-white/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        "bg-gradient-to-br from-purple-500/20 to-indigo-500/20"
                      )}>
                        <example.icon className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className={cn("text-lg font-semibold", textPrimary)}>{example.title}</h3>
                        <p className={cn("text-sm", textSecondary)}>{example.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        example.category === "Bots"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      )}>
                        {example.category}
                      </span>
                      <button
                        onClick={() => copyCode(example.id, example.code)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                          isDark ? "bg-white/5 text-white/70 hover:bg-white/10" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        {copiedId === example.id ? (
                          <>
                            <Check className="w-4 h-4 text-green-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Code
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <pre className={cn(
                  "p-6 overflow-x-auto text-sm font-mono max-h-96",
                  isDark ? "bg-black/50" : "bg-gray-50"
                )}>
                  <code className={textSecondary}>{example.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className={cn(
          "p-8 rounded-3xl text-center",
          "bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-blue-500/20",
          "border border-purple-500/20"
        )}>
          <h2 className={cn("text-2xl font-bold mb-4", textPrimary)}>Ready to build?</h2>
          <p className={cn("mb-6", textSecondary)}>
            Start creating your own bots and integrations with HiveLang today.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/builder"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl transition-all"
            >
              <Bot className="w-5 h-5" />
              Build a Bot
            </Link>
            <Link
              href="/integrations/new"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-purple-500/30 text-purple-400 font-semibold hover:bg-purple-500/10 transition-all"
            >
              <Zap className="w-5 h-5" />
              Create Integration
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
