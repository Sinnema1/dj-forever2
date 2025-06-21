import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RSVPForm from '../src/components/RSVP/RSVPForm';
import { AuthProvider } from '../src/context/AuthContext';
import { MockedProvider } from '@apollo/client/testing';
import { GET_RSVP } from '../src/features/rsvp/graphql/queries';
import { CREATE_RSVP } from '../src/features/rsvp/graphql/mutations';

const initialRSVPMock = {
  request: { query: GET_RSVP },
  result: { data: { getRSVP: null } },
};

const createdRSVP = {
  _id: 'mock-id',
  userId: 'mock-user',
  fullName: 'Test User',
  attending: 'YES',
  mealPreference: 'Vegetarian',
  allergies: '',
  additionalNotes: '',
};

const getRSVPMockAfterCreate = {
  request: { query: GET_RSVP },
  result: { data: { getRSVP: createdRSVP } },
};

const createRSVPMock = {
  request: {
    query: CREATE_RSVP,
    variables: {
      input: {
        fullName: 'Test User',
        attending: 'YES',
        mealPreference: 'Vegetarian',
        allergies: '',
        additionalNotes: '',
      },
    },
  },
  result: {
    data: {
      createRSVP: {
        _id: 'mock-id',
        userId: 'mock-user',
        fullName: 'Test User',
        attending: 'YES',
        mealPreference: 'Vegetarian',
        allergies: '',
        additionalNotes: '',
      },
    },
  },
};

function renderRSVPForm() {
  return render(
    <MockedProvider mocks={[initialRSVPMock, createRSVPMock, getRSVPMockAfterCreate]} addTypename={false}>
      <AuthProvider>
        <RSVPForm />
      </AuthProvider>
    </MockedProvider>
  );
}

describe('RSVPForm integration', () => {
  it('renders and submits RSVP form', async () => {
    renderRSVPForm();
    // Log initial DOM
    // eslint-disable-next-line no-console
    console.log('Initial DOM:', screen.debug());

    const fullNameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
    const attendingSelect = screen.getByLabelText(/will you attend/i) as HTMLSelectElement;
    const mealPrefInput = screen.getByLabelText(/meal preference/i) as HTMLInputElement;
    // eslint-disable-next-line no-console
    console.log('Before typing:', {
      fullName: fullNameInput.value,
      attending: attendingSelect.value,
      mealPref: mealPrefInput.value,
    });

    await userEvent.type(fullNameInput, 'Test User');
    await userEvent.selectOptions(attendingSelect, 'YES');
    await userEvent.type(mealPrefInput, 'Vegetarian');

    // eslint-disable-next-line no-console
    console.log('After typing:', {
      fullName: fullNameInput.value,
      attending: attendingSelect.value,
      mealPref: mealPrefInput.value,
    });

    // Log DOM before submit
    // eslint-disable-next-line no-console
    console.log('DOM before submit:', screen.debug());

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    });

    // Log DOM after submit
    // eslint-disable-next-line no-console
    console.log('DOM after submit:', screen.debug());

    // Verbose polling for success message
    let found = false;
    for (let i = 0; i < 10; i++) {
      // eslint-disable-next-line no-console
      console.log(`Check ${i}:`, screen.queryByText(/RSVP submitted!/i));
      if (screen.queryByText(/RSVP submitted!/i)) {
        found = true;
        break;
      }
      // eslint-disable-next-line no-await-in-loop
      await new Promise(res => setTimeout(res, 100));
    }
    // Final assertion
    await waitFor(() => {
      expect(screen.getByText(/RSVP submitted!/i)).toBeInTheDocument();
    });
    // eslint-disable-next-line no-console
    console.log('Test complete. Success message found:', found);
  });
});
