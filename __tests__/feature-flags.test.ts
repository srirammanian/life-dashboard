import { describe, it, expect } from 'vitest';
import { isFeatureEnabled, getEnabledFeatures } from '@/lib/feature-flags';

describe('Feature Flags', () => {

  describe('isFeatureEnabled', () => {
    it('should return true for enabled flags', () => {
      expect(isFeatureEnabled('google-calendar-integration')).toBe(true);
    });

    it('should return false for disabled flags', () => {
      expect(isFeatureEnabled('health-tracking')).toBe(false);
      expect(isFeatureEnabled('finance-integration')).toBe(false);
    });

    it('should respect NODE_ENV for environment-specific flags', () => {
      // Analytics is disabled in test environment (current env)
      expect(isFeatureEnabled('analytics-tracking')).toBe(false);
      
      // Note: In production, analytics would be enabled automatically
      // This test validates the current environment behavior
    });

    it('should handle percentage-based rollouts consistently', () => {
      const userId1 = 'user-123';
      const userId2 = 'user-456';
      
      // Same user should always get same result
      const result1a = isFeatureEnabled('google-calendar-integration', userId1);
      const result1b = isFeatureEnabled('google-calendar-integration', userId1);
      expect(result1a).toBe(result1b);
      
      // Different users can get different results (but we can't test randomness easily)
      const result2 = isFeatureEnabled('google-calendar-integration', userId2);
      expect(typeof result2).toBe('boolean');
    });
  });

  describe('getEnabledFeatures', () => {
    it('should return all enabled features', () => {
      const enabled = getEnabledFeatures();
      
      expect(enabled).toContain('google-calendar-integration');
      expect(enabled).not.toContain('health-tracking');
      expect(enabled).not.toContain('finance-integration');
    });

    it('should respect current environment', () => {
      const enabled = getEnabledFeatures();
      
      // In test environment, analytics and error-reporting should be disabled
      expect(enabled).not.toContain('analytics-tracking');
      expect(enabled).not.toContain('error-reporting');
    });
  });
});
