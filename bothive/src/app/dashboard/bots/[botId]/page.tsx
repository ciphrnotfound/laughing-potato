import { notFound } from 'next/navigation';
import { BotHelperForm } from '@/components/bot-helper-form';

// Bot catalog with templates and configurations
export const BOT_CATALOG = {
  cadence: {
    id: 'cadence',
    name: 'Cadence Publisher',
    description: 'Automatically creates and publishes social media posts at your specified frequency',
    category: 'Social Media',
    icon: '📱',
    fields: [
      {
        id: 'brandName',
        label: 'Brand Name',
        type: 'text' as const,
        placeholder: 'Enter your brand or company name',
        required: true
      },
      {
        id: 'brandVoice',
        label: 'Brand Voice',
        type: 'select' as const,
        options: [
          { value: 'professional', label: 'Professional & Formal' },
          { value: 'casual', label: 'Casual & Friendly' },
          { value: 'humorous', label: 'Humorous & Witty' },
          { value: 'inspirational', label: 'Inspirational & Motivational' },
          { value: 'technical', label: 'Technical & Educational' }
        ],
        required: true
      },
      {
        id: 'topics',
        label: 'Content Topics',
        type: 'textarea' as const,
        placeholder: 'Enter topics you want to post about (one per line)',
        helper: 'Examples: AI trends, startup tips, industry news',
        required: true
      },
      {
        id: 'frequency',
        label: 'Posting Frequency',
        type: 'select' as const,
        options: [
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'biweekly', label: 'Every 2 weeks' },
          { value: 'monthly', label: 'Monthly' }
        ],
        required: true
      },
      {
        id: 'postImmediately',
        label: 'Post First Content Immediately',
        type: 'checkbox' as const,
        helper: 'Create and publish the first post right away'
      }
    ],
    template: `// Cadence Publisher Bot
// Automatically creates and publishes social media posts

steps:
  - tool: social.trends
    id: trends
  
  - agent: general.respond
    input:
      prompt: |
        Create a social media post for {{brandName}} with a {{brandVoice}} voice.
        
        Brand: {{brandName}}
        Voice: {{brandVoice}}
        Topics: {{topics}}
        Current trends: {{trends}}
        
        Guidelines:
        - Keep it under 280 characters for X/Twitter
        - Include relevant hashtags
        - Sound authentic and engaging
        - Reference current trends when appropriate
        
        Generate ONE compelling post.
    id: generate_content
  
  - tool: social.publish
    input:
      platform: twitter
      content: "{{generate_content}}"
    id: publish_post`
  },
  
  'study-buddy': {
    id: 'study-buddy',
    name: 'Study Buddy',
    description: 'Helps you create study schedules, notes, and reminders',
    category: 'Education',
    icon: '📚',
    fields: [
      {
        id: 'subject',
        label: 'Subject',
        type: 'text' as const,
        placeholder: 'e.g., Mathematics, History, Programming',
        required: true
      },
      {
        id: 'studyGoal',
        label: 'Study Goal',
        type: 'textarea' as const,
        placeholder: 'What do you want to achieve?',
        required: true
      },
      {
        id: 'studyDuration',
        label: 'Study Duration (weeks)',
        type: 'number' as const,
        min: 1,
        max: 52,
        required: true
      },
      {
        id: 'dailyTime',
        label: 'Daily Study Time (hours)',
        type: 'number' as const,
        min: 0.5,
        max: 8,
        step: 0.5,
        required: true
      },
      {
        id: 'preferredTime',
        label: 'Preferred Study Time',
        type: 'select' as const,
        options: [
          { value: 'morning', label: 'Morning (6AM - 12PM)' },
          { value: 'afternoon', label: 'Afternoon (12PM - 6PM)' },
          { value: 'evening', label: 'Evening (6PM - 10PM)' },
          { value: 'night', label: 'Night (10PM - 2AM)' }
        ],
        required: true
      }
    ],
    template: `// Study Buddy Bot
// Creates personalized study plans and schedules

steps:
  - agent: general.respond
    input:
      prompt: |
        Create a comprehensive study plan for:
        
        Subject: {{subject}}
        Goal: {{studyGoal}}
        Duration: {{studyDuration}} weeks
        Daily time: {{dailyTime}} hours
        Preferred time: {{preferredTime}}
        
        Please provide:
        1. Weekly breakdown of topics
        2. Daily study schedule
        3. Key milestones and checkpoints
        4. Study techniques and tips
        5. Resource recommendations
        
        Format the response clearly with sections and bullet points.
    id: create_plan`
  },
  
  'coding-assistant': {
    id: 'coding-assistant',
    name: 'Coding Assistant',
    description: 'Helps with code review, debugging, and best practices',
    category: 'Development',
    icon: '💻',
    fields: [
      {
        id: 'programmingLanguage',
        label: 'Programming Language',
        type: 'select' as const,
        options: [
          { value: 'javascript', label: 'JavaScript' },
          { value: 'typescript', label: 'TypeScript' },
          { value: 'python', label: 'Python' },
          { value: 'java', label: 'Java' },
          { value: 'csharp', label: 'C#' },
          { value: 'go', label: 'Go' },
          { value: 'rust', label: 'Rust' }
        ],
        required: true
      },
      {
        id: 'projectType',
        label: 'Project Type',
        type: 'select' as const,
        options: [
          { value: 'web-app', label: 'Web Application' },
          { value: 'mobile-app', label: 'Mobile Application' },
          { value: 'api', label: 'API/Backend' },
          { value: 'desktop', label: 'Desktop Application' },
          { value: 'library', label: 'Library/Package' },
          { value: 'cli', label: 'Command Line Tool' }
        ],
        required: true
      },
      {
        id: 'experienceLevel',
        label: 'Experience Level',
        type: 'select' as const,
        options: [
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' },
          { value: 'expert', label: 'Expert' }
        ],
        required: true
      },
      {
        id: 'focusArea',
        label: 'Focus Area',
        type: 'select' as const,
        options: [
          { value: 'code-review', label: 'Code Review & Best Practices' },
          { value: 'debugging', label: 'Debugging & Troubleshooting' },
          { value: 'architecture', label: 'Architecture & Design' },
          { value: 'performance', label: 'Performance Optimization' },
          { value: 'testing', label: 'Testing & Quality Assurance' },
          { value: 'documentation', label: 'Documentation & Comments' }
        ],
        required: true
      }
    ],
    template: `// Coding Assistant Bot
// Provides coding help and best practices

steps:
  - agent: general.respond
    input:
      prompt: "As a coding expert specializing in {{programmingLanguage}} for {{projectType}} projects, provide guidance on {{focusArea}} for a {{experienceLevel}} developer."
    id: coding_guidance`
  },
  'whatsapp-task-reminder': {
    id: 'whatsapp-task-reminder',
    name: 'WhatsApp Task Reminder',
    description: 'Sends hourly task reminders via WhatsApp to keep you on track',
    category: 'Productivity',
    icon: '📱',
    fields: [
      {
        id: 'phoneNumber',
        label: 'WhatsApp Phone Number',
        type: 'text' as const,
        placeholder: '+1234567890 (include country code)',
        required: true,
        helper: 'Must include country code (e.g., +1 for US)'
      },
      {
        id: 'tasks',
        label: 'Tasks to Remind',
        type: 'textarea' as const,
        placeholder: 'Enter your tasks, one per line:\n• Complete project proposal\n• Review code changes\n• Send email updates',
        required: true,
        helper: 'List all tasks you want hourly reminders for'
      },
      {
        id: 'reminderStyle',
        label: 'Reminder Style',
        type: 'select' as const,
        options: [
          { value: 'friendly', label: 'Friendly & Encouraging' },
          { value: 'professional', label: 'Professional & Direct' },
          { value: 'motivational', label: 'Motivational & Inspiring' },
          { value: 'casual', label: 'Casual & Brief' }
        ],
        required: true
      },
      {
        id: 'activeHours',
        label: 'Active Hours',
        type: 'select' as const,
        options: [
          { value: 'all-day', label: 'All Day (24 hours)' },
          { value: 'business', label: 'Business Hours (9AM-6PM)' },
          { value: 'morning', label: 'Morning Only (6AM-12PM)' },
          { value: 'evening', label: 'Evening Only (6PM-10PM)' },
          { value: 'custom', label: 'Custom Range' }
        ],
        required: true
      },
      {
        id: 'startTime',
        label: 'Start Time (for Custom Range)',
        type: 'text' as const,
        placeholder: '09:00',
        helper: 'Format: HH:MM (24-hour format)'
      },
      {
        id: 'endTime',
        label: 'End Time (for Custom Range)',
        type: 'text' as const,
        placeholder: '17:00',
        helper: 'Format: HH:MM (24-hour format)'
      }
    ],
    template: `// WhatsApp Task Reminder Bot
// Sends hourly task reminders via WhatsApp

steps:
  - agent: general.respond
    input:
      prompt: "Create a {{reminderStyle}} hourly reminder message for these tasks: {{tasks}}. The message should be concise, encouraging, and suitable for WhatsApp. Include a time reference like 'Hourly check-in'."
    id: generate_reminder
  
  - tool: whatsapp.send
    input:
      phoneNumber: "{{phoneNumber}}"
      message: "{{generate_reminder}}"
    id: send_reminder`
  }
};

export default function BotHelperPage({ params }: { params: { botId: string } }) {
  const bot = BOT_CATALOG[params.botId as keyof typeof BOT_CATALOG];
  
  if (!bot) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">{bot.icon}</span>
          <div>
            <h1 className="text-3xl font-bold">{bot.name}</h1>
            <p className="text-gray-600">{bot.category}</p>
          </div>
        </div>
        <p className="text-lg text-gray-700 mb-6">{bot.description}</p>
      </div>
      
      <BotHelperForm bot={bot} />
    </div>
  );
}

export async function generateStaticParams() {
  return Object.keys(BOT_CATALOG).map((botId) => ({
    botId,
  }));
}
