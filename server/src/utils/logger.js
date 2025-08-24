const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Simple logger implementation
const logger = {
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] INFO: ${message} ${JSON.stringify(meta)}\n`;
    
    console.log(`INFO: ${message}`, meta);
    
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(path.join(logsDir, 'app.log'), logEntry);
    }
  },

  error: (message, error = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ERROR: ${message} ${JSON.stringify(error)}\n`;
    
    console.error(`ERROR: ${message}`, error);
    
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(path.join(logsDir, 'error.log'), logEntry);
    }
  },

  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] WARN: ${message} ${JSON.stringify(meta)}\n`;
    
    console.warn(`WARN: ${message}`, meta);
    
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(path.join(logsDir, 'app.log'), logEntry);
    }
  }
};

module.exports = logger;
