# Google Calendar Integration Setup

This guide explains how to set up Google Calendar integration for the Life Dashboard.

## Prerequisites

- A Google account
- Access to the [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "Life Dashboard")
4. Click "Create"

## Step 2: Enable Google Calendar API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - App name: "Life Dashboard"
   - User support email: Your email
   - Developer contact: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Add the following scopes:
   - `.../auth/calendar.readonly` (View your calendars)
   - `.../auth/userinfo.email` (See your email address)
   - `.../auth/userinfo.profile` (See your personal info)
8. Click "Save and Continue"
9. Add test users (your email) if the app is not published
10. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Configure:
   - Name: "Life Dashboard Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production URL (e.g., `https://yourdomain.com`)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - Your production callback URL
5. Click "Create"
6. Save the **Client ID** and **Client Secret** (you'll need these)

## Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Google credentials to `.env.local`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   NEXTAUTH_SECRET=generate-a-random-secret-key
   NEXTAUTH_URL=http://localhost:3000
   ```

3. Generate a random secret for `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

## Step 6: Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

3. The Calendar widget will show "Sign in with Google to view your calendar"

4. Click the sign-in button (you may need to implement a sign-in page or use NextAuth's built-in pages)

5. After signing in with Google, grant calendar permissions

6. You should now see your today's calendar events in the dashboard!

## Security Notes

- Never commit `.env.local` to version control
- Keep your Client Secret secure
- For production, use HTTPS for all URLs
- Regularly rotate your `NEXTAUTH_SECRET`
- Consider using Google Cloud Secret Manager for production credentials

## Troubleshooting

### "Access Blocked: Authorization Error"
- Make sure your OAuth consent screen is configured correctly
- Add your Google account as a test user if the app is not published

### "Invalid redirect_uri"
- Verify that the redirect URI in Google Cloud Console exactly matches your callback URL
- Check for trailing slashes or http vs https mismatches

### No events showing
- Ensure you've granted calendar permissions during OAuth
- Check browser console for API errors
- Verify your Google account has events scheduled for today

### Token expired errors
- The app should automatically refresh tokens
- If persistent, sign out and sign in again

## API Quotas

Google Calendar API has the following free tier limits:
- 1,000,000 queries per day
- 10 requests per second per user

This is more than sufficient for a personal dashboard that syncs every 30 minutes.

## Future Enhancements

Potential improvements to the calendar integration:

1. **Write Access**: Allow creating/editing events from the dashboard
2. **Multiple Calendars**: Support showing events from multiple calendars
3. **Week/Month View**: Add views beyond just "today"
4. **Event Colors**: Display calendar-specific colors for events
5. **Reminders**: Push notifications for upcoming events
6. **Recurring Events**: Better handling of recurring event series
