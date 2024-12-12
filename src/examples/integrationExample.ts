async function processBusinessQuery(query: string) {
  // Get CEO response
  const ceoResponse = await openAIService.getCEOResponse(query);
  
  let integratedResponse: IntegratedResponse;
  
  // If CEO determines marketing input is needed
  if (ceoResponse.needsMarketingInput) {
    const cmoResponse = await openAIService.getCMOResponse(
      query, 
      ceoResponse.marketingQuestions
    );
    
    // Integrate both responses
    integratedResponse = ResponseIntegrator.integrate(ceoResponse, cmoResponse);
  } else {
    // Just use CEO response
    integratedResponse = ResponseIntegrator.integrate(ceoResponse);
  }
  
  // Format for display/storage
  const formattedResponse = ResponseIntegrator.formatIntegratedResponse(integratedResponse);
  
  return {
    structured: integratedResponse,
    formatted: formattedResponse
  };
} 