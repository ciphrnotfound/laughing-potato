export default function ToolsConceptPage() {
    return (
        <div className="space-y-12 py-8 max-w-3xl">
            <div>
                <h1 className="text-4xl font-bold mb-4">Tool Execution</h1>
                <p className="text-lg text-white/60">The lifecycle of a tool call.</p>
            </div>

            <div className="space-y-8">
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">How Tools Work</h2>
                    <p className="text-white/60 leading-relaxed">
                        Tools are the "hands" of an agent. They allow the LLM to interact with the outside world. In Bothive, every tool is a strictly typed function defined in TypeScript or automatically generated from an Integration.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">The Execution Loop</h2>
                    <div className="relative pl-8 border-l border-white/10 space-y-8">
                        <div className="relative">
                            <div className="absolute -left-[37px] w-4 h-4 rounded-full bg-violet-500 ring-4 ring-[#020202]" />
                            <h3 className="font-bold text-white">1. Intent Detection</h3>
                            <p className="text-sm text-white/50 mt-1">The LLM decides it needs to call a tool (e.g., `google.search`) to fulfill a query.</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[37px] w-4 h-4 rounded-full bg-violet-500/50 ring-4 ring-[#020202]" />
                            <h3 className="font-bold text-white">2. Parameter Validation</h3>
                            <p className="text-sm text-white/50 mt-1">Bothive runtime validates the arguments against the tool's schema (e.g., checking if `query` is a string).</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[37px] w-4 h-4 rounded-full bg-violet-500/50 ring-4 ring-[#020202]" />
                            <h3 className="font-bold text-white">3. Execution & Networking</h3>
                            <p className="text-sm text-white/50 mt-1">The actual code runs (or HTTP request is sent).</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[37px] w-4 h-4 rounded-full bg-violet-500/50 ring-4 ring-[#020202]" />
                            <h3 className="font-bold text-white">4. Observation</h3>
                            <p className="text-sm text-white/50 mt-1">The tool result is fed back to the LLM as a system message.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
