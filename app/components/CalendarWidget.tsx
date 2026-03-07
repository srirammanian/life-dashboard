'use client';

import { useEffect, useState } from 'react';

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
}

export default function CalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/calendar/events');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch events');
        }
        
        setEvents(data.events || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            Calendar
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Loading events...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            Calendar
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {error === 'Not authenticated or missing calendar access' 
              ? 'Sign in with Google to view your calendar'
              : `Error: ${error}`}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
          Today&apos;s Schedule
        </h3>
        {events.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No events scheduled for today
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div 
                key={event.id}
                className="border-l-4 border-blue-500 pl-3 py-2"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {event.summary}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatTime(event.start)} - {formatTime(event.end)}
                </div>
                {event.location && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    📍 {event.location}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
