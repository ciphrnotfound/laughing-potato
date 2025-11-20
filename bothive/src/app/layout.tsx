import type { Metadata } from "next";
import { DM_Sans, Harmattan } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-context";
import ThemeToggle from "@/components/ThemeToggle";
import { AppSessionProvider } from "@/lib/app-session-context";

import "./globals.css";
import {devToolsConfigMiddleware} from "next/dist/next-devtools/server/devtools-config-middleware";

const dmSans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
  display: "swap",
});


export const metadata: Metadata = {
  title: "Bothive — The Digital Hive Where AI Agents Collaborate",
  description:
    "Build a collaborative ecosystem of AI bots that communicate, think, and evolve together. Create, connect, and monetize intelligent agents that solve problems as a unified swarm.",
    icons:{
      icon:"/colored-logo (2).png"
    },
  metadataBase: new URL("https://bothive.example"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${dmSans.className} antialiased bg-white dark:bg-gradient-to-br dark:from-black dark:to-violet-950 text-black dark:text-white transition-colors duration-300`}>
        <ThemeProvider>
          <AppSessionProvider>
            {/*<NavBar />*/}
            {children}
            <div className="fixed bottom-4 right-4 z-50">
              <ThemeToggle />
            </div>
          </AppSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
