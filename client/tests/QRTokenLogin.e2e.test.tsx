import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import { AuthProvider } from "../src/context/AuthContext";
import QRTokenLogin from "../src/pages/QRTokenLogin";
import { LOGIN_WITH_QR_TOKEN } from "../src/features/auth/graphql/loginWithQrToken";

// Create navigate mock first
const navigateMock = vi.fn();

// Mock the react-router-dom's useNavigate
vi.mock("react-router-dom", async () => {
  const actualModule = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actualModule,
    useNavigate: () => navigateMock,
  };
});

const qrToken = "valid-token-123";
const user = {
  _id: "1",
  fullName: "Test User",
  email: "test@example.com",
  isInvited: true,
};

describe("QRTokenLogin", () => {
  beforeEach(() => {
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      key: vi.fn(),
      length: 0,
    };
    
    // Reset navigate mock
    navigateMock.mockReset();
  });

  it("redirects after successful QR token login", async () => {
    // Mock the GraphQL response
    const mocks = [
      {
        request: {
          query: LOGIN_WITH_QR_TOKEN,
          variables: { qrToken },
        },
        result: {
          data: {
            loginWithQrToken: {
              token: "test-jwt-token",
              user,
            },
          },
        },
      },
    ];

    // Render component with router and mocked token
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthProvider>
          <MemoryRouter initialEntries={[`/login/qr/${qrToken}`]}>
            <Routes>
              <Route path="/login/qr/:qrToken" element={<QRTokenLogin />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </MockedProvider>
    );

    // Check for loading message
    expect(screen.getByText(/logging you in/i)).toBeInTheDocument();

    // Wait for navigation to be called (should redirect to home)
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/", { replace: true });
    });

    // Verify localStorage was set with token and user data
    expect(window.localStorage.setItem).toHaveBeenCalledWith("id_token", "test-jwt-token");
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "user", 
      JSON.stringify(user)
    );
  });

  it("shows error for invalid token", async () => {
    // Mock failed GraphQL response
    const mocks = [
      {
        request: {
          query: LOGIN_WITH_QR_TOKEN,
          variables: { qrToken: "invalid-token" },
        },
        error: new Error("Invalid QR token"),
      },
    ];

    // Render component with router and invalid token
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthProvider>
          <MemoryRouter initialEntries={['/login/qr/invalid-token']}>
            <Routes>
              <Route path="/login/qr/:qrToken" element={<QRTokenLogin />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </MockedProvider>
    );

    // Check for loading message first
    expect(screen.getByText(/logging you in/i)).toBeInTheDocument();

    // Wait for error message
    await waitFor(() => {
      const errorHeading = screen.getByRole('heading', { name: /login failed/i });
      expect(errorHeading).toBeInTheDocument();
    });

    // Should not navigate or set localStorage
    expect(navigateMock).not.toHaveBeenCalled();
    expect(window.localStorage.setItem).not.toHaveBeenCalled();
  });
});
