import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIService } from '../../services/OpenAIService';
import { Executive } from '../../types/ExecutiveSuite';
import { ConversationCostTracker } from '../../utils/ConversationCostTracker';

interface ExecutiveStatus {
  title: string;
  isActive: boolean;
  hasResponded: boolean;
  timestamp?: string;
  error?: boolean;
  errorMessage?: string;
}

async function synthesizeResponses(
  ceoResponse: any,
  consultations: Array<{ title: string, response: any }>,
  openAIService: OpenAIService
) {
  return await openAIService.getFinalSynthesis(ceoResponse, consultations);
}

function handleExecutiveError(
  error: any, 
  execTitle: string, 
  executiveStatuses: Record<string, ExecutiveStatus>
) {
  if (error instanceof TypeError && error.message.includes('is not a function')) {
    console.warn(`Implementation missing for ${execTitle}`);
    executiveStatuses[execTitle].error = true;
    executiveStatuses[execTitle].errorMessage = 'Implementation not available';
  } else {
    console.error(`Error consulting ${execTitle}:`, error);
    executiveStatuses[execTitle].error = true;
    executiveStatuses[execTitle].errorMessage = error.message;
  }
  
  executiveStatuses[execTitle].isActive = false;
  executiveStatuses[execTitle].hasResponded = false;
}

async function getExecutiveResponse(
  execTitle: string,
  query: string,
  companyContext: any,
  openAIService: OpenAIService
) {
  console.log(`Getting response from ${execTitle}...`);
  
  switch (execTitle) {
    case 'Chief Marketing Officer':
      return await openAIService.getCMOResponse(query, []);
    case 'Chief Technology Officer':
      return await openAIService.getCTOResponse(query, companyContext);
    case 'Chief Financial Officer':
      return await openAIService.getCFOResponse(query, companyContext);
    case 'Chief Operations Officer':
      return await openAIService.getCOOResponse(query, companyContext);
    case 'Chief Development Officer':
      return await openAIService.getCDOResponse(query, companyContext);
    case 'Chief Expansion Officer':
      return await openAIService.getCXOResponse(query, companyContext);
    case 'Chief Sales Officer':
      return await openAIService.getCSOResponse(query, companyContext);
    case 'Chief Compliance Officer':
      return await openAIService.getCCOResponse(query, companyContext);
    default:
      console.warn(`No implementation for ${execTitle}`);
      return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Enable streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { executive, query, companyContext } = req.body;
    const openAIService = new OpenAIService(process.env.OPENAI_API_KEY);
    
    // Initialize status tracking
    const executiveStatuses: Record<string, ExecutiveStatus> = {
      'Chief Executive Officer': {
        title: 'Chief Executive Officer',
        isActive: true,
        hasResponded: false
      }
    };

    // Send initial status
    res.write(`data: ${JSON.stringify({ type: 'status', executiveStatuses })}\n\n`);

    // Get CEO's response
    console.log('Getting initial CEO analysis...');
    const ceoResponse = await openAIService.getCEOResponse(query);
    
    executiveStatuses['Chief Executive Officer'].isActive = false;
    executiveStatuses['Chief Executive Officer'].hasResponded = true;
    executiveStatuses['Chief Executive Officer'].timestamp = new Date().toISOString();
    
    // Send CEO response
    res.write(`data: ${JSON.stringify({ 
      type: 'response', 
      executive: 'CEO',
      response: ceoResponse,
      executiveStatuses 
    })}\n\n`);

    const executivesToConsult = ceoResponse.executivesToConsult || [];
    console.log('Executives to consult:', executivesToConsult);
    const consultationResults = [];
    
    // Initialize other executives
    executivesToConsult.forEach(exec => {
      executiveStatuses[exec] = {
        title: exec,
        isActive: false,
        hasResponded: false
      };
    });

    // Consult other executives
    for (const execTitle of executivesToConsult) {
      try {
        // Update status
        Object.keys(executiveStatuses).forEach(key => {
          executiveStatuses[key].isActive = (key === execTitle);
        });
        res.write(`data: ${JSON.stringify({ type: 'status', executiveStatuses })}\n\n`);

        // Get response
        const execResponse = await getExecutiveResponse(execTitle, query, companyContext, openAIService);
        
        if (execResponse) {
          const timestamp = new Date().toISOString();
          consultationResults.push({ 
            title: execTitle, 
            response: execResponse,
            timestamp
          });

          // Update status
          executiveStatuses[execTitle].hasResponded = true;
          executiveStatuses[execTitle].isActive = false;
          executiveStatuses[execTitle].timestamp = timestamp;
          
          // Send response
          res.write(`data: ${JSON.stringify({ 
            type: 'response', 
            executive: execTitle,
            response: execResponse,
            executiveStatuses 
          })}\n\n`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        handleExecutiveError(error, execTitle, executiveStatuses);
        res.write(`data: ${JSON.stringify({ type: 'status', executiveStatuses })}\n\n`);
      }
    }

    // Get final synthesis
    console.log('Starting final synthesis...');
    executiveStatuses['Chief Executive Officer'].isActive = true;
    res.write(`data: ${JSON.stringify({ type: 'status', executiveStatuses })}\n\n`);

    const finalSynthesis = await synthesizeResponses(
      ceoResponse,
      consultationResults,
      openAIService
    );

    console.log('Final synthesis completed');
    executiveStatuses['Chief Executive Officer'].isActive = false;

    // Generate cost report
    const costReport = ConversationCostTracker.generateReport();
    console.log('\nCost Report:\n', costReport);

    // Send final response
    res.write(`data: ${JSON.stringify({ 
      type: 'final',
      ceoResponse,
      consultations: consultationResults,
      executiveStatuses,
      synthesis: finalSynthesis,
      costReport
    })}\n\n`);

    res.end();
  } catch (error: any) {
    console.error('API Error:', error);
    res.write(`data: ${JSON.stringify({ 
      type: 'error',
      message: error.message || 'Internal server error'
    })}\n\n`);
    res.end();
  }
} 