/**
 * Feature Flags Library
 * 
 * Centralized feature flag management for controlled rollouts,
 * A/B testing, and gradual feature adoption.
 */

export type FeatureFlag = 
  | 'google-calendar-integration'
  | 'health-tracking'
  | 'finance-integration'
  | 'task-management'
  | 'analytics-tracking'
  | 'error-reporting';

interface FeatureFlagConfig {
  enabled: boolean;
  rolloutPercentage?: number;
  requiredEnv?: 'development' | 'staging' | 'production';
  description?: string;
}

type FeatureFlagsConfig = Record<FeatureFlag, FeatureFlagConfig>;

/**
 * Feature flags configuration
 * 
 * This can be moved to environment variables or a remote config service
 * for dynamic feature flag management without redeployment.
 */
const featureFlagsConfig: FeatureFlagsConfig = {
  'google-calendar-integration': {
    enabled: true,
    rolloutPercentage: 100,
    description: 'Google Calendar OAuth and event display',
  },
  'health-tracking': {
    enabled: false,
    rolloutPercentage: 0,
    description: 'Health data integration (Apple Health, Google Fit)',
  },
  'finance-integration': {
    enabled: false,
    rolloutPercentage: 0,
    description: 'Financial account integration',
  },
  'task-management': {
    enabled: false,
    rolloutPercentage: 0,
    description: 'Task tracking and management',
  },
  'analytics-tracking': {
    enabled: process.env.NODE_ENV === 'production',
    description: 'User analytics and telemetry',
  },
  'error-reporting': {
    enabled: process.env.NODE_ENV === 'production',
    description: 'Error tracking and reporting',
  },
};

/**
 * Check if a feature flag is enabled
 * 
 * @param flag - Feature flag name
 * @param userId - Optional user ID for percentage-based rollouts
 * @returns Whether the feature is enabled
 */
export function isFeatureEnabled(
  flag: FeatureFlag,
  userId?: string
): boolean {
  const config = featureFlagsConfig[flag];
  
  if (!config || !config.enabled) {
    return false;
  }

  // Check environment restrictions
  if (config.requiredEnv && process.env.NODE_ENV !== config.requiredEnv) {
    return false;
  }

  // Percentage-based rollout
  if (config.rolloutPercentage !== undefined && config.rolloutPercentage < 100) {
    if (!userId) {
      return false;
    }
    
    // Simple hash-based percentage calculation
    const hash = hashString(userId);
    const percentage = hash % 100;
    return percentage < config.rolloutPercentage;
  }

  return true;
}

/**
 * Get all enabled feature flags
 * 
 * @param userId - Optional user ID for percentage-based rollouts
 * @returns Array of enabled feature flag names
 */
export function getEnabledFeatures(userId?: string): FeatureFlag[] {
  return Object.keys(featureFlagsConfig)
    .filter(flag => isFeatureEnabled(flag as FeatureFlag, userId)) as FeatureFlag[];
}

/**
 * Simple string hash function for consistent percentage-based rollouts
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Override feature flags from environment variables
 * Format: FEATURE_FLAG_<FLAG_NAME>=true|false
 */
export function loadFeatureFlagsFromEnv(): void {
  Object.keys(featureFlagsConfig).forEach(flag => {
    const envKey = `FEATURE_FLAG_${flag.toUpperCase().replace(/-/g, '_')}`;
    const envValue = process.env[envKey];
    
    if (envValue !== undefined) {
      featureFlagsConfig[flag as FeatureFlag].enabled = envValue === 'true';
    }
  });
}
