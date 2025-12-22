import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-context";
import { AppSessionProvider } from "@/lib/app-session-context";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

import "./globals.css";

const bricolage = Bricolage_Grotesque({
    subsets: ["latin"],
    display: "swap",
    weight: ["200", "300", "400", "500", "600", "700", "800"],
    variable: "--font-bricolage",
    fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
    title: {
        default: "Bothive — The Operating System for AI Agents",
        template: "%s | Bothive",
    },
    description:
        "Build, deploy, and scale autonomous AI agents. Connect them into workflows that work while you sleep. The most advanced AI workforce platform.",
    keywords: ["AI Agents", "Autonomous Agents", "AI Workflows", "Bothive", "AI Workforce", "Agentic AI", "Hivelang"],
    authors: [{ name: "Bothive Team" }],
    creator: "Bothive",
    publisher: "Bothive",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL("https://bothive.cloud"),
    openGraph: {
        title: "Bothive — The Operating System for AI Agents",
        description: "Build, deploy, and scale autonomous AI agents. Connect them into workflows that work while you sleep.",
        url: "https://bothive.cloud",
        siteName: "Bothive",
        locale: "en_US",
        type: "website",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Bothive - AI Agent Platform",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Bothive — The Operating System for AI Agents",
        description: "Build, deploy, and scale autonomous AI agents.",
        creator: "@bothive",
        images: ["/og-image.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "/bothive-ai-logo.svg",
        apple: "/bothive-ai-logo.svg",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className="dark">
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
                    }}
                />
            </head>
            <body className={`${bricolage.className} ${bricolage.variable} antialiased transition-colors duration-300
        bg-[#fafafa] text-[#0a0a0f]
        dark:bg-[#08080c] dark:text-white
      `}>
                <ThemeProvider>
                    <AppSessionProvider>
                        <ClientLayoutWrapper>
                            {children}
                        </ClientLayoutWrapper>
                    </AppSessionProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
