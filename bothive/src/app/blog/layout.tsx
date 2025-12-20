import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog — Insights into the AI Agent Revolution",
    description: "Deep dives into autonomous agent architectures, HiveLang updates, and the future of the AI workforce. Stay ahead with Bothive.",
    openGraph: {
        title: "Bothive Blog — The Future of AI Agents",
        description: "Expert insights on building and scaling autonomous AI workforces.",
        url: "https://bothive.cloud/blog",
    },
};

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
