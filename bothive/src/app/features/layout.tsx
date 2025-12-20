import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Features — Neural Orchestration & HiveLang",
    description: "Explore the most advanced AI agent features. Neural orchestration, HiveLang v1.0, semantic graph memory, and enterprise-grade security for your autonomous workforce.",
    openGraph: {
        title: "Bothive Features — Beyond Chatbots. True Agentic Intelligence.",
        description: "Traditional bots are isolated. Bothive creates a connected neural network of specialized agents.",
        url: "https://bothive.cloud/features",
    },
};

export default function FeaturesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
