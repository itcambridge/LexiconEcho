import { CEOResponse, CMOResponse } from '../prompts/agentPrompts';
import { AgentType } from '../types/Agent';

export const mockCEOResponse: CEOResponse = {
  agentType: AgentType.Strategy,
  summary: "Strategic analysis of European market expansion opportunity",
  keyTakeaways: [
    "Strong growth metrics indicate readiness for expansion",
    "European market presents significant opportunity",
    "Need marketing expertise for regional adaptation"
  ],
  initialAnalysis: "Company shows strong fundamentals with 15% MoM growth and solid presence in North America. European expansion represents a significant growth opportunity.",
  needsMarketingInput: true,
  marketingQuestions: [
    "What are the key differences in marketing approach needed for European markets?",
    "How should we position our brand differently in Europe?",
    "What localization strategies would be most effective for each target market?"
  ],
  strategicDirection: [
    "Focus on UK market initially as English-speaking gateway",
    "Establish local partnerships in Germany and France",
    "Build regional team with market expertise"
  ],
  vision: "Become a leading global B2B SaaS provider in project management",
  risks: [
    "GDPR and data privacy compliance",
    "Cultural and language barriers",
    "Local competition in established markets"
  ],
  recommendations: [
    "Start with UK market entry within 3 months",
    "Hire local leadership team",
    "Adapt product for European requirements"
  ],
  actionPlan: {
    immediate: [
      "Conduct detailed market research in target countries",
      "Begin GDPR compliance process",
      "Identify potential local partners"
    ],
    shortTerm: [
      "Establish UK office and initial team",
      "Localize product for UK market",
      "Develop EU-specific marketing strategy"
    ],
    longTerm: [
      "Expand to Germany and France",
      "Build full regional support infrastructure",
      "Develop EU-wide partner network"
    ]
  },
  confidence: 0.85
};

export const mockCMOResponse: CMOResponse = {
  agentType: AgentType.Marketing,
  summary: "Marketing strategy for European expansion",
  keyTakeaways: [
    "Need localized marketing approach for each market",
    "Different value propositions required per region",
    "Strong emphasis on data privacy and security"
  ],
  marketingAnalysis: "European B2B SaaS market requires distinct approach with focus on compliance, security, and local business practices",
  marketOpportunities: [
    "Growing demand for modern PM solutions",
    "Less saturated market than US",
    "Strong digital transformation trends"
  ],
  marketStrategy: [
    "Lead with GDPR compliance and data security",
    "Emphasize local support and understanding",
    "Build market-specific case studies"
  ],
  risks: [
    "Brand perception as US company",
    "Complex competitive landscape",
    "Varying market maturity levels"
  ],
  recommendations: [
    "Develop country-specific campaigns",
    "Partner with local industry influencers",
    "Create EU-focused content strategy"
  ],
  metrics: {
    kpis: [
      "Market penetration rate per country",
      "Brand awareness in target segments",
      "Lead conversion rates"
    ],
    targets: [
      "10% market share in UK within 12 months",
      "80% brand recognition in target segments",
      "15% conversion rate on EU leads"
    ],
    timeline: "12-18 months for full implementation"
  },
  confidence: 0.8
}; 