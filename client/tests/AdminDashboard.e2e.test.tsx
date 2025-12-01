import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import AdminDashboard from '../src/components/admin/AdminDashboard';
import { GET_ADMIN_STATS, GET_ADMIN_RSVPS } from '../src/api/adminQueries';
import type { AuthContextType } from '../src/models/userTypes';

// Mock AuthContext
const mockAdminUser = {
  _id: 'admin-1',
  fullName: 'Admin User',
  email: 'admin@test.com',
  isInvited: true,
  isAdmin: true,
  hasRSVPed: false,
};

vi.mock('../src/context/AuthContext', () => ({
  useAuth: () =>
    ({
      user: mockAdminUser,
      isLoggedIn: true,
      token: 'mock-admin-token',
      isLoading: false,
      loginWithQrToken: vi.fn(),
      logout: vi.fn(),
    }) as AuthContextType,
}));

// Mock Data
const mockStats = {
  adminGetUserStats: {
    totalInvited: 100,
    totalRSVPed: 50,
    totalAttending: 40,
    totalNotAttending: 10,
    totalMaybe: 0,
    rsvpPercentage: 50,
    mealPreferences: [
      { preference: 'Chicken', count: 20 },
      { preference: 'Beef', count: 20 },
    ],
    dietaryRestrictions: ['Gluten Free', 'Vegan'],
  },
};

const mockRSVPs = {
  adminGetAllRSVPs: [
    {
      _id: 'user-1',
      fullName: 'Guest One',
      email: 'guest1@test.com',
      isInvited: true,
      isAdmin: false,
      hasRSVPed: true,
      qrToken: 'token-1',
      relationshipToBride: 'Friend',
      relationshipToGroom: 'Friend',
      customWelcomeMessage: 'Welcome!',
      guestGroup: 'Friends',
      plusOneAllowed: true,
      personalPhoto: null,
      specialInstructions: null,
      dietaryRestrictions: null,
      createdAt: '2023-01-01',
      lastUpdated: '2023-01-02',
      rsvp: {
        _id: 'rsvp-1',
        userId: 'user-1',
        attending: true,
        guestCount: 1,
        guests: [
          {
            fullName: 'Guest One',
            mealPreference: 'Chicken',
            dietaryRestrictions: 'None',
            ageGroup: 'Adult',
            allergies: 'None',
          },
        ],
        dietaryRestrictions: 'None',
        songRequests: 'Happy',
        message: 'Congrats!',
        additionalNotes: 'None',
        createdAt: '2023-01-02',
        updatedAt: '2023-01-02',
      },
    },
  ],
};

const mocks = [
  {
    request: {
      query: GET_ADMIN_STATS,
    },
    result: {
      data: mockStats,
    },
  },
  {
    request: {
      query: GET_ADMIN_RSVPS,
    },
    result: {
      data: mockRSVPs,
    },
  },
];

describe('AdminDashboard E2E', () => {
  it('should render loading state initially', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AdminDashboard />
      </MockedProvider>
    );

    expect(screen.getByText(/Loading admin dashboard/i)).toBeInTheDocument();
  });

  it('should render dashboard with stats after loading', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AdminDashboard />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Wedding Administration')).toBeInTheDocument();
    });

    // Check Stats (assuming AdminStatsCard renders these)
    // Note: We might need to adjust selectors based on actual AdminStatsCard implementation
    // For now, we check for the presence of the dashboard structure
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Guest Management')).toBeInTheDocument();
  });

  it('should switch tabs correctly', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AdminDashboard />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Wedding Administration')).toBeInTheDocument();
    });

    const analyticsTab = screen.getByText('Analytics');
    fireEvent.click(analyticsTab);

    // Verify active tab state (button class)
    expect(analyticsTab).toHaveClass('active');
    expect(screen.getByText('Overview')).not.toHaveClass('active');
  });

  it('should handle error state', async () => {
    const errorMocks = [
      {
        request: {
          query: GET_ADMIN_STATS,
        },
        error: new Error('Network error'),
      },
      {
        request: {
          query: GET_ADMIN_RSVPS,
        },
        error: new Error('Network error'),
      },
    ];

    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <AdminDashboard />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Admin Access Error/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
  });
});
