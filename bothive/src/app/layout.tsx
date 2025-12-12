import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-context";
import ThemeToggle from "@/components/ThemeToggle";
import { AppSessionProvider } from "@/lib/app-session-context";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Bothive — The Operating System for AI Agents",
  description:
    "Build, deploy, and scale autonomous AI agents. Connect them into workflows that work while you sleep.",
  icons: {
    icon: "/colored-logo (2).png"
  },
  metadataBase: new URL("https://bothive.example"),
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
      <body className={`${inter.className} ${inter.variable} antialiased transition-colors duration-300
        bg-[#fafafa] text-[#0a0a0f]
        dark:bg-[#08080c] dark:text-white
      `}>
        <ThemeProvider>
          <AppSessionProvider>
            {children}
            {/* Floating Theme Toggle */}
            {/* <div className="fixed bottom-6 right-6 z-[100]">
              <ThemeToggle />
            </div> */}
          </AppSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
