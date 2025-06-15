import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../src/pages/Home';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { MockedProvider } from '@apollo/client/testing';
import { GET_RSVP } from '../src/features/rsvp/graphql/queries';

const baseMocks = [
  {
    request: { query: GET_RSVP },
    result: { data: { getRSVP: null } },
  },
];

function renderHome({ mocks = baseMocks, route = '/' }: { mocks?: any; route?: string } = {}) {
  window.history.pushState({}, 'Test page', route);
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>
          <Home />
        </MemoryRouter>
      </AuthProvider>
    </MockedProvider>,
  );
}

describe('Home page', () => {
  it('renders welcome text and Get Started button', async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText(/welcome to dj forever/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
    });
  });

  it('navigates to login if not logged in and Get Started is clicked', async () => {
    renderHome();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument(),
    );
    userEvent.click(screen.getByRole('button', { name: /get started/i }));
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  });

  it('shows correct UI if user has RSVP', async () => {
    const rsvpMocks = [
      {
        request: { query: GET_RSVP },
        result: {
          data: {
            getRSVP: {
              _id: '1',
              userId: 'u1',
              attending: true,
              mealPreference: 'Vegan',
              allergies: '',
              additionalNotes: '',
              fullName: 'Test User',
              __typename: 'RSVP',
            },
          },
        },
      },
    ];
    renderHome({ mocks: rsvpMocks });
    await waitFor(() => {
      expect(screen.getByText(/welcome to dj forever/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
    });
  });

  it('matches snapshot', async () => {
    const { container } = renderHome();
    await waitFor(() => {
      expect(screen.getByText(/welcome to dj forever/i)).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });
});
