interface UsageData {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost: number;
  model: string;
  agent: string;
}

export class ConversationCostTracker {
  private static usage: UsageData[] = [];

  static trackUsage(data: UsageData) {
    this.usage.push(data);
  }

  static generateReport(): string {
    let report = '';
    let totalTokens = 0;
    let totalCost = 0;

    // Group by agent
    const agentUsage = this.usage.reduce((acc, curr) => {
      if (!acc[curr.agent]) {
        acc[curr.agent] = {
          model: curr.model,
          tokens: curr.total_tokens,
          prompt_tokens: curr.prompt_tokens,
          completion_tokens: curr.completion_tokens,
          cost: curr.cost
        };
      } else {
        acc[curr.agent].tokens += curr.total_tokens;
        acc[curr.agent].prompt_tokens += curr.prompt_tokens;
        acc[curr.agent].completion_tokens += curr.completion_tokens;
        acc[curr.agent].cost += curr.cost;
      }
      return acc;
    }, {} as Record<string, any>);

    // Generate report
    Object.entries(agentUsage).forEach(([agent, data]) => {
      report += `${agent}:\n`;
      report += `  Model: ${data.model}\n`;
      report += `  Tokens: ${data.tokens} (${data.prompt_tokens} prompt + ${data.completion_tokens} completion)\n`;
      report += `  Cost: $${data.cost.toFixed(4)}\n`;
      
      totalTokens += data.tokens;
      totalCost += data.cost;
    });

    // Add totals
    report += `-------------------------\n`;
    report += `Total Tokens: ${totalTokens}\n`;
    report += `Total Cost: $${totalCost.toFixed(4)}\n`;
    report += `-------------------------`;

    // Clear usage for next conversation
    this.usage = [];

    return report;
  }
} 