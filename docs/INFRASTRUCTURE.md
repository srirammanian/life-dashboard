# Infrastructure Documentation

This document describes the infrastructure components added to the Life Dashboard project.

## Overview

The infrastructure layer provides:
- **Feature Flags**: Controlled rollout of new features
- **Analytics**: User behavior and feature usage tracking
- **Logging**: Structured logging with different levels
- **A/B Testing**: Experimentation framework
- **Error Tracking**: Production error monitoring

## Feature Flags

Location: `lib/feature-flags.ts`

### Usage

```typescript
import { isFeatureEnabled } from '@/lib/feature-flags';

if (isFeatureEnabled('google-calendar-integration')) {
  // Feature is enabled
}
```

### Configuration

Feature flags can be controlled via:
1. **Code**: Edit `featureFlagsConfig` in `lib/feature-flags.ts`
2. **Environment Variables**: Set `FEATURE_FLAG_<NAME>=true|false`

Example:
```bash
FEATURE_FLAG_GOOGLE_CALENDAR_INTEGRATION=true
FEATURE_FLAG_ANALYTICS_TRACKING=false
```

### Available Flags

| Flag | Description | Default |
|------|-------------|---------|
| `google-calendar-integration` | Google Calendar OAuth and events | `true` |
| `health-tracking` | Health data integration | `false` |
| `finance-integration` | Financial account integration | `false` |
| `task-management` | Task tracking | `false` |
| `analytics-tracking` | User analytics | `production only` |
| `error-reporting` | Error tracking | `production only` |

### Percentage Rollouts

Feature flags support gradual rollouts:

```typescript
{
  enabled: true,
  rolloutPercentage: 50, // 50% of users
}
```

Users are consistently assigned to the same variant based on their user ID hash.

## Analytics

Location: `lib/analytics.ts`

### Usage

```typescript
import { analytics } from '@/lib/analytics';

// Track an event
analytics.track('calendar_events_loaded', {
  event_count: 5,
  load_time_ms: 234,
});

// Identify a user
analytics.identify('user-123', {
  email: 'user@example.com',
});

// Track page view
analytics.page('Dashboard', {
  referrer: document.referrer,
});
```

### Providers

Analytics supports multiple providers. Built-in providers:
- **ConsoleAnalyticsProvider**: Development logging (auto-registered in dev)

To add a production provider (e.g., Google Analytics, Mixpanel):

```typescript
import { analytics } from '@/lib/analytics';

class GoogleAnalyticsProvider implements AnalyticsProvider {
  track(event: string, properties?: AnalyticsProperties) {
    // Send to GA
  }
  // ... implement other methods
}

analytics.registerProvider(new GoogleAnalyticsProvider());
```

### Events

Standard events:
- `page_view`: Page navigation
- `calendar_events_loaded`: Calendar data loaded
- `calendar_error`: Calendar fetch error
- `auth_sign_in`: User signed in
- `auth_sign_out`: User signed out
- `feature_interaction`: Generic feature usage

## Logging

Location: `lib/logger.ts`

### Usage

```typescript
import { logger } from '@/lib/logger';

logger.debug('Debug information', { userId: '123' });
logger.info('User logged in', { email: 'user@example.com' });
logger.warn('Rate limit approaching', { requests: 950 });
logger.error('Database connection failed', { error: err });

// Create child logger with default context
const requestLogger = logger.child({ requestId: 'abc123' });
requestLogger.info('Request processed');
```

### Log Levels

| Level | Description | Production |
|-------|-------------|------------|
| `debug` | Detailed debugging info | ❌ Hidden |
| `info` | General information | ✅ Shown |
| `warn` | Warning messages | ✅ Shown |
| `error` | Error messages | ✅ Shown |

### Configuration

Set minimum log level via environment variable:

```bash
LOG_LEVEL=debug  # show all logs
LOG_LEVEL=info   # hide debug logs (default in production)
LOG_LEVEL=warn   # only warnings and errors
LOG_LEVEL=error  # only errors
```

### Format

**Development**: Human-readable format
```
[2024-03-05T10:30:00.123Z] INFO: User logged in { email: "user@example.com" }
```

**Production**: JSON format for log aggregation
```json
{"level":"info","message":"User logged in","timestamp":"2024-03-05T10:30:00.123Z","metadata":{"email":"user@example.com"}}
```

## A/B Testing

Location: `lib/ab-testing.ts`

### Usage

```typescript
import { abTesting } from '@/lib/ab-testing';

// Get variant for user
const variant = abTesting.getVariant('calendar-widget-layout', userId);

// Track exposure (user saw the experiment)
abTesting.trackExposure('calendar-widget-layout', userId, variant);

// Track conversion
abTesting.trackConversion('calendar-widget-layout', userId, variant, 'clicked_event', 1);

// Check if experiment is active
if (abTesting.isExperimentEnabled('dashboard-card-order')) {
  // Run experiment
}
```

### Experiments Configuration

Edit `experimentsConfig` in `lib/ab-testing.ts`:

```typescript
{
  'calendar-widget-layout': {
    id: 'calendar-widget-layout',
    name: 'Calendar Widget Layout',
    description: 'Test different layouts',
    enabled: true,
    variants: ['control', 'variant_a'],
    weights: { control: 50, variant_a: 50 },
  },
}
```

### Variants

Standard variants:
- `control`: Original/baseline
- `variant_a`: First alternative
- `variant_b`: Second alternative
- `variant_c`: Third alternative

Users are consistently assigned based on hash of `experimentId:userId`.

## Error Tracking

Location: `lib/error-tracking.ts`

### Usage

```typescript
import { errorTracking } from '@/lib/error-tracking';

// Capture exception
try {
  await riskyOperation();
} catch (error) {
  errorTracking.captureException(error, {
    component: 'CalendarWidget',
    action: 'fetchEvents',
  });
}

// Capture message
errorTracking.captureMessage(
  'Rate limit exceeded',
  'warning',
  { userId: '123', limit: 1000 }
);

// Set user context
errorTracking.setUser({
  id: 'user-123',
  email: 'user@example.com',
});
```

### Providers

Built-in providers:
- **ConsoleErrorProvider**: Development logging (auto-registered in dev)

To add Sentry:

```typescript
import * as Sentry from '@sentry/nextjs';
import { errorTracking } from '@/lib/error-tracking';

class SentryProvider implements ErrorTrackingProvider {
  captureException(error: Error, context?: ErrorContext) {
    Sentry.captureException(error, { extra: context });
  }
  // ... implement other methods
}

errorTracking.registerProvider(new SentryProvider());
```

### Global Error Handlers

Error tracking automatically captures:
- Uncaught exceptions (`window.error`)
- Unhandled promise rejections (`unhandledrejection`)

## CI/CD Enhancements

The CI/CD pipeline (`/.github/workflows/ci.yml`) includes:

### Test Job
- ✅ Dependency installation
- ✅ Linting
- ✅ TypeScript type checking
- ✅ Test execution
- ✅ Production build
- ✅ Bundle size check

### Security Job
- ✅ npm security audit
- ✅ Secret detection in code

### Docker Job
- ✅ Docker image build
- ✅ Vulnerability scanning (Trivy)

### Infrastructure Checks
- ✅ Verify all infrastructure files exist

### Environment Variables

Required for CI:
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<secret>
LOG_LEVEL=error  # reduce noise in CI
```

## Environment Variables

Update `.env.example` and `.env.local`:

```bash
# Feature Flags
FEATURE_FLAG_GOOGLE_CALENDAR_INTEGRATION=true
FEATURE_FLAG_ANALYTICS_TRACKING=false
FEATURE_FLAG_ERROR_REPORTING=false

# Logging
LOG_LEVEL=debug  # debug|info|warn|error

# Analytics (when enabled)
# GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
# MIXPANEL_TOKEN=your-token

# Error Tracking (when enabled)
# SENTRY_DSN=https://xxx@sentry.io/xxx
```

## Best Practices

### Feature Flags
1. Default new features to `false` in production
2. Use percentage rollouts for gradual releases
3. Clean up old feature flags after full rollout

### Analytics
1. Track meaningful user actions, not every click
2. Include relevant context in event properties
3. Respect user privacy (no PII without consent)

### Logging
1. Use appropriate log levels
2. Include actionable context in error logs
3. Avoid logging sensitive information

### A/B Testing
1. Define clear success metrics before starting
2. Run experiments long enough for statistical significance
3. Track both exposure and conversion events

### Error Tracking
1. Capture exceptions with context
2. Set user context for better debugging
3. Don't track expected errors (e.g., validation failures)

## Monitoring

### Logs
- Development: Console output
- Production: Consider log aggregation (CloudWatch, Datadog, Logtail)

### Analytics
- Development: Console output
- Production: Analytics dashboard (Google Analytics, Mixpanel, Amplitude)

### Errors
- Development: Console output
- Production: Error tracking service (Sentry, Rollbar, Bugsnag)

## Next Steps

1. **Set up production analytics**
   - Choose provider (GA, Mixpanel, Segment)
   - Register provider in app initialization
   - Test events in staging

2. **Set up error tracking**
   - Create Sentry project (or alternative)
   - Add DSN to environment variables
   - Register provider in app initialization

3. **Configure feature flags**
   - Move to remote config service (LaunchDarkly, ConfigCat)
   - Enable dynamic flag updates without deployment

4. **Add monitoring dashboards**
   - Create dashboard for key metrics
   - Set up alerts for critical errors
   - Monitor feature flag usage

5. **Performance monitoring**
   - Add performance tracking to analytics
   - Monitor API response times
   - Track bundle size over time
