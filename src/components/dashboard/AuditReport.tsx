"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { evaluateAuditData } from "@/lib/audit/engine";
import { VENDOR_REGISTRY } from "@/lib/audit/config";
import { AuditData, EngineResult, AuditRecord } from "@/lib/audit/types";
import { exportAuditToPDF } from "@/lib/audit/export";
import { Download, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/utils/supabase/client";

function SkeletonReport() {
  return (
    <div className="pb-32 animate-in fade-in duration-500">
      <div className="bg-foreground py-24 border-b border-border">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-6 flex-1">
              <Skeleton className="h-6 w-48 bg-background/10" />
              <Skeleton className="h-20 w-3/4 bg-background/10" />
              <Skeleton className="h-6 w-32 bg-background/10" />
            </div>
            <div className="grid grid-cols-2 gap-8 bg-background/5 p-8 border border-background/10 shrink-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-24 bg-background/10" />
                  <Skeleton className="h-8 w-32 bg-background/10" />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>
      <Container className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </Container>
    </div>
  );
}

export function AuditReport({ id }: { id?: string }) {
  const [data, setData] = useState<AuditData | null>(null);
  const [report, setReport] = useState<EngineResult | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAudit() {
      setHasMounted(true);
      setError(null);
      
      const historyJson = localStorage.getItem("ledger_audit_history");
      let history: AuditRecord[] = historyJson ? JSON.parse(historyJson) : [];
      
      const targetId = id || localStorage.getItem("ledger_current_audit_id") || (history[0]?.id);
      
      if (!targetId) {
        setLoading(false);
        return;
      }

      // 1. Try LocalStorage
      let record = history.find(r => r.id === targetId);
      
      if (record) {
        setData(record.data);
        setReport(record.result);
        setCurrentId(record.id);
        setLoading(false);
        return;
      }

      // 2. Fallback to Supabase
      try {
        const supabase = createClient();
        const { data: remoteData, error: remoteError } = await supabase
          .from("audits")
          .select("*")
          .eq("id", targetId)
          .single();

        if (remoteError || !remoteData) {
          throw new Error("Report not found in archival ledger.");
        }

        const remoteRecord: AuditRecord = {
          id: remoteData.id,
          timestamp: remoteData.created_at,
          data: remoteData.data,
          result: remoteData.result
        };

        // Sync to localStorage
        history.unshift(remoteRecord);
        localStorage.setItem("ledger_audit_history", JSON.stringify(history));

        setData(remoteRecord.data);
        setReport(remoteRecord.result);
        setCurrentId(remoteRecord.id);
      } catch (e: any) {
        console.error("Failed to load audit:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    loadAudit();
  }, [id]);

  const handleDownload = async () => {
    if (!currentId) return;
    setIsExporting(true);
    await exportAuditToPDF("audit-report-content", currentId);
    setIsExporting(false);
  };

  if (!hasMounted || loading) {
    return <SkeletonReport />;
  }

  if (error) {
    return (
      <Container className="py-32">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center border border-red-500/20 bg-red-500/10 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-widest text-red-500">
            Fetch Error
          </div>
          <h1 className="text-4xl font-semibold tracking-tighter text-foreground">{error}</h1>
          <Link href="/onboarding">
            <Button size="lg" className="h-14 px-8 uppercase tracking-widest font-semibold shadow-none">
              Initialize New Audit <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Container>
    );
  }

  if (!data || !report || data.spend === 0) {
    return (
      <Container className="py-32">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h1 className="text-4xl font-semibold tracking-tighter text-foreground">No Audit Data Found</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">Please run an initial audit configuration to view your infrastructure ledger report.</p>
          <Link href="/onboarding">
            <Button size="lg" className="h-14 px-8 uppercase tracking-widest font-semibold shadow-none">
              Initialize Audit <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <div id="audit-report-content" className="pb-32 animate-in fade-in duration-700 bg-background">
      {/* 1. Hero Savings Section */}
      <section className="bg-foreground text-background py-24 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <Container className="relative">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="inline-flex items-center border border-background/20 bg-background/10 px-3 py-1 text-xs font-mono font-bold uppercase tracking-widest text-background shadow-sm">
                  <span className="flex h-1.5 w-1.5 bg-primary mr-2"></span>
                  Audit {currentId} Complete
                </div>
                <Button 
                  onClick={handleDownload}
                  disabled={isExporting}
                  variant="outline" 
                  className="h-8 px-3 border-background/20 bg-background/10 text-background hover:bg-background hover:text-foreground text-[10px] font-mono font-bold uppercase tracking-widest transition-all rounded-none"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-3 w-3" />
                      Download Ledger Report
                    </>
                  )}
                </Button>
              </div>
              <h1 className="text-6xl font-semibold tracking-tighter leading-[1.05] mb-4 font-mono">
                {report.annualSavings.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
              </h1>
              <p className="text-xl text-muted/70 tracking-wide font-sans">Projected Annual Savings</p>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-8 bg-background/5 p-8 border border-background/10 shrink-0">
              <div>
                <p className="text-sm uppercase tracking-widest text-muted/70 font-semibold mb-2">Current Run Rate</p>
                <p className="text-3xl font-mono tracking-tight text-background">
                  {report.currentSpend.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}<span className="text-base text-muted/50">/mo</span>
                </p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-muted/70 font-semibold mb-2">Optimized Run Rate</p>
                <p className="text-3xl font-mono tracking-tight text-primary">
                  {report.optimizedSpend.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}<span className="text-base text-primary/50">/mo</span>
                </p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-muted/70 font-semibold mb-2">Leakage Detected</p>
                <p className="text-3xl font-mono tracking-tight text-red-400">
                  {report.leakagePercent}%
                </p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-muted/70 font-semibold mb-2">Efficiency Score</p>
                <p className="text-3xl font-mono tracking-tight text-background">
                  {report.optScore}/100
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Executive Summary & Warnings */}
      <section className="py-16 border-b border-border bg-background">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <h2 className="text-sm font-mono font-bold tracking-[0.2em] uppercase text-muted-foreground mb-6">Executive Summary</h2>
              <p className="text-xl leading-relaxed text-foreground font-sans">
                {report.executiveSummary}
              </p>
            </div>
            
            {report.warnings.length > 0 && (
              <div className="bg-red-500/5 border border-red-500/20 p-6">
                <h3 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-red-500 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Operational Warnings
                </h3>
                <ul className="space-y-4">
                  {report.warnings.map((w, i) => (
                    <li key={i} className="text-sm text-foreground leading-relaxed flex gap-3 items-start font-sans">
                      <span className="text-red-500 mt-1 shrink-0">!</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* 3. Vendor Stack Analysis */}
      <section className="py-16 border-b border-border bg-muted/20 relative">
        <Container>
          <h2 className="text-sm font-mono font-bold tracking-[0.2em] uppercase text-muted-foreground mb-8">Infrastructure Ledger</h2>
          <div className="bg-card border border-border shadow-sm overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/30 border-b border-border uppercase tracking-wider">
                <tr>
                  <th className="px-8 py-5 font-semibold">Asset / Provider</th>
                  <th className="px-8 py-5 font-semibold text-right">Gross Spend</th>
                  <th className="px-8 py-5 font-semibold text-right">Target Optimized</th>
                  <th className="px-8 py-5 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-sm">
                {data.vendors.map((v, i) => {
                  const weight = (data.vendors.length - i) / ((data.vendors.length * (data.vendors.length + 1)) / 2);
                  const vSpend = Math.round(data.spend * weight);
                  const vLeakage = Math.round(vSpend * (report.leakagePercent / 100));
                  const vOpt = vSpend - vLeakage;
                  
                  return (
                    <tr key={v} className="hover:bg-muted/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-bold text-foreground font-sans text-base">{VENDOR_REGISTRY[v]?.name || v}</div>
                        <div className="text-muted-foreground mt-1 text-xs tracking-wide uppercase">{VENDOR_REGISTRY[v]?.category || "API"} Service</div>
                      </td>
                      <td className="px-8 py-6 text-right text-muted-foreground">
                        {vSpend.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-8 py-6 text-right font-bold text-primary">
                        {vOpt.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-red-500 bg-red-500/5 border border-red-500/10 px-2 py-1">
                          Review Required
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* 4. Recommendations Engine */}
      <section className="py-24 bg-background">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
            <div>
              <h2 className="text-3xl font-semibold tracking-tighter text-foreground leading-[1.1] font-sans">
                Strategic Reconciliations
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl font-sans">
                Execute these validated operational changes to realize your optimized run rate and eliminate token leakage.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {report.recommendations.map((rec, i) => (
              <div key={i} className="border border-border bg-card p-8 shadow-sm flex flex-col justify-between group hover:border-primary/50 transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="inline-flex items-center text-xs font-mono font-bold tracking-widest uppercase bg-muted px-3 py-1 border border-border">
                      Confidence: {rec.confidence}
                    </div>
                    <div className={`text-xs font-mono font-bold tracking-widest uppercase px-3 py-1 border border-border ${rec.severity === 'Critical' ? 'bg-red-500 text-background border-red-500' : 'bg-muted border-border'}`}>
                      {rec.severity}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground tracking-tight mb-3 font-sans">{rec.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm mb-8 font-sans">
                    {rec.reasoning}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Projected Savings</p>
                    <p className="text-2xl font-mono font-bold text-primary">
                      {rec.projected.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}<span className="text-sm font-sans font-normal text-muted-foreground">/mo</span>
                    </p>
                  </div>
                  <Button variant="outline" className="uppercase tracking-widest text-xs font-bold shadow-none rounded-none border-border group-hover:bg-primary/5 group-hover:text-primary transition-colors h-10">
                    Execute Remediation
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

    </div>
  );
}
