import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Hive Store — Professional AI Agents",
    description: "Browse the Bothive Hive Store for pre-built, production-ready AI agents and solution swarms. Accelerate your automation with proven intelligence.",
};

export default function HiveStoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
