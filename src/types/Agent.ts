export enum AgentType {
  Strategy = 'Strategy',
  Marketing = 'Marketing'
}

export interface Agent {
  type: AgentType;
  prompt: string;
  confidence?: number;
}

export interface AgentResponse {
  agentType: AgentType;
  response: string;
  timestamp: Date;
  confidence?: number;
  metadata?: {
    questionAsked: string;
    processingTime: number;
  }
} 