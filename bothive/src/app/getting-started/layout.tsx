import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Get Started with Bothive",
    description: "A comprehensive guide to building your first AI agent hive. Learn how to connect models, define workflows, and deploy autonomous agents in minutes.",
};

export default function GettingStartedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
