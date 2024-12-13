import { ExecutiveSuite } from '../interfaces/ExecutiveSuite';
import { ResponseVisualizer } from '../components/ResponseVisualizer';
import { Executive } from '../types/ExecutiveSuite';
import { useState } from 'react';
import { CompanyConfig } from '../components/CompanyConfig';
import { CompanyContext } from '../types/CompanyContext';

export default function Home() {
  const [response, setResponse] = useState<any>(null);
  const [costSummary, setCostSummary] = useState({ tokens: 0, cost: 0, prompt_tokens: 0, completion_tokens: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyContext, setCompanyContext] = useState<CompanyContext>({
    companyName: '',
    missionStatement: '',
  });
  const [contributors, setContributors] = useState<string[]>([]);

  const handleConsult = async (executive: Executive, query: string) => {
    setIsLoading(true);
    setError(null);
    setContributors([]);
    
    try {
      const response = await fetch('/api/consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          executive, 
          query,
          companyContext
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const events = text.split('\n\n').filter(Boolean);

        for (const event of events) {
          if (!event.startsWith('data: ')) continue;
          
          const data = JSON.parse(event.replace('data: ', ''));
          
          switch (data.type) {
            case 'status':
              // Update executive statuses
              break;
            case 'response':
              if (data.executive) {
                setContributors(prev => 
                  prev.includes(data.executive) ? prev : [...prev, data.executive]
                );
              }
              break;
            case 'final':
              setResponse(data);
              if (data.costReport) {
                setCostSummary({
                  tokens: data.costReport.total_tokens || 0,
                  cost: data.costReport.total_cost || 0,
                  prompt_tokens: data.costReport.prompt_tokens || 0,
                  completion_tokens: data.costReport.completion_tokens || 0
                });
              }
              break;
            case 'error':
              setError(data.message || 'An error occurred');
              break;
          }
        }
      }
    } catch (error) {
      console.error('Error consulting executive:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <CompanyConfig 
        companyContext={companyContext}
        onUpdate={setCompanyContext}
      />
      <ExecutiveSuite 
        onConsult={handleConsult} 
        isLoading={isLoading}
        onContribute={(executive) => {
          setContributors(prev => 
            prev.includes(executive) ? prev : [...prev, executive]
          );
        }}
      />
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      {response && (
        <ResponseVisualizer 
          response={response} 
          costSummary={costSummary}
          activeExecutives={contributors}
        />
      )}
      
      <style jsx global>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        .error-message {
          color: #dc3545;
          padding: 1rem;
          margin: 1rem 0;
          background: #f8d7da;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
} 