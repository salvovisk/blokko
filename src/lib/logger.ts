/**
 * Centralized logging utility
 * Sanitizes sensitive data and provides structured logging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

// Sensitive fields that should be redacted from logs
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'authorization',
  'cookie',
  'csrf',
];

/**
 * Sanitize object by redacting sensitive fields
 */
function sanitize(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_FIELDS.some(field => lowerKey.includes(field));

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  return obj;
}

/**
 * Format log message with timestamp and level
 */
function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const sanitizedContext = context ? sanitize(context) : undefined;

  const logData: Record<string, unknown> = {
    timestamp,
    level: level.toUpperCase(),
    message,
  };

  if (sanitizedContext) {
    logData.context = sanitizedContext;
  }

  // In production, use JSON format for easier parsing
  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify(logData);
  }

  // In development, use readable format
  let formatted = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  if (sanitizedContext) {
    formatted += `\n${JSON.stringify(sanitizedContext, null, 2)}`;
  }
  return formatted;
}

/**
 * Logger class with sanitization
 */
class Logger {
  info(message: string, context?: LogContext): void {
    console.log(formatLog('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(formatLog('warn', message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      ...(error instanceof Error && {
        error: {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
      }),
    };

    console.error(formatLog('error', message, errorContext));
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatLog('debug', message, context));
    }
  }

  /**
   * Log security events (always logged, even in production)
   */
  security(message: string, context?: LogContext): void {
    console.warn(formatLog('warn', `[SECURITY] ${message}`, context));
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types
export type { LogLevel, LogContext };
