"use client";

import { useState } from "react";
import { Play, Loader2, Terminal, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface RunBotButtonProps {
    botId: string;
    botName: string;
    className?: string;
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg";
}

interface ExecutionLog {
    timestamp: number;
    message: string;
    type: "info" | "success" | "error";
}

export function RunBotButton({
    botId,
    botName,
    className,
    variant = "outline",
    size = "sm"
}: RunBotButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [logs, setLogs] = useState<ExecutionLog[]>([]);
    const [error, setError] = useState<string | null>(null);

    const addLog = (message: string, type: "info" | "success" | "error" = "info") => {
        setLogs(prev => [...prev, { timestamp: Date.now(), message, type }]);
    };

    const handleRun = async () => {
        setIsRunning(true);
        setResult(null);
        setError(null);
        setLogs([]);

        addLog("🚀 Initializing bot execution environment...");
        addLog("📦 Loading bot configuration...");

        try {
            // Small delay to show initialization
            await new Promise(resolve => setTimeout(resolve, 500));

            addLog("⚙️ Compiling HiveLang source code...");
            await new Promise(resolve => setTimeout(resolve, 300));

            addLog("🔧 Preparing execution context...");
            await new Promise(resolve => setTimeout(resolve, 300));

            addLog("▶️ Starting bot execution...");

            const response = await fetch(`/api/bots/${botId}/execute`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    input: {
                        message: "Execute bot",
                        timestamp: new Date().toISOString()
                    }
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Execution failed");
            }

            addLog("✅ Bot executed successfully!", "success");
            setResult(data.result);
        } catch (err: any) {
            const errorMsg = err.message || "Unknown error occurred";
            addLog(`❌ Error: ${errorMsg}`, "error");
            setError(errorMsg);
        } finally {
            setIsRunning(false);
        }
    };

    const getLogIcon = (type: string) => {
        switch (type) {
            case "success":
                return <CheckCircle className="w-3 h-3 text-green-500" />;
            case "error":
                return <XCircle className="w-3 h-3 text-red-500" />;
            default:
                return <span className="text-blue-500">●</span>;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    className={cn(
                        "gap-2",
                        variant === "outline" && "text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/20",
                        className
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(true);
                    }}
                >
                    <Play className="w-3.5 h-3.5" />
                    Run
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[700px] bg-zinc-950 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-indigo-500" />
                        Executing: {botName}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Real-time execution output and logs
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    {/* Execution Logs */}
                    <div>
                        <h4 className="text-sm font-medium text-zinc-300 mb-2">Execution Logs</h4>
                        <ScrollArea className="h-[250px] w-full rounded-md border border-zinc-800 bg-black p-4">
                            <div className="space-y-2 font-mono text-xs">
                                {logs.map((log, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <span className="text-zinc-600 shrink-0">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </span>
                                        {getLogIcon(log.type)}
                                        <span className={cn(
                                            log.type === "success" && "text-green-400",
                                            log.type === "error" && "text-red-400",
                                            log.type === "info" && "text-zinc-300"
                                        )}>
                                            {log.message}
                                        </span>
                                    </div>
                                ))}

                                {isRunning && (
                                    <div className="flex items-center gap-2 text-indigo-400 animate-pulse">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span>Processing...</span>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Result Output */}
                    {(result || error) && (
                        <div>
                            <h4 className="text-sm font-medium text-zinc-300 mb-2">
                                {error ? "Error Details" : "Execution Result"}
                            </h4>
                            <div className={cn(
                                "rounded-md border p-4 font-mono text-sm",
                                error
                                    ? "border-red-800 bg-red-950/20 text-red-400"
                                    : "border-green-800 bg-green-950/20 text-green-400"
                            )}>
                                {error ? (
                                    <div>
                                        <p className="font-semibold mb-2">❌ Execution Failed</p>
                                        <p className="text-xs">{error}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="font-semibold mb-2 text-green-500">✅ Success</p>
                                        <pre className="text-xs text-zinc-300 whitespace-pre-wrap overflow-auto max-h-[150px]">
                                            {typeof result?.output === 'string'
                                                ? result.output
                                                : JSON.stringify(result, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="text-zinc-400 hover:text-white"
                        >
                            Close
                        </Button>
                        <Button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {isRunning ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Running...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-2" />
                                    {result || error ? "Run Again" : "Execute Bot"}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
