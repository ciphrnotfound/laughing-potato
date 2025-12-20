import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Changelog",
    description: "Stay updated with the latest features, improvements, and fixes to the Bothive platform. See how we're evolving the AI agent ecosystem.",
};

export default function ChangelogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
