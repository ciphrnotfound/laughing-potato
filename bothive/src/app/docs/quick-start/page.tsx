import { Code2 } from "lucide-react";

export default function QuickStartPage() {
  return (
    <div className="space-y-12 py-8 max-w-3xl">
      <div>
        <h1 className="text-4xl font-bold mb-4">Quick Start</h1>
        <p className="text-lg text-white/60">
          Deploy your first intelligent agent in under 5 minutes.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Objective</h2>
        <p className="text-white/60">
            We will build a simple <strong>"Research Agent"</strong> that can search the web and summarize its findings.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">1. Create a Bot File</h2>
        <p className="text-white/60">
            Create a file named <code className="bg-white/10 px-1 py-0.5 rounded text-white">researcher.hive</code> in your project root.
        </p>
        
        <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0F]">
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
                <Code2 className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-mono text-white/50">researcher.hive</span>
            </div>
            <div className="p-4 font-mono text-sm leading-relaxed text-blue-100/90 whitespace-pre">
{`bot "Researcher"
  description "A helpful assistant that researches topics online."
  
  on input
    say "Processing your request: " + input
    
    // Call the built-in search tool
    call google.search(
      query: input
    ) as results
    
    // Summarize with LLM
    call ai.generate(
      prompt: "Summarize these search results for the user: " + results
    ) as summary
    
    say summary
  end
end`}
            </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">2. Run Locally</h2>
        <p className="text-white/60">
            Test your bot immediately using the CLI buzz command.
        </p>
        <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-4 font-mono text-sm text-blue-300">
            hive buzz researcher.hive
        </div>
      </div>

       <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">3. Deploy</h2>
        <p className="text-white/60">
            Push your bot to the Bothive cloud to get a persistent API endpoint.
        </p>
        <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-4 font-mono text-sm text-blue-300">
            hive swarm
        </div>
      </div>
    </div>
  );
}
