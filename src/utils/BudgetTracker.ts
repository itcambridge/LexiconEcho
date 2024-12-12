export class BudgetTracker {
  private static dailyUsage: number = 0;
  private static lastReset: Date = new Date();
  private static readonly DAILY_BUDGET = 5.00; // $5 daily budget

  static trackUsage(cost: number): void {
    // Reset daily usage if it's a new day
    const now = new Date();
    if (now.getDate() !== this.lastReset.getDate()) {
      this.dailyUsage = 0;
      this.lastReset = now;
    }

    this.dailyUsage += cost;

    // Log usage
    console.log(`Daily usage: $${this.dailyUsage.toFixed(2)} / $${this.DAILY_BUDGET.toFixed(2)}`);

    // Warn if approaching budget
    if (this.dailyUsage > this.DAILY_BUDGET * 0.8) {
      console.warn(`Warning: Approaching daily budget limit (${((this.dailyUsage / this.DAILY_BUDGET) * 100).toFixed(1)}%)`);
    }
  }

  static checkBudget(): boolean {
    return this.dailyUsage < this.DAILY_BUDGET;
  }
} 