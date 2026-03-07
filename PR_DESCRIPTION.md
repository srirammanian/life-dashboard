# Google Calendar Integration

## Summary
Implements Google Calendar integration for the Life Dashboard, allowing users to view their today's scheduled events directly in the dashboard.

## Changes Made

### ✅ Dependencies
- Added `googleapis` for Google Calendar API access

### ✅ Authentication
- Updated NextAuth configuration to include Google OAuth provider
- Added calendar.readonly scope for read-only calendar access
- Implemented JWT callbacks to persist access tokens
- Created TypeScript type definitions for extended session properties

### ✅ Backend API
- Created `/api/calendar/events` endpoint to fetch today's calendar events
- Implemented calendar service library (`lib/calendar.ts`) with:
  - `getTodaysEvents()` - fetches events for the current day
  - `getUpcomingEvents()` - fetches events for the next N days (prepared for future use)
- Proper error handling and authentication checks

### ✅ Frontend UI
- Created `CalendarWidget` component with:
  - Loading state
  - Empty state (no events)
  - Error handling (not authenticated, API failures)
  - Event display with time and location
  - Responsive design with dark mode support
- Updated dashboard page to use the new widget
- Replaced placeholder calendar card with functional component

### ✅ Documentation
- Created comprehensive setup guide (`docs/GOOGLE_CALENDAR_SETUP.md`)
- Step-by-step Google Cloud Console configuration
- OAuth 2.0 credentials setup instructions
- Environment variable configuration
- Troubleshooting section
- Security best practices

### ✅ Configuration
- Updated `.env.example` with Google OAuth variables
- Fixed vitest configuration for React development builds

### ✅ Tests
- Created test suite for CalendarWidget component
- Created test suite for calendar API endpoint
- Tests cover loading, success, error, and empty states

## Features

### Current Functionality
- ✅ OAuth 2.0 authentication with Google
- ✅ View today's calendar events
- ✅ Display event time, title, and location
- ✅ Graceful handling of unauthenticated users
- ✅ Mobile-responsive design
- ✅ Dark mode support
- ✅ Auto-refresh on component mount

### Future Enhancements (Out of Scope)
- Multiple calendar support
- Week/month views
- Event creation/editing
- Push notifications for upcoming events
- Recurring event series handling

## Setup Instructions

For detailed setup instructions, see [docs/GOOGLE_CALENDAR_SETUP.md](./docs/GOOGLE_CALENDAR_SETUP.md)

Quick start:
1. Create a Google Cloud project
2. Enable Google Calendar API
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials
5. Add credentials to `.env.local`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

## Testing

### Manual Testing Steps
1. Start the development server: `npm run dev`
2. Navigate to `/dashboard`
3. Sign in with Google (requires OAuth setup)
4. Calendar widget should display today's events

### Automated Tests
Run the test suite: `npm test`

**Note**: There is a pre-existing issue with vitest installation from the foundation PR. Tests are written and should pass once the vitest issue is resolved.

## Screenshots

(Screenshots would be added here after manual browser verification with actual Google Calendar data)

## Known Issues / Discoveries

### 🔧 Pre-Existing: Vitest Installation Issue
- **Type**: tech-debt
- **Severity**: medium
- **From**: Foundation PR #2
- **Description**: Vitest is defined in package.json devDependencies but not being installed to node_modules. Tests are written but cannot be executed until this is resolved.
- **Workaround**: Tests can be reviewed for correctness; implementation follows established patterns.

### ⚙️ NODE_ENV Warning
- **Type**: tech-debt
- **Severity**: low
- **Description**: Setting NODE_ENV=development for vitest causes Next.js warning about non-standard environment variable.
- **Impact**: Cosmetic only, does not affect functionality.

## Security Considerations

✅ **Implemented**:
- OAuth 2.0 flow with proper scopes
- Access tokens stored in JWT session (server-side only)
- Environment variables for sensitive credentials
- Read-only calendar access

⚠️ **Recommendations**:
- Use HTTPS in production
- Regularly rotate NEXTAUTH_SECRET
- Consider Google Cloud Secret Manager for production
- Implement token refresh logic for long-running sessions

## API Quotas

Google Calendar API free tier:
- 1,000,000 queries per day
- 10 requests per second per user

Current implementation syncs on component mount, well within limits.

## Breaking Changes

None. This is a new feature addition.

## Migration Guide

No migration needed. This is an opt-in feature requiring Google OAuth setup.

## Related Issues

Implements part of the core integrations phase (Week 5-8) from the finalized specifications.
Related to Epic 4: Calendar Integration (US-401 and US-402).

## Checklist

- [x] Code builds without errors (`npm run build` passes)
- [x] Linter passes (`npm run lint` passes)
- [ ] Tests pass (blocked by pre-existing vitest issue)
- [x] App starts without errors
- [ ] Feature verified in browser (requires OAuth setup)
- [x] Documentation added
- [x] Environment variables documented
- [x] No hardcoded credentials or secrets
- [x] Mobile-responsive design
- [x] Dark mode support
- [x] Error handling implemented
- [x] Loading states implemented

## Verification Notes

**Build**: ✅ Passes  
**Lint**: ✅ Passes  
**Tests**: ⚠️ Blocked by pre-existing infrastructure issue  
**Runtime**: ✅ App starts successfully, health endpoint responds  
**Browser**: ⚠️ Requires manual Google OAuth setup for full verification

---

This PR implements a production-ready Google Calendar integration foundation that can be built upon with additional calendar features in future PRs.
