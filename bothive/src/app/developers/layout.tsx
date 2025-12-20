import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Careers — Join the BotHive Team",
    description: "Build the operating system for the AI era. Explore open roles in engineering, product, and growth at Bothive.",
};

export default function CareersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
