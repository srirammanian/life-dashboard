/**
 * Analytics Library
 * 
 * Centralized analytics tracking for user behavior, feature usage,
 * and performance monitoring.
 */

import { isFeatureEnabled } from './feature-flags';
import { logger } from './logger';

export type AnalyticsEvent = 
  | 'page_view'
  | 'calendar_events_loaded'
  | 'calendar_error'
  | 'auth_sign_in'
  | 'auth_sign_out'
  | 'feature_interaction';

interface AnalyticsProperties {
  [key: string]: string | number | boolean | null | undefined;
}

interface AnalyticsProvider {
  track(event: string, properties?: AnalyticsProperties): void;
  identify(userId: string, traits?: AnalyticsProperties): void;
  page(name?: string, properties?: AnalyticsProperties): void;
}

class Analytics {
  private providers: AnalyticsProvider[] = [];
  private enabled: boolean = false;

  constructor() {
    this.enabled = isFeatureEnabled('analytics-tracking');
  }

  /**
   * Register an analytics provider (e.g., Google Analytics, Mixpanel, Segment)
   */
  registerProvider(provider: AnalyticsProvider): void {
    this.providers.push(provider);
  }

  /**
   * Track an event
   */
  track(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
    if (!this.enabled) {
      return;
    }

    try {
      logger.debug('Analytics event', { event, properties });
      
      this.providers.forEach(provider => {
        provider.track(event, {
          ...properties,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        });
      });
    } catch (error) {
      logger.error('Analytics tracking failed', { error, event });
    }
  }

  /**
   * Identify a user
   */
  identify(userId: string, traits?: AnalyticsProperties): void {
    if (!this.enabled) {
      return;
    }

    try {
      logger.debug('Analytics identify', { userId, traits });
      
      this.providers.forEach(provider => {
        provider.identify(userId, traits);
      });
    } catch (error) {
      logger.error('Analytics identify failed', { error, userId });
    }
  }

  /**
   * Track a page view
   */
  page(name?: string, properties?: AnalyticsProperties): void {
    if (!this.enabled) {
      return;
    }

    try {
      logger.debug('Analytics page view', { name, properties });
      
      this.providers.forEach(provider => {
        provider.page(name, {
          ...properties,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        });
      });
    } catch (error) {
      logger.error('Analytics page tracking failed', { error, name });
    }
  }
}

// Singleton instance
export const analytics = new Analytics();

/**
 * Console Analytics Provider (for development)
 * Logs analytics events to the console instead of sending to external service
 */
export class ConsoleAnalyticsProvider implements AnalyticsProvider {
  track(event: string, properties?: AnalyticsProperties): void {
    console.log('[Analytics] Track:', event, properties);
  }

  identify(userId: string, traits?: AnalyticsProperties): void {
    console.log('[Analytics] Identify:', userId, traits);
  }

  page(name?: string, properties?: AnalyticsProperties): void {
    console.log('[Analytics] Page:', name, properties);
  }
}

// Auto-register console provider in development
if (process.env.NODE_ENV === 'development') {
  analytics.registerProvider(new ConsoleAnalyticsProvider());
}
