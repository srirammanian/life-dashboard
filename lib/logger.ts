/**
 * Logging Library
 * 
 * Structured logging with different levels and metadata support.
 * Integrates with error tracking and can be extended to send logs
 * to external services (e.g., CloudWatch, Datadog, Logtail).
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMetadata {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: LogMetadata;
  environment?: string;
}

class Logger {
  private minLevel: LogLevel;
  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor() {
    // Set minimum log level based on environment
    this.minLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
    
    // Allow override via environment variable
    const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
    if (envLevel && this.levelPriority[envLevel] !== undefined) {
      this.minLevel = envLevel;
    }
  }

  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  /**
   * Format and output log entry
   */
  private log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      ...(metadata && { metadata }),
    };

    // In production, use JSON format for easier parsing
    if (process.env.NODE_ENV === 'production') {
      console[level === 'debug' ? 'log' : level](JSON.stringify(entry));
    } else {
      // In development, use readable format
      const metaStr = metadata ? ` ${JSON.stringify(metadata, null, 2)}` : '';
      console[level === 'debug' ? 'log' : level](
        `[${entry.timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`
      );
    }
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, metadata?: LogMetadata): void {
    this.log('debug', message, metadata);
  }

  /**
   * Log info message
   */
  info(message: string, metadata?: LogMetadata): void {
    this.log('info', message, metadata);
  }

  /**
   * Log warning message
   */
  warn(message: string, metadata?: LogMetadata): void {
    this.log('warn', message, metadata);
  }

  /**
   * Log error message
   */
  error(message: string, metadata?: LogMetadata): void {
    this.log('error', message, metadata);
  }

  /**
   * Create a child logger with default metadata
   */
  child(defaultMetadata: LogMetadata): Logger {
    const childLogger = new Logger();
    
    // Override log method to include default metadata
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = (level: LogLevel, message: string, metadata?: LogMetadata) => {
      originalLog(level, message, { ...defaultMetadata, ...metadata });
    };

    return childLogger;
  }
}

// Singleton instance
export const logger = new Logger();

/**
 * Create a request-specific logger with context
 */
export function createRequestLogger(requestId: string, path: string): Logger {
  return logger.child({ requestId, path });
}
