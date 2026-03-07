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
 * @param accessToken - OAuth access token
 * @param timezone - IANA timezone (e.g., 'America/Los_Angeles', 'UTC'). Defaults to UTC.
 */
export async function getTodaysEvents(
  accessToken: string,
  timezone: string = 'UTC'
): Promise<CalendarEvent[]> {
  const calendar = getCalendarClient(accessToken);
  
  // Get current time in user's timezone
  const now = new Date();
  
  // Calculate start of day in user's timezone
  // We create a date string in the user's timezone and parse it back
  const dateString = now.toLocaleDateString('en-CA', { timeZone: timezone }); // YYYY-MM-DD format
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Create Date objects for start and end of day in user's timezone
  // Using UTC constructor but adjusted for timezone offset
  const startOfDay = new Date(now.toLocaleString('en-US', { 
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$1-$2T00:00:00'));
  
  // A more reliable approach: use the date string and construct ISO with timezone offset
  const startOfDayISO = `${dateString}T00:00:00`;
  const endOfDayISO = `${dateString}T23:59:59`;
  
  // Convert to Date objects that represent the exact moment in the user's timezone
  const userStartOfDay = new Date(startOfDayISO);
  const userEndOfDay = new Date(endOfDayISO);
  
  // Calculate the timezone offset to adjust the UTC times
  const getUserTimezoneOffset = (date: Date, tz: string): number => {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
    return utcDate.getTime() - tzDate.getTime();
  };
  
  const offset = getUserTimezoneOffset(now, timezone);
  
  // Adjust for timezone: subtract offset to get the correct UTC time boundaries
  const startOfDayUTC = new Date(new Date(`${dateString}T00:00:00`).getTime() - offset);
  const endOfDayUTC = new Date(new Date(`${dateString}T23:59:59`).getTime() - offset + 1000); // +1s to include full day

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDayUTC.toISOString(),
      timeMax: endOfDayUTC.toISOString(),
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
