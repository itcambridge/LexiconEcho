type LogLevel = 'debug' | 'info' | 'warn' | 'error';

async function sendToServer(message: string, level: LogLevel = 'info') {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, level })
    });
  } catch (error) {
    console.error('Failed to send log to server:', error);
  }
}

export const logger = {
  debug: (message: string) => {
    console.debug('[Debug Frontend]', message);
    sendToServer(message, 'debug');
  },
  
  info: (message: string) => {
    console.info('[Debug Frontend]', message);
    sendToServer(message, 'info');
  },
  
  warn: (message: string) => {
    console.warn('[Debug Frontend]', message);
    sendToServer(message, 'warn');
  },
  
  error: (message: string) => {
    console.error('[Debug Frontend]', message);
    sendToServer(message, 'error');
  }
}; 