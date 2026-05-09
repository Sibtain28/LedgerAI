import { Container } from "@/components/layout/Container";

export function QuoteSection() {
  return (
    <section className="py-40 bg-background border-b border-border">
      <Container>
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <svg className="h-10 w-10 text-primary mb-12" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
          </svg>
          <blockquote className="text-3xl sm:text-5xl font-semibold tracking-tighter text-foreground leading-[1.1]">
            "LedgerAI found $12,000 in unused OpenAI environments from a pivoted product line. We thought we were tracking everything."
          </blockquote>
          <div className="mt-16 flex items-center justify-center gap-5">
            <div className="h-14 w-14 border border-border bg-card flex items-center justify-center font-mono text-sm font-bold text-foreground shadow-sm">
              SJ
            </div>
            <div className="text-left flex flex-col justify-center">
              <div className="font-semibold text-foreground text-lg tracking-tight">Sarah Jenkins</div>
              <div className="text-sm text-muted-foreground font-mono mt-0.5 tracking-wide">CEO, Fintech Series B</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
