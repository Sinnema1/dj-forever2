import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
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

// Mock for attending RSVP
const createdAttendingRSVP = {
  _id: 'mock-id-attending',
  userId: 'mock-user',
  attending: 'YES',
  guestCount: 1,
  guests: [
    {
      fullName: 'Test User',
      mealPreference: 'vegetarian',
      allergies: '',
    },
  ],
  additionalNotes: '',
  // Legacy fields for backward compatibility
  fullName: 'Test User',
  mealPreference: 'vegetarian',
  allergies: '',
};

// Mock for non-attending RSVP
const createdNonAttendingRSVP = {
  _id: 'mock-id-non-attending',
  userId: 'mock-user',
  attending: 'NO',
  guestCount: 1,
  guests: [],
  additionalNotes: "Sorry, can't make it",
  // Legacy fields for backward compatibility
  fullName: 'Test User',
  mealPreference: '',
  allergies: '',
};

// Mock for maybe RSVP
const createdMaybeRSVP = {
  _id: 'mock-id-maybe',
  userId: 'mock-user',
  attending: 'MAYBE',
  guestCount: 1,
  guests: [],
  additionalNotes: 'Not sure yet',
  // Legacy fields for backward compatibility
  fullName: 'Test User',
  mealPreference: '',
  allergies: '',
};

const getRSVPMockAfterCreate = {
  request: { query: GET_RSVP },
  result: { data: { getRSVP: createdAttendingRSVP } },
};

// Mock for attending RSVP creation
const createAttendingRSVPMock = {
  request: {
    query: CREATE_RSVP,
    variables: {
      input: {
        attending: 'YES',
        guestCount: 1,
        guests: [
          {
            fullName: 'Test User',
            mealPreference: 'vegetarian',
            allergies: '',
          },
        ],
        additionalNotes: '',
        // Legacy fields synchronized with first guest for backward compatibility
        fullName: 'Test User',
        mealPreference: 'vegetarian',
        allergies: '',
      },
    },
  },
  result: {
    data: {
      createRSVP: createdAttendingRSVP,
    },
  },
};

// Mock for non-attending RSVP creation
const createNonAttendingRSVPMock = {
  request: {
    query: CREATE_RSVP,
    variables: {
      input: {
        attending: 'NO',
        guestCount: 1,
        guests: [
          {
            fullName: '',
            mealPreference: '',
            allergies: '',
          },
        ],
        additionalNotes: "Sorry, can't make it",
        // Legacy fields - empty for non-attending
        fullName: '',
        mealPreference: '',
        allergies: '',
      },
    },
  },
  result: {
    data: {
      createRSVP: createdNonAttendingRSVP,
    },
  },
};

// Mock for maybe RSVP creation
const createMaybeRSVPMock = {
  request: {
    query: CREATE_RSVP,
    variables: {
      input: {
        attending: 'MAYBE',
        guestCount: 1,
        guests: [
          {
            fullName: '',
            mealPreference: '',
            allergies: '',
          },
        ],
        additionalNotes: 'Not sure yet',
        // Legacy fields - empty for maybe
        fullName: '',
        mealPreference: '',
        allergies: '',
      },
    },
  },
  result: {
    data: {
      createRSVP: createdMaybeRSVP,
    },
  },
};

function renderRSVPForm(
  mocks = [initialRSVPMock, createAttendingRSVPMock, getRSVPMockAfterCreate]
) {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <AuthProvider>
        <RSVPForm />
      </AuthProvider>
    </MockedProvider>
  );
}

describe('RSVPForm integration', () => {
  describe('Attending RSVP', () => {
    it('renders and submits attending RSVP form', async () => {
      const user = userEvent.setup();

      await act(async () => {
        renderRSVPForm();
      });

      // Find form elements
      const fullNameInput = screen.getByLabelText(
        /full name/i
      ) as HTMLInputElement;
      const attendingYesRadio = screen.getByDisplayValue(
        'YES'
      ) as HTMLInputElement;

      // Fill out the form within act() to avoid warnings
      await act(async () => {
        await user.type(fullNameInput, 'Test User');
        await user.click(attendingYesRadio);
      });

      // Wait for conditional fields to appear
      await waitFor(() => {
        expect(screen.getByLabelText(/meal preference/i)).toBeInTheDocument();
      });

      const mealPrefSelect = screen.getByLabelText(
        /meal preference/i
      ) as HTMLSelectElement;

      // Complete form filling
      await act(async () => {
        await user.selectOptions(mealPrefSelect, 'vegetarian');
      });

      // Verify form state
      expect(fullNameInput.value).toBe('Test User');
      expect(attendingYesRadio.checked).toBe(true);
      expect(mealPrefSelect.value).toBe('vegetarian');

      // Submit the form
      await act(async () => {
        await user.click(screen.getByRole('button', { name: /submit rsvp/i }));
      });

      // Wait for the confirmation screen to appear
      await waitFor(() => {
        expect(
          screen.getByText(/we can't wait to celebrate with you!/i)
        ).toBeInTheDocument();
      });

      // Verify confirmation details
      await waitFor(() => {
        expect(screen.getByText(/Test User/i)).toBeInTheDocument();
        expect(screen.getByText(/Will be attending/i)).toBeInTheDocument();
        expect(screen.getByText(/1 person/i)).toBeInTheDocument();
      });
    });

    it('requires meal preference for attending guests', async () => {
      const user = userEvent.setup();

      await act(async () => {
        renderRSVPForm();
      });

      const fullNameInput = screen.getByLabelText(
        /full name/i
      ) as HTMLInputElement;
      const attendingYesRadio = screen.getByDisplayValue(
        'YES'
      ) as HTMLInputElement;

      // Fill out form but leave meal preference empty
      await act(async () => {
        await user.type(fullNameInput, 'Test User');
        await user.click(attendingYesRadio);
      });

      // Wait for conditional fields
      await waitFor(() => {
        expect(screen.getByLabelText(/meal preference/i)).toBeInTheDocument();
      });

      // Try to submit without selecting meal preference
      await act(async () => {
        await user.click(screen.getByRole('button', { name: /submit rsvp/i }));
      });

      // Should show validation error
      await waitFor(() => {
        expect(
          screen.getAllByText(/please select a meal preference/i)
        ).toHaveLength(2);
      });
    });
  });

  describe('Non-Attending RSVP', () => {
    it('submits non-attending RSVP without meal preferences', async () => {
      const user = userEvent.setup();

      await act(async () => {
        renderRSVPForm([initialRSVPMock, createNonAttendingRSVPMock]);
      });

      const attendingNoRadio = screen.getByDisplayValue(
        'NO'
      ) as HTMLInputElement;

      // Fill out form for non-attending (no name required)
      await act(async () => {
        await user.click(attendingNoRadio);
      });

      // Verify meal preference fields are hidden
      expect(
        screen.getByLabelText(/meal preference/i).closest('.conditional-fields')
      ).toHaveClass('hide');

      // Add optional note
      const notesTextarea = screen.getByLabelText(
        /additional notes/i
      ) as HTMLTextAreaElement;
      await act(async () => {
        await user.type(notesTextarea, "Sorry, can't make it");
      });

      // Submit the form
      await act(async () => {
        await user.click(screen.getByRole('button', { name: /submit rsvp/i }));
      });

      // Should submit successfully without errors
      await waitFor(() => {
        expect(
          screen.getByText(/thank you for letting us know/i)
        ).toBeInTheDocument();
      });
    });

    it('does not require full name for non-attending RSVP', async () => {
      const user = userEvent.setup();

      await act(async () => {
        renderRSVPForm([initialRSVPMock, createNonAttendingRSVPMock]);
      });

      const attendingNoRadio = screen.getByDisplayValue(
        'NO'
      ) as HTMLInputElement;

      // Select non-attending without filling name
      await act(async () => {
        await user.click(attendingNoRadio);
      });

      const notesTextarea = screen.getByLabelText(
        /additional notes/i
      ) as HTMLTextAreaElement;
      await act(async () => {
        await user.type(notesTextarea, "Sorry, can't make it");
      });

      // Submit without name - should work for non-attending
      await act(async () => {
        await user.click(screen.getByRole('button', { name: /submit rsvp/i }));
      });

      // Should not show name validation error for non-attending
      expect(
        screen.queryByText(/full name is required/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('Maybe RSVP', () => {
    it('submits maybe RSVP without meal preferences', async () => {
      const user = userEvent.setup();

      await act(async () => {
        renderRSVPForm([initialRSVPMock, createMaybeRSVPMock]);
      });

      const attendingMaybeRadio = screen.getByDisplayValue(
        'MAYBE'
      ) as HTMLInputElement;

      // Fill out form for maybe attending (no name required)
      await act(async () => {
        await user.click(attendingMaybeRadio);
      });

      // Verify meal preference fields are hidden
      expect(
        screen.getByLabelText(/meal preference/i).closest('.conditional-fields')
      ).toHaveClass('hide');

      // Add optional note
      const notesTextarea = screen.getByLabelText(
        /additional notes/i
      ) as HTMLTextAreaElement;
      await act(async () => {
        await user.type(notesTextarea, 'Not sure yet');
      });

      // Submit the form
      await act(async () => {
        await user.click(screen.getByRole('button', { name: /submit rsvp/i }));
      });

      // Should submit successfully
      await waitFor(() => {
        expect(
          screen.getByText(/thank you for letting us know/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Interaction', () => {
    it('properly handles attendance selection on mobile', async () => {
      // Mock mobile user agent
      Object.defineProperty(window.navigator, 'userAgent', {
        writable: true,
        value:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      });

      const user = userEvent.setup();

      await act(async () => {
        renderRSVPForm();
      });

      const attendingYesRadio = screen.getByDisplayValue(
        'YES'
      ) as HTMLInputElement;
      const attendingNoRadio = screen.getByDisplayValue(
        'NO'
      ) as HTMLInputElement;
      const attendingMaybeRadio = screen.getByDisplayValue(
        'MAYBE'
      ) as HTMLInputElement;

      // Test mobile touch interactions - check visual state instead of hidden radio
      await act(async () => {
        await user.click(attendingYesRadio);
      });

      // Check that the option is visually selected (has 'selected' class)
      const yesOption = attendingYesRadio.closest('.attendance-option');
      expect(yesOption).toHaveClass('selected');

      await act(async () => {
        await user.click(attendingNoRadio);
      });

      // Check visual state
      const noOption = attendingNoRadio.closest('.attendance-option');
      expect(noOption).toHaveClass('selected');
      expect(yesOption).not.toHaveClass('selected');

      await act(async () => {
        await user.click(attendingMaybeRadio);
      });

      // Check visual state
      const maybeOption = attendingMaybeRadio.closest('.attendance-option');
      expect(maybeOption).toHaveClass('selected');
      expect(noOption).not.toHaveClass('selected');
    });

    it('handles rapid touch events on attendance options', async () => {
      const user = userEvent.setup();

      await act(async () => {
        renderRSVPForm();
      });

      const attendingYesRadio = screen.getByDisplayValue(
        'YES'
      ) as HTMLInputElement;
      const attendingNoRadio = screen.getByDisplayValue(
        'NO'
      ) as HTMLInputElement;

      // Rapid clicks should still work correctly - check visual state
      await act(async () => {
        await user.click(attendingYesRadio);
        await user.click(attendingNoRadio);
        await user.click(attendingYesRadio);
      });

      // Check final visual state
      const yesOption = attendingYesRadio.closest('.attendance-option');
      const noOption = attendingNoRadio.closest('.attendance-option');
      expect(yesOption).toHaveClass('selected');
      expect(noOption).not.toHaveClass('selected');
    });
  });

  describe('Form Validation', () => {
    it('validates required fields based on attendance status', async () => {
      const user = userEvent.setup();

      await act(async () => {
        renderRSVPForm();
      });

      const attendingYesRadio = screen.getByDisplayValue(
        'YES'
      ) as HTMLInputElement;

      // Select attending
      await act(async () => {
        await user.click(attendingYesRadio);
      });

      // Try to submit without required fields
      await act(async () => {
        await user.click(screen.getByRole('button', { name: /submit rsvp/i }));
      });

      // Should show validation errors for attending guests
      await waitFor(() => {
        expect(
          screen.getAllByText(/please enter guest's full name/i)
        ).toHaveLength(2);
      });
    });

    it('handles form state changes correctly', async () => {
      const user = userEvent.setup();

      await act(async () => {
        renderRSVPForm();
      });

      const fullNameInput = screen.getByLabelText(
        /full name/i
      ) as HTMLInputElement;
      const attendingYesRadio = screen.getByDisplayValue(
        'YES'
      ) as HTMLInputElement;
      const attendingNoRadio = screen.getByDisplayValue(
        'NO'
      ) as HTMLInputElement;

      // Fill form for attending
      await act(async () => {
        await user.type(fullNameInput, 'Test User');
        await user.click(attendingYesRadio);
      });

      // Wait for meal preference field
      await waitFor(() => {
        expect(screen.getByLabelText(/meal preference/i)).toBeInTheDocument();
      });

      // Change to not attending
      await act(async () => {
        await user.click(attendingNoRadio);
      });

      // Meal preference should be hidden
      expect(
        screen.getByLabelText(/meal preference/i).closest('.conditional-fields')
      ).toHaveClass('hide');

      // Name should still be filled
      expect(fullNameInput.value).toBe('Test User');
    });
  });
});
