import { AuditData, AuditRule, EngineResult, Recommendation } from "./types";
import { AUDIT_RULES, FALLBACK_RULE } from "./rules";

const BASE_LEAKAGE = 10;

export function evaluateAuditData(data: AuditData): EngineResult {
  const triggeredRules = AUDIT_RULES.filter(rule => rule.condition(data));
  const rulesToApply = triggeredRules.length > 0 ? triggeredRules : [FALLBACK_RULE];

  const currentSpend = data.spend;
  
  // Calculate Leakage
  let leakagePercent = BASE_LEAKAGE;
  rulesToApply.forEach(rule => {
    leakagePercent += rule.leakageImpact;
  });
  // Cap leakage at 60% realistically
  leakagePercent = Math.min(leakagePercent, 60);

  const monthlySavings = Math.round(currentSpend * (leakagePercent / 100));
  const optimizedSpend = currentSpend - monthlySavings;
  const annualSavings = monthlySavings * 12;
  const optScore = Math.max(20, 100 - leakagePercent);

  // Extract Warnings and Recommendations
  const warnings = rulesToApply.filter(r => r.warning).map(r => r.warning as string);
  
  const recommendations: (Recommendation & { projected: number })[] = rulesToApply.map(r => ({
    ...r.recommendation,
    projected: Math.round(currentSpend * r.recommendation.projectedSavingsModifier)
  }));

  // Generate Executive Summary
  const dynamicSummaries = rulesToApply.filter(r => r.summaryText).map(r => r.summaryText).join(" ");
  
  const executiveSummary = `Our analysis of your ${currentSpend.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} monthly spend across ${data.vendors.length} active vendors reveals an unoptimized architectural footprint. ${dynamicSummaries} Immediate standardizations can recover ${leakagePercent}% of your API expenditure without impacting production latency or developer velocity.`;

  return {
    currentSpend,
    optimizedSpend,
    annualSavings,
    monthlySavings,
    leakagePercent,
    optScore,
    recommendations,
    warnings,
    executiveSummary
  };
}
