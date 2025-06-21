import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import { AuthProvider } from '../src/context/AuthContext';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { LOGIN_USER, REGISTER_USER } from '../src/features/auth/graphql/mutations';
import { GET_RSVP } from '../src/features/rsvp/graphql/queries';

const user = {
  _id: '1',
  fullName: 'Test User',
  email: 'test@example.com',
  isAdmin: false,
  hasRSVPed: false,
  rsvpId: null,
  rsvp: null,
  isInvited: true,
};

const loginMock = {
  request: {
    query: LOGIN_USER,
    variables: { email: 'test@example.com', password: 'Password123' },
  },
  result: {
    data: {
      loginUser: {
        token: 'mock-token',
        user,
      },
    },
  },
};

const getRSVPMock = {
  request: { query: GET_RSVP },
  result: { data: { getRSVP: null } },
};

function renderApp({ mocks = [loginMock, getRSVPMock], route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    </MockedProvider>
  );
}

describe('App end-to-end', () => {
  it('allows invited user to login and access RSVP', async () => {
    renderApp();
    // Open login modal
    userEvent.click(screen.getByRole('button', { name: /login/i }));
    // Fill and submit login form
    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/password/i), 'Password123');
    userEvent.click(screen.getByRole('button', { name: /^login$/i }));
    // Wait for modal to close and RSVP link to appear
    await waitFor(() => {
      expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /rsvp/i })).toBeInTheDocument();
    });
    // Navigate to RSVP page
    userEvent.click(screen.getByRole('link', { name: /rsvp/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /rsvp/i })).toBeInTheDocument();
    });
  });
});
