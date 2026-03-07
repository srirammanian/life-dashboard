import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CalendarWidget from '../app/components/CalendarWidget';

// Mock fetch
global.fetch = vi.fn();

describe('CalendarWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as any).mockImplementationOnce(() => 
      new Promise(() => {}) // Never resolves
    );

    render(<CalendarWidget />);
    expect(screen.getByText('Loading events...')).toBeInTheDocument();
  });

  it('renders events when loaded successfully', async () => {
    const mockEvents = [
      {
        id: '1',
        summary: 'Team Meeting',
        start: '2024-03-05T10:00:00Z',
        end: '2024-03-05T11:00:00Z',
        location: 'Conference Room',
      },
      {
        id: '2',
        summary: 'Lunch Break',
        start: '2024-03-05T12:00:00Z',
        end: '2024-03-05T13:00:00Z',
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: mockEvents }),
    });

    render(<CalendarWidget />);

    await waitFor(() => {
      expect(screen.getByText('Team Meeting')).toBeInTheDocument();
      expect(screen.getByText('Lunch Break')).toBeInTheDocument();
      expect(screen.getByText('📍 Conference Room')).toBeInTheDocument();
    });
  });

  it('renders empty state when no events', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: [] }),
    });

    render(<CalendarWidget />);

    await waitFor(() => {
      expect(screen.getByText('No events scheduled for today')).toBeInTheDocument();
    });
  });

  it('renders error state when fetch fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Not authenticated or missing calendar access' }),
    });

    render(<CalendarWidget />);

    await waitFor(() => {
      expect(screen.getByText('Sign in with Google to view your calendar')).toBeInTheDocument();
    });
  });

  it('displays event times correctly', async () => {
    const mockEvents = [
      {
        id: '1',
        summary: 'Morning Standup',
        start: '2024-03-05T09:00:00Z',
        end: '2024-03-05T09:30:00Z',
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: mockEvents }),
    });

    render(<CalendarWidget />);

    await waitFor(() => {
      expect(screen.getByText('Morning Standup')).toBeInTheDocument();
      // Time display will vary based on timezone, just check it exists
      const timeElement = screen.getByText(/AM|PM/);
      expect(timeElement).toBeInTheDocument();
    });
  });
});
