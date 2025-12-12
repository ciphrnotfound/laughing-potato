"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  ArrowLeft, Plug, Clock, CheckCircle2, Copy, Check, 
  ArrowRight, Code, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import ThemeToggle from "@/components/ThemeToggle";

const API_CONFIG_EXAMPLE = `{
  "name": "Weather API",
  "baseUrl": "https://api.openweathermap.org/data/2.5",
  "auth": {
    "type": "apiKey",
    "keyName": "appid",
    "location": "query"
  },
  "endpoints": [
    {
      "name": "getCurrentWeather",
      "method": "GET",
      "path": "/weather",
      "params": ["q", "units"]
    }
  ]
}`;

const HIVELANG_INTEGRATION = `bot WeatherBot
  description "Gets weather information for any city"
  
  on input when input.message contains "weather"
    # Extract city from message
    call agent.analyze with {
      data: input.message,
      context: "Extract the city name from this weather query"
    } as cityAnalysis
    
    # Call the custom integration
    call integration.weather_api.getCurrentWeather with {
      q: cityAnalysis.city,
      units: "metric"
    } as weather
    
    say "🌤 Weather in " + cityAnalysis.city + ": "
    say "Temperature: " + weather.main.temp + "°C"
    say "Conditions: " + weather.weather[0].description
  end
end`;

export default function IntegrationGuidePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [copiedConfig, setCopiedConfig] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState(false);

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const steps = [
    {
      title: "Plan Your Integration",
      description: "Before building, identify:\n• What API do you want to connect?\n• What actions should bots be able to perform?\n• What authentication does the API require?",
    },
    {
      title: "Navigate to Integration Builder",
      description: "Go to the Integrations page and click 'Create Integration' to start building your custom connection.",
      action: (
        <Link
          href="/integrations"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors"
        >
          Go to Integrations
          <ArrowRight className="h-4 w-4" />
        </Link>
      ),
    },
    {
      title: "Configure the API Connection",
      description: "Enter your API details including the base URL, authentication method, and available endpoints. Here's an example configuration:",
      code: API_CONFIG_EXAMPLE,
      codeLabel: "API Configuration (JSON)",
      copied: copiedConfig,
      onCopy: () => copyToClipboard(API_CONFIG_EXAMPLE, setCopiedConfig),
    },
    {
      title: "Map Actions to Tools",
      description: "Each API endpoint becomes a tool that bots can use. Define:\n• Tool name (e.g., 'getCurrentWeather')\n• Required parameters\n• Response mapping",
    },
    {
      title: "Test the Integration",
      description: "Use the test panel to make sample API calls and verify the integration works correctly before submitting.",
    },
    {
      title: "Use in Your Bots",
      description: "Once approved, you can use the integration in your HiveLang code like this:",
      code: HIVELANG_INTEGRATION,
      codeLabel: "Using Integration in HiveLang",
      copied: copiedCode,
      onCopy: () => copyToClipboard(HIVELANG_INTEGRATION, setCopiedCode),
    },
    {
      title: "Submit for Approval",
      description: "All integrations are reviewed before becoming available to other users. This ensures security and quality.",
    },
  ];

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDark ? "bg-[#0a0a0f] text-white" : "bg-gray-50 text-gray-900"
    )}>
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-xl",
        isDark ? "border-white/10 bg-[#0a0a0f]/90" : "border-gray-200 bg-white/90"
      )}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href="/guides" 
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors",
              isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Guides
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-violet-500/10 text-violet-400 mb-6">
            <Plug className="h-10 w-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Create a Custom Integration
          </h1>
          <p className={cn("text-lg max-w-2xl mx-auto mb-6", isDark ? "text-white/60" : "text-gray-600")}>
            Connect any external API to Bothive so your bots can use it. This guide is for developers familiar with APIs.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-medium">
              Intermediate
            </span>
            <span className={cn("flex items-center gap-1", isDark ? "text-white/50" : "text-gray-500")}>
              <Clock className="h-4 w-4" />
              20 minutes
            </span>
            <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 font-medium">
              Developers
            </span>
          </div>
        </motion.div>

        {/* Developer Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "rounded-xl border p-4 mb-8 flex items-start gap-3",
            isDark ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-50 border-amber-200"
          )}
        >
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className={cn("text-sm font-medium", isDark ? "text-amber-400" : "text-amber-700")}>
              Developer Guide
            </p>
            <p className={cn("text-sm", isDark ? "text-amber-400/70" : "text-amber-600")}>
              This guide assumes familiarity with REST APIs, JSON, and authentication methods. 
              If you're new to APIs, start with the Study Buddy guide instead.
            </p>
          </div>
        </motion.div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className={cn(
                "rounded-2xl border p-6",
                isDark ? "bg-[#0d0d12] border-white/10" : "bg-white border-gray-200"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className={cn("text-sm whitespace-pre-line", isDark ? "text-white/60" : "text-gray-600")}>
                    {step.description}
                  </p>
                  
                  {step.action && (
                    <div className="mt-4">{step.action}</div>
                  )}
                  
                  {step.code && (
                    <div className="mt-4">
                      <div className={cn(
                        "rounded-xl border overflow-hidden",
                        isDark ? "border-white/10" : "border-gray-200"
                      )}>
                        <div className={cn(
                          "px-4 py-2 flex items-center justify-between border-b",
                          isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
                        )}>
                          <span className="text-xs font-medium text-violet-400">{step.codeLabel}</span>
                          <button
                            onClick={step.onCopy}
                            className={cn(
                              "flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors",
                              isDark ? "text-white/50 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                            )}
                          >
                            {step.copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            {step.copied ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <pre className={cn(
                          "p-4 text-xs overflow-x-auto",
                          isDark ? "bg-black/30 text-white/80" : "bg-gray-50 text-gray-800"
                        )}>
                          <code>{step.code}</code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Success */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={cn(
            "mt-12 rounded-2xl border p-8 text-center",
            isDark ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"
          )}
        >
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Share Your Integration!</h3>
          <p className={cn("mb-6", isDark ? "text-white/60" : "text-gray-600")}>
            Once approved, other developers can install and use your integration in their bots.
          </p>
          <Link
            href="/integrations"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-500 transition-colors"
          >
            <Plug className="h-5 w-5" />
            Create Integration
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
