import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-40 bg-foreground text-background border-b border-border">
      <Container>
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <h2 className="text-5xl sm:text-6xl font-semibold tracking-tighter mb-8 text-background leading-[1.05]">
            Stop guessing. Start auditing.
          </h2>
          <p className="text-xl sm:text-2xl text-muted/80 mb-14 max-w-2xl leading-relaxed">
            Connect your API accounts securely. Get a precise ledger of your AI compute consumption in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-5">
            <Button size="lg" variant="secondary" className="h-14 px-10 text-sm uppercase tracking-widest font-bold bg-background text-foreground hover:bg-background/90 shadow-none">
              Initialize Audit
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-sm uppercase tracking-widest font-bold bg-transparent border-background/20 text-background hover:bg-background/10 hover:text-background shadow-none">
              Read the Docs
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
