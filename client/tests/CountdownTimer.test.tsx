import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CountdownTimer from '../src/components/CountdownTimer';

// Mock Date.now to control the countdown
const originalDateNow = Date.now;

describe('CountdownTimer', () => {
  afterEach(() => {
    global.Date.now = originalDateNow;
  });

  it('renders the simple countdown with days to the big day', () => {
    // Set a fixed time before the wedding date (7 days before)
    const testNow = new Date('2026-11-01T16:00:00-07:00').getTime();
    global.Date.now = () => testNow;
    render(<CountdownTimer />);
    expect(screen.getByText(/days to the big day/)).toBeInTheDocument();
    expect(screen.getByText(/7/)).toBeInTheDocument();
  });

  it('shows the wedding day message when it is the day', () => {
    // Set a fixed time after the wedding date
    const testNow = new Date('2026-11-09T16:00:00-07:00').getTime();
    global.Date.now = () => testNow;
    render(<CountdownTimer />);
    expect(screen.getByText(/today is the day/i)).toBeInTheDocument();
  });
});
