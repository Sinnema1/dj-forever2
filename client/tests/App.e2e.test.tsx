import { describe, it, expect } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { AuthProvider } from "../src/context/AuthContext";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import {
  LOGIN_USER,
  REGISTER_USER,
} from "../src/features/auth/graphql/mutations";
import { GET_RSVP } from "../src/features/rsvp/graphql/queries";

const userData = {
  _id: "1",
  fullName: "Test User",
  email: "test@example.com",
  isAdmin: false,
  hasRSVPed: false,
  rsvpId: null,
  rsvp: null,
  isInvited: true,
};

const loginMock = {
  request: {
    query: LOGIN_USER,
    variables: { email: "test@example.com", password: "Password123" },
  },
  result: {
    data: {
      loginUser: {
        token: "mock-token",
        user: userData,
      },
    },
  },
};

const getRSVPMock = {
  request: { query: GET_RSVP },
  result: { data: { getRSVP: null } },
};

function renderApp({ mocks = [loginMock, getRSVPMock], route = "/" } = {}) {
  window.history.pushState({}, "Test page", route);
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

describe("App end-to-end", () => {
  it("allows invited user to login and access RSVP", async () => {
    renderApp();
    const user = userEvent.setup();
    // Open login modal
    await user.click(screen.getByRole("button", { name: /login/i }));
    // Fill and submit login form
    const modal = await screen.findByRole("dialog");
    await user.type(within(modal).getByLabelText(/email/i), "test@example.com");
    await user.type(within(modal).getByLabelText(/password/i), "Password123");
    await user.click(within(modal).getByRole("button", { name: /^login$/i }));
    // Wait for modal to close and RSVP link to appear
    await waitFor(() => {
      expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /logout/i })
      ).toBeInTheDocument();
      // Use getAllByRole to resolve ambiguity
      const rsvpLinks = screen.getAllByRole("link", { name: /rsvp/i });
      // Find the one with href="/rsvp"
      const standaloneRSVPLink = rsvpLinks.find(
        (link) => link.getAttribute("href") === "/rsvp"
      );
      expect(standaloneRSVPLink).toBeInTheDocument();
    });
    // Navigate to RSVP page using the correct link
    const rsvpLinks = screen.getAllByRole("link", { name: /rsvp/i });
    const standaloneRSVPLink = rsvpLinks.find(
      (link) => link.getAttribute("href") === "/rsvp"
    );
    await user.click(standaloneRSVPLink!);
    await waitFor(() => {
      // Use getAllByRole to resolve ambiguity between h1 and h2
      const headings = screen.getAllByRole("heading", { name: /rsvp/i });
      const h1 = headings.find((h) => h.tagName === "H1");
      expect(h1).toBeInTheDocument();
    });
  });
});
