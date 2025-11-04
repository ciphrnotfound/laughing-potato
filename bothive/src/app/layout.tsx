import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import NavBar from "@/components/NavBar";
import {BackgroundRippleEffectDemo} from "../components/BackgroundRippleEffectDemo";
import "./globals.css"
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
    <html lang="en">
      <body className={`${dmSans.className} antialiased bg-gradient-to-br from-black to-purple-800 text-white`}>
        {/*<NavBar />*/}
        
        {children}
      </body>
    </html>
  );
}
