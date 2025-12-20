import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Bothive — The Vision for Autonomous Teams",
    description: "Learn how Bothive is redefining the workforce with autonomous agents. Our philosophy, our technology, and why we build for the AI era.",
    openGraph: {
        title: "About Bothive — Redefining Work",
        description: "The platform where AI minds collaborate.",
        url: "https://bothive.cloud/about",
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
