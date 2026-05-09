import { Container } from "@/components/layout/Container";
import { ArrowDown } from "lucide-react";

export function SavingsExamples() {
  const examples = [
    {
      vendor: "Anthropic",
      model: "Claude 3.5 Sonnet",
      finding: "Redundant prompt caching",
      before: "$12,400.00",
      after: "$8,200.00",
      saved: "$4,200.00/mo"
    },
    {
      vendor: "OpenAI",
      model: "GPT-4o",
      finding: "Terminated orphaned staging keys",
      before: "$4,100.50",
      after: "$0.00",
      saved: "$4,100.50/mo"
    },
    {
      vendor: "Google Cloud",
      model: "Gemini 1.5 Pro",
      finding: "Downgraded batch processing to Flash",
      before: "$3,800.00",
      after: "$650.00",
      saved: "$3,150.00/mo"
    }
  ];

  return (
    <section className="py-32 bg-muted/30 border-b border-border">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-semibold tracking-tighter text-foreground leading-[1.1]">
              The Ledger in action.
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Actual audit reconciliations from growth-stage startups over the last 30 days.
            </p>
          </div>
        </div>

        <div className="bg-background border border-border shadow-sm">
          <div className="p-5 border-b border-border bg-card">
            <span className="text-xs font-mono font-bold text-foreground tracking-[0.2em] uppercase">
              Recent Reconciliations
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/20 border-b border-border uppercase tracking-wider">
                <tr>
                  <th className="px-8 py-5 font-semibold">Vendor / Model</th>
                  <th className="px-8 py-5 font-semibold hidden md:table-cell">Audit Finding</th>
                  <th className="px-8 py-5 font-semibold text-right">Spend Before</th>
                  <th className="px-8 py-5 font-semibold text-right">Spend After</th>
                  <th className="px-8 py-5 font-semibold text-right">Monthly Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-sm">
                {examples.map((ex, i) => (
                  <tr key={i} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-foreground font-sans text-base">{ex.vendor}</div>
                      <div className="text-muted-foreground mt-1 text-xs tracking-wide">{ex.model}</div>
                    </td>
                    <td className="px-8 py-6 hidden md:table-cell font-sans text-muted-foreground">
                      {ex.finding}
                    </td>
                    <td className="px-8 py-6 text-right text-muted-foreground line-through decoration-destructive/50 opacity-70">
                      {ex.before}
                    </td>
                    <td className="px-8 py-6 text-right font-medium text-foreground">
                      {ex.after}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="inline-flex items-center gap-1.5 text-primary font-bold bg-primary/10 px-3 py-1.5 border border-primary/20 tracking-tight shadow-sm">
                        <ArrowDown className="w-3.5 h-3.5" />
                        {ex.saved}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </section>
  );
}
