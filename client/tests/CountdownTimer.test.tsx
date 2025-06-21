import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CountdownTimer from '../src/components/CountdownTimer';

// Mock Date.now to control the countdown
const originalDateNow = Date.now;

describe('CountdownTimer', () => {
  afterEach(() => {
    global.Date.now = originalDateNow;
  });

  it('renders the countdown with correct time units', () => {
    // Set a fixed time before the wedding date
    const testNow = new Date('2026-11-01T16:00:00-05:00').getTime();
    global.Date.now = () => testNow;
    render(<CountdownTimer />);
    expect(screen.getByText(/days/)).toBeInTheDocument();
    expect(screen.getByText(/hours/)).toBeInTheDocument();
    expect(screen.getByText(/minutes/)).toBeInTheDocument();
    expect(screen.getByText(/seconds/)).toBeInTheDocument();
  });

  it('shows the complete message when timeLeft is 0 or less', () => {
    // Set a fixed time after the wedding date
    const testNow = new Date('2026-11-09T16:00:00-05:00').getTime();
    global.Date.now = () => testNow;
    render(<CountdownTimer />);
    expect(screen.getByText(/wedding time/i)).toBeInTheDocument();
  });
});
