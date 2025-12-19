"use client";

import React from "react";
import { Copy, Terminal, Zap, Globe, Database, Cpu, Check } from "lucide-react";
import { motion } from "framer-motion";

const EXAMPLES = [
  {
    title: "1. Data Structures & Math",
    description: "Native support for Arrays, Objects, and Arithmetic operations.",
    icon: Database,
    code: `bot "MathAndDataBot"
  on input
    // Arrays and Objects
    set items = ["Apple", "Banana", "Cherry"]
    set config = { 
        "mode": "dark", 
        "max_items": 5 
    }
    
    // Complex Access
    say f"First item: {items[0]}"
    say f"Config mode: {config.mode}"

    // Arithmetic
    set price = 10
    set tax = 0.2
    set total = price * (1 + tax)
    
    say f"Total Price: {total}"
  end
end`
  },
  {
    title: "2. Loops & Control Flow",
    description: "Iterate over lists and use complex logic.",
    icon: Zap,
    code: `bot "LoopBot"
  on input
    set users = ["Alice", "Bob", "Charlie"]
    
    // Loop through arrays
    loop user in users
      say f"Processing user: {user}"
      
      if user == "Alice"
        say "Found Admin!"
      end
    end

    // Comparisons
    set score = 85
    if score >= 80 and score < 90
        say "Grade: B"
    end
  end
end`
  },
  {
    title: "3. Making HTTP Requests",
    description: "Connect to external APIs using strict types. All tool calls return structured JSON objects.",
    icon: Globe,
    code: `bot "APIConnector"
  description "Fetches data from external sources"

  on input
    // Simple GET request
    call http.get(
      url: "https://api.coingecko.com/api/v3/simple/price",
      params: { 
        ids: "bitcoin", 
        vs_currencies: "usd" 
      }
    ) as price_data

    say "Current Bitcoin Price: $" + price_data.bitcoin.usd
    
    // POST request with headers
    call http.post(
      url: "https://api.example.com/webhooks",
      headers: { "Authorization": "Bearer " + user.api_key },
      body: { 
        event: "price_update", 
        value: price_data.bitcoin.usd 
      }
    )
  end
end`
  },
  {
    title: "4. Database Operations",
    description: "Store and retrieve persistent user data across conversations.",
    icon: Database,
    code: `bot "MemoryBot"
  on input
    // Store user preference
    call db.set(
      key: "user_" + user.id + "_preference",
      value: { theme: "dark", language: "en" }
    )

    // Retrieve valuable info
    call db.get(key: "user_" + user.id + "_history") as history

    if history.last_visit == "today"
      say "Welcome back! Good to see you again so soon."
    else
      say "Long time no see!"
    end
  end
end`
  }
];

export default function HiveLangDocsPage() {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-16 py-8">

      {/* Header */}
      <div className="space-y-6 border-b border-white/5 pb-10">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-mono font-medium">SDK v2.0</span>
          <span className="text-white/40 text-sm">Latest Stable</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight">HiveLang Reference</h1>
        <p className="text-xl text-white/60 max-w-3xl leading-relaxed">
          The complete guide to writing intelligent agents. HiveLang v2 introduces type safety, parallel execution, and a unified syntax for bot definitions.
        </p>
        <div className="flex gap-4">
          <button className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-neutral-200 transition-colors">
            Get Started
          </button>
          <button className="px-5 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">
            View on GitHub
          </button>
        </div>
      </div>

      {/* Examples Section */}
      <div className="space-y-20">
        {EXAMPLES.map((example, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-start"
          >
            {/* Description */}
            <div className="space-y-4 lg:sticky lg:top-32">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <example.icon className="w-6 h-6 text-violet-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">{example.title}</h2>
              <p className="text-white/50 leading-relaxed text-lg">
                {example.description}
              </p>

              {/* Visual indicator of features */}
              <ul className="space-y-2 mt-4 text-sm text-white/40">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  Type-safe syntax
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  Native capabilities
                </li>
              </ul>
            </div>

            {/* Code Block */}
            <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0F] shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 text-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 text-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 text-green-500/50" />
                </div>
                <div className="text-xs font-mono text-white/30">bot.hive</div>
                <button
                  onClick={() => copyCode(example.code, i)}
                  className="text-white/30 hover:text-white transition-colors"
                >
                  {copiedIndex === i ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="font-mono text-sm leading-relaxed text-blue-100/90 whitespace-pre">
                  {example.code.split('\n').map((line, idx) => (
                    <div key={idx} className="table-row">
                      <span className="table-cell select-none text-white/10 text-right pr-4 w-8">{idx + 1}</span>
                      <span className="table-cell">{line}</span>
                    </div>
                  ))}
                </pre>
              </div>
              <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/5 rounded-xl" />
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
