import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
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

const createdRSVP = {
  _id: "mock-id",
  userId: "mock-user",
  fullName: "Test User",
  attending: "YES",
  mealPreference: "vegetarian",
  allergies: "",
  additionalNotes: "",
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
        fullName: "Test User",
        attending: "YES",
        mealPreference: "vegetarian",
        allergies: "",
        additionalNotes: "",
      },
    },
  },
  result: {
    data: {
      createRSVP: {
        _id: "mock-id",
        userId: "mock-user",
        fullName: "Test User",
        attending: "YES",
        mealPreference: "vegetarian",
        allergies: "",
        additionalNotes: "",
      },
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
    renderRSVPForm();
    // Log initial DOM
    // eslint-disable-next-line no-console
    console.log("Initial DOM:", screen.debug());

    const fullNameInput = screen.getByLabelText(
      /full name/i
    ) as HTMLInputElement;
    
    // Find the attendance radio button for "YES"
    const attendingYesRadio = screen.getByDisplayValue("YES") as HTMLInputElement;
    
    // Wait for the form to be fully rendered and then find the meal preference field
    await userEvent.type(fullNameInput, "Test User");
    await userEvent.click(attendingYesRadio);
    
    // Wait for the conditional fields to appear
    await waitFor(() => {
      expect(screen.getByLabelText(/meal preference/i)).toBeInTheDocument();
    });
    
    const mealPrefSelect = screen.getByLabelText(
      /meal preference/i
    ) as HTMLSelectElement;
    
    // eslint-disable-next-line no-console
    console.log("Before typing:", {
      fullName: fullNameInput.value,
      attending: attendingYesRadio.checked,
      mealPref: mealPrefSelect.value,
    });

    await userEvent.selectOptions(mealPrefSelect, "vegetarian");

    // eslint-disable-next-line no-console
    console.log("After typing:", {
      fullName: fullNameInput.value,
      attending: attendingYesRadio.checked,
      mealPref: mealPrefSelect.value,
    });

    // Log DOM before submit
    // eslint-disable-next-line no-console
    console.log("DOM before submit:", screen.debug());

    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: /submit rsvp/i }));
    });

    // Log DOM after submit
    // eslint-disable-next-line no-console
    console.log("DOM after submit:", screen.debug());

    // Wait for the confirmation screen to appear
    await waitFor(() => {
      expect(screen.getByText(/we can't wait to celebrate with you!/i)).toBeInTheDocument();
    });
    
    // Also check that the guest name appears in the confirmation
    await waitFor(() => {
      expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    });
  });
});
