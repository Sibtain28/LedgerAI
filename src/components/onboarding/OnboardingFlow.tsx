"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check, Terminal, Cpu, Users, Database } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { evaluateAuditData } from "@/lib/audit/engine";
import { AuditRecord } from "@/lib/audit/types";
import { createClient } from "@/utils/supabase/client";

const VENDORS = [
  { id: "openai", name: "OpenAI API", label: "GPT-4 / O1 Models" },
  { id: "anthropic", name: "Anthropic API", label: "Claude 3 Family" },
  { id: "aws", name: "AWS Bedrock", label: "Nova / Titan" },
  { id: "gcp", name: "Google Cloud", label: "Gemini / Vertex" },
  { id: "cursor", name: "Cursor", label: "AI Code Editor" },
  { id: "github_copilot", name: "GitHub Copilot", label: "IDE Extension" },
  { id: "chatgpt_team", name: "ChatGPT Team", label: "Enterprise Chat" },
  { id: "chatgpt_plus", name: "ChatGPT Plus", label: "Consumer Chat" }
];

const USE_CASES = [
  { id: "rag", name: "Background RAG Pipelines", desc: "Batch processing and document retrieval." },
  { id: "copilot", name: "Internal Copilots", desc: "Employee-facing chat and assistance." },
  { id: "agents", name: "Autonomous Agents", desc: "Multi-step reasoning and tool usage." },
  { id: "customer", name: "Customer-Facing Features", desc: "Direct integration into user workflows." }
];

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  
  // Form State
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [monthlySpend, setMonthlySpend] = useState("");
  const [seats, setSeats] = useState("");
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);

  // Animation State for Step 4
  const [analysisStep, setAnalysisStep] = useState(0);

  const handleNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 5));
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const toggleVendor = (id: string) => {
    setSelectedVendors(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const toggleUseCase = (id: string) => {
    setSelectedUseCases(prev => 
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  // Derived calculations for right pane
  const parsedSpend = parseInt(monthlySpend.replace(/[^0-9]/g, "")) || 0;
  const estimatedLeakage = parsedSpend > 0 ? (parsedSpend * 0.32).toLocaleString("en-US", { style: "currency", currency: "USD" }) : "$0.00";

  const handleFinish = async () => {
    const auditData = {
      vendors: selectedVendors,
      spend: parsedSpend,
      seats: parseInt(seats) || 0,
      useCases: selectedUseCases
    };

    const auditId = `LDG-${Math.floor(1000 + Math.random() * 9000)}`;
    const result = evaluateAuditData(auditData);
    
    const record: AuditRecord = {
      id: auditId,
      timestamp: new Date().toISOString(),
      data: auditData,
      result: result
    };

    // 1. Save to history (localStorage)
    const historyJson = localStorage.getItem("ledger_audit_history");
    const history: AuditRecord[] = historyJson ? JSON.parse(historyJson) : [];
    history.unshift(record); // Add to beginning
    localStorage.setItem("ledger_audit_history", JSON.stringify(history));
    
    // Set current ID for the dashboard
    localStorage.setItem("ledger_current_audit_id", auditId);

    // 2. Persist to Supabase
    try {
      const supabase = createClient();
      const { error: auditError } = await supabase
        .from("audits")
        .insert({
          id: auditId,
          data: auditData,
          result: result
        });

      if (!auditError) {
        await supabase
          .from("leads")
          .insert({
            audit_id: auditId,
            metadata: { source: "onboarding_flow" }
          });
      }
    } catch (e) {
      console.error("Failed to persist to Supabase:", e);
    }
    
    router.push(`/dashboard?id=${auditId}`);
  };

  useEffect(() => {
    if (step === 4) {
      const sequence = [1000, 1000, 1500, 1000, 1000];
      let currentStep = 0;
      
      const runSequence = () => {
        if (currentStep < sequence.length) {
          setTimeout(() => {
            setAnalysisStep(currentStep + 1);
            currentStep++;
            runSequence();
          }, sequence[currentStep]);
        } else {
          setTimeout(() => setStep(5), 1000);
        }
      };
      runSequence();
    }
  }, [step]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-background">
      {/* LEFT PANE - Input Flow */}
      <div className="flex-1 flex flex-col justify-between p-8 lg:p-16 border-r border-border relative overflow-y-auto">
        <div className="max-w-xl mx-auto w-full pt-10 pb-24">
          
          <div className="mb-16">
            <Link href="/" className="inline-flex items-center space-x-3 mb-16">
              <div className="size-6 bg-foreground flex items-center justify-center">
                <span className="text-background font-mono font-bold text-xs leading-none">L</span>
              </div>
              <span className="inline-block font-semibold tracking-tight text-lg text-foreground">LedgerAI</span>
            </Link>

            {/* Progress indicators */}
            <div className="flex items-center gap-2 mb-12">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 flex-1 transition-colors duration-500 ${step >= i ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both" key={step}>
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-foreground">Core Infrastructure</h1>
                  <p className="mt-4 text-muted-foreground">Select the intelligence providers currently in your stack. We'll cross-reference these against your billing APIs.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {VENDORS.map(v => {
                    const isSelected = selectedVendors.includes(v.id);
                    return (
                      <button
                        key={v.id}
                        onClick={() => toggleVendor(v.id)}
                        aria-pressed={isSelected}
                        aria-label={`Toggle ${v.name}`}
                        className={`flex flex-col text-left p-5 border transition-all duration-200 shadow-sm ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-foreground/30'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-foreground tracking-tight">{v.name}</span>
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{v.label}</span>
                      </button>
                    )
                  })}
                </div>
                <Button 
                  size="lg" 
                  onClick={handleNext} 
                  disabled={selectedVendors.length === 0}
                  className="w-full h-14 uppercase tracking-widest font-semibold mt-8 shadow-none"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tighter text-foreground">Scale & Spend</h1>
                  <p className="mt-4 text-muted-foreground">Quantify your current consumption to calibrate the anomaly detection baseline.</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold tracking-tight text-foreground uppercase">Estimated Monthly Spend (USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-muted-foreground">$</span>
                      <Input 
                        type="text" 
                        placeholder="15,000" 
                        className="pl-8 h-14 text-lg font-mono placeholder:text-muted-foreground/50 border-border"
                        value={monthlySpend}
                        onChange={(e) => setMonthlySpend(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold tracking-tight text-foreground uppercase">Active Engineering Seats</label>
                    <Input 
                      type="number" 
                      placeholder="45" 
                      className="h-14 text-lg font-mono placeholder:text-muted-foreground/50 border-border"
                      value={seats}
                      onChange={(e) => setSeats(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <Button variant="outline" size="lg" onClick={handleBack} className="h-14 px-8 uppercase tracking-widest font-semibold border-border shadow-none">Back</Button>
                  <Button 
                    size="lg" 
                    onClick={handleNext} 
                    disabled={!monthlySpend || !seats}
                    className="flex-1 h-14 uppercase tracking-widest font-semibold shadow-none"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-foreground font-sans">Primary Use Cases</h1>
                  <p className="mt-4 text-muted-foreground font-sans">How is your compute primarily distributed? This helps us identify caching optimization opportunities.</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {USE_CASES.map(u => {
                    const isSelected = selectedUseCases.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        onClick={() => toggleUseCase(u.id)}
                        aria-pressed={isSelected}
                        aria-label={`Toggle use case: ${u.name}`}
                        className={`flex flex-col text-left p-5 border transition-all duration-200 shadow-sm ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-foreground/30'}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-foreground tracking-tight font-sans">{u.name}</span>
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        <span className="text-sm text-muted-foreground leading-relaxed font-sans">{u.desc}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handleBack} 
                    aria-label="Go back to previous step"
                    className="h-14 px-8 uppercase tracking-widest font-semibold border-border shadow-none"
                  >
                    Back
                  </Button>
                  <Button 
                    size="lg" 
                    onClick={handleNext} 
                    disabled={selectedUseCases.length === 0}
                    aria-label="Initialize environment"
                    className="flex-1 h-14 uppercase tracking-widest font-semibold shadow-none"
                  >
                    Initialize Environment
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 flex flex-col items-center justify-center py-20 text-center">
                <div className="relative size-24 border border-border bg-card flex items-center justify-center shadow-sm mb-6">
                  <Terminal className="h-8 w-8 text-foreground animate-pulse" />
                  <div className="absolute inset-0 border-2 border-primary animate-ping opacity-20"></div>
                </div>
                <h1 className="text-3xl font-semibold tracking-tighter text-foreground">Initializing Audit Engine</h1>
                <p className="text-muted-foreground font-mono text-sm max-w-sm">
                  Establishing secure linkages to selected infrastructure providers. Do not close this window.
                </p>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-8 py-10">
                <div>
                  <div className="inline-flex items-center border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary mb-6 uppercase tracking-widest">
                    <span className="flex h-1.5 w-1.5 bg-primary mr-2"></span>
                    Audit Ready
                  </div>
                  <h1 className="text-4xl font-semibold tracking-tighter text-foreground leading-[1.1]">
                    Environment configured.
                  </h1>
                  <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                    We've established the baseline parameters for your organization. You can now access the Ledger dashboard to execute your first complete audit.
                  </p>
                </div>
                
                <Button 
                  size="lg" 
                  onClick={handleFinish}
                  className="w-full h-14 uppercase tracking-widest font-bold mt-4 shadow-none bg-foreground text-background hover:bg-foreground/90"
                >
                  Access Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANE - Dynamic Ledger Visualization */}
      <div className="hidden lg:flex flex-1 bg-muted/20 relative p-16 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        
        {step < 4 ? (
          <div className="relative w-full max-w-md bg-background border border-border shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-border bg-card flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-foreground tracking-[0.2em] uppercase">Audit Scope Profile</span>
              <span className="text-xs font-mono text-muted-foreground">ID: LDG-{Math.floor(Math.random() * 10000)}</span>
            </div>
            
            <div className="p-8 space-y-8 font-mono text-sm">
              <div className="space-y-2">
                <div className="text-muted-foreground uppercase tracking-wider text-xs">Monitored Vendors</div>
                {selectedVendors.length === 0 ? (
                  <div className="text-muted opacity-50 italic">Awaiting selection...</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedVendors.map(v => (
                      <span key={v} className="bg-muted px-2 py-1 border border-border text-foreground">{VENDORS.find(x => x.id === v)?.name}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border/50">
                <div className="space-y-1">
                  <div className="text-muted-foreground uppercase tracking-wider text-xs mb-2">Mo. Spend</div>
                  <div className="text-xl font-bold tracking-tight text-foreground">
                    {parsedSpend > 0 ? `$${parsedSpend.toLocaleString()}` : "---"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground uppercase tracking-wider text-xs mb-2">Active Seats</div>
                  <div className="text-xl font-bold tracking-tight text-foreground">
                    {seats || "---"}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-6 border-t border-border/50">
                <div className="text-muted-foreground uppercase tracking-wider text-xs mb-2">Topology Highlights</div>
                {selectedUseCases.length === 0 ? (
                  <div className="text-muted opacity-50 italic">Awaiting selection...</div>
                ) : (
                  <ul className="space-y-2">
                    {selectedUseCases.map(u => (
                      <li key={u} className="flex items-center gap-3 text-foreground">
                        <span className="h-1 w-1 bg-primary rounded-full"></span>
                        {USE_CASES.find(x => x.id === u)?.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="pt-8 mt-8 border-t border-border bg-primary/5 -mx-8 px-8 pb-8 -mb-8 flex flex-col justify-between h-32">
                <div className="text-muted-foreground uppercase tracking-wider text-xs">Est. Monthly Leakage (32% avg)</div>
                <div className={`text-3xl font-bold tracking-tight ${parsedSpend > 0 ? 'text-primary' : 'text-muted opacity-30'}`}>
                  {estimatedLeakage}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-lg bg-foreground border border-border shadow-2xl overflow-hidden text-background animate-in fade-in zoom-in-95 duration-700">
            <div className="p-4 border-b border-background/20 bg-background/10 flex items-center gap-3">
              <Terminal className="h-4 w-4 text-muted" />
              <span className="text-xs font-mono text-muted font-bold tracking-[0.2em] uppercase">system_boot.sh</span>
            </div>
            <div className="p-8 font-mono text-[13px] leading-relaxed h-[400px]">
              <div className="flex flex-col gap-3">
                <div className="flex items-start text-muted">
                  <span className="mr-3 text-primary font-bold">{'>'}</span>
                  <span>Mounting audit container configuration...</span>
                </div>
                {analysisStep > 0 && (
                  <div className="flex items-start text-muted">
                    <span className="mr-3 text-primary font-bold">{'>'}</span>
                    <span>Compiling vendor linkage keys [{selectedVendors.join(", ")}]... OK</span>
                  </div>
                )}
                {analysisStep > 1 && (
                  <div className="flex items-start text-muted">
                    <span className="mr-3 text-primary font-bold">{'>'}</span>
                    <span>Allocating historical analysis bounds (${parsedSpend.toLocaleString()}/mo baseline)... OK</span>
                  </div>
                )}
                {analysisStep > 2 && (
                  <div className="flex items-start text-muted">
                    <span className="mr-3 text-primary font-bold">{'>'}</span>
                    <span>Configuring topology heuristics for {selectedUseCases.length} use cases... OK</span>
                  </div>
                )}
                {analysisStep > 3 && (
                  <div className="flex items-start text-muted">
                    <span className="mr-3 text-primary font-bold">{'>'}</span>
                    <span>Validating engine integrity... {step === 4 && <span className="animate-pulse">█</span>}</span>
                  </div>
                )}
                {analysisStep > 4 && (
                  <div className="flex items-start text-primary font-semibold mt-4 pt-4 border-t border-background/20">
                    <span className="mr-3 font-bold">{'>'}</span>
                    <span>[SYS_READY] Ledger node successfully provisioned.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
