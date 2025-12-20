import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us — Get in Touch with the Hive",
    description: "Have questions about Bothive? Need a custom AI solution? Reach out to our team for support, partnerships, or enterprise inquiries.",
    openGraph: {
        title: "Contact Bothive — We're Here to Help",
        description: "Connect with the team behind the operating system for AI agents.",
        url: "https://bothive.cloud/contact",
    },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
