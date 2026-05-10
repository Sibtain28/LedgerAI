import { AuditData, EngineResult, Recommendation } from "./types";

// Official pricing data (verified May 2026)
const TOOL_PRICING: Record<string, Record<string, number>> = {
  cursor: { Hobby: 0, Pro: 20, Business: 40, Enterprise: 40 },
  github_copilot: { Individual: 10, Business: 19, Enterprise: 39 },
  claude: { Free: 0, Pro: 20, Max: 100, Team: 30, Enterprise: 60 },
  chatgpt: { Plus: 20, Team: 30, Enterprise: 60 },
  anthropic: { "API Direct": 0 },
  openai: { "API Direct": 0 },
  gemini: { Pro: 20, Ultra: 249, API: 0 },
  windsurf: { Free: 0, Pro: 15, Teams: 35 },
};

const TOOL_DISPLAY_NAMES: Record<string, string> = {
  cursor: "Cursor",
  github_copilot: "GitHub Copilot",
  claude: "Claude (Anthropic)",
  chatgpt: "ChatGPT (OpenAI)",
  anthropic: "Anthropic API",
  openai: "OpenAI API",
  gemini: "Gemini",
  windsurf: "Windsurf",
};

export function evaluateAuditData(data: AuditData): EngineResult {
  const tools = data.tools || [];
  const totalSpend = data.spend;
  const recommendations: (Recommendation & { projected: number })[] = [];
  const warnings: string[] = [];
  let totalSavings = 0;

  // Per-tool analysis
  const toolResults = tools.map((tool) => {
    const officialPrice = TOOL_PRICING[tool.toolId]?.[tool.plan] ?? 0;
    const expectedMonthly = officialPrice * tool.seats;
    const actualMonthly = tool.monthlySpend;
    let toolSavings = 0;
    let finding = "";
    let action = "";

    // Check 1: Overpaying vs official price
    if (officialPrice > 0 && actualMonthly > expectedMonthly * 1.1) {
      toolSavings += actualMonthly - expectedMonthly;
      finding = `Actual spend ($${actualMonthly}/mo) exceeds expected $${expectedMonthly}/mo for ${tool.seats} seats on ${tool.plan} plan.`;
      action = `Reconcile billing — expected $${officialPrice}/seat/mo × ${tool.seats} seats = $${expectedMonthly}/mo.`;
    }

    // Check 2: Team plan with too few seats
    if (
      (tool.toolId === "chatgpt" && tool.plan === "Team" && tool.seats < 5) ||
      (tool.toolId === "claude" && tool.plan === "Team" && tool.seats < 5)
    ) {
      const individualSavings = Math.round(actualMonthly * 0.2);
      toolSavings = Math.max(toolSavings, individualSavings);
      finding = `Team plan with only ${tool.seats} seats. Minimum value threshold not met.`;
      action = `Downgrade to individual ${tool.toolId === "chatgpt" ? "Plus" : "Pro"} plans ($20/seat/mo).`;
    }

    // Check 3: Enterprise plan with small team
    if (
      ["Enterprise"].includes(tool.plan) &&
      tool.seats < 20 &&
      tool.toolId !== "anthropic" &&
      tool.toolId !== "openai"
    ) {
      const savings = Math.round(actualMonthly * 0.25);
      toolSavings = Math.max(toolSavings, savings);
      finding = `Enterprise tier for only ${tool.seats} seats is cost-inefficient.`;
      action = `Downgrade to Business/Team tier — saves approx 25% per seat.`;
    }

    // Check 4: API direct spend anomaly (>$500/seat)
    if (
      (tool.toolId === "anthropic" || tool.toolId === "openai") &&
      tool.seats > 0 &&
      actualMonthly / tool.seats > 500
    ) {
      const savings = Math.round(actualMonthly * 0.3);
      toolSavings = Math.max(toolSavings, savings);
      finding = `API spend of $${actualMonthly}/mo for ${tool.seats} developers is anomalously high ($${Math.round(actualMonthly / tool.seats)}/dev).`;
      action = `Implement prompt caching and hard token limits to eliminate runaway loops.`;
    }

    totalSavings += toolSavings;

    return {
      toolId: tool.toolId,
      name: TOOL_DISPLAY_NAMES[tool.toolId] || tool.toolId,
      plan: tool.plan,
      seats: tool.seats,
      grossSpend: actualMonthly,
      targetOptimized: Math.max(actualMonthly - toolSavings, 0),
      savings: toolSavings,
      finding,
      action,
    };
  });

  // Cross-tool rules
  const toolIds = tools.map((t) => t.toolId);

  // Rule: Cursor + Copilot overlap
  if (toolIds.includes("cursor") && toolIds.includes("github_copilot")) {
    const cursorTool = tools.find((t) => t.toolId === "cursor")!;
    const copilotTool = tools.find((t) => t.toolId === "github_copilot")!;
    const cheaperMonthly = Math.min(
      copilotTool.monthlySpend,
      cursorTool.monthlySpend
    );
    const overlapSavings = Math.round(cheaperMonthly * 0.9);
    totalSavings += overlapSavings;
    warnings.push(
      `Redundant coding assistants: Cursor and GitHub Copilot serve identical functions. Consolidate to one — recommend dropping whichever has lower team adoption.`
    );
    recommendations.push({
      id: "rec_coding_overlap",
      title: "Consolidate Coding Assistants",
      reasoning: `Your team pays for both Cursor ($${cursorTool.monthlySpend}/mo) and GitHub Copilot ($${copilotTool.monthlySpend}/mo). These are functionally identical for most use cases. Pick the one your engineers prefer and cancel the other.`,
      projectedSavingsModifier: overlapSavings / totalSpend,
      projected: overlapSavings,
      severity: "High",
      confidence: "Very High",
    });
  }

  // Rule: Gemini Ultra overkill
  if (toolIds.includes("gemini")) {
    const geminiTool = tools.find((t) => t.toolId === "gemini")!;
    if (geminiTool.plan === "Ultra" && geminiTool.seats < 10) {
      const savings = Math.round(geminiTool.monthlySpend * 0.65);
      totalSavings += savings;
      recommendations.push({
        id: "rec_gemini_downgrade",
        title: "Downgrade Gemini Ultra to Pro",
        reasoning: `Gemini Ultra at $249/seat is overkill for teams under 10. Gemini Pro ($20/seat) handles the same workloads for 90% of use cases.`,
        projectedSavingsModifier: savings / totalSpend,
        projected: savings,
        severity: "Medium",
        confidence: "High",
      });
    }
  }

  // Add per-tool recs for tools with significant findings
  toolResults.forEach((t) => {
    if (t.savings > 0 && t.finding) {
      recommendations.push({
        id: `rec_${t.toolId}`,
        title: `Optimize ${t.name}`,
        reasoning: `${t.finding} ${t.action}`,
        projectedSavingsModifier: t.savings / totalSpend,
        projected: t.savings,
        severity: t.savings > 500 ? "High" : "Medium",
        confidence: "High",
      });
    }
  });

  // Fallback if no specific recs triggered
  if (recommendations.length === 0) {
    totalSavings = Math.round(totalSpend * 0.1);
    recommendations.push({
      id: "rec_general",
      title: "Enforce Hard Usage Limits",
      reasoning:
        "Unbounded API keys in production environments can trigger runaway loops. Set firm monthly token caps on all API keys to prevent billing surprises.",
      projectedSavingsModifier: 0.1,
      projected: totalSavings,
      severity: "Medium",
      confidence: "Medium",
    });
  }

  const monthlySavings = totalSavings;
  const optimizedSpend = Math.max(totalSpend - monthlySavings, 0);
  const annualSavings = monthlySavings * 12;
  const leakagePercent = Math.min(Math.round((monthlySavings / Math.max(totalSpend, 1)) * 100), 85);
  const optScore = Math.max(20, 100 - leakagePercent);

  const executiveSummary = `Our analysis of your $${totalSpend.toLocaleString()}/mo spend across ${tools.length} active tools reveals ${leakagePercent}% recoverable leakage. ${warnings[0] || ""} Immediate standardizations can recover $${monthlySavings.toLocaleString()}/mo ($${annualSavings.toLocaleString()}/yr) without impacting production velocity.`;

  return {
    currentSpend: totalSpend,
    optimizedSpend,
    annualSavings,
    monthlySavings,
    leakagePercent,
    optScore,
    recommendations,
    warnings,
    executiveSummary,
    toolResults,
  };
}
