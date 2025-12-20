import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Legal — Privacy & Terms of Service",
    description: "Review Bothive's commitment to data security, privacy policy, and terms of service. Enterprise-grade protection for your AI workforce.",
    robots: {
        index: false,
        follow: true,
    },
};

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
