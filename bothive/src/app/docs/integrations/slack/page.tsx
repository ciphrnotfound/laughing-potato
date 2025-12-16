export default function SlackDocsPage() {
    return (
        <div className="space-y-12 py-8 max-w-3xl">
            <div>
                <h1 className="text-4xl font-bold mb-4">Slack Integration</h1>
                <p className="text-lg text-white/60">Send messages and listen to channels.</p>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Usage Example</h2>
                <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-4 font-mono text-sm leading-relaxed text-blue-100/90 whitespace-pre">
                    {`bot "SlackNotifier"
  on input
    // Send a message to a channel
    call slack.post_message(
        channel: "#general",
        text: "Hello from Bothive! 🐝"
    )
    
    // Direct message a user (requires user ID)
    call slack.post_message(
        channel: "@jeremy",
        text: "Your task is complete."
    )
  end
end`}
                </div>
            </div>
        </div>
    );
}
