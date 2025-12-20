import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Integrations",
    description: "Connect Bothive with your favorite tools and platforms. Seamlessly integrate AI agents into your existing workflows and software stack.",
};

export default function IntegrationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
