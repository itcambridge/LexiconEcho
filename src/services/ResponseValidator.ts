import { IntegratedResponse } from './ResponseIntegrator';
import { AgentType } from '../types/Agent';

export class ResponseValidator {
  // Validation error structure
  static ValidationError = class extends Error {
    constructor(public errors: string[]) {
      super('Response validation failed');
    }
  };

  // Main validation method
  static validateIntegratedResponse(response: IntegratedResponse): boolean {
    const errors: string[] = [];

    // Required fields validation
    this.validateRequiredFields(response, errors);
    
    // Data type and structure validation
    this.validateDataTypes(response, errors);
    
    // Business logic validation
    this.validateBusinessLogic(response, errors);

    if (errors.length > 0) {
      throw new this.ValidationError(errors);
    }

    return true;
  }

  private static validateRequiredFields(response: IntegratedResponse, errors: string[]) {
    type RequiredField = keyof Required<IntegratedResponse>;
    
    // Check required base fields
    const requiredFields: RequiredField[] = [
      'summaries',
      'overallConfidence',
      'keyTakeaways',
      'consolidatedRisks',
      'vision',
      'strategicDirection',
      'masterActionPlan',
      'contributingAgents',
      'timestamp'
    ];

    requiredFields.forEach(field => {
      if (response[field] === undefined) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Check required nested fields
    if (response.masterActionPlan) {
      type TimeframeKey = keyof typeof response.masterActionPlan;
      const timeframes: TimeframeKey[] = ['immediate', 'shortTerm', 'longTerm'];
      
      timeframes.forEach(timeframe => {
        if (!response.masterActionPlan[timeframe]) {
          errors.push(`Missing required action plan timeframe: ${timeframe}`);
        }
      });
    }
  }

  private static validateDataTypes(response: IntegratedResponse, errors: string[]) {
    // Validate types and structures
    if (typeof response.overallConfidence !== 'number' || 
        response.overallConfidence < 0 || 
        response.overallConfidence > 1) {
      errors.push('Overall confidence must be a number between 0 and 1');
    }

    if (!(response.timestamp instanceof Date)) {
      errors.push('Timestamp must be a valid Date object');
    }

    if (!Array.isArray(response.keyTakeaways)) {
      errors.push('Key takeaways must be an array');
    }

    if (!Array.isArray(response.consolidatedRisks)) {
      errors.push('Consolidated risks must be an array');
    }

    // Validate marketing strategy structure if present
    if (response.marketingStrategy) {
      const { metrics } = response.marketingStrategy;
      if (!metrics.kpis || !Array.isArray(metrics.kpis)) {
        errors.push('Marketing metrics KPIs must be an array');
      }
      if (!metrics.targets || !Array.isArray(metrics.targets)) {
        errors.push('Marketing metrics targets must be an array');
      }
      if (typeof metrics.timeline !== 'string') {
        errors.push('Marketing metrics timeline must be a string');
      }
    }
  }

  private static validateBusinessLogic(response: IntegratedResponse, errors: string[]) {
    // Validate confidence thresholds
    if (response.overallConfidence < 0.4) {
      errors.push('Overall confidence is too low for a reliable response');
    }

    // Validate minimum content requirements
    if (response.keyTakeaways.length === 0) {
      errors.push('Must have at least one key takeaway');
    }

    if (response.strategicDirection.length === 0) {
      errors.push('Must have at least one strategic direction');
    }

    // Validate action plan content
    const { immediate, shortTerm, longTerm } = response.masterActionPlan;
    if (immediate.length === 0 && shortTerm.length === 0 && longTerm.length === 0) {
      errors.push('Action plan must contain at least one action item');
    }

    // Validate contributing agents
    if (!response.contributingAgents.includes(AgentType.Strategy)) {
      errors.push('Strategy agent must be included in contributing agents');
    }

    // Validate marketing strategy consistency
    if (response.contributingAgents.includes(AgentType.Marketing)) {
      if (!response.marketingStrategy) {
        errors.push('Marketing strategy must be present when Marketing agent contributes');
      }
    }
  }

  // Utility method to check for duplicate content
  static checkForDuplicates(response: IntegratedResponse): string[] {
    const warnings: string[] = [];
    
    // Check for duplicate takeaways
    const duplicateTakeaways = this.findDuplicates(response.keyTakeaways);
    if (duplicateTakeaways.length > 0) {
      warnings.push(`Duplicate key takeaways found: ${duplicateTakeaways.join(', ')}`);
    }

    // Check for duplicate risks
    const duplicateRisks = this.findDuplicates(response.consolidatedRisks);
    if (duplicateRisks.length > 0) {
      warnings.push(`Duplicate risks found: ${duplicateRisks.join(', ')}`);
    }

    return warnings;
  }

  private static findDuplicates(array: string[]): string[] {
    return array.filter((item, index) => array.indexOf(item) !== index);
  }
} 