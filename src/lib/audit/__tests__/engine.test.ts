import { evaluateAuditData } from "../engine";
import { AuditData } from "../types";

describe("Audit Engine", () => {
  test("detects Cursor + Copilot overlap", () => {
    const data: AuditData = {
      vendors: ["cursor", "github_copilot"],
      spend: 1000,
      seats: 10,
      useCases: ["copilot"],
      tools: [
        { toolId: "cursor", plan: "Pro", seats: 10, monthlySpend: 500 },
        { toolId: "github_copilot", plan: "Business", seats: 10, monthlySpend: 500 },
      ],
    };
    const result = evaluateAuditData(data);
    expect(result.recommendations.some(r => r.id === "rec_coding_overlap")).toBe(true);
    expect(result.monthlySavings).toBeGreaterThan(0);
  });

  test("flags overpaying vs official price", () => {
    const data: AuditData = {
      vendors: ["github_copilot"],
      spend: 750,
      seats: 4,
      useCases: [],
      tools: [
        { toolId: "github_copilot", plan: "Individual", seats: 4, monthlySpend: 750 },
      ],
    };
    const result = evaluateAuditData(data);
    expect(result.monthlySavings).toBeGreaterThan(0);
  });

  test("flags ChatGPT Team with fewer than 5 seats", () => {
    const data: AuditData = {
      vendors: ["chatgpt"],
      spend: 90,
      seats: 3,
      useCases: [],
      tools: [
        { toolId: "chatgpt", plan: "Team", seats: 3, monthlySpend: 90 },
      ],
    };
    const result = evaluateAuditData(data);
    expect(result.recommendations.some(r => r.id === "rec_chatgpt")).toBe(true);
  });

  test("flags OpenAI API anomalous spend per developer", () => {
    const data: AuditData = {
      vendors: ["openai"],
      spend: 3000,
      seats: 4,
      useCases: [],
      tools: [
        { toolId: "openai", plan: "API Direct", seats: 4, monthlySpend: 3000 },
      ],
    };
    const result = evaluateAuditData(data);
    expect(result.monthlySavings).toBeGreaterThan(0);
  });

  test("always returns at least one recommendation", () => {
    const data: AuditData = {
      vendors: ["cursor"],
      spend: 20,
      seats: 1,
      useCases: [],
      tools: [
        { toolId: "cursor", plan: "Pro", seats: 1, monthlySpend: 20 },
      ],
    };
    const result = evaluateAuditData(data);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  test("handles zero spend without divide-by-zero", () => {
    const data: AuditData = {
      vendors: [],
      spend: 0,
      seats: 0,
      useCases: [],
      tools: [],
    };
    const result = evaluateAuditData(data);
    expect(result.monthlySavings).toBe(0);
    expect(result.annualSavings).toBe(0);
  });

  test("annual savings equals monthly savings times 12", () => {
    const data: AuditData = {
      vendors: ["cursor", "github_copilot"],
      spend: 800,
      seats: 8,
      useCases: [],
      tools: [
        { toolId: "cursor", plan: "Pro", seats: 8, monthlySpend: 400 },
        { toolId: "github_copilot", plan: "Business", seats: 8, monthlySpend: 400 },
      ],
    };
    const result = evaluateAuditData(data);
    expect(result.annualSavings).toBe(result.monthlySavings * 12);
  });
});
