/**
 * A/B Testing Library
 * 
 * Infrastructure for running experiments and tracking variant performance.
 * Integrates with analytics to track conversion events.
 */

import { analytics } from './analytics';
import { logger } from './logger';

export type ExperimentVariant = 'control' | 'variant_a' | 'variant_b' | 'variant_c';

interface Experiment {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  variants: ExperimentVariant[];
  weights?: Record<ExperimentVariant, number>; // Optional custom weights
}

type ExperimentsConfig = Record<string, Experiment>;

/**
 * A/B Testing Experiments Configuration
 */
const experimentsConfig: ExperimentsConfig = {
  'calendar-widget-layout': {
    id: 'calendar-widget-layout',
    name: 'Calendar Widget Layout',
    description: 'Test different layouts for calendar event display',
    enabled: false,
    variants: ['control', 'variant_a'],
    weights: {
      control: 50,
      variant_a: 50,
      variant_b: 0,
      variant_c: 0,
    },
  },
  'dashboard-card-order': {
    id: 'dashboard-card-order',
    name: 'Dashboard Card Order',
    description: 'Test different ordering of dashboard widgets',
    enabled: false,
    variants: ['control', 'variant_a', 'variant_b'],
    weights: {
      control: 34,
      variant_a: 33,
      variant_b: 33,
      variant_c: 0,
    },
  },
};

class ABTesting {
  /**
   * Get the variant for a user in an experiment
   * Uses consistent hashing to ensure the same user always gets the same variant
   */
  getVariant(experimentId: string, userId: string): ExperimentVariant {
    const experiment = experimentsConfig[experimentId];
    
    if (!experiment || !experiment.enabled) {
      return 'control';
    }

    const hash = this.hashString(`${experimentId}:${userId}`);
    const weights = experiment.weights || this.getEqualWeights(experiment.variants);
    
    return this.selectVariantByWeight(hash, weights, experiment.variants);
  }

  /**
   * Track an experiment exposure (user saw the experiment)
   */
  trackExposure(experimentId: string, userId: string, variant: ExperimentVariant): void {
    const experiment = experimentsConfig[experimentId];
    
    if (!experiment) {
      logger.warn('Unknown experiment', { experimentId });
      return;
    }

    analytics.track('feature_interaction', {
      feature: 'ab_experiment_exposure',
      experiment_id: experimentId,
      experiment_name: experiment.name,
      variant,
      user_id: userId,
    });
  }

  /**
   * Track a conversion event for an experiment
   */
  trackConversion(
    experimentId: string,
    userId: string,
    variant: ExperimentVariant,
    conversionType: string,
    value?: number
  ): void {
    analytics.track('feature_interaction', {
      feature: 'ab_experiment_conversion',
      experiment_id: experimentId,
      variant,
      user_id: userId,
      conversion_type: conversionType,
      ...(value !== undefined && { value }),
    });
  }

  /**
   * Get equal weights for all variants
   */
  private getEqualWeights(variants: ExperimentVariant[]): Record<ExperimentVariant, number> {
    const weight = 100 / variants.length;
    return variants.reduce((acc, variant) => {
      acc[variant] = weight;
      return acc;
    }, {} as Record<ExperimentVariant, number>);
  }

  /**
   * Select variant based on hash and weights
   */
  private selectVariantByWeight(
    hash: number,
    weights: Record<ExperimentVariant, number>,
    variants: ExperimentVariant[]
  ): ExperimentVariant {
    const percentage = hash % 100;
    let cumulative = 0;

    for (const variant of variants) {
      cumulative += weights[variant] || 0;
      if (percentage < cumulative) {
        return variant;
      }
    }

    return 'control';
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Check if an experiment is enabled
   */
  isExperimentEnabled(experimentId: string): boolean {
    return experimentsConfig[experimentId]?.enabled || false;
  }

  /**
   * Get all active experiments
   */
  getActiveExperiments(): Experiment[] {
    return Object.values(experimentsConfig).filter(exp => exp.enabled);
  }
}

// Singleton instance
export const abTesting = new ABTesting();
