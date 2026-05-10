import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const { tools, totalSpend, monthlySavings, annualSavings, 
            leakagePercent, recommendations, teamSize, useCases } = body;

    const toolSummary = tools
      ?.map((t: any) => `${t.toolId} (${t.plan}, ${t.seats} seats, 
        $${t.monthlySpend}/mo)`)
      .join(", ") || "tools not specified";

    const prompt = `You are a financial analyst specializing in AI infrastructure spend optimization for startups.

A startup has completed an AI spend audit. Write a 2-3 sentence personalized analysis paragraph (80-120 words) that:
1. Acknowledges their specific tool stack and spending pattern
2. Highlights the most impactful optimization opportunity
3. Ends with a forward-looking statement about what fixing this unlocks

Audit data:
- Tools: ${toolSummary}
- Total monthly spend: $${totalSpend}
- Identified monthly savings: $${monthlySavings}
- Annual savings potential: $${annualSavings}
- Leakage percentage: ${leakagePercent}%
- Team size: ${teamSize || "unspecified"}
- Use cases: ${useCases?.join(", ") || "unspecified"}
- Top recommendation: ${recommendations?.[0]?.title || "general optimization"}

Write ONLY the paragraph. No headers, no bullet points, no preamble. 
Start directly with the analysis. Use a direct, financial-advisor tone. 
Do not use the word "significant" or "leverage".`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" 
      ? message.content[0].text 
      : "";

    return NextResponse.json({ summary: text });
  } catch (error) {
    console.error("AI summary error:", error);
    const fallback = `Your ${body.tools?.length || 0} AI tools are costing $${body.totalSpend?.toLocaleString() || 0}/mo. Our engine identified $${body.monthlySavings?.toLocaleString() || 0}/mo in recoverable spend — primarily through plan rightsizing and redundancy elimination. Addressing the top recommendation could free up $${((body.monthlySavings || 0) * 12).toLocaleString()}/yr to reinvest in infrastructure that directly serves users.`;
    return NextResponse.json({ summary: fallback }, { status: 200 });
  }
}
