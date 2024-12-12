import React from 'react';
import styles from './ResponseVisualizer.module.css';

interface ResponseVisualizerProps {
  response: any;
  costSummary: {
    tokens: number;
    cost: number;
    prompt_tokens: number;
    completion_tokens: number;
  };
  activeExecutives: string[];
}

export default function ResponseVisualizer({ response, costSummary, activeExecutives }: ResponseVisualizerProps) {
  return (
    <div className={styles.responseContainer}>
      <div className={styles.costSummary}>
        <h3>Cost Summary</h3>
        <div className={styles.costDetails}>
          <div className={styles.costItem}>
            <span>Total Tokens:</span>
            <span>{costSummary.tokens}</span>
          </div>
          <div className={styles.costItem}>
            <span>Prompt Tokens:</span>
            <span>{costSummary.prompt_tokens}</span>
          </div>
          <div className={styles.costItem}>
            <span>Completion Tokens:</span>
            <span>{costSummary.completion_tokens}</span>
          </div>
          <div className={styles.costTotal}>
            <span>Total Cost:</span>
            <span>${costSummary.cost.toFixed(4)}</span>
          </div>
        </div>
      </div>
      
      <div className={styles.contributors}>
        <h3>Contributing Executives</h3>
        <div className={styles.executiveList}>
          {activeExecutives.map((exec, index) => (
            <div key={index} className={styles.contributor}>
              <span className={styles.contributorBadge}>{exec}</span>
            </div>
          ))}
        </div>
      </div>
      
      {response?.synthesis && (
        <div className={styles.synthesisReport}>
          <h3>CEO Synthesis Report</h3>
          
          <div className={styles.section}>
            <h4>Summary</h4>
            <p>{response.synthesis.summary}</p>
          </div>

          <div className={styles.section}>
            <h4>Key Takeaways</h4>
            <ul>
              {response.synthesis.keyTakeaways.map((takeaway: string, index: number) => (
                <li key={index}>{takeaway}</li>
              ))}
            </ul>
          </div>

          <div className={styles.section}>
            <h4>Executive Alignment</h4>
            <div className={styles.alignmentSection}>
              <h5>Agreements</h5>
              <ul>
                {response.synthesis.executiveAlignment.agreements.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              
              <h5>Differences</h5>
              <ul>
                {response.synthesis.executiveAlignment.differences.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              
              <h5>Synergies</h5>
              <ul>
                {response.synthesis.executiveAlignment.synergies.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.section}>
            <h4>Integrated Strategy</h4>
            <ul>
              {response.synthesis.integratedStrategy.map((strategy: string, index: number) => (
                <li key={index}>{strategy}</li>
              ))}
            </ul>
          </div>

          <div className={styles.section}>
            <h4>Implementation Plan</h4>
            <div className={styles.implementationSection}>
              <div className={styles.timeframe}>
                <h5>Immediate Actions</h5>
                <ul>
                  {response.synthesis.implementationPlan.immediate.map((action: string, index: number) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.timeframe}>
                <h5>Short-Term Initiatives (30-90 days)</h5>
                <ul>
                  {response.synthesis.implementationPlan.shortTerm.map((action: string, index: number) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.timeframe}>
                <h5>Long-Term Objectives</h5>
                <ul>
                  {response.synthesis.implementationPlan.longTerm.map((action: string, index: number) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 