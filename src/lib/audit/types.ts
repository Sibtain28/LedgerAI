export interface AuditData {
  vendors: string[];
  spend: number;
  seats: number;
  useCases: string[];
}

export type Severity = "Low" | "Medium" | "High" | "Critical";
export type Confidence = "Low" | "Medium" | "High" | "Very High";

export interface Recommendation {
  id: string;
  title: string;
  reasoning: string;
  projectedSavingsModifier: number; // fraction of spend saved
  severity: Severity;
  confidence: Confidence;
}

export interface AuditRule {
  id: string;
  condition: (data: AuditData) => boolean;
  leakageImpact: number; // percentage penalty (e.g., 5 for 5%)
  recommendation: Recommendation;
  warning?: string;
  summaryText?: string;
}

export interface ToolMetadata {
  id: string;
  name: string;
  category: "infrastructure" | "assistant" | "consumer";
  enterprise: boolean;
}

export interface EngineResult {
  currentSpend: number;
  optimizedSpend: number;
  annualSavings: number;
  monthlySavings: number;
  leakagePercent: number;
  optScore: number;
  recommendations: (Recommendation & { projected: number })[];
  warnings: string[];
  executiveSummary: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  data: AuditData;
  result: EngineResult;
}
