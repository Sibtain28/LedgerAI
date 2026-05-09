import { Container } from "@/components/layout/Container";
import { AlertTriangle, TrendingUp } from "lucide-react";

export function ProblemVisualization() {
  return (
    <section className="py-32 bg-card border-b border-border">
      <Container>
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-20">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tighter text-foreground leading-[1.1]">
            Unmonitored API usage destroys margins.
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Engineering teams deploy new models daily. Finance teams see the bill 30 days later. 
            The gap between deployment and reconciliation is where your runway bleeds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Orphaned Tokens",
              value: "$8,400",
              desc: "Average monthly spend on API keys belonging to deprecated staging environments.",
              icon: <AlertTriangle className="h-5 w-5 text-destructive" />
            },
            {
              title: "Prompt Redundancy",
              value: "42%",
              desc: "Of RAG-based applications process the exact same documents repeatedly without caching.",
              icon: <TrendingUp className="h-5 w-5 text-primary" />
            },
            {
              title: "Model Overspecification",
              value: "$14k",
              desc: "Wasted annually by using GPT-4-class models for tasks easily handled by lighter variants.",
              icon: <AlertTriangle className="h-5 w-5 text-destructive" />
            }
          ].map((item, i) => (
            <div key={i} className="bg-background border border-border p-10 flex flex-col justify-between shadow-sm transition-shadow hover:shadow-md">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  {item.icon}
                  <h3 className="font-semibold text-lg text-foreground tracking-tight">{item.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="mt-10 pt-6 border-t border-border/50">
                <span className="text-4xl font-mono tracking-tighter font-bold text-foreground">
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
