import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Swarm Builder — Design Your AI Workforce",
    description: "Use our visual builder to architect autonomous AI agents and complex swarms. No-code interface, powered by HiveLang.",
};

export default function BuilderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
