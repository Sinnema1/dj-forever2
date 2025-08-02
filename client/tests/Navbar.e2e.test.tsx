import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "../src/components/Navbar";
import { AuthProvider } from "../src/context/AuthContext";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";

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
  it("shows QR login info when logged out", async () => {
    renderNavbar();
    const loginInfo = screen.getByText(/scan your invitation qr code/i);
    expect(loginInfo).toBeInTheDocument();
    expect(screen.getByText(/login:/i)).toBeInTheDocument();
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
