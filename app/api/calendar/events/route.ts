import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTodaysEvents } from '@/lib/calendar';
import { logger } from '@/lib/logger';
import { errorTracking } from '@/lib/error-tracking';
import { isFeatureEnabled } from '@/lib/feature-flags';

export async function GET(request: Request) {
  const requestLogger = logger.child({ endpoint: '/api/calendar/events' });
  
  // Extract timezone from query parameters
  const { searchParams } = new URL(request.url);
  const timezone = searchParams.get('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  
  try {
    // Check feature flag
    if (!isFeatureEnabled('google-calendar-integration')) {
      requestLogger.warn('Calendar integration feature disabled');
      return NextResponse.json(
        { error: 'Calendar integration is currently unavailable' },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken) {
      requestLogger.warn('Unauthenticated calendar request');
      return NextResponse.json(
        { error: 'Not authenticated or missing calendar access' },
        { status: 401 }
      );
    }

    // Only fetch calendar events if using Google provider
    if (session.provider !== 'google') {
      requestLogger.info('Non-Google provider used for calendar request', {
        provider: session.provider,
      });
      return NextResponse.json(
        { events: [], message: 'Calendar integration requires Google sign-in' },
        { status: 200 }
      );
    }

    requestLogger.debug('Fetching calendar events', {
      userId: session.user?.email,
      timezone,
    });

    const events = await getTodaysEvents(session.accessToken, timezone);
    
    requestLogger.info('Calendar events fetched successfully', {
      eventCount: events.length,
      userId: session.user?.email,
      timezone,
    });
    
    return NextResponse.json({ events });
  } catch (error) {
    requestLogger.error('Calendar API error', { error });
    
    // Track error for monitoring
    if (error instanceof Error) {
      errorTracking.captureException(error, {
        endpoint: '/api/calendar/events',
        action: 'getTodaysEvents',
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
