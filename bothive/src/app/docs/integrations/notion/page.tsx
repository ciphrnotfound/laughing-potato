export default function NotionDocsPage() {
    return (
        <div className="space-y-12 py-8 max-w-3xl">
            <div>
                <h1 className="text-4xl font-bold mb-4">Notion Integration</h1>
                <p className="text-lg text-white/60">Connect your bots to Notion pages and databases.</p>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Setup</h2>
                <ol className="list-decimal list-inside space-y-4 text-white/60 ml-2">
                    <li>Go to <a href="#" className="text-violet-400 hover:underline">Notion My Integrations</a> and create a new internal integration.</li>
                    <li>Copy the <strong>Internal Integration Token</strong> (starts with `secret_`).</li>
                    <li>In Bothive Dashboard, go to <strong>Settings &gt; Integrations</strong>.</li>
                    <li>Paste the token into the Notion card.</li>
                    <li>Go to the Notion page you want to access, click <strong>... &gt; Connections</strong> and add your integration.</li>
                </ol>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Available Tools</h2>
                <div className="space-y-3">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                        <code className="text-violet-400 font-mono text-sm block mb-2">notion.create_page(title, content, parent_id)</code>
                        <p className="text-sm text-white/50">Creates a new page inside a specific parent page.</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                        <code className="text-violet-400 font-mono text-sm block mb-2">notion.search(query)</code>
                        <p className="text-sm text-white/50">Searches titles of all pages the integration has access to.</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                        <code className="text-violet-400 font-mono text-sm block mb-2">notion.add_database_item(database_id, properties)</code>
                        <p className="text-sm text-white/50">Adds a new row to a database.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
