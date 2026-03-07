import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTodaysEvents } from '@/lib/calendar';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated or missing calendar access' },
        { status: 401 }
      );
    }

    // Only fetch calendar events if using Google provider
    if (session.provider !== 'google') {
      return NextResponse.json(
        { events: [], message: 'Calendar integration requires Google sign-in' },
        { status: 200 }
      );
    }

    const events = await getTodaysEvents(session.accessToken);
    
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
