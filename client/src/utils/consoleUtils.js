/**
 * Console utilities for handling browser extension errors and other noise
 */

// Store original console methods
const originalError = console.error;
const originalWarn = console.warn;

// List of error patterns to suppress (browser extensions, etc.)
const suppressedErrorPatterns = [
  /Could not establish connection\. Receiving end does not exist/,
  /Extension context invalidated/,
  /content-script-start\.js/,
  /chrome-extension:/,
  /moz-extension:/,
  /safari-extension:/,
  /Download the React DevTools/
];

/**
 * Enhanced console.error that filters out known browser extension errors
 */
export const setupConsoleFiltering = () => {
  console.error = (...args) => {
    const message = args.join(' ');
    
    // Check if this error should be suppressed
    const shouldSuppress = suppressedErrorPatterns.some(pattern => 
      pattern.test(message)
    );
    
    if (!shouldSuppress) {
      originalError.apply(console, args);
    }
  };

  console.warn = (...args) => {
    const message = args.join(' ');
    
    // Suppress React DevTools warning in production
    if (message.includes('Download the React DevTools') && import.meta.env.PROD) {
      return;
    }
    
    originalWarn.apply(console, args);
  };
};

/**
 * Restore original console methods
 */
export const restoreConsole = () => {
  console.error = originalError;
  console.warn = originalWarn;
};

/**
 * Log application-specific errors with context
 */
export const logAppError = (error, context = '') => {
  originalError(`[Ripple App Error] ${context}:`, error);
};

/**
 * Log application-specific warnings with context
 */
export const logAppWarning = (message, context = '') => {
  originalWarn(`[Ripple App Warning] ${context}:`, message);
};
