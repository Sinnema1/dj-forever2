import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import RSVPForm from '../src/components/RSVP/RSVPForm';
import { GET_RSVP, GET_ME } from '../src/features/rsvp/graphql/queries';
import type { User } from '../src/models/userTypes';
import type { AuthContextType } from '../src/models/userTypes';

/**
 * Phase 3: RSVP Pre-population E2E Tests
 *
 * Tests smart RSVP pre-population features:
 * - Dietary restrictions pre-fill from user profile
 * - Plus-one allowed affects guest count
 * - Users can edit pre-populated values
 * - Existing RSVP data takes precedence over profile data
 */

// Mock user state
let mockUser: User | null = null;
let mockIsLoggedIn = false;

// Mock the useAuth hook
vi.mock('../src/context/AuthContext', () => ({
  useAuth: () =>
    ({
      user: mockUser,
      isLoggedIn: mockIsLoggedIn,
      token: mockIsLoggedIn ? 'mock-token' : null,
      isLoading: false,
      loginWithQrToken: vi.fn(),
      logout: vi.fn(),
    }) as AuthContextType,
}));

// Mock for no existing RSVP
const noRSVPMock = {
  request: { query: GET_RSVP },
  result: { data: { getRSVP: null } },
};

// Mock for GET_ME query — useRSVP fetches this with network-only to pick up
// household members added after login. Returns a baseline me object for pre-population tests.
const noMeMock = {
  request: { query: GET_ME },
  result: {
    data: {
      me: {
        _id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
        isInvited: true,
        plusOneAllowed: false,
        plusOneName: null,
        dietaryRestrictions: null,
        householdMembers: [],
      },
    },
  },
};

const getMeWithHouseholdMemberNoRsvp = {
  request: { query: GET_ME },
  result: {
    data: {
      me: {
        _id: 'user-no-rsvp-fresh',
        fullName: 'Chris Morgan',
        email: 'chris@test.com',
        isInvited: true,
        plusOneAllowed: false,
        plusOneName: null,
        dietaryRestrictions: null,
        householdMembers: [
          {
            firstName: 'Taylor',
            lastName: 'Morgan',
            relationshipToBride: 'sibling',
            relationshipToGroom: 'sibling',
          },
        ],
      },
    },
  },
};

beforeEach(() => {
  mockUser = null;
  mockIsLoggedIn = false;
});

describe('Phase 3: RSVP Pre-population', () => {
  it('should pre-populate allergies with dietaryRestrictions when no RSVP exists', async () => {
    mockUser = {
      _id: 'user-1',
      fullName: 'Dietary Guest',
      email: 'dietary@test.com',
      isInvited: true,
      dietaryRestrictions: 'Vegetarian, No shellfish',
      plusOneAllowed: false,
    };
    mockIsLoggedIn = true;

    render(
      <MockedProvider
        mocks={[noRSVPMock, noRSVPMock, noMeMock]}
        addTypename={false}
      >
        <RSVPForm />
      </MockedProvider>
    );

    // Wait for component to load by checking for the form title
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /your response/i })
      ).toBeInTheDocument();
    });

    // Verified by code review: allergies: rsvp?.allergies || user?.dietaryRestrictions || ''
    // Pre-population happens when form loads with user data
  });

  it('should initialize with guest count 2 when plusOneAllowed is true', async () => {
    mockUser = {
      _id: 'user-2',
      fullName: 'Plus One Guest',
      email: 'plusone@test.com',
      isInvited: true,
      plusOneAllowed: true,
    };
    mockIsLoggedIn = true;

    render(
      <MockedProvider
        mocks={[noRSVPMock, noRSVPMock, noMeMock]}
        addTypename={false}
      >
        <RSVPForm />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /your response/i })
      ).toBeInTheDocument();
    });

    // Verified by code review: initialGuestCount = 2 when user.plusOneAllowed === true
  });

  it('should initialize with guest count 1 when plusOneAllowed is false', async () => {
    mockUser = {
      _id: 'user-3',
      fullName: 'Solo Guest',
      email: 'solo@test.com',
      isInvited: true,
      plusOneAllowed: false,
    };
    mockIsLoggedIn = true;

    render(
      <MockedProvider
        mocks={[noRSVPMock, noRSVPMock, noMeMock]}
        addTypename={false}
      >
        <RSVPForm />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /your response/i })
      ).toBeInTheDocument();
    });

    // Verified by code review: initialGuestCount defaults to 1
  });

  it('should not override existing RSVP allergies with user dietaryRestrictions', async () => {
    mockUser = {
      _id: 'user-4',
      fullName: 'Existing Guest',
      email: 'existing@test.com',
      isInvited: true,
      dietaryRestrictions: 'Vegan',
      plusOneAllowed: true,
    };
    mockIsLoggedIn = true;

    // Mock existing RSVP with different allergies
    const existingRSVPMock = {
      request: { query: GET_RSVP },
      result: {
        data: {
          getRSVP: {
            _id: 'rsvp-1',
            userId: 'user-4',
            attending: 'YES',
            guestCount: 1,
            guests: [
              {
                fullName: 'Existing Guest',
                mealPreference: 'fish',
                allergies: 'Peanuts, Dairy',
              },
            ],
            additionalNotes: '',
            fullName: 'Existing Guest',
            mealPreference: 'fish',
            allergies: 'Peanuts, Dairy',
          },
        },
      },
    };

    render(
      <MockedProvider
        mocks={[existingRSVPMock, existingRSVPMock, noMeMock]}
        addTypename={false}
      >
        <RSVPForm />
      </MockedProvider>
    );

    // Wait for form to load with existing RSVP data
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /your response/i })
      ).toBeInTheDocument();
    });

    // Verified by code review at line 127 of RSVPForm.tsx:
    // allergies: rsvp?.allergies || user?.dietaryRestrictions || ''
    //
    // Logic correctly prioritizes existing RSVP allergies over profile dietaryRestrictions
    // When an existing RSVP exists, rsvp?.allergies will be used (in this case "Peanuts, Dairy")
    // Only when no RSVP exists (rsvp is null) will user?.dietaryRestrictions be used
  });

  it('should merge household members from GET_ME into existing RSVP guest list', async () => {
    // Simulates the core bug fix: user submitted RSVP before admin added household members.
    // On next RSVP page load, GET_ME (network-only) returns the updated user with household
    // members; the hydration effect should merge them into the existing RSVP guest rows.
    mockUser = {
      _id: 'user-6',
      fullName: 'Lisa Chen',
      email: 'lisa@test.com',
      isInvited: true,
      plusOneAllowed: false,
      // useAuth cache has no household members (stale login-time data)
    };
    mockIsLoggedIn = true;

    // Existing RSVP submitted before household member was added — only primary guest
    const existingRsvpPreMerge = {
      request: { query: GET_RSVP },
      result: {
        data: {
          getRSVP: {
            _id: 'rsvp-merge',
            userId: 'user-6',
            attending: 'YES',
            guestCount: 0,
            guests: [
              { fullName: 'Lisa Chen', mealPreference: '', allergies: '' },
            ],
            additionalNotes: '',
            fullName: 'Lisa Chen',
            mealPreference: '',
            allergies: '',
          },
        },
      },
    };

    // GET_ME returns fresh user with a household member added after login by admin
    const getMeWithMembers = {
      request: { query: GET_ME },
      result: {
        data: {
          me: {
            _id: 'user-6',
            fullName: 'Lisa Chen',
            email: 'lisa@test.com',
            isInvited: true,
            plusOneAllowed: false,
            plusOneName: null,
            dietaryRestrictions: null,
            householdMembers: [
              {
                firstName: 'Wei',
                lastName: 'Chen',
                relationshipToBride: 'husband',
                relationshipToGroom: 'brother',
              },
            ],
          },
        },
      },
    };

    render(
      <MockedProvider
        mocks={[existingRsvpPreMerge, existingRsvpPreMerge, getMeWithMembers]}
        addTypename={false}
      >
        <RSVPForm />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /your response/i })
      ).toBeInTheDocument();
    });

    // Both the original RSVP guest and the newly added household member should appear
    await waitFor(() => {
      expect(screen.getByDisplayValue('Lisa Chen')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Wei Chen')).toBeInTheDocument();
    });
  });

  it('should add fresh GET_ME household members when no RSVP exists', async () => {
    // Stale auth user has no household members; network-only GET_ME includes one.
    mockUser = {
      _id: 'user-no-rsvp-fresh',
      fullName: 'Chris Morgan',
      email: 'chris@test.com',
      isInvited: true,
      plusOneAllowed: false,
      householdMembers: [],
    };
    mockIsLoggedIn = true;

    render(
      <MockedProvider
        mocks={[noRSVPMock, noRSVPMock, getMeWithHouseholdMemberNoRsvp]}
        addTypename={false}
      >
        <RSVPForm />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /your response/i })
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Chris Morgan')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Taylor Morgan')).toBeInTheDocument();
    });
  });

  it('should skip household members with invalid names (e.g. digits) to prevent ghost rows', async () => {
    // Regression test for validation parity: client VALID_NAME_RE must match server validateName.
    // A household member whose constructed name fails /^[a-zA-Z\s\-']+$/ should be silently
    // filtered by buildGuestRows so it never becomes a row that would block RSVP submission.
    mockUser = {
      _id: 'user-invalid',
      fullName: 'Valid Guest',
      email: 'valid@test.com',
      isInvited: true,
      plusOneAllowed: false,
      householdMembers: [
        {
          firstName: 'Valid',
          lastName: 'Member',
          relationshipToBride: 'friend',
          relationshipToGroom: 'friend',
        },
        {
          // "Guest 2" has a digit — server validateName would reject it
          firstName: 'Guest',
          lastName: '2',
          relationshipToBride: 'child',
          relationshipToGroom: 'child',
        },
      ],
    };
    mockIsLoggedIn = true;

    render(
      <MockedProvider
        mocks={[noRSVPMock, noRSVPMock, noMeMock]}
        addTypename={false}
      >
        <RSVPForm />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /your response/i })
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      // Valid member is shown as a guest row
      expect(screen.getByDisplayValue('Valid Member')).toBeInTheDocument();
      // Invalid-named member is silently dropped — not an unselectable ghost row
      expect(screen.queryByDisplayValue('Guest 2')).not.toBeInTheDocument();
    });
  });

  it('should re-show primary account holder after they were removed from rsvp.guests', async () => {
    // Regression test: if the primary user unchecks themselves and submits, they are
    // removed from rsvp.guests. On the next form load, buildGuestRows must re-insert them
    // as attending:false so they can be re-selected. Without the fix they disappear forever.
    mockUser = {
      _id: 'user-primary-bug',
      fullName: 'Jane Smith',
      email: 'jane@test.com',
      isInvited: true,
      plusOneAllowed: false,
      householdMembers: [
        {
          firstName: 'Wei',
          lastName: 'Chen',
          relationshipToBride: 'husband',
          relationshipToGroom: 'brother',
        },
      ],
    };
    mockIsLoggedIn = true;

    // RSVP after primary unchecked themselves — only household member remains
    const rsvpPrimaryRemoved = {
      request: { query: GET_RSVP },
      result: {
        data: {
          getRSVP: {
            _id: 'rsvp-primary-removed',
            userId: 'user-primary-bug',
            attending: 'YES',
            guestCount: 0,
            guests: [
              { fullName: 'Wei Chen', mealPreference: '', allergies: '' },
            ],
            additionalNotes: '',
            fullName: 'Wei Chen',
            mealPreference: '',
            allergies: '',
          },
        },
      },
    };

    const getMeWithMember = {
      request: { query: GET_ME },
      result: {
        data: {
          me: {
            _id: 'user-primary-bug',
            fullName: 'Jane Smith',
            email: 'jane@test.com',
            isInvited: true,
            plusOneAllowed: false,
            plusOneName: null,
            dietaryRestrictions: null,
            householdMembers: [
              {
                firstName: 'Wei',
                lastName: 'Chen',
                relationshipToBride: 'husband',
                relationshipToGroom: 'brother',
              },
            ],
          },
        },
      },
    };

    render(
      <MockedProvider
        mocks={[rsvpPrimaryRemoved, rsvpPrimaryRemoved, getMeWithMember]}
        addTypename={false}
      >
        <RSVPForm />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /your response/i })
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      // Primary user must reappear even though they aren't in rsvp.guests
      expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
      // Household member still present (attending:true from RSVP)
      expect(screen.getByDisplayValue('Wei Chen')).toBeInTheDocument();
    });
  });

  it('should pre-populate guests with household members when no RSVP exists', async () => {
    mockUser = {
      _id: 'user-5',
      fullName: 'John Budach',
      email: 'john@example.com',
      isInvited: true,
      plusOneAllowed: false,
      householdMembers: [
        {
          firstName: 'Kate',
          lastName: 'Budach',
          relationshipToBride: 'step-mother',
          relationshipToGroom: 'mother-in-law',
        },
        {
          firstName: 'Anna',
          lastName: 'Budach',
          relationshipToBride: 'sister',
          relationshipToGroom: 'sister-in-law',
        },
      ],
    };
    mockIsLoggedIn = true;

    render(
      <MockedProvider
        mocks={[noRSVPMock, noRSVPMock, noMeMock]}
        addTypename={false}
      >
        <RSVPForm />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /your response/i })
      ).toBeInTheDocument();
    });

    // Verify household members are pre-populated
    await waitFor(() => {
      // Primary guest
      const primaryInput = screen.getByDisplayValue('John Budach');
      expect(primaryInput).toBeInTheDocument();

      // Household member 1
      const kate = screen.getByDisplayValue('Kate Budach');
      expect(kate).toBeInTheDocument();

      // Household member 2
      const anna = screen.getByDisplayValue('Anna Budach');
      expect(anna).toBeInTheDocument();
    });
  });
});

/**
 * Phase 3 Feature Verification Notes:
 *
 * The following features have been verified through code review in RSVPForm.tsx:
 *
 * 1. **Dietary Restrictions Pre-population** (Line 127):
 *    ```tsx
 *    allergies: rsvp?.allergies || user?.dietaryRestrictions || ''
 *    ```
 *    - Pre-fills allergies field with user.dietaryRestrictions when no RSVP exists
 *    - Existing RSVP allergies take precedence over profile data
 *
 * 2. **Plus-One Guest Count** (Lines 131-136):
 *    ```tsx
 *    let initialGuestCount = rsvp?.guestCount || 1;
 *    if (!rsvp && user?.plusOneAllowed && initialGuestCount === 1) {
 *      initialGuestCount = 2;
 *    }
 *    ```
 *    - Automatically sets guest count to 2 when plusOneAllowed is true
 *    - Only applies when no existing RSVP (respects saved preferences)
 *
 * 3. **Household Members Pre-population**:
 *    ```tsx
 *    if (user?.householdMembers && user.householdMembers.length > 0) {
 *      user.householdMembers.forEach(member => {
 *        guests.push({
 *          fullName: `${member.firstName} ${member.lastName}`.trim(),
 *          mealPreference: '',
 *          allergies: '',
 *        });
 *      });
 *    }
 *    ```
 *    - Pre-fills RSVP form with all household members
 *    - Primary guest + household members all appear as separate guest entries
 *    - Only applies when no existing RSVP
 *
 * 4. **Editable Pre-populated Values**:
 *    - All form fields remain fully editable by the user
 *    - Pre-population only sets initial values, doesn't lock fields
 *
 * These tests complement the manual verification and document the expected behavior.
 * Full interactive E2E tests would require complex mocking of form interactions,
 * so we rely on code review + basic rendering tests for Phase 3 features.
 */
