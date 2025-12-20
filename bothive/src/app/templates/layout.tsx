import { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Agent Templates",
    description: "Jumpstart your AI orchestration with Bothive's high-performance templates. From customer support swarms to developer tools, start with a solid foundation.",
};

export default function TemplatesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
