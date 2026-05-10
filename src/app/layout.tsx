import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const interSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LedgerAI | AI Spend Auditor",
  description: "Free AI spend audit for startups. Find out where you're overspending on Cursor, ChatGPT, Claude, Copilot and more.",
  metadataBase: new URL(`https://${process.env.NEXT_PUBLIC_APP_URL || "ledger-ai-psi.vercel.app"}`),
  openGraph: {
    title: "LedgerAI — Free AI Spend Audit",
    description: "Find out where your team overspends on AI tools. Takes 2 minutes. Free.",
    siteName: "LedgerAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LedgerAI — Free AI Spend Audit",
    description: "Find out where your team overspends on AI tools. Takes 2 minutes. Free.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${interSans.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary-foreground">{children}</body>
    </html>
  );
}
