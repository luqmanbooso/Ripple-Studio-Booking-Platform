// Serverless-compatible logger implementation
// In serverless environments like Vercel, we can't write to filesystem
// All logs go to console and are captured by the platform

const logger = {
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`, meta);
  },

  error: (message, error = {}) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, error);
  },

  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`, meta);
  },

  debug: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${timestamp}] DEBUG: ${message}`, meta);
    }
  }
};

module.exports = logger;
