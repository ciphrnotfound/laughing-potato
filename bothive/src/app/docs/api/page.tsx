export default function ApiReferencePage() {
    return (
        <div className="space-y-12 py-8">
            <div className="max-w-3xl">
                <h1 className="text-4xl font-bold mb-4">API Reference</h1>
                <p className="text-lg text-white/60">
                    Programmatic access to the Bothive platform. Base URL: <code className="text-violet-400 bg-white/10 px-1 py-0.5 rounded">https://api.bothive.dev/v1</code>
                </p>
            </div>

            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Bots</h2>

                    <div className="space-y-8">
                        {/* GET /bots */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold ring-1 ring-blue-500/30">GET</span>
                                <code className="text-white font-mono">/bots</code>
                            </div>
                            <p className="text-white/60 text-sm">List all bots in your workspace.</p>
                        </div>

                        {/* POST /bots */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold ring-1 ring-green-500/30">POST</span>
                                <code className="text-white font-mono">/bots</code>
                            </div>
                            <p className="text-white/60 text-sm">Create a new bot definition.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Execution</h2>

                    <div className="space-y-8">
                        {/* POST /run */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold ring-1 ring-green-500/30">POST</span>
                                <code className="text-white font-mono">/run</code>
                            </div>
                            <p className="text-white/60 text-sm">Execute a bot run synchronously.</p>
                            <div className="bg-[#0A0A0F] p-4 rounded-lg font-mono text-xs text-white/70 overflow-x-auto">
                                {`{
  "bot_id": "bot_123",
  "input": "Research quantum computing",
  "stream": false
}`}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
