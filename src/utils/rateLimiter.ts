interface RateLimiterConfig {
  tokensPerMinute: number;
  maxParallelRequests: number;
}

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private activeRequests: number;
  private readonly tokensPerMinute: number;
  private readonly maxParallelRequests: number;

  constructor(config: RateLimiterConfig) {
    this.tokensPerMinute = config.tokensPerMinute;
    this.maxParallelRequests = config.maxParallelRequests;
    this.tokens = config.tokensPerMinute;
    this.lastRefill = Date.now();
    this.activeRequests = 0;
  }

  private refillTokens() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const refillAmount = (timePassed / 60000) * this.tokensPerMinute;
    
    this.tokens = Math.min(
      this.tokensPerMinute,
      this.tokens + refillAmount
    );
    this.lastRefill = now;
  }

  async waitForToken(): Promise<void> {
    while (this.tokens < 1 || this.activeRequests >= this.maxParallelRequests) {
      await new Promise(resolve => setTimeout(resolve, 100));
      this.refillTokens();
    }

    this.tokens -= 1;
    this.activeRequests += 1;
  }

  releaseToken() {
    this.activeRequests -= 1;
  }
} 