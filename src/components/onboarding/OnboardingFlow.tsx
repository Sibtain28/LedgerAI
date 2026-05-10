"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check, Terminal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { evaluateAuditData } from "@/lib/audit/engine";
import { AuditRecord, ToolEntry } from "@/lib/audit/types";
import { createClient } from "@/utils/supabase/client";

const TOOLS_OPTIONS = [
  { id: "cursor", name: "Cursor", plans: ["Hobby", "Pro", "Business", "Enterprise"] },
  { id: "github_copilot", name: "GitHub Copilot", plans: ["Individual", "Business", "Enterprise"] },
  { id: "claude", name: "Claude (Anthropic)", plans: ["Free", "Pro", "Max", "Team", "Enterprise"] },
  { id: "chatgpt", name: "ChatGPT (OpenAI)", plans: ["Plus", "Team", "Enterprise"] },
  { id: "anthropic", name: "Anthropic API Direct", plans: ["API Direct"] },
  { id: "openai", name: "OpenAI API Direct", plans: ["API Direct"] },
  { id: "gemini", name: "Gemini", plans: ["Pro", "Ultra", "API"] },
  { id: "windsurf", name: "Windsurf", plans: ["Free", "Pro", "Teams"] }
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
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Form State
  const [teamSize, setTeamSize] = useState("");
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState("");
  
  const [tools, setTools] = useState<ToolEntry[]>([
    { toolId: "", plan: "", seats: 1, monthlySpend: 0 }
  ]);
  
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  // Animation State for Step 4
  const [analysisStep, setAnalysisStep] = useState(0);

  // Load draft from local storage
  useEffect(() => {
    const draft = localStorage.getItem("ledger_onboarding_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.step) setStep(parsed.step);
        if (parsed.teamSize) setTeamSize(parsed.teamSize);
        if (parsed.selectedUseCases) setSelectedUseCases(parsed.selectedUseCases);
        if (parsed.companyName) setCompanyName(parsed.companyName);
        if (parsed.tools) setTools(parsed.tools);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.role) setRole(parsed.role);
      } catch(e) {}
    }
    setIsLoaded(true);
  }, []);

  // Save draft whenever state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ledger_onboarding_draft", JSON.stringify({
        step, teamSize, selectedUseCases, companyName, tools, email, role
      }));
    }
  }, [step, teamSize, selectedUseCases, companyName, tools, email, role, isLoaded]);

  const handleNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 6));
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const toggleUseCase = (id: string) => {
    setSelectedUseCases(prev => 
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const addTool = () => {
    setTools(prev => [...prev, { toolId: "", plan: "", seats: 1, monthlySpend: 0 }]);
  };

  const removeTool = (index: number) => {
    setTools(prev => prev.filter((_, i) => i !== index));
  };

  const updateTool = (index: number, field: keyof ToolEntry, value: any) => {
    setTools(prev => {
      const newTools = [...prev];
      newTools[index] = { ...newTools[index], [field]: value };
      
      // Auto-reset plan if toolId changes
      if (field === "toolId") {
        newTools[index].plan = "";
      }
      return newTools;
    });
  };

  // Derived calculations
  const vendors = Array.from(new Set(tools.map(t => t.toolId).filter(Boolean)));
  const totalSpend = tools.reduce((sum, t) => sum + (Number(t.monthlySpend) || 0), 0);
  const maxSeats = tools.reduce((max, t) => Math.max(max, Number(t.seats) || 0), 0);
  const estimatedLeakage = totalSpend > 0 ? (totalSpend * 0.32).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : "$0";

  const handleFinish = async () => {
    const auditData = {
      vendors,
      spend: totalSpend,
      seats: maxSeats,
      useCases: selectedUseCases,
      tools,
      totalSpend,
      teamSize,
      companyName,
      email,
      role
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
            metadata: { 
              source: "onboarding_flow",
              email,
              role,
              companyName
            }
          });
      }
    } catch (e) {
      console.error("Failed to persist to Supabase:", e);
    }
    
    // Clear draft and proceed
    localStorage.removeItem("ledger_onboarding_draft");
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

  // Make sure hydration matches client
  if (!isLoaded) return null;

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
                <div key={i} className={`h-1.5 flex-1 transition-colors duration-500 ${step >= i || (step > 3 && i === 3) ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both" key={step}>
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-foreground">Team Profile</h1>
                  <p className="mt-4 text-muted-foreground">Help us calibrate our baseline to your organization.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold tracking-tight text-foreground uppercase">Team Size</label>
                    <select
                      className="flex h-14 w-full border border-border bg-background px-3 py-2 text-lg font-sans placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={teamSize}
                      onChange={e => setTeamSize(e.target.value)}
                    >
                      <option value="" disabled>Select team size...</option>
                      <option value="1-5">1-5</option>
                      <option value="6-15">6-15</option>
                      <option value="16-50">16-50</option>
                      <option value="51-200">51-200</option>
                      <option value="200+">200+</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold tracking-tight text-foreground uppercase">Primary Use Cases</label>
                    <div className="grid grid-cols-1 gap-4">
                      {USE_CASES.map(u => {
                        const isSelected = selectedUseCases.includes(u.id);
                        return (
                          <button
                            key={u.id}
                            onClick={() => toggleUseCase(u.id)}
                            className={`flex flex-col text-left p-4 border transition-all duration-200 shadow-sm ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-foreground/30'}`}
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
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold tracking-tight text-foreground uppercase">Company (optional)</label>
                    <Input 
                      placeholder="Acme Corp" 
                      className="h-14 text-lg font-mono placeholder:text-muted-foreground/50 border-border"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  size="lg" 
                  onClick={handleNext} 
                  disabled={!teamSize || selectedUseCases.length === 0}
                  className="w-full h-14 uppercase tracking-widest font-semibold mt-8 shadow-none"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tighter text-foreground">AI Tools Inventory</h1>
                  <p className="mt-4 text-muted-foreground">List the AI tools your team uses. We'll cross-reference these to identify overlaps.</p>
                </div>

                <div className="space-y-4">
                  {tools.map((tool, index) => (
                    <div key={index} className="flex flex-col gap-3 p-4 border border-border bg-card shadow-sm relative">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold uppercase text-muted-foreground">Tool {index + 1}</span>
                        {tools.length > 1 && (
                          <button onClick={() => removeTool(index)} className="text-muted-foreground hover:text-destructive p-1" title="Remove tool">
                            ×
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold tracking-tight uppercase">Tool</label>
                          <select
                            className="flex h-10 w-full border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground/50"
                            value={tool.toolId}
                            onChange={(e) => updateTool(index, "toolId", e.target.value)}
                          >
                            <option value="" disabled>Select tool...</option>
                            {TOOLS_OPTIONS.map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-xs font-semibold tracking-tight uppercase">Plan</label>
                          <select
                            className="flex h-10 w-full border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground/50 disabled:opacity-50"
                            value={tool.plan}
                            onChange={(e) => updateTool(index, "plan", e.target.value)}
                            disabled={!tool.toolId}
                          >
                            <option value="" disabled>Select plan...</option>
                            {tool.toolId && TOOLS_OPTIONS.find(t => t.id === tool.toolId)?.plans.map(plan => (
                              <option key={plan} value={plan}>{plan}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold tracking-tight uppercase">Seats</label>
                          <Input 
                            type="number" 
                            min="1"
                            placeholder="1" 
                            className="h-10 text-sm font-mono border-border"
                            value={tool.seats || ""}
                            onChange={(e) => updateTool(index, "seats", parseInt(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-xs font-semibold tracking-tight uppercase">$/mo</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-muted-foreground text-sm">$</span>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              className="pl-7 h-10 text-sm font-mono border-border"
                              value={tool.monthlySpend || ""}
                              onChange={(e) => updateTool(index, "monthlySpend", parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" onClick={addTool} className="w-full border-dashed border-2 border-border shadow-none py-6 text-muted-foreground hover:text-foreground">
                    + Add Tool
                  </Button>

                  <div className="pt-4 flex justify-between items-center border-t border-border mt-4">
                    <span className="font-semibold uppercase tracking-tight">Total Monthly Spend</span>
                    <span className="text-xl font-bold font-mono text-primary">${totalSpend.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button variant="outline" size="lg" onClick={handleBack} className="h-14 px-8 uppercase tracking-widest font-semibold border-border shadow-none">Back</Button>
                  <Button 
                    size="lg" 
                    onClick={handleNext} 
                    disabled={!tools.every(t => t.toolId && t.plan && t.seats > 0 && t.monthlySpend > 0)}
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
                  <h1 className="text-3xl font-semibold tracking-tighter text-foreground">Review Scope</h1>
                  <p className="mt-4 text-muted-foreground">Verify your entered tooling stack before initializing the engine.</p>
                </div>

                <div className="border border-border bg-card shadow-sm overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 p-3 border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <div className="col-span-5">Tool</div>
                    <div className="col-span-3">Plan</div>
                    <div className="col-span-2 text-right">Seats</div>
                    <div className="col-span-2 text-right">$/mo</div>
                  </div>
                  
                  <div className="divide-y divide-border">
                    {tools.map((t, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 p-3 text-sm font-mono items-center">
                        <div className="col-span-5 truncate">{TOOLS_OPTIONS.find(opt => opt.id === t.toolId)?.name || t.toolId}</div>
                        <div className="col-span-3 truncate text-muted-foreground">{t.plan}</div>
                        <div className="col-span-2 text-right">{t.seats}</div>
                        <div className="col-span-2 text-right">${t.monthlySpend.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-12 gap-2 p-4 bg-muted/10 font-bold border-t border-border border-double border-t-4">
                    <div className="col-span-8 text-right uppercase tracking-wider text-sm">Total</div>
                    <div className="col-span-2 text-right font-mono">{maxSeats}</div>
                    <div className="col-span-2 text-right font-mono text-primary">${totalSpend.toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button variant="outline" size="lg" onClick={handleBack} className="h-14 px-8 uppercase tracking-widest font-semibold border-border shadow-none">Back</Button>
                  <Button 
                    size="lg" 
                    onClick={handleNext} 
                    className="flex-1 h-14 uppercase tracking-widest font-semibold shadow-none"
                  >
                    Run Audit <ArrowRight className="ml-2 h-4 w-4" />
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
              <div className="space-y-8 py-10 animate-in fade-in zoom-in duration-500">
                <div>
                  <h1 className="text-4xl font-semibold tracking-tighter text-foreground leading-[1.1]">
                    Your audit is ready.
                  </h1>
                  <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                    Enter your email to view results and receive your report.
                  </p>
                </div>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-tight uppercase">Email</label>
                    <Input 
                      type="email" 
                      placeholder="you@company.com" 
                      className="h-12 border-border font-mono"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-tight uppercase">Company (optional)</label>
                    <Input 
                      placeholder="Acme Corp" 
                      className="h-12 border-border font-mono"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-tight uppercase">Role</label>
                    <select
                      className="flex h-12 w-full border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 font-mono"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="" disabled>Select role...</option>
                      <option value="Founder/CEO">Founder/CEO</option>
                      <option value="CTO/Engineering Lead">CTO/Engineering Lead</option>
                      <option value="CFO/Finance">CFO/Finance</option>
                      <option value="Engineering Manager">Engineering Manager</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    size="lg" 
                    onClick={handleNext}
                    disabled={!email || !role}
                    className="w-full h-14 uppercase tracking-widest font-bold shadow-none bg-foreground text-background hover:bg-foreground/90"
                  >
                    View My Audit <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    No spam. High-savings audits may receive a note from Credex.
                  </p>
                </div>
              </div>
            )}

            {step === 6 && (
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
              <span className="text-xs font-mono text-muted-foreground">ID: LDG-PENDING</span>
            </div>
            
            <div className="p-8 space-y-8 font-mono text-sm">
              <div className="space-y-2">
                <div className="text-muted-foreground uppercase tracking-wider text-xs">Monitored Vendors</div>
                {vendors.length === 0 ? (
                  <div className="text-muted opacity-50 italic">Awaiting selection...</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {vendors.map(v => (
                      <span key={v} className="bg-muted px-2 py-1 border border-border text-foreground">{TOOLS_OPTIONS.find(x => x.id === v)?.name || v}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border/50">
                <div className="space-y-1">
                  <div className="text-muted-foreground uppercase tracking-wider text-xs mb-2">Mo. Spend</div>
                  <div className="text-xl font-bold tracking-tight text-foreground">
                    {totalSpend > 0 ? `$${totalSpend.toLocaleString()}` : "---"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground uppercase tracking-wider text-xs mb-2">Active Seats</div>
                  <div className="text-xl font-bold tracking-tight text-foreground">
                    {maxSeats || "---"}
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
                <div className={`text-3xl font-bold tracking-tight ${totalSpend > 0 ? 'text-primary' : 'text-muted opacity-30'}`}>
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
                  <span>Initializing deterministic audit sequence...</span>
                </div>
                {analysisStep > 0 && (
                  <div className="flex items-start text-muted">
                    <span className="mr-3 text-primary font-bold">{'>'}</span>
                    <span>Reconciling tool stack [{vendors.length} vendors]... OK</span>
                  </div>
                )}
                {analysisStep > 1 && (
                  <div className="flex items-start text-muted">
                    <span className="mr-3 text-primary font-bold">{'>'}</span>
                    <span>Analyzing seat utilization vs compute allocation... OK</span>
                  </div>
                )}
                {analysisStep > 2 && (
                  <div className="flex items-start text-muted">
                    <span className="mr-3 text-primary font-bold">{'>'}</span>
                    <span>Detecting redundant subscription overlaps... OK</span>
                  </div>
                )}
                {analysisStep > 3 && (
                  <div className="flex items-start text-muted">
                    <span className="mr-3 text-primary font-bold">{'>'}</span>
                    <span>Calculating leakage heuristics for {selectedUseCases.length} use cases... {step === 4 && <span className="animate-pulse">█</span>}</span>
                  </div>
                )}
                {analysisStep > 4 && (
                  <div className="flex items-start text-primary font-semibold mt-4 pt-4 border-t border-background/20">
                    <span className="mr-3 font-bold">{'>'}</span>
                    <span>[SYS_READY] Audit profile serialized to archival ledger.</span>
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
