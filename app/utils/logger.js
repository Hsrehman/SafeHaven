const sanitizeData = (data) => {
  if (!data) return data;
  
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'credential'];
  const sanitized = { ...data };

  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
  });

  return sanitized;
};

const logger = {
  dev: (message, data = {}) => {

    if (process.env.DEBUG_LOGS === 'true') {
      console.log(`[${new Date().toISOString()}] [Dev] ${message}`, sanitizeData(data));
    }
  },
  
  error: (error, context = '') => {
    const timestamp = new Date().toISOString();
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      timestamp,
      ...error
    } : error;

    if (typeof errorData === 'object' && errorData !== null) {
      console.error(`[${timestamp}] [Error] [${context}]`, sanitizeData(errorData));
    } else {
      console.error(`[${timestamp}] [Error] [${context}]`, error);
    }
  },
  
  info: (message, data = {}) => {
    console.log(`[${new Date().toISOString()}] [Info] ${message}`, sanitizeData(data));
  },
  
  performance: (label, duration) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [Performance] ${label}:`, {
        duration: `${duration.toFixed(2)}ms`,
      });
    }
  },

  security: (event, data = {}) => {
    const logData = {
      event,
      timestamp: new Date().toISOString(),
      ...sanitizeData(data)
    };
    
    if (process.env.NODE_ENV === 'production') {
      
      console.warn(`[Security] ${event}`, logData);
    } else {
      console.warn(`[${logData.timestamp}] [Security] ${event}`, logData);
    }
  }
};

export default logger; 