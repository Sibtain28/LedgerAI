import { Metadata } from "next";
import { Suspense } from "react";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ id?: string }> }
): Promise<Metadata> {
  const params = await searchParams;
  const id = params?.id || "audit";
  
  return {
    title: `Audit ${id} — LedgerAI`,
    description: "AI spend audit report. See where your team is overspending on AI tools and how much you can save.",
    openGraph: {
      title: `AI Spend Audit ${id} — LedgerAI`,
      description: "See exactly where your team overspends on AI tools. Free audit by LedgerAI.",
      url: `https://${process.env.NEXT_PUBLIC_APP_URL || "ledger-ai-psi.vercel.app"}/dashboard?id=${id}`,
      siteName: "LedgerAI",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `AI Spend Audit ${id} — LedgerAI`,
      description: "See exactly where your team overspends on AI tools. Free audit by LedgerAI.",
    },
  };
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center font-mono text-muted-foreground">
          Loading ledger...
        </div>
      }>
        <DashboardClient />
      </Suspense>
    </div>
  );
}
