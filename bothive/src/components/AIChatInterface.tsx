"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Brain,
  Zap,
  MessageSquare,
  Lightbulb,
  AlertCircle
} from "lucide-react";
import { useAppSession } from "@/lib/app-session-context";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  intent?: {
    type: string;
    confidence: number;
    sentiment: string;
  };
  suggestedActions?: string[];
  followUpQuestions?: string[];
  emotionalTone?: string;
  requiresHumanIntervention?: boolean;
  isLoading?: boolean;
}

interface AIInsights {
  patterns: string[];
  improvements: string[];
  recommendations: string[];
}

export default function AIChatInterface({
  botCapabilities = ["chat", "help", "information"],
  hivelangCode,
  botName = "AI Assistant",
  botIcon
}: {
  botCapabilities?: string[];
  hivelangCode?: string;
  botName?: string;
  botIcon?: string;
}) {
  const { profile } = useAppSession();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<AIInsights>({ patterns: [], improvements: [], recommendations: [] });
  const [conversationId, setConversationId] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (profile) {
      setConversationId(`chat-${profile.id}-${Date.now()}`);
    }
  }, [profile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !profile) return;

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Add loading message
    const loadingMessage: AIMessage = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: "",
      timestamp: Date.now(),
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Try AI API first
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          userId: profile.id,
          conversationId,
          botCapabilities,
          hivelangCode, // Send the code!
          botName: "Assistant" // Optional
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Replace loading message with actual response
        const aiMessage: AIMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: Date.now(),
          intent: data.intent,
          suggestedActions: data.suggestedActions || [],
          followUpQuestions: data.followUpQuestions || [],
          emotionalTone: data.emotionalTone,
          requiresHumanIntervention: data.requiresHumanIntervention
        };

        setMessages(prev => prev.map(msg =>
          msg.id === loadingMessage.id ? aiMessage : msg
        ));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);

      // Fallback to mock response if AI API fails
      const mockResponse = generateMockResponse(input.trim());

      const aiMessage: AIMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: mockResponse.content,
        timestamp: Date.now(),
        intent: mockResponse.intent,
        suggestedActions: mockResponse.suggestedActions,
        followUpQuestions: mockResponse.followUpQuestions,
        emotionalTone: mockResponse.emotionalTone,
        requiresHumanIntervention: false
      };

      setMessages(prev => prev.map(msg =>
        msg.id === loadingMessage.id ? aiMessage : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock responses for demo
  const generateMockResponse = (message: string) => {
    const lowerMessage = message.toLowerCase();

    let intent = { type: "conversation", confidence: 0.8, sentiment: "neutral" };
    let content = "I'm here to help! ";
    let suggestedActions: string[] = [];
    let followUpQuestions: string[] = [];
    let emotionalTone = "friendly";

    if (lowerMessage.includes("help") || lowerMessage.includes("how")) {
      intent = { type: "question", confidence: 0.9, sentiment: "neutral" };
      content = "I can help you create intelligent bots, analyze performance, and optimize your automation workflows. What specific area would you like to explore?";
      suggestedActions = ["Create Bot", "View Analytics", "Integrations"];
      followUpQuestions = ["What type of bot are you building?", "Do you need help with analytics?", "Want to see available integrations?"];
    } else if (lowerMessage.includes("create") || lowerMessage.includes("build")) {
      intent = { type: "task", confidence: 0.85, sentiment: "positive" };
      content = "Great! I can help you create an intelligent bot. Our AI-powered builder includes natural language understanding, learning capabilities, and multi-channel deployment. What kind of bot would you like to create?";
      suggestedActions = ["Customer Support Bot", "Data Processing Bot", "Social Media Bot"];
      followUpQuestions = ["What should your bot do?", "Which platforms should it work on?", "Do you need advanced AI features?"];
    } else if (lowerMessage.includes("analytics") || lowerMessage.includes("performance")) {
      intent = { type: "request", confidence: 0.9, sentiment: "neutral" };
      content = "I can show you comprehensive analytics about your bot performance, user interactions, and AI learning progress. Our system tracks satisfaction rates, response accuracy, and conversation patterns.";
      suggestedActions = ["View Dashboard", "Generate Report", "Export Data"];
      followUpQuestions = ["What time period interests you?", "Focus on specific metrics?", "Need performance recommendations?"];
    } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      intent = { type: "conversation", confidence: 0.95, sentiment: "positive" };
      content = "Hello! I'm your AI assistant for Bothive. I can help you build intelligent bots, analyze performance, and optimize your automation workflows. How can I assist you today?";
      emotionalTone = "friendly";
      suggestedActions = ["Build a Bot", "View Analytics", "Learn Features"];
      followUpQuestions = ["What brings you here today?", "Are you new to Bothive?", "Want to see a quick demo?"];
    } else {
      content = "I understand you're interested in intelligent automation. I can help with bot creation, performance analytics, AI learning, and workflow optimization. What would you like to explore?";
      suggestedActions = ["Bot Builder", "AI Analytics", "Learning Center"];
      emotionalTone = "helpful";
    }

    return {
      content,
      intent,
      suggestedActions,
      followUpQuestions,
      emotionalTone
    };
  };

  const sendFeedback = async (messageId: string, feedback: 'positive' | 'negative') => {
    if (!profile) return;

    try {
      await fetch('/api/ai/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          messageId,
          feedback,
          resolutionTime: 2000 // Example resolution time
        })
      });
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  const loadInsights = async () => {
    if (!profile) return;

    try {
      const response = await fetch(`/api/ai/chat?userId=${profile.id}&timeRange=week`);
      const data = await response.json();

      if (response.ok) {
        setInsights(data);
        setShowInsights(true);
      }
    } catch (error) {
      console.error('Insights error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getToneColor = (tone?: string) => {
    switch (tone) {
      case 'empathetic': return 'text-blue-500';
      case 'urgent': return 'text-red-500';
      case 'professional': return 'text-gray-500';
      case 'friendly': return 'text-green-500';
      default: return isDark ? 'text-white' : 'text-gray-700';
    }
  };

  const getIntentIcon = (type?: string) => {
    switch (type) {
      case 'question': return <MessageSquare className="w-4 h-4" />;
      case 'task': return <Zap className="w-4 h-4" />;
      case 'request': return <Lightbulb className="w-4 h-4" />;
      case 'complaint': return <AlertCircle className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full rounded-2xl border transition-all",
      isDark
        ? "bg-black/40 border-white/10"
        : "bg-white/60 border-[#D7DEF8]"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b",
        isDark ? "border-white/10" : "border-[#D7DEF8]"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full overflow-hidden",
            !botIcon && "bg-gradient-to-r from-[#6C43FF] to-[#8A63FF]"
          )}>
            {botIcon ? (
              <img src={botIcon} alt={botName} className="w-full h-full object-cover" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>
          <div>
            <h3 className={cn(
              "font-semibold",
              isDark ? "text-white" : "text-gray-900"
            )}>
              {botName}
            </h3>
            <p className={cn(
              "text-xs",
              isDark ? "text-white/60" : "text-gray-500"
            )}>
              Intelligent • Context-aware • Learning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadInsights}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDark
                ? "hover:bg-white/10 text-white/70"
                : "hover:bg-[#F0F4FF] text-gray-600"
            )}
          >
            <Brain className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Insights Panel */}
      <AnimatePresence>
        {showInsights && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={cn(
              "border-b overflow-hidden",
              isDark ? "border-white/10" : "border-[#D7DEF8]"
            )}
          >
            <div className="p-4 space-y-3">
              <h4 className={cn(
                "font-medium text-sm",
                isDark ? "text-white" : "text-gray-900"
              )}>
                🧠 AI Insights (This Week)
              </h4>

              {insights.patterns.length > 0 && (
                <div className="space-y-1">
                  <p className={cn("text-xs font-medium", isDark ? "text-white/70" : "text-gray-600")}>Patterns:</p>
                  {insights.patterns.map((pattern, i) => (
                    <p key={i} className={cn("text-xs", isDark ? "text-white/50" : "text-gray-500")}>
                      • {pattern}
                    </p>
                  ))}
                </div>
              )}

              {insights.recommendations.length > 0 && (
                <div className="space-y-1">
                  <p className={cn("text-xs font-medium", isDark ? "text-white/70" : "text-gray-600")}>Recommendations:</p>
                  {insights.recommendations.map((rec, i) => (
                    <p key={i} className={cn("text-xs", isDark ? "text-white/50" : "text-gray-500")}>
                      💡 {rec}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.role === 'assistant' && (
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 mt-1 overflow-hidden",
                  !botIcon && "bg-gradient-to-r from-[#6C43FF] to-[#8A63FF]"
                )}>
                  {botIcon ? (
                    <img src={botIcon} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Bot className="w-3 h-3 text-white" />
                  )}
                </div>
              )}

              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3",
                message.role === 'user'
                  ? isDark
                    ? "bg-[#6C43FF] text-white"
                    : "bg-[#5163FF] text-white"
                  : isDark
                    ? "bg-white/10 text-white"
                    : "bg-[#F0F4FF] text-gray-900"
              )}>
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed">{message.content}</p>

                    {message.role === 'assistant' && (
                      <div className="mt-3 space-y-2">
                        {/* Intent Badge */}
                        {message.intent && (
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                              isDark ? "bg-white/10" : "bg-white/50"
                            )}>
                              {getIntentIcon(message.intent.type)}
                              <span>{message.intent.type}</span>
                              <span className="opacity-60">
                                {Math.round(message.intent.confidence * 100)}%
                              </span>
                            </div>

                            <span className={cn("text-xs", getToneColor(message.emotionalTone))}>
                              {message.emotionalTone}
                            </span>
                          </div>
                        )}

                        {/* Suggested Actions */}
                        {message.suggestedActions && message.suggestedActions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {message.suggestedActions.map((action, i) => (
                              <button
                                key={i}
                                className={cn(
                                  "px-2 py-1 rounded-lg text-xs transition-colors",
                                  isDark
                                    ? "bg-[#6C43FF]/20 hover:bg-[#6C43FF]/30 text-[#8A63FF]"
                                    : "bg-[#5163FF]/10 hover:bg-[#5163FF]/20 text-[#5163FF]"
                                )}
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Follow-up Questions */}
                        {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                          <div className="space-y-1">
                            <p className={cn("text-xs font-medium", isDark ? "text-white/70" : "text-gray-600")}>
                              Follow-up questions:
                            </p>
                            {message.followUpQuestions.map((question, i) => (
                              <button
                                key={i}
                                onClick={() => setInput(question)}
                                className={cn(
                                  "block w-full text-left text-xs p-2 rounded transition-colors",
                                  isDark
                                    ? "bg-white/5 hover:bg-white/10"
                                    : "bg-gray-50 hover:bg-gray-100"
                                )}
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Feedback Buttons */}
                        <div className="flex items-center gap-2 pt-2">
                          <span className={cn("text-xs", isDark ? "text-white/50" : "text-gray-400")}>
                            Was this helpful?
                          </span>
                          <button
                            onClick={() => sendFeedback(message.id, 'positive')}
                            className={cn(
                              "p-1 rounded transition-colors",
                              isDark
                                ? "hover:bg-green-500/20 text-green-400"
                                : "hover:bg-green-100 text-green-600"
                            )}
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => sendFeedback(message.id, 'negative')}
                            className={cn(
                              "p-1 rounded transition-colors",
                              isDark
                                ? "hover:bg-red-500/20 text-red-400"
                                : "hover:bg-red-100 text-red-600"
                            )}
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Human Intervention Alert */}
                        {message.requiresHumanIntervention && (
                          <div className={cn(
                            "flex items-center gap-2 p-2 rounded-lg text-xs",
                            isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700"
                          )}>
                            <AlertCircle className="w-3 h-3" />
                            <span>This response may need human review</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                <div className={cn(
                  "text-xs mt-1 opacity-60",
                  message.role === 'user' ? "text-right" : "text-left"
                )}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>

              {message.role === 'user' && (
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 mt-1",
                  isDark ? "bg-white/20" : "bg-gray-200"
                )}>
                  <User className="w-3 h-3" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={cn(
        "p-4 border-t",
        isDark ? "border-white/10" : "border-[#D7DEF8]"
      )}>
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className={cn(
              "flex-1 resize-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2",
              isDark
                ? "bg-white/10 text-white placeholder-white/50 focus:ring-[#6C43FF]"
                : "bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-[#5163FF]"
            )}
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />

          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-xl transition-all",
              "bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] text-white",
              "hover:brightness-110 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            )}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className={cn("text-xs", isDark ? "text-white/50" : "text-gray-400")}>
            <Sparkles className="w-3 h-3 inline mr-1" />
            AI-powered • Context-aware • Always learning
          </p>

          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className={cn(
                "text-xs transition-colors",
                isDark ? "text-white/50 hover:text-white" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Clear chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
