"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Play,
  Square,
  RotateCcw,
  Download,
  Zap,
  Building,
  TrendingUp,
  BarChart3,
  Palette,
  FileText,
  DollarSign,
  Target
} from "lucide-react";

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  phase?: string;
}

interface BotResponse {
  response: string;
  nextAction: string;
  phase: string;
  businessPackage?: any;
}

export default function BotTesterPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("discovery");
  const [businessData, setBusinessData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      role: 'bot',
      content: `🚀 **AI BUSINESS EMPIRE BUILDER**

I'll build you a complete business from scratch in minutes!

**What I create:**
• 🎯 Business ideas with market validation
• 🎨 Complete brand identity & logos
• 📱 30-day social media content calendar
• 💰 Sales scripts & lead magnets
• 📊 Analytics dashboard & KPI tracking

**Let's start:** What's your area of interest or expertise? (e.g., "fitness", "tech", "cooking", "marketing")`,
      timestamp: new Date(),
      phase: 'discovery'
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Simulate bot response (in real implementation, this would call the actual bot)
      const response = await simulateBotResponse(input, currentPhase, businessData);

      const botMessage: ChatMessage = {
        role: 'bot',
        content: response.response,
        timestamp: new Date(),
        phase: response.phase
      };

      setMessages(prev => [...prev, botMessage]);
      setCurrentPhase(response.phase);

      if (response.businessPackage) {
        setBusinessData(response.businessPackage);
      }

    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'bot',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Something went wrong'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoMode = async () => {
    setDemoMode(true);
    setIsLoading(true);

    const demoInterest = "fitness coaching";
    const demoBudget = "medium";

    try {
      // Run through all demo phases
      const demoResults = await simulateDemoMode(demoInterest, demoBudget);

      const demoMessages: ChatMessage[] = demoResults.map((result, index) => ({
        role: 'bot' as const,
        content: result.response,
        timestamp: new Date(Date.now() + index * 1000),
        phase: result.phase
      }));

      setMessages(prev => [...prev, ...demoMessages]);
      setCurrentPhase('complete');

    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'bot',
        content: `❌ Demo failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setDemoMode(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentPhase("discovery");
    setBusinessData({});
    setDemoMode(false);

    // Re-initialize with welcome message
    const welcomeMessage: ChatMessage = {
      role: 'bot',
      content: `🚀 **AI BUSINESS EMPIRE BUILDER**

I'll build you a complete business from scratch in minutes!

**What I create:**
• 🎯 Business ideas with market validation
• 🎨 Complete brand identity & logos
• 📱 30-day social media content calendar
• 💰 Sales scripts & lead magnets
• 📊 Analytics dashboard & KPI tracking

**Let's start:** What's your area of interest or expertise? (e.g., "fitness", "tech", "cooking", "marketing")`,
      timestamp: new Date(),
      phase: 'discovery'
    };
    setMessages([welcomeMessage]);
  };

  const handleExportResults = () => {
    const exportData = {
      messages,
      businessData,
      currentPhase,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `business-empire-session-${Date.now()}.json`;
    link.click();
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'discovery': return <Target className="w-4 h-4" />;
      case 'ideation': return <Zap className="w-4 h-4" />;
      case 'branding': return <Palette className="w-4 h-4" />;
      case 'content': return <FileText className="w-4 h-4" />;
      case 'sales': return <DollarSign className="w-4 h-4" />;
      case 'analytics': return <BarChart3 className="w-4 h-4" />;
      case 'complete': return <Building className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🤖 Bot Tester
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Test and validate your AI Business Empire Builder bot
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleDemoMode}
            disabled={isLoading || demoMode}
            variant="default"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            {demoMode ? "Running Demo..." : "Demo Mode"}
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            disabled={isLoading}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          <Button
            onClick={handleExportResults}
            variant="outline"
            disabled={messages.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Current Phase Indicator */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getPhaseIcon(currentPhase)}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Phase</p>
              <p className="font-semibold capitalize">{currentPhase.replace('_', ' ')}</p>
            </div>
          </div>

          <span className={`px-2 py-1 rounded-full text-xs font-medium ${isLoading ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
            {isLoading ? "Processing..." : "Ready"}
          </span>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="h-[600px] flex flex-col rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
              >
                {message.phase && (
                  <div className="flex items-center gap-1 mb-2 text-xs opacity-70">
                    {getPhaseIcon(message.phase)}
                    <span className="capitalize">{message.phase.replace('_', ' ')}</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap text-sm">
                  {message.content}
                </div>

                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white"></div>
                  Building your business empire...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
            >
              <Play className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Business Data Summary */}
      {Object.keys(businessData).length > 0 && (
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Building className="w-4 h-4" />
            Business Data Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Industry</p>
              <p className="font-medium">{businessData.interests || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Budget</p>
              <p className="font-medium">{businessData.budget || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Selected Idea</p>
              <p className="font-medium">#{businessData.selectedIdea || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Status</p>
              <p className="font-medium capitalize">{currentPhase}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simulation functions (replace with actual bot calls in production)
async function simulateBotResponse(message: string, phase: string, businessData: any): Promise<BotResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  switch (phase) {
    case 'discovery':
      return {
        response: `🔍 Great! I noted your interest in **${message}**.

**Next:** What's your budget range?
• 💰 Low ($0-1,000)
• 💰💰 Medium ($1,000-10,000) 
• 💰💰💰 High ($10,000+)
• 🚀 Unlimited budget`,
        nextAction: 'wait_for_budget',
        phase: 'ideation'
      };

    case 'ideation':
      return {
        response: `💡 **BUSINESS IDEAS GENERATED!**

**Idea 1: AI-Powered ${message} Assistant**
• Target: Busy professionals seeking personalized ${message}
• Revenue: Subscription model ($29-99/month)
• Market: Growing $2.8B industry
• Competition: Moderate, room for innovation
• Success Probability: 8/10

**Idea 2: Virtual ${message} Marketplace**
• Target: Remote workers and freelancers
• Revenue: Commission + premium listings
• Market: Exploding demand post-pandemic
• Competition: Low in niche segment
• Success Probability: 9/10

**Idea 3: Smart ${message} Analytics Platform**
• Target: Enterprise clients and agencies
• Revenue: SaaS licensing ($500-5000/month)
• Market: High-value B2B segment
• Competition: Limited specialized solutions
• Success Probability: 7/10

**Which idea excites you most?** (Reply with 1, 2, or 3)`,
        nextAction: 'wait_for_selection',
        phase: 'branding'
      };

    case 'branding':
      return {
        response: `🎨 **BRAND IDENTITY COMPLETE!**

**Company Name Options:**
1. **FitAI Pro** (.com available)
2. **SmartCoach AI** (.com available)  
3. **PeakPerformance AI** (.com available)

**Selected: SmartCoach AI**

**Tagline:** "Your Personal AI Coach for Peak Performance"

**Brand Personality:**
• Innovative & Tech-Forward
• Trustworthy & Professional
• Motivational & Supportive
• Intelligent & Insightful
• Accessible & User-Friendly

**Color Palette:**
• Primary: #2563EB (Trust Blue)
• Secondary: #10B981 (Growth Green)
• Accent: #F59E0B (Energy Orange)
• Neutral: #6B7280 (Professional Gray)

**Mission:** Democratizing access to world-class coaching through AI technology.

**🚀 Ready for content creation?** I'll build your entire marketing system. Type "go" to continue or "brand" to refine the branding.`,
        nextAction: 'wait_for_confirmation',
        phase: 'content'
      };

    case 'content':
      return {
        response: `📱 **CONTENT MARKETING MACHINE COMPLETE!**

✅ **30-Day Social Media Calendar** ready
✅ **Blog Strategy** with SEO optimization
✅ **Platform-specific content** for maximum engagement

**Sample Content Preview:**

**Week 1 Highlights:**
• Day 1: "5 AI Coaching Myths Debunked" (Instagram carousel)
• Day 2: "Morning Routine Optimization" (LinkedIn article)
• Day 3: "Client Success Story" (Twitter thread)
• Day 4: "Behind the Scenes: How AI Coaches Work" (TikTok video)
• Day 5: "Weekend Wellness Tips" (Facebook post)

**Blog Strategy:**
• 12 SEO-optimized articles planned
• Target keywords: "AI coaching", "virtual fitness coach", "smart workout apps"
• Estimated monthly traffic: 15,000 visitors
• Content calendar through Q2 2024

**Next:** I'll create your sales system and lead magnets. Type "go" to continue.`,
        nextAction: 'wait_for_confirmation',
        phase: 'sales'
      };

    case 'sales':
      return {
        response: `💰 **SALES SYSTEM READY!**

✅ **Sales scripts** for every situation
✅ **Lead magnets** to attract customers
✅ **Email sequences** for nurturing
✅ **Pricing strategy** optimized for profit

**Sales Script Preview:**

**Discovery Call Opening:**
"Hi [Name]! I see you're interested in optimizing your fitness routine. Before we dive in, can you share what challenges you're currently facing with traditional coaching?"

**Lead Magnets:**
1. "7-Day AI Coaching Trial" (Free)
2. "Personal Fitness Assessment" (Free)
3. "2024 Fitness Trends Report" (Free)
4. "1-on-1 Strategy Session" ($49)

**Email Sequence:** 12-email nurture sequence with 34% average open rate

**Pricing Strategy:**
• Starter: $29/month (Basic AI coaching)
• Professional: $79/month (Advanced features)
• Enterprise: $299/month (White-label solution)

**Final step:** Analytics dashboard and KPI tracking. Type "go" to finish!`,
        nextAction: 'wait_for_confirmation',
        phase: 'analytics'
      };

    case 'analytics':
      return {
        response: `📊 **ANALYTICS DASHBOARD COMPLETE!**

✅ **KPI tracking** for all business areas
✅ **Automated reporting** system
✅ **12-month growth projections**
✅ **Risk analysis and mitigation**

**Key Metrics Dashboard:**

**Revenue Projections:**
• Month 1: $5,000 (50 customers)
• Month 3: $25,000 (250 customers)
• Month 6: $75,000 (750 customers)
• Month 12: $200,000 (2,000 customers)

**Customer Metrics:**
• Customer Acquisition Cost: $45
• Lifetime Value: $890
• Monthly Churn Rate: 3.2%
• Net Promoter Score: 67

**Marketing KPIs:**
• Website Conversion Rate: 4.8%
• Email Open Rate: 34%
• Social Media Engagement: 8.5%
• Customer Retention: 89%

**🎉 YOUR BUSINESS EMPIRE IS READY!** Type "launch" to see everything we've built!`,
        nextAction: 'wait_for_launch',
        phase: 'complete'
      };

    case 'complete':
      return {
        response: `🎉 **CONGRATULATIONS!**

Your complete business is ready to launch! Here's what we've built:

**📋 BUSINESS SUMMARY:**
• Industry: ${businessData.interests || 'Fitness & AI'}
• Budget: ${businessData.budget || 'Medium'}
• Selected Idea: #${businessData.selectedIdea || '1'}

**🎯 DELIVERABLES PACKAGE:**
1. ✅ **Brand Identity** - Complete with logos, colors, messaging
2. ✅ **30-Day Content Calendar** - Social media ready
3. ✅ **Blog Strategy** - SEO-optimized content plan
4. ✅ **Sales System** - Scripts, lead magnets, email sequences
5. ✅ **Analytics Dashboard** - KPI tracking and forecasting

**📁 NEXT STEPS:**
• Download your business package
• Set up social media accounts
• Launch your first marketing campaign
• Start tracking your success!

**Type "restart" to build another business or "help" for guidance!**`,
        nextAction: 'business_complete',
        phase: 'complete',
        businessPackage: {
          ...businessData,
          estimatedValue: '$15,000+',
          timeSaved: '200+ hours',
          deliverables: 7
        }
      };

    default:
      return {
        response: "I'm not sure what to do next. Try typing 'help' or 'restart'.",
        nextAction: 'unknown',
        phase: phase
      };
  }
}

async function simulateDemoMode(interest: string, budget: string): Promise<BotResponse[]> {
  const phases = ['ideation', 'branding', 'content', 'sales', 'analytics', 'complete'];
  const results: BotResponse[] = [];

  for (const phase of phases) {
    const result = await simulateBotResponse('go', phase, { interests: interest, budget: budget });
    results.push(result);
    // Add delay between phases for realistic demo
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  return results;
}