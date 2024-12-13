import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIService } from '../../services/OpenAIService';
import { Executive, ExecutiveStatus } from '../../types/ExecutiveSuite';
import { ConversationCostTracker } from '../../utils/ConversationCostTracker';

interface ConsultationResult {
  title: string;
  response: any;
  timestamp: string;
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

// Helper function to flush response data
const flushResponse = async (res: NextApiResponse): Promise<void> => {
  if (typeof (res as any).flush === 'function') {
    await (res as any).flush();
  }
};

// Helper function to send SSE message
const sendSSEMessage = async (res: NextApiResponse, data: any) => {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  res.write(message);
  await flushResponse(res);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Enable streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  let executive: string;
  let query: string;
  let companyContext: Record<string, any> = {};

  try {
    if (req.method === 'GET') {
      executive = decodeURIComponent(req.query.executive as string);
      query = decodeURIComponent(req.query.query as string);
      console.log('[Debug API] GET request received with:', { executive, query });
      
      if (!executive || !query) {
        console.error('[Debug API] Missing parameters:', { executive, query });
        await sendSSEMessage(res, { 
          type: 'error',
          message: 'Missing required parameters'
        });
        return res.end();
      }
    } else if (req.method === 'POST') {
      const body = req.body;
      executive = body.executive;
      query = body.query;
      companyContext = body.companyContext || {};
      console.log('[Debug API] POST request received with:', { executive, query });
    } else {
      console.error('[Debug API] Invalid method:', req.method);
      return res.status(405).json({ message: 'Method not allowed' });
    }

    console.log('[Debug API] Starting consultation with query:', query);
    const openAIService = new OpenAIService(process.env.OPENAI_API_KEY);
    
    // Initialize status tracking
    const executiveStatuses: Record<string, ExecutiveStatus> = {
      'Chief Executive Officer': {
        title: 'Chief Executive Officer',
        isActive: true,
        hasResponded: false,
        isPending: false
      }
    };

    // Send initial status
    console.log('[Debug API] Sending initial status');
    await sendSSEMessage(res, { 
      type: 'status', 
      executiveStatuses 
    });

    // Get CEO's response
    console.log('[Debug API] Getting CEO analysis...');
    const ceoResponse = await openAIService.getCEOResponse(query);
    
    executiveStatuses['Chief Executive Officer'].isActive = false;
    executiveStatuses['Chief Executive Officer'].hasResponded = true;
    executiveStatuses['Chief Executive Officer'].isPending = false;
    executiveStatuses['Chief Executive Officer'].timestamp = new Date().toISOString();
    
    console.log('[Debug API] Updated CEO status after response:', executiveStatuses['Chief Executive Officer']);
    await sendSSEMessage(res, { 
      type: 'response', 
      executive: 'CEO',
      response: ceoResponse,
      executiveStatuses 
    });

    const executivesToConsult = (ceoResponse as any).executivesToConsult || [];
    console.log('[Debug API] Executives to consult:', executivesToConsult);
    const consultationResults: ConsultationResult[] = [];
    
    // Initialize other executives with pending status
    executivesToConsult.forEach((exec: string) => {
      executiveStatuses[exec] = {
        title: exec,
        isActive: false,
        hasResponded: false,
        isPending: true
      };
      console.log(`[Debug API] Initialized status for ${exec}:`, executiveStatuses[exec]);
    });

    // Send updated statuses after setting pending flags
    console.log('[Debug API SEND] Sending status update for pending executives');
    await sendSSEMessage(res, { 
      type: 'status', 
      executiveStatuses 
    });

    // Consult other executives
    for (const execTitle of executivesToConsult) {
      try {
        // Update status to consulting
        Object.keys(executiveStatuses).forEach(key => {
          if (key === execTitle) {
            executiveStatuses[key].isActive = true;
            executiveStatuses[key].isPending = false;
          } else {
            executiveStatuses[key].isActive = false;
          }
        });

        // Send status update for current executive
        console.log(`[Debug API SEND] Sending active status for ${execTitle}`);
        await sendSSEMessage(res, { 
          type: 'status', 
          executiveStatuses 
        });

        console.log(`Getting response from ${execTitle}...`);
        const execResponse = await getExecutiveResponse(execTitle, query, companyContext, openAIService);
        
        if (execResponse) {
          const timestamp = new Date().toISOString();
          consultationResults.push({ 
            title: execTitle, 
            response: execResponse,
            timestamp
          });

          // Update status to completed
          executiveStatuses[execTitle].hasResponded = true;
          executiveStatuses[execTitle].isActive = false;
          executiveStatuses[execTitle].isPending = false;
          executiveStatuses[execTitle].timestamp = timestamp;
          
          // Send response update
          console.log(`[Debug API SEND] Sending response update for ${execTitle}`);
          await sendSSEMessage(res, { 
            type: 'response', 
            executive: execTitle,
            response: execResponse,
            executiveStatuses 
          });

          // Add a small delay between executives
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`[Debug API] Error consulting ${execTitle}:`, error);
        handleExecutiveError(error, execTitle, executiveStatuses);
        await sendSSEMessage(res, { 
          type: 'status', 
          executiveStatuses 
        });
      }
    }

    // Get final synthesis
    console.log('[Debug API] Starting final synthesis...');
    executiveStatuses['Chief Executive Officer'].isActive = true;
    await sendSSEMessage(res, { 
      type: 'status', 
      executiveStatuses 
    });

    const finalSynthesis = await synthesizeResponses(
      ceoResponse,
      consultationResults,
      openAIService
    );

    console.log('[Debug API] Final synthesis completed');
    executiveStatuses['Chief Executive Officer'].isActive = false;

    // Generate cost report
    const costReport = ConversationCostTracker.generateReport();
    console.log('[Debug API] Cost report generated:', costReport);

    // Send final response
    await sendSSEMessage(res, { 
      type: 'final',
      ceoResponse,
      consultations: consultationResults,
      executiveStatuses,
      synthesis: finalSynthesis,
      costReport
    });

    res.end();
  } catch (error: any) {
    console.error('[Debug API] Error:', error);
    await sendSSEMessage(res, { 
      type: 'error',
      message: error.message || 'Internal server error'
    });
    res.end();
  }
} 