// This file implements the main executive consultation interface
// It manages the interaction between users and AI executives

// Import necessary React features and other dependencies
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Executive, executives } from '../types/ExecutiveSuite';
import styles from './ExecutiveSuite.module.css';
import ResponseVisualizer from '../components/ResponseVisualizer';
import { logger } from '../utils/logger';

// Define what properties our component can receive from its parent
interface ExecutiveSuiteProps {
  onConsult: (executive: Executive, query: string) => void;  // Function to handle consultation requests
  isLoading?: boolean;  // Optional flag to show loading state
  onContribute: (executive: Executive) => void;  // Function to handle executive contributions
}

// Define what information we track about each executive's status
interface ExecutiveStatus {
  isActive: boolean;      // Whether the executive is currently working
  hasResponded?: boolean; // Whether they've finished their analysis
  isPending?: boolean;    // Whether they're waiting to start
  error?: boolean;        // Whether they encountered an error
  errorMessage?: string;  // Details about any error that occurred
}

// Main component that handles the executive consultation interface
export const ExecutiveSuite: React.FC<ExecutiveSuiteProps> = ({ onConsult, isLoading, onContribute }) => {
  // State management using React hooks
  // Each useState creates a variable we can update that will trigger UI updates
  const [query, setQuery] = useState('');
  const [isConsulting, setIsConsulting] = useState(false);
  const [synthesisData, setSynthesisData] = useState<any>(null);
  const [costReport, setCostReport] = useState<any>(null);
  const [activeExecutives, setActiveExecutives] = useState<Record<string, ExecutiveStatus>>({});
  const [statusMessages, setStatusMessages] = useState<string[]>([]);

  // Helper function to add timestamped messages to our status display
  const addStatusMessage = (message: string) => {
    setStatusMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Main function that handles the consultation process
  // This is called when the user clicks the "Get Strategic Advice" button
  const handleConsult = async () => {
    // Don't do anything if the query is empty
    if (!query.trim()) return;

    // Reset all states for a new consultation
    setIsConsulting(true);
    setSynthesisData(null);
    setCostReport(null);
    setStatusMessages([]);
    addStatusMessage('Starting consultation process...');

    // Variable to hold our connection to the server
    let eventSource: EventSource | null = null;

    try {
      logger.info('Starting consultation with EventSource');
      
      // Always start with CEO
      const url = `/api/consult?query=${encodeURIComponent(query)}&executive=Chief Executive Officer`;
      logger.debug(`Creating EventSource with URL: ${url}`);
      
      // Close any existing connection before creating a new one
      if (eventSource) {
        logger.debug('Closing existing EventSource');
        eventSource.close();
      }

      // Create a new connection to the server
      // This uses Server-Sent Events (SSE) to get real-time updates
      eventSource = new EventSource(url);
      logger.debug('EventSource created');

      // Set up what happens when we successfully connect
      eventSource.onopen = (event) => {
        logger.info('EventSource connection opened');
        addStatusMessage('Connection established with server...');
      };

      // Set up how we handle messages from the server
      eventSource.addEventListener('message', (event) => {
        logger.debug('=== START MESSAGE PROCESSING ===');
        logger.debug(`Raw event type: ${event.type}`);
        logger.debug(`Raw event data: ${event.data}`);
        logger.debug(`EventSource readyState: ${eventSource.readyState}`);
        
        if (!event.data) {
          logger.warn('Received empty event data');
          return;
        }
        
        try {
          const data = JSON.parse(event.data);
          logger.debug(`Parsed data type: ${data.type}`);
          logger.debug(`Full parsed data: ${JSON.stringify(data, null, 2)}`);

          // Always update executive statuses first if present
          if (data.executiveStatuses) {
            const executives = Object.entries(data.executiveStatuses);
            logger.info(`Processing status update for ${executives.length} executives`);
            
            // Update all executive statuses immediately
            setActiveExecutives(data.executiveStatuses);
            
            // Create status messages
            const statusMessages = executives.map(([title, status]) => {
              logger.debug(`${title} status: active=${status.isActive}, responded=${status.hasResponded}, pending=${status.isPending}, error=${status.error || false}`);
              
              if (status.error) {
                return `${title} encountered an error: ${status.errorMessage}`;
              } else if (status.isActive) {
                return `${title} is now analyzing the query...`;
              } else if (status.hasResponded && !status.isPending) {
                return `${title} has completed their analysis.`;
              } else if (status.isPending) {
                return `${title} is waiting to be consulted...`;
              }
              return null;
            }).filter(Boolean);

            // Add all status messages in one batch
            statusMessages.forEach(message => {
              if (message) addStatusMessage(message);
            });
          }

          // Handle specific message types
          if (data.type === 'response') {
            const message = `Got response from ${data.executive}`;
            logger.info(message);
            addStatusMessage(message);
          } else if (data.type === 'final') {
            logger.info('Got final synthesis');
            addStatusMessage('Consultation complete. Generating final synthesis...');
            
            // Log and handle cost report
            if (data.costReport) {
              logger.debug('Cost report received:', data.costReport);
              setCostReport(data.costReport);
              
              // Pass cost data to parent
              if (onContribute) {
                const costSummary = {
                  tokens: data.costReport.total_tokens,
                  cost: data.costReport.total_cost,
                  prompt_tokens: data.costReport.prompt_tokens,
                  completion_tokens: data.costReport.completion_tokens
                };
                logger.debug('Sending cost summary to parent:', costSummary);
                onContribute({ costSummary });
              }
            } else {
              logger.warn('No cost report in final response');
            }

            // Handle synthesis data
            if (data.synthesis) {
              setSynthesisData(data);
              addStatusMessage('Final synthesis ready.');
            }
            
            logger.debug('Closing EventSource connection');
            eventSource?.close();
            setIsConsulting(false);
          }
        } catch (parseError) {
          logger.error(`Error parsing event: ${parseError}`);
          logger.error(`Problematic event data: ${event.data}`);
          addStatusMessage('Error parsing server response.');
          eventSource?.close();
          setIsConsulting(false);
        } finally {
          logger.debug('=== END MESSAGE PROCESSING ===');
          logger.debug(`EventSource readyState after processing: ${eventSource.readyState}`);
        }
      });

      // Add error handler
      eventSource.onerror = (error) => {
        logger.error(`EventSource error: ${JSON.stringify(error)}`);
        addStatusMessage('Connection error. Please try again.');
      };

    } catch (error) {
      // Handle any other errors that might occur
      logger.error(`Consultation error: ${error}`);
      addStatusMessage('Error during consultation. Please try again.');
      eventSource?.close();
      setIsConsulting(false);
    }

    // Return a cleanup function that React will call when needed
    return () => {
      if (eventSource) {
        logger.debug('Cleaning up EventSource');
        eventSource.close();
      }
    };
  };

  // Reference to the status messages container for auto-scrolling
  const statusMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the status messages container when new messages are added
  useEffect(() => {
    if (statusMessagesRef.current) {
      statusMessagesRef.current.scrollTop = statusMessagesRef.current.scrollHeight;
    }
  }, [statusMessages]);

  // Reset states when starting a new consultation
  useEffect(() => {
    if (isConsulting) {
      setActiveExecutives({});
      setStatusMessages([]);
    }
  }, [isConsulting]);

  // Render the component's user interface
  return (
    <div className={styles.container}>
      {/* Query input section */}
      <div className={styles.querySection}>
        {/* Text area for user's question */}
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your business query..."
          className={styles.queryInput}
          rows={4}
        />
        {/* Button to start consultation */}
        <button
          onClick={handleConsult}
          disabled={isLoading || isConsulting || !query.trim()}
          className={styles.consultButton}
        >
          {isLoading || isConsulting ? 'Getting Strategic Advice...' : 'Get Strategic Advice'}
        </button>
      </div>

      {/* Grid of executive cards */}
      <div className={styles.executiveGrid}>
        {executives.map((exec) => {
          // Get the current status for this executive, or use default values if none exists
          const status = activeExecutives[exec.title] || { isActive: false, hasResponded: false, isPending: false };
          return (
            <div
              key={exec.id}
              className={`${styles.executiveCard} ${status.isActive ? styles.active : ''}`}
              data-active={status.isActive || false}
              data-responded={status.hasResponded || false}
              data-pending={status.isPending || false}
            >
              {/* Executive's avatar/icon */}
              <div 
                className={styles.avatar}
                style={{ backgroundColor: exec.color }}
              >
                {exec.initials}
                {/* Show spinning indicator when executive is active */}
                {status.isActive && (
                  <div className={styles.activeIndicator}>
                    <div className={styles.spinner}></div>
                  </div>
                )}
              </div>
              {/* Executive's title and name */}
              <h3>{exec.title}</h3>
              <p>{exec.name}</p>
              {/* Expertise tags that show on hover */}
              <div className={styles.expertise}>
                {exec.expertise.map((skill, index) => (
                  <span key={index} className={styles.skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status window showing consultation progress */}
      {isConsulting && (
        <div className={styles.statusWindow}>
          <h3>Consultation Progress</h3>
          <div className={styles.statusMessages} ref={statusMessagesRef}>
            {statusMessages.map((message, index) => (
              <div key={index} className={styles.statusMessage}>
                {message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show response visualizer when we have synthesis data */}
      {synthesisData && (
        <ResponseVisualizer
          response={synthesisData}
          costSummary={{
            tokens: costReport?.total_tokens || 0,
            cost: costReport?.total_cost || 0,
            prompt_tokens: costReport?.prompt_tokens || 0,
            completion_tokens: costReport?.completion_tokens || 0
          }}
          activeExecutives={Object.keys(activeExecutives).filter(
            exec => activeExecutives[exec].hasResponded
          )}
        />
      )}
    </div>
  );
}; 