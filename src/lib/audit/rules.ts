import { AuditRule } from "./types";

export const AUDIT_RULES: AuditRule[] = [
  {
    id: "redundant_coding_assistants",
    condition: (d) => d.vendors.includes("cursor") && d.vendors.includes("github_copilot"),
    leakageImpact: 8,
    recommendation: {
      id: "rec_coding_assistants",
      title: "Consolidate Coding Assistants",
      reasoning: "Overlapping subscriptions detected for both Cursor and GitHub Copilot. Standardizing on a single AI IDE environment will eliminate redundant per-seat licensing without impacting developer velocity.",
      projectedSavingsModifier: 0.1,
      severity: "High",
      confidence: "Very High"
    },
    warning: "Coding assistant redundancy detected. Team is paying double licensing for AI autocomplete capabilities.",
    summaryText: "We detected overlapping developer productivity subscriptions (Cursor and Copilot) creating redundant per-seat licensing."
  },
  {
    id: "oversized_team_plan",
    condition: (d) => d.vendors.includes("chatgpt_team") && d.seats < 5,
    leakageImpact: 5,
    recommendation: {
      id: "rec_oversized_team",
      title: "Downgrade to Individual Chat Tiers",
      reasoning: "Active seat count does not justify enterprise workspace minimums. Transitioning to individual accounts optimizes cost while maintaining model access and data privacy agreements.",
      projectedSavingsModifier: 0.05,
      severity: "Medium",
      confidence: "High"
    },
    warning: "Enterprise chat workspace utilized by sub-optimal team size.",
    summaryText: "Your active seat count indicates forfeiture of volume discount thresholds on Enterprise chat tiers."
  },
  {
    id: "anomalous_api_runaway",
    condition: (d) => d.spend / Math.max(d.seats, 1) > 1000 && (d.vendors.includes("openai") || d.vendors.includes("anthropic")),
    leakageImpact: 15,
    recommendation: {
      id: "rec_anomalous_runaway",
      title: "Audit Anomalous API Runaway",
      reasoning: "API expenditure exceeds $1k per developer seat. This strongly indicates orphaned staging infrastructure, unbounded token loops, or the absence of prompt caching.",
      projectedSavingsModifier: 0.2,
      severity: "Critical",
      confidence: "High"
    },
    warning: "Excessive API spend relative to active engineering seats.",
    summaryText: "Your spend-to-seat ratio is anomalously high, suggesting orphaned staging infrastructure or unbounded pipeline loops."
  },
  {
    id: "inefficient_pipeline_topology",
    condition: (d) => d.useCases.includes("rag") && d.vendors.includes("openai"),
    leakageImpact: 8,
    recommendation: {
      id: "rec_pipeline_topology",
      title: "Enforce Strict Prompt Caching",
      reasoning: "Background retrieval pipelines are repeatedly ingesting identical context windows. Activating vendor-level caching will collapse input token costs and reduce latency.",
      projectedSavingsModifier: 0.12,
      severity: "High",
      confidence: "Very High"
    },
    summaryText: "Your retrieval pipelines are missing critical caching headers, artificially inflating baseline compute costs."
  },
  {
    id: "fragmented_model_providers",
    condition: (d) => d.vendors.includes("openai") && d.vendors.includes("anthropic") && d.vendors.includes("gcp"),
    leakageImpact: 10,
    recommendation: {
      id: "rec_fragmented_models",
      title: "Consolidate Infrastructure Providers",
      reasoning: "Active usage detected across 3+ foundational model APIs. Consolidating production traffic to a single provider leverages volume discount tiers and simplifies CI/CD workflows.",
      projectedSavingsModifier: 0.15,
      severity: "Medium",
      confidence: "Medium"
    },
    warning: "Extreme model fragmentation. Loss of volume-tier pricing advantages.",
    summaryText: "You are fragmenting your API volume across too many providers, resulting in volume discount threshold forfeiture."
  }
];

export const FALLBACK_RULE: AuditRule = {
  id: "general_optimization",
  condition: () => true,
  leakageImpact: 5,
  recommendation: {
    id: "rec_general_opt",
    title: "Enforce Hard Usage Limits",
    reasoning: "Unbounded API keys identified in production environments. Implement firm token limits to prevent runaway loops and establish a controllable baseline.",
    projectedSavingsModifier: 0.05,
    severity: "Medium",
    confidence: "Medium"
  }
};
