import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '@/app/dashboard/page';

describe('Dashboard', () => {
  it('renders dashboard heading', () => {
    render(<Dashboard />);
    const heading = screen.getByText('Life Dashboard');
    expect(heading).toBeInTheDocument();
  });

  it('renders all dashboard cards', () => {
    render(<Dashboard />);
    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Insights')).toBeInTheDocument();
  });
});
