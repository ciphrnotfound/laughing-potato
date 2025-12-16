"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import {
    Play,
    Save,
    Settings,
    ChevronLeft,
    Terminal,
    Box,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_CODE = `@integration my_new_tool
@category productivity
@icon ⚡

# Define what this integration can do
@capability say_hello(name)
  return "Hello " + name + " from Hivelang!"
end
`;

export default function IntegrationEditor() {
    const router = useRouter();
    const [code, setCode] = useState(DEFAULT_CODE);
    const [isDeploying, setIsDeploying] = useState(false);
    const [consoleOutput, setConsoleOutput] = useState<string[]>([
        "Ready to build.",
        "> Waiting for input..."
    ]);

    const handleTest = () => {
        setConsoleOutput(prev => [...prev, "> Compiling...", "✓ Compilation Successful", "> Running test...", "Output: 'Hello User from Hivelang!'"]);
    };

    const handleDeploy = async () => {
        setIsDeploying(true);
        await new Promise(r => setTimeout(r, 1500)); // Mock deploy
        setIsDeploying(false);
        setConsoleOutput(prev => [...prev, "🚀 Deployment Initiated...", "✓ Uploaded to Edge", "✓ Function Active"]);
    };

    return (
        <div className="h-screen bg-[#09090b] flex flex-col text-white overflow-hidden">
            {/* Top Bar */}
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-zinc-950">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="text-xl">⚡</span>
                        <div>
                            <div className="text-sm font-medium">Untitled Integration</div>
                            <div className="text-[10px] text-zinc-500 font-mono">v0.0.1 • Draft</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                        <Settings className="w-4 h-4 mr-2" />
                        Config
                    </Button>
                    <Button
                        onClick={handleTest}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white border border-white/5"
                        size="sm"
                    >
                        <Play className="w-3 h-3 mr-2 fill-current" />
                        Run Test
                    </Button>
                    <Button
                        onClick={handleDeploy}
                        className={cn("transition-all", isDeploying ? "bg-purple-500/20 text-purple-300" : "bg-white text-black hover:bg-zinc-200")}
                        size="sm"
                    >
                        {isDeploying ? <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />}
                        {isDeploying ? "Deploying..." : "Deploy Integration"}
                    </Button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Pane */}
                <div className="flex-1 flex flex-col border-r border-white/5 bg-[#0a0a0f] relative">
                    <Editor
                        height="100%"
                        defaultLanguage="ruby" // Ruby highlighting looks closest to Hivelang
                        value={code}
                        onChange={(val) => setCode(val || "")}
                        theme="vs-dark"
                        options={{
                            padding: { top: 24, bottom: 24 },
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', monospace",
                            lineHeight: 1.6,
                            smoothScrolling: true,
                            cursorBlinking: "smooth"
                        }}
                    />
                    {/* Floating Status */}
                    <div className="absolute bottom-4 right-4 text-[10px] text-zinc-500 font-mono flex items-center gap-2 pointer-events-none">
                        <span>Ln 12, Col 4</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Hivelang Server Active</span>
                    </div>
                </div>

                {/* Right Panel: Output & Docs */}
                <div className="w-[400px] flex flex-col bg-zinc-950">
                    {/* Logs Header */}
                    <div className="h-10 border-b border-white/10 flex items-center px-4 gap-2">
                        <Terminal className="w-3 h-3 text-zinc-500" />
                        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Console Output</span>
                    </div>

                    {/* Logs Content */}
                    <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2">
                        {consoleOutput.map((log, i) => (
                            <div key={i} className={cn(
                                "break-words",
                                log.startsWith(">") ? "text-zinc-500" :
                                    log.startsWith("✓") ? "text-emerald-400" :
                                        log.startsWith("🚀") ? "text-purple-400" :
                                            log.startsWith("Error") ? "text-red-400" : "text-zinc-300"
                            )}>
                                {log}
                            </div>
                        ))}
                        <div className="animate-pulse text-purple-500">_</div>
                    </div>

                    {/* Quick Docs Snippet */}
                    <div className="h-[200px] border-t border-white/10 bg-zinc-900/30 p-4">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400">
                            <Box className="w-3 h-3" />
                            <span className="text-xs font-bold uppercase">Quick Reference</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 space-y-1">
                            <p><code className="text-purple-300">@integration</code> - Define plugin name</p>
                            <p><code className="text-purple-300">@capability</code> - Define callable function</p>
                            <p><code className="text-emerald-300">http.get(url)</code> - Make GET request</p>
                            <p><code className="text-emerald-300">http.post(url, body)</code> - Make POST request</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
