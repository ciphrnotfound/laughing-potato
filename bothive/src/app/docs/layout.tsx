import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Documentation — Mastering Bothive & HiveLang",
    description: "Comprehensive guides, API references, and conceptual deep-dives for building autonomous AI agents on the Bothive platform.",
    openGraph: {
        title: "Bothive Docs — Build Your AI Workforce",
        description: "Everything you need to know about setting up, scaling, and managing AI agents.",
        url: "https://bothive.cloud/docs",
    },
};

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
