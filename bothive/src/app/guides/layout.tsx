import { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Agent Guides & Tutorials",
    description: "Learn how to build, orchestrate, and optimize AI agents with Bothive. Step-by-step guides for creating study buddies, dev helpers, and custom integrations.",
};

export default function GuidesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
