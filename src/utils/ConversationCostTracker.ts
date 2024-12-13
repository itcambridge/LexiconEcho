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

  static generateReport(): any {
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalTokens = 0;
    let totalCost = 0;
    const executiveUsage: Record<string, any> = {};

    // Calculate totals and group by executive
    this.usage.forEach((data) => {
      totalPromptTokens += data.prompt_tokens;
      totalCompletionTokens += data.completion_tokens;
      totalTokens += data.total_tokens;
      totalCost += data.cost;

      if (!executiveUsage[data.agent]) {
        executiveUsage[data.agent] = {
          model: data.model,
          tokens: data.total_tokens,
          prompt_tokens: data.prompt_tokens,
          completion_tokens: data.completion_tokens,
          cost: data.cost
        };
      } else {
        executiveUsage[data.agent].tokens += data.total_tokens;
        executiveUsage[data.agent].prompt_tokens += data.prompt_tokens;
        executiveUsage[data.agent].completion_tokens += data.completion_tokens;
        executiveUsage[data.agent].cost += data.cost;
      }
    });

    // Format the report
    const report = {
      total_tokens: totalTokens,
      prompt_tokens: totalPromptTokens,
      completion_tokens: totalCompletionTokens,
      total_cost: totalCost,
      executive_breakdown: executiveUsage
    };

    // Clear usage for next conversation
    this.usage = [];

    return report;
  }
} 