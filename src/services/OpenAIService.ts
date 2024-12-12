import OpenAI from 'openai';
import dotenv from 'dotenv';
import { CEOResponse, CMOResponse, CTOResponse, CSOResponse, CDOResponse, CXOResponse, CCOResponse } from '../prompts/agentPrompts';
import { PromptBuilder } from '../utils/promptBuilder';
import { RateLimiter } from '../utils/rateLimiter';
import { CostEstimator } from '../utils/costEstimator';
import { ConversationCostTracker } from '../utils/ConversationCostTracker';

dotenv.config();

interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  backoffFactor: number;
}

export class OpenAIService {
  private openai: OpenAI;
  private rateLimiter: RateLimiter;
  private retryConfig: RetryConfig;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({ 
      apiKey: apiKey || process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: process.env.NODE_ENV === 'development'
    });
    
    this.rateLimiter = new RateLimiter({
      tokensPerMinute: 60000,
      maxParallelRequests: 3
    });

    this.retryConfig = {
      maxRetries: 3,
      delayMs: 1000,
      backoffFactor: 2
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof Error) {
        // Check if it's a rate limit error
        if ('status' in error && (error['status'] === 429 || error['status'] === 503)) {
          if (retryCount < this.retryConfig.maxRetries) {
            const delayTime = this.retryConfig.delayMs * Math.pow(this.retryConfig.backoffFactor, retryCount);
            console.log(`Rate limited. Retrying in ${delayTime}ms...`);
            await this.delay(delayTime);
            return this.retryWithBackoff(operation, retryCount + 1);
          }
        }
        
        // Check if it's a quota error
        if ('code' in error && error['code'] === 'insufficient_quota') {
          throw new Error('OpenAI API quota exceeded. Please check your billing details.');
        }
      }
      throw error;
    }
  }

  async getCEOResponse(query: string): Promise<CEOResponse & { usage: any }> {
    await this.rateLimiter.waitForToken();
    
    try {
      const response = await this.retryWithBackoff(async () => {
        const prompt = PromptBuilder.buildStrategyPrompt(query);
        const completion = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { 
              role: "system", 
              content: "You are a CEO providing strategic business advice." 
            },
            { 
              role: "user", 
              content: prompt 
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        });

        const usage = completion.usage;
        const cost = usage ? CostEstimator.estimateCost('gpt-4', usage.prompt_tokens, usage.completion_tokens) : 0;

        // Track usage
        if (usage) {
          ConversationCostTracker.trackUsage({
            prompt_tokens: usage.prompt_tokens,
            completion_tokens: usage.completion_tokens,
            total_tokens: usage.total_tokens,
            cost,
            model: 'gpt-4',
            agent: 'CEO'
          });
        }

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) {
          throw new Error('No response from OpenAI');
        }

        const parsedResponse = this.parseCEOResponse(responseText);
        return {
          ...parsedResponse,
          usage: {
            prompt_tokens: usage?.prompt_tokens,
            completion_tokens: usage?.completion_tokens,
            total_tokens: usage?.total_tokens,
            estimated_cost: cost
          }
        };
      });

      this.rateLimiter.releaseToken();
      return response;
    } catch (error) {
      this.rateLimiter.releaseToken();
      console.error('Error getting CEO response:', error);
      throw error;
    }
  }

  async getCMOResponse(query: string, strategicQuestions: string[]): Promise<CMOResponse> {
    await this.rateLimiter.waitForToken();
    
    try {
      const prompt = PromptBuilder.buildMarketingPrompt(query, strategicQuestions.join('\n'));
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: "You are a CMO providing marketing strategy advice." 
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const usage = completion.usage;
      if (usage) {
        const cost = CostEstimator.estimateCost('gpt-4', usage.prompt_tokens, usage.completion_tokens);
        ConversationCostTracker.trackUsage({
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
          total_tokens: usage.total_tokens,
          cost,
          model: 'gpt-4',
          agent: 'CMO'
        });
      }

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error('No response from OpenAI');
      }

      return this.parseCMOResponse(responseText);
    } catch (error) {
      console.error('Error getting CMO response:', error);
      throw error;
    }
  }

  async getCTOResponse(query: string, companyContext?: CompanyContext): Promise<CTOResponse & { usage: any }> {
    await this.rateLimiter.waitForToken();
    
    try {
      const response = await this.retryWithBackoff(async () => {
        const prompt = PromptBuilder.buildTechnicalPrompt(query, companyContext);
        const completion = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { 
              role: "system", 
              content: "You are a CTO providing technical strategy advice. Always respond with properly formatted JSON matching the specified structure. Do not include any text outside the JSON object." 
            },
            { 
              role: "user", 
              content: prompt 
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });

        const usage = completion.usage;
        const cost = usage ? CostEstimator.estimateCost('gpt-4', usage.prompt_tokens, usage.completion_tokens) : 0;

        // Track usage
        if (usage) {
          ConversationCostTracker.trackUsage({
            prompt_tokens: usage.prompt_tokens,
            completion_tokens: usage.completion_tokens,
            total_tokens: usage.total_tokens,
            cost,
            model: 'gpt-4',
            agent: 'CTO'
          });
        }

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) {
          throw new Error('No response from OpenAI');
        }

        try {
          console.log('Parsing CTO response...');
          const parsedResponse = this.parseCTOResponse(responseText);
          return {
            ...parsedResponse,
            usage: {
              prompt_tokens: usage?.prompt_tokens,
              completion_tokens: usage?.completion_tokens,
              total_tokens: usage?.total_tokens,
              estimated_cost: cost
            }
          };
        } catch (error) {
          console.error('Raw CTO response:', responseText);
          throw error;
        }
      });

      return response;
    } catch (error) {
      console.error('Error getting CTO response:', error);
      throw error;
    }
  }

  async getCSOResponse(query: string, companyContext: CompanyContext): Promise<CSOResponse & { usage: any }> {
    await this.rateLimiter.waitForToken();
    
    try {
      const response = await this.retryWithBackoff(async () => {
        const prompt = PromptBuilder.buildSalesPrompt(query, companyContext);
        const completion = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { 
              role: "system", 
              content: "You are a CSO providing sales strategy advice." 
            },
            { 
              role: "user", 
              content: prompt 
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });

        const usage = completion.usage;
        const cost = usage ? CostEstimator.estimateCost('gpt-4', usage.prompt_tokens, usage.completion_tokens) : 0;

        // Track usage
        if (usage) {
          ConversationCostTracker.trackUsage({
            prompt_tokens: usage.prompt_tokens,
            completion_tokens: usage.completion_tokens,
            total_tokens: usage.total_tokens,
            cost,
            model: 'gpt-4',
            agent: 'CSO'
          });
        }

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) {
          throw new Error('No response from OpenAI');
        }

        const parsedResponse = this.parseCSOResponse(responseText);
        return {
          ...parsedResponse,
          usage: {
            prompt_tokens: usage?.prompt_tokens,
            completion_tokens: usage?.completion_tokens,
            total_tokens: usage?.total_tokens,
            estimated_cost: cost
          }
        };
      });

      this.rateLimiter.releaseToken();
      return response;
    } catch (error) {
      this.rateLimiter.releaseToken();
      console.error('Error getting CSO response:', error);
      throw error;
    }
  }

  async getCDOResponse(query: string, companyContext?: CompanyContext): Promise<CDOResponse & { usage: any }> {
    await this.rateLimiter.waitForToken();
    
    try {
      const response = await this.retryWithBackoff(async () => {
        const prompt = PromptBuilder.buildDevelopmentPrompt(query, companyContext);
        const completion = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { 
              role: "system", 
              content: "You are a CDO providing product development and innovation strategy advice. Always respond with properly formatted JSON matching the specified structure." 
            },
            { 
              role: "user", 
              content: prompt 
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });

        const usage = completion.usage;
        const cost = usage ? CostEstimator.estimateCost('gpt-4', usage.prompt_tokens, usage.completion_tokens) : 0;

        // Track usage
        if (usage) {
          ConversationCostTracker.trackUsage({
            prompt_tokens: usage.prompt_tokens,
            completion_tokens: usage.completion_tokens,
            total_tokens: usage.total_tokens,
            cost,
            model: 'gpt-4',
            agent: 'CDO'
          });
        }

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) {
          throw new Error('No response from OpenAI');
        }

        const parsedResponse = this.parseCDOResponse(responseText);
        return {
          ...parsedResponse,
          usage: {
            prompt_tokens: usage?.prompt_tokens,
            completion_tokens: usage?.completion_tokens,
            total_tokens: usage?.total_tokens,
            estimated_cost: cost
          }
        };
      });

      this.rateLimiter.releaseToken();
      return response;
    } catch (error) {
      this.rateLimiter.releaseToken();
      console.error('Error getting CDO response:', error);
      throw error;
    }
  }

  async getCXOResponse(query: string, companyContext?: CompanyContext): Promise<CXOResponse & { usage: any }> {
    await this.rateLimiter.waitForToken();
    
    try {
      const response = await this.retryWithBackoff(async () => {
        const prompt = PromptBuilder.buildExpansionPrompt(query, companyContext);
        const completion = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { 
              role: "system", 
              content: "You are a CXO providing executive strategy advice." 
            },
            { 
              role: "user", 
              content: prompt 
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });

        const usage = completion.usage;
        const cost = usage ? CostEstimator.estimateCost('gpt-4', usage.prompt_tokens, usage.completion_tokens) : 0;

        // Track usage
        if (usage) {
          ConversationCostTracker.trackUsage({
            prompt_tokens: usage.prompt_tokens,
            completion_tokens: usage.completion_tokens,
            total_tokens: usage.total_tokens,
            cost,
            model: 'gpt-4',
            agent: 'CXO'
          });
        }

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) {
          throw new Error('No response from OpenAI');
        }

        const parsedResponse = this.parseCXOResponse(responseText);
        return {
          ...parsedResponse,
          usage: {
            prompt_tokens: usage?.prompt_tokens,
            completion_tokens: usage?.completion_tokens,
            total_tokens: usage?.total_tokens,
            estimated_cost: cost
          }
        };
      });

      this.rateLimiter.releaseToken();
      return response;
    } catch (error) {
      this.rateLimiter.releaseToken();
      console.error('Error getting CXO response:', error);
      throw error;
    }
  }

  async getCCOResponse(query: string, companyContext: CompanyContext): Promise<CCOResponse & { usage: any }> {
    await this.rateLimiter.waitForToken();
    
    try {
      const response = await this.retryWithBackoff(async () => {
        const prompt = PromptBuilder.buildCustomerSuccessPrompt(query, companyContext);
        const completion = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { 
              role: "system", 
              content: "You are a CCO providing customer success strategy advice." 
            },
            { 
              role: "user", 
              content: prompt 
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });

        const usage = completion.usage;
        const cost = usage ? CostEstimator.estimateCost('gpt-4', usage.prompt_tokens, usage.completion_tokens) : 0;

        // Track usage
        if (usage) {
          ConversationCostTracker.trackUsage({
            prompt_tokens: usage.prompt_tokens,
            completion_tokens: usage.completion_tokens,
            total_tokens: usage.total_tokens,
            cost,
            model: 'gpt-4',
            agent: 'CCO'
          });
        }

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) {
          throw new Error('No response from OpenAI');
        }

        const parsedResponse = this.parseCCOResponse(responseText);
        return {
          ...parsedResponse,
          usage: {
            prompt_tokens: usage?.prompt_tokens,
            completion_tokens: usage?.completion_tokens,
            total_tokens: usage?.total_tokens,
            estimated_cost: cost
          }
        };
      });

      this.rateLimiter.releaseToken();
      return response;
    } catch (error) {
      this.rateLimiter.releaseToken();
      console.error('Error getting CCO response:', error);
      throw error;
    }
  }

  async getFinalSynthesis(ceoResponse: any, consultations: any[]): Promise<any> {
    await this.rateLimiter.waitForToken();
    
    try {
      const response = await this.retryWithBackoff(async () => {
        const synthesisPrompt = `
          You are the CEO synthesizing insights from your executive team's responses.
          Your task is to integrate their perspectives and provide a final strategic direction.
          Do not generate new consultations - focus on synthesizing the existing responses.

          Original Analysis:
          ${JSON.stringify(ceoResponse, null, 2)}

          Executive Consultations:
          ${consultations.map(c => `
            ${c.title}:
            ${JSON.stringify(c.response, null, 2)}
          `).join('\n')}

          Provide a synthesis in this exact JSON format:
          {
            "summary": "Brief synthesis of all inputs",
            "keyTakeaways": ["Key integrated insights"],
            "executiveAlignment": {
              "agreements": ["Points where executives align"],
              "differences": ["Areas of differing perspectives"],
              "synergies": ["Opportunities for cross-functional collaboration"]
            },
            "integratedStrategy": ["Combined strategic recommendations"],
            "implementationPlan": {
              "immediate": ["Priority actions"],
              "shortTerm": ["30-90 day initiatives"],
              "longTerm": ["Long-term objectives"]
            }
          }
        `;

        const completion = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { 
              role: "system", 
              content: "You are the CEO providing final synthesis of executive inputs." 
            },
            { 
              role: "user", 
              content: synthesisPrompt 
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });

        const usage = completion.usage;
        const cost = usage ? CostEstimator.estimateCost('gpt-4', usage.prompt_tokens, usage.completion_tokens) : 0;

        // Track synthesis usage
        if (usage) {
          ConversationCostTracker.trackUsage({
            prompt_tokens: usage.prompt_tokens,
            completion_tokens: usage.completion_tokens,
            total_tokens: usage.total_tokens,
            cost,
            model: 'gpt-4',
            agent: 'CEO-Synthesis'
          });
        }

        console.log('Synthesis completed. Generating final report...');

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) {
          throw new Error('No response from OpenAI for synthesis');
        }

        try {
          const parsedResponse = JSON.parse(responseText);
          return parsedResponse;
        } catch (error) {
          console.error('Error parsing synthesis response:', error);
          throw new Error('Failed to parse synthesis response');
        }
      });

      return response;
    } catch (error) {
      console.error('Error in final synthesis:', error);
      throw error;
    }
  }

  private parseCEOResponse(responseText: string): CEOResponse {
    try {
      const parsed = JSON.parse(responseText);
      // Add validation here if needed
      return parsed as CEOResponse;
    } catch (error) {
      console.error('Error parsing CEO response:', error);
      throw new Error('Failed to parse CEO response');
    }
  }

  private parseCMOResponse(responseText: string): CMOResponse {
    try {
      const parsed = JSON.parse(responseText);
      // Add validation here if needed
      return parsed as CMOResponse;
    } catch (error) {
      console.error('Error parsing CMO response:', error);
      throw new Error('Failed to parse CMO response');
    }
  }

  private parseCTOResponse(responseText: string): CTOResponse {
    try {
      // Try to clean the response if it contains any text outside JSON
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        responseText = responseText.slice(jsonStart, jsonEnd + 1);
      }
      
      const parsed = JSON.parse(responseText);
      return parsed as CTOResponse;
    } catch (error) {
      console.error('Error parsing CTO response:', error);
      throw new Error('Failed to parse CTO response');
    }
  }

  private parseCSOResponse(responseText: string): CSOResponse {
    try {
      const parsed = JSON.parse(responseText);
      // Add validation here if needed
      return parsed as CSOResponse;
    } catch (error) {
      console.error('Error parsing CSO response:', error);
      throw new Error('Failed to parse CSO response');
    }
  }

  private parseCDOResponse(responseText: string): CDOResponse {
    try {
      const parsed = JSON.parse(responseText);
      // Add validation here if needed
      return parsed as CDOResponse;
    } catch (error) {
      console.error('Error parsing CDO response:', error);
      throw new Error('Failed to parse CDO response');
    }
  }

  private parseCXOResponse(responseText: string): CXOResponse {
    try {
      const parsed = JSON.parse(responseText);
      // Add validation here if needed
      return parsed as CXOResponse;
    } catch (error) {
      console.error('Error parsing CXO response:', error);
      throw new Error('Failed to parse CXO response');
    }
  }

  private parseCCOResponse(responseText: string): CCOResponse {
    try {
      const parsed = JSON.parse(responseText);
      // Add validation here if needed
      return parsed as CCOResponse;
    } catch (error) {
      console.error('Error parsing CCO response:', error);
      throw new Error('Failed to parse CCO response');
    }
  }
} 