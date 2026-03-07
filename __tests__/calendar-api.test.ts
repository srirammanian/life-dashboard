import { describe, it, expect, vi } from 'vitest';
import { GET } from '../app/api/calendar/events/route';
import { getServerSession } from 'next-auth';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock calendar lib
vi.mock('@/lib/calendar', () => ({
  getTodaysEvents: vi.fn(),
}));

describe('/api/calendar/events', () => {
  it('returns 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const request = new Request('http://localhost:3000/api/calendar/events');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Not authenticated or missing calendar access');
  });

  it('returns empty array when not using Google provider', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: '1', email: 'test@example.com' },
      accessToken: 'token',
      provider: 'credentials',
      expires: '2024-12-31',
    });

    const request = new Request('http://localhost:3000/api/calendar/events');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.events).toEqual([]);
    expect(data.message).toBe('Calendar integration requires Google sign-in');
  });

  it('returns events when authenticated with Google', async () => {
    const { getTodaysEvents } = await import('@/lib/calendar');
    
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: '1', email: 'test@example.com' },
      accessToken: 'google-token',
      provider: 'google',
      expires: '2024-12-31',
    });

    const mockEvents = [
      {
        id: '1',
        summary: 'Test Event',
        start: '2024-03-05T10:00:00Z',
        end: '2024-03-05T11:00:00Z',
      },
    ];

    vi.mocked(getTodaysEvents).mockResolvedValueOnce(mockEvents);

    const request = new Request('http://localhost:3000/api/calendar/events');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.events).toEqual(mockEvents);
  });

  it('returns 500 when calendar fetch fails', async () => {
    const { getTodaysEvents } = await import('@/lib/calendar');
    
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: '1', email: 'test@example.com' },
      accessToken: 'google-token',
      provider: 'google',
      expires: '2024-12-31',
    });

    vi.mocked(getTodaysEvents).mockRejectedValueOnce(new Error('API Error'));

    const request = new Request('http://localhost:3000/api/calendar/events');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch calendar events');
  });
});
