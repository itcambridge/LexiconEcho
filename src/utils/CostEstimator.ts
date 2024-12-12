export class CostEstimator {
  private static readonly COSTS = {
    'gpt-4': {
      prompt: 0.03,    // $0.03 per 1K tokens
      completion: 0.06 // $0.06 per 1K tokens
    },
    'gpt-3.5-turbo': {
      prompt: 0.0015,
      completion: 0.002
    }
  };

  static estimateCost(model: string, promptTokens: number, completionTokens: number): number {
    const costs = this.COSTS[model as keyof typeof this.COSTS];
    if (!costs) return 0;

    return (
      (promptTokens * costs.prompt) / 1000 +
      (completionTokens * costs.completion) / 1000
    );
  }
} 