"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Terminal,
    Play,
    Zap,
    Settings,
    ChevronRight,
    Box,
    FileCode,
    Cpu,
    Search,
    Loader2,
    RefreshCcw,
    Save,
    Share,
    ChevronDown,
    Folder,
    File,
    Command,
    ExternalLink,
    HelpCircle,
    Sun,
    Moon,
    Layout
} from "lucide-react";
import {
    IconTerminal2,
    IconBrandTabler,
    IconBolt,
    IconHierarchy,
    IconSearch,
    IconPackage,
    IconFiles,
    IconSettings2,
    IconChevronRight,
    IconAdjustmentsHorizontal
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import HiveLangEditor from "@/components/developer/HiveLangEditor";
import { useTheme } from "@/lib/theme-context";

// Sample HiveLang Code
const DEFAULT_CODE = `# HiveLang v3 Orchestration
bot SwarmCommander
  description "Primary orchestrator for multi-agent workflows"

  on input
    # Analyze user intent using AI
    call ai.analyze with {
      input: input,
      tone: "professional"
    } as intent

    if intent contains "create"
      # Delegate to specific agents
      parallel
        call Researcher.findData with { query: input } as rawData
        call Analyst.process with { data: rawData } as processedData
      end
      
      say "Orchestration complete. " + processedData.summary
    else
      say "Awaiting command, commander."
    end
  end
end
`;

// Study Buddy Swarm Template
const STUDY_BUDDY_CODE = `bot StudyBuddySwarm
  description "Your ultimate AI study companion with specialized agents"
  
  memory session
    var handled boolean
  end

  agent ResearchAgent
    on input
      if task == "find_resources"
        parallel
          call youtube.search with query: f"{topic} tutorial explained", max_results: "5" as videos
          call google.search with query: f"{topic} study guide pdf", type: "pdf" as pdfs
          call spotify.search with query: "lofi study music", type: "playlist" as playlists
        end
        return { "videos": videos.items, "pdfs": pdfs.items, "music": playlists, "topic": topic }
      end
    end
  end

  agent ProjectManagerAgent
    on input
      if task == "create_study_plan"
        call trello.create_board with name: f"📚 Study: {subject}" as board
        call trello.get_lists with board_id: board.id as lists
        loop topic in topics
          call trello.create_card with list_id: lists[0].id, title: topic.name
        end
        say "📋 Created study board: " + board.url
        return board
      end
    end
  end

  on input
    if input contains "study plan" or input contains "create"
      say "📅 Let's organize your study plan!"
      delegate to ProjectManagerAgent with task: "create_study_plan", subject: "Computer Science", topics: [{"name": "Algorithms"}]
    end

    if input contains "find" or input contains "search"
      say "🔍 Searching for materials..."
      delegate to ResearchAgent with task: "find_resources", topic: input
    end
  end
end`;

const TEMPLATES = [
    { name: "Study Buddy Swarm", code: STUDY_BUDDY_CODE, icon: IconHierarchy, description: "Advanced multi-agent swarm" },
    { name: "Basic Web Scraper", code: "bot Scraper\n  on input\n    call http.request with url: input as res\n    say \"Scraped content length: \" + res.length\n  end\nend", icon: FileCode, description: "Simple HTTP integration" },
];

export default function HiveLangIDE() {
    const [code, setCode] = useState(DEFAULT_CODE);
    const [runInput, setRunInput] = useState('{"message": "create study plan for algorithms"}');
    const [activity, setActivity] = useState<"files" | "search" | "extensions" | "debug">("files");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [logs, setLogs] = useState<{ type: string; msg: string; time: string }[]>([
        { type: "system", msg: "Initialized HiveLang Environment...", time: new Date().toLocaleTimeString() },
        { type: "system", msg: "AI Proactivity Pulse: Ready", time: new Date().toLocaleTimeString() }
    ]);
    const [isCompiling, setIsCompiling] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const { isDark, toggleTheme } = useTheme();

    const addLog = (msg: string, type = "info") => {
        setLogs(prev => [...prev.slice(-100), { type, msg, time: new Date().toLocaleTimeString() }]);
    };

    const handleLoadTemplate = (templateCode: string) => {
        setCode(templateCode);
        addLog("Loaded template into editor.", "info");
    };

    const handleCompile = async () => {
        setIsCompiling(true);
        addLog("Starting compilation...", "info");
        try {
            const res = await fetch("/api/developer/compile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });
            const data = await res.json();
            if (data.valid) {
                addLog("Syntax check passed. Ready for execution.", "success");
            } else {
                data.errors.forEach((err: string) => addLog(err, "error"));
            }
        } catch (e) {
            addLog("Network Error: Failed to reach compiler.", "error");
        }
        setIsCompiling(false);
    };

    const handleRun = async () => {
        setIsRunning(true);
        addLog("Launching simulation...", "info");
        try {
            let parsedInput = {};
            try { parsedInput = JSON.parse(runInput); } catch (e) { addLog("Invalid JSON input. Using empty object.", "warn"); }

            const res = await fetch("/api/developer/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, input: parsedInput }),
            });
            const data = await res.json();

            if (data.success) {
                data.transcript.forEach((t: any) => {
                    if (t.type === "say") addLog(`[Bot] ${t.payload}`, "bot");
                    if (t.type === "call") addLog(`[Tool] ${t.tool}(${JSON.stringify(t.args)})`, "tool");
                });
                addLog("Simulation finished successfully.", "success");
            } else {
                addLog(`Runtime Error: ${data.error}`, "error");
            }
        } catch (e) {
            addLog("Network Error: Failed to reach execution engine.", "error");
        }
        setIsRunning(false);
    };

    return (
        <div className={cn(
            "h-screen flex flex-col font-sans selection:bg-purple-500/30 overflow-hidden",
            isDark ? "bg-[#08080C] text-white" : "bg-white text-slate-900"
        )}>
            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden">

                {/* 1. Activity Bar (Vercel/WebStorm Style) */}
                <aside className={cn(
                    "w-12 border-r flex flex-col items-center py-4 gap-4 z-20",
                    isDark ? "bg-[#0A0A0F] border-white/5" : "bg-zinc-50 border-zinc-200"
                )}>
                    <button
                        onClick={() => setActivity("files")}
                        className={cn("p-2 rounded-lg transition-all", activity === "files" ? (isDark ? "text-white bg-white/10" : "text-black bg-zinc-200") : "text-zinc-500 hover:text-zinc-300")}
                    >
                        <IconFiles className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setActivity("search")}
                        className={cn("p-2 rounded-lg transition-all", activity === "search" ? (isDark ? "text-white bg-white/10" : "text-black bg-zinc-200") : "text-zinc-500 hover:text-zinc-300")}
                    >
                        <IconSearch className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setActivity("extensions")}
                        className={cn("p-2 rounded-lg transition-all", activity === "extensions" ? (isDark ? "text-white bg-white/10" : "text-black bg-zinc-200") : "text-zinc-500 hover:text-zinc-300")}
                    >
                        <IconPackage className="w-5 h-5" />
                    </button>

                    <div className="mt-auto flex flex-col items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-zinc-500 hover:text-zinc-300"
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button className="p-2 text-zinc-500 hover:text-zinc-300">
                            <IconSettings2 className="w-5 h-5" />
                        </button>
                    </div>
                </aside>

                {/* 2. Side Panel (File Explorer & Templates) */}
                <aside className={cn(
                    "w-64 border-r flex flex-col bg-transparent z-10 transition-all",
                    sidebarCollapsed ? "hidden" : "flex",
                    isDark ? "border-white/5" : "border-zinc-200"
                )}>
                    <header className="h-10 flex items-center justify-between px-4 border-b border-inherit">
                        <span className="text-[11px] uppercase font-bold tracking-widest opacity-40">Explorer & Templates</span>
                        <ChevronDown className="w-3.5 h-3.5 opacity-40" />
                    </header>
                    <div className="flex-1 overflow-y-auto py-2">
                        {/* Templates Section */}
                        <div className="px-2 mb-6">
                            <div className="flex items-center gap-2 px-2 py-1.5 text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">
                                <Zap className="w-3 h-3" />
                                <span>Templates</span>
                            </div>
                            <div className="space-y-1">
                                {TEMPLATES.map((tmpl) => (
                                    <button
                                        key={tmpl.name}
                                        onClick={() => handleLoadTemplate(tmpl.code)}
                                        className={cn(
                                            "w-full flex flex-col items-start gap-1 p-2 rounded-md transition-all text-left",
                                            isDark ? "hover:bg-white/5" : "hover:bg-black/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 text-xs font-semibold">
                                            <tmpl.icon className="w-3.5 h-3.5 text-purple-500" />
                                            <span>{tmpl.name}</span>
                                        </div>
                                        <span className="text-[10px] opacity-50 ml-5">{tmpl.description}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Files Section */}
                        <div className="px-2">
                            <div className="flex items-center gap-2 px-2 py-1.5 text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">
                                <Folder className="w-3.5 h-3.5" />
                                <span>Source</span>
                            </div>
                            <div className="ml-4 space-y-0.5">
                                <div className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs cursor-pointer",
                                    isDark ? "bg-white/5 text-purple-400" : "bg-purple-50 text-purple-600"
                                )}>
                                    <IconHierarchy className="w-3.5 h-3.5" />
                                    <span>Commander.hive</span>
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-zinc-500/5 cursor-pointer opacity-60">
                                    <FileCode className="w-3.5 h-3.5" />
                                    <span>Researcher.hive</span>
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-zinc-500/5 cursor-pointer opacity-60">
                                    <FileCode className="w-3.5 h-3.5" />
                                    <span>Analyst.hive</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* 3. Editor & Terminal Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-transparent relative">

                    {/* Toolbar */}
                    <header className={cn(
                        "h-10 border-b flex items-center justify-between px-4 z-10",
                        isDark ? "bg-[#0A0A0F] border-white/5" : "bg-zinc-50 border-zinc-200"
                    )}>
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "flex items-center gap-2 px-3 py-1 border-t-2 text-[11px] font-medium",
                                isDark ? "border-purple-500 bg-[#08080C] text-white" : "border-purple-600 bg-white text-black"
                            )}>
                                <IconHierarchy className="w-3.5 h-3.5 text-purple-500" />
                                Commander.hive
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCompile}
                                disabled={isCompiling}
                                className={cn(
                                    "flex items-center gap-2 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all",
                                    isDark ? "hover:bg-white/5 text-zinc-400" : "hover:bg-black/5 text-zinc-600"
                                )}
                            >
                                {isCompiling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
                                COMPILE
                            </button>
                            <button
                                onClick={handleRun}
                                disabled={isRunning}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1 text-[11px] font-bold rounded-md transition-all",
                                    isDark ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                )}
                            >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                RUN SIMULATION
                            </button>
                            <button className={cn(
                                "flex items-center gap-2 px-3 py-1 text-[11px] font-bold text-white rounded-md bg-purple-600 hover:bg-purple-500 transition-all",
                                "shadow-sm shadow-purple-500/20"
                            )}>
                                <Zap className="w-3 h-3 fill-white" />
                                DEPLOY
                            </button>
                        </div>
                    </header>

                    {/* Editor */}
                    <div className="flex-1 relative overflow-hidden">
                        <HiveLangEditor
                            value={code}
                            onChange={(v) => setCode(v || "")}
                            className="h-full w-full"
                        />
                    </div>

                    {/* Console/Terminal */}
                    <div className={cn(
                        "h-48 border-t flex flex-col",
                        isDark ? "bg-[#08080C] border-white/5" : "bg-white border-zinc-200"
                    )}>
                        <header className="h-8 border-b border-inherit px-4 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest opacity-40">
                            <div className="flex items-center gap-4">
                                <span>Output</span>
                                <span>Debug Console</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px]">Input:</span>
                                    <input
                                        value={runInput}
                                        onChange={(e) => setRunInput(e.target.value)}
                                        className={cn(
                                            "border-none outline-none px-2 py-0.5 rounded w-48 text-[10px] lowercase focus:ring-1 transition-all",
                                            isDark ? "bg-white/5 ring-purple-500/30 text-white" : "bg-black/5 ring-purple-600/20 text-black"
                                        )}
                                        placeholder='{"message": "..."}'
                                    />
                                </div>
                                <button onClick={() => setLogs([])} className="hover:opacity-100 transition-opacity">Clear</button>
                            </div>
                        </header>
                        <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className={cn(
                                    "flex gap-3",
                                    log.type === "error" ? "text-red-500" :
                                        log.type === "success" ? "text-emerald-500" :
                                            log.type === "bot" ? "text-purple-400" :
                                                log.type === "tool" ? "text-sky-400" :
                                                    log.type === "warn" ? "text-amber-500" : "opacity-40"
                                )}>
                                    <span className="opacity-30 w-6">{i + 1}</span>
                                    <span className="opacity-20">{log.time}</span>
                                    <span className="flex-1">{log.msg}</span>
                                </div>
                            ))}
                            {isCompiling && (
                                <div className="flex items-center gap-2 text-purple-500 animate-pulse">
                                    <span className="opacity-30 w-6">{logs.length + 1}</span>
                                    <span>_ Compiling HiveLang v3.4.1...</span>
                                </div>
                            )}
                            {isRunning && (
                                <div className="flex items-center gap-2 text-emerald-500 animate-pulse">
                                    <span className="opacity-30 w-6">{logs.length + 1}</span>
                                    <span>_ Running Simulation...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. Status Bar */}
                    <footer className={cn(
                        "h-6 border-t flex items-center justify-between px-3 text-[10px] uppercase font-bold tracking-widest z-20",
                        isDark ? "bg-purple-600 text-white" : "bg-purple-700 text-white"
                    )}>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <RefreshCcw className="w-3 h-3" />
                                <span>Ready</span>
                            </div>
                            <div className="flex items-center gap-1.5 opacity-70">
                                <IconHierarchy className="w-3 h-3" />
                                <span>main*</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <span>Line 1, Col 1</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span>UTF-8</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span>HiveLang</span>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
}
