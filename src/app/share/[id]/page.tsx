import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Container } from "@/components/layout/Container";
import { Header } from "@/components/layout/Header";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Audit ${id} Results — LedgerAI`,
    description: `AI infrastructure spend audit results. See the findings from audit ${id}.`,
    openGraph: {
      title: `AI Spend Audit ${id} — LedgerAI`,
      description: "This startup audited their AI tool spend and found potential savings. See the full breakdown.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `AI Spend Audit ${id} — LedgerAI`,
      description: "This startup audited their AI tool spend and found potential savings.",
    },
  };
}

export default async function SharePage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let auditData: any = null;
  let auditResult: any = null;

  try {
    const { data, error } = await supabase
      .from("audits")
      .select("data, result, created_at")
      .eq("id", id)
      .single();

    if (!error && data) {
      auditData = data.data;
      auditResult = data.result;
    }
  } catch (e) {
    console.error("Share page fetch error:", e);
  }

  if (!auditData || !auditResult) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Container>
            <div className="max-w-xl mx-auto text-center space-y-6 py-32">
              <h1 className="text-4xl font-semibold tracking-tighter">Audit not found</h1>
              <p className="text-muted-foreground">This audit report may have expired or been removed.</p>
              <Link href="/onboarding" className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-foreground/90 transition-colors">
                Run Your Own Audit <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Container>
        </main>
      </div>
    );
  }

  const tools = auditResult.toolResults || [];
  const annualSavings = auditResult.annualSavings || 0;
  const monthlySavings = auditResult.monthlySavings || 0;
  const leakagePercent = auditResult.leakagePercent || 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1">
        
        {/* Hero */}
        <section className="bg-foreground text-background py-20 border-b border-border">
          <Container>
            <div className="max-w-4xl">
              <div className="inline-flex items-center border border-background/20 px-3 py-1 text-xs font-mono font-bold uppercase tracking-widest text-background/70 mb-8">
                <span className="flex h-1.5 w-1.5 bg-primary mr-2"></span>
                Shared Audit Report · {id}
              </div>
              <h1 className="text-5xl font-semibold tracking-tighter mb-4">
                {annualSavings.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                <span className="text-2xl font-normal text-background/50 ml-3">potential annual savings</span>
              </h1>
              <p className="text-xl text-background/60 max-w-2xl">
                This AI spend audit identified {leakagePercent}% leakage across {tools.length || auditData.vendors?.length || 0} tools — 
                {monthlySavings.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}/mo recoverable.
              </p>
            </div>
          </Container>
        </section>

        {/* Tool breakdown (sanitized — no email/company) */}
        {tools.length > 0 && (
          <section className="py-16 border-b border-border bg-background">
            <Container>
              <h2 className="text-sm font-mono font-bold tracking-[0.2em] uppercase text-muted-foreground mb-8">
                Tool Breakdown
              </h2>
              <div className="bg-card border border-border shadow-sm overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground bg-muted/30 border-b border-border uppercase tracking-wider">
                    <tr>
                      <th className="px-8 py-5 font-semibold">Tool</th>
                      <th className="px-8 py-5 font-semibold">Plan</th>
                      <th className="px-8 py-5 font-semibold text-right">Gross Spend</th>
                      <th className="px-8 py-5 font-semibold text-right">Savings Found</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono text-sm">
                    {tools.map((t: any, i: number) => (
                      <tr key={i} className="hover:bg-muted/50 transition-colors">
                        <td className="px-8 py-6 font-bold text-foreground font-sans">{t.name}</td>
                        <td className="px-8 py-6 text-muted-foreground">{t.plan}</td>
                        <td className="px-8 py-6 text-right">
                          {t.grossSpend.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-8 py-6 text-right font-bold text-primary">
                          {t.savings > 0
                            ? `${t.savings.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}/mo`
                            : <span className="text-muted-foreground font-normal">Optimal</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Container>
          </section>
        )}

        {/* CTA */}
        <section className="py-24 bg-muted/20">
          <Container>
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <h2 className="text-4xl font-semibold tracking-tighter">
                Run your own free audit.
              </h2>
              <p className="text-xl text-muted-foreground">
                Takes 2 minutes. No signup required to see results.
              </p>
              <Link href="/onboarding" className="inline-flex items-center gap-2 bg-foreground text-background px-10 py-5 font-bold uppercase tracking-widest text-sm hover:bg-foreground/90 transition-colors">
                Start Free Audit <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Container>
        </section>

      </main>
    </div>
  );
}
