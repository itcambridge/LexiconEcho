import React, { useState } from 'react';
import { Executive, executives } from '../types/ExecutiveSuite';
import styles from './ExecutiveSuite.module.css';
import ResponseVisualizer from '../components/ResponseVisualizer';

interface ExecutiveSuiteProps {
  onConsult: (executive: Executive, query: string) => void;
  isLoading?: boolean;
  onContribute: (executive: Executive) => void;
}

interface ExecutiveStatus {
  title: string;
  isActive: boolean;
  hasResponded: boolean;
  timestamp?: string;
}

export const ExecutiveSuite: React.FC<ExecutiveSuiteProps> = ({ onConsult, isLoading, onContribute }) => {
  const [selectedExecutive, setSelectedExecutive] = useState<Executive>('Chief Executive Officer');
  const [executiveStatuses, setExecutiveStatuses] = useState<Record<string, ExecutiveStatus>>({});
  const [query, setQuery] = useState('');
  const [isConsulting, setIsConsulting] = useState(false);
  const [synthesisData, setSynthesisData] = useState<any>(null);
  const [costReport, setCostReport] = useState<any>(null);

  const handleConsult = async () => {
    if (!query.trim()) return;
    setIsConsulting(true);
    setSynthesisData(null);
    setCostReport(null);

    try {
      const response = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ executive: selectedExecutive, query })
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const events = text.split('\n\n').filter(Boolean);

        for (const event of events) {
          const data = JSON.parse(event.replace('data: ', ''));
          
          switch (data.type) {
            case 'status':
              setExecutiveStatuses(data.executiveStatuses);
              break;
            case 'response':
              onContribute(data.executive);
              break;
            case 'final':
              onContribute('CEO-Synthesis');
              if (data.costReport) {
                console.log('\nConversation Cost Summary:\n-------------------------');
                console.log(data.costReport);
                console.log('-------------------------');
                setCostReport(data.costReport);
              }
              if (data.synthesis) {
                console.log('\nCEO Synthesis Report:\n-------------------------');
                console.log(JSON.stringify(data.synthesis, null, 2));
                console.log('-------------------------');
                setSynthesisData(data);
              }
              break;
            case 'error':
              console.error('Error:', data.message);
              break;
          }
        }
      }
    } catch (error) {
      console.error('Consultation error:', error);
    } finally {
      setIsConsulting(false);
    }
  };

  const getCardClassName = (exec: Executive) => {
    const status = executiveStatuses[exec];
    const classes = [styles.executiveCard];
    if (exec === selectedExecutive) classes.push(styles.selected);
    if (status?.isActive) classes.push(styles.active);
    if (status?.hasResponded) classes.push(styles.responded);
    return classes.join(' ');
  };

  return (
    <div className={styles.container}>
      <div className={styles.executiveGrid}>
        {executives.map((exec) => (
          <div
            key={exec.id}
            className={getCardClassName(exec.title)}
            onClick={() => setSelectedExecutive(exec.title)}
            data-executive={exec.title}
          >
            <div 
              className={styles.avatar}
              style={{ backgroundColor: exec.color }}
            >
              {exec.initials}
              {executiveStatuses[exec.title]?.isActive && (
                <div className={styles.activeIndicator}>
                  <div className={styles.spinner}></div>
                </div>
              )}
            </div>
            <h3>{exec.title}</h3>
            <p>{exec.name}</p>
            <div className={styles.expertise}>
              {exec.expertise.map((skill, index) => (
                <span key={index} className={styles.skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Query Section */}
      <div className={styles.querySection}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your business query..."
          className={styles.queryInput}
          rows={4}
        />
        <button
          onClick={handleConsult}
          disabled={isLoading || isConsulting || !query.trim()}
          className={styles.consultButton}
        >
          {isLoading || isConsulting ? 'Getting Strategic Advice...' : 'Get Strategic Advice'}
        </button>
      </div>

      {synthesisData && (
        <ResponseVisualizer
          response={synthesisData}
          costSummary={{
            tokens: synthesisData.usage?.total_tokens || 0,
            cost: synthesisData.usage?.estimated_cost || 0,
            prompt_tokens: synthesisData.usage?.prompt_tokens || 0,
            completion_tokens: synthesisData.usage?.completion_tokens || 0
          }}
          activeExecutives={Object.entries(executiveStatuses)
            .filter(([_, status]) => status.hasResponded)
            .map(([title]) => title)}
        />
      )}
    </div>
  );
}; 