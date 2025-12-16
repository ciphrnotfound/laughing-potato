export default function PostgresDocsPage() {
    return (
        <div className="space-y-12 py-8 max-w-3xl">
            <div>
                <h1 className="text-4xl font-bold mb-4">PostgreSQL Integration</h1>
                <p className="text-lg text-white/60">Directly query your database from within an agent.</p>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Setup</h2>
                <div className="space-y-4 text-white/60">
                    <p>1. Ensure your Bothive instance has access to your database (allowlist IP if necessary).</p>
                    <p>2. You will need your connection string: <code className="text-sm bg-white/10 px-1 rounded">postgres://user:pass@host:5432/db</code></p>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Usage Example</h2>
                <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-4 font-mono text-sm leading-relaxed text-blue-100/90 whitespace-pre">
                    {`bot "DatabaseAnalyst"
  description "Analyzes user data from the production DB"
  
  on input
    // 1. Run a query
    call postgres.query(
        connection_string: user.db_url,
        sql: "SELECT count(*) as user_count FROM users WHERE created_at > $1",
        params: ["2024-01-01"]
    ) as result
    
    // 2. Use the data
    say "New users this year: " + result.rows[0].user_count
  end
end`}
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Security Note</h2>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <p className="text-yellow-200 text-sm">
                        <strong>Warning:</strong> Be careful when allowing agents to execute SQL. Always use read-only users where possible, or strictly scope the connection permissions.
                    </p>
                </div>
            </div>
        </div>
    );
}
