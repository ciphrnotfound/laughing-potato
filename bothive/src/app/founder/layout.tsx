import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Meet the Founder — Shay's Vision for Bothive",
    description: "Learn about the mission behind Bothive. Shay's story on building the operating system for the AI era and democratizing autonomous agents.",
    openGraph: {
        title: "Bothive Story — Shay's Vision for the AI Era",
        description: "Building the infrastructure that powers AI agents for everyone.",
        url: "https://bothive.cloud/founder",
    },
};

export default function FounderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
