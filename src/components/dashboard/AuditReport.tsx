"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AuditData {
  vendors: string[];
  spend: number;
  seats: number;
  useCases: string[];
}

const VENDOR_NAMES: Record<string, string> = {
  "openai": "OpenAI API",
  "anthropic": "Anthropic API",
  "aws": "AWS Bedrock",
  "gcp": "Google Cloud",
  "cursor": "Cursor",
  "github_copilot": "GitHub Copilot",
  "chatgpt_team": "ChatGPT Team",
  "chatgpt_plus": "ChatGPT Plus"
};

interface AuditRule {
  id: string;
  condition: (data: AuditData) => boolean;
  leakageImpact: number; // percentage penalty
  recommendation: {
    title: string;
    reasoning: string;
    projectedSavingsModifier: number; // fraction of total spend saved
    confidence: "Medium" | "High" | "Very High";
  };
  warning?: string;
  summaryText?: string;
}

const RULES: AuditRule[] = [
  {
    id: "coding_assistant_redundancy",
    condition: (d) => d.vendors.includes("cursor") && d.vendors.includes("github_copilot"),
    leakageImpact: 8,
    recommendation: {
      title: "Consolidate Coding Assistants",
      reasoning: "Overlapping subscriptions detected for both Cursor and GitHub Copilot. Standardizing on a single AI IDE environment will eliminate redundant per-seat licensing.",
      projectedSavingsModifier: 0.1,
      confidence: "Very High"
    },
    warning: "Coding assistant redundancy detected. Team is paying double licensing for AI autocomplete capabilities.",
    summaryText: "We detected overlapping developer productivity subscriptions (Cursor and Copilot) costing unnecessary overhead."
  },
  {
    id: "chatgpt_team_inefficiency",
    condition: (d) => d.vendors.includes("chatgpt_team") && d.seats < 5,
    leakageImpact: 5,
    recommendation: {
      title: "Downgrade to ChatGPT Plus",
      reasoning: "Your active seat count does not justify the ChatGPT Team tier workspace minimums. Transitioning to individual Plus accounts optimizes cost without sacrificing model access.",
      projectedSavingsModifier: 0.05,
      confidence: "High"
    },
    warning: "Enterprise chat workspace utilized by sub-optimal team size.",
    summaryText: "Your active seat count indicates you are overpaying for Enterprise chat tiers."
  },
  {
    id: "high_spend_to_seat_ratio",
    condition: (d) => d.spend / Math.max(d.seats, 1) > 1000 && (d.vendors.includes("openai") || d.vendors.includes("anthropic")),
    leakageImpact: 15,
    recommendation: {
      title: "Audit Anomalous API Runaway",
      reasoning: "API expenditure exceeds $1k per developer seat. This strongly indicates orphaned staging keys, unbounded retry loops, or lack of prompt caching.",
      projectedSavingsModifier: 0.2,
      confidence: "High"
    },
    warning: "Excessive API spend relative to active engineering seats.",
    summaryText: "Your spend-to-seat ratio is anomalously high, suggesting orphaned staging environments or inefficient pipeline loops."
  },
  {
    id: "rag_without_caching",
    condition: (d) => d.useCases.includes("rag") && d.vendors.includes("openai"),
    leakageImpact: 8,
    recommendation: {
      title: "Enforce Prompt Caching on RAG",
      reasoning: "Background RAG pipelines are repeatedly ingesting identical context windows. Activating vendor-level caching will collapse input token costs immediately.",
      projectedSavingsModifier: 0.12,
      confidence: "Very High"
    },
    summaryText: "Your retrieval pipelines are missing critical caching headers, driving up baseline compute costs."
  },
  {
    id: "model_fragmentation",
    condition: (d) => d.vendors.includes("openai") && d.vendors.includes("anthropic") && d.vendors.includes("gcp"),
    leakageImpact: 10,
    recommendation: {
      title: "Consolidate Infrastructure Providers",
      reasoning: "Active usage detected across 3+ foundational model APIs. Consolidating production traffic to a single provider leverages volume discount tiers and simplifies the CI/CD pipeline.",
      projectedSavingsModifier: 0.15,
      confidence: "Medium"
    },
    warning: "Extreme model fragmentation. Loss of volume-tier pricing advantages.",
    summaryText: "You are fragmenting your API volume across too many providers, losing out on significant enterprise discount tiers."
  }
];

const FALLBACK_RULE: AuditRule = {
  id: "general_optimization",
  condition: () => true,
  leakageImpact: 5,
  recommendation: {
    title: "Enforce Hard Usage Limits",
    reasoning: "Unbounded API keys identified in production environments. Implement firm token limits to prevent runaway loops and establish a baseline.",
    projectedSavingsModifier: 0.05,
    confidence: "Medium"
  }
};

export function AuditReport() {
  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("ledger_audit_data");
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse audit data");
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-mono">Loading ledger...</div>;
  }

  if (!data || data.spend === 0) {
    return (
      <Container className="py-32">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h1 className="text-4xl font-semibold tracking-tighter">No Audit Data Found</h1>
          <p className="text-lg text-muted-foreground">Please run an initial audit configuration to view your ledger report.</p>
          <Link href="/onboarding">
            <Button size="lg" className="h-14 px-8 uppercase tracking-widest font-semibold shadow-none">
              Initialize Audit <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Container>
    );
  }

  // --- ENGINE EVALUATION ---
  const currentSpend = data.spend;
  
  // Base leakage of 10% just for standard unoptimized behavior
  let leakagePercent = 10;
  const triggeredRules = RULES.filter(rule => rule.condition(data));
  
  const rulesToApply = triggeredRules.length > 0 ? triggeredRules : [FALLBACK_RULE];

  rulesToApply.forEach(rule => {
    leakagePercent += rule.leakageImpact;
  });

  // Cap at 60%
  leakagePercent = Math.min(leakagePercent, 60);

  const monthlySavings = Math.round(currentSpend * (leakagePercent / 100));
  const optimizedSpend = currentSpend - monthlySavings;
  const annualSavings = monthlySavings * 12;
  const optScore = Math.max(20, 100 - leakagePercent);

  // Extract content from rules
  const warnings = rulesToApply.filter(r => r.warning).map(r => r.warning as string);
  const recommendations = rulesToApply.map(r => ({
    ...r.recommendation,
    projected: Math.round(currentSpend * r.recommendation.projectedSavingsModifier)
  }));
  const dynamicSummaries = rulesToApply.filter(r => r.summaryText).map(r => r.summaryText).join(" ");

  return (
    <div className="pb-32">
      {/* 1. Hero Savings Section */}
      <section className="bg-foreground text-background py-24 border-b border-border">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div>
              <div className="inline-flex items-center border border-background/20 bg-background/10 px-3 py-1 text-xs font-mono font-bold mb-8 uppercase tracking-widest text-background shadow-sm">
                <span className="flex h-1.5 w-1.5 bg-primary mr-2"></span>
                Audit LDG-4992 Complete
              </div>
              <h1 className="text-6xl font-semibold tracking-tighter leading-[1.05] mb-4">
                {annualSavings.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
              </h1>
              <p className="text-xl text-muted/70 tracking-wide">Projected Annual Savings</p>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-8 bg-background/5 p-8 border border-background/10 shrink-0">
              <div>
                <p className="text-sm uppercase tracking-widest text-muted/70 font-semibold mb-2">Current Run Rate</p>
                <p className="text-3xl font-mono tracking-tight text-background">
                  {currentSpend.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}<span className="text-base text-muted/50">/mo</span>
                </p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-muted/70 font-semibold mb-2">Optimized Run Rate</p>
                <p className="text-3xl font-mono tracking-tight text-primary">
                  {optimizedSpend.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}<span className="text-base text-primary/50">/mo</span>
                </p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-muted/70 font-semibold mb-2">Leakage Detected</p>
                <p className="text-3xl font-mono tracking-tight text-red-400">
                  {leakagePercent}%
                </p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-muted/70 font-semibold mb-2">Optimization Score</p>
                <p className="text-3xl font-mono tracking-tight text-background">
                  {optScore}/100
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
              <p className="text-xl leading-relaxed text-foreground">
                Our analysis of your {currentSpend.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} monthly spend across {data.vendors.length} vendors reveals a highly unoptimized infrastructure. {dynamicSummaries} Immediate standardizations can recover {leakagePercent}% of your API expenditure without impacting production latency or developer velocity.
              </p>
            </div>
            
            {warnings.length > 0 && (
              <div className="bg-red-500/5 border border-red-500/20 p-6">
                <h3 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-red-500 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Critical Infrastructure Warnings
                </h3>
                <ul className="space-y-4">
                  {warnings.map((w, i) => (
                    <li key={i} className="text-sm text-foreground leading-relaxed flex gap-3 items-start">
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
      <section className="py-16 border-b border-border bg-muted/20">
        <Container>
          <h2 className="text-sm font-mono font-bold tracking-[0.2em] uppercase text-muted-foreground mb-8">Reconciled Vendor Stack</h2>
          <div className="bg-card border border-border shadow-sm overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/30 border-b border-border uppercase tracking-wider">
                <tr>
                  <th className="px-8 py-5 font-semibold">Vendor</th>
                  <th className="px-8 py-5 font-semibold text-right">Attributed Spend</th>
                  <th className="px-8 py-5 font-semibold text-right">Target Optimized</th>
                  <th className="px-8 py-5 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-sm">
                {data.vendors.map((v, i) => {
                  const weight = (data.vendors.length - i) / ((data.vendors.length * (data.vendors.length + 1)) / 2);
                  const vSpend = Math.round(currentSpend * weight);
                  const vLeakage = Math.round(vSpend * (leakagePercent / 100));
                  const vOpt = vSpend - vLeakage;
                  
                  return (
                    <tr key={v} className="hover:bg-muted/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-bold text-foreground font-sans text-base">{VENDOR_NAMES[v] || v}</div>
                        <div className="text-muted-foreground mt-1 text-xs tracking-wide">Enterprise Volume Tier</div>
                      </td>
                      <td className="px-8 py-6 text-right text-muted-foreground">
                        {vSpend.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-8 py-6 text-right font-bold text-primary">
                        {vOpt.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-red-500">
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
              <h2 className="text-3xl font-semibold tracking-tighter text-foreground leading-[1.1]">
                Actionable Reconciliations
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">
                Execute these validated architectural changes to realize your optimized run rate.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((rec, i) => (
              <div key={i} className="border border-border bg-card p-8 shadow-sm flex flex-col justify-between group hover:border-primary/50 transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="inline-flex items-center text-xs font-mono font-bold tracking-widest uppercase bg-muted px-2 py-1 border border-border">
                      Confidence: {rec.confidence}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground tracking-tight mb-3">{rec.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm mb-8">
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
                  <Button variant="outline" className="uppercase tracking-widest text-xs font-bold shadow-none rounded-none border-border group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                    Execute Script
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
