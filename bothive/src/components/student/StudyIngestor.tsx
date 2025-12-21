"use client";

import React, { useState } from "react";
import {
    Upload,
    Link as LinkIcon,
    Youtube,
    FileText,
    Check,
    AlertCircle,
    Loader2,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface StudyIngestorProps {
    kbId?: string;
    onComplete?: () => void;
}

export function StudyIngestor({ kbId = "general-study", onComplete }: StudyIngestorProps) {
    const [mode, setMode] = useState<'upload' | 'youtube' | 'link'>('upload');
    const [isUploading, setIsUploading] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [files, setFiles] = useState<File[]>([]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const processUpload = async () => {
        if (files.length === 0) return;
        setIsUploading(true);

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("kbId", kbId);

                const res = await fetch("/api/knowledge", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
            }

            toast.success("Study materials ingested successfully!");
            setFiles([]);
            onComplete?.();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const processYoutube = async () => {
        if (!youtubeUrl) return;
        setIsUploading(true);

        try {
            const res = await fetch("/api/knowledge/youtube", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: youtubeUrl, kbId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to process video");
            }

            toast.success("Lecture transcript ingested!");
            setYoutubeUrl("");
            onComplete?.();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-[#0d0e16] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <FileText className="w-32 h-32 text-indigo-500" />
            </div>

            <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2">Knowledge Ingestor</h3>
                <p className="text-zinc-400 text-sm mb-8">
                    Upload your lecture slides, PDFs, or YouTube URLs to train your study agents.
                </p>

                {/* Mode Switcher */}
                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl mb-8 w-fit border border-white/5">
                    <button
                        onClick={() => setMode('upload')}
                        className={cn(
                            "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                            mode === 'upload' ? "bg-indigo-600 text-white shadow-lg" : "text-zinc-500 hover:text-white"
                        )}
                    >
                        <Upload className="w-4 h-4" />
                        File Upload
                    </button>
                    <button
                        onClick={() => setMode('youtube')}
                        className={cn(
                            "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                            mode === 'youtube' ? "bg-red-600 text-white shadow-lg" : "text-zinc-500 hover:text-white"
                        )}
                    >
                        <Youtube className="w-4 h-4" />
                        YouTube
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {mode === 'upload' ? (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <label className="block w-full cursor-pointer group">
                                <div className="border-2 border-dashed border-white/10 group-hover:border-indigo-500/50 rounded-2xl p-10 flex flex-col items-center justify-center transition-all bg-white/[0.02] group-hover:bg-indigo-500/[0.05]">
                                    <div className="p-4 rounded-full bg-white/5 mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8 text-zinc-400 group-hover:text-indigo-400" />
                                    </div>
                                    <p className="text-white font-bold mb-1">Drop your files here</p>
                                    <p className="text-zinc-500 text-sm">PDF, DOCX, TXT (Max 50MB)</p>
                                    <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                                </div>
                            </label>

                            {files.length > 0 && (
                                <div className="space-y-2">
                                    {files.map((f, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-3 truncate">
                                                <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                                                <span className="text-sm text-white truncate max-w-[200px]">{f.name}</span>
                                            </div>
                                            <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}>
                                                <X className="w-4 h-4 text-zinc-500 hover:text-white" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={processUpload}
                                        disabled={isUploading}
                                        className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                                    >
                                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Process Materials"}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="youtube"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        <Youtube className="w-5 h-5 text-red-500" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Paste YouTube Video URL..."
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 transition-colors"
                                    />
                                </div>
                                <p className="text-xs text-zinc-500 px-2 italic">
                                    We'll automatically extract the transcript and feed it to your study swarms.
                                </p>
                                <button
                                    onClick={processYoutube}
                                    disabled={isUploading || !youtubeUrl}
                                    className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-600/20 disabled:opacity-50"
                                >
                                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze Video"}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
