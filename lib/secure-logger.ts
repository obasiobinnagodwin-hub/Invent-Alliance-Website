/**
 * Secure Logger Module
 * 
 * Provides structured JSON logging with automatic redaction of sensitive data.
 * Prevents passwords, tokens, secrets, and PII from appearing in logs.
 * 
 * Features:
 * - Automatic redaction of sensitive fields (password, token, secret, key, auth, email, phone)
 * - Structured JSON logging in production
 * - Pretty console output in development
 * - Feature flag gating (FEATURE_SECURE_LOGGER)
 * - Never logs raw request bodies when feature is enabled
 * 
 * Usage:
 *   import { logger } from '@/lib/secure-logger';
 *   logger.info('User action', { userId: '123', email: 'user@example.com' });
 *   logger.error('Error occurred', error, { context: 'login' });
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Check if secure logger feature is enabled
 */
function isSecureLoggerEnabled(): boolean {
  try {
    // Dynamic import to avoid circular dependencies
    const { FEATURE_SECURE_LOGGER } = require('./feature-flags');
    return FEATURE_SECURE_LOGGER === true;
  } catch {
    return false;
  }
}

/**
 * Sensitive field patterns to redact
 * Matches keys containing these strings (case-insensitive)
 */
const SENSITIVE_PATTERNS = [
  'password',
  'token',
  'secret',
  'key',
  'auth',
  'email',
  'phone',
  'passwd',
  'pwd',
  'credential',
  'api_key',
  'apikey',
  'access_token',
  'refresh_token',
  'session',
];

/**
 * Redaction placeholder
 */
const REDACTED_PLACEHOLDER = '[REDACTED]';

/**
 * Check if a key should be redacted
 */
function shouldRedactKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_PATTERNS.some(pattern => lowerKey.includes(pattern));
}

/**
 * Redact sensitive values from an object recursively
 */
function redactSensitiveData(obj: any, depth: number = 0): any {
  // Prevent infinite recursion
  if (depth > 10) {
    return '[MAX_DEPTH_REACHED]';
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle primitives
  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveData(item, depth + 1));
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Handle Error objects
  if (obj instanceof Error) {
    return {
      name: obj.name,
      message: obj.message,
      stack: obj.stack,
    };
  }

  // Handle objects
  const redacted: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (shouldRedactKey(key)) {
      // Redact the value
      if (typeof value === 'string' && value.length > 0) {
        // Show first 2 and last 2 characters for debugging, redact the rest
        if (value.length <= 4) {
          redacted[key] = REDACTED_PLACEHOLDER;
        } else {
          redacted[key] = `${value.substring(0, 2)}${REDACTED_PLACEHOLDER}${value.substring(value.length - 2)}`;
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively redact nested objects
        redacted[key] = redactSensitiveData(value, depth + 1);
      } else {
        redacted[key] = REDACTED_PLACEHOLDER;
      }
    } else {
      // Recursively process non-sensitive keys
      redacted[key] = redactSensitiveData(value, depth + 1);
    }
  }

  return redacted;
}

/**
 * Create a log entry structure
 */
interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Format log entry for output
 */
function formatLogEntry(level: string, message: string, data?: any, error?: Error): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (data !== undefined) {
    entry.data = redactSensitiveData(data);
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return entry;
}

/**
 * Secure Logger Class
 */
class SecureLogger {
  private enabled: boolean;

  constructor() {
    this.enabled = isSecureLoggerEnabled();
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    if (this.enabled) {
      const entry = formatLogEntry('info', message, data);
      if (isProduction) {
        console.log(JSON.stringify(entry));
      } else {
        console.log(`[INFO] ${entry.timestamp}`, entry.message, entry.data || '');
      }
    } else {
      console.log(message, data);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    if (this.enabled) {
      const entry = formatLogEntry('warn', message, data);
      if (isProduction) {
        console.warn(JSON.stringify(entry));
      } else {
        console.warn(`[WARN] ${entry.timestamp}`, entry.message, entry.data || '');
      }
    } else {
      console.warn(message, data);
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | any, data?: any): void {
    if (this.enabled) {
      const errorObj = error instanceof Error ? error : undefined;
      const entry = formatLogEntry('error', message, data, errorObj);
      if (isProduction) {
        console.error(JSON.stringify(entry));
      } else {
        console.error(`[ERROR] ${entry.timestamp}`, entry.message, entry.data || '', entry.error || '');
      }
    } else {
      if (error instanceof Error) {
        console.error(message, error, data);
      } else {
        console.error(message, error, data);
      }
    }
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, data?: any): void {
    if (!isProduction) {
      if (this.enabled) {
        const entry = formatLogEntry('debug', message, data);
        console.debug(`[DEBUG] ${entry.timestamp}`, entry.message, entry.data || '');
      } else {
        console.debug(message, data);
      }
    }
  }

  /**
   * Safely log request data (never logs body when feature is enabled)
   */
  logRequest(path: string, method: string, metadata?: Record<string, any>): void {
    if (this.enabled) {
      const entry = formatLogEntry('info', `${method} ${path}`, {
        ...metadata,
        // Explicitly exclude body - never log request bodies
        body: '[REQUEST_BODY_EXCLUDED]',
      });
      if (isProduction) {
        console.log(JSON.stringify(entry));
      } else {
        console.log(`[REQUEST] ${entry.timestamp}`, `${method} ${path}`, entry.data || '');
      }
    } else {
      console.log(`${method} ${path}`, metadata);
    }
  }
}

// Export singleton instance
export const logger = new SecureLogger();

// Export utility functions for advanced usage
export { redactSensitiveData, shouldRedactKey };


