import React from 'react';
import styles from './CompanyConfig.module.css';

interface CompanyConfigProps {
  companyContext: CompanyContext;
  onUpdate: (context: CompanyContext) => void;
}

export const CompanyConfig: React.FC<CompanyConfigProps> = ({ companyContext, onUpdate }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onUpdate({
      ...companyContext,
      [name]: value
    });
  };

  return (
    <div className={styles.configContainer}>
      <h2>Company Configuration</h2>
      <div className={styles.formGroup}>
        <label htmlFor="companyName">Company Name</label>
        <input
          type="text"
          id="companyName"
          name="companyName"
          value={companyContext.companyName}
          onChange={handleChange}
          placeholder="Enter your company name"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="missionStatement">Mission Statement</label>
        <textarea
          id="missionStatement"
          name="missionStatement"
          value={companyContext.missionStatement}
          onChange={handleChange}
          placeholder="Enter your company's mission statement"
          rows={4}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="industry">Industry (Optional)</label>
        <input
          type="text"
          id="industry"
          name="industry"
          value={companyContext.industry || ''}
          onChange={handleChange}
          placeholder="e.g., Technology, Healthcare, Finance"
        />
      </div>
    </div>
  );
}; 