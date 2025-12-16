'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Simple bot templates for quick testing
const QUICK_BOTS = {
  'test-post': {
    name: 'Test Post Bot',
    description: 'Creates a simple test post',
    template: `// Simple Test Post Bot
steps:
  - agent: general.respond
    input:
      prompt: "Create a simple 'Hello World' test post for Twitter. Keep it under 280 characters."
    id: generate_content
  
  - tool: social.publish
    input:
      platform: twitter
      content: "{{generate_content}}"
    id: publish_post`
  },
  'trend-summary': {
    name: 'Trend Summary Bot',
    description: 'Gets current trends and summarizes them',
    template: `// Trend Summary Bot
steps:
  - tool: social.trends
    id: trends
  
  - agent: general.respond
    input:
      prompt: "Summarize these current trends in a concise way: {{trends}}"
    id: summarize`
  },
  'content-ideas': {
    name: 'Content Ideas Bot',
    description: 'Generates content ideas for your brand',
    template: `// Content Ideas Bot
steps:
  - agent: general.respond
    input:
      prompt: "Generate 5 creative content ideas for a tech startup's social media. Each idea should be 1-2 sentences."
    id: generate_ideas`
  }
};

export default function RunBotPage() {
  const router = useRouter();
  const [selectedBot, setSelectedBot] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; output?: any } | null>(null);

  const handleRunBot = async () => {
    if (!selectedBot) {
      setResult({ success: false, message: 'Please select a bot' });
      return;
    }

    setIsRunning(true);
    setResult(null);

    try {
      const bot = QUICK_BOTS[selectedBot as keyof typeof QUICK_BOTS];






      // Create a temporary bot with the template
      const botResponse = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bot.name,
          description: bot.description,
          hivelang_code: bot.template,
          system_prompt: "You are a helpful bot that executes tasks.",
          is_public: false,
        }),
      });

      if (!botResponse.ok) {
        throw new Error('Failed to create temporary bot');
      }

      const { bot: tempBot } = await botResponse.json();
      
      // Execute the bot using the correct endpoint
      const executeResponse = await fetch(`/api/bots/${tempBot.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { prompt: "Execute the template" }
        }),
      });

      if (!executeResponse.ok) {
        throw new Error('Failed to execute bot');
      }

      const executeResult = await executeResponse.json();
      
      setResult({
        success: true,
        message: `${bot.name} completed successfully!`,
        output: executeResult
      });

    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quick Bot Runner</h1>
        <p className="text-gray-600">Run pre-configured bots instantly without setup</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(QUICK_BOTS).map(([key, bot]) => (
          <div
            key={key}
            onClick={() => setSelectedBot(key)}
            className={`p-6 border rounded-lg cursor-pointer transition-all ${
              selectedBot === key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className="text-lg font-semibold mb-2">{bot.name}</h3>
            <p className="text-sm text-gray-600">{bot.description}</p>
          </div>
        ))}
      </div>

      {selectedBot && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {QUICK_BOTS[selectedBot as keyof typeof QUICK_BOTS].name}
          </h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
            {QUICK_BOTS[selectedBot as keyof typeof QUICK_BOTS].template}
          </pre>
        </div>
      )}

      {result && (
        <div className={`p-4 rounded-md mb-6 ${
          result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <p className="font-medium">{result.message}</p>
          {result.output && (
            <details className="mt-2">
              <summary className="cursor-pointer">View Output</summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
                {JSON.stringify(result.output, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={handleRunBot}
          disabled={!selectedBot || isRunning}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? 'Running Bot...' : 'Run Bot'}
        </button>
        
        <button
          onClick={() => router.push('/dashboard/bots')}
          className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Advanced Bots
        </button>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Need More Power?</h3>
        <p className="text-blue-800 mb-4">
          For custom bots with advanced configurations, visit the Bot Helper Center where you can create specialized bots for:
        </p>
        <ul className="list-disc list-inside text-blue-800 space-y-1 mb-4">
          <li>Social media automation (Cadence Publisher)</li>
          <li>Study planning and scheduling (Study Buddy)</li>
          <li>Code review and assistance (Coding Assistant)</li>
        </ul>
        <button
          onClick={() => router.push('/dashboard/bots')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Bot Helper Center
        </button>
      </div>
    </div>
  );
}
