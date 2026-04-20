import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import apolloClient from '../src/api/apolloClient';
import { LOGIN_WITH_QR_TOKEN } from '../src/features/auth/graphql/loginWithQrToken';

const mockUser = {
  _id: 'user-1',
  fullName: 'Test User',
  email: 'test@example.com',
  isInvited: true,
  isAdmin: false,
  qrToken: 'valid-token-123',
  hasRSVPed: false,
  plusOneAllowed: false,
  householdMembers: [],
};

function LoginButton({ token }: { token: string }) {
  const { loginWithQrToken, isLoggedIn } = useAuth();
  return (
    <div>
      <span data-testid="status">{isLoggedIn ? 'logged-in' : 'logged-out'}</span>
      <button onClick={() => loginWithQrToken(token)}>Login</button>
    </div>
  );
}

function LogoutButton() {
  const { logout, isLoggedIn } = useAuth();
  return (
    <div>
      <span data-testid="status">{isLoggedIn ? 'logged-in' : 'logged-out'}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext — Apollo cache clearing', () => {
  let clearStoreSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    clearStoreSpy = vi
      .spyOn(apolloClient, 'clearStore')
      .mockResolvedValue(undefined);
    localStorage.clear();
  });

  afterEach(() => {
    clearStoreSpy.mockRestore();
  });

  it('clears Apollo cache after a successful QR login', async () => {
    const qrToken = 'valid-token-123';
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
              user: mockUser,
            },
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthProvider>
          <LoginButton token={qrToken} />
        </AuthProvider>
      </MockedProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(clearStoreSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('clears Apollo cache on logout', async () => {
    // Pre-populate localStorage to simulate a logged-in session on mount
    localStorage.setItem('id_token', 'stored-jwt-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('auth_version', '1.1');

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <AuthProvider>
          <LogoutButton />
        </AuthProvider>
      </MockedProvider>
    );

    // Wait for AuthProvider to finish initializing and restore the session
    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('logged-in');
    });

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    expect(clearStoreSpy).toHaveBeenCalledTimes(1);
  });
});
