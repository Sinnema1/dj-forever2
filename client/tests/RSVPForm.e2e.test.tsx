import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import userEvent from "@testing-library/user-event";
import RSVPForm from "../src/components/RSVP/RSVPForm";
import { AuthProvider } from "../src/context/AuthContext";
import { MockedProvider } from "@apollo/client/testing";
import { GET_RSVP } from "../src/features/rsvp/graphql/queries";
import { CREATE_RSVP } from "../src/features/rsvp/graphql/mutations";

const initialRSVPMock = {
  request: { query: GET_RSVP },
  result: { data: { getRSVP: null } },
};

// Updated mock to match current mutation structure exactly
const createdRSVP = {
  _id: "mock-id",
  userId: "mock-user",
  attending: "YES",
  guestCount: 1,
  guests: [
    {
      fullName: "Test User",
      mealPreference: "vegetarian",
      allergies: "",
    },
  ],
  additionalNotes: "",
  // Legacy fields for backward compatibility
  fullName: "Test User",
  mealPreference: "vegetarian",
  allergies: "",
};

const getRSVPMockAfterCreate = {
  request: { query: GET_RSVP },
  result: { data: { getRSVP: createdRSVP } },
};

// Fixed mock to match the actual submission structure from RSVPForm.tsx
const createRSVPMock = {
  request: {
    query: CREATE_RSVP,
    variables: {
      input: {
        attending: "YES",
        guestCount: 1,
        guests: [
          {
            fullName: "Test User",
            mealPreference: "vegetarian",
            allergies: "",
          },
        ],
        additionalNotes: "",
        // Legacy fields synchronized with first guest for backward compatibility
        fullName: "Test User",
        mealPreference: "vegetarian",
        allergies: "",
      },
    },
  },
  result: {
    data: {
      createRSVP: createdRSVP,
    },
  },
};

function renderRSVPForm() {
  return render(
    <MockedProvider
      mocks={[initialRSVPMock, createRSVPMock, getRSVPMockAfterCreate]}
      addTypename={false}
    >
      <AuthProvider>
        <RSVPForm />
      </AuthProvider>
    </MockedProvider>
  );
}

describe("RSVPForm integration", () => {
  it("renders and submits RSVP form", async () => {
    const user = userEvent.setup();

    await act(async () => {
      renderRSVPForm();
    });

    // Find form elements
    const fullNameInput = screen.getByLabelText(
      /full name/i
    ) as HTMLInputElement;
    const attendingYesRadio = screen.getByDisplayValue(
      "YES"
    ) as HTMLInputElement;

    // Fill out the form within act() to avoid warnings
    await act(async () => {
      await user.type(fullNameInput, "Test User");
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
      await user.selectOptions(mealPrefSelect, "vegetarian");
    });

    // Verify form state
    expect(fullNameInput.value).toBe("Test User");
    expect(attendingYesRadio.checked).toBe(true);
    expect(mealPrefSelect.value).toBe("vegetarian");

    // Submit the form
    await act(async () => {
      await user.click(screen.getByRole("button", { name: /submit rsvp/i }));
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
});
