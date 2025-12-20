import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Join the Waitlist",
    description: "Secure your spot for Bothive. Be the first to build, deploy, and monetize autonomous AI agents on the most advanced agentic OS.",
};

export default function WaitlistLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
