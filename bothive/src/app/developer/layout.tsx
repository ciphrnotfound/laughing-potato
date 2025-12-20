import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Developer Portal — Build on Bothive",
    description: "Create and monetize AI agent integrations. Join our developer ecosystem and build the future of agentic orchestration.",
};

export default function DeveloperLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
