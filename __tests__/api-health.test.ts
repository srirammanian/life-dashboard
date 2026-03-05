import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('Health API', () => {
  it('returns ok status', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(data.status).toBe('ok');
    expect(data.service).toBe('life-dashboard');
    expect(data.timestamp).toBeDefined();
  });
});
