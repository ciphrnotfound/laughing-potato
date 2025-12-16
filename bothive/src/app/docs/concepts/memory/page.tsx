export default function MemoryConceptPage() {
    return (
        <div className="space-y-12 py-8 max-w-3xl">
            <div>
                <h1 className="text-4xl font-bold mb-4">Memory & State</h1>
                <p className="text-lg text-white/60">How agents store and retrieve information.</p>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Three Layers of Memory</h2>
                <div className="space-y-4">
                    <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                        <h3 className="text-lg font-bold text-violet-400 mb-2">1. Short-Term (Context Window)</h3>
                        <p className="text-white/60 text-sm leading-relaxed">
                            This is the immediate conversation history. It is limited by the LLM's context window (e.g., 128k tokens). Bothive automatically manages this via a sliding window and summarization strategy.
                        </p>
                    </div>
                    <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                        <h3 className="text-lg font-bold text-emerald-400 mb-2">2. Key-Value Store (Session)</h3>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Persistent state that lasts for a user session or lifetime. Accessed via `db.get(key)` and `db.set(key, value)`. Useful for user preferences, flags, and counters.
                        </p>
                    </div>
                    <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                        <h3 className="text-lg font-bold text-blue-400 mb-2">3. Vector Memory (RAG)</h3>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Semantic search over large datasets. When you upload documents to a Bot, they are automatically chunked and embedded here.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Using KV Memory</h2>
                <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-4 font-mono text-sm leading-relaxed text-blue-100/90 whitespace-pre">
                    {`bot "MemoryDemo"
  on input
    // Check if we know the user's name
    call db.get("user_name") as name
    
    if name == null
      say "I don't know your name yet. What is it?"
      call input.text() as new_name
      call db.set("user_name", new_name)
      say "Nice to meet you, " + new_name
    else
      say "Welcome back, " + name
    end
  end
end`}
                </div>
            </div>
        </div>
    );
}
