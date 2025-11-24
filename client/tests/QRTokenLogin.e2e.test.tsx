import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { AuthProvider } from '../src/context/AuthContext';
import QRTokenLogin from '../src/pages/QRTokenLogin';
import { LOGIN_WITH_QR_TOKEN } from '../src/features/auth/graphql/loginWithQrToken';

// Create navigate mock first
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

const qrToken = 'valid-token-123';
const user = {
  _id: '1',
  fullName: 'Test User',
  email: 'test@example.com',
  isInvited: true,
  isAdmin: false,
  qrToken: 'valid-token-123',
  hasRSVPed: false,
  relationshipToBride: undefined,
  relationshipToGroom: undefined,
  customWelcomeMessage: undefined,
  guestGroup: undefined,
  plusOneAllowed: false,
  personalPhoto: undefined,
};

describe('QRTokenLogin', () => {
  beforeEach(() => {
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      key: vi.fn(),
      length: 0,
    };

    // Reset navigate mock
    navigateMock.mockReset();
  });

  it('redirects after successful QR token login', async () => {
    // Mock the GraphQL response
    const mocks = [
      {
        request: {
          query: LOGIN_WITH_QR_TOKEN,
          variables: { qrToken },
        },
        result: {
          data: {
            loginWithQrToken: {
              token: 'test-jwt-token',
              user,
            },
          },
        },
      },
    ];

    // Render component with router and mocked token
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthProvider>
          <MemoryRouter initialEntries={[`/login/qr/${qrToken}`]}>
            <Routes>
              <Route path="/login/qr/:qrToken" element={<QRTokenLogin />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </MockedProvider>
    );

    // Check for loading spinner (no text, just visual indicator)
    const loadingSpinner = screen.getByRole('button', {
      name: /having trouble/i,
    });
    expect(loadingSpinner).toBeInTheDocument();

    // Wait for navigation to be called (should redirect directly to home)
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/', {
        replace: true,
      });
    });
  });
});
