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
  AlertCircle,
  MoreHorizontal,
  Command,
  Plus
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
  botIcon,
  botId
}: {
  botCapabilities?: string[];
  hivelangCode?: string;
  botName?: string;
  botIcon?: string;
  botId?: string;
}) {
  const { profile } = useAppSession();
  const { theme } = useTheme();

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

    const loadingMessage: AIMessage = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: "",
      timestamp: Date.now(),
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          userId: profile.id,
          conversationId,
          botCapabilities,
          hivelangCode,
          botName,
          botId
        })
      });

      if (response.ok) {
        const data = await response.json();

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
      const aiMessage: AIMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again or check your connection.",
        timestamp: Date.now(),
      };
      setMessages(prev => prev.map(msg =>
        msg.id === loadingMessage.id ? aiMessage : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#000000] text-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-[800px] mx-auto px-6 py-12 space-y-12">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-20 text-center space-y-6">
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-violet-500 shadow-2xl shadow-violet-500/20">
                <Sparkles size={24} fill="currentColor" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">How can {botName} help today?</h1>
                <p className="text-white/40 text-sm font-medium tracking-wide">Select a task or start a new conversation below.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg pt-8">
                {["Explain this project", "Generate Hivelang script", "Analyze my data", "Help with integration"].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(prompt); }}
                    className="text-left px-4 py-3 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-500/30 transition-all group"
                  >
                    <span className="text-xs font-semibold text-white/70 group-hover:text-white">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-6 group animate-in fade-in slide-in-from-bottom-2 duration-500",
                    message.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className="flex-shrink-0 mt-1">
                    {message.role === 'assistant' ? (
                      <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center text-white text-[10px] font-bold">
                        {botIcon ? <img src={botIcon} className="w-4 h-4 rounded-sm" /> : <Bot size={14} />}
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-white/60">
                        <User size={14} />
                      </div>
                    )}
                  </div>

                  <div className={cn(
                    "flex-1 min-w-0 space-y-2",
                    message.role === 'user' ? "text-right" : "text-left"
                  )}>
                    <div className="flex items-center gap-2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[11px] font-bold tracking-widest uppercase text-white/30">
                        {message.role === 'assistant' ? botName : "User"}
                      </span>
                    </div>

                    <div className={cn(
                      "text-[15px] leading-relaxed tracking-tight whitespace-pre-wrap font-medium",
                      message.role === 'user' ? "text-white/90" : "text-white/80"
                    )}>
                      {message.isLoading ? (
                        <div className="flex items-center gap-1.5 py-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse delay-75" />
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse delay-150" />
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>

                    {message.role === 'assistant' && !message.isLoading && (
                      <div className="flex flex-wrap gap-2 pt-4">
                        {message.suggestedActions?.map((action, i) => (
                          <button key={i} className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/60">
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} className="h-20" />
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Minimalist Float */}
      <div className="flex-none p-6 bg-gradient-to-t from-black via-black to-transparent">
        <div className="max-w-[800px] mx-auto relative">
          <div className="relative rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden transition-all duration-300 focus-within:border-violet-500/40 focus-within:shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)]">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Send a message to ${botName}...`}
              rows={1}
              className="w-full bg-transparent border-none outline-none text-[15px] px-5 py-4 text-white placeholder:text-white/20 resize-none min-h-[56px] max-h-[200px]"
              style={{ height: 'auto' }}
            />

            <div className="h-12 border-t border-white/[0.04] flex items-center justify-between px-3 bg-white/[0.01]">
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-white/60 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold tracking-widest text-white/10 uppercase hidden sm:block">Bothive Protocol V.2</span>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                    input.trim()
                      ? "bg-white text-black hover:bg-neutral-200"
                      : "bg-white/5 text-white/20 cursor-not-allowed"
                  )}
                >
                  <span>Send</span>
                  <Command size={10} />
                </button>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-[10px] font-bold tracking-[0.2em] text-white/10 uppercase">
            Encrypted End-to-End • Swarm Intelligence
          </p>
        </div>
      </div>
    </div>
  );
}
