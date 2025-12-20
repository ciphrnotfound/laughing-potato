import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing — Build Your AI Workforce",
    description: "Flexible plans for teams of all sizes. Free to start, scale as you grow. Earn recurring revenue by publishing your agents to the Bothive Marketplace.",
    openGraph: {
        title: "Bothive Pricing — Invest in Your Autonomous Workforce",
        description: "Transparent pricing for teams. Lucrative economics for creators.",
        url: "https://bothive.cloud/pricing",
    },
};

export default function PricingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
