/**
 * Error Tracking Library
 * 
 * Centralized error tracking and reporting.
 * Integrates with Sentry or similar services for production error monitoring.
 */

import { isFeatureEnabled } from './feature-flags';
import { logger } from './logger';

interface ErrorContext {
  [key: string]: unknown;
}

interface ErrorTrackingProvider {
  captureException(error: Error, context?: ErrorContext): void;
  captureMessage(message: string, level: 'info' | 'warning' | 'error', context?: ErrorContext): void;
  setUser(user: { id: string; email?: string; username?: string }): void;
}

class ErrorTracking {
  private providers: ErrorTrackingProvider[] = [];
  private enabled: boolean = false;

  constructor() {
    this.enabled = isFeatureEnabled('error-reporting');
  }

  /**
   * Register an error tracking provider (e.g., Sentry)
   */
  registerProvider(provider: ErrorTrackingProvider): void {
    this.providers.push(provider);
  }

  /**
   * Capture and report an exception
   */
  captureException(error: Error, context?: ErrorContext): void {
    // Always log to console/logger
    logger.error(error.message, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...context,
    });

    if (!this.enabled) {
      return;
    }

    try {
      this.providers.forEach(provider => {
        provider.captureException(error, {
          ...context,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        });
      });
    } catch (trackingError) {
      logger.error('Error tracking failed', { 
        originalError: error.message,
        trackingError,
      });
    }
  }

  /**
   * Capture and report a message
   */
  captureMessage(
    message: string, 
    level: 'info' | 'warning' | 'error' = 'error',
    context?: ErrorContext
  ): void {
    logger[level === 'warning' ? 'warn' : level](message, context);

    if (!this.enabled) {
      return;
    }

    try {
      this.providers.forEach(provider => {
        provider.captureMessage(message, level, {
          ...context,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        });
      });
    } catch (trackingError) {
      logger.error('Error tracking failed', { 
        originalMessage: message,
        trackingError,
      });
    }
  }

  /**
   * Set user context for error tracking
   */
  setUser(user: { id: string; email?: string; username?: string }): void {
    if (!this.enabled) {
      return;
    }

    try {
      this.providers.forEach(provider => {
        provider.setUser(user);
      });
    } catch (error) {
      logger.error('Failed to set user context', { error });
    }
  }
}

// Singleton instance
export const errorTracking = new ErrorTracking();

/**
 * Console Error Tracking Provider (for development)
 * Logs errors to console instead of sending to external service
 */
export class ConsoleErrorProvider implements ErrorTrackingProvider {
  captureException(error: Error, context?: ErrorContext): void {
    console.error('[Error Tracking] Exception:', error, context);
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error', context?: ErrorContext): void {
    console[level === 'info' ? 'log' : level === 'warning' ? 'warn' : 'error'](
      `[Error Tracking] ${level.toUpperCase()}:`, 
      message, 
      context
    );
  }

  setUser(user: { id: string; email?: string; username?: string }): void {
    console.log('[Error Tracking] User:', user);
  }
}

// Auto-register console provider in development
if (process.env.NODE_ENV === 'development') {
  errorTracking.registerProvider(new ConsoleErrorProvider());
}

/**
 * Global error handler for uncaught exceptions
 */
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorTracking.captureException(event.error || new Error(event.message), {
      source: 'window.error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorTracking.captureException(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      { source: 'unhandledrejection' }
    );
  });
}
