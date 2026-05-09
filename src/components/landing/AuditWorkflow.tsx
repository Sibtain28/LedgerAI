import { Container } from "@/components/layout/Container";

export function AuditWorkflow() {
  const steps = [
    {
      id: "01",
      label: "[CONNECT]",
      title: "Ingest billing and API logs.",
      desc: "Connect AWS, GCP, OpenAI, Anthropic, and other major AI vendors. We securely read billing histories and API request logs without proxying your traffic."
    },
    {
      id: "02",
      label: "[ANALYZE]",
      title: "Reconcile token usage.",
      desc: "Our engine maps token consumption against active application states. We identify environments that have been spun down but are still generating automated background requests."
    },
    {
      id: "03",
      label: "[EXECUTE]",
      title: "Terminate and renegotiate.",
      desc: "Automatically terminate orphaned API keys and restructure your prompt caching. Generate audit reports ready for your finance team to renegotiate enterprise tier pricing."
    }
  ];

  return (
    <section className="py-40 bg-background border-b border-border">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h2 className="text-5xl font-semibold tracking-tighter text-foreground leading-[1.05]">
              The Ledger Protocol.
            </h2>
            <p className="mt-8 text-xl text-muted-foreground leading-relaxed">
              We approach API spend like forensic accountants. A zero-trust model for your API consumption, ensuring you only pay for compute that directly serves your users.
            </p>
          </div>
          
          <div className="lg:col-span-6 lg:col-start-7 flex flex-col gap-16">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-8 relative group">
                {/* Connecting Line */}
                {i !== steps.length - 1 && (
                  <div className="absolute left-[19px] top-[48px] bottom-[-48px] w-px bg-border group-hover:bg-primary transition-colors duration-500 hidden sm:block"></div>
                )}
                
                <div className="flex flex-col items-center gap-4">
                  <div className="h-10 w-10 border border-border bg-card flex items-center justify-center text-xs font-mono font-bold shrink-0 z-10 group-hover:border-primary group-hover:text-primary transition-colors shadow-sm">
                    {step.id}
                  </div>
                </div>
                
                <div className="flex flex-col pb-4">
                  <span className="text-xs font-mono text-primary font-bold mb-3 tracking-[0.2em]">{step.label}</span>
                  <h3 className="text-2xl font-semibold text-foreground mb-4 tracking-tight">{step.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
