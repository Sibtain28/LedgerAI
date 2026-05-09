"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { ArrowRight, Terminal } from "lucide-react";
import { SAMPLE_AUDIT_ID } from "@/lib/audit/sample";

export function Hero() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const sequence = [
      800, // 1: Initializing
      600, // 2: Auth
      800, // 3: Ingest OpenAI
      700, // 4: Ingest Anthropic
      1200, // 5: Analyzing
      900, // 6: Warn anomaly 1
      900, // 7: Warn anomaly 2
      1000, // 8: Calc
      400, // 9: Success summary
    ];
    
    let timeoutId: NodeJS.Timeout;
    
    const advanceStep = (currentStep: number) => {
      if (currentStep < sequence.length) {
        timeoutId = setTimeout(() => {
          setStep(currentStep + 1);
          advanceStep(currentStep + 1);
        }, sequence[currentStep]);
      }
    };

    advanceStep(0);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <section className="relative overflow-hidden bg-background pt-32 pb-40 border-b border-border">
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <Container className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-12 items-center">
          <div className="flex flex-col gap-10 max-w-2xl">
            <div className="inline-flex items-center border border-border bg-background px-3 py-1 text-xs font-mono font-medium text-foreground w-fit shadow-sm">
              <span className="flex h-1.5 w-1.5 bg-primary mr-2"></span>
              LedgerAI v1.2 is live
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tighter text-foreground leading-[1.05]">
              Reconcile your API spend.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
              AI consumption scales exponentially. Our audits identify orphaned tokens, duplicate models, and runaway API costs before they impact your runway.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link href="/onboarding">
                <Button size="lg" className="w-full h-14 px-8 text-sm uppercase tracking-widest font-semibold shadow-none">
                  Request an Audit <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/dashboard?id=${SAMPLE_AUDIT_ID}`}>
                <Button size="lg" variant="outline" className="w-full h-14 px-8 text-sm uppercase tracking-widest font-semibold bg-transparent shadow-none border-foreground/20 hover:bg-muted/50">
                  View Sample Report
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-5 mt-10 text-xs text-muted-foreground font-mono uppercase tracking-wider">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 w-10 border-2 border-background bg-muted flex items-center justify-center text-xs text-foreground font-bold shadow-sm">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p>Trusted by CFOs at 50+ growth-stage startups.</p>
            </div>
          </div>
          
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="bg-foreground border border-border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000 text-background flex flex-col h-[400px]">
              <div className="bg-background/10 border-b border-background/20 px-5 py-3 flex items-center gap-3 shrink-0">
                <Terminal className="h-4 w-4 text-muted" />
                <span className="text-xs font-mono text-muted font-medium tracking-widest uppercase">audit_engine.sh</span>
              </div>
              <div className="p-6 font-mono text-[13px] leading-relaxed overflow-y-auto flex-1 custom-scrollbar">
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-start text-muted">
                    <span className="mr-3 text-primary font-bold">{'>'}</span>
                    <span><span className="text-muted-foreground/70">[SYS]</span> Initializing deterministic audit sequence... {step === 0 && <span className="animate-pulse">█</span>}{step > 0 && "OK"}</span>
                  </div>
                  
                  {step >= 1 && (
                    <div className="flex items-start text-muted animate-in fade-in duration-300">
                      <span className="mr-3 text-primary font-bold">{'>'}</span>
                      <span><span className="text-muted-foreground/70">[RECON]</span> Reconciling OpenAI organization tokens... {step === 1 && <span className="animate-pulse">█</span>}{step > 1 && "OK"}</span>
                    </div>
                  )}

                  {step >= 2 && (
                    <div className="flex items-start text-muted animate-in fade-in duration-300">
                      <span className="mr-3 text-primary font-bold">{'>'}</span>
                      <span><span className="text-muted-foreground/70">[RECON]</span> Analyzing Anthropic workspace utilization... {step === 2 && <span className="animate-pulse">█</span>}{step > 2 && "OK"}</span>
                    </div>
                  )}

                  {step >= 3 && (
                    <div className="flex items-start text-muted animate-in fade-in duration-300">
                      <span className="mr-3 text-primary font-bold">{'>'}</span>
                      <span><span className="text-muted-foreground/70">[RECON]</span> Detecting Perplexity subscription overlaps... {step === 3 && <span className="animate-pulse">█</span>}{step > 3 && "OK"}</span>
                    </div>
                  )}

                  {step >= 4 && (
                    <div className="flex items-start text-muted animate-in fade-in duration-300 mt-2">
                      <span className="mr-3 text-primary font-bold">{'>'}</span>
                      <span><span className="text-muted-foreground/70">[ANALYZE]</span> Mapping seat allocation vs active API keys... {step === 4 && <span className="animate-pulse">█</span>}</span>
                    </div>
                  )}

                  {step >= 5 && (
                    <div className="flex items-start text-red-400 animate-in fade-in duration-300">
                      <span className="mr-3 font-bold">{'>'}</span>
                      <span><span className="text-red-400/70">[WARN]</span> Redundancy: Duplicate Cursor/Copilot licenses in 12 seats. {step === 5 && <span className="animate-pulse">█</span>}</span>
                    </div>
                  )}

                  {step >= 6 && (
                    <div className="flex items-start text-red-400 animate-in fade-in duration-300">
                      <span className="mr-3 font-bold">{'>'}</span>
                      <span><span className="text-red-400/70">[WARN]</span> Leakage: Orphaned ChatGPT Team seats detected (8 total). {step === 6 && <span className="animate-pulse">█</span>}</span>
                    </div>
                  )}

                  {step >= 7 && (
                    <div className="flex items-start text-muted animate-in fade-in duration-300 mt-2">
                      <span className="mr-3 text-primary font-bold">{'>'}</span>
                      <span><span className="text-muted-foreground/70">[CALC]</span> Calculating annual optimization score... {step === 7 && <span className="animate-pulse">█</span>}</span>
                    </div>
                  )}

                  {step >= 8 && (
                    <div className="flex items-start text-primary font-semibold tracking-wide animate-in fade-in duration-500 mt-4 border-t border-background/20 pt-4">
                      <span className="mr-3 font-bold">{'>'}</span>
                      <div className="flex flex-col">
                        <span><span className="text-primary/70">[SUCCESS]</span> Audit Complete. Potential savings identified: {step === 8 && <span className="animate-pulse">█</span>}</span>
                        {step >= 9 && (
                          <div className="mt-2 text-background grid grid-cols-[1fr_auto] gap-x-8 gap-y-1 text-sm font-medium">
                            <span className="opacity-80">Redundant licenses:</span>
                            <span className="text-right">$2,140.00/mo</span>
                            <span className="opacity-80">Orphaned seat leakage:</span>
                            <span className="text-right">$3,400.00/mo</span>
                            <span className="border-t border-background/20 pt-1 mt-1 font-bold">Annual potential:</span>
                            <span className="border-t border-background/20 pt-1 mt-1 text-right font-bold">$66,480.00</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
