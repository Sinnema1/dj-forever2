import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "../src/components/Navbar";
import { AuthProvider } from "../src/context/AuthContext";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import '@testing-library/jest-dom';

function renderNavbar() {
  return render(
    <MockedProvider mocks={[]} addTypename={false}>
      <AuthProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </AuthProvider>
    </MockedProvider>
  );
}

describe("Navbar integration", () => {
  it("shows login button when logged out", async () => {
    renderNavbar();
    const loginButton = screen.getByRole("button", { name: /login/i });
    expect(loginButton).toBeInTheDocument();

    // Check that the button has the correct title attribute
    expect(loginButton).toHaveAttribute(
      "title",
      "Scan your invitation QR code to access your account"
    );

    // Check for the mobile icon
    expect(screen.getByText("📱")).toBeInTheDocument();
  });

  it("shows Logout button when logged in", async () => {
    // Simulate login by setting localStorage
    window.localStorage.setItem("id_token", "mock");
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        isInvited: true,
        fullName: "Test",
        email: "test@example.com",
      })
    );
    renderNavbar();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /logout/i })
      ).toBeInTheDocument();
    });
    // Clean up
    window.localStorage.clear();
  });
});
