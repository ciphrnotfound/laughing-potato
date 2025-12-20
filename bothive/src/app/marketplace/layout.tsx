import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Marketplace — Discover & Deploy Premium Agents",
    description: "Browse the Bothive Marketplace for specialized AI agents. Deploy pre-built intelligence for research, coding, marketing, and beyond.",
    openGraph: {
        title: "Bothive Marketplace — The App Store for AI Agents",
        description: "Find and monetize the best autonomous agents on the web.",
        url: "https://bothive.cloud/marketplace",
    },
};

export default function MarketplaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
