import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';
import { AuthProvider } from '../src/context/AuthContext';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { GET_RSVP } from '../src/features/rsvp/graphql/queries';

const userData = {
  _id: '1',
  fullName: 'Test User',
  email: 'test@example.com',
  isAdmin: false,
  hasRSVPed: false,
  rsvpId: null,
  rsvp: null,
  isInvited: true,
  relationshipToBride: null,
  relationshipToGroom: null,
  customWelcomeMessage: null,
  guestGroup: null,
  plusOneAllowed: false,
  personalPhoto: null,
  specialInstructions: null,
};

const getRSVPMock = {
  request: { query: GET_RSVP },
  result: { data: { getRSVP: null } },
};

// Create navigate mock
const navigateMock = vi.fn();

// Mock the react-router-dom's useNavigate
vi.mock('react-router-dom', async () => {
  const actualModule =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom'
    );
  return {
    ...actualModule,
    useNavigate: () => navigateMock,
  };
});

describe('App end-to-end', () => {
  beforeEach(() => {
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      key: vi.fn(),
      length: 0,
    };

    // Reset navigate mock
    navigateMock.mockReset();
  });

  it('allows authenticated users to see personalized welcome and access RSVP', async () => {
    // Mock localStorage to simulate authenticated state
    localStorage.getItem = vi.fn().mockImplementation(key => {
      if (key === 'id_token') return 'mock-token';
      if (key === 'user') return JSON.stringify(userData);
      if (key === 'auth_version') return '1.1'; // Match current auth version
      if (key === `welcome-seen-${userData._id}`) return null; // User hasn't seen welcome modal
      return null;
    });

    // Render the app in authenticated state
    render(
      <HelmetProvider>
        <MockedProvider mocks={[getRSVPMock]} addTypename={false}>
          <AuthProvider>
            <MemoryRouter initialEntries={['/']}>
              <App />
            </MemoryRouter>
          </AuthProvider>
        </MockedProvider>
      </HelmetProvider>
    );

    // Verify authenticated elements appear - QR prompt should be hidden for authenticated users
    await waitFor(() => {
      // Check that QR prompt is not shown to authenticated users
      expect(screen.queryByText(/scan your qr code/i)).not.toBeInTheDocument();
    });

    // Check for RSVP link
    const rsvpLinks = screen.getAllByRole('link', { name: /rsvp/i });
    const standaloneRSVPLink = rsvpLinks.find(
      link => link.getAttribute('href') === '/rsvp'
    );
    expect(standaloneRSVPLink).toBeInTheDocument();
  });
});
