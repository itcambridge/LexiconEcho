import { AgentType } from '../types/Agent';

export interface BaseResponse {
  summary: string;
  keyTakeaways: string[];
  recommendations: string[];
}

export interface CEOResponse extends BaseResponse {
  strategicDirection: string[];
  actionPlan: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  risks: string[];
}

export interface CMOResponse extends BaseResponse {
  marketAnalysis: string;
  marketOpportunities: string[];
  marketStrategy: string[];
  metrics: {
    kpis: string[];
    targets: string[];
    timeline: string;
  };
  valueProposition?: string;
  targetAudience?: {
    primary: string[];
    secondary: string[];
  };
  implementationSteps?: string[];
}

export interface CTOResponse extends BaseResponse {
  technicalAnalysis: string;
  digitalTransformation: {
    currentState: string;
    vision: string;
    roadmap: string[];
  };
  architectureStrategy: {
    current: string;
    target: string;
    gaps: string[];
  };
  technologyStack: {
    assessment: string[];
    recommendations: string[];
    priorities: string[];
  };
  innovationOpportunities: {
    emerging: string[];
    disruption: string[];
    competitive: string[];
  };
  implementationPlan: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  riskAssessment: {
    technical: string[];
    security: string[];
    scalability: string[];
    mitigation: string[];
  };
}

export interface CDOResponse extends BaseResponse {
  developmentStrategy: string;
  innovationOpportunities: string[];
  marketFit: {
    currentState: string;
    futureVision: string;
    gaps: string[];
  };
  productRoadmap: {
    discovery: string[];
    validation: string[];
    scaling: string[];
  };
  experimentationPlan: {
    hypotheses: string[];
    tests: string[];
    metrics: string[];
  };
  pivotConsiderations?: string[];
}

export interface CFOResponse extends BaseResponse {
  financialAnalysis: {
    currentState: string;
    keyMetrics: string[];
    risks: string[];
  };
  valuationAssessment: {
    drivers: string[];
    growth: string;
    risks: string[];
  };
  fundingStrategy: {
    options: string[];
    recommendations: string[];
    timeline: string;
  };
  financialPlanning: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
  capitalAllocation: {
    priorities: string[];
    rationale: string;
    metrics: string[];
  };
  riskManagement: {
    identified: string[];
    mitigation: string[];
    monitoring: string[];
  };
}

export interface COOResponse extends BaseResponse {
  operationsAnalysis: {
    currentState: string;
    bottlenecks: string[];
    efficiencies: string[];
  };
  supplyChain: {
    assessment: string;
    optimization: string[];
    risks: string[];
  };
  processImprovement: {
    priorities: string[];
    methodology: string;
    metrics: string[];
  };
  resourceAllocation: {
    current: string;
    optimization: string[];
    constraints: string[];
  };
  qualityManagement: {
    standards: string[];
    controls: string[];
    improvements: string[];
  };
  operationalPlan: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  sustainability: {
    initiatives: string[];
    metrics: string[];
    impact: string;
  };
}

export interface CPOResponse extends BaseResponse {
  productVision: {
    currentState: string;
    futureState: string;
    keyPrinciples: string[];
  };
  userExperience: {
    analysis: string;
    painPoints: string[];
    opportunities: string[];
  };
  productStrategy: {
    core: string;
    differentiation: string[];
    marketFit: string;
  };
  habitFormation: {
    triggers: string[];
    actions: string[];
    rewards: string[];
    investment: string[];
  };
  designPrinciples: {
    usability: string[];
    accessibility: string[];
    feedback: string[];
  };
  roadmap: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  metrics: {
    engagement: string[];
    retention: string[];
    satisfaction: string[];
  };
}

export interface CSOResponse extends BaseResponse {
  salesAnalysis: {
    currentState: string;
    performance: string[];
    challenges: string[];
  };
  salesStrategy: {
    approach: string;
    methodology: string[];
    targets: string[];
  };
  persuasionPrinciples: {
    reciprocity: string[];
    commitment: string[];
    social: string[];
    authority: string[];
    scarcity: string[];
  };
  salesProcess: {
    prospecting: string[];
    engagement: string[];
    closing: string[];
    retention: string[];
  };
  teamDevelopment: {
    training: string[];
    motivation: string[];
    metrics: string[];
  };
  implementation: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  metrics: {
    pipeline: string[];
    conversion: string[];
    revenue: string[];
  };
}

export interface CXOResponse extends BaseResponse {
  marketExpansion: {
    currentMarkets: string[];
    opportunities: string[];
    blueOceans: string[];
  };
  growthStrategy: {
    organic: string[];
    partnerships: string[];
    acquisitions: string[];
  };
  scalingFramework: {
    people: string[];
    strategy: string[];
    execution: string[];
    cash: string[];
  };
  transformationPlan: {
    culture: string[];
    capabilities: string[];
    technology: string[];
  };
  expansionRoadmap: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  riskAssessment: {
    market: string[];
    operational: string[];
    competitive: string[];
    mitigation: string[];
  };
  successMetrics: {
    growth: string[];
    penetration: string[];
    efficiency: string[];
  };
}

export const StrategyAgentPrompt = `
You are the Chief Executive Officer (CEO) of our organization. You are a visionary leader and polymath genius with expertise in multiple fields, focused on overall company direction, strategic decision-making, and sustainable growth.

Your influences include:
- Tony Hsieh (Delivering Happiness) - Customer service excellence and building extraordinary company culture
- William N. Thorndike (The Outsiders) - Capital allocation mastery and unconventional leadership wisdom
- Frank Slootman (Amp It Up) - High-performance leadership and operational excellence at scale

Your core responsibilities:
1. Provide visionary leadership and strategic direction
2. Analyze business challenges from a holistic perspective
3. Make high-impact decisions considering all stakeholders
4. Coordinate with other C-Suite executives for specialized expertise
5. Synthesize information into clear, actionable direction

You can consult with:
- Chief Marketing Officer (CMO) for marketing and brand strategy
- Chief Financial Officer (CFO) for financial and investment decisions
- Chief Technology Officer (CTO) for technical and digital transformation
- Chief Operations Officer (COO) for operational excellence
- Chief Human Resources Officer (CHRO) for people and culture
- Chief Compliance Officer (CCO) for regulatory and governance
- Chief Sales Officer (CSO) for revenue and customer relationships
- Chief Expansion Officer (CXO) for growth and market expansion
- Chief Development Officer (CDO) for product and innovation

When responding, please structure your thoughts as follows:
{
  "summary": "Brief executive summary of the situation",
  "keyTakeaways": ["Key points that other agents should know"],
  "initialAnalysis": "Your CEO-level assessment of the situation",
  "executivesToConsult": [
    "Chief Marketing Officer",
    "Chief Financial Officer"
    // ... other executives as needed
  ],
  "strategicDirection": ["Key strategic decisions and directives"],
  "risks": ["Potential risks and challenges"],
  "recommendations": ["High-level recommendations"],
  "actionPlan": {
    "immediate": ["Actions needed within 30 days"],
    "shortTerm": ["Actions needed within 90 days"],
    "longTerm": ["Actions needed within 1 year"]
  }
}
`;

export const MarketingAgentPrompt = `
You are the Chief Marketing Officer (CMO) of our organization. You are an expert in marketing strategy, brand development, customer acquisition, and market analysis.

Your expertise covers:
- Brand Strategy and Positioning
- Market Research and Analysis
- Customer Journey and Experience
- Digital Marketing and Analytics
- Marketing ROI and Performance Metrics

When responding, please structure your response as follows:
{
  "agentType": "Marketing",
  "summary": "Brief summary of marketing perspective",
  "keyTakeaways": ["Key marketing insights"],
  "marketingAnalysis": "Your assessment from a marketing perspective",
  "marketOpportunities": ["Key opportunities identified"],
  "marketStrategy": ["Strategic marketing approaches"],
  "risks": ["Potential marketing risks and challenges"],
  "recommendations": ["Specific marketing recommendations"],
  "metrics": {
    "kpis": ["Key performance indicators"],
    "targets": ["Specific target values"],
    "timeline": "Expected timeline for results"
  },
  "confidence": number // 0-1 indicating confidence in assessment
}
`; 