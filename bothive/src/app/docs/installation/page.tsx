export default function InstallationPage() {
    return (
        <div className="space-y-12 py-8 max-w-3xl">
            <div>
                <h1 className="text-4xl font-bold mb-4">Installation</h1>
                <p className="text-lg text-white/60">
                    Get up and running with Bothive locally or on your server.
                </p>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Prerequisites</h2>
                <ul className="list-disc list-inside space-y-2 text-white/60 ml-4">
                    <li>Node.js 18.0 or later</li>
                    <li>PostgreSQL 14+ (or Supabase project)</li>
                    <li>OpenAI API Key (or other supported LLM provider)</li>
                </ul>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">1. Install the CLI</h2>
                <p className="text-white/60">
                    The HiveLang CLI is the primary way to develop, test, and deploy your swarms.
                </p>
                <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-4 font-mono text-sm text-blue-300">
                    npm install -g hivelang
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">2. Initialize Project</h2>
                <p className="text-white/60">
                    Create a new directory for your project and spawn a new hive.
                </p>
                <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-4 font-mono text-sm space-y-2">
                    <div className="text-white/50"># Create directory</div>
                    <div className="text-blue-300">mkdir my-first-swarm && cd my-first-swarm</div>
                    <br />
                    <div className="text-white/50"># Spawn a new hive</div>
                    <div className="text-blue-300">hive spawn</div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">3. Configure Environment</h2>
                <p className="text-white/60">
                    The spawn command will create a <code className="bg-white/10 px-1 py-0.5 rounded text-white">.env</code> file. Fill in your keys:
                </p>
                <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-4 font-mono text-sm text-green-300 whitespace-pre">
                    {`BOTHIVE_API_KEY=bv_sk_...
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://user:pass@localhost:5432/bothive`}
                </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-white/10">
                <h2 className="text-2xl font-bold text-white">Advanced: Distributing this CLI</h2>
                <p className="text-white/60">
                    To make this tool available to your team or customers (via <code>npm install -g hivelang</code>), you need to publish it to the npm registry.
                </p>
                <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-4 font-mono text-sm space-y-2">
                    <div className="text-white/50"># 1. Build the CLI</div>
                    <div className="text-blue-300">npm run build:cli</div>
                    <br/>
                    <div className="text-white/50"># 2. Publish (requires npm login)</div>
                    <div className="text-blue-300">npm publish --access public</div>
                </div>
                <p className="text-white/60 text-sm">
                    Once published, anyone can install your specific version of the `hivelang` tool globally.
                </p>
            </div>
        </div>
    );
}
