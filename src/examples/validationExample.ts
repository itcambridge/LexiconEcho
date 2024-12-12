import { ResponseValidator } from '../services/ResponseValidator';

async function validateAndProcessResponse(integratedResponse: IntegratedResponse) {
  try {
    // Validate the response
    ResponseValidator.validateIntegratedResponse(integratedResponse);
    
    // Check for potential issues
    const warnings = ResponseValidator.checkForDuplicates(integratedResponse);
    if (warnings.length > 0) {
      console.warn('Validation warnings:', warnings);
    }
    
    // Process the validated response
    return {
      isValid: true,
      warnings,
      response: integratedResponse
    };
  } catch (error) {
    if (error instanceof ResponseValidator.ValidationError) {
      console.error('Validation errors:', error.errors);
      return {
        isValid: false,
        errors: error.errors,
        response: null
      };
    }
    throw error;
  }
} 