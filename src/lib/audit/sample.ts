import { AuditRecord } from "./types";

export const SAMPLE_AUDIT_ID = "LDG-SAMPLE";

export const SAMPLE_AUDIT_RECORD: AuditRecord = {
  id: SAMPLE_AUDIT_ID,
  timestamp: "2026-05-10T00:00:00.000Z",
  data: {
    vendors: ["openai", "anthropic", "cursor", "github_copilot", "chatgpt_team"],
    spend: 12500,
    seats: 45,
    useCases: ["rag", "copilot", "agents"]
  },
  result: {
    currentSpend: 12500,
    optimizedSpend: 8400,
    annualSavings: 49200,
    leakagePercent: 32.8,
    optScore: 67,
    executiveSummary: "Analysis of the current AI infrastructure stack reveals significant redundancy in coding assistance and seat allocation. The organization is currently dual-licensing Cursor and GitHub Copilot across the same engineering cohort, while over-provisioning ChatGPT Team seats for non-technical roles. API efficiency is moderately high, but lacking request caching pipelines for RAG workloads.",
    recommendations: [
      {
        id: "REC-101",
        title: "Consolidate Coding Assistants",
        reasoning: "Detected 100% overlap between Cursor and GitHub Copilot. Consolidating to Cursor (preferred by engineering) will eliminate $19/seat/mo in redundant licensing.",
        projected: 855,
        severity: "Critical",
        confidence: "98%"
      },
      {
        id: "REC-102",
        title: "Rightsize Team Seats",
        reasoning: "22% of ChatGPT Team seats show zero active API usage over 30 days. Recommend downgrading to individual Plus seats for administrative roles.",
        projected: 420,
        severity: "Moderate",
        confidence: "85%"
      },
      {
        id: "REC-103",
        title: "Implement Semantic Caching",
        reasoning: "High volume of repetitive RAG queries detected. Implementing a semantic cache layer will reduce OpenAI API spend by approximately 15% through token reuse.",
        projected: 1875,
        severity: "High",
        confidence: "92%"
      }
    ],
    warnings: [
      "Redundant IDE extensions detected in 85% of active engineering seats.",
      "OpenAI API usage is approaching Tier 4 volume discount threshold.",
      "Unoptimized token usage in Background RAG pipelines."
    ]
  }
};
