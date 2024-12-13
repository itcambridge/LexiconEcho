import React from 'react';
import styles from './ResponseVisualizer.module.css';
import { ConsultationResult, Executive } from '../types/ExecutiveSuite';

interface ResponseVisualizerProps {
  response: ConsultationResult;
  costSummary: {
    tokens: number;
    cost: number;
    prompt_tokens: number;
    completion_tokens: number;
  };
  activeExecutives: Executive[];
}

const CostSummary: React.FC<{ summary: ResponseVisualizerProps['costSummary'] }> = ({ summary }) => (
  <div className={styles.costSummary}>
    <h3>Cost Summary</h3>
    <div className={styles.costDetails}>
      <div className={styles.costItem}>
        <span>Total Tokens:</span>
        <span>{summary.tokens}</span>
      </div>
      <div className={styles.costItem}>
        <span>Prompt Tokens:</span>
        <span>{summary.prompt_tokens}</span>
      </div>
      <div className={styles.costItem}>
        <span>Completion Tokens:</span>
        <span>{summary.completion_tokens}</span>
      </div>
      <div className={styles.costTotal}>
        <span>Total Cost:</span>
        <span>${summary.cost.toFixed(4)}</span>
      </div>
    </div>
  </div>
);

const Contributors: React.FC<{ executives: Executive[] }> = ({ executives }) => (
  <div className={styles.contributors}>
    <h3>Contributing Executives</h3>
    <div className={styles.executiveList}>
      {executives.map((exec, index) => (
        <div key={index} className={styles.contributor}>
          <span className={styles.contributorBadge}>{exec}</span>
        </div>
      ))}
    </div>
  </div>
);

const SynthesisSection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <div className={styles.section}>
    <h4>{title}</h4>
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);

const ImplementationSection: React.FC<{ plan: ConsultationResult['synthesis']['implementationPlan'] }> = ({ plan }) => (
  <div className={styles.section}>
    <h4>Implementation Plan</h4>
    <div className={styles.implementationSection}>
      <div className={styles.timeframe}>
        <h5>Immediate Actions</h5>
        <ul>
          {plan.immediate.map((action, index) => (
            <li key={index}>{action}</li>
          ))}
        </ul>
      </div>
      
      <div className={styles.timeframe}>
        <h5>Short-Term Initiatives (30-90 days)</h5>
        <ul>
          {plan.shortTerm.map((action, index) => (
            <li key={index}>{action}</li>
          ))}
        </ul>
      </div>
      
      <div className={styles.timeframe}>
        <h5>Long-Term Objectives</h5>
        <ul>
          {plan.longTerm.map((action, index) => (
            <li key={index}>{action}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export default function ResponseVisualizer({ response, costSummary, activeExecutives }: ResponseVisualizerProps) {
  if (!response?.synthesis) return null;

  const { synthesis } = response;

  return (
    <div className={styles.responseContainer}>
      <CostSummary summary={costSummary} />
      <Contributors executives={activeExecutives} />
      
      {synthesis && (
        <div className={styles.synthesisReport}>
          <h3>CEO Synthesis Report</h3>
          
          <div className={styles.section}>
            <h4>Summary</h4>
            <p>{synthesis.summary}</p>
          </div>

          <SynthesisSection title="Key Takeaways" items={synthesis.keyTakeaways} />

          <div className={styles.section}>
            <h4>Executive Alignment</h4>
            <div className={styles.alignmentSection}>
              <SynthesisSection title="Agreements" items={synthesis.executiveAlignment.agreements} />
              <SynthesisSection title="Differences" items={synthesis.executiveAlignment.differences} />
              <SynthesisSection title="Synergies" items={synthesis.executiveAlignment.synergies} />
            </div>
          </div>

          <SynthesisSection title="Integrated Strategy" items={synthesis.integratedStrategy} />
          <ImplementationSection plan={synthesis.implementationPlan} />
        </div>
      )}
    </div>
  );
} 