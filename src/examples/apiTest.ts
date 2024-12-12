import { OpenAIService } from '../services/OpenAIService';
import { ResponseIntegrator } from '../services/ResponseIntegrator';
import { ResponseValidator } from '../services/ResponseValidator';
import dotenv from 'dotenv';
import { ConversationCostTracker } from '../utils/ConversationCostTracker';

dotenv.config();

async function testAgentResponses() {
  const openAIService = new OpenAIService(process.env.OPENAI_API_KEY!);
  
  // Test business query with more specific context
  const query = `
    We are a B2B SaaS company providing project management software. 
    Current metrics:
    - Revenue: $5M ARR
    - Growth: 15% month over month
    - Current markets: US and Canada
    - Team size: 50 employees
    
    We're considering expansion into the European market, specifically starting with UK, Germany, and France.
    What should be our strategy for this international expansion?
  `;

  try {
    // Get CEO response
    console.log('Getting CEO response...');
    const ceoResponse = await openAIService.getCEOResponse(query);
    console.log('\nCEO Response:', JSON.stringify(ceoResponse, null, 2));

    // If marketing input is needed
    if (ceoResponse.needsMarketingInput) {
      console.log('\nGetting CMO response...');
      const cmoResponse = await openAIService.getCMOResponse(
        query,
        ceoResponse.marketingQuestions
      );
      console.log('\nCMO Response:', JSON.stringify(cmoResponse, null, 2));

      // Integrate responses
      console.log('\nIntegrating responses...');
      const integratedResponse = ResponseIntegrator.integrate(ceoResponse, cmoResponse);

      // Validate integrated response
      console.log('\nValidating integrated response...');
      await ResponseValidator.validateIntegratedResponse(integratedResponse);

      // Format final response
      console.log('\nFormatted Response:');
      console.log(ResponseIntegrator.formatIntegratedResponse(integratedResponse));

      // End conversation and show final costs
      ConversationCostTracker.endConversation();
      
      return integratedResponse;
    } else {
      // Just use CEO response
      const integratedResponse = ResponseIntegrator.integrate(ceoResponse);
      console.log('\nFormatted Response:');
      console.log(ResponseIntegrator.formatIntegratedResponse(integratedResponse));

      // End conversation and show final costs
      ConversationCostTracker.endConversation();
      
      return integratedResponse;
    }
  } catch (error) {
    console.error('Error in test:', error);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testAgentResponses()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
} 