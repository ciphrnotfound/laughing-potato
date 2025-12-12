"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { IconBroadcast, IconUsers, IconSparkles } from "@tabler/icons-react";

type WorkforceIteration = {
    outputs: Record<string, string>;
    steps: Record<string, any[]>;
    busSnapshot: Array<{ sender?: string; content?: string; timestamp?: number }>;
};

type WorkforceStatusResponse = {
    success: boolean;
    status: string;
    jobId: string;
    progress?: number;
    error?: string;
    result?: any;
    iterations?: WorkforceIteration[];
};

const POLL_INTERVAL = 3000;

export default function WorkforceRunPage({ params }: { params: { id: string } }) {
    const [status, setStatus] = useState<WorkforceStatusResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<"sse" | "polling">("sse");

    useEffect(() => {
        let mounted = true;
        let pollingTimer: NodeJS.Timeout | null = null;
        let eventSource: EventSource | null = null;
        let finished = false;

        const handlePayload = (payload: WorkforceStatusResponse) => {
            if (!mounted) return;
            if (!payload.success) {
                setError(payload.error || "Unable to load job status");
                setLoading(false);
                return;
            }

            setStatus(payload);
            setError(null);
            setLoading(false);

            const iterationPayload = payload.iterations ?? extractIterations(payload.result);
            if (iterationPayload) {
                setIterations(iterationPayload);
            }

            if (payload.status === "completed" || payload.status === "failed") {
                finished = true;
                eventSource?.close();
                if (pollingTimer) clearInterval(pollingTimer);
            }
        };

        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/workforce/status?id=${params.id}`);
                const json = (await res.json()) as WorkforceStatusResponse;
                handlePayload(json);
            } catch (err) {
                if (!mounted) return;
                setError(err instanceof Error ? err.message : String(err));
            }
        };

        const startPolling = () => {
            setMode("polling");
            void fetchStatus();
            pollingTimer = setInterval(fetchStatus, POLL_INTERVAL);
        };

        const connectSSE = () => {
            if (typeof window === "undefined") return;
            setMode("sse");
            eventSource = new EventSource(`/api/workforce/stream?id=${params.id}`);
            eventSource.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data) as WorkforceStatusResponse;
                    handlePayload(payload);
                } catch (err) {
                    setError("Stream parsing error");
                }
            };
            eventSource.onerror = () => {
                eventSource?.close();
                if (!finished) {
                    startPolling();
                }
            };
        };

        connectSSE();
        return () => {
            mounted = false;
            eventSource?.close();
            if (pollingTimer) clearInterval(pollingTimer);
        };
    }, [params.id]);

    const [iterations, setIterations] = useState<WorkforceIteration[]>([]);

    const memoIterations: WorkforceIteration[] = useMemo(() => iterations, [iterations]);

    const jobState = status?.status ?? (loading ? "loading" : "unknown");

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#04000f] text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-24 top-0 h-[30rem] w-[30rem] rounded-full bg-gradient-to-r from-[#3b0a8c] to-[#8c3aff] opacity-40 blur-[160px]" />
                <div className="absolute bottom-0 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-gradient-to-l from-[#1c0c4b] to-[#5c16b5] opacity-30 blur-[180px]" />
            </div>

            <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
                <header className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-8 shadow-2xl">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-white/50">Autonomous Workforce</p>
                            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Job #{params.id}</h1>
                        </div>
                        <Link
                            href="/dashboard"
                            className="rounded-full border border-white/30 px-4 py-2 text-sm text-white transition hover:border-white"
                        >
                            Back to hub
                        </Link>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        <HighlightCard
                            icon={<IconUsers size={22} />}
                            label="Agents collaborating"
                            value={`${memoIterations.at(-1)?.outputs ? Object.keys(memoIterations.at(-1)?.outputs ?? {}).length : "—"}`}
                        />
                        <HighlightCard
                            icon={<IconBroadcast size={22} />}
                            label="Viewer mode"
                            value={mode === "sse" ? "Live stream" : "Polling"}
                            subtle
                        />
                        <HighlightCard
                            icon={<IconSparkles size={22} />}
                            label="Status"
                            value={jobState}
                        />
                    </div>
                </header>

                <StatusBanner status={jobState} progress={status?.progress} error={error ?? status?.error} />

                <section className="rounded-[32px] border border-white/10 bg-white/5/50 p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.4em] text-white/50">Collaboration timeline</p>
                            <h2 className="text-2xl font-semibold">Iterations</h2>
                        </div>
                        <span className="text-sm text-white/70">{memoIterations.length || "No"} iterations captured</span>
                    </div>
                    <div className="mt-6 space-y-6">
                        {memoIterations.length === 0 && (
                            <EmptyState loading={loading} />
                        )}
                        {memoIterations.map((iteration, idx) => (
                            <IterationCard key={idx} index={idx} iteration={iteration} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

function StatusBanner({ status, progress, error }: { status: string; progress?: number; error?: string | null }) {
    const colorMap: Record<string, string> = {
        completed: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
        failed: "bg-rose-500/10 text-rose-300 border-rose-500/40",
        active: "bg-amber-500/10 text-amber-300 border-amber-500/40",
        waiting: "bg-blue-500/10 text-blue-300 border-blue-500/40",
        loading: "bg-zinc-500/10 text-zinc-200 border-zinc-500/40",
    };
    const tone = colorMap[status] ?? colorMap.loading;

    return (
        <div className={`rounded-3xl border px-6 py-4 ${tone}`}>
            <div className="flex flex-wrap items-center gap-4">
                <p className="text-lg font-medium capitalize">Status: {status}</p>
                {typeof progress === "number" && status !== "completed" && (
                    <div className="flex items-center gap-2 text-sm">
                        <span>Progress</span>
                        <div className="h-1 w-40 rounded-full bg-white/20">
                            <div className="h-1 rounded-full bg-white" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
                        </div>
                        <span>{Math.round(progress)}%</span>
                    </div>
                )}
                {error && <p className="text-sm text-rose-200">{error}</p>}
            </div>
        </div>
    );
}

function IterationCard({ index, iteration }: { index: number; iteration: WorkforceIteration }) {
    const entries = Object.entries(iteration.outputs || {});
    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-5 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                    <p className="text-sm uppercase tracking-wide text-zinc-500">Iteration {index + 1}</p>
                    <h3 className="text-lg font-semibold text-white">Agent outputs</h3>
                </div>
                <span className="text-xs text-zinc-400">{entries.length} agents</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
                {entries.map(([role, output]) => (
                    <div key={role} className="rounded-xl border border-white/5 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-wide text-zinc-400">{role}</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-white">{output || "No output"}</p>
                        <p className="mt-2 text-xs text-zinc-500">{iteration.steps?.[role]?.length || 0} steps</p>
                    </div>
                ))}
            </div>
            <div className="mt-6">
                <p className="text-sm font-semibold text-white">Message bus</p>
                <div className="mt-2 max-h-60 space-y-2 overflow-y-auto rounded-xl border border-white/5 bg-black/40 p-3 text-sm text-white/90">
                    {iteration.busSnapshot?.length ? (
                        iteration.busSnapshot.map((msg, idx) => (
                            <div key={idx} className="rounded-lg border border-white/5 bg-white/5 p-3">
                                <p className="text-xs text-zinc-400">{msg.sender || "unknown"}</p>
                                <p className="mt-1 whitespace-pre-wrap">{msg.content}</p>
                                {msg.timestamp && (
                                    <p className="mt-1 text-xs text-zinc-500">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                    </p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-zinc-500">No bus events captured.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function safeParse(payload: string) {
    try {
        return JSON.parse(payload);
    } catch (error) {
        console.warn("Failed to parse JSON payload", error);
        return null;
    }
}

function extractIterations(result: any): WorkforceIteration[] | undefined {
    if (!result) return undefined;
    const parsed = typeof result === "string" ? safeParse(result) : result;
    return parsed?.iterations;
}

function HighlightCard({ icon, label, value, subtle = false }: { icon: React.ReactNode; label: string; value: string; subtle?: boolean }) {
    return (
        <div className={`rounded-2xl border border-white/10 px-4 py-5 ${subtle ? "bg-white/5" : "bg-gradient-to-br from-white/10 to-transparent"}`}>
            <div className="flex items-center gap-2 text-white/70">
                <div className="rounded-full bg-white/10 p-2 text-white">{icon}</div>
                <span className="text-xs uppercase tracking-[0.3em]">{label}</span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
        </div>
    );
}

function EmptyState({ loading }: { loading: boolean }) {
    return (
        <div className="rounded-2xl border border-dashed border-white/20 p-10 text-center text-white/60">
            <p className="text-sm tracking-widest text-white/40">{loading ? "Linking agents…" : "No iterations yet"}</p>
            <p className="mt-2 text-lg font-medium text-white">Waiting for the workforce to sync.</p>
        </div>
    );
}
