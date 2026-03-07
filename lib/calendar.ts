import { google } from 'googleapis';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees?: Array<{ email: string; responseStatus?: string }>;
}

/**
 * Get Google Calendar client instance
 */
export function getCalendarClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + '/api/auth/callback/google'
  );

  oauth2Client.setCredentials({ access_token: accessToken });
  
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Fetch today's calendar events
 */
export async function getTodaysEvents(accessToken: string): Promise<CalendarEvent[]> {
  const calendar = getCalendarClient(accessToken);
  
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    
    return events.map(event => ({
      id: event.id || '',
      summary: event.summary || 'Untitled Event',
      description: event.description || undefined,
      start: event.start?.dateTime || event.start?.date || '',
      end: event.end?.dateTime || event.end?.date || '',
      location: event.location || undefined,
      attendees: event.attendees?.map(a => ({
        email: a.email || '',
        responseStatus: a.responseStatus || undefined,
      })),
    }));
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
}

/**
 * Fetch upcoming events (next 7 days)
 */
export async function getUpcomingEvents(accessToken: string, days = 7): Promise<CalendarEvent[]> {
  const calendar = getCalendarClient(accessToken);
  
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: futureDate.toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    
    return events.map(event => ({
      id: event.id || '',
      summary: event.summary || 'Untitled Event',
      description: event.description || undefined,
      start: event.start?.dateTime || event.start?.date || '',
      end: event.end?.dateTime || event.end?.date || '',
      location: event.location || undefined,
      attendees: event.attendees?.map(a => ({
        email: a.email || '',
        responseStatus: a.responseStatus || undefined,
      })),
    }));
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
}
