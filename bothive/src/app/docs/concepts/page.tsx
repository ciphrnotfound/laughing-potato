import Link from "next/link";
import { Boxes, Database, Cpu } from "lucide-react";

export default function ConceptsPage() {
    return (
        <div className="space-y-12 py-8 max-w-4xl">
            <div>
                <h1 className="text-4xl font-bold mb-4">Core Concepts</h1>
                <p className="text-lg text-white/60">
                    Understand the fundamental building blocks of the Bothive runtime.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Link href="/docs/concepts/agents" className="group p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                        <Boxes className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Agents & Bots</h3>
                    <p className="text-sm text-white/50">The difference between a stateless Agent and a stateful Bot definition.</p>
                </Link>
                <Link href="/docs/concepts/memory" className="group p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                        <Database className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Memory & State</h3>
                    <p className="text-sm text-white/50">Short-term context, KV stores, and Vector memory explained.</p>
                </Link>
                <Link href="/docs/concepts/tools" className="group p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                        <Cpu className="w-5 h-5 text-orange-400" />
                    </div>
                    <h3 className="font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">Tool Execution</h3>
                    <p className="text-sm text-white/50">How the runtime handles sandboxing and authorization.</p>
                </Link>
            </div>
        </div>
    );
}
