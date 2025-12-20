import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Careers",
    description: "Join the Bothive team and help build the future of the autonomous AI workforce. View our open positions and career opportunities.",
};

export default function CareersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
